import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsBoolean, IsDateString, IsPositive, IsLatitude, IsLongitude } from 'class-validator';
import { TerrainType, ZoneType, TerrainStatus } from '../entities/terrain.entity';

export class CreateTerrainDto {
  @ApiProperty({ description: 'ID du propriétaire du terrain', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  proprietaire_id?: number;

  @ApiProperty({ description: 'Titre du terrain' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description détaillée du terrain', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Adresse complète du terrain' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Localité/Quartier' })
  @IsString()
  localite: string;

  @ApiProperty({ description: 'Commune', required: false })
  @IsOptional()
  @IsString()
  commune?: string;

  @ApiProperty({ description: 'Prix de vente en FCFA' })
  @IsNumber()
  @IsPositive()
  prix_vente: number;

  @ApiProperty({ description: 'Prix au mètre carré en FCFA', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  prix_m2?: number;

  @ApiProperty({ description: 'Superficie totale en m²' })
  @IsNumber()
  @IsPositive()
  superficie: number;

  @ApiProperty({ description: 'Superficie constructible en m²', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  superficie_constructible?: number;

  @ApiProperty({ description: 'Type de terrain', enum: TerrainType })
  @IsEnum(TerrainType)
  type: TerrainType;

  @ApiProperty({ description: 'Zone d\'occupation', enum: ZoneType, required: false })
  @IsOptional()
  @IsEnum(ZoneType)
  zone?: ZoneType;

  @ApiProperty({ description: 'Statut du terrain', enum: TerrainStatus, required: false, default: TerrainStatus.DISPONIBLE })
  @IsOptional()
  @IsEnum(TerrainStatus)
  status?: TerrainStatus;

  @ApiProperty({ description: 'Le terrain est-il constructible', default: true })
  @IsOptional()
  @IsBoolean()
  constructible?: boolean;

  @ApiProperty({ description: 'Le terrain est-il viabilisé (eau, électricité)', default: false })
  @IsOptional()
  @IsBoolean()
  viabilise?: boolean;

  @ApiProperty({ description: 'Accès routier disponible', default: true })
  @IsOptional()
  @IsBoolean()
  acces_route?: boolean;

  @ApiProperty({ description: 'Numéro du titre foncier', required: false })
  @IsOptional()
  @IsString()
  titre_foncier?: string;

  @ApiProperty({ description: 'Référence cadastrale', required: false })
  @IsOptional()
  @IsString()
  reference_cadastrale?: string;

  @ApiProperty({ description: 'Référence interne', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ description: 'Image principale du terrain', required: false })
  @IsOptional()
  @IsString()
  main_image?: string;

  @ApiProperty({ description: 'Images supplémentaires', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  other_images?: string[];

  @ApiProperty({ description: 'Documents associés', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiProperty({ description: 'Servitudes ou restrictions', required: false })
  @IsOptional()
  @IsString()
  servitudes?: string;

  @ApiProperty({ description: 'Équipements disponibles', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipements?: string[];

  @ApiProperty({ description: 'Coordonnées GPS - Latitude', required: false })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiProperty({ description: 'Coordonnées GPS - Longitude', required: false })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiProperty({ description: 'Lien Google Maps ou coordonnées GPS complètes', required: false })
  @IsOptional()
  @IsString()
  coordonnees_gps?: string;

  @ApiProperty({ description: 'Notes internes', required: false })
  @IsOptional()
  @IsString()
  notes_internes?: string;

  @ApiProperty({ description: 'Frais d\'agence en FCFA', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  frais_agence?: number;

  @ApiProperty({ description: 'Commission négociable', default: false })
  @IsOptional()
  @IsBoolean()
  commission_negociable?: boolean;

  @ApiProperty({ description: 'Date de mise en vente', required: false })
  @IsOptional()
  @IsDateString()
  date_mise_vente?: string;
}