import { IsString, IsNumber, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBiensDto {
  @ApiProperty({ description: 'ID de l\'agence associée au bien', minimum: 1 })
  @IsInt()
  @Min(1)
  agence_id: number;

  @ApiProperty({ description: 'Type de bien (appartement, maison, etc.)' })
  @IsString()
  type_bien: string;

  @ApiProperty({ description: 'Titre du bien' })
  @IsString()
  titre: string;

  @ApiProperty({ description: 'Description détaillée du bien' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Adresse du bien' })
  @IsString()
  adresse: string;

  @ApiProperty({ description: 'Ville du bien' })
  @IsString()
  ville: string;

  @ApiProperty({ description: 'Code postal du bien' })
  @IsString()
  code_postal: string;

  @ApiProperty({ description: 'Surface du bien en m²', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  surface: number;

  @ApiProperty({ description: 'Nombre de pièces', minimum: 0 })
  @IsInt()
  @Min(0)
  nombre_pieces: number;

  @ApiProperty({ description: 'Nombre de chambres', minimum: 0 })
  @IsInt()
  @Min(0)
  nombre_chambres: number;

  @ApiProperty({ description: 'Nombre de salles de bain', minimum: 0 })
  @IsInt()
  @Min(0)
  nombre_sdb: number;

  @ApiProperty({ description: 'Prix de location mensuel', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prix_location: number;

  @ApiProperty({ description: 'Caution requise', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  caution: number;

  @ApiProperty({ description: 'Équipements disponibles', required: false })
  @IsOptional()
  @IsString()
  equipements?: string;

  @ApiProperty({ description: 'Photos du bien', required: false })
  @IsOptional()
  @IsString()
  photos?: string;

  @ApiProperty({ 
    description: 'Statut du bien (0: indisponible, 1: disponible)', 
    required: false, 
    default: 1, 
    minimum: 0, 
    maximum: 1 
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  statut?: number;

  @ApiProperty({ description: 'Notes supplémentaires', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
} 