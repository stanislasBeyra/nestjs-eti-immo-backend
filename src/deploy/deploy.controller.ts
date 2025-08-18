import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

@Controller('deploy')
export class DeployController {
  
  @Get('dashboard')
  async getDashboard(@Res() res: Response) {
    const dashboardPath = join(process.cwd(), 'public', 'deploy-dashboard.html');
    
    if (existsSync(dashboardPath)) {
      const html = readFileSync(dashboardPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.status(404).json({
        success: false,
        message: 'Dashboard non trouvé',
        messageError: 'Le fichier deploy-dashboard.html n\'existe pas'
      });
    }
  }

  @Get('status')
  async getStatus(@Res() res: Response) {
    const statusPath = join(process.cwd(), 'public', 'deploy-status.json');
    
    if (existsSync(statusPath)) {
      try {
        const status = readFileSync(statusPath, 'utf8');
        res.setHeader('Content-Type', 'application/json');
        res.send(status);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la lecture du statut',
          messageError: error.message
        });
      }
    } else {
      res.json({
        status: 'idle',
        message: 'Aucun déploiement en cours',
        timestamp: new Date().toISOString()
      });
    }
  }

  @Get('logs')
  async getLogs(@Res() res: Response) {
    const logPath = join(process.cwd(), 'deploy.log');
    
    if (existsSync(logPath)) {
      try {
        const logs = readFileSync(logPath, 'utf8');
        res.setHeader('Content-Type', 'text/plain');
        res.send(logs);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la lecture des logs',
          messageError: error.message
        });
      }
    } else {
      res.send('Aucun log de déploiement disponible');
    }
  }
}
