import { IsString, IsEmail, MinLength, IsEnum, IsOptional, IsNumberString, IsObject, ValidateNested } from 'class-validator';
import { UserCategorie, UserStatus } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SocialNetworksDto {
  @ApiProperty({ description: 'Lien Facebook', required: false })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiProperty({ description: 'Lien Twitter', required: false })
  @IsString()
  @IsOptional()
  twitter?: string;

  @ApiProperty({ description: 'Lien LinkedIn', required: false })
  @IsString()
  @IsOptional()
  linkedin?: string;

  @ApiProperty({ description: 'Lien Instagram', required: false })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiProperty({ description: 'Lien YouTube', required: false })
  @IsString()
  @IsOptional()
  youtube?: string;

  @ApiProperty({ description: 'Site web personnel', required: false })
  @IsString()
  @IsOptional()
  website?: string;
}

export class CreateUserDto {
  @ApiProperty({ description: 'Nom complet de l\'utilisateur', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;
  
  @ApiProperty({ description: 'Email de l\'utilisateur' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mot de passe', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Numéro de téléphone', minLength: 8 })
  @IsString()
  @MinLength(8)
  phone: string;

  @ApiProperty({ description: 'Catégorie de l\'utilisateur', enum: UserCategorie, default: UserCategorie.ADMIN })
  @IsEnum(UserCategorie)
  @IsOptional()
  categorie: UserCategorie = UserCategorie.ADMIN;

  @ApiProperty({ description: 'ID de l\'agence', required: false })
  @IsNumberString()
  @IsOptional()
  agence_id?: string;

  @ApiProperty({ description: 'Réseaux sociaux', type: SocialNetworksDto, required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => SocialNetworksDto)
  @IsOptional()
  social_networks?: SocialNetworksDto;

  @ApiProperty({ 
    description: 'Statut de l\'utilisateur', 
    enum: UserStatus,
    default: UserStatus.ACTIVE 
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus = UserStatus.ACTIVE;
}
