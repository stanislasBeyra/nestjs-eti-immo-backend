import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Modules métier
import { AuthModule } from './auth/auth.module';
import { AgenceModule } from './agence/agence.module';
import { LocataireModule } from './locataire/locataire.module';
import { DocumentsModule } from './documents/documents.module';
import { LocationModule } from './location/location.module';
import { PaiementModule } from './paiement/paiement.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProprietairesModule } from './proprietaires/proprietaires.module';
import { BiensModule } from './biens/biens.module';
import { UsersModule } from './users/users.module';

// Configuration TypeORM
import AppDataSource from './data-source';

// Composants globaux
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingModule } from './common/modules/logging.module';

@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Module de logging global
    LoggingModule,

    // Configuration TypeORM
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'mysql-kouao.alwaysdata.net',
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USERNAME ?? 'kouao',
      password: process.env.DB_PASSWORD ?? 'Stanislas@001',
      database: process.env.DB_NAME ?? 'kouao_gestion_immo',
      synchronize: false,
      logging: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
      migrationsRun: false,
      migrationsTableName: 'migrations',
      migrationsTransactionMode: 'each', 
      charset: 'utf8mb4'
    }),

    // Modules métier
    AuthModule,
    UsersModule,
    AgenceModule,
    ProprietairesModule,
    LocataireModule,
    BiensModule,
    LocationModule,
    PaiementModule,
    DocumentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Filtre d'exception global
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Pipe de validation global
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // Intercepteur de transformation global
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}



