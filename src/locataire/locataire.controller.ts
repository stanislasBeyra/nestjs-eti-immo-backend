import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LocataireService } from './locataire.service';
import { CreateLocataireDto } from './dto/create-locataire.dto';
import { UpdateLocataireDto } from './dto/update-locataire.dto';
import { LocataireLoginDto } from './dto/locataire-login.dto';
import { Locataire } from './entities/locataire.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserCategorie } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AgenceService } from '../agence/agence.service';
import { BiensService } from '../biens/biens.service';

@ApiTags('locataires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('locataires')
export class LocataireController {
  constructor(
    private readonly locataireService: LocataireService,
    private readonly agenceService: AgenceService,
    private readonly biensService: BiensService
  ) {}

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
  @ApiResponse({ status: 201, description: 'Le locataire a été créé avec succès', type: Locataire })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @Roles(UserCategorie.AGENT)
  async create(
    @Body() createLocataireDto: CreateLocataireDto,
    @GetCurrentUser() currentUser: any
  ): Promise<any> {
    try {
      // Vérifier que l'agence existe pour l'utilisateur connecté
      const agence = await this.agenceService.findByEmail(currentUser.email);
      if (!agence) {
        return {
          success: false,
          message: 'Aucune agence trouvée pour cet utilisateur',
        };
      }
      const locataire = await this.locataireService.create(createLocataireDto, currentUser.id);
      return {
        success: true,
        message: 'Locataire créé avec succès',
        data: locataire
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la création du locataire',
        error: error.message || error.toString(),
      };
    }
  }

  @Post('register')
  @ApiOperation({ summary: "Inscription d'un locataire (publique)" })
  @ApiBody({ type: CreateLocataireDto, description: 'Données du locataire à inscrire' })
  @ApiResponse({ status: 201, description: 'Le locataire a été inscrit avec succès', type: Locataire })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async register(@Body() createLocataireDto: CreateLocataireDto): Promise<any> {
    try {
      const locataire = await this.locataireService.createByLocataire(createLocataireDto);
      return {
        success: true,
        message: 'Compte locataire créé avec succès',
        data: locataire
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la création du compte locataire',
        error: error.message || error.toString(),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer les locataires de l\'agence connectée' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des locataires de l\'agence',
    type: [Locataire]
  })
  @Roles(UserCategorie.AGENT)
  async findAll(@GetCurrentUser() user: any): Promise<Locataire[]> {
    console.log('je suis ici:::')
    const agence = await this.agenceService.findByEmail(user.email);
    if (!agence) {
      throw new Error('Aucune agence trouvée pour cet utilisateur');
    }
    return this.locataireService.findAllByAgence(agence.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un locataire par son ID' })
  @ApiParam({ name: 'id', description: 'ID du locataire' })
  @ApiResponse({ status: 200, description: 'Le locataire a été trouvé', type: Locataire })
  @ApiResponse({ status: 404, description: 'Locataire non trouvé' })
  @ApiResponse({ status: 403, description: 'Non autorisé à voir ce locataire' })
  @Roles(UserCategorie.AGENT)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() user: any
  ): Promise<any> {
    try {
      const agence = await this.agenceService.findByEmail(user.email);
      if (!agence) {
        return {
          success: false,
          message: 'Aucune agence trouvée pour cet utilisateur',
        };
      }
      const locataire = await this.locataireService.findOne(id);
      if (locataire.agence_id !== agence.id) {
        return {
          success: false,
          message: 'Vous ne pouvez consulter que vos propres locataires',
        };
      }
      return {
        success: true,
        message: 'Locataire trouvé',
        data: locataire
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la récupération du locataire',
        error: error.message || error.toString(),
      };
    }
  }

  
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un locataire' })
  @ApiParam({ name: 'id', description: 'ID du locataire à mettre à jour' })
  @ApiBody({ type: UpdateLocataireDto, description: 'Données à mettre à jour' })
  @ApiResponse({ status: 200, description: 'Le locataire a été mis à jour avec succès', type: Locataire })
  @ApiResponse({ status: 404, description: 'Locataire non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Non autorisé à mettre à jour ce locataire' })
  @Roles(UserCategorie.AGENT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocataireDto: UpdateLocataireDto,
    @GetCurrentUser() user: any
  ): Promise<any> {
    try {
      const agence = await this.agenceService.findByEmail(user.email);
      if (!agence) {
        return {
          success: false,
          message: 'Aucune agence trouvée pour cet utilisateur',
        };
      }
      const locataire = await this.locataireService.findOne(id);
      if (locataire.agence_id !== agence.id) {
        return {
          success: false,
          message: 'Vous ne pouvez mettre à jour que vos propres locataires',
        };
      }
      const updated = await this.locataireService.update(id, updateLocataireDto);
      return {
        success: true,
        message: 'Locataire mis à jour avec succès',
        data: updated
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la mise à jour du locataire',
        error: error.message || error.toString(),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un locataire' })
  @ApiParam({ name: 'id', description: 'ID du locataire à supprimer' })
  @ApiResponse({ status: 200, description: 'Le locataire a été supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Locataire non trouvé' })
  @ApiResponse({ status: 403, description: 'Non autorisé à supprimer ce locataire' })
  @Roles(UserCategorie.AGENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() user: any
  ): Promise<any> {
    try {
      const agence = await this.agenceService.findByEmail(user.email);
      if (!agence) {
        return {
          success: false,
          message: 'Aucune agence trouvée pour cet utilisateur',
        };
      }
      const locataire = await this.locataireService.findOne(id);
      if (locataire.agence_id !== agence.id) {
        return {
          success: false,
          message: 'Vous ne pouvez supprimer que vos propres locataires',
        };
      }
      await this.locataireService.remove(id);
      return {
        success: true,
        message: 'Locataire supprimé avec succès',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la suppression du locataire',
        error: error.message || error.toString(),
      };
    }
  }


  /// pour l'application
  @Get('recuperer/tout/les/bien')
  @ApiOperation({ summary: "Route pour l'application : récupérer tous les biens pour les locataires" })
  @ApiResponse({ status: 200, description: 'Liste de tous les biens' })
  async getallbienforlocataire() {
    try {
      const biens = await this.biensService.getallbienforlocataire();
      return {
        success: true,
        message: 'biens recuperés',
        data: biens
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la récupération des biens',
        error: error.message || error.toString(),
      };
    }
  }

  /// Pour un locataire connecté : récupérer son profil
  @Get('/get/me')
  @ApiOperation({ summary: 'Récupérer les informations du locataire connecté' })
  @ApiResponse({ status: 200, description: 'Profil du locataire', type: Locataire })
  @ApiResponse({ status: 404, description: 'Locataire non trouvé' })
  async getMyProfile(@GetCurrentUser() user: any): Promise<any> {
    try {
      const locataire = await this.locataireService.findByEmail(user.email);
      if (!locataire) {
        return {
          success: false,
          message: 'Locataire non trouvé',
        };
      }
      return {
        success: true,
        message: 'Profil récupéré',
        data: locataire
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la récupération du profil',
        error: error.message || error.toString(),
      };
    }
  }

  /// Pour un locataire connecté : modifier ses informations
  @Patch('update/me')
  @ApiOperation({ summary: 'Mettre à jour les informations du locataire connecté' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour', type: Locataire })
  @ApiResponse({ status: 404, description: 'Locataire non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async updateMyProfile(
    @Body() updateLocataireDto: UpdateLocataireDto,
    @GetCurrentUser() user: any
  ): Promise<any> {
    try {
      const locataire = await this.locataireService.findByEmail(user.email);
      if (!locataire) {
        return {
          success: false,
          message: 'Locataire non trouvé',
        };
      }
      const updated = await this.locataireService.update(locataire.id, updateLocataireDto);
      return {
        success: true,
        message: 'Profil mis à jour',
        data: updated
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la mise à jour du profil',
        error: error.message || error.toString(),
      };
    }
  }

}
