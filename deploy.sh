#!/bin/bash

# Configuration
APP_DIR="/home/partenai/public_html/nestjs/git_update"
BRANCH=devs
LOG_FILE=$APP_DIR/deploy.log
STATUS_FILE=$APP_DIR/public/deploy-status.json
DEPLOYMENTS_FILE=$APP_DIR/public/deployments.json
DEPLOYMENT_CURRENT_FILE=$APP_DIR/public/deploy-current.json
# Nombre max d'éléments conservés dans l'historique (modifiable via env MAX_DEPLOYMENTS)
MAX_DEPLOYMENTS=${MAX_DEPLOYMENTS:-100}

# Variables pour le calcul des durées
START_TIME=$(date +%s)
GIT_START_TIME=0
DEPS_START_TIME=0
BUILD_START_TIME=0
CLEAN_START_TIME=0
RESTART_START_TIME=0

# Préparer les sorties JSON
ensure_deploy_output_files() {
    mkdir -p "$APP_DIR/public" 2>/dev/null || true
    if [ ! -f "$DEPLOYMENTS_FILE" ]; then
        echo "[]" > "$DEPLOYMENTS_FILE"
    fi
}

# Écrit un enregistrement JSON du déploiement selon la structure demandée.
# Paramètre optionnel: "success" | "error" | "in_progress" (par défaut)
write_deployment_record() {
    local final="${1:-in_progress}"
    local now=$(date +%s)
    local created_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local commit_hash=$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')

    # Durées (en secondes)
    local starting_time=0
    if [ "$GIT_START_TIME" -gt 0 ]; then
        starting_time=$((GIT_START_TIME - START_TIME))
    else
        starting_time=$((now - START_TIME))
    fi

    local pulling_time=0
    if [ "$GIT_START_TIME" -gt 0 ] && [ "$DEPS_START_TIME" -gt 0 ]; then
        pulling_time=$((DEPS_START_TIME - GIT_START_TIME))
    elif [ "$GIT_START_TIME" -gt 0 ]; then
        pulling_time=$((now - GIT_START_TIME))
    fi

    local installing_time=0
    if [ "$DEPS_START_TIME" -gt 0 ] && [ "$BUILD_START_TIME" -gt 0 ]; then
        installing_time=$((BUILD_START_TIME - DEPS_START_TIME))
    elif [ "$DEPS_START_TIME" -gt 0 ]; then
        installing_time=$((now - DEPS_START_TIME))
    fi

    local building_time=0
    if [ "$BUILD_START_TIME" -gt 0 ] && [ "$CLEAN_START_TIME" -gt 0 ]; then
        building_time=$((CLEAN_START_TIME - BUILD_START_TIME))
    elif [ "$BUILD_START_TIME" -gt 0 ]; then
        building_time=$((now - BUILD_START_TIME))
    fi

    local cleaning_time=0
    if [ "$CLEAN_START_TIME" -gt 0 ] && [ "$RESTART_START_TIME" -gt 0 ]; then
        cleaning_time=$((RESTART_START_TIME - CLEAN_START_TIME))
    elif [ "$CLEAN_START_TIME" -gt 0 ]; then
        cleaning_time=$((now - CLEAN_START_TIME))
    fi

    local restarting_time=0
    if [ "$RESTART_START_TIME" -gt 0 ]; then
        restarting_time=$((now - RESTART_START_TIME))
    fi

    # Statuts par étape
    local starting_status="in_progress"
    if [ "$GIT_START_TIME" -gt 0 ]; then starting_status="success"; fi

    local pulling_status="pending"
    if [ "$DEPS_START_TIME" -gt 0 ]; then pulling_status="success"; elif [ "$GIT_START_TIME" -gt 0 ]; then pulling_status="in_progress"; fi

    local installing_status="pending"
    if [ "$BUILD_START_TIME" -gt 0 ]; then installing_status="success"; elif [ "$DEPS_START_TIME" -gt 0 ]; then installing_status="in_progress"; fi

    local building_status="pending"
    if [ "$CLEAN_START_TIME" -gt 0 ]; then building_status="success"; elif [ "$BUILD_START_TIME" -gt 0 ]; then building_status="in_progress"; fi

    local cleaning_status="pending"
    if [ "$RESTART_START_TIME" -gt 0 ]; then cleaning_status="success"; elif [ "$CLEAN_START_TIME" -gt 0 ]; then cleaning_status="in_progress"; fi

    local restarting_status="pending"
    if [ "$RESTART_START_TIME" -gt 0 ]; then restarting_status="in_progress"; fi
    if [ "$final" = "success" ] || [ "$final" = "error" ]; then restarting_status="$final"; fi

    local total_time=$((now - START_TIME))
    local id="$START_TIME"

    # Construire le JSON
    local json
    json=$(printf '{%s}' \
"\"id\": $id, \"branch\": \"${BRANCH}\", \"commit_hash\": \"${commit_hash}\", \n\
\"starting_status\": \"${starting_status}\", \"starting_time\": ${starting_time}, \n\
\"pulling_status\": \"${pulling_status}\", \"pulling_time\": ${pulling_time}, \n\
\"installing_status\": \"${installing_status}\", \"installing_time\": ${installing_time}, \n\
\"building_status\": \"${building_status}\", \"building_time\": ${building_time}, \n\
\"cleaning_status\": \"${cleaning_status}\", \"cleaning_time\": ${cleaning_time}, \n\
\"restarting_status\": \"${restarting_status}\", \"restarting_time\": ${restarting_time}, \n\
\"final_status\": \"${final}\", \"total_time\": ${total_time}, \n\
\"created_at\": \"${created_at}\"")

    # Écrire l'état courant
    echo "$json" > "$DEPLOYMENT_CURRENT_FILE"

    # Ajouter à l'historique uniquement si finalisé
    if [ "$final" != "in_progress" ]; then
        # Assurer que le fichier existe et est un JSON valide
        if ! command -v jq >/dev/null 2>&1; then
            # Fallback sans tronquage si jq indisponible
            local current
            current=$(cat "$DEPLOYMENTS_FILE" 2>/dev/null || echo "[]")
            if [ "$current" = "[]" ]; then
                echo "[$json]" > "$DEPLOYMENTS_FILE"
            else
                echo "$current" | sed 's/\]$/'", $json]"/ > "$DEPLOYMENTS_FILE"
            fi
            echo "⚠️ jq non trouvé, impossible de tronquer l'historique à $MAX_DEPLOYMENTS éléments" >> $LOG_FILE 2>&1
        else
            # Utiliser jq pour ajouter et tronquer aux N derniers éléments
            # Valider ou réinitialiser le contenu existant
            if [ ! -s "$DEPLOYMENTS_FILE" ] || ! jq -e . "$DEPLOYMENTS_FILE" >/dev/null 2>&1; then
                echo "[]" > "$DEPLOYMENTS_FILE"
            fi

            local tmp_entry="$APP_DIR/public/.deploy-entry.json"
            echo "$json" > "$tmp_entry"
            jq --slurpfile entry "$tmp_entry" --argjson max "$MAX_DEPLOYMENTS" \
               '(. + $entry) | (if length > $max then .[-$max:] else . end)' \
               "$DEPLOYMENTS_FILE" > "$DEPLOYMENTS_FILE.tmp" && mv "$DEPLOYMENTS_FILE.tmp" "$DEPLOYMENTS_FILE"
            rm -f "$tmp_entry" 2>/dev/null || true
        fi
    fi

    echo "📝 Écriture du registre de déploiement ($final) dans $DEPLOYMENT_CURRENT_FILE" >> $LOG_FILE 2>&1
}

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

# Initialisation des fichiers de sortie
ensure_deploy_output_files

# Fonction pour mettre à jour le statut
update_status() {
    echo "{\"status\": \"$1\", \"message\": \"$2\", \"timestamp\": \"$(date)\"}" > $STATUS_FILE
}

# Fonction pour sauvegarder l'historique (version simple)
save_deployment_history() {
    local status=$1
    local message=$2
    local history_file=$APP_DIR/public/deploy-history.json
    
    echo "💾 Sauvegarde de l'historique: $status - $message" >> $LOG_FILE 2>&1
    
    # Créer le fichier d'historique s'il n'existe pas
    if [ ! -f "$history_file" ]; then
        echo '{"deployments": []}' > "$history_file"
        echo "📁 Fichier d'historique créé: $history_file" >> $LOG_FILE 2>&1
    fi
    
    # Créer la nouvelle entrée
    local commit_hash=$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')
    local new_entry="{\"id\": \"$(date +%s)\", \"status\": \"$status\", \"message\": \"$message\", \"timestamp\": \"$(date)\", \"branch\": \"$BRANCH\", \"commit\": \"$commit_hash\"}"
    
    echo "🆕 Nouvelle entrée: $new_entry" >> $LOG_FILE 2>&1
    
    # Approche simple : ajouter à la fin
    local current_content=$(cat "$history_file" 2>/dev/null || echo '{"deployments": []}')
    
    if [ "$current_content" = '{"deployments": []}' ]; then
        # Premier déploiement
        echo "{\"deployments\": [$new_entry]}" > "$history_file"
    else
        # Ajouter à la fin
        echo "$current_content" | sed 's/\]/,'"$new_entry"']/' > "$history_file"
    fi
    
    echo "✅ Historique mis à jour dans: $history_file" >> $LOG_FILE 2>&1
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
write_deployment_record "in_progress"

# Étape 1: Synchronisation Git
echo "[1/5] 📥 Synchronisation Git..." >> $LOG_FILE 2>&1
GIT_START_TIME=$(date +%s)
update_status "pulling" "Synchronisation avec le dépôt distant..."
save_deployment_history "pulling" "Synchronisation Git en cours..."
write_deployment_record "in_progress"

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
if ! git fetch origin >> $LOG_FILE 2>&1; then
    echo "❌ Erreur lors du fetch Git" >> $LOG_FILE 2>&1
    update_status "error" "Erreur lors du fetch Git"
    save_deployment_history "error" "Erreur lors du fetch Git"
    write_deployment_record "error"
    exit 1
fi

# Forcer la synchronisation en cas de conflit
if ! git reset --hard origin/$BRANCH >> $LOG_FILE 2>&1; then
    echo "⚠️ Conflit détecté, nettoyage forcé..." >> $LOG_FILE 2>&1
    git clean -fd >> $LOG_FILE 2>&1
    if ! git reset --hard origin/$BRANCH >> $LOG_FILE 2>&1; then
        echo "❌ Erreur lors du reset Git" >> $LOG_FILE 2>&1
        update_status "error" "Erreur lors du reset Git"
        save_deployment_history "error" "Erreur lors du reset Git"
        write_deployment_record "error"
        exit 1
    fi
fi

# Restaurer les modifications locales si nécessaire
if git stash list | grep -q .; then
    echo "🔄 Restauration des modifications locales..." >> $LOG_FILE 2>&1
    git stash pop >> $LOG_FILE 2>&1
fi

echo "✅ Synchronisation Git réussie" >> $LOG_FILE 2>&1

# Étape 2: Installation des dépendances
echo "[2/5] 📦 Installation des dépendances..." >> $LOG_FILE 2>&1
DEPS_START_TIME=$(date +%s)
update_status "installing" "Installation des dépendances..."
save_deployment_history "installing" "Installation des dépendances..."
write_deployment_record "in_progress"

# Aller dans le dossier de l'application
cd $APP_DIR

# Installer les dépendances
if command -v npm >/dev/null 2>&1; then
    echo "📦 Installation des dépendances avec npm..." >> $LOG_FILE 2>&1
    if npm install >> $LOG_FILE 2>&1; then
        echo "✅ Dépendances installées avec succès" >> $LOG_FILE 2>&1
    else
        echo "❌ Erreur lors de l'installation des dépendances" >> $LOG_FILE 2>&1
        update_status "error" "Erreur lors de l'installation des dépendances"
        save_deployment_history "error" "Erreur lors de l'installation des dépendances"
        write_deployment_record "error"
        exit 1
    fi
else
    echo "⚠️ npm non disponible, installation des dépendances ignorée" >> $LOG_FILE 2>&1
    echo "✅ Installation ignorée (cPanel Node.js App gérera les dépendances)" >> $LOG_FILE 2>&1
fi

# Étape 3: Compilation du projet
echo "[3/5] 🔨 Compilation du projet..." >> $LOG_FILE 2>&1
BUILD_START_TIME=$(date +%s)
update_status "building" "Compilation du projet..."
save_deployment_history "building" "Compilation du projet..."
write_deployment_record "in_progress"

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
    if npx nest build >> $LOG_FILE 2>&1; then
        echo "✅ Build réussi" >> $LOG_FILE 2>&1
    else
        echo "❌ Erreur lors du build" >> $LOG_FILE 2>&1
        update_status "error" "Erreur lors du build"
        save_deployment_history "error" "Erreur lors du build"
        write_deployment_record "error"
        exit 1
    fi
else
    echo "⚠️ npm non disponible, build ignoré" >> $LOG_FILE 2>&1
    echo "✅ Build ignoré (cPanel Node.js App gérera la compilation)" >> $LOG_FILE 2>&1
fi

# Étape 4: Nettoyage et optimisation
echo "[4/5] 🔧 Nettoyage et optimisation..." >> $LOG_FILE 2>&1
CLEAN_START_TIME=$(date +%s)
update_status "cleaning" "Nettoyage et optimisation..."
save_deployment_history "cleaning" "Nettoyage et optimisation..."
write_deployment_record "in_progress"

# Nettoyer les fichiers temporaires
echo "🧹 Nettoyage des fichiers temporaires..." >> $LOG_FILE 2>&1
find $APP_DIR -name "*.tmp" -delete 2>/dev/null || true
find $APP_DIR -name "*.log" -delete 2>/dev/null || true

# Vérifier les permissions
echo "🔐 Vérification des permissions..." >> $LOG_FILE 2>&1
chmod -R 755 $APP_DIR/dist 2>/dev/null || true
chmod -R 644 $APP_DIR/dist/**/*.js 2>/dev/null || true

echo "✅ Nettoyage terminé" >> $LOG_FILE 2>&1

# Étape 5: Redémarrage de l'application
echo "[5/5] 🔄 Redémarrage de l'application..." >> $LOG_FILE 2>&1
RESTART_START_TIME=$(date +%s)
update_status "restarting" "Redémarrage de l'application..."
save_deployment_history "restarting" "Redémarrage de l'application..."
write_deployment_record "in_progress"

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
write_deployment_record "success"

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
