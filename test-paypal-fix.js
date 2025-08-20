const axios = require('axios');

// Test napraw PayPal
async function testPayPalFix() {
  console.log('=== TEST NAPRAW PAYPAL ===');
  
  const API_BASE_URL = 'http://localhost:3001/api';
  
  try {
    // Test 1: Sprawdź czy backend odpowiada
    console.log('\n1️⃣ Test połączenia z backendem...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend odpowiada:', healthResponse.data);
    
    // Test 2: Sprawdź konfigurację PayPal
    console.log('\n2️⃣ Test konfiguracji PayPal...');
    const configResponse = await axios.get(`${API_BASE_URL}/paypal/config`);
    console.log('✅ Konfiguracja PayPal:', configResponse.data);
    
    // Test 3: Test tworzenia zamówienia PayPal
    console.log('\n3️⃣ Test tworzenia zamówienia PayPal...');
    const orderResponse = await axios.post(`${API_BASE_URL}/paypal/create-order`, {
      amount: 9.99,
      currency: 'PLN',
      description: 'Test Plan Premium'
    });
    
    console.log('✅ Zamówienie utworzone:', orderResponse.data);
    
    if (orderResponse.data.success) {
      console.log('🎉 Wszystkie testy PayPal przeszły pomyślnie!');
    } else {
      console.log('❌ Błąd tworzenia zamówienia:', orderResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Błąd testu:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Uruchom test
testPayPalFix();

