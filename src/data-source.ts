import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

export default new DataSource({
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
});

