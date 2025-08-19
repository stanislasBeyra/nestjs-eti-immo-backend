import { Controller, Get, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

@Controller('deploy')
export class DeployController {
  private readonly logger = new Logger(DeployController.name);


  
  
  @Get('dashboard')
  async getDashboard(@Res() res: Response) {
    try {
      // Chemin absolu vers le fichier deploy-dashboard.html
      const dashboardPath = join(__dirname, '..', '..', 'public', 'deploy-dashboard.html');
      this.logger.log(`Serving deploy-dashboard.html from: ${dashboardPath}`);
      
      return res.sendFile(dashboardPath, (err) => {
        if (err) {
          this.logger.error(`Error serving deploy-dashboard.html: ${err.message}`);
          // Fallback: retourner un HTML simple
          res.type('html').send('<h1>Dashboard de déploiement</h1><p>Erreur lors du chargement du dashboard</p>');
        }
      });
    } catch (error) {
      this.logger.error(`Error in getDashboard: ${error.message}`);
      // Fallback: retourner un HTML simple
      res.type('html').send('<h1>Dashboard de déploiement</h1><p>Erreur lors du chargement du dashboard</p>');
    }
  }

  @Get('status')
  async getStatus(@Res() res: Response) {
    try {
      // Chemin absolu vers le fichier deploy-status.json
      const statusPath = join(__dirname, '..', '..', 'public', 'deploy-status.json');
      this.logger.log(`Serving deploy-status.json from: ${statusPath}`);
      
      if (existsSync(statusPath)) {
        const status = readFileSync(statusPath, 'utf8');
        res.setHeader('Content-Type', 'application/json');
        res.send(status);
      } else {
        res.json({
          status: 'idle',
          message: 'Aucun déploiement en cours',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      this.logger.error(`Error in getStatus: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la lecture du statut',
        messageError: error.message
      });
    }
  }

  @Get('logs')
  async getLogs(@Res() res: Response) {
    try {
      // Chemin absolu vers le fichier deploy.log
      const logPath = join(__dirname, '..', '..', 'deploy.log');
      this.logger.log(`Serving deploy.log from: ${logPath}`);
      
      if (existsSync(logPath)) {
        const logs = readFileSync(logPath, 'utf8');
        res.setHeader('Content-Type', 'text/plain');
        res.send(logs);
      } else {
        res.send('Aucun log de déploiement disponible');
      }
    } catch (error) {
      this.logger.error(`Error in getLogs: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la lecture des logs',
        messageError: error.message
      });
    }
  }
  @Get('test')
  async getTest(@Res() res: Response) {
    return res.send('Test success');
  }
}
