// Konfiguracja bezpieczeństwa aplikacji
require('dotenv').config();

const config = {
  // JWT Secret - z zmiennej środowiskowej lub fallback
  JWT_SECRET: process.env.JWT_SECRET || 'twoj_silny_jwt_secret_2024_lotek_generator_bezpieczny_123456789',
  
  // Port serwera
  PORT: process.env.PORT || 3001,
  
  // Środowisko - z zmiennej środowiskowej
  NODE_ENV: process.env.NODE_ENV || 'production',
  
  // Konfiguracja email (dla resetowania hasła)
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: process.env.EMAIL_PORT || 587,
    USER: process.env.EMAIL_USER || 'twoj_email@gmail.com',
    PASS: process.env.EMAIL_PASS || 'twoje_haslo_aplikacji',
    FROM: process.env.EMAIL_FROM || 'noreply@losuje-generator.com'
  },
  
  // Konfiguracja bazy danych
  DB_PATH: process.env.DB_PATH || './users.db',
  
  // Konfiguracja CORS - z zmiennej środowiskowej
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://losuje.pl',
  
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
    
    // Konfiguracja CORS - z zmiennej środowiskowej
    CORS: {
      ALLOWED_ORIGINS: [process.env.CORS_ORIGIN || 'https://losuje.pl', 'http://localhost:3000', 'http://127.0.0.1:3000']
    }
  },
  
  // Konfiguracja PayPal - z zmiennych środowiskowych
  PAYPAL: {
    CLIENT_ID: process.env.PAYPAL_CLIENT_ID || 'Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC',
    CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || 'EL-rOID1Th-ByzT-IcWGGxUQNkXw1sz9gwlSK_LeYTTG839kTlRqTY6VrDa2iwoLAkY-5F2edJ2kOkbR',
    RETURN_URL: process.env.PAYPAL_RETURN_URL || 'https://losuje.pl/payment-success',
    CANCEL_URL: process.env.PAYPAL_CANCEL_URL || 'https://losuje.pl/payment-cancel',
    ENVIRONMENT: process.env.PAYPAL_ENVIRONMENT || 'live'
  },
  
  // Konfiguracja Przelewy24 - z zmiennych środowiskowych
  PRZELEWY24: {
    MERCHANT_ID: process.env.PRZELEWY24_MERCHANT_ID || '269321',
    POS_ID: process.env.PRZELEWY24_POS_ID || '269321',
    API_KEY: process.env.PRZELEWY24_API_KEY || 'aa2aefcd5f59cdb2b56b40470a6d51ae',
    CRC: process.env.PRZELEWY24_CRC || '476f49249ee1c6e1',
    RETURN_URL: process.env.PRZELEWY24_RETURN_URL || 'https://losuje.pl/payment-success',
    STATUS_URL: process.env.PRZELEWY24_STATUS_URL || 'https://losuje.pl/api/przelewy24/status',
    WEBHOOK_URL: process.env.PRZELEWY24_WEBHOOK_URL || 'https://losuje.pl/api/przelewy24/webhook',
    ENVIRONMENT: process.env.PRZELEWY24_ENVIRONMENT || 'production'
  },
  

};

module.exports = config; 