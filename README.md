# 🎯 Lotek Generator - AI Ultra Pro

Zaawansowany generator liczb lotto z AI, integracją płatności i systemem kontroli dostępu.

## 🚀 Szybki start

### 1. Konfiguracja Secrets (WYMAGANE)

**Przed uruchomieniem aplikacji musisz skonfigurować Secrets w Cursor AI:**

1. Przejdź do **Settings** → **Secrets** w Cursor AI
2. Dodaj wszystkie wymagane zmienne środowiskowe (patrz `SECRETS_SETUP_GUIDE.md`)

### 2. Instalacja zależności

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Uruchomienie

```bash
# Backend (w folderze backend)
npm start

# Frontend (w folderze frontend)
npm start
```

## 🔐 Konfiguracja Secrets

**WYMAGANE ZMIENNE ŚRODOWISKOWE:**

### PayPal
```
PAYPAL_CLIENT_ID=AcLnAD0aCb1hFnw5TDDoe_k1cLkqp-FtcWai8mctRT57oDP4pPi4ukzwdaFCS6JFAkQqfH1MIb0f0s9Z
PAYPAL_CLIENT_SECRET=EEgJI6MgD80kfoghzXocyenIgmhYgoL7otwGmDeOvxKRt-eTmYfbJ6lgxEvQ3DL3J0Nze5pLkRqOrRGt
PAYPAL_ENVIRONMENT=live
```

### Przelewy24
```
PRZELEWY24_MERCHANT_ID=269321
PRZELEWY24_POS_ID=269321
PRZELEWY24_API_KEY=aa2aefcd5f59cdb2b56b40470a6d51ae
PRZELEWY24_CRC=476f49249ee1c6e1
PRZELEWY24_ENVIRONMENT=production
```

### Bezpieczeństwo
```
JWT_SECRET=twoj_silny_jwt_secret_2024_lotek_generator_bezpieczny_123456789
NODE_ENV=production
```

**📖 Pełny przewodnik:** `SECRETS_SETUP_GUIDE.md`

## 🎮 Funkcje

### 🤖 AI Generator Ultra Pro
- Zaawansowane algorytmy AI
- 6 trybów animacji
- Analiza prawdopodobieństwa
- Prawo Benforda
- Symulacje Monte Carlo
- Algorytm szachowy

### 💳 System płatności
- PayPal (Live)
- Przelewy24 (Production)
- BLIK
- Bezpieczne transakcje

### 📊 Statystyki i analizy
- Harmonic Analyzer
- Historia generowań
- Wyniki i wygrane
- Zaawansowane wykresy

### 🔐 Bezpieczeństwo
- JWT Authentication
- Rate limiting
- CORS protection
- Secure headers

## 🏗️ Architektura

```
lotek/
├── backend/           # Node.js API
│   ├── config.js     # Konfiguracja
│   ├── index.js      # Główny serwer
│   ├── payment-service.js
│   ├── paypal-service.js
│   └── przelewy24-service.js
├── frontend/         # React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai-generator/
│   │   │   ├── auth/
│   │   │   └── statistics/
│   │   └── App.js
└── SECRETS_SETUP_GUIDE.md
```

## 🧪 Testowanie

```bash
# Test systemu płatności
cd backend
node test-payment-system.js

# Test integracji PayPal
node test-paypal.js

# Test integracji Przelewy24
node test-przelewy24-integration.js
```

## 🌍 Deployment

### Vercel
1. Skonfiguruj Environment Variables
2. Dodaj wszystkie Secrets
3. Deploy

### Netlify
1. Skonfiguruj Environment Variables
2. Dodaj wszystkie Secrets
3. Deploy

**📖 Pełny przewodnik deploymentu:** `DEPLOYMENT_GUIDE.md`

## 🔒 Bezpieczeństwo

- ✅ Wszystkie klucze w Secrets
- ✅ Brak plików `.env` w repo
- ✅ HTTPS w produkcji
- ✅ JWT Authentication
- ✅ Rate limiting

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź `SECRETS_SETUP_GUIDE.md`
2. Zweryfikuj konfigurację Secrets
3. Przetestuj integracje płatności
4. Sprawdź logi aplikacji

## 📄 Licencja

MIT License - zobacz `LICENSE` dla szczegółów.

