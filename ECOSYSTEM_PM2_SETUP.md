# Wdrożenie Ecosystem.config.js dla PM2 na serwerze OVH

## Plik ecosystem.config.js

Utworzony plik `ecosystem.config.js` zawiera konfigurację PM2 dla:
- **Backend**: `/var/www/losuje.pl/lotek/backend`
- **Frontend**: `/var/www/losuje.pl/lotek/frontend`

## Funkcje konfiguracji

✅ **Automatyczne czytanie plików .env** - używa `dotenv` do ładowania zmiennych środowiskowych  
✅ **Automatyczny restart** - aplikacje restartują się po awarii  
✅ **Logi** - wszystkie logi są zapisywane w `/var/log/pm2/`  
✅ **Produkcja** - ustawione `NODE_ENV=production`  
✅ **Monitoring** - PM2 monitoruje procesy  

## Instrukcje wdrożenia

### 1. Przygotowanie na serwerze

```bash
# Przejdź do katalogu aplikacji
cd /var/www/losuje.pl/lotek

# Pobierz najnowsze zmiany z GitHub
git fetch origin
git reset --hard origin/main
```

### 2. Sprawdzenie plików .env

```bash
# Sprawdź czy pliki .env istnieją
ls -la backend/.env
ls -la frontend/.env
```

### 3. Utworzenie plików .env (jeśli nie istnieją)

```bash
# Backend
cp backend/env.example backend/.env

# Frontend  
cp frontend/env.example frontend/.env
```

### 4. Edycja plików .env

```bash
# Edytuj backend .env
nano backend/.env

# Edytuj frontend .env
nano frontend/.env
```

**Ważne zmienne do ustawienia w backend/.env:**
- `PAYPAL_CLIENT_ID` - prawdziwy Client ID z PayPal
- `PAYPAL_CLIENT_SECRET` - prawdziwy Client Secret z PayPal
- `PRZELEWY24_MERCHANT_ID` - ID sprzedawcy Przelewy24
- `PRZELEWY24_POS_ID` - POS ID Przelewy24
- `PRZELEWY24_API_KEY` - API Key Przelewy24
- `JWT_SECRET` - silny, losowy klucz JWT
- `EMAIL_USER` i `EMAIL_PASS` - dane do wysyłania emaili

**Ważne zmienne do ustawienia w frontend/.env:**
- `REACT_APP_PAYPAL_CLIENT_ID` - prawdziwy Client ID z PayPal
- `REACT_APP_API_URL` - URL backendu (https://losuje.pl)

### 5. Zatrzymanie obecnych procesów PM2

```bash
# Zatrzymaj i usuń obecne procesy
pm2 stop lotek-backend
pm2 delete lotek-backend
```

### 6. Uruchomienie z nową konfiguracją

```bash
# Uruchom aplikacje z ecosystem.config.js
pm2 start ecosystem.config.js

# Zapisz konfigurację PM2
pm2 save
```

### 7. Sprawdzenie statusu

```bash
# Sprawdź status procesów
pm2 status

# Sprawdź logi
pm2 logs lotek-backend --lines 10

# Sprawdź czy aplikacja odpowiada
curl -I http://localhost:3001
```

## Struktura pliku ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: "lotek-backend",
      cwd: "/var/www/losuje.pl/lotek/backend",
      script: "node_modules/.bin/dotenv",
      args: "-e /var/www/losuje.pl/lotek/backend/.env -- node index.js",
      watch: false,
      autorestart: true,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production"
      },
      error_file: "/var/log/pm2/lotek-backend-error.log",
      out_file: "/var/log/pm2/lotek-backend-out.log",
      log_file: "/var/log/pm2/lotek-backend-combined.log",
      time: true
    },
    {
      name: "lotek-frontend",
      cwd: "/var/www/losuje.pl/lotek/frontend",
      script: "node_modules/.bin/dotenv",
      args: "-e /var/www/losuje.pl/lotek/frontend/.env -- npm start",
      watch: false,
      autorestart: true,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production"
      },
      error_file: "/var/log/pm2/lotek-frontend-error.log",
      out_file: "/var/log/pm2/lotek-frontend-out.log",
      log_file: "/var/log/pm2/lotek-frontend-combined.log",
      time: true
    }
  ]
};
```

## Przydatne komendy PM2

```bash
# Status wszystkich procesów
pm2 status

# Logi konkretnej aplikacji
pm2 logs lotek-backend
pm2 logs lotek-frontend

# Restart aplikacji
pm2 restart lotek-backend
pm2 restart lotek-frontend

# Zatrzymanie aplikacji
pm2 stop lotek-backend
pm2 stop lotek-frontend

# Usunięcie aplikacji z PM2
pm2 delete lotek-backend
pm2 delete lotek-frontend

# Monitorowanie w czasie rzeczywistym
pm2 monit
```

## Rozwiązywanie problemów

### Problem: Aplikacja nie startuje
```bash
# Sprawdź logi błędów
pm2 logs lotek-backend --err

# Sprawdź czy plik .env istnieje
ls -la /var/www/losuje.pl/lotek/backend/.env

# Sprawdź uprawnienia
chmod 600 /var/www/losuje.pl/lotek/backend/.env
```

### Problem: Brak dostępu do logów
```bash
# Utwórz katalog logów
mkdir -p /var/log/pm2
chown -R root:root /var/log/pm2
```

### Problem: Port już zajęty
```bash
# Sprawdź co używa portu 3001
netstat -tlnp | grep :3001

# Zabij proces używający portu
kill -9 <PID>
```

## Bezpieczeństwo

✅ Pliki `.env` mają uprawnienia 600 (tylko właściciel może czytać/zapisywać)  
✅ Logi są zapisywane w dedykowanym katalogu `/var/log/pm2/`  
✅ Aplikacje uruchamiane są w trybie produkcyjnym  
✅ PM2 automatycznie restartuje aplikacje po awarii




