import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

let server: any;

async function bootstrap() {
  if (!server) {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    
    // Augmenter la limite de taille pour les requêtes
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    server = expressApp;
  }
  return server;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  return app(req, res);
} 