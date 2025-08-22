import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PaiementService } from './paiement.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';
import { Paiement, PaiementStatut } from './entities/paiement.entity';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UnpaidRentService } from './unpaid-rent.service';
import { UnpaidRentDto } from './dto/unpaid-rent.dto';

class DateRangeQuery {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

@ApiTags('paiements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('paiements')
export class PaiementController {
  constructor(
    private readonly paiementService: PaiementService,
    private readonly unpaidRentService: UnpaidRentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau paiement' })
  @ApiBody({ type: CreatePaiementDto, description: 'Données du paiement à créer' })
  @ApiResponse({ 
    status: 201, 
    description: 'Le paiement a été créé avec succès',
    type: Paiement 
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createPaiementDto: CreatePaiementDto) {
    try {
      const data = await this.paiementService.create(createPaiementDto);
      return {
        success: true,
        message: 'Paiement créé avec succès',
        data: data
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
  @ApiOperation({ summary: 'Récupérer tous les paiements' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de tous les paiements',
    type: [Paiement]
  })
  async findAll() {
    try {
      const data = await this.paiementService.findAll();
      return {
        success: true,
        message: 'Paiements récupérés avec succès',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('locataire/:locataireId')
  @ApiOperation({ summary: 'Récupérer les paiements d\'un locataire' })
  @ApiParam({ name: 'locataireId', description: 'ID du locataire' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des paiements du locataire',
    type: [Paiement]
  })
  async findByLocataire(@Param('locataireId', ParseIntPipe) locataireId: number) {
    try {
      const data = await this.paiementService.findByLocataire(locataireId);
      return {
        success: true,
        message: 'Paiements du locataire récupérés avec succès',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Récupérer les paiements d\'un bien' })
  @ApiParam({ name: 'propertyId', description: 'ID du bien' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des paiements du bien',
    type: [Paiement]
  })
  async findByProperty(@Param('propertyId', ParseIntPipe) propertyId: number) {
    try {
      const data = await this.paiementService.findByProperty(propertyId);
      return {
        success: true,
        message: 'Paiements du bien récupérés avec succès',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Récupérer les paiements par période' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des paiements de la période',
    type: [Paiement]
  })
  async findByDateRange(@Query() query: DateRangeQuery) {
    try {
      if (!query.startDate || !query.endDate) {
        throw new Error('Les dates de début et de fin sont requises');
      }
      const data = await this.paiementService.findByDateRange(query.startDate, query.endDate);
      return {
        success: true,
        message: 'Paiements de la période récupérés avec succès',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('statut/:statut')
  @ApiOperation({ summary: 'Récupérer les paiements par statut' })
  @ApiParam({ name: 'statut', enum: PaiementStatut, description: 'Statut des paiements' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des paiements du statut spécifié',
    type: [Paiement]
  })
  async findByStatut(@Param('statut') statut: PaiementStatut) {
    try {
      const data = await this.paiementService.findByStatut(statut);
      return {
        success: true,
        message: 'Paiements par statut récupérés avec succès',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('impayes')
  @ApiOperation({ summary: 'Récupérer tous les paiements impayés' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des paiements impayés',
    type: [Paiement]
  })
  async getPaiementsImpayes() {
    try {
      const data = await this.paiementService.getPaiementsImpayes();
      return {
        success: true,
        message: 'Paiements impayés récupérés avec succès',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('loyers-impayes')
  @ApiOperation({ summary: 'Récupérer la liste des loyers impayés' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des loyers impayés récupérée avec succès',
    type: [UnpaidRentDto]
  })
  async getUnpaidRents() {
    try {
      const data = await this.unpaidRentService.getUnpaidRentsList();
      return {
        success: true,
        message: 'Loyers impayés récupérés avec succès',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('locataire/unpaid/:id')
  @ApiOperation({ summary: 'Récupérer les loyers impayés d\'un locataire' })
  @ApiParam({ name: 'id', description: 'ID du locataire' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des loyers impayés du locataire',
  })
  async getUnpaidRentsByLocataireId(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.unpaidRentService.getUnpaidRentsByLocataireId(id);
      return {
        success: true,
        message: 'Loyers impayés du locataire récupérés avec succès',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Get('statistiques-loyers-impayes')
  @ApiOperation({ summary: 'Récupérer les statistiques des loyers impayés' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques des loyers impayés récupérées avec succès'
  })
  async getUnpaidRentStatistics() {
    try {
      const data = await this.unpaidRentService.getUnpaidRentStatistics();
      return {
        success: true,
        message: 'Statistiques des loyers impayés récupérées avec succès',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Une erreur est survenue',
        error: error.message || error
      };
    }
  }

  @Post('generer-loyers-impayes')
  @ApiOperation({ summary: 'Générer manuellement les loyers impayés' })
  @ApiResponse({ 
    status: 201, 
    description: 'Loyers impayés générés avec succès'
  })
  async generateUnpaidRents() {
    try {
      await this.unpaidRentService.generateUnpaidRents();
      return {
        success: true,
        message: 'Loyers impayés générés avec succès',
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

  // Move the :id route AFTER all specific routes
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un paiement par son ID' })
  @ApiParam({ name: 'id', description: 'ID du paiement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le paiement a été trouvé',
    type: Paiement 
  })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.paiementService.findOne(id);
      return {
        success: true,
        message: 'Paiement récupéré avec succès',
        data: data
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
  @ApiOperation({ summary: 'Mettre à jour un paiement' })
  @ApiParam({ name: 'id', description: 'ID du paiement à mettre à jour' })
  @ApiBody({ type: UpdatePaiementDto, description: 'Données à mettre à jour' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le paiement a été mis à jour avec succès',
    type: Paiement 
  })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides ou paiement déjà payé' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaiementDto: UpdatePaiementDto,
  ) {
    try {
      const data = await this.paiementService.update(id, updatePaiementDto);
      return {
        success: true,
        message: 'Paiement mis à jour avec succès',
        data: data
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
  @ApiOperation({ summary: 'Supprimer un paiement' })
  @ApiParam({ name: 'id', description: 'ID du paiement à supprimer' })
  @ApiResponse({ status: 200, description: 'Le paiement a été supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer un paiement déjà payé' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.paiementService.remove(id);
      return {
        success: true,
        message: 'Paiement supprimé avec succès',
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