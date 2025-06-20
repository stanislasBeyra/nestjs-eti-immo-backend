import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError, TypeORMError } from 'typeorm';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { DatabaseErrorUtil } from '../utils/database-error.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    let details: string | null = null;

    // Gestion des erreurs HTTP personnalisées
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).details || null;
      } else {
        message = exception.message;
      }
    }
    // Gestion des erreurs de base de données
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      const errorInfo = DatabaseErrorUtil.analyzeError(exception);
      message = errorInfo.message;
      details = errorInfo.details || null;
    }
    // Gestion des erreurs d'entité non trouvée
    else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = ERROR_MESSAGES.NOT_FOUND;
      details = 'L\'élément demandé n\'existe pas';
    }
    // Gestion des autres erreurs TypeORM
    else if (exception instanceof TypeORMError) {
      status = HttpStatus.BAD_REQUEST;
      message = ERROR_MESSAGES.DATABASE_ERROR;
      details = exception.message;
    }
    // Gestion des erreurs de validation
    else if (exception instanceof Error) {
      if (exception.message.includes('validation')) {
        status = HttpStatus.BAD_REQUEST;
        message = ERROR_MESSAGES.VALIDATION_ERROR;
        details = exception.message;
      } else {
        message = exception.message;
        details = exception.stack || null;
      }
    }

    // Log de l'erreur
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    // Réponse d'erreur personnalisée
    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    if (details) {
      errorResponse.details = details;
    }

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = exception instanceof Error ? exception.name : 'Unknown';
      if (exception instanceof Error && exception.stack) {
        errorResponse.stack = exception.stack;
      }
    }

    response.status(status).json(errorResponse);
  }
} 