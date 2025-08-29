const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// CORS
app.use(cors({
  origin: ['https://losuje.pl', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json());

// Harmonic Analyzer
const HarmonicAnalyzer = require('./harmonic-analyzer');
const HarmonicGenerator = require('./harmonic-generator');

const analyzer = new HarmonicAnalyzer();
const generator = new HarmonicGenerator();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Harmonic Analyzer Backend działa!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Harmonic stats endpoint
app.get('/api/harmonic/stats', async (req, res) => {
  try {
    console.log('📊 Harmonic Analyzer - żądanie statystyk');
    
    // Sprawdź czy statystyki istnieją
    const statsPath = path.join(__dirname, 'data', 'harmonic_stats.json');
    if (!fs.existsSync(statsPath)) {
      console.log('🔄 Generowanie statystyk harmonicznych...');
      await analyzer.analyzeHarmonicPatterns();
    }
    
    const stats = analyzer.getStats();
    
    res.json({
      success: true,
      analysis: stats.analysis,
      overallStats: stats.overallStats,
      timeWindows: stats.timeWindows,
      data: stats.data,
      generatedAt: stats.generatedAt,
      dataSource: stats.dataSource
    });
    
  } catch (error) {
    console.error('❌ Błąd pobierania statystyk:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd pobierania statystyk harmonicznych',
      details: error.message
    });
  }
});

// Harmonic generate endpoint
app.post('/api/harmonic/generate', async (req, res) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Harmonic Analyzer Backend działa na porcie ${PORT}`);
  console.log(`📊 API dostępne:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/harmonic/stats`);
  console.log(`   POST /api/harmonic/generate`);
  console.log(`🌐 CORS: dozwolone origins: https://losuje.pl, http://localhost:3000, http://127.0.0.1:3000`);
});

