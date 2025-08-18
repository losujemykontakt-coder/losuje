#!/bin/bash

echo "🚀 LOTTO AI - Deployment Script"
echo "================================"

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkcje
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Sprawdź czy jesteś root
if [ "$EUID" -ne 0 ]; then
    print_error "Uruchom jako root: sudo bash deploy.sh"
    exit 1
fi

print_status "Rozpoczynam deployment..."

# 1. Aktualizacja systemu
print_status "Aktualizuję system..."
apt update && apt upgrade -y

# 2. Instalacja Node.js
print_status "Instaluję Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. Instalacja PM2
print_status "Instaluję PM2..."
npm install -g pm2

# 4. Instalacja Nginx
print_status "Instaluję Nginx..."
apt install nginx -y

# 5. Instalacja certbot (SSL)
print_status "Instaluję Certbot..."
apt install certbot python3-certbot-nginx -y

# 6. Tworzenie struktury katalogów
print_status "Tworzę strukturę katalogów..."
mkdir -p /var/www/lotek
mkdir -p /var/www/lotek/frontend
mkdir -p /var/www/lotek/backend
mkdir -p /var/www/lotek/nginx

# 7. Konfiguracja firewall
print_status "Konfiguruję firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# 8. Konfiguracja Nginx
print_status "Konfiguruję Nginx..."
cat > /etc/nginx/sites-available/lotek << 'EOF'
server {
    listen 80;
    server_name twoja-domena.pl www.twoja-domena.pl;
    
    # Frontend
    location / {
        root /var/www/lotek/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache dla statycznych plików
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
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
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Aktywuj konfigurację
ln -sf /etc/nginx/sites-available/lotek /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test konfiguracji Nginx
nginx -t && systemctl restart nginx

# 9. Konfiguracja PM2
print_status "Konfiguruję PM2..."
cat > /var/www/lotek/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'lotek-backend',
    script: '/var/www/lotek/backend/index.js',
    cwd: '/var/www/lotek/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/lotek-backend-error.log',
    out_file: '/var/log/lotek-backend-out.log',
    log_file: '/var/log/lotek-backend-combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10
  }]
};
EOF

# 10. Skrypt restartu
cat > /var/www/lotek/restart.sh << 'EOF'
#!/bin/bash
cd /var/www/lotek/backend
pm2 restart lotek-backend
echo "Backend zrestartowany!"
EOF

chmod +x /var/www/lotek/restart.sh

# 11. Cron job dla restartu
echo "0 4 * * * /var/www/lotek/restart.sh" | crontab -

print_status "Deployment zakończony!"
print_warning "Pamiętaj o:"
echo "1. Zmień 'twoja-domena.pl' na swoją domenę w konfiguracji Nginx"
echo "2. Uruchom: sudo certbot --nginx -d twoja-domena.pl"
echo "3. Skopiuj pliki aplikacji do /var/www/lotek/"
echo "4. Uruchom: pm2 start /var/www/lotek/ecosystem.config.js"

print_status "Gotowe! 🚀"
print_warning "VPS SSD 2 - Idealny wybór na początek!"
print_warning "Może obsłużyć 20,000+ użytkowników!"
