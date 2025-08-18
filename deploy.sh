#!/bin/bash

# Configuration
APP_DIR=$(pwd)
BRANCH=main
LOG_FILE=$APP_DIR/deploy.log
STATUS_FILE=$APP_DIR/public/deploy-status.json

echo "🚀 Déploiement lancé le $(date)" > $LOG_FILE 2>&1

# Fonction pour mettre à jour le statut
update_status() {
    echo "{\"status\": \"$1\", \"message\": \"$2\", \"timestamp\": \"$(date)\"}" > $STATUS_FILE
}

# Mettre à jour le statut initial
update_status "starting" "Déploiement en cours..."

echo "[1/4] 📥 Git Pull..." >> $LOG_FILE 2>&1
update_status "pulling" "Récupération des modifications Git..."

# Récupérer les dernières modifications
git pull origin $BRANCH >> $LOG_FILE 2>&1

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
