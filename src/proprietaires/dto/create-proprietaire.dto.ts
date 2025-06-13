import { IsString, IsNumber, IsOptional, IsEmail, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProprietaireDto {
  @ApiProperty({ description: 'ID de l\'agence associée au propriétaire', minimum: 1 })
  @IsInt()
  @Min(1)
  agences_id: number;

  @ApiProperty({ description: 'Nom et prénom du propriétaire' })
  @IsString()
  full_name: string;

  @ApiProperty({ description: 'Numéro de téléphone mobile du propriétaire' })
  @IsString()
  mobile: string;

  @ApiProperty({ description: 'Adresse email du propriétaire', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Commune ou quartier de résidence' })
  @IsString()
  localite: string;

  @ApiProperty({ description: 'Adresse détaillée du propriétaire', required: false })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty({ description: 'Numéro de la pièce d\'identité', required: false })
  @IsOptional()
  @IsString()
  piece_identite?: string;

  @ApiProperty({ description: 'Chemin vers la photo de la pièce d\'identité', required: false })
  @IsOptional()
  @IsString()
  photo_piece?: string;
}
