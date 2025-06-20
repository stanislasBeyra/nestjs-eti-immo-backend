import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = this.formatValidationErrors(errors);
      throw new BadRequestException({
        message: 'Données de validation invalides',
        details: messages,
        validationErrors: errors,
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatValidationErrors(errors: any[]): string[] {
    const messages: string[] = [];

    errors.forEach(error => {
      if (error.constraints) {
        Object.keys(error.constraints).forEach(key => {
          let message = error.constraints[key];
          
          // Personnalisation des messages d'erreur
          switch (key) {
            case 'isNotEmpty':
              message = `${this.getFieldName(error.property)} est requis`;
              break;
            case 'isString':
              message = `${this.getFieldName(error.property)} doit être une chaîne de caractères`;
              break;
            case 'isEmail':
              message = `${this.getFieldName(error.property)} doit être une adresse email valide`;
              break;
            case 'minLength':
              message = `${this.getFieldName(error.property)} doit contenir au moins ${error.constraints.minLength} caractères`;
              break;
            case 'maxLength':
              message = `${this.getFieldName(error.property)} ne peut pas dépasser ${error.constraints.maxLength} caractères`;
              break;
            case 'isNumber':
              message = `${this.getFieldName(error.property)} doit être un nombre`;
              break;
            case 'isInt':
              message = `${this.getFieldName(error.property)} doit être un nombre entier`;
              break;
            case 'min':
              message = `${this.getFieldName(error.property)} doit être supérieur ou égal à ${error.constraints.min}`;
              break;
            case 'max':
              message = `${this.getFieldName(error.property)} doit être inférieur ou égal à ${error.constraints.max}`;
              break;
            case 'isEnum':
              message = `${this.getFieldName(error.property)} doit être une valeur valide`;
              break;
            case 'isOptional':
              message = `${this.getFieldName(error.property)} est optionnel`;
              break;
            case 'isMobilePhone':
              message = `${this.getFieldName(error.property)} doit être un numéro de téléphone valide`;
              break;
            case 'isUrl':
              message = `${this.getFieldName(error.property)} doit être une URL valide`;
              break;
            case 'isDate':
              message = `${this.getFieldName(error.property)} doit être une date valide`;
              break;
            case 'isBoolean':
              message = `${this.getFieldName(error.property)} doit être un booléen`;
              break;
            case 'isArray':
              message = `${this.getFieldName(error.property)} doit être un tableau`;
              break;
            case 'arrayMinSize':
              message = `${this.getFieldName(error.property)} doit contenir au moins ${error.constraints.arrayMinSize} éléments`;
              break;
            case 'arrayMaxSize':
              message = `${this.getFieldName(error.property)} ne peut pas contenir plus de ${error.constraints.arrayMaxSize} éléments`;
              break;
            case 'isObject':
              message = `${this.getFieldName(error.property)} doit être un objet`;
              break;
            case 'isUuid':
              message = `${this.getFieldName(error.property)} doit être un UUID valide`;
              break;
            case 'isPhoneNumber':
              message = `${this.getFieldName(error.property)} doit être un numéro de téléphone valide`;
              break;
            case 'isPostalCode':
              message = `${this.getFieldName(error.property)} doit être un code postal valide`;
              break;
            case 'isCreditCard':
              message = `${this.getFieldName(error.property)} doit être un numéro de carte de crédit valide`;
              break;
            case 'isIBAN':
              message = `${this.getFieldName(error.property)} doit être un IBAN valide`;
              break;
            case 'isBIC':
              message = `${this.getFieldName(error.property)} doit être un BIC valide`;
              break;
            case 'isCurrency':
              message = `${this.getFieldName(error.property)} doit être un code de devise valide`;
              break;
            case 'isISO8601':
              message = `${this.getFieldName(error.property)} doit être une date ISO 8601 valide`;
              break;
            case 'isJWT':
              message = `${this.getFieldName(error.property)} doit être un JWT valide`;
              break;
            case 'isMongoId':
              message = `${this.getFieldName(error.property)} doit être un ID MongoDB valide`;
              break;
            case 'isMultibyte':
              message = `${this.getFieldName(error.property)} doit contenir des caractères multibytes`;
              break;
            case 'isSurrogatePair':
              message = `${this.getFieldName(error.property)} contient des paires de substitution invalides`;
              break;
            case 'isTaxId':
              message = `${this.getFieldName(error.property)} doit être un numéro d'identification fiscale valide`;
              break;
            case 'isVAT':
              message = `${this.getFieldName(error.property)} doit être un numéro de TVA valide`;
              break;
            case 'isEAN':
              message = `${this.getFieldName(error.property)} doit être un code EAN valide`;
              break;
            case 'isISIN':
              message = `${this.getFieldName(error.property)} doit être un code ISIN valide`;
              break;
            case 'isISBN':
              message = `${this.getFieldName(error.property)} doit être un code ISBN valide`;
              break;
            case 'isISSN':
              message = `${this.getFieldName(error.property)} doit être un code ISSN valide`;
              break;
            case 'isISRC':
              message = `${this.getFieldName(error.property)} doit être un code ISRC valide`;
              break;
            case 'isMACAddress':
              message = `${this.getFieldName(error.property)} doit être une adresse MAC valide`;
              break;
            case 'isPort':
              message = `${this.getFieldName(error.property)} doit être un numéro de port valide`;
              break;
            case 'isRgbColor':
              message = `${this.getFieldName(error.property)} doit être une couleur RGB valide`;
              break;
            case 'isCssColor':
              message = `${this.getFieldName(error.property)} doit être une couleur CSS valide`;
              break;
            case 'isHexColor':
              message = `${this.getFieldName(error.property)} doit être une couleur hexadécimale valide`;
              break;
            case 'isHSL':
              message = `${this.getFieldName(error.property)} doit être une couleur HSL valide`;
              break;
            case 'isRgbColor':
              message = `${this.getFieldName(error.property)} doit être une couleur RGB valide`;
              break;
            case 'isIdentityCard':
              message = `${this.getFieldName(error.property)} doit être un numéro de carte d'identité valide`;
              break;
            case 'isPassportNumber':
              message = `${this.getFieldName(error.property)} doit être un numéro de passeport valide`;
              break;
            case 'isSemVer':
              message = `${this.getFieldName(error.property)} doit être un numéro de version sémantique valide`;
              break;
            case 'isISSN':
              message = `${this.getFieldName(error.property)} doit être un code ISSN valide`;
              break;
            case 'isISRC':
              message = `${this.getFieldName(error.property)} doit être un code ISRC valide`;
              break;
            case 'isMACAddress':
              message = `${this.getFieldName(error.property)} doit être une adresse MAC valide`;
              break;
            case 'isPort':
              message = `${this.getFieldName(error.property)} doit être un numéro de port valide`;
              break;
            case 'isRgbColor':
              message = `${this.getFieldName(error.property)} doit être une couleur RGB valide`;
              break;
            case 'isCssColor':
              message = `${this.getFieldName(error.property)} doit être une couleur CSS valide`;
              break;
            case 'isHexColor':
              message = `${this.getFieldName(error.property)} doit être une couleur hexadécimale valide`;
              break;
            case 'isHSL':
              message = `${this.getFieldName(error.property)} doit être une couleur HSL valide`;
              break;
            case 'isRgbColor':
              message = `${this.getFieldName(error.property)} doit être une couleur RGB valide`;
              break;
            case 'isIdentityCard':
              message = `${this.getFieldName(error.property)} doit être un numéro de carte d'identité valide`;
              break;
            case 'isPassportNumber':
              message = `${this.getFieldName(error.property)} doit être un numéro de passeport valide`;
              break;
            case 'isSemVer':
              message = `${this.getFieldName(error.property)} doit être un numéro de version sémantique valide`;
              break;
            default:
              message = `${this.getFieldName(error.property)}: ${message}`;
          }
          
          messages.push(message);
        });
      }

      // Gestion des erreurs imbriquées
      if (error.children && error.children.length > 0) {
        const childMessages = this.formatValidationErrors(error.children);
        messages.push(...childMessages);
      }
    });

    return messages;
  }

  private getFieldName(property: string): string {
    const fieldNames: { [key: string]: string } = {
      full_name: 'Le nom complet',
      mobile: 'Le numéro de téléphone mobile',
      email: 'L\'adresse email',
      localite: 'La localité',
      adresse: 'L\'adresse',
      piece_identite: 'Le numéro de pièce d\'identité',
      photo_piece: 'La photo de la pièce d\'identité',
      agences_name: 'Le nom de l\'agence',
      agences_email: 'L\'email de l\'agence',
      agences_mobile: 'Le téléphone de l\'agence',
      agences_location: 'La localisation de l\'agence',
      agences_address: 'L\'adresse de l\'agence',
      name: 'Le nom',
      password: 'Le mot de passe',
      phone: 'Le numéro de téléphone',
      categorie: 'La catégorie',
      status: 'Le statut',
      bio: 'La biographie',
      birth_date: 'La date de naissance',
      avatar: 'L\'avatar',
      remember_token: 'Le token de rappel',
      logo_path: 'Le logo',
      terms_accepted: 'L\'acceptation des conditions',
      // Ajoutez d'autres champs selon vos besoins
    };

    return fieldNames[property] || `Le champ "${property}"`;
  }
} 