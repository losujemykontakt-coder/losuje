const http = require('http');

// Funkcja do wysyłania requestów HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test 1: Sprawdź czy backend działa
async function testBackend() {
  console.log('🔍 Test 1: Sprawdzam czy backend działa...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/test',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 5000
  };
  
  try {
    const response = await makeRequest(options);
    console.log('✅ Backend działa:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend nie odpowiada:', error.message);
    return false;
  }
}

// Test 2: Sprawdź Firebase Admin
async function testFirebaseAdmin() {
  console.log('\n🔍 Test 2: Sprawdzam Firebase Admin...');
  
  try {
    const { auth, db } = require('./backend/firebase-admin');
    
    if (!auth || !db) {
      console.error('❌ Firebase Admin nie jest dostępny');
      return false;
    }
    
    console.log('✅ Firebase Admin jest dostępny');
    return true;
  } catch (error) {
    console.error('❌ Błąd Firebase Admin:', error.message);
    return false;
  }
}

// Test 3: Spróbuj znaleźć użytkownika
async function testFindUser() {
  console.log('\n🔍 Test 3: Szukam użytkownika michaljedynasty@gmail.com...');
  
  try {
    const { auth } = require('./backend/firebase-admin');
    
    if (!auth) {
      console.error('❌ Firebase Auth nie jest dostępny');
      return null;
    }
    
    const userRecord = await auth.getUserByEmail('michaljedynasty@gmail.com');
    console.log('✅ Znaleziono użytkownika:', userRecord.uid);
    console.log('   Email:', userRecord.email);
    console.log('   Display Name:', userRecord.displayName);
    return userRecord.uid;
  } catch (error) {
    console.error('❌ Błąd wyszukiwania użytkownika:', error.message);
    return null;
  }
}

// Test 4: Sprawdź endpoint talizmanów z przykładowym UID
async function testTalismansEndpoint() {
  console.log('\n🔍 Test 4: Testuję endpoint talizmanów...');
  
  // Użyj przykładowego UID (możemy go zmienić na prawdziwy)
  const testUid = 'nH0fsvS8EnUXigwG8Lg1abdg1iU2';
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/talismans/${testUid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000
  };
  
  try {
    const response = await makeRequest(options);
    console.log('✅ Endpoint talizmanów działa:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Błąd endpointu talizmanów:', error.message);
    return false;
  }
}

// Główna funkcja testowa
async function runTests() {
  console.log('🚀 Rozpoczynam testy systemu...\n');
  
  // Test 1: Backend
  const backendOk = await testBackend();
  if (!backendOk) {
    console.log('❌ Backend nie działa - przerywam testy');
    return;
  }
  
  // Test 2: Firebase Admin
  const firebaseOk = await testFirebaseAdmin();
  if (!firebaseOk) {
    console.log('❌ Firebase Admin nie działa - przerywam testy');
    return;
  }
  
  // Test 3: Znajdź użytkownika
  const userUid = await testFindUser();
  if (!userUid) {
    console.log('❌ Nie udało się znaleźć użytkownika - przerywam testy');
    return;
  }
  
  // Test 4: Endpoint talizmanów z prawdziwym UID
  console.log('\n🔍 Test 4a: Testuję endpoint talizmanów z prawdziwym UID...');
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/talismans/${userUid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000
  };
  
  try {
    const response = await makeRequest(options);
    console.log('✅ Endpoint talizmanów z prawdziwym UID działa:', response.data);
  } catch (error) {
    console.error('❌ Błąd endpointu talizmanów z prawdziwym UID:', error.message);
  }
  
  console.log('\n✅ Wszystkie testy zakończone!');
  console.log('🎯 Użytkownik do testów:', userUid);
}

// Uruchom testy
runTests().catch(console.error);






