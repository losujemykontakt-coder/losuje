#!/bin/bash

# Prosty skrypt do aktualizacji aplikacji przez Git
# Uruchom przez KVM na serwerze

echo "🚀 Aktualizacja aplikacji przez Git"

cd /root/lotek

# Pobierz zmiany z Git
git fetch origin
git checkout main
git pull origin main

# Zbuduj frontend
cd frontend
npm run build
cd ..

# Restart aplikacji
pm2 restart all

echo "✅ Aktualizacja zakończona!"
echo "🌐 Sprawdź: https://losuje.pl"
