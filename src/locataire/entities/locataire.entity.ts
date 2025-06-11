import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Agence } from '../../agence/entities/agence.entity';
import { Location } from '../../location/entities/location.entity';
import { Paiement } from '../../paiement/entities/paiement.entity';

@Entity('locataires') // Correction du nom de table
export class Locataire {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', default: 0 })
  agence_id: number;

  @Column({ length: 100 })
  firstname: string;

  @Column({ length: 100 })
  lastname: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, unique: true })
  mobile: string;

  @Column({ type: 'date', nullable: true })
  bithday: Date;

  @Column({ length: 255, nullable: true })
  numero_cni: string;

  @Column({ length: 255, nullable: true })
  profession: string;

  @Column({ length: 255, nullable: true })
  adresse: string;

  @Column({ length: 255, nullable: true })
  ville: string;

  @Column({ length: 255, nullable: true })
  code_postal: string;

  @Column({ length: 255, default: 'locataire' })
  type_client: string;

  @Column({ type: 'int', default: 1, comment: '0=> inactif, 1=>actif' })
  statut: number;

  @Column({ type: 'text', nullable: true })
  piece_identite: string;

  @Column({ type: 'text', nullable: true })
  justificatif_domicile: string;

  @Column({ type: 'text', nullable: true })
  autres_documents: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Agence, (agence: Agence) => agence.locataires)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;

  @OneToMany(() => Location, (location: Location) => location.locataire)
  locations: Location[];

  @OneToMany(() => Paiement, (paiement: Paiement) => paiement.locataire)
  paiements: Paiement[];
}