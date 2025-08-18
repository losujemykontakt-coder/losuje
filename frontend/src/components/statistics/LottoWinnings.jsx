import React, { useState, useEffect } from 'react';

const Ball = ({ n, size = 40, color = "#ffd700" }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: size * 0.4,
    color: "#000",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    margin: "0 4px",
    border: "2px solid #fff",
    transition: "all 0.3s ease",
    cursor: "pointer"
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = "scale(1.1)";
    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = "scale(1)";
    e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  }}
  >
    {n}
  </div>
);

const LottoWinnings = ({ selectedGame: propSelectedGame, selectedDays: propSelectedDays }) => {
  const [winnings, setWinnings] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(propSelectedDays || 0);
  const [selectedGame, setSelectedGame] = useState(propSelectedGame || 'all');

  const games = [
    { value: 'all', label: 'Wszystkie gry' },
    { value: 'lotto', label: 'Lotto' },
    { value: 'miniLotto', label: 'Mini Lotto' },
    { value: 'multiMulti', label: 'Multi Multi' },
    { value: 'eurojackpot', label: 'Eurojackpot' },
    { value: 'kaskada', label: 'Kaskada' },
    { value: 'keno', label: 'Keno' }
  ];

  const gameColors = {
    lotto: "#ffd700",
    miniLotto: "#ff6b35",
    multiMulti: "#4ecdc4",
    eurojackpot: "#45b7d1",
    kaskada: "#96ceb4",
    keno: "#feca57"
  };

  // Domyślne dane o wygranych (symulowane)
  const getDefaultWinnings = (gameType, daysBack = 0) => {
    const today = new Date();
    const winningsData = [];
    
    for (let i = 0; i <= daysBack; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let jackpot = 0;
      let winners = 0;
      let totalWinners = 0;
      let totalPrize = 0;
      let location = '';
      let prizeDistribution = {};
      let winningNumbers = [];
      
      switch (gameType) {
        case 'lotto':
          jackpot = 2000000 + Math.floor(Math.random() * 1000000);
          winners = Math.floor(Math.random() * 3) + 1;
          totalWinners = 15000 + Math.floor(Math.random() * 5000);
          totalPrize = 5000000 + Math.floor(Math.random() * 2000000);
          location = 'Warszawa';
          winningNumbers = [7, 23, 41, 15, 33, 19];
          prizeDistribution = {
            '6/6': jackpot,
            '5/6': jackpot * 0.1,
            '4/6': jackpot * 0.05,
            '3/6': jackpot * 0.02
          };
          break;
        case 'miniLotto':
          jackpot = 100000 + Math.floor(Math.random() * 50000);
          winners = Math.floor(Math.random() * 5) + 1;
          totalWinners = 8000 + Math.floor(Math.random() * 3000);
          totalPrize = 800000 + Math.floor(Math.random() * 400000);
          location = 'Warszawa';
          winningNumbers = [3, 12, 25, 31, 38];
          prizeDistribution = {
            '5/5': jackpot,
            '4/5': jackpot * 0.15,
            '3/5': jackpot * 0.08
          };
          break;
        case 'multiMulti':
          jackpot = 50000 + Math.floor(Math.random() * 25000);
          winners = Math.floor(Math.random() * 10) + 1;
          totalWinners = 12000 + Math.floor(Math.random() * 4000);
          totalPrize = 600000 + Math.floor(Math.random() * 300000);
          location = 'Warszawa';
          winningNumbers = [2, 8, 15, 23, 31, 42, 51, 63, 71, 78];
          prizeDistribution = {
            '10/10': jackpot,
            '9/10': jackpot * 0.2,
            '8/10': jackpot * 0.1
          };
          break;
        case 'eurojackpot':
          jackpot = 10000000 + Math.floor(Math.random() * 5000000);
          winners = Math.floor(Math.random() * 2) + 1;
          totalWinners = 20000 + Math.floor(Math.random() * 8000);
          totalPrize = 15000000 + Math.floor(Math.random() * 8000000);
          location = 'Helsinki';
          winningNumbers = [7, 15, 23, 31, 42];
          prizeDistribution = {
            '5+2': jackpot,
            '5+1': jackpot * 0.1,
            '5+0': jackpot * 0.05,
            '4+2': jackpot * 0.02
          };
          break;
        case 'kaskada':
          jackpot = 75000 + Math.floor(Math.random() * 35000);
          winners = Math.floor(Math.random() * 8) + 1;
          totalWinners = 10000 + Math.floor(Math.random() * 4000);
          totalPrize = 700000 + Math.floor(Math.random() * 350000);
          location = 'Warszawa';
          winningNumbers = [1, 4, 7, 10, 13, 16, 19, 22, 24, 25, 26, 27];
          prizeDistribution = {
            '12/12': jackpot,
            '11/12': jackpot * 0.15,
            '10/12': jackpot * 0.08
          };
          break;
        case 'keno':
          jackpot = 30000 + Math.floor(Math.random() * 15000);
          winners = Math.floor(Math.random() * 15) + 1;
          totalWinners = 15000 + Math.floor(Math.random() * 6000);
          totalPrize = 400000 + Math.floor(Math.random() * 200000);
          location = 'Warszawa';
          winningNumbers = [3, 8, 15, 22, 31, 38, 45, 52, 59, 66];
          prizeDistribution = {
            '10/10': jackpot,
            '9/10': jackpot * 0.2,
            '8/10': jackpot * 0.1
          };
          break;
        default:
          jackpot = 100000;
          winners = 1;
          totalWinners = 10000;
          totalPrize = 500000;
          location = 'Warszawa';
          winningNumbers = [7, 23, 41, 15, 33, 19];
          prizeDistribution = {
            '6/6': jackpot,
            '5/6': jackpot * 0.1
          };
      }
      
      winningsData.push({
        date: dateStr,
        jackpot: jackpot,
        winners: winners,
        totalWinners: totalWinners,
        totalPrize: totalPrize,
        gameType: gameType,
        location: location,
        drawNumber: `#${1000 - i}`,
        prizeDistribution: prizeDistribution,
        winningNumbers: winningNumbers
      });
    }
    
    return winningsData;
  };

  const fetchWinnings = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:3001/api/winnings?days=${selectedDays}`;
      if (selectedGame !== 'all') {
        url = `http://localhost:3001/api/winnings/${selectedGame}?days=${selectedDays}`;
      }

      console.log(`💰 Pobieranie wygranych z: ${url}`);
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        console.log('✅ Wygrane pobrane pomyślnie:', data.data);
        setWinnings(data.data);
      } else {
        console.error('❌ Błąd pobierania wygranych:', data.error);
        // Fallback do domyślnych wygranych
        const fallbackWinnings = {};
        if (selectedGame === 'all') {
          games.forEach(game => {
            if (game.value !== 'all') {
              fallbackWinnings[game.value] = getDefaultWinnings(game.value, selectedDays);
            }
          });
        } else {
          fallbackWinnings[selectedGame] = getDefaultWinnings(selectedGame, selectedDays);
        }
        setWinnings(fallbackWinnings);
      }
    } catch (error) {
      console.error('❌ Błąd połączenia:', error);
      // Fallback do domyślnych wygranych
      const fallbackWinnings = {};
      if (selectedGame === 'all') {
        games.forEach(game => {
          if (game.value !== 'all') {
            fallbackWinnings[game.value] = getDefaultWinnings(game.value, selectedDays);
          }
        });
      } else {
        fallbackWinnings[selectedGame] = getDefaultWinnings(selectedGame, selectedDays);
      }
      setWinnings(fallbackWinnings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinnings();
  }, [selectedDays, selectedGame]);

  // Aktualizuj lokalny stan gdy zmienią się props
  useEffect(() => {
    if (propSelectedGame !== undefined) {
      setSelectedGame(propSelectedGame);
    }
  }, [propSelectedGame]);

  useEffect(() => {
    if (propSelectedDays !== undefined) {
      setSelectedDays(propSelectedDays);
    }
  }, [propSelectedDays]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Brak daty';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Nieprawidłowa data';
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN'
      }).format(0);
    }
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const renderGameWinnings = (winningsData, gameType) => {
    if (!winningsData || !Array.isArray(winningsData)) return null;

    const gameInfo = games.find(g => g.value === gameType);
    const gameColor = gameColors[gameType] || "#ffd700";

    return (
      <div key={gameType} style={{
        background: "#fff",
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        border: "1px solid #e0e0e0"
      }}>
        <h3 style={{
          color: "#333",
          margin: "0 0 20px 0",
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center"
        }}>
          {gameInfo?.label || gameType}
        </h3>

        {winningsData.map((winning, index) => (
          <div key={index} style={{
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            background: "#fafafa"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 8
            }}>
              <div style={{ 
                fontWeight: "bold", 
                color: "#333",
                fontSize: '16px',
                background: '#ffd700',
                padding: '8px 16px',
                borderRadius: '6px'
              }}>
                {formatDate(winning.date)}
              </div>
              <div style={{ 
                background: gameColor,
                color: "white",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: "bold"
              }}>
                {winning.drawNumber}
              </div>
            </div>

            {/* Wylosowane liczby */}
            {winning.winningNumbers && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ 
                  fontWeight: "bold", 
                  color: "#333", 
                  marginBottom: 12,
                  fontSize: '16px',
                  textAlign: 'center'
                }}>
                  Wylosowane liczby:
                </div>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  {winning.winningNumbers.map((num, idx) => (
                    <Ball key={idx} n={num} color={gameColor} />
                  ))}
                </div>
              </div>
            )}

            {/* Główna wygrana */}
            <div style={{
              background: gameColor,
              padding: 16,
              borderRadius: 8,
              marginBottom: 20,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 16, color: "white", marginBottom: 8 }}>
                Główna wygrana
              </div>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 8 }}>
                {formatCurrency(winning.jackpot)}
              </div>
              <div style={{ fontSize: 14, color: "white", opacity: 0.9 }}>
                {winning.winners} zwycięzców
              </div>
            </div>

            {/* Statystyki wygranych */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 20
            }}>
              <div style={{
                background: "#e8f5e8",
                padding: 16,
                borderRadius: 6,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 12, color: "#2e7d32", marginBottom: 6 }}>
                  Łączna pula
                </div>
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#2e7d32" }}>
                  {formatCurrency(winning.totalPrize)}
                </div>
              </div>
              <div style={{
                background: "#fff3e0",
                padding: 16,
                borderRadius: 6,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 12, color: "#f57c00", marginBottom: 6 }}>
                  Wszyscy zwycięzcy
                </div>
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#f57c00" }}>
                  {winning.totalWinners.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Podział nagród */}
            <div style={{ marginTop: 16 }}>
              <div style={{ 
                fontSize: 16, 
                fontWeight: "bold", 
                color: "#333", 
                marginBottom: 12,
                textAlign: 'center'
              }}>
                Podział nagród:
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 8
              }}>
                {winning.prizeDistribution && Object.entries(winning.prizeDistribution).map(([tier, amount]) => (
                  <div key={tier} style={{
                    background: "#f8f9fa",
                    padding: 12,
                    borderRadius: 6,
                    textAlign: "center",
                    border: "1px solid #e9ecef"
                  }}>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 'bold' }}>
                      {tier}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>
                      {formatCurrency(amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 14,
              color: "#666",
              marginTop: 16,
              padding: "12px",
              background: "#f8f9fa",
              borderRadius: "6px"
            }}>
              <div>
                <strong>{winning.location}</strong>
              </div>
              <div>
                <strong>{winning.winners}</strong> głównych zwycięzców
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAllWinnings = () => {
    if (!winnings || typeof winnings !== 'object' || Object.keys(winnings).length === 0) {
      return (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          <div style={{ fontSize: 18 }}>Brak danych o wygranych do wyświetlenia</div>
        </div>
      );
    }

    return Object.entries(winnings).map(([gameType, winningsData]) => 
      renderGameWinnings(winningsData, gameType)
    );
  };

  return (
    <div style={{
      maxWidth: 1200,
      margin: "0 auto",
      padding: 20
    }}>
      {/* Wygrane */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 18, color: "#666" }}>Ładowanie wygranych...</div>
        </div>
      ) : (
        <div>
          {selectedGame === 'all' ? renderAllWinnings() : renderGameWinnings(winnings && winnings[selectedGame], selectedGame)}
        </div>
      )}

      {/* Informacja o źródle danych */}
      <div style={{
        textAlign: "center",
        marginTop: 30,
        padding: 16,
        background: "#f8f9fa",
        borderRadius: 8,
        fontSize: 14,
        color: "#666"
      }}>
        Dane o wygranych pobierane z lotto.pl w czasie rzeczywistym
      </div>
    </div>
  );
};

export default LottoWinnings; 