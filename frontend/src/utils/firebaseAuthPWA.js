import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebasePWA';

// Rejestracja użytkownika
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Aktualizuj profil użytkownika
    await updateProfile(user, { displayName });
    
    // Utwórz dokument użytkownika w Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName,
      createdAt: serverTimestamp(),
      isPremium: false,
      trialActive: true,
      trialStartDate: serverTimestamp(),
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dni
      subscriptionActive: false,
      coins: 100, // Domyślne monety
      lastLogin: serverTimestamp()
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    return { success: false, error: error.message };
  }
};

// Logowanie użytkownika
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Aktualizuj ostatnie logowanie
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      });
    } catch (firestoreError) {
      console.warn('⚠️ Błąd aktualizacji Firestore:', firestoreError.message);
      // Kontynuuj mimo błędu Firestore
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Błąd logowania:', error);
    
    // Obsługa specyficznych błędów Firebase
    if (error.code === 'auth/user-not-found') {
      return { success: false, error: 'Użytkownik nie istnieje' };
    }
    if (error.code === 'auth/wrong-password') {
      return { success: false, error: 'Nieprawidłowe hasło' };
    }
    if (error.code === 'auth/too-many-requests') {
      return { success: false, error: 'Zbyt wiele prób logowania. Spróbuj ponownie później' };
    }
    if (error.code === 'auth/network-request-failed') {
      return { success: false, error: 'Błąd połączenia sieciowego. Sprawdź internet' };
    }
    
    return { success: false, error: error.message };
  }
};

// Logowanie przez Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Sprawdź czy użytkownik już istnieje
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Utwórz nowego użytkownika
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName,
            createdAt: serverTimestamp(),
            isPremium: false,
            trialActive: true,
            trialStartDate: serverTimestamp(),
            trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dni
            subscriptionActive: false,
            coins: 100, // Domyślne monety
            lastLogin: serverTimestamp()
          });
        } catch (firestoreError) {
          console.warn('⚠️ Błąd tworzenia użytkownika w Firestore:', firestoreError.message);
          // Kontynuuj mimo błędu Firestore
        }
      } else {
        // Aktualizuj ostatnie logowanie
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: serverTimestamp()
          });
        } catch (firestoreError) {
          console.warn('⚠️ Błąd aktualizacji Firestore:', firestoreError.message);
          // Kontynuuj mimo błędu Firestore
        }
      }
    } catch (firestoreError) {
      console.warn('⚠️ Błąd sprawdzania użytkownika w Firestore:', firestoreError.message);
      // Kontynuuj mimo błędu Firestore
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Błąd logowania Google:', error);
    
    // Obsługa specyficznych błędów Firebase
    if (error.code === 'auth/popup-blocked') {
      return { success: false, error: 'Popup został zablokowany. Zezwól na popupy dla tej strony.' };
    }
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Okno logowania zostało zamknięte.' };
    }
    if (error.code === 'auth/network-request-failed') {
      return { success: false, error: 'Błąd połączenia sieciowego. Sprawdź internet.' };
    }
    if (error.code === 'auth/cancelled-popup-request') {
      return { success: false, error: 'Logowanie zostało anulowane.' };
    }
    
    return { success: false, error: error.message };
  }
};

// Wylogowanie użytkownika
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Błąd wylogowania:', error);
    return { success: false, error: error.message };
  }
};

// Nasłuchiwanie zmian stanu autoryzacji
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Resetowanie hasła
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Błąd resetowania hasła:', error);
    return { success: false, error: error.message };
  }
};

// Pobieranie statusu użytkownika
export const getUserStatus = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Błąd pobierania statusu użytkownika:', error);
    return null;
  }
};

// Pobieranie subskrypcji użytkownika
export const getUserSubscription = async (userId) => {
  try {
    const subscriptionQuery = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(subscriptionQuery);
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error('Błąd pobierania subskrypcji:', error);
    return null;
  }
};

// Pobieranie historii płatności
export const getPaymentHistory = async (userId) => {
  try {
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(paymentsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Błąd pobierania historii płatności:', error);
    return [];
  }
};

// Sprawdzanie dostępu użytkownika
export const checkUserAccess = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.activeTalisman || null;
    }
    return null;
  } catch (error) {
    console.error('Błąd sprawdzania dostępu:', error);
    return null;
  }
};

// Anulowanie subskrypcji
export const cancelSubscription = async (userId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      subscriptionActive: false,
      isPremium: false
    });
    return { success: true };
  } catch (error) {
    console.error('Błąd anulowania subskrypcji:', error);
    return { success: false, error: error.message };
  }
};

// Sprawdzanie i blokowanie wygasłych prób
export const checkAndBlockExpiredTrials = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.trialActive && userData.trialEndDate) {
        const trialEnd = userData.trialEndDate.toDate();
        if (new Date() > trialEnd) {
          await updateDoc(doc(db, 'users', userId), {
            trialActive: false
          });
          return false;
        }
      }
      return userData.trialActive;
    }
    return false;
  } catch (error) {
    console.error('Błąd sprawdzania próby:', error);
    return false;
  }
};

