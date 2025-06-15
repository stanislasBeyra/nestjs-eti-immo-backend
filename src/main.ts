import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, HttpException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('Starting application...');
    logger.log('Environment variables check:');
    logger.log(`DB_HOST: ${process.env.DB_HOST ? 'Set' : 'Not set'}`);
    logger.log(`DB_PORT: ${process.env.DB_PORT ? 'Set' : 'Not set'}`);
    logger.log(`DB_USERNAME: ${process.env.DB_USERNAME ? 'Set' : 'Not set'}`);
    logger.log(`DB_NAME: ${process.env.DB_NAME ? 'Set' : 'Not set'}`);
    logger.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Configuration des fichiers statiques
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'public'));
    app.setViewEngine('html');
    
    // Configuration globale
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(error => ({
          field: error.property,
          constraints: error.constraints,
          value: error.value
        }));
        return new HttpException({
          message: 'Erreur de validation',
          details: messages,
          error: 'ValidationError',
          timestamp: new Date().toISOString()
        }, 400);
      }
    }));

    // Ajout du filtre d'exception global
    app.useGlobalFilters(new HttpExceptionFilter());

    // Configuration Swagger
    const config = new DocumentBuilder()
      .setTitle('API Immobilière')
      .setDescription('API de gestion immobilière')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Entrez votre token JWT',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        deepLinking: true,
        displayRequestDuration: true,
        syntaxHighlight: {
          activate: true,
          theme: 'monokai'
        }
      },
      customSiteTitle: 'API Documentation',
      customfavIcon: '/favicon.ico',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      ],
    });

    // Configuration CORS
    app.enableCors();

    // Configuration du port pour Vercel
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    logger.error('Error during application bootstrap:', error);
    logger.error('Stack trace:', error.stack);
    throw error; // Re-throw to ensure Vercel sees the error
  }
}

// Wrap bootstrap in a try-catch to ensure we log any startup errors
bootstrap().catch(error => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
