import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ProprietairesService } from './proprietaires.service';
import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';
import { Proprietaire } from './entities/proprietaire.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserCategorie } from '../users/entities/user.entity';
import { GetCurrentUser, CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('proprietaires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserCategorie.AGENT)
@Controller('proprietaires')
export class ProprietairesController {
  constructor(private readonly proprietairesService: ProprietairesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau propriétaire' })
  @ApiBody({ type: CreateProprietaireDto, description: 'Données du propriétaire à créer' })
  @ApiResponse({ 
    status: 201, 
    description: 'Le propriétaire a été créé avec succès',
    type: Proprietaire 
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Seuls les agents peuvent accéder' })
  @ApiResponse({ status: 404, description: 'Agence non trouvée pour l\'utilisateur connecté' })
  create(
    @Body() createProprietaireDto: CreateProprietaireDto,
    @GetCurrentUser() currentUser: CurrentUser
  ): Promise<Proprietaire> {
    return this.proprietairesService.create(createProprietaireDto, currentUser.id);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les propriétaires' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de tous les propriétaires',
    type: [Proprietaire]
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Seuls les agents peuvent accéder' })
  findAll(@GetCurrentUser() currentUser: CurrentUser): Promise<Proprietaire[]> {
    return this.proprietairesService.findAll(currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un propriétaire par son ID' })
  @ApiParam({ name: 'id', description: 'ID du propriétaire' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le propriétaire a été trouvé',
    type: Proprietaire 
  })
  @ApiResponse({ status: 404, description: 'Propriétaire non trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Seuls les agents peuvent accéder' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() currentUser: CurrentUser
  ): Promise<Proprietaire> {
    return this.proprietairesService.findOne(id, currentUser.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un propriétaire' })
  @ApiParam({ name: 'id', description: 'ID du propriétaire à mettre à jour' })
  @ApiBody({ type: UpdateProprietaireDto, description: 'Données à mettre à jour' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le propriétaire a été mis à jour avec succès',
    type: Proprietaire 
  })
  @ApiResponse({ status: 404, description: 'Propriétaire non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Seuls les agents peuvent accéder' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProprietaireDto: UpdateProprietaireDto,
    @GetCurrentUser() currentUser: CurrentUser
  ): Promise<Proprietaire> {
    return this.proprietairesService.update(id, updateProprietaireDto, currentUser.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un propriétaire' })
  @ApiParam({ name: 'id', description: 'ID du propriétaire à supprimer' })
  @ApiResponse({ status: 200, description: 'Le propriétaire a été supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Propriétaire non trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Seuls les agents peuvent accéder' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() currentUser: CurrentUser
  ): Promise<void> {
    return this.proprietairesService.remove(id, currentUser.id);
  }
}
