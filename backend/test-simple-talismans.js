const { db } = require('./db');

console.log('=== PROSTY TEST TALIZMANÓW ===');

// Sprawdź czy użytkownik istnieje
db.get('SELECT id, name, email FROM users LIMIT 1', (err, user) => {
  if (err) {
    console.error('❌ Błąd sprawdzania użytkowników:', err);
    return;
  }
  
  if (!user) {
    console.log('❌ Brak użytkowników w bazie');
    return;
  }
  
  console.log('✅ Znaleziony użytkownik:', user);
  
  // Test rejestracji logowania
  const { registerLogin } = require('./db');
  
  registerLogin(user.id)
    .then(result => {
      console.log('✅ Rejestracja logowania:', result);
      
      // Sprawdź talizmany
      return db.all('SELECT * FROM user_talismans WHERE user_id = ?', [user.id]);
    })
    .then(talismans => {
      console.log('✅ Talizmany użytkownika:', talismans);
      
      // Sprawdź login streak
      return db.get('SELECT * FROM login_streaks WHERE user_id = ?', [user.id]);
    })
    .then(streak => {
      console.log('✅ Login streak:', streak);
      console.log('\n=== TEST ZAKOŃCZONY ===');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Błąd testu:', error);
      process.exit(1);
    });
});







