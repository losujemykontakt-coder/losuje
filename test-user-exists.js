const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ścieżka do bazy danych
const dbPath = path.join(__dirname, 'backend', 'users.db');

console.log('🔍 Sprawdzam czy użytkownik istnieje w bazie danych...');
console.log('🔍 Ścieżka do bazy:', dbPath);

// Otwórz bazę danych
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Błąd otwierania bazy danych:', err);
    return;
  }
  console.log('✅ Baza danych otwarta pomyślnie');
  
  // Sprawdź czy użytkownik istnieje
  const userId = 'nH0fsvS8EnUXigwG8Lg1abdg1iU2';
  
  db.get('SELECT * FROM users WHERE firebase_uid = ?', [userId], (err, row) => {
    if (err) {
      console.error('❌ Błąd szukania użytkownika:', err);
    } else {
      console.log('🔍 Wynik szukania użytkownika:', row);
      
      if (row) {
        console.log('✅ Użytkownik znaleziony!');
        console.log('   ID:', row.id);
        console.log('   Email:', row.email);
        console.log('   Firebase UID:', row.firebase_uid);
        
        // Sprawdź czy ma rekord w login_streaks
        db.get('SELECT * FROM login_streaks WHERE user_id = ?', [row.id], (err, streak) => {
          if (err) {
            console.error('❌ Błąd szukania streak:', err);
          } else {
            console.log('🔍 Login streak:', streak);
          }
          
          // Sprawdź talizmany
          db.all('SELECT * FROM user_talismans WHERE user_id = ?', [row.id], (err, talismans) => {
            if (err) {
              console.error('❌ Błąd szukania talizmanów:', err);
            } else {
              console.log('🔍 Talizmany użytkownika:', talismans);
            }
            
            db.close();
          });
        });
      } else {
        console.log('❌ Użytkownik nie znaleziony!');
        
        // Sprawdź wszystkie użytkowników
        db.all('SELECT id, email, firebase_uid FROM users LIMIT 5', (err, rows) => {
          if (err) {
            console.error('❌ Błąd pobierania użytkowników:', err);
          } else {
            console.log('🔍 Pierwszych 5 użytkowników w bazie:', rows);
          }
          db.close();
        });
      }
    }
  });
});
