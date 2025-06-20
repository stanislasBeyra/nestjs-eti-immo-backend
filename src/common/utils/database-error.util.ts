export interface DatabaseErrorInfo {
  type: 'duplicate' | 'foreign_key' | 'constraint' | 'not_found' | 'other';
  field?: string;
  value?: string;
  message: string;
  details?: string;
}

export class DatabaseErrorUtil {
  /**
   * Analyse une erreur de base de données et retourne des informations structurées
   */
  static analyzeError(error: any): DatabaseErrorInfo {
    const errorMessage = error.message || '';
    
    // Erreur de duplication
    if (errorMessage.includes('Duplicate entry')) {
      const duplicateValue = this.extractDuplicateValue(errorMessage);
      const fieldName = this.detectFieldFromError(errorMessage, duplicateValue);
      
      return {
        type: 'duplicate',
        field: fieldName,
        value: duplicateValue,
        message: this.getDuplicateMessage(fieldName),
        details: `Valeur dupliquée: ${duplicateValue}`
      };
    }
    
    // Erreur de clé étrangère
    if (errorMessage.includes('foreign key constraint')) {
      return {
        type: 'foreign_key',
        message: 'Impossible de supprimer cet élément car il est référencé ailleurs',
        details: 'Veuillez d\'abord supprimer les éléments associés'
      };
    }
    
    // Erreur de contrainte
    if (errorMessage.includes('constraint')) {
      return {
        type: 'constraint',
        message: 'Données invalides',
        details: 'Veuillez vérifier les informations saisies'
      };
    }
    
    // Erreur d'élément non trouvé
    if (errorMessage.includes('not found') || errorMessage.includes('doesn\'t exist')) {
      return {
        type: 'not_found',
        message: 'Ressource non trouvée',
        details: 'L\'élément demandé n\'existe pas'
      };
    }
    
    // Autres erreurs
    return {
      type: 'other',
      message: 'Erreur de base de données',
      details: errorMessage
    };
  }

  /**
   * Extrait la valeur dupliquée du message d'erreur
   */
  private static extractDuplicateValue(errorMessage: string): string {
    const match = errorMessage.match(/Duplicate entry '([^']+)'/);
    return match ? match[1] : 'valeur inconnue';
  }

  /**
   * Détecte le champ en cause à partir du message d'erreur
   */
  private static detectFieldFromError(errorMessage: string, duplicateValue: string): string {
    const errorMessageLower = errorMessage.toLowerCase();
    
    // Mapping des index vers les champs
    const indexToField: { [key: string]: string } = {
      'IDX_76e374b11da42d870f96851e2a': 'mobile', // Index pour le mobile des propriétaires
      'IDX_users_email': 'email', // Index pour l'email des utilisateurs
      'IDX_agences_email': 'agences_email', // Index pour l'email des agences
      'IDX_agences_mobile': 'agences_mobile', // Index pour le mobile des agences
      'IDX_proprietaires_mobile': 'mobile', // Index pour le mobile des propriétaires
      'IDX_proprietaires_email': 'email', // Index pour l'email des propriétaires
      'IDX_locataires_mobile': 'mobile', // Index pour le mobile des locataires
      'IDX_locataires_email': 'email', // Index pour l'email des locataires
      'IDX_piece_identite': 'piece_identite', // Index pour la pièce d'identité
      'IDX_name': 'name', // Index pour le nom
      'IDX_username': 'username', // Index pour le nom d'utilisateur
    };
    
    // Détection basée sur l'index mentionné dans l'erreur
    if (errorMessage.includes('IDX_')) {
      const indexMatch = errorMessage.match(/IDX_[a-f0-9_]+/);
      if (indexMatch && indexToField[indexMatch[0]]) {
        return indexToField[indexMatch[0]];
      }
    }
    
    // Détection basée sur les mots-clés dans le message
    if (errorMessageLower.includes('mobile') || errorMessageLower.includes('phone')) {
      return 'mobile';
    }
    if (errorMessageLower.includes('email')) {
      return 'email';
    }
    if (errorMessageLower.includes('agences_email')) {
      return 'agences_email';
    }
    if (errorMessageLower.includes('agences_mobile')) {
      return 'agences_mobile';
    }
    if (errorMessageLower.includes('users_email')) {
      return 'users_email';
    }
    if (errorMessageLower.includes('name')) {
      return 'name';
    }
    if (errorMessageLower.includes('username')) {
      return 'username';
    }
    if (errorMessageLower.includes('piece_identite')) {
      return 'piece_identite';
    }
    
    // Détection basée sur la valeur
    if (duplicateValue.includes('@')) {
      return 'email';
    }
    if (/^\d+$/.test(duplicateValue) && duplicateValue.length >= 8) {
      return 'mobile';
    }
    
    return 'champ inconnu';
  }

  /**
   * Retourne le message approprié selon le champ dupliqué
   */
  private static getDuplicateMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      'mobile': 'Ce numéro de téléphone mobile est déjà utilisé',
      'email': 'Cette adresse email est déjà utilisée',
      'agences_email': 'Cette adresse email d\'agence est déjà utilisée',
      'agences_mobile': 'Ce numéro de téléphone d\'agence est déjà utilisé',
      'users_email': 'Cette adresse email est déjà utilisée',
      'name': 'Ce nom est déjà utilisé',
      'username': 'Ce nom d\'utilisateur est déjà utilisé',
      'piece_identite': 'Ce numéro de pièce d\'identité est déjà utilisé',
      'champ inconnu': 'Une donnée en double a été détectée'
    };
    
    return messages[fieldName] || messages['champ inconnu'];
  }

  /**
   * Vérifie si une erreur est une erreur de duplication
   */
  static isDuplicateError(error: any): boolean {
    return error.message && error.message.includes('Duplicate entry');
  }

  /**
   * Vérifie si une erreur est une erreur de clé étrangère
   */
  static isForeignKeyError(error: any): boolean {
    return error.message && error.message.includes('foreign key constraint');
  }

  /**
   * Vérifie si une erreur est une erreur de contrainte
   */
  static isConstraintError(error: any): boolean {
    return error.message && error.message.includes('constraint');
  }
} 