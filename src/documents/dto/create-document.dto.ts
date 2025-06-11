import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../entities/document.entity';

export class CreateDocumentDto {
  @ApiProperty({
    enum: DocumentType,
    description: 'Type de document (RCCM, DFE, LICENSE, STATUTS, OTHER)',
    example: DocumentType.RCCM
  })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @ApiProperty({
    description: 'Nom du document',
    example: 'RCCM 2024'
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
