#!/bin/bash

# 🔍 SKRYPT SPRAWDZANIA STATUSU PM2 I BACKENDU
# Autor: System Administrator

# Kolory dla outputu
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🔍 SPRAWDZANIE STATUSU PM2 I BACKENDU"
echo "====================================="

# 1. Sprawdź czy PM2 jest zainstalowany
print_status "1. Sprawdzam instalację PM2..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    print_success "PM2 zainstalowany (wersja: $PM2_VERSION)"
else
    print_error "PM2 nie jest zainstalowany"
    exit 1
fi

# 2. Sprawdź status wszystkich procesów PM2
print_status "2. Status procesów PM2:"
pm2 list

# 3. Sprawdź szczegółowy status
print_status "3. Szczegółowy status PM2:"
pm2 status

# 4. Sprawdź logi backendu
print_status "4. Ostatnie logi backendu (ostatnie 20 linii):"
pm2 logs lotek-backend --lines 20 --nostream

# 5. Sprawdź błędy backendu
print_status "5. Ostatnie błędy backendu:"
pm2 logs lotek-backend --err --lines 10 --nostream

# 6. Sprawdź endpointy
print_status "6. Testuję endpointy backendu..."

# Health endpoint
if curl -s -f http://localhost:3001/api/health > /dev/null; then
    print_success "Health endpoint: OK"
else
    print_warning "Health endpoint: BŁĄD"
fi

# Test endpoint
if curl -s -f http://localhost:3001/api/test > /dev/null; then
    print_success "Test endpoint: OK"
else
    print_warning "Test endpoint: BŁĄD"
fi

# 7. Sprawdź przez nginx
print_status "7. Testuję przez nginx..."
if curl -s -f https://losuje.pl/api/health > /dev/null; then
    print_success "Nginx + Backend: OK"
else
    print_warning "Nginx + Backend: BŁĄD"
fi

# 8. Sprawdź porty
print_status "8. Sprawdzam porty..."
echo "Port 3001 (backend):"
netstat -tlnp | grep :3001 || echo "Port 3001 nie jest używany"

echo "Port 80 (nginx):"
netstat -tlnp | grep :80 || echo "Port 80 nie jest używany"

echo "Port 443 (nginx SSL):"
netstat -tlnp | grep :443 || echo "Port 443 nie jest używany"

# 9. Sprawdź zasoby systemu
print_status "9. Zasoby systemu:"
echo "Użycie CPU:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1

echo "Użycie pamięci:"
free -h | grep Mem | awk '{print $3"/"$2}'

echo "Użycie dysku:"
df -h / | tail -1 | awk '{print $5}'

# 10. Sprawdź nginx
print_status "10. Status nginx:"
if systemctl is-active --quiet nginx; then
    print_success "Nginx: DZIAŁA"
else
    print_error "Nginx: NIE DZIAŁA"
fi

# 11. Sprawdź logi nginx
print_status "11. Ostatnie błędy nginx:"
tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "Brak logów błędów"

# 12. Sprawdź uptime aplikacji
print_status "12. Uptime aplikacji:"
pm2 list | grep lotek-backend | awk '{print "Backend uptime: " $8}'

# 13. Sprawdź pamięć aplikacji
print_status "13. Użycie pamięci aplikacji:"
pm2 list | grep lotek-backend | awk '{print "Backend memory: " $6}'

# 14. Sprawdź restarty
print_status "14. Liczba restartów:"
pm2 list | grep lotek-backend | awk '{print "Backend restarts: " $9}'

echo ""
echo "📊 PODSUMOWANIE:"
echo "================"

# Sprawdź czy backend działa
if pm2 list | grep -q "lotek-backend.*online"; then
    print_success "Backend: DZIAŁA"
else
    print_error "Backend: NIE DZIAŁA"
fi

# Sprawdź czy nginx działa
if systemctl is-active --quiet nginx; then
    print_success "Nginx: DZIAŁA"
else
    print_error "Nginx: NIE DZIAŁA"
fi

echo ""
echo "🔧 PRZYDATNE KOMENDY:"
echo "   pm2 restart lotek-backend     - Restart backendu"
echo "   pm2 reload lotek-backend      - Reload bez restartu"
echo "   pm2 monit                     - Monitor w czasie rzeczywistym"
echo "   pm2 logs lotek-backend -f     - Logi w czasie rzeczywistym"
echo "   systemctl restart nginx       - Restart nginx"
echo "   systemctl status nginx        - Status nginx"
