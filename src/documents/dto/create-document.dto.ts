
import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../entities/document.entity';
import { Transform } from 'class-transformer';

export class CreateDocumentDto {
  @ApiProperty({
    enum: DocumentType,
    description: 'Type de document (0=RCCM, 1=DFE, 2=LICENSE, 3=STATUTS, 4=OTHER)',
    example: 0
  })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  type: DocumentType;

  @ApiProperty({
    description: 'Nom du document',
    example: 'RCCM 2024'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  // Ces champs seront ajoutés automatiquement par le contrôleur
  @IsOptional()
  agence_id?: number;

  @IsOptional()
  file_path?: string;
}
