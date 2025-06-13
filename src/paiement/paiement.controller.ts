import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PaiementService } from './paiement.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';
import { Paiement, PaiementStatut } from './entities/paiement.entity';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  constructor(private readonly paiementService: PaiementService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau paiement' })
  @ApiBody({ type: CreatePaiementDto, description: 'Données du paiement à créer' })
  @ApiResponse({ 
    status: 201, 
    description: 'Le paiement a été créé avec succès',
    type: Paiement 
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() createPaiementDto: CreatePaiementDto): Promise<Paiement> {
    return this.paiementService.create(createPaiementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les paiements' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de tous les paiements',
    type: [Paiement]
  })
  findAll(): Promise<Paiement[]> {
    return this.paiementService.findAll();
  }

  @Get('locataire/:locataireId')
  @ApiOperation({ summary: 'Récupérer les paiements d\'un locataire' })
  @ApiParam({ name: 'locataireId', description: 'ID du locataire' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des paiements du locataire',
    type: [Paiement]
  })
  findByLocataire(@Param('locataireId', ParseIntPipe) locataireId: number): Promise<Paiement[]> {
    return this.paiementService.findByLocataire(locataireId);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Récupérer les paiements d\'un bien' })
  @ApiParam({ name: 'propertyId', description: 'ID du bien' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des paiements du bien',
    type: [Paiement]
  })
  findByProperty(@Param('propertyId', ParseIntPipe) propertyId: number): Promise<Paiement[]> {
    return this.paiementService.findByProperty(propertyId);
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
  findByDateRange(@Query() query: DateRangeQuery): Promise<Paiement[]> {
    if (!query.startDate || !query.endDate) {
      throw new Error('startDate and endDate are required');
    }
    return this.paiementService.findByDateRange(query.startDate, query.endDate);
  }

  @Get('statut/:statut')
  @ApiOperation({ summary: 'Récupérer les paiements par statut' })
  @ApiParam({ name: 'statut', enum: PaiementStatut, description: 'Statut des paiements' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des paiements du statut spécifié',
    type: [Paiement]
  })
  findByStatut(@Param('statut') statut: PaiementStatut): Promise<Paiement[]> {
    return this.paiementService.findByStatut(statut);
  }

  @Get('impayes')
  @ApiOperation({ summary: 'Récupérer tous les paiements impayés' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des paiements impayés',
    type: [Paiement]
  })
  getPaiementsImpayes(): Promise<Paiement[]> {
    return this.paiementService.getPaiementsImpayes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un paiement par son ID' })
  @ApiParam({ name: 'id', description: 'ID du paiement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Le paiement a été trouvé',
    type: Paiement 
  })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Paiement> {
    return this.paiementService.findOne(id);
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaiementDto: UpdatePaiementDto,
  ): Promise<Paiement> {
    return this.paiementService.update(id, updatePaiementDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un paiement' })
  @ApiParam({ name: 'id', description: 'ID du paiement à supprimer' })
  @ApiResponse({ status: 200, description: 'Le paiement a été supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer un paiement déjà payé' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paiementService.remove(id);
  }
}
