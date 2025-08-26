const express = require('express');
const cors = require('cors');
const app = express();

// CORS
app.use(cors({
  origin: ['https://losuje.pl', 'https://losuje-generator.pl', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test serwer działa poprawnie',
    timestamp: new Date().toISOString()
  });
});

// Firebase test endpoint
app.get('/api/firebase-test', (req, res) => {
  res.json({
    success: true,
    message: 'Firebase test - demo mode',
    firebaseAvailable: false
  });
});

// Start server
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`🚀 Test serwer działa na http://localhost:${PORT}`);
  console.log('✅ Gotowy do obsługi żądań!');
});


