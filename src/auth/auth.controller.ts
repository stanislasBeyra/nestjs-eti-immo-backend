import { Controller, Post, Body, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocataireLoginDto } from './dto/locataire-login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion administrateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie',
    schema: {
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Admin System' },
            email: { type: 'string', example: 'admin@example.com' },
            categorie: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  @ApiResponse({ status: 401, description: 'Accès non autorisé. Seuls les administrateurs peuvent se connecter.' })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Erreur lors de la connexion');
    }
  }

  @Post('locataire/login')
  @ApiOperation({ summary: 'Connexion locataire' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Connexion réussie',
    schema: {
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        locataire: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            firstname: { type: 'string', example: 'Jean' },
            lastname: { type: 'string', example: 'Dupont' },
            mobile: { type: 'string', example: '0123456789' },
            email: { type: 'string', example: 'jean.dupont@example.com' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Numéro de téléphone ou mot de passe incorrect' })
  async loginLocataire(@Body() locataireLoginDto: LocataireLoginDto) {
    try {
      return await this.authService.loginLocataire(locataireLoginDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Erreur lors de la connexion');
    }
  }
}
