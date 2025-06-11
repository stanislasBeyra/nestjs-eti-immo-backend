import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { AgencyDocument } from './agency-document.entity';
import { Locataire } from '../../locataire/entities/locataire.entity';
import { Proprietaire } from '../../proprietaires/entities/proprietaire.entity';
import { Bien } from '../../biens/entities/bien.entity';
import { Location } from '../../location/entities/location.entity';
import { Paiement } from '../../paiement/entities/paiement.entity';
import { User } from '../../users/entities/user.entity';

export enum AgenceStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  INACTIVE = 3
}

@Entity('agences')
export class Agence {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Identifiant unique de l\'agence' })
  id: number;

  @Column({ 
    type: 'int', 
    comment: 'ID de l\'administrateur qui gère l\'agence' 
  })
  admin_id: number;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Chemin vers le logo de l\'agence' 
  })
  logo_path: string;

  @Column({ 
    length: 255, 
    comment: 'Nom de l\'agence' 
  })
  agences_name: string;

  @Column({ 
    length: 255, 
    unique: true, 
    comment: 'Email unique de l\'agence' 
  })
  agences_email: string;

  @Column({ 
    length: 255, 
    unique: true, 
    comment: 'Numéro de téléphone mobile de l\'agence' 
  })
  agences_mobile: string;

  @Column({ 
    length: 255, 
    comment: 'Localisation principale de l\'agence' 
  })
  agences_location: string;

  @Column({ 
    type: 'text', 
    nullable: true, 
    comment: 'Adresse détaillée de l\'agence' 
  })
  agences_address: string;

  @Column({ 
    type: 'int', 
    default: AgenceStatus.PENDING, 
    comment: 'Statut de l\'agence (0: En attente, 1: Approuvée, 2: Rejetée, 3: Inactive)' 
  })
  status: AgenceStatus;

  @Column({ 
    type: 'boolean', 
    default: false, 
    comment: 'Indique si les conditions d\'utilisation ont été acceptées' 
  })
  terms_accepted: boolean;

  @CreateDateColumn({ comment: 'Date de création de l\'agence' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Date de dernière mise à jour' })
  updated_at: Date;

  @DeleteDateColumn({ comment: 'Date de suppression (soft delete)' })
  deleted_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.agences)
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @OneToMany(() => AgencyDocument, (document: AgencyDocument) => document.agence)
  documents: AgencyDocument[];

  @OneToMany(() => Locataire, locataire => locataire.agence)
  locataires: Locataire[];

  @OneToMany(() => Proprietaire, proprietaire => proprietaire.agence)
  proprietaires: Proprietaire[];

  @OneToMany(() => Bien, property => property.agence)
  properties: Bien[];

  @OneToMany(() => Location, location => location.agence)
  locations: Location[];

  @OneToMany(() => Paiement, paiement => paiement.agence)
  paiements: Paiement[];
}