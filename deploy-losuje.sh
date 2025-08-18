#!/bin/bash

echo "🚀 LOTTO AI - Szybki deployment dla losuje.pl"
echo "=============================================="

# Konfiguracja
SERVER_IP="51.77.220.61"
DOMAIN="losuje.pl"

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Sprawdź czy podano IP
if [ -z "$SERVER_IP" ]; then
    print_error "Musisz podać IP serwera!"
    echo ""
    echo "Edytuj ten plik i dodaj IP serwera:"
    echo "SERVER_IP=\"51.68.123.45\"  # Zastąp swoim IP"
    echo ""
    echo "IP znajdziesz w emailu od OVH po zakupie VPS"
    exit 1
fi

print_status "Rozpoczynam deployment dla $DOMAIN na $SERVER_IP..."

# 1. Budowanie frontendu
print_status "Budowanie frontendu..."
cd frontend
npm run build
cd ..

# 2. Instalacja zależności backendu
print_status "Instalacja zależności backendu..."
cd backend
npm install --production
cd ..

# 3. Tworzenie archiwum
print_status "Tworzenie archiwum..."
tar -czf lotek-app.tar.gz frontend/build/ backend/ deploy.sh

# 4. Upload na serwer
print_status "Upload na serwer..."
scp lotek-app.tar.gz root@$SERVER_IP:/tmp/

# 5. Deployment na serwerze
print_status "Deployment na serwerze..."
ssh root@$SERVER_IP << 'EOF'
# Zatrzymaj aplikację jeśli działa
pm2 stop lotek-backend 2>/dev/null || true
pm2 delete lotek-backend 2>/dev/null || true

# Rozpakuj archiwum
cd /tmp
tar -xzf lotek-app.tar.gz

# Skopiuj pliki
cp -r frontend/build/* /var/www/lotek/frontend/
cp -r backend/* /var/www/lotek/backend/

# Ustaw uprawnienia
chown -R www-data:www-data /var/www/lotek/
chmod -R 755 /var/www/lotek/

# Skopiuj zmienne środowiskowe
cp /tmp/backend/production.env /var/www/lotek/backend/.env

# Zainstaluj zależności
cd /var/www/lotek/backend
npm install --production

# Uruchom aplikację
pm2 start index.js --name lotek-backend
pm2 save
pm2 startup

# Konfiguracja SSL
certbot --nginx -d losuje.pl --non-interactive --agree-tos --email admin@losuje.pl

# Restart Nginx
systemctl restart nginx

# Wyczyść pliki tymczasowe
rm -rf /tmp/lotek-app.tar.gz /tmp/frontend /tmp/backend
EOF

# 6. Sprawdzenie
print_status "Sprawdzanie deploymentu..."
sleep 10

# Test aplikacji
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|302"; then
    print_success "Aplikacja działa!"
else
    print_warning "Sprawdź logi: ssh root@$SERVER_IP 'pm2 logs lotek-backend'"
fi

# Wyczyść lokalne pliki
rm -f lotek-app.tar.gz

print_success "Deployment zakończony!"
echo ""
echo "🌐 Twoja aplikacja: https://$DOMAIN"
echo "🔧 Panel zarządzania: ssh root@$SERVER_IP"
echo "📊 Logi: pm2 logs lotek-backend"
echo ""
print_warning "Pamiętaj o konfiguracji DNS dla $DOMAIN!"
