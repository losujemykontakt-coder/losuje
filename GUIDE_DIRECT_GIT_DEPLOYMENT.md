# 🚀 Bezpośrednie wdrożenie przez Git na serwer OVH

## 📋 **Metoda 1: Automatyczny skrypt (ZALECANE)**

### Krok 1: Skopiuj skrypt na serwer
```bash
# Z Twojego komputera
scp deploy-direct-git.sh root@51.77.220.61:/root/
```

### Krok 2: Uruchom skrypt na serwerze
```bash
# Połącz się z serwerem
ssh root@51.77.220.61

# Uruchom skrypt
chmod +x deploy-direct-git.sh
./deploy-direct-git.sh
```

## 🔧 **Metoda 2: Ręczne kroki**

### Krok 1: Połącz się z serwerem
```bash
ssh root@51.77.220.61
```

### Krok 2: Zainstaluj wymagane pakiety
```bash
# Aktualizacja systemu
apt update && apt upgrade -y

# Instalacja Git
apt install -y git

# Instalacja Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Instalacja PM2
npm install -g pm2

# Instalacja Nginx
apt install -y nginx

# Instalacja Certbot
apt install -y certbot python3-certbot-nginx
```

### Krok 3: Utwórz katalogi i sklonuj repozytorium
```bash
# Przejdź do katalogu web
cd /var/www

# Utwórz katalog dla aplikacji
mkdir -p lotek
cd lotek

# Sklonuj repozytorium
git clone https://github.com/losujemykontakt-coder/losuje.git
cd losuje
```

### Krok 4: Zainstaluj zależności i zbuduj aplikację
```bash
# Frontend
cd frontend
npm install
npm run build

# Backend
cd ../backend
npm install --production
```

### Krok 5: Skonfiguruj Nginx
```bash
# Utwórz konfigurację Nginx
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

# Aktywuj konfigurację
ln -sf /etc/nginx/sites-available/losuje.pl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test i restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### Krok 6: Uruchom aplikację przez PM2
```bash
# Przejdź do backend
cd /var/www/lotek/losuje/backend

# Utwórz konfigurację PM2
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

# Uruchom aplikację
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Krok 7: Skonfiguruj firewall
```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
```

## 🔄 **Aktualizacja aplikacji**

### Metoda 1: Automatyczna aktualizacja
```bash
# Utwórz skrypt aktualizacji
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

# Uruchom aktualizację
/var/www/lotek/update.sh
```

### Metoda 2: Ręczna aktualizacja
```bash
# Przejdź do katalogu aplikacji
cd /var/www/lotek/losuje

# Pobierz najnowsze zmiany
git pull origin main

# Aktualizuj frontend
cd frontend
npm install
npm run build

# Aktualizuj backend
cd ../backend
npm install --production

# Restart aplikacji
pm2 restart lotek-backend
```

## 📊 **Przydatne komendy**

### Zarządzanie aplikacją
```bash
# Status aplikacji
pm2 status

# Logi aplikacji
pm2 logs lotek-backend

# Restart aplikacji
pm2 restart lotek-backend

# Monitor w czasie rzeczywistym
pm2 monit
```

### Zarządzanie Nginx
```bash
# Test konfiguracji
nginx -t

# Restart Nginx
systemctl restart nginx

# Status Nginx
systemctl status nginx
```

### Sprawdzanie aplikacji
```bash
# Test HTTP
curl -I http://losuje.pl

# Test API
curl http://losuje.pl/api/health

# Sprawdź porty
netstat -tlnp | grep :3001
```

## 🔐 **Konfiguracja SSL (Certbot)**

```bash
# Uruchom Certbot
certbot --nginx -d losuje.pl -d www.losuje.pl --non-interactive --agree-tos --email admin@losuje.pl

# Sprawdź automatyczne odnowienie
crontab -l | grep certbot
```

## 🎯 **Zalety tej metody**

✅ **Prostota** - Bezpośrednie klonowanie z Git  
✅ **Elastyczność** - Możliwość łatwej aktualizacji  
✅ **Kontrola** - Pełna kontrola nad procesem  
✅ **Szybkość** - Szybsze niż GitHub Actions  
✅ **Debugging** - Łatwiejsze rozwiązywanie problemów  

## 🚨 **Rozwiązywanie problemów**

### Aplikacja nie działa
```bash
# Sprawdź logi
pm2 logs lotek-backend

# Sprawdź port
netstat -tlnp | grep 3001

# Sprawdź uprawnienia
ls -la /var/www/lotek/losuje/
```

### Git nie działa
```bash
# Sprawdź konfigurację Git
git config --list

# Sprawdź połączenie z GitHub
git ls-remote https://github.com/losujemykontakt-coder/losuje.git
```

### Nginx nie działa
```bash
# Sprawdź konfigurację
nginx -t

# Sprawdź logi
tail -f /var/log/nginx/error.log
```

## 🎉 **Gotowe!**

Twoja aplikacja jest teraz wdrożona na:
- **URL:** http://losuje.pl (później https://losuje.pl)
- **Katalog:** `/var/www/lotek/losuje/`
- **Backend:** PM2 na porcie 3001
- **Frontend:** Nginx serwujący pliki z `/frontend/build/`

Każda aktualizacja to prosty `git pull` i restart! 🚀
