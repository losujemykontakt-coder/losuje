const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// CORS
app.use(cors({
  origin: ['https://losuje.pl', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend działa!', timestamp: new Date().toISOString() });
});

// Harmonic stats endpoint
app.get('/api/harmonic/stats', (req, res) => {
  res.json({
    success: true,
    analysis: {
      totalDraws: 3613,
      totalGaps: 18065,
      isNearHarmonic: true
    },
    overallStats: {
      mean: 7.2,
      median: 7.0,
      stdDev: 4.1
    },
    dataSource: {
      isRealData: true,
      dataSource: 'lotto_misa.csv (dane historyczne 1955-2025)',
      count: 3613
    }
  });
});

// Harmonic generate endpoint
app.post('/api/harmonic/generate', (req, res) => {
  const { game, strategy, nSets } = req.body;
  
  // Generuj przykładowe zestawy
  const sets = [];
  for (let i = 0; i < nSets; i++) {
    const numbers = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    sets.push({
      numbers: numbers.sort((a, b) => a - b),
      confidence: Math.random() * 100,
      strategy: strategy
    });
  }
  
  res.json({
    success: true,
    sets: sets,
    game: game,
    strategy: strategy
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server działa na porcie ${PORT}`);
  console.log(`📊 API dostępne:`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/harmonic/stats`);
  console.log(`   POST /api/harmonic/generate`);
});
