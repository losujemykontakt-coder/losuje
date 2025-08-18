# ✅ Checklista konfiguracji płatności

## 🏦 Krok 1: Konto PayPal Business
- [ ] Utwórz konto na https://www.paypal.com/pl/business
- [ ] Potwierdź email
- [ ] Dodaj numer telefonu
- [ ] Dodaj kartę bankową
- [ ] Weryfikuj tożsamość (jeśli wymagane)

## 🔑 Krok 2: PayPal Developer
- [ ] Zaloguj się na https://developer.paypal.com/
- [ ] Utwórz aplikację "Lotek Generator"
- [ ] Pobierz Client ID i Client Secret

## ⚙️ Krok 3: Konfiguracja aplikacji
- [ ] Utwórz plik `.env` w folderze `backend/`
- [ ] Dodaj klucze PayPal:
```env
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
NODE_ENV=development
```

## 🧪 Krok 4: Testowanie
- [ ] Uruchom backend: `cd backend && node index.js`
- [ ] Sprawdź endpoint: `curl http://localhost:3001/api/payment/methods`
- [ ] Przetestuj płatność w aplikacji

## 🚀 Krok 5: Produkcja
- [ ] Zmień `NODE_ENV=production` w `.env`
- [ ] Użyj live kluczy PayPal
- [ ] Wdróż na serwer produkcyjny

## 💰 Opłaty PayPal:
- Transakcje krajowe: 2.9% + 1.35 PLN
- Transakcje międzynarodowe: 3.9% + 1.35 PLN
- Wypłaty: Bezpłatne

## 📞 Wsparcie:
- PayPal Business: +48 22 307 13 00
- Developer Support: https://developer.paypal.com/support/ 