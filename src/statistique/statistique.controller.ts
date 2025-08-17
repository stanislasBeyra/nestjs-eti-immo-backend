import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatistiqueService, DashboardStats } from './statistique.service';
import { Proprietaire } from 'src/proprietaires/entities/proprietaire.entity';
@ApiTags('statistiques')
@Controller('statistique')
export class StatistiqueController {
  constructor(private readonly statistiqueService: StatistiqueService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtenir les statistiques du tableau de bord' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        totalBiens: {
          type: 'object',
          properties: {
            count: { type: 'number' },
            somme: { type: 'number' }
          }
        },
        biensEnLocation: {
          type: 'object',
          properties: {
            count: { type: 'number' },
            somme: { type: 'number' }
          }
        },
        proprietaires: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            totalBiens: { type: 'number' },
            biensEnLocation: { type: 'number' },
            totalLoyers: { type: 'number' }
          }
        },
        totalLocataires: { type: 'number' },
        totalAgences: { type: 'number' }
      }
    }
  })
  async statsDashboard(): Promise<DashboardStats> {
    return this.statistiqueService.statsDashboard();
  }


  @Get('proprietaires/:id')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'un propriétaire' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques du propriétaire récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        totalBiens: { type: 'number' },
        biensEnLocation: { type: 'number' },
        totalLoyers: { type: 'number' }
      }
    }
  })
  async statsProprietaire(@Param('id') id: string): Promise<any> {
    return 'this is a test';
  }

}
