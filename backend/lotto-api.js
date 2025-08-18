const axios = require('axios');

// Konfiguracja API lotto.pl
const LOTTO_API_CONFIG = {
  baseURL: 'https://developers.lotto.pl',
  apiKey: '1r80oyg4UZoTelEKhja7S8zpnPPsanpYtKLyFcDpOFk=',
  timeout: 10000
};

// Mapowanie gier na endpointy API
const GAME_ENDPOINTS = {
  lotto: '/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=Lotto',
  miniLotto: '/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=MiniLotto',
  multiMulti: '/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=MultiMulti',
  eurojackpot: '/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=EuroJackpot',
  kaskada: '/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=Kaskada',
  keno: '/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=Keno'
};

// Funkcja do pobierania wyników przez API lotto.pl
async function fetchLottoResultsAPI(gameType, daysBack = 50) {
  console.log(`🔄 Próbuję pobrać dane przez API lotto.pl dla ${gameType}...`);
  
  const endpoint = GAME_ENDPOINTS[gameType];
  if (!endpoint) {
    console.log(`❌ Brak endpointu dla gry: ${gameType}`);
    throw new Error(`Nieobsługiwana gra: ${gameType}`);
  }

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
        days: daysBack,
        format: 'json'
      },
      timeout: LOTTO_API_CONFIG.timeout
    });

    console.log(`✅ Pobrano dane przez API dla ${gameType}:`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ Błąd API dla ${gameType}:`, error.message);
    
    // Jeśli to błąd 401 (unauthorized), spróbuj bez autoryzacji
    if (error.response && error.response.status === 401) {
      console.log(`🔄 Próbuję bez autoryzacji dla ${gameType}...`);
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
            days: daysBack,
            format: 'json'
          },
          timeout: LOTTO_API_CONFIG.timeout
        });

        console.log(`✅ Pobrano dane bez autoryzacji dla ${gameType}:`, response.data);
        return response.data;
      } catch (retryError) {
        console.log(`❌ Błąd retry dla ${gameType}:`, retryError.message);
        throw retryError;
      }
    }
    
    throw error;
  }
}

// Funkcja do pobierania statystyk przez API
async function fetchLottoStatsAPI(gameType) {
  console.log(`🔄 Próbuję pobrać statystyki przez API lotto.pl dla ${gameType}...`);
  
  try {
    const response = await axios({
      method: 'GET',
      url: `${LOTTO_API_CONFIG.baseURL}/statystyki/${gameType}`,
      headers: {
        'secret': LOTTO_API_CONFIG.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'LotekApp/1.0'
      },
      timeout: LOTTO_API_CONFIG.timeout
    });

    console.log(`✅ Pobrano statystyki przez API dla ${gameType}:`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ Błąd API statystyk dla ${gameType}:`, error.message);
    
    // Jeśli to błąd 401 (unauthorized), spróbuj bez autoryzacji
    if (error.response && error.response.status === 401) {
      console.log(`🔄 Próbuję statystyki bez autoryzacji dla ${gameType}...`);
             try {
         const response = await axios({
           method: 'GET',
           url: `${LOTTO_API_CONFIG.baseURL}/statystyki/${gameType}`,
           headers: {
             'secret': LOTTO_API_CONFIG.apiKey,
             'Content-Type': 'application/json',
             'User-Agent': 'LotekApp/1.0'
           },
          timeout: LOTTO_API_CONFIG.timeout
        });

        console.log(`✅ Pobrano statystyki bez autoryzacji dla ${gameType}:`, response.data);
        return response.data;
      } catch (retryError) {
        console.log(`❌ Błąd retry statystyk dla ${gameType}:`, retryError.message);
        throw retryError;
      }
    }
    
    throw error;
  }
}

// Funkcja do sprawdzenia dostępności API
async function checkAPIHealth() {
  try {
    const response = await axios({
      method: 'GET',
      url: `${LOTTO_API_CONFIG.baseURL}/api/open/v1/lotteries/draw-results/last-results`,
      headers: {
        'secret': LOTTO_API_CONFIG.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'LotekApp/1.0'
      },
      timeout: 5000
    });
    
    console.log('✅ API lotto.pl jest dostępne');
    return true;
  } catch (error) {
    console.log('❌ API lotto.pl nie jest dostępne:', error.message);
    return false;
  }
}

// Funkcja do konwersji danych API na format aplikacji
function convertAPIDataToAppFormat(apiData, gameType) {
  console.log(`🔄 Konwertuję dane API dla ${gameType}...`);
  
  if (!apiData || !apiData.wyniki) {
    console.log(`❌ Brak danych w odpowiedzi API dla ${gameType}`);
    return null;
  }

  const results = apiData.wyniki.map(wynik => ({
    date: wynik.data,
    numbers: wynik.liczby,
    euroNumbers: wynik.liczbyEuro || null,
    drawNumber: wynik.numerLosowania,
    jackpot: wynik.jackpot || null
  }));

  console.log(`✅ Skonwertowano ${results.length} wyników dla ${gameType}`);
  return results;
}

// Funkcja do konwersji statystyk API na format aplikacji
function convertAPIStatsToAppFormat(apiStats, gameType) {
  console.log(`🔄 Konwertuję statystyki API dla ${gameType}...`);
  
  if (!apiStats || !apiStats.statystyki) {
    console.log(`❌ Brak statystyk w odpowiedzi API dla ${gameType}`);
    return null;
  }

  const stats = apiStats.statystyki;
  
  const convertedStats = {
    frequencyData: stats.czestotliwosc || {},
    totalDraws: stats.liczbaLosowan || 0,
    avgSum: stats.sredniaSuma || 0,
    sumRange: stats.zakresSumy || [0, 0],
    hotNumbers: stats.goraceLiczby || [],
    coldNumbers: stats.zimneLiczby || [],
    patterns: {
      evenOdd: stats.wzorce?.parzysteNieparzyste || "3:3",
      lowHigh: stats.wzorce?.niskieWysokie || "3:3",
      sumRange: stats.wzorce?.zakresSumy || "100-180"
    },
    lastUpdated: new Date().toISOString()
  };

  // Dodaj specjalne statystyki dla Eurojackpot
  if (gameType === 'eurojackpot' && stats.liczbyEuro) {
    convertedStats.euroNumbers = {
      mainNumbers: {
        frequencyData: stats.liczbyEuro.glowne?.czestotliwosc || {},
        mostFrequent: stats.liczbyEuro.glowne?.najczestsze || [],
        leastFrequent: stats.liczbyEuro.glowne?.najrzadsze || [],
        totalDraws: stats.liczbaLosowan || 0
      },
      euroNumbers: {
        frequencyData: stats.liczbyEuro.euro?.czestotliwosc || {},
        mostFrequent: stats.liczbyEuro.euro?.najczestsze || [],
        leastFrequent: stats.liczbyEuro.euro?.najrzadsze || [],
        totalDraws: stats.liczbaLosowan || 0
      },
      patterns: {
        mainEvenOdd: stats.liczbyEuro.wzorce?.glowneParzysteNieparzyste || "3:2",
        euroEvenOdd: stats.liczbyEuro.wzorce?.euroParzysteNieparzyste || "2:3",
        mainSumRange: stats.liczbyEuro.wzorce?.glowneZakresSumy || "7-37",
        euroSumRange: stats.liczbyEuro.wzorce?.euroZakresSumy || "3-11"
      }
    };
  }

  console.log(`✅ Skonwertowano statystyki dla ${gameType}`);
  return convertedStats;
}

module.exports = {
  fetchLottoResultsAPI,
  fetchLottoStatsAPI,
  checkAPIHealth,
  convertAPIDataToAppFormat,
  convertAPIStatsToAppFormat,
  LOTTO_API_CONFIG
};
