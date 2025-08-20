#!/bin/bash

echo "⚡ SZYBKI DEPLOYMENT na OVH - losuje.pl"
echo "======================================="

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
    print_error "Uruchom jako root: sudo bash quick-deploy-ovh.sh"
    exit 1
fi

# Pobierz IP serwera
SERVER_IP=$(curl -s ifconfig.me)
print_info "IP serwera: $SERVER_IP"

print_status "Rozpoczynam szybki deployment..."

# 1. Aktualizacja systemu
print_status "Aktualizuję system..."
apt update && apt upgrade -y

# 2. Instalacja Node.js 18
print_status "Instaluję Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. Instalacja PM2 i Nginx
print_status "Instaluję PM2 i Nginx..."
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx

# 4. Tworzenie katalogów
print_status "Tworzę katalogi..."
mkdir -p /var/www/losuje.pl/{frontend,backend,logs,backups}

# 5. Klonowanie repozytorium
print_status "Klonuję repozytorium..."
cd /var/www/losuje.pl
if [ -d "lotek" ]; then
    cd lotek
    git pull origin main
else
    git clone https://github.com/losujemykontakt-coder/losuje.git lotek
    cd lotek
fi

# 6. Budowanie frontend
print_status "Buduję frontend..."
cd frontend
npm ci
npm run build

# 7. Instalacja backend
print_status "Instaluję backend..."
cd ../backend
npm ci --production

# 8. Konfiguracja Nginx
print_status "Konfiguruję Nginx..."
cat > /etc/nginx/sites-available/losuje.pl << 'EOF'
server {
    listen 80;
    server_name losuje.pl www.losuje.pl;
    
    root /var/www/losuje.pl/lotek/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
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
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Aktywacja strony
ln -sf /etc/nginx/sites-available/losuje.pl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

# 9. Konfiguracja PM2
print_status "Konfiguruję PM2..."
cd /var/www/losuje.pl/lotek/backend

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'lotek-backend',
    script: 'index.js',
    cwd: '/var/www/losuje.pl/lotek/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/www/losuje.pl/logs/backend-error.log',
    out_file: '/var/www/losuje.pl/logs/backend-out.log',
    log_file: '/var/www/losuje.pl/logs/backend-combined.log',
    time: true
  }]
};
EOF

# Uruchomienie aplikacji
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 10. Konfiguracja firewall
print_status "Konfiguruję firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# 11. Skrypt aktualizacji
print_status "Tworzę skrypt aktualizacji..."
cat > /var/www/losuje.pl/update.sh << 'EOF'
#!/bin/bash
cd /var/www/losuje.pl/lotek
git pull origin main

cd frontend
npm ci
npm run build

cd ../backend
npm ci --production

pm2 restart lotek-backend
echo "✅ Aplikacja zaktualizowana!"
EOF

chmod +x /var/www/losuje.pl/update.sh

print_success "Szybki deployment zakończony!"
echo ""
echo "🎉 Twoja aplikacja jest dostępna na:"
echo "   🌐 http://losuje.pl"
echo ""
echo "📋 Następne kroki:"
echo "1. Skonfiguruj DNS dla losuje.pl -> $SERVER_IP"
echo "2. Uruchom SSL: certbot --nginx -d losuje.pl"
echo "3. Sprawdź aplikację: curl -I http://losuje.pl"
echo ""
echo "📋 Przydatne komendy:"
echo "   🔄 Aktualizacja: /var/www/losuje.pl/update.sh"
echo "   📊 Status: pm2 status"
echo "   📝 Logi: pm2 logs lotek-backend"
echo ""
print_success "Gotowe! 🚀"



