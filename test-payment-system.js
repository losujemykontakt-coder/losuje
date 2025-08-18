const axios = require('axios');

// Konfiguracja testów
const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'test@example.com';

// Kolory dla logów
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Sprawdzenie zdrowia backendu
async function testBackendHealth() {
  log('\n=== TEST 1: SPRAWDZENIE ZDROWIA BACKENDU ===', 'blue');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    log('✅ Backend odpowiada poprawnie', 'green');
    log(`Status: ${response.status}`, 'green');
    log(`Message: ${response.data.message}`, 'green');
    log(`CORS: ${JSON.stringify(response.data.cors)}`, 'green');
    return true;
  } catch (error) {
    log('❌ Backend nie odpowiada', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 2: Test endpointu płatności
async function testPaymentEndpoint() {
  log('\n=== TEST 2: TEST ENDPOINTU PŁATNOŚCI ===', 'blue');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/test`, {
      test: true,
      timestamp: new Date().toISOString()
    });
    
    log('✅ Endpoint płatności działa', 'green');
    log(`Status: ${response.status}`, 'green');
    log(`Services: ${JSON.stringify(response.data.servicesStatus)}`, 'green');
    log(`Przelewy24 Config: ${JSON.stringify(response.data.przelewy24Config)}`, 'green');
    log(`PayPal Config: ${JSON.stringify(response.data.paypalConfig)}`, 'green');
    return true;
  } catch (error) {
    log('❌ Endpoint płatności nie działa', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: Test PayPal
async function testPayPal() {
  log('\n=== TEST 3: TEST PAYPAL ===', 'blue');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/paypal/create-order`, {
      amount: 9.99,
      currency: 'PLN',
      description: 'Test Plan Premium - Lotek',
      email: TEST_EMAIL
    });
    
    if (response.data.success) {
      log('✅ PayPal - zamówienie utworzone pomyślnie', 'green');
      log(`Order ID: ${response.data.orderId}`, 'green');
      log(`Approval URL: ${response.data.approvalUrl}`, 'green');
      return true;
    } else {
      log('❌ PayPal - błąd tworzenia zamówienia', 'red');
      log(`Error: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ PayPal - błąd połączenia', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 4: Test Przelewy24
async function testPrzelewy24() {
  log('\n=== TEST 4: TEST PRZELEWY24 ===', 'blue');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/przelewy24/create-payment`, {
      method: 'blik',
      amount: 9.99,
      currency: 'PLN',
      description: 'Test Plan Premium - Lotek',
      email: TEST_EMAIL,
      sessionId: `test_session_${Date.now()}`
    });
    
    if (response.data.success) {
      log('✅ Przelewy24 - płatność utworzona pomyślnie', 'green');
      log(`Payment ID: ${response.data.paymentId}`, 'green');
      log(`Redirect URL: ${response.data.redirectUrl}`, 'green');
      log(`Session ID: ${response.data.sessionId}`, 'green');
      return true;
    } else {
      log('❌ Przelewy24 - błąd tworzenia płatności', 'red');
      log(`Error: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Przelewy24 - błąd połączenia', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 5: Test różnych metod płatności Przelewy24
async function testPrzelewy24Methods() {
  log('\n=== TEST 5: TEST RÓŻNYCH METOD PRZELEWY24 ===', 'blue');
  
  const methods = ['blik', 'card', 'transfer'];
  const results = {};
  
  for (const method of methods) {
    try {
      log(`\nTestowanie metody: ${method}`, 'yellow');
      
      const response = await axios.post(`${API_BASE_URL}/api/przelewy24/create-payment`, {
        method: method,
        amount: 9.99,
        currency: 'PLN',
        description: `Test ${method} - Plan Premium`,
        email: TEST_EMAIL,
        sessionId: `test_${method}_${Date.now()}`
      });
      
      if (response.data.success) {
        log(`✅ ${method.toUpperCase()} - OK`, 'green');
        results[method] = true;
      } else {
        log(`❌ ${method.toUpperCase()} - Błąd: ${response.data.error}`, 'red');
        results[method] = false;
      }
    } catch (error) {
      log(`❌ ${method.toUpperCase()} - Błąd połączenia: ${error.message}`, 'red');
      results[method] = false;
    }
  }
  
  return results;
}

// Test 6: Test weryfikacji płatności
async function testPaymentVerification() {
  log('\n=== TEST 6: TEST WERYFIKACJI PŁATNOŚCI ===', 'blue');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/przelewy24/verify`, {
      sessionId: `test_verification_${Date.now()}`,
      amount: 9.99,
      currency: 'PLN'
    });
    
    if (response.data.success) {
      log('✅ Weryfikacja płatności - OK', 'green');
      log(`Verified: ${response.data.verified}`, 'green');
      log(`Status: ${response.data.status}`, 'green');
      return true;
    } else {
      log('❌ Weryfikacja płatności - błąd', 'red');
      log(`Error: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Weryfikacja płatności - błąd połączenia', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

// Główna funkcja testowa
async function runAllTests() {
  log('🚀 ROZPOCZYNAM TESTY SYSTEMU PŁATNOŚCI', 'blue');
  log('=====================================', 'blue');
  
  const results = {
    backendHealth: await testBackendHealth(),
    paymentEndpoint: await testPaymentEndpoint(),
    paypal: await testPayPal(),
    przelewy24: await testPrzelewy24(),
    przelewy24Methods: await testPrzelewy24Methods(),
    verification: await testPaymentVerification()
  };
  
  // Podsumowanie
  log('\n=== PODSUMOWANIE TESTÓW ===', 'blue');
  log(`Backend Health: ${results.backendHealth ? '✅' : '❌'}`, results.backendHealth ? 'green' : 'red');
  log(`Payment Endpoint: ${results.paymentEndpoint ? '✅' : '❌'}`, results.paymentEndpoint ? 'green' : 'red');
  log(`PayPal: ${results.paypal ? '✅' : '❌'}`, results.paypal ? 'green' : 'red');
  log(`Przelewy24: ${results.przelewy24 ? '✅' : '❌'}`, results.przelewy24 ? 'green' : 'red');
  log(`Verification: ${results.verification ? '✅' : '❌'}`, results.verification ? 'green' : 'red');
  
  if (results.przelewy24Methods) {
    log('\nMetody Przelewy24:', 'blue');
    Object.entries(results.przelewy24Methods).forEach(([method, success]) => {
      log(`  ${method}: ${success ? '✅' : '❌'}`, success ? 'green' : 'red');
    });
  }
  
  const successCount = Object.values(results).filter(r => r === true || (typeof r === 'object' && Object.values(r).some(v => v === true))).length;
  const totalTests = Object.keys(results).length;
  
  log(`\nWynik: ${successCount}/${totalTests} testów przeszło pomyślnie`, successCount === totalTests ? 'green' : 'yellow');
  
  if (successCount === totalTests) {
    log('🎉 WSZYSTKIE TESTY PRZESZŁY POMYŚLNIE!', 'green');
  } else {
    log('⚠️ NIEKTÓRE TESTY NIE PRZESZŁY - SPRAWDŹ KONFIGURACJĘ', 'yellow');
  }
}

// Uruchom testy
runAllTests().catch(error => {
  log(`💥 Błąd podczas uruchamiania testów: ${error.message}`, 'red');
  process.exit(1);
});





