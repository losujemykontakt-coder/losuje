const axios = require('axios');

// Test API connectivity
async function testAPIConnectivity() {
  console.log('🔍 Testing lotto.pl API connectivity...\n');
  
  const LOTTO_API_CONFIG = {
    baseURL: 'https://developers.lotto.pl',
    apiKey: '1r80oyg4UZoTelEKhja7S8zpnPPsanpYtKLyFcDpOFk=',
    timeout: 10000
  };

  const endpoints = [
    '/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=Lotto',
    '/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=MiniLotto',
    '/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=EuroJackpot'
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing endpoint: ${endpoint}`);
    
    try {
      const response = await axios({
        method: 'GET',
        url: `${LOTTO_API_CONFIG.baseURL}${endpoint}`,
        headers: {
          'secret': LOTTO_API_CONFIG.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'LotekApp/1.0'
        },
        params: {
          days: 10,
          format: 'json'
        },
        timeout: LOTTO_API_CONFIG.timeout
      });

      console.log(`✅ Success: Status ${response.status}`);
      console.log(`   Data received: ${response.data ? 'Yes' : 'No'}`);
      if (response.data) {
        console.log(`   Data type: ${typeof response.data}`);
        if (typeof response.data === 'object') {
          console.log(`   Keys: ${Object.keys(response.data).join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Status Text: ${error.response.statusText}`);
      }
    }
    
    console.log('');
  }

  // Test without authentication
  console.log('Testing without authentication...');
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://developers.lotto.pl/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=Lotto',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LotekApp/1.0'
      },
      params: {
        days: 10,
        format: 'json'
      },
      timeout: 10000
    });

    console.log(`✅ Success without auth: Status ${response.status}`);
  } catch (error) {
    console.log(`❌ Error without auth: ${error.message}`);
  }
}

// Run the test
testAPIConnectivity().catch(console.error);


