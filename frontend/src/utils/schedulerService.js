// Serwis planowania zadań dla aplikacji lotto
// Obsługuje dzienne powiadomienia o 8:00 rano

class SchedulerService {
  constructor() {
    this.schedulerId = 'lotto-daily-scheduler';
    this.notificationTime = '08:00'; // 8:00 rano
    this.isRunning = false;
    this.nextNotificationTime = null;
    this.checkInterval = null;
  }

  /**
   * Inicjalizuje scheduler
   */
  async initialize(notificationService, luckyNumbersGenerator) {
    console.log('🕐 Inicjalizacja scheduler powiadomień...');
    
    this.notificationService = notificationService;
    this.luckyNumbersGenerator = luckyNumbersGenerator;
    
    // Sprawdź czy scheduler jest już uruchomiony
    if (this.isRunning) {
      console.log('⚠️ Scheduler już jest uruchomiony');
      return;
    }

    // Sprawdź czy powiadomienia są wspierane
    if (!this.notificationService.isNotificationSupported()) {
      console.warn('⚠️ Powiadomienia nie są wspierane w tej przeglądarce');
      return;
    }

    // Poproś o pozwolenie na powiadomienia
    const hasPermission = await this.notificationService.requestPermission();
    if (!hasPermission) {
      console.warn('⚠️ Brak pozwolenia na powiadomienia');
      return;
    }

    // Uruchom scheduler
    this.start();
  }

  /**
   * Uruchamia scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Scheduler już jest uruchomiony');
      return;
    }

    console.log('🚀 Uruchamianie scheduler powiadomień...');
    this.isRunning = true;

    // Oblicz czas do następnego powiadomienia
    this.calculateNextNotificationTime();

    // Uruchom sprawdzanie co minutę
    this.checkInterval = setInterval(() => {
      this.checkAndSendNotification();
    }, 60000); // Sprawdzaj co minutę

    // Sprawdź od razu przy starcie
    this.checkAndSendNotification();

    console.log(`✅ Scheduler uruchomiony. Następne powiadomienie: ${this.nextNotificationTime}`);
  }

  /**
   * Zatrzymuje scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Scheduler nie jest uruchomiony');
      return;
    }

    console.log('🛑 Zatrzymywanie scheduler powiadomień...');
    this.isRunning = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    console.log('✅ Scheduler zatrzymany');
  }

  /**
   * Oblicza czas do następnego powiadomienia
   */
  calculateNextNotificationTime() {
    const now = new Date();
    const [hours, minutes] = this.notificationTime.split(':').map(Number);
    
    // Ustaw czas na dzisiaj o 8:00
    const todayNotification = new Date(now);
    todayNotification.setHours(hours, minutes, 0, 0);

    // Jeśli już minął dzisiejszy czas, ustaw na jutro
    if (now >= todayNotification) {
      todayNotification.setDate(todayNotification.getDate() + 1);
    }

    this.nextNotificationTime = todayNotification;
    
    console.log(`📅 Następne powiadomienie: ${this.nextNotificationTime.toLocaleString('pl-PL')}`);
  }

  /**
   * Sprawdza czy należy wysłać powiadomienie
   */
  async checkAndSendNotification() {
    if (!this.isRunning) return;

    const now = new Date();
    
    // Sprawdź czy to czas na powiadomienie (z tolerancją 1 minuty)
    if (this.nextNotificationTime && now >= this.nextNotificationTime) {
      console.log('🎲 Czas na dzienne powiadomienie!');
      
      try {
        // Sprawdź czy już wysłano powiadomienie dzisiaj
        const today = now.toDateString();
        const lastNotificationDate = localStorage.getItem('lastDailyNotificationDate');
        
        if (lastNotificationDate === today) {
          console.log('⚠️ Powiadomienie już wysłane dzisiaj');
          this.calculateNextNotificationTime();
          return;
        }

        // Generuj dzienne szczęśliwe liczby
        await this.generateAndSendDailyNotification();
        
        // Zapisz datę ostatniego powiadomienia
        localStorage.setItem('lastDailyNotificationDate', today);
        
        // Oblicz czas do następnego powiadomienia
        this.calculateNextNotificationTime();
        
      } catch (error) {
        console.error('❌ Błąd podczas wysyłania dziennego powiadomienia:', error);
      }
    }
  }

  /**
   * Generuje i wysyła dzienne powiadomienie
   */
  async generateAndSendDailyNotification() {
    if (!this.luckyNumbersGenerator || !this.notificationService) {
      console.error('❌ Brak generatora liczb lub serwisu powiadomień');
      return;
    }

    try {
      console.log('🎲 Generowanie dziennych szczęśliwych liczb...');
      
      // Generuj liczby dla wszystkich gier
      const games = ['lotto', 'miniLotto', 'multiMulti', 'eurojackpot', 'kaskada', 'keno'];
      const dailyNumbers = [];
      
      for (const gameType of games) {
        try {
          // Generuj liczby
          const luckyNumbers = this.luckyNumbersGenerator.generateLuckyNumbersUltraPro(gameType);
          
          // Zapisz do historii
          this.luckyNumbersGenerator.saveLuckyNumbersToHistory(luckyNumbers);
          
          // Wyślij powiadomienie
          if (this.notificationService.hasPermission()) {
            this.notificationService.showLuckyNumbersNotification(luckyNumbers.numbers, gameType);
          }
          
          dailyNumbers.push(luckyNumbers);
          
          // Krótka przerwa między generowaniem
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Błąd podczas generowania liczb dla ${gameType}:`, error);
        }
      }
      
      console.log('✅ Wygenerowano dzienne szczęśliwe liczby dla wszystkich gier');
      
      // Wyślij podsumowanie
      if (this.notificationService.hasPermission()) {
        this.notificationService.showInfoNotification(
          '🎲 Dzienny zestaw gotowy!',
          `Wygenerowano ${dailyNumbers.length} zestawów szczęśliwych liczb. Sprawdź historię w aplikacji!`
        );
      }
      
      return dailyNumbers;
      
    } catch (error) {
      console.error('❌ Błąd podczas generowania dziennych liczb:', error);
      throw error;
    }
  }

  /**
   * Wysyła testowe powiadomienie
   */
  async sendTestNotification() {
    if (!this.notificationService) {
      console.error('❌ Brak serwisu powiadomień');
      return;
    }

    try {
      console.log('🧪 Wysyłanie testowego powiadomienia...');
      
      // Generuj testowe liczby
      const testNumbers = this.luckyNumbersGenerator.generateLuckyNumbersUltraPro('lotto');
      
      // Zapisz do historii
      this.luckyNumbersGenerator.saveLuckyNumbersToHistory(testNumbers);
      
      // Wyślij powiadomienie
      if (this.notificationService.hasPermission()) {
        this.notificationService.showLuckyNumbersNotification(testNumbers.numbers, 'lotto');
      }
      
      console.log('✅ Testowe powiadomienie wysłane');
      
    } catch (error) {
      console.error('❌ Błąd podczas wysyłania testowego powiadomienia:', error);
    }
  }

  /**
   * Sprawdza status schedulera
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextNotificationTime: this.nextNotificationTime,
      notificationTime: this.notificationTime,
      hasPermission: this.notificationService ? this.notificationService.hasPermission() : false,
      isSupported: this.notificationService ? this.notificationService.isNotificationSupported() : false
    };
  }

  /**
   * Ustawia nowy czas powiadomienia
   */
  setNotificationTime(time) {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      throw new Error('Nieprawidłowy format czasu. Użyj HH:MM');
    }
    
    this.notificationTime = time;
    this.calculateNextNotificationTime();
    
    console.log(`🕐 Czas powiadomienia zmieniony na: ${time}`);
  }

  /**
   * Sprawdza czy powiadomienie zostało wysłane dzisiaj
   */
  wasNotificationSentToday() {
    const today = new Date().toDateString();
    const lastNotificationDate = localStorage.getItem('lastDailyNotificationDate');
    return lastNotificationDate === today;
  }

  /**
   * Resetuje datę ostatniego powiadomienia (do testów)
   */
  resetLastNotificationDate() {
    localStorage.removeItem('lastDailyNotificationDate');
    console.log('🔄 Zresetowano datę ostatniego powiadomienia');
  }

  /**
   * Pobiera statystyki schedulera
   */
  getStats() {
    const lastNotificationDate = localStorage.getItem('lastDailyNotificationDate');
    const history = this.luckyNumbersGenerator ? this.luckyNumbersGenerator.getLuckyNumbersHistory() : [];
    
    return {
      lastNotificationDate: lastNotificationDate,
      totalHistoryEntries: history.length,
      todayEntries: history.filter(entry => {
        const entryDate = new Date(entry.date).toDateString();
        const today = new Date().toDateString();
        return entryDate === today;
      }).length,
      status: this.getStatus()
    };
  }
}

// Eksportuj instancję serwisu
const schedulerService = new SchedulerService();
export default schedulerService;
