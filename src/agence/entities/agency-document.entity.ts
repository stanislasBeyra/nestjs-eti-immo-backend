import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Agence } from './agence.entity';

export enum DocumentType {
  REGISTRE_COMMERCE = 'Registre de commerce',
  PATENTE = 'Patente',
  ATTESTATION_FISCALE = 'Attestation fiscale',
  AUTRE = 'Autre'
}

@Entity('agency_documents')
export class AgencyDocument {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Identifiant unique du document' })
  id: number;

  @Column({ 
    type: 'bigint', 
    comment: 'ID de l\'agence propriétaire du document' 
  })
  agence_id: number;

  @Column({ 
    type: 'enum', 
    enum: DocumentType, 
    comment: 'Type de document' 
  })
  type: DocumentType;

  @Column({ 
    length: 255, 
    comment: 'Chemin vers le fichier du document' 
  })
  file_path: string;

  @Column({ 
    length: 255, 
    nullable: true, 
    comment: 'Numéro de référence du document' 
  })
  reference_number: string;

  @Column({ 
    type: 'date', 
    nullable: true, 
    comment: 'Date d\'expiration du document' 
  })
  expiry_date: Date;

  @Column({ 
    type: 'boolean', 
    default: false, 
    comment: 'Indique si le document est vérifié' 
  })
  is_verified: boolean;

  @Column({ 
    type: 'text', 
    nullable: true, 
    comment: 'Notes ou commentaires sur le document' 
  })
  notes: string;

  @CreateDateColumn({ comment: 'Date de création du document' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Date de dernière mise à jour' })
  updated_at: Date;

  @DeleteDateColumn({ comment: 'Date de suppression (soft delete)' })
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Agence, agence => agence.documents)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;
} 