import { Injectable } from '@nestjs/common';
import { 
  logger, 
  logInfo, 
  logError, 
  logWarn, 
  logDebug, 
  logAccess, 
  logDatabase, 
  logSecurity,
  accessLogger,
  databaseLogger,
  securityLogger,
  errorLogger
} from '../config/winston.config';

@Injectable()
export class LoggingService {
  // Logs généraux
  info(message: string, meta?: any) {
    logInfo(message, meta);
  }

  error(message: string, error?: any, meta?: any) {
    logError(message, error, meta);
  }

  warn(message: string, meta?: any) {
    logWarn(message, meta);
  }

  debug(message: string, meta?: any) {
    logDebug(message, meta);
  }

  // Logs d'accès HTTP
  logHttpAccess(message: string, meta?: any) {
    logAccess(message, meta);
  }

  // Logs de base de données
  logDatabase(message: string, meta?: any) {
    logDatabase(message, meta);
  }

  // Logs de sécurité
  logSecurity(message: string, meta?: any) {
    logSecurity(message, meta);
  }

  // Logs d'authentification
  logAuth(message: string, meta?: any) {
    this.info(`[AUTH] ${message}`, meta);
  }

  // Logs de création d'utilisateur
  logUserCreation(userId: number, userEmail: string, meta?: any) {
    this.info('Nouvel utilisateur créé', {
      userId,
      userEmail,
      action: 'user_creation',
      ...meta
    });
  }

  // Logs de connexion
  logLogin(userId: number, userEmail: string, ip: string, meta?: any) {
    this.logAuth('Connexion utilisateur', {
      userId,
      userEmail,
      ip,
      action: 'login',
      ...meta
    });
  }

  // Logs de déconnexion
  logLogout(userId: number, userEmail: string, meta?: any) {
    this.logAuth('Déconnexion utilisateur', {
      userId,
      userEmail,
      action: 'logout',
      ...meta
    });
  }

  // Logs de tentative de connexion échouée
  logFailedLogin(email: string, ip: string, reason: string, meta?: any) {
    this.logSecurity('Tentative de connexion échouée', {
      email,
      ip,
      reason,
      action: 'failed_login',
      ...meta
    });
  }

  // Logs d'accès refusé
  logAccessDenied(userId: number, userEmail: string, resource: string, action: string, meta?: any) {
    this.logSecurity('Accès refusé', {
      userId,
      userEmail,
      resource,
      action,
      ...meta
    });
  }

  // Logs de création de propriétaire
  logProprietaireCreation(userId: number, proprietaireId: number, agenceId: number, meta?: any) {
    this.info('Nouveau propriétaire créé', {
      userId,
      proprietaireId,
      agenceId,
      action: 'proprietaire_creation',
      ...meta
    });
  }

  // Logs de modification de propriétaire
  logProprietaireUpdate(userId: number, proprietaireId: number, changes: any, meta?: any) {
    this.info('Propriétaire modifié', {
      userId,
      proprietaireId,
      changes,
      action: 'proprietaire_update',
      ...meta
    });
  }

  // Logs de suppression de propriétaire
  logProprietaireDelete(userId: number, proprietaireId: number, meta?: any) {
    this.warn('Propriétaire supprimé', {
      userId,
      proprietaireId,
      action: 'proprietaire_delete',
      ...meta
    });
  }

  // Logs d'erreurs de base de données
  logDatabaseError(error: any, operation: string, table?: string, meta?: any) {
    this.error('Erreur de base de données', {
      error: error?.message || error,
      stack: error?.stack,
      operation,
      table,
      action: 'database_error',
      ...meta
    });
  }

  // Logs de requêtes lentes
  logSlowQuery(query: string, duration: number, meta?: any) {
    this.warn('Requête lente détectée', {
      query,
      duration: `${duration}ms`,
      action: 'slow_query',
      ...meta
    });
  }

  // Logs de validation d'erreurs
  logValidationError(field: string, value: any, rule: string, meta?: any) {
    this.warn('Erreur de validation', {
      field,
      value,
      rule,
      action: 'validation_error',
      ...meta
    });
  }

  // Logs de duplication d'entrée
  logDuplicateEntry(table: string, field: string, value: any, meta?: any) {
    this.warn('Tentative de duplication d\'entrée', {
      table,
      field,
      value,
      action: 'duplicate_entry',
      ...meta
    });
  }

  // Logs de contrainte de clé étrangère
  logForeignKeyConstraint(table: string, field: string, value: any, referencedTable: string, meta?: any) {
    this.error('Violation de contrainte de clé étrangère', {
      table,
      field,
      value,
      referencedTable,
      action: 'foreign_key_constraint',
      ...meta
    });
  }

  // Logs de performance
  logPerformance(operation: string, duration: number, meta?: any) {
    if (duration > 1000) {
      this.warn('Opération lente détectée', {
        operation,
        duration: `${duration}ms`,
        action: 'performance_issue',
        ...meta
      });
    } else {
      this.debug('Opération terminée', {
        operation,
        duration: `${duration}ms`,
        action: 'performance_ok',
        ...meta
      });
    }
  }

  // Logs de démarrage d'application
  logApplicationStart(port: number, environment: string, meta?: any) {
    this.info('Application démarrée', {
      port,
      environment,
      action: 'application_start',
      ...meta
    });
  }

  // Logs d'arrêt d'application
  logApplicationShutdown(reason: string, meta?: any) {
    this.warn('Application arrêtée', {
      reason,
      action: 'application_shutdown',
      ...meta
    });
  }

  // Logs de configuration
  logConfiguration(config: any, meta?: any) {
    this.debug('Configuration chargée', {
      config: this.sanitizeConfig(config),
      action: 'configuration_load',
      ...meta
    });
  }

  // Méthode utilitaire pour nettoyer les configurations sensibles
  private sanitizeConfig(config: any): any {
    if (!config) return config;

    const sanitized = { ...config };
    const sensitiveKeys = ['password', 'secret', 'key', 'token', 'jwt_secret'];

    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '***MASKED***';
      }
    });

    return sanitized;
  }

  // Obtenir les loggers spécialisés
  getAccessLogger() {
    return accessLogger;
  }

  getDatabaseLogger() {
    return databaseLogger;
  }

  getSecurityLogger() {
    return securityLogger;
  }

  getErrorLogger() {
    return errorLogger;
  }

  getMainLogger() {
    return logger;
  }
} 