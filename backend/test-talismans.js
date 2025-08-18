const { db } = require('./db');

console.log('=== TEST SYSTEMU TALIZMANÓW ===');

// Sprawdź tabele
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
  if (err) {
    console.error('❌ Błąd sprawdzania tabel:', err);
    return;
  }
  
  console.log('✅ Tabele w bazie danych:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });
  
  // Sprawdź czy tabele talizmanów istnieją
  const talismanTables = ['user_talismans', 'login_streaks', 'talisman_bonuses'];
  const missingTables = talismanTables.filter(tableName => 
    !tables.some(t => t.name === tableName)
  );
  
  if (missingTables.length > 0) {
    console.log('❌ Brakujące tabele:', missingTables);
  } else {
    console.log('✅ Wszystkie tabele talizmanów istnieją');
  }
  
  // Sprawdź strukturę tabeli user_talismans
  db.all('PRAGMA table_info(user_talismans)', (err, columns) => {
    if (err) {
      console.log('❌ Błąd sprawdzania struktury user_talismans:', err);
    } else {
      console.log('✅ Struktura tabeli user_talismans:');
      columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
      });
    }
    
    // Sprawdź strukturę tabeli login_streaks
    db.all('PRAGMA table_info(login_streaks)', (err, columns) => {
      if (err) {
        console.log('❌ Błąd sprawdzania struktury login_streaks:', err);
      } else {
        console.log('✅ Struktura tabeli login_streaks:');
        columns.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
      }
      
      console.log('\n=== TEST ZAKOŃCZONY ===');
      process.exit(0);
    });
  });
});







