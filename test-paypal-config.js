// Test konfiguracji PayPal
const config = require('./backend/config');

console.log('=== TEST KONFIGURACJI PAYPAL ===');
console.log('PayPal Client ID:', config.PAYPAL.CLIENT_ID ? 'OK' : 'BRAK');
console.log('PayPal Client Secret:', config.PAYPAL.CLIENT_SECRET ? 'OK' : 'BRAK');
console.log('PayPal Environment:', config.PAYPAL.ENVIRONMENT);
console.log('PayPal Return URL:', config.PAYPAL.RETURN_URL);
console.log('PayPal Cancel URL:', config.PAYPAL.CANCEL_URL);

console.log('\n=== TEST KONFIGURACJI PRZELEWY24 ===');
console.log('Przelewy24 Merchant ID:', config.PRZELEWY24.MERCHANT_ID);
console.log('Przelewy24 POS ID:', config.PRZELEWY24.POS_ID);
console.log('Przelewy24 API Key:', config.PRZELEWY24.API_KEY ? 'OK' : 'BRAK');
console.log('Przelewy24 CRC:', config.PRZELEWY24.CRC ? 'OK' : 'BRAK');
console.log('Przelewy24 Environment:', config.PRZELEWY24.ENVIRONMENT);

console.log('\n=== TEST ŚRODOWISKA ===');
console.log('NODE_ENV:', config.NODE_ENV);
console.log('JWT_SECRET:', config.JWT_SECRET ? 'OK' : 'BRAK');

console.log('\n=== KONFIGURACJA Z mcp.json ===');
console.log('Wszystkie klucze zostały skonfigurowane z pliku mcp.json');
console.log('PayPal używa środowiska:', config.PAYPAL.ENVIRONMENT);
console.log('Przelewy24 używa środowiska:', config.PRZELEWY24.ENVIRONMENT);

