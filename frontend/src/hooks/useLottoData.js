import { useState, useEffect, useCallback, useRef } from 'react';

// Domyślne statystyki (fallback)
const getDefaultStats = (game) => {
  const defaultStats = {
    lotto: {
      frequencyData: {
        7: 156, 13: 142, 23: 138, 31: 134, 37: 132, 42: 128, 45: 125, 49: 122,
        3: 118, 11: 115, 17: 112, 29: 108, 35: 105, 41: 102, 43: 98, 47: 95
      },
      mostFrequent: [7, 13, 23, 31, 37],
      leastFrequent: [1, 2, 8, 15, 20],
      lastUpdated: new Date().toISOString(),
      totalDraws: 100,
      hotNumbers: [7, 13, 23, 31, 37],
      coldNumbers: [1, 2, 8, 15, 20]
    },
    miniLotto: {
      frequencyData: {
        3: 89, 7: 85, 11: 82, 17: 79, 23: 76, 29: 73, 35: 70, 41: 67
      },
      mostFrequent: [3, 7, 11, 17, 23],
      leastFrequent: [1, 2, 5, 9, 13],
      lastUpdated: new Date().toISOString(),
      totalDraws: 100,
      hotNumbers: [3, 7, 11, 17, 23],
      coldNumbers: [1, 2, 5, 9, 13]
    }
  };
  
  return defaultStats[game] || defaultStats.lotto;
};

// Hook do pobierania danych z API Lotto
export const useLottoData = (gameType = 'lotto') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const previousGameType = useRef(gameType);
  
  console.log(`🔧 [useLottoData] Hook wywołany dla gry: ${gameType}, loading: ${loading}, data: ${data ? 'jest' : 'brak'}`);

  // Funkcja do pobierania danych - NAPRAWIONA
  const fetchData = useCallback(async (game) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Pobieranie danych dla gry: ${game}`);
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/statistics/${game}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 sekund timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.statistics);
        setLastUpdated(result.lastUpdated);
        console.log('✅ Dane pobrane pomyślnie');
      } else {
        throw new Error(result.error || 'Błąd pobierania danych');
      }
    } catch (err) {
      console.error('❌ Błąd pobierania danych:', err);
      setError(err.message);
      
      // Fallback do domyślnych danych w przypadku błędu
      console.log('🔄 Używam domyślnych danych jako fallback...');
      const defaultStats = getDefaultStats(game);
      if (defaultStats) {
        setData(defaultStats);
        setLastUpdated(new Date().toISOString());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Pobierz dane przy pierwszym załadowaniu i przy zmianie gry - NAPRAWIONE
  useEffect(() => {
    // Sprawdź czy gameType się rzeczywiście zmienił
    if (gameType && gameType !== previousGameType.current) {
      console.log(`🚀 [useLottoData] Zmiana gry z ${previousGameType.current} na ${gameType}`);
      previousGameType.current = gameType;
      fetchData(gameType);
    } else if (gameType && !data) {
      // Pierwsze załadowanie
      console.log(`🚀 [useLottoData] Pierwsze załadowanie dla gry: ${gameType}`);
      previousGameType.current = gameType;
      fetchData(gameType);
    }
  }, [gameType]); // Usunięto data z zależności

  // Funkcja do ręcznej aktualizacji - NAPRAWIONA
  const refreshData = useCallback(() => {
    fetchData(gameType);
  }, [gameType, fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refreshData
  };
};

// Hook do pobierania wszystkich gier
export const useAllLottoData = () => {
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Pobieranie danych dla wszystkich gier...');
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/statistics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAllData(result.statistics);
        console.log('✅ Dane wszystkich gier pobrane pomyślnie');
      } else {
        throw new Error(result.error || 'Błąd pobierania danych');
      }
    } catch (err) {
      console.error('❌ Błąd pobierania danych wszystkich gier:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Pobierz dane przy pierwszym załadowaniu - NAPRAWIONE
  useEffect(() => {
    fetchAllData();
  }, []); // Usunięto fetchAllData z zależności

  return {
    allData,
    loading,
    error,
    refreshData: fetchAllData
  };
}; 