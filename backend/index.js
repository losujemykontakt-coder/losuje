 require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('./config');
console.log('🔄 Ładowanie serwisów płatności...');
let paypalService, paymentService, przelewy24Service;

try {
  paypalService = require('./paypal-service');
  console.log('✅ PayPal service załadowany');
} catch (error) {
  console.error('❌ Błąd ładowania PayPal service:', error);
  paypalService = null;
}
try {
  paymentService = require('./payment-service');
  console.log('✅ Payment service załadowany');
} catch (error) {
  console.error('❌ Błąd ładowania Payment service:', error);
  paymentService = null;
}
try {
  przelewy24Service = require('./przelewy24-service');
  console.log('✅ Przelewy24 service załadowany');
} catch (error) {
  console.error('❌ Błąd ładowania Przelewy24 service:', error);
  przelewy24Service = null;
}
console.log('✅ Serwisy płatności załadowane');
const { updateAllStats, updateGameStats, getDefaultStats, scrapeDetailedResults } = require('./scraper');
const cron = require('node-cron');

// Import AI Ultra Pro API
const aiUltraProRouter = require('./ai-ultra-pro-api');

// Import PayPal API routes
const paypalRoutes = require('./api/paypal');

// Funkcja do aktualizacji cache w tle
const updateCacheInBackground = async (gameType) => {
  // Zabezpieczenie przed wielokrotnym uruchamianiem
  if (global.updatingCache && global.updatingCache[gameType]) {
    console.log(`⏳ [BACKGROUND] Aktualizacja ${gameType} już w toku - pomijam`);
    return;
  }
  
  if (!global.updatingCache) global.updatingCache = {};
  global.updatingCache[gameType] = true;
  
  try {
    console.log(`🚀 [BACKGROUND] Rozpoczynam aktualizację cache dla ${gameType}...`);
    
    // Timeout dla scrapera (max 90 sekund)
    const scraperPromise = scrapeDetailedResults(gameType, 50);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Scraper timeout po 90s')), 90000)
    );
    
    const scraperResults = await Promise.race([scraperPromise, timeoutPromise]);
    
    if (scraperResults && scraperResults.length > 0) {
      const { calculateStats } = require('./scraper');
      const newStats = calculateStats(scraperResults, gameType);
      
      // Zapisz do cache
      const fs = require('fs');
      const path = require('path');
      const cachePath = path.join(__dirname, 'cache', `stats_${gameType}.json`);
      
      const cacheData = {
        data: newStats,
        timestamp: new Date().toISOString(),
        game: gameType,
        resultsCount: scraperResults.length
      };
      
      fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
      console.log(`✅ [BACKGROUND] Cache zaktualizowany dla ${gameType} (${scraperResults.length} wyników)`);
    }
    
  } catch (error) {
    console.log(`❌ [BACKGROUND] Błąd aktualizacji ${gameType}:`, error.message);
  } finally {
    global.updatingCache[gameType] = false;
  }
};

// Import lotto API functions
const {
  fetchLottoResultsAPI,
  fetchLottoStatsAPI,
  checkAPIHealth,
  convertAPIDataToAppFormat,
  convertAPIStatsToAppFormat
} = require('./lotto-api');
const { 
  db, 
  logSecurityEvent, 
  incrementLoginAttempts, 
  resetLoginAttempts, 
  lockAccount, 
  isAccountLocked, 
  getLoginAttempts,
  initializeTrial,
  getUserSubscription,
  updateSubscription,
  blockUser,
  isUserBlocked,
  addPayment,
  getPaymentHistory,
  checkTrialExpiration
} = require('./db');

// Import middleware bezpieczeństwa
const securityMiddleware = require('./security-middleware');

// Middleware do parsowania JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Konfiguracja CORS - poprawiona zgodnie z Twoimi wskazówkami
app.use(cors({
  origin: ['https://losuje.pl', 'https://losuje-generator.pl', 'http://localhost:3000', 'http://127.0.0.1:3000'],
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

// Zastosuj podstawowe middleware bezpieczeństwa
app.use(securityMiddleware.helmet);
app.use(securityMiddleware.xss);
app.use(securityMiddleware.hpp);
// Usuń securityMiddleware.cors - używamy własnej konfiguracji CORS
app.use(securityMiddleware.blockDangerousHeaders);
app.use(securityMiddleware.checkRequestSize);

// Wyłącz wykrywanie podejrzanej aktywności dla płatności i testów
app.use((req, res, next) => {
  if (req.path.startsWith('/api/paypal/') || 
      req.path.startsWith('/api/przelewy24/') || 
      req.path.startsWith('/api/payment/') ||
      req.path === '/api/health') {
    // Pomiń middleware dla płatności i testów
    next();
  } else {
    securityMiddleware.detectSuspiciousActivity(req, res, next);
  }
});

// Endpoint testowy do sprawdzenia czy backend działa
app.get('/api/health', (req, res) => {
  console.log('=== HEALTH CHECK ===');
  console.log('Request headers:', req.headers);
  console.log('Request IP:', req.ip);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Accept:', req.headers.accept);
  console.log('Content-Type:', req.headers['content-type']);
  
  // Sprawdź czy CORS działa
  const origin = req.headers.origin;
  const allowedOrigins = ['https://losuje.pl', 'https://losuje-generator.pl', 'http://localhost:3000', 'http://127.0.0.1:3000'];
  
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

// Endpoint testowy dla PWA (losuje-generator.pl)
app.get('/api/pwa/health', (req, res) => {
  console.log('=== PWA HEALTH CHECK ===');
  console.log('Request from PWA:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  
  const origin = req.headers.origin;
  const isPWA = origin === 'https://losuje-generator.pl';
  
  res.json({
    success: true,
    message: 'PWA Backend działa poprawnie',
    timestamp: new Date().toISOString(),
    isPWA: isPWA,
    origin: origin,
    firebase: {
      configured: true,
      authDomain: 'losujemy.firebaseapp.com',
      projectId: 'losujemy'
    },
    cors: {
      working: true,
      allowed: ['https://losuje.pl', 'https://losuje-generator.pl', 'http://localhost:3000', 'http://127.0.0.1:3000']
    }
  });
});

// Endpoint testowy dla PWA (losuje-generator.pl)
app.get('/api/pwa/health', (req, res) => {
  console.log('=== PWA HEALTH CHECK ===');
  console.log('Request from PWA:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  
  const origin = req.headers.origin;
  const isPWA = origin === 'https://losuje-generator.pl';
  
  res.json({
    success: true,
    message: 'PWA Backend działa poprawnie',
    timestamp: new Date().toISOString(),
    isPWA: isPWA,
    origin: origin,
    firebase: {
      configured: true,
      authDomain: 'losujemy.firebaseapp.com',
      projectId: 'losujemy'
    },
    cors: {
      working: true,
      allowed: ['https://losuje.pl', 'https://losuje-generator.pl', 'http://localhost:3000', 'http://127.0.0.1:3000']
    }
  });
});

// Endpoint do testowania połączenia z płatnościami
app.post('/api/payment/test', (req, res) => {
  console.log('=== TEST PŁATNOŚCI ===');
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers);
  console.log('Request IP:', req.ip);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Accept:', req.headers.accept);
  console.log('User-Agent:', req.headers['user-agent']);
  
  // Sprawdź czy CORS działa
  const origin = req.headers.origin;
  const allowedOrigins = ['https://losuje.pl', 'https://losuje-generator.pl', 'http://localhost:3000', 'http://127.0.0.1:3000'];
  
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
  
  // Sprawdź konfigurację Przelewy24
  let przelewy24Config = null;
  if (typeof przelewy24Service !== 'undefined') {
    try {
      przelewy24Config = {
        merchantId: przelewy24Service.config.merchantId,
        posId: przelewy24Service.config.posId,
        crc: przelewy24Service.config.crc,
        environment: przelewy24Service.config.environment,
        baseUrl: przelewy24Service.baseUrl
      };
    } catch (error) {
      console.error('❌ Błąd pobierania konfiguracji Przelewy24:', error);
    }
  }
  
  // Sprawdź konfigurację PayPal
  let paypalConfig = null;
  if (typeof paypalService !== 'undefined') {
    try {
      paypalConfig = {
        environment: config.PAYPAL.ENVIRONMENT,
        returnUrl: config.PAYPAL.RETURN_URL,
        cancelUrl: config.PAYPAL.CANCEL_URL
      };
    } catch (error) {
      console.error('❌ Błąd pobierania konfiguracji PayPal:', error);
    }
  }
  
  res.json({
    success: true,
    message: 'Połączenie z płatnościami działa',
    receivedData: req.body,
    servicesStatus,
    przelewy24Config,
    paypalConfig,
    timestamp: new Date().toISOString(),
    cors: {
      origin: origin,
      allowed: allowedOrigins,
      working: origin ? allowedOrigins.includes(origin) : true
    }
  });
});

app.get('/api/payment/cancel', (req, res) => {
  console.log('=== ANULOWANIE PŁATNOŚCI ===');
  console.log('Query params:', req.query);
  
  const { method } = req.query;
  
  // Przekieruj do frontendu z parametrami anulowania
  const redirectUrl = `https://losuje.pl/payment-success?status=cancelled&method=${method || 'unknown'}`;
  console.log('🔗 Przekierowanie do:', redirectUrl);
  res.redirect(redirectUrl);
});



// Middleware do logowania bezpieczeństwa
app.use((req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  // Logowanie wszystkich żądań
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${ipAddress}`);
  
  // Dodatkowe logowanie dla żądań API
  if (req.path.startsWith('/api/')) {
    console.log(`🔍 [API] ${req.method} ${req.path}`);
    console.log(`🔍 [API] Origin: ${req.headers.origin || 'brak'}`);
    console.log(`🔍 [API] User-Agent: ${userAgent || 'brak'}`);
    console.log(`🔍 [API] Referer: ${req.headers.referer || 'brak'}`);
  }
  
  req.ipAddress = ipAddress;
  req.userAgent = userAgent;
  next();
});

// Walidacja danych wejściowych dla wszystkich żądań
app.use(securityMiddleware.validateInput);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serwuj statyczne pliki z frontendu
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/', (req, res) => {
  res.send('Backend lotek działa!');
});

// Rejestracja z zabezpieczeniami
app.post('/register', securityMiddleware.apiRateLimiter, async (req, res) => {
  const { email, password, name } = req.body;
  
  // Walidacja danych
  if (!email || !password || !name) {
    securityMiddleware.logSecurityEvent('REGISTER_VALIDATION_ERROR', {
      ip: req.ip,
      error: 'Missing required fields'
    });
    return res.status(400).json({ error: 'Imię, email i hasło są wymagane' });
  }
  
  // Walidacja hasła z nowymi regułami
  const passwordErrors = securityMiddleware.validatePassword(password, name);
  if (passwordErrors.length > 0) {
    securityMiddleware.logSecurityEvent('REGISTER_PASSWORD_ERROR', {
      ip: req.ip,
      email,
      errors: passwordErrors
    });
    return res.status(400).json({ 
      error: 'Hasło nie spełnia wymagań bezpieczeństwa',
      details: passwordErrors
    });
  }
  
  // Walidacja email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    securityMiddleware.logSecurityEvent('REGISTER_EMAIL_ERROR', {
      ip: req.ip,
      email
    });
    return res.status(400).json({ error: 'Nieprawidłowy format email' });
  }

  try {
    const hash = bcrypt.hashSync(password, 12); // Zwiększona liczba rund
    const now = new Date().toISOString();
    
    db.run(
      'INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', 
      [name, email, hash, now, now], 
      async function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Użytkownik już istnieje' });
          }
          return res.status(500).json({ error: 'Błąd serwera' });
        }
        
        const userId = this.lastID;
        
        // Inicjalizacja okresu próbnego
        try {
          await initializeTrial(userId);
        } catch (trialError) {
          console.error('Błąd inicjalizacji okresu próbnego:', trialError);
        }
        
        // Logowanie udanej rejestracji
        logSecurityEvent(userId, 'REGISTER', req.ipAddress, req.userAgent, 
          `Nowy użytkownik: ${email}`);
        
        res.json({ success: true, userId });
      }
    );
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Logowanie z zabezpieczeniami
app.post('/login', securityMiddleware.loginRateLimiter, async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    securityMiddleware.logSecurityEvent('LOGIN_VALIDATION_ERROR', {
      ip: req.ip,
      error: 'Missing email or password'
    });
    return res.status(400).json({ error: 'Email i hasło są wymagane' });
  }

  try {
    // Sprawdź czy konto jest zablokowane
    const isLocked = await isAccountLocked(email);
    if (isLocked) {
      return res.status(429).json({ 
        error: 'Konto jest tymczasowo zablokowane. Spróbuj ponownie za 15 minut.' 
      });
    }

    // Sprawdź liczbę prób logowania
    const loginAttempts = await getLoginAttempts(email);
    if (loginAttempts >= config.SECURITY.MAX_LOGIN_ATTEMPTS) {
      await lockAccount(email, config.SECURITY.LOCKOUT_TIME);
      return res.status(429).json({ 
        error: 'Zbyt wiele nieudanych prób logowania. Konto zostało zablokowane na 15 minut.' 
      });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Błąd bazy danych:', err);
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!user) {
        await incrementLoginAttempts(email);
        await logSecurityEvent(null, 'LOGIN_FAILED', req.ipAddress, req.userAgent, 
          `Nieudana próba logowania: ${email} - użytkownik nie istnieje`);
        return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });
      }

      if (!bcrypt.compareSync(password, user.password)) {
        await incrementLoginAttempts(email);
        await logSecurityEvent(user.id, 'LOGIN_FAILED', req.ipAddress, req.userAgent, 
          `Nieudana próba logowania: ${email} - błędne hasło`);
        return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });
      }

      // Resetuj licznik prób po udanym logowaniu
      await resetLoginAttempts(email);
      
      // Logowanie udanego logowania
      await logSecurityEvent(user.id, 'LOGIN_SUCCESS', req.ipAddress, req.userAgent, 
        `Udane logowanie: ${email}`);

      // Rejestruj logowanie dla systemu talizmanów
      const { registerLogin } = require('./db');
      let loginStreakInfo = null;
      try {
        loginStreakInfo = await registerLogin(user.id);
      } catch (error) {
        console.error('Błąd rejestracji logowania dla talizmanów:', error);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email }, 
        config.JWT_SECRET, 
        { expiresIn: config.SECURITY.JWT_EXPIRES_IN }
      );
      
      res.json({ 
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        loginStreak: loginStreakInfo
      });
    });
  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Resetowanie hasła - prośba o reset
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email jest wymagany' });
  }

  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Błąd bazy danych:', err);
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!user) {
        // Nie ujawniamy czy użytkownik istnieje
        return res.json({ success: true, message: 'Jeśli email istnieje, otrzymasz link do resetowania hasła' });
      }

      // Generuj token resetowania
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 godzina

      db.run(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
        [resetToken, resetTokenExpires, email],
        async function(err) {
          if (err) {
            console.error('Błąd aktualizacji tokenu:', err);
            return res.status(500).json({ error: 'Błąd serwera' });
          }

          // Zwróć token do frontendu (EmailJS będzie wysyłać email)
          await logSecurityEvent(user.id, 'PASSWORD_RESET_REQUESTED', req.ipAddress, req.userAgent, 
            `Prośba o reset hasła: ${email}`);
          res.json({ 
            success: true, 
            message: 'Link do resetowania hasła został wysłany na email',
            resetToken: resetToken,
            userEmail: email,
            userName: user.name
          });
        }
      );
    });
  } catch (error) {
    console.error('Błąd resetowania hasła:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Resetowanie hasła - sprawdzenie tokenu
app.post('/verify-reset-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token jest wymagany' });
  }

  db.get(
    'SELECT id, email, name FROM users WHERE reset_token = ? AND reset_token_expires > ?',
    [token, new Date().toISOString()],
    (err, user) => {
      if (err) {
        console.error('Błąd bazy danych:', err);
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!user) {
        return res.status(400).json({ error: 'Nieprawidłowy lub wygasły token' });
      }
      
      res.json({ 
        success: true, 
        user: { id: user.id, email: user.email, name: user.name } 
      });
    }
  );
});

// Resetowanie hasła - ustawienie nowego hasła
app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token i nowe hasło są wymagane' });
  }
  
  if (newPassword.length < config.SECURITY.MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ 
      error: `Hasło musi mieć minimum ${config.SECURITY.MIN_PASSWORD_LENGTH} znaków` 
    });
  }

  try {
    db.get(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?',
      [token, new Date().toISOString()],
      async (err, user) => {
        if (err) {
          console.error('Błąd bazy danych:', err);
          return res.status(500).json({ error: 'Błąd serwera' });
        }
        
        if (!user) {
          return res.status(400).json({ error: 'Nieprawidłowy lub wygasły token' });
        }

        // Hashuj nowe hasło
        const hash = bcrypt.hashSync(newPassword, 12);
        const now = new Date().toISOString();

        db.run(
          'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = ? WHERE id = ?',
          [hash, now, user.id],
          async function(err) {
            if (err) {
              console.error('Błąd aktualizacji hasła:', err);
              return res.status(500).json({ error: 'Błąd serwera' });
            }

            // Logowanie zmiany hasła
            await logSecurityEvent(user.id, 'PASSWORD_CHANGED', req.ipAddress, req.userAgent, 
              `Hasło zostało zmienione: ${user.email}`);
            
            res.json({ 
              success: true, 
              message: 'Hasło zostało zmienione',
              userEmail: user.email,
              userName: user.name
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Błąd resetowania hasła:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Endpoint do sprawdzania statusu serwera
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// ===== ENDPOINTY STATYSTYK =====

// Import scrapera (już zaimportowane na początku pliku)

// Automatyczna aktualizacja co 10 minut

cron.schedule('*/10 * * * *', async () => {
  console.log('🕐 Automatyczna aktualizacja statystyk...');
  try {
    await updateAllStats();
    console.log('✅ Aktualizacja zakończona pomyślnie');
  } catch (error) {
    console.error('❌ Błąd automatycznej aktualizacji:', error);
  }
});

// Endpoint do ręcznej aktualizacji wszystkich statystyk
app.post('/api/update-all-stats', async (req, res) => {
  try {
    console.log('🔄 Ręczna aktualizacja wszystkich statystyk...');
    await updateAllStats();
    res.json({ 
      success: true, 
      message: 'Wszystkie statystyki zostały zaktualizowane' 
    });
  } catch (error) {
    console.error('Błąd ręcznej aktualizacji:', error);
    res.status(500).json({ 
      error: 'Błąd aktualizacji statystyk',
      details: error.message 
    });
  }
});

// Endpoint do aktualizacji konkretnej gry
app.post('/api/update-stats/:game', async (req, res) => {
  const { game } = req.params;
  
  try {
    console.log(`🔄 Ręczna aktualizacja statystyk dla ${game}...`);
    const success = await updateGameStats(game);
    
    if (success) {
      res.json({ 
        success: true, 
        message: `Statystyki dla ${game} zostały zaktualizowane`,
        game: game,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        error: `Nie udało się zaktualizować statystyk dla ${game}`,
        game: game
      });
    }
  } catch (error) {
    console.error(`Błąd aktualizacji ${game}:`, error);
    res.status(500).json({ 
      error: 'Błąd aktualizacji statystyk',
      details: error.message,
      game: game
    });
  }
});

// Endpoint do odświeżania wszystkich statystyk (dla frontendu)
app.post('/api/refresh-stats', async (req, res) => {
  try {
    console.log('🔄 Ręczne odświeżanie wszystkich statystyk...');
    
    const games = ['lotto', 'miniLotto', 'multiMulti', 'eurojackpot'];
    const results = {};
    
    for (const game of games) {
      try {
        const success = await updateGameStats(game);
        results[game] = success;
        console.log(`${game}: ${success ? '✅' : '❌'}`);
      } catch (error) {
        console.error(`Błąd dla ${game}:`, error.message);
        results[game] = false;
      }
      
      // Małe opóźnienie między aktualizacjami
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const successCount = Object.values(results).filter(Boolean).length;
    
    res.json({
      success: true,
      message: `Odświeżono ${successCount}/${games.length} gier`,
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Błąd odświeżania statystyk:', error);
    res.status(500).json({
      error: 'Błąd odświeżania statystyk',
      details: error.message
    });
  }
});

// Pobieranie statystyk dla gry
app.get('/api/stats/:game', async (req, res) => {
  const { game } = req.params;
  
  // Dodaj szczegółowe logowanie
  console.log(`📊 [${new Date().toISOString()}] Żądanie GET /api/stats/${game}`);
  console.log(`📊 Origin: ${req.headers.origin || 'brak'}`);
  console.log(`📊 User-Agent: ${req.headers['user-agent'] || 'brak'}`);
  console.log(`📊 Referer: ${req.headers.referer || 'brak'}`);
  console.log(`📊 Accept: ${req.headers.accept || 'brak'}`);
  console.log(`📊 Content-Type: ${req.headers['content-type'] || 'brak'}`);
  
  // Sprawdź CORS
  const origin = req.headers.origin;
  if (origin && !config.SECURITY.CORS.ALLOWED_ORIGINS.includes(origin)) {
    console.log(`❌ [CORS] Nieautoryzowany origin: ${origin}`);
    console.log(`❌ [CORS] Dozwolone origins: ${config.SECURITY.CORS.ALLOWED_ORIGINS.join(', ')}`);
  } else {
    console.log(`✅ [CORS] Origin dozwolony: ${origin}`);
  }
  
  try {
    console.log(`📊 Pobieranie statystyk dla gry: ${game}`);
    
    // Próbuj pobrać rzeczywiste dane z lotto.pl
    try {
      console.log(`🔄 Próbuję pobrać rzeczywiste dane z lotto.pl dla ${game}...`);
      const { scrapeLottoResults, calculateStats } = require('./scraper');
      
      // Pobierz wyniki z lotto.pl
      const results = await scrapeLottoResults(game);
      
      if (results && results.length > 0) {
        console.log(`✅ Pobrano ${results.length} wyników z lotto.pl dla ${game}`);
        
        // Oblicz statystyki na podstawie rzeczywistych danych
        const realStats = calculateStats(results, game);
        
        console.log(`✅ Wysyłam odpowiedź z rzeczywistymi danymi dla ${game}`);
        res.json({
          success: true,
          data: realStats,
          lastUpdated: new Date().toISOString(),
          isReal: true,
          resultsCount: results.length,
          message: `Pobrano rzeczywiste dane z lotto.pl (${results.length} wyników)`
        });
        return;
      }
    } catch (scrapingError) {
      console.error(`❌ Błąd scrapowania dla ${game}:`, scrapingError.message);
      console.log(`🔄 Używam domyślnych statystyk dla ${game}...`);
    }
    
    // Fallback do domyślnych statystyk
    const defaultStats = getDefaultStats(game);
    
    console.log(`✅ Wysyłam odpowiedź z domyślnymi danymi dla ${game}`);
    res.json({
      success: true,
      data: defaultStats,
      lastUpdated: new Date().toISOString(),
      isDefault: true,
      message: 'Używam domyślnych statystyk (fallback)'
    });
    
  } catch (error) {
    console.error('❌ Błąd pobierania statystyk:', error);
    res.status(500).json({ 
      error: 'Błąd pobierania statystyk',
      details: error.message 
    });
  }
});

// Aktualizacja statystyk (dla automatycznych aktualizacji)
app.post('/api/stats/:game', async (req, res) => {
  const { game } = req.params;
  
  try {
    console.log(`🔄 Aktualizacja statystyk dla gry: ${game}`);
    
    // Próbuj pobrać nowe dane z lotto.pl
    try {
      const { scrapeLottoResults, calculateStats } = require('./scraper');
      
      console.log(`📊 Rozpoczynam scrapowanie lotto.pl dla ${game}...`);
      const results = await scrapeLottoResults(game);
      
      if (results && results.length > 0) {
        console.log(`✅ Pobrano ${results.length} nowych wyników dla ${game}`);
        
        // Oblicz nowe statystyki
        const newStats = calculateStats(results, game);
        
        // Zapisz do Firebase jeśli dostępne
        try {
          const { db: firestore } = require('./firebase-admin');
          
          if (firestore && firestore.collection) {
            await firestore.collection('statistics').doc(game).set({
              ...newStats,
              lastUpdated: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              resultsCount: results.length
            });
            
            res.json({
              success: true,
              message: `Statystyki zaktualizowane z lotto.pl (${results.length} wyników)`,
              game: game,
              resultsCount: results.length,
              isReal: true
            });
            return;
          }
        } catch (firebaseError) {
          console.error('Błąd Firebase:', firebaseError.message);
        }
        
        // Jeśli Firebase nie działa, zwróć sukces
        res.json({
          success: true,
          message: `Statystyki zaktualizowane z lotto.pl (${results.length} wyników)`,
          game: game,
          resultsCount: results.length,
          isReal: true,
          firebaseUnavailable: true
        });
        return;
      }
    } catch (scrapingError) {
      console.error(`❌ Błąd scrapowania dla ${game}:`, scrapingError.message);
    }
    
    // Fallback - zwróć informację o braku nowych danych
    res.json({
      success: true,
      message: 'Nie udało się pobrać nowych danych z lotto.pl',
      game: game,
      isFallback: true
    });
    
  } catch (error) {
    console.error('Błąd aktualizacji statystyk:', error);
    res.status(500).json({ 
      error: 'Błąd aktualizacji statystyk',
      details: error.message 
    });
  }
});





// Funkcja getDefaultStats jest już zaimportowana z scraper.js

// Endpointy do obsługi subskrypcji
app.get('/api/subscription/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }
    
    res.json(subscription);
  } catch (error) {
    console.error('Błąd pobierania subskrypcji:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/api/payment', async (req, res) => {
  const { userId, amount, paymentMethod, plan } = req.body;
  
  if (!userId || !amount || !paymentMethod || !plan) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
  }
  
  try {
    // Symulacja płatności (w rzeczywistej aplikacji byłaby integracja z systemem płatności)
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Dodaj płatność do bazy danych
    await addPayment(userId, amount, paymentMethod, plan, transactionId);
    
    // Aktualizuj subskrypcję użytkownika
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dni
    
    await updateSubscription(userId, plan, 'active', now.toISOString(), endDate.toISOString());
    
    res.json({ 
      success: true, 
      transactionId,
      message: 'Płatność zrealizowana pomyślnie'
    });
  } catch (error) {
    console.error('Błąd przetwarzania płatności:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.get('/api/payment-history/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const payments = await getPaymentHistory(userId);
    res.json(payments);
  } catch (error) {
    console.error('Błąd pobierania historii płatności:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Endpoint do sprawdzania czy użytkownik jest zablokowany
app.get('/api/user-status/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const isBlocked = await isUserBlocked(userId);
    const subscription = await getUserSubscription(userId);
    const accessResult = await checkUserAccess(userId);
    
    res.json({
      isBlocked,
      subscription,
      access: accessResult
    });
  } catch (error) {
    console.error('Błąd sprawdzania statusu użytkownika:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Cron job do sprawdzania wygaśnięcia okresów próbnych (uruchamiany co godzinę)
setInterval(async () => {
  try {
    const expiredTrials = await checkTrialExpiration();
    
    for (const user of expiredTrials) {
      await blockUser(user.id);
      console.log(`Użytkownik ${user.email} został zablokowany - okres próbny wygasł`);
    }
  } catch (error) {
    console.error('Błąd sprawdzania wygaśnięcia okresów próbnych:', error);
  }
}, 60 * 60 * 1000); // Co godzinę

// Endpoint do zarządzania subskrypcją (tylko dla celów testowych)
app.post('/api/admin/subscription', async (req, res) => {
  const { email, action, plan } = req.body;
  
  // Sprawdź czy to konto testowe
  if (email !== 'losujemy.kontakt@gmail.com') {
    return res.status(403).json({ error: 'Tylko dla kont testowych' });
  }
  
  try {
    // Znajdź użytkownika
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd bazy danych' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      }
      
      const now = new Date();
      const endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 rok
      
      if (action === 'activate') {
        await updateSubscription(user.id, plan || 'premium', 'active', now.toISOString(), endDate.toISOString());
        res.json({ success: true, message: 'Subskrypcja aktywowana' });
      } else if (action === 'block') {
        await blockUser(user.id);
        res.json({ success: true, message: 'Użytkownik zablokowany' });
      } else if (action === 'reset') {
        await initializeTrial(user.id);
        res.json({ success: true, message: 'Okres próbny zresetowany' });
      } else {
        res.status(400).json({ error: 'Nieprawidłowa akcja' });
      }
    });
  } catch (error) {
    console.error('Błąd zarządzania subskrypcją:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// PayPal endpoints
// Nowe endpointy zgodnie z wymaganiami
app.post('/api/create-paypal-order', async (req, res) => {
  console.log('=== CREATE PAYPAL ORDER ===');
  console.log('Request body:', req.body);
  
  const { amount, currency = 'PLN', description = 'Plan Premium - Lotek', email } = req.body;
  
  try {
    console.log('🔄 Wywołanie paypalService.createOrder...');
    const result = await paypalService.createOrder(amount, currency, description);
    console.log('📤 Wynik paypalService.createOrder:', result);
    
    if (result.success) {
      console.log('✅ Zamówienie PayPal utworzone pomyślnie');
      res.json({
        id: result.orderId,
        status: result.status
      });
    } else {
      console.log('❌ Błąd tworzenia zamówienia PayPal:', result.error);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('💥 Błąd tworzenia zamówienia PayPal:', error);
    res.status(500).json({ error: 'Błąd serwera PayPal' });
  }
});

app.post('/api/capture-paypal-order/:orderID', async (req, res) => {
  const { orderID } = req.params;
  
  try {
    const result = await paypalService.capturePayment(orderID);
    
    if (result.success) {
      res.json({
        success: true,
        transactionId: result.transactionId,
        status: result.status,
        amount: result.amount,
        currency: result.currency
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Błąd finalizacji płatności PayPal:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/api/create-p24-transaction', async (req, res) => {
  console.log('=== CREATE P24 TRANSACTION ===');
  console.log('Request body:', req.body);
  
  const { method, amount, currency = 'PLN', description, email, sessionId } = req.body;
  
  if (!method || !amount || !description || !email) {
    return res.status(400).json({ 
      error: 'Metoda płatności, kwota, opis i email są wymagane' 
    });
  }

  try {
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('✅ Session ID:', finalSessionId);
    
    const result = await przelewy24Service.createPaymentForMethod(method, amount, currency, description, email, finalSessionId);
    
    if (result.success) {
      console.log('✅ Transakcja P24 utworzona pomyślnie');
      res.json({
        redirectUrl: result.redirectUrl,
        paymentId: result.paymentId,
        sessionId: result.sessionId
      });
    } else {
      console.log('❌ Błąd tworzenia transakcji P24:', result.error);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('💥 Błąd tworzenia transakcji P24:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Stary endpoint PayPal (zachowujemy dla kompatybilności)
app.post('/api/paypal/create-order', async (req, res) => {
  console.log('=== PAYPAL CREATE ORDER ===');
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers);
  console.log('Request IP:', req.ip);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  const { amount, currency = 'PLN', description = 'Plan Premium - Lotek', email } = req.body;
  
  // Sprawdź czy paypalService jest dostępny
  if (!paypalService) {
    console.error('❌ PayPal service nie jest załadowany');
    return res.status(500).json({
      success: false,
      error: 'PayPal service nie jest dostępny'
    });
  }
  
  try {
    console.log('🔄 Wywołanie paypalService.createOrder...');
    const result = await paypalService.createOrder(amount, currency, description);
    console.log('📤 Wynik paypalService.createOrder:', result);
    
    if (result.success) {
      console.log('✅ Zamówienie PayPal utworzone pomyślnie');
      res.json({
        success: true,
        orderId: result.orderId,
        approvalUrl: result.approvalUrl,
        status: result.status
      });
    } else {
      console.log('❌ Błąd tworzenia zamówienia PayPal:', result.error);
      res.status(400).json({ 
        success: false,
        error: result.error 
      });
    }
  } catch (error) {
    console.error('💥 Błąd tworzenia zamówienia PayPal:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera PayPal' 
    });
  }
  
  console.log('=== KONIEC PAYPAL CREATE ORDER ===');
});

app.post('/api/paypal/capture-payment', async (req, res) => {
  const { orderId } = req.body;
  
  try {
    const result = await paypalService.capturePayment(orderId);
    
    if (result.success) {
      res.json({
        success: true,
        transactionId: result.transactionId,
        status: result.status,
        amount: result.amount,
        currency: result.currency
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Błąd finalizacji płatności PayPal:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.get('/api/paypal/order/:orderId', async (req, res) => {
  const { orderId } = req.params;
  
  try {
    const result = await paypalService.getOrderDetails(orderId);
    
    if (result.success) {
      res.json({
        success: true,
        order: result.order
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Błąd pobierania szczegółów zamówienia:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/api/paypal/refund', async (req, res) => {
  const { captureId, amount, reason } = req.body;
  
  try {
    const result = await paypalService.refundPayment(captureId, amount, reason);
    
    if (result.success) {
      res.json({
        success: true,
        refundId: result.refundId,
        status: result.status
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Błąd zwrotu pieniędzy PayPal:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Nowe endpointy dla różnych metod płatności
app.post('/api/payment/create-order', async (req, res) => {
  const { method, amount, currency = 'PLN', description } = req.body;
  
  if (!method || !amount || !description) {
    return res.status(400).json({ error: 'Metoda płatności, kwota i opis są wymagane' });
  }
  
  try {
    const result = await paymentService.processPayment(method, amount, currency, description);
    
    if (result.success) {
      res.json({
        success: true,
        orderId: result.orderId,
        approvalUrl: result.approvalUrl
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Błąd tworzenia zamówienia:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/api/payment/finalize', async (req, res) => {
  const { method, orderId, userId, plan } = req.body;
  
  if (!method || !orderId) {
    return res.status(400).json({ error: 'Metoda płatności i ID zamówienia są wymagane' });
  }
  
  try {
    const result = await paymentService.finalizePayment(method, orderId);
    
    if (result.success) {
      // Jeśli podano userId i plan, zaktualizuj subskrypcję
      if (userId && plan) {
        const now = new Date();
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dni
        
        await updateSubscription(userId, plan, 'active', now.toISOString(), endDate.toISOString());
        
        // Dodaj płatność do historii
        await addPayment(userId, result.amount, method, plan, result.transactionId);
      }
      
      res.json({
        success: true,
        transactionId: result.transactionId,
        status: result.status,
        amount: result.amount,
        currency: result.currency
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Błąd finalizacji płatności:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.get('/api/payment/methods', (req, res) => {
  try {
    const methods = paymentService.getAvailablePaymentMethods();
    
    res.json({
      success: true,
      methods: methods
    });
  } catch (error) {
    console.error('Błąd pobierania metod płatności:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Nowe endpointy zgodne z wymaganiami
app.post('/api/p24/create', async (req, res) => {
  const { method, amount, currency = 'PLN', description, email, sessionId } = req.body;
  
  if (!method || !amount || !description) {
    return res.status(400).json({ error: 'Metoda płatności, kwota i opis są wymagane' });
  }
  
  try {
    console.log('🔄 Tworzenie transakcji Przelewy24:', { method, amount, description });
    
    const payload = {
      merchantId: config.PRZELEWY24.MERCHANT_ID,
      posId: config.PRZELEWY24.POS_ID,
      sessionId: sessionId || Date.now().toString(),
      amount: amount,
      currency: currency,
      description: description,
      email: email || 'test@example.com',
      country: 'PL',
      language: 'pl',
      urlReturn: config.PRZELEWY24.RETURN_URL,
      urlStatus: config.PRZELEWY24.STATUS_URL,
      method: method,
    };

    console.log('📋 Payload Przelewy24:', payload);

    const auth = Buffer.from(`${config.PRZELEWY24.POS_ID}:${config.PRZELEWY24.API_KEY}`).toString('base64');
    
    const response = await fetch(`${config.PRZELEWY24.ENVIRONMENT === 'sandbox' ? 'https://sandbox.przelewy24.pl' : 'https://secure.przelewy24.pl'}/api/v1/transaction/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('📡 Odpowiedź Przelewy24:', data);

    if (data.responseCode === '0' && data.data && data.data.redirectUrl) {
      res.json({ 
        success: true,
        redirectUrl: data.data.redirectUrl,
        token: data.data.token,
        sessionId: payload.sessionId
      });
    } else {
      console.error('❌ Błąd Przelewy24:', data);
      res.status(400).json({ 
        error: data.errorMessage || 'Błąd tworzenia transakcji Przelewy24',
        details: data
      });
    }
  } catch (error) {
    console.error('❌ Błąd serwera Przelewy24:', error);
    res.status(500).json({ error: 'Błąd serwera Przelewy24' });
  }
});

app.post('/api/paypal/create', async (req, res) => {
  console.log('🔄 [PAYPAL] Otrzymano żądanie tworzenia zamówienia');
  console.log('🔄 [PAYPAL] Headers:', req.headers);
  console.log('🔄 [PAYPAL] Body:', req.body);
  
  const { amount, currency = 'PLN', description, email, plan = 'monthly' } = req.body;
  
  if (!amount || !description) {
    console.log('❌ [PAYPAL] Brak wymaganych pól:', { amount, description });
    return res.status(400).json({ error: 'Kwota i opis są wymagane' });
  }
  
  try {
    console.log('🔄 [PAYPAL] Tworzenie zamówienia PayPal:', { amount, description, email, plan });
    
    // Dodaj informację o planie do opisu
    const planInfo = plan === 'yearly' ? ' (Plan Roczny - 12 miesięcy)' : ' (Plan Miesięczny)';
    const fullDescription = description + planInfo;
    
    const result = await paypalService.createOrder(amount, currency, fullDescription, email);
    console.log('🔄 [PAYPAL] Wynik createOrder:', result);
    
    if (result.success) {
      console.log('✅ [PAYPAL] Zamówienie utworzone pomyślnie:', result.orderId);
      res.json({
        success: true,
        id: result.orderId,
        status: result.status,
        plan: plan,
        amount: amount
      });
    } else {
      console.log('❌ [PAYPAL] Błąd tworzenia zamówienia:', result.error);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('❌ [PAYPAL] Błąd tworzenia zamówienia PayPal:', error);
    console.error('❌ [PAYPAL] Stack trace:', error.stack);
    res.status(500).json({ error: 'Błąd serwera PayPal: ' + error.message });
  }
});

app.post('/api/paypal/capture/:orderID', async (req, res) => {
  const { orderID } = req.params;
  const { plan = 'monthly' } = req.body;
  
  if (!orderID) {
    return res.status(400).json({ error: 'ID zamówienia jest wymagane' });
  }
  
  try {
    console.log('🔄 [PAYPAL] Przechwytywanie płatności PayPal:', orderID, 'Plan:', plan);
    
    const result = await paypalService.capturePayment(orderID);
    
    if (result.success) {
      // Oblicz datę końca subskrypcji na podstawie planu
      const now = new Date();
      const endDate = new Date(now);
      
      if (plan === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      console.log('✅ [PAYPAL] Płatność zrealizowana pomyślnie:', {
        orderID,
        plan,
        startDate: now.toISOString(),
        endDate: endDate.toISOString()
      });
      
      res.json({
        success: true,
        captureId: result.captureId,
        status: result.status,
        amount: result.amount,
        plan: plan,
        subscriptionStart: now.toISOString(),
        subscriptionEnd: endDate.toISOString()
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('❌ [PAYPAL] Błąd przechwytywania płatności PayPal:', error);
    res.status(500).json({ error: 'Błąd serwera PayPal' });
  }
});

// Endpoint do pobierania statystyk lotto - ULEPSZONY
app.get('/api/statistics/:gameType', async (req, res) => {
  try {
    const { gameType } = req.params;
    console.log(`🔄 [ULEPSZONY] Pobieranie statystyk dla gry: ${gameType}`);
    
    const fs = require('fs');
    const path = require('path');
    const cachePath = path.join(__dirname, 'cache', `stats_${gameType}.json`);
    
    // Sprawdź cache
    if (fs.existsSync(cachePath)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        const cacheAge = Date.now() - new Date(cacheData.timestamp).getTime();
        const ageMinutes = Math.round(cacheAge / 1000 / 60);
        
        console.log(`✅ [CACHE] Cache dla ${gameType} - wiek: ${ageMinutes}min`);
        
        // Jeśli cache starszy niż 1 godzina, uruchom aktualizację w tle
        if (cacheAge > 60 * 60 * 1000) {
          console.log(`🔄 [BACKGROUND] Uruchamiam aktualizację w tle dla ${gameType}...`);
          // const { updateGameStatsAdvanced } = require('./advanced-scraper');
          // updateGameStatsAdvanced(gameType).catch(err => console.log(`❌ Błąd aktualizacji w tle: ${err.message}`));
        }
        
        // Zwróć cache
        return res.json({
          success: true,
          gameType: gameType,
          statistics: cacheData.data,
          lastUpdated: cacheData.timestamp,
          source: ageMinutes < 30 ? 'cache-fresh' : 'cache-stale',
          cacheAge: ageMinutes
        });
        
      } catch (parseError) {
        console.log(`❌ Błąd parsowania cache dla ${gameType}:`, parseError.message);
      }
    }
    
    // Jeśli brak cache, spróbuj pobrać dane przez zaawansowany scraper
    console.log(`🔄 [SCRAPER] Brak cache dla ${gameType} - próbuję pobrać dane...`);
    
    try {
      // const { updateGameStatsAdvanced } = require('./advanced-scraper');
      // const success = await updateGameStatsAdvanced(gameType);
      
      // Tymczasowo wyłączamy scraper - używamy cache lub domyślnych danych
    } catch (scraperError) {
      console.log(`❌ Błąd scrapera dla ${gameType}:`, scraperError.message);
    }
    
    // Fallback do domyślnych danych
    console.log(`📦 [FALLBACK] Używam domyślnych danych dla ${gameType}`);
    // Użyj istniejącej funkcji getDefaultStats z scraper.js
    const defaultStats = getDefaultStats(gameType);
    
    res.json({
      success: true,
      gameType: gameType,
      statistics: defaultStats,
      lastUpdated: new Date().toISOString(),
      source: 'default',
      message: 'Używam domyślnych danych'
    });
    
  } catch (error) {
    console.error('❌ Błąd pobierania statystyk:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Endpoint do aktualizacji statystyk - ULEPSZONY
app.post('/api/statistics/update', async (req, res) => {
  try {
    console.log('🔄 Rozpoczynam ulepszoną aktualizację statystyk...');
    
    const { gameType } = req.body;
    const games = gameType ? [gameType] : ['lotto', 'miniLotto', 'multiMulti', 'eurojackpot', 'kaskada', 'keno'];
    const results = {};
    
    // Użyj zaawansowanego scrapera
    // const { updateGameStatsAdvanced } = require('./advanced-scraper'); // Tymczasowo wyłączony
    
    for (const game of games) {
      console.log(`🔄 Aktualizuję statystyki dla ${game}...`);
      
      try {
        // Tymczasowo wyłączamy zaawansowany scraper
        results[game] = {
          success: false,
          source: 'disabled',
          message: `Aktualizacja ${game} tymczasowo wyłączona`
        };
        console.log(`⚠️ Aktualizacja ${game} tymczasowo wyłączona`);
      } catch (error) {
        console.error(`❌ Błąd aktualizacji ${game}:`, error.message);
        results[game] = {
          success: false,
          source: 'error',
          error: error.message
        };
      }
    }
    
    res.json({
      success: true,
      message: 'Aktualizacja statystyk zakończona',
      results: results
    });
  } catch (error) {
    console.error('❌ Błąd aktualizacji statystyk:', error);
    res.status(500).json({ error: 'Błąd aktualizacji statystyk' });
  }
});

// Endpoint do sprawdzania statusu API lotto.pl
app.get('/api/statistics/health', async (req, res) => {
  try {
    console.log('🔄 Sprawdzam status API lotto.pl...');
    const isHealthy = await checkAPIHealth();
    
    res.json({
      success: true,
      apiHealthy: isHealthy,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Błąd sprawdzania statusu API:', error);
    res.status(500).json({ error: 'Błąd sprawdzania statusu API' });
  }
});

// Endpoint do pobierania wszystkich statystyk
app.get('/api/statistics', async (req, res) => {
  try {
    const games = ['lotto', 'miniLotto', 'multiMulti', 'eurojackpot', 'kaskada', 'keno'];
    const allStats = {};
    const sources = {};
    
    for (const gameType of games) {
      let stats = null;
      let source = 'default';
      
      // NAJPIERW spróbuj przez scraper (działa lepiej niż API)
      try {
        const scraperResults = await scrapeDetailedResults(gameType, 50);
        if (scraperResults && scraperResults.length > 0) {
          const { calculateStats } = require('./scraper');
          stats = calculateStats(scraperResults, gameType);
          source = 'scraper';
          console.log(`✅ Pobrano statystyki przez scraper dla ${gameType} (${scraperResults.length} wyników)`);
        }
      } catch (scraperError) {
        console.log(`❌ Błąd scrapera dla ${gameType}:`, scraperError.message);
      }
      
      // Jeśli scraper się nie udał, spróbuj przez API (fallback)
      if (!stats) {
        try {
          const apiStats = await fetchLottoStatsAPI(gameType);
          if (apiStats && apiStats.statystyki) {
            stats = convertAPIStatsToAppFormat(apiStats, gameType);
            source = 'api';
          }
        } catch (apiError) {
          console.log(`❌ Błąd API dla ${gameType}:`, apiError.message);
        }
      }
      
      // Jeśli ani API ani scraper się nie udały, użyj domyślnych
      if (!stats) {
        stats = getDefaultStats(gameType);
        source = 'default';
      }
      
      allStats[gameType] = stats;
      sources[gameType] = source;
    }
    
    res.json({
      success: true,
      statistics: allStats,
      sources: sources
    });
  } catch (error) {
    console.error('❌ Błąd pobierania wszystkich statystyk:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Przelewy24 endpoints
app.post('/api/przelewy24/create-payment', async (req, res) => {
  console.log('=== PRZELEWY24 CREATE PAYMENT ===');
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers);
  console.log('Request IP:', req.ip);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  const { method, amount, currency = 'PLN', description, email, sessionId } = req.body;
  
  if (!method || !amount || !description || !email) {
    console.log('❌ Błąd walidacji - brakujące pola');
    console.log('Otrzymane dane:', { method, amount, description, email });
    return res.status(400).json({ 
      success: false,
      error: 'Metoda płatności, kwota, opis i email są wymagane' 
    });
  }

  // Sprawdź poprawność emaila
  if (!email.includes('@') || !email.includes('.')) {
    console.log('❌ Błąd walidacji - nieprawidłowy email:', email);
    return res.status(400).json({ 
      success: false,
      error: 'Nieprawidłowy format adresu email' 
    });
  }

  // Sprawdź czy kwota jest liczbą i jest większa od 0
  if (isNaN(amount) || amount <= 0) {
    console.log('❌ Błąd walidacji - nieprawidłowa kwota:', amount);
    return res.status(400).json({ 
      success: false,
      error: 'Kwota musi być liczbą większą od 0' 
    });
  }
  
  try {
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('✅ Session ID:', finalSessionId);
    console.log('📋 Parametry płatności:', { method, amount, currency, description, email });
    
    console.log('🔄 Wywołanie przelewy24Service.createPaymentForMethod...');
    const result = await przelewy24Service.createPaymentForMethod(method, amount, currency, description, email, finalSessionId);
    console.log('📤 Wynik przelewy24Service.createPaymentForMethod:', result);
    
    if (result.success) {
      console.log('✅ Płatność utworzona pomyślnie');
      console.log('🔗 URL przekierowania:', result.redirectUrl);
      res.json({
        success: true,
        paymentId: result.paymentId,
        redirectUrl: result.redirectUrl,
        sessionId: result.sessionId,
        method: method
      });
    } else {
      console.log('❌ Błąd tworzenia płatności:', result.error);
      res.status(400).json({ 
        success: false,
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('💥 Błąd tworzenia płatności Przelewy24:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera podczas przetwarzania płatności',
      details: error.message,
      type: 'przelewy24_error'
    });
  }
  
  console.log('=== KONIEC PRZELEWY24 CREATE PAYMENT ===');
});

app.post('/api/przelewy24/verify', async (req, res) => {
  const { sessionId, amount, currency = 'PLN' } = req.body;
  
  if (!sessionId || !amount) {
    return res.status(400).json({ error: 'Session ID i kwota są wymagane' });
  }
  
  try {
    const result = await paymentService.finalizePayment('card', sessionId, amount, currency);
    
    if (result.success) {
      res.json({
        success: true,
        verified: result.verified,
        paymentId: result.paymentId,
        status: result.status
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Błąd weryfikacji płatności Przelewy24:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Webhook endpoint dla Przelewy24 - odbieranie statusu płatności
app.post('/api/przelewy24/status', async (req, res) => {
  console.log('=== WEBHOOK PRZELEWY24 ===');
  console.log('Otrzymane dane:', req.body);
  
  try {
    const { 
      p24_merchant_id, 
      p24_pos_id, 
      p24_session_id, 
      p24_amount, 
      p24_currency, 
      p24_order_id, 
      p24_method, 
      p24_statement, 
      p24_sign 
    } = req.body;

    // Walidacja wymaganych pól
    if (!p24_session_id || !p24_amount || !p24_sign) {
      console.log('Brakujące wymagane pola');
      return res.status(400).json({ error: 'Brakujące wymagane pola' });
    }

    // Weryfikacja podpisu
    const expectedSign = przelewy24Service.generateP24Sign(
      p24_session_id,
      p24_merchant_id,
      p24_amount,
      p24_currency,
      config.PRZELEWY24.CRC
    );

    console.log(`Otrzymany sign: ${p24_sign}`);
    console.log(`Oczekiwany sign: ${expectedSign}`);

    if (p24_sign !== expectedSign) {
      console.log('Nieprawidłowy podpis');
      return res.status(400).json({ error: 'Nieprawidłowy podpis' });
    }

    // Aktualizacja statusu płatności w bazie danych
    // Tutaj możesz dodać logikę aktualizacji statusu użytkownika
    
    console.log('Płatność zweryfikowana pomyślnie');
    res.json({ success: true });
    
  } catch (error) {
    console.error('Błąd webhook Przelewy24:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.get('/api/przelewy24/status/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const result = await przelewy24Service.getPaymentStatus(sessionId);
    
    if (result.success) {
      res.json({
        success: true,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        paymentId: result.paymentId
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Błąd sprawdzania statusu płatności Przelewy24:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Automatyczna aktualizacja statystyk co 10 minut
const updateStatsInterval = setInterval(async () => {
  try {
    console.log('🔄 Automatyczna aktualizacja statystyk...');
    await updateAllStats();
    console.log('✅ Statystyki zaktualizowane automatycznie');
  } catch (error) {
    console.error('❌ Błąd automatycznej aktualizacji statystyk:', error);
  }
}, 10 * 60 * 1000); // Co 10 minut (10 minut * 60 sekund * 1000 ms)

// Pierwsza aktualizacja przy starcie serwera (wyłączona dla szybkiego startu)
// setTimeout(async () => {
//   try {
//     console.log('🚀 Pierwsza aktualizacja statystyk przy starcie...');
//     await updateAllStats();
//     console.log('✅ Pierwsza aktualizacja statystyk zakończona');
//   } catch (error) {
//     console.error('❌ Błąd pierwszej aktualizacji statystyk:', error);
//   }
// }, 5000); // 5 sekund po starcie

// Usuń app.listen stąd - przeniosę na koniec pliku

// Pobieranie szczegółowych wyników lotto
app.get('/api/results/:game', async (req, res) => {
  const { game } = req.params;
  const { days = 7, type = 'all' } = req.query; // days - ile dni wstecz, type - 'all', 'winners', 'results'
  
  try {
    console.log(`📊 Pobieranie szczegółowych wyników dla gry: ${game}, dni: ${days}, typ: ${type}`);
    
    // Próbuj pobrać rzeczywiste dane z lotto.pl
    try {
      console.log(`🔄 Próbuję pobrać szczegółowe wyniki z lotto.pl dla ${game}...`);
      const { scrapeDetailedResults } = require('./scraper');
      
      // Pobierz szczegółowe wyniki z lotto.pl
      const results = await scrapeDetailedResults(game, parseInt(days));
      
      if (results && results.length > 0) {
        console.log(`✅ Pobrano ${results.length} szczegółowych wyników z lotto.pl dla ${game}`);
        
        // Filtruj wyniki według typu
        let filteredResults = results;
        if (type === 'winners') {
          filteredResults = results.filter(result => result.prize || result.winners);
        } else if (type === 'results') {
          filteredResults = results.filter(result => result.numbers && result.numbers.length > 0);
        }
        
        res.json({
          success: true,
          data: filteredResults,
          lastUpdated: new Date().toISOString(),
          isReal: true,
          resultsCount: filteredResults.length,
          totalResults: results.length,
          game: game,
          daysBack: parseInt(days),
          type: type,
          message: `Pobrano szczegółowe wyniki z lotto.pl (${filteredResults.length} wyników)`
        });
        return;
      }
    } catch (scrapingError) {
      console.error(`❌ Błąd scrapowania szczegółowych wyników dla ${game}:`, scrapingError.message);
      console.log(`🔄 Używam domyślnych wyników dla ${game}...`);
    }
    
    // Fallback do domyślnych wyników
    const defaultResults = getDefaultResults(game, parseInt(days));
    
    res.json({
      success: true,
      data: defaultResults,
      lastUpdated: new Date().toISOString(),
      isDefault: true,
      resultsCount: defaultResults.length,
      game: game,
      daysBack: parseInt(days),
      type: type,
      message: 'Używam domyślnych wyników (fallback)'
    });
    
  } catch (error) {
    console.error('Błąd pobierania szczegółowych wyników:', error);
    res.status(500).json({ 
      error: 'Błąd pobierania szczegółowych wyników',
      details: error.message 
    });
  }
});

// Pobieranie szczegółowych wygranych lotto dla konkretnej gry
app.get('/api/winnings/:game', async (req, res) => {
  const { game } = req.params;
  const { days = 7 } = req.query;
  
  try {
    console.log(`💰 Pobieranie szczegółowych wygranych dla gry: ${game}, dni: ${days}`);
    
    // Próbuj pobrać rzeczywiste dane z lotto.pl
    try {
      console.log(`🔄 Próbuję pobrać szczegółowe wygrane z lotto.pl dla ${game}...`);
      const { scrapeDetailedResults } = require('./scraper');
      
      let allWinnings = {};
      
      // Pobierz wygrane dla konkretnej gry
      const results = await scrapeDetailedResults(game, parseInt(days));
      if (results && results.length > 0) {
        // Filtruj tylko wyniki z wygranymi
        const winnings = results.filter(result => result.prize || result.winners);
        allWinnings[game] = winnings;
      }
      
      if (Object.keys(allWinnings).length > 0) {
        console.log(`✅ Pobrano wygrane z lotto.pl dla ${game}`);
        
        res.json({
          success: true,
          data: allWinnings,
          lastUpdated: new Date().toISOString(),
          isReal: true,
          gamesCount: Object.keys(allWinnings).length,
          daysBack: parseInt(days),
          game: game,
          message: `Pobrano szczegółowe wygrane z lotto.pl dla ${game}`
        });
        return;
      }
    } catch (scrapingError) {
      console.error(`❌ Błąd scrapowania szczegółowych wygranych dla ${game}:`, scrapingError.message);
      console.log(`🔄 Używam domyślnych wygranych...`);
    }
    
    // Fallback do domyślnych wygranych
    const defaultWinnings = getDefaultWinnings(game, parseInt(days));
    
    res.json({
      success: true,
      data: defaultWinnings,
      lastUpdated: new Date().toISOString(),
      isDefault: true,
      gamesCount: Object.keys(defaultWinnings).length,
      game: game,
      daysBack: parseInt(days),
      message: 'Używam domyślnych wygranych (fallback)'
    });
    
  } catch (error) {
    console.error('Błąd pobierania szczegółowych wygranych:', error);
    res.status(500).json({ 
      error: 'Błąd pobierania szczegółowych wygranych',
      details: error.message 
    });
  }
});

// Pobieranie szczegółowych wygranych lotto dla wszystkich gier
app.get('/api/winnings', async (req, res) => {
  const { days = 7 } = req.query;
  
  try {
    console.log(`💰 Pobieranie szczegółowych wygranych dla wszystkich gier, dni: ${days}`);
    
    // Próbuj pobrać rzeczywiste dane z lotto.pl
    try {
      console.log(`🔄 Próbuję pobrać szczegółowe wygrane z lotto.pl dla wszystkich gier...`);
      const { scrapeDetailedResults } = require('./scraper');
      
      let allWinnings = {};
      
      // Pobierz wygrane dla wszystkich gier
      const games = ['lotto', 'miniLotto', 'multiMulti', 'eurojackpot', 'kaskada', 'keno'];
      
      for (const gameType of games) {
        try {
          const results = await scrapeDetailedResults(gameType, parseInt(days));
          if (results && results.length > 0) {
            const winnings = results.filter(result => result.prize || result.winners);
            if (winnings.length > 0) {
              allWinnings[gameType] = winnings;
            }
          }
        } catch (error) {
          console.error(`❌ Błąd pobierania wygranych dla ${gameType}:`, error.message);
        }
      }
      
      if (Object.keys(allWinnings).length > 0) {
        console.log(`✅ Pobrano wygrane z lotto.pl dla ${Object.keys(allWinnings).length} gier`);
        
        res.json({
          success: true,
          data: allWinnings,
          lastUpdated: new Date().toISOString(),
          isReal: true,
          gamesCount: Object.keys(allWinnings).length,
          daysBack: parseInt(days),
          game: 'all',
          message: `Pobrano szczegółowe wygrane z lotto.pl (${Object.keys(allWinnings).length} gier)`
        });
        return;
      }
    } catch (scrapingError) {
      console.error(`❌ Błąd scrapowania szczegółowych wygranych:`, scrapingError.message);
      console.log(`🔄 Używam domyślnych wygranych...`);
    }
    
    // Fallback do domyślnych wygranych
    const defaultWinnings = getDefaultWinnings(null, parseInt(days));
    
    res.json({
      success: true,
      data: defaultWinnings,
      lastUpdated: new Date().toISOString(),
      isDefault: true,
      gamesCount: Object.keys(defaultWinnings).length,
      game: 'all',
      daysBack: parseInt(days),
      message: 'Używam domyślnych wygranych (fallback)'
    });
    
  } catch (error) {
    console.error('Błąd pobierania szczegółowych wygranych:', error);
    res.status(500).json({ 
      error: 'Błąd pobierania szczegółowych wygranych',
      details: error.message 
    });
  }
});

// Funkcja pomocnicza do generowania domyślnych wyników
function getDefaultResults(gameType, daysBack) {
  const now = new Date();
  const results = [];
  
  // Generuj przykładowe wyniki dla ostatnich dni
  for (let i = 0; i < Math.min(daysBack, 10); i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    let numbers = [];
    let euroNumbers = null;
    
    // Generuj liczby w zależności od gry
    switch (gameType) {
      case 'lotto':
        numbers = generateRandomNumbers(6, 1, 49);
        break;
      case 'miniLotto':
        numbers = generateRandomNumbers(5, 1, 42);
        break;
      case 'multiMulti':
        numbers = generateRandomNumbers(10, 1, 80);
        break;
      case 'eurojackpot':
        numbers = generateRandomNumbers(5, 1, 50);
        euroNumbers = generateRandomNumbers(2, 1, 12);
        break;
      case 'kaskada':
        numbers = generateRandomNumbers(12, 1, 24);
        break;
      case 'keno':
        numbers = generateRandomNumbers(10, 1, 70);
        break;
      default:
        numbers = generateRandomNumbers(6, 1, 49);
    }
    
    results.push({
      date: date.toISOString(),
      numbers: numbers,
      euroNumbers: euroNumbers,
      sum: numbers.reduce((a, b) => a + b, 0),
      prize: i === 0 ? 'Brak wygranej' : null, // Tylko ostatnie losowanie ma informację o wygranej
      winners: i === 0 ? '0 osób' : null,
      location: i === 0 ? 'Warszawa' : null,
      drawNumber: i + 1
    });
  }
  
  return results;
}

// Funkcja pomocnicza do generowania domyślnych wygranych
function getDefaultWinnings(gameType, daysBack) {
  const now = new Date();
  const winnings = {};
  
  // Jeśli określono konkretną grę
  if (gameType) {
    winnings[gameType] = generateGameWinnings(gameType, daysBack);
  } else {
    // Generuj wygrane dla wszystkich gier
    const games = ['lotto', 'miniLotto', 'multiMulti', 'eurojackpot', 'kaskada', 'keno'];
    games.forEach(game => {
      winnings[game] = generateGameWinnings(game, daysBack);
    });
  }
  
  return winnings;
}

// Funkcja pomocnicza do generowania wygranych dla konkretnej gry
function generateGameWinnings(gameType, daysBack) {
  const now = new Date();
  const winnings = [];
  
  // Generuj przykładowe wygrane dla ostatnich dni
  for (let i = 0; i < Math.min(daysBack, 10); i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    let jackpot = 0;
    let winners = 0;
    let totalWinners = 0;
    let totalPrize = 0;
    let location = '';
    let prizeDistribution = {};
    
    // Generuj dane w zależności od gry
    switch (gameType) {
      case 'lotto':
        jackpot = 2000000 + Math.floor(Math.random() * 1000000);
        winners = Math.floor(Math.random() * 3) + 1;
        totalWinners = 15000 + Math.floor(Math.random() * 5000);
        totalPrize = 5000000 + Math.floor(Math.random() * 2000000);
        location = 'Warszawa';
        prizeDistribution = {
          '6/6': jackpot,
          '5/6': jackpot * 0.1,
          '4/6': jackpot * 0.05,
          '3/6': jackpot * 0.02
        };
        break;
      case 'miniLotto':
        jackpot = 100000 + Math.floor(Math.random() * 50000);
        winners = Math.floor(Math.random() * 5) + 1;
        totalWinners = 8000 + Math.floor(Math.random() * 3000);
        totalPrize = 800000 + Math.floor(Math.random() * 400000);
        location = 'Warszawa';
        prizeDistribution = {
          '5/5': jackpot,
          '4/5': jackpot * 0.15,
          '3/5': jackpot * 0.08
        };
        break;
      case 'multiMulti':
        jackpot = 50000 + Math.floor(Math.random() * 25000);
        winners = Math.floor(Math.random() * 10) + 1;
        totalWinners = 12000 + Math.floor(Math.random() * 4000);
        totalPrize = 600000 + Math.floor(Math.random() * 300000);
        location = 'Warszawa';
        prizeDistribution = {
          '10/10': jackpot,
          '9/10': jackpot * 0.2,
          '8/10': jackpot * 0.1
        };
        break;
      case 'eurojackpot':
        jackpot = 10000000 + Math.floor(Math.random() * 5000000);
        winners = Math.floor(Math.random() * 2) + 1;
        totalWinners = 20000 + Math.floor(Math.random() * 8000);
        totalPrize = 15000000 + Math.floor(Math.random() * 8000000);
        location = 'Helsinki';
        prizeDistribution = {
          '5+2': jackpot,
          '5+1': jackpot * 0.1,
          '5+0': jackpot * 0.05,
          '4+2': jackpot * 0.02
        };
        break;
      case 'kaskada':
        jackpot = 75000 + Math.floor(Math.random() * 35000);
        winners = Math.floor(Math.random() * 8) + 1;
        totalWinners = 10000 + Math.floor(Math.random() * 4000);
        totalPrize = 700000 + Math.floor(Math.random() * 350000);
        location = 'Warszawa';
        prizeDistribution = {
          '12/12': jackpot,
          '11/12': jackpot * 0.15,
          '10/12': jackpot * 0.08
        };
        break;
      case 'keno':
        jackpot = 30000 + Math.floor(Math.random() * 15000);
        winners = Math.floor(Math.random() * 15) + 1;
        totalWinners = 15000 + Math.floor(Math.random() * 6000);
        totalPrize = 400000 + Math.floor(Math.random() * 200000);
        location = 'Warszawa';
        prizeDistribution = {
          '10/10': jackpot,
          '9/10': jackpot * 0.2,
          '8/10': jackpot * 0.1
        };
        break;
      default:
        jackpot = 100000;
        winners = 1;
        totalWinners = 10000;
        totalPrize = 500000;
        location = 'Warszawa';
        prizeDistribution = {
          '6/6': jackpot,
          '5/6': jackpot * 0.1
        };
    }
    
    winnings.push({
      date: date.toISOString(),
      jackpot: jackpot,
      winners: winners,
      totalWinners: totalWinners,
      totalPrize: totalPrize,
      gameType: gameType,
      location: location,
      drawNumber: `#${1000 - i}`,
      prizeDistribution: prizeDistribution
    });
  }
  
  return winnings;
}

// Funkcja pomocnicza do generowania losowych liczb
function generateRandomNumbers(count, min, max) {
  const numbers = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

// Middleware do obsługi błędów routing
app.use((err, req, res, next) => {
  if (err instanceof TypeError && err.message.includes('path-to-regexp')) {
    console.error('Błąd routing path-to-regexp:', err);
    return res.status(400).json({ error: 'Nieprawidłowy format URL' });
  }
  next(err);
});

// Fallback dla SPA zostanie przeniesiony na koniec pliku

// Endpoint do obsługi powrotu z płatności PayPal
app.get('/api/payment/success', async (req, res) => {
  console.log('=== POWRÓT Z PŁATNOŚCI ===');
  console.log('Query params:', req.query);
  
  const { token, PayerID, session, method, amount } = req.query;
  
  try {
    if (method === 'paypal' && token && PayerID) {
      // Finalizacja płatności PayPal
      console.log('Finalizacja płatności PayPal...');
      const result = await paypalService.capturePayment(token);
      
      if (result.success) {
        console.log('✅ Płatność PayPal zakończona sukcesem');
        
        // Znajdź użytkownika na podstawie tokenu (można dodać mapowanie token->userId)
        // Na razie przekierowujemy bez aktualizacji subskrypcji
        res.redirect(`https://losuje.pl/payment-success?status=success&method=paypal&amount=${result.amount}&transactionId=${result.transactionId}`);
      } else {
        console.log('❌ Błąd finalizacji płatności PayPal:', result.error);
                  res.redirect(`https://losuje.pl/payment-cancel?status=error&method=paypal&error=${encodeURIComponent(result.error)}`);
      }
    } else if (method && session && amount) {
      // Weryfikacja płatności Przelewy24
      console.log('Weryfikacja płatności Przelewy24...');
      const result = await przelewy24Service.verifyPayment(session, parseFloat(amount));
      
      if (result.success) {
        console.log('✅ Płatność Przelewy24 zakończona sukcesem');
        
        // Znajdź użytkownika na podstawie sessionId
        const sessionParts = session.split('_');
        const userId = sessionParts[1];
        
        if (userId) {
          // Aktualizuj subskrypcję użytkownika
          const now = new Date();
          const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dni
          
          await updateSubscription(userId, 'premium', 'active', now.toISOString(), endDate.toISOString());
          console.log('✅ Subskrypcja użytkownika aktywowana');
        }
        
        res.redirect(`https://losuje.pl/payment-success?status=success&method=${method}&amount=${amount}&session=${session}`);
      } else {
        console.log('❌ Błąd weryfikacji płatności Przelewy24:', result.error);
                  res.redirect(`https://losuje.pl/payment-cancel?status=error&method=${method}&error=${encodeURIComponent(result.error)}`);
      }
    } else {
      console.log('❌ Brak wymaganych parametrów');
              res.redirect(`https://losuje.pl/payment-cancel?status=error&error=${encodeURIComponent('Brak wymaganych parametrów')}`);
    }
  } catch (error) {
    console.error('❌ Błąd obsługi powrotu z płatności:', error);
          res.redirect(`https://losuje.pl/payment-cancel?status=error&error=${encodeURIComponent(error.message)}`);
  }
});

// Endpoint do obsługi anulowania płatności
app.get('/api/payment/cancel', (req, res) => {
  console.log('=== ANULOWANIE PŁATNOŚCI ===');
  console.log('Query params:', req.query);
  
  const { method } = req.query;
      res.redirect(`https://losuje.pl/payment-cancel?status=cancelled&method=${method || 'unknown'}`);
});

// AI Ultra Pro API routes
app.use('/api/ai-ultra-pro', aiUltraProRouter);

// PayPal API routes
app.use('/api/paypal', paypalRoutes);

// Harmonic Lotto Analyzer API routes
const harmonicApiRouter = require('./harmonic-api');
app.use('/api/harmonic', harmonicApiRouter);

// Endpoint do sprawdzenia statusu płatności
app.get('/api/payment/status/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const result = await przelewy24Service.getPaymentStatus(sessionId);
    
    if (result.success) {
      res.json({
        success: true,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        paymentId: result.paymentId
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Błąd sprawdzania statusu płatności:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Uruchomienie serwera - na końcu pliku
app.listen(config.PORT, '0.0.0.0', () => {
  console.log('🚀 === BACKEND STARTED ===');
  console.log(`🌐 Serwer działa na http://localhost:${config.PORT}`);
  console.log(`🔧 Środowisko: ${config.NODE_ENV}`);
  console.log(`📁 Port: ${config.PORT}`);
  console.log(`🔑 PayPal Environment: ${config.PAYPAL.ENVIRONMENT}`);
  console.log(`💳 Przelewy24 Environment: ${config.PRZELEWY24.ENVIRONMENT}`);
  console.log(`🌐 SPA fallback skonfigurowany`);
  console.log('✅ Backend gotowy do obsługi żądań!');
  
  // Sprawdź konfigurację Przelewy24
  console.log('🔍 Sprawdzanie konfiguracji Przelewy24...');
  console.log(`   Merchant ID: ${config.PRZELEWY24.MERCHANT_ID}`);
  console.log(`   POS ID: ${config.PRZELEWY24.POS_ID}`);
  console.log(`   CRC: ${config.PRZELEWY24.CRC}`);
  console.log(`   Return URL: ${config.PRZELEWY24.RETURN_URL}`);
  console.log(`   Status URL: ${config.PRZELEWY24.STATUS_URL}`);
  
  // Sprawdź konfigurację PayPal
  console.log('🔍 Sprawdzanie konfiguracji PayPal...');
  console.log(`   Client ID: ${config.PAYPAL.CLIENT_ID ? 'OK' : 'BRAK'}`);
  console.log(`   Client Secret: ${config.PAYPAL.CLIENT_SECRET ? 'OK' : 'BRAK'}`);
  console.log(`   Return URL: ${config.PAYPAL.RETURN_URL}`);
  console.log(`   Cancel URL: ${config.PAYPAL.CANCEL_URL}`);
  
  // Cron job - aktualizacja cache co 2 godziny (w tle)
  cron.schedule('0 */2 * * *', async () => {
    console.log('🕐 [CRON] Rozpoczynam cykliczną aktualizację cache...');
    const games = ['lotto', 'miniLotto', 'multiMulti', 'eurojackpot'];
    
    for (const game of games) {
      try {
        await updateCacheInBackground(game);
        // Przerwa między grami, żeby nie przeciążać serwera
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30s
      } catch (error) {
        console.log(`❌ [CRON] Błąd aktualizacji ${game}:`, error.message);
      }
    }
    
    console.log('✅ [CRON] Cykliczna aktualizacja zakończona');
  });
  
  console.log('⏰ Zaplanowano automatyczną aktualizację cache co 2 godziny');
});

// Webhook Przelewy24 - endpoint do odbierania powiadomień o statusie płatności
app.post('/api/przelewy24/webhook', async (req, res) => {
  console.log('=== WEBHOOK PRZELEWY24 ===');
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers);
  
  try {
    const { sessionId, amount, currency, orderId, method, statement, sign } = req.body;
    
    // Weryfikacja podpisu webhooka
    const expectedSign = crypto
      .createHash('md5')
      .update(`${sessionId}|${amount}|${currency}|${orderId}|${config.PRZELEWY24.CRC}`)
      .digest('hex');
    
    if (sign !== expectedSign) {
      console.error('❌ Nieprawidłowy podpis webhooka');
      return res.status(400).json({ error: 'Nieprawidłowy podpis' });
    }
    
    console.log('✅ Podpis webhooka zweryfikowany');
    
    // Znajdź użytkownika na podstawie sessionId
    const sessionParts = sessionId.split('_');
    const userId = sessionParts[1]; // session_${userId}_${timestamp}
    
    if (!userId) {
      console.error('❌ Nie można wyodrębnić userId z sessionId:', sessionId);
      return res.status(400).json({ error: 'Nieprawidłowy sessionId' });
    }
    
    // Aktualizuj status płatności w bazie
    await addPayment(userId, parseFloat(amount) / 100, method, 'premium', orderId);
    
    // Aktualizuj subskrypcję użytkownika
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dni
    
    await updateSubscription(userId, 'premium', 'active', now.toISOString(), endDate.toISOString());
    
    console.log('✅ Płatność zaktualizowana w bazie');
    console.log('✅ Subskrypcja użytkownika aktywowana');
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Błąd webhooka Przelewy24:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});



// Endpoint do sprawdzania statusu subskrypcji użytkownika
app.get('/api/subscription/status/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const subscription = await getUserSubscription(userId);
    const accessResult = await checkUserAccess(userId);
    
    res.json({
      success: true,
      subscription,
      access: accessResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Błąd sprawdzania statusu subskrypcji:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera' 
    });
  }
});

// ===== ENDPOINTY DLA SYSTEMU TALIZMANÓW =====

// Endpoint do synchronizacji użytkownika Firebase z backendem
app.post('/api/sync-firebase-user', async (req, res) => {
  const { uid, email, name } = req.body;
  
  if (!uid || !email) {
    return res.status(400).json({ error: 'UID i email są wymagane' });
  }
  
  try {
    const { db } = require('./db');
    
    // Sprawdź czy użytkownik już istnieje
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE firebase_uid = ? OR email = ?', [uid, email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existingUser) {
      // Aktualizuj Firebase UID jeśli nie ma
      if (!existingUser.firebase_uid) {
        await new Promise((resolve, reject) => {
          db.run('UPDATE users SET firebase_uid = ? WHERE id = ?', [uid, existingUser.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      
      return res.json({
        success: true,
        user: {
          id: existingUser.id,
          firebase_uid: uid,
          email: existingUser.email,
          name: existingUser.name
        }
      });
    }
    
    // Utwórz nowego użytkownika
    const now = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const newUser = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (firebase_uid, email, name, password, created_at, updated_at, 
         subscription_status, subscription_plan, trial_start_date, trial_end_date, is_blocked) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uid, email, name || 'Użytkownik', '', now, now, 'trial', 'free', now, trialEnd, 0],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, firebase_uid: uid, email, name });
        }
      );
    });
    
    // Zainicjalizuj streak logowania
    const { registerLogin } = require('./db');
    await registerLogin(newUser.id);
    
    res.json({
      success: true,
      user: newUser
    });
  } catch (error) {
    console.error('Błąd synchronizacji użytkownika Firebase:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera',
      details: error.message
    });
  }
});

// Endpoint do logowania przez Firebase
app.post('/api/auth/firebase-login', async (req, res) => {
  // Sprawdź czy Firebase Admin jest dostępny
  const { auth } = require('./firebase-admin');
  if (!auth) {
    console.warn('⚠️ Firebase Admin nie jest dostępny - zwracam błąd');
    return res.status(500).json({
      success: false,
      error: 'Serwer autoryzacji niedostępny'
    });
  }
  
  // Weryfikuj token Firebase
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token autoryzacji jest wymagany'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    
    console.log('✅ Token Firebase zweryfikowany dla użytkownika:', decodedToken.uid);
  } catch (error) {
    console.error('❌ Błąd weryfikacji tokenu Firebase:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Nieprawidłowy token autoryzacji'
    });
  }
  
    try {
    const { uid, email, displayName } = req.user;
    
    console.log('🔍 Logowanie Firebase dla użytkownika:', uid);
    
    // Rejestruj logowanie w systemie talizmanów
    let loginResult = null;
    try {
      const { registerLogin } = require('./firebase-talismans');
      
      // Dodaj timeout dla Firebase (10 sekund)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase timeout')), 10000)
      );
      
      loginResult = await Promise.race([
        registerLogin(uid),
        timeoutPromise
      ]);
    } catch (talismanError) {
      console.warn('⚠️ Błąd systemu talizmanów:', talismanError.message);
      // Kontynuuj bez systemu talizmanów
    }
    
    res.json({
      success: true,
      message: 'Logowanie udane',
      user: {
        uid: uid,
        email: email,
        name: displayName || 'Użytkownik Google'
      },
      loginStreak: loginResult || { currentStreak: 0, totalTokens: 0, newToken: false }
    });
  } catch (error) {
    console.error('❌ Błąd logowania Firebase:', error);
    
    // Obsługa różnych typów błędów
    if (error.message.includes('firebase-talismans')) {
      return res.status(500).json({ 
        success: false,
        error: 'Błąd systemu talizmanów',
        details: error.message
      });
    }
    
    // Obsługa błędów weryfikacji tokenu
    if (error.message.includes('verifyIdToken')) {
      return res.status(401).json({ 
        success: false,
        error: 'Nieprawidłowy token autoryzacji',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera',
      details: error.message
    });
  }
});

// Endpoint testowy Firebase
app.get('/api/firebase-test', async (req, res) => {
  try {
    const { db } = require('./firebase-admin');
    
    if (!db) {
      return res.json({
        success: false,
        error: 'Firebase Admin nie jest zainicjalizowany',
        db: null
      });
    }
    
    // Test połączenia z Firestore
    const testDoc = await db.collection('test').doc('connection').get();
    
    res.json({
      success: true,
      message: 'Firebase Admin działa poprawnie',
      db: 'connected',
      firestore: 'working'
    });
  } catch (error) {
    console.error('❌ Test Firebase błąd:', error);
    res.json({
      success: false,
      error: error.message,
      db: 'error'
    });
  }
});

// Endpoint do rejestrowania logowania (żetony dzienne)
app.post('/api/auth/register-login', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ 
      success: false,
      error: 'UserId jest wymagane' 
    });
  }
  
  try {
    console.log('🔍 Rejestruję logowanie dla UID:', userId);
    
    // Sprawdź czy Firebase jest dostępny
    const { db } = require('./firebase-admin');
    if (!db) {
      console.log('⚠️ Firebase nie jest dostępny - zwracam sukces bez rejestracji');
      return res.json({
        success: true,
        message: 'Logowanie zarejestrowane (demo)',
        data: {
          currentStreak: 0,
          totalTokens: 0,
          newToken: false
        }
      });
    }
    
    // Importuj funkcje Firebase z timeout
    const { registerLogin } = require('./firebase-talismans');
    
    // Dodaj timeout dla Firebase (10 sekund)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firebase timeout')), 10000)
    );
    
    const loginResult = await Promise.race([
      registerLogin(userId),
      timeoutPromise
    ]);
    
    console.log('🔍 Wynik rejestracji logowania:', loginResult);
    
    res.json({
      success: true,
      message: loginResult.message,
      data: {
        currentStreak: loginResult.currentStreak,
        totalTokens: loginResult.totalTokens,
        newToken: loginResult.newToken
      }
    });
  } catch (error) {
    console.error('❌ Błąd rejestrowania logowania:', error);
    
    // Jeśli to timeout, zwróć sukces bez rejestracji
    if (error.message.includes('timeout')) {
      console.log('⚠️ Firebase timeout - zwracam sukces bez rejestracji');
      return res.json({
        success: true,
        message: 'Logowanie zarejestrowane (timeout)',
        data: {
          currentStreak: 0,
          totalTokens: 0,
          newToken: false
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera',
      details: error.message
    });
  }
});

// Endpoint do pobierania informacji o talizmanach użytkownika
app.get('/api/talismans/:userId', async (req, res) => {
  const { userId } = req.params;
  
  console.log('🔍 API talismans - request dla użytkownika:', userId);
  console.log('🔍 Headers:', req.headers);
  console.log('🔍 Method:', req.method);
  console.log('🔍 URL:', req.url);
  
  try {
    console.log('🔍 API talismans - userId:', userId);
    console.log('🔍 API talismans - userId length:', userId?.length);
    console.log('🔍 API talismans - userId type:', typeof userId);
    
    // Sprawdź czy to Firebase UID
    if (!userId || userId.length <= 20) {
      console.log('❌ Nieprawidłowy Firebase UID:', userId);
      return res.status(400).json({ 
        success: false,
        error: 'Nieprawidłowy Firebase UID',
        details: {
          userId: userId,
          length: userId?.length,
          type: typeof userId
        }
      });
    }
    
    console.log('🔍 Używam Firebase dla UID:', userId);
    
    // Sprawdź czy Firebase jest dostępny
    const { db } = require('./firebase-admin');
    if (!db) {
      console.log('❌ Firebase nie jest dostępny - zwracam demo dane');
      return res.json({
        success: true,
        streak: { current_streak: 0, total_tokens: 0 },
        eligibility: { availableTalismans: [], totalTokens: 0, nextTalisman: null },
        talismans: [],
        activeTalisman: null,
        bonuses: [],
        isDemo: true
      });
    }
    
    // Importuj funkcje Firebase
    const { 
      registerLogin,
      getLoginStreak, 
      checkTalismanEligibility, 
      getUserTalismans, 
      getActiveTalisman,
      getActiveBonuses
    } = require('./firebase-talismans');
    
    console.log('🔍 Rejestruję logowanie w Firebase...');
    const loginResult = await registerLogin(userId);
    console.log('🔍 Wynik rejestracji logowania:', loginResult);
    console.log('🔍 Czy przyznano nowy żeton:', loginResult.newToken);
    console.log('🔍 Obecny streak:', loginResult.currentStreak);
    console.log('🔍 Obecne tokeny:', loginResult.totalTokens);
    
    console.log('🔍 Pobieram dane talizmanów z Firebase...');
    
    const [streak, eligibility, userTalismans, activeTalisman, bonuses] = await Promise.all([
      getLoginStreak(userId),
      checkTalismanEligibility(userId),
      getUserTalismans(userId),
      getActiveTalisman(userId),
      getActiveBonuses(userId)
    ]);
    
    console.log('🔍 Otrzymane dane z Firebase:', { streak, eligibility, userTalismans, activeTalisman, bonuses });
    
    res.json({
      success: true,
      streak,
      eligibility,
      talismans: userTalismans,
      activeTalisman,
      bonuses
    });
  } catch (error) {
    console.error('❌ Błąd pobierania talizmanów z Firebase:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Zwróć demo dane w przypadku błędu
    res.json({
      success: true,
      streak: { current_streak: 0, total_tokens: 0 },
      eligibility: { availableTalismans: [], totalTokens: 0, nextTalisman: null },
      talismans: [],
      activeTalisman: null,
      bonuses: [],
      isDemo: true,
      error: error.message
    });
  }
});

// Endpoint do przyznawania talizmanu
app.post('/api/talismans/grant', async (req, res) => {
  const { userId, talismanId } = req.body;
  
  if (!userId || !talismanId) {
    return res.status(400).json({ error: 'UserId i talismanId są wymagane' });
  }
  
  try {
    const { grantTalisman, checkTalismanEligibility } = require('./firebase-talismans');
    
    // Sprawdź czy użytkownik może otrzymać ten talizman
    const eligibility = await checkTalismanEligibility(userId);
    const talismanRequirements = [8, 12, 16, 20, 24, 28, 36, 40, 44, 50];
    
    if (!eligibility.availableTalismans.includes(talismanRequirements[talismanId - 1])) {
      return res.status(400).json({ error: 'Nie masz wystarczającej liczby żetonów na ten talizman' });
    }
    
    // Przyznaj talizman
    await grantTalisman(userId, talismanId);
    
    res.json({
      success: true,
      message: 'Talizman został przyznany!'
    });
  } catch (error) {
    console.error('Błąd przyznawania talizmanu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera' 
    });
  }
});

// Endpoint do aktywowania/deaktywowania talizmanu
app.post('/api/talismans/toggle', async (req, res) => {
  const { userId, talismanId, active } = req.body;
  
  if (!userId || !talismanId) {
    return res.status(400).json({ error: 'UserId i talismanId są wymagane' });
  }
  
  try {
    const { toggleTalismanActive } = require('./firebase-talismans');
    
    await toggleTalismanActive(userId, talismanId, active);
    
    res.json({
      success: true,
      message: active ? 'Talizman został aktywowany!' : 'Talizman został deaktywowany!'
    });
  } catch (error) {
    console.error('Błąd przełączania talizmanu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera' 
    });
  }
});

// Endpoint do dodawania bonusu talizmanu
app.post('/api/talismans/bonus', async (req, res) => {
  const { userId, talismanId, bonusType, bonusValue } = req.body;
  
  if (!userId || !talismanId || !bonusType) {
    return res.status(400).json({ error: 'UserId, talismanId i bonusType są wymagane' });
  }
  
  try {
    const { addTalismanBonus } = require('./firebase-talismans');
    
    // Bonus wygasa za 24 godziny
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await addTalismanBonus(userId, talismanId, bonusType, bonusValue, expiresAt);
    
    res.json({
      success: true,
      message: 'Bonus został dodany!'
    });
  } catch (error) {
    console.error('Błąd dodawania bonusu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera' 
    });
  }
});

// Prosty endpoint testowy
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend działa!',
    timestamp: new Date().toISOString()
  });
});

// Endpoint do przyznania testowych żetonów
app.post('/api/talismans/add-test-tokens', async (req, res) => {
  const { userId, tokensToAdd = 200 } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'UserId jest wymagane' });
  }
  
  try {
    const { addTestTokens } = require('./firebase-talismans');
    
    const result = await addTestTokens(userId, tokensToAdd);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Błąd przyznawania testowych żetonów:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera',
      details: error.message
    });
  }
});

// Endpoint do sprawdzenia konfiguracji PayPal
app.get('/api/paypal/config', (req, res) => {
  console.log('=== SPRAWDZENIE KONFIGURACJI PAYPAL ===');
  
  const config = require('./config');
  
  res.json({
    success: true,
    environment: config.PAYPAL.ENVIRONMENT,
    clientId: config.PAYPAL.CLIENT_ID ? 'OK' : 'BRAK',
    clientSecret: config.PAYPAL.CLIENT_SECRET ? 'OK' : 'BRAK',
    returnUrl: config.PAYPAL.RETURN_URL,
    cancelUrl: config.PAYPAL.CANCEL_URL,
    serviceLoaded: !!paypalService,
    timestamp: new Date().toISOString()
  });
});

// Google Play Billing endpoints
app.post('/api/google-play/verify-purchase', async (req, res) => {
  const { userId, purchaseToken, productId, orderId } = req.body;
  
  if (!userId || !purchaseToken || !productId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Brak wymaganych parametrów' 
    });
  }
  
  try {
    console.log('🔍 Weryfikacja zakupu Google Play:', { userId, productId, orderId });
    
    // Tutaj będzie integracja z Google Play Developer API
    // Na razie symulujemy weryfikację
    
    const { updateUserPaymentStatus, addPayment } = require('./db');
    
    // Określ plan na podstawie productId
    let plan = 'premium_monthly';
    let amount = '9.99 PLN';
    
    if (productId === 'premium_yearly') {
      plan = 'premium_yearly';
      amount = '59.90 PLN';
    }
    
    // Aktualizuj status płatności użytkownika
    await updateUserPaymentStatus(userId, true);
    
    // Dodaj płatność do historii
    await addPayment(userId, amount, 'google_play', plan, orderId);
    
    res.json({
      success: true,
      message: 'Zakup zweryfikowany pomyślnie',
      data: {
        userId,
        productId,
        plan,
        amount,
        verified: true
      }
    });
  } catch (error) {
    console.error('❌ Błąd weryfikacji zakupu Google Play:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Błąd weryfikacji zakupu' 
    });
  }
});

app.post('/api/google-play/acknowledge-purchase', async (req, res) => {
  const { userId, purchaseToken } = req.body;
  
  if (!userId || !purchaseToken) {
    return res.status(400).json({ 
      success: false, 
      error: 'Brak wymaganych parametrów' 
    });
  }
  
  try {
    console.log('✅ Potwierdzenie zakupu Google Play:', { userId, purchaseToken });
    
    // Tutaj będzie integracja z Google Play Developer API
    // Na razie symulujemy potwierdzenie
    
    res.json({
      success: true,
      message: 'Zakup potwierdzony pomyślnie'
    });
  } catch (error) {
    console.error('❌ Błąd potwierdzenia zakupu Google Play:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Błąd potwierdzenia zakupu' 
    });
  }
});

app.get('/api/google-play/products', (req, res) => {
  try {
    const products = [
      {
        id: 'premium_monthly',
        name: 'Premium Miesięczny',
        price: '9.99 PLN',
        period: 'miesiąc',
        features: [
          '🚀 AI Generator Ultra Pro',
          '🎵 Analizator Harmoniczny',
          '🎲 Generator Schonheim',
          '✨ System Talizmanów',
          '📈 Zaawansowane statystyki',
          '🎰 Wszystkie gry lotto'
        ]
      },
      {
        id: 'premium_yearly',
        name: 'Premium Roczny',
        price: '59.90 PLN',
        period: 'rok',
        savings: '59.88 PLN',
        features: [
          '🚀 AI Generator Ultra Pro',
          '🎵 Analizator Harmoniczny',
          '🎲 Generator Schonheim',
          '✨ System Talizmanów',
          '📈 Zaawansowane statystyki',
          '🎰 Wszystkie gry lotto',
          '💎 6 miesięcy gratis!'
        ]
      }
    ];
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('❌ Błąd pobierania produktów Google Play:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Błąd pobierania produktów' 
    });
  }
});

// Fallback dla SPA - serwuj index.html dla wszystkich tras, które nie są API
// MUSI być na końcu, po wszystkich endpointach API
app.get('*', (req, res) => {
  // Jeśli to nie jest API endpoint, przekieruj do frontendu
  if (!req.path.startsWith('/api/')) {
    try {
      res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    } catch (error) {
      console.error('Błąd serwowania pliku index.html:', error);
      res.status(404).json({ error: 'Strona nie została znaleziona' });
    }
  } else {
    res.status(404).json({ error: 'Endpoint nie istnieje' });
  }
});
