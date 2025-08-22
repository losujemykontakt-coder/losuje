# 🔧 Instrukcja aktualizacji konfiguracji PayPal na serwerze OVH przez KVM

## Problem
Aplikacja używa starych hardkodowanych danych PayPal zamiast poprawnych danych z pliku `.env`.

## Rozwiązanie
Musimy utworzyć plik `frontend/.env` na serwerze z poprawnymi danymi PayPal.

---

## 📋 KROKI DO WYKONANIA PRZEZ KVM

### 1. Połącz się z serwerem przez KVM
- Otwórz panel OVH
- Przejdź do swojego VPS
- Kliknij "KVM" (KVM over IP)
- Zaloguj się jako root

### 2. Sprawdź aktualny stan
```bash
cd /root/lotek
ls -la frontend/.env
ls -la backend/.env
```

### 3. Utwórz plik frontend/.env
```bash
cat > frontend/.env << 'EOF'
# Konfiguracja frontendu React
# Zmienne środowiskowe dla React muszą zaczynać się od REACT_APP_

# PayPal Configuration (PRAWDZIWE KLUCZE LIVE!)
REACT_APP_PAYPAL_CLIENT_ID=Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC
REACT_APP_PAYPAL_ENVIRONMENT=live

# Backend URL
REACT_APP_API_URL=https://losuje.pl

# Frontend URL
REACT_APP_FRONTEND_URL=https://losuje.pl
EOF
```

### 4. Sprawdź czy backend/.env ma poprawne dane
```bash
cat backend/.env | grep PAYPAL
```

Jeśli nie ma poprawnej konfiguracji PayPal, utwórz ją:
```bash
cat >> backend/.env << 'EOF'

# PayPal - Produkcja (PRAWDZIWE KLUCZE LIVE!)
PAYPAL_CLIENT_ID=Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC
PAYPAL_CLIENT_SECRET=EL-rOID1Th-ByzT-IcWGGxUQNkXw1sz9gwlSK_LeYTTG839kTlRqTY6VrDa2iwoLAkY-5F2edJ2kOkbR
PAYPAL_RETURN_URL=https://losuje.pl/payment-success
PAYPAL_CANCEL_URL=https://losuje.pl/payment-cancel
PAYPAL_ENVIRONMENT=live
EOF
```

### 5. Ustaw odpowiednie uprawnienia
```bash
chmod 600 frontend/.env
chmod 600 backend/.env
```

### 6. Zbuduj frontend z nowymi zmiennymi
```bash
cd frontend
npm run build
cd ..
```

### 7. Restart aplikacji
```bash
pm2 restart all
```

### 8. Sprawdź status
```bash
pm2 status
pm2 logs --lines 10
```

---

## 🔍 SPRAWDZENIE POPRAWNOŚCI

### Sprawdź czy pliki zostały utworzone:
```bash
ls -la frontend/.env
ls -la backend/.env
```

### Sprawdź zawartość plików:
```bash
cat frontend/.env
cat backend/.env | grep PAYPAL
```

### Sprawdź czy aplikacja działa:
```bash
pm2 status
curl -I https://losuje.pl
```

---

## 🚨 WAŻNE INFORMACJE

### ✅ Poprawne dane PayPal:
- **Client ID**: `Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC`
- **Environment**: `live`
- **Backend Secret**: `EL-rOID1Th-ByzT-IcWGGxUQNkXw1sz9gwlSK_LeYTTG839kTlRqTY6VrDa2iwoLAkY-5F2edJ2kOkbR`

### 🔒 Bezpieczeństwo:
- Pliki `.env` mają uprawnienia 600 (tylko root może czytać)
- Dane są prawdziwe dla środowiska LIVE
- Aplikacja używa zmiennych środowiskowych zamiast hardkodowanych wartości

### 📝 Po aktualizacji:
1. Aplikacja będzie używać poprawnych danych PayPal
2. Płatności będą działać w środowisku LIVE
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

### Sprawdź zmienne środowiskowe w aplikacji:
```bash
cd frontend
npm start
# Sprawdź w konsoli przeglądarki czy są poprawne dane PayPal
```
