import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Agence } from '../../agence/entities/agence.entity';
import { Proprietaire } from '../../proprietaires/entities/proprietaire.entity';

export enum TerrainStatus {
  DISPONIBLE = 'Disponible',
  VENDU = 'Vendu',
  RESERVE = 'Réservé',
  HORS_MARCHE = 'Hors marché'
}

export enum TerrainType {
  CONSTRUCTIBLE = 'Constructible',
  AGRICOLE = 'Agricole',
  COMMERCIAL = 'Commercial',
  INDUSTRIEL = 'Industriel',
  MIXTE = 'Mixte'
}

export enum ZoneType {
  RESIDENTIELLE = 'Résidentielle',
  COMMERCIALE = 'Commerciale',
  INDUSTRIELLE = 'Industrielle',
  AGRICOLE = 'Agricole',
  MIXTE = 'Mixte'
}

@Entity('terrains')
export class Terrain {
  @ApiProperty({ description: 'ID unique du terrain' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ description: 'ID de l\'agence qui gère le terrain' })
  @Column({ type: 'bigint' })
  agence_id: number;

  @ApiProperty({ description: 'ID du propriétaire du terrain', required: false })
  @Column({ type: 'bigint', nullable: true })
  proprietaire_id?: number;

  @ApiProperty({ description: 'Titre du terrain' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Description détaillée du terrain' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Adresse complète du terrain' })
  @Column({ length: 500 })
  address: string;

  @ApiProperty({ description: 'Localité/Quartier' })
  @Column({ length: 255 })
  localite: string;

  @ApiProperty({ description: 'Commune' })
  @Column({ length: 255, nullable: true })
  commune?: string;

  @ApiProperty({ description: 'Prix de vente en FCFA' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  prix_vente: number;

  @ApiProperty({ description: 'Prix au mètre carré en FCFA' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prix_m2?: number;

  @ApiProperty({ description: 'Superficie totale en m²' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  superficie: number;

  @ApiProperty({ description: 'Superficie constructible en m²' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  superficie_constructible?: number;

  @ApiProperty({ description: 'Type de terrain', enum: TerrainType })
  @Column({ type: 'enum', enum: TerrainType })
  type: TerrainType;

  @ApiProperty({ description: 'Zone d\'occupation', enum: ZoneType })
  @Column({ type: 'enum', enum: ZoneType, nullable: true })
  zone?: ZoneType;

  @ApiProperty({ description: 'Statut du terrain', enum: TerrainStatus })
  @Column({ type: 'enum', enum: TerrainStatus, default: TerrainStatus.DISPONIBLE })
  status: TerrainStatus;

  @ApiProperty({ description: 'Le terrain est-il constructible' })
  @Column({ type: 'boolean', default: true })
  constructible: boolean;

  @ApiProperty({ description: 'Le terrain est-il viabilisé (eau, électricité)' })
  @Column({ type: 'boolean', default: false })
  viabilise: boolean;

  @ApiProperty({ description: 'Accès routier disponible' })
  @Column({ type: 'boolean', default: true })
  acces_route: boolean;

  @ApiProperty({ description: 'Numéro du titre foncier' })
  @Column({ length: 255, nullable: true })
  titre_foncier?: string;

  @ApiProperty({ description: 'Référence cadastrale' })
  @Column({ length: 255, nullable: true })
  reference_cadastrale?: string;

  @ApiProperty({ description: 'Référence interne' })
  @Column({ length: 100, nullable: true })
  reference?: string;

  @ApiProperty({ description: 'Image principale du terrain' })
  @Column({ length: 500, nullable: true })
  main_image?: string;

  @ApiProperty({ description: 'Autres images du terrain', type: [String] })
  @Column({ type: 'json', nullable: true })
  other_images?: string[];

  @ApiProperty({ description: 'Documents associés', type: [String] })
  @Column({ type: 'json', nullable: true })
  documents?: string[];

  @ApiProperty({ description: 'Servitudes ou restrictions' })
  @Column({ type: 'text', nullable: true })
  servitudes?: string;

  @ApiProperty({ description: 'Équipements disponibles', type: [String] })
  @Column({ type: 'json', nullable: true })
  equipements?: string[];

  @ApiProperty({ description: 'Coordonnées GPS - Latitude' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @ApiProperty({ description: 'Coordonnées GPS - Longitude' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @ApiProperty({ description: 'Lien Google Maps ou coordonnées GPS complètes' })
  @Column({ type: 'text', nullable: true })
  coordonnees_gps?: string;

  @ApiProperty({ description: 'Notes internes' })
  @Column({ type: 'text', nullable: true })
  notes_internes?: string;

  @ApiProperty({ description: 'Frais d\'agence en FCFA' })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  frais_agence?: number;

  @ApiProperty({ description: 'Commission négociable' })
  @Column({ type: 'boolean', default: false })
  commission_negociable: boolean;

  @ApiProperty({ description: 'Date de mise en vente' })
  @Column({ type: 'datetime', nullable: true })
  date_mise_vente?: Date;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @ApiProperty({ description: 'Date de suppression (soft delete)' })
  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deleted_at?: Date;

  // Relations
  @ManyToOne(() => Agence)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;

  @ManyToOne(() => Proprietaire, { nullable: true })
  @JoinColumn({ name: 'proprietaire_id' })
  proprietaire?: Proprietaire;
}