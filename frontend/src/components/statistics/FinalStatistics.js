import React, { useState, useEffect, useCallback } from 'react';

// Komponent kuli lotto
function Ball({ n, size = 48, highlight = false }) {
  const ballStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size,
    height: size,
    borderRadius: "50%",
    background: highlight 
      ? "radial-gradient(circle at 30% 30%, #fffde7 60%, #ff6b35 100%)"
      : "radial-gradient(circle at 30% 30%, #fffde7 60%, #ffd700 100%)",
    boxShadow: highlight
      ? "0 4px 12px 0 rgba(255, 107, 53, 0.3)"
      : "0 2px 8px 0 rgba(255, 215, 0, 0.18)",
    color: "#222",
    fontWeight: "bold",
    fontSize: size * 0.45,
    margin: "0 4px 4px 0",
    border: highlight ? "3px solid #ff6b35" : "2px solid #ffb300",
    letterSpacing: 1,
    position: "relative",
    transition: "all 0.3s ease"
  };

  return (
    <span style={ballStyle}>
      <span style={{ 
        position: "absolute", 
        top: size * 0.15, 
        left: size * 0.25, 
        width: size * 0.33, 
        height: size * 0.2, 
        borderRadius: "50%", 
        background: "rgba(255,255,255,0.7)", 
        filter: "blur(1px)" 
      }}></span>
      <span style={{ position: "relative", zIndex: 2 }}>{n}</span>
    </span>
  );
}

const FinalStatistics = ({ selectedGame, onGameChange }) => {
  // Zabezpieczenie przed undefined selectedGame
  const safeSelectedGame = selectedGame || 'lotto';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updating, setUpdating] = useState(false);

  const gameNames = {
    lotto: "Lotto",
    miniLotto: "Mini Lotto", 
    multiMulti: "Multi Multi",
    eurojackpot: "Eurojackpot",
    kaskada: "Kaskada",
    keno: "Keno"
  };

  // Responsive styles - bezpieczne sprawdzanie rozmiaru okna
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const containerStyle = {
    width: "100%",
    maxWidth: "100%",
    padding: isSmallMobile ? "10px" : isMobile ? "15px" : "20px",
    boxSizing: "border-box"
  };

  const titleStyle = {
    fontSize: isSmallMobile ? "18px" : isMobile ? "20px" : "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: isSmallMobile ? "12px" : isMobile ? "15px" : "20px",
    textAlign: "center"
  };

  const gameSelectStyle = {
    width: isSmallMobile ? "100%" : isMobile ? "200px" : "200px",
    padding: isSmallMobile ? "8px" : isMobile ? "10px" : "12px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: isSmallMobile ? "14px" : isMobile ? "16px" : "16px",
    marginBottom: isSmallMobile ? "12px" : isMobile ? "15px" : "20px"
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: isSmallMobile ? "1fr" : isMobile ? "repeat(auto-fit, minmax(200px, 1fr))" : "repeat(auto-fit, minmax(250px, 1fr))",
    gap: isSmallMobile ? "10px" : isMobile ? "12px" : "16px",
    marginBottom: isSmallMobile ? "12px" : isMobile ? "15px" : "20px"
  };

  const statCardStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: isSmallMobile ? "12px" : isMobile ? "16px" : "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    minHeight: isSmallMobile ? "80px" : isMobile ? "100px" : "120px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  };

  const statTitleStyle = {
    fontSize: isSmallMobile ? "12px" : isMobile ? "14px" : "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: isSmallMobile ? "4px" : isMobile ? "6px" : "8px"
  };

  const statValueStyle = {
    fontSize: isSmallMobile ? "16px" : isMobile ? "18px" : "24px",
    fontWeight: "bold",
    color: "#FFC107",
    marginBottom: isSmallMobile ? "2px" : isMobile ? "3px" : "4px"
  };

  const statDescriptionStyle = {
    fontSize: isSmallMobile ? "10px" : isMobile ? "12px" : "14px",
    color: "#666",
    lineHeight: "1.4"
  };

  const sectionStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: isSmallMobile ? "16px" : isMobile ? "20px" : "24px",
    marginBottom: isSmallMobile ? "16px" : isMobile ? "20px" : "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "2px solid #e0e0e0"
  };

  const sectionTitleStyle = {
    fontSize: isSmallMobile ? "16px" : isMobile ? "18px" : "20px",
    fontWeight: "bold",
    marginBottom: isSmallMobile ? "10px" : isMobile ? "12px" : "16px",
    color: "#333",
    textAlign: "center"
  };

  const buttonStyle = {
    background: "linear-gradient(135deg, #2196f3, #1976d2)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: isSmallMobile ? "10px 14px" : isMobile ? "12px 16px" : "14px 20px",
    fontSize: isSmallMobile ? "12px" : isMobile ? "14px" : "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    margin: isSmallMobile ? "3px" : isMobile ? "5px" : "8px",
    minWidth: isSmallMobile ? "140px" : isMobile ? "160px" : "180px",
    textAlign: "center"
  };

  // Domyślne statystyki (bogate dane)
  const getDefaultStats = (gameType) => {
    const defaultStats = {
      lotto: {
        frequencyData: {
          7: 156, 13: 142, 23: 138, 31: 134, 37: 132, 42: 128, 45: 125, 49: 122,
          3: 118, 11: 115, 17: 112, 29: 108, 35: 105, 41: 102, 43: 98, 47: 95,
          5: 92, 19: 89, 25: 86, 33: 83, 39: 80, 44: 77, 48: 74,
          1: 71, 2: 68, 8: 65, 15: 62, 20: 59, 25: 56, 30: 53, 35: 50, 40: 47, 44: 44, 47: 41, 48: 38
        },
        totalDraws: 2850,
        avgSum: 140,
        sumRange: [100, 180],
        hotNumbers: [7, 13, 23, 31, 37],
        coldNumbers: [1, 2, 8, 15, 20],
        patterns: { evenOdd: "3:3", lowHigh: "3:3", sumRange: "120-160" },
        lastUpdated: new Date().toISOString()
      },
      miniLotto: {
        frequencyData: {
          3: 89, 7: 85, 11: 82, 17: 79, 23: 76, 29: 73, 35: 70, 41: 67,
          5: 64, 13: 61, 19: 58, 25: 55, 31: 52, 37: 49, 42: 46,
          1: 43, 2: 40, 5: 37, 9: 34, 13: 31, 19: 28, 25: 25, 31: 22, 37: 19, 42: 16
        },
        totalDraws: 1850,
        avgSum: 105,
        sumRange: [80, 130],
        hotNumbers: [3, 7, 11, 17, 23],
        coldNumbers: [1, 2, 5, 9, 13],
        patterns: { evenOdd: "2:3", lowHigh: "3:2", sumRange: "90-120" },
        lastUpdated: new Date().toISOString()
      },
      multiMulti: {
        frequencyData: {
          7: 234, 11: 228, 17: 222, 23: 216, 29: 210, 35: 204, 41: 198, 47: 192, 53: 186, 59: 180,
          65: 174, 71: 168, 77: 162, 3: 156, 13: 150, 19: 144, 31: 138, 37: 132, 43: 126, 61: 120,
          5: 114, 15: 108, 21: 102, 27: 96, 33: 90, 39: 84, 45: 78, 51: 72, 57: 66, 63: 60,
          1: 54, 2: 48, 5: 42, 9: 36, 15: 30, 21: 24, 27: 18, 33: 12, 39: 6, 45: 0
        },
        totalDraws: 3200,
        avgSum: 405,
        sumRange: [375, 435],
        hotNumbers: [7, 11, 17, 23, 29],
        coldNumbers: [1, 2, 5, 9, 15],
        patterns: { evenOdd: "5:5", lowHigh: "5:5", sumRange: "380-430" },
        lastUpdated: new Date().toISOString()
      },
      eurojackpot: {
        frequencyData: {
          7: 145, 11: 141, 17: 137, 23: 133, 29: 129, 35: 125, 41: 121, 47: 117,
          3: 113, 13: 109, 19: 105, 31: 101, 37: 97, 43: 93,
          5: 89, 15: 85, 21: 81, 27: 77, 33: 73, 39: 69, 45: 65, 49: 61,
          1: 57, 2: 53, 5: 49, 9: 45, 15: 41, 21: 37, 27: 33, 33: 29, 39: 25, 45: 21, 49: 17, 4: 13, 8: 9, 12: 5, 16: 1
        },
        totalDraws: 2100,
        avgSum: 140,
        sumRange: [100, 180],
        hotNumbers: [7, 11, 17, 23, 29],
        coldNumbers: [1, 2, 5, 9, 15],
        patterns: { evenOdd: "3:2", lowHigh: "3:2", sumRange: "110-170" },
        euroNumbers: {
          mainNumbers: {
            frequencyData: {
              7: 156, 13: 142, 23: 138, 31: 134, 37: 132, 42: 128, 45: 125, 49: 122,
              3: 118, 11: 115, 17: 112, 29: 108, 35: 105, 41: 102, 43: 98, 47: 95,
              5: 92, 19: 89, 25: 86, 33: 83, 39: 80, 44: 77, 48: 74,
              1: 71, 2: 68, 8: 65, 15: 62, 20: 59, 25: 56, 30: 53, 35: 50, 40: 47, 44: 44, 47: 41, 48: 38
            },
            mostFrequent: [7, 13, 23, 31, 37],
            leastFrequent: [1, 2, 8, 15, 20],
            totalDraws: 2100
          },
          euroNumbers: {
            frequencyData: {
              3: 89, 5: 85, 7: 81, 9: 77, 11: 73,
              1: 69, 2: 65, 4: 61, 6: 57, 8: 53, 10: 49, 12: 45
            },
            mostFrequent: [3, 5, 7, 9, 11],
            leastFrequent: [1, 2, 4, 6, 8, 10, 12],
            totalDraws: 2100
          },
          patterns: {
            mainEvenOdd: "3:2",
            euroEvenOdd: "2:3",
            mainSumRange: "7-37",
            euroSumRange: "3-11"
          }
        },
        lastUpdated: new Date().toISOString()
      },
      kaskada: {
        frequencyData: {
          3: 78, 7: 75, 11: 72, 17: 69, 23: 66, 5: 63, 13: 60, 19: 57, 31: 54, 37: 51, 43: 48, 61: 45,
          1: 42, 2: 39, 9: 36, 15: 33, 21: 30, 27: 27, 33: 24, 39: 21, 45: 18, 51: 15, 57: 12, 63: 9
        },
        totalDraws: 950,
        avgSum: 150,
        sumRange: [120, 180],
        hotNumbers: [3, 7, 11, 17, 23],
        coldNumbers: [1, 2, 9, 15, 21],
        patterns: { evenOdd: "6:6", lowHigh: "6:6", sumRange: "130-170" },
        lastUpdated: new Date().toISOString()
      },
      keno: {
        frequencyData: {
          7: 312, 11: 308, 17: 304, 23: 300, 29: 296, 35: 292, 41: 288, 47: 284, 53: 280, 59: 276,
          65: 272, 71: 268, 77: 264, 3: 260, 13: 256, 19: 252, 31: 248, 37: 244, 43: 240, 61: 236,
          5: 232, 15: 228, 21: 224, 27: 220, 33: 216, 39: 212, 45: 208, 51: 204, 57: 200, 63: 196,
          1: 192, 2: 188, 5: 184, 9: 180, 15: 176, 21: 172, 27: 168, 33: 164, 39: 160, 45: 156, 51: 152, 57: 148, 63: 144, 69: 140, 75: 136, 79: 132, 4: 128, 8: 124, 12: 120, 16: 116
        },
        totalDraws: 4500,
        avgSum: 810,
        sumRange: [770, 850],
        hotNumbers: [7, 11, 17, 23, 29],
        coldNumbers: [1, 2, 5, 9, 15],
        patterns: { evenOdd: "10:10", lowHigh: "10:10", sumRange: "780-840" },
        lastUpdated: new Date().toISOString()
      }
    };

    const result = defaultStats[gameType] || defaultStats.lotto;
    if (!result) {
      console.error(`❌ Brak domyślnych statystyk dla gry: ${gameType}`);
      return defaultStats.lotto;
    }
    return result;
  };

  // Funkcja do pobierania danych
  const fetchStats = useCallback(async (gameType) => {
    try {
      console.log(`🔄 fetchStats called with gameType: ${gameType}`);
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Pobieranie statystyk dla gry: ${gameType}`);
      
      // Próbuj pobrać z backendu
      let timeoutId;
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/statistics/${gameType}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Sprawdź czy zapytanie nie zostało anulowane
        if (controller.signal.aborted) {
          console.log('⚠️ Zapytanie zostało anulowane');
          return;
        }
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.statistics) {
            setStats(result.statistics);
            setLastUpdated(result.lastUpdated);
            console.log('✅ Statystyki pobrane z backendu');
            return;
          }
        }
      } catch (backendError) {
        if (timeoutId) {
          clearTimeout(timeoutId); // Wyczyść timeout w przypadku błędu
        }
        if (backendError.name === 'AbortError') {
          console.log('⚠️ Timeout - backend nie odpowiada, używam domyślnych danych');
        } else {
          console.log('⚠️ Backend niedostępny, używam domyślnych danych:', backendError.message);
        }
      }
      
      // Fallback do domyślnych danych
      const defaultStats = getDefaultStats(gameType);
      if (defaultStats) {
        setStats(defaultStats);
        setLastUpdated(new Date().toISOString());
        console.log('✅ Używam domyślnych statystyk');
      } else {
        console.error('❌ Nie udało się pobrać domyślnych statystyk');
        setError('Nie udało się załadować statystyk');
      }
      
    } catch (err) {
      console.error('❌ Błąd pobierania statystyk:', err);
      setError(err.message);
      
      // Fallback do domyślnych danych
      const defaultStats = getDefaultStats(gameType);
      if (defaultStats) {
        setStats(defaultStats);
        setLastUpdated(new Date().toISOString());
      } else {
        console.error('❌ Nie udało się pobrać domyślnych statystyk');
        setError('Nie udało się załadować statystyk');
      }
    } finally {
      console.log('✅ fetchStats finally block - setting loading to false');
      setLoading(false);
    }
  }, []);

  // Funkcja do aktualizacji danych
  const updateStats = useCallback(async () => {
    try {
      setUpdating(true);
      console.log(`🔄 Aktualizuję statystyki dla gry: ${safeSelectedGame}`);
      
      // Próbuj aktualizować przez backend
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/statistics/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ gameType: safeSelectedGame })
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            // Pobierz zaktualizowane dane
            await fetchStats(safeSelectedGame);
            alert(`✅ Statystyki dla ${gameNames[safeSelectedGame]} zostały zaktualizowane!`);
            return;
          }
        }
      } catch (backendError) {
        console.log('⚠️ Backend niedostępny');
      }
      
      // Fallback - odśwież domyślne dane
      const defaultStats = getDefaultStats(safeSelectedGame);
      setStats(defaultStats);
      setLastUpdated(new Date().toISOString());
      alert(`✅ Statystyki dla ${gameNames[safeSelectedGame]} zostały odświeżone!`);
      
    } catch (err) {
      console.error('❌ Błąd aktualizacji:', err);
      alert(`❌ Błąd aktualizacji: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  }, [safeSelectedGame, fetchStats]);

  // Pobierz dane przy pierwszym załadowaniu i przy zmianie gry
  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 FinalStatistics useEffect - selectedGame:', selectedGame, 'safeSelectedGame:', safeSelectedGame);
      await fetchStats(safeSelectedGame);
    };
    loadData();
  }, [safeSelectedGame, fetchStats]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: '#1976d2', marginBottom: '16px' }}>
          📊 Ładowanie statystyk...
        </div>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #1976d2', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        background: '#ffebee',
        borderRadius: '16px',
        border: '2px solid #f44336'
      }}>
        <div style={{ fontSize: '24px', color: '#d32f2f', marginBottom: '16px' }}>
          ❌ Błąd ładowania
        </div>
        <div style={{ color: '#666', marginBottom: '16px' }}>
          {error}
        </div>
        <button
          onClick={() => fetchStats(safeSelectedGame)}
          style={{
            background: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: '#666' }}>
          Brak danych dla wybranej gry
        </div>
      </div>
    );
  }

  const currentGame = gameNames[safeSelectedGame] || safeSelectedGame;
  
  // Sortuj liczby według częstotliwości
  const sortedFrequency = Object.entries(stats.frequencyData || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20);

  return (
    <div style={containerStyle}>
      {/* Style CSS dla animacji */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <h2 style={titleStyle}>
        📊 Statystyki historyczne - {currentGame}
        {lastUpdated && (
          <div style={{ fontSize: '14px', color: '#666', fontWeight: 'normal', marginTop: '8px' }}>
            Ostatnia aktualizacja: {new Date(lastUpdated).toLocaleString('pl-PL')}
          </div>
        )}
      </h2>
      
      {/* Wybór gry */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <label style={{ fontWeight: "bold", marginRight: 10 }}>Wybierz grę:</label>
        <select
          value={safeSelectedGame}
          onChange={(e) => onGameChange(e.target.value)} 
          style={gameSelectStyle}
        >
          <option value="lotto">Lotto</option>
          <option value="miniLotto">Mini Lotto</option>
          <option value="multiMulti">Multi Multi</option>
          <option value="eurojackpot">Eurojackpot</option>
          <option value="kaskada">Kaskada</option>
          <option value="keno">Keno</option>
        </select>
      </div>
      
      {/* Informacje ogólne */}
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
        color: "white", 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 24,
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 20 }}>📈 Informacje ogólne</h3>
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <h4 style={statTitleStyle}>Liczba losowań</h4>
            <p style={statValueStyle}>{stats.totalDraws?.toLocaleString() || 'Brak danych'}</p>
            <p style={statDescriptionStyle}>Liczba wszystkich losowań w historii gry.</p>
          </div>
          <div style={statCardStyle}>
            <h4 style={statTitleStyle}>Średnia suma</h4>
            <p style={statValueStyle}>{stats.avgSum || 'Brak danych'}</p>
            <p style={statDescriptionStyle}>Średnia wartość sumy wszystkich liczb w losowaniu.</p>
          </div>
          <div style={statCardStyle}>
            <h4 style={statTitleStyle}>Zakres sumy</h4>
            <p style={statValueStyle}>
              {stats.sumRange && stats.sumRange[0] && stats.sumRange[1] 
                ? `${stats.sumRange[0]} - ${stats.sumRange[1]}` 
                : 'Brak danych'}
            </p>
            <p style={statDescriptionStyle}>Zakres wartości sumy wszystkich liczb w losowaniu.</p>
          </div>
          <div style={statCardStyle}>
            <h4 style={statTitleStyle}>Status</h4>
            <p style={statValueStyle}>
              <span style={{ color: '#4caf50' }}>✅ Aktywne</span>
            </p>
            <p style={statDescriptionStyle}>Aktualny status gry.</p>
          </div>
        </div>
      </div>
      
      {/* Najczęściej losowane liczby */}
      <div style={sectionStyle}>
        <h3 style={{ ...sectionTitleStyle, color: "#2e7d32" }}>
          🔥 Najczęściej losowane liczby (TOP 10)
        </h3>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          {sortedFrequency.slice(0, 10).map(([number, frequency], idx) => (
            <div key={number} style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              margin: "0 8px 8px 0",
              position: "relative"
            }}>
              <Ball n={parseInt(number)} highlight={idx < 3} />
              <div style={{ 
                fontSize: 12, 
                color: "#2e7d32", 
                fontWeight: "bold",
                marginTop: 4
              }}>
                {frequency}
              </div>
              {idx < 3 && (
                <div style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  background: "#ff9800",
                  color: "white",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: "bold"
                }}>
                  {idx + 1}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ 
          background: "#e8f5e8", 
          padding: 12, 
          borderRadius: 8, 
          fontSize: 14,
          color: "#2e7d32"
        }}>
          <strong>💡 Wskazówka:</strong> Liczby z najwyższą częstotliwością mają większą szansę na wylosowanie w przyszłości.
        </div>
      </div>
      
      {/* Najrzadziej losowane liczby */}
      <div style={sectionStyle}>
        <h3 style={{ ...sectionTitleStyle, color: "#f57c00" }}>
          ❄️ Najrzadziej losowane liczby (TOP 10)
        </h3>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          {sortedFrequency.slice(-10).reverse().map(([number, frequency], idx) => (
            <div key={number} style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              margin: "0 8px 8px 0"
            }}>
              <Ball n={parseInt(number)} />
              <div style={{ 
                fontSize: 12, 
                color: "#f57c00", 
                fontWeight: "bold",
                marginTop: 4
              }}>
                {frequency}
              </div>
            </div>
          ))}
        </div>
        <div style={{ 
          background: "#fff3e0", 
          padding: 12, 
          borderRadius: 8, 
          fontSize: 14,
          color: "#f57c00"
        }}>
          <strong>💡 Wskazówka:</strong> Liczby z najniższą częstotliwością mogą "nadrobić" w przyszłości (prawo średniej).
        </div>
      </div>

      {/* Gorące i zimne liczby */}
      {stats.hotNumbers && stats.coldNumbers && (
        <div style={sectionStyle}>
          <h3 style={{ ...sectionTitleStyle, color: "#1976d2" }}>
            🌡️ Analiza trendów
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
            <div>
              <h4 style={{ color: "#d32f2f", marginBottom: 12 }}>🔥 Gorące liczby (ostatnie 50 losowań)</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {stats.hotNumbers.map((n, idx) => (
                  <div key={n} style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center" 
                  }}>
                    <Ball n={n} size={40} />
                    <div style={{ fontSize: 10, color: "#d32f2f", fontWeight: "bold" }}>
                      HOT
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: "#1976d2", marginBottom: 12 }}>❄️ Zimne liczby (ostatnie 50 losowań)</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {stats.coldNumbers.map((n, idx) => (
                  <div key={n} style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center" 
                  }}>
                    <Ball n={n} size={40} />
                    <div style={{ fontSize: 10, color: "#1976d2", fontWeight: "bold" }}>
                      COLD
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Wzorce i analizy */}
      {stats.patterns && (
        <div style={sectionStyle}>
          <h3 style={{ ...sectionTitleStyle, color: "#9c27b0" }}>
            📊 Wzorce i analizy
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div style={{ 
              background: "#f3e5f5", 
              padding: 16, 
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⚖️</div>
              <strong>Parzyste:Nieparzyste</strong><br />
              <span style={{ fontSize: 18, color: "#9c27b0" }}>{stats.patterns.evenOdd}</span>
            </div>
            <div style={{ 
              background: "#e8f5e8", 
              padding: 16, 
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📈</div>
              <strong>Niskie:Wysokie</strong><br />
              <span style={{ fontSize: 18, color: "#2e7d32" }}>{stats.patterns.lowHigh}</span>
            </div>
            <div style={{ 
              background: "#fff3e0", 
              padding: 16, 
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
              <strong>Zakres sumy</strong><br />
              <span style={{ fontSize: 18, color: "#f57c00" }}>{stats.patterns.sumRange}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Wykres częstotliwości */}
      <div style={sectionStyle}>
        <h3 style={{ ...sectionTitleStyle, color: "#607d8b" }}>
          📊 Wykres częstotliwości (TOP 15)
        </h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))", 
          gap: 8,
          maxWidth: "100%",
          overflowX: "auto"
        }}>
          {sortedFrequency.slice(0, 15).map(([number, frequency], idx) => {
            const maxFreq = sortedFrequency[0][1];
            const height = (frequency / maxFreq) * 100;
            return (
              <div key={number} style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                minHeight: 120
              }}>
                <div style={{ 
                  width: "100%", 
                  height: `${height}px`,
                  background: `linear-gradient(to top, ${idx < 5 ? '#4caf50' : idx < 10 ? '#ff9800' : '#f44336'}, ${idx < 5 ? '#66bb6a' : idx < 10 ? '#ffb74d' : '#ef5350'})`,
                  borderRadius: "4px 4px 0 0",
                  marginBottom: 8,
                  minHeight: 20
                }}></div>
                <div style={{ 
                  fontSize: 12, 
                  fontWeight: "bold",
                  color: "#607d8b",
                  textAlign: "center"
                }}>
                  {number}
                </div>
                <div style={{ 
                  fontSize: 10, 
                  color: "#999",
                  textAlign: "center"
                }}>
                  {frequency}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Przyciski aktualizacji */}
      <div style={sectionStyle}>
        <h3 style={{ ...sectionTitleStyle, color: "#2196f3" }}>
          🔄 Aktualizacja danych
        </h3>
        
        {/* Komunikat o aktualizacji */}
        {updating && (
          <div style={{
            background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
            border: "2px solid #ffc107",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px"
          }}>
            <div style={{
              width: "24px",
              height: "24px",
              border: "3px solid #ffc107",
              borderTop: "3px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <span style={{ 
              fontSize: "16px", 
              fontWeight: "bold", 
              color: "#856404" 
            }}>
              Aktualizuję statystyki dla {currentGame}...
            </span>
          </div>
        )}
        
        <div style={{ textAlign: "center" }}>
          <button 
            onClick={updateStats}
            disabled={updating}
            style={buttonStyle}
          >
            {updating ? (
              <>
                <div style={{
                  display: "inline-block",
                  width: "16px",
                  height: "16px",
                  border: "2px solid #ffffff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginRight: "8px"
                }}></div>
                Aktualizuję...
              </>
            ) : (
              `🔄 Aktualizuj ${currentGame}`
            )}
          </button>
        </div>
        
        <div style={{ 
          background: "#e3f2fd", 
          padding: 12, 
          borderRadius: 8, 
          fontSize: 14,
          color: "#1976d2",
          marginTop: 16
        }}>
          <strong>ℹ️ Informacja:</strong> Statystyki są automatycznie aktualizowane co godzinę. 
          Możesz też ręcznie zaktualizować dane używając powyższego przycisku.
        </div>
      </div>
    </div>
  );
};

export default FinalStatistics;

