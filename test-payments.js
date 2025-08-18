const axios = require('axios');

// Test płatności PayPal
async function testPayPalPayment() {
  console.log('=== TEST PŁATNOŚCI PAYPAL ===');
  
  try {
    const response = await axios.post('http://localhost:3001/api/paypal/create-order', {
      amount: 9.99,
      currency: 'PLN',
      description: 'Plan Premium - Lotek'
    });
    
    console.log('Status:', response.status);
    console.log('Odpowiedź:', response.data);
    
    if (response.data.success) {
      console.log('✅ PayPal - zamówienie utworzone pomyślnie');
      console.log('URL zatwierdzenia:', response.data.approvalUrl);
    } else {
      console.log('❌ PayPal - błąd:', response.data.error);
    }
  } catch (error) {
    console.error('❌ PayPal - błąd połączenia:', error.message);
  }
}

// Test płatności Przelewy24
async function testPrzelewy24Payment() {
  console.log('\n=== TEST PŁATNOŚCI PRZELEWY24 ===');
  
  try {
    const response = await axios.post('http://localhost:3001/api/przelewy24/create-payment', {
      method: 'blik',
      amount: 9.99,
      currency: 'PLN',
      description: 'Plan Premium - Lotek',
      email: 'test@example.com'
    });
    
    console.log('Status:', response.status);
    console.log('Odpowiedź:', response.data);
    
    if (response.data.success) {
      console.log('✅ Przelewy24 - płatność utworzona pomyślnie');
      console.log('URL przekierowania:', response.data.redirectUrl);
    } else {
      console.log('❌ Przelewy24 - błąd:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Przelewy24 - błąd połączenia:', error.message);
  }
}

// Uruchom testy
async function runTests() {
  console.log('🚀 Uruchamianie testów płatności...\n');
  
  await testPayPalPayment();
  await testPrzelewy24Payment();
  
  console.log('\n✅ Testy zakończone');
}

runTests().catch(console.error);
