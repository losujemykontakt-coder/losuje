# Instrukcja testowania integracji Przelewy24

## Problem z localhost
Przelewy24 nie akceptuje `localhost` w URL-ach zwrotnych (`p24_url_return` i `p24_url_status`). Dlatego musimy użyć `ngrok` do tunelowania lokalnego serwera.

## Krok 1: Instalacja ngrok
1. Pobierz ngrok ze strony: https://ngrok.com/download
2. Rozpakuj plik
3. Zarejestruj się na https://ngrok.com i uzyskaj authtoken
4. Uruchom: `ngrok config add-authtoken YOUR_TOKEN`

## Krok 2: Uruchomienie tunelu
```bash
# Uruchom backend na porcie 3001
cd backend && npm start

# W nowym terminalu uruchom ngrok dla backendu
ngrok http 3001

# W kolejnym terminalu uruchom ngrok dla frontendu
ngrok http 3000
```

## Krok 3: Aktualizacja konfiguracji
Po uruchomieniu ngrok otrzymasz URL-e podobne do:
- Backend: `https://abc123.ngrok.io`
- Frontend: `https://def456.ngrok.io`

Zaktualizuj `backend/config.js`:

```javascript
// Konfiguracja Przelewy24
PRZELEWY24: {
  MERCHANT_ID: process.env.PRZELEWY24_MERCHANT_ID || '269321',
  POS_ID: process.env.PRZELEWY24_POS_ID || '269321',
  API_KEY: process.env.PRZELEWY24_API_KEY || '',
  CRC: process.env.PRZELEWY24_CRC || '1a2b3c4d5e6f7',
  RETURN_URL: 'https://def456.ngrok.io/payment-success', // URL frontendu
  STATUS_URL: 'https://abc123.ngrok.io/api/przelewy24/status', // URL backendu
  ENVIRONMENT: 'sandbox'
},
```

## Krok 4: Testowanie integracji

### 1. Test rejestracji płatności
```bash
curl -X POST https://abc123.ngrok.io/api/przelewy24/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "method": "card",
    "amount": 9.99,
    "currency": "PLN",
    "description": "Plan Premium - premium",
    "email": "test@example.com"
  }'
```

### 2. Test webhook
```bash
curl -X POST https://abc123.ngrok.io/api/przelewy24/status \
  -H "Content-Type: application/json" \
  -d '{
    "p24_merchant_id": "269321",
    "p24_pos_id": "269321",
    "p24_session_id": "session_123",
    "p24_amount": "999",
    "p24_currency": "PLN",
    "p24_order_id": "12345",
    "p24_method": "1",
    "p24_statement": "test",
    "p24_sign": "generated_sign_here"
  }'
```

## Krok 5: Testowanie w przeglądarce

1. Otwórz `https://def456.ngrok.io` w przeglądarce
2. Zaloguj się na konto
3. Przejdź do zakładki "Płatności"
4. Wybierz metodę płatności (BLIK, karta, przelew)
5. Kliknij "ZAPŁAĆ"
6. Powinieneś zostać przekierowany na stronę Przelewy24

## Krok 6: Monitorowanie logów

### Backend (terminal 1)
```bash
cd backend && npm start
```
Obserwuj logi:
- Rejestracja płatności
- Generowanie p24_sign
- Odpowiedź z Przelewy24
- Webhook callbacks

### ngrok (terminal 2)
```bash
ngrok http 3001
```
Sprawdź:
- Incoming requests
- Response codes
- Request/response bodies

## Krok 7: Debugowanie

### Sprawdź logi backendu:
```
=== KONFIGURACJA PRZELEWY24 ===
Base URL: https://sandbox.przelewy24.pl
Environment: sandbox
Merchant ID: 269321
POS ID: 269321
CRC: 1a2b3c4d5e6f7
Return URL: https://def456.ngrok.io/payment-success
Status URL: https://abc123.ngrok.io/api/przelewy24/status
=== KONIEC KONFIGURACJI ===

=== REJESTRACJA PŁATNOŚCI PRZELEWY24 ===
Session ID: session_1234567890_abc123
Kwota: 9.99 PLN
Opis: Plan Premium - premium
Email: test@example.com
Kwota w groszach: 999
p24_sign: abc123def456...
Dane do rejestracji: { p24_merchant_id: '269321', ... }
Form data: p24_merchant_id=269321&p24_pos_id=269321&...
Wysyłanie żądania do: https://sandbox.przelewy24.pl/trnRegister
Status odpowiedzi: 200
✅ Token otrzymany: abc123def456...
```

### Sprawdź logi ngrok:
```
HTTP Requests
------------- 
POST /api/przelewy24/create-payment 200 OK
POST /api/przelewy24/status 200 OK
```

## Krok 8: Rozwiązywanie problemów

### Problem: "Błąd walidacji danych płatności"
**Rozwiązanie:**
1. Sprawdź czy użytkownik jest zalogowany
2. Sprawdź czy email jest poprawny
3. Sprawdź logi backendu

### Problem: "Brak tokenu w odpowiedzi Przelewy24"
**Rozwiązanie:**
1. Sprawdź czy CRC jest poprawny
2. Sprawdź czy p24_sign jest generowany poprawnie
3. Sprawdź czy wszystkie wymagane pola są wysyłane

### Problem: "Przelewy24 nie przyjmuje localhost"
**Rozwiązanie:**
1. Użyj ngrok do tunelowania
2. Zaktualizuj URL-e w konfiguracji
3. Uruchom ponownie serwery

### Problem: "Webhook nie działa"
**Rozwiązanie:**
1. Sprawdź czy ngrok URL jest dostępny publicznie
2. Sprawdź czy endpoint `/api/przelewy24/status` odpowiada
3. Sprawdź logi ngrok dla incoming requests

## Krok 9: Dane testowe Przelewy24

### Karty testowe:
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **Expiry**: 12/25
- **CVV**: 123

### BLIK:
- Użyj aplikacji bankowej do testowania

### Przelew:
- Użyj danych testowych banku

## Krok 10: Produkcja

Przed wdrożeniem na produkcję:
1. Zmień `ENVIRONMENT` na `'production'`
2. Zaktualizuj URL-e na rzeczywiste domeny
3. Użyj rzeczywistych danych Przelewy24
4. Przetestuj webhook na produkcji
5. Skonfiguruj monitoring i alerty 