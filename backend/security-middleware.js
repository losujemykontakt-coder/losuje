const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Import Firebase Admin
const { auth } = require('./firebase-admin');

// Rate limiting dla API
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // maksymalnie 100 żądań na okno czasowe
  message: {
    error: 'Zbyt wiele żądań z tego IP, spróbuj ponownie później'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting dla logowania
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // maksymalnie 5 prób logowania
  message: {
    error: 'Zbyt wiele prób logowania, spróbuj ponownie później'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware do blokowania niebezpiecznych nagłówków
const blockDangerousHeaders = (req, res, next) => {
  const dangerousHeaders = [
    'x-forwarded-for',
    'x-forwarded-proto',
    'x-forwarded-host',
    'x-forwarded-port'
  ];
  
  dangerousHeaders.forEach(header => {
    if (req.headers[header]) {
      delete req.headers[header];
    }
  });
  
  next();
};

// Middleware do sprawdzania rozmiaru żądania
const checkRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Żądanie jest zbyt duże'
    });
  }
  
  next();
};

// Middleware do wykrywania podejrzanej aktywności
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /document\./i,
    /window\./i
  ];
  
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);
  const params = JSON.stringify(req.params);
  
  const allData = body + query + params;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(allData)) {
      logSecurityEvent('SUSPICIOUS_ACTIVITY_DETECTED', {
        ip: req.ip,
        pattern: pattern.source,
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        error: 'Wykryto podejrzaną aktywność'
      });
    }
  }
  
  next();
};

// Middleware do walidacji danych wejściowych
const validateInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/[<>]/g, '')
      .trim();
  };
  
  // Sanityzacja body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  
  // Sanityzacja query
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }
  
  next();
};

// Funkcja do walidacji hasła
const validatePassword = (password, name) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Hasło musi mieć co najmniej 8 znaków');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną wielką literę');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną małą literę');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną cyfrę');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jeden znak specjalny');
  }
  
  // Sprawdzenie czy hasło nie zawiera imienia
  if (name && password.toLowerCase().includes(name.toLowerCase())) {
    errors.push('Hasło nie może zawierać Twojego imienia');
  }
  
  // Sprawdzenie czy hasło nie zawiera popularnych wzorców
  const commonPatterns = ['password', '123456', 'qwerty', 'admin'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    errors.push('Hasło nie może zawierać popularnych wzorców');
  }
  
  return errors;
};

// Funkcja do logowania zdarzeń bezpieczeństwa
const logSecurityEvent = (eventType, data) => {
  const timestamp = new Date().toISOString();
  console.log(`🔒 [SECURITY] ${timestamp} - ${eventType}:`, data);
  
  // Tutaj możesz dodać logowanie do pliku lub bazy danych
  // fs.appendFileSync('security.log', `${timestamp} - ${eventType}: ${JSON.stringify(data)}\n`);
};

// Middleware do weryfikacji tokenów Firebase
const verifyFirebaseToken = async (req, res, next) => {
  // Obsługa preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token autoryzacji jest wymagany'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if (!auth) {
      console.warn('⚠️ Firebase Admin nie jest dostępny - pomijam weryfikację tokenu');
      // W trybie development pozwól na kontynuację bez weryfikacji
      if (process.env.NODE_ENV === 'development') {
        return next();
      }
      return res.status(500).json({
        error: 'Serwer autoryzacji niedostępny'
      });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    
    console.log('✅ Token Firebase zweryfikowany dla użytkownika:', decodedToken.uid);
    next();
  } catch (error) {
    console.error('❌ Błąd weryfikacji tokenu Firebase:', error.message);
    return res.status(401).json({
      error: 'Nieprawidłowy token autoryzacji'
    });
  }
};

module.exports = {
  helmet: helmet(),
  xss,
  hpp,
  cors: cors({
    origin: ['https://losuje.pl', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  }),
  apiRateLimiter,
  loginRateLimiter,
  blockDangerousHeaders,
  checkRequestSize,
  detectSuspiciousActivity,
  validateInput,
  validatePassword,
  verifyFirebaseToken,
  logSecurityEvent
};
