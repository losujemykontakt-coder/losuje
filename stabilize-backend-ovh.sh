#!/bin/bash

# 🚀 SKRYPT USTABILIZOWANIA BACKENDU NODE.JS NA OVH
# Autor: System Administrator
# Data: $(date)

set -e

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

echo "🚀 USTABILIZOWANIE BACKENDU NODE.JS NA OVH"
echo "=========================================="

# 1. Sprawdź czy jesteśmy root
if [ "$EUID" -ne 0 ]; then
    print_error "Uruchom jako root: sudo $0"
    exit 1
fi

print_success "Uruchomiono jako root"

# 2. Aktualizacja systemu
print_status "1. Aktualizuję system..."
apt update -qq
apt upgrade -y -qq
print_success "System zaktualizowany"

# 3. Sprawdź i zainstaluj PM2
print_status "2. Sprawdzam instalację PM2..."
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 nie jest zainstalowany. Instaluję..."
    npm install -g pm2@latest
    print_success "PM2 zainstalowany"
else
    PM2_VERSION=$(pm2 --version)
    print_success "PM2 już zainstalowany (wersja: $PM2_VERSION)"
fi

# 4. Sprawdź Node.js
print_status "3. Sprawdzam Node.js..."
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js: $NODE_VERSION, npm: $NPM_VERSION"

# 5. Przejdź do katalogu aplikacji
print_status "4. Przechodzę do katalogu aplikacji..."
cd /var/www/losuje.pl/lotek/backend

# 6. Sprawdź pliki .env
print_status "5. Sprawdzam pliki konfiguracyjne..."
if [ -f ".env" ]; then
    print_success "Plik .env istnieje"
else
    if [ -f "env.example" ]; then
        cp env.example .env
        print_warning "Skopiowano env.example jako .env"
    else
        print_error "Brak pliku .env i env.example"
        exit 1
    fi
fi

# 7. Zainstaluj/aktualizuj zależności
print_status "6. Instaluję zależności..."
npm ci --production --silent
print_success "Zależności zainstalowane"

# 8. Zatrzymaj istniejące procesy PM2
print_status "7. Zatrzymuję istniejące procesy PM2..."
pm2 stop lotek-backend 2>/dev/null || true
pm2 delete lotek-backend 2>/dev/null || true
print_success "Istniejące procesy zatrzymane"

# 9. Utwórz katalog logów
print_status "8. Tworzę katalog logów..."
mkdir -p /var/log/pm2
chown -R root:root /var/log/pm2
chmod 755 /var/log/pm2
print_success "Katalog logów utworzony"

# 10. Uruchom backend z zaawansowaną konfiguracją PM2
print_status "9. Uruchamiam backend z zaawansowaną konfiguracją PM2..."

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
    print_success "Backend uruchomiony z zaawansowaną konfiguracją PM2"
else
    print_error "Nie udało się uruchomić backendu"
    exit 1
fi

# 11. Zapisz konfigurację PM2
print_status "10. Zapisuję konfigurację PM2..."
pm2 save
pm2 startup systemd
print_success "Konfiguracja PM2 zapisana i ustawiona na autostart"

# 12. Sprawdź status PM2
print_status "11. Sprawdzam status PM2..."
sleep 5
pm2 status

# 13. Sprawdź logi backendu
print_status "12. Sprawdzam logi backendu..."
pm2 logs lotek-backend --lines 15

# 14. Test endpointów
print_status "13. Testuję endpointy..."
sleep 3

# Test health endpoint
if curl -s -f http://localhost:3001/api/health > /dev/null; then
    print_success "Health endpoint: OK"
else
    print_warning "Health endpoint: BŁĄD"
fi

# Test głównego endpointu
if curl -s -f http://localhost:3001/api/test > /dev/null; then
    print_success "Test endpoint: OK"
else
    print_warning "Test endpoint: BŁĄD"
fi

# 15. Sprawdź i napraw nginx
print_status "14. Sprawdzam i naprawiam nginx..."
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
    print_warning "Konfiguracja nginx: BŁĘDNA"
fi

# 16. Test przez nginx
print_status "15. Testuję przez nginx..."
sleep 3
if curl -s -f https://losuje.pl/api/health > /dev/null; then
    print_success "Nginx + Backend: OK"
else
    print_warning "Nginx + Backend: BŁĄD"
fi

# 17. Sprawdź porty
print_status "16. Sprawdzam porty..."
echo "Port 3001 (backend):"
netstat -tlnp | grep :3001 || echo "Port 3001 nie jest używany"

echo "Port 80 (nginx):"
netstat -tlnp | grep :80 || echo "Port 80 nie jest używany"

echo "Port 443 (nginx SSL):"
netstat -tlnp | grep :443 || echo "Port 443 nie jest używany"

# 18. Sprawdź zasoby systemu
print_status "17. Sprawdzam zasoby systemu..."
echo "Użycie CPU:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1

echo "Użycie pamięci:"
free -h | grep Mem | awk '{print $3"/"$2}'

echo "Użycie dysku:"
df -h / | tail -1 | awk '{print $5}'

# 19. Ustaw monitoring PM2
print_status "18. Ustawiam monitoring PM2..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
print_success "Monitoring PM2 skonfigurowany"

# 20. Sprawdź firewall
print_status "19. Sprawdzam firewall..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status | head -1)
    print_success "Firewall: $UFW_STATUS"
else
    print_warning "Firewall UFW nie jest zainstalowany"
fi

# 21. Sprawdź SSL
print_status "20. Sprawdzam certyfikat SSL..."
if [ -f "/etc/letsencrypt/live/losuje.pl/fullchain.pem" ]; then
    SSL_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/losuje.pl/fullchain.pem | cut -d= -f2)
    print_success "Certyfikat SSL ważny do: $SSL_EXPIRY"
else
    print_warning "Certyfikat SSL nie znaleziony"
fi

# 22. Buduj i konfiguruj frontend
print_status "21. Buduję i konfiguruję frontend..."
if [ -f "/var/www/losuje.pl/lotek/frontend/package.json" ]; then
    cd /var/www/losuje.pl/lotek/frontend
    
    # Sprawdź plik .env
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "Skopiowano env.example jako .env dla frontendu"
        fi
    fi
    
    # Zainstaluj zależności i zbuduj
    npm ci --silent
    npm run build
    
    if [ $? -eq 0 ]; then
        # Skopiuj pliki do katalogu nginx
        mkdir -p /var/www/losuje.pl/public
        cp -r build/* /var/www/losuje.pl/public/
        chown -R www-data:www-data /var/www/losuje.pl/public
        chmod -R 755 /var/www/losuje.pl/public
        print_success "Frontend zbudowany i skopiowany"
    else
        print_warning "Błąd budowania frontendu"
    fi
else
    print_warning "Katalog frontendu nie znaleziony"
fi

# 23. Podsumowanie
echo ""
echo "🎉 USTABILIZOWANIE ZAKOŃCZONE"
echo "============================"
print_success "Backend Node.js został ustabilizowany na OVH"

echo ""
echo "📊 STATUS SYSTEMU:"
echo "   Backend: $(pm2 list | grep lotek-backend | awk '{print $10}')"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   PM2: $(pm2 --version)"

echo ""
echo "🔧 PRZYDATNE KOMENDY:"
echo "   pm2 status                    - Status aplikacji"
echo "   pm2 logs lotek-backend        - Logi aplikacji"
echo "   pm2 restart lotek-backend     - Restart aplikacji"
echo "   pm2 monit                     - Monitor w czasie rzeczywistym"
echo "   pm2 reload lotek-backend      - Reload bez restartu"
echo "   systemctl status nginx        - Status nginx"
echo "   journalctl -u nginx -f        - Logi nginx"

echo ""
echo "📈 MONITORING:"
echo "   pm2 monit                     - Monitor PM2"
echo "   htop                          - Monitor systemu"
echo "   df -h                         - Użycie dysku"
echo "   free -h                       - Użycie pamięci"

echo ""
print_success "Backend jest gotowy do pracy! 🚀"
