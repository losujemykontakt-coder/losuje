# 🏦 Przewodnik konfiguracji PayPal Business

## 📋 Krok 1: Utworzenie konta PayPal Business

1. **Wejdź na** https://www.paypal.com/pl/business
2. **Kliknij "Zarejestruj się"**
3. **Wybierz "Konto Business"**
4. **Wypełnij dane:**
   - Imię i nazwisko
   - Email
   - Hasło
   - Numer telefonu
   - Adres firmy

## 📋 Krok 2: Weryfikacja konta

1. **Potwierdź email** - kliknij link w wiadomości
2. **Dodaj numer telefonu** - otrzymasz kod SMS
3. **Dodaj kartę bankową** - do wypłat pieniędzy
4. **Weryfikuj tożsamość** - może być wymagane

## 📋 Krok 3: Konfiguracja API

1. **Zaloguj się do PayPal Developer**
   - https://developer.paypal.com/
   - Użyj tego samego emaila co konto Business

2. **Utwórz aplikację:**
   - Dashboard → My Apps & Credentials
   - Create App → Business
   - Nazwa: "Lotek Generator"

3. **Pobierz klucze API:**
   - Client ID (publiczny)
   - Client Secret (prywatny)

## 📋 Krok 4: Konfiguracja w aplikacji

### Backend (.env):
```env
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
NODE_ENV=production
```

### Frontend (opcjonalnie):
```javascript
// W paypalService.js
const API_BASE_URL = 'https://twoja-domena.com/api';
```

## 📋 Krok 5: Testowanie

1. **Sandbox (testy):**
   - Użyj testowych kont PayPal
   - Pieniądze nie są realne

2. **Live (produkcja):**
   - Prawdziwe płatności
   - Pieniądze trafiają na Twoje konto

## 💰 Opłaty PayPal:

- **Transakcje krajowe:** 2.9% + 1.35 PLN
- **Transakcje międzynarodowe:** 3.9% + 1.35 PLN
- **Wypłaty:** Bezpłatne (na konto bankowe)

## 🔒 Bezpieczeństwo:

1. **Nigdy nie udostępniaj Client Secret**
2. **Używaj HTTPS w produkcji**
3. **Waliduj wszystkie płatności**
4. **Loguj wszystkie transakcje**

## 📞 Wsparcie:

- PayPal Business Support: +48 22 307 13 00
- Developer Support: https://developer.paypal.com/support/ 