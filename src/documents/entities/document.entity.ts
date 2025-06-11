import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Agence } from '../../agence/entities/agence.entity';

export enum DocumentType {
  RCCM = 0,
  DFE = 1,
  LICENSE = 2,
  STATUTS = 3,
  OTHER = 4
}

export enum DocumentStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3
}

@Entity('agency_documents')
export class AgencyDocument {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int' })
  agence_id: number;

  @Column({ 
    type: 'int', 
    comment: '0 = RCCM, 1 = DFE, 2 = License, 3 = Statuts, 4 = Other' 
  })
  type: DocumentType;

  @Column({ length: 255, nullable: true })
  file_path: string;

  @Column({ 
    type: 'int', 
    default: DocumentStatus.PENDING, 
    comment: '1 = pending, 2 = approved, 3 = rejected' 
  })
  status: DocumentStatus;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ length: 255, nullable: true })
  rejection_reason: string;

  @Column({ length: 255, default: '' })
  admin_comment: string;

  @Column({ type: 'timestamp', nullable: true })
  validated_at: Date;

  @Column({ type: 'int', default: 0 })
  validated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Agence, agence => agence.documents)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;
}