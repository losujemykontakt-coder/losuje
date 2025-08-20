# 🚀 Przewodnik Deploymentu na OVH z domeną losuje.pl

## 📋 **Przegląd**

Ten przewodnik pomoże Ci wdrożyć aplikację Lotek na serwer OVH z domeną `losuje.pl` używając Git do zarządzania kodem.

## 🎯 **Co otrzymasz:**

- ✅ **Aplikacja działająca** na https://losuje.pl
- ✅ **Automatyczne deploymenty** przez Git
- ✅ **SSL/HTTPS** automatycznie skonfigurowany
- ✅ **Monitoring** i zarządzanie aplikacją
- ✅ **Backup** system
- ✅ **Firewall** i bezpieczeństwo

## 🛒 **Krok 1: Zakup VPS w OVH**

### a) Wejdź na stronę OVH:
- **URL:** https://ovhcloud.com/pl/vps
- **Wybierz:** VPS SSD 2 (2 vCPU, 4GB RAM, 80GB SSD)
- **Lokalizacja:** Polska / Warszawa
- **System:** Ubuntu 22.04 LTS

### b) Po zakupie otrzymasz:
- **IP serwera** (np. 51.77.220.61)
- **Hasło root**
- **Dane do panelu OVH**

## 🌐 **Krok 2: Konfiguracja DNS**

### a) W panelu OVH:
1. Przejdź do **Panelu OVH**
2. Wybierz domenę **losuje.pl**
3. Przejdź do **Strefa DNS**
4. Dodaj rekordy:

```
Typ: A
Nazwa: @
Wartość: 51.77.220.61 (Twoje IP)
TTL: 3600
```

```
Typ: A
Nazwa: www
Wartość: 51.77.220.61 (Twoje IP)
TTL: 3600
```

### b) Sprawdź propagację:
```bash
nslookup losuje.pl
nslookup www.losuje.pl
```

## 🔧 **Krok 3: Deployment na serwer**

### a) Połącz się z serwerem:
```bash
ssh root@51.77.220.61
```

### b) Skopiuj skrypt deploymentu:
```bash
# Z Twojego komputera
scp deploy-ovh-git.sh root@51.77.220.61:/root/
```

### c) Uruchom deployment:
```bash
# Na serwerze
chmod +x deploy-ovh-git.sh
./deploy-ovh-git.sh
```

## 🔐 **Krok 4: Konfiguracja SSL**

### a) Uruchom Certbot:
```bash
certbot --nginx -d losuje.pl -d www.losuje.pl --non-interactive --agree-tos --email admin@losuje.pl
```

### b) Sprawdź automatyczne odnowienie:
```bash
crontab -l | grep certbot
```

## ⚙️ **Krok 5: Konfiguracja zmiennych środowiskowych**

### a) Utwórz plik .env:
```bash
nano /var/www/losuje.pl/lotek/backend/.env
```

### b) Dodaj zmienne:
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

## 🔄 **Krok 6: Konfiguracja GitHub Actions (opcjonalnie)**

### a) Wygeneruj klucz SSH:
```bash
# Na Twoim komputerze
ssh-keygen -t rsa -b 4096 -C "github-actions@losuje.pl"
# Zapisz jako: ~/.ssh/github_actions_key
```

### b) Dodaj klucz na serwer:
```bash
# Skopiuj klucz publiczny na serwer
scp ~/.ssh/github_actions_key.pub root@51.77.220.61:/tmp/

# Na serwerze
mkdir -p /home/deployment/.ssh
cat /tmp/github_actions_key.pub >> /home/deployment/.ssh/authorized_keys
chown -R deployment:deployment /home/deployment/.ssh
chmod 600 /home/deployment/.ssh/authorized_keys
```

### c) Dodaj secrets w GitHub:
1. Przejdź do repository na GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Dodaj:
   - `SERVER_IP` = 51.77.220.61
   - `SERVER_USER` = deployment
   - `SSH_PRIVATE_KEY` = (zawartość pliku ~/.ssh/github_actions_key)

## 📊 **Krok 7: Testowanie aplikacji**

### a) Sprawdź status:
```bash
# Status aplikacji
pm2 status

# Logi aplikacji
pm2 logs lotek-backend

# Status Nginx
systemctl status nginx
```

### b) Test aplikacji:
```bash
# Test HTTP
curl -I http://losuje.pl

# Test HTTPS
curl -I https://losuje.pl

# Test API
curl https://losuje.pl/api/health
```

## 🛠️ **Zarządzanie aplikacją**

### a) Aktualizacja kodu:
```bash
# Ręczna aktualizacja
/var/www/losuje.pl/update.sh

# Lub przez Git
cd /var/www/losuje.pl/lotek
git pull origin main
cd frontend && npm ci && npm run build
cd ../backend && npm ci --production
pm2 restart lotek-backend
```

### b) Monitorowanie:
```bash
# Status aplikacji
/var/www/losuje.pl/monitor.sh

# Logi w czasie rzeczywistym
pm2 logs lotek-backend --lines 50

# Monitor zasobów
pm2 monit
```

### c) Backup:
```bash
# Backup aplikacji
tar -czf /var/www/losuje.pl/backups/backup-$(date +%Y%m%d).tar.gz /var/www/losuje.pl/lotek

# Lista backupów
ls -la /var/www/losuje.pl/backups/
```

## 🚨 **Rozwiązywanie problemów**

### Problem: "Aplikacja nie działa"
```bash
# Sprawdź status PM2
pm2 status

# Sprawdź logi
pm2 logs lotek-backend

# Sprawdź port
netstat -tlnp | grep :3001

# Restart aplikacji
pm2 restart lotek-backend
```

### Problem: "Nginx nie działa"
```bash
# Sprawdź status
systemctl status nginx

# Sprawdź konfigurację
nginx -t

# Restart Nginx
systemctl restart nginx

# Sprawdź logi
tail -f /var/log/nginx/error.log
```

### Problem: "SSL nie działa"
```bash
# Sprawdź certyfikat
certbot certificates

# Odnów certyfikat
certbot renew --dry-run

# Sprawdź konfigurację Nginx
nginx -t
```

### Problem: "DNS nie działa"
```bash
# Sprawdź propagację
dig losuje.pl
nslookup losuje.pl

# Sprawdź w różnych lokalizacjach
# https://www.whatsmydns.net/
```

## 📈 **Monitoring i optymalizacja**

### a) Monitorowanie zasobów:
```bash
# Użycie CPU i RAM
htop

# Użycie dysku
df -h

# Aktywne połączenia
netstat -tlnp
```

### b) Optymalizacja:
```bash
# Czyszczenie logów
pm2 flush

# Restart aplikacji
pm2 restart lotek-backend

# Aktualizacja systemu
apt update && apt upgrade -y
```

## 🔒 **Bezpieczeństwo**

### a) Firewall:
```bash
# Sprawdź status
ufw status

# Dodaj reguły (jeśli potrzebne)
ufw allow 22
ufw allow 'Nginx Full'
```

### b) Aktualizacje:
```bash
# Automatyczne aktualizacje bezpieczeństwa
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## 💰 **Koszty**

### Miesięczne koszty:
- **VPS SSD 2:** ~80 zł
- **Domena losuje.pl:** ~7 zł
- **Razem:** ~87 zł/miesiąc

### Wydajność VPS SSD 2:
- ✅ **20,000+ użytkowników** dziennie
- ✅ **1,000+ równoczesnych** połączeń
- ✅ **React + Node.js + Firebase**
- ✅ **Web scraping** lotto.pl
- ✅ **Płatności** PayPal/Przelewy24

## 🎉 **Gotowe!**

Twoja aplikacja jest teraz wdrożona na:
- **URL:** https://losuje.pl
- **Serwer:** OVH VPS
- **Deployment:** Automatyczny przez Git
- **SSL:** Automatyczny przez Certbot
- **Monitoring:** PM2

### Przydatne linki:
- **Aplikacja:** https://losuje.pl
- **Panel OVH:** https://www.ovh.com/manager/
- **GitHub:** https://github.com/losujemykontakt-coder/losuje

### Kontakt w razie problemów:
1. Sprawdź logi aplikacji
2. Sprawdź status serwera
3. Skontaktuj się z supportem OVH

**Powodzenia! 🚀**



