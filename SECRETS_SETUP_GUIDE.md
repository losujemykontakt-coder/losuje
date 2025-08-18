# 🔐 Przewodnik konfiguracji Secrets

## 📋 Wymagane zmienne środowiskowe

### 🔑 PayPal Configuration
```bash
PAYPAL_CLIENT_ID=AcLnAD0aCb1hFnw5TDDoe_k1cLkqp-FtcWai8mctRT57oDP4pPi4ukzwdaFCS6JFAkQqfH1MIb0f0s9Z
PAYPAL_CLIENT_SECRET=EEgJI6MgD80kfoghzXocyenIgmhYgoL7otwGmDeOvxKRt-eTmYfbJ6lgxEvQ3DL3J0Nze5pLkRqOrRGt
PAYPAL_ENVIRONMENT=live
PAYPAL_RETURN_URL=https://twojadomena.pl/payment-success
PAYPAL_CANCEL_URL=https://twojadomena.pl/payment-cancel
```

### 💳 Przelewy24 Configuration
```bash
PRZELEWY24_MERCHANT_ID=269321
PRZELEWY24_POS_ID=269321
PRZELEWY24_API_KEY=aa2aefcd5f59cdb2b56b40470a6d51ae
PRZELEWY24_CRC=476f49249ee1c6e1
PRZELEWY24_ENVIRONMENT=production
PRZELEWY24_RETURN_URL=https://twojadomena.pl/payment-success
PRZELEWY24_STATUS_URL=https://api.twojadomena.pl/api/przelewy24/status
```

### 🔐 Security Configuration
```bash
JWT_SECRET=twoj_silny_jwt_secret_2024_lotek_generator_bezpieczny_123456789
NODE_ENV=production
PORT=3001
```

### 📧 Email Configuration
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=twoj_email@gmail.com
EMAIL_PASS=twoje_haslo_aplikacji
EMAIL_FROM=noreply@twojadomena.pl
```

### 🌐 CORS Configuration
```bash
CORS_ORIGIN=https://twojadomena.pl
```

## 🚀 Konfiguracja w Cursor AI

### 1. Otwórz panel Secrets
- Przejdź do **Settings** → **Secrets** w Cursor AI
- Kliknij **"Add Secret"**

### 2. Dodaj wszystkie zmienne
Dodaj każdą zmienną osobno:

```
PAYPAL_CLIENT_ID
AcLnAD0aCb1hFnw5TDDoe_k1cLkqp-FtcWai8mctRT57oDP4pPi4ukzwdaFCS6JFAkQqfH1MIb0f0s9Z
```

```
PAYPAL_CLIENT_SECRET
EEgJI6MgD80kfoghzXocyenIgmhYgoL7otwGmDeOvxKRt-eTmYfbJ6lgxEvQ3DL3J0Nze5pLkRqOrRGt
```

```
PRZELEWY24_MERCHANT_ID
269321
```

```
PRZELEWY24_POS_ID
269321
```

```
PRZELEWY24_API_KEY
aa2aefcd5f59cdb2b56b40470a6d51ae
```

```
PRZELEWY24_CRC
476f49249ee1c6e1
```

```
JWT_SECRET
twoj_silny_jwt_secret_2024_lotek_generator_bezpieczny_123456789
```

## 🌍 Konfiguracja na hostingu

### Vercel
1. Przejdź do **Settings** → **Environment Variables**
2. Dodaj wszystkie zmienne z sekcji powyżej
3. Ustaw **Environment** na **Production**

### Netlify
1. Przejdź do **Site settings** → **Environment variables**
2. Dodaj wszystkie zmienne
3. Ustaw **Deploy contexts** na **Production**

### Railway
1. Przejdź do **Variables** w projekcie
2. Dodaj wszystkie zmienne środowiskowe
3. Ustaw **Environment** na **Production**

### Heroku
```bash
heroku config:set PAYPAL_CLIENT_ID=AcLnAD0aCb1hFnw5TDDoe_k1cLkqp-FtcWai8mctRT57oDP4pPi4ukzwdaFCS6JFAkQqfH1MIb0f0s9Z
heroku config:set PAYPAL_CLIENT_SECRET=EEgJI6MgD80kfoghzXocyenIgmhYgoL7otwGmDeOvxKRt-eTmYfbJ6lgxEvQ3DL3J0Nze5pLkRqOrRGt
heroku config:set PRZELEWY24_MERCHANT_ID=269321
heroku config:set PRZELEWY24_POS_ID=269321
heroku config:set PRZELEWY24_API_KEY=aa2aefcd5f59cdb2b56b40470a6d51ae
heroku config:set PRZELEWY24_CRC=476f49249ee1c6e1
heroku config:set JWT_SECRET=twoj_silny_jwt_secret_2024_lotek_generator_bezpieczny_123456789
```

## 🔒 Bezpieczeństwo

### ✅ Co zostało zrobione:
- Usunięto plik `.env` z repozytorium
- Dodano `.env` do `.gitignore`
- Wszystkie klucze są teraz w Secrets
- Konfiguracja używa prawdziwych kluczy produkcyjnych

### ⚠️ Ważne uwagi:
- **Nigdy nie commituj** plików `.env` do Git
- **Używaj silnych JWT_SECRET** w produkcji
- **Regularnie rotuj** klucze API
- **Monitoruj** logi płatności

## 🧪 Testowanie

Po skonfigurowaniu Secrets, uruchom testy:

```bash
cd backend
npm run test-payment-system
```

Sprawdź czy wszystkie integracje działają:
- ✅ PayPal Live Environment
- ✅ Przelewy24 Production
- ✅ JWT Authentication
- ✅ Email Service

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi aplikacji
2. Zweryfikuj konfigurację Secrets
3. Przetestuj integracje płatności
4. Sprawdź dokumentację PayPal/Przelewy24

