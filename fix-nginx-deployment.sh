#!/bin/bash

echo "🔧 Naprawiam wdrożenie nginx..."

# Sprawdź czy jesteś root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ten skrypt musi być uruchomiony jako root (sudo)"
    exit 1
fi

# Sprawdź czy jesteśmy w odpowiednim katalogu
if [ ! -d ".git" ]; then
    echo "❌ Nie jestem w katalogu git. Przechodzę do /var/www/losuje.pl/lotek"
    cd /var/www/losuje.pl/lotek
fi

# Pobierz najnowsze zmiany z git
echo "📥 Pobieram najnowsze zmiany z git..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Błąd podczas pobierania z git"
    exit 1
fi

# Sprawdź czy plik konfiguracyjny istnieje
if [ ! -f "nginx-losuje-production.conf" ]; then
    echo "❌ Plik nginx-losuje-production.conf nie istnieje!"
    echo "📋 Dostępne pliki:"
    ls -la *.conf
    exit 1
fi

echo "✅ Plik konfiguracyjny znaleziony"

# Kopia poprawnej konfiguracji nginx
echo "📋 Kopiuję poprawną konfigurację nginx..."
cp nginx-losuje-production.conf /etc/nginx/sites-available/losuje.pl

# Sprawdź czy katalog sites-enabled istnieje
if [ ! -d "/etc/nginx/sites-enabled" ]; then
    echo "📁 Tworzę katalog sites-enabled..."
    mkdir -p /etc/nginx/sites-enabled
fi

# Aktywuj stronę
echo "🔗 Aktywuję strony..."
ln -sf /etc/nginx/sites-available/losuje.pl /etc/nginx/sites-enabled/

# Sprawdź konfigurację nginx
echo "🔍 Sprawdzam konfigurację nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Konfiguracja nginx jest poprawna"
    
    # Przeładuj nginx
    echo "🔄 Przeładowuję nginx..."
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx został przeładowany pomyślnie"
        echo "🌐 Strony są teraz aktywne"
    else
        echo "❌ Błąd podczas przeładowywania nginx"
        exit 1
    fi
else
    echo "❌ Błąd w konfiguracji nginx"
    exit 1
fi

echo "🎉 Poprawna konfiguracja nginx została wdrożona pomyślnie!"
echo ""
echo "📋 Podsumowanie:"
echo "   - Konfiguracja: /etc/nginx/sites-available/losuje.pl"
echo "   - Frontend: /var/www/losuje.pl/frontend/build"
echo "   - Backend proxy: http://127.0.0.1:3002"
echo "   - PWA: /var/www/losuje-generator.pl/dist"
echo ""
echo "🔧 Aby sprawdzić status nginx: systemctl status nginx"
echo "🔧 Aby sprawdzić logi nginx: tail -f /var/log/nginx/error.log"
