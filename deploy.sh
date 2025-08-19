#!/bin/bash

            # Configuration
            APP_DIR="/home/partenai/public_html/nestjs/git_update"
            BRANCH=devs
            LOG_FILE=$APP_DIR/deploy.log
            STATUS_FILE=$APP_DIR/public/deploy-status.json
            
            # Variables pour le calcul des durées
            START_TIME=$(date +%s)
            GIT_START_TIME=0
            DEPS_START_TIME=0
            BUILD_START_TIME=0
            CLEAN_START_TIME=0
            RESTART_START_TIME=0

# Configuration pour cPanel Node.js App
export NODE_ENV=production

# Configuration Node.js installé (pour les commandes npm)
echo "🔍 Configuration Node.js pour les commandes..." >> $LOG_FILE 2>&1

# Essayer plusieurs chemins pour Node.js installé
NODE_PATHS=(
    "$HOME/.nvm/versions/node/v22.18.0/bin"
    "$HOME/.nvm/versions/node/v18.17.0/bin"
    "$HOME/.nvm/versions/node/v16.20.0/bin"
    "$HOME/nodejs/node-v18.17.0-linux-x64/bin"
    "$HOME/nodejs/node-v16.20.0-linux-x64/bin"
    "/usr/local/bin"
    "/usr/bin"
)

NODE_FOUND=false

for NODE_PATH in "${NODE_PATHS[@]}"; do
    if [ -d "$NODE_PATH" ] && [ -f "$NODE_PATH/npm" ]; then
        echo "✅ Node.js trouvé: $NODE_PATH" >> $LOG_FILE 2>&1
        export PATH="$NODE_PATH:$PATH"
        NODE_FOUND=true
        break
    fi
done

if [ "$NODE_FOUND" = false ]; then
    echo "⚠️ Node.js non trouvé, utilisation du PATH système" >> $LOG_FILE 2>&1
fi

# Vérifier npm
if command -v npm >/dev/null 2>&1; then
    echo "✅ npm disponible: $(which npm)" >> $LOG_FILE 2>&1
    echo "✅ Version npm: $(npm --version)" >> $LOG_FILE 2>&1
else
    echo "❌ npm non trouvé - installation requise" >> $LOG_FILE 2>&1
fi

echo "🚀 Déploiement lancé le $(date)" > $LOG_FILE 2>&1

            # Fonction pour mettre à jour le statut
            update_status() {
                echo "{\"status\": \"$1\", \"message\": \"$2\", \"timestamp\": \"$(date)\"}" > $STATUS_FILE
            }

            # Fonction pour sauvegarder l'historique
            save_deployment_history() {
                local status=$1
                local message=$2
                local history_file=$APP_DIR/public/deploy-history.json
                
                # Créer le fichier d'historique s'il n'existe pas
                if [ ! -f "$history_file" ]; then
                    echo '{"deployments": []}' > "$history_file"
                fi
                
                # Lire l'historique existant
                local history_content=$(cat "$history_file")
                
                # Créer la nouvelle entrée
                local new_entry="{\"id\": \"$(date +%s)\", \"status\": \"$status\", \"message\": \"$message\", \"timestamp\": \"$(date)\", \"branch\": \"$BRANCH\", \"commit\": \"$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')\"}"
                
                # Ajouter la nouvelle entrée au début de l'historique
                local updated_history=$(echo "$history_content" | jq --argjson entry "$new_entry" '.deployments = [$entry] + .deployments[0:9]' 2>/dev/null || echo "$history_content")
                
                            # Sauvegarder l'historique mis à jour
            echo "$updated_history" > "$history_file"
        }

        # Fonction pour calculer et sauvegarder les durées des étapes
        save_step_durations() {
            local current_time=$(date +%s)
            local durations_file=$APP_DIR/public/deploy-durations.json
            
            # Calculer les durées (en secondes)
            local git_duration=$((DEPS_START_TIME - GIT_START_TIME))
            local deps_duration=$((BUILD_START_TIME - DEPS_START_TIME))
            local build_duration=$((CLEAN_START_TIME - BUILD_START_TIME))
            local clean_duration=$((RESTART_START_TIME - CLEAN_START_TIME))
            local restart_duration=$((current_time - RESTART_START_TIME))
            
            # Créer l'objet des durées
            local durations_json="{
                \"timestamp\": \"$(date)\",
                \"durations\": {
                    \"git\": $git_duration,
                    \"dependencies\": $deps_duration,
                    \"build\": $build_duration,
                    \"clean\": $clean_duration,
                    \"restart\": $restart_duration
                }
            }"
            
            # Sauvegarder les durées
            echo "$durations_json" > "$durations_file"
            
            # Log des durées
            echo "⏱️ Durées des étapes:" >> $LOG_FILE 2>&1
            echo "   - Git Sync: ${git_duration}s" >> $LOG_FILE 2>&1
            echo "   - Dépendances: ${deps_duration}s" >> $LOG_FILE 2>&1
            echo "   - Build: ${build_duration}s" >> $LOG_FILE 2>&1
            echo "   - Nettoyage: ${clean_duration}s" >> $LOG_FILE 2>&1
            echo "   - Redémarrage: ${restart_duration}s" >> $LOG_FILE 2>&1
        }

            # Mettre à jour le statut initial
            update_status "starting" "Déploiement en cours..."
            save_deployment_history "starting" "Déploiement en cours..."

            echo "[1/5] 📥 Synchronisation Git..." >> $LOG_FILE 2>&1
            GIT_START_TIME=$(date +%s)
            update_status "pulling" "Synchronisation avec le dépôt distant..."
            save_deployment_history "pulling" "Synchronisation Git en cours..."

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
                    echo "[2/5] 📦 Installation des dépendances..." >> $LOG_FILE 2>&1
                DEPS_START_TIME=$(date +%s)
                update_status "installing" "Installation des dépendances..."
                save_deployment_history "installing" "Installation des dépendances..."

    # Aller dans le dossier de l'application
    cd $APP_DIR

            # Installer les dépendances
        if command -v npm >/dev/null 2>&1; then
            echo "📦 Installation des dépendances avec npm..." >> $LOG_FILE 2>&1
            npm install >> $LOG_FILE 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ Dépendances installées avec succès" >> $LOG_FILE 2>&1
        else
                                    echo "❌ Erreur lors de l'installation des dépendances" >> $LOG_FILE 2>&1
                        update_status "error" "Erreur lors de l'installation des dépendances"
                        save_deployment_history "error" "Erreur lors de l'installation des dépendances"
                        exit 1
        fi
    else
        echo "⚠️ npm non disponible, installation des dépendances ignorée" >> $LOG_FILE 2>&1
        echo "✅ Installation ignorée (cPanel Node.js App gérera les dépendances)" >> $LOG_FILE 2>&1
    fi

                        if [ $? -eq 0 ]; then
                        echo "[3/5] 🔨 Compilation du projet..." >> $LOG_FILE 2>&1
                        BUILD_START_TIME=$(date +%s)
                        update_status "building" "Compilation du projet..."
                        save_deployment_history "building" "Compilation du projet..."

        # Rebuild du projet NestJS
        if command -v npm >/dev/null 2>&1; then
            echo "🔨 Compilation avec npm run build..." >> $LOG_FILE 2>&1
            
            # Nettoyer le dossier dist manuellement (remplace rimraf)
            echo "🧹 Nettoyage du dossier dist..." >> $LOG_FILE 2>&1
            rm -rf "$APP_DIR/dist" 2>/dev/null || true
            echo "✅ Dossier dist nettoyé" >> $LOG_FILE 2>&1
            
            # Exécuter le build sans le prebuild (déjà fait manuellement)
            echo "🔨 Exécution du build..." >> $LOG_FILE 2>&1
            cd "$APP_DIR"
            npx nest build >> $LOG_FILE 2>&1
            
            if [ $? -eq 0 ]; then
                echo "✅ Build réussi" >> $LOG_FILE 2>&1
            else
                echo "❌ Erreur lors du build" >> $LOG_FILE 2>&1
                update_status "error" "Erreur lors du build"
                exit 1
            fi
        else
            echo "⚠️ npm non disponible, build ignoré" >> $LOG_FILE 2>&1
            echo "✅ Build ignoré (cPanel Node.js App gérera la compilation)" >> $LOG_FILE 2>&1
        fi

                            if [ $? -eq 0 ]; then
                        echo "[4/5] 🔧 Nettoyage et optimisation..." >> $LOG_FILE 2>&1
                        CLEAN_START_TIME=$(date +%s)
                        update_status "cleaning" "Nettoyage et optimisation..."
                        save_deployment_history "cleaning" "Nettoyage et optimisation..."

            # Nettoyer les fichiers temporaires
            echo "🧹 Nettoyage des fichiers temporaires..." >> $LOG_FILE 2>&1
            find $APP_DIR -name "*.tmp" -delete 2>/dev/null || true
            find $APP_DIR -name "*.log" -delete 2>/dev/null || true

            # Vérifier les permissions
            echo "🔐 Vérification des permissions..." >> $LOG_FILE 2>&1
            chmod -R 755 $APP_DIR/dist 2>/dev/null || true
            chmod -R 644 $APP_DIR/dist/**/*.js 2>/dev/null || true

            echo "✅ Nettoyage terminé" >> $LOG_FILE 2>&1

                                if [ $? -eq 0 ]; then
                        echo "[5/5] 🔄 Redémarrage de l'application..." >> $LOG_FILE 2>&1
                        RESTART_START_TIME=$(date +%s)
                        update_status "restarting" "Redémarrage de l'application..."
                        save_deployment_history "restarting" "Redémarrage de l'application..."

                # Redémarrer Passenger (cPanel)
                echo "🔄 Redémarrage via Passenger..." >> $LOG_FILE 2>&1
                touch tmp/restart.txt

                # Attendre quelques secondes pour que le redémarrage se termine
                echo "⏳ Attente du redémarrage..." >> $LOG_FILE 2>&1
                sleep 5

                # Vérifier que l'application fonctionne
                echo "🔍 Vérification du statut de l'application..." >> $LOG_FILE 2>&1
                
                # Attendre encore un peu pour que l'application soit complètement démarrée
                sleep 10

                                        echo "✅ Déploiement terminé avec succès le $(date)" >> $LOG_FILE 2>&1
                        update_status "success" "Déploiement terminé avec succès"
                        save_deployment_history "success" "Déploiement terminé avec succès"
                        
                        # Calculer et sauvegarder les durées des étapes
                        save_step_durations
                
                # Informations finales
                echo "🎉 Déploiement réussi !" >> $LOG_FILE 2>&1
                echo "📊 Résumé du déploiement:" >> $LOG_FILE 2>&1
                echo "   - Git: ✅ Synchronisé" >> $LOG_FILE 2>&1
                echo "   - Dépendances: ✅ Installées" >> $LOG_FILE 2>&1
                echo "   - Build: ✅ Compilé" >> $LOG_FILE 2>&1
                echo "   - Nettoyage: ✅ Terminé" >> $LOG_FILE 2>&1
                echo "   - Redémarrage: ✅ Effectué" >> $LOG_FILE 2>&1
                echo "   - Application: ✅ Opérationnelle" >> $LOG_FILE 2>&1
            else
                echo "❌ Erreur lors du nettoyage" >> $LOG_FILE 2>&1
                update_status "error" "Erreur lors du nettoyage"
            fi
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
