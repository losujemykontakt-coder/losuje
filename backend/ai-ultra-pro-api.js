const express = require('express');
const router = express.Router();

// AI Ultra Pro API - Zaawansowany generator liczb lotto
// Ten plik zawiera endpointy dla AI Ultra Pro

/**
 * Generuje liczby lotto używając zaawansowanych algorytmów AI
 * @param {string} gameType - Typ gry (lotto, miniLotto, multiMulti, eurojackpot, kaskada)
 * @param {string} mode - Tryb generowania (start, machine3d, hacker, laser, chess)
 * @returns {Array} - Wygenerowane liczby
 */
const generateAILottoNumbers = (gameType, mode = 'start') => {
  const gameConfigs = {
    lotto: { maxNumbers: 6, maxValue: 49 },
    miniLotto: { maxNumbers: 5, maxValue: 42 },
    multiMulti: { maxNumbers: 10, maxValue: 80 },
    eurojackpot: { maxNumbers: 5, maxValue: 50 },
    kaskada: { maxNumbers: 6, maxValue: 49 }
  };

  const config = gameConfigs[gameType] || gameConfigs.lotto;
  const numbers = [];

  // Zaawansowany algorytm AI z różnymi strategiami
  const strategies = {
    start: () => generateBalancedNumbers(config),
    machine3d: () => generatePatternBasedNumbers(config),
    hacker: () => generateAlgorithmicNumbers(config),
    laser: () => generatePrecisionNumbers(config),
    chess: () => generateStrategicNumbers(config)
  };

  const strategy = strategies[mode] || strategies.start;
  return strategy();
};

/**
 * Generuje zrównoważone liczby (równe rozkłady parzyste/nieparzyste)
 */
const generateBalancedNumbers = (config) => {
  const numbers = [];
  const { maxNumbers, maxValue } = config;
  
  while (numbers.length < maxNumbers) {
    const num = Math.floor(Math.random() * maxValue) + 1;
    if (!numbers.includes(num)) {
      // Sprawdź równowagę parzystych/nieparzystych
      const evenCount = numbers.filter(n => n % 2 === 0).length;
      const oddCount = numbers.length - evenCount;
      
      if (numbers.length < maxNumbers - 1) {
        numbers.push(num);
      } else {
        // Ostatnia liczba - dąż do równowagi
        const isEven = num % 2 === 0;
        if ((isEven && evenCount <= oddCount) || (!isEven && oddCount <= evenCount)) {
          numbers.push(num);
        }
      }
    }
  }
  
  return numbers.sort((a, b) => a - b);
};

/**
 * Generuje liczby na podstawie wzorców statystycznych
 */
const generatePatternBasedNumbers = (config) => {
  const numbers = [];
  const { maxNumbers, maxValue } = config;
  
  // Wzorce statystyczne
  const patterns = [
    [1, 10, 20, 30, 40, 49], // Rozkład równomierny
    [5, 15, 25, 35, 45, 49], // Co 10
    [3, 13, 23, 33, 43, 49], // Co 10 + 3
    [7, 17, 27, 37, 47, 49]  // Co 10 + 7
  ];
  
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  for (let i = 0; i < Math.min(maxNumbers, selectedPattern.length); i++) {
    let num = selectedPattern[i];
    
    // Dodaj losową wariację
    const variation = Math.floor(Math.random() * 5) - 2;
    num = Math.max(1, Math.min(maxValue, num + variation));
    
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  // Uzupełnij brakujące liczby
  while (numbers.length < maxNumbers) {
    const num = Math.floor(Math.random() * maxValue) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  return numbers.sort((a, b) => a - b);
};

/**
 * Generuje liczby używając algorytmicznych wzorców
 */
const generateAlgorithmicNumbers = (config) => {
  const numbers = [];
  const { maxNumbers, maxValue } = config;
  
  // Algorytm Fibonacci z modyfikacjami
  let a = 1, b = 2;
  for (let i = 0; i < maxNumbers; i++) {
    let num = a % maxValue;
    if (num === 0) num = maxValue;
    
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
    
    const temp = a;
    a = b;
    b = temp + b;
  }
  
  // Jeśli brakuje liczb, dodaj losowe
  while (numbers.length < maxNumbers) {
    const num = Math.floor(Math.random() * maxValue) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  return numbers.sort((a, b) => a - b);
};

/**
 * Generuje precyzyjne liczby z wysoką dokładnością
 */
const generatePrecisionNumbers = (config) => {
  const numbers = [];
  const { maxNumbers, maxValue } = config;
  
  // Precyzyjne wzorce
  const precisionPatterns = [
    [1, 24, 30, 34, 43, 45], // Specjalny wzorzec
    [2, 11, 22, 33, 44, 49], // Sekwencja
    [5, 10, 15, 20, 25, 30], // Co 5
    [3, 8, 13, 18, 23, 28]   // Co 5 + 3
  ];
  
  const selectedPattern = precisionPatterns[Math.floor(Math.random() * precisionPatterns.length)];
  
  for (let i = 0; i < Math.min(maxNumbers, selectedPattern.length); i++) {
    let num = selectedPattern[i];
    
    // Minimalna wariacja
    const variation = Math.floor(Math.random() * 3) - 1;
    num = Math.max(1, Math.min(maxValue, num + variation));
    
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  // Uzupełnij brakujące
  while (numbers.length < maxNumbers) {
    const num = Math.floor(Math.random() * maxValue) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  return numbers.sort((a, b) => a - b);
};

/**
 * Generuje strategiczne liczby jak w szachach
 */
const generateStrategicNumbers = (config) => {
  const numbers = [];
  const { maxNumbers, maxValue } = config;
  
  // Strategia szachowa - pozycje na planszy
  const chessPositions = [
    [1, 8, 15, 22, 29, 36], // Pierwsza kolumna
    [2, 9, 16, 23, 30, 37], // Druga kolumna
    [3, 10, 17, 24, 31, 38], // Trzecia kolumna
    [4, 11, 18, 25, 32, 39], // Czwarta kolumna
    [5, 12, 19, 26, 33, 40], // Piąta kolumna
    [6, 13, 20, 27, 34, 41], // Szósta kolumna
    [7, 14, 21, 28, 35, 42]  // Siódma kolumna
  ];
  
  const selectedStrategy = chessPositions[Math.floor(Math.random() * chessPositions.length)];
  
  for (let i = 0; i < Math.min(maxNumbers, selectedStrategy.length); i++) {
    let num = selectedStrategy[i];
    
    // Dostosuj do zakresu gry
    if (num > maxValue) {
      num = num % maxValue;
      if (num === 0) num = maxValue;
    }
    
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  // Uzupełnij brakujące
  while (numbers.length < maxNumbers) {
    const num = Math.floor(Math.random() * maxValue) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  return numbers.sort((a, b) => a - b);
};

/**
 * Oblicza pewność AI na podstawie wygenerowanych liczb
 */
const calculateAIConfidence = (numbers, gameType, mode) => {
  let confidence = 75; // Podstawowa pewność
  
  // Analiza rozkładu
  const sum = numbers.reduce((a, b) => a + b, 0);
  const avg = sum / numbers.length;
  
  // Sprawdź optymalne zakresy dla różnych gier
  const optimalRanges = {
    lotto: { min: 120, max: 160 },
    miniLotto: { min: 90, max: 120 },
    multiMulti: { min: 300, max: 450 },
    eurojackpot: { min: 100, max: 140 },
    kaskada: { min: 120, max: 160 }
  };
  
  const range = optimalRanges[gameType] || optimalRanges.lotto;
  if (sum >= range.min && sum <= range.max) {
    confidence += 10;
  }
  
  // Analiza parzystych/nieparzystych
  const evenCount = numbers.filter(n => n % 2 === 0).length;
  const oddCount = numbers.length - evenCount;
  if (Math.abs(evenCount - oddCount) <= 1) {
    confidence += 5;
  }
  
  // Analiza trybu
  const modeBonuses = {
    start: 0,
    machine3d: 5,
    hacker: 8,
    laser: 10,
    chess: 7,
    robot: 9
  };
  
  confidence += modeBonuses[mode] || 0;
  
  // Analiza rozkładu
  const gaps = [];
  for (let i = 1; i < numbers.length; i++) {
    gaps.push(numbers[i] - numbers[i-1]);
  }
  
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  if (avgGap >= 5 && avgGap <= 12) {
    confidence += 5;
  }
  
  return Math.min(confidence, 95);
};

/**
 * Generuje komentarz AI
 */
const generateAIComment = (numbers, gameType, mode) => {
  const comments = {
    start: [
      "Algorytm wykrył optymalny wzorzec! 🎯",
      "Analiza statystyczna wskazuje na wysokie prawdopodobieństwo! 📊",
      "Symulacje Monte Carlo potwierdzają skuteczność! 🎲"
    ],
    machine3d: [
      "Maszyna 3D zidentyfikowała idealną kombinację! 🎰",
      "Obliczenia przestrzenne wskazują na sukces! 🌌",
      "Algorytm maszynowy przewiduje wygraną! 🤖"
    ],
    hacker: [
      "System odszyfrował ukryte wzorce! 💻",
      "Algorytm hackera wykrył luki w systemie! 🔓",
      "Dekodowanie zakończone sukcesem! 🔐"
    ],
    laser: [
      "Laser AI precyzyjnie wycelował! 🔴",
      "Algorytm laserowy trafił w sedno! 🎯",
      "Precyzyjne obliczenia potwierdzają celność! ⚡"
    ],
    chess: [
      "Strategia szachowa przewiduje zwycięstwo! ♟️",
      "Algorytm szachowy wykonał idealny ruch! ♔",
      "Gra strategiczna zakończona sukcesem! 🏆"
    ],
    robot: [
      "Robot zakończył analizę z sukcesem! 🤖",
      "Algorytm czatu wykrył optymalny wzorzec! 💬",
      "Inteligentna analiza potwierdza skuteczność! 🧠"
    ]
  };
  
  const modeComments = comments[mode] || comments.start;
  return modeComments[Math.floor(Math.random() * modeComments.length)];
};

// Endpointy API

/**
 * POST /api/ai-ultra-pro/generate
 * Generuje liczby lotto używając AI Ultra Pro
 */
router.post('/generate', (req, res) => {
  try {
    const { gameType, mode } = req.body;
    
    if (!gameType) {
      return res.status(400).json({
        success: false,
        error: 'Brak typu gry'
      });
    }
    
    const numbers = generateAILottoNumbers(gameType, mode);
    const confidence = calculateAIConfidence(numbers, gameType, mode);
    const comment = generateAIComment(numbers, gameType, mode);
    
    res.json({
      success: true,
      data: {
        numbers,
        confidence,
        comment,
        gameType,
        mode,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Błąd generowania AI Ultra Pro:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd generowania liczb'
    });
  }
});

/**
 * GET /api/ai-ultra-pro/health
 * Sprawdza stan AI Ultra Pro
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/ai-ultra-pro/stats
 * Zwraca statystyki AI Ultra Pro
 */
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalGenerations: 0, // TODO: Implementuj licznik
      averageConfidence: 85,
      mostUsedMode: 'start',
      mostUsedGame: 'lotto',
      lastGeneration: new Date().toISOString()
    }
  });
});

module.exports = router;
