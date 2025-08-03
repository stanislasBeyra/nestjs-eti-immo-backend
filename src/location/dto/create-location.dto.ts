import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, IsEnum, Min, Max, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LocationStatut } from '../entities/location.entity';

export class CreateLocationDto {
  @ApiProperty({ description: 'ID du bien immobilier concerné' })
  @IsNotEmpty({ message: 'L\'ID du bien est requis' })
  @IsNumber({}, { message: 'L\'ID du bien doit être un nombre' })
  bien_id: number;

  @ApiProperty({ description: 'ID du locataire' })
  @IsNotEmpty({ message: 'L\'ID du locataire est requis' })
  @IsNumber({}, { message: 'L\'ID du locataire doit être un nombre' })
  locataire_id: number;

  @ApiProperty({ description: 'Date de début du bail', example: '2024-01-01' })
  @IsNotEmpty({ message: 'La date de début est requise' })
  @IsDateString({}, { message: 'La date de début doit être une date valide' })
  date_debut: Date;

  @ApiProperty({ description: 'Date de fin du bail', example: '2025-01-01', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin doit être une date valide' })
  date_fin?: Date;

  @ApiProperty({ description: 'Montant du loyer mensuel', example: 800.00 })
  @IsNotEmpty({ message: 'Le montant du loyer est requis' })
  @IsNumberString({}, { message: 'Le loyer doit être un nombre valide' })
  loyer: string;

  @ApiProperty({ description: 'Montant de la caution', example: 1600.00, required: false })
  @IsOptional()
  @IsNumberString({}, { message: 'La caution doit être un nombre valide' })
  caution?: string;

  @ApiProperty({ description: 'Montant des charges mensuelles', example: 50.00, required: false })
  @IsOptional()
  @IsNumberString({}, { message: 'Les charges doivent être un nombre valide' })
  charges?: string;

  @ApiProperty({ description: 'Jour du mois pour le paiement', example: 5, minimum: 1, maximum: 31 })
  @IsOptional()
  @IsNumber({}, { message: 'Le jour de paiement doit être un nombre' })
  @Min(1, { message: 'Le jour de paiement doit être entre 1 et 31' })
  @Max(31, { message: 'Le jour de paiement doit être entre 1 et 31' })
  jour_paiement?: number;

  @ApiProperty({ description: 'Durée du bail en mois', example: 12, minimum: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'La durée doit être un nombre' })
  @Min(1, { message: 'La durée doit être d\'au moins 1 mois' })
  duree?: number;

  @ApiProperty({ description: 'Fréquence de paiement', example: 'mensuel', enum: ['mensuel', 'trimestriel', 'semestriel', 'annuel'] })
  @IsOptional()
  @IsString({ message: 'La fréquence de paiement doit être une chaîne de caractères' })
  frequence_paiement?: string;

  @ApiProperty({ description: 'Statut du bail', enum: LocationStatut })
  @IsOptional()
  @IsEnum(LocationStatut, { message: 'Le statut doit être une valeur valide' })
  statut?: LocationStatut;

  @ApiProperty({ description: 'Chemin du fichier de contrat', required: false })
  @IsOptional()
  @IsString({ message: 'Le chemin du contrat doit être une chaîne de caractères' })
  contrat_path?: string;

  @ApiProperty({ description: 'Chemin du fichier d\'état des lieux d\'entrée', required: false })
  @IsOptional()
  @IsString({ message: 'Le chemin de l\'état des lieux d\'entrée doit être une chaîne de caractères' })
  etat_lieux_entree_path?: string;

  @ApiProperty({ description: 'Chemin du fichier d\'état des lieux de sortie', required: false })
  @IsOptional()
  @IsString({ message: 'Le chemin de l\'état des lieux de sortie doit être une chaîne de caractères' })
  etat_lieux_sortie_path?: string;

  @ApiProperty({ description: 'Notes sur le bail', required: false })
  @IsOptional()
  @IsString({ message: 'Les notes doivent être une chaîne de caractères' })
  notes?: string;
}
