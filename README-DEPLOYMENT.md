# 🚀 LOTTO AI - Instrukcja Deploymentu

## 📋 **Krok po kroku - Jak wdrożyć aplikację**

### **1. Zakup serwera i domeny**

#### **Serwer OVH VPS SSD 2** ⭐ **NAJLEPSZY WYBÓR NA POCZĄTEK**
- Wejdź na: https://ovhcloud.com/pl/vps
- Wybierz: **VPS SSD 2** (2 vCPU, 4GB RAM, 80GB SSD)
- Lokalizacja: **Polska / Warszawa**
- System: **Ubuntu 22.04 LTS**
- Cena: ~80 zł/miesiąc

#### **Domena**
- Wejdź na: https://www.ovh.pl/domeny/
- Wybierz domenę: `lotek-ai.pl` lub podobną
- Cena: ~50-80 zł/rok

### **2. Konfiguracja serwera**

#### **Połączenie z serwerem:**
```bash
ssh root@twoj-ip-serwera
```

#### **Uruchom deployment:**
```bash
# Skopiuj deploy.sh na serwer
scp deploy.sh root@twoj-ip-serwera:/root/

# Uruchom na serwerze
ssh root@twoj-ip-serwera
bash deploy.sh
```

### **3. Konfiguracja domeny**

#### **W panelu OVH:**
1. Przejdź do **DNS Zone**
2. Dodaj rekord A:
   ```
   Nazwa: @
   Wartość: twoj-ip-serwera
   TTL: 3600
   ```
3. Dodaj rekord CNAME:
   ```
   Nazwa: www
   Wartość: twoja-domena.pl
   TTL: 3600
   ```

### **4. Upload aplikacji**

#### **Edytuj upload-files.sh:**
```bash
SERVER_IP="twoj-ip-serwera"
DOMAIN="twoja-domena.pl"
```

#### **Uruchom upload:**
```bash
chmod +x upload-files.sh
./upload-files.sh
```

### **5. Konfiguracja SSL**

#### **Automatycznie przez skrypt:**
```bash
# SSL zostanie skonfigurowane automatycznie
# Jeśli nie, uruchom ręcznie:
ssh root@twoj-ip-serwera
certbot --nginx -d twoja-domena.pl
```

### **6. Sprawdzenie działania**

#### **Sprawdź aplikację:**
- Frontend: https://twoja-domena.pl
- Backend: https://twoja-domena.pl/api/test

#### **Sprawdź logi:**
```bash
ssh root@twoj-ip-serwera

# Logi PM2
pm2 logs lotek-backend

# Logi Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔧 **Zarządzanie aplikacją**

### **Restart aplikacji:**
```bash
ssh root@twoj-ip-serwera
pm2 restart lotek-backend
```

### **Aktualizacja kodu:**
```bash
# Uruchom ponownie upload-files.sh
./upload-files.sh
```

### **Backup:**
```bash
ssh root@twoj-ip-serwera
tar -czf /backup/lotek-$(date +%Y%m%d).tar.gz /var/www/lotek/
```

## 📊 **Monitoring**

### **PM2 Dashboard:**
```bash
ssh root@twoj-ip-serwera
pm2 monit
```

### **Status aplikacji:**
```bash
ssh root@twoj-ip-serwera
pm2 status
pm2 show lotek-backend
```

## 🛠️ **Rozwiązywanie problemów**

### **Aplikacja nie działa:**
```bash
# Sprawdź logi
pm2 logs lotek-backend

# Sprawdź port
netstat -tlnp | grep :3001

# Restart
pm2 restart lotek-backend
```

### **Nginx nie działa:**
```bash
# Sprawdź konfigurację
nginx -t

# Restart
systemctl restart nginx

# Sprawdź logi
tail -f /var/log/nginx/error.log
```

### **SSL problemy:**
```bash
# Odnów certyfikat
certbot renew

# Sprawdź status
certbot certificates
```

## 💰 **Koszty miesięczne**

```
OVH VPS SSD 2: ~80 zł
Domena: ~7 zł
Backup: ~10 zł
─────────────────
RAZEM: ~97 zł/miesiąc
```

## 🚀 **Gotowe!**

Twoja aplikacja LOTTO AI jest teraz dostępna pod adresem:
**https://twoja-domena.pl**

### **Funkcje dostępne:**
- ✅ Generator liczb lotto
- ✅ AI Ultra Pro
- ✅ Harmonic Analyzer
- ✅ System talizmanów
- ✅ Płatności PayPal/Przelewy24
- ✅ Firebase autentykacja
- ✅ SSL/HTTPS
- ✅ Monitoring i backup

### **Wsparcie:**
- PM2: Automatyczny restart
- Nginx: Load balancing
- SSL: Automatyczne odnawianie
- Backup: Codzienny automatyczny

**Powodzenia! 🎯**
