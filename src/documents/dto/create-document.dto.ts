
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../entities/document.entity';
import { Transform } from 'class-transformer'; // <-- Ajoutez cet import

export class CreateDocumentDto {
  @ApiProperty({
    enum: DocumentType,
    description: 'Type de document (RCCM, DFE, LICENSE, STATUTS, OTHER)',
    example: DocumentType.RCCM
  })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10)) // <-- Ajoutez cette ligne pour la transformation
  type: DocumentType;

  @ApiProperty({
    description: 'Nom du document',
    example: 'RCCM 2024'
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
