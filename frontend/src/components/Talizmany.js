import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Talizmany = ({ user, talismanDefinitions }) => {
  console.log('🔍 Talizmany component rendered with:', { user, talismanDefinitions });
  
  // Prosty test renderowania
  console.log('🔍 Talizmany component is rendering!');
  
  const { t } = useTranslation();
  
  // Responsive styles - podobne do Harmonic Analyzer
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;
  const isExtraSmall = windowWidth <= 300;

  const containerStyle = {
    width: "100%",
    maxWidth: "100%",
    padding: isExtraSmall ? "5px" : isSmallMobile ? "10px" : isMobile ? "15px" : "20px",
    boxSizing: "border-box",
    overflowX: "hidden"
  };

  const titleStyle = {
    fontSize: isExtraSmall ? "16px" : isSmallMobile ? "18px" : isMobile ? "20px" : "24px",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: isExtraSmall ? "10px" : isSmallMobile ? "12px" : isMobile ? "15px" : "20px",
    textAlign: "center"
  };

  const talismanGridStyle = {
    display: "grid",
    gridTemplateColumns: isExtraSmall ? "repeat(2, 1fr)" : isSmallMobile ? "repeat(2, 1fr)" : isMobile ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
    gap: isExtraSmall ? "4px" : isSmallMobile ? "6px" : isMobile ? "8px" : "10px",
    marginBottom: isExtraSmall ? "10px" : isSmallMobile ? "12px" : isMobile ? "15px" : "20px",
    justifyItems: "stretch",
    alignItems: "stretch",
    width: "100%"
  };

  const talismanCardStyle = {
    background: "transparent",
    borderRadius: "6px",
    padding: isExtraSmall ? "4px" : isSmallMobile ? "6px" : isMobile ? "10px" : "8px",
    boxShadow: "none",
    textAlign: "center",
    minHeight: isExtraSmall ? "120px" : isSmallMobile ? "140px" : isMobile ? "170px" : "160px",
    maxHeight: isExtraSmall ? "140px" : isSmallMobile ? "160px" : isMobile ? "200px" : "180px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.3s ease",
    position: "relative",
    cursor: "pointer",
    width: "100%",
    height: "100%"
  };

  const talismanIconStyle = {
    fontSize: isExtraSmall ? "12rem" : isSmallMobile ? "11rem" : isMobile ? "10rem" : "8rem",
    marginBottom: isExtraSmall ? "4px" : isSmallMobile ? "6px" : isMobile ? "8px" : "8px",
    lineHeight: "1",
    display: "block"
  };

  const talismanNameStyle = {
    fontSize: isExtraSmall ? "1.8rem" : isSmallMobile ? "2rem" : isMobile ? "2.2rem" : "1.8rem",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: isExtraSmall ? "2px" : isSmallMobile ? "3px" : isMobile ? "4px" : "6px",
    lineHeight: "1.2"
  };

  const talismanRequirementStyle = {
    fontSize: isExtraSmall ? "1.6rem" : isSmallMobile ? "1.8rem" : isMobile ? "2rem" : "1.4rem",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: "1.2"
  };
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
  const [forceFallback, setForceFallback] = useState(false); // Dodaj state dla wymuszenia trybu fallback
  const [confetti, setConfetti] = useState([]); // Dodaj state dla confetti

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

  // Funkcja do generowania confetti
  const generateConfetti = () => {
    const newConfetti = [];
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00'];

    for (let i = 0; i < 150; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        delay: Math.random() * 2
      });
    }
    setConfetti(prev => [...prev, ...newConfetti]);
    
    // Usuń confetti po 3 sekundach
    setTimeout(() => {
      setConfetti(prev => prev.filter(c => !newConfetti.includes(c)));
    }, 3000);
  };

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
        const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_API_URL || 'https://losuje.pl');
        const testResponse = await fetch(`${baseUrl}/api/test`, {
          method: 'GET',
          signal: AbortSignal.timeout(10000) // 10 sekund timeout
        });
        console.log('✅ Backend odpowiada na /api/test');
      } catch (testError) {
        console.error('❌ Backend nie odpowiada na /api/test:', testError);
        console.log('⚠️ Przechodzę w tryb fallback - demo mode');
        // Nie rzucaj błędu, tylko przejdź w tryb fallback
        setForceFallback(true);
        setLoading(false);
        setIsLoadingData(false);
        return;
      }
      
      // Dodaj timeout do fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sekund timeout
      
      // Użyj proxy w trybie development, a REACT_APP_API_URL w produkcji
      const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_API_URL || 'https://losuje.pl');
      const response = await fetch(`${baseUrl}/api/talismans/${uid}`, {
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
  const showFallback = (!hasBasicData && !loading) || forceFallback;

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
      setTimeout(() => setShowNotification(false), 4000);
      generateConfetti(); // Dodaj confetti
      // Aktualizuj aktywny talizman w App.js
      if (window.updateActiveTalisman) {
        window.updateActiveTalisman(talismanId);
      }
      return;
    }
    
    // Sprawdź czy użytkownik ma dostęp
    if (eligibility?.blocked) {
      setNotificationMessage('🔒 Dostęp zablokowany. Wykup subskrypcję, aby odbierać talizmany.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
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
        setNotificationMessage(`🎉 Gratulacje! Zdobyłeś ${finalTalismanDefinitions[talismanId - 1].name}! 🎉`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 4000);
        generateConfetti(); // Dodaj confetti
        loadTalismansWithUID(user.uid); // Odśwież dane
      }
    } catch (error) {
      console.error('Błąd przyznawania talizmanu:', error);
    }
  };

  const toggleTalisman = async (talismanId, active) => {
    if (showFallback) {
      // W trybie fallback pokaż powiadomienie demo
      const message = active ? `Demo: 🎉 Talizman aktywowany! 🎉` : `Demo: Talizman deaktywowany!`;
      setNotificationMessage(message);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      if (active) {
        generateConfetti(); // Dodaj confetti tylko przy aktywacji
        // Aktualizuj aktywny talizman w App.js
        if (window.updateActiveTalisman) {
          window.updateActiveTalisman(talismanId);
        }
      }
      return;
    }
    
    // Sprawdź czy użytkownik ma dostęp
    if (eligibility?.blocked) {
      setNotificationMessage('🔒 Dostęp zablokowany. Wykup subskrypcję, aby aktywować talizmany.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
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
        const message = active ? `🎉 ${data.message} 🎉` : data.message;
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        if (active) generateConfetti(); // Dodaj confetti tylko przy aktywacji
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
    
    // Sprawdź czy użytkownik ma dostęp
    if (eligibility?.blocked) {
      console.log('🔍 Użytkownik zablokowany - nie może odebrać talizmanu');
      return false;
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
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-base sm:text-lg">Ładowanie talizmanów...</p>
          <p className="text-white text-sm mt-2">Sprawdzanie połączenia z serwerem...</p>
        </div>
      </div>
    );
  }
  
  // Fallback jeśli brak user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex justify-center items-center">
        <div className="text-center px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">❌ Błąd</h1>
          <p className="text-white text-sm sm:text-base">Brak danych użytkownika. Spróbuj się zalogować ponownie.</p>
        </div>
      </div>
    );
  }



  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: isExtraSmall ? "5px" : isSmallMobile ? "10px" : isMobile ? "15px" : "20px",
      boxSizing: "border-box",
      overflowX: "hidden"
    }}>
      {/* Debug info - tylko w trybie deweloperskim */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center mb-2 sm:mb-4 p-1 sm:p-2 bg-black/20 rounded text-xs sm:text-sm">
          <p className="text-white text-xs sm:text-sm break-all">DEBUG: User ID: {user?.id || 'Brak'}</p>
          <p className="text-white text-xs sm:text-sm break-all">DEBUG: User UID: {user?.uid || 'Brak'}</p>
          <p className="text-white text-xs sm:text-sm">DEBUG: Loading: {loading.toString()}</p>
          <p className="text-white text-xs sm:text-sm">DEBUG: Talismans count: {talismans.length}</p>
          <p className="text-white text-xs sm:text-sm">DEBUG: Active talisman: {activeTalisman ? 'Tak' : 'Nie'}</p>
          <p className="text-white text-xs sm:text-sm break-all">DEBUG: Streak: {streak.current_streak} dni, {streak.total_tokens} żetonów</p>
          

        </div>
      )}
      
      {/* Fallback gdy brak danych */}
      {!hasBasicData && !loading && (
        <div className="text-center py-2 sm:py-4 md:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">✨ Talizmany</h1>
          <p className="text-white mb-4 text-sm sm:text-base">Nie udało się załadować danych talizmanów.</p>
          <p className="text-white text-xs sm:text-sm mb-4 break-all">Debug: user.uid = {user?.uid}</p>
          <button 
            onClick={() => loadTalismansWithUID(user.uid)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded text-sm sm:text-base"
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
        className="text-center mb-4 sm:mb-8"
      >
        <h1 style={titleStyle}>✨ Talizmany ✨</h1>
        {showFallback && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-1.5 sm:p-2 md:p-3 mb-1.5 sm:mb-2 md:mb-4">
            <p className="text-yellow-200 text-xs sm:text-sm">
              ⚠️ Nie udało się połączyć z serwerem. Pokazuję demo talizmanów.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-yellow-200 text-xs mt-1 break-all">
                Debug: showFallback = true, user.uid = {user?.uid}
              </p>
            )}
          </div>
        )}
        
        {/* Informacja o blokadzie */}
        {eligibility?.blocked && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-1.5 sm:p-2 md:p-3 mb-1.5 sm:mb-2 md:mb-4">
            <p className="text-red-200 text-xs sm:text-sm font-bold">
              🔒 Dostęp zablokowany
            </p>
            <p className="text-red-200 text-xs sm:text-sm">
              Minęło {eligibility?.daysSinceRegistration || 0} dni od rejestracji. 
              Wykup subskrypcję, aby kontynuować korzystanie z talizmanów.
            </p>
          </div>
        )}
        
        {/* Informacja o czasie do końca okresu próbnego */}
        {eligibility?.hasAccess && eligibility?.daysSinceRegistration && eligibility.daysSinceRegistration > 0 && (
          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-1.5 sm:p-2 md:p-3 mb-1.5 sm:mb-2 md:mb-4">
            <p className="text-blue-200 text-xs sm:text-sm">
              ⏰ Okres próbny: {7 - eligibility.daysSinceRegistration} dni pozostało
            </p>
            <p className="text-blue-200 text-xs sm:text-sm">
              Po 7 dniach dostęp zostanie zablokowany. Wykup subskrypcję, aby kontynuować.
            </p>
          </div>
        )}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 max-w-sm sm:max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-xs sm:text-sm md:text-base truncate">Seria: {streak?.current_streak || 0} dni</span>
              <span className="text-yellow-300 font-bold text-xs sm:text-sm md:text-base ml-2">🎯 {streak?.total_tokens || 0}</span>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-white/60 mt-1 break-all">
                Debug: streak = {JSON.stringify(streak)}
              </div>
            )}
                      {progress && (
              <div className="mb-2">
                <div className="flex justify-between text-xs sm:text-sm text-white/80 mb-1">
                  <span className="truncate">Następny: {progress.current}/{progress.required}</span>
                  <span className="ml-1 sm:ml-2">{Math.round(progress.progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                  <motion.div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 sm:h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            )}
            {showFallback && (
              <div className="mb-2">
                <div className="flex justify-between text-xs sm:text-sm text-white/80 mb-1">
                  <span className="truncate">Demo: 0/8</span>
                  <span className="ml-1 sm:ml-2">0%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 sm:h-2 rounded-full" style={{ width: '0%' }} />
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-white/60 mt-1 break-all">
                    Debug: showFallback = true, demo progress
                  </div>
                )}
              </div>
            )}
        </div>
      </motion.div>

      {/* Siatka talizmanów */}
      <div style={talismanGridStyle}>
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
              <div style={{
                ...talismanCardStyle,
                border: owned ? "2px solid #fbbf24" : "2px solid #4b5563",
                boxShadow: owned ? "0 4px 15px rgba(251, 191, 36, 0.2)" : "0 4px 15px rgba(0, 0, 0, 0.2)",
                outline: active ? "4px solid rgba(168, 85, 247, 0.5)" : "none"
              }}>
                {/* Górna część - ikona i teksty */}
                <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {/* Ikona talizmanu */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isExtraSmall ? "4px" : isSmallMobile ? "6px" : isMobile ? "8px" : "10px"
                  }}>
                    {talisman.icon === '🐎' ? (
                      <img 
                        src="/horseshoe.png" 
                        alt="Podkowa" 
                        style={{
                          width: "100%",
                          height: "auto",
                          maxWidth: isExtraSmall ? "2rem" : isSmallMobile ? "2.5rem" : isMobile ? "3.5rem" : "3rem"
                        }}
                      />
                    ) : (
                      <span style={{
                        ...talismanIconStyle,
                        fontSize: isExtraSmall ? "2rem" : isSmallMobile ? "2.5rem" : isMobile ? "3.5rem" : "3rem"
                      }}>
                        {talisman.icon}
                      </span>
                    )}
                  </div>
                  
                  {/* Nazwa */}
                  <h3 style={{
                    ...talismanNameStyle,
                    fontSize: isExtraSmall ? "0.6rem" : isSmallMobile ? "0.7rem" : isMobile ? "0.8rem" : "0.75rem",
                    marginBottom: isExtraSmall ? "1px" : isSmallMobile ? "2px" : isMobile ? "3px" : "2px",
                    lineHeight: "1.1"
                  }}>
                    {talisman.name}
                  </h3>
                  
                  {/* Wymaganie */}
                  <div style={{
                    ...talismanRequirementStyle,
                    fontSize: isExtraSmall ? "0.5rem" : isSmallMobile ? "0.6rem" : isMobile ? "0.7rem" : "0.65rem",
                    marginBottom: isExtraSmall ? "2px" : isSmallMobile ? "4px" : isMobile ? "6px" : "4px"
                  }}>
                    {talisman.requirement} żetonów
                  </div>
                </div>
                
                {/* Status */}
                {owned && (
                  <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                
                {active && (
                  <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                
                {/* Dolna część - przyciski akcji */}
                <div style={{ 
                  minHeight: isExtraSmall ? "24px" : isSmallMobile ? "28px" : isMobile ? "32px" : "30px",
                  display: "flex",
                  alignItems: "flex-end",
                  marginTop: "auto"
                }}>
                  {canGrant && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        grantTalisman(talisman.id);
                      }}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded hover:from-yellow-300 hover:to-orange-400 transition-all"
                      style={{
                        padding: isExtraSmall ? "4px 6px" : isSmallMobile ? "5px 8px" : isMobile ? "6px 10px" : "6px 8px",
                        fontSize: isExtraSmall ? "0.6rem" : isSmallMobile ? "0.7rem" : isMobile ? "0.8rem" : "0.75rem",
                        height: isExtraSmall ? "20px" : isSmallMobile ? "24px" : isMobile ? "28px" : "26px",
                        lineHeight: "1.2",
                        minHeight: isExtraSmall ? "20px" : isSmallMobile ? "24px" : isMobile ? "28px" : "26px"
                      }}
                    >
                      Odbierz!
                    </motion.button>
                  )}
                  
                  {owned && !active && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTalisman(talisman.id, true);
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded hover:from-purple-400 hover:to-blue-400 transition-all"
                      style={{
                        padding: isExtraSmall ? "4px 6px" : isSmallMobile ? "5px 8px" : isMobile ? "6px 10px" : "6px 8px",
                        fontSize: isExtraSmall ? "0.6rem" : isSmallMobile ? "0.7rem" : isMobile ? "0.8rem" : "0.75rem",
                        height: isExtraSmall ? "20px" : isSmallMobile ? "24px" : isMobile ? "28px" : "26px",
                        lineHeight: "1.2",
                        minHeight: isExtraSmall ? "20px" : isSmallMobile ? "24px" : isMobile ? "28px" : "26px"
                      }}
                    >
                      Aktywuj
                    </motion.button>
                  )}
                  
                  {active && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTalisman(talisman.id, false);
                      }}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded hover:from-red-400 hover:to-pink-400 transition-all"
                      style={{
                        padding: isExtraSmall ? "4px 6px" : isSmallMobile ? "5px 8px" : isMobile ? "6px 10px" : "6px 8px",
                        fontSize: isExtraSmall ? "0.6rem" : isSmallMobile ? "0.7rem" : isMobile ? "0.8rem" : "0.75rem",
                        height: isExtraSmall ? "20px" : isSmallMobile ? "24px" : isMobile ? "28px" : "26px",
                        lineHeight: "1.2",
                        minHeight: isExtraSmall ? "20px" : isSmallMobile ? "24px" : isMobile ? "28px" : "26px"
                      }}
                    >
                      Deaktywuj
                    </motion.button>
                  )}
                </div>
              </div>
              
              {/* Efekt iskier dla aktywnego talizmanu */}
              {active && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-yellow-400 rounded-full"
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
              className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-2xl p-3 sm:p-4 md:p-6 max-w-sm sm:max-w-md w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center px-1 sm:px-2">
                <div className="talisman-icon-container mb-4">
                  <span className="talisman-icon">{selectedTalisman.icon}</span>
                </div>
                                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{selectedTalisman.name}</h2>
                                  <p className="text-white/80 mb-4 text-sm sm:text-base">{selectedTalisman.description}</p>
                
                                                                     <div className="bg-white/10 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                     <div className="text-white/70 text-xs sm:text-sm">Wymagane żetony:</div>
                     <div className="text-yellow-300 font-bold text-sm sm:text-base">{selectedTalisman.requirement}</div>
                   </div>
                
                                                                     <div className="bg-white/10 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                     <div className="text-white/70 text-xs sm:text-sm">Status:</div>
                     <div className="text-white text-sm sm:text-base">
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
                     className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm md:text-base"
                   >
                     Zamknij
                   </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map((piece) => (
            <motion.div
              key={`confetti-${piece.id}`}
              className="absolute"
              style={{
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                width: `${piece.size || 8}px`,
                height: `${piece.size || 8}px`,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotation}deg)`,
              }}
              initial={{
                opacity: 0,
                scale: 0,
                y: 0,
                x: 0,
                rotate: piece.rotation
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [-20, -300],
                x: [0, (Math.random() - 0.5) * 400],
                rotate: [piece.rotation, piece.rotation + 360]
              }}
              transition={{
                duration: 3,
                delay: piece.delay || 0,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Powiadomienie */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-3 rounded-full shadow-lg z-50 text-sm sm:text-base"
            style={{
              maxWidth: 'calc(100vw - 16px)',
              wordWrap: 'break-word',
              whiteSpace: 'normal'
            }}
          >
            <div className="flex items-center justify-center space-x-2 text-center">
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
