const express = require('express');
const app = express();
const { db } = require('./db');

app.use(express.json());

// Test endpoint dla talizmanów
app.get('/api/talismans/test/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Sprawdź czy użytkownik istnieje
    db.get('SELECT id, name, email FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('Błąd sprawdzania użytkownika:', err);
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      }
      
      console.log('✅ Użytkownik znaleziony:', user);
      
      // Sprawdź login streak
      db.get('SELECT * FROM login_streaks WHERE user_id = ?', [userId], (err, streak) => {
        if (err) {
          console.error('Błąd sprawdzania streak:', err);
          return res.status(500).json({ error: 'Błąd serwera' });
        }
        
        console.log('✅ Login streak:', streak || 'Brak');
        
        // Sprawdź talizmany
        db.all('SELECT * FROM user_talismans WHERE user_id = ?', [userId], (err, talismans) => {
          if (err) {
            console.error('Błąd sprawdzania talizmanów:', err);
            return res.status(500).json({ error: 'Błąd serwera' });
          }
          
          console.log('✅ Talizmany użytkownika:', talismans);
          
          res.json({
            success: true,
            user,
            streak: streak || { current_streak: 0, total_tokens: 0 },
            talismans: talismans || []
          });
        });
      });
    });
  } catch (error) {
    console.error('Błąd testu API:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Test rejestracji logowania
app.post('/api/talismans/test-login/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { registerLogin } = require('./db');
    const result = await registerLogin(userId);
    
    console.log('✅ Rejestracja logowania:', result);
    
    res.json({
      success: true,
      loginResult: result
    });
  } catch (error) {
    console.error('Błąd rejestracji logowania:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Test API uruchomiony na porcie ${PORT}`);
  console.log(`📝 Testy dostępne:`);
  console.log(`   GET http://localhost:${PORT}/api/talismans/test/1`);
  console.log(`   POST http://localhost:${PORT}/api/talismans/test-login/1`);
});







