#!/bin/bash

echo "🚀 Wdrażam konfigurację nginx dla losuje.pl i losuje-generator.pl..."

# Sprawdź czy jesteś root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ten skrypt musi być uruchomiony jako root (sudo)"
    exit 1
fi

# Kopia konfiguracji nginx
echo "📋 Kopiuję konfigurację nginx..."
cp nginx-losuje-cors.conf /etc/nginx/sites-available/losuje.pl

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

echo "🎉 Konfiguracja nginx została wdrożona pomyślnie!"
echo ""
echo "📋 Podsumowanie:"
echo ""
echo "🌐 losuje.pl (główna aplikacja):"
echo "   - Konfiguracja: /etc/nginx/sites-available/losuje.pl"
echo "   - Frontend: /var/www/losuje.pl/frontend/build"
echo "   - Backend proxy: http://127.0.0.1:3002"
echo "   - SSL: /etc/letsencrypt/live/losuje.pl/"
echo ""
echo "📱 losuje-generator.pl (PWA/TWA):"
echo "   - Frontend: /var/www/losuje-generator.pl/dist"
echo "   - SSL: /etc/letsencrypt/live/losuje-generator.pl/"
echo "   - PWA manifest i service worker"
echo ""
echo "🔧 Aby sprawdzić status nginx: systemctl status nginx"
echo "🔧 Aby sprawdzić logi nginx: tail -f /var/log/nginx/error.log"
echo "🔧 Aby sprawdzić konfigurację: nginx -t"
