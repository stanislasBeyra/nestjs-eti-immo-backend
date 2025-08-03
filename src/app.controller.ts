import { Controller, Get, Options, Res, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  
  constructor(private readonly appService: AppService) {}

  @Get()
  getIndex(@Res() res: Response) {
    try {
      // Chemin absolu vers le fichier index.html
      const indexPath = join(__dirname, '..', 'public', 'index.html');
      this.logger.log(`Serving index.html from: ${indexPath}`);
      
      return res.sendFile(indexPath, (err) => {
        if (err) {
          this.logger.error(`Error serving index.html: ${err.message}`);
          // Fallback: retourner un HTML simple
          res.type('html').send('<h1>API is running</h1><p>Welcome to NestJS API</p>');
        }
      });
    } catch (error) {
      this.logger.error(`Error in getIndex: ${error.message}`);
      // Fallback: retourner un HTML simple
      res.type('html').send('<h1>API is running</h1><p>Welcome to NestJS API</p>');
    }
  }

  @Options('*')
  handleOptions(@Res() res: Response) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).send();
  }
}
