import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TerrainService } from './terrain.service';
import { CreateTerrainDto } from './dto/create-terrain.dto';
import { UpdateTerrainDto } from './dto/update-terrain.dto';
import { Terrain, TerrainStatus, TerrainType } from './entities/terrain.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AgenceService } from '../agence/agence.service';

@ApiTags('terrains')
@ApiBearerAuth('JWT-auth')
@Controller('terrains')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TerrainController {
  constructor(
    private readonly terrainService: TerrainService,
    private readonly agenceService: AgenceService
  ) {}

  @Post()
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ 
    summary: 'Mettre un terrain en vente',
    description: 'L\'agence_id est automatiquement récupéré depuis l\'agence de l\'utilisateur connecté.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Terrain mis en vente avec succès',
    type: Terrain
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Utilisateur non associé à une agence valide' })
  async create(@Body() createTerrainDto: CreateTerrainDto, @Request() req): Promise<any> {
    try {
      const agence = await this.agenceService.findByEmail(req.user.email);
      if (!agence) {
        return {
          success: false,
          message: "Vous n'avez pas la permission de mettre un terrain en vente",
          error: 'L\'utilisateur connecté n\'est pas associé à une agence valide'
        };
      }

      const terrain = await this.terrainService.create(createTerrainDto, agence.id);
      return {
        success: true,
        message: 'Terrain mis en vente avec succès',
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

  @Get()
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ 
    summary: 'Récupérer tous les terrains de l\'agence connectée',
    description: 'Récupère uniquement les terrains appartenant à l\'agence de l\'utilisateur connecté.'
  })
  @ApiQuery({ name: 'status', required: false, enum: TerrainStatus, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'type', required: false, enum: TerrainType, description: 'Filtrer par type' })
  @ApiQuery({ name: 'constructible', required: false, type: Boolean, description: 'Filtrer par terrains constructibles' })
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

      let terrains: Terrain[];

      // Toujours filtrer par l'agence connectée
      if (status || type || constructible === 'true') {
        // Appliquer les filtres supplémentaires en combinaison avec l'agence
        terrains = await this.terrainService.findByAgenceWithFilters(
          agence.id, 
          status, 
          type, 
          constructible === 'true'
        );
      } else {
        // Récupérer tous les terrains de l'agence connectée
        terrains = await this.terrainService.findByAgence(agence.id);
      }

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

  @Get('search')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Rechercher des terrains' })
  @ApiQuery({ name: 'agence_id', required: true, description: 'ID de l\'agence' })
  @ApiQuery({ name: 'q', required: true, description: 'Terme de recherche' })
  @ApiResponse({ 
    status: 200, 
    description: 'Résultats de recherche récupérés avec succès',
    type: [Terrain]
  })
  async search(
    @Query('agence_id') agenceId: string,
    @Query('q') searchTerm: string
  ): Promise<any> {
    try {
      const terrains = await this.terrainService.searchTerrains(parseInt(agenceId), searchTerm);
      return {
        success: true,
        message: 'Résultats de recherche récupérés avec succès',
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

  @Get('price-range')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Rechercher des terrains par fourchette de prix' })
  @ApiQuery({ name: 'min_price', required: true, type: Number, description: 'Prix minimum' })
  @ApiQuery({ name: 'max_price', required: true, type: Number, description: 'Prix maximum' })
  @ApiResponse({ 
    status: 200, 
    description: 'Terrains dans la fourchette de prix récupérés avec succès',
    type: [Terrain]
  })
  async findByPriceRange(
    @Query('min_price') minPrice: string,
    @Query('max_price') maxPrice: string
  ): Promise<any> {
    try {
      const terrains = await this.terrainService.findByPriceRange(
        parseFloat(minPrice), 
        parseFloat(maxPrice)
      );
      return {
        success: true,
        message: 'Terrains dans la fourchette de prix récupérés avec succès',
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

  @Get('superficie-range')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Rechercher des terrains par fourchette de superficie' })
  @ApiQuery({ name: 'min_superficie', required: true, type: Number, description: 'Superficie minimum en m²' })
  @ApiQuery({ name: 'max_superficie', required: true, type: Number, description: 'Superficie maximum en m²' })
  @ApiResponse({ 
    status: 200, 
    description: 'Terrains dans la fourchette de superficie récupérés avec succès',
    type: [Terrain]
  })
  async findBySuperficieRange(
    @Query('min_superficie') minSuperficie: string,
    @Query('max_superficie') maxSuperficie: string
  ): Promise<any> {
    try {
      const terrains = await this.terrainService.findBySuperficieRange(
        parseFloat(minSuperficie), 
        parseFloat(maxSuperficie)
      );
      return {
        success: true,
        message: 'Terrains dans la fourchette de superficie récupérés avec succès',
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