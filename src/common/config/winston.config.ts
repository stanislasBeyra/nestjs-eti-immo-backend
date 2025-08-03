import * as winston from 'winston';

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
  // Console transport (pour tous les environnements)
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

// Loggers spécialisés (console uniquement)
export const logger = winston.createLogger(winstonConfig);

export const accessLogger = winston.createLogger({
  ...winstonConfig,
  defaultMeta: { category: 'access' }
});

export const databaseLogger = winston.createLogger({
  ...winstonConfig,
  defaultMeta: { category: 'database' }
});

export const securityLogger = winston.createLogger({
  ...winstonConfig,
  defaultMeta: { category: 'security' }
});

export const errorLogger = winston.createLogger({
  ...winstonConfig,
  defaultMeta: { category: 'error' }
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