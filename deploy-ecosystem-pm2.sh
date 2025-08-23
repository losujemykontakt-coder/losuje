#!/bin/bash

# Skrypt do wdrożenia ecosystem.config.js na serwer OVH
# Wykonaj: chmod +x deploy-ecosystem-pm2.sh && ./deploy-ecosystem-pm2.sh

echo "=== WDRAŻANIE ECOSYSTEM.CONFIG.JS NA SERWER OVH ==="

# Sprawdź czy plik ecosystem.config.js istnieje
if [ ! -f "ecosystem.config.js" ]; then
    echo "❌ Błąd: Plik ecosystem.config.js nie istnieje!"
    exit 1
fi

echo "✅ Plik ecosystem.config.js znaleziony"

# Komendy do wykonania na serwerze
echo ""
echo "=== KOMENDY DO WYKONANIA NA SERWERZE OVH ==="
echo ""
echo "1. Zaloguj się do OVH KVM (Konsola) dla serwera 51.77.220.61"
echo "2. Zaloguj się jako root na serwerze"
echo "3. Wykonaj poniższe komendy po kolei:"
echo ""

echo "# Przejdź do katalogu aplikacji"
echo "cd /var/www/losuje.pl/lotek"
echo ""

echo "# Pobierz najnowsze zmiany z GitHub"
echo "git fetch origin"
echo "git reset --hard origin/main"
echo ""

echo "# Sprawdź czy pliki .env istnieją"
echo "ls -la backend/.env"
echo "ls -la frontend/.env"
echo ""

echo "# Jeśli pliki .env nie istnieją, skopiuj je z przykładów"
echo "# Backend:"
echo "cp backend/env.example backend/.env"
echo ""

echo "# Frontend:"
echo "cp frontend/env.example frontend/.env"
echo ""

echo "# Edytuj pliki .env z prawdziwymi danymi"
echo "nano backend/.env"
echo "nano frontend/.env"
echo ""

echo "# Zatrzymaj obecne procesy PM2"
echo "pm2 stop lotek-backend"
echo "pm2 delete lotek-backend"
echo ""

echo "# Uruchom aplikacje z nową konfiguracją PM2"
echo "pm2 start ecosystem.config.js"
echo ""

echo "# Zapisz konfigurację PM2"
echo "pm2 save"
echo ""

echo "# Sprawdź status"
echo "pm2 status"
echo "pm2 logs lotek-backend --lines 10"
echo ""

echo "# Sprawdź czy aplikacja działa"
echo "curl -I http://localhost:3001"
echo ""

echo "=== KONIEC KOMEND ==="
echo ""
echo "💡 Wskazówki:"
echo "- Upewnij się, że pliki .env zawierają prawdziwe dane (PayPal, Przelewy24, etc.)"
echo "- Sprawdź logi PM2 jeśli coś nie działa: pm2 logs"
echo "- Restartuj aplikację: pm2 restart lotek-backend"
echo "- Sprawdź status: pm2 status"




