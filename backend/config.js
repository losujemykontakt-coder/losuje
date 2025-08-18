// Konfiguracja bezpieczeństwa aplikacji
require('dotenv').config();

const config = {
  // JWT Secret - klucz z mcp.json
  JWT_SECRET: 'twoj_silny_jwt_secret_2024_lotek_generator_bezpieczny_123456789',
  
  // Port serwera
  PORT: process.env.PORT || 3001,
  
  // Środowisko - z mcp.json
  NODE_ENV: 'production',
  
  // Konfiguracja email (dla resetowania hasła)
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: process.env.EMAIL_PORT || 587,
    USER: process.env.EMAIL_USER || 'twoj_email@gmail.com',
    PASS: process.env.EMAIL_PASS || 'twoje_haslo_aplikacji',
    FROM: process.env.EMAIL_FROM || 'noreply@lotek-generator.com'
  },
  
  // Konfiguracja bazy danych
  DB_PATH: process.env.DB_PATH || './users.db',
  
  // Konfiguracja CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Konfiguracja bezpieczeństwa
  SECURITY: {
    // Czas wygaśnięcia tokenu (24 godziny)
    JWT_EXPIRES_IN: '24h',
    
    // Minimalna długość hasła
    MIN_PASSWORD_LENGTH: 6,
    
    // Maksymalna liczba prób logowania
    MAX_LOGIN_ATTEMPTS: 5,
    
    // Czas blokady po przekroczeniu prób (15 minut)
    LOCKOUT_TIME: 15 * 60 * 1000,
    
    // Czas wygaśnięcia tokenu resetowania hasła (1 godzina)
    RESET_TOKEN_EXPIRES_IN: '1h',
    
    // Konfiguracja CORS
    CORS: {
      ALLOWED_ORIGINS: ['http://localhost:3000', 'http://127.0.0.1:3000']
    }
  },
  
  // Konfiguracja PayPal - klucze z mcp.json
  PAYPAL: {
    CLIENT_ID: 'AcLnAD0aCb1hFnw5TDDoe_k1cLkqp-FtcWai8mctRT57oDP4pPi4ukzwdaFCS6JFAkQqfH1MIb0f0s9Z',
    CLIENT_SECRET: 'EEgJI6MgD80kfoghzXocyenIgmhYgoL7otwGmDeOvxKRt-eTmYfbJ6lgxEvQ3DL3J0Nze5pLkRqOrRGt',
    RETURN_URL: 'http://localhost:3000/payment-success',
    CANCEL_URL: 'http://localhost:3000/payment-cancel',
    ENVIRONMENT: 'live' // Używamy live environment z mcp.json
  },
  
  // Konfiguracja Przelewy24 - klucze z mcp.json
  PRZELEWY24: {
    MERCHANT_ID: '269321',
    POS_ID: '269321',
    API_KEY: 'aa2aefcd5f59cdb2b56b40470a6d51ae',
    CRC: '476f49249ee1c6e1',
    RETURN_URL: 'http://localhost:3000/payment-success',
    STATUS_URL: 'http://localhost:3001/api/przelewy24/status',
    ENVIRONMENT: 'production'
  },
  

};

module.exports = config; 