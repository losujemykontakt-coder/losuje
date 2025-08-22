# 🚀 Aktualizacja aplikacji przez Git na serwerze OVH

## Problem
Masz już poprawne pliki `.env` na serwerze, ale aplikacja ich nie używała. Po zmianach w `App.js` aplikacja teraz będzie pobierać dane z plików `.env`.

## Rozwiązanie
Musisz zaktualizować aplikację na serwerze przez Git, żeby pobrać nowe zmiany z `App.js`.

---

## 📋 KROKI DO WYKONANIA PRZEZ KVM

### **1. Połącz się z serwerem przez KVM**
- Otwórz panel OVH
- Przejdź do swojego VPS
- Kliknij "KVM" (KVM over IP)
- Zaloguj się jako root

### **2. Uruchom automatyczny skrypt (NAJŁATWIEJSZA OPCJA):**
```bash
cd /root/lotek
chmod +x update-app-via-git.sh
./update-app-via-git.sh
```

### **3. LUB wykonaj kroki ręcznie:**

**a) Przejdź do katalogu aplikacji:**
```bash
cd /root/lotek
```

**b) Sprawdź status Git:**
```bash
git status
```

**c) Pobierz najnowsze zmiany:**
```bash
git fetch origin
git checkout main
git pull origin main
```

**d) Sprawdź czy pliki .env istnieją:**
```bash
ls -la frontend/.env
ls -la backend/.env
```

**e) Zbuduj frontend:**
```bash
cd frontend
npm run build
cd ..
```

**f) Restart aplikacji:**
```bash
pm2 restart all
```

---

## 🔍 SPRAWDZENIE POPRAWNOŚCI

### Sprawdź status aplikacji:
```bash
pm2 status
pm2 logs --lines 10
```

### Sprawdź czy aplikacja działa:
```bash
curl -I https://losuje.pl
```

### Sprawdź konfigurację PayPal:
```bash
cat frontend/.env | grep PAYPAL
cat backend/.env | grep PAYPAL
```

---

## 🚨 WAŻNE INFORMACJE

### ✅ Co się zmieniło:
1. **App.js** teraz używa `process.env.REACT_APP_PAYPAL_CLIENT_ID` zamiast hardkodowanych danych
2. Aplikacja będzie pobierać dane z pliku `frontend/.env`
3. PayPal będzie używać środowiska `live` zamiast `production`

### 🔒 Bezpieczeństwo:
- Pliki `.env` pozostają na serwerze (nie są w Git)
- Dane PayPal są bezpieczne
- Aplikacja używa zmiennych środowiskowych

### 📝 Po aktualizacji:
1. Aplikacja będzie używać danych z plików `.env`
2. PayPal będzie działać z poprawnymi danymi LIVE
3. Nie będzie już hardkodowanych starych danych

---

## 🆘 W razie problemów

### Sprawdź logi:
```bash
pm2 logs
```

### Sprawdź czy frontend się zbudował:
```bash
ls -la frontend/build/
```

### Sprawdź zmienne środowiskowe:
```bash
cd frontend
npm start
# Sprawdź w konsoli przeglądarki czy są poprawne dane PayPal
```

### Jeśli są błędy z Git:
```bash
git stash
git pull origin main
git stash pop
```

---

## 📁 Przygotowane skrypty:
1. `update-app-via-git.sh` - pełna aktualizacja z sprawdzeniami
2. `git-update-simple.sh` - prosta aktualizacja
3. `GIT_UPDATE_GUIDE.md` - ta instrukcja

**Najłatwiej będzie uruchomić `update-app-via-git.sh` przez KVM!** 🚀
