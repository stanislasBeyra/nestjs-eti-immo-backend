import { IsString, IsEmail, IsOptional, IsDate, IsInt, Min, Max, MinLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocataireDto {
  @ApiProperty({ description: "ID de l'agence associée au locataire (automatique, ne pas renseigner)", required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  agence_id?: number;

  @ApiProperty({ description: 'Prénom du locataire' })
  @IsString()
  firstname: string;

  @ApiProperty({ description: 'Nom du locataire' })
  @IsString()
  lastname: string;

  @ApiProperty({ description: 'Email du locataire' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Numéro de téléphone du locataire' })
  @IsString()
  mobile: string;

  @ApiProperty({ description: 'Date de naissance du locataire', required: false })
  @IsOptional()
  @IsDateString()
  bithday?: Date;

  @ApiProperty({ description: 'Numéro CNI du locataire', required: false })
  @IsOptional()
  @IsString()
  numero_cni?: string;

  @ApiProperty({ description: 'Profession du locataire', required: false })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiProperty({ description: 'Adresse du locataire', required: false })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty({ description: 'Ville du locataire', required: false })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiProperty({ description: 'Code postal du locataire', required: false })
  @IsOptional()
  @IsString()
  code_postal?: string;

  @ApiProperty({ description: 'Type de client', required: false, default: 'locataire' })
  @IsOptional()
  @IsString()
  type_client?: string;

  @ApiProperty({ description: 'Statut du locataire (0: inactif, 1: actif)', required: false, default: 1, minimum: 0, maximum: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  statut?: number;

  @ApiProperty({ description: 'Pièce d\'identité du locataire', required: false })
  @IsOptional()
  @IsString()
  piece_identite?: string;

  @ApiProperty({ description: 'Justificatif de domicile du locataire', required: false })
  @IsOptional()
  @IsString()
  justificatif_domicile?: string;

  @ApiProperty({ description: 'Autres documents du locataire', required: false })
  @IsOptional()
  @IsString()
  autres_documents?: string;

  @ApiProperty({ description: 'Notes sur le locataire', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    description: 'Mot de passe du locataire', 
    minLength: 6,
    example: 'password123'
  })
  @IsString()
  @MinLength(6)
  password: string;
}
