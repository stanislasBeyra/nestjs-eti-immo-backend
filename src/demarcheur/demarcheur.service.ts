import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Demarcheur, DemarcheurStatus } from './entities/demarcheur.entity';
import { CreateDemarcheurDto } from './dto/create-demarcheur.dto';
import { UpdateDemarcheurDto } from './dto/update-demarcheur.dto';

@Injectable()
export class DemarcheurService {
  constructor(
    @InjectRepository(Demarcheur)
    private readonly demarcheurRepository: Repository<Demarcheur>,
  ) {}

  async create(createDemarcheurDto: CreateDemarcheurDto): Promise<Demarcheur> {
    try {
      // Vérifier si le numéro de téléphone existe déjà
      const existingDemarcheur = await this.demarcheurRepository.findOne({
        where: { mobile: createDemarcheurDto.mobile }
      });

      if (existingDemarcheur) {
        throw new BadRequestException('Un démarcheur avec ce numéro de téléphone existe déjà');
      }

      // Vérifier si l'email existe déjà (si fourni)
      if (createDemarcheurDto.email) {
        const existingEmail = await this.demarcheurRepository.findOne({
          where: { email: createDemarcheurDto.email }
        });

        if (existingEmail) {
          throw new BadRequestException('Un démarcheur avec cet email existe déjà');
        }
      }

      // Vérifier la cohérence des prix
      if (createDemarcheurDto.prix_minimum && createDemarcheurDto.prix_maximum) {
        if (createDemarcheurDto.prix_minimum >= createDemarcheurDto.prix_maximum) {
          throw new BadRequestException('Le prix minimum doit être inférieur au prix maximum');
        }
      }

      const demarcheur = this.demarcheurRepository.create(createDemarcheurDto);
      return await this.demarcheurRepository.save(demarcheur);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Erreur lors de la création du démarcheur: ${error.message}`);
    }
  }

  async findAll(): Promise<Demarcheur[]> {
    try {
      return await this.demarcheurRepository.find({
        relations: ['agence'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la récupération des démarcheurs: ${error.message}`);
    }
  }

  async findByAgence(agenceId: number): Promise<Demarcheur[]> {
    try {
      return await this.demarcheurRepository.find({
        where: { agence_id: agenceId },
        relations: ['agence'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la récupération des démarcheurs de l'agence: ${error.message}`);
    }
  }

  async findByStatus(status: DemarcheurStatus): Promise<Demarcheur[]> {
    try {
      return await this.demarcheurRepository.find({
        where: { status },
        relations: ['agence'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la récupération des démarcheurs par statut: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Demarcheur> {
    try {
      const demarcheur = await this.demarcheurRepository.findOne({
        where: { id },
        relations: ['agence']
      });

      if (!demarcheur) {
        throw new NotFoundException(`Démarcheur avec l'ID ${id} non trouvé`);
      }

      return demarcheur;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Erreur lors de la récupération du démarcheur: ${error.message}`);
    }
  }

  async update(id: number, updateDemarcheurDto: UpdateDemarcheurDto): Promise<Demarcheur> {
    try {
      const demarcheur = await this.findOne(id);

      // Vérifier si le nouveau numéro de téléphone existe déjà (sauf pour le démarcheur actuel)
      if (updateDemarcheurDto.mobile && updateDemarcheurDto.mobile !== demarcheur.mobile) {
        const existingMobile = await this.demarcheurRepository.findOne({
          where: { mobile: updateDemarcheurDto.mobile }
        });

        if (existingMobile) {
          throw new BadRequestException('Un démarcheur avec ce numéro de téléphone existe déjà');
        }
      }

      // Vérifier si le nouvel email existe déjà (sauf pour le démarcheur actuel)
      if (updateDemarcheurDto.email && updateDemarcheurDto.email !== demarcheur.email) {
        const existingEmail = await this.demarcheurRepository.findOne({
          where: { email: updateDemarcheurDto.email }
        });

        if (existingEmail) {
          throw new BadRequestException('Un démarcheur avec cet email existe déjà');
        }
      }

      // Vérifier la cohérence des prix
      if (updateDemarcheurDto.prix_minimum && updateDemarcheurDto.prix_maximum) {
        if (updateDemarcheurDto.prix_minimum >= updateDemarcheurDto.prix_maximum) {
          throw new BadRequestException('Le prix minimum doit être inférieur au prix maximum');
        }
      }

      Object.assign(demarcheur, updateDemarcheurDto);
      return await this.demarcheurRepository.save(demarcheur);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Erreur lors de la mise à jour du démarcheur: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const demarcheur = await this.findOne(id);
      await this.demarcheurRepository.softRemove(demarcheur);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Erreur lors de la suppression du démarcheur: ${error.message}`);
    }
  }

  async updateStatus(id: number, status: DemarcheurStatus): Promise<Demarcheur> {
    try {
      const demarcheur = await this.findOne(id);
      demarcheur.status = status;
      return await this.demarcheurRepository.save(demarcheur);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  }

  async incrementBiensDemarches(id: number): Promise<void> {
    try {
      await this.demarcheurRepository.increment({ id }, 'biens_demarches', 1);
    } catch (error) {
      throw new BadRequestException(`Erreur lors de l'incrémentation des biens démarchés: ${error.message}`);
    }
  }

  async addCommission(id: number, commissionAmount: number): Promise<void> {
    try {
      await this.demarcheurRepository.increment({ id }, 'total_commissions', commissionAmount);
    } catch (error) {
      throw new BadRequestException(`Erreur lors de l'ajout de la commission: ${error.message}`);
    }
  }

  async addTransaction(id: number, transactionAmount: number): Promise<void> {
    try {
      await this.demarcheurRepository.increment({ id }, 'total_transactions', transactionAmount);
    } catch (error) {
      throw new BadRequestException(`Erreur lors de l'ajout de la transaction: ${error.message}`);
    }
  }

  async getStatsByAgence(agenceId: number): Promise<any> {
    try {
      const stats = await this.demarcheurRepository
        .createQueryBuilder('demarcheur')
        .select([
          'COUNT(*) as total_demarcheurs',
          'SUM(CASE WHEN demarcheur.status = :actif THEN 1 ELSE 0 END) as demarcheurs_actifs',
          'SUM(demarcheur.biens_demarches) as total_biens_demarches',
          'SUM(demarcheur.total_commissions) as total_commissions',
          'SUM(demarcheur.total_transactions) as total_transactions'
        ])
        .where('demarcheur.agence_id = :agenceId', { agenceId })
        .setParameter('actif', DemarcheurStatus.ACTIF)
        .getRawOne();

      return {
        total_demarcheurs: parseInt(stats.total_demarcheurs) || 0,
        demarcheurs_actifs: parseInt(stats.demarcheurs_actifs) || 0,
        total_biens_demarches: parseInt(stats.total_biens_demarches) || 0,
        total_commissions: parseFloat(stats.total_commissions) || 0,
        total_transactions: parseFloat(stats.total_transactions) || 0
      };
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getTopPerformers(agenceId: number, limit: number = 5): Promise<Demarcheur[]> {
    try {
      return await this.demarcheurRepository.find({
        where: { agence_id: agenceId },
        relations: ['agence'],
        order: { total_commissions: 'DESC' },
        take: limit
      });
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la récupération des meilleurs démarcheurs: ${error.message}`);
    }
  }

  async searchDemarcheurs(agenceId: number, searchTerm: string): Promise<Demarcheur[]> {
    try {
      return await this.demarcheurRepository
        .createQueryBuilder('demarcheur')
        .leftJoinAndSelect('demarcheur.agence', 'agence')
        .where('demarcheur.agence_id = :agenceId', { agenceId })
        .andWhere(
          '(demarcheur.firstname LIKE :searchTerm OR demarcheur.lastname LIKE :searchTerm OR demarcheur.mobile LIKE :searchTerm OR demarcheur.email LIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` }
        )
        .orderBy('demarcheur.created_at', 'DESC')
        .getMany();
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la recherche des démarcheurs: ${error.message}`);
    }
  }
}