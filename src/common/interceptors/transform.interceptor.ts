import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
  success: boolean;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T> | T> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | T> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map(data => {
        // Si la réponse est déjà formatée (erreur), on la retourne telle quelle
        if (data && typeof data === 'object' && 'statusCode' in data && 'message' in data) {
          return data;
        }

        // Si c'est une réponse simple (string, number, boolean), on la retourne telle quelle
        if (typeof data !== 'object' || data === null) {
          return data;
        }

        // Si c'est un tableau ou un objet simple, on le retourne directement
        // sans l'encapsuler dans un objet data
        if (Array.isArray(data) || this.isSimpleObject(data)) {
          return data;
        }

        // Formatage standard des réponses de succès complexes
        return {
          data,
          statusCode: response.statusCode,
          message: this.getSuccessMessage(request.method, request.url),
          timestamp: new Date().toISOString(),
          success: true,
        };
      }),
    );
  }

  private isSimpleObject(obj: any): boolean {
    // Vérifie si c'est un objet simple (pas une instance de classe complexe)
    return obj.constructor === Object;
  }

  private getSuccessMessage(method: string, url: string): string {
    const resource = this.getResourceFromUrl(url);
    
    switch (method) {
      case 'GET':
        if (url.includes('/:id')) {
          return `${resource} récupéré avec succès`;
        }
        return `${resource} récupérés avec succès`;
      case 'POST':
        return `${resource} créé avec succès`;
      case 'PUT':
      case 'PATCH':
        return `${resource} mis à jour avec succès`;
      case 'DELETE':
        return `${resource} supprimé avec succès`;
      default:
        return 'Opération réussie';
    }
  }

  private getResourceFromUrl(url: string): string {
    const segments = url.split('/').filter(segment => segment);
    
    // Mapping des URLs vers des noms de ressources en français
    const resourceMap: { [key: string]: string } = {
      'proprietaires': 'Propriétaire',
      'locataires': 'Locataire',
      'biens': 'Bien',
      'agences': 'Agence',
      'users': 'Utilisateur',
      'auth': 'Authentification',
      'documents': 'Document',
      'locations': 'Location',
      'paiements': 'Paiement',
      'notifications': 'Notification',
    };

    // Chercher le premier segment qui correspond à une ressource
    for (const segment of segments) {
      if (resourceMap[segment]) {
        return resourceMap[segment];
      }
    }

    return 'Ressource';
  }
} 