#!/bin/bash

echo "📁 LOTTO AI - Upload Files Script"
echo "=================================="

# Konfiguracja
SERVER_IP="51.77.220.61"
SERVER_USER="ubuntu"
DOMAIN="losuje.pl"

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Sprawdź czy podano IP serwera
if [ "$SERVER_IP" = "twoj-ip-serwera" ]; then
    echo "❌ Edytuj SERVER_IP w skrypcie!"
    exit 1
fi

print_status "Rozpoczynam upload plików..."

# 1. Build frontend
print_status "Buduję frontend..."
cd frontend
npm run build
cd ..

# 2. Przygotowanie backend
print_status "Przygotowuję backend..."
cd backend
npm install --production
cd ..

# 3. Tworzenie archiwum
print_status "Tworzę archiwum..."
tar -czf lotek-app.tar.gz \
    frontend/build/ \
    backend/ \
    deploy.sh \
    upload-files.sh

# 4. Upload na serwer
print_status "Uploaduję na serwer..."
scp lotek-app.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# 5. Rozpakowanie na serwerze
print_status "Rozpakowuję na serwerze..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /tmp
tar -xzf lotek-app.tar.gz
rm lotek-app.tar.gz

# Kopiuj pliki
cp -r frontend/build/* /var/www/lotek/frontend/
cp -r backend/* /var/www/lotek/backend/

# Ustaw uprawnienia
chown -R www-data:www-data /var/www/lotek
chmod -R 755 /var/www/lotek

# Instaluj zależności backend
cd /var/www/lotek/backend
npm install --production

# Uruchom aplikację
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Pliki skopiowane i aplikacja uruchomiona!"
EOF

# 6. SSL Certificate
print_status "Konfiguruję SSL..."
ssh $SERVER_USER@$SERVER_IP "certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN"

# 7. Restart Nginx
ssh $SERVER_USER@$SERVER_IP "systemctl restart nginx"

print_status "Upload zakończony!"
print_warning "Sprawdź aplikację pod adresem: https://$DOMAIN"

# Usuń lokalne archiwum
rm lotek-app.tar.gz

print_status "Gotowe! 🚀"
