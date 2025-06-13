import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Agence } from '../../agence/entities/agence.entity';
import { Location } from '../../location/entities/location.entity';

@Entity('biens')
export class Bien {
  @ApiProperty({ description: 'Identifiant unique du bien' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ description: 'ID de l\'agence associée au bien' })
  @Column({ type: 'int', default: 0 })
  agence_id: number;

  @ApiProperty({ description: 'Type de bien (appartement, maison, etc.)' })
  @Column({ length: 100 })
  type_bien: string;

  @ApiProperty({ description: 'Titre du bien' })
  @Column({ length: 255 })
  titre: string;

  @ApiProperty({ description: 'Description détaillée du bien' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Adresse du bien' })
  @Column({ length: 255 })
  adresse: string;

  @ApiProperty({ description: 'Ville du bien' })
  @Column({ length: 100 })
  ville: string;

  @ApiProperty({ description: 'Code postal du bien' })
  @Column({ length: 20 })
  code_postal: string;

  @ApiProperty({ description: 'Surface du bien en m²' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  surface: number;

  @ApiProperty({ description: 'Nombre de pièces' })
  @Column({ type: 'int' })
  nombre_pieces: number;

  @ApiProperty({ description: 'Nombre de chambres' })
  @Column({ type: 'int' })
  nombre_chambres: number;

  @ApiProperty({ description: 'Nombre de salles de bain' })
  @Column({ type: 'int' })
  nombre_sdb: number;

  @ApiProperty({ description: 'Prix de location mensuel' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix_location: number;

  @ApiProperty({ description: 'Caution requise' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  caution: number;

  @ApiProperty({ description: 'Équipements disponibles', required: false })
  @Column({ type: 'text', nullable: true })
  equipements: string;

  @ApiProperty({ description: 'Photos du bien', required: false })
  @Column({ type: 'text', nullable: true })
  photos: string;

  @ApiProperty({ description: 'Statut du bien (0: indisponible, 1: disponible)', default: 1 })
  @Column({ type: 'int', default: 1, comment: '0=> indisponible, 1=>disponible' })
  statut: number;

  @ApiProperty({ description: 'Notes supplémentaires', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Date de dernière modification' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'Date de suppression', required: false })
  @DeleteDateColumn()
  deleted_at: Date;

  @ApiProperty({ type: () => Agence, description: 'Agence associée au bien' })
  @ManyToOne(() => Agence, (agence: Agence) => agence.properties)
  @JoinColumn({ name: 'agence_id' })
  agence: Agence;

  @ApiProperty({ type: () => [Location], description: 'Locations associées au bien' })
  @OneToMany(() => Location, (location: Location) => location.bien)
  locations: Location[];
} 