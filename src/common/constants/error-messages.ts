export const ERROR_MESSAGES = {
  // Messages généraux
  INTERNAL_SERVER_ERROR: 'Une erreur interne est survenue',
  VALIDATION_ERROR: 'Données de validation invalides',
  NOT_FOUND: 'Ressource non trouvée',
  UNAUTHORIZED: 'Non authentifié',
  FORBIDDEN: 'Accès refusé',
  BAD_REQUEST: 'Requête invalide',
  
  // Messages de base de données
  DUPLICATE_ENTRY: 'Une donnée en double a été détectée',
  FOREIGN_KEY_CONSTRAINT: 'Impossible de supprimer cet élément car il est référencé ailleurs',
  DATABASE_ERROR: 'Erreur de base de données',
  
  // Messages spécifiques aux propriétaires
  PROPRIETAIRE_NOT_FOUND: 'Propriétaire non trouvé',
  PROPRIETAIRE_CREATED: 'Propriétaire créé avec succès',
  PROPRIETAIRE_UPDATED: 'Propriétaire mis à jour avec succès',
  PROPRIETAIRE_DELETED: 'Propriétaire supprimé avec succès',
  PROPRIETAIRE_MOBILE_EXISTS: 'Ce numéro de téléphone mobile est déjà utilisé',
  PROPRIETAIRE_EMAIL_EXISTS: 'Cette adresse email est déjà utilisée',
  
  // Messages spécifiques aux agences
  AGENCE_NOT_FOUND: 'Agence non trouvée',
  AGENCE_CREATED: 'Agence créée avec succès',
  AGENCE_UPDATED: 'Agence mise à jour avec succès',
  AGENCE_DELETED: 'Agence supprimée avec succès',
  AGENCE_EMAIL_EXISTS: 'Cette adresse email d\'agence est déjà utilisée',
  AGENCE_MOBILE_EXISTS: 'Ce numéro de téléphone d\'agence est déjà utilisé',
  AGENCE_NOT_FOUND_FOR_USER: 'Aucune agence trouvée pour l\'utilisateur connecté',
  
  // Messages spécifiques aux utilisateurs
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  USER_CREATED: 'Utilisateur créé avec succès',
  USER_UPDATED: 'Utilisateur mis à jour avec succès',
  USER_DELETED: 'Utilisateur supprimé avec succès',
  USER_EMAIL_EXISTS: 'Cette adresse email est déjà utilisée',
  USER_INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  USER_INACTIVE: 'Compte utilisateur inactif',
  USER_SUSPENDED: 'Compte utilisateur suspendu',
  
  // Messages d'authentification
  AUTH_REQUIRED: 'Authentification requise',
  AUTH_INVALID_TOKEN: 'Token d\'authentification invalid',
  AUTH_TOKEN_EXPIRED: 'Token d\'authentification expiré',
  AUTH_INSUFFICIENT_PERMISSIONS: 'Permissions insuffisantes',
  AUTH_ADMIN_ONLY: 'Accès réservé aux administrateurs',
  AUTH_AGENT_ONLY: 'Accès réservé aux agents',
  
  // Messages de validation des champs
  FIELD_REQUIRED: 'Ce champ est requis',
  FIELD_INVALID: 'Ce champ est invalide',
  FIELD_TOO_SHORT: 'Ce champ est trop court',
  FIELD_TOO_LONG: 'Ce champ est trop long',
  FIELD_INVALID_FORMAT: 'Format invalide',
  FIELD_ALREADY_EXISTS: 'Cette valeur existe déjà',
  
  // Messages de succès
  SUCCESS_CREATED: 'Créé avec succès',
  SUCCESS_UPDATED: 'Mis à jour avec succès',
  SUCCESS_DELETED: 'Supprimé avec succès',
  SUCCESS_RETRIEVED: 'Récupéré avec succès',
  SUCCESS_OPERATION: 'Opération réussie',
  
  // Messages d'aide
  HELP_CONTACT_ADMIN: 'Veuillez contacter l\'administrateur',
  HELP_CHECK_DATA: 'Veuillez vérifier les données saisies',
  HELP_USE_UNIQUE_VALUE: 'Veuillez utiliser une valeur unique',
  HELP_DELETE_ASSOCIATED_ITEMS: 'Veuillez d\'abord supprimer les éléments associés',
};

export const SUCCESS_MESSAGES = {
  // Messages de succès généraux
  OPERATION_SUCCESSFUL: 'Opération réussie',
  DATA_RETRIEVED: 'Données récupérées avec succès',
  DATA_CREATED: 'Données créées avec succès',
  DATA_UPDATED: 'Données mises à jour avec succès',
  DATA_DELETED: 'Données supprimées avec succès',
  
  // Messages de succès spécifiques
  LOGIN_SUCCESSFUL: 'Connexion réussie',
  LOGOUT_SUCCESSFUL: 'Déconnexion réussie',
  PASSWORD_CHANGED: 'Mot de passe modifié avec succès',
  PROFILE_UPDATED: 'Profil mis à jour avec succès',
  FILE_UPLOADED: 'Fichier téléchargé avec succès',
  EMAIL_SENT: 'Email envoyé avec succès',
  NOTIFICATION_SENT: 'Notification envoyée avec succès',
};

export const VALIDATION_MESSAGES = {
  // Messages de validation des champs
  IS_STRING: 'doit être une chaîne de caractères',
  IS_EMAIL: 'doit être une adresse email valide',
  IS_NUMBER: 'doit être un nombre',
  IS_INT: 'doit être un nombre entier',
  IS_BOOLEAN: 'doit être un booléen',
  IS_DATE: 'doit être une date valide',
  IS_URL: 'doit être une URL valide',
  IS_PHONE: 'doit être un numéro de téléphone valide',
  IS_MOBILE: 'doit être un numéro de mobile valide',
  IS_OPTIONAL: 'est optionnel',
  IS_REQUIRED: 'est requis',
  MIN_LENGTH: 'doit contenir au moins {0} caractères',
  MAX_LENGTH: 'ne peut pas dépasser {0} caractères',
  MIN_VALUE: 'doit être supérieur ou égal à {0}',
  MAX_VALUE: 'doit être inférieur ou égal à {0}',
  INVALID_FORMAT: 'format invalide',
  ALREADY_EXISTS: 'existe déjà',
  NOT_FOUND: 'n\'existe pas',
  
  // Messages de validation spécifiques
  INVALID_NAME_FORMAT: 'ne peut contenir que des lettres, espaces, tirets et apostrophes',
  INVALID_PHONE_FORMAT: 'ne peut contenir que des chiffres, espaces, tirets, plus et parenthèses',
  INVALID_ID_FORMAT: 'ne peut contenir que des lettres, chiffres, espaces et tirets',
  INVALID_PATH_FORMAT: 'ne peut contenir que des lettres, chiffres, slashes, tirets, underscores et points',
}; 