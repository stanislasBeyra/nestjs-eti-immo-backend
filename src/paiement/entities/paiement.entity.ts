import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Agence } from '../../agence/entities/agence.entity';
import { Bien } from '../../biens/entities/bien.entity';
import { Locataire } from '../../locataire/entities/locataire.entity';
import { Proprietaire } from '../../proprietaires/entities/proprietaire.entity';
import { Location } from '../../location/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { Notification } from '../../notifications/entities/notification.entity';

export enum PaiementType {
  LOYER = 'loyer',
  CAUTION = 'caution',
  FRAIS = 'frais',
  AUTRE = 'autre'
}

export enum PaiementStatut {
  PAYE = 'payé',
  IMPAYE = 'impayé',
  PARTIEL = 'partiel',
  ANNULE = 'annulé'
}

@Entity('paiements')
export class Paiement {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', default: 0, comment: 'ID de l\'agence' })
  agence_id: number;

  @Column({ type: 'bigint', default: 0, comment: 'ID du bien immobilier' })
  property_id: number;

  @Column({ type: 'bigint', default: 0, comment: 'ID du locataire' })
  locataire_id: number;

  @Column({ type: 'bigint', nullable: true, comment: 'ID du propriétaire' })
  proprietaire_id: number;

  @Column({ type: 'bigint', nullable: true, comment: 'ID du bail/contrat de location' })
  location_id: number;

  @Column({ type: 'bigint', nullable: true, comment: 'ID de l\'utilisateur qui a créé le paiement' })
  created_by: number;

  @Column({ length: 255, unique: true, comment: 'Numéro de reçu unique' })
  numero_recu: string;

  @Column({ 
    type: 'enum', 
    enum: PaiementType, 
    default: PaiementType.LOYER, 
    comment: 'Type de paiement' 
  })
  type: PaiementType;

  @Column({ type: 'decimal', precision: 18, scale: 2, comment: 'Montant total attendu' })
  montant_attendu: number;

  @Column({ 
    type: 'decimal', 
    precision: 18, 
    scale: 2, 
    default: 0.00, 
    comment: 'Montant actuellement payé' 
  })
  montant: number;

  @Column({ length: 255, nullable: true, comment: 'Méthode de paiement (espèces, virement, etc.)' })
  methode_paiement: string;

  @Column({ type: 'date', comment: 'Date d\'échéance du paiement' })
  date_paiement: Date;

  @Column({ type: 'date', nullable: true, comment: 'Date effective du paiement' })
  date_paiement_effectif: Date;

  @Column({ type: 'date', nullable: true, comment: 'Début de la période couverte' })
  periode_debut: Date;

  @Column({ type: 'date', nullable: true, comment: 'Fin de la période couverte' })
  periode_fin: Date;

  @Column({ 
    type: 'smallint', 
    unsigned: true, 
    nullable: true, 
    comment: 'Mois de référence (1-12)' 
  })
  mois_reference: number;

  @Column({ 
    type: 'smallint', 
    unsigned: true, 
    nullable: true, 
    comment: 'Année de référence' 
  })
  annee_reference: number;

  @Column({ 
    type: 'enum', 
    enum: PaiementStatut, 
    default: PaiementStatut.IMPAYE, 
    comment: 'Statut du paiement' 
  })
  statut: PaiementStatut;

  @Column({ length: 255, nullable: true, comment: 'Référence externe de la transaction' })
  reference_transaction: string;

  @Column({ type: 'text', nullable: true, comment: 'Notes et commentaires' })
  commentaires: string;

  @Column({ length: 255, nullable: true, comment: 'Chemin du fichier de reçu' })
  recu_path: string;

  @Column({ type: 'date', nullable: true, comment: 'Date de la dernière relance envoyée' })
  date_derniere_relance: Date;

  @Column({ 
    type: 'tinyint', 
    unsigned: true, 
    default: 0, 
    comment: 'Nombre de relances envoyées' 
  })
  nombre_relances: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Agence, agence => agence.paiements)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;

  @ManyToOne(() => Bien, property => property.paiements)
  @JoinColumn({ name: 'property_id' })
  property: Bien;

  @ManyToOne(() => Locataire, locataire => locataire.paiements)
  @JoinColumn({ name: 'locataire_id' })
  locataire: Locataire;

  @ManyToOne(() => Proprietaire, proprietaire => proprietaire.paiements)
  @JoinColumn({ name: 'proprietaire_id' })
  proprietaire: Proprietaire;

  @ManyToOne(() => Location, location => location.paiements)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by_user: User;

  @OneToMany(() => Notification, (notification: Notification) => notification.paiement, { cascade: true })
  notifications: Notification[];
}