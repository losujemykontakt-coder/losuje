const http = require('http');

function testTalismansEndpoint() {
  const userId = 'nH0fsvS8EnUXigwG8Lg1abdg1iU2';
  const url = `http://localhost:3001/api/talismans/${userId}`;
  
  console.log('🔍 Testuję endpoint talizmanów z timeout...');
  console.log('🔍 URL:', url);
  console.log('🔍 User ID:', userId);
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/talismans/${userId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000 // 10 sekund timeout
  };
  
  console.log('🔍 Wysyłam request...');
  
  const req = http.request(options, (res) => {
    console.log('🔍 Response status:', res.statusCode);
    console.log('🔍 Response headers:', res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('🔍 Response data:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('🔍 Parsed JSON:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('🔍 Raw response (not JSON):', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Błąd testu:', error);
  });
  
  req.on('timeout', () => {
    console.error('❌ Timeout - request trwał dłużej niż 10 sekund');
    req.destroy();
  });
  
  req.end();
}

testTalismansEndpoint();






