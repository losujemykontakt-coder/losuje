import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCZG2uHB2IZ__F6CxgOF2m4GhW-SafT2VM",
  authDomain: "losujemy.firebaseapp.com",
  projectId: "losujemy",
  storageBucket: "losujemy.firebasestorage.app",
  messagingSenderId: "271352474565",
  appId: "1:271352474565:web:7f8ea133aecf58d2eb79ac",
  measurementId: "G-ZF948JXHGX"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
console.log('🔍 Firebase app zainicjalizowany:', app);

// Eksportuj Auth, Firestore i Google Provider
export const auth = getAuth(app);
console.log('🔍 Firebase auth zainicjalizowany:', auth);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Konfiguracja Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app; 