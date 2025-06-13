import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Agence } from '../../agence/entities/agence.entity';
import { Location } from '../../location/entities/location.entity';
import { Paiement } from '../../paiement/entities/paiement.entity';

@Entity('locataires')
export class Locataire {
  @ApiProperty({ description: 'Identifiant unique du locataire' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ description: 'ID de l\'agence associée au locataire' })
  @Column({ type: 'int', default: 0 })
  agence_id: number;

  @ApiProperty({ description: 'Prénom du locataire' })
  @Column({ length: 100 })
  firstname: string;

  @ApiProperty({ description: 'Nom du locataire' })
  @Column({ length: 100 })
  lastname: string;

  @ApiProperty({ description: 'Email du locataire' })
  @Column({ length: 255, unique: true })
  email: string;

  @ApiProperty({ description: 'Numéro de téléphone du locataire' })
  @Column({ length: 255, unique: true })
  mobile: string;

  @ApiProperty({ description: 'Date de naissance du locataire', required: false })
  @Column({ type: 'date', nullable: true })
  bithday: Date;

  @ApiProperty({ description: 'Numéro CNI du locataire', required: false })
  @Column({ length: 255, nullable: true })
  numero_cni: string;

  @ApiProperty({ description: 'Profession du locataire', required: false })
  @Column({ length: 255, nullable: true })
  profession: string;

  @ApiProperty({ description: 'Adresse du locataire', required: false })
  @Column({ length: 255, nullable: true })
  adresse: string;

  @ApiProperty({ description: 'Ville du locataire', required: false })
  @Column({ length: 255, nullable: true })
  ville: string;

  @ApiProperty({ description: 'Code postal du locataire', required: false })
  @Column({ length: 255, nullable: true })
  code_postal: string;

  @ApiProperty({ description: 'Type de client', default: 'locataire' })
  @Column({ length: 255, default: 'locataire' })
  type_client: string;

  @ApiProperty({ description: 'Statut du locataire (0: inactif, 1: actif)', default: 1 })
  @Column({ type: 'int', default: 1, comment: '0=> inactif, 1=>actif' })
  statut: number;

  @ApiProperty({ description: 'Pièce d\'identité du locataire', required: false })
  @Column({ type: 'text', nullable: true })
  piece_identite: string;

  @ApiProperty({ description: 'Justificatif de domicile du locataire', required: false })
  @Column({ type: 'text', nullable: true })
  justificatif_domicile: string;

  @ApiProperty({ description: 'Autres documents du locataire', required: false })
  @Column({ type: 'text', nullable: true })
  autres_documents: string;

  @ApiProperty({ description: 'Notes sur le locataire', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 255, select: false })
  @ApiProperty({ description: 'Mot de passe hashé du locataire' })
  password: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Date de dernière connexion' })
  last_login_at: Date;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Date de dernière modification' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'Date de suppression', required: false })
  @DeleteDateColumn()
  deleted_at: Date;

  @ApiProperty({ type: () => Agence, description: 'Agence associée au locataire' })
  @ManyToOne(() => Agence, (agence: Agence) => agence.locataires)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;

  @ApiProperty({ type: () => [Location], description: 'Locations associées au locataire' })
  @OneToMany(() => Location, (location: Location) => location.locataire)
  locations: Location[];

  @ApiProperty({ type: () => [Paiement], description: 'Paiements associés au locataire' })
  @OneToMany(() => Paiement, (paiement: Paiement) => paiement.locataire)
  paiements: Paiement[];
}