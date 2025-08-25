#!/bin/bash

echo "🔄 Restart backendu z nową konfiguracją CORS..."

# Katalog backend
BACKEND_DIR="/var/www/losuje.pl/lotek/backend"

# Przejdź do katalogu backend
cd "$BACKEND_DIR"

# Sprawdź czy pliki zostały zaktualizowane
echo "📝 Sprawdzanie konfiguracji CORS..."

# Sprawdź czy losuje-generator.pl jest w allowedOrigins
if grep -q "losuje-generator.pl" index.js; then
    echo "✅ CORS: losuje-generator.pl jest w konfiguracji"
else
    echo "❌ CORS: losuje-generator.pl NIE jest w konfiguracji"
    echo "🔧 Dodawanie losuje-generator.pl do CORS..."
    
    # Dodaj losuje-generator.pl do wszystkich wystąpień allowedOrigins
    sed -i "s/'https:\/\/losuje.pl'/'https:\/\/losuje.pl', 'https:\/\/losuje-generator.pl'/g" index.js
    sed -i "s/'http:\/\/localhost:3000'/'http:\/\/localhost:3000', 'https:\/\/losuje-generator.pl'/g" index.js
    
    echo "✅ CORS zaktualizowany"
fi

# Sprawdź konfigurację
echo "📋 Konfiguracja CORS w index.js:"
grep -A 5 -B 5 "allowedOrigins" index.js

# Restart backendu
echo "🔄 Restart backendu..."
pm2 restart lotek-backend

# Sprawdź status
echo "📊 Status po restarcie:"
pm2 list

# Poczekaj chwilę
echo "⏳ Czekam 5 sekund..."
sleep 5

# Sprawdź logi
echo "📋 Logi po restarcie:"
pm2 logs lotek-backend --lines 10

echo "✅ Backend zrestartowany!"
echo "🌐 Sprawdź: https://losuje-generator.pl/"
