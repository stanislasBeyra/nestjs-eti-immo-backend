import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Agence } from '../../agence/entities/agence.entity';

export enum DemarcheurStatus {
  ACTIF = 'actif',
  INACTIF = 'inactif',
  SUSPENDU = 'suspendu',
  EN_ATTENTE = 'en_attente'
}

export enum TypeBien {
  MAISON = 'maison',
  TERRAIN = 'terrain',
  APPARTEMENT = 'appartement',
  VILLA = 'villa',
  BUREAUX = 'bureaux',
  COMMERCE = 'commerce',
  AUTRE = 'autre'
}

@Entity('demarcheurs')
export class Demarcheur {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Identifiant unique du démarcheur' })
  id: number;

  @ApiProperty()
  @Column({ type: 'bigint', comment: 'ID de l\'agence qui emploie le démarcheur' })
  agence_id?: number;

  @ApiProperty()
  @Column({ length: 100, comment: 'Prénom du démarcheur' })
  firstname: string;

  @ApiProperty()
  @Column({ length: 100, comment: 'Nom de famille du démarcheur' })
  lastname: string;

  @ApiProperty()
  @Column({ length: 255, unique: true, comment: 'Numéro de téléphone mobile unique' })
  mobile: string;

  @ApiProperty({ required: false })
  @Column({ length: 255, nullable: true, comment: 'Adresse email du démarcheur' })
  email: string;

  @ApiProperty()
  @Column({ length: 255, comment: 'Localité ou quartier de résidence' })
  localite: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true, comment: 'Adresse détaillée du démarcheur' })
  adresse: string;

  @ApiProperty({ required: false })
  @Column({ length: 255, nullable: true, comment: 'Numéro de pièce d\'identité (CNI, Passeport)' })
  numero_piece: string;

  @ApiProperty({ required: false })
  @Column({ length: 255, nullable: true, comment: 'Chemin vers la photo de la pièce d\'identité' })
  photo_piece: string;

  @ApiProperty({ type: [String], enum: TypeBien })
  @Column({ type: 'json', comment: 'Types de biens que le démarcheur peut démarcher' })
  types_biens: TypeBien[];

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, comment: 'Prix minimum des biens à démarcher en FCFA' })
  prix_minimum: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, comment: 'Prix maximum des biens à démarcher en FCFA' })
  prix_maximum: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'Pourcentage de commission versé au démarcheur' })
  taux_commission: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, comment: 'Commission fixe par transaction en FCFA' })
  commission_fixe: number;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true, comment: 'Notes ou commentaires sur le démarcheur' })
  notes: string;

  @ApiProperty({ enum: DemarcheurStatus })
  @Column({ 
    type: 'enum', 
    enum: DemarcheurStatus, 
    default: DemarcheurStatus.EN_ATTENTE,
    comment: 'Statut du démarcheur (actif, inactif, suspendu, en_attente)' 
  })
  status: DemarcheurStatus;

  @ApiProperty({ required: false })
  @Column({ type: 'date', nullable: true, comment: 'Date de début de collaboration' })
  date_debut: Date;

  @ApiProperty({ required: false })
  @Column({ type: 'date', nullable: true, comment: 'Date de fin de collaboration' })
  date_fin: Date;

  @ApiProperty({ required: false })
  @Column({ type: 'int', default: 0, comment: 'Nombre total de biens démarchés avec succès' })
  biens_demarches: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: 'Montant total des commissions versées en FCFA' })
  total_commissions: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: 'Montant total des transactions réalisées en FCFA' })
  total_transactions: number;

  @ApiProperty()
  @CreateDateColumn({ comment: 'Date de création du démarcheur' })
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn({ comment: 'Date de dernière mise à jour' })
  updated_at: Date;

  @ApiProperty({ required: false })
  @DeleteDateColumn({ comment: 'Date de suppression (soft delete)' })
  deleted_at: Date;

  // Relations
  @ApiProperty({ type: () => Agence })
  @ManyToOne(() => Agence, agence => agence.demarcheurs)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;
}
