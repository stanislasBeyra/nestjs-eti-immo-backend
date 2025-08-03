# Configuration des URLs d'images

## Vue d'ensemble

Le système détecte automatiquement l'URL de base pour les images selon l'environnement d'exécution.

## Variables d'environnement disponibles

### 1. `BASE_URL` (Priorité la plus haute)
URL de base explicite pour tous les environnements.

```bash
# Développement
BASE_URL=http://localhost:1206

# Production
BASE_URL=https://votre-domaine.com
```

### 2. `PRODUCTION_URL` (Production uniquement)
URL spécifique pour l'environnement de production.

```bash
PRODUCTION_URL=https://api.votre-domaine.com
```

### 3. Variables automatiques (Vercel)
Si vous déployez sur Vercel, l'URL est automatiquement détectée via `VERCEL_URL`.

## Logique de détection automatique

1. **Si `BASE_URL` est défini** → Utilise cette URL
2. **Si `VERCEL=true`** → Utilise `https://${VERCEL_URL}`
3. **Si `NODE_ENV=production`** → Utilise `PRODUCTION_URL` ou une URL par défaut
4. **Sinon** → Utilise `http://localhost:1206` (développement)

## Exemples d'utilisation

### Développement local
```bash
# Aucune variable nécessaire, utilise automatiquement:
# http://localhost:1206
```

### Production avec domaine personnalisé
```bash
BASE_URL=https://api.votre-domaine.com
# ou
NODE_ENV=production
PRODUCTION_URL=https://api.votre-domaine.com
```

### Déploiement Vercel
```bash
# Aucune configuration nécessaire, détection automatique
VERCEL=true
VERCEL_URL=votre-app.vercel.app
```

## Résultat

Les images seront automatiquement transformées :

**Avant :**
```json
{
  "main_image": "/uploads/biens/image.png"
}
```

**Après :**
```json
{
  "main_image": "https://api.votre-domaine.com/uploads/biens/image.png"
}
```

## Test

Pour vérifier l'URL utilisée, regardez les logs du serveur au démarrage ou faites un GET sur `/api/biens` et vérifiez les URLs des images. 