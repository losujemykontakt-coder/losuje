const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testPayPalIntegration() {
  console.log('🧪 Test integracji PayPal po naprawach...\n');

  try {
    // Test 1: Sprawdź czy backend odpowiada
    console.log('1️⃣ Test połączenia z backendem...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Backend odpowiada:', healthResponse.status);
    console.log('📊 Status:', healthResponse.data);

    // Test 2: Test tworzenia zamówienia PayPal
    console.log('\n2️⃣ Test tworzenia zamówienia PayPal...');
    const createOrderResponse = await axios.post(`${API_BASE_URL}/api/paypal/create`, {
      amount: 9.99,
      currency: 'PLN',
      description: 'Test Plan Miesięczny - Lotek Generator',
      email: 'test@example.com',
      plan: 'monthly'
    });

    console.log('✅ Zamówienie utworzone pomyślnie!');
    console.log('📋 Order ID:', createOrderResponse.data.id);
    console.log('💰 Kwota:', createOrderResponse.data.amount);
    console.log('📅 Plan:', createOrderResponse.data.plan);
    console.log('📊 Status:', createOrderResponse.data.status);

    // Test 3: Sprawdź szczegóły zamówienia
    console.log('\n3️⃣ Test sprawdzania szczegółów zamówienia...');
    const orderDetailsResponse = await axios.get(`${API_BASE_URL}/api/paypal/order/${createOrderResponse.data.id}`);
    console.log('✅ Szczegóły zamówienia pobrane');
    console.log('📋 Status zamówienia:', orderDetailsResponse.data.status);

    console.log('\n🎉 Wszystkie testy PayPal przeszły pomyślnie!');
    console.log('✅ PayPal jest poprawnie skonfigurowany i działa.');

  } catch (error) {
    console.error('\n❌ Błąd podczas testowania PayPal:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Dane:', error.response.data);
    } else if (error.request) {
      console.error('🌐 Błąd połączenia:', error.message);
    } else {
      console.error('💥 Błąd:', error.message);
    }
    
    console.log('\n🔧 Sprawdź:');
    console.log('1. Czy backend jest uruchomiony na porcie 3001');
    console.log('2. Czy PayPal klucze w mcp.json są poprawne');
    console.log('3. Czy środowisko PayPal jest ustawione na "live"');
  }
}

// Uruchom test
testPayPalIntegration();

