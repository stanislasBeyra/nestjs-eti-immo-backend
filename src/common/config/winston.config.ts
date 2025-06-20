import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';

// Créer le dossier logs s'il n'existe pas
const logsDir = join(process.cwd(), 'logs');

// Configuration des formats
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Configuration des transports
const transports: winston.transport[] = [
  // Console transport (pour le développement)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta)}`;
        }
        
        if (stack) {
          log += `\n${stack}`;
        }
        
        return log;
      })
    )
  })
];

// Transport pour les logs généraux
const generalTransport = new DailyRotateFile({
  filename: join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

// Transport pour les erreurs
const errorTransport = new DailyRotateFile({
  filename: join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error'
});

// Transport pour les logs de débogage
const debugTransport = new DailyRotateFile({
  filename: join(logsDir, 'debug-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  level: 'debug'
});

// Transport pour les logs d'accès HTTP
const accessTransport = new DailyRotateFile({
  filename: join(logsDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

// Transport pour les logs de base de données
const databaseTransport = new DailyRotateFile({
  filename: join(logsDir, 'database-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

// Transport pour les logs de sécurité
const securityTransport = new DailyRotateFile({
  filename: join(logsDir, 'security-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'warn'
});

// Ajouter les transports selon l'environnement
if (process.env.NODE_ENV === 'production') {
  transports.push(generalTransport, errorTransport, accessTransport, databaseTransport, securityTransport);
} else {
  // En développement, on garde aussi les fichiers pour le débogage
  transports.push(generalTransport, errorTransport, debugTransport, accessTransport, databaseTransport, securityTransport);
}

// Configuration principale du logger
export const winstonConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test'
};

// Créer les loggers spécialisés
export const createLogger = (category: string) => {
  return winston.createLogger({
    ...winstonConfig,
    defaultMeta: { category }
  });
};

// Loggers spécialisés
export const logger = winston.createLogger(winstonConfig);

export const accessLogger = winston.createLogger({
  ...winstonConfig,
  defaultMeta: { category: 'access' },
  transports: [accessTransport, new winston.transports.Console()]
});

export const databaseLogger = winston.createLogger({
  ...winstonConfig,
  defaultMeta: { category: 'database' },
  transports: [databaseTransport, new winston.transports.Console()]
});

export const securityLogger = winston.createLogger({
  ...winstonConfig,
  defaultMeta: { category: 'security' },
  transports: [securityTransport, new winston.transports.Console()]
});

export const errorLogger = winston.createLogger({
  ...winstonConfig,
  defaultMeta: { category: 'error' },
  transports: [errorTransport, new winston.transports.Console()]
});

// Fonctions utilitaires pour les logs
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: any, meta?: any) => {
  logger.error(message, { error: error?.message || error, stack: error?.stack, ...meta });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logAccess = (message: string, meta?: any) => {
  accessLogger.info(message, meta);
};

export const logDatabase = (message: string, meta?: any) => {
  databaseLogger.info(message, meta);
};

export const logSecurity = (message: string, meta?: any) => {
  securityLogger.warn(message, meta);
}; 