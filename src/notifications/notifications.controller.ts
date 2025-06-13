import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ 
    status: 201, 
    description: 'La notification a été créée avec succès',
    type: Notification 
  })
  create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les notifications' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de toutes les notifications',
    type: [Notification]
  })
  findAll(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  @Get('locataire/:locataireId')
  @ApiOperation({ summary: 'Récupérer les notifications d\'un locataire' })
  @ApiParam({ name: 'locataireId', description: 'ID du locataire' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des notifications du locataire',
    type: [Notification]
  })
  findByLocataire(@Param('locataireId', ParseIntPipe) locataireId: number): Promise<Notification[]> {
    return this.notificationsService.findByLocataire(locataireId);
  }

  @Get('agence/:agenceId')
  @ApiOperation({ summary: 'Récupérer les notifications d\'une agence' })
  @ApiParam({ name: 'agenceId', description: 'ID de l\'agence' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des notifications de l\'agence',
    type: [Notification]
  })
  findByAgence(@Param('agenceId', ParseIntPipe) agenceId: number): Promise<Notification[]> {
    return this.notificationsService.findByAgence(agenceId);
  }

  @Get('paiement/:paiementId')
  @ApiOperation({ summary: 'Récupérer les notifications d\'un paiement' })
  @ApiParam({ name: 'paiementId', description: 'ID du paiement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des notifications du paiement',
    type: [Notification]
  })
  findByPaiement(@Param('paiementId', ParseIntPipe) paiementId: number): Promise<Notification[]> {
    return this.notificationsService.findByPaiement(paiementId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une notification par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  @ApiResponse({ 
    status: 200, 
    description: 'La notification a été trouvée',
    type: Notification 
  })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/lu')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  @ApiResponse({ 
    status: 200, 
    description: 'La notification a été marquée comme lue',
    type: Notification 
  })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  markAsRead(@Param('id', ParseIntPipe) id: number): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archiver une notification' })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  @ApiResponse({ 
    status: 200, 
    description: 'La notification a été archivée',
    type: Notification 
  })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  markAsArchived(@Param('id', ParseIntPipe) id: number): Promise<Notification> {
    return this.notificationsService.markAsArchived(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une notification' })
  @ApiParam({ name: 'id', description: 'ID de la notification à supprimer' })
  @ApiResponse({ status: 200, description: 'La notification a été supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.notificationsService.remove(id);
  }
}
