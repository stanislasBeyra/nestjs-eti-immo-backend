import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsEmail, IsDateString, Min, Max, IsPositive } from 'class-validator';
import { TypeBien, DemarcheurStatus } from '../entities/demarcheur.entity';

export class CreateDemarcheurDto {
  @ApiProperty({ description: 'ID de l\'agence qui emploie le démarcheur' })
  @IsNumber()
  agence_id: number;

  @ApiProperty({ description: 'Prénom du démarcheur' })
  @IsString()
  firstname: string;

  @ApiProperty({ description: 'Nom de famille du démarcheur' })
  @IsString()
  lastname: string;

  @ApiProperty({ description: 'Numéro de téléphone mobile unique' })
  @IsString()
  mobile: string;

  @ApiProperty({ description: 'Adresse email du démarcheur', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Localité ou quartier de résidence' })
  @IsString()
  localite: string;

  @ApiProperty({ description: 'Adresse détaillée du démarcheur', required: false })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty({ description: 'Numéro de pièce d\'identité (CNI, Passeport)', required: false })
  @IsOptional()
  @IsString()
  numero_piece?: string;

  @ApiProperty({ description: 'Chemin vers la photo de la pièce d\'identité', required: false })
  @IsOptional()
  @IsString()
  photo_piece?: string;

  @ApiProperty({ description: 'Types de biens que le démarcheur peut démarcher', enum: TypeBien, isArray: true })
  @IsArray()
  @IsEnum(TypeBien, { each: true })
  types_biens: TypeBien[];

  @ApiProperty({ description: 'Prix minimum des biens à démarcher en FCFA', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  prix_minimum?: number;

  @ApiProperty({ description: 'Prix maximum des biens à démarcher en FCFA', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  prix_maximum?: number;

  @ApiProperty({ description: 'Pourcentage de commission versé au démarcheur' })
  @IsNumber()
  @Min(0)
  @Max(100)
  taux_commission: number;

  @ApiProperty({ description: 'Commission fixe par transaction en FCFA', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  commission_fixe?: number;

  @ApiProperty({ description: 'Notes ou commentaires sur le démarcheur', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Statut du démarcheur', enum: DemarcheurStatus, required: false })
  @IsOptional()
  @IsEnum(DemarcheurStatus)
  status?: DemarcheurStatus;

  @ApiProperty({ description: 'Date de début de collaboration', required: false })
  @IsOptional()
  @IsDateString()
  date_debut?: string;

  @ApiProperty({ description: 'Date de fin de collaboration', required: false })
  @IsOptional()
  @IsDateString()
  date_fin?: string;
}
