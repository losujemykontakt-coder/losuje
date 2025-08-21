const axios = require('axios');

async function testFirebaseTalismans() {
  console.log('=== TEST FIREBASE TALISMANS ===');
  
  try {
    // Test 1: Sprawdź połączenie z backend
    console.log('1️⃣ Test połączenia z backend...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Backend działa:', healthResponse.status);
    
    // Test 2: Sprawdź Firebase Admin
    console.log('\n2️⃣ Test Firebase Admin...');
    const firebaseResponse = await axios.get('http://localhost:3001/api/firebase-test');
    console.log('✅ Firebase Admin:', firebaseResponse.data);
    
    // Test 3: Test rejestracji logowania
    console.log('\n3️⃣ Test rejestracji logowania...');
    const testUserId = 'test_user_' + Date.now();
    const loginResponse = await axios.post('http://localhost:3001/api/auth/register-login', {
      userId: testUserId
    });
    
    console.log('✅ Rejestracja logowania:', loginResponse.data);
    
    // Test 4: Test pobierania talizmanów
    console.log('\n4️⃣ Test pobierania talizmanów...');
    const talismansResponse = await axios.get(`http://localhost:3001/api/talismans/${testUserId}`);
    console.log('✅ Talizmany:', talismansResponse.data);
    
  } catch (error) {
    console.error('❌ Błąd testu:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFirebaseTalismans();
