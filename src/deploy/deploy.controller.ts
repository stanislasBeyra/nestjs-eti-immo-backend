import { Controller, Get, Post, Res, Logger, Body, Headers } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { InternalServerErrorException } from '@nestjs/common';

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

  @Get('history')
  async getHistory(@Res() res: Response) {
    try {
      // Chemin absolu vers le fichier deploy-history.json
      const historyPath = join(__dirname, '..', '..', 'public', 'deploy-history.json');
      this.logger.log(`Serving deploy-history.json from: ${historyPath}`);
      
      if (existsSync(historyPath)) {
        const history = readFileSync(historyPath, 'utf8');
        res.setHeader('Content-Type', 'application/json');
        res.send(history);
      } else {
        res.json({
          deployments: []
        });
      }
    } catch (error) {
      this.logger.error(`Error in getHistory: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la lecture de l\'historique',
        messageError: error.message
      });
    }
  }
  @Get('testsssss')
  async getTest(@Res() res: Response) {
    return res.send('Test success' + ' ' + __dirname);
  }

  @Get('/reussie')
  async getReussie(@Res() res: Response) {
    return res.send('Reussie');
  }

  @Post('webhook')
  async handleWebhook(@Body() payload: any, @Headers('x-hub-signature-256') signature: string) {
    try {
      this.logger.log('Webhook GitHub reçu');
      
      // Vérifier que le payload existe
      if (!payload) {
        this.logger.error('❌ Payload vide reçu');
        return {
          success: false,
          message: 'Payload vide reçu',
          timestamp: new Date().toISOString()
        };
      }
      
      this.logger.log(`Payload reçu: ${JSON.stringify(payload, null, 2)}`);
      
      // Vérifier que c'est un push sur la branche devs
      if (payload.ref === 'refs/heads/devs') {
        this.logger.log('✅ Webhook GitHub reçu pour la branche devs - Déclenchement du déploiement');
        
        // Lancer le déploiement automatique
        const deployScript = '/home/partenai/public_html/nestjs/git_update/deploy.sh';
        
        this.logger.log(`🚀 Lancement du script de déploiement: ${deployScript}`);
        
        // Vérifier que le script existe
        if (!existsSync(deployScript)) {
          this.logger.error(`❌ Script de déploiement non trouvé: ${deployScript}`);
          return {
            success: false,
            message: 'Script de déploiement non trouvé',
            timestamp: new Date().toISOString()
          };
        }
        
        // Exécuter le script de déploiement en arrière-plan
        exec(`bash ${deployScript} > /dev/null 2>&1 &`, (error, stdout, stderr) => {
          if (error) {
            this.logger.error(`❌ Erreur lors du lancement du déploiement: ${error.message}`);
            return;
          }
          this.logger.log('✅ Script de déploiement lancé avec succès');
        });
        
        return {
          success: true,
          message: 'Déploiement déclenché avec succès',
          timestamp: new Date().toISOString(),
          branch: payload.ref,
          commit: payload.head_commit?.id || 'N/A'
        };
      } else {
        this.logger.log(`⚠️ Webhook ignoré - Branche: ${payload.ref} (attendu: refs/heads/devs)`);
        
        return {
          success: false,
          message: 'Webhook ignoré (pas la bonne branche)',
          ref: payload.ref,
          expected: 'refs/heads/devs',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      this.logger.error(`❌ Erreur lors du traitement du webhook: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      
      return {
        success: false,
        message: 'Erreur lors du traitement du webhook',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
