import React, { useState, useEffect } from 'react';

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

const NewStatistics = ({ selectedGame, onGameChange }) => {
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

  // Responsive styles
  const isMobile = window.innerWidth <= 768;
  const isSmallMobile = window.innerWidth <= 480;

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

  // Funkcja do pobierania danych
  const fetchStats = async (gameType) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Pobieranie statystyk dla gry: ${gameType}`);
      const response = await fetch(`http://localhost:3001/api/statistics/${gameType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStats(result.statistics);
        setLastUpdated(result.lastUpdated);
        console.log('✅ Statystyki pobrane pomyślnie');
      } else {
        throw new Error(result.error || 'Błąd pobierania danych');
      }
    } catch (err) {
      console.error('❌ Błąd pobierania statystyk:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do aktualizacji danych
  const updateStats = async () => {
    try {
      setUpdating(true);
      console.log(`🔄 Aktualizuję statystyki dla gry: ${selectedGame}`);
      
      const response = await fetch(`http://localhost:3001/api/statistics/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameType: selectedGame })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Pobierz zaktualizowane dane
        await fetchStats(selectedGame);
        alert(`✅ Statystyki dla ${gameNames[selectedGame]} zostały zaktualizowane!`);
      } else {
        throw new Error(result.error || 'Błąd aktualizacji');
      }
    } catch (err) {
      console.error('❌ Błąd aktualizacji:', err);
      alert(`❌ Błąd aktualizacji: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Pobierz dane przy pierwszym załadowaniu i przy zmianie gry
  useEffect(() => {
    if (selectedGame) {
      fetchStats(selectedGame);
    }
  }, [selectedGame]);

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
          onClick={() => fetchStats(selectedGame)}
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

export default NewStatistics;

