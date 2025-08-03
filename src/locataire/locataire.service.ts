import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateLocataireDto } from './dto/create-locataire.dto';
import { UpdateLocataireDto } from './dto/update-locataire.dto';
import { Locataire } from './entities/locataire.entity';
import { LocataireLoginDto } from './dto/locataire-login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AgenceService } from '../agence/agence.service';
import { UsersService } from '../users/users.service';
import { Bien } from '../biens/entities/bien.entity';
import { logger } from 'src/common/config/winston.config';

@Injectable()
export class LocataireService {
  constructor(
    @InjectRepository(Locataire)
    private locataireRepository: Repository<Locataire>,
    @InjectRepository(Bien)
    private bienRepository: Repository<Bien>,
    private jwtService: JwtService,
    private agenceService: AgenceService,
    private usersService: UsersService,
    
  ) {}

  async create(createLocataireDto: CreateLocataireDto, userId: number): Promise<Locataire> {
    try {
      // Récupérer l'utilisateur connecté
      const currentUser = await this.usersService.findOne(userId);
      // Chercher l'agence par l'email de l'utilisateur
      const userAgency = await this.agenceService.findByEmail(currentUser.email);
      if (!userAgency) {
        throw new BadRequestException('Aucune agence trouvée pour l\'utilisateur connecté');
      }
      // Définir un mot de passe par défaut si non fourni
      let password = createLocataireDto.password;
      if (!password) {
        password = '12345678';
      }
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      // Injecter l'id de l'agence et le mot de passe hashé dans le DTO
      const locataire = this.locataireRepository.create({
        ...createLocataireDto,
        password: hashedPassword,
        agence_id: userAgency.id,
      });
      return await this.locataireRepository.save(locataire);
    } catch (error) {
      throw error;
    }
  }

  async createByLocataire(createLocataireDto: CreateLocataireDto): Promise<Locataire> {
    try {
      if (!createLocataireDto.password) {
        throw new BadRequestException('Le mot de passe est obligatoire');
      }
      const hashedPassword = await bcrypt.hash(createLocataireDto.password, 10);
      const locataire = this.locataireRepository.create({
        ...createLocataireDto,
        password: hashedPassword,
        agence_id: undefined, // TypeORM attend undefined pour champ optionnel
      });
      return await this.locataireRepository.save(locataire);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<Locataire[]> {
    try {
      return await this.locataireRepository.find({
        where: { deleted_at: IsNull() },
        relations: ['agence', 'locations', 'locations.bien', 'paiements'],
      });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<Locataire> {
    try {
      const locataire = await this.locataireRepository.findOne({
        where: { id, deleted_at: IsNull() },
        relations: ['agence', 'locations', 'locations.bien', 'paiements'],
      });
 
      if (!locataire) {
        throw new NotFoundException(`Locataire with ID ${id} not found`);
      }

      logger.info(JSON.stringify(locataire.locations.map(loc => loc.bien)));

      return locataire;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateLocataireDto: UpdateLocataireDto): Promise<Locataire> {
    try {
      const locataire = await this.findOne(id);
      Object.assign(locataire, updateLocataireDto);
      return await this.locataireRepository.save(locataire);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const locataire = await this.findOne(id);
      await this.locataireRepository.softDelete(id);
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Locataire> {
    try {
      const locataire = await this.locataireRepository.findOne({
        where: { email, deleted_at: IsNull() }
      });
      if (!locataire) {
        throw new NotFoundException(`Locataire with email ${email} not found`);
      }
      return locataire;
    } catch (error) {
      throw error;
    }
  }

  async findByMobile(mobile: string): Promise<Locataire> {
    try {
      const locataire = await this.locataireRepository.findOne({
        where: { mobile, deleted_at: IsNull() }
      });
      if (!locataire) {
        throw new NotFoundException(`Locataire avec le numéro ${mobile} non trouvé`);
      }
      return locataire;
    } catch (error) {
      throw error;
    }
  }

  async validateLocataire(mobile: string, password: string): Promise<any> {
    try {
      const locataire = await this.findByMobile(mobile);
      if (locataire && await bcrypt.compare(password, locataire.password)) {
        const { password, ...result } = locataire;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(locataireLoginDto: LocataireLoginDto) {
    try {
      const locataire = await this.validateLocataire(
        locataireLoginDto.mobile,
        locataireLoginDto.password,
      );
      
      if (!locataire) {
        throw new UnauthorizedException('Numéro de téléphone ou mot de passe incorrect');
      }

      // Mettre à jour last_login_at
      await this.locataireRepository.update(locataire.id, {
        last_login_at: new Date()
      });

      const payload = { 
        sub: locataire.id, 
        mobile: locataire.mobile,
        type: 'locataire'
      };

      return {
        access_token: this.jwtService.sign(payload),
        locataire: {
          id: locataire.id,
          firstname: locataire.firstname,
          lastname: locataire.lastname,
          mobile: locataire.mobile,
          email: locataire.email
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async updateLastLogin(id: number): Promise<void> {
    try {
      await this.locataireRepository.update(id, {
        last_login_at: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  async findAllByAgence(agenceId: number): Promise<Locataire[]> {
    try {
      return await this.locataireRepository.find({
        where: { agence_id: agenceId, deleted_at: IsNull() },
        relations: ['agence', 'locations', 'paiements'],
      });
    } catch (error) {
      throw error;
    }
  }

  
}
