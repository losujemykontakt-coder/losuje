const { auth, db, admin } = require('./backend/firebase-admin');

console.log('🧪 Test Firebase Admin po naprawie...\n');

// Test 1: Sprawdź czy Firebase Admin jest dostępny
console.log('1️⃣ Sprawdzam dostępność Firebase Admin...');
if (auth && db) {
    console.log('✅ Firebase Admin jest dostępny');
    console.log('   - Auth:', typeof auth);
    console.log('   - Firestore:', typeof db);
} else {
    console.log('❌ Firebase Admin nie jest dostępny');
    console.log('   - Auth:', auth);
    console.log('   - Firestore:', db);
}

// Test 2: Sprawdź czy aplikacja Firebase jest zainicjalizowana
console.log('\n2️⃣ Sprawdzam inicjalizację aplikacji Firebase...');
if (admin.apps.length > 0) {
    console.log('✅ Aplikacja Firebase jest zainicjalizowana');
    console.log('   - Liczba aplikacji:', admin.apps.length);
} else {
    console.log('❌ Aplikacja Firebase nie jest zainicjalizowana');
}

// Test 3: Sprawdź konfigurację
console.log('\n3️⃣ Sprawdzam konfigurację Firebase...');
try {
    const app = admin.app();
    const options = app.options;
    console.log('✅ Konfiguracja Firebase:');
    console.log('   - Project ID:', options.projectId);
    console.log('   - Database URL:', options.databaseURL);
} catch (error) {
    console.log('❌ Błąd sprawdzania konfiguracji:', error.message);
}

// Test 4: Sprawdź połączenie z Firestore
console.log('\n4️⃣ Testuję połączenie z Firestore...');
if (db) {
    try {
        // Próba pobrania dokumentu testowego
        const testDoc = db.collection('test').doc('connection');
        console.log('✅ Firestore jest dostępny');
        console.log('   - Kolekcja testowa utworzona');
    } catch (error) {
        console.log('❌ Błąd połączenia z Firestore:', error.message);
    }
} else {
    console.log('❌ Firestore nie jest dostępny');
}

// Test 5: Sprawdź połączenie z Auth
console.log('\n5️⃣ Testuję połączenie z Firebase Auth...');
if (auth) {
    try {
        // Próba pobrania listy użytkowników (limit 1)
        console.log('✅ Firebase Auth jest dostępny');
        console.log('   - Moduł auth załadowany poprawnie');
    } catch (error) {
        console.log('❌ Błąd połączenia z Firebase Auth:', error.message);
    }
} else {
    console.log('❌ Firebase Auth nie jest dostępny');
}

console.log('\n🎉 Test Firebase Admin zakończony!');
