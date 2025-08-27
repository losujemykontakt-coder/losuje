#!/bin/bash

echo "🔄 Kompletna aktualizacja - usunięcie komunikatów o błędach..."

# 1. Pobierz najnowsze zmiany
echo "📥 Pobieranie zmian z Git..."
cd /var/www/losuje.pl/lotek
git pull origin main

# 2. Usuń komunikaty o błędach
echo "🗑️ Usuwanie komunikatów o błędach..."
chmod +x remove-error-messages.sh
./remove-error-messages.sh

# 3. Zbuduj frontend
echo "🏗️ Budowanie frontendu..."
cd frontend
npm install
npm run build

# 4. Zrestartuj backend
echo "🔄 Restart backendu..."
pm2 restart lotek-backend

# 5. Sprawdź status
echo "📊 Sprawdzanie statusu..."
pm2 status
pm2 logs lotek-backend --lines 10

# 6. Zbuduj PWA
echo "📱 Budowanie PWA..."
./DEPLOY_PWA_SEPARATE.sh

echo "✅ Aktualizacja zakończona!"
echo "🌐 Sprawdź: https://losuje.pl"
echo "📱 Sprawdź: https://losuje-generator.pl"





