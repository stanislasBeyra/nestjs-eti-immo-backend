import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LocataireService } from './locataire.service';
import { CreateLocataireDto } from './dto/create-locataire.dto';
import { UpdateLocataireDto } from './dto/update-locataire.dto';
import { LocataireLoginDto } from './dto/locataire-login.dto';
import { Locataire } from './entities/locataire.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('locataires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('locataires')
export class LocataireController {
  constructor(private readonly locataireService: LocataireService) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion locataire' })
  @ApiBody({ type: LocataireLoginDto })
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
  async login(@Body() locataireLoginDto: LocataireLoginDto) {
    return await this.locataireService.login(locataireLoginDto);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau locataire' })
  @ApiBody({ type: CreateLocataireDto, description: 'Données du locataire à créer' })
  @ApiResponse({ 
    status: 201, 
    description: 'Le locataire a été créé avec succès',
    type: Locataire 
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() createLocataireDto: CreateLocataireDto): Promise<Locataire> {
    return this.locataireService.create(createLocataireDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les locataires' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de tous les locataires',
    type: [Locataire]
  })
  findAll(): Promise<Locataire[]> {
    return this.locataireService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un locataire par son ID' })
  @ApiParam({ name: 'id', description: 'ID du locataire' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le locataire a été trouvé',
    type: Locataire 
  })
  @ApiResponse({ status: 404, description: 'Locataire non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Locataire> {
    return this.locataireService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un locataire' })
  @ApiParam({ name: 'id', description: 'ID du locataire à mettre à jour' })
  @ApiBody({ type: UpdateLocataireDto, description: 'Données à mettre à jour' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le locataire a été mis à jour avec succès',
    type: Locataire 
  })
  @ApiResponse({ status: 404, description: 'Locataire non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocataireDto: UpdateLocataireDto,
  ): Promise<Locataire> {
    return this.locataireService.update(id, updateLocataireDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un locataire' })
  @ApiParam({ name: 'id', description: 'ID du locataire à supprimer' })
  @ApiResponse({ status: 200, description: 'Le locataire a été supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Locataire non trouvé' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.locataireService.remove(id);
  }
}
