const axios = require('axios');

async function testPayPalLive() {
  console.log('=== TEST PAYPAL LIVE ===');
  
  try {
    // Test 1: Sprawdź konfigurację
    console.log('1️⃣ Sprawdzanie konfiguracji PayPal...');
    const config = require('./backend/config');
    console.log('✅ Environment:', config.PAYPAL.ENVIRONMENT);
    console.log('✅ Client ID:', config.PAYPAL.CLIENT_ID ? 'OK' : 'BRAK');
    console.log('✅ Client Secret:', config.PAYPAL.CLIENT_SECRET ? 'OK' : 'BRAK');
    
    // Test 2: Sprawdź endpoint konfiguracji
    console.log('\n2️⃣ Test endpointu konfiguracji...');
    const configResponse = await axios.get('http://localhost:3001/api/paypal/config');
    console.log('✅ Konfiguracja z serwera:', configResponse.data);
    
    // Test 3: Test tworzenia zamówienia
    console.log('\n3️⃣ Test tworzenia zamówienia PayPal...');
    const orderResponse = await axios.post('http://localhost:3001/api/paypal/create-order', {
      amount: 9.99,
      currency: 'PLN',
      description: 'Test Plan Premium - LIVE'
    });
    
    console.log('✅ Odpowiedź serwera:', orderResponse.data);
    
    if (orderResponse.data.success) {
      console.log('🎉 PayPal LIVE działa poprawnie!');
      console.log('📋 Order ID:', orderResponse.data.orderId);
      console.log('🔗 Approval URL:', orderResponse.data.approvalUrl);
    } else {
      console.log('❌ Błąd:', orderResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Błąd testu:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testPayPalLive();
