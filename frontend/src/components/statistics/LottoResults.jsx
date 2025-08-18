import React, { useState, useEffect } from 'react';

const LottoResults = ({ selectedGame, selectedDays }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [daysBack, setDaysBack] = useState(selectedDays || 7);
  const [activeTab, setActiveTab] = useState('results');

  const games = [
    { value: "lotto", label: "Lotto", numbers: 6, max: 49 },
    { value: "miniLotto", label: "Mini Lotto", numbers: 5, max: 42 },
    { value: "multiMulti", label: "Multi Multi", numbers: 10, max: 80 },
    { value: "eurojackpot", label: "Eurojackpot", numbers: 5, max: 50, euro: 2, euroMax: 12 },
    { value: "kaskada", label: "Kaskada", numbers: 12, max: 24 },
    { value: "keno", label: "Keno", numbers: 10, max: 70 },
  ];

  const fetchResults = async () => {
    if (!selectedGame) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/results/${selectedGame}?days=${daysBack}&type=all`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
          console.log(`✅ Pobrano wyniki dla ${selectedGame}:`, data.data);
        } else {
          setError('Błąd pobierania wyników');
        }
      } else {
        setError('Błąd połączenia z serwerem');
      }
    } catch (error) {
      console.error('❌ Błąd pobierania wyników:', error);
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedGame, daysBack]);

  useEffect(() => {
    if (selectedDays !== undefined) {
      setDaysBack(selectedDays);
    }
  }, [selectedDays]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Komponent kuli - żółta kula z czarnymi liczbami jak w lotto
  const Ball = ({ n, isEuro = false }) => (
    <div style={{
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: isEuro ? '#ff5722' : '#ffd700',
      color: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: 16,
      margin: 4,
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      border: '2px solid #fff',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'scale(1.1)';
      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'scale(1)';
      e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    }}
    >
      {n}
    </div>
  );

  const containerStyle = {
    background: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 16
  };

  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    background: isActive ? '#ffd700' : '#f5f5f5',
    color: isActive ? '#333' : '#666',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
    fontSize: 14
  });

  const controlsStyle = {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const selectStyle = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
    background: '#fff',
    minWidth: '140px'
  };

  const resultCardStyle = {
    background: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    border: '1px solid #e9ecef',
    transition: 'all 0.3s ease'
  };

  const numbersContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center'
  };

  const euroContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center'
  };

  const prizeStyle = {
    background: '#4caf50',
    color: 'white',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8
  };

  const winnersStyle = {
    background: '#ff9800',
    color: 'white',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8
  };

  const locationStyle = {
    background: '#9c27b0',
    color: 'white',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8
  };

  const gameInfo = games.find(g => g.value === selectedGame) || games[0];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: 'bold' }}>
            Wyniki {gameInfo.label}
          </h2>
        </div>
        
        <div style={controlsStyle}>
          <select 
            value={daysBack} 
            onChange={(e) => setDaysBack(parseInt(e.target.value))}
            style={selectStyle}
          >
            <option value={1}>Ostatni dzień</option>
            <option value={3}>Ostatnie 3 dni</option>
            <option value={7}>Ostatni tydzień</option>
            <option value={14}>Ostatnie 2 tygodnie</option>
            <option value={30}>Ostatni miesiąc</option>
          </select>
          
          <button 
            onClick={() => setActiveTab('results')}
            style={tabStyle(activeTab === 'results')}
          >
            Wyniki
          </button>
          
          <button 
            onClick={() => setActiveTab('winners')}
            style={tabStyle(activeTab === 'winners')}
          >
            Wygrane
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontSize: 18, color: '#666' }}>Ładowanie wyników...</div>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: 30, color: '#f44336' }}>
          <div style={{ fontSize: 16 }}>{error}</div>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: 30, color: '#666' }}>
          <div style={{ fontSize: 16 }}>Brak wyników dla wybranych kryteriów</div>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div>
          <div style={{ 
            marginBottom: 20, 
            color: '#666', 
            fontSize: 14,
            textAlign: 'center',
            padding: '12px',
            background: '#e8f5e8',
            borderRadius: '6px'
          }}>
            Znaleziono {results.length} wyników dla {gameInfo.label} z ostatnich {daysBack} dni
          </div>
          
          {results.map((result, index) => (
            <div key={index} style={resultCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#333', 
                      fontSize: '16px',
                      background: '#ffd700',
                      padding: '6px 12px',
                      borderRadius: '6px'
                    }}>
                      Losowanie #{result.drawNumber}
                    </span>
                    <span style={{ 
                      color: '#666', 
                      fontSize: 14,
                      background: '#f5f5f5',
                      padding: '6px 12px',
                      borderRadius: '6px'
                    }}>
                      {formatDate(result.date)}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#333', 
                      marginBottom: 8,
                      fontSize: '16px',
                      textAlign: 'center'
                    }}>
                      Liczby główne:
                    </div>
                    <div style={numbersContainerStyle}>
                      {result.numbers.map((num, idx) => (
                        <Ball key={idx} n={num} />
                      ))}
                    </div>
                  </div>
                  
                  {result.euroNumbers && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: '#333', 
                        marginBottom: 8,
                        fontSize: '16px',
                        textAlign: 'center'
                      }}>
                        Liczby Euro:
                      </div>
                      <div style={euroContainerStyle}>
                        {result.euroNumbers.map((num, idx) => (
                          <Ball key={idx} n={num} isEuro={true} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ 
                    fontSize: 14, 
                    color: '#666',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    padding: '8px',
                    borderRadius: '6px',
                    marginTop: '12px'
                  }}>
                    Suma: <strong>{result.sum}</strong> | 
                    Liczby: <strong>{result.numbers.length}</strong>
                    {result.euroNumbers && ` + ${result.euroNumbers.length} Euro`}
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 6, 
                  alignItems: 'flex-end',
                  minWidth: '160px'
                }}>
                  {result.prize && (
                    <span style={prizeStyle}>
                      {result.prize}
                    </span>
                  )}
                  
                  {result.winners && (
                    <span style={winnersStyle}>
                      {result.winners}
                    </span>
                  )}
                  
                  {result.location && (
                    <span style={locationStyle}>
                      {result.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LottoResults; 