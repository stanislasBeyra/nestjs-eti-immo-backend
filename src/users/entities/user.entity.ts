import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Agence } from '../../agence/entities/agence.entity';
import { Location } from '../../location/entities/location.entity';
import { Notification } from '../../notifications/entities/notification.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum UserCategorie {
  ADMIN = 1,
  AGENT = 2
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Identifiant unique de l\'utilisateur' })
  id: number;

  @Column({ length: 255, comment: 'Nom complet de l\'utilisateur' })
  name: string;

  @Column({ length: 255, unique: true, comment: 'Email unique de l\'utilisateur' })
  email: string;

  @Column({ 
    type: 'int', 
    default: UserCategorie.AGENT, 
    comment: 'Catégorie de l\'utilisateur (1: Admin, 2: Agent)' 
  })
  categorie: UserCategorie;

  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: 'Date de vérification de l\'email' 
  })
  email_verified_at: Date;

  @Column({ 
    length: 255, 
    comment: 'Mot de passe hashé de l\'utilisateur' 
  })
  password: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Dernière adresse IP de connexion' 
  })
  last_login_ip: string;

  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: 'Date de dernière connexion' 
  })
  last_login_at: Date;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Chemin vers l\'avatar de l\'utilisateur' 
  })
  avatar: string;

  @Column({ 
    type: 'enum', 
    enum: UserStatus, 
    default: UserStatus.ACTIVE,
    comment: 'Statut de l\'utilisateur (active, inactive, suspended, pending)' 
  })
  status: UserStatus;

  @Column({ 
    type: 'text', 
    nullable: true, 
    comment: 'Biographie ou description de l\'utilisateur' 
  })
  bio: string;

  @Column({ 
    type: 'date', 
    nullable: true, 
    comment: 'Date de naissance de l\'utilisateur' 
  })
  birth_date: Date;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Numéro de téléphone de l\'utilisateur' 
  })
  phone: string;

  @Column({ 
    length: 100, 
    nullable: true, 
    comment: 'Token de "remember me" pour la persistance de session' 
  })
  remember_token: string;

  @CreateDateColumn({ comment: 'Date de création de l\'utilisateur' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Date de dernière mise à jour' })
  updated_at: Date;

  @DeleteDateColumn({ comment: 'Date de suppression (soft delete)' })
  deleted_at: Date;

  // Relations
  @OneToMany(() => Location, location => location.created_by)
  locations_created: Location[];

  @OneToMany(() => Notification, notification => notification.creator)
  notifications_created: Notification[];

  @OneToMany(() => Agence, agence => agence.admin)
  agences: Agence[];
}