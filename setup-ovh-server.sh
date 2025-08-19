#!/bin/bash

echo "🚀 Konfiguracja serwera OVH dla losuje.pl"
echo "=========================================="

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

# Aktualizacja systemu
print_status "Aktualizacja systemu..."
apt update && apt upgrade -y

# Instalacja Node.js 18
print_status "Instalacja Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Instalacja PM2
print_status "Instalacja PM2..."
npm install -g pm2

# Instalacja Nginx
print_status "Instalacja Nginx..."
apt install -y nginx

# Instalacja Certbot (SSL)
print_status "Instalacja Certbot..."
apt install -y certbot python3-certbot-nginx

# Instalacja Git
print_status "Instalacja Git..."
apt install -y git

# Tworzenie katalogów
print_status "Tworzenie katalogów aplikacji..."
mkdir -p /var/www/lotek/frontend
mkdir -p /var/www/lotek/backend
chown -R www-data:www-data /var/www/lotek/

# Konfiguracja Nginx
print_status "Konfiguracja Nginx..."
cat > /etc/nginx/sites-available/losuje.pl << 'EOF'
server {
    listen 80;
    server_name losuje.pl www.losuje.pl;
    
    # Frontend
    location / {
        root /var/www/lotek/frontend;
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

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Konfiguracja firewall
print_status "Konfiguracja firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Tworzenie użytkownika deployment
print_status "Tworzenie użytkownika deployment..."
useradd -m -s /bin/bash deployment
usermod -aG sudo deployment
echo "deployment:$(openssl rand -base64 32)" | chpasswd

# Konfiguracja SSH dla deployment
mkdir -p /home/deployment/.ssh
chown deployment:deployment /home/deployment/.ssh
chmod 700 /home/deployment/.ssh

print_success "Konfiguracja serwera zakończona!"
echo ""
echo "🔑 Następne kroki:"
echo "1. Dodaj klucz SSH do /home/deployment/.ssh/authorized_keys"
echo "2. Skonfiguruj DNS dla losuje.pl -> $(curl -s ifconfig.me)"
echo "3. Uruchom certbot: certbot --nginx -d losuje.pl"
echo "4. Dodaj secrets do GitHub Actions:"
echo "   - SERVER_IP: $(curl -s ifconfig.me)"
echo "   - SERVER_USER: deployment"
echo "   - SSH_PRIVATE_KEY: Twój klucz prywatny"
echo ""
print_warning "Pamiętaj o zmianie hasła root: passwd"


