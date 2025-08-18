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

// Funkcja do znalezienia Firebase UID dla emaila
async function findUserByEmail(email) {
  console.log('🔍 Szukam użytkownika z emailem:', email);
  
  // Najpierw sprawdźmy czy backend działa
  const testOptions = {
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
    const testResponse = await makeRequest(testOptions);
    console.log('✅ Backend działa:', testResponse.data);
  } catch (error) {
    console.error('❌ Backend nie odpowiada:', error.message);
    return null;
  }
  
  // Teraz spróbujmy znaleźć użytkownika przez Firebase Auth
  // Musimy użyć Firebase Admin SDK do wyszukania użytkownika po emailu
  console.log('🔍 Używam Firebase Admin do wyszukania użytkownika...');
  
  try {
    const { auth } = require('./backend/firebase-admin');
    
    if (!auth) {
      console.error('❌ Firebase Auth nie jest dostępny');
      return null;
    }
    
    const userRecord = await auth.getUserByEmail(email);
    console.log('✅ Znaleziono użytkownika:', userRecord.uid);
    return userRecord.uid;
  } catch (error) {
    console.error('❌ Błąd wyszukiwania użytkownika:', error.message);
    return null;
  }
}

// Funkcja do przyznania wszystkich talizmanów
async function grantAllTalismans(firebaseUid) {
  console.log('🎁 Przyznaję wszystkie talizmany dla UID:', firebaseUid);
  
  const talismanIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  for (const talismanId of talismanIds) {
    try {
      console.log(`🔍 Przyznaję talizman ID: ${talismanId}`);
      
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/talismans/grant',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      };
      
      const data = {
        userId: firebaseUid,
        talismanId: talismanId
      };
      
      const response = await makeRequest(options, data);
      console.log(`✅ Talizman ${talismanId}:`, response.data);
      
      // Krótka przerwa między requestami
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Błąd przyznawania talizmanu ${talismanId}:`, error.message);
    }
  }
}

// Funkcja do aktywacji wszystkich talizmanów
async function activateAllTalismans(firebaseUid) {
  console.log('⚡ Aktywuję wszystkie talizmany dla UID:', firebaseUid);
  
  const talismanIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  for (const talismanId of talismanIds) {
    try {
      console.log(`🔍 Aktywuję talizman ID: ${talismanId}`);
      
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/talismans/toggle',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      };
      
      const data = {
        userId: firebaseUid,
        talismanId: talismanId,
        active: true
      };
      
      const response = await makeRequest(options, data);
      console.log(`✅ Talizman ${talismanId} aktywowany:`, response.data);
      
      // Krótka przerwa między requestami
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Błąd aktywacji talizmanu ${talismanId}:`, error.message);
    }
  }
}

// Funkcja do sprawdzenia statusu talizmanów
async function checkTalismansStatus(firebaseUid) {
  console.log('📊 Sprawdzam status talizmanów dla UID:', firebaseUid);
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/talismans/${firebaseUid}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    };
    
    const response = await makeRequest(options);
    console.log('📊 Status talizmanów:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Błąd sprawdzania statusu:', error.message);
    return null;
  }
}

// Główna funkcja testowa
async function testTalismansSystem() {
  console.log('🚀 Rozpoczynam test systemu talizmanów...');
  
  const email = 'michaljedynasty@gmail.com';
  
  // Krok 1: Znajdź użytkownika
  const firebaseUid = await findUserByEmail(email);
  
  if (!firebaseUid) {
    console.error('❌ Nie udało się znaleźć użytkownika');
    return;
  }
  
  console.log('✅ Znaleziono użytkownika:', firebaseUid);
  
  // Krok 2: Sprawdź początkowy status
  console.log('\n📊 Sprawdzam początkowy status...');
  await checkTalismansStatus(firebaseUid);
  
  // Krok 3: Przyznaj wszystkie talizmany
  console.log('\n🎁 Przyznaję wszystkie talizmany...');
  await grantAllTalismans(firebaseUid);
  
  // Krok 4: Sprawdź status po przyznaniu
  console.log('\n📊 Sprawdzam status po przyznaniu...');
  await checkTalismansStatus(firebaseUid);
  
  // Krok 5: Aktywuj wszystkie talizmany
  console.log('\n⚡ Aktywuję wszystkie talizmany...');
  await activateAllTalismans(firebaseUid);
  
  // Krok 6: Sprawdź końcowy status
  console.log('\n📊 Sprawdzam końcowy status...');
  await checkTalismansStatus(firebaseUid);
  
  console.log('\n✅ Test zakończony!');
}

// Uruchom test
testTalismansSystem().catch(console.error);

