# Przewodnik wdrożenia na produkcję

## 1. Konfiguracja Przelewy24 na produkcji

### a) W panelu Przelewy24:
1. Przejdź do **Panelu Przelewy24**
2. W sekcji **Konfiguracja** ustaw:
   - **URL zwrotny**: `https://twojadomena.pl/payment-success`
   - **URL statusu**: `https://api.twojadomena.pl/api/przelewy24/status`
   - **Środowisko**: `Produkcja` (nie sandbox!)

### b) W pliku `.env` na serwerze:
```bash
# Przelewy24 - Produkcja
PRZELEWY24_MERCHANT_ID=twoj_rzeczywisty_merchant_id
PRZELEWY24_POS_ID=twoj_rzeczywisty_pos_id
PRZELEWY24_API_KEY=twoj_rzeczywisty_api_key
PRZELEWY24_CRC=twoj_rzeczywisty_crc_key
PRZELEWY24_RETURN_URL=https://twojadomena.pl/payment-success
PRZELEWY24_STATUS_URL=https://api.twojadomena.pl/api/przelewy24/status
PRZELEWY24_ENVIRONMENT=production
```

## 2. Konfiguracja PayPal na produkcji

### a) W PayPal Developer Dashboard:
1. Przejdź do **PayPal Developer Dashboard**
2. Zmień środowisko z **Sandbox** na **Live**
3. Skopiuj **Client ID** i **Client Secret** z sekcji Live

### b) W pliku `.env` na serwerze:
```bash
# PayPal - Produkcja
PAYPAL_CLIENT_ID=twoj_rzeczywisty_client_id
PAYPAL_CLIENT_SECRET=twoj_rzeczywisty_client_secret
PAYPAL_RETURN_URL=https://twojadomena.pl/payment-success
PAYPAL_CANCEL_URL=https://twojadomena.pl/payment-cancel
PAYPAL_ENVIRONMENT=live
```

## 3. Konfiguracja serwera

### a) Zmienne środowiskowe:
```bash
# CORS dla produkcji
CORS_ORIGIN=https://twojadomena.pl

# JWT Secret (zmień na silny, losowy klucz!)
JWT_SECRET=twoj_silny_jwt_secret_2024_produkcja

# Email (dla resetowania hasła)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=twoj_email@gmail.com
EMAIL_PASS=twoje_haslo_aplikacji
EMAIL_FROM=noreply@twojadomena.pl

# Port serwera
PORT=3001

# Środowisko
NODE_ENV=production
```

## 4. Wdrożenie aplikacji

### a) Backend:
```bash
# Na serwerze
cd backend
npm install
npm start
```

### b) Frontend:
```bash
# Na serwerze
cd frontend
npm install
npm run build
# Skopiuj zawartość folderu build do katalogu web serwera
```

## 5. Testowanie płatności

### a) Przelewy24 (BLIK, karty, przelewy):
1. Przejdź na `https://twojadomena.pl`
2. Zaloguj się i przejdź do płatności
3. Wybierz BLIK/kartę/przelew
4. Kliknij "Zapłać"
5. Powinno przekierować na stronę Przelewy24
6. Dokonaj płatności testowej

### b) PayPal:
1. Wybierz PayPal jako metodę płatności
2. Kliknij "Zapłać"
3. Powinno przekierować na stronę PayPal
4. Zaloguj się i potwierdź płatność

## 6. Monitorowanie

### a) Logi backendu:
```bash
# Sprawdź logi aplikacji
tail -f /var/log/twoja-aplikacja.log
```

### b) Webhooki Przelewy24:
- Sprawdź w panelu Przelewy24 czy webhooki są dostarczane
- Sprawdź logi backendu pod kątem endpointu `/api/przelewy24/status`

## 7. Bezpieczeństwo

### a) HTTPS:
- Upewnij się, że wszystkie URL-e używają HTTPS
- Skonfiguruj SSL na serwerze

### b) Firewall:
- Otwórz port 3001 dla backendu
- Skonfiguruj reverse proxy (nginx/Apache)

### c) Zmienne środowiskowe:
- Nigdy nie commituj pliku `.env` do Git
- Użyj silnych, losowych kluczy

## 8. Rozwiązywanie problemów

### Problem: "Brak tokenu w odpowiedzi Przelewy24"
**Rozwiązanie:**
- Sprawdź czy CRC jest poprawny
- Sprawdź czy wszystkie URL-e są dostępne z internetu
- Sprawdź czy środowisko jest ustawione na `production`

### Problem: "PayPal nie działa"
**Rozwiązanie:**
- Sprawdź czy używasz kluczy z sekcji Live (nie Sandbox)
- Sprawdź czy ENVIRONMENT=live

### Problem: "Webhooki nie działają"
**Rozwiązanie:**
- Sprawdź czy serwer jest dostępny z internetu
- Sprawdź czy endpoint `/api/przelewy24/status` odpowiada
- Sprawdź logi serwera

## 9. Kontakt

W razie problemów:
1. Sprawdź logi aplikacji
2. Sprawdź logi serwera
3. Sprawdź panel Przelewy24/PayPal
4. Skontaktuj się z supportem Przelewy24/PayPal 