import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Paiement } from '../../paiement/entities/paiement.entity';

export enum NotificationType {
  PAIEMENT_RECU = 'Paiement reçu',
  PAIEMENT_EN_RETARD = 'Paiement en retard',
  RAPPEL_PAIEMENT = 'Rappel de paiement',
  PAIEMENT_ANNULE = 'Paiement annulé',
  BIEN_AJOUTE = 'Bien ajouté',
  BIEN_MODIFIE = 'Bien modifié',
  LOCATION_CREEE = 'Location créée',
  LOCATION_MODIFIEE = 'Location modifiée',
  DOCUMENT_AJOUTE = 'Document ajouté',
  DOCUMENT_EXPIRE = 'Document expiré'
}

export enum NotificationStatus {
  NON_LU = 'non_lu',
  LU = 'lu',
  ARCHIVE = 'archive'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Identifiant unique de la notification' })
  id: number;

  @Column({ 
    type: 'bigint', 
    comment: 'ID de l\'utilisateur qui a créé la notification' 
  })
  created_by: number;

  @Column({ 
    type: 'bigint', 
    nullable: true, 
    comment: 'ID de l\'élément associé à la notification (paiement, bien, etc.)' 
  })
  reference_id: number;

  @Column({ 
    length: 50, 
    nullable: true, 
    comment: 'Type de référence (paiement, bien, location, etc.)' 
  })
  reference_type: string;

  @Column({ 
    type: 'enum', 
    enum: NotificationType, 
    comment: 'Type de notification' 
  })
  type: NotificationType;

  @Column({ 
    type: 'enum', 
    enum: NotificationStatus, 
    default: NotificationStatus.NON_LU, 
    comment: 'Statut de la notification' 
  })
  status: NotificationStatus;

  @Column({ 
    length: 255, 
    comment: 'Titre de la notification' 
  })
  title: string;

  @Column({ 
    type: 'text', 
    comment: 'Contenu détaillé de la notification' 
  })
  message: string;

  @Column({ 
    type: 'json', 
    nullable: true, 
    comment: 'Données additionnelles de la notification' 
  })
  metadata: Record<string, any>;

  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: 'Date de lecture de la notification' 
  })
  read_at: Date;

  @CreateDateColumn({ comment: 'Date de création de la notification' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Date de dernière mise à jour' })
  updated_at: Date;

  @DeleteDateColumn({ comment: 'Date de suppression (soft delete)' })
  deleted_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.notifications_created)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => Paiement, paiement => paiement.notifications, { nullable: true })
  @JoinColumn({ name: 'reference_id' })
  paiement: Paiement;
}