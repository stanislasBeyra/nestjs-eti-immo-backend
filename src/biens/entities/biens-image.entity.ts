import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Bien } from './bien.entity';

@Entity('biens_images')
export class BiensImage {
  @PrimaryGeneratedColumn({ 
    type: 'bigint',
    comment: 'Identifiant unique de l\'image'
  })
  id: number;

  @Column({ 
    type: 'bigint',
    comment: 'ID du bien immobilier associé à l\'image'
  })
  bien_id: number;

  @Column({ 
    length: 255, 
    comment: 'Chemin de stockage de l\'image sur le serveur'
  })
  image_path: string;

  @Column({ 
    type: 'boolean', 
    default: false, 
    comment: 'Indique si l\'image est l\'image principale du bien'
  })
  is_main: boolean;

  @Column({ 
    type: 'int', 
    default: 0, 
    comment: 'Ordre d\'affichage des images dans la galerie'
  })
  display_order: number;

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
  @ManyToOne(() => Bien, bien => bien.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bien_id' })
  bien: Bien;
} 