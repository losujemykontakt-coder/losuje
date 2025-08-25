#!/bin/bash

echo "🚨 AWARYJNA NAPRAWA BACKENDU..."

# Katalog projektu
PROJECT_DIR="/var/www/losuje.pl/lotek"

# Przejdź do katalogu projektu
cd "$PROJECT_DIR"

echo "📊 Sprawdzanie statusu procesów..."
pm2 list

echo ""
echo "🔍 Sprawdzanie czy backend odpowiada..."
curl -I http://localhost:3001/api/health

echo ""
echo "🔍 Sprawdzanie logi backendu..."
pm2 logs lotek-backend --lines 20

echo ""
echo "🔄 Restart backendu..."
pm2 restart lotek-backend

echo ""
echo "⏳ Czekam 10 sekund..."
sleep 10

echo ""
echo "🔍 Sprawdzanie po restarcie..."
curl -I http://localhost:3001/api/health

echo ""
echo "📊 Status po restarcie..."
pm2 list

echo ""
echo "🔍 Test API..."
curl http://localhost:3001/api/health

echo ""
echo "🔍 Test CORS..."
curl -H "Origin: https://losuje-generator.pl" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:3001/api/health

echo ""
echo "✅ Naprawa zakończona!"
echo "🌐 Sprawdź: https://losuje-generator.pl/"
