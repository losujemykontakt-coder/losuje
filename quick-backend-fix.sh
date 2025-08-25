#!/bin/bash

# 🚀 SKRYPT SZYBKIEGO RESTARTU I NAPRAWY BACKENDU
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

echo "🚀 SZYBKI RESTART I NAPRAWA BACKENDU"
echo "===================================="

# 1. Sprawdź czy jesteśmy root
if [ "$EUID" -ne 0 ]; then
    print_error "Uruchom jako root: sudo $0"
    exit 1
fi

# 2. Zatrzymaj backend
print_status "1. Zatrzymuję backend..."
pm2 stop lotek-backend 2>/dev/null || true
print_success "Backend zatrzymany"

# 3. Sprawdź i zabij procesy na porcie 3001
print_status "2. Sprawdzam procesy na porcie 3001..."
if netstat -tlnp | grep -q ":3001 "; then
    PID=$(netstat -tlnp | grep ":3001 " | awk '{print $7}' | cut -d'/' -f1)
    if [ ! -z "$PID" ]; then
        print_warning "Zabijam proces na porcie 3001 (PID: $PID)"
        kill -9 $PID
        sleep 2
    fi
fi

# 4. Przejdź do katalogu backendu
print_status "3. Przechodzę do katalogu backendu..."
cd /var/www/losuje.pl/lotek/backend

# 5. Sprawdź plik .env
print_status "4. Sprawdzam plik .env..."
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        print_warning "Skopiowano env.example jako .env"
    else
        print_error "Brak pliku .env i env.example"
        exit 1
    fi
fi

# 6. Wyczyść cache npm
print_status "5. Czyszczę cache npm..."
npm cache clean --force --silent
print_success "Cache npm wyczyszczony"

# 7. Usuń node_modules i zainstaluj ponownie
print_status "6. Reinstaluję zależności..."
rm -rf node_modules package-lock.json
npm ci --production --silent
print_success "Zależności zainstalowane"

# 8. Uruchom backend z nową konfiguracją
print_status "7. Uruchamiam backend z nową konfiguracją..."
pm2 start index.js \
  --name "lotek-backend" \
  --cwd "/var/www/losuje.pl/lotek/backend" \
  --env production \
  --watch false \
  --max-memory-restart 1G \
  --restart-delay 5000 \
  --max-restarts 15 \
  --min-uptime 15000 \
  --kill-timeout 10000 \
  --listen-timeout 10000 \
  --error "/var/log/pm2/lotek-backend-error.log" \
  --output "/var/log/pm2/lotek-backend-out.log" \
  --log "/var/log/pm2/lotek-backend-combined.log" \
  --time

if [ $? -eq 0 ]; then
    print_success "Backend uruchomiony"
else
    print_error "Nie udało się uruchomić backendu"
    exit 1
fi

# 9. Zapisz konfigurację PM2
print_status "8. Zapisuję konfigurację PM2..."
pm2 save
print_success "Konfiguracja PM2 zapisana"

# 10. Sprawdź status
print_status "9. Sprawdzam status..."
sleep 5
pm2 status

# 11. Sprawdź logi
print_status "10. Sprawdzam logi..."
pm2 logs lotek-backend --lines 10

# 12. Test endpointów
print_status "11. Testuję endpointy..."
sleep 3

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

# 13. Test przez nginx
print_status "12. Testuję przez nginx..."
sleep 2
if curl -s -f https://losuje.pl/api/health > /dev/null; then
    print_success "Nginx + Backend: OK"
else
    print_warning "Nginx + Backend: BŁĄD"
fi

# 14. Sprawdź nginx
print_status "13. Sprawdzam nginx..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx: DZIAŁA"
else
    print_warning "Nginx: NIE DZIAŁA - uruchamiam..."
    systemctl start nginx
fi

# 15. Reload nginx
print_status "14. Reload nginx..."
systemctl reload nginx
print_success "Nginx zreloadowany"

echo ""
echo "🎉 NAPRAWA ZAKOŃCZONA"
echo "===================="
print_success "Backend został zrestartowany i naprawiony"

echo ""
echo "📊 STATUS:"
echo "   Backend: $(pm2 list | grep lotek-backend | awk '{print $10}')"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   Uptime: $(pm2 list | grep lotek-backend | awk '{print $8}')"

echo ""
echo "🔧 PRZYDATNE KOMENDY:"
echo "   pm2 logs lotek-backend -f     - Logi w czasie rzeczywistym"
echo "   pm2 monit                     - Monitor PM2"
echo "   systemctl status nginx        - Status nginx"
echo "   curl https://losuje.pl/api/health - Test endpointu"

echo ""
print_success "Backend jest gotowy! 🚀"
