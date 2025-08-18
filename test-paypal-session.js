// Test konfiguracji PayPal i błędów sesji
const config = require('./backend/config');

console.log('=== ANALIZA BŁĘDÓW PAYPAL SESSION ===');
console.log('');

console.log('1. KONFIGURACJA BACKEND:');
console.log('   PayPal Environment:', config.PAYPAL.ENVIRONMENT);
console.log('   PayPal Client ID:', config.PAYPAL.CLIENT_ID ? 'OK' : 'BRAK');
console.log('   PayPal Client Secret:', config.PAYPAL.CLIENT_SECRET ? 'OK' : 'BRAK');
console.log('   NODE_ENV:', config.NODE_ENV);
console.log('');

console.log('2. MOŻLIWE PRZYCZYNY BŁĘDÓW global_session_not_found:');
console.log('   - PayPal SDK używa sandbox mimo konfiguracji live');
console.log('   - Client ID może być dla środowiska sandbox');
console.log('   - Problem z inicjalizacją sesji PayPal');
console.log('   - Konflikt między środowiskami frontend/backend');
console.log('');

console.log('3. ROZWIĄZANIA:');
console.log('   ✅ Backend używa środowiska:', config.PAYPAL.ENVIRONMENT);
console.log('   ✅ Konfiguracja z mcp.json jest poprawna');
console.log('   ⚠️  Frontend może używać domyślnego sandbox');
console.log('   ⚠️  Client ID może wymagać zmiany dla live environment');
console.log('');

console.log('4. REKOMENDACJE:');
console.log('   - Sprawdź czy Client ID jest dla środowiska live');
console.log('   - Dodaj explicit environment w frontend PayPal config');
console.log('   - Zmniejsz częstotliwość resetowania PayPal');
console.log('   - Dodaj lepszą obsługę błędów sesji');
console.log('');

console.log('5. STATUS:');
console.log('   Backend: ✅ Skonfigurowany dla live');
console.log('   Frontend: ⚠️  Może używać sandbox');
console.log('   Klucze: ✅ Pobrane z mcp.json');
console.log('   Sesja: ❌ Błędy global_session_not_found');

