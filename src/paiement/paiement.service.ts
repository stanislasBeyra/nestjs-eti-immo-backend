import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between } from 'typeorm';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';
import { Paiement, PaiementStatut } from './entities/paiement.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaiementService {
  constructor(
    @InjectRepository(Paiement)
    private paiementRepository: Repository<Paiement>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createPaiementDto: CreatePaiementDto): Promise<Paiement> {
    try {
      // Générer un numéro de reçu unique
      const numero_recu = `PAY-${uuidv4().slice(0, 8).toUpperCase()}`;
      
      const paiement = this.paiementRepository.create({
        ...createPaiementDto,
        numero_recu,
        montant: createPaiementDto.montant || 0,
      });

      // Si le montant payé est égal au montant attendu, marquer comme payé
      if (paiement.montant === paiement.montant_attendu) {
        paiement.statut = PaiementStatut.PAYE;
        paiement.date_paiement_effectif = new Date();
      }
      // Si le montant payé est partiel, marquer comme partiel
      else if (paiement.montant > 0) {
        paiement.statut = PaiementStatut.PARTIEL;
      }

      const savedPaiement = await this.paiementRepository.save(paiement);

      // Créer une notification pour le paiement
      await this.notificationsService.createPaiementNotification(
        savedPaiement.id,
        savedPaiement.locataire_id,
        savedPaiement.agence_id,
        savedPaiement.montant,
        savedPaiement.statut === PaiementStatut.PAYE ? 'payé' : 
        savedPaiement.statut === PaiementStatut.PARTIEL ? 'partiellement payé' : 'enregistré'
      );

      return savedPaiement;
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<Paiement[]> {
    try {
      return await this.paiementRepository.find({
        where: { deleted_at: IsNull() },
        relations: ['agence', 'property', 'locataire', 'proprietaire', 'location', 'created_by_user'],
        order: { date_paiement: 'DESC' },
      });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<Paiement> {
    try {
      const paiement = await this.paiementRepository.findOne({
        where: { id, deleted_at: IsNull() },
        relations: ['agence', 'property', 'locataire', 'proprietaire', 'location', 'created_by_user'],
      });

      if (!paiement) {
        throw new NotFoundException(`Paiement with ID ${id} not found`);
      }

      return paiement;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updatePaiementDto: UpdatePaiementDto): Promise<Paiement> {
    try {
      const paiement = await this.findOne(id);

      // Vérifier si le paiement peut être modifié
      if (paiement.statut === PaiementStatut.PAYE) {
        throw new BadRequestException('Cannot update a paid payment');
      }

      Object.assign(paiement, updatePaiementDto);

      // Mettre à jour le statut en fonction du montant
      if (paiement.montant === paiement.montant_attendu) {
        paiement.statut = PaiementStatut.PAYE;
        paiement.date_paiement_effectif = new Date();
      } else if (paiement.montant > 0) {
        paiement.statut = PaiementStatut.PARTIEL;
      } else {
        paiement.statut = PaiementStatut.IMPAYE;
      }

      const updatedPaiement = await this.paiementRepository.save(paiement);

      // Créer une notification pour la mise à jour du paiement
      await this.notificationsService.createPaiementNotification(
        updatedPaiement.id,
        updatedPaiement.locataire_id,
        updatedPaiement.agence_id,
        updatedPaiement.montant,
        updatedPaiement.statut === PaiementStatut.PAYE ? 'payé' : 
        updatedPaiement.statut === PaiementStatut.PARTIEL ? 'partiellement payé' : 'mis à jour'
      );

      return updatedPaiement;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const paiement = await this.findOne(id);
      
      // Vérifier si le paiement peut être supprimé
      if (paiement.statut === PaiementStatut.PAYE) {
        throw new BadRequestException('Cannot delete a paid payment');
      }

      await this.paiementRepository.softDelete(id);

      // Créer une notification pour la suppression du paiement
      await this.notificationsService.createPaiementNotification(
        paiement.id,
        paiement.locataire_id,
        paiement.agence_id,
        paiement.montant,
        'annulé'
      );
    } catch (error) {
      throw error;
    }
  }

  // Méthodes spécifiques pour les paiements

  async findByLocataire(locataireId: number): Promise<Paiement[]> {
    try {
      return await this.paiementRepository.find({
        where: { locataire_id: locataireId, deleted_at: IsNull() },
        relations: ['property', 'location'],
        order: { date_paiement: 'DESC' },
      });
    } catch (error) {
      throw error;
    }
  }

  async findByProperty(propertyId: number): Promise<Paiement[]> {
    try {
      return await this.paiementRepository.find({
        where: { property_id: propertyId, deleted_at: IsNull() },
        relations: ['locataire', 'location'],
        order: { date_paiement: 'DESC' },
      });
    } catch (error) {
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Paiement[]> {
    try {
      return await this.paiementRepository.find({
        where: {
          date_paiement: Between(startDate, endDate),
          deleted_at: IsNull(),
        },
        relations: ['property', 'locataire', 'location'],
        order: { date_paiement: 'DESC' },
      });
    } catch (error) {
      throw error;
    }
  }

  async findByStatut(statut: PaiementStatut): Promise<Paiement[]> {
    try {
      return await this.paiementRepository.find({
        where: { statut, deleted_at: IsNull() },
        relations: ['property', 'locataire', 'location'],
        order: { date_paiement: 'DESC' },
      });
    } catch (error) {
      throw error;
    }
  } 

  async getPaiementsImpayes(): Promise<Paiement[]> {
    try {
      const paiements = await this.paiementRepository.find({
        where: [
          { statut: PaiementStatut.IMPAYE, deleted_at: IsNull() },
          { statut: PaiementStatut.PARTIEL, deleted_at: IsNull() },
        ],
        relations: ['property', 'locataire', 'location'],
        order: { date_paiement: 'ASC' },
      });

      // Créer des notifications de relance pour les paiements impayés
      for (const paiement of paiements) {
        if (paiement.statut === PaiementStatut.IMPAYE) {
          await this.notificationsService.createRelanceNotification(
            paiement.locataire_id,
            paiement.agence_id,
            paiement.montant_attendu,
            paiement.date_paiement
          );
        }
      }

      return paiements;
    } catch (error) {
      throw error;
    }
  }
}