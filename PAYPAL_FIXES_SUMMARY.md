# 🔧 PayPal i API - Naprawione Problemy

## ✅ Naprawione Problemy

### 1. **PayPal SDK - Failed to fetch / 400 Bad Request**

**Problem:** PayPal SDK nie ładował się z powodu braku client-id w URL.

**Rozwiązanie:**
- ✅ Dodano walidację PayPal Client ID w `App.js`
- ✅ Poprawiono konfigurację PayPal Script Provider
- ✅ Dodano lepsze logowanie błędów

**Pliki zmienione:**
- `frontend/src/App.js` - poprawiona konfiguracja PayPal
- `frontend/src/utils/paypalConfig.js` - walidacja konfiguracji

### 2. **403 (Forbidden) przy API**

**Problem:** API zwracał 403 błąd z powodu braku autoryzacji Firebase.

**Rozwiązanie:**
- ✅ Dodano middleware weryfikacji tokena Firebase w `functions/index.js`
- ✅ Dodano wysyłanie tokena Authorization w frontend
- ✅ Poprawiono endpoint `/api/talismans/:userId`

**Pliki zmienione:**
- `functions/index.js` - dodano `verifyFirebaseToken` middleware
- `frontend/src/components/Talizmany.js` - dodano header Authorization

### 3. **createOrder error → http://localhost:3001**

**Problem:** Frontend próbował łączyć się z localhost zamiast z produkcyjnym backendem.

**Rozwiązanie:**
- ✅ Poprawiono URL API w `PayPalButtonWrapper.js`
- ✅ Dodano logikę wyboru URL (development vs production)
- ✅ Zmieniono proxy w `package.json`
- ✅ Dodano brakujące endpointy PayPal w Firebase Functions

**Pliki zmienione:**
- `frontend/src/components/PayPalButtonWrapper.js` - poprawione URL API
- `frontend/package.json` - zmieniony proxy
- `functions/index.js` - dodano endpointy `/paypal/create` i `/paypal/capture/:orderId`

## 🔧 Nowe Endpointy w Firebase Functions

Dodano brakujące endpointy PayPal:

```javascript
// Tworzenie zamówienia PayPal
POST /api/paypal/create
{
  "amount": 9.99,
  "currency": "PLN",
  "description": "Plan Premium",
  "email": "user@example.com",
  "plan": "monthly"
}

// Finalizacja płatności PayPal
POST /api/paypal/capture/:orderId
{
  "plan": "monthly"
}
```

## 📋 Wymagane Zmienne Środowiskowe

Utwórz plik `.env` w katalogu `frontend/` z następującymi zmiennymi:

```bash
# PayPal Configuration
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
REACT_APP_PAYPAL_ENVIRONMENT=live

# API Configuration
REACT_APP_API_URL=https://your-region-your-project.cloudfunctions.net

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 🚀 Deployment

1. **Deploy Firebase Functions:**
```bash
cd functions/
npm install
firebase deploy --only functions
```

2. **Build i deploy frontend:**
```bash
cd frontend/
npm run build
firebase deploy --only hosting
```

## 🔍 Testowanie

Po wdrożeniu sprawdź:

1. **PayPal SDK ładuje się poprawnie** - sprawdź konsolę przeglądarki
2. **API endpoints odpowiadają** - sprawdź Network tab
3. **Autoryzacja działa** - zaloguj się i sprawdź dostęp do talizmanów
4. **PayPal płatności działają** - przetestuj proces płatności

## ⚠️ Uwagi

- PayPal Client ID musi być prawidłowy (live lub sandbox)
- Firebase Functions muszą być wdrożone przed testowaniem
- Upewnij się, że CORS jest poprawnie skonfigurowany
- Wszystkie endpointy używają teraz autoryzacji Firebase Auth

## 🐛 Debugowanie

Jeśli nadal występują problemy:

1. Sprawdź logi Firebase Functions: `firebase functions:log`
2. Sprawdź konsolę przeglądarki pod kątem błędów
3. Upewnij się, że zmienne środowiskowe są ustawione
4. Sprawdź Network tab w narzędziach deweloperskich