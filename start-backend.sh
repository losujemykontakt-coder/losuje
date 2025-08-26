#!/bin/bash

echo "🚀 Uruchamianie backendu..."

# Przejdź do katalogu backend
cd /var/www/losuje.pl/lotek/backend

# Sprawdź czy node_modules istnieją
if [ ! -d "node_modules" ]; then
    echo "📦 Instalowanie zależności..."
    npm install
fi

# Sprawdź czy .env istnieje
if [ ! -f ".env" ]; then
    echo "⚠️ Brak pliku .env - kopiuję z przykładu..."
    cp env.example .env
fi

# Uruchom backend przez PM2
echo "🔄 Uruchamianie przez PM2..."
pm2 start index.js --name lotek-backend

# Sprawdź status
echo "📊 Status PM2:"
pm2 status

# Pokaż logi
echo "📝 Logi backendu:"
pm2 logs lotek-backend --lines 10

echo "✅ Backend uruchomiony!"




