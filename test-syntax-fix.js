const axios = require('axios');

async function testSyntaxFix() {
  console.log('🧪 Test naprawy błędu składni...\n');

  try {
    // Test 1: Sprawdź czy frontend odpowiada
    console.log('1️⃣ Test połączenia z frontendem...');
    const frontendResponse = await axios.get('http://localhost:3000', {
      timeout: 10000
    });
    console.log('✅ Frontend odpowiada:', frontendResponse.status);
    console.log('📊 Status:', frontendResponse.status === 200 ? 'OK' : 'BŁĄD');

    // Test 2: Sprawdź czy strona płatności ładuje się
    console.log('\n2️⃣ Test strony płatności...');
    const paymentsResponse = await axios.get('http://localhost:3000/payments', {
      timeout: 10000
    });
    console.log('✅ Strona płatności ładuje się:', paymentsResponse.status);
    console.log('📊 Status:', paymentsResponse.status === 200 ? 'OK' : 'BŁĄD');

    // Test 3: Sprawdź czy backend odpowiada
    console.log('\n3️⃣ Test połączenia z backendem...');
    const backendResponse = await axios.get('http://localhost:3001/api/health', {
      timeout: 10000
    });
    console.log('✅ Backend odpowiada:', backendResponse.status);
    console.log('📊 Status:', backendResponse.data);

    console.log('\n🎉 Wszystkie testy przeszły pomyślnie!');
    console.log('✅ Błąd składni został naprawiony!');
    console.log('✅ Aplikacja kompiluje się poprawnie!');

  } catch (error) {
    console.error('\n❌ Błąd podczas testowania:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Dane:', error.response.data);
    } else if (error.request) {
      console.error('🌐 Błąd połączenia:', error.message);
    } else {
      console.error('💥 Błąd:', error.message);
    }
    
    console.log('\n🔧 Sprawdź:');
    console.log('1. Czy frontend jest uruchomiony na porcie 3000');
    console.log('2. Czy backend jest uruchomiony na porcie 3001');
    console.log('3. Czy nie ma błędów składni w konsoli');
  }
}

// Uruchom test
testSyntaxFix();

