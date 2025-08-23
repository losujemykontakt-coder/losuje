# 🔄 Przewodnik aktualizacji aplikacji LOTTO AI

## 📋 **Jak aktualizować aplikację po zmianach**

### **🎯 Szybka aktualizacja (5 minut)**

#### **1. Edytuj kod lokalnie**
```bash
# Wprowadź zmiany w kodzie
# - frontend/src/ - zmiany w React
# - backend/ - zmiany w Node.js
```

#### **2. Uruchom aktualizację**
```bash
# Edytuj update-app.sh i dodaj IP serwera
SERVER_IP="51.68.123.45"  # Zastąp swoim IP

# Uruchom aktualizację
chmod +x update-app.sh
./update-app.sh
```

### **🔧 Ręczna aktualizacja (10 minut)**

#### **1. Budowanie frontendu**
```bash
cd frontend
npm run build
cd ..
```

#### **2. Upload na serwer**
```bash
# Skopiuj pliki na serwer
scp -r frontend/build/* root@51.68.123.45:/var/www/lotek/frontend/
scp -r backend/* root@51.68.123.45:/var/www/lotek/backend/
```

#### **3. Restart aplikacji**
```bash
ssh root@51.68.123.45
cd /var/www/lotek/backend
npm install --production
pm2 restart lotek-backend
```

## 📁 **Co się aktualizuje:**

### **Frontend (React):**
- ✅ Komponenty React
- ✅ Style CSS
- ✅ Logika JavaScript
- ✅ Routing
- ✅ Animacje

### **Backend (Node.js):**
- ✅ API endpoints
- ✅ Logika serwera
- ✅ Integracje (Firebase, płatności)
- ✅ Web scraping
- ✅ Zmienne środowiskowe

### **Konfiguracja:**
- ✅ Nginx (reverse proxy)
- ✅ PM2 (process manager)
- ✅ SSL/HTTPS
- ✅ Firewall

## 🛡️ **Bezpieczeństwo aktualizacji:**

### **Automatyczny backup:**
- ✅ Przed każdą aktualizacją
- ✅ Ostatnie 3 wersje zachowane
- ✅ Możliwość rollback

### **Sprawdzenie działania:**
- ✅ Test aplikacji po aktualizacji
- ✅ Sprawdzenie logów
- ✅ Monitoring PM2

## 📊 **Monitoring i logi:**

### **Sprawdź logi:**
```bash
# Logi aplikacji
ssh root@51.68.123.45 'pm2 logs lotek-backend'

# Logi Nginx
ssh root@51.68.123.45 'tail -f /var/log/nginx/error.log'

# Status aplikacji
ssh root@51.68.123.45 'pm2 status'
```

### **Dashboard PM2:**
```bash
ssh root@51.68.123.45 'pm2 monit'
```

## 🔄 **Scenariusze aktualizacji:**

### **Małe zmiany (CSS, tekst):**
```bash
./update-app.sh
# Czas: 2-3 minuty
```

### **Średnie zmiany (komponenty React):**
```bash
./update-app.sh
# Czas: 3-5 minut
```

### **Duże zmiany (API, nowe funkcje):**
```bash
./update-app.sh
# Sprawdź logi po aktualizacji
# Czas: 5-10 minut
```

### **Krytyczne zmiany (baza danych):**
```bash
# 1. Backup bazy danych
ssh root@51.68.123.45 'pm2 stop lotek-backend'

# 2. Aktualizacja
./update-app.sh

# 3. Migracje bazy danych (jeśli potrzebne)
ssh root@51.68.123.45 'cd /var/www/lotek/backend && npm run migrate'

# 4. Restart
ssh root@51.68.123.45 'pm2 start lotek-backend'
```

## 🚨 **Rozwiązywanie problemów:**

### **Aplikacja nie działa po aktualizacji:**
```bash
# 1. Sprawdź logi
ssh root@51.68.123.45 'pm2 logs lotek-backend'

# 2. Przywróć backup
ssh root@51.68.123.45 'pm2 stop lotek-backend'
ssh root@51.68.123.45 'cp -r /var/www/lotek-backup-YYYYMMDD-HHMMSS/* /var/www/lotek/'
ssh root@51.68.123.45 'pm2 start lotek-backend'

# 3. Sprawdź działanie
curl https://losuje.pl
```

### **Błędy w logach:**
```bash
# Sprawdź szczegółowe logi
ssh root@51.68.123.45 'pm2 logs lotek-backend --lines 100'

# Sprawdź zmienne środowiskowe
ssh root@51.68.123.45 'cat /var/www/lotek/backend/.env'
```

## 📈 **Najlepsze praktyki:**

### **Przed aktualizacją:**
1. ✅ Przetestuj zmiany lokalnie
2. ✅ Sprawdź czy aplikacja się buduje
3. ✅ Przygotuj plan rollback

### **Podczas aktualizacji:**
1. ✅ Użyj skryptu update-app.sh
2. ✅ Sprawdź logi po aktualizacji
3. ✅ Przetestuj główne funkcje

### **Po aktualizacji:**
1. ✅ Sprawdź działanie aplikacji
2. ✅ Monitoruj logi przez 10-15 minut
3. ✅ Sprawdź wydajność

## 🎯 **Gotowe!**

Po każdej aktualizacji:
- **Aplikacja:** https://losuje.pl
- **Backup:** Automatyczny
- **Monitoring:** PM2 + Nginx
- **Logi:** Dostępne przez SSH

**Czas aktualizacji: 2-10 minut**















