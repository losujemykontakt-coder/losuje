const { db } = require('./firebase-admin');

// Funkcja do rejestracji logowania i przyznawania żetonów
const registerLogin = async (firebaseUid) => {
  try {
    console.log('🔍 Firebase registerLogin - dla UID:', firebaseUid);
    console.log('🔍 Firebase registerLogin - UID type:', typeof firebaseUid);
    console.log('🔍 Firebase registerLogin - UID length:', firebaseUid?.length);
    
    const userRef = db.collection('users').doc(firebaseUid);
    const loginStreakRef = db.collection('login_streaks').doc(firebaseUid);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Sprawdź czy użytkownik istnieje
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      console.log('🔍 Tworzę nowego użytkownika w Firebase...');
      await userRef.set({
        firebase_uid: firebaseUid,
        email: 'firebase@user.com',
        name: 'Firebase User',
        subscription_status: 'trial',
        subscription_plan: 'free',
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // Sprawdź czy istnieje rekord login_streak
    const streakDoc = await loginStreakRef.get();
    
    if (!streakDoc.exists) {
      // Pierwsze logowanie - utwórz nowy rekord
      console.log('🔍 Pierwsze logowanie - tworzę rekord streak');
      console.log('🔍 Przyznaję pierwszy żeton!');
      await loginStreakRef.set({
        user_id: firebaseUid,
        current_streak: 1,
        total_tokens: 1,
        last_login_date: today,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log('✅ Pierwszy żeton przyznany!');
      return { currentStreak: 1, totalTokens: 1, newToken: true };
    } else {
      // Sprawdź czy już zalogowany dzisiaj
      const streakData = streakDoc.data();
      const lastLogin = new Date(streakData.last_login_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastLogin) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Kolejny dzień z rzędu
        const newStreak = streakData.current_streak + 1;
        const newTokens = streakData.total_tokens + 1;
        
        console.log('🔍 Kolejny dzień z rzędu - przyznaję żeton!');
        console.log('🔍 Stary streak:', streakData.current_streak, 'nowy streak:', newStreak);
        console.log('🔍 Stare tokeny:', streakData.total_tokens, 'nowe tokeny:', newTokens);
        
        await loginStreakRef.update({
          current_streak: newStreak,
          total_tokens: newTokens,
          last_login_date: today,
          updated_at: new Date()
        });
        
        console.log('✅ Żeton przyznany! - streak:', newStreak, 'tokens:', newTokens);
        return { currentStreak: newStreak, totalTokens: newTokens, newToken: true };
      } else if (diffDays === 0) {
        // Już zalogowany dzisiaj
        console.log('🔍 Już zalogowany dzisiaj - nie przyznaję żetonu');
        console.log('🔍 Obecny streak:', streakData.current_streak, 'obecne tokeny:', streakData.total_tokens);
        return { currentStreak: streakData.current_streak, totalTokens: streakData.total_tokens, newToken: false };
      } else {
        // Przerwa w serii - reset
        const newTokens = streakData.total_tokens + 1;
        
        console.log('🔍 Przerwa w serii - przyznaję żeton mimo przerwy!');
        console.log('🔍 Stare tokeny:', streakData.total_tokens, 'nowe tokeny:', newTokens);
        
        await loginStreakRef.update({
          current_streak: 1,
          total_tokens: newTokens,
          last_login_date: today,
          updated_at: new Date()
        });
        
        console.log('✅ Żeton przyznany mimo przerwy! - streak: 1, tokens:', newTokens);
        return { currentStreak: 1, totalTokens: newTokens, newToken: true };
      }
    }
  } catch (error) {
    console.error('❌ Firebase registerLogin - błąd:', error);
    throw error;
  }
};

// Funkcja do pobierania informacji o serii logowań
const getLoginStreak = async (firebaseUid) => {
  try {
    console.log('🔍 Firebase getLoginStreak - dla UID:', firebaseUid);
    
    const loginStreakRef = db.collection('login_streaks').doc(firebaseUid);
    const streakDoc = await loginStreakRef.get();
    
    if (!streakDoc.exists) {
      console.log('🔍 Brak rekordu streak - zwracam domyślne wartości');
      return { current_streak: 0, total_tokens: 0, last_login_date: null };
    }
    
    const data = streakDoc.data();
    console.log('🔍 Otrzymane dane streak:', data);
    return data;
  } catch (error) {
    console.error('❌ Firebase getLoginStreak - błąd:', error);
    throw error;
  }
};

// Funkcja do sprawdzania czy użytkownik może otrzymać talizman
const checkTalismanEligibility = async (firebaseUid) => {
  try {
    console.log('🔍 Firebase checkTalismanEligibility - dla UID:', firebaseUid);
    
    const streak = await getLoginStreak(firebaseUid);
    console.log('🔍 Otrzymany streak:', streak);
    
    const talismanRequirements = [8, 12, 16, 20, 24, 28, 36, 40, 44, 50];
    const availableTalismans = talismanRequirements.filter(req => streak.total_tokens >= req);
    
    const result = {
      currentStreak: streak.current_streak,
      totalTokens: streak.total_tokens,
      availableTalismans,
      nextTalisman: talismanRequirements.find(req => req > streak.total_tokens) || null
    };
    
    console.log('🔍 Wynik eligibility:', result);
    return result;
  } catch (error) {
    console.error('❌ Firebase checkTalismanEligibility - błąd:', error);
    throw error;
  }
};

// Funkcja do pobierania talizmanów użytkownika
const getUserTalismans = async (firebaseUid) => {
  try {
    console.log('🔍 Firebase getUserTalismans - dla UID:', firebaseUid);
    
    const talismansRef = db.collection('user_talismans').where('user_id', '==', firebaseUid);
    const snapshot = await talismansRef.get();
    
    const talismans = [];
    snapshot.forEach(doc => {
      talismans.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('🔍 Otrzymane talizmany:', talismans);
    return talismans;
  } catch (error) {
    console.error('❌ Firebase getUserTalismans - błąd:', error);
    throw error;
  }
};

// Funkcja do pobierania aktywnego talizmanu
const getActiveTalisman = async (firebaseUid) => {
  try {
    console.log('🔍 Firebase getActiveTalisman - dla UID:', firebaseUid);
    
    const talismansRef = db.collection('user_talismans')
      .where('user_id', '==', firebaseUid)
      .where('active', '==', true)
      .limit(1);
    
    const snapshot = await talismansRef.get();
    
    if (snapshot.empty) {
      console.log('🔍 Brak aktywnego talizmanu');
      return null;
    }
    
    const doc = snapshot.docs[0];
    const talisman = { id: doc.id, ...doc.data() };
    console.log('🔍 Aktywny talizman:', talisman);
    return talisman;
  } catch (error) {
    console.error('❌ Firebase getActiveTalisman - błąd:', error);
    throw error;
  }
};

// Funkcja do pobierania aktywnych bonusów
const getActiveBonuses = async (firebaseUid) => {
  try {
    console.log('🔍 Firebase getActiveBonuses - dla UID:', firebaseUid);
    
    const now = new Date();
    const bonusesRef = db.collection('talisman_bonuses')
      .where('user_id', '==', firebaseUid)
      .where('expires_at', '>', now);
    
    const snapshot = await bonusesRef.get();
    
    const bonuses = [];
    snapshot.forEach(doc => {
      bonuses.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('🔍 Otrzymane bonusy:', bonuses);
    return bonuses;
  } catch (error) {
    console.error('❌ Firebase getActiveBonuses - błąd:', error);
    throw error;
  }
};

// Funkcja do przyznawania talizmanu
const grantTalisman = async (firebaseUid, talismanId) => {
  try {
    console.log('🔍 Firebase grantTalisman - UID:', firebaseUid, 'talismanId:', talismanId);
    
    const talismanRef = db.collection('user_talismans').doc();
    await talismanRef.set({
      user_id: firebaseUid,
      talisman_id: talismanId,
      owned: true,
      active: false,
      obtained_date: new Date(),
      created_at: new Date()
    });
    
    console.log('🔍 Talizman przyznany pomyślnie');
    return talismanRef.id;
  } catch (error) {
    console.error('❌ Firebase grantTalisman - błąd:', error);
    throw error;
  }
};

// Funkcja do aktywowania/deaktywowania talizmanu
const toggleTalismanActive = async (firebaseUid, talismanId, active) => {
  try {
    console.log('🔍 Firebase toggleTalismanActive - UID:', firebaseUid, 'talismanId:', talismanId, 'active:', active);
    
    // Najpierw deaktywuj wszystkie talizmany
    const allTalismansRef = db.collection('user_talismans')
      .where('user_id', '==', firebaseUid);
    
    const snapshot = await allTalismansRef.get();
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      batch.update(doc.ref, { active: false });
    });
    
    // Następnie aktywuj wybrany talizman (jeśli active = true)
    if (active) {
      const talismanRef = db.collection('user_talismans')
        .where('user_id', '==', firebaseUid)
        .where('talisman_id', '==', talismanId);
      
      const talismanSnapshot = await talismanRef.get();
      if (!talismanSnapshot.empty) {
        const doc = talismanSnapshot.docs[0];
        batch.update(doc.ref, { active: true });
      }
    }
    
    await batch.commit();
    console.log('🔍 Talizman przełączony pomyślnie');
    return 1;
  } catch (error) {
    console.error('❌ Firebase toggleTalismanActive - błąd:', error);
    throw error;
  }
};

// Funkcja do dodawania bonusu talizmanu
const addTalismanBonus = async (firebaseUid, talismanId, bonusType, bonusValue, expiresAt) => {
  try {
    console.log('🔍 Firebase addTalismanBonus - UID:', firebaseUid, 'talismanId:', talismanId, 'bonusType:', bonusType);
    
    const bonusRef = db.collection('talisman_bonuses').doc();
    await bonusRef.set({
      user_id: firebaseUid,
      talisman_id: talismanId,
      bonus_type: bonusType,
      bonus_value: bonusValue,
      expires_at: new Date(expiresAt),
      created_at: new Date()
    });
    
    console.log('🔍 Bonus dodany pomyślnie');
    return bonusRef.id;
  } catch (error) {
    console.error('❌ Firebase addTalismanBonus - błąd:', error);
    throw error;
  }
};

// Funkcja do przyznania testowych żetonów
const addTestTokens = async (firebaseUid, tokensToAdd = 200) => {
  try {
    console.log('🔍 Firebase addTestTokens - dla UID:', firebaseUid, 'żetonów:', tokensToAdd);
    
    const loginStreakRef = db.collection('login_streaks').doc(firebaseUid);
    
    // Sprawdź czy istnieje rekord login_streak
    const streakDoc = await loginStreakRef.get();
    
    if (!streakDoc.exists) {
      // Utwórz nowy rekord z testowymi żetonami
      console.log('🔍 Tworzę nowy rekord streak z testowymi żetonami');
      await loginStreakRef.set({
        user_id: firebaseUid,
        current_streak: 1,
        total_tokens: tokensToAdd,
        last_login_date: new Date().toISOString().split('T')[0],
        created_at: new Date(),
        updated_at: new Date()
      });
      
      return { currentStreak: 1, totalTokens: tokensToAdd, message: `Przyznano ${tokensToAdd} testowych żetonów` };
    } else {
      // Dodaj żetony do istniejącego rekordu
      const streakData = streakDoc.data();
      const newTokens = streakData.total_tokens + tokensToAdd;
      
      await loginStreakRef.update({
        total_tokens: newTokens,
        updated_at: new Date()
      });
      
      console.log('🔍 Dodano testowe żetony - nowa suma:', newTokens);
      return { 
        currentStreak: streakData.current_streak, 
        totalTokens: newTokens, 
        message: `Dodano ${tokensToAdd} testowych żetonów. Nowa suma: ${newTokens}` 
      };
    }
  } catch (error) {
    console.error('❌ Firebase addTestTokens - błąd:', error);
    throw error;
  }
};

module.exports = {
  registerLogin,
  getLoginStreak,
  checkTalismanEligibility,
  getUserTalismans,
  getActiveTalisman,
  getActiveBonuses,
  grantTalisman,
  toggleTalismanActive,
  addTalismanBonus,
  addTestTokens
};
