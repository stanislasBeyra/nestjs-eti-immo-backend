import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DemarcheurService } from './demarcheur.service';
import { CreateDemarcheurDto } from './dto/create-demarcheur.dto';
import { UpdateDemarcheurDto } from './dto/update-demarcheur.dto';
import { Demarcheur, DemarcheurStatus } from './entities/demarcheur.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('demarcheurs')
@ApiBearerAuth('JWT-auth')
@Controller('demarcheurs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DemarcheurController {
  constructor(private readonly demarcheurService: DemarcheurService) {}

  @Post()
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Créer un nouveau démarcheur' })
  @ApiResponse({ 
    status: 201, 
    description: 'Démarcheur créé avec succès',
    type: Demarcheur
  })
  @ApiResponse({ status: 400, description: 'Données invalides ou démarcheur déjà existant' })
  async create(@Body() createDemarcheurDto: CreateDemarcheurDto): Promise<any> {
    try {
      const demarcheur = await this.demarcheurService.create(createDemarcheurDto);
      return {
        success: true,
        message: 'Démarcheur créé avec succès',
        data: demarcheur
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
  @ApiOperation({ summary: 'Récupérer tous les démarcheurs' })
  @ApiQuery({ name: 'agence_id', required: false, description: 'Filtrer par agence' })
  @ApiQuery({ name: 'status', required: false, enum: DemarcheurStatus, description: 'Filtrer par statut' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des démarcheurs récupérée avec succès',
    type: [Demarcheur]
  })
  async findAll(
    @Query('agence_id') agenceId?: string,
    @Query('status') status?: DemarcheurStatus
  ): Promise<any> {
    try {
      let demarcheurs: Demarcheur[];
      if (agenceId) {
        demarcheurs = await this.demarcheurService.findByAgence(parseInt(agenceId));
      } else if (status) {
        demarcheurs = await this.demarcheurService.findByStatus(status);
      } else {
        demarcheurs = await this.demarcheurService.findAll();
      }
      return {
        success: true,
        message: 'Démarcheurs récupérés avec succès',
        data: demarcheurs
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
  @ApiOperation({ summary: 'Récupérer les démarcheurs d\'une agence spécifique' })
  @ApiResponse({ 
    status: 200, 
    description: 'Démarcheurs de l\'agence récupérés avec succès',
    type: [Demarcheur]
  })
  async findByAgence(@Param('agenceId') agenceId: string): Promise<any> {
    try {
      const demarcheurs = await this.demarcheurService.findByAgence(parseInt(agenceId));
      return {
        success: true,
        message: 'Démarcheurs de l\'agence récupérés avec succès',
        data: demarcheurs
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('status/:status')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Récupérer les démarcheurs par statut' })
  @ApiResponse({ 
    status: 200, 
    description: 'Démarcheurs par statut récupérés avec succès',
    type: [Demarcheur]
  })
  async findByStatus(@Param('status') status: DemarcheurStatus): Promise<any> {
    try {
      const demarcheurs = await this.demarcheurService.findByStatus(status);
      return {
        success: true,
        message: 'Démarcheurs par statut récupérés avec succès',
        data: demarcheurs
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
  @ApiOperation({ summary: 'Rechercher des démarcheurs' })
  @ApiQuery({ name: 'agence_id', required: true, description: 'ID de l\'agence' })
  @ApiQuery({ name: 'q', required: true, description: 'Terme de recherche' })
  @ApiResponse({ 
    status: 200, 
    description: 'Résultats de recherche récupérés avec succès',
    type: [Demarcheur]
  })
  async search(
    @Query('agence_id') agenceId: string,
    @Query('q') searchTerm: string
  ): Promise<any> {
    try {
      const demarcheurs = await this.demarcheurService.searchDemarcheurs(parseInt(agenceId), searchTerm);
      return {
        success: true,
        message: 'Résultats de recherche récupérés avec succès',
        data: demarcheurs
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
  @ApiOperation({ summary: 'Obtenir les statistiques des démarcheurs d\'une agence' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        total_demarcheurs: { type: 'number' },
        demarcheurs_actifs: { type: 'number' },
        total_biens_demarches: { type: 'number' },
        total_commissions: { type: 'number' },
        total_transactions: { type: 'number' }
      }
    }
  })
  async getStats(@Param('agenceId') agenceId: string): Promise<any> {
    try {
      const stats = await this.demarcheurService.getStatsByAgence(parseInt(agenceId));
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

  @Get('top-performers/:agenceId')
  @Roles(1, 2) // Admin et Agent
  @ApiOperation({ summary: 'Obtenir les meilleurs démarcheurs d\'une agence' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre de démarcheurs à retourner', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Meilleurs démarcheurs récupérés avec succès',
    type: [Demarcheur]
  })
  async getTopPerformers(
    @Param('agenceId') agenceId: string,
    @Query('limit') limit?: string
  ): Promise<any> {
    try {
      const demarcheurs = await this.demarcheurService.getTopPerformers(parseInt(agenceId), limit ? parseInt(limit) : 5);
      return {
        success: true,
        message: 'Meilleurs démarcheurs récupérés avec succès',
        data: demarcheurs
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
  @ApiOperation({ summary: 'Récupérer un démarcheur par ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Démarcheur récupéré avec succès',
    type: Demarcheur
  })
  @ApiResponse({ status: 404, description: 'Démarcheur non trouvé' })
  async findOne(@Param('id') id: string): Promise<any> {
    try {
      const demarcheur = await this.demarcheurService.findOne(parseInt(id));
      return {
        success: true,
        message: 'Démarcheur récupéré avec succès',
        data: demarcheur
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
  @ApiOperation({ summary: 'Mettre à jour un démarcheur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Démarcheur mis à jour avec succès',
    type: Demarcheur
  })
  @ApiResponse({ status: 404, description: 'Démarcheur non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async update(
    @Param('id') id: string,
    @Body() updateDemarcheurDto: UpdateDemarcheurDto
  ): Promise<any> {
    try {
      const demarcheur = await this.demarcheurService.update(parseInt(id), updateDemarcheurDto);
      return {
        success: true,
        message: 'Démarcheur mis à jour avec succès',
        data: demarcheur
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
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un démarcheur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut mis à jour avec succès',
    type: Demarcheur
  })
  @ApiResponse({ status: 404, description: 'Démarcheur non trouvé' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: DemarcheurStatus
  ): Promise<any> {
    try {
      const demarcheur = await this.demarcheurService.updateStatus(parseInt(id), status);
      return {
        success: true,
        message: 'Statut du démarcheur mis à jour avec succès',
        data: demarcheur
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
  @ApiOperation({ summary: 'Supprimer un démarcheur (soft delete)' })
  @ApiResponse({ status: 200, description: 'Démarcheur supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Démarcheur non trouvé' })
  async remove(@Param('id') id: string): Promise<any> {
    try {
      await this.demarcheurService.remove(parseInt(id));
      return {
        success: true,
        message: 'Démarcheur supprimé avec succès',
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