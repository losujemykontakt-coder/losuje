#!/bin/bash

echo "🔧 Wdrażanie konfiguracji Nginx z CORS..."

# Katalog projektu
PROJECT_DIR="/var/www/losuje.pl/lotek"

# Przejdź do katalogu projektu
cd "$PROJECT_DIR"

# Backup obecnej konfiguracji Nginx
echo "📋 Tworzenie backup konfiguracji Nginx..."
sudo cp /etc/nginx/sites-available/losuje.pl /etc/nginx/sites-available/losuje.pl.backup.$(date +%Y%m%d_%H%M%S)

# Skopiuj nową konfigurację
echo "📝 Kopiowanie nowej konfiguracji Nginx..."
sudo cp nginx-losuje-cors.conf /etc/nginx/sites-available/losuje.pl

# Sprawdź konfigurację Nginx
echo "🔍 Sprawdzanie konfiguracji Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Konfiguracja Nginx poprawna!"
    
    # Przeładuj Nginx
    echo "🔄 Przeładowanie Nginx..."
    sudo systemctl reload nginx
    
    # Sprawdź status Nginx
    echo "📊 Status Nginx:"
    sudo systemctl status nginx --no-pager -l
    
    # Test CORS
    echo "🧪 Test CORS..."
    curl -H "Origin: https://losuje-generator.pl" \
         -H "Access-Control-Request-Method: GET" \
         -H "Access-Control-Request-Headers: Content-Type" \
         -X OPTIONS \
         https://losuje.pl/api/health
    
    echo ""
    echo "✅ Konfiguracja Nginx z CORS wdrożona!"
    echo "🌐 Sprawdź: https://losuje-generator.pl/"
    
else
    echo "❌ Błąd konfiguracji Nginx!"
    echo "🔄 Przywracanie backup..."
    sudo cp /etc/nginx/sites-available/losuje.pl.backup.* /etc/nginx/sites-available/losuje.pl
    sudo nginx -t
    echo "✅ Backup przywrócony!"
    exit 1
fi
