import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { logAccess, logError, logSecurity } from '../config/winston.config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers, body, user } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Informations de base de la requête
    const requestInfo = {
      method,
      url,
      ip,
      userAgent,
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'anonymous',
      timestamp: new Date().toISOString(),
    };

    // Logger la requête entrante
    logAccess('Requête entrante', {
      ...requestInfo,
      body: this.sanitizeBody(body),
      headers: this.sanitizeHeaders(headers),
    });

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = response.statusCode;

        // Logger la réponse
        logAccess('Requête terminée', {
          ...requestInfo,
          statusCode,
          duration: `${duration}ms`,
          responseSize: this.getResponseSize(data),
        });

        // Logger les requêtes lentes (> 1000ms)
        if (duration > 1000) {
          logAccess('Requête lente détectée', {
            ...requestInfo,
            duration: `${duration}ms`,
            statusCode,
          });
        }

        // Logger les erreurs 4xx et 5xx
        if (statusCode >= 400) {
          logError('Erreur HTTP', null, {
            ...requestInfo,
            statusCode,
            duration: `${duration}ms`,
          });
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Logger les erreurs
        logError('Erreur lors du traitement de la requête', error, {
          ...requestInfo,
          duration: `${duration}ms`,
          statusCode: error.status || 500,
        });

        // Logger les tentatives d'accès non autorisées
        if (error.status === 401 || error.status === 403) {
          logSecurity('Tentative d\'accès non autorisée', {
            ...requestInfo,
            error: error.message,
            statusCode: error.status,
          });
        }

        throw error;
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    
    // Masquer les informations sensibles
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***MASKED***';
      }
    });

    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    if (!headers) return headers;

    const sanitized = { ...headers };
    
    // Masquer les headers sensibles
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '***MASKED***';
      }
    });

    return sanitized;
  }

  private getResponseSize(data: any): string {
    if (!data) return '0 bytes';
    
    try {
      const size = JSON.stringify(data).length;
      if (size < 1024) {
        return `${size} bytes`;
      } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
      } else {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      }
    } catch {
      return 'unknown';
    }
  }
} 