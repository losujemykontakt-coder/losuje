import React, { useState, useEffect } from 'react';
import LottoResults from './LottoResults';
import LottoWinnings from './LottoWinnings';

const ResultsAndWinnings = () => {
  const [activeTab, setActiveTab] = useState('wyniki');
  const [selectedDays, setSelectedDays] = useState(0);
  const [selectedGame, setSelectedGame] = useState('all');

  const games = [
    { value: 'all', label: 'Wszystkie gry' },
    { value: 'lotto', label: 'Lotto' },
    { value: 'miniLotto', label: 'Mini Lotto' },
    { value: 'multiMulti', label: 'Multi Multi' },
    { value: 'eurojackpot', label: 'Eurojackpot' },
    { value: 'kaskada', label: 'Kaskada' },
    { value: 'keno', label: 'Keno' }
  ];

  // SEO - aktualizuj URL i meta tagi
  useEffect(() => {
    const updateSEO = () => {
      const game = games.find(g => g.value === selectedGame);
      const gameName = game ? game.label : 'Wszystkie gry';
      
      // Aktualizuj URL
      const url = new URL(window.location);
      if (activeTab === 'wyniki') {
        url.searchParams.set('page', 'wyniki');
        url.searchParams.set('game', selectedGame);
        url.searchParams.set('days', selectedDays);
      } else {
        url.searchParams.set('page', 'wygrane');
        url.searchParams.set('game', selectedGame);
        url.searchParams.set('days', selectedDays);
      }
      window.history.replaceState({}, '', url);
      
      // Aktualizuj meta tagi
      const title = activeTab === 'wyniki' 
        ? `Wyniki ${gameName} - Aktualne losowania | Lotek Generator`
        : `Wygrane ${gameName} - Informacje o nagrodach | Lotek Generator`;
      
      const description = activeTab === 'wyniki'
        ? `Sprawdź najnowsze wyniki ${gameName.toLowerCase()}. Aktualne liczby z ostatnich losowań, statystyki i analizy.`
        : `Sprawdź wygrane w ${gameName.toLowerCase()}. Informacje o nagrodach, zwycięzcach i lokalizacjach.`;
      
      document.title = title;
      
      // Aktualizuj meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;
    };
    
    updateSEO();
  }, [activeTab, selectedGame, selectedDays]);

  const tabStyle = {
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px 8px 0 0",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginRight: "4px"
  };

  const activeTabStyle = {
    ...tabStyle,
    background: "#ffd700",
    color: "#333",
    boxShadow: "0 2px 8px rgba(255, 193, 7, 0.3)"
  };

  const inactiveTabStyle = {
    ...tabStyle,
    background: "#f5f5f5",
    color: "#666",
    boxShadow: "none"
  };

  const containerStyle = {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "30px"
  };

  const titleStyle = {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px"
  };

  const subtitleStyle = {
    fontSize: "16px",
    color: "#666",
    marginBottom: "20px"
  };

  const tabsContainerStyle = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
    borderBottom: "2px solid #e0e0e0"
  };

  const controlsStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "30px",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "8px"
  };

  const selectStyle = {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    background: "#fff",
    minWidth: "160px"
  };

  const labelStyle = {
    fontWeight: "600",
    color: "#333",
    marginRight: "8px"
  };

  const gameCardStyle = {
    background: "#fff",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
    border: "1px solid #e0e0e0",
    transition: "all 0.3s ease",
    cursor: "pointer",
    textAlign: "center"
  };

  return (
    <div style={containerStyle}>
      {/* Nagłówek */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Wyniki i Wygrane Lotto</h1>
        <p style={subtitleStyle}>
          Sprawdź najnowsze wyniki losowań i informacje o wygranych dla wszystkich gier liczbowych
        </p>
      </div>

      {/* Zakładki */}
      <div style={tabsContainerStyle}>
        <button
          style={activeTab === 'wyniki' ? activeTabStyle : inactiveTabStyle}
          onClick={() => setActiveTab('wyniki')}
        >
          Wyniki
        </button>
        <button
          style={activeTab === 'wygrane' ? activeTabStyle : inactiveTabStyle}
          onClick={() => setActiveTab('wygrane')}
        >
          Wygrane
        </button>
      </div>

      {/* Kontrolki wspólne */}
      <div style={controlsStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={labelStyle}>Gra:</label>
          <select 
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            style={selectStyle}
          >
            {games.map(game => (
              <option key={game.value} value={game.value}>
                {game.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={labelStyle}>Okres:</label>
          <select 
            value={selectedDays}
            onChange={(e) => setSelectedDays(parseInt(e.target.value))}
            style={selectStyle}
          >
            <option value={0}>Dzisiaj</option>
            <option value={1}>1 dzień</option>
            <option value={2}>2 dni</option>
            <option value={3}>3 dni</option>
            <option value={7}>Tydzień</option>
            <option value={30}>Miesiąc</option>
          </select>
        </div>
      </div>

      {/* Szybki wybór gier */}
      {selectedGame === 'all' && (
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#333", fontSize: "18px" }}>
            Wybierz konkretną grę:
          </h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
            gap: "12px",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            {games.filter(game => game.value !== 'all').map(game => (
              <div
                key={game.value}
                style={gameCardStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  e.target.style.borderColor = "#ffd700";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                onClick={() => setSelectedGame(game.value)}
              >
                <div style={{ fontWeight: "600", color: "#333", fontSize: "16px" }}>
                  {game.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zawartość zakładek */}
      <div style={{ minHeight: "400px" }}>
        {activeTab === 'wyniki' && (
          <div>
            <div style={{
              background: "#e3f2fd",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              <h3 style={{ color: "#1976d2", margin: "0 0 8px 0", fontSize: "18px" }}>
                Najnowsze Wyniki Losowań
              </h3>
              <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
                Sprawdź wyniki wszystkich gier liczbowych w czasie rzeczywistym
              </p>
            </div>
            <LottoResults 
              selectedGame={selectedGame}
              selectedDays={selectedDays}
            />
          </div>
        )}

        {activeTab === 'wygrane' && (
          <div>
            <div style={{
              background: "#fff3e0",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              <h3 style={{ color: "#f57c00", margin: "0 0 8px 0", fontSize: "18px" }}>
                Informacje o Wygranych
              </h3>
              <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
                Sprawdź główne wygrane, liczbę zwycięzców i podział nagród
              </p>
            </div>
            <LottoWinnings 
              selectedGame={selectedGame}
              selectedDays={selectedDays}
            />
          </div>
        )}
      </div>

      {/* Informacja o źródle danych */}
      <div style={{
        textAlign: "center",
        marginTop: "30px",
        padding: "16px",
        background: "#f8f9fa",
        borderRadius: "8px",
        fontSize: "14px",
        color: "#666"
      }}>
        Wszystkie dane pobierane z lotto.pl w czasie rzeczywistym
      </div>
    </div>
  );
};

export default ResultsAndWinnings; 