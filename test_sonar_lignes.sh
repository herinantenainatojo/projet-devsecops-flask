#!/bin/bash

# Comptage propre : uniquement fichiers Python du projet
count_lines() {
    find . \
        -type f \
        -name "*.py" \
        -not -path "./venv/*" \
        -not -path "./.venv/*" \
        -not -path "./__pycache__/*" \
        -not -path "./tests/*" \
        -not -path "./migrations/*" \
        -not -path "./.git/*" \
        -exec wc -l {} + | awk '{total += $1} END {print total}'
}

echo "===== TEST LIGNES DE CODE ====="

echo "🔹 Comptage des lignes AVANT..."
LINES_BEFORE=$(count_lines)
echo "➡ Lignes AVANT : $LINES_BEFORE"

echo ""
echo "🔹 Lancement du SonarScanner..."
sonar-scanner
echo ""

echo "⏳ Modifie un fichier .py puis appuie sur ENTER..."
read

echo "🔹 Comptage des lignes APRÈS..."
LINES_AFTER=$(count_lines)
echo "➡ Lignes APRÈS : $LINES_AFTER"
echo ""

DIFF=$((LINES_AFTER - LINES_BEFORE))

echo "===== RÉSULTATS ====="
echo "📌 Avant : $LINES_BEFORE"
echo "📌 Après : $LINES_AFTER"

if [ $DIFF -gt 0 ]; then
    echo "🟩 ➕ $DIFF lignes ajoutées"
elif [ $DIFF -lt 0 ]; then
    echo "🟥 ➖ $(( -DIFF )) lignes supprimées"
else
    echo "🟦 Aucune modification détectée"
fi

echo "================================="
