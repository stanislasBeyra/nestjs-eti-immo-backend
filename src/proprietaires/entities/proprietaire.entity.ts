import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Agence } from '../../agence/entities/agence.entity';
import { Bien } from '../../biens/entities/bien.entity';
import { Paiement } from '../../paiement/entities/paiement.entity';

@Entity('proprietaires')
export class Proprietaire {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Identifiant unique du propriétaire' })
  id: number;

  @Column({ 
    type: 'bigint', 
    comment: 'ID de l\'agence qui gère le propriétaire' 
  })
  agences_id: number;

  @Column({ 
    length: 255, 
    comment: 'Nom et prénom du propriétaire' 
  })
  full_name: string;

  @Column({ 
    length: 255, 
    unique: true, 
    comment: 'Numéro de téléphone mobile du propriétaire' 
  })
  mobile: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Adresse email du propriétaire' 
  })
  email: string;

  @Column({ 
    length: 255, 
    comment: 'Commune ou quartier de résidence' 
  })
  localite: string;

  @Column({ 
    type: 'text', 
    nullable: true, 
    comment: 'Adresse détaillée du propriétaire' 
  })
  adresse: string;

  @OneToMany(() => Bien, (bien) => bien.proprietaire)
  biens: Bien[];

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Numéro de la pièce d\'identité (CNI, Passeport, etc.)' 
  })
  piece_identite: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Chemin vers la photo de la pièce d\'identité' 
  })
  photo_piece: string;

  @CreateDateColumn({ comment: 'Date de création du propriétaire' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Date de dernière mise à jour' })
  updated_at: Date;

  @DeleteDateColumn({ comment: 'Date de suppression (soft delete)' })
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Agence, agence => agence.proprietaires)
  @JoinColumn({ name: 'agences_id' })
  agence: Agence;

  @OneToMany(() => Bien, bien => bien.proprietaire)
  properties: Bien[];

  @OneToMany(() => Paiement, paiement => paiement.proprietaire)
  paiements: Paiement[];
}