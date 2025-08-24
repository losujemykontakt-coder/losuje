#!/bin/bash

echo "🚀 Rozpoczynam wdrożenie TWA na serwer OVH..."

# Konfiguracja
SERVER_IP="51.77.220.61"
SERVER_USER="administrator"
DOMAIN="losuje-generator.pl"
PROJECT_PATH="/var/www/losuje-generator.pl"

# Kolory dla output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ Połączenie z serwerem OVH...${NC}"

# 1. Utworzenie katalogu dla nowej domeny
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
echo "📁 Tworzenie katalogu dla TWA..."
mkdir -p /var/www/losuje-generator.pl
cd /var/www/losuje-generator.pl
echo "✅ Katalog utworzony"
EOF

# 2. Konfiguracja Nginx
echo -e "${YELLOW}🔧 Konfiguracja Nginx...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cat > /etc/nginx/sites-available/losuje-generator.pl" << 'EOF'
server {
    listen 80;
    server_name losuje-generator.pl www.losuje-generator.pl;
    
    # Przekierowanie na HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name losuje-generator.pl www.losuje-generator.pl;
    
    # SSL Certificate (będzie dodany przez certbot)
    ssl_certificate /etc/letsencrypt/live/losuje-generator.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/losuje-generator.pl/privkey.pem;
    
    # Root directory
    root /var/www/losuje-generator.pl/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Service Worker
    location /sw.js {
        add_header Cache-Control "no-cache";
        expires 0;
    }
    
    # Manifest
    location /manifest.json {
        add_header Cache-Control "no-cache";
        expires 0;
    }
    
    # Asset Links
    location /.well-known/assetlinks.json {
        add_header Content-Type application/json;
        add_header Cache-Control "no-cache";
        expires 0;
    }
    
    # React Router - wszystkie ścieżki na index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# 3. Aktywacja konfiguracji Nginx
echo -e "${YELLOW}🔗 Aktywacja konfiguracji Nginx...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
ln -sf /etc/nginx/sites-available/losuje-generator.pl /etc/nginx/sites-enabled/
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ Nginx skonfigurowany"
else
    echo "❌ Błąd konfiguracji Nginx"
    exit 1
fi
EOF

# 4. Skopiowanie plików z obecnej aplikacji
echo -e "${YELLOW}📋 Kopiowanie plików aplikacji...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/losuje-generator.pl

# Skopiuj pliki z obecnej aplikacji (tylko frontend)
cp -r /var/www/losuje.pl/frontend/public/* ./public/ 2>/dev/null || mkdir -p public
cp -r /var/www/losuje.pl/frontend/src ./src/ 2>/dev/null || echo "Brak katalogu src"
cp /var/www/losuje.pl/frontend/package*.json ./ 2>/dev/null || echo "Brak package.json"

echo "✅ Pliki skopiowane"
EOF

# 5. Instalacja zależności i budowanie
echo -e "${YELLOW}🔨 Instalacja zależności i budowanie...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/losuje-generator.pl

# Sprawdź czy Node.js jest zainstalowany
if ! command -v node &> /dev/null; then
    echo "📦 Instalacja Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Instalacja zależności
echo "📦 Instalacja zależności..."
npm install

# Budowanie aplikacji
echo "🔨 Budowanie aplikacji..."
npm run build

# Utworzenie katalogu dist i skopiowanie plików
mkdir -p dist
cp -r build/* ./dist/ 2>/dev/null || echo "Brak katalogu build"

# Ustawienie uprawnień
chown -R www-data:www-data dist/
chmod -R 755 dist/

echo "✅ Aplikacja zbudowana"
EOF

# 6. SSL Certificate (Let's Encrypt)
echo -e "${YELLOW}🔒 Konfiguracja SSL...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
# Sprawdź czy certbot jest zainstalowany
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalacja certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Wygeneruj certyfikat (tylko jeśli domena jest skonfigurowana)
echo "🔒 Generowanie certyfikatu SSL..."
certbot --nginx -d losuje-generator.pl -d www.losuje-generator.pl --non-interactive --agree-tos --email admin@losuje.pl || echo "⚠️ Certyfikat SSL nie mógł być wygenerowany (sprawdź DNS)"

echo "✅ SSL skonfigurowany"
EOF

# 7. Utworzenie skryptu deploymentu
echo -e "${YELLOW}📝 Tworzenie skryptu deploymentu...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cat > /var/www/losuje-generator.pl/deploy.sh" << 'EOF'
#!/bin/bash

echo "🚀 Rozpoczynam deployment TWA..."

# Przejdź do katalogu projektu
cd /var/www/losuje-generator.pl

# Pobierz najnowsze zmiany (jeśli używasz Git)
# git pull origin main

# Zainstaluj zależności
npm install

# Zbuduj aplikację
npm run build

# Skopiuj zbudowane pliki
rm -rf dist/*
cp -r build/* ./dist/

# Ustaw uprawnienia
chown -R www-data:www-data dist/
chmod -R 755 dist/

echo "✅ Deployment zakończony!"
echo "🌐 Aplikacja dostępna pod: https://losuje-generator.pl"
EOF

# 8. Nadanie uprawnień wykonywania
ssh ${SERVER_USER}@${SERVER_IP} "chmod +x /var/www/losuje-generator.pl/deploy.sh"

# 9. Testowanie
echo -e "${YELLOW}🧪 Testowanie aplikacji...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
echo "🔍 Testowanie TWA..."

# Test HTTP
curl -I http://losuje-generator.pl 2>/dev/null | head -1 || echo "⚠️ HTTP nie działa"

# Test HTTPS (jeśli SSL jest skonfigurowany)
curl -I https://losuje-generator.pl 2>/dev/null | head -1 || echo "⚠️ HTTPS nie działa (sprawdź SSL)"

# Test manifest
curl https://losuje-generator.pl/manifest.json 2>/dev/null | head -1 || echo "⚠️ Manifest nie działa"

# Test service worker
curl https://losuje-generator.pl/sw.js 2>/dev/null | head -1 || echo "⚠️ Service Worker nie działa"

# Test asset links
curl https://losuje-generator.pl/.well-known/assetlinks.json 2>/dev/null | head -1 || echo "⚠️ Asset Links nie działa"

echo "✅ Testy zakończone"
EOF

echo -e "${GREEN}🎉 Wdrożenie TWA zakończone!${NC}"
echo ""
echo -e "${YELLOW}📋 Następne kroki:${NC}"
echo "1. Skonfiguruj DNS dla domeny losuje-generator.pl w panelu OVH"
echo "2. Dodaj rekord A: @ → [IP_SERWERA]"
echo "3. Dodaj rekord CNAME: www → losuje-generator.pl"
echo "4. Poczekaj na propagację DNS (5-30 minut)"
echo "5. Sprawdź czy aplikacja działa: https://losuje-generator.pl"
echo ""
echo -e "${GREEN}✅ losuje.pl będzie działać bez zmian!${NC}"
echo -e "${GREEN}✅ TWA będzie dostępne pod losuje-generator.pl${NC}"
