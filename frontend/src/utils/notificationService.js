// Serwis powiadomień dla aplikacji lotto
class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.notificationId = 'lotto-daily-notification';
  }

  // Sprawdzenie czy powiadomienia są wspierane
  isNotificationSupported() {
    return this.isSupported;
  }

  // Prośba o pozwolenie na powiadomienia
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('❌ Powiadomienia nie są wspierane w tej przeglądarce');
      return false;
    }

    try {
      console.log('🔔 Prośba o pozwolenie na powiadomienia...');
      
      // Sprawdź aktualny stan
      console.log('📊 Aktualny stan pozwolenia:', Notification.permission);
      
      const permission = await Notification.requestPermission();
      console.log('📊 Nowy stan pozwolenia:', permission);
      
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Pozwolenie na powiadomienia zostało udzielone!');
      } else if (permission === 'denied') {
        console.log('❌ Pozwolenie na powiadomienia zostało odrzucone');
      } else {
        console.log('⏸️ Pozwolenie na powiadomienia zostało odroczone');
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Błąd podczas prośby o pozwolenie na powiadomienia:', error);
      return false;
    }
  }

  // Sprawdzenie czy mamy pozwolenie na powiadomienia
  hasPermission() {
    return this.permission === 'granted';
  }

  // Wyświetlenie powiadomienia
  showNotification(title, options = {}) {
    if (!this.isSupported) {
      console.warn('❌ Powiadomienia nie są wspierane w tej przeglądarce');
      return null;
    }

    if (!this.hasPermission()) {
      console.warn('❌ Brak pozwolenia na powiadomienia');
      return null;
    }

    try {
      console.log(`🔔 Wyświetlanie powiadomienia: ${title}`);
      console.log('📊 Aktualny stan pozwolenia:', Notification.permission);

      // Sprawdź czy powiadomienia są rzeczywiście dozwolone
      if (Notification.permission !== 'granted') {
        console.warn('❌ Powiadomienia nie są dozwolone przez przeglądarkę');
        return null;
      }

      // Zamknij istniejące powiadomienie o tej samej nazwie
      this.closeNotification();

      const defaultOptions = {
        icon: '/favicon.ico', // Ikona aplikacji
        badge: '/favicon.ico',
        tag: this.notificationId,
        requireInteraction: false, // Nie wymagaj interakcji
        silent: false,
        vibrate: [200, 100, 200],
        data: {
          url: window.location.origin
        }
      };

      console.log('🔧 Opcje powiadomienia:', { ...defaultOptions, ...options });

      const notification = new Notification(title, { ...defaultOptions, ...options });

      console.log('✅ Powiadomienie utworzone:', notification);

      // Obsługa błędów powiadomienia
      notification.onerror = (error) => {
        console.error('❌ Błąd powiadomienia:', error);
        alert(`❌ Błąd powiadomienia: ${error.message}`);
      };

      // Obsługa kliknięć w powiadomienie
      notification.onclick = (event) => {
        console.log('🖱️ Kliknięto w powiadomienie:', event);
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Przekieruj do aplikacji
        if (event.action === 'open' || !event.action) {
          window.location.href = '/';
        }
      };

      // Obsługa zamknięcia powiadomienia
      notification.onclose = () => {
        console.log('🔒 Powiadomienie zostało zamknięte');
      };

      // Automatyczne zamknięcie po 10 sekundach (krócej)
      setTimeout(() => {
        if (notification) {
          console.log('⏰ Automatyczne zamknięcie powiadomienia');
          notification.close();
        }
      }, 10000);

      // Dodaj informację w konsoli zamiast alertu
      console.log(`🔔 Powiadomienie wysłane: ${title}`);
      console.log('📍 Sprawdź prawy górny róg przeglądarki lub centrum powiadomień systemu');
      
      // Dodaj sprawdzenie czy powiadomienie jest rzeczywiście widoczne
      setTimeout(() => {
        if (notification && notification.constructor === Notification) {
          console.log('✅ Powiadomienie jest aktywne i widoczne');
        } else {
          console.warn('⚠️ Powiadomienie może nie być widoczne');
        }
      }, 1000);

      return notification;
    } catch (error) {
      console.error('❌ Błąd podczas wyświetlania powiadomienia:', error);
      console.error('❌ Szczegóły błędu:', error.message);
      alert(`❌ Błąd powiadomienia: ${error.message}`);
      return null;
    }
  }

  // Zamknięcie powiadomienia
  closeNotification() {
    if (this.isSupported) {
      // Zamknij wszystkie powiadomienia z tagiem
      if ('getNotifications' in navigator.serviceWorker) {
        navigator.serviceWorker.getNotifications().then(notifications => {
          notifications.forEach(notification => {
            if (notification.tag === this.notificationId) {
              notification.close();
            }
          });
        });
      }
    }
  }

  // Powiadomienie o nowych szczęśliwych liczbach
  showLuckyNumbersNotification(numbers, gameType) {
    const gameNames = {
      lotto: 'Lotto',
      miniLotto: 'Mini Lotto',
      multiMulti: 'Multi Multi',
      eurojackpot: 'Eurojackpot',
      kaskada: 'Kaskada',
      keno: 'Keno'
    };

    const gameName = gameNames[gameType] || gameType;
    let numbersText = '';

    if (gameType === 'eurojackpot' && Array.isArray(numbers) && Array.isArray(numbers[0]) && Array.isArray(numbers[1])) {
      const mainNumbers = numbers[0].join(', ');
      const euroNumbers = numbers[1].join(', ');
      numbersText = `Główne: ${mainNumbers} | Euro: ${euroNumbers}`;
    } else if (Array.isArray(numbers)) {
      numbersText = numbers.join(', ');
    }

    const title = `🎲 Twoje szczęśliwe liczby na dziś: ${gameName}`;
    const body = `Zestaw: ${numbersText}`;

    return this.showNotification(title, {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `lucky-numbers-${gameType}-${new Date().toDateString()}`,
      requireInteraction: false, // Zmienione na false
      vibrate: [300, 100, 300, 100, 300]
    });
  }

  // Powiadomienie o błędzie
  showErrorNotification(message) {
    return this.showNotification('❌ Błąd aplikacji', {
      body: message,
      icon: '/favicon.ico',
      tag: 'error-notification',
      requireInteraction: false
    });
  }

  // Powiadomienie o sukcesie
  showSuccessNotification(message) {
    return this.showNotification('✅ Sukces', {
      body: message,
      icon: '/favicon.ico',
      tag: 'success-notification',
      requireInteraction: false
    });
  }

  // Powiadomienie informacyjne
  showInfoNotification(title, message) {
    return this.showNotification(title, {
      body: message,
      icon: '/favicon.ico',
      tag: 'info-notification',
      requireInteraction: false
    });
  }

  // Test powiadomienia
  testNotification() {
    return this.showNotification('🧪 Test powiadomienia', {
      body: 'To jest test powiadomienia z aplikacji Lotto Generator',
      icon: '/favicon.ico',
      tag: 'test-notification',
      requireInteraction: false
    });
  }

  // Pobiera status serwisu powiadomień
  getStatus() {
    return {
      isSupported: this.isSupported,
      hasPermission: this.hasPermission(),
      permission: this.permission
    };
  }
}

// Eksportuj instancję serwisu
const notificationService = new NotificationService();
export default notificationService;
