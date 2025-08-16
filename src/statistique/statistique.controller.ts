import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatistiqueService, DashboardStats } from './statistique.service';
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
        totalLocataires: { type: 'number' }
      }
    }
  })
  async statsDashboard(): Promise<DashboardStats> {
    return this.statistiqueService.statsDashboard();
  }

}
