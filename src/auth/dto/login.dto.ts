import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email de l\'utilisateur', example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mot de passe', minLength: 6, example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
} 