import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification, NotificationType, NotificationStatut } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      statut: NotificationStatut.NON_LU,
    });
    return await this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['locataire', 'agence', 'admin', 'paiement', 'property', 'created_by_user'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['locataire', 'agence', 'admin', 'paiement', 'property', 'created_by_user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async findByLocataire(locataireId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { locataire_id: locataireId, deleted_at: IsNull() },
      relations: ['agence', 'admin', 'paiement', 'property'],
      order: { created_at: 'DESC' },
    });
  }

  async findByAgence(agenceId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { agence_id: agenceId, deleted_at: IsNull() },
      relations: ['locataire', 'admin', 'paiement', 'property'],
      order: { created_at: 'DESC' },
    });
  }

  async findByPaiement(paiementId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { paiement_id: paiementId, deleted_at: IsNull() },
      relations: ['locataire', 'agence', 'admin', 'property'],
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.statut = NotificationStatut.LU;
    return await this.notificationRepository.save(notification);
  }

  async markAsArchived(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.statut = NotificationStatut.ARCHIVE;
    return await this.notificationRepository.save(notification);
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.softDelete(id);
  }

  // Méthode spécifique pour créer une notification de paiement
  async createPaiementNotification(
    paiementId: number,
    locataireId: number,
    agenceId: number,
    montant: number,
    type: string,
  ): Promise<Notification> {
    const notification = new Notification();
    notification.type = NotificationType.PAIEMENT;
    notification.titre = `Paiement ${type}`;
    notification.message = `Un paiement de ${montant}€ a été ${type.toLowerCase()}.`;
    notification.paiement_id = paiementId;
    notification.locataire_id = locataireId;
    notification.agence_id = agenceId;
    notification.statut = NotificationStatut.NON_LU;
    return await this.notificationRepository.save(notification);
  }

  // Méthode pour créer une notification de relance
  async createRelanceNotification(
    locataireId: number,
    agenceId: number,
    montant: number,
    dateEcheance: Date,
  ): Promise<Notification> {
    const notification = new Notification();
    notification.type = NotificationType.RELANCE;
    notification.titre = 'Rappel de paiement';
    notification.message = `Rappel : Un paiement de ${montant}€ est attendu pour le ${dateEcheance.toLocaleDateString()}.`;
    notification.locataire_id = locataireId;
    notification.agence_id = agenceId;
    notification.statut = NotificationStatut.NON_LU;
    return await this.notificationRepository.save(notification);
  }

  // Méthode pour créer une notification de message
  async createMessageNotification(
    locataireId: number,
    agenceId: number,
    message: string,
    titre: string,
  ): Promise<Notification> {
    const notification = new Notification();
    notification.type = NotificationType.MESSAGE;
    notification.titre = titre;
    notification.message = message;
    notification.locataire_id = locataireId;
    notification.agence_id = agenceId;
    notification.statut = NotificationStatut.NON_LU;
    return await this.notificationRepository.save(notification);
  }
}
