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
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Identifiant unique du bien' })
  id: number;

  @Column({ 
    type: 'bigint', 
    comment: 'ID de l\'agence qui gère le bien' 
  })
  agence_id: number;

  @Column({ 
    type: 'bigint', 
    comment: 'ID du propriétaire du bien' 
  })
  proprietaire_id: number;

  @Column({ 
    length: 255, 
    comment: 'Titre du bien' 
  })
  title: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Référence unique du bien' 
  })
  reference: string;

  @Column({ 
    type: 'enum', 
    enum: PropertyCategorie, 
    comment: 'Catégorie du bien (Maison, Résidence, Terrain)' 
  })
  categorie: PropertyCategorie;

  @Column({ 
    type: 'enum', 
    enum: PropertyType, 
    nullable: true, 
    comment: 'Type/nombre de pièces du bien' 
  })
  type: PropertyType;

  @Column({ 
    type: 'enum', 
    enum: PropertyStatus, 
    default: PropertyStatus.DISPONIBLE, 
    comment: 'Statut actuel du bien' 
  })
  status: PropertyStatus;

  @Column({ 
    type: 'text', 
    nullable: true, 
    comment: 'Description détaillée du bien' 
  })
  description: string;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    nullable: true, 
    comment: 'Surface en mètres carrés' 
  })
  superficie: number;

  @Column({ 
    type: 'int', 
    nullable: true, 
    comment: 'Nombre total de pièces' 
  })
  pieces: number;

  @Column({ 
    type: 'int', 
    nullable: true, 
    comment: 'Nombre de chambres' 
  })
  bedrooms: number;

  @Column({ 
    type: 'int', 
    nullable: true, 
    comment: 'Nombre de salles de bain' 
  })
  bathrooms: number;

  @Column({ 
    type: 'int', 
    nullable: true, 
    comment: 'Étage du bien' 
  })
  floor: number;

  @Column({ 
    type: 'int', 
    nullable: true, 
    comment: 'Nombre de places de stationnement' 
  })
  garages: number;

  @Column({ 
    type: 'json', 
    nullable: true, 
    comment: 'Liste des équipements disponibles' 
  })
  amenities: string[];

  @Column({ 
    length: 255, 
    comment: 'Adresse complète du bien' 
  })
  address: string;

  @Column({ 
    length: 255, 
    comment: 'Commune ou quartier principal' 
  })
  localite: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Sous-quartier ou zone spécifique' 
  })
  area: string;

  @Column({ 
    type: 'decimal', 
    precision: 18, 
    scale: 2, 
    comment: 'Loyer mensuel en FCFA' 
  })
  loyer: number;

  @Column({ 
    type: 'decimal', 
    precision: 18, 
    scale: 2, 
    nullable: true, 
    comment: 'Montant de la caution en FCFA' 
  })
  deposit: number;

  @Column({ 
    type: 'decimal', 
    precision: 18, 
    scale: 2, 
    nullable: true, 
    comment: 'Charges mensuelles en FCFA' 
  })
  charges: number;

  @Column({ 
    type: 'decimal', 
    precision: 18, 
    scale: 2, 
    nullable: true, 
    comment: 'Frais d\'agence en FCFA' 
  })
  agency_fees: number;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Chemin vers l\'image principale' 
  })
  main_image: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Chemin vers le document de titre de propriété' 
  })
  property_title_doc: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Chemin vers le contrat de bail' 
  })
  lease_doc: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Chemin vers l\'état des lieux' 
  })
  condition_doc: string;

  @Column({ 
    type: 'json', 
    nullable: true, 
    comment: 'Liste des chemins vers les documents additionnels' 
  })
  other_docs: string[];

  @CreateDateColumn({ comment: 'Date de création du bien' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Date de dernière mise à jour' })
  updated_at: Date;

  @DeleteDateColumn({ comment: 'Date de suppression (soft delete)' })
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Agence, agence => agence.properties)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;

  @ManyToOne(() => Proprietaire, proprietaire => proprietaire.properties)
  @JoinColumn({ name: 'proprietaire_id' })
  proprietaire: Proprietaire;

  @OneToMany(() => BiensImage, image => image.bien)
  images: BiensImage[];

  @OneToMany(() => Location, location => location.bien)
  locations: Location[];

  @OneToMany(() => Paiement, paiement => paiement.property)
  paiements: Paiement[];
}