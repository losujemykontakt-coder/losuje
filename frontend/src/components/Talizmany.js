import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Talizmany = ({ user, talismanDefinitions }) => {
  console.log('🔍 Talizmany component rendered with:', { user, talismanDefinitions });
  
  // Prosty test renderowania
  console.log('🔍 Talizmany component is rendering!');
  
  const { t } = useTranslation();
  const [talismans, setTalismans] = useState([]);
  const [streak, setStreak] = useState({ current_streak: 0, total_tokens: 0 });
  const [eligibility, setEligibility] = useState({});
  const [activeTalisman, setActiveTalisman] = useState(null);
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedTalisman, setSelectedTalisman] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false); // Dodaj flagę dla loadTalismansWithUID

  // Sprawdź czy talismanDefinitions są przekazane, jeśli nie - użyj domyślnych
  const defaultTalismanDefinitions = [
    {
      id: 1,
      name: '4-listna koniczyna',
      description: 'Przynosi szczęście w liczbach parzystych',
      icon: '🍀',
      requirement: 8,
      color: '#4CAF50',
      effect: 'even'
    },
    {
      id: 2,
      name: 'Podkowa',
      description: 'Zwiększa szanse na trafienie w liczbach parzystych',
      icon: '🐎',
      requirement: 12,
      color: '#FF9800',
      effect: 'even'
    },
    {
      id: 3,
      name: 'Smok',
      description: 'Wypala ogień pechowe liczby',
      icon: '🐉',
      requirement: 16,
      color: '#F44336',
      effect: 'fire'
    },
    {
      id: 4,
      name: 'Księżyc',
      description: 'Sprzyja liczbom które rzadko się trafiają',
      icon: '🌙',
      requirement: 20,
      color: '#9C27B0',
      effect: 'rare'
    },
    {
      id: 5,
      name: 'Diament',
      description: 'Przynosi szczęście losowań w dni parzyste',
      icon: '💎',
      requirement: 24,
      color: '#00BCD4',
      effect: 'evenDay'
    },
    {
      id: 6,
      name: 'Feniks',
      description: 'Odnawia szczęście po nieudanych losowaniach',
      icon: '🦅',
      requirement: 28,
      color: '#E91E63',
      effect: 'rebirth'
    },
    {
      id: 7,
      name: 'Korona',
      description: 'Królewskie szczęście - najlepszy talizman',
      icon: '👑',
      requirement: 36,
      color: '#FFD700',
      effect: 'royal'
    },
    {
      id: 8,
      name: 'Gwiazda',
      description: 'Przynosi szczęście w liczbach nieparzystych',
      icon: '⭐',
      requirement: 40,
      color: '#FFC107',
      effect: 'odd'
    },
    {
      id: 9,
      name: 'Słońce',
      description: 'Dodaje szczęście w liczbach od 21 do 40',
      icon: '☀️',
      requirement: 44,
      color: '#FF5722',
      effect: 'medium'
    },
    {
      id: 10,
      name: 'Ostateczny talizman',
      description: 'Przynosi szczęście we wszystkich liczbach',
      icon: '⚡',
      requirement: 50,
      color: '#9C27B0',
      effect: 'ultimate'
    }
  ];

  const finalTalismanDefinitions = React.useMemo(() => {
    console.log('🔍 Recalculating finalTalismanDefinitions');
    return talismanDefinitions || defaultTalismanDefinitions;
  }, [talismanDefinitions]);

  // Debug useEffect dla user i talismanDefinitions
  useEffect(() => {
    console.log("📦 user or defs changed:", user, talismanDefinitions);
  }, [user, talismanDefinitions]);

  // Ref do przechowywania poprzedniego UID
  const prevUidRef = React.useRef(null);

  // Główny useEffect - tylko raz przy montowaniu lub gdy zmieni się UID
  useEffect(() => {
    console.log("🔥 useEffect start - user.uid:", user?.uid);
    console.log('🔍 Talizmany useEffect - user:', user);
    console.log('🔍 user?.uid:', user?.uid);
    console.log('🔍 prevUidRef.current:', prevUidRef.current);
    console.log('🔍 user object:', JSON.stringify(user, null, 2));
    
    // Sprawdź czy UID się rzeczywiście zmienił
    if (user?.uid === prevUidRef.current) {
      console.log('🔄 UID się nie zmienił, pomijam ładowanie');
      return;
    }
    
    // Zaktualizuj poprzedni UID
    prevUidRef.current = user?.uid;
    
    if (user && user.uid) {
      console.log('🔍 Użytkownik znaleziony, ładuję talizmany...');
      console.log('🔍 UID do wysłania:', user.uid);
      console.log('🔍 UID length:', user.uid.length);
      // Przekaż UID bezpośrednio do funkcji
      loadTalismansWithUID(user.uid);
    } else {
      console.log('❌ Brak użytkownika lub UID w komponencie Talizmany');
      console.log('❌ user object:', user);
      console.log('❌ Ustawiam domyślne wartości - 0 żetonów');
      // Ustaw domyślne wartości dla demo
      setStreak({ current_streak: 0, total_tokens: 0 });
      setEligibility({ availableTalismans: [], totalTokens: 0, nextTalisman: null });
      setTalismans([]);
      setActiveTalisman(null);
      setBonuses([]);
      setLoading(false);
    }
  }, [user?.uid]); // Użyj user.uid zamiast całego user obiektu
  
  const loadTalismansWithUID = React.useCallback(async (uid) => {
    // Sprawdź czy już ładujemy dane
    if (isLoadingData) {
      console.log('🔄 Już ładujemy dane, pomijam');
      return;
    }
    
    try {
      setIsLoadingData(true);
      setLoading(true);
      console.log('🔍 Ładowanie talizmanów dla UID:', uid);
      console.log('🔍 UID type:', typeof uid);
      console.log('🔍 UID length:', uid?.length);
      
      const apiUrl = '/api/talismans/' + uid;
      console.log('🔍 Wysyłam request do:', apiUrl);
      
      // Najpierw sprawdź czy backend działa
      try {
        const testResponse = await fetch('/api/test', {
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2 sekundy timeout
        });
        console.log('✅ Backend odpowiada na /api/test');
      } catch (testError) {
        console.error('❌ Backend nie odpowiada na /api/test:', testError);
        throw new Error('Backend nie działa');
      }
      
      // Dodaj timeout do fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 sekundy timeout
      
      const response = await fetch(`/api/talismans/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🔍 Otrzymane dane:', data);
      console.log('🔍 data.success:', data.success);
      console.log('🔍 data.streak:', data.streak);
      console.log('🔍 data.eligibility:', data.eligibility);
      console.log('🔍 data.talismans:', data.talismans);
      console.log('🔍 data.activeTalisman:', data.activeTalisman);
      console.log('🔍 data.bonuses:', data.bonuses);
      console.log('🔍 Liczba żetonów:', data.streak?.total_tokens);
      console.log('🔍 Seria logowań:', data.streak?.current_streak);
      
      if (data.success) {
        console.log('✅ Ustawiam dane z API');
        console.log('✅ Żetony:', data.streak?.total_tokens);
        console.log('✅ Seria:', data.streak?.current_streak);
        setStreak(data.streak || { current_streak: 0, total_tokens: 0 });
        setEligibility(data.eligibility || { availableTalismans: [], totalTokens: 0, nextTalisman: null });
        setTalismans(data.talismans || []);
        setActiveTalisman(data.activeTalisman || null);
        setBonuses(data.bonuses || []);
      } else {
        console.error('❌ API zwróciło błąd:', data.error);
        console.log('⚠️ Ustawiam domyślne wartości w przypadku błędu API');
        console.log('⚠️ Szczegóły błędu:', data.details);
        // Ustaw domyślne wartości w przypadku błędu
        setStreak({ current_streak: 0, total_tokens: 0 });
        setEligibility({ availableTalismans: [], totalTokens: 0, nextTalisman: null });
        setTalismans([]);
        setActiveTalisman(null);
        setBonuses([]);
      }
    } catch (error) {
      console.error('❌ Błąd ładowania talizmanów:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      if (error.name === 'AbortError') {
        console.error('❌ Timeout - backend nie odpowiada w ciągu 3 sekund');
      } else if (error.message.includes('Failed to fetch')) {
        console.error('❌ Błąd połączenia - backend może nie działać');
      } else if (error.message.includes('NetworkError')) {
        console.error('❌ Błąd sieci - sprawdź połączenie internetowe');
      }
      
      console.log('⚠️ Ustawiam domyślne wartości w przypadku błędu catch');
      console.log('⚠️ Błąd:', error.message);
      // Ustaw domyślne wartości w przypadku błędu
      setStreak({ current_streak: 0, total_tokens: 0 });
      setEligibility({ availableTalismans: [], totalTokens: 0, nextTalisman: null });
      setTalismans([]);
      setActiveTalisman(null);
      setBonuses([]);
    } finally {
      console.log('🔍 Ustawiam loading = false');
      setLoading(false);
      setIsLoadingData(false);
    }
  }, [isLoadingData]);

  // Sprawdź czy mamy podstawowe dane i czy powinniśmy pokazać fallback
  const hasBasicData = streak && eligibility && talismans;
  const showFallback = !hasBasicData && !loading;

  // Automatyczne przełączenie na fallback po 3 sekundach
  React.useEffect(() => {
    if (loading && !hasBasicData) {
      const fallbackTimer = setTimeout(() => {
        console.log('⏰ Automatyczne przełączenie na fallback po 3 sekundach');
        console.log('⏰ Ustawiam domyślne wartości - 0 żetonów');
        setLoading(false);
        setStreak({ current_streak: 0, total_tokens: 0 });
        setEligibility({ availableTalismans: [], totalTokens: 0, nextTalisman: null });
        setTalismans([]);
        setActiveTalisman(null);
        setBonuses([]);
      }, 3000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [loading, hasBasicData]);

  const grantTalisman = async (talismanId) => {
    if (showFallback) {
      // W trybie fallback pokaż powiadomienie demo
      setNotificationMessage(`Demo: Gratulacje! Zdobyłeś ${finalTalismanDefinitions[talismanId - 1].name}!`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }
    
    try {
      const response = await fetch('/api/talismans/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          talismanId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotificationMessage(`Gratulacje! Zdobyłeś ${finalTalismanDefinitions[talismanId - 1].name}!`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        loadTalismansWithUID(user.uid); // Odśwież dane
      }
    } catch (error) {
      console.error('Błąd przyznawania talizmanu:', error);
    }
  };

  const toggleTalisman = async (talismanId, active) => {
    if (showFallback) {
      // W trybie fallback pokaż powiadomienie demo
      setNotificationMessage(`Demo: Talizman ${active ? 'aktywowany' : 'deaktywowany'}!`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
      return;
    }
    
    try {
      const response = await fetch('/api/talismans/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          talismanId,
          active
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotificationMessage(data.message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
        loadTalismansWithUID(user.uid); // Odśwież dane
      }
    } catch (error) {
      console.error('Błąd przełączania talizmanu:', error);
    }
  };

  const isTalismanOwned = (talismanId) => {
    if (showFallback) {
      // W trybie fallback pokaż pierwsze 2 talizmany jako posiadane
      console.log('🔍 Demo: talizman', talismanId, 'posiadany:', talismanId <= 2);
      return talismanId <= 2;
    }
    return talismans.some(t => t.talisman_id === talismanId && t.owned);
  };

  const isTalismanActive = (talismanId) => {
    if (showFallback) {
      // W trybie fallback pokaż pierwszy talizman jako aktywny
      console.log('🔍 Demo: talizman', talismanId, 'aktywny:', talismanId === 1);
      return talismanId === 1;
    }
    return activeTalisman && activeTalisman.talisman_id === talismanId;
  };

  const canGrantTalisman = (talismanId) => {
    const talisman = finalTalismanDefinitions[talismanId - 1];
    if (showFallback) {
      // W trybie fallback pokaż przycisk "Odbierz!" dla pierwszych 3 talizmanów
      console.log('🔍 Demo: talizman', talismanId, 'można odebrać:', talismanId <= 3);
      return talismanId <= 3;
    }
    return eligibility.availableTalismans && 
           eligibility.availableTalismans.includes(talisman.requirement) &&
           !isTalismanOwned(talismanId);
  };

  const getNextTalismanProgress = () => {
    if (!eligibility.nextTalisman) return null;
    
    const currentTokens = eligibility.totalTokens;
    const nextRequirement = eligibility.nextTalisman;
    const progress = (currentTokens / nextRequirement) * 100;
    
    console.log('🔍 Progress: currentTokens =', currentTokens, 'nextRequirement =', nextRequirement, 'progress =', progress);
    
    return {
      current: currentTokens,
      required: nextRequirement,
      progress: Math.min(progress, 100)
    };
  };

  const progress = getNextTalismanProgress();
  console.log('🔍 Final progress:', progress);
  
  console.log('🔍 Render - loading:', loading, 'user:', !!user, 'hasBasicData:', hasBasicData);
  console.log('🔍 Render - streak:', streak);
  console.log('🔍 Render - żetony:', streak?.total_tokens);
  
  if (loading) {
    console.log('🔍 Pokazuję loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Ładowanie talizmanów...</p>
          <p className="text-white text-sm mt-2">Sprawdzanie połączenia z serwerem...</p>
        </div>
      </div>
    );
  }
  
  // Fallback jeśli brak user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">❌ Błąd</h1>
          <p className="text-white">Brak danych użytkownika. Spróbuj się zalogować ponownie.</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Debug info - tylko w trybie deweloperskim */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center mb-4 p-2 bg-black/20 rounded">
          <p className="text-white text-sm">DEBUG: User ID: {user?.id || 'Brak'}</p>
          <p className="text-white text-sm">DEBUG: User UID: {user?.uid || 'Brak'}</p>
          <p className="text-white text-sm">DEBUG: Loading: {loading.toString()}</p>
          <p className="text-white text-sm">DEBUG: Talismans count: {talismans.length}</p>
          <p className="text-white text-sm">DEBUG: Active talisman: {activeTalisman ? 'Tak' : 'Nie'}</p>
          <p className="text-white text-sm">DEBUG: Streak: {streak.current_streak} dni, {streak.total_tokens} żetonów</p>
          

        </div>
      )}
      
      {/* Fallback gdy brak danych */}
      {!hasBasicData && !loading && (
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-white mb-4">✨ Talizmany</h1>
          <p className="text-white mb-4">Nie udało się załadować danych talizmanów.</p>
          <p className="text-white text-sm mb-4">Debug: user.uid = {user?.uid}</p>
          <button 
            onClick={() => loadTalismansWithUID(user.uid)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}
      
      {/* Główna zawartość gdy mamy dane lub fallback */}
      {(hasBasicData || showFallback) && (
        <>
        {/* Nagłówek */}
        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4">✨ Talizmany ✨</h1>
        {showFallback && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 mb-4">
            <p className="text-yellow-200 text-sm">
              ⚠️ Nie udało się połączyć z serwerem. Pokazuję demo talizmanów.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-yellow-200 text-xs mt-1">
                Debug: showFallback = true, user.uid = {user?.uid}
              </p>
            )}
          </div>
        )}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Seria logowań: {streak?.current_streak || 0} dni</span>
              <span className="text-yellow-300 font-bold">🎯 {streak?.total_tokens || 0} żetonów</span>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-white/60 mt-1">
                Debug: streak = {JSON.stringify(streak)}
              </div>
            )}
                      {progress && (
              <div className="mb-2">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>Następny talizman: {progress.current}/{progress.required}</span>
                  <span>{Math.round(progress.progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            )}
            {showFallback && (
              <div className="mb-2">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>Demo: 0/8</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: '0%' }} />
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-white/60 mt-1">
                    Debug: showFallback = true, demo progress
                  </div>
                )}
              </div>
            )}
        </div>
      </motion.div>

      {/* Siatka talizmanów */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
        {finalTalismanDefinitions.map((talisman, index) => {
          const owned = isTalismanOwned(talisman.id);
          const active = isTalismanActive(talisman.id);
          const canGrant = canGrantTalisman(talisman.id);
          
          return (
            <motion.div
              key={talisman.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group cursor-pointer ${
                owned ? 'opacity-100' : 'opacity-50'
              }`}
              onClick={() => setSelectedTalisman(talisman)}
            >
              <div className={`
                relative bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center
                border-2 transition-all duration-300 hover:scale-105
                ${owned ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-gray-600'}
                ${active ? 'ring-4 ring-purple-400 ring-opacity-50' : ''}
              `}>
                {/* Ikona talizmanu */}
                <div className="mb-4 flex justify-center items-center min-h-[80px] sm:min-h-[100px]">
                  {talisman.icon === '⊃' ? (
                    <img src="/horseshoe.png" alt="Podkowa" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 mx-auto" />
                  ) : (
                    <span className="talisman-icon">
                      {talisman.icon}
                    </span>
                  )}
                </div>
                
                {/* Nazwa */}
                <h3 className="font-bold text-white text-xs sm:text-sm md:text-base mb-1">{talisman.name}</h3>
                
                {/* Wymaganie */}
                <div className="text-xs sm:text-sm text-white/70 mb-2">
                  {talisman.requirement} żetonów
                </div>
                
                {/* Status */}
                {owned && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                
                {active && (
                  <div className="absolute top-2 left-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                
                {/* Przycisk akcji */}
                {canGrant && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      grantTalisman(talisman.id);
                    }}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-2 px-3 rounded-lg text-xs hover:from-yellow-300 hover:to-orange-400 transition-all"
                  >
                    Odbierz!
                  </motion.button>
                )}
                
                {owned && !active && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTalisman(talisman.id, true);
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-2 px-3 rounded-lg text-xs hover:from-purple-400 hover:to-blue-400 transition-all"
                  >
                    Aktywuj
                  </motion.button>
                )}
                
                {active && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTalisman(talisman.id, false);
                    }}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-2 px-3 rounded-lg text-xs hover:from-red-400 hover:to-pink-400 transition-all"
                  >
                    Deaktywuj
                  </motion.button>
                )}
              </div>
              
              {/* Efekt iskier dla aktywnego talizmanu */}
              {active && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                      animate={{
                        x: [0, Math.random() * 100 - 50],
                        y: [0, Math.random() * 100 - 50],
                        opacity: [1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      </>
      )}

      {/* Modal szczegółów talizmanu */}
      <AnimatePresence>
        {selectedTalisman && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTalisman(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mb-4">
                  <span className="talisman-icon" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}>{selectedTalisman.icon}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedTalisman.name}</h2>
                <p className="text-white/80 mb-4">{selectedTalisman.description}</p>
                
                <div className="bg-white/10 rounded-lg p-3 mb-4">
                  <div className="text-white/70 text-sm">Wymagane żetony:</div>
                  <div className="text-yellow-300 font-bold">{selectedTalisman.requirement}</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3 mb-4">
                  <div className="text-white/70 text-sm">Status:</div>
                  <div className="text-white">
                    {isTalismanOwned(selectedTalisman.id) ? (
                      isTalismanActive(selectedTalisman.id) ? (
                        <span className="text-green-400">✓ Aktywny</span>
                      ) : (
                        <span className="text-yellow-400">✓ Posiadany</span>
                      )
                    ) : (
                      <span className="text-gray-400">✗ Nie posiadany</span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedTalisman(null)}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all"
                >
                  Zamknij
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Powiadomienie */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg z-50"
          >
            <div className="flex items-center space-x-2">
              <span>🎉</span>
              <span>{notificationMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Talizmany;
