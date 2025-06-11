import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log l'erreur
    this.logger.error('Exception caught:', exception);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Si l'exception a déjà un format personnalisé, on l'utilise
      if (typeof exceptionResponse === 'object') {
        errorResponse = {
          ...errorResponse,
          ...exceptionResponse,
          statusCode: status,
        };
      } else {
        // Sinon, on crée un format standard
        errorResponse = {
          ...errorResponse,
          message: exceptionResponse,
          statusCode: status,
        };
      }
    } else if (exception instanceof Error) {
      // Pour les erreurs non-HTTP
      errorResponse = {
        ...errorResponse,
        message: 'Une erreur interne est survenue',
        details: exception.message,
        error: exception.name,
      };
    } else {
      // Pour les erreurs inconnues
      errorResponse = {
        ...errorResponse,
        message: 'Une erreur inattendue est survenue',
        error: 'UnknownError',
      };
    }

    // Log la réponse d'erreur
    this.logger.error('Error response:', errorResponse);

    // Envoie la réponse
    response.status(status).json(errorResponse);
  }
} 