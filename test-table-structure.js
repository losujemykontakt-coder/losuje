const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ścieżka do bazy danych
const dbPath = path.join(__dirname, 'backend', 'users.db');

console.log('🔍 Sprawdzam strukturę tabeli users...');
console.log('🔍 Ścieżka do bazy:', dbPath);

// Otwórz bazę danych
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Błąd otwierania bazy danych:', err);
    return;
  }
  console.log('✅ Baza danych otwarta pomyślnie');
  
  // Sprawdź strukturę tabeli users
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('❌ Błąd sprawdzania struktury tabeli:', err);
    } else {
      console.log('🔍 Struktura tabeli users:');
      columns.forEach(col => {
        console.log(`   ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'}`);
      });
    }
    
    // Sprawdź czy kolumna firebase_uid istnieje
    const hasFirebaseUid = columns.some(col => col.name === 'firebase_uid');
    console.log('🔍 Kolumna firebase_uid istnieje:', hasFirebaseUid);
    
    if (!hasFirebaseUid) {
      console.log('🔍 Dodaję kolumnę firebase_uid...');
      db.run('ALTER TABLE users ADD COLUMN firebase_uid TEXT UNIQUE', (err) => {
        if (err) {
          console.error('❌ Błąd dodawania kolumny firebase_uid:', err);
        } else {
          console.log('✅ Kolumna firebase_uid dodana pomyślnie');
        }
        db.close();
      });
    } else {
      db.close();
    }
  });
});






