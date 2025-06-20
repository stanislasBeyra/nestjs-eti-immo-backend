import { IsString, IsOptional, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProprietaireDto {
  @ApiProperty({ 
    description: 'Nom et prénom du propriétaire',
    example: 'Jean Dupont',
    minLength: 2,
    maxLength: 255
  })
  @IsString({ message: 'Le nom complet doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le nom complet doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le nom complet ne peut pas dépasser 255 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, { 
    message: 'Le nom complet ne peut contenir que des lettres, espaces, tirets et apostrophes' 
  })
  full_name: string;

  @ApiProperty({ 
    description: 'Numéro de téléphone mobile du propriétaire',
    example: '0141450517',
    minLength: 8,
    maxLength: 15
  })
  @IsString({ message: 'Le numéro de téléphone mobile doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le numéro de téléphone mobile doit contenir au moins 8 chiffres' })
  @MaxLength(15, { message: 'Le numéro de téléphone mobile ne peut pas dépasser 15 chiffres' })
  @Matches(/^[0-9+\-\s()]+$/, { 
    message: 'Le numéro de téléphone mobile ne peut contenir que des chiffres, espaces, tirets, plus et parenthèses' 
  })
  mobile: string;

  @ApiProperty({ 
    description: 'Adresse email du propriétaire', 
    required: false,
    example: 'jean.dupont@example.com'
  })
  @IsOptional()
  @IsEmail({}, { message: 'L\'adresse email doit être une adresse email valide' })
  @MaxLength(255, { message: 'L\'adresse email ne peut pas dépasser 255 caractères' })
  email?: string;

  @ApiProperty({ 
    description: 'Commune ou quartier de résidence',
    example: 'Koumassi',
    minLength: 2,
    maxLength: 255
  })
  @IsString({ message: 'La localité doit être une chaîne de caractères' })
  @MinLength(2, { message: 'La localité doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'La localité ne peut pas dépasser 255 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, { 
    message: 'La localité ne peut contenir que des lettres, espaces, tirets et apostrophes' 
  })
  localite: string;

  @ApiProperty({ 
    description: 'Adresse détaillée du propriétaire', 
    required: false,
    example: '123 Rue de la Paix, Appartement 4B',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  @MaxLength(500, { message: 'L\'adresse ne peut pas dépasser 500 caractères' })
  adresse?: string;

  @ApiProperty({ 
    description: 'Numéro de la pièce d\'identité', 
    required: false,
    example: '1234567890',
    minLength: 5,
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'Le numéro de pièce d\'identité doit être une chaîne de caractères' })
  @MinLength(5, { message: 'Le numéro de pièce d\'identité doit contenir au moins 5 caractères' })
  @MaxLength(50, { message: 'Le numéro de pièce d\'identité ne peut pas dépasser 50 caractères' })
  @Matches(/^[a-zA-Z0-9\-\s]+$/, { 
    message: 'Le numéro de pièce d\'identité ne peut contenir que des lettres, chiffres, espaces et tirets' 
  })
  piece_identite?: string;

  @ApiProperty({ 
    description: 'Chemin vers la photo de la pièce d\'identité', 
    required: false,
    example: '/uploads/pieces/photo_cni.jpg',
    maxLength: 255
  })
  @IsOptional()
  @IsString({ message: 'Le chemin de la photo doit être une chaîne de caractères' })
  @MaxLength(255, { message: 'Le chemin de la photo ne peut pas dépasser 255 caractères' })
  @Matches(/^[a-zA-Z0-9\/\-_\.]+$/, { 
    message: 'Le chemin de la photo ne peut contenir que des lettres, chiffres, slashes, tirets, underscores et points' 
  })
  photo_piece?: string;
}
