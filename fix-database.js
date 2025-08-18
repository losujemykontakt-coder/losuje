const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ścieżka do bazy danych
const dbPath = path.join(__dirname, 'backend', 'users.db');

console.log('🔍 Naprawiam bazę danych...');
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
      db.close();
      return;
    }
    
    console.log('🔍 Struktura tabeli users:');
    columns.forEach(col => {
      console.log(`   ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Sprawdź czy kolumna firebase_uid istnieje
    const hasFirebaseUid = columns.some(col => col.name === 'firebase_uid');
    console.log('🔍 Kolumna firebase_uid istnieje:', hasFirebaseUid);
    
    if (!hasFirebaseUid) {
      console.log('🔍 Dodaję kolumnę firebase_uid...');
      
      // Dodaj kolumnę bez UNIQUE
      db.run('ALTER TABLE users ADD COLUMN firebase_uid TEXT', (err) => {
        if (err) {
          console.error('❌ Błąd dodawania kolumny firebase_uid:', err);
          db.close();
          return;
        }
        
        console.log('✅ Kolumna firebase_uid dodana pomyślnie');
        
        // Sprawdź czy tabele talizmanów istnieją
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
          if (err) {
            console.error('❌ Błąd sprawdzania tabel:', err);
            db.close();
            return;
          }
          
          console.log('🔍 Istniejące tabele:', tables.map(t => t.name));
          
          const requiredTables = ['login_streaks', 'user_talismans', 'talisman_bonuses'];
          const missingTables = requiredTables.filter(table => 
            !tables.some(t => t.name === table)
          );
          
          if (missingTables.length > 0) {
            console.log('🔍 Brakujące tabele:', missingTables);
            console.log('🔍 Tworzę brakujące tabele...');
            
            // Utwórz tabele talizmanów
            const createTables = [
              `CREATE TABLE IF NOT EXISTS login_streaks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                current_streak INTEGER DEFAULT 0,
                total_tokens INTEGER DEFAULT 0,
                last_login_date DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
              )`,
              `CREATE TABLE IF NOT EXISTS user_talismans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                talisman_id INTEGER NOT NULL,
                owned BOOLEAN DEFAULT 0,
                active BOOLEAN DEFAULT 0,
                obtained_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
              )`,
              `CREATE TABLE IF NOT EXISTS talisman_bonuses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                talisman_id INTEGER NOT NULL,
                bonus_type TEXT NOT NULL,
                bonus_value TEXT,
                expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
              )`
            ];
            
            let completed = 0;
            createTables.forEach((sql, index) => {
              db.run(sql, (err) => {
                if (err) {
                  console.error(`❌ Błąd tworzenia tabeli ${index}:`, err);
                } else {
                  console.log(`✅ Tabela ${index} utworzona pomyślnie`);
                }
                completed++;
                if (completed === createTables.length) {
                  console.log('✅ Wszystkie tabele utworzone');
                  db.close();
                }
              });
            });
          } else {
            console.log('✅ Wszystkie wymagane tabele istnieją');
            db.close();
          }
        });
      });
    } else {
      console.log('✅ Kolumna firebase_uid już istnieje');
      db.close();
    }
  });
});






