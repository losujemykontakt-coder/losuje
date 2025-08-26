const admin = require('firebase-admin');
const path = require('path');

// Inicjalizacja Firebase Admin z pliku serviceAccountKey.json
let serviceAccount;
let app;
let auth;
let db;

try {
  // Sprawdź czy plik serviceAccountKey.json istnieje
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  serviceAccount = require(serviceAccountPath);
  
  // Inicjalizuj Firebase Admin
  if (!admin.apps.length) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://losujemy-default-rtdb.europe-west1.firebasedatabase.app'
    });
  } else {
    app = admin.app();
  }
  
  auth = admin.auth();
  db = admin.firestore();
  
  console.log('✅ Firebase Admin zainicjalizowany poprawnie');
} catch (error) {
  console.error('❌ Błąd inicjalizacji Firebase Admin:', error.message);
  console.log('⚠️ Firebase Admin tymczasowo wyłączony - używam demo danych');
  auth = null;
  db = null;
}

module.exports = { auth, db, admin }; 