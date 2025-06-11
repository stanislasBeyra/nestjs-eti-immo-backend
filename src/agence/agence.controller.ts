import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, UseGuards, BadRequestException, UseInterceptors, HttpException } from '@nestjs/common';
import { AgenceService } from './agence.service';
import { CreateAgenceDto } from './dto/create-agence.dto';
import { UpdateAgenceDto } from './dto/update-agence.dto';
import { UpdateAgenceStatusDto } from './dto/update-agence-status.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Logger } from '@nestjs/common';

@ApiTags('Agences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agences')
export class AgenceController {
  private readonly logger = new Logger(AgenceController.name);

  constructor(private readonly agenceService: AgenceService) {}

  @Post('create-agences')
  @ApiOperation({ summary: 'Créer une nouvelle agence immobilière' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'L\'agence a été créée avec succès',
    type: CreateAgenceDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Données invalides fournies' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Utilisateur non authentifié' 
  })
  async create(
    @Body() createAgenceDto: CreateAgenceDto, 
    @GetCurrentUser() currentUser: CurrentUser
  ) {
    try {
      this.logger.debug('Tentative de création d\'agence avec les données:', createAgenceDto);
      this.logger.debug('Admin connecté:', currentUser);

      if (!currentUser || !currentUser.id) {
        throw new BadRequestException({
          message: 'Utilisateur non authentifié',
          details: 'L\'ID de l\'utilisateur est manquant'
        });
      }

      const result = await this.agenceService.create(createAgenceDto, currentUser.id);
      this.logger.debug('Agence créée avec succès:', result);
      return result;
    } catch (error) {
      this.logger.error('Erreur lors de la création de l\'agence:', error);

      if (error instanceof HttpException) {
        // Si c'est déjà une HttpException, on la renvoie telle quelle
        throw error;
      }

      // Pour les autres types d'erreurs, on crée une BadRequestException avec les détails
      throw new BadRequestException({
        message: 'Erreur lors de la création de l\'agence',
        details: error.message || 'Une erreur inattendue s\'est produite',
        error: error.name || 'UnknownError',
        timestamp: new Date().toISOString()
      });
    }
  }

  @Get('liste-agences')
  @ApiOperation({ summary: 'Récupérer toutes les agences' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Liste de toutes les agences récupérée avec succès',
    type: [CreateAgenceDto]
  })
  findAll() {
    return this.agenceService.findAll();
  }

  @Get('get-auth-user-agencies')
  @ApiOperation({ summary: 'Récupérer les agences de l\'utilisateur connecté' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Liste des agences de l\'utilisateur récupérée avec succès',
    type: [CreateAgenceDto]
  })
  findMyAgencies(@GetCurrentUser() currentUser: CurrentUser) {
    return this.agenceService.findByAdminId(currentUser.id);
  }

  @Get('getagencesbyid/:id')
  @ApiOperation({ summary: 'Récupérer une agence par son ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de l\'agence à récupérer',
    type: 'number'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Agence trouvée avec succès',
    type: CreateAgenceDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Agence non trouvée' 
  })
  getAgenceById(@Param('id') id: string) {
    return this.agenceService.findOne(+id);
  }

  // mise a jour du status de l'agence
  @Post('update/agence/status/byid/:id')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une agence' })
  @ApiParam({
    name: 'id',
    description: 'ID de l\'agence à mettre à jour',
    type: 'number'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Statut de l\'agence mis à jour avec succès'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Agence non trouvée' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Données invalides fournies' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Vous n\'avez pas le droit de modifier cette agence' 
  })
  async updateAgenceStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAgenceStatusDto,
    @GetCurrentUser() currentUser: CurrentUser
  ) {
    try {
      // Vérifier que l'utilisateur peut modifier cette agence
      const agence = await this.agenceService.findOne(+id);
      if (agence.admin_id !== currentUser.id) {
        throw new BadRequestException('Vous n\'avez pas le droit de modifier cette agence');
      }

      return await this.agenceService.updateagencestatus(+id, updateStatusDto.status);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Erreur lors de la mise à jour du statut',
        details: error.message
      });
    }
  }

  @Patch('updateagencebyid/:id')
  @ApiOperation({ summary: 'Mettre à jour une agence par son ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de l\'agence à mettre à jour',
    type: 'number'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Agence mise à jour avec succès',
    type: UpdateAgenceDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Agence non trouvée' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Données invalides fournies' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Vous n\'avez pas le droit de modifier cette agence' 
  })
  async updateAgenceById(
    @Param('id') id: string, 
    @Body() updateAgenceDto: UpdateAgenceDto,
    @GetCurrentUser() currentUser: CurrentUser
  ) {
    // Vérifier que l'utilisateur peut modifier cette agence
    const agence = await this.agenceService.findOne(+id);
    if (agence.admin_id !== currentUser.id) {
      throw new BadRequestException('Vous n\'avez pas le droit de modifier cette agence');
    }
    
    return this.agenceService.update(+id, updateAgenceDto);
  }

  @Delete('deleteagencebyid/:id')
  @ApiOperation({ summary: 'Supprimer une agence par son ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de l\'agence à supprimer',
    type: 'number'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Agence supprimée avec succès' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Agence non trouvée' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Vous n\'avez pas le droit de supprimer cette agence' 
  })
  async deleteAgenceById(
    @Param('id') id: string,
    @GetCurrentUser() currentUser: CurrentUser
  ) {
    // Vérifier que l'utilisateur peut supprimer cette agence
    const agence = await this.agenceService.findOne(+id);
    if (agence.admin_id !== currentUser.id) {
      throw new BadRequestException('Vous n\'avez pas le droit de supprimer cette agence');
    }
    
    return this.agenceService.remove(+id);
  }
}