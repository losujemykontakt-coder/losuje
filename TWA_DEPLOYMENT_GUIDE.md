# Przewodnik wdrożenia TWA na osobną domenę

## 🎯 **Cel:**
- **losuje.pl** → Obecna aplikacja (bez zmian)
- **losuje-generator.pl** → TWA dla Google Play Store

## 📁 **Struktura plików na serwerze:**

```
/var/www/
├── losuje.pl/           # Obecna aplikacja (bez zmian)
│   ├── frontend/
│   ├── backend/
│   └── ...
└── losuje-generator.pl/  # Nowa domena dla TWA
    ├── public/
    │   ├── index.html
    │   ├── manifest.json
    │   ├── sw.js
    │   ├── .well-known/
    │   │   └── assetlinks.json
    │   └── assets/
    └── dist/            # Zbudowana aplikacja React
```

## 🚀 **Kroki wdrożenia:**

### 1. **Utworzenie nowej domeny na OVH**

```bash
# Połącz się z serwerem OVH
ssh root@51.77.220.61

# Utwórz katalog dla nowej domeny
mkdir -p /var/www/losuje-generator.pl
cd /var/www/losuje-generator.pl
```

### 2. **Konfiguracja Nginx dla nowej domeny**

```bash
# Utwórz konfigurację Nginx
nano /etc/nginx/sites-available/losuje-generator.pl
```

**Zawartość pliku:**
```nginx
server {
    listen 80;
    server_name losuje-generator.pl www.losuje-generator.pl;
    
    # Przekierowanie na HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name losuje-generator.pl www.losuje-generator.pl;
    
    # SSL Certificate (dodaj swój certyfikat)
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
```

### 3. **Aktywacja konfiguracji**

```bash
# Utwórz link symboliczny
ln -s /etc/nginx/sites-available/losuje-generator.pl /etc/nginx/sites-enabled/

# Sprawdź konfigurację
nginx -t

# Przeładuj Nginx
systemctl reload nginx
```

### 4. **SSL Certificate (Let's Encrypt)**

```bash
# Zainstaluj certbot (jeśli nie masz)
apt install certbot python3-certbot-nginx

# Wygeneruj certyfikat
certbot --nginx -d losuje-generator.pl -d www.losuje-generator.pl

# Automatyczne odnowienie
crontab -e
# Dodaj linię:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. **Wdrożenie aplikacji TWA**

```bash
# Przejdź do katalogu projektu
cd /var/www/losuje-generator.pl

# Skopiuj pliki z obecnej aplikacji (tylko frontend)
cp -r /var/www/losuje.pl/frontend/public/* ./public/
cp -r /var/www/losuje.pl/frontend/src ./src/
cp /var/www/losuje.pl/frontend/package*.json ./

# Zainstaluj zależności
npm install

# Zbuduj aplikację
npm run build

# Skopiuj zbudowane pliki
cp -r build/* ./dist/
```

### 6. **Konfiguracja DNS na OVH**

1. Przejdź do panelu OVH
2. Znajdź domenę `losuje-generator.pl`
3. Dodaj rekord A:
   ```
   Type: A
   Name: @
   Value: 51.77.220.61
   ```
4. Dodaj rekord CNAME:
   ```
   Type: CNAME
   Name: www
   Value: losuje-generator.pl
   ```

### 7. **Testowanie TWA**

```bash
# Sprawdź czy domena działa
curl -I https://losuje-generator.pl

# Sprawdź manifest
curl https://losuje-generator.pl/manifest.json

# Sprawdź service worker
curl https://losuje-generator.pl/sw.js

# Sprawdź asset links
curl https://losuje-generator.pl/.well-known/assetlinks.json
```

## 🔄 **Automatyzacja deploymentu**

### Utwórz skrypt deploymentu:

```bash
nano /var/www/losuje-generator.pl/deploy.sh
```

**Zawartość:**
```bash
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
```

```bash
# Nadaj uprawnienia wykonywania
chmod +x /var/www/losuje-generator.pl/deploy.sh
```

## 📱 **Budowanie TWA**

```bash
# Zainstaluj Bubblewrap
npm install -g @bubblewrap/cli

# Przejdź do katalogu TWA
cd /var/www/losuje-generator.pl

# Inicjalizuj TWA
bubblewrap init --manifest https://losuje-generator.pl/manifest.json

# Zbuduj APK/AAB
bubblewrap build
```

## 🔍 **Weryfikacja**

### Sprawdź czy wszystko działa:

1. **losuje.pl** → Landing Page (bez zmian)
2. **losuje-generator.pl** → TWA dla Google Play
3. **PWA** → Działa offline
4. **Service Worker** → Zarejestrowany
5. **Manifest** → Poprawny
6. **Asset Links** → Dostępne

### Testy:

```bash
# Test PWA
curl -I https://losuje-generator.pl/manifest.json

# Test Service Worker
curl -I https://losuje-generator.pl/sw.js

# Test Asset Links
curl https://losuje-generator.pl/.well-known/assetlinks.json

# Test HTTPS
curl -I https://losuje-generator.pl
```

## 🎯 **Rezultat:**

- ✅ **losuje.pl** → Obecna aplikacja (bez zaburzeń)
- ✅ **losuje-generator.pl** → TWA dla Google Play Store
- ✅ **Osobne domeny** → Brak konfliktów
- ✅ **HTTPS** → Wymagane dla PWA
- ✅ **Service Worker** → Działanie offline
- ✅ **Manifest** → Instalacja na urządzeniach

## 📞 **Wsparcie:**

Jeśli coś nie działa:
1. Sprawdź logi Nginx: `tail -f /var/log/nginx/error.log`
2. Sprawdź uprawnienia: `ls -la /var/www/losuje-generator.pl/`
3. Sprawdź SSL: `certbot certificates`
4. Sprawdź DNS: `nslookup losuje-generator.pl`
