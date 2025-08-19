const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/ai-ultra-pro';

async function testAIUltraProAPI() {
  console.log('🧪 Testowanie AI Lotto Generator Ultra Pro API...\n');

  try {
    // Test 1: Sprawdzenie statusu API
    console.log('1️⃣ Sprawdzanie statusu API...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Status API:', healthResponse.data);
    console.log('');

    // Test 2: Generowanie liczb dla Lotto
    console.log('2️⃣ Generowanie liczb dla Lotto...');
    const generateResponse = await axios.get(`${API_BASE_URL}/generate?game=lotto`);
    console.log('✅ Wygenerowane liczby:', generateResponse.data.data.numbers);
    console.log('✅ Pewność AI:', generateResponse.data.data.confidence);
    console.log('');

    // Test 3: Generowanie liczb dla Mini Lotto
    console.log('3️⃣ Generowanie liczb dla Mini Lotto...');
    const miniLottoResponse = await axios.get(`${API_BASE_URL}/generate?game=miniLotto`);
    console.log('✅ Wygenerowane liczby:', miniLottoResponse.data.data.numbers);
    console.log('✅ Pewność AI:', miniLottoResponse.data.data.confidence);
    console.log('');

    // Test 4: Pobieranie statystyk
    console.log('4️⃣ Pobieranie statystyk dla Lotto...');
    const statsResponse = await axios.get(`${API_BASE_URL}/stats?game=lotto`);
    console.log('✅ Statystyki pobrane pomyślnie');
    console.log('   - Hot numbers:', statsResponse.data.data.hotCold.hotNumbers.length);
    console.log('   - Cold numbers:', statsResponse.data.data.hotCold.coldNumbers.length);
    console.log('   - Benford distribution:', Object.keys(statsResponse.data.data.benford.benfordDistribution).length);
    console.log('');

    // Test 5: Test wydajności (czas generowania)
    console.log('5️⃣ Test wydajności...');
    const startTime = Date.now();
    await axios.get(`${API_BASE_URL}/generate?game=lotto`);
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ Czas generowania: ${duration}ms`);
    console.log('');

    console.log('🎉 Wszystkie testy zakończone pomyślnie!');
    console.log('🚀 AI Lotto Generator Ultra Pro działa poprawnie!');

  } catch (error) {
    console.error('❌ Błąd podczas testowania:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dane:', error.response.data);
    }
    
    console.log('');
    console.log('🔧 Rozwiązywanie problemów:');
    console.log('1. Upewnij się, że backend jest uruchomiony (npm start w katalogu backend)');
    console.log('2. Sprawdź czy port 5000 jest dostępny');
    console.log('3. Sprawdź logi serwera pod kątem błędów');
  }
}

// Uruchom testy
testAIUltraProAPI();























