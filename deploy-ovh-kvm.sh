#!/bin/bash

echo "🚀 Automatyczne wdrożenie na OVH przez KVM..."
echo "📅 Data: $(date)"
echo ""

# Kolory
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Funkcja do sprawdzania statusu
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

# 1. Przejdź do katalogu aplikacji
echo "📁 Przechodzę do katalogu aplikacji..."
cd /var/www/losuje.pl
check_status "Przejście do katalogu aplikacji"

# 2. Pobierz najnowsze zmiany z Git
echo "📥 Pobieram najnowsze zmiany z Git..."
git pull origin main
check_status "Pobranie zmian z Git"

# 3. Sprawdź czy backend działa
echo "🔍 Sprawdzam status backendu..."
pm2 status
if pm2 status | grep -q "online"; then
    echo -e "${GREEN}✅ Backend działa${NC}"
else
    echo -e "${YELLOW}⚠️ Backend nie działa - uruchamiam...${NC}"
    pm2 start ecosystem.config.js
    check_status "Uruchomienie backendu"
fi

# 4. Sprawdź Firebase Admin
echo "🔥 Sprawdzam Firebase Admin..."
if [ -f "test-firebase-admin.js" ]; then
    node test-firebase-admin.js
    check_status "Test Firebase Admin"
else
    echo -e "${YELLOW}⚠️ Plik test-firebase-admin.js nie istnieje${NC}"
fi

# 5. Sprawdź ścieżki frontendu
echo "📁 Sprawdzam ścieżki frontendu..."
if [ -f "check-frontend-paths.sh" ]; then
    chmod +x check-frontend-paths.sh
    ./check-frontend-paths.sh
else
    echo -e "${YELLOW}⚠️ Plik check-frontend-paths.sh nie istnieje${NC}"
fi

# 6. Wdróż konfigurację nginx
echo "🌐 Wdrażam konfigurację nginx..."
if [ -f "deploy-nginx-config.sh" ]; then
    chmod +x deploy-nginx-config.sh
    ./deploy-nginx-config.sh
    check_status "Wdrożenie konfiguracji nginx"
else
    echo -e "${RED}❌ Plik deploy-nginx-config.sh nie istnieje${NC}"
fi

# 7. Sprawdź status nginx
echo "🔍 Sprawdzam status nginx..."
systemctl status nginx --no-pager -l
nginx -t
check_status "Sprawdzenie konfiguracji nginx"

# 8. Sprawdź działanie domen
echo "🌐 Sprawdzam działanie domen..."
if [ -f "check-domains.sh" ]; then
    chmod +x check-domains.sh
    ./check-domains.sh
else
    echo -e "${YELLOW}⚠️ Plik check-domains.sh nie istnieje${NC}"
fi

# 9. Sprawdź backend API
echo "🔧 Sprawdzam backend API..."
curl -s http://localhost:3002/health
check_status "Sprawdzenie backend API"

# 10. Sprawdź porty
echo "🔌 Sprawdzam otwarte porty..."
netstat -tlnp | grep :3002
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# 11. Sprawdź uprawnienia
echo "🔐 Sprawdzam uprawnienia..."
ls -la /var/www/
check_status "Sprawdzenie uprawnień"

# 12. Restart PM2
echo "🔄 Restartuję PM2..."
pm2 restart all
pm2 save
check_status "Restart PM2"

# 13. Sprawdź logi
echo "📋 Sprawdzam logi..."
pm2 logs --lines 10

echo ""
echo "🎉 Wdrożenie zakończone!"
echo ""
echo "📋 Podsumowanie:"
echo "   - Backend: $(pm2 status | grep -c 'online') procesów online"
echo "   - Nginx: $(systemctl is-active nginx)"
echo "   - Port 3002: $(netstat -tlnp | grep :3002 | wc -l) procesów"
echo ""
echo "🔧 Aby sprawdzić logi:"
echo "   - PM2: pm2 logs --lines 50"
echo "   - Nginx: tail -f /var/log/nginx/error.log"
echo "   - System: journalctl -u nginx -f"
