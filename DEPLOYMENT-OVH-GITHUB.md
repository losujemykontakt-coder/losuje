# 🚀 Wdrożenie na OVH przez GitHub - Przewodnik krok po kroku

## 📋 **Krok 1: Przygotowanie serwera OVH**

### a) Połącz się z serwerem:
```bash
ssh root@51.77.220.61  # Zastąp swoim IP
```

### b) Uruchom skrypt konfiguracyjny:
```bash
# Skopiuj skrypt na serwer
scp setup-ovh-server.sh root@51.77.220.61:/root/

# Na serwerze
chmod +x setup-ovh-server.sh
./setup-ovh-server.sh
```

## 🔑 **Krok 2: Konfiguracja SSH dla GitHub Actions**

### a) Wygeneruj klucz SSH:
```bash
# Na Twoim komputerze
ssh-keygen -t rsa -b 4096 -C "github-actions@losuje.pl"
# Zapisz jako: ~/.ssh/github_actions_key
```

### b) Dodaj klucz publiczny na serwer:
```bash
# Skopiuj klucz publiczny na serwer
scp ~/.ssh/github_actions_key.pub root@51.77.220.61:/tmp/

# Na serwerze
cat /tmp/github_actions_key.pub >> /home/deployment/.ssh/authorized_keys
chown deployment:deployment /home/deployment/.ssh/authorized_keys
chmod 600 /home/deployment/.ssh/authorized_keys
```

## 🌐 **Krok 3: Konfiguracja DNS**

### a) W panelu OVH:
1. Przejdź do **Panelu OVH**
2. Wybierz domenę **losuje.pl**
3. Przejdź do **DNS Zone**
4. Dodaj rekordy:
   ```
   A     @     51.77.220.61
   A     www   51.77.220.61
   ```

### b) Sprawdź propagację:
```bash
nslookup losuje.pl
nslookup www.losuje.pl
```

## 🔐 **Krok 4: Konfiguracja SSL (Certbot)**

### a) Uruchom Certbot:
```bash
# Na serwerze
certbot --nginx -d losuje.pl -d www.losuje.pl --non-interactive --agree-tos --email admin@losuje.pl
```

### b) Sprawdź automatyczne odnowienie:
```bash
crontab -l | grep certbot
```

## ⚙️ **Krok 5: Konfiguracja GitHub Secrets**

### a) Przejdź do GitHub:
1. Otwórz repository: https://github.com/losujemykontakt-coder/losuje
2. Przejdź do **Settings** → **Secrets and variables** → **Actions**
3. Dodaj następujące secrets:

### b) Dodaj secrets:
```
SERVER_IP = 51.77.220.61
SERVER_USER = deployment
SSH_PRIVATE_KEY = (zawartość pliku ~/.ssh/github_actions_key)
```

## 🚀 **Krok 6: Pierwsze wdrożenie**

### a) Przygotuj plik .env na serwerze:
```bash
# Na serwerze
nano /var/www/lotek/backend/.env
```

Dodaj zmienne środowiskowe:
```bash
# Podstawowe ustawienia
NODE_ENV=production
PORT=3001

# JWT Secret (wygeneruj silny klucz)
JWT_SECRET=twoj_silny_jwt_secret_2024_produkcja

# CORS
CORS_ORIGIN=https://losuje.pl

# Email (dla resetowania hasła)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=twoj_email@gmail.com
EMAIL_PASS=twoje_haslo_aplikacji
EMAIL_FROM=noreply@losuje.pl

# PayPal (produkcja)
PAYPAL_CLIENT_ID=twoj_rzeczywisty_client_id
PAYPAL_CLIENT_SECRET=twoj_rzeczywisty_client_secret
PAYPAL_RETURN_URL=https://losuje.pl/payment-success
PAYPAL_CANCEL_URL=https://losuje.pl/payment-cancel
PAYPAL_ENVIRONMENT=live

# Przelewy24 (produkcja)
PRZELEWY24_MERCHANT_ID=twoj_rzeczywisty_merchant_id
PRZELEWY24_POS_ID=twoj_rzeczywisty_pos_id
PRZELEWY24_API_KEY=twoj_rzeczywisty_api_key
PRZELEWY24_CRC=twoj_rzeczywisty_crc_key
PRZELEWY24_RETURN_URL=https://losuje.pl/payment-success
PRZELEWY24_STATUS_URL=https://losuje.pl/api/przelewy24/status
PRZELEWY24_ENVIRONMENT=production
```

### b) Uruchom pierwsze wdrożenie:
```bash
# Wypchnij zmiany do GitHub
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

## 📊 **Krok 7: Monitorowanie**

### a) Sprawdź status deploymentu:
1. Przejdź do **Actions** w GitHub
2. Sprawdź logi deploymentu

### b) Sprawdź aplikację:
```bash
# Test aplikacji
curl -I https://losuje.pl

# Sprawdź logi
ssh deployment@51.77.220.61
pm2 logs lotek-backend
pm2 status
```

## 🔄 **Automatyczne wdrożenia**

Od teraz każde wdrożenie będzie automatyczne:

1. **Wprowadź zmiany** w kodzie
2. **Commit i push** do GitHub
3. **GitHub Actions** automatycznie wdroży na serwer
4. **Aplikacja** będzie dostępna na https://losuje.pl

## 🛠️ **Przydatne komendy**

### Zarządzanie aplikacją:
```bash
# Restart aplikacji
pm2 restart lotek-backend

# Sprawdź status
pm2 status

# Logi aplikacji
pm2 logs lotek-backend

# Monitor w czasie rzeczywistym
pm2 monit
```

### Zarządzanie Nginx:
```bash
# Test konfiguracji
nginx -t

# Restart Nginx
systemctl restart nginx

# Sprawdź status
systemctl status nginx
```

### Backup:
```bash
# Backup aplikacji
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/lotek/

# Backup bazy danych (jeśli używasz)
pg_dump database_name > backup-$(date +%Y%m%d).sql
```

## 🚨 **Rozwiązywanie problemów**

### Aplikacja nie działa:
```bash
# Sprawdź logi
pm2 logs lotek-backend

# Sprawdź port
netstat -tlnp | grep 3001

# Sprawdź uprawnienia
ls -la /var/www/lotek/
```

### SSL nie działa:
```bash
# Sprawdź certyfikat
certbot certificates

# Odnów certyfikat
certbot renew --dry-run
```

### DNS nie działa:
```bash
# Sprawdź propagację
dig losuje.pl
nslookup losuje.pl

# Sprawdź w różnych lokalizacjach
https://www.whatsmydns.net/
```

## 🎉 **Gotowe!**

Twoja aplikacja jest teraz wdrożona na:
- **URL:** https://losuje.pl
- **Serwer:** OVH VPS
- **Deployment:** Automatyczny przez GitHub Actions
- **SSL:** Automatyczny przez Certbot
- **Monitoring:** PM2

Każda zmiana w kodzie będzie automatycznie wdrażana na produkcję! 🚀


