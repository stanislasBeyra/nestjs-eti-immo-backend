import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MultipartDataCleanerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Ne traiter que les requêtes multipart/form-data
    if (request.headers['content-type']?.includes('multipart/form-data')) {
      this.cleanFormData(request.body);
    }
    
    return next.handle();
  }

  private cleanFormData(body: any): void {
    if (!body || typeof body !== 'object') {
      return;
    }

    // Champs qui doivent être des nombres
    const numericFields = ['prix_vente', 'superficie', 'prix_m2', 'superficie_constructible', 'frais_agence', 'proprietaire_id', 'latitude', 'longitude'];
    // Champs qui doivent être des booléens
    const booleanFields = ['constructible', 'viabilise', 'acces_route', 'commission_negociable'];
    // Champs qui sont des tableaux
    const arrayFields = ['equipements', 'documents'];

    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        const value = body[key];
        
        // Supprimer les valeurs vides ou "undefined"
        if (value === 'undefined' || value === '' || value === null) {
          delete body[key];
          continue;
        }

        // Conversion spécifique par type de champ
        if (typeof value === 'string') {
          // Champs numériques
          if (numericFields.includes(key)) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              body[key] = numValue;
            } else {
              delete body[key]; // Supprimer si conversion impossible
            }
          }
          // Champs booléens
          else if (booleanFields.includes(key)) {
            if (value === 'true') {
              body[key] = true;
            } else if (value === 'false') {
              body[key] = false;
            } else {
              delete body[key]; // Supprimer si pas true/false
            }
          }
          // Autres champs string - garder tel quel
        }
        // Traiter les tableaux
        else if (Array.isArray(value) && arrayFields.includes(key)) {
          const cleanedArray = value.filter(item => 
            item !== 'undefined' && 
            item !== '' && 
            item !== null
          );
          if (cleanedArray.length > 0) {
            body[key] = cleanedArray;
          } else {
            delete body[key];
          }
        }
        // Traiter les tableaux qui viennent comme string unique
        else if (typeof value === 'string' && arrayFields.includes(key)) {
          body[key] = [value];
        }
      }
    }
  }
}