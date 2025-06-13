import { IsString, IsNumber, IsOptional, IsEnum, IsDate, Min, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaiementType, PaiementStatut } from '../entities/paiement.entity';

export class CreatePaiementDto {
  @ApiProperty({ description: 'ID de l\'agence', minimum: 1 })
  @IsInt()
  @Min(1)
  agence_id: number;

  @ApiProperty({ description: 'ID du bien immobilier', minimum: 1 })
  @IsInt()
  @Min(1)
  property_id: number;

  @ApiProperty({ description: 'ID du locataire', minimum: 1 })
  @IsInt()
  @Min(1)
  locataire_id: number;

  @ApiProperty({ description: 'ID du propriétaire', required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  proprietaire_id?: number;

  @ApiProperty({ description: 'ID du bail/contrat de location', required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  location_id?: number;

  @ApiProperty({ description: 'Type de paiement', enum: PaiementType, default: PaiementType.LOYER })
  @IsEnum(PaiementType)
  type: PaiementType;

  @ApiProperty({ description: 'Montant total attendu', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  montant_attendu: number;

  @ApiProperty({ description: 'Montant actuellement payé', minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  montant?: number;

  @ApiProperty({ description: 'Méthode de paiement (espèces, virement, etc.)', required: false })
  @IsOptional()
  @IsString()
  methode_paiement?: string;

  @ApiProperty({ description: 'Date d\'échéance du paiement' })
  @IsDate()
  @Type(() => Date)
  date_paiement: Date;

  @ApiProperty({ description: 'Date effective du paiement', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date_paiement_effectif?: Date;

  @ApiProperty({ description: 'Début de la période couverte', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  periode_debut?: Date;

  @ApiProperty({ description: 'Fin de la période couverte', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  periode_fin?: Date;

  @ApiProperty({ description: 'Mois de référence (1-12)', required: false, minimum: 1, maximum: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  mois_reference?: number;

  @ApiProperty({ description: 'Année de référence', required: false, minimum: 2000 })
  @IsOptional()
  @IsInt()
  @Min(2000)
  annee_reference?: number;

  @ApiProperty({ description: 'Statut du paiement', enum: PaiementStatut, default: PaiementStatut.IMPAYE })
  @IsEnum(PaiementStatut)
  statut: PaiementStatut;

  @ApiProperty({ description: 'Référence externe de la transaction', required: false })
  @IsOptional()
  @IsString()
  reference_transaction?: string;

  @ApiProperty({ description: 'Notes et commentaires', required: false })
  @IsOptional()
  @IsString()
  commentaires?: string;

  @ApiProperty({ description: 'Chemin du fichier de reçu', required: false })
  @IsOptional()
  @IsString()
  recu_path?: string;
}
