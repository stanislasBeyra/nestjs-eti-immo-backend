import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, HttpException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { logger } from './common/config/winston.config';
import { LoggingService } from './common/services/logging.service';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const nestLogger = new Logger('Bootstrap');
  const loggingService = new LoggingService();

  try {
    nestLogger.log('Starting application...');

    // Log des variables d'environnement seulement en développement
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Démarrage de l\'application...');
      logger.debug('Vérification des variables d\'environnement', {
        DB_HOST: process.env.DB_HOST ? 'Set' : 'Not set',
        DB_PORT: process.env.DB_PORT ? 'Set' : 'Not set',
        DB_USERNAME: process.env.DB_USERNAME ? 'Set' : 'Not set',
        DB_NAME: process.env.DB_NAME ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        VERCEL: process.env.VERCEL ? 'true' : 'false'
      });
    }

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: process.env.VERCEL ? ['error', 'warn'] : ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Augmenter la taille maximale du body à 50mb
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    // Configuration des fichiers statiques
    app.useStaticAssets(join(__dirname, '..', 'public'));

    // Configuration spécifique pour les uploads - accessible directement
    app.useStaticAssets(join(__dirname, '..', 'public', 'uploads'), {
      prefix: '/uploads/',
      setHeaders: (res, path) => {
        // Permettre l'accès aux images depuis n'importe où
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
      }
    });

    // Configuration globale
    app.setGlobalPrefix('api', {
      exclude: ['/'], // Exclure la route racine du préfixe api
    });
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

    // Configuration Swagger (activé pour tous les environnements)
    const config = new DocumentBuilder()
      .setTitle('API Immobilière')
      .setDescription('API de gestion immobilière')
      .setVersion('1.0')
      .addBearerAuth()
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
    // Configuration CORS dynamique basée sur l'environnement
    const corsOrigins = process.env.NODE_ENV === 'production' 
      ? [
          "https://next-js-eti-immo-dashbord.vercel.app",
          /^https:\/\/.*\.vercel\.app$/,
        ]
      : [
          'http://192.168.2.102:3000',
          "http://192.168.249.15:3000",
          'http://192.168.1.59:3000',
          "http://localhost:3000",
          "http://192.168.100.5:3000",
          "http://192.168.35.15:3000",
          "https://next-js-eti-immo-dashbord.vercel.app",
        ];

    // Configuration CORS - Remplacer la configuration existante
    app.enableCors({
      origin: [
        'https://next-js-eti-immo-dashbord.vercel.app',
        'https://next-js-eti-immo-dashbord-85oq46mvc-beyradevs-projects.vercel.app',
        'https://immo.partenairesmtn.ci',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        // Pattern pour tous les déploiements Vercel
        /^https:\/\/.*\.vercel\.app$/,
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'Cache-Control',
        'Pragma'
      ],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 200
    });

    // Middleware CORS supplémentaire pour gérer les cas edge
    // ===== CONFIGURATION CORS UNIQUE =====
    app.use((req, res, next) => {
      const origin = req.headers.origin;
      
      // Liste des origines autorisées
      const allowedOrigins = [
        'https://next-js-eti-immo-dashbord.vercel.app',
        'https://next-js-eti-immo-dashbord-85oq46mvc-beyradevs-projects.vercel.app',
        'https://immo.partenairesmtn.ci',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ];
      
      // Autoriser l'origine si elle est dans la liste ou si c'est un domaine Vercel
      if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('.vercel.app'))) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        console.log(`✅ CORS - Origin autorisée: ${origin}`);
      } else {
        console.log(`❌ CORS - Origin refusée: ${origin}`);
      }
      
      // En-têtes CORS obligatoires
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, Cache-Control, Pragma');
      res.setHeader('Access-Control-Max-Age', '86400');
      
      // Gérer les requêtes preflight OPTIONS
      if (req.method === 'OPTIONS') {
        console.log(`🚀 CORS - Preflight pour: ${req.url}`);
        return res.status(200).end();
      }
      
      next();
    });

    // Configuration CORS NestJS simple
    app.enableCors({
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200
    });
    // ===== FIN CONFIGURATION CORS =====

    // Middleware de débogage CORS (uniquement en développement)
    if (process.env.NODE_ENV !== 'production') {
      app.use((req, res, next) => {
        console.log(`CORS Debug - Origin: ${req.headers.origin}, Méthode: ${req.method}, URL: ${req.url}`);
        next();
      });
    }

    // Ajoute cette ligne pour exposer le JSON sur /api-json
    app.use('/api-json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(document);
    });

    // Configuration du port pour Vercel
    const port = parseInt(process.env.PORT || '3000', 10);
    await app.listen(port, '0.0.0.0');

    const appUrl = await app.getUrl();
    nestLogger.log(`Application is running on: ${appUrl}`);

    // Log du démarrage de l'application avec Winston seulement si pas sur Vercel
    if (!process.env.VERCEL) {
      loggingService.logApplicationStart(port, process.env.NODE_ENV || 'development', {
        appUrl,
        environment: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info'
      });
    }

    // Gestion de l'arrêt gracieux seulement si pas sur Vercel
    if (!process.env.VERCEL) {
      process.on('SIGTERM', () => {
        logger.info('SIGTERM reçu, arrêt gracieux...');
        loggingService.logApplicationShutdown('SIGTERM signal');
        process.exit(0);
      });

      process.on('SIGINT', () => {
        logger.info('SIGINT reçu, arrêt gracieux...');
        loggingService.logApplicationShutdown('SIGINT signal');
        process.exit(0);
      });
    }

  } catch (error) {
    nestLogger.error('Error during application bootstrap:', error);
    if (!process.env.VERCEL) {
      logger.error('Erreur lors du démarrage de l\'application', error, {
        error: error.message,
        stack: error.stack
      });
    }
    throw error; // Re-throw to ensure Vercel sees the error
  }
}

// Wrap bootstrap in a try-catch to ensure we log any startup errors
bootstrap().catch(error => {
  console.error('Fatal error during bootstrap:', error);
  logger.error('Erreur fatale lors du démarrage', error, {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});
