import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, ParseIntPipe, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { TerrainService } from './terrain.service';
import { CreateTerrainDto } from './dto/create-terrain.dto';
import { UpdateTerrainDto } from './dto/update-terrain.dto';
import { CreateTerrainFormDto } from './dto/create-terrain-form.dto';
import { Terrain, TerrainStatus, TerrainType } from './entities/terrain.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AgenceService } from '../agence/agence.service';
import { MultipartDataCleanerInterceptor } from '../common/interceptors/multipart-data-cleaner.interceptor';
import { CleanedTerrainFormData } from './interfaces/cleaned-terrain-form.interface';

@ApiTags('terrains')
@ApiBearerAuth('JWT-auth')
@Controller('terrains')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TerrainController {
  constructor(
    private readonly terrainService: TerrainService,
    private readonly agenceService: AgenceService
  ) {}

  // @Post('upload-image')
  // @Roles(1, 2) // Admin et Agent
  // @UseInterceptors(FileInterceptor('image'))
  // @ApiConsumes('multipart/form-data')
  // @ApiOperation({ summary: 'Uploader une image pour un terrain' })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Image uploadée avec succès',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       success: { type: 'boolean' },
  //       message: { type: 'string' },
  //       data: {
  //         type: 'object',
  //         properties: {
  //           filename: { type: 'string' },
  //           path: { type: 'string' },
  //           size: { type: 'number' }
  //         }
  //       }
  //     }
  //   }
  // })
  // @ApiResponse({ status: 400, description: 'Fichier non valide' })
  // async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<any> {
  //   try {
  //     if (!file) {
  //       return {
  //         success: false,
  //         message: 'Aucun fichier fourni',
  //         error: 'Le champ image est requis'
  //       };
  //     }

  //     const imagePath = `/uploads/terrain/${file.filename}`;
      
  //     return {
  //       success: true,
  //       message: 'Image uploadée avec succès',
  //       data: {
  //         filename: file.filename,
  //         path: imagePath,
  //         size: file.size,
  //         mimetype: file.mimetype
  //       }
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Erreur lors de l\'upload',
  //       error: error.message || error
  //     };
  //   }
  // }

  // @Post('upload-images')
  // @Roles(1, 2) // Admin et Agent
  // @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  // @ApiConsumes('multipart/form-data')
  // @ApiOperation({ summary: 'Uploader plusieurs images pour un terrain' })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Images uploadées avec succès',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       success: { type: 'boolean' },
  //       message: { type: 'string' },
  //       data: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             filename: { type: 'string' },
  //             path: { type: 'string' },
  //             size: { type: 'number' }
  //           }
  //         }
  //       }
  //     }
  //   }
  // })
  // @ApiResponse({ status: 400, description: 'Fichiers non valides' })
  // async uploadImages(@UploadedFiles() files: Express.Multer.File[]): Promise<any> {
  //   try {
  //     if (!files || files.length === 0) {
  //       return {
  //         success: false,
  //         message: 'Aucun fichier fourni',
  //         error: 'Le champ images est requis'
  //       };
  //     }

  //     const uploadedImages = files.map(file => ({
  //       filename: file.filename,
  //       path: `/uploads/terrain/${file.filename}`,
  //       size: file.size,
  //       mimetype: file.mimetype
  //     }));

  //     return {
  //       success: true,
  //       message: `${files.length} image(s) uploadée(s) avec succès`,
  //       data: uploadedImages
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Erreur lors de l\'upload',
  //       error: error.message || error
  //     };
  //   }
  // }

  @Post()
  @Roles(1, 2) // Admin et Agent
  @UseInterceptors(MultipartDataCleanerInterceptor, FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Créer un terrain avec images',
    description: 'Crée un terrain avec toutes ses informations et images en une seule requête multipart/form-data. L\'agence_id est automatiquement récupéré depuis l\'agence de l\'utilisateur connecté.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Terrain créé avec succès',
    type: Terrain,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Terrain créé avec succès' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            agence_id: { type: 'number' },
            title: { type: 'string' },
            prix_vente: { type: 'string' },
            superficie: { type: 'string' },
            main_image: { type: 'string', example: '/uploads/terrain/terrain-123456789.jpg' },
            other_images: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['/uploads/terrain/terrain-123456790.jpg', '/uploads/terrain/terrain-123456791.jpg']
            },
            images_uploaded: { type: 'number', example: 3 },
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données invalides',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Une erreur est survenue' },
        error: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Utilisateur non associé à une agence valide',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: "Vous n'avez pas la permission de créer un terrain" },
        error: { type: 'string', example: "L'utilisateur connecté n'est pas associé à une agence valide" }
      }
    }
  })
  async create(
    @Body() terrainData: CleanedTerrainFormData,
    @UploadedFiles() images: Express.Multer.File[],
    @Request() req: any
  ): Promise<any> {
    try {
      const agence = await this.agenceService.findByEmail(req.user.email);
      if (!agence) {
        return {
          success: false,
          message: "Vous n'avez pas la permission de créer un terrain",
          error: 'L\'utilisateur connecté n\'est pas associé à une agence valide'
        };
      }

      // Traitement des images uploadées
      let mainImagePath: string | undefined;
      let otherImagesPath: string[] = [];

      if (images && images.length > 0) {
        // La première image devient l'image principale
        mainImagePath = `/uploads/terrain/${images[0].filename}`;
        
        // Les autres images deviennent les images secondaires
        if (images.length > 1) {
          otherImagesPath = images.slice(1).map(img => `/uploads/terrain/${img.filename}`);
        }
      }

      // Préparation des données du terrain - l'intercepteur a déjà nettoyé les données
      const createTerrainDto: CreateTerrainDto = {
        // Champs obligatoires
        title: terrainData.title,
        address: terrainData.address,
        localite: terrainData.localite,
        prix_vente: terrainData.prix_vente,
        superficie: terrainData.superficie,
        type: terrainData.type,
        
        // Champs optionnels - directement assignés car déjà nettoyés par l'intercepteur
        description: terrainData.description,
        commune: terrainData.commune,
        prix_m2: terrainData.prix_m2,
        superficie_constructible: terrainData.superficie_constructible,
        zone: terrainData.zone,
        status: terrainData.status,
        constructible: terrainData.constructible,
        viabilise: terrainData.viabilise,
        acces_route: terrainData.acces_route,
        commission_negociable: terrainData.commission_negociable,
        titre_foncier: terrainData.titre_foncier,
        reference_cadastrale: terrainData.reference_cadastrale,
        reference: terrainData.reference,
        servitudes: terrainData.servitudes,
        latitude: terrainData.latitude,
        longitude: terrainData.longitude,
        coordonnees_gps: terrainData.coordonnees_gps,
        frais_agence: terrainData.frais_agence,
        proprietaire_id: terrainData.proprietaire_id,
        date_mise_vente: terrainData.date_mise_vente,
        equipements: terrainData.equipements,
        documents: terrainData.documents,
        notes_internes: terrainData.notes_internes,

        // Images
        main_image: mainImagePath,
        other_images: otherImagesPath.length > 0 ? otherImagesPath : undefined,
      };

      const terrain = await this.terrainService.create(createTerrainDto, agence.id);
      
      return {
        success: true,
        message: 'Terrain créé avec succès',
        data: {
          ...terrain,
          images_uploaded: images ? images.length : 0,
          main_image: mainImagePath,
          other_images: otherImagesPath
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get()
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ 
    summary: 'Récupérer et rechercher les terrains de l\'agence connectée',
    description: 'Endpoint unifié pour récupérer et rechercher les terrains avec tous les filtres disponibles.'
  })
  @ApiQuery({ name: 'status', required: false, enum: TerrainStatus, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'type', required: false, enum: TerrainType, description: 'Filtrer par type' })
  @ApiQuery({ name: 'constructible', required: false, type: Boolean, description: 'Filtrer par terrains constructibles' })
  @ApiQuery({ name: 'search', required: false, description: 'Terme de recherche (titre, localité, adresse, référence)' })
  @ApiQuery({ name: 'min_price', required: false, type: Number, description: 'Prix minimum' })
  @ApiQuery({ name: 'max_price', required: false, type: Number, description: 'Prix maximum' })
  @ApiQuery({ name: 'min_superficie', required: false, type: Number, description: 'Superficie minimum en m²' })
  @ApiQuery({ name: 'max_superficie', required: false, type: Number, description: 'Superficie maximum en m²' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des terrains récupérée avec succès',
    type: [Terrain]
  })
  @ApiResponse({ status: 403, description: 'Utilisateur non associé à une agence valide' })
  async findAll(
    @Query('status') status?: TerrainStatus,
    @Query('type') type?: TerrainType,
    @Query('constructible') constructible?: string,
    @Query('search') searchTerm?: string,
    @Query('min_price') minPrice?: string,
    @Query('max_price') maxPrice?: string,
    @Query('min_superficie') minSuperficie?: string,
    @Query('max_superficie') maxSuperficie?: string,
    @Request() req?: any
  ): Promise<any> {
    try {
      const agence = await this.agenceService.findByEmail(req.user.email);
      if (!agence) {
        return {
          success: false,
          message: "Accès refusé",
          error: 'L\'utilisateur connecté n\'est pas associé à une agence valide'
        };
      }

      const options = {
        status,
        type,
        constructible: constructible === 'true' ? true : constructible === 'false' ? false : undefined,
        searchTerm,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        minSuperficie: minSuperficie ? parseFloat(minSuperficie) : undefined,
        maxSuperficie: maxSuperficie ? parseFloat(maxSuperficie) : undefined,
      };

      // Utiliser la fonction unifiée
      const terrains = await this.terrainService.findByAgenceWithFilters(agence.id, options);

      return {
        success: true,
        message: 'Terrains récupérés avec succès',
        data: terrains
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('agence/:agenceId')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Récupérer les terrains d\'une agence spécifique' })
  @ApiParam({ name: 'agenceId', description: 'ID de l\'agence' })
  @ApiResponse({ 
    status: 200, 
    description: 'Terrains de l\'agence récupérés avec succès',
    type: [Terrain]
  })
  async findByAgence(@Param('agenceId', ParseIntPipe) agenceId: number): Promise<any> {
    try {
      const terrains = await this.terrainService.findByAgence(agenceId);
      return {
        success: true,
        message: 'Terrains de l\'agence récupérés avec succès',
        data: terrains
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('constructibles')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Récupérer tous les terrains constructibles disponibles' })
  @ApiResponse({ 
    status: 200, 
    description: 'Terrains constructibles récupérés avec succès',
    type: [Terrain]
  })
  async findConstructibles(): Promise<any> {
    try {
      const terrains = await this.terrainService.findConstructibles();
      return {
        success: true,
        message: 'Terrains constructibles récupérés avec succès',
        data: terrains
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }


  @Get('stats/:agenceId')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Obtenir les statistiques des terrains d\'une agence' })
  @ApiParam({ name: 'agenceId', description: 'ID de l\'agence' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        total_terrains: { type: 'number' },
        terrains_disponibles: { type: 'number' },
        terrains_vendus: { type: 'number' },
        terrains_reserves: { type: 'number' },
        valeur_stock_disponible: { type: 'number' },
        taux_vente: { type: 'number' }
      }
    }
  })
  async getStats(@Param('agenceId', ParseIntPipe) agenceId: number): Promise<any> {
    try {
      const stats = await this.terrainService.getStatsByAgence(agenceId);
      return {
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get(':id')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Récupérer un terrain par ID' })
  @ApiParam({ name: 'id', description: 'ID du terrain' })
  @ApiResponse({ 
    status: 200, 
    description: 'Terrain récupéré avec succès',
    type: Terrain
  })
  @ApiResponse({ status: 404, description: 'Terrain non trouvé' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    try {
      const terrain = await this.terrainService.findOne(id);
      return {
        success: true,
        message: 'Terrain récupéré avec succès',
        data: terrain
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Patch(':id')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Mettre à jour un terrain' })
  @ApiParam({ name: 'id', description: 'ID du terrain' })
  @ApiResponse({ 
    status: 200, 
    description: 'Terrain mis à jour avec succès',
    type: Terrain
  })
  @ApiResponse({ status: 404, description: 'Terrain non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTerrainDto: UpdateTerrainDto
  ): Promise<any> {
    try {
      const terrain = await this.terrainService.update(id, updateTerrainDto);
      return {
        success: true,
        message: 'Terrain mis à jour avec succès',
        data: terrain
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Patch(':id/status')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un terrain' })
  @ApiParam({ name: 'id', description: 'ID du terrain' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut mis à jour avec succès',
    type: Terrain
  })
  @ApiResponse({ status: 404, description: 'Terrain non trouvé' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TerrainStatus
  ): Promise<any> {
    try {
      const terrain = await this.terrainService.updateStatus(id, status);
      return {
        success: true,
        message: 'Statut du terrain mis à jour avec succès',
        data: terrain
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Delete(':id')
  @Roles(1) // Admin seulement
  @ApiOperation({ summary: 'Supprimer un terrain (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID du terrain' })
  @ApiResponse({ status: 200, description: 'Terrain supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Terrain non trouvé' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    try {
      await this.terrainService.remove(id);
      return {
        success: true,
        message: 'Terrain supprimé avec succès',
        data: null
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }
}