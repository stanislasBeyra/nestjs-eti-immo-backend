#!/bin/bash

# Script de test pour la fonction save_deployment_history
APP_DIR="/home/partenai/public_html/nestjs/git_update"
LOG_FILE="$APP_DIR/test-history.log"

echo "🧪 Test de la fonction save_deployment_history" > $LOG_FILE

# Fonction pour sauvegarder l'historique (copie de deploy.sh)
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
    
    # Lire l'historique existant
    local history_content=$(cat "$history_file")
    echo "📖 Historique existant lu: $history_content" >> $LOG_FILE 2>&1
    
    # Créer la nouvelle entrée
    local commit_hash="test123"
    local new_entry="{\"id\": \"$(date +%s)\", \"status\": \"$status\", \"message\": \"$message\", \"timestamp\": \"$(date)\", \"branch\": \"devs\", \"commit\": \"$commit_hash\"}"
    
    echo "🆕 Nouvelle entrée: $new_entry" >> $LOG_FILE 2>&1
    
    # Ajouter la nouvelle entrée au début de l'historique
    # Utiliser une approche plus simple sans jq
    if [ "$history_content" = '{"deployments": []}' ]; then
        # Premier déploiement
        local updated_history="{\"deployments\": [$new_entry]}"
    else
        # Ajouter au début
        local updated_history=$(echo "$history_content" | sed 's/\[/['"$new_entry"',/')
    fi
    
    echo "📝 Historique mis à jour: $updated_history" >> $LOG_FILE 2>&1
    
    # Sauvegarder l'historique mis à jour
    echo "$updated_history" > "$history_file"
    
    # Vérifier que le fichier a été écrit
    if [ -f "$history_file" ]; then
        echo "✅ Historique sauvegardé avec succès dans: $history_file" >> $LOG_FILE 2>&1
        echo "📊 Contenu final: $(cat "$history_file")" >> $LOG_FILE 2>&1
    else
        echo "❌ Erreur: Impossible de sauvegarder l'historique" >> $LOG_FILE 2>&1
    fi
}

# Test de la fonction
echo "🚀 Début des tests..." >> $LOG_FILE

# Test 1: Premier déploiement
echo "📝 Test 1: Premier déploiement" >> $LOG_FILE
save_deployment_history "starting" "Test premier déploiement"

# Test 2: Deuxième déploiement
echo "📝 Test 2: Deuxième déploiement" >> $LOG_FILE
save_deployment_history "success" "Test deuxième déploiement"

# Test 3: Troisième déploiement
echo "📝 Test 3: Troisième déploiement" >> $LOG_FILE
save_deployment_history "error" "Test troisième déploiement"

echo "✅ Tests terminés. Vérifiez le fichier: $history_file" >> $LOG_FILE
echo "📊 Contenu final de l'historique:" >> $LOG_FILE
cat "$history_file" >> $LOG_FILE 2>&1

echo "🧪 Tests terminés ! Vérifiez:"
echo "   - Logs: $LOG_FILE"
echo "   - Historique: $APP_DIR/public/deploy-history.json"
