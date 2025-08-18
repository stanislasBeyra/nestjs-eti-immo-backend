#!/bin/bash

# Configuration
APP_DIR="/home/partenai/public_html/nestjs/git_update"
BRANCH=devs
LOG_FILE=$APP_DIR/deploy.log
STATUS_FILE=$APP_DIR/public/deploy-status.json

# Configuration Node.js/npm pour cPanel
export NODE_ENV=production

# Utiliser npm de cPanel Node.js App
if [ -f "$HOME/.npmrc" ]; then
    export NPM_CONFIG_PREFIX="$HOME/.npm-global"
fi

# Vérifier et activer l'environnement Node.js de cPanel
echo "🔍 Recherche de l'environnement Node.js..." >> $LOG_FILE 2>&1

# Essayer plusieurs chemins possibles pour l'environnement Node.js
NODE_PATHS=(
    "$HOME/nodevenv/public_html/bin"
    "$HOME/nodevenv/public_html/18/bin"
    "$HOME/nodevenv/public_html/16/bin"
    "$HOME/nodevenv/public_html/14/bin"
    "/usr/local/bin"
    "/usr/bin"
)

NODE_ACTIVATED=false

for NODE_PATH in "${NODE_PATHS[@]}"; do
    if [ -d "$NODE_PATH" ] && [ -f "$NODE_PATH/node" ] && [ -f "$NODE_PATH/npm" ]; then
        echo "✅ Environnement Node.js trouvé: $NODE_PATH" >> $LOG_FILE 2>&1
        export PATH="$NODE_PATH:$PATH"
        NODE_ACTIVATED=true
        break
    fi
done

# Si aucun environnement trouvé, essayer d'activer via source
if [ "$NODE_ACTIVATED" = false ] && [ -d "$HOME/nodevenv" ]; then
    echo "🔄 Tentative d'activation via source..." >> $LOG_FILE 2>&1
    source $HOME/nodevenv/public_html/bin/activate 2>/dev/null || true
    source $HOME/nodevenv/public_html/18/bin/activate 2>/dev/null || true
    source $HOME/nodevenv/public_html/16/bin/activate 2>/dev/null || true
fi

# Vérifier si npm est maintenant disponible
if command -v npm >/dev/null 2>&1; then
    echo "✅ npm trouvé: $(which npm)" >> $LOG_FILE 2>&1
    echo "✅ Version npm: $(npm --version)" >> $LOG_FILE 2>&1
else
    echo "❌ npm non trouvé dans le PATH" >> $LOG_FILE 2>&1
    echo "PATH actuel: $PATH" >> $LOG_FILE 2>&1
fi

echo "🚀 Déploiement lancé le $(date)" > $LOG_FILE 2>&1

# Fonction pour mettre à jour le statut
update_status() {
    echo "{\"status\": \"$1\", \"message\": \"$2\", \"timestamp\": \"$(date)\"}" > $STATUS_FILE
}

# Mettre à jour le statut initial
update_status "starting" "Déploiement en cours..."

echo "[1/4] 📥 Synchronisation Git..." >> $LOG_FILE 2>&1
update_status "pulling" "Synchronisation avec le dépôt distant..."

# Récupérer les dernières modifications (gestion des branches divergentes)
echo "📥 Synchronisation avec le dépôt distant..." >> $LOG_FILE 2>&1

# Gestion des modifications locales et synchronisation
echo "💾 Gestion des modifications locales..." >> $LOG_FILE 2>&1

# Sauvegarder les modifications locales si nécessaire
if ! git diff-index --quiet HEAD --; then
    echo "💾 Sauvegarde des modifications locales..." >> $LOG_FILE 2>&1
    git stash >> $LOG_FILE 2>&1
fi

# Synchroniser avec le dépôt distant (gestion des conflits)
echo "📥 Synchronisation avec le dépôt distant..." >> $LOG_FILE 2>&1
git fetch origin >> $LOG_FILE 2>&1

# Forcer la synchronisation en cas de conflit
if ! git reset --hard origin/$BRANCH >> $LOG_FILE 2>&1; then
    echo "⚠️ Conflit détecté, nettoyage forcé..." >> $LOG_FILE 2>&1
    git clean -fd >> $LOG_FILE 2>&1
    git reset --hard origin/$BRANCH >> $LOG_FILE 2>&1
fi

# Restaurer les modifications locales si nécessaire
if git stash list | grep -q .; then
    echo "🔄 Restauration des modifications locales..." >> $LOG_FILE 2>&1
    git stash pop >> $LOG_FILE 2>&1
fi

if [ $? -eq 0 ]; then
    echo "[2/4] 📦 Installation des dépendances..." >> $LOG_FILE 2>&1
    update_status "installing" "Installation des dépendances..."
    
    # Installer les dépendances
    npm install --production >> $LOG_FILE 2>&1
    
    if [ $? -eq 0 ]; then
        echo "[3/4] 🔨 Compilation..." >> $LOG_FILE 2>&1
        update_status "building" "Compilation du projet..."
        
        # Rebuild du projet NestJS
        npm run build >> $LOG_FILE 2>&1
        
        if [ $? -eq 0 ]; then
            echo "[4/4] 🔄 Redémarrage..." >> $LOG_FILE 2>&1
            update_status "restarting" "Redémarrage de l'application..."
            
            # Redémarrer Passenger (cPanel)
            touch tmp/restart.txt
            
            echo "✅ Déploiement terminé avec succès le $(date)" >> $LOG_FILE 2>&1
            update_status "success" "Déploiement terminé avec succès"
        else
            echo "❌ Erreur lors de la compilation" >> $LOG_FILE 2>&1
            update_status "error" "Erreur lors de la compilation"
        fi
    else
        echo "❌ Erreur lors de l'installation des dépendances" >> $LOG_FILE 2>&1
        update_status "error" "Erreur lors de l'installation des dépendances"
    fi
else
    echo "❌ Erreur lors du pull Git" >> $LOG_FILE 2>&1
    update_status "error" "Erreur lors du pull Git"
fi
