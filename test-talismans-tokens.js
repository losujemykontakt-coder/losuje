const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testAddTokens() {
  try {
    console.log('🧪 Testowanie mechanizmu dodawania testowych żetonów...');
    
    // Test 1: Sprawdź czy backend działa
    console.log('\n1️⃣ Sprawdzanie czy backend działa...');
    const testResponse = await axios.get(`${API_BASE_URL}/api/test`);
    console.log('✅ Backend działa:', testResponse.data);
    
    // Test 2: Dodaj testowe żetony dla przykładowego użytkownika
    console.log('\n2️⃣ Dodawanie testowych żetonów...');
    const testUserId = 'test-user-123';
    const tokensToAdd = 50;
    
    const addTokensResponse = await axios.post(`${API_BASE_URL}/api/talismans/add-test-tokens`, {
      userId: testUserId,
      tokensToAdd: tokensToAdd
    });
    
    console.log('✅ Żetony dodane:', addTokensResponse.data);
    
    // Test 3: Sprawdź dane talizmanów użytkownika
    console.log('\n3️⃣ Sprawdzanie danych talizmanów...');
    const talismansResponse = await axios.get(`${API_BASE_URL}/api/talismans/${testUserId}`);
    console.log('✅ Dane talizmanów:', talismansResponse.data);
    
    console.log('\n🎉 Wszystkie testy zakończone sukcesem!');
    
  } catch (error) {
    console.error('❌ Błąd podczas testowania:', error.response?.data || error.message);
  }
}

testAddTokens();

