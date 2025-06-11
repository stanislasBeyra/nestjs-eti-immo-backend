import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateAgenceDto } from './dto/create-agence.dto';
import { UpdateAgenceDto } from './dto/update-agence.dto';
import { Agence, AgenceStatus } from './entities/agence.entity';
import { UsersService } from '../users/users.service';
import { UserCategorie, UserStatus } from '../users/entities/user.entity';

@Injectable()
export class AgenceService {
  private readonly logger = new Logger(AgenceService.name);

  constructor(
    @InjectRepository(Agence)
    private agenceRepository: Repository<Agence>,
    private usersService: UsersService,
  ) {}

  async create(createAgenceDto: CreateAgenceDto, adminId: number) {
    try {
      this.logger.debug(`Tentative de création d'une agence par l'admin ${adminId}`);
      this.logger.debug('Données reçues:', createAgenceDto);

      // Vérifier si l'email existe déjà
      const existingAgence = await this.agenceRepository.findOne({
        where: { agences_email: createAgenceDto.agences_email }
      });

      if (existingAgence) {
        this.logger.warn(`Tentative de création d'agence avec un email déjà utilisé: ${createAgenceDto.agences_email}`);
        throw new BadRequestException({
          message: 'Cet email est déjà utilisé',
          field: 'agences_email'
        });
      }

      // Vérifier si le numéro de téléphone existe déjà
      const existingPhone = await this.agenceRepository.findOne({
        where: { agences_mobile: createAgenceDto.agences_mobile }
      });

      if (existingPhone) {
        this.logger.warn(`Tentative de création d'agence avec un numéro de téléphone déjà utilisé: ${createAgenceDto.agences_mobile}`);
        throw new BadRequestException({
          message: 'Ce numéro de téléphone est déjà utilisé',
          field: 'agences_mobile'
        });
      }

      // Vérifier que l'admin existe
      let admin;
      try {
        admin = await this.usersService.findOne(adminId);
        if (!admin) {
          throw new NotFoundException('Administrateur non trouvé');
        }
      } catch (error) {
        this.logger.error(`Erreur lors de la recherche de l'admin ${adminId}:`, error);
        throw new BadRequestException({
          message: 'Administrateur non trouvé',
          field: 'admin_id'
        });
      }

      // Créer une nouvelle agence avec l'admin_id de l'utilisateur connecté
      const agence = this.agenceRepository.create({
        admin_id: adminId,
        agences_name: createAgenceDto.agences_name,
        agences_email: createAgenceDto.agences_email,
        agences_mobile: createAgenceDto.agences_mobile,
        agences_location: createAgenceDto.agences_location,
        agences_address: createAgenceDto.agences_adress,
        logo_path: createAgenceDto.logo || undefined,
        status: AgenceStatus.PENDING,
        terms_accepted: createAgenceDto.terms_accepted,
      });

      this.logger.debug('Création de l\'agence avec les données:', agence);

      const savedAgence: Agence = await this.agenceRepository.save(agence);
      this.logger.debug('Agence sauvegardée avec succès:', savedAgence);

      // Créer l'utilisateur agent
      try {
        const user = await this.usersService.create({
          name: createAgenceDto.agences_name,
          email: createAgenceDto.agences_email,
          password: '12345678',
          phone: createAgenceDto.agences_mobile,
          categorie: UserCategorie.AGENT,
          status:UserStatus.INACTIVE,
        });
        this.logger.debug('Utilisateur agent créé avec succès:', user);
      } catch (error) {
        this.logger.error('Erreur lors de la création de l\'utilisateur agent:', error);
        // Ne pas échouer la création de l'agence si la création de l'utilisateur échoue
      }

      // Retourner l'agence créée avec les relations
      const finalAgence = await this.agenceRepository.findOne({
        where: { id: savedAgence.id },
        relations: ['admin']
      });

      if (!finalAgence) {
        throw new BadRequestException('Erreur lors de la récupération de l\'agence créée');
      }

      this.logger.debug('Agence créée avec succès:', finalAgence);
      return finalAgence;

    } catch (error) {
      this.logger.error('Erreur lors de la création de l\'agence:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException({
        message: 'Erreur lors de la création de l\'agence',
        details: error.message,
        error: error.name
      });
    }
  }

  async findAll() {
    try {
      return await this.agenceRepository.find({
        where: { deleted_at: IsNull() },
        relations: ['admin', 'documents'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des agences: ' + error.message);
    }
  }

  async findOne(id: number) {
    try {
      const agence = await this.agenceRepository.findOne({
        where: { id, deleted_at: IsNull() },
        relations: ['admin', 'documents']
      });

      if (!agence) {
        throw new NotFoundException('Agence non trouvée');
      }

      return agence;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération de l\'agence: ' + error.message);
    }
  }

  async findByAdminId(adminId: number) {
    try {
      return await this.agenceRepository.find({
        where: { admin_id: adminId, deleted_at: IsNull() },
        relations: ['admin', 'documents'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des agences: ' + error.message);
    }
  }

  async update(id: number, updateAgenceDto: UpdateAgenceDto) {
    try {
      const agence = await this.findOne(id);

      // Vérifier si le nouvel email existe déjà
      if (updateAgenceDto.agences_email && updateAgenceDto.agences_email !== agence.agences_email) {
        const existingEmail = await this.agenceRepository.findOne({
          where: { agences_email: updateAgenceDto.agences_email }
        });
        if (existingEmail) {
          throw new BadRequestException('Cet email est déjà utilisé');
        }
      }

      // Vérifier si le nouveau numéro de téléphone existe déjà
      if (updateAgenceDto.agences_mobile && updateAgenceDto.agences_mobile !== agence.agences_mobile) {
        const existingPhone = await this.agenceRepository.findOne({
          where: { agences_mobile: updateAgenceDto.agences_mobile }
        });
        if (existingPhone) {
          throw new BadRequestException('Ce numéro de téléphone est déjà utilisé');
        }
      }

      // Mettre à jour l'agence (admin_id ne peut pas être modifié via update)
      Object.assign(agence, {
        agences_name: updateAgenceDto.agences_name || agence.agences_name,
        agences_email: updateAgenceDto.agences_email || agence.agences_email,
        agences_mobile: updateAgenceDto.agences_mobile || agence.agences_mobile,
        agences_location: updateAgenceDto.agences_location || agence.agences_location,
        agences_address: updateAgenceDto.agences_adress || agence.agences_address,
        logo_path: updateAgenceDto.logo || agence.logo_path,
        terms_accepted: updateAgenceDto.terms_accepted !== undefined ? updateAgenceDto.terms_accepted : agence.terms_accepted,
      });

      return await this.agenceRepository.save(agence);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour de l\'agence: ' + error.message);
    }
  }

  async remove(id: number) {
    try {
      const agence = await this.findOne(id);
      agence.deleted_at = new Date();
      await this.agenceRepository.save(agence);
      return { message: 'Agence supprimée avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la suppression de l\'agence: ' + error.message);
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.agenceRepository.findOne({
        where: { agences_email: email, deleted_at: IsNull() }
      });
    } catch (error) {
      throw new BadRequestException('Erreur lors de la recherche de l\'agence: ' + error.message);
    }
  }
 
   async updateagencestatus(id:number, status:number){
    try{
      const agence= await this.agenceRepository.findOne({
        where: { id: id, deleted_at: IsNull() }
      });
      
      if (!agence) {
        throw new NotFoundException('Agence non trouvée');
      }

      agence.status = status;
      await this.agenceRepository.save(agence);
      return { message: 'Status mis à jour avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour du status: ' + error.message);
    }
   }
}