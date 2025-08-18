# System Kontroli Dostępu - Lotek Generator

## Przegląd

Zaimplementowano system kontroli dostępu, który ogranicza dostęp do funkcji premium na podstawie:
1. **7 dni od daty rejestracji** - okres próbny
2. **Aktywna subskrypcja** - po opłaceniu 9.99 zł

## Komponenty Systemu

### 1. Middleware `checkAccess` (backend/security-middleware.js)

```javascript
const checkAccess = async (req, res, next) => {
  // Sprawdza token JWT
  // Weryfikuje dostęp użytkownika
  // Zwraca 403 jeśli dostęp wygasł
}
```

**Funkcjonalności:**
- Weryfikacja tokenu JWT z nagłówka `Authorization: Bearer <token>`
- Sprawdzenie daty rejestracji użytkownika
- Sprawdzenie statusu subskrypcji
- Logowanie prób nieautoryzowanego dostępu
- Zwracanie szczegółowych informacji o błędach

### 2. Funkcje Bazy Danych (backend/db.js)

#### `checkUserAccess(userId)`
```javascript
// Sprawdza dostęp użytkownika na podstawie:
// - Dni od rejestracji (max 7)
// - Status subskrypcji (active/trial)
// - Daty wygaśnięcia subskrypcji/trial
```

#### `updateUserPaymentStatus(userId, hasPaid)`
```javascript
// Aktualizuje status płatności użytkownika
// Ustawia subscription_status = 'active'
// Ustawia subscription_plan = 'premium'
// Dodaje 30 dni do subskrypcji
```

### 3. Frontend - Obsługa Błędów (frontend/src/utils/auth.js)

#### `checkUserAccess()`
```javascript
// Sprawdza dostęp użytkownika przez API
// Zwraca informacje o błędach 403/401
```

#### `handleAccessError(error, navigate)`
```javascript
// Obsługuje błędy dostępu
// Przekierowuje na stronę płatności (403)
// Przekierowuje na stronę logowania (401)
```

## Zastosowanie Middleware

### Trasy Wymagające Dostępu Premium

Wszystkie następujące trasy używają middleware `checkAccess`:

```javascript
// Statystyki
app.get('/api/stats/:game', securityMiddleware.checkAccess, ...)
app.post('/api/update-stats/:game', securityMiddleware.checkAccess, ...)
app.post('/api/refresh-stats', securityMiddleware.checkAccess, ...)

// Szczegółowe statystyki
app.get('/api/statistics/:gameType', securityMiddleware.checkAccess, ...)
app.post('/api/statistics/update', securityMiddleware.checkAccess, ...)
app.get('/api/statistics', securityMiddleware.checkAccess, ...)

// Wyniki i wygrane
app.get('/api/results/:game', securityMiddleware.checkAccess, ...)
app.get('/api/winnings/:game', securityMiddleware.checkAccess, ...)
app.get('/api/winnings', securityMiddleware.checkAccess, ...)
```

## Komunikaty Błędów

### 403 - Dostęp Wygasł
```json
{
  "message": "Dostęp wygasł. Wykup subskrypcję za 9.99.",
  "error": "ACCESS_DENIED",
  "details": {
    "daysSinceRegistration": 10,
    "subscriptionStatus": "trial",
    "hasActiveSubscription": false,
    "hasActiveTrial": false
  }
}
```

### 401 - Brak Autoryzacji
```json
{
  "message": "Brak tokenu autoryzacji",
  "error": "UNAUTHORIZED"
}
```

## Aktualizacja Statusu Płatności

### Webhook PayPal
```javascript
// W app.post('/api/payment/finalize')
await updateUserPaymentStatus(userId, true);
```

### Webhook Przelewy24
```javascript
// W app.post('/api/przelewy24/status')
// TODO: Dodać logikę aktualizacji na podstawie session ID
```

## Frontend - Obsługa Dostępu

### Komponent GryPoZalogowaniu

1. **Sprawdzanie dostępu przy ładowaniu:**
```javascript
useEffect(() => {
  const checkAccess = async () => {
    const accessResult = await checkUserAccess();
    if (!accessResult.hasAccess) {
      handleAccessError(accessResult.error, navigate);
    }
  };
  checkAccess();
}, [navigate]);
```

2. **Sprawdzanie dostępu przed akcjami:**
```javascript
const handleBallClick = async () => {
  const accessResult = await checkUserAccess();
  if (!accessResult.hasAccess) {
    handleAccessError(accessResult.error, navigate);
    return;
  }
  // Wykonaj akcję
};
```

3. **Modal płatności:**
```javascript
const PaymentModal = () => {
  // Pokazuje się gdy użytkownik nie ma dostępu
  // Zawiera informacje o subskrypcji
  // Przekierowuje na stronę płatności
};
```

## Logowanie Bezpieczeństwa

Wszystkie próby nieautoryzowanego dostępu są logowane:

```javascript
logSecurityEvent('ACCESS_DENIED', {
  userId: decoded.id,
  email: decoded.email,
  ip: req.ip,
  path: req.path,
  daysSinceRegistration: accessInfo.daysSinceRegistration,
  subscriptionStatus: accessInfo.subscriptionStatus
});
```

## Konfiguracja

### CORS
```javascript
SECURITY: {
  CORS: {
    ALLOWED_ORIGINS: ['http://localhost:3000', 'http://127.0.0.1:3000']
  }
}
```

### JWT
```javascript
SECURITY: {
  JWT_EXPIRES_IN: '24h'
}
```

## Testowanie

### 1. Test Okresu Próbnego
- Zarejestruj nowego użytkownika
- Sprawdź dostęp przez 7 dni
- Po 7 dniach powinien otrzymać błąd 403

### 2. Test Subskrypcji
- Wykonaj płatność
- Sprawdź czy `subscription_status` = 'active'
- Dostęp powinien być przywrócony

### 3. Test Błędów
- Usuń token z localStorage
- Sprawdź czy otrzymujesz błąd 401
- Sprawdź czy przekierowanie działa

## Bezpieczeństwo

1. **Weryfikacja tokenów JWT** - wszystkie żądania wymagają ważnego tokenu
2. **Logowanie prób dostępu** - wszystkie próby są rejestrowane
3. **CORS** - ograniczenie do dozwolonych origins
4. **Rate limiting** - ochrona przed atakami brute force
5. **Walidacja danych** - sanityzacja wszystkich danych wejściowych

## Rozszerzenia

### Dodanie Nowych Tras Premium
```javascript
app.get('/api/new-premium-endpoint', securityMiddleware.checkAccess, async (req, res) => {
  // Endpoint wymagający dostępu premium
});
```

### Dodanie Nowych Metod Płatności
```javascript
// W webhooku nowej metody płatności
await updateUserPaymentStatus(userId, true);
```

### Dostosowanie Okresu Próbnego
```javascript
// W funkcji checkUserAccess
const daysSinceRegistration = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
const hasAccess = daysSinceRegistration <= 7 || hasActiveSubscription || hasActiveTrial;
```



