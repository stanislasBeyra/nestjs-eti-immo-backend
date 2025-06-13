import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateLocataireDto } from './dto/create-locataire.dto';
import { UpdateLocataireDto } from './dto/update-locataire.dto';
import { Locataire } from './entities/locataire.entity';
import { LocataireLoginDto } from './dto/locataire-login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocataireService {
  constructor(
    @InjectRepository(Locataire)
    private locataireRepository: Repository<Locataire>,
    private jwtService: JwtService,
  ) {}

  async create(createLocataireDto: CreateLocataireDto): Promise<Locataire> {
    const locataire = this.locataireRepository.create(createLocataireDto);
    return await this.locataireRepository.save(locataire);
  }

  async findAll(): Promise<Locataire[]> {
    return await this.locataireRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['agence', 'locations', 'paiements'],
    });
  }

  async findOne(id: number): Promise<Locataire> {
    const locataire = await this.locataireRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['agence', 'locations', 'paiements'],
    });

    if (!locataire) {
      throw new NotFoundException(`Locataire with ID ${id} not found`);
    }

    return locataire;
  }

  async update(id: number, updateLocataireDto: UpdateLocataireDto): Promise<Locataire> {
    const locataire = await this.findOne(id);
    Object.assign(locataire, updateLocataireDto);
    return await this.locataireRepository.save(locataire);
  }

  async remove(id: number): Promise<void> {
    const locataire = await this.findOne(id);
    await this.locataireRepository.softDelete(id);
  }

  async findByEmail(email: string): Promise<Locataire> {
    const locataire = await this.locataireRepository.findOne({
      where: { email, deleted_at: IsNull() }
    });
    if (!locataire) {
      throw new NotFoundException(`Locataire with email ${email} not found`);
    }
    return locataire;
  }

  async findByMobile(mobile: string): Promise<Locataire> {
    const locataire = await this.locataireRepository.findOne({
      where: { mobile, deleted_at: IsNull() }
    });
    if (!locataire) {
      throw new NotFoundException(`Locataire avec le numéro ${mobile} non trouvé`);
    }
    return locataire;
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
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.locataireRepository.update(id, {
      last_login_at: new Date()
    });
  }
}
