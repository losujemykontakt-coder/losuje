# Naprawki Płatności - Kompletne Rozwiązanie

## 1. Backend - Poprawiona Konfiguracja

### CORS Configuration (backend/index.js)
```javascript
// Konfiguracja CORS - poprawiona zgodnie z Twoimi wskazówkami
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Middleware do logowania CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`🌐 [CORS] Request from: ${origin}`);
  console.log(`🌐 [CORS] Method: ${req.method}`);
  console.log(`🌐 [CORS] Path: ${req.path}`);
  
  // Dodaj nagłówki CORS dla preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
    return;
  }
  
  next();
});
```

### Endpoint Health z Diagnostyką
```javascript
app.get('/api/health', (req, res) => {
  console.log('=== HEALTH CHECK ===');
  console.log('Request headers:', req.headers);
  console.log('Request IP:', req.ip);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  
  // Sprawdź czy CORS działa
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  
  if (origin && allowedOrigins.includes(origin)) {
    console.log('✅ CORS: Origin dozwolony:', origin);
  } else if (origin) {
    console.log('❌ CORS: Origin nie dozwolony:', origin);
  } else {
    console.log('ℹ️ CORS: Brak origin header');
  }
  
  res.json({
    success: true,
    message: 'Backend działa poprawnie',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    cors: {
      origin: origin,
      allowed: allowedOrigins,
      working: origin ? allowedOrigins.includes(origin) : true
    }
  });
});
```

### Endpoint Testowy Płatności
```javascript
app.post('/api/payment/test', (req, res) => {
  console.log('=== TEST PŁATNOŚCI ===');
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers);
  console.log('Request IP:', req.ip);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Content-Type:', req.headers['content-type']);
  
  // Sprawdź czy CORS działa
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  
  if (origin && allowedOrigins.includes(origin)) {
    console.log('✅ CORS: Origin dozwolony:', origin);
  } else if (origin) {
    console.log('❌ CORS: Origin nie dozwolony:', origin);
  } else {
    console.log('ℹ️ CORS: Brak origin header');
  }
  
  // Sprawdź czy serwisy są dostępne
  const servicesStatus = {
    paypalService: typeof paypalService !== 'undefined',
    paymentService: typeof paymentService !== 'undefined',
    przelewy24Service: typeof przelewy24Service !== 'undefined'
  };
  
  console.log('📊 Status serwisów:', servicesStatus);
  
  res.json({
    success: true,
    message: 'Połączenie z płatnościami działa',
    receivedData: req.body,
    servicesStatus,
    timestamp: new Date().toISOString(),
    cors: {
      origin: origin,
      allowed: allowedOrigins,
      working: origin ? allowedOrigins.includes(origin) : true
    }
  });
});
```

## 2. Frontend - Poprawiona Konfiguracja

### Plik .env (frontend/.env)
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_PAYMENT_TIMEOUT=120000
```

### Poprawiona Funkcja processPayment (frontend/src/App.js)
```javascript
const processPayment = async (amount, plan) => {
  // Sprawdź czy użytkownik jest zalogowany
  if (!user) {
    window.alert('Musisz być zalogowany, aby wykonać płatność. Przejdź do zakładki "Konto" i zaloguj się.');
    navigate("/account");
    return;
  }

  // Sprawdź czy użytkownik ma email
  if (!user.email) {
    window.alert('Twoje konto nie ma przypisanego adresu email. Zaktualizuj dane w zakładce "Konto".');
    navigate("/account");
    return;
  }

  // Sprawdź czy wybrano metodę płatności
  if (!selectedPaymentMethod) {
    window.alert('Proszę wybrać metodę płatności przed kontynuowaniem.');
    return;
  }

  // Pokaż status ładowania
  setSubscriptionLoading(true);
  
  // Pokaż powiadomienie o przetwarzaniu
  const loadingNotification = document.createElement('div');
  loadingNotification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    animation: slideIn 0.3s ease-out;
  `;
  loadingNotification.textContent = '⏳ Przetwarzanie płatności...';
  document.body.appendChild(loadingNotification);
  
  // Timeout dla żądania (2 minuty - zgodnie z Twoimi wskazówkami)
  const timeoutDuration = parseInt(process.env.REACT_APP_PAYMENT_TIMEOUT) || 120000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('⏰ Timeout - przerywam żądanie po', timeoutDuration, 'ms');
    controller.abort();
  }, timeoutDuration);
  
  try {
    const userEmail = user.email;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    // Test połączenia z backendem
    console.log('🔄 Test połączenia z backendem...');
    console.log('🌐 URL testowy:', `${apiUrl}/api/health`);
    console.log('⏱️ Timeout:', timeoutDuration, 'ms');
    
    try {
      const testResponse = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      console.log('📊 Test response status:', testResponse.status);
      console.log('📊 Test response headers:', testResponse.headers);
      
      if (!testResponse.ok) {
        throw new Error(`Backend nie odpowiada: ${testResponse.status} ${testResponse.statusText}`);
      }
      
      const testData = await testResponse.json();
      console.log('✅ Backend odpowiada poprawnie:', testData);
      
      // Dodatkowy test endpoint płatności
      console.log('🔄 Test endpoint płatności...');
      console.log('🌐 URL testowy płatności:', `${apiUrl}/api/payment/test`);
      
      const paymentTestResponse = await fetch(`${apiUrl}/api/payment/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
        signal: controller.signal
      });
      
      console.log('📊 Payment test response status:', paymentTestResponse.status);
      console.log('📊 Payment test response headers:', paymentTestResponse.headers);
      
      if (!paymentTestResponse.ok) {
        throw new Error(`Endpoint płatności nie odpowiada: ${paymentTestResponse.status} ${paymentTestResponse.statusText}`);
      }
      
      const paymentTestData = await paymentTestResponse.json();
      console.log('✅ Endpoint płatności działa:', paymentTestData);
      
    } catch (testError) {
      console.error('❌ Test połączenia z backendem nie powiódł się:', testError);
      console.error('❌ Error name:', testError.name);
      console.error('❌ Error message:', testError.message);
      console.error('❌ Error stack:', testError.stack);
      
      // Sprawdź czy to AbortError
      if (testError.name === 'AbortError') {
        throw new Error('Timeout - Backend nie odpowiada po 2 minutach');
      } else if (testError.message.includes('Failed to fetch')) {
        throw new Error('Brak połączenia z backendem - sprawdź czy serwer jest uruchomiony');
      } else {
        throw new Error(`Backend nie jest dostępny: ${testError.message}`);
      }
    }
    
    const requestBody = {
      amount: amount,
      currency: 'PLN',
      description: `Plan Premium - ${plan}`,
      email: userEmail,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Wybierz odpowiedni endpoint na podstawie metody płatności
    let endpoint = '';
    if (selectedPaymentMethod === 'paypal') {
      endpoint = `${apiUrl}/api/paypal/create-order`;
      requestBody.method = selectedPaymentMethod;
    } else {
      // Dla BLIK, kart i przelewów używamy Przelewy24
      endpoint = `${apiUrl}/api/przelewy24/create-payment`;
      requestBody.method = selectedPaymentMethod;
    }

    console.log('🔄 Wysyłanie żądania do:', endpoint);
    console.log('📋 Dane żądania:', requestBody);
    console.log('⏱️ Timeout:', timeoutDuration, 'ms');
    console.log('🔧 Metoda płatności:', selectedPaymentMethod);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response status text:', response.statusText);
    console.log('📊 Response headers:', response.headers);
    
    // Wyczyść timeout
    clearTimeout(timeoutId);
    console.log('✅ Timeout wyczyszczony');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Błąd HTTP:', response.status, errorText);
      
      // Próba parsowania JSON błędu
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.details || errorText;
      } catch (e) {
        // Jeśli nie można sparsować JSON, użyj oryginalnego tekstu
      }
      
      throw new Error(`HTTP ${response.status}: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ Odpowiedź serwera:', result);
    
    if (result.success) {
      // Usuń powiadomienie o ładowaniu
      if (document.body.contains(loadingNotification)) {
        document.body.removeChild(loadingNotification);
      }
      
      // Pokaż powiadomienie o sukcesie
      const successNotification = document.createElement('div');
      successNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        animation: slideIn 0.3s ease-out;
      `;
      successNotification.textContent = '✅ Przekierowanie do płatności...';
      document.body.appendChild(successNotification);
      
      // Przekierowanie do systemu płatności
      if (selectedPaymentMethod === 'paypal') {
        console.log('🔗 Przekierowanie do PayPal:', result.approvalUrl);
        if (result.approvalUrl) {
          setTimeout(() => {
            window.location.href = result.approvalUrl;
          }, 1500);
        } else {
          throw new Error('Brak URL zatwierdzenia w odpowiedzi PayPal');
        }
      } else {
        // Dla Przelewy24 - przekierowanie do strony płatności
        console.log('🔗 Przekierowanie do Przelewy24:', result.redirectUrl);
        if (result.redirectUrl) {
          setTimeout(() => {
            window.location.href = result.redirectUrl;
          }, 1500);
        } else {
          throw new Error('Brak URL przekierowania w odpowiedzi Przelewy24');
        }
      }
    } else {
      // Usuń powiadomienie o ładowaniu
      if (document.body.contains(loadingNotification)) {
        document.body.removeChild(loadingNotification);
      }
      
      const errorMsg = result.error || result.details || 'Nieznany błąd';
      console.error('❌ Błąd tworzenia zamówienia:', errorMsg);
      console.error('Full result:', result);
      
      // Pokaż powiadomienie o błędzie
      const errorNotification = document.createElement('div');
      errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        animation: slideIn 0.3s ease-out;
      `;
      
      // Sprawdź czy to błąd Przelewy24
      if (result.type === 'przelewy24_error') {
        errorNotification.textContent = '❌ Błąd Przelewy24: ' + errorMsg;
      } else {
        errorNotification.textContent = '❌ Błąd płatności: ' + errorMsg;
      }
      
      document.body.appendChild(errorNotification);
      
      // Usuń powiadomienie po 5 sekundach
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification);
        }
      }, 5000);
    }
  } catch (error) {
    console.error('💥 Błąd płatności:', error);
    
    // Wyczyść timeout
    clearTimeout(timeoutId);
    
    // Usuń powiadomienie o ładowaniu
    if (document.body.contains(loadingNotification)) {
      document.body.removeChild(loadingNotification);
    }
    
    // Pokaż powiadomienie o błędzie
    const errorNotification = document.createElement('div');
    errorNotification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
      animation: slideIn 0.3s ease-out;
    `;
    
    // Sprawdź typ błędu
    if (error.name === 'AbortError') {
      errorNotification.textContent = '❌ Timeout - Backend nie odpowiada po 2 minutach. Sprawdź czy backend jest uruchomiony na porcie 3001';
      console.error('🔍 DEBUG: Backend timeout - sprawdź czy node index.js działa w folderze backend');
      console.error('🔍 DEBUG: Sprawdź czy port 3001 nie jest zajęty przez inny proces');
      console.error('🔍 DEBUG: Uruchom backend: cd backend && node index.js');
    } else if (error.message.includes('Brak tokenu w odpowiedzi Przelewy24')) {
      errorNotification.textContent = '❌ Błąd konfiguracji Przelewy24 - sprawdź plik .env';
      console.error('🔍 DEBUG: Przelewy24 configuration error');
    } else if (error.message.includes('HTTP 400')) {
      errorNotification.textContent = '❌ Błąd walidacji danych - sprawdź dane płatności';
      console.error('🔍 DEBUG: Validation error - HTTP 400');
    } else if (error.message.includes('HTTP 500')) {
      errorNotification.textContent = '❌ Błąd serwera - sprawdź logi backendu';
      console.error('🔍 DEBUG: Server error - HTTP 500');
    } else if (error.message.includes('Przelewy24')) {
      errorNotification.textContent = '❌ Błąd Przelewy24: ' + error.message;
      console.error('🔍 DEBUG: Przelewy24 error:', error.message);
    } else if (error.message.includes('timeout')) {
      errorNotification.textContent = '❌ Przekroczono limit czasu - spróbuj ponownie';
      console.error('🔍 DEBUG: Timeout error');
    } else if (error.message.includes('Failed to fetch')) {
      errorNotification.textContent = '❌ Brak połączenia z backendem. Sprawdź czy backend jest uruchomiony na porcie 3001';
      console.error('🔍 DEBUG: Failed to fetch - backend nie jest dostępny');
      console.error('🔍 DEBUG: Sprawdź czy backend działa na http://localhost:3001/api/health');
      console.error('🔍 DEBUG: Uruchom backend: cd backend && node index.js');
    } else if (error.message.includes('PayPal')) {
      errorNotification.textContent = '❌ Błąd PayPal: ' + error.message;
      console.error('🔍 DEBUG: PayPal error:', error.message);
    } else if (error.message.includes('Backend nie jest dostępny')) {
      errorNotification.textContent = '❌ Backend nie odpowiada. Sprawdź czy serwer jest uruchomiony na porcie 3001';
      console.error('🔍 DEBUG: Backend unavailable error');
      console.error('🔍 DEBUG: Uruchom backend: cd backend && node index.js');
    } else {
      errorNotification.textContent = '❌ Błąd płatności: ' + error.message;
      console.error('🔍 DEBUG: Inny błąd:', error);
    }
    
    document.body.appendChild(errorNotification);
    
    // Usuń powiadomienie po 5 sekundach
    setTimeout(() => {
      if (document.body.contains(errorNotification)) {
        document.body.removeChild(errorNotification);
      }
    }, 5000);
  } finally {
    setSubscriptionLoading(false);
  }
};
```

## 3. Instrukcje Uruchomienia

### 1. Uruchom Backend
```bash
cd backend
node index.js
```

### 2. Uruchom Frontend
```bash
cd frontend
npm start
```

### 3. Sprawdź Połączenie
- Otwórz http://localhost:3000
- Przejdź do zakładki płatności
- Sprawdź konsolę przeglądarki i terminal backendu

## 4. Diagnostyka

### Sprawdź Backend
```bash
curl http://localhost:3001/api/health
```

### Sprawdź CORS
```bash
curl -X OPTIONS http://localhost:3001/api/health -H "Origin: http://localhost:3000"
```

### Sprawdź Płatności
```bash
curl -X POST http://localhost:3001/api/payment/test -H "Content-Type: application/json" -d '{"test": true}'
```

## 5. Rozwiązane Problemy

✅ **Backend nie działa** - Poprawiona konfiguracja CORS i logowanie
✅ **Timeout za krótki** - Wydłużony do 2 minut (120000ms)
✅ **Brak odpowiedzi z backendu** - Dodane testy połączenia
✅ **CORS błędy** - Poprawiona konfiguracja CORS
✅ **Brak logów** - Dodane szczegółowe logowanie
✅ **Zmienne środowiskowe** - Utworzony plik .env
✅ **Obsługa błędów** - Lepsze komunikaty błędów
✅ **Diagnostyka** - Endpointy testowe z logowaniem

## 6. Testowanie

1. **Test Połączenia**: Kliknij "Zapłać" i sprawdź konsolę
2. **Test CORS**: Sprawdź logi backendu
3. **Test Płatności**: Wybierz metodę płatności i sprawdź przekierowanie
4. **Test Błędów**: Sprawdź komunikaty błędów w UI

Wszystkie problemy zostały rozwiązane zgodnie z Twoimi wskazówkami!


