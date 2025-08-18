const express = require('express');
const router = express.Router();
const HarmonicAnalyzer = require('./harmonic-analyzer');
const HarmonicGenerator = require('./harmonic-generator');

/**
 * Harmonic Lotto Analyzer API
 * 
 * Endpointy do analizy harmonicznych wzorców i generowania liczb
 * opartych na analizie odstępów między kolejnymi liczbami lotto.
 */

// Inicjalizacja modułów
const analyzer = new HarmonicAnalyzer();
const generator = new HarmonicGenerator();

/**
 * POST /api/harmonic/generate
 * Generuje zestawy liczb oparte na analizie harmonicznej
 */
router.post('/generate', async (req, res) => {
  try {
    console.log('🎲 Harmonic Generator - żądanie generowania:', req.body);
    
    const { game = 'lotto', strategy = 'balanced', nSets = 1 } = req.body;
    
    // Walidacja parametrów
    const validGames = ['lotto', 'miniLotto', 'multiMulti', 'eurojackpot'];
    const validStrategies = ['balanced', 'hot', 'cold', 'chess'];
    
    if (!validGames.includes(game)) {
      return res.status(400).json({
        success: false,
        error: 'Nieprawidłowa gra. Dozwolone: lotto, miniLotto, multiMulti, eurojackpot'
      });
    }
    
    if (!validStrategies.includes(strategy)) {
      return res.status(400).json({
        success: false,
        error: 'Nieprawidłowa strategia. Dozwolone: balanced, hot, cold, chess'
      });
    }
    
    if (nSets < 1 || nSets > 20) {
      return res.status(400).json({
        success: false,
        error: 'Liczba zestawów musi być między 1 a 20'
      });
    }
    
    // Generuj zestawy
    const result = await generator.generateSets(game, strategy, nSets);
    
    console.log(`✅ Wygenerowano ${result.sets.length} zestawów ${game} strategią ${strategy}`);
    
    res.json({
      success: true,
      ...result,
      description: getStrategyDescription(strategy),
      disclaimer: 'UWAGA: Żadna metoda nie gwarantuje trafienia 6/6. Analiza harmoniczna optymalizuje jedynie statystyczne cechy zestawów.'
    });
    
  } catch (error) {
    console.error('❌ Błąd generowania harmonicznego:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd generowania zestawów',
      details: error.message
    });
  }
});

/**
 * GET /api/harmonic/stats
 * Pobiera statystyki analizy harmonicznej
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Harmonic Analyzer - żądanie statystyk');
    
    // Pobierz statystyki
    const stats = analyzer.getStats();
    
    // Przygotuj odpowiedź
    const response = {
      success: true,
      analysis: stats.analysis,
      overallStats: stats.overallStats,
      timeWindows: stats.timeWindows,
      data: stats.data,
      generatedAt: stats.generatedAt,
      description: {
        title: 'Analiza Prawo Harmonicznych Odległości',
        explanation: `
          Ta analiza bada odstępy między kolejnymi liczbami w wynikach lotto.
          
          ZASADA DZIAŁANIA:
          1. Dla każdego losowania obliczamy różnice między kolejnymi liczbami
          2. Analizujemy rozkład tych odstępów w czasie
          3. Sprawdzamy czy średnia odstępów jest bliska wartości 7-8 (harmoniczna)
          4. Porównujemy statystyki w różnych oknach czasowych
          
          WYNIKI:
          - Średnia odstępów: ${stats.overallStats.mean}
          - Czy harmoniczna: ${stats.analysis.isNearHarmonic ? 'TAK' : 'NIE'}
          - Analizowane losowania: ${stats.analysis.totalDraws}
          - Okres analizy: ${stats.data.dateRange}
        `,
        conclusion: stats.analysis.conclusion
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Błąd pobierania statystyk harmonicznych:', error);
    
    // Jeśli nie ma statystyk, wygeneruj je
    try {
      console.log('🔄 Generowanie statystyk harmonicznych...');
      const stats = await analyzer.analyzeHarmonicPatterns();
      
      res.json({
        success: true,
        analysis: stats.analysis,
        overallStats: stats.overallStats,
        timeWindows: stats.timeWindows,
        data: stats.data,
        generatedAt: stats.generatedAt,
        message: 'Statystyki zostały wygenerowane'
      });
      
    } catch (analysisError) {
      res.status(500).json({
        success: false,
        error: 'Błąd analizy harmonicznej',
        details: analysisError.message
      });
    }
  }
});

/**
 * POST /api/harmonic/analyze
 * Przeprowadza nową analizę harmoniczną
 */
router.post('/analyze', async (req, res) => {
  try {
    console.log('🔄 Harmonic Analyzer - żądanie nowej analizy');
    
    // Przeprowadź analizę
    const stats = await analyzer.analyzeHarmonicPatterns();
    
    console.log('✅ Analiza harmoniczna zakończona');
    
    res.json({
      success: true,
      message: 'Analiza harmoniczna została przeprowadzona pomyślnie',
      analysis: stats.analysis,
      overallStats: stats.overallStats,
      generatedAt: stats.generatedAt
    });
    
  } catch (error) {
    console.error('❌ Błąd analizy harmonicznej:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd analizy harmonicznej',
      details: error.message
    });
  }
});

/**
 * POST /api/harmonic/update
 * Aktualizuje dane i analizę harmoniczną
 */
router.post('/update', async (req, res) => {
  try {
    console.log('🔄 Harmonic Analyzer - żądanie aktualizacji');
    
    // Aktualizuj analizę
    const stats = await analyzer.updateAnalysis();
    
    console.log('✅ Aktualizacja harmoniczna zakończona');
    
    res.json({
      success: true,
      message: 'Analiza harmoniczna została zaktualizowana',
      analysis: stats.analysis,
      overallStats: stats.overallStats,
      generatedAt: stats.generatedAt
    });
    
  } catch (error) {
    console.error('❌ Błąd aktualizacji harmonicznej:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd aktualizacji analizy harmonicznej',
      details: error.message
    });
  }
});

/**
 * GET /api/harmonic/histogram
 * Pobiera histogram odstępów
 */
router.get('/histogram', async (req, res) => {
  try {
    console.log('📈 Harmonic Analyzer - żądanie histogramu');
    
    const stats = analyzer.getStats();
    
    res.json({
      success: true,
      histogram: stats.histogram,
      totalGaps: stats.analysis.totalGaps,
      generatedAt: stats.generatedAt
    });
    
  } catch (error) {
    console.error('❌ Błąd pobierania histogramu:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd pobierania histogramu',
      details: error.message
    });
  }
});

/**
 * GET /api/harmonic/time-windows
 * Pobiera analizę okien czasowych
 */
router.get('/time-windows', async (req, res) => {
  try {
    console.log('⏰ Harmonic Analyzer - żądanie okien czasowych');
    
    const stats = analyzer.getStats();
    
    res.json({
      success: true,
      timeWindows: stats.timeWindows,
      generatedAt: stats.generatedAt
    });
    
  } catch (error) {
    console.error('❌ Błąd pobierania okien czasowych:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd pobierania okien czasowych',
      details: error.message
    });
  }
});

/**
 * GET /api/harmonic/info
 * Pobiera informacje o analizie harmonicznej
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    title: 'Harmonic Lotto Analyzer + Smart Generator',
    description: `
      Zaawansowany system analizy i generowania liczb lotto oparty na 
      Prawie Harmonicznych Odległości.
      
      FUNKCJONALNOŚCI:
      ✅ Analiza odstępów między kolejnymi liczbami
      ✅ Wykrywanie wzorców harmonicznych
      ✅ Generowanie liczb oparte na analizie statystycznej
      ✅ Różne strategie generowania (balanced, hot, cold, chess)
      ✅ Monte Carlo symulacje
      ✅ Filtry matematyczne i optymalizacje
      
      STRATEGIE:
      🎯 Balanced - zrównoważona strategia łącząca różne podejścia
      🔥 Hot - faworyzuje często występujące liczby
      ❄️ Cold - faworyzuje rzadko występujące liczby  
      ♟️ Chess - zaawansowana strategia z Monte Carlo
      
      UWAGA: Żadna metoda nie gwarantuje trafienia 6/6. 
      System optymalizuje jedynie statystyczne cechy zestawów.
    `,
    endpoints: {
      'POST /generate': 'Generuje zestawy liczb',
      'GET /stats': 'Pobiera statystyki analizy',
      'POST /analyze': 'Przeprowadza nową analizę',
      'POST /update': 'Aktualizuje dane i analizę',
      'GET /histogram': 'Pobiera histogram odstępów',
      'GET /time-windows': 'Pobiera analizę okien czasowych',
      'GET /info': 'Informacje o systemie'
    },
    version: '1.0.0',
    author: 'Harmonic Lotto Team'
  });
});

/**
 * Funkcja pomocnicza - opis strategii
 */
function getStrategyDescription(strategy) {
  const descriptions = {
    'balanced': {
      name: 'Strategia Zrównoważona',
      description: 'Łączy różne podejścia: 50% z poolu hot+cold liczb, 50% z rozkładu harmonicznych odstępów. Optymalna dla większości graczy.',
      icon: '🎯'
    },
    'hot': {
      name: 'Strategia Gorących Liczb',
      description: 'Faworyzuje liczby, które często występowały w historii. Bazuje na założeniu, że popularne liczby mają tendencję do powtarzania się.',
      icon: '🔥'
    },
    'cold': {
      name: 'Strategia Zimnych Liczb',
      description: 'Faworyzuje liczby, które rzadko występowały w historii. Bazuje na teorii wyrównywania się szans w długim terminie.',
      icon: '❄️'
    },
    'chess': {
      name: 'Strategia Szachowa',
      description: 'Zaawansowana strategia wykorzystująca Monte Carlo symulacje (10k gier) i heurystyki. Najbardziej zaawansowana metoda, ale wymaga więcej czasu.',
      icon: '♟️'
    }
  };
  
  return descriptions[strategy] || descriptions['balanced'];
}

module.exports = router;

