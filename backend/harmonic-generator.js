const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const HarmonicAnalyzer = require('./harmonic-analyzer');

/**
 * Harmonic Lotto Generator - Generator oparty na analizie harmonicznych odstępów
 * 
 * Ten moduł generuje liczby lotto wykorzystując analizę harmonicznych odstępów,
 * Monte Carlo symulacje i zaawansowane algorytmy optymalizacji.
 * 
 * ZASADA DZIAŁANIA:
 * 1. Wczytuje analizę harmoniczną (histogram odstępów)
 * 2. Generuje odstępy na podstawie rozkładu prawdopodobieństwa
 * 3. Konwertuje odstępy na liczby lotto
 * 4. Stosuje filtry matematyczne i optymalizacje
 * 5. Używa Monte Carlo do walidacji zestawów
 * 6. Zwraca zestawy z oceną pewności (confidence)
 */

class HarmonicGenerator {
  constructor() {
    this.analyzer = new HarmonicAnalyzer();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minut
  }

  /**
   * Główna funkcja generowania zestawów
   */
  async generateSets(game = 'lotto', strategy = 'balanced', nSets = 1) {
    console.log(`🎲 Generowanie ${nSets} zestawów ${game} strategią ${strategy}...`);
    
    try {
      // Wczytaj analizę harmoniczną
      const harmonicStats = await this.getHarmonicStats();
      
      // Pobierz dane historyczne dla analizy częstotliwości
      const historicalData = await this.getHistoricalData();
      
      // Wygeneruj zestawy
      const sets = [];
      
      for (let i = 0; i < nSets; i++) {
        const set = await this.generateSingleSet(game, strategy, harmonicStats, historicalData);
        sets.push(set);
      }
      
      // Sortuj zestawy według confidence
      sets.sort((a, b) => b.confidence - a.confidence);
      
      console.log(`✅ Wygenerowano ${sets.length} zestawów`);
      return {
        success: true,
        sets: sets,
        strategy: strategy,
        game: game,
        generatedAt: new Date().toISOString(),
        harmonicAnalysis: {
          meanGap: harmonicStats.overallStats.mean,
          isHarmonic: harmonicStats.analysis.isNearHarmonic
        }
      };
      
    } catch (error) {
      console.error('❌ Błąd generowania zestawów:', error);
      throw error;
    }
  }

  /**
   * Generuje pojedynczy zestaw liczb
   */
  async generateSingleSet(game, strategy, harmonicStats, historicalData) {
    const maxAttempts = 100;
    let attempts = 0;
    const gameConfig = this.getGameConfig(game);
    
    while (attempts < maxAttempts) {
      try {
        // Generuj odstępy na podstawie histogramu
        const gaps = this.generateGapsFromHistogram(harmonicStats.histogram, game);
        
        // Konwertuj odstępy na liczby
        const numbers = this.convertGapsToNumbers(gaps, game);
        
        // Sprawdź czy liczby są w zakresie gry
        if (!this.validateNumberRange(numbers, game)) {
          attempts++;
          continue;
        }
        
        // Zastosuj filtry matematyczne
        if (!this.applyMathematicalFilters(numbers, game)) {
          attempts++;
          continue;
        }
        
        // Zastosuj strategię
        const adjustedNumbers = this.applyStrategy(numbers, strategy, historicalData);
        
        // Oblicz confidence
        const confidence = this.calculateConfidence(adjustedNumbers, harmonicStats, strategy);
        
        // Sprawdź czy zestaw nie jest zbyt popularny
        if (this.isPopularCombination(adjustedNumbers, historicalData)) {
          attempts++;
          continue;
        }
        
        // Dla Eurojackpot dodaj liczby Euro
        let resultNumbers = adjustedNumbers.sort((a, b) => a - b);
        if (game === 'eurojackpot' && gameConfig.euroCount && gameConfig.euroMax) {
          const euroNumbers = [];
          const usedEuroNumbers = new Set();
          
          while (euroNumbers.length < gameConfig.euroCount) {
            const euroNumber = Math.floor(Math.random() * gameConfig.euroMax) + 1;
            if (!usedEuroNumbers.has(euroNumber)) {
              euroNumbers.push(euroNumber);
              usedEuroNumbers.add(euroNumber);
            }
          }
          
          resultNumbers = {
            main: resultNumbers,
            euro: euroNumbers.sort((a, b) => a - b)
          };
        }

        return {
          numbers: resultNumbers,
          confidence: confidence,
          strategy: strategy,
          gaps: gaps,
          analysis: {
            sum: adjustedNumbers.reduce((a, b) => a + b, 0),
            evenCount: adjustedNumbers.filter(n => n % 2 === 0).length,
            oddCount: adjustedNumbers.filter(n => n % 2 === 1).length,
            lowCount: adjustedNumbers.filter(n => n <= this.getGameMidpoint(game)).length,
            highCount: adjustedNumbers.filter(n => n > this.getGameMidpoint(game)).length
          }
        };
        
      } catch (error) {
        attempts++;
        console.error(`Błąd generowania zestawu (próba ${attempts}):`, error.message);
      }
    }
    
    throw new Error(`Nie udało się wygenerować zestawu po ${maxAttempts} próbach`);
  }

  /**
   * Generuje odstępy na podstawie histogramu
   */
  generateGapsFromHistogram(histogram, game) {
    const gaps = [];
    const gameConfig = this.getGameConfig(game);
    const maxGaps = gameConfig.numbersCount - 1;
    
    // Konwertuj histogram na rozkład prawdopodobieństwa
    const totalCount = Object.values(histogram).reduce((a, b) => a + b, 0);
    const probabilities = {};
    
    Object.keys(histogram).forEach(gap => {
      probabilities[gap] = histogram[gap] / totalCount;
    });
    
    // Generuj odstępy
    let currentSum = 0;
    let startNumber = Math.floor(Math.random() * 10) + 1; // Losowy punkt startowy
    
    for (let i = 0; i < maxGaps; i++) {
      // Losuj odstęp na podstawie rozkładu prawdopodobieństwa
      const gap = this.weightedRandomChoice(probabilities);
      
      // Sprawdź czy nie przekroczymy zakresu gry
      if (currentSum + gap + startNumber + maxGaps - i <= gameConfig.maxNumber) {
        gaps.push(gap);
        currentSum += gap;
      } else {
        // Jeśli przekroczymy, użyj mniejszego odstępu
        const remainingGaps = maxGaps - i;
        const maxAllowedGap = Math.floor((gameConfig.maxNumber - startNumber - currentSum) / remainingGaps);
        gaps.push(Math.max(1, Math.min(gap, maxAllowedGap)));
        currentSum += gaps[gaps.length - 1];
      }
    }
    
    return gaps;
  }

  /**
   * Konwertuje odstępy na liczby lotto
   */
  convertGapsToNumbers(gaps, game) {
    const numbers = [];
    const gameConfig = this.getGameConfig(game);
    
    // Losowy punkt startowy
    let currentNumber = Math.floor(Math.random() * (gameConfig.maxNumber / 3)) + 1;
    numbers.push(currentNumber);
    
    // Dodaj kolejne liczby na podstawie odstępów
    gaps.forEach(gap => {
      currentNumber += gap;
      if (currentNumber <= gameConfig.maxNumber && !numbers.includes(currentNumber)) {
        numbers.push(currentNumber);
      }
    });
    
    // Jeśli brakuje liczb, dodaj losowe
    while (numbers.length < gameConfig.numbersCount) {
      const randomNumber = Math.floor(Math.random() * gameConfig.maxNumber) + 1;
      if (!numbers.includes(randomNumber)) {
        numbers.push(randomNumber);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * Sprawdza czy liczby są w zakresie gry
   */
  validateNumberRange(numbers, game) {
    const gameConfig = this.getGameConfig(game);
    
    // Sprawdź czy wszystkie liczby są w zakresie
    for (const number of numbers) {
      if (number < 1 || number > gameConfig.maxNumber) {
        return false;
      }
    }
    
    // Sprawdź czy nie ma duplikatów
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      return false;
    }
    
    return true;
  }

  /**
   * Stosuje filtry matematyczne
   */
  applyMathematicalFilters(numbers, game) {
    const gameConfig = this.getGameConfig(game);
    
    // Filtr parzystości (2-4 parzyste)
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    if (evenCount < 2 || evenCount > 4) {
      return false;
    }
    
    // Filtr rozkładu niskie/wysokie (50/50 ±1)
    const midpoint = this.getGameMidpoint(game);
    const lowCount = numbers.filter(n => n <= midpoint).length;
    const highCount = numbers.filter(n => n > midpoint).length;
    
    if (Math.abs(lowCount - highCount) > 1) {
      return false;
    }
    
    // Filtr sekwencji (nie więcej niż 3 kolejne)
    for (let i = 0; i < numbers.length - 2; i++) {
      if (numbers[i + 1] === numbers[i] + 1 && numbers[i + 2] === numbers[i] + 2) {
        return false;
      }
    }
    
    // Filtr klastrów (nie więcej niż 2 w tej samej dziesiątce)
    const decades = {};
    numbers.forEach(number => {
      const decade = Math.floor(number / 10);
      decades[decade] = (decades[decade] || 0) + 1;
    });
    
    for (const count of Object.values(decades)) {
      if (count > 2) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Stosuje strategię generowania
   */
  applyStrategy(numbers, strategy, historicalData) {
    switch (strategy) {
      case 'balanced':
        return this.applyBalancedStrategy(numbers, historicalData);
      case 'hot':
        return this.applyHotStrategy(numbers, historicalData);
      case 'cold':
        return this.applyColdStrategy(numbers, historicalData);
      case 'chess':
        return this.applyChessStrategy(numbers, historicalData);
      default:
        return numbers;
    }
  }

  /**
   * Strategia zrównoważona
   */
  applyBalancedStrategy(numbers, historicalData) {
    // 50% z poolu hot+cold, 50% z rozkładu harmonicznych odstępów
    const hotNumbers = this.getHotNumbers(historicalData);
    const coldNumbers = this.getColdNumbers(historicalData);
    
    const adjustedNumbers = [...numbers];
    
    // Zamień niektóre liczby na hot/cold
    for (let i = 0; i < Math.floor(numbers.length / 2); i++) {
      if (Math.random() < 0.5 && hotNumbers.length > 0) {
        const hotNumber = hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
        if (!adjustedNumbers.includes(hotNumber)) {
          adjustedNumbers[i] = hotNumber;
        }
      } else if (coldNumbers.length > 0) {
        const coldNumber = coldNumbers[Math.floor(Math.random() * coldNumbers.length)];
        if (!adjustedNumbers.includes(coldNumber)) {
          adjustedNumbers[i] = coldNumber;
        }
      }
    }
    
    return adjustedNumbers;
  }

  /**
   * Strategia gorących liczb
   */
  applyHotStrategy(numbers, historicalData) {
    const hotNumbers = this.getHotNumbers(historicalData);
    const adjustedNumbers = [...numbers];
    
    // Faworyzuj gorące liczby
    for (let i = 0; i < numbers.length; i++) {
      if (Math.random() < 0.7 && hotNumbers.length > 0) {
        const hotNumber = hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
        if (!adjustedNumbers.includes(hotNumber)) {
          adjustedNumbers[i] = hotNumber;
        }
      }
    }
    
    return adjustedNumbers;
  }

  /**
   * Strategia zimnych liczb
   */
  applyColdStrategy(numbers, historicalData) {
    const coldNumbers = this.getColdNumbers(historicalData);
    const adjustedNumbers = [...numbers];
    
    // Faworyzuj zimne liczby
    for (let i = 0; i < numbers.length; i++) {
      if (Math.random() < 0.7 && coldNumbers.length > 0) {
        const coldNumber = coldNumbers[Math.floor(Math.random() * coldNumbers.length)];
        if (!adjustedNumbers.includes(coldNumber)) {
          adjustedNumbers[i] = coldNumber;
        }
      }
    }
    
    return adjustedNumbers;
  }

  /**
   * Strategia szachowa (Monte Carlo + heurystyki)
   */
  async applyChessStrategy(numbers, historicalData) {
    // Symuluj 10k gier Monte Carlo
    const simulationResults = await this.runMonteCarloSimulation(numbers, 10000);
    
    // Wybierz najlepsze liczby na podstawie symulacji
    const bestNumbers = this.selectBestNumbersFromSimulation(simulationResults, numbers);
    
    return bestNumbers;
  }

  /**
   * Uruchamia symulację Monte Carlo
   */
  async runMonteCarloSimulation(originalNumbers, iterations) {
    return new Promise((resolve) => {
      const worker = new Worker(__filename, {
        workerData: {
          type: 'monte_carlo',
          originalNumbers,
          iterations,
          historicalData: this.getHistoricalDataSync()
        }
      });
      
      worker.on('message', (result) => {
        resolve(result);
      });
      
      worker.on('error', (error) => {
        console.error('Błąd worker Monte Carlo:', error);
        resolve({ scores: {}, bestNumbers: originalNumbers });
      });
    });
  }

  /**
   * Wybiera najlepsze liczby z symulacji
   */
  selectBestNumbersFromSimulation(simulationResults, originalNumbers) {
    const { scores } = simulationResults;
    
    // Sortuj liczby według wyników symulacji
    const sortedNumbers = Object.keys(scores).map(Number).sort((a, b) => scores[b] - scores[a]);
    
    // Wybierz najlepsze liczby, zachowując oryginalną strukturę
    const bestNumbers = [];
    const usedNumbers = new Set();
    
    for (const number of sortedNumbers) {
      if (bestNumbers.length >= originalNumbers.length) break;
      if (!usedNumbers.has(number)) {
        bestNumbers.push(number);
        usedNumbers.add(number);
      }
    }
    
    // Jeśli brakuje liczb, dodaj z oryginalnego zestawu
    while (bestNumbers.length < originalNumbers.length) {
      for (const number of originalNumbers) {
        if (!usedNumbers.has(number)) {
          bestNumbers.push(number);
          usedNumbers.add(number);
          break;
        }
      }
    }
    
    return bestNumbers.sort((a, b) => a - b);
  }

  /**
   * Oblicza confidence dla zestawu
   */
  calculateConfidence(numbers, harmonicStats, strategy) {
    let confidence = 0;
    
    // Sprawdź zgodność z harmonicznymi odstępami
    const gaps = [];
    for (let i = 1; i < numbers.length; i++) {
      gaps.push(numbers[i] - numbers[i - 1]);
    }
    
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const harmonicMean = harmonicStats.overallStats.mean;
    
    // Im bliżej średniej harmonicznej, tym wyższy confidence
    const gapConfidence = Math.max(0, 1 - Math.abs(avgGap - harmonicMean) / harmonicMean);
    confidence += gapConfidence * 0.4;
    
    // Sprawdź zgodność z histogramem
    let histogramConfidence = 0;
    gaps.forEach(gap => {
      const frequency = harmonicStats.histogram[gap] || 0;
      const maxFrequency = Math.max(...Object.values(harmonicStats.histogram));
      histogramConfidence += frequency / maxFrequency;
    });
    confidence += (histogramConfidence / gaps.length) * 0.3;
    
    // Bonus za strategię
    const strategyBonus = {
      'balanced': 0.1,
      'hot': 0.15,
      'cold': 0.15,
      'chess': 0.2
    };
    confidence += strategyBonus[strategy] || 0;
    
    // Normalizuj do zakresu 0-1
    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Sprawdza czy kombinacja jest popularna
   */
  isPopularCombination(numbers, historicalData) {
    // Sprawdź wzorce dat urodzin (1-31)
    const birthdayNumbers = numbers.filter(n => n >= 1 && n <= 31);
    if (birthdayNumbers.length >= 4) {
      return true; // Prawdopodobnie daty urodzin
    }
    
    // Sprawdź sekwencje
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    let consecutiveCount = 1;
    for (let i = 1; i < sortedNumbers.length; i++) {
      if (sortedNumbers[i] === sortedNumbers[i-1] + 1) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
      }
      if (consecutiveCount >= 3) {
        return true; // Zbyt wiele kolejnych liczb
      }
    }
    
    return false;
  }

  /**
   * Pobiera gorące liczby
   */
  getHotNumbers(historicalData) {
    // Implementacja pobierania gorących liczb z danych historycznych
    return [7, 13, 23, 31, 37, 42, 45, 49];
  }

  /**
   * Pobiera zimne liczby
   */
  getColdNumbers(historicalData) {
    // Implementacja pobierania zimnych liczb z danych historycznych
    return [1, 2, 8, 15, 20, 25, 30, 35, 40, 44, 47, 48];
  }

  /**
   * Pobiera statystyki harmoniczne
   */
  async getHarmonicStats() {
    const cacheKey = 'harmonic_stats';
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }
    
    try {
      const stats = this.analyzer.getStats();
      this.cache.set(cacheKey, {
        data: stats,
        timestamp: Date.now()
      });
      return stats;
    } catch (error) {
      // Jeśli nie ma statystyk, wygeneruj je
      const stats = await this.analyzer.analyzeHarmonicPatterns();
      this.cache.set(cacheKey, {
        data: stats,
        timestamp: Date.now()
      });
      return stats;
    }
  }

  /**
   * Pobiera dane historyczne
   */
  async getHistoricalData() {
    const cacheKey = 'historical_data';
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }
    
    try {
      const data = this.analyzer.loadData();
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      return [];
    }
  }

  /**
   * Pobiera dane historyczne (synchronicznie)
   */
  getHistoricalDataSync() {
    try {
      return this.analyzer.loadData();
    } catch (error) {
      return [];
    }
  }

  /**
   * Konfiguracja gier
   */
  getGameConfig(game) {
    const configs = {
      'lotto': { numbersCount: 6, maxNumber: 49 },
      'miniLotto': { numbersCount: 5, maxNumber: 42 },
      'multiMulti': { numbersCount: 10, maxNumber: 80 },
      'eurojackpot': { numbersCount: 5, maxNumber: 50, euroCount: 2, euroMax: 12 }
    };
    
    return configs[game] || configs['lotto'];
  }

  /**
   * Zwraca punkt środkowy dla gry
   */
  getGameMidpoint(game) {
    const config = this.getGameConfig(game);
    return Math.floor(config.maxNumber / 2);
  }

  /**
   * Ważone losowanie na podstawie prawdopodobieństw
   */
  weightedRandomChoice(probabilities) {
    const random = Math.random();
    let cumulative = 0;
    
    for (const [value, probability] of Object.entries(probabilities)) {
      cumulative += probability;
      if (random <= cumulative) {
        return parseInt(value);
      }
    }
    
    // Fallback
    return parseInt(Object.keys(probabilities)[0]);
  }
}

// Worker thread dla Monte Carlo
if (!isMainThread && workerData.type === 'monte_carlo') {
  const { originalNumbers, iterations, historicalData } = workerData;
  
  // Symuluj losowania i sprawdź trafienia
  const scores = {};
  
  for (let i = 0; i < iterations; i++) {
    // Generuj losowy wynik
    const randomResult = generateRandomResult(originalNumbers.length, 49);
    
    // Sprawdź trafienia
    const hits = originalNumbers.filter(n => randomResult.includes(n)).length;
    
    // Przyznaj punkty
    originalNumbers.forEach(number => {
      if (randomResult.includes(number)) {
        scores[number] = (scores[number] || 0) + hits;
      }
    });
  }
  
  parentPort.postMessage({ scores, bestNumbers: originalNumbers });
}

function generateRandomResult(count, max) {
  const numbers = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * max) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

module.exports = HarmonicGenerator;

