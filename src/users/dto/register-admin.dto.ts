import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminDto {
  @ApiProperty({ description: 'Nom complet de l\'administrateur', minLength: 2, example: 'Admin System' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Email de l\'administrateur', example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mot de passe', minLength: 6, example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Numéro de téléphone', minLength: 8, example: '0123456789' })
  @IsString()
  @MinLength(8)
  phone: string;
} 