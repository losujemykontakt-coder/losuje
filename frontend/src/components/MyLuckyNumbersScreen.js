import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import notificationService from '../utils/notificationService';
import schedulerService from '../utils/schedulerService';
import luckyNumbersGenerator from '../utils/luckyNumbersGenerator';
import './MyLuckyNumbersScreen.css';

const MyLuckyNumbersScreen = ({ user, onLogout, addToFavorites, removeFromFavorites, isFavorite, getFavoriteId }) => {
  const { t } = useTranslation();
  const [luckyNumbersHistory, setLuckyNumbersHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [schedulerStatus, setSchedulerStatus] = useState(null);

  const games = [
    { value: 'all', label: 'Wszystkie gry', icon: '🎯' },
    { value: 'lotto', label: 'Lotto', icon: '🎯' },
    { value: 'miniLotto', label: 'Mini Lotto', icon: '🎲' },
    { value: 'multiMulti', label: 'Multi Multi', icon: '🎰' },
    { value: 'eurojackpot', label: 'Eurojackpot', icon: '🇪🇺' },
    { value: 'kaskada', label: 'Kaskada', icon: '🌊' },
    { value: 'keno', label: 'Keno', icon: '🎲' }
  ];

  // Wczytanie historii z localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('luckyNumbersHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setLuckyNumbersHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Błąd podczas wczytywania historii:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sprawdzenie statusu powiadomień
  useEffect(() => {
    const checkNotificationStatus = () => {
      const status = notificationService.getStatus();
      setNotificationStatus(status);
      
      const schedulerStats = schedulerService.getStats();
      setSchedulerStatus(schedulerStats);
      
      console.log('📊 Status powiadomień:', status);
      console.log('📊 Status schedulera:', schedulerStats);
    };

    checkNotificationStatus();
    const interval = setInterval(checkNotificationStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Filtrowanie i sortowanie historii
  const filteredHistory = luckyNumbersHistory
    .filter(entry => selectedGame === 'all' || entry.gameType === selectedGame)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'game') {
        return a.gameType.localeCompare(b.gameType);
      }
      return 0;
    });

  // Funkcja do usuwania wpisu z historii
  const deleteHistoryEntry = (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten wpis z historii?')) {
      const updatedHistory = luckyNumbersHistory.filter(entry => entry.id !== id);
      setLuckyNumbersHistory(updatedHistory);
      localStorage.setItem('luckyNumbersHistory', JSON.stringify(updatedHistory));
    }
  };

  // Funkcja do kopiowania zestawu do schowka
  const copyToClipboard = (numbers, gameType) => {
    let numbersText = '';
    
    if (gameType === 'eurojackpot' && Array.isArray(numbers) && Array.isArray(numbers[0]) && Array.isArray(numbers[1])) {
      const mainNumbers = numbers[0].join(', ');
      const euroNumbers = numbers[1].join(', ');
      numbersText = `Główne: ${mainNumbers} | Euro: ${euroNumbers}`;
    } else if (Array.isArray(numbers)) {
      numbersText = numbers.join(', ');
    }
    
    navigator.clipboard.writeText(numbersText).then(() => {
      // Powiadomienie o skopiowaniu
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      notification.textContent = '✅ Zestaw skopiowany!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
    }).catch(err => {
      console.error("Błąd kopiowania:", err);
    });
  };

  // Funkcja do formatowania liczb
  const formatNumbers = (numbers, gameType) => {
    if (gameType === 'eurojackpot' && Array.isArray(numbers) && Array.isArray(numbers[0]) && Array.isArray(numbers[1])) {
      return (
        <div>
          <div>Główne: {numbers[0].map(n => <span key={n} className="number-ball">{n}</span>)}</div>
          <div>Euro: {numbers[1].map(n => <span key={n} className="euro-ball">{n}</span>)}</div>
        </div>
      );
    } else if (Array.isArray(numbers)) {
      return numbers.map(n => <span key={n} className="number-ball">{n}</span>);
    }
    return <span>Błąd formatowania</span>;
  };

  // Funkcja do formatowania daty
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funkcja do testowania powiadomień i generowania liczb
  const testLuckyNumbersNotification = async () => {
    try {
      console.log('🧪 Testowanie generowania liczb dla wszystkich gier...');
      
      // Sprawdź czy już trwa generowanie
      if (window.isGeneratingTest) {
        console.log('⚠️ Generowanie już trwa, czekaj...');
        return;
      }
      
      window.isGeneratingTest = true;
      
      // Wyczyść istniejące powiadomienia
      notificationService.closeNotification();
      
      // Generuj liczby dla wszystkich gier
      const games = ['lotto', 'miniLotto', 'multiMulti', 'eurojackpot', 'kaskada', 'keno'];
      const generatedNumbers = [];
      
      for (const gameType of games) {
        try {
          console.log(`🎲 Generowanie liczb dla ${gameType}...`);
          const luckyNumbers = luckyNumbersGenerator.generateLuckyNumbersUltraPro(gameType);
          
          // Zapisz do historii
          luckyNumbersGenerator.saveLuckyNumbersToHistory(luckyNumbers);
          
          // Wyślij powiadomienie
          if (notificationService.hasPermission()) {
            notificationService.showLuckyNumbersNotification(luckyNumbers.numbers, gameType);
            console.log(`✅ Powiadomienie wysłane dla ${gameType}`);
          } else {
            console.log(`⚠️ Brak pozwolenia na powiadomienia dla ${gameType}`);
          }
          
          generatedNumbers.push(luckyNumbers);
          
          // Krótka przerwa między generowaniem
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`❌ Błąd podczas generowania liczb dla ${gameType}:`, error);
        }
      }
      
      // Odśwież historię
      const updatedHistory = luckyNumbersGenerator.getLuckyNumbersHistory();
      setLuckyNumbersHistory(updatedHistory);
      
      console.log(`✅ Wygenerowano ${generatedNumbers.length} zestawów testowych`);
      
      // Wyślij podsumowanie
      if (notificationService.hasPermission()) {
        notificationService.showInfoNotification(
          '🎲 Test zakończony!',
          `Wygenerowano ${generatedNumbers.length} zestawów testowych dla wszystkich gier.`
        );
      }
      
      window.isGeneratingTest = false;
      
    } catch (error) {
      console.error('❌ Błąd podczas testowania powiadomienia o liczbach:', error);
      window.isGeneratingTest = false;
    }
  };

  // Funkcja do włączania/wyłączania powiadomień
  const toggleNotifications = async () => {
    try {
      if (notificationStatus?.hasPermission) {
        // Wyłącz powiadomienia
        notificationService.permission = 'denied';
        const newStatus = notificationService.getStatus();
        setNotificationStatus(newStatus);
        console.log('🔕 Powiadomienia wyłączone');
        alert('🔕 Powiadomienia zostały wyłączone');
      } else {
        // Włącz powiadomienia
        const granted = await notificationService.requestPermission();
        if (granted) {
          console.log('✅ Powiadomienia zostały włączone');
          alert('✅ Powiadomienia zostały włączone!');
        } else {
          console.log('❌ Powiadomienia zostały odrzucone');
          alert('❌ Powiadomienia zostały odrzucone. Sprawdź ustawienia przeglądarki.');
        }
        
        const newStatus = notificationService.getStatus();
        setNotificationStatus(newStatus);
      }
    } catch (error) {
      console.error('❌ Błąd podczas przełączania powiadomień:', error);
      alert('❌ Błąd podczas przełączania powiadomień: ' + error.message);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      console.log('🔔 Próba włączenia powiadomień...');
      
      // Sprawdź aktualny status
      const currentStatus = notificationService.getStatus();
      console.log('📊 Aktualny status:', currentStatus);
      
      const granted = await notificationService.requestPermission();
      
      if (granted) {
        console.log('✅ Pozwolenie na powiadomienia zostało udzielone');
        alert('✅ Powiadomienia zostały włączone! Możesz teraz testować.');
      } else {
        console.log('❌ Pozwolenie na powiadomienia zostało odrzucone');
        alert('❌ Powiadomienia zostały odrzucone. Sprawdź ustawienia przeglądarki.');
      }
      
      // Odśwież status
      const newStatus = notificationService.getStatus();
      setNotificationStatus(newStatus);
      
    } catch (error) {
      console.error('❌ Błąd podczas prośby o pozwolenie:', error);
      alert('❌ Błąd podczas włączania powiadomień: ' + error.message);
    }
  };

  // Sprawdzenie czy użytkownik jest zalogowany
  if (!user) {
    return (
      <div className="my-lucky-numbers-container">
        <div className="auth-required">
          <h2>🔒 Dostęp wymaga logowania</h2>
          <p>Musisz być zalogowany, aby zobaczyć historię swoich szczęśliwych liczb.</p>
          <button className="login-button" onClick={() => window.location.href = '/login'}>
            Zaloguj się
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="my-lucky-numbers-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Ładowanie historii...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-lucky-numbers-container">
      <div className="header">
        <h1>🎲 Moje szczęśliwe liczby</h1>
        <p>Twoje dzisiejsze szczęśliwe liczby, które wygenerował AI! ✨</p>
      </div>

      <div className="controls">
        <div className="filter-controls">
          <label>
            <span>🎮 Gra:</span>
            <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
              {games.map(game => (
                <option key={game.value} value={game.value}>
                  {game.icon} {game.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>📊 Sortuj według:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Data (najnowsze)</option>
              <option value="game">Gra</option>
            </select>
          </label>
        </div>

        <div className="stats">
          <span>📈 Łącznie: {filteredHistory.length} zestawów</span>
          {selectedGame !== 'all' && (
            <span>🎯 {games.find(g => g.value === selectedGame)?.label}: {
              filteredHistory.filter(entry => entry.gameType === selectedGame).length
            } zestawów</span>
          )}
        </div>
      </div>

      {/* Sekcja powiadomień */}
      <div className="notifications-section">
        <h3>🔔 Ustawienia powiadomień</h3>
        
        <div className="notification-status">
          <div className="status-item">
            <span>Status powiadomień:</span>
            <span className={`status ${notificationStatus?.hasPermission ? 'active' : 'inactive'}`}>
              {notificationStatus?.hasPermission ? '✅ Aktywne' : '❌ Nieaktywne'}
            </span>
          </div>
          
          <div className="status-item">
            <span>Scheduler:</span>
            <span className={`status ${schedulerStatus?.status?.isRunning ? 'active' : 'inactive'}`}>
              {schedulerStatus?.status?.isRunning ? '✅ Uruchomiony' : '❌ Zatrzymany'}
            </span>
          </div>
          
          {schedulerStatus?.status?.nextNotificationTime && (
            <div className="status-item">
              <span>Następne powiadomienie:</span>
              <span className="status active">
                {new Date(schedulerStatus.status.nextNotificationTime).toLocaleString('pl-PL')}
              </span>
            </div>
          )}
        </div>

        <div className="notification-controls">
          <button className="notification-btn" onClick={toggleNotifications}>
            {notificationStatus?.hasPermission ? '🔕 Wyłącz powiadomienia' : '🔔 Włącz powiadomienia'}
          </button>
          
          <button className="notification-btn" onClick={testLuckyNumbersNotification}>
            🎲 Generuj
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎲</div>
          <h3>Brak historii</h3>
          <p>Nie masz jeszcze żadnych zapisanych zestawów szczęśliwych liczb.</p>
          <p>Zestawy będą automatycznie zapisywane po wygenerowaniu.</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredHistory.map((entry) => (
            <div key={entry.id} className="history-item">
              <div className="history-header">
                <div className="game-info">
                  <span className="game-icon">
                    {games.find(g => g.value === entry.gameType)?.icon || '🎯'}
                  </span>
                  <span className="game-name">
                    {games.find(g => g.value === entry.gameType)?.label || entry.gameType}
                  </span>
                </div>
                <div className="history-actions">
                  <button
                    className="action-button copy-button"
                    onClick={() => copyToClipboard(entry.numbers, entry.gameType)}
                    title="Kopiuj do schowka"
                  >
                    📋 Kopiuj
                  </button>
                                                       <button
                    className="action-button favorite-button"
                    onClick={() => {
                      if (addToFavorites && removeFromFavorites && isFavorite) {
                        const numbers = entry.numbers;
                        if (isFavorite(numbers)) {
                          removeFromFavorites(getFavoriteId(numbers));
                        } else {
                          addToFavorites(numbers, "lucky");
                        }
                      } else {
                        alert('Funkcja "Dodaj do ulubionych" wymaga zalogowania!');
                      }
                    }}
                    title={addToFavorites && isFavorite && isFavorite(entry.numbers) ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                  >
                    {addToFavorites && isFavorite && isFavorite(entry.numbers) ? "💔 Usuń" : "❤️ Ulubione"}
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => deleteHistoryEntry(entry.id)}
                    title="Usuń z historii"
                  >
                    🗑️ Usuń
                  </button>
                </div>
              </div>

              <div className="numbers-display">
                {formatNumbers(entry.numbers, entry.gameType)}
              </div>

              <div className="history-footer">
                <span className="date">{formatDate(entry.date)}</span>
                {entry.confidence && (
                  <span className="confidence">
                    🎯 Pewność: {entry.confidence}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="footer-info">
        <p>💡 Zestawy są automatycznie zapisywane w pamięci przeglądarki</p>
        <p>🔔 Powiadomienia o nowych zestawach są wysyłane o 8:00 rano</p>
      </div>
    </div>
  );
};

export default MyLuckyNumbersScreen;
