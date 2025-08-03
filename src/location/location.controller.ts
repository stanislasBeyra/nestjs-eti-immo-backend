import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location, LocationStatut } from './entities/location.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserCategorie } from '../users/entities/user.entity';

@ApiTags('Locations')
@Controller('location')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @Roles(UserCategorie.ADMIN, UserCategorie.AGENT)
  @ApiOperation({ summary: 'Créer une nouvelle location' })
  @ApiResponse({ 
    status: 201, 
    description: 'Location créée avec succès',
    type: Location 
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Bien ou locataire non trouvé' })
  @ApiResponse({ status: 409, description: 'Bien déjà loué' })
  async create(
    @Body() createLocationDto: CreateLocationDto,
    @Request() req
  ): Promise<Location> {
    return await this.locationService.create(createLocationDto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les locations avec filtres et pagination' })
  @ApiQuery({ name: 'bien_id', required: false, type: Number })
  @ApiQuery({ name: 'locataire_id', required: false, type: Number })
  @ApiQuery({ name: 'statut', required: false, enum: LocationStatut })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des locations récupérée avec succès',
    schema: {
      type: 'object',
      properties: {
        locations: {
          type: 'array',
          items: { $ref: '#/components/schemas/Location' }
        },
        total: { type: 'number' }
      }
    }
  })
  async findAll(
    @Request() req,
    @Query('bien_id') bien_id?: number,
    @Query('locataire_id') locataire_id?: number,
    @Query('statut') statut?: LocationStatut,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return await this.locationService.findAll({
      bien_id,
      locataire_id,
      statut,
      page,
      limit
    }, req.user?.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des locations' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        actives: { type: 'number' },
        terminees: { type: 'number' },
        resiliees: { type: 'number' },
        enAttente: { type: 'number' }
      }
    }
  })
  async getStats(@Request() req) {
    return await this.locationService.getLocationStats(req.user?.id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer toutes les locations actives' })
  @ApiResponse({ 
    status: 200, 
    description: 'Locations actives récupérées avec succès',
    type: [Location]
  })
  async getActiveLocations(@Request() req) {
    return await this.locationService.getActiveLocations(req.user?.id);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Récupérer les locations qui expirent bientôt' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  @ApiResponse({ 
    status: 200, 
    description: 'Locations expirantes récupérées avec succès',
    type: [Location]
  })
  async getExpiringLocations(@Request() req, @Query('days') days?: number) {
    return await this.locationService.getExpiringLocations(days, req.user?.id);
  }

  @Get('locataire/:locataireId')
  @ApiOperation({ summary: 'Récupérer les locations d\'un locataire' })
  @ApiParam({ name: 'locataireId', type: Number })
  @ApiQuery({ name: 'statut', required: false, enum: LocationStatut })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Locations du locataire récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        locations: {
          type: 'array',
          items: { $ref: '#/components/schemas/Location' }
        },
        total: { type: 'number' }
      }
    }
  })
  async findByLocataire(
    @Param('locataireId', ParseIntPipe) locataireId: number,
    @Request() req,
    @Query('statut') statut?: LocationStatut,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return await this.locationService.findByLocataire(locataireId, { statut, page, limit });
  }

  @Get('bien/:bienId')
  @ApiOperation({ summary: 'Récupérer l\'historique des locations d\'un bien' })
  @ApiParam({ name: 'bienId', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Historique des locations du bien récupéré avec succès',
    type: [Location]
  })
  async findByBien(@Param('bienId', ParseIntPipe) bienId: number) {
    return await this.locationService.findByBien(bienId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une location par son ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Location récupérée avec succès',
    type: Location 
  })
  @ApiResponse({ status: 404, description: 'Location non trouvée' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<Location> {
    return await this.locationService.findOne(id, req.user?.id);
  }

  @Patch(':id')
  @Roles(UserCategorie.ADMIN, UserCategorie.AGENT)
  @ApiOperation({ summary: 'Mettre à jour une location' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Location mise à jour avec succès',
    type: Location 
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Location non trouvée' })
  @ApiResponse({ status: 409, description: 'Bien déjà loué par une autre location' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto,
    @Request() req
  ): Promise<Location> {
    return await this.locationService.update(id, updateLocationDto, req.user?.id);
  }

  @Patch(':id/status')
  @Roles(UserCategorie.ADMIN, UserCategorie.AGENT)
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une location' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut de la location mis à jour avec succès',
    type: Location 
  })
  @ApiResponse({ status: 404, description: 'Location non trouvée' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('statut') statut: LocationStatut,
    @Request() req
  ): Promise<Location> {
    return await this.locationService.updateStatus(id, statut, req.user?.id);
  }

  @Delete(':id')
  @Roles(UserCategorie.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une location' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Location supprimée avec succès' })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer - paiements associés' })
  @ApiResponse({ status: 404, description: 'Location non trouvée' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    return await this.locationService.remove(id, req.user?.id);
  }
}
