// Generator szczęśliwych liczb AI Ultra Pro
// Placeholder do podłączenia Twojego generatora AI Ultra Pro

// Konfiguracja gier
const gameConfigs = {
  lotto: {
    name: 'Lotto',
    maxNumbers: 6,
    maxValue: 49,
    icon: '🎯'
  },
  miniLotto: {
    name: 'Mini Lotto',
    maxNumbers: 5,
    maxValue: 42,
    icon: '🎲'
  },
  multiMulti: {
    name: 'Multi Multi',
    maxNumbers: 10,
    maxValue: 80,
    icon: '🎰'
  },
  eurojackpot: {
    name: 'Eurojackpot',
    maxNumbers: 5,
    maxValue: 50,
    euroNumbers: 2,
    euroMaxValue: 12,
    icon: '🇪🇺'
  },
  kaskada: {
    name: 'Kaskada',
    maxNumbers: 6,
    maxValue: 49,
    icon: '🌊'
  },
  keno: {
    name: 'Keno',
    maxNumbers: 10,
    maxValue: 70,
    icon: '🎲'
  }
};

/**
 * PLACEHOLDER: Funkcja do podłączenia Twojego generatora AI Ultra Pro
 * Zastąp tę funkcję swoim rzeczywistym generatorem AI Ultra Pro
 * 
 * @param {string} gameType - Typ gry ('lotto', 'miniLotto', 'multiMulti', 'eurojackpot', 'kaskada', 'keno')
 * @returns {Object} - Obiekt z wygenerowanymi liczbami i metadanymi
 */
export const generateLuckyNumbersUltraPro = (gameType) => {
  console.log(`🎲 Generowanie liczb AI Ultra Pro dla gry: ${gameType}`);
  
  const config = gameConfigs[gameType];
  if (!config) {
    throw new Error(`Nieznany typ gry: ${gameType}`);
  }

  // PLACEHOLDER: Tu podłącz swój generator AI Ultra Pro
  // Zastąp poniższy kod swoją implementacją
  
  // Przykładowa implementacja (do zastąpienia):
  const numbers = generateBasicNumbers(config);
  const confidence = calculateConfidence(numbers, gameType);
  const comment = generateComment(numbers, gameType);
  
  return {
    numbers: numbers,
    confidence: confidence,
    comment: comment,
    gameType: gameType,
    timestamp: new Date().toISOString(),
    source: 'AI Ultra Pro Generator'
  };
};

// Funkcje pomocnicze (do zastąpienia Twoją implementacją)

/**
 * Generuje podstawowe liczby (placeholder)
 * Zastąp swoją logiką AI Ultra Pro
 */
const generateBasicNumbers = (config) => {
  const numbers = [];
  const maxValue = config.maxValue;
  const maxNumbers = config.maxNumbers;
  
  // Algorytm generowania (placeholder)
  while (numbers.length < maxNumbers) {
    // Użyj różnych strategii dla różnych gier
    let num;
    
    if (config.name === 'Lotto') {
      // Strategia dla Lotto - uwzględnij statystyki
      num = generateLottoNumber(numbers, maxValue);
    } else if (config.name === 'Eurojackpot') {
      // Strategia dla Eurojackpot
      num = generateEurojackpotNumber(numbers, maxValue);
    } else {
      // Domyślna strategia
      num = generateRandomNumber(numbers, maxValue);
    }
    
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  // Sortuj liczby
  numbers.sort((a, b) => a - b);
  
  // Dla Eurojackpot dodaj osobne liczby Euro
  if (config.name === 'Eurojackpot') {
    const euroNumbers = [];
    while (euroNumbers.length < config.euroNumbers) {
      const euroNum = Math.floor(Math.random() * config.euroMaxValue) + 1;
      if (!euroNumbers.includes(euroNum)) {
        euroNumbers.push(euroNum);
      }
    }
    euroNumbers.sort((a, b) => a - b);
    return [numbers, euroNumbers];
  }
  
  return numbers;
};

/**
 * Generuje liczbę dla Lotto z uwzględnieniem statystyk
 */
const generateLottoNumber = (existingNumbers, maxValue) => {
  // Statystyki historyczne (można rozszerzyć)
  const hotNumbers = [7, 13, 23, 31, 37, 42, 45, 49];
  const coldNumbers = [1, 2, 8, 15, 20, 25, 30, 35, 40, 44, 47, 48];
  
  // Strategia mieszana: 40% gorące, 30% zimne, 30% losowe
  const strategy = Math.random();
  
  if (strategy < 0.4) {
    // Gorące liczby
    const availableHot = hotNumbers.filter(n => !existingNumbers.includes(n));
    if (availableHot.length > 0) {
      return availableHot[Math.floor(Math.random() * availableHot.length)];
    }
  } else if (strategy < 0.7) {
    // Zimne liczby
    const availableCold = coldNumbers.filter(n => !existingNumbers.includes(n));
    if (availableCold.length > 0) {
      return availableCold[Math.floor(Math.random() * availableCold.length)];
    }
  }
  
  // Losowa liczba
  return generateRandomNumber(existingNumbers, maxValue);
};

/**
 * Generuje liczbę dla Eurojackpot
 */
const generateEurojackpotNumber = (existingNumbers, maxValue) => {
  // Specjalna strategia dla Eurojackpot - generuj liczby całkowite
  const sum = existingNumbers.reduce((a, b) => a + b, 0);
  const avg = existingNumbers.length > 0 ? sum / existingNumbers.length : 25;
  
  // Preferuj liczby w środkowym zakresie
  const targetRange = Math.max(1, Math.min(maxValue, Math.floor(avg)));
  const range = Math.floor(maxValue * 0.3);
  
  for (let i = 0; i < 10; i++) {
    const num = Math.floor(Math.random() * range) + Math.max(1, targetRange - Math.floor(range/2));
    if (num <= maxValue && !existingNumbers.includes(num)) {
      return num;
    }
  }
  
  return generateRandomNumber(existingNumbers, maxValue);
};

/**
 * Generuje losową liczbę
 */
const generateRandomNumber = (existingNumbers, maxValue) => {
  let attempts = 0;
  while (attempts < 100) {
    const num = Math.floor(Math.random() * maxValue) + 1;
    if (!existingNumbers.includes(num)) {
      return num;
    }
    attempts++;
  }
  
  // Fallback - znajdź pierwszą dostępną liczbę
  for (let i = 1; i <= maxValue; i++) {
    if (!existingNumbers.includes(i)) {
      return i;
    }
  }
  
  return 1; // Ostateczny fallback
};

/**
 * Oblicza pewność wygenerowanego zestawu
 */
const calculateConfidence = (numbers, gameType) => {
  let confidence = 75; // Podstawowa pewność
  
  if (Array.isArray(numbers) && numbers.length > 0) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    
    // Sprawdź różne kryteria
    if (gameType === 'lotto') {
      if (sum >= 120 && sum <= 160) confidence += 10;
      if (avg >= 20 && avg <= 30) confidence += 5;
    } else if (gameType === 'miniLotto') {
      if (sum >= 90 && sum <= 120) confidence += 10;
      if (avg >= 15 && avg <= 25) confidence += 5;
    } else if (gameType === 'eurojackpot') {
      if (Array.isArray(numbers[0])) {
        const mainSum = numbers[0].reduce((a, b) => a + b, 0);
        if (mainSum >= 100 && mainSum <= 150) confidence += 10;
      }
    }
    
    // Sprawdź rozkład parzystych/nieparzystych
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    if (Math.abs(evenCount - oddCount) <= 1) confidence += 5;
    
    // Sprawdź rozkład niskich/wysokich liczb
    const midPoint = gameConfigs[gameType].maxValue / 2;
    const lowCount = numbers.filter(n => n <= midPoint).length;
    const highCount = numbers.length - lowCount;
    if (Math.abs(lowCount - highCount) <= 1) confidence += 5;
  }
  
  return Math.min(confidence, 95);
};

/**
 * Generuje komentarz do wygenerowanego zestawu
 */
const generateComment = (numbers, gameType) => {
  const comments = [
    "Algorytm AI wykrył optymalny wzorzec! 🎯",
    "Analiza statystyczna wskazuje na wysokie prawdopodobieństwo! 📊",
    "Symulacje Monte Carlo potwierdzają skuteczność! 🎲",
    "Prawo Benforda sugeruje wyjątkowość kombinacji! 🔢",
    "Algorytm szachowy przewiduje sukces! ♟️",
    "Analiza harmoniczna wykryła ukryte wzorce! 🎵",
    "AI Ultra Pro zoptymalizował zestaw! 🚀",
    "Neural network potwierdza skuteczność! 🧠"
  ];
  
  return comments[Math.floor(Math.random() * comments.length)];
};

/**
 * Zapisuje wygenerowany zestaw do historii
 */
export const saveLuckyNumbersToHistory = (luckyNumbersData) => {
  try {
    const existingHistory = localStorage.getItem('luckyNumbersHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    const historyEntry = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      ...luckyNumbersData,
      date: new Date().toISOString()
    };
    
    // Dodaj na początek listy
    history.unshift(historyEntry);
    
    // Ogranicz historię do 100 wpisów
    if (history.length > 100) {
      history.splice(100);
    }
    
    localStorage.setItem('luckyNumbersHistory', JSON.stringify(history));
    console.log('✅ Zapisano zestaw do historii:', historyEntry);
    
    return historyEntry;
  } catch (error) {
    console.error('❌ Błąd podczas zapisywania do historii:', error);
    return null;
  }
};

/**
 * Pobiera historię szczęśliwych liczb
 */
export const getLuckyNumbersHistory = () => {
  try {
    const history = localStorage.getItem('luckyNumbersHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('❌ Błąd podczas pobierania historii:', error);
    return [];
  }
};

/**
 * Usuwa wpis z historii
 */
export const removeLuckyNumbersFromHistory = (id) => {
  try {
    const history = getLuckyNumbersHistory();
    const filteredHistory = history.filter(entry => entry.id !== id);
    localStorage.setItem('luckyNumbersHistory', JSON.stringify(filteredHistory));
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas usuwania z historii:', error);
    return false;
  }
};

/**
 * Czyści całą historię
 */
export const clearLuckyNumbersHistory = () => {
  try {
    localStorage.removeItem('luckyNumbersHistory');
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas czyszczenia historii:', error);
    return false;
  }
};

/**
 * Generuje dzienne powiadomienie o szczęśliwych liczbach
 */
export const generateDailyLuckyNumbers = async (notificationService) => {
  try {
    console.log('🎲 Generowanie dziennych szczęśliwych liczb...');
    
    // Generuj liczby dla wszystkich gier
    const games = Object.keys(gameConfigs);
    const dailyNumbers = [];
    
    for (const gameType of games) {
      const luckyNumbers = generateLuckyNumbersUltraPro(gameType);
      
      // Zapisz do historii
      saveLuckyNumbersToHistory(luckyNumbers);
      
      // Wyślij powiadomienie
      if (notificationService && notificationService.hasPermission()) {
        notificationService.showLuckyNumbersNotification(luckyNumbers.numbers, gameType);
      }
      
      dailyNumbers.push(luckyNumbers);
      
      // Krótka przerwa między generowaniem
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ Wygenerowano dzienne szczęśliwe liczby dla wszystkich gier');
    return dailyNumbers;
    
  } catch (error) {
    console.error('❌ Błąd podczas generowania dziennych liczb:', error);
    throw error;
  }
};

export default {
  generateLuckyNumbersUltraPro,
  saveLuckyNumbersToHistory,
  getLuckyNumbersHistory,
  removeLuckyNumbersFromHistory,
  clearLuckyNumbersHistory,
  generateDailyLuckyNumbers,
  gameConfigs
};
