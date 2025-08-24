# 🔧 INSTRUKCJA NAPRAWY BACKENDU PRZEZ KVM CONSOLE

## 🚀 **Krok 1: Dostęp do KVM Console**

1. **Wejdź na panel OVH:** https://www.ovh.com/manager/
2. **Znajdź swój VPS:** 51.77.220.61
3. **Kliknij "KVM Console"** lub "Konsola"
4. **Zaloguj się jako root** (użyj hasła z emaila OVH)

## 🔧 **Krok 2: Naprawa systemu**

### **Opcja A: Użyj gotowego skryptu (NAJLEPSZA)**

```bash
# Przejdź do katalogu aplikacji
cd /var/www/losuje.pl/lotek

# Skopiuj skrypt naprawy (jeśli istnieje)
ls -la fix-backend-system.sh

# Jeśli skrypt istnieje, uruchom go
chmod +x fix-backend-system.sh
./fix-backend-system.sh
```

### **Opcja B: Ręczna naprawa**

```bash
# 1. Przejdź do katalogu aplikacji
cd /var/www/losuje.pl/lotek/backend

# 2. Sprawdź czy aplikacja istnieje
ls -la index.js

# 3. Sprawdź zależności
ls -la node_modules/

# 4. Jeśli brak node_modules, zainstaluj
npm ci --production

# 5. Sprawdź zmienne środowiskowe
ls -la .env

# 6. Jeśli brak .env, skopiuj z production.env
cp ../production.env .env

# 7. Zatrzymaj wszystkie procesy PM2
pm2 stop all
pm2 delete all

# 8. Sprawdź czy port 3001 jest wolny
netstat -tlnp | grep :3001

# 9. Jeśli port jest zajęty, zatrzymaj proces
# (skopiuj PID z poprzedniej komendy)
kill -9 [PID]

# 10. Uruchom backend jako usługę PM2
pm2 start index.js \
  --name "lotek-backend" \
  --cwd "/var/www/losuje.pl/lotek/backend" \
  --env production \
  --watch false \
  --max-memory-restart 500M \
  --restart-delay 3000 \
  --max-restarts 10 \
  --min-uptime 10000

# 11. Zapisz konfigurację PM2
pm2 save
pm2 startup

# 12. Sprawdź status
pm2 status

# 13. Sprawdź logi
pm2 logs lotek-backend --lines 10

# 14. Test endpointu
curl http://localhost:3001/api/test

# 15. Sprawdź nginx
systemctl status nginx
nginx -t
systemctl reload nginx

# 16. Test przez nginx
curl https://losuje.pl/api/test
```

## 🔍 **Krok 3: Sprawdzenie statusu**

```bash
# Status PM2
pm2 status

# Logi aplikacji
pm2 logs lotek-backend

# Status nginx
systemctl status nginx

# Logi nginx
tail -f /var/log/nginx/error.log

# Sprawdź porty
netstat -tlnp | grep -E ":(80|443|3001)"

# Test API
curl -I https://losuje.pl/api/test
```

## 🚨 **Krok 4: Rozwiązywanie problemów**

### **Problem: Backend nie uruchamia się**
```bash
# Sprawdź logi błędów
pm2 logs lotek-backend

# Sprawdź czy są błędy w kodzie
node index.js

# Sprawdź zależności
npm list --depth=0
```

### **Problem: Port 3001 zajęty**
```bash
# Znajdź proces używający port 3001
lsof -i :3001

# Zatrzymaj proces
kill -9 [PID]
```

### **Problem: Nginx nie łączy się z backendem**
```bash
# Sprawdź konfigurację nginx
nginx -t

# Sprawdź logi nginx
tail -f /var/log/nginx/error.log

# Test połączenia lokalnie
curl http://localhost:3001/api/test
```

### **Problem: Błędy 502 Bad Gateway**
```bash
# Sprawdź czy backend działa
pm2 status

# Sprawdź logi backendu
pm2 logs lotek-backend

# Restart backendu
pm2 restart lotek-backend

# Sprawdź konfigurację nginx
cat /etc/nginx/sites-available/losuje.pl
```

## 📋 **Krok 5: Przydatne komendy**

```bash
# Restart całego systemu
pm2 restart all
systemctl restart nginx

# Sprawdź użycie zasobów
htop
df -h
free -h

# Sprawdź logi systemowe
journalctl -u nginx -f
journalctl -u pm2-root -f

# Backup konfiguracji
cp /etc/nginx/sites-available/losuje.pl /etc/nginx/sites-available/losuje.pl.backup

# Przywróć backup
cp /etc/nginx/sites-available/losuje.pl.backup /etc/nginx/sites-available/losuje.pl
nginx -t && systemctl reload nginx
```

## ✅ **Krok 6: Weryfikacja naprawy**

Po wykonaniu naprawy sprawdź:

1. **Czy backend działa:** `pm2 status` → lotek-backend powinien być "online"
2. **Czy API odpowiada:** `curl https://losuje.pl/api/test` → powinien zwrócić JSON
3. **Czy nginx działa:** `systemctl status nginx` → powinien być "active"
4. **Czy porty są otwarte:** `netstat -tlnp | grep -E ":(80|443|3001)"`

## 🎯 **Oczekiwany rezultat**

Po udanej naprawie:
- ✅ Backend działa jako usługa PM2
- ✅ Automatyczny restart po błędach
- ✅ Automatyczny start po restarcie serwera
- ✅ Nginx proxy do backendu
- ✅ API dostępne pod https://losuje.pl/api/*
- ✅ Brak błędów 502 Bad Gateway

## 🆘 **Jeśli nic nie pomaga**

1. **Sprawdź logi systemowe:** `journalctl -xe`
2. **Sprawdź miejsce na dysku:** `df -h`
3. **Sprawdź pamięć:** `free -h`
4. **Skontaktuj się z OVH Support**
5. **Rozważ reinstalację systemu**
