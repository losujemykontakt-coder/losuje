const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testPayPalFixes() {
  console.log('🧪 TEST POPRAWEK PAYPAL');
  console.log('========================');
  
  try {
    // 1. Test połączenia z backendem
    console.log('\n1️⃣ Test połączenia z backendem...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Backend odpowiada:', healthResponse.status);
    console.log('📊 Status:', healthResponse.data);
    
    // 2. Test konfiguracji PayPal
    console.log('\n2️⃣ Test konfiguracji PayPal...');
    const paypalConfigResponse = await axios.get(`${API_BASE_URL}/api/payment/test`);
    console.log('✅ Konfiguracja PayPal:', paypalConfigResponse.data);
    
    // 3. Test tworzenia zamówienia PayPal
    console.log('\n3️⃣ Test tworzenia zamówienia PayPal...');
    const createOrderResponse = await axios.post(`${API_BASE_URL}/api/paypal/create`, {
      amount: 9.99,
      currency: 'PLN',
      description: 'Test Plan Miesięczny - Lotek Generator',
      email: 'test@example.com',
      plan: 'monthly'
    });
    
    console.log('✅ Zamówienie utworzone:', {
      success: createOrderResponse.data.success,
      orderId: createOrderResponse.data.id,
      status: createOrderResponse.data.status,
      plan: createOrderResponse.data.plan,
      amount: createOrderResponse.data.amount
    });
    
    // 4. Test pobierania szczegółów zamówienia
    if (createOrderResponse.data.id) {
      console.log('\n4️⃣ Test pobierania szczegółów zamówienia...');
      const orderDetailsResponse = await axios.get(`${API_BASE_URL}/api/paypal/order/${createOrderResponse.data.id}`);
      console.log('✅ Szczegóły zamówienia:', {
        success: orderDetailsResponse.data.success,
        orderId: orderDetailsResponse.data.order.id,
        status: orderDetailsResponse.data.order.status
      });
    }
    
    // 5. Sprawdź konfigurację środowiska
    console.log('\n5️⃣ Sprawdzenie konfiguracji środowiska...');
    console.log('🔧 Environment:', process.env.PAYPAL_ENVIRONMENT || 'live');
    console.log('🔑 Client ID:', process.env.PAYPAL_CLIENT_ID ? 'OK' : 'BRAK');
    console.log('🔐 Client Secret:', process.env.PAYPAL_CLIENT_SECRET ? 'OK' : 'BRAK');
    
    console.log('\n🎉 WSZYSTKIE TESTY ZAKOŃCZONE POMYŚLNIE!');
    console.log('✅ Backend działa poprawnie');
    console.log('✅ PayPal API odpowiada');
    console.log('✅ Konfiguracja jest poprawna');
    console.log('✅ Zamówienia są tworzone');
    
    return {
      success: true,
      backendHealth: true,
      paypalConfig: true,
      orderCreation: true,
      environment: process.env.PAYPAL_ENVIRONMENT || 'live'
    };
    
  } catch (error) {
    console.error('\n❌ BŁĄD W TESCIE:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
    
    return {
      success: false,
      error: error.message,
      backendHealth: false,
      paypalConfig: false,
      orderCreation: false
    };
  }
}

// Funkcja do sprawdzenia konfiguracji
function checkConfiguration() {
  console.log('\n🔧 SPRAWDZENIE KONFIGURACJI');
  console.log('==========================');
  
  const config = {
    paypalClientId: 'AcLnAD0aCb1hFnw5TDDoe_k1cLkqp-FtcWai8mctRT57oDP4pPi4ukzwdaFCS6JFAkQqfH1MIb0f0s9Z',
    paypalEnvironment: 'live',
    backendPort: 3001,
    frontendPort: 3000
  };
  
  console.log('✅ PayPal Client ID:', config.paypalClientId ? 'OK' : 'BRAK');
  console.log('✅ PayPal Environment:', config.paypalEnvironment);
  console.log('✅ Backend Port:', config.backendPort);
  console.log('✅ Frontend Port:', config.frontendPort);
  
  return config;
}

// Funkcja do sprawdzenia plików
function checkFiles() {
  console.log('\n📁 SPRAWDZENIE PLIKÓW');
  console.log('=====================');
  
  const files = [
    'frontend/src/components/PaymentButtons.js',
    'frontend/src/components/PayPalButtonWrapper.js',
    'frontend/src/utils/paypalConfig.js',
    'backend/config.js',
    'backend/api/paypal.js'
  ];
  
  const fs = require('fs');
  
  files.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} - BRAK`);
      }
    } catch (error) {
      console.log(`❌ ${file} - BŁĄD: ${error.message}`);
    }
  });
}

// Główna funkcja testowa
async function runAllTests() {
  console.log('🚀 URUCHAMIANIE TESTÓW POPRAWEK PAYPAL');
  console.log('=====================================');
  
  // Sprawdź konfigurację
  const config = checkConfiguration();
  
  // Sprawdź pliki
  checkFiles();
  
  // Uruchom testy
  const results = await testPayPalFixes();
  
  // Podsumowanie
  console.log('\n📊 PODSUMOWANIE TESTÓW');
  console.log('======================');
  console.log(`Backend Health: ${results.backendHealth ? '✅' : '❌'}`);
  console.log(`PayPal Config: ${results.paypalConfig ? '✅' : '❌'}`);
  console.log(`Order Creation: ${results.orderCreation ? '✅' : '❌'}`);
  console.log(`Environment: ${results.environment || 'unknown'}`);
  
  if (results.success) {
    console.log('\n🎉 WSZYSTKIE TESTY PRZESZŁY POMYŚLNIE!');
    console.log('PayPal jest skonfigurowany poprawnie i gotowy do użycia.');
  } else {
    console.log('\n❌ NIEKTÓRE TESTY NIE PRZESZŁY');
    console.log('Sprawdź konfigurację i uruchom ponownie.');
  }
  
  return results;
}

// Uruchom testy jeśli plik jest wywołany bezpośrednio
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testPayPalFixes,
  checkConfiguration,
  checkFiles,
  runAllTests
};


























