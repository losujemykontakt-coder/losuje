const http = require('http');

function testBackend() {
  console.log('🔍 Testing backend connectivity...\n');
  
  // Test basic connectivity
  console.log('Testing basic connectivity...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/statistics/health',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Backend is running');
        try {
          const jsonData = JSON.parse(data);
          console.log('Response:', jsonData);
        } catch (e) {
          console.log('Response:', data);
        }
      } else {
        console.log('❌ Backend responded with error');
        console.log('Response:', data);
      }
      
      // Test statistics endpoint
      console.log('\n---\n');
      console.log('Testing statistics endpoint...');
      
      const statsOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/statistics/lotto',
        method: 'GET'
      };
      
      const statsReq = http.request(statsOptions, (statsRes) => {
        console.log(`Status: ${statsRes.statusCode}`);
        
        let statsData = '';
        statsRes.on('data', (chunk) => {
          statsData += chunk;
        });
        
        statsRes.on('end', () => {
          if (statsRes.statusCode === 200) {
            console.log('✅ Statistics endpoint working');
            try {
              const jsonStats = JSON.parse(statsData);
              console.log('Success:', jsonStats.success);
              console.log('Source:', jsonStats.source);
            } catch (e) {
              console.log('Response:', statsData);
            }
          } else {
            console.log('❌ Statistics endpoint error');
            console.log('Response:', statsData);
          }
        });
      });
      
      statsReq.on('error', (error) => {
        console.log('❌ Cannot connect to statistics endpoint:', error.message);
      });
      
      statsReq.end();
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Cannot connect to backend:', error.message);
  });
  
  req.end();
}

testBackend();
