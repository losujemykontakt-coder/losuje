#!/bin/bash

echo "🚀 LOTTO AI - Deployment na OVH z domeną losuje.pl"
echo "=================================================="

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
    print_error "Uruchom jako root: sudo bash deploy-ovh-git.sh"
    exit 1
fi

print_status "Rozpoczynam deployment na OVH z domeną losuje.pl..."

# 1. Aktualizacja systemu
print_status "Aktualizuję system..."
apt update && apt upgrade -y

# 2. Instalacja podstawowych narzędzi
print_status "Instaluję podstawowe narzędzia..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# 3. Instalacja Node.js 18
print_status "Instaluję Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Sprawdź wersję Node.js
NODE_VERSION=$(node --version)
print_success "Node.js zainstalowany: $NODE_VERSION"

# 4. Instalacja PM2
print_status "Instaluję PM2..."
npm install -g pm2

# 5. Instalacja Nginx
print_status "Instaluję Nginx..."
apt install -y nginx

# 6. Instalacja Certbot (SSL)
print_status "Instaluję Certbot..."
apt install -y certbot python3-certbot-nginx

# 7. Tworzenie struktury katalogów
print_status "Tworzę strukturę katalogów..."
mkdir -p /var/www/losuje.pl
mkdir -p /var/www/losuje.pl/frontend
mkdir -p /var/www/losuje.pl/backend
mkdir -p /var/www/losuje.pl/logs
mkdir -p /var/www/losuje.pl/backups

# 8. Konfiguracja Git
print_status "Konfiguruję Git..."
git config --global user.name "Lotek Server"
git config --global user.email "server@losuje.pl"

# 9. Klonowanie repozytorium
print_status "Klonuję repozytorium..."
cd /var/www/losuje.pl

if [ -d "lotek" ]; then
    print_warning "Katalog lotek już istnieje. Aktualizuję..."
    cd lotek
    git pull origin main
else
    print_info "Klonuję nowe repozytorium..."
    git clone https://github.com/losujemykontakt-coder/losuje.git lotek
    cd lotek
fi

print_success "Repozytorium gotowe!"

# 10. Instalacja zależności frontend
print_status "Instaluję zależności frontend..."
cd frontend
npm ci --production=false
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend zbudowany pomyślnie!"
else
    print_error "Błąd podczas budowania frontend!"
    exit 1
fi

# 11. Instalacja zależności backend
print_status "Instaluję zależności backend..."
cd ../backend
npm ci --production

# 12. Konfiguracja Nginx dla losuje.pl
print_status "Konfiguruję Nginx dla losuje.pl..."
cat > /etc/nginx/sites-available/losuje.pl << 'EOF'
# Konfiguracja dla losuje.pl
server {
    listen 80;
    server_name losuje.pl www.losuje.pl;
    
    # Logi
    access_log /var/log/nginx/losuje.pl.access.log;
    error_log /var/log/nginx/losuje.pl.error.log;
    
    # Frontend - React App
    location / {
        root /var/www/losuje.pl/lotek/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache dla statycznych plików
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary "Accept-Encoding";
        }
        
        # Cache dla HTML
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
        }
    }
    
    # Backend API
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
        
        # Timeout dla długich operacji
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/xml
        image/svg+xml;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        # ... reszta konfiguracji API
    }
}
EOF

# Aktywacja strony
ln -sf /etc/nginx/sites-available/losuje.pl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test konfiguracji Nginx
if nginx -t; then
    systemctl restart nginx
    systemctl enable nginx
    print_success "Nginx skonfigurowany i uruchomiony!"
else
    print_error "Błąd w konfiguracji Nginx!"
    exit 1
fi

# 13. Konfiguracja PM2
print_status "Konfiguruję PM2..."
cd /var/www/losuje.pl/lotek/backend

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'lotek-backend',
    script: 'index.js',
    cwd: '/var/www/losuje.pl/lotek/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      CORS_ORIGIN: 'https://losuje.pl'
    },
    error_file: '/var/www/losuje.pl/logs/backend-error.log',
    out_file: '/var/www/losuje.pl/logs/backend-out.log',
    log_file: '/var/www/losuje.pl/logs/backend-combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    env_file: '.env'
  }]
};
EOF

# Uruchomienie aplikacji
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 14. Konfiguracja firewall
print_status "Konfiguruję firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# 15. Skrypt aktualizacji przez Git
print_status "Tworzę skrypt aktualizacji..."
cat > /var/www/losuje.pl/update.sh << 'EOF'
#!/bin/bash

echo "🔄 Aktualizuję aplikację losuje.pl..."

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Backup przed aktualizacją
BACKUP_DIR="/var/www/losuje.pl/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_warning "Tworzę backup..."
cp -r /var/www/losuje.pl/lotek "$BACKUP_DIR/"
print_success "Backup utworzony: $BACKUP_DIR"

# Aktualizacja kodu
cd /var/www/losuje.pl/lotek
git fetch origin
git reset --hard origin/main

# Aktualizacja frontend
print_warning "Aktualizuję frontend..."
cd frontend
npm ci --production=false
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend zaktualizowany!"
else
    print_error "Błąd podczas budowania frontend!"
    exit 1
fi

# Aktualizacja backend
print_warning "Aktualizuję backend..."
cd ../backend
npm ci --production

# Restart aplikacji
print_warning "Restartuję aplikację..."
pm2 restart lotek-backend

# Sprawdź status
sleep 5
if pm2 list | grep -q "lotek-backend.*online"; then
    print_success "Aplikacja zaktualizowana i uruchomiona!"
else
    print_error "Błąd podczas uruchamiania aplikacji!"
    pm2 logs lotek-backend --lines 20
fi

# Czyszczenie starych backupów (zostaw ostatnie 5)
cd /var/www/losuje.pl/backups
ls -t | tail -n +6 | xargs -r rm -rf

echo "🎉 Aktualizacja zakończona!"
EOF

chmod +x /var/www/losuje.pl/update.sh

# 16. Skrypt monitorowania
print_status "Tworzę skrypt monitorowania..."
cat > /var/www/losuje.pl/monitor.sh << 'EOF'
#!/bin/bash

echo "📊 Status aplikacji losuje.pl"
echo "=============================="

# Sprawdź PM2
echo "🔍 Status PM2:"
pm2 list

echo ""
echo "🔍 Logi aplikacji (ostatnie 10 linii):"
pm2 logs lotek-backend --lines 10

echo ""
echo "🔍 Status Nginx:"
systemctl status nginx --no-pager -l

echo ""
echo "🔍 Użycie zasobów:"
free -h
df -h /var/www/losuje.pl

echo ""
echo "🔍 Aktywne połączenia:"
netstat -tlnp | grep :3001
EOF

chmod +x /var/www/losuje.pl/monitor.sh

# 17. Cron job dla automatycznych aktualizacji
print_status "Konfiguruję automatyczne aktualizacje..."
(crontab -l 2>/dev/null; echo "0 4 * * * /var/www/losuje.pl/update.sh >> /var/www/losuje.pl/logs/update.log 2>&1") | crontab -

# 18. Konfiguracja logrotate
print_status "Konfiguruję rotację logów..."
cat > /etc/logrotate.d/losuje << 'EOF'
/var/www/losuje.pl/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

print_success "Deployment zakończony!"
echo ""
echo "🎉 Twoja aplikacja jest teraz dostępna na:"
echo "   🌐 http://losuje.pl"
echo ""
echo "📋 Przydatne komendy:"
echo "   🔄 Aktualizacja: /var/www/losuje.pl/update.sh"
echo "   📊 Monitorowanie: /var/www/losuje.pl/monitor.sh"
echo "   📝 Logi: pm2 logs lotek-backend"
echo "   🔧 Restart: pm2 restart lotek-backend"
echo "   📊 Status: pm2 status"
echo ""
print_warning "Następne kroki:"
echo "1. Skonfiguruj DNS dla losuje.pl -> $(curl -s ifconfig.me)"
echo "2. Uruchom SSL: certbot --nginx -d losuje.pl -d www.losuje.pl"
echo "3. Sprawdź aplikację: curl -I http://losuje.pl"
echo "4. Skonfiguruj zmienne środowiskowe w /var/www/losuje.pl/lotek/backend/.env"
echo ""
print_info "Aby skonfigurować SSL:"
echo "certbot --nginx -d losuje.pl -d www.losuje.pl --non-interactive --agree-tos --email admin@losuje.pl"
echo ""
print_success "Gotowe! 🚀"




