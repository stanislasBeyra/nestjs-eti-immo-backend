import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LocataireLoginDto {
  @ApiProperty({ 
    description: 'Numéro de téléphone du locataire', 
    example: '0123456789',
    pattern: '^[0-9]{10}$'
  })
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Le numéro de téléphone doit contenir 10 chiffres'
  })
  mobile: string;

  @ApiProperty({ 
    description: 'Mot de passe', 
    minLength: 6, 
    example: 'password123' 
  })
  @IsString()
  @MinLength(6)
  password: string;
} 