#!/bin/bash

# 🚀 SKRYPT BUDOWANIA FRONTENDU I KONFIGURACJI NGINX
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

echo "🚀 BUDOWANIE FRONTENDU I KONFIGURACJA NGINX"
echo "============================================"

# 1. Sprawdź czy jesteśmy root
if [ "$EUID" -ne 0 ]; then
    print_error "Uruchom jako root: sudo $0"
    exit 1
fi

# 2. Przejdź do katalogu frontendu
print_status "1. Przechodzę do katalogu frontendu..."
cd /var/www/losuje.pl/lotek/frontend

# 3. Sprawdź plik .env
print_status "2. Sprawdzam plik .env..."
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        print_warning "Skopiowano env.example jako .env"
    else
        print_error "Brak pliku .env i env.example"
        exit 1
    fi
fi

# 4. Zainstaluj zależności
print_status "3. Instaluję zależności..."
npm ci --silent
print_success "Zależności zainstalowane"

# 5. Zbuduj aplikację
print_status "4. Buduję aplikację..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Aplikacja zbudowana"
else
    print_error "Błąd budowania aplikacji"
    exit 1
fi

# 6. Sprawdź czy build się udał
print_status "5. Sprawdzam pliki build..."
if [ -d "build" ] && [ "$(ls -A build)" ]; then
    print_success "Pliki build istnieją"
else
    print_error "Brak plików build"
    exit 1
fi

# 7. Skopiuj pliki do katalogu nginx
print_status "6. Kopiuję pliki do katalogu nginx..."
mkdir -p /var/www/losuje.pl/public
cp -r build/* /var/www/losuje.pl/public/
chown -R www-data:www-data /var/www/losuje.pl/public
chmod -R 755 /var/www/losuje.pl/public
print_success "Pliki skopiowane do /var/www/losuje.pl/public"

# 8. Utwórz konfigurację nginx
print_status "7. Tworzę konfigurację nginx..."
cat > /etc/nginx/sites-available/losuje.pl << 'EOF'
server {
    listen 80;
    server_name losuje.pl www.losuje.pl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name losuje.pl www.losuje.pl;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/losuje.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/losuje.pl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Root directory for static files
    root /var/www/losuje.pl/public;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # HTML files - no cache
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }

    # Logs
    access_log /var/log/nginx/losuje.pl.access.log;
    error_log /var/log/nginx/losuje.pl.error.log;
}
EOF

print_success "Konfiguracja nginx utworzona"

# 9. Włącz konfigurację
print_status "8. Włączam konfigurację nginx..."
if [ -f "/etc/nginx/sites-enabled/losuje.pl" ]; then
    rm /etc/nginx/sites-enabled/losuje.pl
fi
ln -s /etc/nginx/sites-available/losuje.pl /etc/nginx/sites-enabled/
print_success "Konfiguracja włączona"

# 10. Sprawdź konfigurację nginx
print_status "9. Sprawdzam konfigurację nginx..."
if nginx -t > /dev/null 2>&1; then
    print_success "Konfiguracja nginx: POPRAWNA"
else
    print_error "Konfiguracja nginx: BŁĘDNA"
    nginx -t
    exit 1
fi

# 11. Reload nginx
print_status "10. Reload nginx..."
systemctl reload nginx
print_success "Nginx zreloadowany"

# 12. Test endpointów
print_status "11. Testuję endpointy..."
sleep 3

# Test frontendu
if curl -s -f https://losuje.pl > /dev/null; then
    print_success "Frontend: OK"
else
    print_warning "Frontend: BŁĄD"
fi

# Test API
if curl -s -f https://losuje.pl/api/health > /dev/null; then
    print_success "API: OK"
else
    print_warning "API: BŁĄD"
fi

# 13. Sprawdź status nginx
print_status "12. Sprawdzam status nginx..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx: DZIAŁA"
else
    print_error "Nginx: NIE DZIAŁA"
fi

# 14. Sprawdź porty
print_status "13. Sprawdzam porty..."
echo "Port 80 (nginx):"
netstat -tlnp | grep :80 || echo "Port 80 nie jest używany"

echo "Port 443 (nginx SSL):"
netstat -tlnp | grep :443 || echo "Port 443 nie jest używany"

echo "Port 3001 (backend):"
netstat -tlnp | grep :3001 || echo "Port 3001 nie jest używany"

echo ""
echo "🎉 FRONTEND I NGINX SKONFIGUROWANE"
echo "=================================="
print_success "Frontend jest serwowany przez nginx"

echo ""
echo "📊 STATUS:"
echo "   Frontend: https://losuje.pl"
echo "   API: https://losuje.pl/api"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   Backend: $(pm2 list | grep lotek-backend | awk '{print $10}')"

echo ""
echo "🔧 PRZYDATNE KOMENDY:"
echo "   systemctl status nginx        - Status nginx"
echo "   nginx -t                      - Test konfiguracji nginx"
echo "   systemctl reload nginx        - Reload nginx"
echo "   tail -f /var/log/nginx/losuje.pl.error.log - Logi błędów nginx"

echo ""
print_success "Frontend jest gotowy! 🚀"
