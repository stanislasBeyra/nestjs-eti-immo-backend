import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Agence } from '../../agence/entities/agence.entity';
import { Proprietaire } from '../../proprietaires/entities/proprietaire.entity';
import { BiensImage } from './biens-image.entity';
import { Location } from '../../location/entities/location.entity';
import { Paiement } from '../../paiement/entities/paiement.entity';

export enum PropertyCategorie {
  MAISON = 'Maison',
  RESIDENCE = 'Résidence',
  TERRAIN = 'Terrain'
}

export enum PropertyType {
  DEUX_PIECES = '2 pièces',
  TROIS_PIECES = '3 pièces',
  QUATRE_PIECES = '4 pièces',
  CINQ_PIECES = '5 pièces',
  VILLA = 'Villa',
  STUDIO = 'Studio'
}

export enum PropertyStatus {
  DISPONIBLE = 'Disponible',
  OCCUPE = 'Occupé',
  EN_RENOVATION = 'En rénovation',
  EN_CONSTRUCTION = 'En construction'
}

@Entity('biens')
export class Bien {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Identifiant unique du bien' })
  id: number;

  @ApiProperty()
  @Column({ type: 'bigint', comment: 'ID de l\'agence qui gère le bien' })
  agence_id: number;

  @ApiProperty()
  @Column({ type: 'bigint', comment: 'ID du propriétaire du bien' })
  proprietaire_id: number;

  @ApiProperty()
  @Column({ length: 255, comment: 'Titre du bien' })
  title: string;

  @ApiProperty({ required: false })
  @Column({ length: 255, nullable: true, comment: 'Référence unique du bien' })
  reference: string;

  @ApiProperty({ enum: PropertyCategorie })
  @Column({ type: 'enum', enum: PropertyCategorie, comment: 'Catégorie du bien (Maison, Résidence, Terrain)' })
  categorie: PropertyCategorie;

  @ApiProperty({ enum: PropertyType, required: false })
  @Column({ type: 'enum', enum: PropertyType, nullable: true, comment: 'Type/nombre de pièces du bien' })
  type: PropertyType;

  @ApiProperty({ enum: PropertyStatus })
  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.DISPONIBLE, comment: 'Statut actuel du bien' })
  status: PropertyStatus;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true, comment: 'Description détaillée du bien' })
  description: string;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Surface en mètres carrés' })
  superficie: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true, comment: 'Nombre total de pièces' })
  pieces: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true, comment: 'Nombre de chambres' })
  bedrooms: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true, comment: 'Nombre de salles de bain' })
  bathrooms: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true, comment: 'Étage du bien' })
  floor: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true, comment: 'Nombre de places de stationnement' })
  garages: number;

  @ApiProperty({ type: [String], required: false })
  @Column({ type: 'json', nullable: true, comment: 'Liste des équipements disponibles' })
  amenities: string[];

  @ApiProperty()
  @Column({ length: 255, comment: 'Adresse complète du bien' })
  address: string;

  @ApiProperty()
  @Column({ length: 255, comment: 'Commune ou quartier principal' })
  localite: string;

  @ApiProperty({ required: false })
  @Column({ length: 255, nullable: true, comment: 'Sous-quartier ou zone spécifique' })
  area: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 18, scale: 2, comment: 'Loyer mensuel en FCFA' })
  loyer: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, comment: 'Montant de la caution en FCFA' })
  deposit: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, comment: 'Charges mensuelles en FCFA' })
  charges: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, comment: 'Frais d\'agence en FCFA' })
  agency_fees: number;

  @ApiProperty({ required: false })
  @Column({ length: 255, nullable: true, comment: 'Chemin vers l\'image principale' })
  main_image: string;

  @ApiProperty({ required: false })
  @Column({ length: 255, nullable: true, comment: 'Chemin vers le document de titre de propriété' })
  property_title_doc: string;

  @ApiProperty({ required: false })
  @Column({ length: 255, nullable: true, comment: 'Chemin vers le contrat de bail' })
  lease_doc: string;

  @ApiProperty({ required: false })
  @Column({ length: 255, nullable: true, comment: 'Chemin vers l\'état des lieux' })
  condition_doc: string;

  @ApiProperty({ type: [String], required: false })
  @Column({ type: 'json', nullable: true, comment: 'Liste des chemins vers les documents additionnels' })
  other_docs: string[];

  @ApiProperty()
  @CreateDateColumn({ comment: 'Date de création du bien' })
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn({ comment: 'Date de dernière mise à jour' })
  updated_at: Date;

  @ApiProperty({ required: false })
  @DeleteDateColumn({ comment: 'Date de suppression (soft delete)' })
  deleted_at: Date;

  @ApiProperty({ type: () => Agence })
  @ManyToOne(() => Agence, agence => agence.properties)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;

  @ApiProperty({ type: () => Proprietaire })
  @ManyToOne(() => Proprietaire, proprietaire => proprietaire.properties)
  @JoinColumn({ name: 'proprietaire_id' })
  proprietaire: Proprietaire;

  @ApiProperty({ type: () => [BiensImage] })
  @OneToMany(() => BiensImage, image => image.bien)
  images: BiensImage[];

  @ApiProperty({ type: () => [Location] })
  @OneToMany(() => Location, location => location.bien)
  locations: Location[];

  @ApiProperty({ type: () => [Paiement] })
  @OneToMany(() => Paiement, paiement => paiement.property)
  paiements: Paiement[];
}