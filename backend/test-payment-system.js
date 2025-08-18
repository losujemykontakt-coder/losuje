const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'test@example.com';

// Kolory dla logów
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testBackendHealth() {
  log('\n🔍 Test 1: Sprawdzanie zdrowia backendu', 'blue');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    log('✅ Backend odpowiada poprawnie', 'green');
    log(`📊 Status: ${response.data.status}`, 'cyan');
    log(`⏰ Timestamp: ${response.data.timestamp}`, 'cyan');
    return true;
  } catch (error) {
    log('❌ Backend nie odpowiada', 'red');
    log(`Błąd: ${error.message}`, 'red');
    return false;
  }
}

async function testPaymentEndpoint() {
  log('\n🔍 Test 2: Test endpoint płatności', 'blue');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/test`, {
      test: true,
      timestamp: new Date().toISOString(),
      userEmail: TEST_EMAIL,
      paymentMethod: 'paypal',
      amount: 9.99
    });
    
    log('✅ Endpoint płatności działa', 'green');
    log(`📊 Success: ${response.data.success}`, 'cyan');
    log(`🔧 Konfiguracja Przelewy24: ${JSON.stringify(response.data.przelewy24Config, null, 2)}`, 'cyan');
    log(`🔧 Status serwisów: ${JSON.stringify(response.data.servicesStatus, null, 2)}`, 'cyan');
    return true;
  } catch (error) {
    log('❌ Endpoint płatności nie działa', 'red');
    log(`Błąd: ${error.message}`, 'red');
    return false;
  }
}

async function testPayPal() {
  log('\n🔍 Test 3: Test integracji PayPal', 'blue');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/paypal/create-order`, {
      amount: 9.99,
      currency: 'PLN',
      description: 'Test Plan Premium',
      email: TEST_EMAIL,
      sessionId: `test_session_${Date.now()}`
    });
    
    log('✅ PayPal - zamówienie utworzone', 'green');
    log(`📊 Order ID: ${response.data.orderId}`, 'cyan');
    log(`🔗 Approval URL: ${response.data.approvalUrl}`, 'cyan');
    return true;
  } catch (error) {
    log('❌ PayPal - błąd tworzenia zamówienia', 'red');
    log(`Błąd: ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

async function testPrzelewy24() {
  log('\n🔍 Test 4: Test integracji Przelewy24', 'blue');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/przelewy24/create-payment`, {
      amount: 9.99,
      currency: 'PLN',
      description: 'Test Plan Premium',
      email: TEST_EMAIL,
      method: 'card',
      sessionId: `test_session_${Date.now()}`
    });
    
    log('✅ Przelewy24 - płatność utworzona', 'green');
    log(`📊 Session ID: ${response.data.sessionId}`, 'cyan');
    log(`🔗 Redirect URL: ${response.data.redirectUrl}`, 'cyan');
    return true;
  } catch (error) {
    log('❌ Przelewy24 - błąd tworzenia płatności', 'red');
    log(`Błąd: ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

async function testPrzelewy24Methods() {
  log('\n🔍 Test 5: Test metod Przelewy24 (BLIK, karta, przelew)', 'blue');
  
  const methods = ['blik', 'card', 'transfer'];
  let successCount = 0;
  
  for (const method of methods) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/przelewy24/create-payment`, {
        amount: 9.99,
        currency: 'PLN',
        description: `Test ${method.toUpperCase()}`,
        email: TEST_EMAIL,
        method: method,
        sessionId: `test_${method}_${Date.now()}`
      });
      
      log(`✅ ${method.toUpperCase()} - OK`, 'green');
      successCount++;
    } catch (error) {
      log(`❌ ${method.toUpperCase()} - błąd: ${error.response?.data?.error || error.message}`, 'red');
    }
  }
  
  log(`📊 Wynik: ${successCount}/${methods.length} metod działa`, successCount === methods.length ? 'green' : 'yellow');
  return successCount === methods.length;
}

async function testPaymentVerification() {
  log('\n🔍 Test 6: Test weryfikacji płatności', 'blue');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/przelewy24/verify`, {
      sessionId: `test_verify_${Date.now()}`,
      amount: 9.99,
      currency: 'PLN'
    });
    
    log('✅ Weryfikacja płatności działa', 'green');
    log(`📊 Verified: ${response.data.verified}`, 'cyan');
    return true;
  } catch (error) {
    log('❌ Weryfikacja płatności nie działa', 'red');
    log(`Błąd: ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🚀 ROZPOCZYNAM TESTY SYSTEMU PŁATNOŚCI', 'blue');
  log('==================================================', 'blue');
  
  const results = {
    backendHealth: await testBackendHealth(),
    paymentEndpoint: await testPaymentEndpoint(),
    paypal: await testPayPal(),
    przelewy24: await testPrzelewy24(),
    przelewy24Methods: await testPrzelewy24Methods(),
    paymentVerification: await testPaymentVerification()
  };
  
  log('\n📊 PODSUMOWANIE TESTÓW', 'magenta');
  log('==============================', 'magenta');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    log(`${status} ${test}: ${result ? 'PASS' : 'FAIL'}`, color);
  });
  
  log(`\n🎯 WYNIK KOŃCOWY: ${passedTests}/${totalTests} testów przeszło`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 WSZYSTKIE TESTY PRZESZŁY! System płatności jest gotowy!', 'green');
  } else {
    log('⚠️  NIEKTÓRE TESTY NIE PRZESZŁY. Sprawdź konfigurację.', 'yellow');
  }
  
  return passedTests === totalTests;
}

// Uruchom testy
runAllTests().catch(error => {
  log(`💥 Błąd podczas uruchamiania testów: ${error.message}`, 'red');
  process.exit(1);
});
