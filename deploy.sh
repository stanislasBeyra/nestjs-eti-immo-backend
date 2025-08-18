#!/bin/bash

# Configuration
APP_DIR="/home/partenai/public_html/nestjs/git_update"
BRANCH=devs
LOG_FILE=$APP_DIR/deploy.log
STATUS_FILE=$APP_DIR/public/deploy-status.json

# Configuration pour cPanel Node.js App
export NODE_ENV=production

echo "🚀 Déploiement lancé le $(date)" > $LOG_FILE 2>&1

# Fonction pour mettre à jour le statut
update_status() {
    echo "{\"status\": \"$1\", \"message\": \"$2\", \"timestamp\": \"$(date)\"}" > $STATUS_FILE
}

# Mettre à jour le statut initial
update_status "starting" "Déploiement en cours..."

            echo "[1/3] 📥 Synchronisation Git..." >> $LOG_FILE 2>&1
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
                echo "[2/3] 🔨 Compilation..." >> $LOG_FILE 2>&1
                update_status "building" "Compilation du projet..."

                # Rebuild du projet NestJS (dépendances gérées par Node Setup)
                npm run build >> $LOG_FILE 2>&1

                if [ $? -eq 0 ]; then
                    echo "[3/3] 🔄 Redémarrage..." >> $LOG_FILE 2>&1
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
    echo "❌ Erreur lors du pull Git" >> $LOG_FILE 2>&1
    update_status "error" "Erreur lors du pull Git"
fi
