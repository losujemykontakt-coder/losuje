const config = require('./config');
const paypalConfig = require('./paypal-config');

console.log('=== TEST KONFIGURACJI PAYPAL ===');
console.log('CLIENT_ID:', config.PAYPAL.CLIENT_ID ? 'OK' : 'BRAK');
console.log('CLIENT_SECRET:', config.PAYPAL.CLIENT_SECRET ? 'OK' : 'BRAK');
console.log('ENVIRONMENT:', config.PAYPAL.ENVIRONMENT);
console.log('RETURN_URL:', config.PAYPAL.RETURN_URL);
console.log('CANCEL_URL:', config.PAYPAL.CANCEL_URL);
console.log('PayPal Client:', paypalConfig.client ? 'OK' : 'BŁĄD');
console.log('Environment:', paypalConfig.environment);
console.log('=== KONIEC TESTU ==='); 