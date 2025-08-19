#!/bin/bash

echo "🚀 LOTTO AI - Bezpośrednie wdrożenie przez Git"
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
    print_error "Uruchom jako root: sudo bash deploy-direct-git.sh"
    exit 1
fi

print_status "Rozpoczynam bezpośrednie wdrożenie przez Git..."

# 1. Aktualizacja systemu
print_status "Aktualizuję system..."
apt update && apt upgrade -y

# 2. Instalacja Git
print_status "Instaluję Git..."
apt install -y git

# 3. Instalacja Node.js 18
print_status "Instaluję Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 4. Instalacja PM2
print_status "Instaluję PM2..."
npm install -g pm2

# 5. Instalacja Nginx
print_status "Instaluję Nginx..."
apt install -y nginx

# 6. Instalacja Certbot
print_status "Instaluję Certbot..."
apt install -y certbot python3-certbot-nginx

# 7. Tworzenie katalogów
print_status "Tworzę katalogi aplikacji..."
mkdir -p /var/www/lotek
cd /var/www/lotek

# 8. Konfiguracja Git na serwerze
print_status "Konfiguruję Git..."
git config --global user.name "Lotek Server"
git config --global user.email "server@losuje.pl"

# 9. Klonowanie repozytorium
print_status "Klonuję repozytorium..."
if [ -d "losuje" ]; then
    print_warning "Katalog losuje już istnieje. Usuwam..."
    rm -rf losuje
fi

# Klonowanie przez HTTPS (bez kluczy SSH)
git clone https://github.com/losujemykontakt-coder/losuje.git
cd losuje

print_success "Repozytorium sklonowane!"

# 10. Instalacja zależności
print_status "Instaluję zależności..."
cd frontend
npm install
npm run build
cd ../backend
npm install --production

# 11. Konfiguracja Nginx
print_status "Konfiguruję Nginx..."
cat > /etc/nginx/sites-available/losuje.pl << 'EOF'
server {
    listen 80;
    server_name losuje.pl www.losuje.pl;
    
    # Frontend
    location / {
        root /var/www/lotek/losuje/frontend/build;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
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
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Aktywacja strony
ln -sf /etc/nginx/sites-available/losuje.pl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test konfiguracji Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# 12. Konfiguracja PM2
print_status "Konfiguruję PM2..."
cd /var/www/lotek/losuje/backend

# Tworzenie pliku ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'lotek-backend',
    script: 'index.js',
    cwd: '/var/www/lotek/losuje/backend',
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

# Uruchomienie aplikacji
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 13. Konfiguracja firewall
print_status "Konfiguruję firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# 14. Skrypt aktualizacji
print_status "Tworzę skrypt aktualizacji..."
cat > /var/www/lotek/update.sh << 'EOF'
#!/bin/bash
echo "🔄 Aktualizuję aplikację..."
cd /var/www/lotek/losuje
git pull origin main

# Aktualizacja frontend
cd frontend
npm install
npm run build

# Aktualizacja backend
cd ../backend
npm install --production

# Restart aplikacji
pm2 restart lotek-backend

echo "✅ Aplikacja zaktualizowana!"
EOF

chmod +x /var/www/lotek/update.sh

# 15. Cron job dla automatycznych aktualizacji (opcjonalnie)
echo "0 4 * * * /var/www/lotek/update.sh" | crontab -

print_success "Wdrożenie zakończone!"
echo ""
echo "🎉 Twoja aplikacja jest teraz dostępna na:"
echo "   🌐 http://losuje.pl"
echo ""
echo "📋 Przydatne komendy:"
echo "   🔄 Aktualizacja: /var/www/lotek/update.sh"
echo "   📊 Status PM2: pm2 status"
echo "   📝 Logi: pm2 logs lotek-backend"
echo "   🔧 Restart: pm2 restart lotek-backend"
echo ""
print_warning "Następne kroki:"
echo "1. Skonfiguruj DNS dla losuje.pl -> $(curl -s ifconfig.me)"
echo "2. Uruchom SSL: certbot --nginx -d losuje.pl"
echo "3. Sprawdź aplikację: curl -I http://losuje.pl"
echo ""
print_success "Gotowe! 🚀"
