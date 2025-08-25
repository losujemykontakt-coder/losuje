# 🔧 USTABILIZOWANIE BACKENDU NODE.JS NA OVH Z PM2

## 📋 Przegląd

Ten przewodnik zawiera kompletną instrukcję ustabilizowania backendu Node.js na serwerze OVH przy użyciu PM2 (Process Manager 2) oraz konfiguracji nginx do serwowania frontendu.

## 🎯 Cele stabilizacji

✅ **Automatyczny restart** - aplikacja restartuje się po awarii  
✅ **Skalowanie** - używa wszystkich dostępnych CPU cores  
✅ **Monitoring** - zaawansowane logowanie i monitoring  
✅ **Autostart** - aplikacja uruchamia się po restarcie serwera  
✅ **Zarządzanie pamięcią** - automatyczny restart przy przekroczeniu limitu  
✅ **Logi** - strukturalne logowanie z rotacją  
✅ **Frontend przez nginx** - statyczne pliki serwowane przez nginx  
✅ **API proxy** - nginx proxy do backendu na porcie 3001  

## 🚀 Szybki start

### 1. Uruchom skrypt stabilizacji

```bash
# Zaloguj się na serwer jako root
ssh root@51.77.220.61

# Uruchom skrypt stabilizacji
chmod +x stabilize-backend-ovh.sh
./stabilize-backend-ovh.sh
```

### 2. Sprawdź status

```bash
# Sprawdź status PM2
./check-pm2-status.sh

# Lub ręcznie
pm2 status
pm2 list
```

### 3. Szybka naprawa (jeśli coś nie działa)

```bash
# Uruchom skrypt naprawy
./quick-backend-fix.sh
```

### 4. Buduj frontend (jeśli potrzebne)

```bash
# Uruchom skrypt budowania frontendu
./build-frontend-nginx.sh
```

## 📊 Konfiguracja PM2

### Zaawansowane ustawienia w `ecosystem.config.js`

```javascript
{
  name: "lotek-backend",
  script: "index.js",
  instances: "max",           // Używa wszystkich CPU cores
  exec_mode: "cluster",       // Tryb cluster dla wydajności
  max_memory_restart: "1G",   // Restart przy 1GB pamięci
  restart_delay: 5000,        // 5s opóźnienie przed restartem
  max_restarts: 15,           // Maksymalnie 15 restartów
  min_uptime: "15s",          // Minimum 15s uptime
  kill_timeout: 10000,        // 10s na graceful shutdown
  listen_timeout: 10000       // 10s na start aplikacji
}
```

**Uwaga:** Frontend nie jest już zarządzany przez PM2 - jest budowany i serwowany przez nginx.

## 🌐 Konfiguracja Nginx

### Struktura katalogów

```
/var/www/losuje.pl/
├── public/                    # Statyczne pliki frontendu
│   ├── index.html
│   ├── static/
│   └── ...
└── lotek/
    ├── backend/              # Backend Node.js
    └── frontend/             # Kod źródłowy frontendu
```

### Proxy API

```nginx
# API proxy to backend
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
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```

## 🔧 Przydatne komendy PM2

### Podstawowe operacje

```bash
# Status aplikacji
pm2 status
pm2 list

# Logi aplikacji
pm2 logs lotek-backend
pm2 logs lotek-backend --lines 50
pm2 logs lotek-backend -f  # W czasie rzeczywistym

# Restart aplikacji
pm2 restart lotek-backend
pm2 reload lotek-backend   # Zero-downtime reload

# Zatrzymanie aplikacji
pm2 stop lotek-backend
pm2 delete lotek-backend
```

### Monitoring i diagnostyka

```bash
# Monitor w czasie rzeczywistym
pm2 monit

# Szczegółowe informacje
pm2 show lotek-backend

# Statystyki
pm2 stats

# Sprawdź błędy
pm2 logs lotek-backend --err
```

### Zarządzanie konfiguracją

```bash
# Zapisz obecną konfigurację
pm2 save

# Ustaw autostart po restarcie serwera
pm2 startup systemd

# Uruchom z pliku konfiguracyjnego
pm2 start ecosystem.config.js
pm2 reload ecosystem.config.js
```

## 📈 Monitoring i logi

### Struktura logów

```
/var/log/pm2/
├── lotek-backend-error.log      # Błędy aplikacji
├── lotek-backend-out.log        # Standardowe wyjście
└── lotek-backend-combined.log   # Wszystkie logi

/var/log/nginx/
├── losuje.pl.access.log         # Logi dostępu nginx
└── losuje.pl.error.log          # Logi błędów nginx
```

### Rotacja logów

```bash
# Instalacja modułu rotacji logów
pm2 install pm2-logrotate

# Konfiguracja rotacji
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Sprawdzanie logów

```bash
# Ostatnie 50 linii
tail -n 50 /var/log/pm2/lotek-backend-combined.log

# Błędy w czasie rzeczywistym
tail -f /var/log/pm2/lotek-backend-error.log

# Przez PM2
pm2 logs lotek-backend --lines 100

# Logi nginx
tail -f /var/log/nginx/losuje.pl.error.log
```

## 🔍 Diagnostyka problemów

### 1. Aplikacja nie startuje

```bash
# Sprawdź logi błędów
pm2 logs lotek-backend --err

# Sprawdź czy plik .env istnieje
ls -la /var/www/losuje.pl/lotek/backend/.env

# Sprawdź uprawnienia
chmod 600 /var/www/losuje.pl/lotek/backend/.env
```

### 2. Wysokie użycie pamięci

```bash
# Sprawdź użycie pamięci
pm2 list
pm2 stats

# Sprawdź szczegóły procesu
pm2 show lotek-backend
```

### 3. Aplikacja się restartuje

```bash
# Sprawdź logi restartów
pm2 logs lotek-backend --lines 100

# Sprawdź konfigurację restartów
pm2 show lotek-backend
```

### 4. Port już zajęty

```bash
# Sprawdź co używa portu 3001
netstat -tlnp | grep :3001

# Zabij proces używający portu
kill -9 <PID>
```

### 5. Problemy z nginx

```bash
# Sprawdź konfigurację nginx
nginx -t

# Sprawdź logi nginx
tail -f /var/log/nginx/losuje.pl.error.log

# Sprawdź status nginx
systemctl status nginx
```

## 🛠️ Skrypty pomocnicze

### `stabilize-backend-ovh.sh`
Kompletny skrypt stabilizacji backendu z:
- Instalacją i konfiguracją PM2
- Zaawansowanymi ustawieniami
- Testami endpointów
- Konfiguracją nginx
- Budowaniem frontendu
- Monitoringiem systemu

### `check-pm2-status.sh`
Skrypt diagnostyczny sprawdzający:
- Status PM2
- Logi aplikacji
- Endpointy
- Zasoby systemu
- Status nginx

### `quick-backend-fix.sh`
Szybki skrypt naprawy:
- Restart aplikacji
- Reinstalacja zależności
- Testy funkcjonalności
- Naprawa nginx

### `build-frontend-nginx.sh`
Skrypt budowania frontendu:
- Instalacja zależności
- Budowanie aplikacji
- Konfiguracja nginx
- Kopiowanie plików

## 📊 Metryki i monitoring

### Sprawdzanie wydajności

```bash
# Użycie CPU i pamięci
pm2 monit

# Statystyki systemu
htop
free -h
df -h

# Statystyki aplikacji
pm2 stats
pm2 show lotek-backend
```

### Alerty i powiadomienia

```bash
# Sprawdź liczbę restartów
pm2 list | grep lotek-backend | awk '{print $9}'

# Sprawdź uptime
pm2 list | grep lotek-backend | awk '{print $8}'

# Sprawdź użycie pamięci
pm2 list | grep lotek-backend | awk '{print $6}'
```

## 🔒 Bezpieczeństwo

### Uprawnienia plików

```bash
# Pliki .env
chmod 600 /var/www/losuje.pl/lotek/backend/.env
chmod 600 /var/www/losuje.pl/lotek/frontend/.env

# Katalog logów
chmod 755 /var/log/pm2
chown -R root:root /var/log/pm2

# Pliki frontendu
chown -R www-data:www-data /var/www/losuje.pl/public
chmod -R 755 /var/www/losuje.pl/public
```

### Firewall

```bash
# Sprawdź status firewalla
ufw status

# Otwórz tylko potrzebne porty
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
```

## 🚀 Automatyzacja

### Cron jobs dla monitoringu

```bash
# Dodaj do crontab
crontab -e

# Sprawdź status co 5 minut
*/5 * * * * /var/www/losuje.pl/lotek/check-pm2-status.sh >> /var/log/pm2-monitoring.log 2>&1

# Restart jeśli aplikacja nie działa
*/10 * * * * if ! pm2 list | grep -q "lotek-backend.*online"; then pm2 restart lotek-backend; fi

# Buduj frontend codziennie o 2:00
0 2 * * * /var/www/losuje.pl/lotek/build-frontend-nginx.sh >> /var/log/frontend-build.log 2>&1
```

### Backup konfiguracji

```bash
# Backup konfiguracji PM2
pm2 save
cp ~/.pm2/dump.pm2 /backup/pm2-dump-$(date +%Y%m%d).pm2

# Backup plików .env
cp /var/www/losuje.pl/lotek/backend/.env /backup/backend-env-$(date +%Y%m%d)
cp /var/www/losuje.pl/lotek/frontend/.env /backup/frontend-env-$(date +%Y%m%d)

# Backup konfiguracji nginx
cp /etc/nginx/sites-available/losuje.pl /backup/nginx-config-$(date +%Y%m%d)
```

## 📞 Wsparcie

### Logi do sprawdzenia

```bash
# PM2 logi
pm2 logs lotek-backend --lines 100

# Nginx logi
tail -n 100 /var/log/nginx/losuje.pl.error.log
tail -n 100 /var/log/nginx/losuje.pl.access.log

# System logi
journalctl -u nginx -f
journalctl -u pm2-root -f
```

### Komendy do debugowania

```bash
# Sprawdź procesy
ps aux | grep node
ps aux | grep pm2

# Sprawdź porty
netstat -tlnp | grep :3001
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# Sprawdź zasoby
top -bn1
free -h
df -h
```

## ✅ Checklist stabilizacji

- [ ] PM2 zainstalowany i skonfigurowany
- [ ] Backend uruchomiony w trybie cluster
- [ ] Autostart po restarcie serwera
- [ ] Logi skonfigurowane z rotacją
- [ ] Monitoring aktywny
- [ ] Endpointy odpowiadają
- [ ] Frontend zbudowany i skopiowany
- [ ] Nginx skonfigurowany z proxy API
- [ ] SSL certyfikat ważny
- [ ] Firewall skonfigurowany
- [ ] Backup konfiguracji

## 🎉 Podsumowanie

Po wykonaniu wszystkich kroków system będzie:
- **Stabilny** - automatyczne restartowanie po awariach
- **Skalowalny** - używa wszystkich dostępnych CPU cores
- **Monitorowany** - zaawansowane logowanie i alerty
- **Bezpieczny** - odpowiednie uprawnienia i firewall
- **Automatyczny** - uruchamia się po restarcie serwera
- **Optymalny** - frontend przez nginx, backend przez PM2

System jest gotowy do pracy w środowisku produkcyjnym! 🚀
