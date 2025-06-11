import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Agence } from '../../agence/entities/agence.entity';
import { Bien } from '../../biens/entities/bien.entity';
import { Locataire } from '../../locataire/entities/locataire.entity';
import { User } from '../../users/entities/user.entity';
import { Paiement } from '../../paiement/entities/paiement.entity';

export enum LocationStatut {
  ACTIF = 'actif',
  TERMINE = 'terminé',
  RESILIE = 'résilié',
  EN_ATTENTE = 'en attente'
}

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn({ 
    type: 'bigint',
    comment: 'Identifiant unique de la location'
  })
  id: number;

  @Column({ 
    type: 'bigint', 
    comment: 'ID de l\'agence qui gère la location'
  })
  agence_id: number;

  @Column({ 
    type: 'bigint', 
    comment: 'ID du bien immobilier concerné'
  })
  bien_id: number;

  @Column({ 
    type: 'bigint', 
    comment: 'ID du locataire'
  })
  locataire_id: number;

  @Column({ 
    type: 'bigint', 
    nullable: true,
    comment: 'ID de l\'utilisateur qui a créé la location'
  })
  created_by: number;

  @Column({ 
    type: 'date', 
    comment: 'Date de début du bail'
  })
  date_debut: Date;

  @Column({ 
    type: 'date', 
    nullable: true, 
    comment: 'Date de fin du bail'
  })
  date_fin: Date;

  @Column({ 
    type: 'decimal', 
    precision: 18, 
    scale: 2, 
    comment: 'Montant du loyer mensuel'
  })
  loyer: number;

  @Column({ 
    type: 'decimal', 
    precision: 18, 
    scale: 2, 
    nullable: true, 
    comment: 'Montant de la caution'
  })
  caution: number;

  @Column({ 
    type: 'decimal', 
    precision: 18, 
    scale: 2, 
    default: 0.00, 
    comment: 'Montant des charges mensuelles'
  })
  charges: number;

  @Column({ 
    type: 'tinyint', 
    unsigned: true, 
    default: 5, 
    comment: 'Jour du mois pour le paiement (1-31)'
  })
  jour_paiement: number;

  @Column({ 
    type: 'smallint', 
    unsigned: true, 
    default: 12, 
    comment: 'Durée du bail en mois'
  })
  duree: number;

  @Column({ 
    length: 255, 
    default: 'mensuel', 
    comment: 'Fréquence de paiement (mensuel, trimestriel, etc.)'
  })
  frequence_paiement: string;

  @Column({ 
    type: 'enum', 
    enum: LocationStatut, 
    default: LocationStatut.ACTIF, 
    comment: 'Statut du bail'
  })
  statut: LocationStatut;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Chemin du fichier de contrat'
  })
  contrat_path: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Chemin du fichier d\'état des lieux d\'entrée'
  })
  etat_lieux_entree_path: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Chemin du fichier d\'état des lieux de sortie'
  })
  etat_lieux_sortie_path: string;

  @Column({ 
    type: 'text', 
    nullable: true, 
    comment: 'Notes sur le bail'
  })
  notes: string;

  @CreateDateColumn({ 
    comment: 'Date de création de l\'enregistrement'
  })
  created_at: Date;

  @UpdateDateColumn({ 
    comment: 'Date de dernière mise à jour'
  })
  updated_at: Date;

  @DeleteDateColumn({ 
    comment: 'Date de suppression (soft delete)'
  })
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Agence, agence => agence.locations)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;

  @ManyToOne(() => Bien, bien => bien.locations)
  @JoinColumn({ name: 'bien_id' })
  bien: Bien;

  @ManyToOne(() => Locataire, locataire => locataire.locations)
  @JoinColumn({ name: 'locataire_id' })
  locataire: Locataire;

  @ManyToOne(() => User, user => user.locations_created)
  @JoinColumn({ name: 'created_by' })
  created_by_user: User;

  @OneToMany(() => Paiement, (paiement: Paiement) => paiement.location)
  paiements: Paiement[];
}