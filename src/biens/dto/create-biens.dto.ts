import { IsString, IsNumber, IsOptional, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PropertyType, PropertyCategorie, PropertyStatus } from '../entities/bien.entity';

export class CreateBiensDto {
  @ApiProperty()
  @IsInt()
  proprietaire_id: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: PropertyCategorie })
  @IsEnum(PropertyCategorie)
  categorie: PropertyCategorie;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ enum: PropertyStatus, default: PropertyStatus.DISPONIBLE })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  localite: string;

  @ApiProperty()
  @IsNumber()
  loyer: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  main_image?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  superficie?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  pieces?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  bedrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  bathrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  floor?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  garages?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  deposit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  charges?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  agency_fees?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  property_title_doc?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lease_doc?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  condition_doc?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  other_docs?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
} 