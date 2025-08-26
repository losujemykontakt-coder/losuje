import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  sendPasswordResetEmail,
  confirmPasswordReset,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

// Rejestracja użytkownika
export const registerUser = async (email, password, name) => {
  try {
    // Utwórz użytkownika w Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Zapisz dodatkowe dane użytkownika w Firestore z okresem próbnym
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dni
    
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      subscription_status: 'trial',
      subscription_plan: 'free',
      trial_start_date: now.toISOString(),
      trial_end_date: trialEnd.toISOString(),
      is_blocked: false
    });

    return { success: true, user: user };
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

    // Pobierz dane użytkownika z Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    // Zarejestruj logowanie w backendzie (dla żetonów dziennych)
    try {
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://losuje.pl/api/auth/register-login'
        : `${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/auth/register-login`;
        
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Logowanie zarejestrowane:', data.message);
      } else {
        console.warn('⚠️ Nie udało się zarejestrować logowania');
      }
    } catch (backendError) {
      console.warn('⚠️ Backend niedostępny podczas logowania:', backendError);
    }

    return { 
      success: true, 
      user: { 
        uid: user.uid, 
        email: user.email, 
        name: userData?.name || 'Użytkownik'
      } 
    };
  } catch (error) {
    console.error('Błąd logowania:', error);
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

// Potwierdzenie resetowania hasła
export const confirmPasswordResetWithCode = async (oobCode, newPassword) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { success: true };
  } catch (error) {
    console.error('Błąd potwierdzenia resetowania hasła:', error);
    return { success: false, error: error.message };
  }
};

// Nasłuchiwanie zmian stanu autentykacji
export const onAuthStateChange = (callback) => {
  console.log('🔍 onAuthStateChange wywołane z auth:', auth);
  console.log('🔍 auth.currentUser:', auth.currentUser);
  
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('🔍 onAuthStateChanged callback wywołane:', user ? `Zalogowany: ${user.email}` : 'Niezalogowany');
    callback(user);
  });
  
  return unsubscribe;
};

// Aktualizacja profilu użytkownika
export const updateUserProfile = async (uid, userData) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...userData,
      updated_at: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Błąd aktualizacji profilu:', error);
    return { success: false, error: error.message };
  }
};

// Funkcje do obsługi subskrypcji - Firebase
export const getUserSubscription = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        subscription_status: userData.subscription_status || 'trial',
        subscription_plan: userData.subscription_plan || 'free',
        trial_start_date: userData.trial_start_date || userData.created_at,
        trial_end_date: userData.trial_end_date,
        subscription_start_date: userData.subscription_start_date,
        subscription_end_date: userData.subscription_end_date,
        is_blocked: userData.is_blocked || false,
        created_at: userData.created_at // Dodaję datę rejestracji
      };
    }
    return null;
  } catch (error) {
    console.error('Błąd pobierania subskrypcji:', error);
    return null;
  }
};

export const processPayment = async (userId, amount, paymentMethod, plan) => {
  try {
    // Symulacja płatności - w rzeczywistej aplikacji tutaj byłby prawdziwy system płatności
    const now = new Date();
    const subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dni
    
    // Aktualizuj subskrypcję w Firebase
    await updateDoc(doc(db, 'users', userId), {
      subscription_status: 'active',
      subscription_plan: plan,
      subscription_start_date: now.toISOString(),
      subscription_end_date: subscriptionEnd.toISOString(),
      is_blocked: false,
      updated_at: now.toISOString()
    });
    
    // Dodaj płatność do historii
    await setDoc(doc(db, 'payments', `${userId}_${Date.now()}`), {
      user_id: userId,
      amount: amount,
      payment_method: paymentMethod,
      plan: plan,
      status: 'completed',
      payment_date: now.toISOString(),
      created_at: now.toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Błąd przetwarzania płatności:', error);
    return { success: false, error: error.message };
  }
};

export const getPaymentHistory = async (userId) => {
  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('user_id', '==', userId),
      orderBy('payment_date', 'desc')
    );
    const querySnapshot = await getDocs(paymentsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Błąd pobierania historii płatności:', error);
    return [];
  }
};

export const getUserStatus = async (userId) => {
  try {
    const subscription = await getUserSubscription(userId);
    return {
      isBlocked: subscription?.is_blocked || false,
      subscription: subscription
    };
  } catch (error) {
    console.error('Błąd sprawdzania statusu użytkownika:', error);
    return { isBlocked: false, subscription: null };
  }
};

// Funkcja do sprawdzania czy użytkownik ma dostęp do funkcji
export const checkUserAccess = (subscription) => {
  // Jeśli nie ma danych subskrypcji, daj dostęp (nowy użytkownik)
  if (!subscription) return true;
  
  const now = new Date();
  
  // Sprawdź czy użytkownik jest zablokowany
  if (subscription.is_blocked) return false;
  
  // Sprawdź datę rejestracji - jeśli minęło więcej niż 7 dni, sprawdź subskrypcję
  if (subscription.created_at) {
    const createdAt = new Date(subscription.created_at);
    const daysSinceRegistration = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    // Jeśli minęło więcej niż 7 dni od rejestracji, sprawdź subskrypcję
    if (daysSinceRegistration > 7) {
      // Sprawdź okres próbny
      if (subscription.subscription_status === 'trial') {
        if (subscription.trial_end_date) {
          const trialEnd = new Date(subscription.trial_end_date);
          if (now > trialEnd) return false;
        }
        // Jeśli jest w okresie próbnym i data nie wygasła, daj dostęp
        return true;
      }
      
      // Sprawdź aktywną subskrypcję
      if (subscription.subscription_status === 'active') {
        if (subscription.subscription_end_date) {
          const subscriptionEnd = new Date(subscription.subscription_end_date);
          if (now > subscriptionEnd) return false;
        }
        return true;
      }
      
      // Jeśli minęło więcej niż 7 dni i nie ma aktywnej subskrypcji, zablokuj dostęp
      return false;
    }
  }
  
  // Dla nowych użytkowników (mniej niż 7 dni) daj dostęp
  return true;
};

export const cancelSubscription = async (userId) => {
  try {
    const now = new Date();
    
    // Aktualizuj subskrypcję w Firebase
    await updateDoc(doc(db, 'users', userId), {
      subscription_status: 'cancelled',
      updated_at: now.toISOString()
    });
    
    return { success: true, message: 'Subskrypcja została anulowana' };
  } catch (error) {
    console.error('Błąd anulowania subskrypcji:', error);
    return { success: false, error: error.message };
  }
};

// Funkcja do sprawdzania i blokowania wygasłych okresów próbnych
export const checkAndBlockExpiredTrials = async () => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const now = new Date();
    
    // Znajdź użytkowników z wygasłym okresem próbnym
    const expiredTrialsQuery = query(
      collection(db, 'users'),
      where('subscription_status', '==', 'trial'),
      where('trial_end_date', '<', now.toISOString())
    );
    
    const querySnapshot = await getDocs(expiredTrialsQuery);
    
    // Zablokuj użytkowników z wygasłym okresem próbnym
    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, {
        is_blocked: true,
        updated_at: now.toISOString()
      });
      console.log(`Użytkownik ${doc.data().email} został zablokowany - okres próbny wygasł`);
    }
    
    return { success: true, blockedCount: querySnapshot.docs.length };
  } catch (error) {
    console.error('Błąd sprawdzania wygasłych okresów próbnych:', error);
    return { success: false, error: error.message };
  }
}; 

// Logowanie przez Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Sprawdź czy użytkownik już istnieje w Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Jeśli to nowy użytkownik, utwórz profil w Firestore
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dni
      
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || 'Użytkownik Google',
        email: user.email,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        subscription_status: 'trial',
        subscription_plan: 'free',
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        is_blocked: false,
        auth_provider: 'google'
      });
    }

    // Pobierz token ID z Firebase
    const idToken = await user.getIdToken();

    // Zarejestruj logowanie w backendzie z tokenem Firebase
    try {
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://losuje.pl/api/auth/firebase-login'
        : `${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/auth/firebase-login`;
        
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Logowanie Google zarejestrowane:', data.message);
      } else {
        console.warn('⚠️ Nie udało się zarejestrować logowania Google');
      }
    } catch (backendError) {
      console.warn('⚠️ Backend niedostępny podczas logowania Google:', backendError);
    }

    return { 
      success: true, 
      user: { 
        uid: user.uid, 
        email: user.email, 
        name: user.displayName || 'Użytkownik Google'
      } 
    };
  } catch (error) {
    console.error('Błąd logowania Google:', error);
    
    // Obsługa błędów popup blocker
    if (error.code === 'auth/popup-blocked') {
      return { success: false, error: 'Popup został zablokowany. Zezwól na popupy dla tej strony.' };
    }
    
    // Obsługa błędów popup closed
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Okno logowania zostało zamknięte.' };
    }
    
    // Obsługa błędów sieci
    if (error.code === 'auth/network-request-failed') {
      return { success: false, error: 'Błąd połączenia sieciowego. Sprawdź swoje połączenie internetowe.' };
    }
    
    return { success: false, error: error.message };
  }
}; 