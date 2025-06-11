import { IsString, IsEmail, IsPhoneNumber, IsOptional, MinLength, MaxLength, IsBoolean, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgenceDto {
  @ApiProperty({
    description: 'Nom de l\'agence',
    example: 'Nova Agence Immobilière',
    minLength: 2,
    maxLength: 255
  })
  @IsString({ message: 'Le nom de l\'agence doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le nom ne peut pas dépasser 255 caractères' })
  agences_name: string;

  @ApiProperty({
    description: 'Email de contact de l\'agence',
    example: 'contact@nova-agence.com'
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  agences_email: string;

  @ApiProperty({
    description: 'Numéro de téléphone mobile de l\'agence',
    example: '+2250707070707'
  })
  @IsPhoneNumber('CI', { message: 'Numéro de téléphone invalide pour la Côte d\'Ivoire' })
  agences_mobile: string;

  @ApiProperty({
    description: 'Localisation de l\'agence',
    example: 'Plateau, Abidjan',
    minLength: 2,
    maxLength: 255
  })
  @IsString({ message: 'La localisation doit être une chaîne de caractères' })
  @MinLength(2, { message: 'La localisation doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'La localisation ne peut pas dépasser 255 caractères' })
  agences_location: string;

  @ApiProperty({
    description: 'Adresse complète de l\'agence',
    example: '123 Avenue de la République, Plateau',
    minLength: 5,
    maxLength: 500
  })
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  @MinLength(5, { message: 'L\'adresse doit contenir au moins 5 caractères' })
  @MaxLength(500, { message: 'L\'adresse ne peut pas dépasser 500 caractères' })
  agences_adress: string;

  @ApiProperty({
    description: 'URL du logo de l\'agence',
    example: 'https://www.nova-agence.com/logo.png',
    required: false
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL du logo invalide' })
  @MaxLength(255, { message: 'L\'URL du logo ne peut pas dépasser 255 caractères' })
  logo?: string;

  @ApiProperty({
    description: 'Acceptation des conditions d\'utilisation',
    example: true,
    type: Boolean
  })
  @IsBoolean({ message: 'L\'acceptation des termes doit être un booléen' })
  @Type(() => Boolean)
  terms_accepted: boolean;
}