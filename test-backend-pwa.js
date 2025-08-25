const https = require('https');

console.log('🔍 Testowanie backendu dla PWA...');

// Test 1: Sprawdź czy backend odpowiada
const testBackend = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'losuje.pl',
      port: 443,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Origin': 'https://losuje-generator.pl',
        'User-Agent': 'PWA-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Backend odpowiada:', res.statusCode);
        console.log('📄 Response:', data);
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => {
      console.log('❌ Błąd połączenia z backendem:', error.message);
      reject(error);
    });

    req.end();
  });
};

// Test 2: Sprawdź CORS
const testCORS = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'losuje.pl',
      port: 443,
      path: '/api/health',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://losuje-generator.pl',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    const req = https.request(options, (res) => {
      console.log('✅ CORS preflight:', res.statusCode);
      console.log('🔒 CORS headers:', res.headers['access-control-allow-origin']);
      resolve({ status: res.statusCode, cors: res.headers['access-control-allow-origin'] });
    });

    req.on('error', (error) => {
      console.log('❌ Błąd CORS:', error.message);
      reject(error);
    });

    req.end();
  });
};

// Uruchom testy
async function runTests() {
  try {
    console.log('🚀 Uruchamianie testów...\n');
    
    await testBackend();
    console.log('');
    await testCORS();
    
    console.log('\n✅ Testy zakończone!');
  } catch (error) {
    console.log('\n❌ Testy nie powiodły się:', error.message);
  }
}

runTests();
