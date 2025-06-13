import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Locataire } from 'src/locataire/entities/locataire.entity';
import { Agence } from '../../agence/entities/agence.entity';
import { User } from '../../users/entities/user.entity';
import { Paiement } from '../../paiement/entities/paiement.entity';
import { Bien } from '../../biens/entities/biens.entity';

export enum NotificationType {
  PAIEMENT = 'PAIEMENT',
  RELANCE = 'RELANCE',
  MESSAGE = 'MESSAGE',
  ALERTE = 'ALERTE',
  SYSTEME = 'SYSTEME'
}

export enum NotificationStatut {
  NON_LU = 'NON_LU',
  LU = 'LU',
  ARCHIVE = 'ARCHIVE'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID unique de la notification' })
  id: number;

  @Column({ type: 'enum', enum: NotificationType })
  @ApiProperty({ description: 'Type de notification', enum: NotificationType })
  type: NotificationType;

  @Column()
  @ApiProperty({ description: 'Titre de la notification' })
  titre: string;

  @Column('text')
  @ApiProperty({ description: 'Contenu de la notification' })
  message: string;

  @Column({ type: 'enum', enum: NotificationStatut, default: NotificationStatut.NON_LU })
  @ApiProperty({ description: 'Statut de la notification', enum: NotificationStatut })
  statut: NotificationStatut;

  @Column({ name: 'locataire_id', nullable: true })
  @ApiProperty({ description: 'ID du locataire destinataire', required: false })
  locataire_id?: number;

  @Column({ name: 'agence_id', nullable: true })
  @ApiProperty({ description: 'ID de l\'agence émettrice', required: false })
  agence_id?: number;

  @Column({ name: 'admin_id', nullable: true })
  @ApiProperty({ description: 'ID de l\'administrateur émetteur', required: false })
  admin_id?: number;

  @Column({ name: 'paiement_id', nullable: true })
  @ApiProperty({ description: 'ID du paiement associé', required: false })
  paiement_id?: number;

  @Column({ name: 'property_id', nullable: true })
  @ApiProperty({ description: 'ID du bien immobilier concerné', required: false })
  property_id?: number;

  @Column({ name: 'created_by_user_id', nullable: true })
  @ApiProperty({ description: 'ID de l\'utilisateur qui a créé la notification', required: false })
  created_by_user_id?: number;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Date de création de la notification' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Date de dernière mise à jour de la notification' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @ApiProperty({ description: 'Date de suppression de la notification', required: false })
  deleted_at?: Date;

  // Relations
  @ManyToOne(() => Locataire, { nullable: true })
  @JoinColumn({ name: 'locataire_id' })
  locataire?: Locataire;

  @ManyToOne(() => Agence, { nullable: true })
  @JoinColumn({ name: 'agence_id' })
  agence?: Agence;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'admin_id' })
  admin?: User;

  @ManyToOne(() => Paiement, { nullable: true })
  @JoinColumn({ name: 'paiement_id' })
  paiement?: Paiement;

  @ManyToOne(() => Bien, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property?: Bien;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  created_by_user?: User;
}