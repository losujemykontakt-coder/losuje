#!/bin/bash

echo "🔧 SPRAWDZANIE I NAPRAWIANIE KONFIGURACJI NGINX"
echo "=============================================="

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
    print_error "Uruchom jako root: sudo bash fix-nginx-config.sh"
    exit 1
fi

# 1. Sprawdź status nginx
print_status "1. Sprawdzam status nginx..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx: DZIAŁA"
else
    print_warning "Nginx: NIE DZIAŁA - uruchamiam..."
    systemctl start nginx
    if [ $? -eq 0 ]; then
        print_success "Nginx uruchomiony"
    else
        print_error "Nie udało się uruchomić nginx"
        exit 1
    fi
fi

# 2. Sprawdź konfigurację nginx
print_status "2. Sprawdzam konfigurację nginx..."
if nginx -t > /dev/null 2>&1; then
    print_success "Konfiguracja nginx: POPRAWNA"
else
    print_error "Konfiguracja nginx: BŁĘDNA"
    nginx -t
    exit 1
fi

# 3. Sprawdź czy istnieje konfiguracja dla losuje.pl
print_status "3. Sprawdzam konfigurację dla losuje.pl..."
NGINX_CONFIG="/etc/nginx/sites-available/losuje.pl"

if [ ! -f "$NGINX_CONFIG" ]; then
    print_warning "Nie znaleziono konfiguracji nginx dla losuje.pl. Tworzę..."
    
    cat > "$NGINX_CONFIG" << 'EOF'
server {
    listen 80;
    server_name losuje.pl www.losuje.pl;
    
    # Przekierowanie na HTTPS
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
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Root directory
    root /var/www/losuje.pl/lotek/frontend/build;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
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
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/api/test;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # React Router - fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

    print_success "Konfiguracja nginx utworzona"
else
    print_success "Konfiguracja nginx istnieje"
fi

# 4. Sprawdź czy konfiguracja jest włączona
print_status "4. Sprawdzam czy konfiguracja jest włączona..."
if [ ! -L "/etc/nginx/sites-enabled/losuje.pl" ]; then
    print_warning "Konfiguracja nie jest włączona. Włączam..."
    ln -sf /etc/nginx/sites-available/losuje.pl /etc/nginx/sites-enabled/
    print_success "Konfiguracja włączona"
else
    print_success "Konfiguracja jest włączona"
fi

# 5. Sprawdź konfigurację ponownie
print_status "5. Sprawdzam konfigurację ponownie..."
if nginx -t > /dev/null 2>&1; then
    print_success "Konfiguracja nginx: POPRAWNA"
else
    print_error "Konfiguracja nginx: BŁĘDNA"
    nginx -t
    exit 1
fi

# 6. Restart nginx
print_status "6. Restartuję nginx..."
systemctl reload nginx
if [ $? -eq 0 ]; then
    print_success "Nginx zrestartowany"
else
    print_error "Nie udało się zrestartować nginx"
    exit 1
fi

# 7. Sprawdź czy backend odpowiada
print_status "7. Sprawdzam czy backend odpowiada..."
sleep 2
if curl -s http://localhost:3001/api/test > /dev/null; then
    print_success "Backend odpowiada na localhost:3001"
else
    print_warning "Backend nie odpowiada na localhost:3001"
fi

# 8. Test przez nginx
print_status "8. Testuję przez nginx..."
if curl -s https://losuje.pl/api/test > /dev/null; then
    print_success "Nginx może się połączyć z backendem"
else
    print_warning "Nginx nie może się połączyć z backendem"
fi

# 9. Sprawdź logi nginx
print_status "9. Ostatnie logi nginx:"
tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "Brak logów błędów"

echo ""
print_success "🎉 KONFIGURACJA NGINX SPRAWDZONA I NAPRAWIONA!"
echo ""
echo "📋 Przydatne komendy:"
echo "   systemctl status nginx        - Status nginx"
echo "   nginx -t                      - Test konfiguracji"
echo "   systemctl reload nginx        - Reload nginx"
echo "   tail -f /var/log/nginx/error.log  - Logi błędów"
echo "   tail -f /var/log/nginx/access.log - Logi dostępu"
echo ""
