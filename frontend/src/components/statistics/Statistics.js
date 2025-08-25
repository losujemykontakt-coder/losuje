import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase';

// Komponent kuli (skopiowany z App.js)
function Ball({ n }) {
  const ballStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, #fffde7 60%, #ffd700 100%)",
    boxShadow: "0 2px 8px 0 rgba(255, 215, 0, 0.18)",
    color: "#222",
    fontWeight: "bold",
    fontSize: 22,
    margin: "0 7px 7px 0",
    border: "2px solid #ffb300",
    letterSpacing: 1,
    position: "relative"
  };

  return (
    <span style={ballStyle}>
      <span style={{ position: "absolute", top: 7, left: 12, width: 16, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.7)", filter: "blur(1px)" }}></span>
      <span style={{ position: "relative", zIndex: 2 }}>{n}</span>
    </span>
  );
}

const Statistics = ({ selectedGame, onGameChange }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updatingStats, setUpdatingStats] = useState(false);
  const [updatingAllStats, setUpdatingAllStats] = useState(false);
  
  console.log(`🔧 [Statistics] Komponent renderowany z selectedGame: ${selectedGame}, loading: ${loading}`);

  const gameNames = {
    lotto: "Lotto",
    miniLotto: "Mini Lotto", 
    multiMulti: "Multi Multi",
    eurojackpot: "Eurojackpot",
    kaskada: "Kaskada",
    keno: "Keno"
  };

  // Responsive styles - poprawione
  const isMobile = window.innerWidth <= 768;
  const isSmallMobile = window.innerWidth <= 480;
  const isExtraSmall = window.innerWidth <= 300;

  const containerStyle = {
    width: "100%",
    maxWidth: "100%",
    padding: isExtraSmall ? "5px" : isSmallMobile ? "10px" : isMobile ? "15px" : "20px",
    boxSizing: "border-box"
  };

  const titleStyle = {
    fontSize: isExtraSmall ? "16px" : isSmallMobile ? "18px" : isMobile ? "20px" : "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: isExtraSmall ? "10px" : isSmallMobile ? "12px" : isMobile ? "15px" : "20px",
    textAlign: "center"
  };

  const gameSelectStyle = {
    width: isExtraSmall ? "100%" : isSmallMobile ? "100%" : isMobile ? "200px" : "200px",
    padding: isExtraSmall ? "6px" : isSmallMobile ? "8px" : isMobile ? "10px" : "12px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: isExtraSmall ? "12px" : isSmallMobile ? "14px" : isMobile ? "16px" : "16px",
    marginBottom: isExtraSmall ? "10px" : isSmallMobile ? "12px" : isMobile ? "15px" : "20px"
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: isExtraSmall ? "1fr" : isSmallMobile ? "1fr" : isMobile ? "repeat(auto-fit, minmax(200px, 1fr))" : "repeat(auto-fit, minmax(250px, 1fr))",
    gap: isExtraSmall ? "8px" : isSmallMobile ? "10px" : isMobile ? "12px" : "16px",
    marginBottom: isExtraSmall ? "10px" : isSmallMobile ? "12px" : isMobile ? "15px" : "20px"
  };

  const statCardStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: isExtraSmall ? "8px" : isSmallMobile ? "12px" : isMobile ? "16px" : "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    minHeight: isExtraSmall ? "60px" : isSmallMobile ? "80px" : isMobile ? "100px" : "120px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  };

  const statTitleStyle = {
    fontSize: isExtraSmall ? "11px" : isSmallMobile ? "12px" : isMobile ? "14px" : "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: isExtraSmall ? "2px" : isSmallMobile ? "4px" : isMobile ? "6px" : "8px"
  };

  const statValueStyle = {
    fontSize: isExtraSmall ? "14px" : isSmallMobile ? "16px" : isMobile ? "18px" : "24px",
    fontWeight: "bold",
    color: "#FFC107",
    marginBottom: isExtraSmall ? "1px" : isSmallMobile ? "2px" : isMobile ? "3px" : "4px"
  };

  const statDescriptionStyle = {
    fontSize: isExtraSmall ? "9px" : isSmallMobile ? "10px" : isMobile ? "12px" : "14px",
    color: "#666",
    lineHeight: "1.4"
  };

  const buttonContainerStyle = {
    display: "flex",
    flexDirection: isExtraSmall ? "column" : isSmallMobile ? "column" : isMobile ? "row" : "row",
    gap: isExtraSmall ? "8px" : isSmallMobile ? "10px" : isMobile ? "12px" : "16px",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: isExtraSmall ? "10px" : isSmallMobile ? "12px" : isMobile ? "15px" : "20px"
  };

  const buttonStyle = {
    background: "linear-gradient(135deg, #2196f3, #1976d2)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: isExtraSmall ? "8px 12px" : isSmallMobile ? "10px 14px" : isMobile ? "12px 16px" : "14px 20px",
    fontSize: isExtraSmall ? "11px" : isSmallMobile ? "12px" : isMobile ? "14px" : "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    margin: isExtraSmall ? "2px" : isSmallMobile ? "3px" : isMobile ? "5px" : "8px",
    minWidth: isExtraSmall ? "120px" : isSmallMobile ? "140px" : isMobile ? "160px" : "180px",
    textAlign: "center"
  };

  const greenButtonStyle = {
    background: "linear-gradient(135deg, #4caf50, #2e7d32)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: isExtraSmall ? "8px 12px" : isSmallMobile ? "10px 14px" : isMobile ? "12px 16px" : "14px 20px",
    fontSize: isExtraSmall ? "11px" : isSmallMobile ? "12px" : isMobile ? "14px" : "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    margin: isExtraSmall ? "2px" : isSmallMobile ? "3px" : isMobile ? "5px" : "8px",
    minWidth: isExtraSmall ? "120px" : isSmallMobile ? "140px" : isMobile ? "160px" : "180px",
    textAlign: "center"
  };

  const sectionStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: isExtraSmall ? "12px" : isSmallMobile ? "16px" : isMobile ? "20px" : "24px",
    marginBottom: isExtraSmall ? "12px" : isSmallMobile ? "16px" : isMobile ? "20px" : "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "2px solid #e0e0e0"
  };

  const sectionTitleStyle = {
    fontSize: isExtraSmall ? "14px" : isSmallMobile ? "16px" : isMobile ? "18px" : "20px",
    fontWeight: "bold",
    marginBottom: isExtraSmall ? "8px" : isSmallMobile ? "10px" : isMobile ? "12px" : "16px",
    color: "#333",
    textAlign: "center"
  };

  // Pobieranie statystyk z API
  useEffect(() => {
    console.log(`🚀 [Statistics] useEffect uruchomiony z selectedGame: ${selectedGame}`);
    
    if (!selectedGame) {
      console.log('❌ [Statistics] selectedGame jest undefined - używam domyślnej gry "lotto"');
      // Użyj domyślnej gry jeśli selectedGame nie jest ustawione
      const defaultGame = 'lotto';
      if (onGameChange) onGameChange(defaultGame);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchStats = async () => {
      try {
        console.log(`Pobieranie statystyk dla gry: ${selectedGame}`);
        
        // Szybkie żądanie - backend zwraca cache lub domyślne dane
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/statistics/${selectedGame}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000 // Max 10 sekund
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setStats(data.statistics || data.data);
          setLastUpdated(data.lastUpdated);
          console.log('✅ Statystyki pobrane pomyślnie');
        } else {
          throw new Error(data.error || 'Błąd pobierania danych');
        }
      } catch (error) {
        console.error('Błąd pobierania statystyk:', error);
        
        if (error.message.includes('fetch') || error.message.includes('network')) {
  console.log('🌐 Błąd połączenia z serwerem');
  // Błąd połączenia - bez komunikatu dla użytkownika
} else if (error.message.includes('timeout')) {
          console.log('⏰ Timeout - żądanie przerwane po 10 sekundach');
          // Timeout - bez komunikatu dla użytkownika
        } else {
          console.log('❌ Nieoczekiwany błąd:', error.message);
          setError('Błąd pobierania danych. Używam domyślnych danych.');
        }
        
        // Fallback do domyślnych danych
        console.log('🔄 Używam domyślnych statystyk jako fallback');
        setStats(getDefaultStats(selectedGame));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedGame]);

  // Domyślne statystyki (fallback)
  const getDefaultStats = (game) => {
    const defaultStats = {
      lotto: {
        frequencyData: {
          7: 156, 13: 142, 23: 138, 31: 134, 37: 132, 42: 128, 45: 125, 49: 122,
          3: 118, 11: 115, 17: 112, 29: 108, 35: 105, 41: 102, 43: 98, 47: 95,
          5: 92, 19: 89, 25: 86, 33: 83, 39: 80, 44: 77, 48: 74,
          1: 71, 2: 68, 8: 65, 15: 62, 20: 59, 30: 53, 40: 47
        },
        totalDraws: 2850,
        avgSum: 140,
        sumRange: [100, 180],
        hotNumbers: [7, 13, 23, 31, 37],
        coldNumbers: [1, 2, 8, 15, 20],
        patterns: { evenOdd: "3:3", lowHigh: "3:3", sumRange: "120-160" }
      },
      miniLotto: {
        frequencyData: {
          3: 89, 7: 85, 11: 82, 17: 79, 23: 76, 29: 73, 35: 70, 41: 67,
          5: 64, 13: 61, 19: 58, 25: 55, 31: 52, 37: 49, 42: 46,
          1: 43, 2: 40, 9: 34
        },
        totalDraws: 1850,
        avgSum: 105,
        sumRange: [80, 130],
        hotNumbers: [3, 7, 11, 17, 23],
        coldNumbers: [1, 2, 5, 9, 13],
        patterns: { evenOdd: "2:3", lowHigh: "3:2", sumRange: "90-120" }
      },
      multiMulti: {
        frequencyData: {
          7: 234, 11: 228, 17: 222, 23: 216, 29: 210, 35: 204, 41: 198, 47: 192, 53: 186, 59: 180,
          65: 174, 71: 168, 77: 162, 3: 156, 13: 150, 19: 144, 31: 138, 37: 132, 43: 126, 61: 120,
          5: 114, 15: 108, 21: 102, 27: 96, 33: 90, 39: 84, 45: 78, 51: 72, 57: 66, 63: 60,
          1: 54, 2: 48, 9: 36
        },
        totalDraws: 3200,
        avgSum: 405,
        sumRange: [375, 435],
        hotNumbers: [7, 11, 17, 23, 29],
        coldNumbers: [1, 2, 5, 9, 15],
        patterns: { evenOdd: "5:5", lowHigh: "5:5", sumRange: "380-430" }
      },
      eurojackpot: {
        frequencyData: {
          7: 145, 11: 141, 17: 137, 23: 133, 29: 129, 35: 125, 41: 121, 47: 117,
          3: 113, 13: 109, 19: 105, 31: 101, 37: 97, 43: 93,
          5: 89, 15: 85, 21: 81, 27: 77, 33: 73, 39: 69, 45: 65, 49: 61,
          1: 57, 2: 53, 9: 45, 4: 13, 8: 9, 12: 5, 16: 1
        },
        totalDraws: 2100,
        avgSum: 140,
        sumRange: [100, 180],
        hotNumbers: [7, 11, 17, 23, 29],
        coldNumbers: [1, 2, 5, 9, 15],
        patterns: { evenOdd: "3:2", lowHigh: "3:2", sumRange: "110-170" },
        euroNumbers: {
          mostFrequent: [3, 5, 7, 9, 11],
          leastFrequent: [1, 2, 4, 6, 8, 10, 12],
          frequencyData: {
            3: 89, 5: 85, 7: 81, 9: 77, 11: 73,
            1: 69, 2: 65, 4: 61, 6: 57, 8: 53, 10: 49, 12: 45
          }
        }
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
        patterns: { evenOdd: "6:6", lowHigh: "6:6", sumRange: "130-170" }
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
        patterns: { evenOdd: "10:10", lowHigh: "10:10", sumRange: "780-840" }
      }
    };

    return defaultStats[game] || defaultStats.lotto;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: '#1976d2', marginBottom: '16px' }}>
          📊 Ładowanie statystyk...
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Pobieranie z cache lub aktualizacja w tle
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

  if (error) {
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
          onClick={() => window.location.reload()}
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

  const currentGame = gameNames[selectedGame] || selectedGame;
  
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
          value={selectedGame} 
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
            <p style={statValueStyle}>{stats.sumRange ? `${stats.sumRange[0]} - ${stats.sumRange[1]}` : 'Brak danych'}</p>
            <p style={statDescriptionStyle}>Zakres wartości sumy wszystkich liczb w losowaniu.</p>
          </div>
          <div style={statCardStyle}>
            <h4 style={statTitleStyle}>Status</h4>
            <p style={statValueStyle}>
              <span style={{ color: '#4caf50' }}>✅ Aktywne</span>
            </p>
            <p style={statDescriptionStyle}>Aktualny status gry (np. czy gra jest dostępna).</p>
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
              <Ball n={parseInt(number)} />
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
                    <Ball n={n} />
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
                    <Ball n={n} />
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
      
      {/* Specjalne sekcje dla Eurojackpot */}
      {selectedGame === "eurojackpot" && stats.euroNumbers && (
        <>
          {/* Liczby główne Eurojackpot (1-50) */}
          <div style={sectionStyle}>
            <h3 style={{ ...sectionTitleStyle, color: "#1976d2" }}>
              🎯 Liczby główne Eurojackpot (1-50)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
              <div>
                <h4 style={{ color: "#4caf50", marginBottom: 12 }}>✅ Najczęstsze liczby główne</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {stats.euroNumbers.mainNumbers.mostFrequent.map((n, idx) => (
                    <div key={n} style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center" 
                    }}>
                      <Ball n={n} />
                      <div style={{ fontSize: 10, color: "#4caf50", fontWeight: "bold" }}>
                        {stats.euroNumbers.mainNumbers.frequencyData[n]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ color: "#f44336", marginBottom: 12 }}>❌ Najrzadsze liczby główne</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {stats.euroNumbers.mainNumbers.leastFrequent.map((n, idx) => (
                    <div key={n} style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center" 
                    }}>
                      <Ball n={n} />
                      <div style={{ fontSize: 10, color: "#f44336", fontWeight: "bold" }}>
                        {stats.euroNumbers.mainNumbers.frequencyData[n]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Liczby Euro (1-12) */}
          <div style={sectionStyle}>
            <h3 style={{ ...sectionTitleStyle, color: "#ff5722" }}>
              🇪🇺 Liczby Euro (1-12)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
              <div>
                <h4 style={{ color: "#4caf50", marginBottom: 12 }}>✅ Najczęstsze liczby Euro</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {stats.euroNumbers.euroNumbers.mostFrequent.map((n, idx) => (
                    <div key={n} style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center" 
                    }}>
                      <Ball n={n} />
                      <div style={{ fontSize: 10, color: "#4caf50", fontWeight: "bold" }}>
                        {stats.euroNumbers.euroNumbers.frequencyData[n]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ color: "#f44336", marginBottom: 12 }}>❌ Najrzadsze liczby Euro</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {stats.euroNumbers.euroNumbers.leastFrequent.map((n, idx) => (
                    <div key={n} style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center" 
                    }}>
                      <Ball n={n} />
                      <div style={{ fontSize: 10, color: "#f44336", fontWeight: "bold" }}>
                        {stats.euroNumbers.euroNumbers.frequencyData[n]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Wzorce Eurojackpot */}
          <div style={sectionStyle}>
            <h3 style={{ ...sectionTitleStyle, color: "#9c27b0" }}>
              📊 Wzorce Eurojackpot
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div style={{ 
                background: "#e3f2fd", 
                padding: 16, 
                borderRadius: 8,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
                <strong>Liczby główne - Parzyste:Nieparzyste</strong><br />
                <span style={{ fontSize: 18, color: "#1976d2" }}>{stats.euroNumbers.patterns.mainEvenOdd}</span>
              </div>
              <div style={{ 
                background: "#f3e5f5", 
                padding: 16, 
                borderRadius: 8,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🇪🇺</div>
                <strong>Liczby Euro - Parzyste:Nieparzyste</strong><br />
                <span style={{ fontSize: 18, color: "#9c27b0" }}>{stats.euroNumbers.patterns.euroEvenOdd}</span>
              </div>
              <div style={{ 
                background: "#fff3e0", 
                padding: 16, 
                borderRadius: 8,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📈</div>
                <strong>Zakres liczb głównych</strong><br />
                <span style={{ fontSize: 18, color: "#f57c00" }}>{stats.euroNumbers.patterns.mainSumRange}</span>
              </div>
              <div style={{ 
                background: "#e8f5e8", 
                padding: 16, 
                borderRadius: 8,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🎲</div>
                <strong>Zakres liczb Euro</strong><br />
                <span style={{ fontSize: 18, color: "#4caf50" }}>{stats.euroNumbers.patterns.euroSumRange}</span>
              </div>
            </div>
          </div>
        </>
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
      
      {/* Przyciski aktualizacji - POPRAWIONE */}
      <div style={sectionStyle}>
        <h3 style={{ ...sectionTitleStyle, color: "#2196f3" }}>
          🔄 Aktualizacja danych
        </h3>
        
        {/* Komunikat o aktualizacji */}
        {(updatingStats || updatingAllStats) && (
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
              {updatingStats ? `Aktualizuję statystyki dla ${currentGame}...` : 
               updatingAllStats ? "Aktualizuję wszystkie statystyki..." : ""}
            </span>
          </div>
        )}
        
        <div style={buttonContainerStyle}>
          <button 
            onClick={async () => {
              if (updatingStats) return;
              
              setUpdatingStats(true);
              try {
                console.log(`🔄 Rozpoczynam aktualizację statystyk dla ${currentGame}...`);
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/update-stats/${selectedGame}`, { 
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                });
                const result = await response.json();
                
                if (result.success) {
                  // Pokaż komunikat sukcesu
                  alert(`✅ Statystyki dla ${currentGame} zostały zaktualizowane!`);
                  
                  // Odśwież dane
                  setTimeout(() => {
                    const fetchUpdatedStats = async () => {
                      try {
                        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/statistics/${selectedGame}`);
                        if (response.ok) {
                          const data = await response.json();
                          if (data.success) {
                            setStats(data.statistics || data.data);
                            setLastUpdated(data.lastUpdated);
                          }
                        }
                      } catch (error) {
                        console.error('Błąd odświeżania danych:', error);
                      }
                    };
                    fetchUpdatedStats();
                  }, 1000);
                } else {
                  throw new Error(result.error || 'Nieznany błąd');
                }
              } catch (error) {
                console.error('❌ Błąd aktualizacji:', error);
                alert(`❌ Błąd aktualizacji: ${error.message}`);
              } finally {
                setUpdatingStats(false);
              }
            }}
            disabled={updatingStats || updatingAllStats}
            style={buttonStyle}
          >
            {updatingStats ? (
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
          
          <button 
            onClick={async () => {
              if (updatingAllStats) return;
              
              setUpdatingAllStats(true);
              try {
                console.log('🔄 Rozpoczynam aktualizację wszystkich statystyk...');
                                  const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/refresh-stats`, { 
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                });
                const result = await response.json();
                
                if (result.success) {
                  alert(`✅ ${result.message}!`);
                  
                  // Odśwież dane
                  setTimeout(() => {
                    const fetchUpdatedStats = async () => {
                      try {
                        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/statistics/${selectedGame}`);
                        if (response.ok) {
                          const data = await response.json();
                          if (data.success) {
                            setStats(data.statistics || data.data);
                            setLastUpdated(data.lastUpdated);
                          }
                        }
                      } catch (error) {
                        console.error('Błąd odświeżania danych:', error);
                      }
                    };
                    fetchUpdatedStats();
                  }, 1000);
                } else {
                  throw new Error(result.error || 'Nieznany błąd');
                }
              } catch (error) {
                console.error('❌ Błąd aktualizacji wszystkich statystyk:', error);
                alert(`❌ Błąd aktualizacji: ${error.message}`);
              } finally {
                setUpdatingAllStats(false);
              }
            }}
            disabled={updatingStats || updatingAllStats}
            style={greenButtonStyle}
          >
            {updatingAllStats ? (
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
                Aktualizuję wszystkie...
              </>
            ) : (
              '🔄 Aktualizuj wszystkie gry'
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
          Możesz też ręcznie zaktualizować dane używając powyższych przycisków.
        </div>
      </div>
    </div>
  );
};

export default Statistics; 