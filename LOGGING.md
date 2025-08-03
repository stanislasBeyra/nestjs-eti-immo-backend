# Système de Logging - API Immobilière

## Vue d'ensemble

Ce projet utilise Winston pour gérer tous les logs de l'application avec une configuration optimisée pour différents environnements (développement, production, Vercel).

## Architecture

### 1. Configuration Winston (`src/common/config/winston.config.ts`)

Le système de logging est configuré avec plusieurs transports :

- **Console** : Pour le développement et Vercel
- **Fichiers rotatifs** : Pour la production (sauf Vercel)
  - `application-YYYY-MM-DD.log` : Logs généraux
  - `error-YYYY-MM-DD.log` : Erreurs uniquement
  - `access-YYYY-MM-DD.log` : Requêtes HTTP
  - `database-YYYY-MM-DD.log` : Opérations base de données
  - `security-YYYY-MM-DD.log` : Événements de sécurité
  - `debug-YYYY-MM-DD.log` : Logs de débogage (développement)

### 2. Service de Logging (`src/common/services/logging.service.ts`)

Service centralisé avec des méthodes spécialisées :

```typescript
// Logs généraux
loggingService.info('Message', { meta: 'data' });
loggingService.error('Erreur', error, { meta: 'data' });
loggingService.warn('Avertissement', { meta: 'data' });
loggingService.debug('Debug', { meta: 'data' });

// Logs spécialisés
loggingService.logProprietaireCreation(userId, proprietaireId, agenceId);
loggingService.logLogin(userId, email, ip);
loggingService.logSecurity('Tentative d\'accès non autorisée', { ip, email });
```

### 3. Intercepteur de Logging (`src/common/interceptors/logging.interceptor.ts`)

Intercepte automatiquement toutes les requêtes HTTP et log :
- Requêtes entrantes
- Réponses
- Durée d'exécution
- Erreurs
- Tentatives d'accès non autorisées

### 4. Module Global (`src/common/modules/logging.module.ts`)

Module global qui rend le service de logging disponible dans toute l'application.

## Utilisation

### Dans un Service

```typescript
import { LoggingService } from '../common/services/logging.service';

@Injectable()
export class MonService {
  constructor(private loggingService: LoggingService) {}

  async maMethode() {
    const startTime = Date.now();
    
    try {
      this.loggingService.info('Début de l\'opération', { action: 'start' });
      
      // Votre logique ici
      
      const duration = Date.now() - startTime;
      this.loggingService.info('Opération réussie', { 
        duration: `${duration}ms`,
        action: 'success' 
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.loggingService.error('Erreur lors de l\'opération', error, {
        duration: `${duration}ms`,
        action: 'error'
      });
      throw error;
    }
  }
}
```

### Logs Automatiques

Le système log automatiquement :
- Toutes les requêtes HTTP (via l'intercepteur)
- Les erreurs de validation
- Les erreurs de base de données
- Les tentatives d'accès non autorisées
- Le démarrage/arrêt de l'application

## Configuration par Environnement

### Développement
- Logs console colorés
- Fichiers de logs avec rotation
- Niveau de log : `debug`

### Production (non-Vercel)
- Logs console + fichiers
- Rotation automatique des fichiers
- Niveau de log : `info`

### Vercel
- Logs console uniquement (pas de fichiers)
- Niveau de log : `warn` et `error` uniquement
- Optimisé pour éviter les timeouts

## Variables d'Environnement

```bash
# Niveau de log (debug, info, warn, error)
LOG_LEVEL=info

# Environnement
NODE_ENV=production

# Détection Vercel (automatique)
VERCEL=true
```

## Structure des Logs

### Format JSON
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "Requête terminée",
  "method": "POST",
  "url": "/api/proprietaires",
  "userId": 123,
  "duration": "150ms",
  "statusCode": 201,
  "action": "proprietaire_creation"
}
```

### Métadonnées Standard
- `action` : Type d'action effectuée
- `userId` : ID de l'utilisateur (si applicable)
- `duration` : Durée d'exécution
- `ip` : Adresse IP de la requête
- `userAgent` : Navigateur/client

## Sécurité

### Données Masquées
Le système masque automatiquement :
- Mots de passe
- Tokens JWT
- Clés API
- Cookies
- Headers d'autorisation

### Logs de Sécurité
- Tentatives de connexion échouées
- Accès refusés
- Violations de contraintes
- Requêtes suspectes

## Maintenance

### Rotation des Fichiers
- Taille max : 20MB par fichier
- Conservation : 7-30 jours selon le type
- Compression automatique

### Nettoyage
```bash
# Supprimer les anciens logs
find logs/ -name "*.log" -mtime +30 -delete

# Vérifier l'espace disque
du -sh logs/
```

## Dépannage

### Problèmes Courants

1. **Logs manquants** : Vérifier `LOG_LEVEL`
2. **Fichiers non créés** : Vérifier les permissions du dossier `logs/`
3. **Performance** : Réduire le niveau de log en production
4. **Espace disque** : Configurer la rotation des fichiers

### Commandes Utiles

```bash
# Voir les logs en temps réel
tail -f logs/application-$(date +%Y-%m-%d).log

# Rechercher des erreurs
grep "ERROR" logs/error-$(date +%Y-%m-%d).log

# Analyser les performances
grep "duration.*[0-9]{4}ms" logs/access-$(date +%Y-%m-%d).log
```

## Intégration avec Vercel

Le système est optimisé pour Vercel :
- Pas de création de fichiers (évite les timeouts)
- Logs console uniquement
- Configuration CORS améliorée
- Gestion des requêtes OPTIONS

## Bonnes Pratiques

1. **Toujours utiliser le LoggingService** au lieu de `console.log`
2. **Inclure des métadonnées** pour faciliter le débogage
3. **Mesurer les performances** avec `Date.now()`
4. **Logger les erreurs** avec le stack trace
5. **Utiliser des actions standardisées** pour faciliter l'analyse 