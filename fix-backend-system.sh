#!/bin/bash

echo "🔧 NAPRAWA CAŁEGO SYSTEMU BACKENDU - losuje.pl"
echo "=============================================="

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Sprawdź czy jesteś root
if [ "$EUID" -ne 0 ]; then
    print_error "Uruchom jako root: sudo bash fix-backend-system.sh"
    exit 1
fi

echo ""

# 1. Sprawdź status systemu
print_status "1. Sprawdzam status systemu..."
echo "------------------------"

# Uptime
UPTIME=$(uptime -p)
print_info "Uptime: $UPTIME"

# Load average
LOAD=$(uptime | awk -F'load average:' '{print $2}')
print_info "Load average: $LOAD"

# Użycie pamięci
MEMORY=$(free -h | grep Mem | awk '{print $3"/"$2}')
print_info "Pamięć: $MEMORY"

# Użycie dysku
DISK=$(df -h / | tail -1 | awk '{print $3"/"$2" ("$5")"}')
print_info "Dysk: $DISK"

echo ""

# 2. Sprawdź czy aplikacja istnieje
print_status "2. Sprawdzam czy aplikacja istnieje..."
if [ ! -d "/var/www/losuje.pl/lotek" ]; then
    print_error "Katalog aplikacji nie istnieje: /var/www/losuje.pl/lotek"
    exit 1
fi

if [ ! -f "/var/www/losuje.pl/lotek/backend/index.js" ]; then
    print_error "Plik backend/index.js nie istnieje"
    exit 1
fi

print_success "Aplikacja istnieje"

# 3. Sprawdź zależności
print_status "3. Sprawdzam zależności backendu..."
cd /var/www/losuje.pl/lotek/backend

if [ ! -d "node_modules" ]; then
    print_warning "node_modules nie istnieje. Instaluję zależności..."
    npm ci --production
    if [ $? -ne 0 ]; then
        print_error "Nie udało się zainstalować zależności"
        exit 1
    fi
    print_success "Zależności zainstalowane"
else
    print_success "Zależności istnieją"
fi

# 4. Sprawdź zmienne środowiskowe
print_status "4. Sprawdzam zmienne środowiskowe..."
if [ ! -f ".env" ]; then
    print_warning "Plik .env nie istnieje. Sprawdzam production.env..."
    if [ -f "../production.env" ]; then
        cp ../production.env .env
        print_success "Skopiowano production.env jako .env"
    else
        print_warning "Brak pliku .env - używam domyślnych wartości"
    fi
else
    print_success "Plik .env istnieje"
fi

# 5. Zatrzymaj wszystkie procesy
print_status "5. Zatrzymuję wszystkie procesy..."
pm2 stop all 2>/dev/null
pm2 delete all 2>/dev/null

# Zatrzymaj procesy na porcie 3001
if netstat -tlnp | grep -q ":3001 "; then
    PID=$(netstat -tlnp | grep ":3001 " | awk '{print $7}' | cut -d'/' -f1)
    if [ ! -z "$PID" ]; then
        print_warning "Zatrzymuję proces na porcie 3001 (PID: $PID)"
        kill -9 $PID
        sleep 2
    fi
fi

print_success "Wszystkie procesy zatrzymane"

# 6. Uruchom backend jako usługę PM2
print_status "6. Uruchamiam backend jako usługę PM2..."
pm2 start index.js \
  --name "lotek-backend" \
  --cwd "/var/www/losuje.pl/lotek/backend" \
  --env production \
  --watch false \
  --max-memory-restart 500M \
  --restart-delay 3000 \
  --max-restarts 10 \
  --min-uptime 10000

if [ $? -eq 0 ]; then
    print_success "Backend uruchomiony jako usługa PM2"
else
    print_error "Nie udało się uruchomić backendu"
    exit 1
fi

# 7. Zapisz konfigurację PM2
print_status "7. Zapisuję konfigurację PM2..."
pm2 save
pm2 startup

print_success "Konfiguracja PM2 zapisana"

# 8. Sprawdź status PM2
print_status "8. Sprawdzam status PM2..."
sleep 3
pm2 status

# 9. Sprawdź logi backendu
print_status "9. Sprawdzam logi backendu..."
pm2 logs lotek-backend --lines 10

# 10. Test endpointu
print_status "10. Testuję endpoint /api/test..."
sleep 2
if curl -s http://localhost:3001/api/test > /dev/null; then
    print_success "Backend odpowiada na /api/test"
else
    print_warning "Backend nie odpowiada jeszcze na /api/test"
fi

# 11. Sprawdź i napraw nginx
print_status "11. Sprawdzam i naprawiam nginx..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx: DZIAŁA"
else
    print_warning "Nginx: NIE DZIAŁA - uruchamiam..."
    systemctl start nginx
fi

# Sprawdź konfigurację nginx
if nginx -t > /dev/null 2>&1; then
    print_success "Konfiguracja nginx: POPRAWNA"
    systemctl reload nginx
else
    print_warning "Konfiguracja nginx: BŁĘDNA - sprawdź ręcznie"
fi

# 12. Test przez nginx
print_status "12. Testuję przez nginx..."
sleep 2
if curl -s https://losuje.pl/api/test > /dev/null; then
    print_success "Nginx może się połączyć z backendem"
else
    print_warning "Nginx nie może się połączyć z backendem"
fi

# 13. Sprawdź logi nginx
print_status "13. Ostatnie logi nginx:"
tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "Brak logów błędów"

# 14. Sprawdź porty
print_status "14. Sprawdzam porty..."
echo "Port 80 (HTTP):"
netstat -tlnp | grep ":80 " || echo "Port 80 nie jest używany"
echo ""
echo "Port 443 (HTTPS):"
netstat -tlnp | grep ":443 " || echo "Port 443 nie jest używany"
echo ""
echo "Port 3001 (Backend):"
netstat -tlnp | grep ":3001 " || echo "Port 3001 nie jest używany"

echo ""
print_success "🎉 NAPRAWA SYSTEMU ZAKOŃCZONA!"
echo ""
echo "📋 Status:"
echo "   Backend: $(pm2 list | grep lotek-backend | awk '{print $10}')"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   Port 3001: $(netstat -tlnp | grep ':3001 ' > /dev/null && echo 'OK' || echo 'BŁĄD')"
echo ""
echo "🔧 Przydatne komendy:"
echo "   pm2 status                    - Status aplikacji"
echo "   pm2 logs lotek-backend        - Logi aplikacji"
echo "   pm2 restart lotek-backend     - Restart aplikacji"
echo "   systemctl status nginx        - Status nginx"
echo "   tail -f /var/log/nginx/error.log  - Logi błędów nginx"
echo "   curl https://losuje.pl/api/test   - Test API"
echo ""
echo "🔄 Aplikacja będzie się automatycznie restartować po:"
echo "   - Restarcie serwera"
echo "   - Błędzie aplikacji"
echo "   - Przekroczeniu limitu pamięci (500MB)"
echo ""
