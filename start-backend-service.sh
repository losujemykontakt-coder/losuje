#!/bin/bash

echo "🚀 URUCHAMIANIE BACKENDU JAKO USŁUGA PM2"
echo "========================================"

# Kolory
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

# Sprawdź czy jesteś root
if [ "$EUID" -ne 0 ]; then
    print_error "Uruchom jako root: sudo bash start-backend-service.sh"
    exit 1
fi

# 1. Przejdź do katalogu aplikacji
print_status "1. Przechodzę do katalogu aplikacji..."
cd /var/www/losuje.pl/lotek/backend

if [ ! -f "index.js" ]; then
    print_error "Nie znaleziono pliku index.js w /var/www/losuje.pl/lotek/backend"
    exit 1
fi

print_success "Znaleziono plik index.js"

# 2. Sprawdź czy PM2 jest zainstalowany
print_status "2. Sprawdzam czy PM2 jest zainstalowany..."
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 nie jest zainstalowany. Instaluję..."
    npm install -g pm2
    if [ $? -ne 0 ]; then
        print_error "Nie udało się zainstalować PM2"
        exit 1
    fi
fi

print_success "PM2 jest zainstalowany"

# 3. Zatrzymaj istniejące procesy PM2
print_status "3. Zatrzymuję istniejące procesy PM2..."
pm2 stop lotek-backend 2>/dev/null
pm2 delete lotek-backend 2>/dev/null
print_success "Istniejące procesy zatrzymane"

# 4. Sprawdź czy port 3001 jest wolny
print_status "4. Sprawdzam czy port 3001 jest wolny..."
if netstat -tlnp | grep -q ":3001 "; then
    print_warning "Port 3001 jest zajęty. Zatrzymuję proces..."
    PID=$(netstat -tlnp | grep ":3001 " | awk '{print $7}' | cut -d'/' -f1)
    if [ ! -z "$PID" ]; then
        kill -9 $PID
        sleep 2
    fi
fi

print_success "Port 3001 jest wolny"

# 5. Uruchom backend jako usługę PM2
print_status "5. Uruchamiam backend jako usługę PM2..."
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

# 6. Zapisz konfigurację PM2
print_status "6. Zapisuję konfigurację PM2..."
pm2 save
pm2 startup

print_success "Konfiguracja PM2 zapisana"

# 7. Sprawdź status
print_status "7. Sprawdzam status aplikacji..."
sleep 3
pm2 status

# 8. Sprawdź logi
print_status "8. Ostatnie logi aplikacji:"
pm2 logs lotek-backend --lines 10

# 9. Test endpointu
print_status "9. Testuję endpoint /api/test..."
sleep 2
if curl -s http://localhost:3001/api/test > /dev/null; then
    print_success "Backend odpowiada na /api/test"
else
    print_warning "Backend nie odpowiada jeszcze na /api/test (może potrzebuje więcej czasu)"
fi

# 10. Sprawdź czy nginx może się połączyć
print_status "10. Sprawdzam połączenie z nginx..."
if curl -s http://localhost:3001/api/test | grep -q "Backend działa"; then
    print_success "Nginx może się połączyć z backendem"
else
    print_warning "Sprawdź konfigurację nginx"
fi

echo ""
print_success "🎉 BACKEND URUCHOMIONY JAKO USŁUGA!"
echo ""
echo "📋 Przydatne komendy:"
echo "   pm2 status                    - Status aplikacji"
echo "   pm2 logs lotek-backend        - Logi aplikacji"
echo "   pm2 restart lotek-backend     - Restart aplikacji"
echo "   pm2 stop lotek-backend        - Zatrzymaj aplikację"
echo "   pm2 delete lotek-backend      - Usuń aplikację z PM2"
echo ""
echo "🔄 Aplikacja będzie się automatycznie restartować po:"
echo "   - Restarcie serwera"
echo "   - Błędzie aplikacji"
echo "   - Przekroczeniu limitu pamięci (500MB)"
echo ""
