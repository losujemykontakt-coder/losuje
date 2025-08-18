const admin = require('firebase-admin');

// Inicjalizacja Firebase Admin z pliku serviceAccountKey.json
let serviceAccount;
let app;
let auth;
let db;

try {
  // Załaduj klucz z pliku
  serviceAccount = require('./serviceAccountKey.json');
  console.log('✅ Załadowano klucz Firebase z pliku serviceAccountKey.json');
  
  // Sprawdź czy private_key ma poprawny format
  if (serviceAccount.private_key && !serviceAccount.private_key.includes('\\n')) {
    console.log('⚠️ Poprawiam format private_key...');
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  
  // Inicjalizacja Firebase Admin
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  
  // Inicjalizacja Auth i Firestore
  auth = admin.auth(app);
  db = admin.firestore(app);
  
  console.log('✅ Firebase Admin zainicjalizowany pomyślnie');
  console.log(`📊 Projekt: ${serviceAccount.project_id}`);
  
} catch (error) {
  console.error('❌ Błąd inicjalizacji Firebase Admin:', error.message);
  console.log('⚠️ Kontynuuję bez Firebase - używam domyślnych danych');
  
  // Ustaw null dla Auth i Firestore
  auth = null;
  db = null;
  
  // Nie rzucaj błędu - pozwól aplikacji działać bez Firebase
  console.log('✅ Aplikacja będzie działać bez Firebase');
}

module.exports = { auth, db, admin }; 