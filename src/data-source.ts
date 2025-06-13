import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';

// Charger les variables d'environnement
config();

const logger = new Logger('DataSource');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || (() => { throw new Error('DB_HOST is required') })(),
  port: parseInt(process.env.DB_PORT || (() => { throw new Error('DB_PORT is required') })()),
  username: process.env.DB_USERNAME || (() => { throw new Error('DB_USERNAME is required') })(),
  password: process.env.DB_PASSWORD || (() => { throw new Error('DB_PASSWORD is required') })(),
  database: process.env.DB_NAME || (() => { throw new Error('DB_NAME is required') })(),
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
  migrationsRun: false,
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'each',
  charset: 'utf8mb4',
  extra: {
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 0
  }
});

// Test de la connexion
AppDataSource.initialize()
  .then(() => {
    logger.log('Data Source has been initialized!');
  })
  .catch((error) => {
    logger.error('Error during Data Source initialization:', error);
    logger.error('Stack trace:', error.stack);
    throw error;
  });

export default AppDataSource;

