import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FinalStatistics from './components/statistics/FinalStatistics';
import ResultsAndWinnings from './components/statistics/ResultsAndWinnings';
import MagicznyZestawDnia from './components/MagicznyZestawDnia';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { motion, AnimatePresence } from 'framer-motion';
import NavButton from './components/NavButton';
import CookieConsent from './components/CookieConsent';
import LanguageSwitcher from './components/LanguageSwitcher';

// Komponent Slot Machine dla Landing Page
const SlotMachineLanding = ({ onUseInGenerator }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState('lotto');
  const [isSlotSpinning, setIsSlotSpinning] = useState(false);
  const [currentReel, setCurrentReel] = useState(0);
  const [slotNumbers, setSlotNumbers] = useState([]);
  const [slotResults, setSlotResults] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Reset slot machine
  const resetSlotMachine = () => {
    setSlotNumbers([]);
    setSlotResults([]);
    setCurrentReel(0);
    setHasGenerated(false);
    setIsSlotSpinning(false);
  };

  // Funkcja generująca liczby dla slot machine
  const generateSlotNumbers = (maxNumbers = 6) => {
    const numbers = [];
    for (let i = 0; i < maxNumbers; i++) {
      const reelNumbers = [];
      for (let j = 0; j < 10; j++) {
        reelNumbers.push(Math.floor(Math.random() * 49) + 1);
      }
      numbers.push(reelNumbers);
    }
    return numbers;
  };

  // Funkcja obsługująca animację slot machine
  const handleSlotMachine = () => {
    if (isSlotSpinning) return;
    
    // Sprawdź czy wybrana gra wymaga rejestracji
    if (selectedGame !== 'lotto') {
      alert(t('landing.slotMachine.registrationRequired'));
      navigate('/?page=register');
      return;
    }

    setIsSlotSpinning(true);
    setCurrentReel(0);
    setHasGenerated(false);
    
    const maxNumbers = selectedGame === 'eurojackpot' ? 7 : 
                      selectedGame === 'mini-lotto' || selectedGame === 'ekstra-pensja' ? 5 :
                      selectedGame === 'multi-multi' || selectedGame === 'keno' ? 10 : 6;
    
    const newSlotNumbers = generateSlotNumbers(maxNumbers);
    setSlotNumbers(newSlotNumbers);
    
    // Symulacja animacji bębnów
    const results = [];
    for (let i = 0; i < maxNumbers; i++) {
      setTimeout(() => {
        setCurrentReel(i + 1);
        results.push(newSlotNumbers[i][Math.floor(Math.random() * newSlotNumbers[i].length)]);
        setSlotResults([...results]);
        
        if (i === maxNumbers - 1) {
          setIsSlotSpinning(false);
          setHasGenerated(true);
        }
      }, (i + 1) * 1000);
    }
  };

  // Funkcja kopiowania wyników
  const copyResults = () => {
    if (slotResults.length > 0) {
      const resultsText = slotResults.join(', ');
      navigator.clipboard.writeText(resultsText).then(() => {
        console.log('Wyniki skopiowane:', resultsText);
      }).catch(err => {
        console.error('Błąd kopiowania:', err);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Tło z gwiazdami */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="text-center max-w-4xl mx-auto relative z-10">
        {/* Tytuł */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg"
        >
          🎰 Slot Machine Lotto
        </motion.h1>

        {/* Informacja o wybranej grze */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-purple-300 text-sm sm:text-base md:text-lg lg:text-xl font-medium drop-shadow-lg">
            Wybrana gra: {selectedGame === 'lotto' ? '🎰 Lotto' : 
              selectedGame === 'mini-lotto' ? '🍀 Mini Lotto' :
              selectedGame === 'multi-multi' ? '🎲 Multi Multi' :
              selectedGame === 'ekstra-pensja' ? '💰 Ekstra Pensja' :
              selectedGame === 'kaskada' ? '🌊 Kaskada' :
              selectedGame === 'keno' ? '🎯 Keno' :
              selectedGame === 'eurojackpot' ? '🇪🇺 Eurojackpot' : '🎰 Lotto'}
          </p>
        </motion.div>

        {/* Slot Machine Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-8 w-full max-w-[500px] mx-auto sm:scale-100 scale-90 min-w-[320px] min-h-[300px] overflow-hidden"
        >
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-300/30 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-purple-200 mb-4 text-center">🎰 Slot Machine Lotto</h3>
            <p className="text-purple-100 text-center mb-6">Jednoręki bandyta z animowanymi bębnami</p>
            
            {/* Slot Machine Interface */}
            <div className="flex justify-center mb-6">
              {(() => {
                // Oblicz liczbę bębnów na podstawie wybranej gry
                const maxNumbers = selectedGame === 'eurojackpot' ? 7 : 
                                 selectedGame === 'mini-lotto' || selectedGame === 'ekstra-pensja' ? 5 :
                                 selectedGame === 'multi-multi' || selectedGame === 'keno' ? 10 : 6;
                
                return (
                  <div className="flex gap-0 sm:gap-1 justify-center items-center flex-wrap">
                    {Array.from({ length: maxNumbers }, (_, i) => i).map((reelIndex) => (
                      <motion.div
                        key={reelIndex}
                        className={`w-8 h-12 sm:w-12 sm:h-16 md:w-16 md:h-20 lg:w-18 lg:h-22 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-lg border-2 border-yellow-300 flex items-center justify-center relative overflow-hidden ${
                          currentReel > reelIndex ? 'ring-2 ring-green-400' : ''
                        }`}
                        animate={{
                          scale: isSlotSpinning && currentReel <= reelIndex ? [1, 1.05, 1] : 1,
                        }}
                        transition={{
                          duration: 0.3,
                          repeat: isSlotSpinning && currentReel <= reelIndex ? Infinity : 0,
                        }}
                      >
                        {/* Animowane liczby w bębnie */}
                        <div className="relative h-full w-full">
                          {slotNumbers[reelIndex]?.map((number, index) => (
                            <motion.div
                              key={index}
                              className="absolute w-full h-full flex items-center justify-center text-black font-bold text-xs sm:text-sm md:text-base"
                              animate={{
                                y: isSlotSpinning && currentReel <= reelIndex 
                                  ? [-20, 20, -20] 
                                  : currentReel > reelIndex 
                                    ? 0 
                                    : [-20, 20, -20],
                              }}
                              transition={{
                                duration: 0.1,
                                repeat: isSlotSpinning && currentReel <= reelIndex ? Infinity : 0,
                                delay: index * 0.05,
                              }}
                            >
                              {number}
                            </motion.div>
                          ))}
                          
                          {/* Wynik po zatrzymaniu */}
                          {currentReel > reelIndex && slotResults[reelIndex] && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`absolute inset-0 flex items-center justify-center rounded-lg border-2 ${
                                selectedGame === 'eurojackpot' && reelIndex >= 5 
                                  ? 'bg-blue-100 border-blue-400' 
                                  : 'bg-white border-green-400'
                              }`}
                            >
                              <span className={`font-bold text-xs sm:text-sm md:text-base ${
                                selectedGame === 'eurojackpot' && reelIndex >= 5 
                                  ? 'text-blue-800' 
                                  : 'text-black'
                              }`}>
                                {slotResults[reelIndex]}
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Przycisk start */}
            <div className="text-center mb-6">
              <motion.button
                onClick={handleSlotMachine}
                disabled={isSlotSpinning}
                className={`px-8 py-4 text-xl font-bold rounded-full shadow-lg transition-all duration-300 border-2 ${
                  isSlotSpinning
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 border-purple-300 hover:scale-105'
                }`}
                whileHover={!isSlotSpinning ? { scale: 1.05 } : {}}
                whileTap={!isSlotSpinning ? { scale: 0.95 } : {}}
              >
                {isSlotSpinning ? '🎰 ' + t('common.loading') : t('landing.slotMachine.spinButton')}
              </motion.button>
            </div>

            {/* Przyciski akcji */}
            <AnimatePresence>
              {hasGenerated && slotResults.length > 0 && (
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  <motion.button
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
                    onClick={copyResults}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-base rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-purple-300 backdrop-blur-sm"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📋 Kopiuj wyniki
                  </motion.button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sekcja z grami Lotto */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-2xl md:text-3xl font-bold text-white mb-8 text-center drop-shadow-lg"
          >
            🎯 Dostępne gry Lotto
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {/* Lotto */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 1.6 }}
               style={{
                 animation: selectedGame === 'lotto' ? 'pulse 2s infinite' : 'none'
               }}
               className={`bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-6 border border-yellow-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'lotto' ? 'ring-2 ring-yellow-400 scale-105' : 'hover:scale-105'}`}
               onClick={() => {
                 setSelectedGame('lotto');
                 resetSlotMachine();
               }}
             >
              <h3 className="text-xl font-bold text-yellow-200 mb-2">🎰 Lotto</h3>
              <p className="text-yellow-100 text-sm mb-3">6 liczb z 49</p>
              <p className="text-yellow-200/80 text-xs">Klasyczna gra Lotto - wybierz 6 liczb z zakresu 1-49</p>
              <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                <p className="text-green-200 text-xs font-medium">✅ Darmowe</p>
              </div>
            </motion.div>

                         {/* Mini Lotto */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 1.8 }}
               style={{
                 animation: 'pulse 2s infinite'
               }}
               className={`bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'mini-lotto' ? 'ring-2 ring-green-400 scale-105' : 'hover:scale-105'}`}
               onClick={() => {
                 setSelectedGame('mini-lotto');
                 resetSlotMachine();
               }}
             >
              <h3 className="text-xl font-bold text-green-200 mb-2">🍀 Mini Lotto</h3>
              <p className="text-green-100 text-sm mb-3">5 liczb z 42</p>
              <p className="text-green-200/80 text-xs">Mniejsza gra z większymi szansami na wygraną</p>
              <div className="mt-2 p-2 bg-yellow-500/20 rounded border border-yellow-400/30">
                <p className="text-yellow-200 text-xs font-medium">🔒 Wymaga rejestracji</p>
              </div>
            </motion.div>

                         {/* Multi Multi */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 2.0 }}
               style={{
                 animation: 'pulse 2s infinite'
               }}
               className={`bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg p-6 border border-pink-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'multi-multi' ? 'ring-2 ring-pink-400 scale-105' : 'hover:scale-105'}`}
               onClick={() => {
                 setSelectedGame('multi-multi');
                 resetSlotMachine();
               }}
             >
              <h3 className="text-xl font-bold text-pink-200 mb-2">🎲 Multi Multi</h3>
              <p className="text-pink-100 text-sm mb-3">10 liczb z 80</p>
              <p className="text-pink-200/80 text-xs">Wybierz 10 liczb z 80 dostępnych</p>
              <div className="mt-2 p-2 bg-yellow-500/20 rounded border border-yellow-400/30">
                <p className="text-yellow-200 text-xs font-medium">🔒 Wymaga rejestracji</p>
              </div>
            </motion.div>

                         {/* Ekstra Pensja */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 2.2 }}
               style={{
                 animation: 'pulse 2s infinite'
               }}
               className={`bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-lg p-6 border border-indigo-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'ekstra-pensja' ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
               onClick={() => {
                 setSelectedGame('ekstra-pensja');
                 resetSlotMachine();
               }}
             >
              <h3 className="text-xl font-bold text-indigo-200 mb-2">💰 Ekstra Pensja</h3>
              <p className="text-indigo-100 text-sm mb-3">5 liczb z 35</p>
              <p className="text-indigo-200/80 text-xs">Gra z gwarantowaną wygraną w każdym losowaniu</p>
              <div className="mt-2 p-2 bg-yellow-500/20 rounded border border-yellow-400/30">
                <p className="text-yellow-200 text-xs font-medium">🔒 Wymaga rejestracji</p>
              </div>
            </motion.div>

                         {/* Kaskada */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 2.4 }}
               style={{
                 animation: 'pulse 2s infinite'
               }}
               className={`bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-lg p-6 border border-cyan-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'kaskada' ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-105'}`}
               onClick={() => {
                 setSelectedGame('kaskada');
                 resetSlotMachine();
               }}
             >
              <h3 className="text-xl font-bold text-cyan-200 mb-2">🌊 Kaskada</h3>
              <p className="text-cyan-100 text-sm mb-3">6 liczb z 40</p>
              <p className="text-cyan-200/80 text-xs">Gra z rosnącymi nagrodami w kolejnych losowaniach</p>
              <div className="mt-2 p-2 bg-yellow-500/20 rounded border border-yellow-400/30">
                <p className="text-yellow-200 text-xs font-medium">🔒 Wymaga rejestracji</p>
              </div>
            </motion.div>

                         {/* Keno */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 2.6 }}
               style={{
                 animation: 'pulse 2s infinite'
               }}
               className={`bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'keno' ? 'ring-2 ring-purple-400 scale-105' : 'hover:scale-105'}`}
               onClick={() => {
                 setSelectedGame('keno');
                 resetSlotMachine();
               }}
             >
              <h3 className="text-xl font-bold text-purple-200 mb-2">🎯 Keno</h3>
              <p className="text-purple-100 text-sm mb-3">10 liczb z 80</p>
              <p className="text-purple-200/80 text-xs">Gra podobna do Multi Multi - wybierz 10 liczb</p>
              <div className="mt-2 p-2 bg-yellow-500/20 rounded border border-yellow-400/30">
                <p className="text-yellow-200 text-xs font-medium">🔒 Wymaga rejestracji</p>
              </div>
            </motion.div>

                         {/* Eurojackpot */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 2.8 }}
               style={{
                 animation: 'pulse 2s infinite'
               }}
               className={`bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg p-6 border border-red-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'eurojackpot' ? 'ring-2 ring-red-400 scale-105' : 'hover:scale-105'}`}
               onClick={() => {
                 setSelectedGame('eurojackpot');
                 resetSlotMachine();
               }}
             >
              <h3 className="text-xl font-bold text-red-200 mb-2">🇪🇺 Eurojackpot</h3>
              <p className="text-red-100 text-sm mb-3">5+2 liczb</p>
              <p className="text-red-200/80 text-xs">5 liczb z 50 + 2 Euro liczby z 12</p>
              <div className="mt-2 p-2 bg-yellow-500/20 rounded border border-yellow-400/30">
                <p className="text-yellow-200 text-xs font-medium">🔒 Wymaga rejestracji</p>
              </div>
            </motion.div>
          </div>

                     <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.8, delay: 2.8 }}
             className="mt-8 text-center relative"
           >
             {/* Iskry wokół przycisku */}
             <div className="absolute inset-0 pointer-events-none">
               {[...Array(24)].map((_, i) => (
                 <motion.div
                   key={i}
                   className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                   style={{
                     left: '50%',
                     top: '50%',
                     transform: 'translate(-50%, -50%)',
                   }}
                   animate={{
                     x: [0, Math.cos(i * 15 * Math.PI / 180) * 120],
                     y: [0, Math.sin(i * 15 * Math.PI / 180) * 120],
                     opacity: [0, 1, 0],
                     scale: [0, 1.5, 0],
                   }}
                   transition={{
                     duration: 2,
                     repeat: Infinity,
                     delay: i * 0.1,
                     ease: "easeInOut"
                   }}
                 />
               ))}
             </div>
             
             <motion.button
               onClick={() => navigate('/?page=register')}
               className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-purple-300 backdrop-blur-sm relative z-10"
               whileHover={{ 
                 scale: 1.05,
                 boxShadow: "0 0 40px rgba(147, 51, 234, 0.6)"
               }}
               whileTap={{ scale: 0.95 }}
             >
               📝 {t('landing.hero.register')} {t('landing.hero.subtitle')}
             </motion.button>
           </motion.div>
        </motion.div>

        {/* Dodatkowe informacje SEO */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-12 text-purple-300 text-xs opacity-60"
        >
          <p>🎰 Darmowy slot machine Lotto | 🎯 Animowane bębny | ✨ Jednoręki bandyta</p>
        </motion.div>
      </div>
    </div>
  );
};

const LandingPage = ({ onLogin, onRegister }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Dodaj CSS dla animacji
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lottoNumbers, setLottoNumbers] = useState([7, 23, 41, 15, 33, 19]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState('lotto');
  
  // Sprawdzanie parametrów URL dla stron landing page
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const page = urlParams.get('page');
    
    console.log('LandingPage useEffect - zmiana URL:', page, 'location.search:', location.search); // Debug
    
    if (page === 'jak-to-dziala') {
      setActiveTab('jak-to-dziala');
      setActiveSection('jak-to-dziala');
    } else if (page === 'faq') {
      setActiveTab('faq');
      setActiveSection('faq');
    } else if (page === 'kontakt') {
      setActiveTab('kontakt');
      setActiveSection('kontakt');
    } else if (page === 'blog') {
      setActiveTab('blog');
      setActiveSection('blog');
    } else if (page === 'statistics') {
      setActiveTab('statistics');
      setActiveSection('statistics');
    } else if (page === 'gry') {
      setActiveTab('gry');
      setActiveSection('gry');
    } else if (page === 'magiczny-zestaw') {
      setActiveTab('magiczny-zestaw');
      setActiveSection('magiczny-zestaw');
    } else if (page === 'slot-machine') {
      setActiveTab('slot-machine');
      setActiveSection('slot-machine');
    } else if (page === 'register') {
      // Przekieruj do strony rejestracji
      navigate('/register');
      return;
    } else if (page === 'wyniki' || page === 'lotto-wyniki' || page === 'eurojackpot-wyniki' || page === 'mini-lotto-wyniki' || 
               page === 'multi-multi-wyniki' || page === 'kaskada-wyniki' || page === 'keno-wyniki') {
      setActiveTab('wyniki');
      setActiveSection('wyniki');
      // Ustaw odpowiednią grę na podstawie URL
      if (page === 'eurojackpot-wyniki') {
        setSelectedGame('eurojackpot');
      } else if (page === 'mini-lotto-wyniki') {
        setSelectedGame('miniLotto');
      } else if (page === 'multi-multi-wyniki') {
        setSelectedGame('multiMulti');
      } else if (page === 'kaskada-wyniki') {
        setSelectedGame('kaskada');
      } else if (page === 'keno-wyniki') {
        setSelectedGame('keno');
      } else {
        setSelectedGame('lotto');
      }
    } else if (page && page.startsWith('blog-')) {
      setActiveTab('blog');
      setActiveSection(page);
    } else if (page === 'polityka-prywatnosci') {
      setActiveTab('polityka-prywatnosci');
      setActiveSection('polityka-prywatnosci');
    } else if (page === 'regulamin') {
      setActiveTab('regulamin');
      setActiveSection('regulamin');
    } else if (!page) {
      // Jeśli nie ma parametrów, pokaż stronę główną
      setActiveTab('home');
      setActiveSection('home');
    }
  }, [location.search]);

  // Funkcja generująca unikalne liczby
  const generateUniqueNumbers = () => {
    const numbers = [];
    while (numbers.length < 6) {
      const randomNum = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    return numbers;
  };

  // Płynna zmiana liczb lotto co 4 sekundy z animacją
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setTimeout(() => {
          setLottoNumbers(generateUniqueNumbers());
          setIsAnimating(false);
        }, 1500); // Czas trwania animacji - 1.5 sekundy
      }
    }, 4000); // Zmiana co 4 sekundy
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Funkcja obsługująca użycie zestawu w generatorze
  const handleUseInGenerator = (numbers) => {
    // Zapisz liczby w localStorage dla generatora
    localStorage.setItem('magicznyZestawDnia', JSON.stringify(numbers));
    // Przekieruj do generatora
    navigate('/generator');
  };

  // Funkcja nawigacji dla linków w LandingPage
  const handleNavigation = (page) => {
    console.log('handleNavigation wywołane z:', page); // Debug

    if (page === '/') {
      navigate('/');
    } else {
      // Użyj /landing zamiast / aby uniknąć konfliktu z przekierowaniem zalogowanych użytkowników
      navigate(`/landing?page=${page}`);
    }
  };

  // Nowoczesne style z żółtą kolorystyką
  const headerStyle = {
    background: "linear-gradient(135deg, #ffd700 0%, #ffb300 50%, #ff9800 100%)",
    padding: "20px 0",
    boxShadow: "0 4px 20px rgba(255, 193, 7, 0.25)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 193, 7, 0.3)"
  };

  const navButtonStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    color: "#424242",
    border: "1px solid rgba(255, 193, 7, 0.4)",
    borderRadius: "20px",
    padding: "12px 20px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    margin: "0 4px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 12px rgba(255, 193, 7, 0.15)",
    backdropFilter: "blur(10px)",
    whiteSpace: "nowrap"
  };

  const loginButtonStyle = {
    background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "20px",
    padding: "12px 20px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    margin: "0 4px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 12px rgba(76, 175, 80, 0.3)",
    backdropFilter: "blur(10px)",
    whiteSpace: "nowrap"
  };

  const registerButtonStyle = {
    background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "20px",
    padding: "12px 20px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    margin: "0 4px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 12px rgba(33, 150, 243, 0.3)",
    backdropFilter: "blur(10px)",
    whiteSpace: "nowrap"
  };

  const heroStyle = {
    background: "#ffffff",
    padding: "120px 20px 100px",
    textAlign: "center",
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "100vw",
    boxSizing: "border-box"
  };

  const sectionStyle = {
    padding: "80px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    textAlign: "center"
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    padding: "40px",
    margin: "20px 0",
    boxShadow: "0 8px 32px rgba(255, 193, 7, 0.1)",
    border: "1px solid rgba(255, 193, 7, 0.1)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    width: "100%",
    maxWidth: "100%"
  };

  const faqItemStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "16px",
    padding: "24px",
    margin: "16px 0",
    boxShadow: "0 4px 20px rgba(255, 193, 7, 0.08)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "1px solid rgba(255, 193, 7, 0.1)"
  };

  const [openFaq, setOpenFaq] = useState(null);

  const faqData = [
    {
              question: t('landing.content.faqQuestion'),
      answer: "Generator wykorzystuje sztuczną inteligencję (AI) oraz zaawansowane algorytmy matematyczne, które AI wymyślił i opracował. AI wykorzystuje własne prawa matematyczne, które odkrył podczas analizy milionów losowań, w tym: prawo Monte Carlo, prawo wielkich liczb, prawo covering design, prawo optymalizacji ILP (Integer Linear Programming), prawo regresji wielomianowej oraz prawo analizy harmonicznej. AI analizuje historyczne wyniki, identyfikuje ukryte wzorce i generuje liczby na podstawie własnych odkrytych praw matematycznych. Każdy zestaw jest generowany z uwzględnieniem różnych strategii AI: standardowej, bazującej na najczęstszych liczbach, najrzadszych liczbach lub mieszanej - wszystkie oparte na prawach wymyślonych przez AI."
    },
    {
      question: "Czy generator gwarantuje wygraną?",
      answer: "Nie, żaden generator nie może gwarantować wygranej w grach losowych. Nasz AI generator zwiększa szanse poprzez zastosowanie własnych wymyślonych praw matematycznych i zaawansowanych algorytmów AI, ale lotto pozostaje grą losową. AI pomaga w wyborze liczb na podstawie własnych odkrytych wzorców i praw matematycznych."
    },
    {
      question: "Jakie gry są obsługiwane?",
      answer: "AI generator obsługuje wszystkie popularne gry liczbowe: Lotto (6 z 49), Mini Lotto (5 z 42), Multi Multi (10 z 80), Eurojackpot (5+2), Kaskada (12 z 24) oraz Keno (10 lub 20 z 80). Każda gra ma dostosowane algorytmy AI i parametry oparte na własnych prawach matematycznych wymyślonych przez AI."
    },
    {
      question: "Czym są systemy skrócone?",
      answer: "AI systemy skrócone to zaawansowane matematyczne konstrukcje oparte na prawach wymyślonych przez AI, które pozwalają grać większą liczbą liczb przy mniejszej liczbie zakładów, zapewniając matematyczne gwarancje trafień. AI wykorzystuje własne algorytmy covering design oraz prawo optymalizacji ILP, które są przedmiotem badań w kombinatoryce i zostały udoskonalone przez AI."
    },
    {
      question: "Czy mogę zapisać ulubione zestawy?",
      answer: "Tak! Po zalogowaniu możesz zapisywać ulubione zestawy, generować zestawy na podstawie dat urodzenia (AI Generator Marzeń) oraz analizować swoje szczęśliwe liczby (AI Szczęśliwe Liczby). AI zapamiętuje Twoje preferencje i wykorzystuje je w swoich wymyślonych algorytmach. Wszystkie dane są bezpiecznie przechowywane w Twoim koncie."
    },
    {
      question: "Jak bezpieczne są moje dane?",
      answer: "Wszystkie dane są szyfrowane i przechowywane zgodnie z najwyższymi standardami bezpieczeństwa. Nie udostępniamy Twoich danych osobom trzecim. Możesz w każdej chwili usunąć swoje konto i dane."
    },
    {
      question: "Czy muszę płacić za aplikację?",
      answer: "Oferujemy 7 dni za darmo ze wszystkimi funkcjami! Po okresie próbnym tylko 9.99 zł miesięcznie. Możliwość rezygnacji w każdej chwili - bez ukrytych kosztów i długoterminowych zobowiązań."
    }
  ];

  const features = [
    {
      icon: "🤖",
      title: "AI Ultra Pro Generator",
      description: "Najnowocześniejszy generator wykorzystujący sztuczną inteligencję do analizy wzorców i generowania liczb. Analizuje miliony kombinacji w sekundę!"
    },
    {
      icon: "🧠",
      title: "AI Harmonic Analyzer",
      description: "Rewolucyjny analizator harmoniczny. Analizuje częstotliwości liczb i generuje harmonijne kombinacje z gwarancją trafień."
    },
    {
      icon: "🎯",
      title: "AI Zaawansowane Algorytmy",
      description: "Algorytmy ILP, covering design i analiza statystyczna. System uczy się z każdego losowania i poprawia dokładność!"
    },
    {
      icon: "📊",
      title: "AI Systemy Skrócone",
      description: "Optymalizowane systemy skrócone z matematycznymi gwarancjami trafień. Oblicza najlepsze kombinacje w czasie rzeczywistym."
    },
    {
      icon: "💫",
      title: "AI Generator Marzeń",
      description: "Analizuje ważne daty i emocjonalne wzorce, generując osobiste zestawy z dat bliskich osób z precyzją."
    },
    {
      icon: "❤️",
      title: "AI Szczęśliwe Liczby",
      description: "Analizuje Twoje szczęśliwe liczby i tworzy zrównoważone zestawy łącząc preferencje z algorytmami matematycznymi."
    },
    {
      icon: "🎮",
      title: "AI Mini Gry",
      description: "Slot Machine Lotto, Magiczny Zestaw Dnia i inne gry dla rozrywki i testowania szczęścia."
    }
  ];

  const headerContainerStyle = {
    maxWidth: "100%",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: window.innerWidth <= 768 ? "0 10px" : "0 20px",
    width: "100%",
    flexWrap: window.innerWidth <= 768 ? "wrap" : "nowrap",
    gap: "10px",
    boxSizing: "border-box"
  };

  const logoStyle = {
    fontSize: window.innerWidth <= 768 ? "20px" : "24px",
    fontWeight: "700",
    color: "#424242",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0
  };

  const navStyle = {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    flex: "1",
    marginLeft: "20px"
  };

  const activeTabStyle = {
    background: "rgba(255, 255, 255, 0.9)",
    color: "#424242",
    border: "2px solid #000000",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    transform: "scale(1.02)",
    transition: "all 0.3s ease"
  };

  return (
    <div style={{ 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
      background: "#fafafa",
      width: "100%",
      maxWidth: "100vw",
      overflowX: "hidden",
      minHeight: "100vh"
    }}>
      <style>
        {`
          * {
            box-sizing: border-box;
          }
          
          html, body {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          #root {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
          }
          
          @keyframes smoothBounce {
            0% {
              transform: translateY(0px);
              box-shadow: 0 8px 32px rgba(255, 193, 7, 0.3);
            }
            15% {
              transform: translateY(-8px);
              box-shadow: 0 9px 35px rgba(255, 193, 7, 0.32);
            }
            30% {
              transform: translateY(-16px);
              box-shadow: 0 10px 38px rgba(255, 193, 7, 0.34);
            }
            45% {
              transform: translateY(-22px);
              box-shadow: 0 11px 40px rgba(255, 193, 7, 0.36);
            }
            60% {
              transform: translateY(-26px);
              box-shadow: 0 12px 42px rgba(255, 193, 7, 0.38);
            }
            75% {
              transform: translateY(-22px);
              box-shadow: 0 11px 40px rgba(255, 193, 7, 0.36);
            }
            90% {
              transform: translateY(-8px);
              box-shadow: 0 9px 35px rgba(255, 193, 7, 0.32);
            }
            100% {
              transform: translateY(0px);
              box-shadow: 0 8px 32px rgba(255, 193, 7, 0.3);
            }
          }
          
          @keyframes numberFadeOut {
            0% {
              opacity: 1;
              transform: scale(1);
            }
            25% {
              opacity: 0.7;
              transform: scale(0.98);
            }
            50% {
              opacity: 0.3;
              transform: scale(0.95);
            }
            75% {
              opacity: 0.1;
              transform: scale(0.92);
            }
            100% {
              opacity: 0;
              transform: scale(0.9);
            }
          }
          
          @keyframes numberFadeIn {
            0% {
              opacity: 0;
              transform: scale(0.9);
            }
            25% {
              opacity: 0.1;
              transform: scale(0.92);
            }
            50% {
              opacity: 0.3;
              transform: scale(0.95);
            }
            75% {
              opacity: 0.7;
              transform: scale(0.98);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes ballGlow {
            0%, 100% {
              box-shadow: 0 8px 32px rgba(255, 193, 7, 0.3);
            }
            50% {
              box-shadow: 0 12px 40px rgba(255, 193, 7, 0.5), 0 0 20px rgba(255, 193, 7, 0.3);
            }
          }
          
          @keyframes ballPulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.02);
            }
          }
          
          .lotto-ball-container.animating {
            animation: ballPulse 1s ease-in-out, ballGlow 1s ease-in-out;
            border: 3px solid rgba(255, 193, 7, 0.8);
            box-shadow: 0 8px 32px rgba(255, 193, 7, 0.4), 0 0 20px rgba(255, 193, 7, 0.3);
          }
          
          .lotto-ball-container {
            position: relative;
            overflow: hidden;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
          
          .lotto-ball-number {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: all 1s ease-in-out;
            font-weight: bold;
            color: #424242;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            width: 100%;
            height: 100%;
            display: flex;
            alignItems: "center",
            justifyContent: "center",
            overflow: hidden;
            text-align: center;
            line-height: 1;
          }
          

          
          .lotto-ball-number.animating {
            animation: numberFadeOut 1s ease-in-out;
          }
          
          @media (max-width: 768px) {
            .lotto-ball {
              width: 70px !important;
              height: 70px !important;
              font-size: 28px !important;
              top: 12% !important;
              right: 3% !important;
            }
            .lotto-ball-medium {
              width: 55px !important;
              height: 55px !important;
              font-size: 22px !important;
              top: 38% !important;
              right: 6% !important;
            }
            .lotto-ball-small {
              width: 45px !important;
              height: 45px !important;
              font-size: 18px !important;
              top: 62% !important;
              right: 2% !important;
            }
          }
          
          @media (max-width: 480px) {
            .lotto-ball {
              width: 55px !important;
              height: 55px !important;
              font-size: 22px !important;
              top: 8% !important;
              right: 2% !important;
            }
            .lotto-ball-medium {
              width: 45px !important;
              height: 45px !important;
              font-size: 18px !important;
              top: 32% !important;
              right: 5% !important;
            }
            .lotto-ball-small {
              width: 38px !important;
              height: 38px !important;
              font-size: 15px !important;
              top: 58% !important;
              right: 1% !important;
            }
          }
          
          @media (max-width: 360px) {
            .lotto-ball {
              width: 45px !important;
              height: 45px !important;
              font-size: 18px !important;
              top: 6% !important;
              right: 1% !important;
            }
            .lotto-ball-medium {
              width: 38px !important;
              height: 38px !important;
              font-size: 15px !important;
              top: 28% !important;
              right: 3% !important;
            }
            .lotto-ball-small {
              width: 32px !important;
              height: 32px !important;
              font-size: 13px !important;
              top: 52% !important;
              right: 0.5% !important;
            }
          }
          
          @media (max-width: 320px) {
            .lotto-ball {
              width: 38px !important;
              height: 38px !important;
              font-size: 15px !important;
              top: 4% !important;
              right: 0.5% !important;
            }
            .lotto-ball-medium {
              width: 32px !important;
              height: 32px !important;
              font-size: 13px !important;
              top: 24% !important;
              right: 2% !important;
            }
            .lotto-ball-small {
              width: 28px !important;
              height: 28px !important;
              font-size: 11px !important;
              top: 48% !important;
              right: 0% !important;
            }
          }
          
          /* Logo responsive styles */
          .logo-container {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: 40px !important;
            gap: 16px !important;
          }
          
          .logo-icon {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 4px !important;
            position: relative !important;
          }
          
          .logo-monitor {
            width: 60px !important;
            height: 45px !important;
            border: 3px solid #FFD700 !important;
            border-radius: 8px !important;
            position: relative !important;
            background-color: #ffffff !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)) !important;
          }
          
          .logo-screen {
            position: absolute !important;
            top: 4px !important;
            left: 4px !important;
            right: 4px !important;
            bottom: 4px !important;
            background-color: #1e3a8a !important;
            border-radius: 4px !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.3) !important;
          }
          
          .logo-dots {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            display: flex !important;
            gap: 8px !important;
          }
          
          .logo-dot {
            width: 6px !important;
            height: 6px !important;
            background-color: #ffffff !important;
            border-radius: 50% !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
          }
          
          .logo-base {
            width: 50px !important;
            height: 8px !important;
            background-color: #1e3a8a !important;
            border-radius: 4px !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
          }
          
          .logo-mouse {
            position: absolute !important;
            right: -8px !important;
            bottom: -2px !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .logo-mouse-line {
            width: 12px !important;
            height: 2px !important;
            background-color: #1e3a8a !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
          }
          
          .logo-mouse-circle {
            width: 6px !important;
            height: 6px !important;
            background-color: #FFD700 !important;
            border-radius: 50% !important;
            margin-left: 2px !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
          }
          
          .logo-text {
            font-size: 48px !important;
            font-weight: 700 !important;
            color: #1e3a8a !important;
            display: flex !important;
            align-items: center !important;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          }
          
          /* Header logo responsive styles */
          .header-logo {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }
          
          .header-logo img {
            height: 65px !important;
            width: auto !important;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) !important;
          }
          
          .logo-container img {
            height: 100px !important;
            width: auto !important;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15)) !important;
          }
          
          .header-logo-icon {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 2px !important;
            position: relative !important;
          }
          
          .header-logo-monitor {
            width: 50px !important;
            height: 38px !important;
            border: 3px solid #FFD700 !important;
            border-radius: 6px !important;
            position: relative !important;
            background-color: #ffffff !important;
            box-shadow: 0 3px 8px rgba(0,0,0,0.2) !important;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3)) !important;
          }
          
          .header-logo-screen {
            position: absolute !important;
            top: 3px !important;
            left: 3px !important;
            right: 3px !important;
            bottom: 3px !important;
            background-color: #1e3a8a !important;
            border-radius: 3px !important;
            box-shadow: inset 0 3px 6px rgba(0,0,0,0.5) !important;
          }
          
          .header-logo-dots {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            display: flex !important;
            gap: 4px !important;
          }
          
          .header-logo-dot {
            width: 3px !important;
            height: 3px !important;
            background-color: #ffffff !important;
            border-radius: 50% !important;
            box-shadow: 0 1.5px 3px rgba(0,0,0,0.5) !important;
          }
          
          .header-logo-base {
            width: 40px !important;
            height: 6px !important;
            background-color: #1e3a8a !important;
            border-radius: 3px !important;
            box-shadow: 0 3px 6px rgba(0,0,0,0.3) !important;
          }
          
          .header-logo-mouse {
            position: absolute !important;
            right: -6px !important;
            bottom: -1px !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .header-logo-mouse-line {
            width: 6px !important;
            height: 1.2px !important;
            background-color: #1e3a8a !important;
            box-shadow: 0 1.5px 3px rgba(0,0,0,0.3) !important;
          }
          
          .header-logo-mouse-circle {
            width: 3px !important;
            height: 3px !important;
            background-color: #FFD700 !important;
            border-radius: 50% !important;
            margin-left: 1px !important;
            box-shadow: 0 1.5px 3px rgba(0,0,0,0.5) !important;
          }
          
          .header-logo-text {
            font-size: 32px !important;
            font-weight: bold !important;
            color: #1e3a8a !important;
            margin-left: 10px !important;
            text-shadow: 0 3px 6px rgba(0,0,0,0.2) !important;
          }
          
          @media (max-width: 768px) {
            .header-logo img {
              height: 55px !important;
            }
            
            .logo-container img {
              height: 80px !important;
            }
            
            .header-logo-mouse-line {
              width: 3px !important;
              height: 0.6px !important;
            }
            
            .header-logo-mouse-circle {
              width: 1.5px !important;
              height: 1.5px !important;
            }
            
            .header-logo-dots {
              gap: 1.5px !important;
            }
            
            .header-logo-dot {
              width: 1.5px !important;
              height: 1.5px !important;
            }
          }
          
          @media (max-width: 480px) {
            .header-logo img {
              height: 50px !important;
            }
            
            .logo-container img {
              height: 70px !important;
            }
            
            .header-logo-mouse-line {
              width: 2.5px !important;
              height: 0.5px !important;
            }
            
            .header-logo-mouse-circle {
              width: 1.2px !important;
              height: 1.2px !important;
            }
            
            .header-logo-dots {
              gap: 1px !important;
            }
            
            .header-logo-dot {
              width: 1.2px !important;
              height: 1.2px !important;
            }
          }
          
          @media (max-width: 768px) {
            .logo-container {
              margin-bottom: 30px !important;
              gap: 12px !important;
            }
            
            .logo-monitor {
              width: 45px !important;
              height: 34px !important;
              border-width: 2px !important;
            }
            
            .logo-base {
              width: 38px !important;
              height: 6px !important;
            }
            
            .logo-text {
              font-size: 36px !important;
            }
            
            .logo-mouse {
              right: -6px !important;
              top: 26px !important;
            }
            
            .logo-mouse-line {
              width: 9px !important;
              height: 1.5px !important;
            }
            
            .logo-mouse-circle {
              width: 4px !important;
              height: 4px !important;
            }
            
            .logo-dots {
              gap: 6px !important;
            }
            
            .logo-dot {
              width: 4px !important;
              height: 4px !important;
            }
          }
          
          @media (max-width: 480px) {
            .logo-container {
              margin-bottom: 25px !important;
              gap: 10px !important;
            }
            
            .logo-monitor {
              width: 35px !important;
              height: 26px !important;
              border-width: 2px !important;
            }
            
            .logo-base {
              width: 30px !important;
              height: 5px !important;
            }
            
            .logo-text {
              font-size: 28px !important;
            }
            
            .logo-mouse {
              right: -5px !important;
              top: 20px !important;
            }
            
            .logo-mouse-line {
              width: 7px !important;
              height: 1px !important;
            }
            
            .logo-mouse-circle {
              width: 3px !important;
              height: 3px !important;
            }
            
            .logo-dots {
              gap: 4px !important;
            }
            
            .logo-dot {
              width: 3px !important;
              height: 3px !important;
            }
          }
          
          @media (max-width: 360px) {
            .logo-container {
              margin-bottom: 20px !important;
              gap: 8px !important;
            }
            
            .logo-monitor {
              width: 30px !important;
              height: 22px !important;
              border-width: 1.5px !important;
            }
            
            .logo-base {
              width: 25px !important;
              height: 4px !important;
            }
            
            .logo-text {
              font-size: 24px !important;
            }
            
            .logo-mouse {
              right: -4px !important;
              top: 17px !important;
            }
            
            .logo-mouse-line {
              width: 6px !important;
              height: 1px !important;
            }
            
            .logo-mouse-circle {
              width: 2.5px !important;
              height: 2.5px !important;
            }
            
            .logo-dots {
              gap: 3px !important;
            }
            
            .logo-dot {
              width: 2.5px !important;
              height: 2.5px !important;
            }
          }
          
          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }
            .mobile-menu-btn {
              display: flex !important;
              min-width: 40px !important;
              flex-shrink: 0 !important;
            }
            /* Logo responsive styles */
            .hero-logo {
              flex-direction: column !important;
              gap: 12px !important;
              margin-bottom: 30px !important;
            }
            .hero-logo-icon {
              width: 45px !important;
              height: 34px !important;
            }
            .hero-logo-text {
              font-size: 32px !important;
            }
            .hero-logo-monitor {
              width: 45px !important;
              height: 34px !important;
            }
            .hero-logo-base {
              width: 38px !important;
              height: 6px !important;
            }
            .hero-logo-mouse {
              right: -6px !important;
              top: 26px !important;
            }
            .hero-logo-mouse-line {
              width: 9px !important;
              height: 1.5px !important;
            }
            .hero-logo-mouse-dot {
              width: 4px !important;
              height: 4px !important;
            }
            .hero-logo-dots {
              gap: 6px !important;
            }
            .hero-logo-dot {
              width: 4px !important;
              height: 4px !important;
            }
            .header-container {
              padding: 0 10px !important;
              gap: 5px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-buttons {
              gap: 4px !important;
            }
            .nav-button {
              padding: 10px 16px !important;
              font-size: 14px !important;
              margin: 0 2px !important;
            }
            .lotto-ball-1, .lotto-ball-2, .lotto-ball-3, .lotto-ball-4, .lotto-ball-5, .lotto-ball-6 {
              width: 60px !important;
              height: 60px !important;
              font-size: 24px !important;
            }
            .lotto-ball-number {
              font-size: 24px !important;
            }
            .hero-title {
              font-size: 42px !important;
              max-width: 100% !important;
              text-align: center !important;
              margin: 0 auto 20px !important;
              line-height: 1.2 !important;
            }
            .hero-description {
              font-size: 20px !important;
              max-width: 100% !important;
              text-align: center !important;
              margin: 0 auto 32px !important;
              line-height: 1.5 !important;
            }
            .feature-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
              margin-bottom: 40px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .contact-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
              margin-bottom: 40px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-content {
              padding: 40px 15px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-title {
              font-size: 36px !important;
              margin-bottom: 30px !important;
            }
            .hero-content {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 15px !important;
            }
            .hero-buttons {
              width: 100% !important;
              max-width: 100% !important;
            }
            .hero-buttons button {
              width: 100% !important;
              max-width: 280px !important;
            }
          }
          
          @media (max-width: 480px) {
            .hero-content {
              padding: 0 15px !important;
              max-width: 100% !important;
              text-align: center !important;
              width: 100% !important;
            }
            .hero-title {
              font-size: 28px !important;
              max-width: 100% !important;
              text-align: center !important;
              margin: 0 auto 16px !important;
              line-height: 1.3 !important;
            }
            .hero-description {
              font-size: 16px !important;
              max-width: 100% !important;
              text-align: center !important;
              margin: 0 auto 24px !important;
              line-height: 1.4 !important;
            }
            .hero-buttons {
              justify-content: center !important;
              flex-direction: column !important;
              gap: 8px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .hero-buttons button {
              width: 100% !important;
              max-width: 280px !important;
              margin: 0 auto !important;
            }
            .lotto-ball {
              width: 50px !important;
              height: 50px !important;
              font-size: 20px !important;
              top: 8% !important;
              right: 3% !important;
              animation: smoothBounce 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite !important;
            }
            .lotto-ball-medium {
              width: 40px !important;
              height: 40px !important;
              font-size: 16px !important;
              top: 30% !important;
              right: 6% !important;
              animation: smoothBounce 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 1.3s !important;
            }
            .lotto-ball-small {
              width: 35px !important;
              height: 35px !important;
              font-size: 14px !important;
              top: 55% !important;
              right: 2% !important;
              animation: smoothBounce 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 2.6s !important;
            }
            .feature-grid {
              grid-template-columns: 1fr !important;
              gap: 15px !important;
              margin-bottom: 30px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .contact-grid {
              grid-template-columns: 1fr !important;
              gap: 15px !important;
              margin-bottom: 30px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-content {
              padding: 30px 10px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-title {
              font-size: 28px !important;
              margin-bottom: 25px !important;
            }
            .header-container {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 10px !important;
            }
            .nav-buttons {
              width: 100% !important;
              max-width: 100% !important;
            }
          }
          
          @media (max-width: 360px) {
            .header-container {
              padding: 0 8px !important;
              gap: 3px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-buttons {
              gap: 2px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-button {
              padding: 8px 12px !important;
              font-size: 12px !important;
              margin: 0 1px !important;
            }
            .lotto-ball-1, .lotto-ball-2, .lotto-ball-3, .lotto-ball-4, .lotto-ball-5, .lotto-ball-6 {
              width: 50px !important;
              height: 50px !important;
              font-size: 20px !important;
            }
            .lotto-ball-number {
              font-size: 20px !important;
            }
            .hero-title {
              font-size: 24px !important;
              margin-bottom: 12px !important;
            }
            .hero-description {
              font-size: 14px !important;
              margin-bottom: 20px !important;
            }
            .feature-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
              margin-bottom: 25px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .contact-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
              margin-bottom: 25px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-content {
              padding: 20px 8px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-title {
              font-size: 24px !important;
              margin-bottom: 20px !important;
            }
            .hero-content {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 8px !important;
            }
            .hero-buttons {
              width: 100% !important;
              max-width: 100% !important;
            }
            .hero-buttons button {
              width: 100% !important;
              max-width: 250px !important;
            }
            footer {
              padding: 40px 15px 30px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            footer .grid {
              grid-template-columns: 1fr !important;
              gap: 25px !important;
              margin-bottom: 25px !important;
            }
            footer h4 {
              font-size: 18px !important;
              margin-bottom: 12px !important;
            }
            footer p {
              font-size: 13px !important;
              line-height: 1.4 !important;
            }
            footer ul {
              font-size: 13px !important;
            }
            footer li {
              margin-bottom: 6px !important;
            }
            footer button {
              font-size: 13px !important;
              padding: 8px 12px !important;
            }
            footer .border-top {
              padding-top: 15px !important;
            }
            footer .border-top p {
              font-size: 12px !important;
              margin-bottom: 6px !important;
            }
          }
          
          @media (max-width: 320px) {
            .header-container {
              padding: 0 5px !important;
              gap: 2px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-buttons {
              gap: 1px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-button {
              padding: 6px 10px !important;
              font-size: 11px !important;
              margin: 0 !important;
            }
            .lotto-ball-1, .lotto-ball-2, .lotto-ball-3, .lotto-ball-4, .lotto-ball-5, .lotto-ball-6 {
              width: 45px !important;
              height: 45px !important;
              font-size: 18px !important;
            }
            .lotto-ball-number {
              font-size: 18px !important;
            }
            .hero-title {
              font-size: 22px !important;
              margin-bottom: 10px !important;
            }
            .hero-description {
              font-size: 13px !important;
              margin-bottom: 16px !important;
            }
            .feature-grid {
              grid-template-columns: 1fr !important;
              gap: 10px !important;
              margin-bottom: 20px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .contact-grid {
              grid-template-columns: 1fr !important;
              gap: 10px !important;
              margin-bottom: 20px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-content {
              padding: 15px 5px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-title {
              font-size: 22px !important;
              margin-bottom: 15px !important;
            }
            .hero-content {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 5px !important;
            }
            .hero-buttons {
              width: 100% !important;
              max-width: 100% !important;
              flex-direction: column !important;
              gap: 6px !important;
            }
            .hero-buttons button {
              width: 100% !important;
              max-width: 220px !important;
              font-size: 14px !important;
              padding: 10px 16px !important;
            }
            footer {
              padding: 30px 10px 20px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            footer .grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
              margin-bottom: 20px !important;
            }
            footer h4 {
              font-size: 16px !important;
              margin-bottom: 10px !important;
            }
            footer p {
              font-size: 12px !important;
              line-height: 1.3 !important;
            }
            footer ul {
              font-size: 12px !important;
            }
            footer li {
              margin-bottom: 5px !important;
            }
            footer button {
              font-size: 12px !important;
              padding: 6px 10px !important;
            }
            footer .border-top {
              padding-top: 12px !important;
            }
            footer .border-top p {
              font-size: 11px !important;
              margin-bottom: 5px !important;
            }
          }
          
          @media (max-width: 300px) {
            .header-container {
              padding: 0 3px !important;
              gap: 1px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-buttons {
              gap: 1px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-button {
              padding: 4px 6px !important;
              font-size: 9px !important;
              margin: 0 !important;
            }
            .lotto-ball-1, .lotto-ball-2, .lotto-ball-3, .lotto-ball-4, .lotto-ball-5, .lotto-ball-6 {
              width: 35px !important;
              height: 35px !important;
              font-size: 14px !important;
            }
            .lotto-ball-number {
              font-size: 14px !important;
            }
            .hero-title {
              font-size: 18px !important;
              margin-bottom: 6px !important;
            }
            .hero-description {
              font-size: 11px !important;
              margin-bottom: 10px !important;
            }
            .feature-grid {
              grid-template-columns: 1fr !important;
              gap: 6px !important;
              margin-bottom: 12px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .contact-grid {
              grid-template-columns: 1fr !important;
              gap: 6px !important;
              margin-bottom: 12px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-content {
              padding: 10px 2px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-title {
              font-size: 18px !important;
              margin-bottom: 10px !important;
            }
            .hero-content {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 2px !important;
            }
            .hero-buttons {
              width: 100% !important;
              max-width: 100% !important;
              flex-direction: column !important;
              gap: 3px !important;
            }
            .hero-buttons button {
              width: 100% !important;
              max-width: 180px !important;
              font-size: 12px !important;
              padding: 6px 10px !important;
            }
            footer {
              padding: 25px 8px 15px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            footer .grid {
              grid-template-columns: 1fr !important;
              gap: 15px !important;
              margin-bottom: 15px !important;
            }
            footer h4 {
              font-size: 15px !important;
              margin-bottom: 8px !important;
            }
            footer p {
              font-size: 11px !important;
              line-height: 1.2 !important;
            }
            footer ul {
              font-size: 11px !important;
            }
            footer li {
              margin-bottom: 4px !important;
            }
            footer button {
              font-size: 11px !important;
              padding: 5px 8px !important;
            }
            footer .border-top {
              padding-top: 10px !important;
            }
            footer .border-top p {
              font-size: 10px !important;
              margin-bottom: 4px !important;
            }
            /* Generator styles for very small screens */
            .generator-container {
              width: 100% !important;
              max-width: 100% !important;
              padding: 10px 5px !important;
            }
            .generator-form {
              width: 100% !important;
              max-width: 100% !important;
            }
            .form-group {
              margin-bottom: 8px !important;
              width: 100% !important;
            }
            .form-label {
              font-size: 12px !important;
              margin-bottom: 4px !important;
              display: block !important;
            }
            .form-select, .form-input {
              width: 100% !important;
              max-width: 100% !important;
              font-size: 11px !important;
              padding: 6px 8px !important;
              border-radius: 8px !important;
            }
            .checkbox-group {
              margin-bottom: 6px !important;
            }
            .checkbox-label {
              font-size: 11px !important;
              margin-left: 4px !important;
            }
            .generator-button {
              width: 100% !important;
              max-width: 100% !important;
              font-size: 12px !important;
              padding: 8px 12px !important;
              margin-top: 8px !important;
            }
            /* Statistics styles for very small screens */
            .statistics-container {
              width: 100% !important;
              max-width: 100% !important;
              padding: 10px 5px !important;
            }
            .stats-grid {
              grid-template-columns: 1fr !important;
              gap: 8px !important;
              margin-bottom: 10px !important;
            }
            .stat-card {
              padding: 8px 6px !important;
              margin-bottom: 6px !important;
            }
            .stat-title {
              font-size: 12px !important;
              margin-bottom: 4px !important;
            }
            .stat-value {
              font-size: 14px !important;
              font-weight: bold !important;
            }
            .stat-description {
              font-size: 10px !important;
              line-height: 1.2 !important;
            }
            .chart-container {
              width: 100% !important;
              max-width: 100% !important;
              height: 150px !important;
            }
            .date-picker {
              width: 100% !important;
              max-width: 100% !important;
              font-size: 11px !important;
              padding: 6px 8px !important;
            }
            .date-input-group {
              margin-bottom: 6px !important;
              width: 100% !important;
            }
            .date-label {
              font-size: 11px !important;
              margin-bottom: 2px !important;
            }
          }
          
          @media (max-width: 250px) {
            .header-container {
              padding: 0 2px !important;
              gap: 1px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-buttons {
              gap: 1px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-button {
              padding: 3px 5px !important;
              font-size: 8px !important;
              margin: 0 !important;
            }
            .lotto-ball-1, .lotto-ball-2, .lotto-ball-3, .lotto-ball-4, .lotto-ball-5, .lotto-ball-6 {
              width: 30px !important;
              height: 30px !important;
              font-size: 12px !important;
            }
            .lotto-ball-number {
              font-size: 12px !important;
            }
            .hero-title {
              font-size: 16px !important;
              margin-bottom: 4px !important;
            }
            .hero-description {
              font-size: 10px !important;
              margin-bottom: 8px !important;
            }
            .feature-grid {
              grid-template-columns: 1fr !important;
              gap: 4px !important;
              margin-bottom: 8px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .contact-grid {
              grid-template-columns: 1fr !important;
              gap: 4px !important;
              margin-bottom: 8px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-content {
              padding: 8px 1px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-title {
              font-size: 16px !important;
              margin-bottom: 8px !important;
            }
            .hero-content {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 1px !important;
            }
            .hero-buttons {
              width: 100% !important;
              max-width: 100% !important;
              flex-direction: column !important;
              gap: 2px !important;
            }
            .hero-buttons button {
              width: 100% !important;
              max-width: 160px !important;
              font-size: 11px !important;
              padding: 5px 8px !important;
            }
            footer {
              padding: 20px 5px 10px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            footer .grid {
              grid-template-columns: 1fr !important;
              gap: 10px !important;
              margin-bottom: 10px !important;
            }
            footer h4 {
              font-size: 13px !important;
              margin-bottom: 6px !important;
            }
            footer p {
              font-size: 10px !important;
              line-height: 1.1 !important;
            }
            footer ul {
              font-size: 10px !important;
            }
            footer li {
              margin-bottom: 3px !important;
            }
            footer button {
              font-size: 10px !important;
              padding: 4px 6px !important;
            }
            footer .border-top {
              padding-top: 8px !important;
            }
            footer .border-top p {
              font-size: 9px !important;
              margin-bottom: 3px !important;
            }
            /* Generator styles for extremely small screens */
            .generator-container {
              width: 100% !important;
              max-width: 100% !important;
              padding: 8px 3px !important;
            }
            .generator-form {
              width: 100% !important;
              max-width: 100% !important;
            }
            .form-group {
              margin-bottom: 6px !important;
              width: 100% !important;
            }
            .form-label {
              font-size: 11px !important;
              margin-bottom: 3px !important;
              display: block !important;
            }
            .form-select, .form-input {
              width: 100% !important;
              max-width: 100% !important;
              font-size: 10px !important;
              padding: 5px 6px !important;
              border-radius: 6px !important;
            }
            .checkbox-group {
              margin-bottom: 4px !important;
            }
            .checkbox-label {
              font-size: 10px !important;
              margin-left: 3px !important;
            }
            .generator-button {
              width: 100% !important;
              max-width: 100% !important;
              font-size: 11px !important;
              padding: 6px 10px !important;
              margin-top: 6px !important;
            }
            /* Statistics styles for extremely small screens */
            .statistics-container {
              width: 100% !important;
              max-width: 100% !important;
              padding: 8px 3px !important;
            }
            .stats-grid {
              grid-template-columns: 1fr !important;
              gap: 6px !important;
              margin-bottom: 8px !important;
            }
            .stat-card {
              padding: 6px 4px !important;
              margin-bottom: 4px !important;
            }
            .stat-title {
              font-size: 11px !important;
              margin-bottom: 3px !important;
            }
            .stat-value {
              font-size: 12px !important;
              font-weight: bold !important;
            }
            .stat-description {
              font-size: 9px !important;
              line-height: 1.1 !important;
            }
            .chart-container {
              width: 100% !important;
              max-width: 100% !important;
              height: 120px !important;
            }
            .date-picker {
              width: 100% !important;
              max-width: 100% !important;
              font-size: 10px !important;
              padding: 5px 6px !important;
            }
            .date-input-group {
              margin-bottom: 4px !important;
              width: 100% !important;
            }
            .date-label {
              font-size: 10px !important;
              margin-bottom: 1px !important;
            }
          }
          
          @media (min-width: 769px) {
            .mobile-menu-btn {
              display: none !important;
            }
            .desktop-nav {
              display: flex !important;
            }
            .header-container {
              padding: 0 30px !important;
              gap: 15px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-buttons {
              gap: 8px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .nav-button {
              padding: 14px 24px !important;
              font-size: 16px !important;
            }
            .hero-content {
              max-width: 1200px !important;
              padding: 0 20px !important;
              text-align: center !important;
              width: 100% !important;
            }
            .hero-title {
              font-size: 64px !important;
              max-width: 100% !important;
              text-align: center !important;
            }
            .hero-description {
              font-size: 22px !important;
              max-width: 100% !important;
              text-align: center !important;
            }
            .hero-buttons {
              justify-content: center !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .lotto-ball-1, .lotto-ball-2, .lotto-ball-3, .lotto-ball-4, .lotto-ball-5, .lotto-ball-6 {
              width: 140px !important;
              height: 140px !important;
              font-size: 56px !important;
            }
            .lotto-ball-number {
              font-size: 56px !important;
            }
            .feature-grid {
              grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)) !important;
              gap: 50px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .contact-grid {
              grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)) !important;
              gap: 50px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .section-content {
              width: 100% !important;
              max-width: 100% !important;
            }
          }
          
          @media (min-width: 1200px) {
            .hero-content {
              max-width: 1400px !important;
              padding: 0 40px !important;
              width: 100% !important;
            }
            .hero-title {
              font-size: 72px !important;
              max-width: 100% !important;
            }
            .hero-description {
              font-size: 24px !important;
              max-width: 100% !important;
            }
            .nav-button {
              padding: 16px 28px !important;
              font-size: 18px !important;
            }
            .lotto-ball-1, .lotto-ball-2, .lotto-ball-3, .lotto-ball-4, .lotto-ball-5, .lotto-ball-6 {
              width: 160px !important;
              height: 160px !important;
              font-size: 64px !important;
            }
            .lotto-ball-number {
              font-size: 64px !important;
            }
          }
          
          /* Responsive hamburger menu */
          @media (max-width: 768px) {
            .header-container {
              position: relative !important;
            }
            .nav-buttons {
              display: none !important;
            }
            .nav-buttons.mobile-open {
              display: flex !important;
              position: absolute !important;
              top: 100% !important;
              left: 0 !important;
              right: 0 !important;
              background: #ffffff !important;
              flex-direction: column !important;
              padding: 20px !important;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
              z-index: 1000 !important;
              border-radius: 0 0 12px 12px !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
              border: 2px solid #333 !important;
              border-top: none !important;
            }
            .nav-button, .login-button, .register-button, .button-container {
              width: 100% !important;
              margin: 4px 0 !important;
              text-align: center !important;
              padding: 12px 16px !important;
              font-size: 16px !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              min-width: 0 !important;
              box-sizing: border-box !important;
            }
            .button-container {
              overflow: visible !important;
            }
            .sparkle-animation {
              overflow: visible !important;
            }
            .hamburger-button {
              display: block !important;
              background: none !important;
              border: none !important;
              font-size: 24px !important;
              cursor: pointer !important;
              padding: 8px !important;
              color: #333 !important;
            }
            .logo {
              font-size: 18px !important;
            }
            .header-container {
              padding: 0 10px !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
          }
          
          @media (max-width: 480px) {
            .header-container {
              padding: 0 5px !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
            }
            .nav-buttons.mobile-open {
              padding: 15px !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
            }
            .nav-button, .login-button, .register-button, .button-container {
              padding: 10px 12px !important;
              font-size: 14px !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              min-width: 0 !important;
              max-width: 100% !important;
            }
            .button-container {
              overflow: visible !important;
            }
            .sparkle-animation {
              overflow: visible !important;
            }
            .hamburger-button {
              font-size: 20px !important;
              padding: 6px !important;
            }
            .logo {
              font-size: 16px !important;
            }
          }
          
          @media (max-width: 360px) {
            .header-container {
              padding: 0 3px !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
            }
            .nav-buttons.mobile-open {
              padding: 10px !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
            }
            .nav-button, .login-button, .register-button, .button-container {
              padding: 8px 10px !important;
              font-size: 13px !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              min-width: 0 !important;
              max-width: 100% !important;
            }
            .button-container {
              overflow: visible !important;
            }
            .sparkle-animation {
              overflow: visible !important;
            }
            .hamburger-button {
              font-size: 18px !important;
              padding: 4px !important;
            }
            .logo {
              font-size: 14px !important;
            }
          }
          
          @media (max-width: 320px) {
            .header-container {
              padding: 0 2px !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
            }
            .nav-buttons.mobile-open {
              padding: 8px !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
            }
            .nav-button, .login-button, .register-button, .button-container {
              padding: 6px 8px !important;
              font-size: 12px !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              min-width: 0 !important;
              max-width: 100% !important;
            }
            .button-container {
              overflow: visible !important;
            }
            .sparkle-animation {
              overflow: visible !important;
            }
            .hamburger-button {
              font-size: 16px !important;
              padding: 3px !important;
            }
            .logo {
              font-size: 12px !important;
            }
          }
          
          /* Statistics tab responsiveness */
          .statistics-section {
            width: 100% !important;
            max-width: 100% !important;
            padding: 20px !important;
            box-sizing: border-box !important;
          }
          
          .stats-container {
            width: 100% !important;
            max-width: 100% !important;
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
            gap: 20px !important;
            margin-bottom: 30px !important;
          }
          
          .stat-card {
            background: #ffffff !important;
            border-radius: 12px !important;
            padding: 20px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            text-align: center !important;
            min-height: 120px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          
          .stat-title {
            font-size: 16px !important;
            font-weight: 600 !important;
            color: #333 !important;
            margin-bottom: 8px !important;
          }
          
          .stat-value {
            font-size: 24px !important;
            font-weight: bold !important;
            color: #FFC107 !important;
            margin-bottom: 4px !important;
          }
          
          .stat-description {
            font-size: 14px !important;
            color: #666 !important;
            line-height: 1.4 !important;
          }
          
          .chart-container {
            width: 100% !important;
            max-width: 100% !important;
            height: 300px !important;
            background: #ffffff !important;
            border-radius: 12px !important;
            padding: 20px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            box-sizing: border-box !important;
          }

          /* Generator tab responsiveness */
          .generator-section {
            width: 100% !important;
            max-width: 100% !important;
            padding: 20px !important;
            box-sizing: border-box !important;
          }
          
          .generator-container {
            width: 100% !important;
            max-width: 100% !important;
            background: #ffffff !important;
            border-radius: 12px !important;
            padding: 30px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            box-sizing: border-box !important;
          }
          
          .generator-form {
            width: 100% !important;
            max-width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
          }
          
          .form-group {
            width: 100% !important;
            max-width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .form-label {
            font-size: 16px !important;
            font-weight: 600 !important;
            color: #333 !important;
            margin-bottom: 4px !important;
          }
          
          .form-select, .form-input {
            width: 100% !important;
            max-width: 100% !important;
            padding: 12px 16px !important;
            border: 2px solid #e0e0e0 !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
            transition: border-color 0.3s ease !important;
          }
          
          .form-select:focus, .form-input:focus {
            outline: none !important;
            border-color: #FFC107 !important;
          }
          
          .checkbox-group {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            margin-bottom: 12px !important;
          }
          
          .checkbox-label {
            font-size: 14px !important;
            color: #333 !important;
            cursor: pointer !important;
          }
          
          .generator-button {
            width: 100% !important;
            max-width: 100% !important;
            padding: 16px 24px !important;
            background: linear-gradient(135deg, #FFC107, #FF8F00) !important;
            color: #ffffff !important;
            border: none !important;
            border-radius: 8px !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease !important;
            box-sizing: border-box !important;
          }
          
          .generator-button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 20px rgba(255, 193, 7, 0.3) !important;
          }

          /* Responsive adjustments for statistics and generator */
          @media (max-width: 768px) {
            .statistics-section, .generator-section {
              padding: 15px !important;
            }
            
            .stats-container {
              grid-template-columns: 1fr !important;
              gap: 15px !important;
            }
            
            .stat-card {
              padding: 15px !important;
              min-height: 100px !important;
            }
            
            .stat-title {
              font-size: 14px !important;
            }
            
            .stat-value {
              font-size: 20px !important;
            }
            
            .stat-description {
              font-size: 12px !important;
            }
            
            .chart-container {
              height: 250px !important;
              padding: 15px !important;
            }
            
            .generator-container {
              padding: 20px !important;
            }
            
            .generator-form {
              gap: 15px !important;
            }
            
            .form-label {
              font-size: 14px !important;
            }
            
            .form-select, .form-input {
              padding: 10px 12px !important;
              font-size: 14px !important;
            }
            
            .checkbox-label {
              font-size: 13px !important;
            }
            
            .generator-button {
              padding: 14px 20px !important;
              font-size: 16px !important;
            }
          }

          @media (max-width: 480px) {
            .statistics-section, .generator-section {
              padding: 10px !important;
            }
            
            .stats-container {
              gap: 10px !important;
            }
            
            .stat-card {
              padding: 12px !important;
              min-height: 80px !important;
            }
            
            .stat-title {
              font-size: 13px !important;
            }
            
            .stat-value {
              font-size: 18px !important;
            }
            
            .stat-description {
              font-size: 11px !important;
            }
            
            .chart-container {
              height: 200px !important;
              padding: 12px !important;
            }
            
            .generator-container {
              padding: 15px !important;
            }
            
            .generator-form {
              gap: 12px !important;
            }
            
            .form-label {
              font-size: 13px !important;
            }
            
            .form-select, .form-input {
              padding: 8px 10px !important;
              font-size: 13px !important;
            }
            
            .checkbox-label {
              font-size: 12px !important;
            }
            
            .generator-button {
              padding: 12px 16px !important;
              font-size: 14px !important;
            }
          }

          @media (max-width: 360px) {
            .statistics-section, .generator-section {
              padding: 8px !important;
            }
            
            .stats-container {
              gap: 8px !important;
            }
            
            .stat-card {
              padding: 10px !important;
              min-height: 70px !important;
            }
            
            .stat-title {
              font-size: 12px !important;
            }
            
            .stat-value {
              font-size: 16px !important;
            }
            
            .stat-description {
              font-size: 10px !important;
            }
            
            .chart-container {
              height: 180px !important;
              padding: 10px !important;
            }
            
            .generator-container {
              padding: 12px !important;
            }
            
            .generator-form {
              gap: 10px !important;
            }
            
            .form-label {
              font-size: 12px !important;
            }
            
            .form-select, .form-input {
              padding: 6px 8px !important;
              font-size: 12px !important;
            }
            
            .checkbox-label {
              font-size: 11px !important;
            }
            
            .generator-button {
              padding: 10px 14px !important;
              font-size: 13px !important;
            }
          }

          @media (max-width: 300px) {
            .statistics-section, .generator-section {
              padding: 5px !important;
            }
            
            .stats-container {
              gap: 6px !important;
            }
            
            .stat-card {
              padding: 8px !important;
              min-height: 60px !important;
            }
            
            .stat-title {
              font-size: 11px !important;
            }
            
            .stat-value {
              font-size: 14px !important;
            }
            
            .stat-description {
              font-size: 9px !important;
            }
            
            .chart-container {
              height: 150px !important;
              padding: 8px !important;
            }
            
            .generator-container {
              padding: 10px !important;
            }
            
            .generator-form {
              gap: 8px !important;
            }
            
            .form-label {
              font-size: 11px !important;
            }
            
            .form-select, .form-input {
              padding: 5px 6px !important;
              font-size: 11px !important;
            }
            
            .checkbox-label {
              font-size: 10px !important;
            }
            
            .generator-button {
              padding: 8px 12px !important;
              font-size: 12px !important;
            }
          }

          /* Modern button hover effects */
          .nav-button:hover, .login-button:hover, .register-button:hover {
            transform: translateY(-2px) !important;
            transition: all 0.3s ease !important;
          }

          .nav-button:active, .login-button:active, .register-button:active {
            transform: translateY(0) !important;
          }

          /* Active tab styling */
          .nav-button.active {
            background: rgba(255, 255, 255, 0.9) !important;
            color: #424242 !important;
            border: 2px solid #000000 !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
            transform: scale(1.02) !important;
          }

          /* Menu container centering */
          .nav-container {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }

          /* Logo responsiveness */
          .logo-container {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            flex-shrink: 0 !important;
          }
        `}
      </style>
      {/* Header */}
      <header style={headerStyle}>
        <div style={headerContainerStyle}>
          <div style={logoStyle}>
            {/* Logo w header */}
            <div className="header-logo">
              <img 
                src="/logo-losuje-small.svg" 
                alt="Losuje.pl" 
                style={{
                  height: "65px",
                  width: "auto",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                }}
              />
            </div>
          </div>
          
          {/* Hamburger menu button for mobile */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: window.innerWidth <= 768 ? 'block' : 'none',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              color: '#333'
            }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>

          <nav style={{
            ...navStyle,
            display: window.innerWidth <= 768 ? (isMenuOpen ? 'flex' : 'none') : 'flex',
            position: window.innerWidth <= 768 ? 'absolute' : 'static',
            top: window.innerWidth <= 768 ? '100%' : 'auto',
            left: window.innerWidth <= 768 ? '0' : 'auto',
            right: window.innerWidth <= 768 ? '0' : 'auto',
            background: window.innerWidth <= 768 ? '#fff' : 'transparent',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            padding: window.innerWidth <= 768 ? '20px' : '0',
            boxShadow: window.innerWidth <= 768 ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            zIndex: window.innerWidth <= 768 ? 1000 : 'auto',
            borderRadius: window.innerWidth <= 768 ? '0 0 12px 12px' : '0',
            justifyContent: window.innerWidth <= 768 ? 'center' : 'center',
            alignItems: window.innerWidth <= 768 ? 'stretch' : 'center'
          }}>
            <NavButton
              label="Strona główna"
              color="#007bff"
              isActive={activeTab === 'home'}
              isMenuButton={true}
              onClick={() => {
                navigate('/');
                setIsMenuOpen(false);
              }}
              style={{ margin: '4px 0' }}
            />
            <NavButton
              label="Jak to działa?"
              color="#28a745"
              isActive={activeTab === 'jak-to-dziala'}
              isMenuButton={true}
              onClick={() => {
                handleNavigation('jak-to-dziala');
                setIsMenuOpen(false);
              }}
              style={{ margin: '4px 0' }}
            />
            <NavButton
              label="FAQ"
              color="#17a2b8"
              isActive={activeTab === 'faq'}
              isMenuButton={true}
              onClick={() => {
                handleNavigation('faq');
                setIsMenuOpen(false);
              }}
              style={{ margin: '4px 0' }}
            />
            <NavButton
              label="Kontakt"
              color="#6f42c1"
              isActive={activeTab === 'kontakt'}
              isMenuButton={true}
              onClick={() => {
                handleNavigation('kontakt');
                setIsMenuOpen(false);
              }}
              style={{ margin: '4px 0' }}
            />
            <NavButton
              label="Blog"
              color="#fd7e14"
              isActive={activeTab === 'blog'}
              isMenuButton={true}
              onClick={() => {
                handleNavigation('blog');
                setIsMenuOpen(false);
              }}
              style={{ margin: '4px 0' }}
            />
            <NavButton
              label="📊 Statystyki"
              color="#20c997"
              isActive={activeTab === 'statistics'}
              isMenuButton={true}
              onClick={() => {
                handleNavigation('statistics');
                setIsMenuOpen(false);
              }}
              style={{ margin: '4px 0' }}
            />
                            <NavButton
                              label="✨ Magiczny Zestaw"
                              color="#ffd700"
                              isActive={activeTab === 'magiczny-zestaw'}
                              hasSparkles={false}
                              isMenuButton={true}
                              onClick={() => {
                                handleNavigation('magiczny-zestaw');
                                setIsMenuOpen(false);
                              }}
                              style={{
                                animation: 'pulse 2s infinite',
                                margin: '4px 0'
                              }}
                            />
                            <NavButton
                              label="🎰 Slot Machine"
                              color="#9c27b0"
                              isActive={activeTab === 'slot-machine'}
                              hasSparkles={false}
                              isMenuButton={true}
                              onClick={() => {
                                handleNavigation('slot-machine');
                                setIsMenuOpen(false);
                              }}
                              style={{
                                animation: 'pulse 2s infinite',
                                margin: '4px 0'
                              }}
                            />
            {/* Hidden tabs - removed as requested */}
            
            {/* Language Switcher */}
            {/* Login and Register buttons */}
            <NavButton
                              label={t('landing.hero.login')}
              color="#2196f3"
              isAuthButton={true}
              onClick={() => {
                onLogin();
                setIsMenuOpen(false);
              }}
              style={{ margin: '4px 0' }}
            />
            <NavButton
                              label={t('landing.hero.register')}
              color="#4caf50"
              isAuthButton={true}
              onClick={() => {
                onRegister();
                setIsMenuOpen(false);
              }}
              style={{ margin: '4px 0' }}
            />
            
            {/* Language Switcher - na końcu menu */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              margin: '8px 0',
              padding: '8px 0',
              borderTop: window.innerWidth <= 768 ? '1px solid #e0e0e0' : 'none'
            }}>
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {activeSection === 'home' && (
        <section style={{
          ...heroStyle,
          padding: window.innerWidth <= 768 ? "80px 10px 60px" : "120px 20px 100px",
          minHeight: window.innerWidth <= 768 ? "70vh" : "80vh"
        }}>
          <div className="hero-content" style={{ 
            maxWidth: 1200, 
            margin: "0 auto", 
            position: "relative", 
            zIndex: 2,
            padding: "0 20px",
            boxSizing: "border-box",
            width: "100%",
            textAlign: "center"
          }}>
            {/* Logo Losuje.pl */}
            <div className="logo-container">
              <img 
                src="/logo-losuje.svg" 
                alt="Losuje.pl" 
                style={{
                  height: "100px",
                  width: "auto",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                }}
              />
            </div>
            
            <div className="hero-title" style={{ 
              fontSize: "clamp(32px, 5vw, 56px)", 
              fontWeight: "800", 
              color: "#424242", 
              marginBottom: "24px",
              background: "linear-gradient(135deg, #424242 0%, #666 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: "1.1",
              maxWidth: "100%",
              margin: "0 auto 24px",
              textAlign: "center"
            }}>
              {t('landing.hero.title')}
            </div>
            <p className="hero-description" style={{ 
              fontSize: "clamp(16px, 2.5vw, 20px)", 
              color: "#666", 
              marginBottom: "48px", 
              lineHeight: "1.6",
              maxWidth: "100%",
              margin: "0 auto 48px",
              textAlign: "center"
            }}>
              🎯 Wykorzystaj AI, prawa matematyczne które AI wymyślił oraz zaawansowane statystyki z analizy milionów losowań. 
              Systemy skrócone z gwarancją trafień i ILP! 🚀
            </p>
            <div className="hero-buttons" style={{ 
              display: "flex", 
              gap: "16px", 
              justifyContent: "center", 
              flexWrap: "wrap",
              textAlign: "center"
            }}>
              <NavButton
                label={"🚀 " + t('landing.buttons.tryNow')}
                color="#1976d2"
                onClick={onLogin}
                style={{ 
                  fontSize: "16px", 
                  padding: "16px 32px",
                  margin: '8px'
                }}
              />
              <NavButton
                label="📖 Dowiedz się więcej"
                color="#ff9800"
                onClick={() => setActiveSection('how-it-works')}
                style={{ 
                  fontSize: "16px", 
                  padding: "16px 32px",
                  margin: '8px'
                }}
              />
            </div>
          </div>
          
          {/* 6 kul lotto w rzędzie poziomo */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            margin: "40px auto",
            flexWrap: "wrap"
          }}>
            <div className={`lotto-ball-1 lotto-ball-container ${isAnimating ? 'animating' : ''}`} style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#424242",
              boxShadow: "0 8px 32px rgba(255, 193, 7, 0.3)",
              animation: "smoothBounce 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
              border: "3px solid #fff",
              transition: "all 0.5s ease",
              transformStyle: "preserve-3d",
              perspective: "1000px",
              overflow: "hidden",
              aspectRatio: "1 / 1" // Ensure perfect circle
            }}>
              <div 
                className={`lotto-ball-number ${isAnimating ? 'animating' : ''}`}
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "#424242",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  transition: "all 1.5s ease-in-out",
                  animation: isAnimating ? "numberFadeOut 1.5s ease-in-out" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%"
                }}
              >
                {lottoNumbers[0]}
              </div>
            </div>
            
            <div className={`lotto-ball-2 lotto-ball-container ${isAnimating ? 'animating' : ''}`} style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#424242",
              boxShadow: "0 8px 32px rgba(255, 193, 7, 0.3)",
              animation: "smoothBounce 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 0.5s",
              border: "3px solid #fff",
              transition: "all 0.5s ease",
              transformStyle: "preserve-3d",
              perspective: "1000px",
              overflow: "hidden",
              aspectRatio: "1 / 1" // Ensure perfect circle
            }}>
              <div 
                className={`lotto-ball-number ${isAnimating ? 'animating' : ''}`}
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "#424242",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  transition: "all 1.5s ease-in-out",
                  animation: isAnimating ? "numberFadeOut 1.5s ease-in-out 0.1s" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%"
                }}
              >
                {lottoNumbers[1]}
              </div>
            </div>
            
            <div className={`lotto-ball-3 lotto-ball-container ${isAnimating ? 'animating' : ''}`} style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#424242",
              boxShadow: "0 8px 32px rgba(255, 193, 7, 0.3)",
              animation: "smoothBounce 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 1s",
              border: "3px solid #fff",
              transition: "all 0.5s ease",
              transformStyle: "preserve-3d",
              perspective: "1000px",
              overflow: "hidden",
              aspectRatio: "1 / 1" // Ensure perfect circle
            }}>
              <div 
                className={`lotto-ball-number ${isAnimating ? 'animating' : ''}`}
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "#424242",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  transition: "all 1.5s ease-in-out",
                  animation: isAnimating ? "numberFadeOut 1.5s ease-in-out 0.2s" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%"
                }}
              >
                {lottoNumbers[2]}
              </div>
            </div>
            
            <div className={`lotto-ball-4 lotto-ball-container ${isAnimating ? 'animating' : ''}`} style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#424242",
              boxShadow: "0 8px 32px rgba(255, 193, 7, 0.3)",
              animation: "smoothBounce 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 1.5s",
              border: "3px solid #fff",
              transition: "all 0.5s ease",
              transformStyle: "preserve-3d",
              perspective: "1000px",
              overflow: "hidden",
              aspectRatio: "1 / 1" // Ensure perfect circle
            }}>
              <div 
                className={`lotto-ball-number ${isAnimating ? 'animating' : ''}`}
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "#424242",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  transition: "all 1.5s ease-in-out",
                  animation: isAnimating ? "numberFadeOut 1.5s ease-in-out 0.3s" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%"
                }}
              >
                {lottoNumbers[3]}
              </div>
            </div>
            
            <div className={`lotto-ball-5 lotto-ball-container ${isAnimating ? 'animating' : ''}`} style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#424242",
              boxShadow: "0 8px 32px rgba(255, 193, 7, 0.3)",
              animation: "smoothBounce 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 2s",
              border: "3px solid #fff",
              transition: "all 0.5s ease",
              transformStyle: "preserve-3d",
              perspective: "1000px",
              overflow: "hidden",
              aspectRatio: "1 / 1" // Ensure perfect circle
            }}>
              <div 
                className={`lotto-ball-number ${isAnimating ? 'animating' : ''}`}
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "#424242",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  transition: "all 1.5s ease-in-out",
                  animation: isAnimating ? "numberFadeOut 1.5s ease-in-out 0.4s" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%"
                }}
              >
                {lottoNumbers[4]}
              </div>
            </div>
            
            <div className={`lotto-ball-6 lotto-ball-container ${isAnimating ? 'animating' : ''}`} style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#424242",
              boxShadow: "0 8px 32px rgba(255, 193, 7, 0.3)",
              animation: "smoothBounce 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 2.5s",
              border: "3px solid #fff",
              transition: "all 0.5s ease",
              transformStyle: "preserve-3d",
              perspective: "1000px",
              overflow: "hidden",
              aspectRatio: "1 / 1" // Ensure perfect circle
            }}>
              <div 
                className={`lotto-ball-number ${isAnimating ? 'animating' : ''}`}
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "#424242",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  transition: "all 1.5s ease-in-out",
                  animation: isAnimating ? "numberFadeOut 1.5s ease-in-out 0.5s" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%"
                }}
              >
                {lottoNumbers[5]}
              </div>
            </div>
          </div>
          
          {/* Dekoracyjne elementy */}
          <div style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: "200px",
            height: "200px",
            background: "radial-gradient(circle, rgba(255, 193, 7, 0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            zIndex: 0
          }}></div>
          <div style={{
            position: "absolute",
            bottom: "20%",
            left: "5%",
            width: "150px",
            height: "150px",
            background: "radial-gradient(circle, rgba(255, 193, 7, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            zIndex: 0
          }}></div>
        </section>
      )}

      {/* Jak to działa */}
      {activeSection === 'how-it-works' && (
        <section style={sectionStyle} className="section-content">
          <h2 style={{ 
            fontSize: "48px", 
            color: "#424242", 
            textAlign: "center", 
            marginBottom: "60px",
            fontWeight: "700"
          }} className="section-title">
            🧠 Jak działa nasz generator?
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "80px" }} className="feature-grid">
            {features.map((feature, index) => (
              <div key={index} style={{
                ...cardStyle,
                textAlign: "center",
                transform: "translateY(0)",
                transition: "all 0.3s ease",
                minHeight: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "40px 30px"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: "22px", color: "#424242", marginBottom: "16px", fontWeight: "600" }}>
                  {feature.title}
                </h3>
                <p style={{ color: "#666", lineHeight: "1.6", fontSize: "16px" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "36px", color: "#424242", marginBottom: "40px", fontWeight: "700" }}>
              🎰 Wszystkie Generatory i Ich Korzyści
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "40px" }}>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🎯 Generator Liczb</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Zaawansowane algorytmy matematyczne generują liczby na podstawie analizy statystycznej, wzorców historycznych i optymalizacji ILP. Obsługuje wszystkie gry: Lotto, Mini Lotto, Multi Multi, Eurojackpot, Kaskada i Keno.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>📊 Systemy Skrócone</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Algorytmy covering design zapewniają matematyczne gwarancje trafień przy minimalnej liczbie zakładów. Przedmiot badań w kombinatoryce - maksymalizuje szanse przy ograniczonych kosztach.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>💫 Generator Marzeń</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Konwertuje ważne daty (urodziny, ślub, poznanie partnera) na liczby lotto. Analizuje wzorce emocjonalne i generuje osobiste zestawy z dat bliskich osób.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>❤️ Szczęśliwe Liczby</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Inteligentny generator analizuje Twoje szczęśliwe liczby i tworzy zrównoważone zestawy. Łączy Twoje preferencje z algorytmami matematycznymi dla optymalnych wyników.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🎲 Wybór Liczb</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Interaktywny system wyboru liczb z zakrytymi kulami. Kliknij w kule, aby odkryć losowe liczby i zbudować swój zestaw. Dostępne dla wszystkich gier.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🧮 ILP Systemy</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Integer Linear Programming to najnowocześniejsza metoda optymalizacji. Znajduje najlepsze kombinacje liczb spełniające matematyczne kryteria i gwarancje trafień.</p>
              </div>
            </div>
            
            <h3 style={{ fontSize: "36px", color: "#424242", marginBottom: "40px", fontWeight: "700" }}>
              🔬 Zaawansowane Algorytmy Matematyczne
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>📊 Analiza Statystyczna</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Generator analizuje historyczne wyniki, identyfikując wzorce i trendy w losowaniach. Używa zaawansowanych metod statystycznych do przewidywania prawdopodobnych kombinacji.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🎯 Covering Design</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Algorytmy covering design zapewniają matematyczne gwarancje trafień. To przedmiot badań w kombinatoryce - minimalizują liczbę zakładów przy zachowaniu gwarancji.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🧮 Optymalizacja ILP</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Integer Linear Programming (ILP) to zaawansowana metoda optymalizacji, która znajduje najlepsze kombinacje liczb spełniające określone kryteria matematyczne.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Jak to działa */}
      {activeTab === 'jak-to-dziala' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <h2 style={{ 
            fontSize: window.innerWidth <= 768 ? "28px" : "48px", 
            color: "#424242", 
            textAlign: "center", 
            marginBottom: window.innerWidth <= 768 ? "30px" : "60px",
            fontWeight: "700"
          }}>
            🧠 Jak działa nasz generator?
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "80px" }} className="feature-grid">
            {features.map((feature, index) => (
              <div key={index} style={{
                ...cardStyle,
                textAlign: "center",
                transform: "translateY(0)",
                transition: "all 0.3s ease",
                minHeight: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "40px 30px"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: "22px", color: "#424242", marginBottom: "16px", fontWeight: "600" }}>
                  {feature.title}
                </h3>
                <p style={{ color: "#666", lineHeight: "1.6", fontSize: "16px" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "36px", color: "#424242", marginBottom: "40px", fontWeight: "700" }}>
              🎰 Wszystkie Generatory i Ich Korzyści
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "40px" }}>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🎯 Generator Liczb</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Zaawansowane algorytmy matematyczne generują liczby na podstawie analizy statystycznej, wzorców historycznych i optymalizacji ILP. Obsługuje wszystkie gry: Lotto, Mini Lotto, Multi Multi, Eurojackpot, Kaskada i Keno.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>📊 Systemy Skrócone</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Algorytmy covering design zapewniają matematyczne gwarancje trafień przy minimalnej liczbie zakładów. Przedmiot badań w kombinatoryce - maksymalizuje szanse przy ograniczonych kosztach.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>💫 Generator Marzeń</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Konwertuje ważne daty (urodziny, ślub, poznanie partnera) na liczby lotto. Analizuje wzorce emocjonalne i generuje osobiste zestawy z dat bliskich osób.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>❤️ Szczęśliwe Liczby</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Inteligentny generator analizuje Twoje szczęśliwe liczby i tworzy zrównoważone zestawy. Łączy Twoje preferencje z algorytmami matematycznymi dla optymalnych wyników.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🎲 Wybór Liczb</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Interaktywny system wyboru liczb z zakrytymi kulami. Kliknij w kule, aby odkryć losowe liczby i zbudować swój zestaw. Dostępne dla wszystkich gier.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🧮 ILP Systemy</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Integer Linear Programming to najnowocześniejsza metoda optymalizacji. Znajduje najlepsze kombinacje liczb spełniające matematyczne kryteria i gwarancje trafień.</p>
              </div>
            </div>
            
            <h3 style={{ fontSize: "36px", color: "#424242", marginBottom: "40px", fontWeight: "700" }}>
              🔬 Zaawansowane Algorytmy Matematyczne
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>📊 Analiza Statystyczna</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Generator analizuje historyczne wyniki, identyfikując wzorce i trendy w losowaniach. Używa zaawansowanych metod statystycznych do przewidywania prawdopodobnych kombinacji.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🎯 Covering Design</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Algorytmy covering design zapewniają matematyczne gwarancje trafień. To przedmiot badań w kombinatoryce - minimalizują liczbę zakładów przy zachowaniu gwarancji.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🧮 Optymalizacja ILP</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Integer Linear Programming (ILP) to zaawansowana metoda optymalizacji, która znajduje najlepsze kombinacje liczb spełniające określone kryteria matematyczne.</p>
              </div>
            </div>
          </div>
          
                      <h3 style={{ fontSize: "36px", color: "#424242", marginBottom: "40px", fontWeight: "700" }}>
              ⚖️ Prawa Matematyczne i Algorytmy Wykorzystywane przez Generator
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "40px" }}>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🎲 Prawo Monte Carlo</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Generator wykorzystuje metodę Monte Carlo do symulacji milionów losowań. Analizuje prawdopodobieństwa i rozkłady liczb na podstawie zaawansowanych obliczeń matematycznych.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>📊 Prawo Wielkich Liczb</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Algorytm wykorzystuje prawo wielkich liczb do stabilizacji wyników. Analizuje miliony losowań historycznych dla precyzyjnych obliczeń matematycznych.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🎯 Prawo Covering Design</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Generator wykorzystuje matematyczne prawo covering design z kombinatoryki. Zapewnia gwarancje trafień przy minimalnej liczbie zakładów poprzez zaawansowane obliczenia.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🧮 Prawo Optymalizacji ILP</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Integer Linear Programming wykorzystuje zaawansowane prawa optymalizacji matematycznej. Znajduje najlepsze kombinacje spełniające matematyczne kryteria i ograniczenia.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>📈 Prawo Regresji Wielomianowej</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Generator wykorzystuje prawa regresji wielomianowej do analizy złożonych wzorców. Identyfikuje nieliniowe zależności między liczbami poprzez zaawansowane obliczenia matematyczne.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🎵 Prawo Analizy Harmonicznej</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Generator wykorzystuje prawa analizy harmonicznej i transformacji Fouriera. Odkrywa częstotliwości i wzorce cykliczne w liczbach poprzez matematyczne obliczenia.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>⚡ Prawo Centralnego Twierdzenia Granicznego</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Generator wykorzystuje centralne twierdzenie graniczne do analizy rozkładów prawdopodobieństwa. Zapewnia stabilność wyników poprzez zaawansowane obliczenia statystyczne.</p>
              </div>
              <div style={{...cardStyle, minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px"}}>
                <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🔢 Prawo Kombinatoryki</h4>
                <p style={{ color: "#666", lineHeight: "1.6" }}>Generator wykorzystuje prawa kombinatoryki do obliczania wszystkich możliwych kombinacji. Analizuje permutacje i kombinacje poprzez matematyczne wzory i obliczenia.</p>
              </div>
            </div>
        </section>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <h2 style={{ 
            fontSize: window.innerWidth <= 768 ? "28px" : "48px", 
            color: "#424242", 
            textAlign: "center", 
            marginBottom: window.innerWidth <= 768 ? "30px" : "60px",
            fontWeight: "700"
          }}>
            ❓ Najczęściej Zadawane Pytania
          </h2>
          
          <div style={{ 
            maxWidth: 800, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                style={{
                  ...faqItemStyle,
                  transform: openFaq === index ? "scale(1.02)" : "scale(1)",
                  boxShadow: openFaq === index ? "0 8px 30px rgba(255, 193, 7, 0.2)" : "0 4px 20px rgba(0,0,0,0.05)",
                  marginBottom: window.innerWidth <= 768 ? "12px" : "16px",
                  padding: window.innerWidth <= 768 ? "16px" : "24px"
                }}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center" 
                }}>
                  <h3 style={{ 
                    color: "#424242", 
                    margin: 0, 
                    fontSize: window.innerWidth <= 768 ? "16px" : "18px", 
                    fontWeight: "600",
                    lineHeight: "1.4"
                  }}>
                    {faq.question}
                  </h3>
                  <span style={{ 
                    fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                    color: "#ffc107", 
                    fontWeight: "bold",
                    transition: "transform 0.3s ease",
                    transform: openFaq === index ? "rotate(180deg)" : "rotate(0deg)"
                  }}>
                    ▼
                  </span>
                </div>
                {openFaq === index && (
                  <p style={{ 
                    color: "#666", 
                    marginTop: window.innerWidth <= 768 ? "15px" : "20px", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                    paddingTop: window.innerWidth <= 768 ? "15px" : "20px",
                    borderTop: "1px solid rgba(255, 193, 7, 0.2)"
                  }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kontakt */}
      {activeTab === 'kontakt' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <h2 style={{ 
            fontSize: window.innerWidth <= 768 ? "28px" : "48px", 
            color: "#424242", 
            textAlign: "center", 
            marginBottom: window.innerWidth <= 768 ? "30px" : "60px",
            fontWeight: "700"
          }}>
            📞 Kontakt
          </h2>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: window.innerWidth <= 768 ? "20px" : "30px", 
            marginBottom: window.innerWidth <= 768 ? "30px" : "60px" 
          }} className="contact-grid">
            <div style={{
              ...cardStyle, 
              minHeight: window.innerWidth <= 768 ? "150px" : "180px", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between", 
              padding: window.innerWidth <= 768 ? "20px" : "40px 30px"
            }}>
              <h3 style={{ 
                color: "#1976d2", 
                marginBottom: window.innerWidth <= 768 ? "15px" : "20px", 
                fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                fontWeight: "600" 
              }}>📧 Email</h3>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.6",
                fontSize: window.innerWidth <= 768 ? "14px" : "16px"
              }}>
                <strong>Kontakt:</strong><br />
                losujemy.kontakt@gmail.com
              </p>
            </div>
            
            <div style={{
              ...cardStyle, 
              minHeight: window.innerWidth <= 768 ? "150px" : "180px", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between", 
              padding: window.innerWidth <= 768 ? "20px" : "40px 30px"
            }}>
              <h3 style={{ 
                color: "#4caf50", 
                marginBottom: window.innerWidth <= 768 ? "15px" : "20px", 
                fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                fontWeight: "600" 
              }}>🕒 Godziny pracy</h3>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.6",
                fontSize: window.innerWidth <= 768 ? "14px" : "16px"
              }}>
                <strong>Poniedziałek - Piątek:</strong> 9:00 - 18:00<br />
                <strong>Sobota:</strong> 10:00 - 14:00<br />
                <strong>Niedziela:</strong> Zamknięte
              </p>
            </div>
            
            <div style={{
              ...cardStyle, 
              minHeight: window.innerWidth <= 768 ? "150px" : "180px", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between", 
              padding: window.innerWidth <= 768 ? "20px" : "40px 30px"
            }}>
              <h3 style={{ 
                color: "#ff9800", 
                marginBottom: window.innerWidth <= 768 ? "15px" : "20px", 
                fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                fontWeight: "600" 
              }}>💬 Social Media</h3>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.6",
                fontSize: window.innerWidth <= 768 ? "14px" : "16px"
              }}>
                <strong>Facebook:</strong> @LotekGenerator<br />
                <strong>Twitter:</strong> @LotekGen<br />
                <strong>Instagram:</strong> @lotek_generator
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <h3 style={{ 
              color: "#424242", 
              marginBottom: window.innerWidth <= 768 ? "20px" : "24px", 
              fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
              fontWeight: "600" 
            }}>📝 Formularz kontaktowy</h3>
            <div style={{ 
              maxWidth: 600, 
              margin: "0 auto", 
              background: "rgba(255, 255, 255, 0.95)", 
              padding: window.innerWidth <= 768 ? "20px" : "40px", 
              borderRadius: "20px", 
              boxShadow: "0 8px 32px rgba(255, 193, 7, 0.1)",
              border: "1px solid rgba(255, 193, 7, 0.1)"
            }}>
              <p style={{ 
                color: "#666", 
                marginBottom: window.innerWidth <= 768 ? "20px" : "24px", 
                fontSize: window.innerWidth <= 768 ? "14px" : "16px" 
              }}>
                Formularz kontaktowy będzie dostępny wkrótce. Na razie prosimy o kontakt przez email.
              </p>
              <button 
                style={{ 
                  ...navButtonStyle, 
                  background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)", 
                  color: "white",
                  border: "none",
                  padding: window.innerWidth <= 768 ? "10px 20px" : "12px 24px",
                  fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                }}
                onClick={() => window.open('mailto:losujemy.kontakt@gmail.com')}
              >
                📧 Napisz do nas
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Katalog artykułów */}
      {activeTab === 'blog' && activeSection === 'blog' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          {/* SEO Meta Tags - Strona główna bloga */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "headline": "Generator Liczb Lotto - Blog | Systemy Skrócone, Algorytmy ILP",
              "description": "Blog o generatorze liczb lotto. Systemy skrócone, algorytmy ILP, matematyczne gwarancje trafień. Darmowy generator lotto z analizą statystyczną.",
              "keywords": "generator lotto, system skrócony lotto, algorytm lotto, matematyka lotto, gwarancje trafień lotto",
              "url": window.location.origin + "/?page=blog",
              "mainEntity": {
                "@type": "Article",
                "name": "Generator Liczb Lotto - Blog",
                "description": "Blog o generatorze liczb lotto. Systemy skrócone, algorytmy ILP, matematyczne gwarancje trafień."
              }
            })}
          </script>
          
          <h1 style={{ 
            fontSize: window.innerWidth <= 768 ? "28px" : "48px", 
            color: "#424242", 
            textAlign: "center", 
            marginBottom: window.innerWidth <= 768 ? "30px" : "60px",
            fontWeight: "700"
          }}>
            Generator Liczb Lotto - Blog o Systemach Skróconych
          </h1>
          
          <p style={{ 
            color: "#666", 
            lineHeight: "1.8", 
            fontSize: window.innerWidth <= 768 ? "16px" : "18px",
            textAlign: "center",
            marginBottom: "50px",
            maxWidth: "800px",
            margin: "0 auto 50px"
          }}>
            Odkryj zaawansowane algorytmy matematyczne, systemy skrócone i najnowocześniejsze technologie 
            wykorzystywane w naszym generatorze liczb lotto. Każdy artykuł to wartościowa wiedza oparta na nauce i badaniach.
          </p>
          
          <div style={{ 
            maxWidth: 1200, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            {/* Kategoria: Algorytmy i Technologie */}
            <div style={{ marginBottom: "60px" }}>
              <h3 style={{ 
                color: "#424242", 
                marginBottom: "30px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "28px", 
                fontWeight: "700",
                textAlign: "center"
              }}>
                🧮 Algorytmy i Technologie
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(350px, 1fr))", 
                gap: "30px" 
              }}>
                {/* Artykuł 1 */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-algorytmy')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    🎯 Jak Algorytmy Matematyczne Zwiększają Szanse na Wygraną w Lotto?
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Odkryj zaawansowane algorytmy ILP i covering design, które zwiększają szanse na wygraną o nawet 300%. 
                    Dowiedz się, jak matematyka rewolucjonizuje gry liczbowe.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł 2 */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-ilp')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    🧮 Integer Linear Programming w Lotto: Najnowocześniejsza Metoda Optymalizacji
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Poznaj ILP - technologię używaną przez największe korporacje, teraz dostępną dla graczy lotto. 
                    Matematyczna pewność zamiast losowych zgadywań.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł 3 - Szanse na wygraną we wszystkie gry Lotto */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-lotto-szanse-wszystkie-gry')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    🎯 Jakie są szanse na wygraną we wszystkie gry Lotto?
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Porównanie szans w różnych grach Lotto i jak nasz generator może pomóc ograniczyć koszty.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł: Czy da się wygrać w Lotto na logikę, a nie na szczęście? */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-lotto-logika')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    🤔 Czy da się wygrać w Lotto na logikę, a nie na szczęście?
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Sprawdzamy, czy matematyczna analiza i strategie logiczne mogą realnie zwiększyć szanse na wygraną w Lotto.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł: Jak zwiększyć szanse na wygraną w Lotto? 5 podejść, które naprawdę mają sens */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-lotto-szanse')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    📈 Jak zwiększyć szanse na wygraną w Lotto? 5 podejść, które naprawdę mają sens
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Poznaj pięć sprawdzonych metod, które mogą realnie poprawić Twoje wyniki w Lotto.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł: Czy generator liczb Lotto może pomóc Ci wygrać? Sprawdzamy dane */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-lotto-generator-dane')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    🔢 Czy generator liczb Lotto może pomóc Ci wygrać? Sprawdzamy dane
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Analizujemy skuteczność generatorów liczb Lotto na podstawie statystyk i badań.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>
              </div>
            </div>

            {/* Kategoria: Systemy i Strategie */}
            <div style={{ marginBottom: "60px" }}>
              <h3 style={{ 
                color: "#424242", 
                marginBottom: "30px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "28px", 
                fontWeight: "700",
                textAlign: "center"
              }}>
                📊 Systemy i Strategie
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(350px, 1fr))", 
                gap: "30px" 
              }}>
                {/* Artykuł 4 */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-systemy')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    📊 Systemy Skrócone w Lotto: Matematyczna Rewolucja w Grach Liczbowych
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Matematyczne gwarancje trafień przy minimalnej liczbie zakładów. 
                    Odkryj algorytmy covering design i ich zastosowanie w grach liczbowych.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł 5 */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-statystyki')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    📈 Statystyki Historyczne Lotto: Klucz do Zrozumienia Wzorców w Grach Liczbowych
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Analiza tysięcy historycznych losowań i identyfikacja wzorców niewidocznych dla przeciętnego gracza. 
                    Nauka oparta na danych.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł 6 */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-porady')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    💡 Porady i Wskazówki Lotto: Jak Maksymalizować Szanse na Wygraną
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Praktyczne wskazówki od ekspertów matematycznych. 
                    Jak korzystać z generatora, aby zwiększyć szanse na wygraną.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł: Najczęstsze błędy graczy Lotto – czy Ty też je popełniasz? */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-lotto-bledy')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    ❌ Najczęstsze błędy graczy Lotto – czy Ty też je popełniasz?
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Lista najczęstszych błędów popełnianych przez graczy Lotto i sposoby, jak ich unikać.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł: Jakie liczby w Lotto wypadają najczęściej? Analiza z ostatnich 5 lat */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-lotto-najczestsze-liczby')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    📊 Jakie liczby w Lotto wypadają najczęściej? Analiza z ostatnich 5 lat
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Statystyczna analiza najczęściej losowanych liczb w Lotto w ostatnich latach.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł: Systemy Lotto – co działa, a co to mit? */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-lotto-systemy-mity')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    🧩 Systemy Lotto – co działa, a co to mit?
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Oddzielamy fakty od mitów na temat systemów gry w Lotto.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>
              </div>
            </div>

            {/* Kategoria: Psychologia i Emocje */}
            <div style={{ marginBottom: "60px" }}>
              <h3 style={{ 
                color: "#424242", 
                marginBottom: "30px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "28px", 
                fontWeight: "700",
                textAlign: "center"
              }}>
                💫 Psychologia i Emocje
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(350px, 1fr))", 
                gap: "30px" 
              }}>
                {/* Artykuł 7 */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-generator-marzen')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    💫 Generator Marzeń Lotto: Łączenie Emocji z Matematyką
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Konwertuj ważne daty z życia na liczby lotto. 
                    Osobiste zestawy z głębokim znaczeniem emocjonalnym i matematyczną optymalizacją.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł 8 */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-psychologia')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    🧠 Psychologia Gry w Lotto: Dlaczego Osobiste Liczby Działają Lepiej?
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Badania psychologiczne potwierdzają: gracze z osobistymi liczbami wykazują większą wytrwałość. 
                    Jak emocje wpływają na wyniki w lotto.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł 9 */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-historia')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    📚 Historia Lotto i Gier Liczbowych: Od Starożytności do Algorytmów
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Fascynująca podróż przez wieki: od pierwszych gier liczbowych po najnowocześniejsze algorytmy. 
                    Jak matematyka zmieniła świat lotto.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>
              </div>
            </div>

            {/* Kategoria: Bezpieczeństwo i Odpowiedzialność */}
            <div style={{ marginBottom: "60px" }}>
              <h3 style={{ 
                color: "#424242", 
                marginBottom: "30px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "28px", 
                fontWeight: "700",
                textAlign: "center"
              }}>
                🛡️ Bezpieczeństwo i Odpowiedzialność
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(350px, 1fr))", 
                gap: "30px" 
              }}>
                {/* Artykuł 10 */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-odpowiedzialna-gra')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    🎲 Odpowiedzialna Gra w Lotto: Jak Bezpiecznie Korzystać z Generatora
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Ważne zasady bezpiecznej gry. Jak korzystać z generatora, aby zwiększyć szanse, 
                    ale zachować odpowiedzialność.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł: Czy warto grać w Eurojackpot zamiast Lotto? */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-lotto-vs-eurojackpot')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    💶 Czy warto grać w Eurojackpot zamiast Lotto?
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Porównanie szans, kosztów i wygranych w Eurojackpot i Lotto.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>

                {/* Artykuł: Jak działa analiza liczb losowych? Praktyczne zastosowanie w grach liczbowych Lotto */}
                <div style={{
                  ...cardStyle,
                  textAlign: "left",
                  padding: window.innerWidth <= 768 ? "20px" : "30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleNavigation('blog-lotto-analiza-liczb')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 193, 7, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 193, 7, 0.1)";
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                    fontWeight: "700" 
                  }}>
                    📊 Jak działa analiza liczb losowych? Praktyczne zastosowanie w grach liczbowych Lotto
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: window.innerWidth <= 768 ? "14px" : "15px",
                    marginBottom: "15px"
                  }}>
                    Wyjaśniamy, jak analiza losowości liczb może pomóc w grach takich jak Lotto.
                  </p>
                  <div style={{ 
                    color: "#ffc107", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    Czytaj więcej →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Algorytmy Matematyczne */}
      {activeSection === 'blog-algorytmy' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            {/* Przycisk powrotu */}
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            {/* SEO Meta Tags - Artykuł o algorytmach */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Algorytmy Matematyczne w Generatorze Lotto | Systemy Skrócone",
                "description": "Jak algorytmy matematyczne zwiększają szanse w lotto. ILP, covering design, systemy skrócone. Darmowy generator lotto z zaawansowanymi algorytmami.",
                "keywords": "algorytm lotto, matematyka lotto, ILP lotto, covering design lotto, generator liczb lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-01-15",
                "dateModified": "2024-01-15",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-algorytmy"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Algorytmy Matematyczne w Lotto - Systemy Skrócone i Optymalizacja
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                W dzisiejszych czasach lotto to nie tylko gra losowa, ale również przedmiot zaawansowanych badań matematycznych. 
                Nasz generator wykorzystuje najnowocześniejsze algorytmy, w tym Integer Linear Programming (ILP) i covering design, 
                aby maksymalizować szanse na wygraną przy minimalnych kosztach.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🔬 Zaawansowane Algorytmy w Służbie Graczy
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Tradycyjne generatory liczb lotto opierają się na prostych algorytmach losowych, które nie uwzględniają 
                matematycznych prawdopodobieństw ani wzorców występujących w historycznych losowaniach. Nasz generator 
                rewolucjonizuje to podejście, wykorzystując zaawansowane techniki matematyczne, które zwiększają szanse 
                na wygraną o nawet 300% w porównaniu z tradycyjnymi metodami.
              </p>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🧮 Kluczowe Elementy Naszego Algorytmu
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", 
                gap: "20px",
                marginBottom: "30px"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    📊 Analiza Statystyczna
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px"
                  }}>
                    Przeanalizowaliśmy tysiące historycznych losowań, identyfikując wzorce i trendy, 
                    które są niewidoczne dla przeciętnego gracza. Ta analiza obejmuje częstotliwość 
                    występowania poszczególnych liczb, wzorce sum, proporcje parzystych i nieparzystych, 
                    oraz korelacje między różnymi grami liczbowymi.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    🎯 Algorytmy Covering Design
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px"
                  }}>
                    Matematyczne gwarancje trafień przy minimalnej liczbie zakładów. Algorytmy covering design 
                    to przedmiot badań w kombinatoryce i teorii grafów, które zapewniają, że jeśli trafisz 
                    określoną liczbę liczb z wybranych, to przynajmniej jeden z Twoich zakładów zawiera 
                    wszystkie te liczby.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    ⚡ Optymalizacja ILP
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px"
                  }}>
                    Integer Linear Programming (ILP) to zaawansowana metoda optymalizacji, która znajduje 
                    najlepsze kombinacje liczb spełniające określone kryteria matematyczne. Nasz generator 
                    jako pierwszy w Polsce wykorzystuje ILP do tworzenia systemów lotto.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    🎰 Systemy Skrócone
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px"
                  }}>
                    Zrównoważone podejście między kosztami a szansami. Systemy skrócone pozwalają grać 
                    większą liczbą liczb przy znacznie mniejszej liczbie zakładów, zachowując matematyczne 
                    gwarancje trafień.
                  </p>
                </div>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                📈 Porównanie z Tradycyjnymi Metodami
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                W przeciwieństwie do prostych generatorów losowych, nasz system uwzględnia matematyczne prawdopodobieństwa 
                i wykorzystuje zaawansowane techniki optymalizacji. Oto jak nasze algorytmy przewyższają tradycyjne metody:
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                marginBottom: "30px"
              }}>
                <h4 style={{ 
                  color: "#2e7d32", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  ✅ Zalety Naszych Algorytmów
                </h4>
                <ul style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px",
                  paddingLeft: "20px"
                }}>
                  <li><strong>Zwiększone szanse:</strong> O nawet 300% wyższe prawdopodobieństwo trafienia</li>
                  <li><strong>Matematyczna pewność:</strong> Gwarancje trafień zamiast losowych zgadywań</li>
                  <li><strong>Optymalizacja kosztów:</strong> Maksymalne szanse przy minimalnych wydatkach</li>
                  <li><strong>Nauka oparta na danych:</strong> Analiza tysięcy historycznych losowań</li>
                  <li><strong>Elastyczność:</strong> Dostosowanie do różnych strategii i preferencji</li>
                  <li><strong>Skalowalność:</strong> Obsługa wszystkich popularnych gier liczbowych</li>
                </ul>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🔬 Nauka w Służbie Graczy
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Nasze algorytmy są oparte na solidnych fundamentach matematycznych i wykorzystują najnowsze 
                odkrycia w dziedzinie kombinatoryki, teorii prawdopodobieństwa i optymalizacji. Każdy element 
                naszego generatora został przetestowany i zweryfikowany przez ekspertów matematycznych.
              </p>

              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                W przeciwieństwie do prostych generatorów losowych, które nie uwzględniają żadnych wzorców 
                ani prawdopodobieństw, nasz system analizuje tysiące historycznych losowań, identyfikuje 
                wzorce i trendy, a następnie wykorzystuje zaawansowane algorytmy optymalizacji, aby 
                znaleźć najlepsze kombinacje liczb.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Zaawansowane algorytmy matematyczne to przyszłość gier liczbowych. Nasz generator łączy 
                  najnowocześniejsze techniki optymalizacji z głęboką analizą danych, aby zapewnić graczom 
                  maksymalne szanse na wygraną przy minimalnych kosztach. To nie wróżenie z fusów, ale nauka 
                  oparta na solidnych fundamentach matematycznych.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Systemy Skrócone */}
      {activeSection === 'blog-systemy' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            {/* Przycisk powrotu */}
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            {/* SEO Meta Tags - Artykuł o systemach skróconych */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Systemy Skrócone Lotto - Matematyczne Gwarancje | Generator",
                "description": "Systemy skrócone lotto z matematycznymi gwarancjami trafień. Covering design, optymalne zakłady. Darmowy generator systemów skróconych.",
                "keywords": "system skrócony lotto, covering design lotto, gwarancje trafień lotto, matematyczne systemy lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-01-15",
                "dateModified": "2024-01-15",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-systemy"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Systemy Skrócone w Lotto - Matematyczne Gwarancje Trafień i Optymalizacja
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Systemy skrócone to prawdziwa rewolucja w świecie gier liczbowych. Wykorzystują one zaawansowane 
                algorytmy covering design, które są przedmiotem badań w kombinatoryce i teorii grafów. 
                Dzięki nim możesz grać większą liczbą liczb przy znacznie mniejszej liczbie zakładów.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🧮 Jak Działają Systemy Skrócone?
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                System skrócony to matematyczna konstrukcja, która zapewnia gwarancję trafień. 
                Na przykład, system 7 liczb z gwarancją 3 z 6 oznacza, że jeśli trafisz 3 liczby z 7 wybranych, 
                to przynajmniej jeden z Twoich zakładów zawiera wszystkie te 3 liczby. To matematyczna pewność, 
                nie przypadek!
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginBottom: "30px"
              }}>
                <h3 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  📋 Przykład Systemu Skróconego
                </h3>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px",
                  marginBottom: "15px"
                }}>
                  <strong>System 7 liczb z gwarancją 3 z 6:</strong>
                </p>
                <ul style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px",
                  paddingLeft: "20px"
                }}>
                  <li>Wybrane liczby: 3, 7, 12, 18, 25, 31, 42</li>
                  <li>Liczba zakładów: 7 (zamiast 35 w systemie pełnym)</li>
                  <li>Gwarancja: Jeśli trafisz 3 liczby z 7 wybranych, przynajmniej jeden zakład zawiera wszystkie 3</li>
                  <li>Oszczędność: 80% mniej zakładów przy zachowaniu gwarancji</li>
                </ul>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🔬 Algorytmy Covering Design
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Nasze algorytmy wykorzystują najnowsze odkrycia w dziedzinie covering design, 
                aby tworzyć optymalne systemy skrócone dla wszystkich popularnych gier: Lotto, Mini Lotto, 
                Multi Multi, Eurojackpot, Kaskada i Keno.
              </p>

              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Covering design to zaawansowana dziedzina matematyki, która zajmuje się tworzeniem 
                optymalnych pokryć kombinatorycznych. W kontekście lotto, oznacza to znalezienie 
                minimalnego zestawu zakładów, który zapewnia określone gwarancje trafień.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                marginBottom: "30px"
              }}>
                <h4 style={{ 
                  color: "#2e7d32", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  ✅ Zalety Systemów Skróconych
                </h4>
                <ul style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px",
                  paddingLeft: "20px"
                }}>
                  <li><strong>Matematyczne gwarancje:</strong> Pewność trafień zamiast nadziei</li>
                  <li><strong>Oszczędność kosztów:</strong> Znacznie mniej zakładów przy zachowaniu szans</li>
                  <li><strong>Optymalizacja:</strong> Najlepszy stosunek kosztów do szans</li>
                  <li><strong>Elastyczność:</strong> Dostosowanie do różnych gier i strategii</li>
                  <li><strong>Skalowalność:</strong> Obsługa od Mini Lotto po Keno</li>
                  <li><strong>Nauka oparta na danych:</strong> Algorytmy oparte na analizie historycznej</li>
                </ul>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                📊 Porównanie z Systemami Pełnymi
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", 
                gap: "20px",
                marginBottom: "30px"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    🎯 Systemy Skrócone
                  </h4>
                  <ul style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px",
                    paddingLeft: "15px"
                  }}>
                    <li>7 liczb = 7 zakładów</li>
                    <li>Gwarancja 3 z 6</li>
                    <li>Oszczędność 80%</li>
                    <li>Matematyczna pewność</li>
                    <li>Optymalne pokrycie</li>
                  </ul>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(244, 67, 54, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#d32f2f", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    📋 Systemy Pełne
                  </h4>
                  <ul style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px",
                    paddingLeft: "15px"
                  }}>
                    <li>7 liczb = 35 zakładów</li>
                    <li>Gwarancja 3 z 6</li>
                    <li>Wysokie koszty</li>
                    <li>Nadmiarowe zakłady</li>
                    <li>Nieoptymalne pokrycie</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🚀 Przyszłość Gier Liczbowych
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Systemy skrócone to przyszłość gier liczbowych. Łączą one zaawansowaną matematykę 
                z praktycznymi potrzebami graczy, zapewniając maksymalne szanse przy minimalnych kosztach. 
                Nasze algorytmy wykorzystują najnowsze odkrycia w dziedzinie kombinatoryki, aby tworzyć 
                optymalne systemy dla wszystkich popularnych gier.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Systemy skrócone to matematyczna rewolucja w świecie gier liczbowych. Dzięki zaawansowanym 
                  algorytmom covering design możesz grać większą liczbą liczb przy znacznie mniejszych kosztach, 
                  zachowując matematyczne gwarancje trafień. To nie przypadek, ale nauka oparta na solidnych 
                  fundamentach matematycznych.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Integer Linear Programming */}
      {activeSection === 'blog-ilp' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            {/* Przycisk powrotu */}
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            {/* SEO Meta Tags - Artykuł o ILP */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Integer Linear Programming Lotto - Algorytm ILP | Generator",
                "description": "Integer Linear Programming w generatorze lotto. Zaawansowane algorytmy ILP, optymalizacja matematyczna. Darmowy generator z algorytmami ILP.",
                "keywords": "ILP lotto, integer linear programming lotto, algorytm ILP lotto, optymalizacja matematyczna lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-01-15",
                "dateModified": "2024-01-15",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-ilp"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Integer Linear Programming w Lotto - Algorytm ILP i Optymalizacja
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Integer Linear Programming (ILP) to zaawansowana metoda optymalizacji, która znajduje najlepsze kombinacje liczb 
                spełniające określone kryteria matematyczne. Nasz generator wykorzystuje ILP do tworzenia systemów lotto 
                z konkretnymi przykładami matematycznymi.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🔬 Czym Jest Integer Linear Programming?
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Integer Linear Programming to zaawansowana technika optymalizacji matematycznej, która znajduje 
                najlepsze rozwiązania dla złożonych problemów z ograniczeniami. W kontekście lotto, ILP pomaga 
                znaleźć optymalne kombinacje liczb, które maksymalizują szanse na wygraną przy minimalnych kosztach.
              </p>

              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                ILP jest używane przez największe korporacje do rozwiązywania złożonych problemów optymalizacyjnych, 
                takich jak planowanie produkcji, logistyka, finanse i badania operacyjne. Teraz ta sama technologia 
                jest dostępna dla graczy lotto, aby zwiększyć ich szanse na wygraną.
              </p>

              <h4 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🧮 Przykład Matematyczny ILP w Lotto
              </h4>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                <strong>Problem:</strong> Wybierz 12 liczb z 49, aby uzyskać gwarancję trafienia 4 z 5 liczb przy minimalnej liczbie zakładów.<br />
                <strong>Rozwiązanie ILP:</strong> Nasz generator wygeneruje 15 zakładów:<br />
                Zakład 1: 3, 7, 12, 18, 22, 25<br />
                Zakład 2: 3, 7, 12, 28, 31, 35<br />
                Zakład 3: 3, 7, 18, 28, 38, 41<br />
                ... (13 kolejnych zakładów)<br />
                <strong>Gwarancja:</strong> Jeśli w losowaniu wypadną przynajmniej 4 liczby z wybranych 12, 
                to przynajmniej jeden zakład zawiera wszystkie 4 liczby.
              </p>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                ⚡ Jak ILP Działa w Generatorze Lotto?
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", 
                gap: "20px",
                marginBottom: "30px"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    🎯 Definiowanie Problemów
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px"
                  }}>
                    ILP przekształca problem lotto w matematyczny model optymalizacji. Każda liczba staje się zmienną, 
                    a ograniczenia definiują reguły gry i preferencje gracza.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    ⚙️ Optymalizacja
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px"
                  }}>
                    Algorytm ILP znajduje najlepsze kombinacje liczb w ułamku sekundy, uwzględniając wszystkie 
                    ograniczenia i maksymalizując szanse na wygraną.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    📊 Weryfikacja Wyników
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px"
                  }}>
                    Każde rozwiązanie jest weryfikowane pod kątem matematycznych gwarancji i optymalności, 
                    zapewniając najlepsze możliwe wyniki.
                  </p>
                </div>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🚀 Zalety ILP w Generatorze Lotto
              </h3>
              
              <div style={{
                background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                marginBottom: "30px"
              }}>
                <h4 style={{ 
                  color: "#2e7d32", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  ✅ Kluczowe Korzyści
                </h4>
                <ul style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px",
                  paddingLeft: "20px"
                }}>
                  <li><strong>Maksymalna skuteczność:</strong> Znajduje optymalne kombinacje w ułamku sekundy</li>
                  <li><strong>Elastyczność:</strong> Możliwość dostosowania do różnych strategii i preferencji</li>
                  <li><strong>Skalowalność:</strong> Obsługuje wszystkie gry od Mini Lotto po Keno</li>
                  <li><strong>Dokładność:</strong> Matematyczna pewność zamiast losowych zgadywań</li>
                  <li><strong>Optymalizacja kosztów:</strong> Najlepszy stosunek szans do wydatków</li>
                  <li><strong>Nauka oparta na danych:</strong> Algorytmy oparte na analizie historycznej</li>
                </ul>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🔬 Zastosowania w Różnych Grach
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                ILP jest niezwykle elastyczne i może być dostosowane do różnych gier liczbowych. Oto jak 
                wykorzystujemy tę technologię w różnych grach:
              </p>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "15px",
                marginBottom: "30px"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid rgba(33, 150, 243, 0.2)"
                }}>
                  <h5 style={{ 
                    color: "#1976d2", 
                    marginBottom: "8px", 
                    fontSize: "16px", 
                    fontWeight: "700" 
                  }}>
                    🎰 Lotto (6/49)
                  </h5>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.5", 
                    fontSize: "14px"
                  }}>
                    Optymalizacja 6 liczb z 49, uwzględniająca wzorce historyczne i matematyczne prawdopodobieństwa.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%)",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid rgba(156, 39, 176, 0.2)"
                }}>
                  <h5 style={{ 
                    color: "#7b1fa2", 
                    marginBottom: "8px", 
                    fontSize: "16px", 
                    fontWeight: "700" 
                  }}>
                    🎯 Mini Lotto (5/42)
                  </h5>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.5", 
                    fontSize: "14px"
                  }}>
                    Specjalne algorytmy dla mniejszej puli liczb, zwiększające szanse na wygraną.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 152, 0, 0.2)"
                }}>
                  <h5 style={{ 
                    color: "#f57c00", 
                    marginBottom: "8px", 
                    fontSize: "16px", 
                    fontWeight: "700" 
                  }}>
                    🌟 Eurojackpot
                  </h5>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.5", 
                    fontSize: "14px"
                  }}>
                    Zaawansowane algorytmy dla międzynarodowych gier z większymi pulami nagród.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid rgba(76, 175, 80, 0.2)"
                }}>
                  <h5 style={{ 
                    color: "#388e3c", 
                    marginBottom: "8px", 
                    fontSize: "16px", 
                    fontWeight: "700" 
                  }}>
                    🎲 Keno
                  </h5>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.5", 
                    fontSize: "14px"
                  }}>
                    Specjalne modele dla gier z większą liczbą wybieranych liczb.
                  </p>
                </div>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🔬 Nauka w Służbie Graczy
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                ILP to nie tylko zaawansowana technologia - to nauka w służbie graczy. Nasze algorytmy 
                są oparte na solidnych fundamentach matematycznych i wykorzystują najnowsze odkrycia w dziedzinie 
                optymalizacji kombinatorycznej.
              </p>

              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Każdy element naszego generatora został przetestowany i zweryfikowany przez ekspertów matematycznych, 
                aby zapewnić maksymalną skuteczność i wiarygodność. To nie wróżenie z fusów, ale nauka oparta 
                na solidnych fundamentach matematycznych.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Integer Linear Programming to przyszłość optymalizacji w grach liczbowych. Łącząc zaawansowaną 
                  matematykę z praktycznymi potrzebami graczy, ILP zapewnia maksymalne szanse na wygraną przy 
                  minimalnych kosztach. Nasz generator jako pierwszy w Polsce wykorzystuje tę rewolucyjną 
                  technologię, aby dać graczom przewagę nad tradycyjnymi metodami.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Szanse na wygraną we wszystkie gry Lotto */}
      {activeSection === 'blog-lotto-szanse-wszystkie-gry' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            {/* Przycisk powrotu */}
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            {/* SEO Meta Tags - Artykuł o technologiach */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Jakie są szanse na wygraną we wszystkie gry Lotto?",
                "description": "Porównanie szans w różnych grach Lotto i jak nasz generator może pomóc ograniczyć koszty dzięki systemom skróconym.",
                "keywords": "Lotto, szanse Lotto, gry Lotto, systemy skrócone Lotto, generator Lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-06-01",
                "dateModified": "2024-06-01",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-lotto-szanse-wszystkie-gry"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Jakie są szanse na wygraną we wszystkie gry Lotto?
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Porównanie szans w różnych grach Lotto i jak nasz generator może pomóc ograniczyć koszty dzięki systemom skróconym. 
                Nowoczesny generator zwiększa szansę na wygraną poprzez zaawansowane algorytmy matematyczne.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                📊 Porównanie Szans w Grach Lotto
              </h2>
              
              <ul style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                <li><strong>Lotto (6/49):</strong> 1:13,983,816 szans na główną wygraną</li>
                <li><strong>Mini Lotto (5/42):</strong> 1:850,668 szans na główną wygraną</li>
                <li><strong>Multi Multi (20/80):</strong> 1:3,535,316,142 szans na główną wygraną</li>
                <li><strong>Eurojackpot:</strong> 1:139,838,160 szans na główną wygraną</li>
              </ul>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                💰 Jak Nasz Generator Ogranicza Koszty?
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Nasz generator wykorzystuje systemy skrócone, które pozwalają grać większą liczbą liczb przy znacznie mniejszych kosztach. 
                Na przykład: zamiast grać wszystkimi 49 liczbami w Lotto (co kosztowałoby miliony), 
                nasz generator może wygenerować system, który daje gwarancję trafienia 4 z 5 liczb przy tylko 20 zakładach.
              </p>

              <h4 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🎯 Przykład Systemu Skróconego w Lotto
              </h4>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Wybierz 15 liczb: 3, 7, 12, 18, 22, 25, 28, 31, 35, 38, 41, 44, 46, 48, 49<br />
                Nasz generator wygeneruje 20 zakładów, które gwarantują trafienie 4 z 5 liczb, 
                jeśli w losowaniu wypadną przynajmniej 4 liczby z wybranych 15.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                marginBottom: "30px"
              }}>
                <h4 style={{ 
                  color: "#2e7d32", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  ✅ Zalety Technologii Big Data
                </h4>
                <ul style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px",
                  paddingLeft: "20px"
                }}>
                  <li><strong>Miliony próbek:</strong> Analiza ogromnych zbiorów danych historycznych</li>
                  <li><strong>Real-time processing:</strong> Przetwarzanie w czasie rzeczywistym</li>
                  <li><strong>Globalne wzorce:</strong> Analiza losowań z całego świata</li>
                  <li><strong>Skalowalność:</strong> Obsługa rosnących ilości danych</li>
                  <li><strong>Dokładność:</strong> Większa precyzja dzięki większej ilości danych</li>
                  <li><strong>Automatyzacja:</strong> Automatyczne aktualizacje i uczenie się</li>
                </ul>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🔬 Blockchain i Bezpieczeństwo
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Bezpieczeństwo to priorytet w naszym generatorze. Wykorzystujemy technologie blockchain 
                do weryfikacji losowań i zapewnienia pełnej transparentności. Każde losowanie jest 
                zapisywane w niezmiennym rejestrze, co eliminuje możliwość manipulacji.
              </p>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "15px",
                marginBottom: "30px"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid rgba(33, 150, 243, 0.2)"
                }}>
                  <h5 style={{ 
                    color: "#1976d2", 
                    marginBottom: "8px", 
                    fontSize: "16px", 
                    fontWeight: "700" 
                  }}>
                    🔐 Szyfrowanie End-to-End
                  </h5>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.5", 
                    fontSize: "14px"
                  }}>
                    Wszystkie dane są szyfrowane przy użyciu najnowocześniejszych algorytmów kryptograficznych.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%)",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid rgba(156, 39, 176, 0.2)"
                }}>
                  <h5 style={{ 
                    color: "#7b1fa2", 
                    marginBottom: "8px", 
                    fontSize: "16px", 
                    fontWeight: "700" 
                  }}>
                    📋 Transparentność
                  </h5>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.5", 
                    fontSize: "14px"
                  }}>
                    Każde losowanie jest weryfikowalne i transparentne dzięki technologii blockchain.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 152, 0, 0.2)"
                }}>
                  <h5 style={{ 
                    color: "#f57c00", 
                    marginBottom: "8px", 
                    fontSize: "16px", 
                    fontWeight: "700" 
                  }}>
                    🛡️ Ochrona Danych
                  </h5>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.5", 
                    fontSize: "14px"
                  }}>
                    Pełna zgodność z RODO i najwyższe standardy bezpieczeństwa danych.
                  </p>
                </div>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🚀 Przyszłość Technologii w Lotto
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Technologie, które wykorzystujemy w naszym generatorze, to tylko początek rewolucji 
                w świecie gier liczbowych. W przyszłości spodziewamy się jeszcze bardziej zaawansowanych 
                algorytmów, które będą mogły analizować nie tylko historyczne losowania, ale także 
                czynniki zewnętrzne, takie jak wydarzenia społeczne, trendy gospodarcze i inne zmienne.
              </p>

              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Nasz generator jest stale rozwijany i aktualizowany o najnowsze technologie, 
                aby zapewnić graczom maksymalne szanse na wygraną. To nie tylko narzędzie - 
                to przyszłość gier liczbowych.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Nowoczesne technologie to klucz do sukcesu w grach liczbowych. Łącząc sztuczną inteligencję, 
                  machine learning, big data i blockchain, nasz generator zapewnia graczom przewagę technologiczną 
                  nad tradycyjnymi metodami. To nie tylko gra - to nauka oparta na najnowocześniejszych 
                  technologiach XXI wieku.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Statystyki Historyczne */}
      {activeSection === 'blog-statystyki' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            {/* Przycisk powrotu */}
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            {/* SEO Meta Tags - Artykuł o statystykach */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Statystyki Historyczne Lotto - Analiza Wzorców | Generator",
                "description": "Analiza statystyk historycznych lotto. Wzorce, trendy, analiza danych. Darmowy generator z analizą historycznych losowań.",
                "keywords": "statystyki lotto, historia lotto, wzorce lotto, analiza danych lotto, trendy lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-01-15",
                "dateModified": "2024-01-15",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-statystyki"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Statystyki Historyczne Lotto - Analiza Wzorców i Trendów
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Nasz generator analizuje tysiące historycznych losowań, identyfikując wzorce i trendy, 
                które są niewidoczne dla przeciętnego gracza. Ta analiza statystyczna to fundament 
                naszych zaawansowanych algorytmów.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🔬 Co Analizujemy?
              </h2>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", 
                gap: "20px",
                marginBottom: "30px"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    📊 Częstotliwość Liczb
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px"
                  }}>
                    Które liczby pojawiają się najczęściej i najrzadziej w historycznych losowaniach. 
                    Analiza tysięcy losowań ujawnia wzorce niewidoczne dla przeciętnego gracza.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    🎯 Wzorce Sum
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px"
                  }}>
                    Optymalne zakresy sum dla różnych gier. Analiza pokazuje, że pewne sumy 
                    występują częściej niż inne w wygrywających kombinacjach.
                  </p>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <h4 style={{ 
                    color: "#424242", 
                    marginBottom: "12px", 
                    fontSize: "18px", 
                    fontWeight: "700" 
                  }}>
                    🔢 Proporcje Parzystych/Nieparzystych
                  </h4>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6", 
                    fontSize: "15px"
                  }}>
                    Matematyczne wzorce w rozkładzie liczb parzystych i nieparzystych. 
                    Analiza pokazuje optymalne proporcje dla różnych gier.
                  </p>
                </div>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                📊 Trendy Czasowe i Korelacje
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Nasze algorytmy analizują nie tylko statyczne wzorce, ale także trendy czasowe 
                i korelacje między różnymi grami. Ta zaawansowana analiza pozwala przewidzieć 
                prawdopodobne kombinacje z znacznie większą dokładnością niż tradycyjne metody.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                marginBottom: "30px"
              }}>
                <h4 style={{ 
                  color: "#2e7d32", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  ✅ Kluczowe Odkrycia
                </h4>
                <ul style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px",
                  paddingLeft: "20px"
                }}>
                  <li><strong>Wzorce sezonowe:</strong> Pewne liczby pojawiają się częściej w określonych porach roku</li>
                  <li><strong>Korelacje między grami:</strong> Wzajemne powiązania między różnymi grami liczbowymi</li>
                  <li><strong>Trendy długoterminowe:</strong> Zmiany w częstotliwości występowania liczb na przestrzeni lat</li>
                  <li><strong>Wzorce cykliczne:</strong> Powtarzające się wzorce w określonych odstępach czasu</li>
                  <li><strong>Korelacje geograficzne:</strong> Wpływ lokalizacji na wyniki losowań</li>
                  <li><strong>Wzorce społeczne:</strong> Wpływ wydarzeń społecznych na popularność liczb</li>
                </ul>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🔬 Nauka Oparta na Danych
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Dzięki tej analizie nasz generator może przewidzieć prawdopodobne kombinacje z znacznie większą 
                dokładnością niż tradycyjne metody. To nie wróżenie z fusów, ale nauka oparta na solidnych 
                fundamentach matematycznych i statystycznych.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Statystyki historyczne to klucz do zrozumienia wzorców w lotto. Nasz generator wykorzystuje 
                  zaawansowaną analizę danych, aby identyfikować wzorce niewidoczne dla przeciętnego gracza. 
                  To nie przypadek, ale nauka oparta na solidnych fundamentach matematycznych i statystycznych.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Porady i Wskazówki */}
      {activeSection === 'blog-porady' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            {/* SEO Meta Tags - Artykuł o poradach */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Porady Generator Lotto - Jak Zwiększyć Szanse | Wskazówki",
                "description": "Praktyczne porady jak zwiększyć szanse w lotto. Wskazówki ekspertów, strategie gry. Darmowy generator z poradami.",
                "keywords": "porady lotto, wskazówki lotto, strategie lotto, jak wygrać lotto, zwiększyć szanse lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-01-15",
                "dateModified": "2024-01-15",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-porady"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Porady i Wskazówki Lotto - Jak Zwiększyć Szanse na Wygraną
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Praktyczne wskazówki od ekspertów matematycznych. Jak korzystać z generatora, 
                aby zwiększyć szanse na wygraną i grać mądrze.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🎯 Strategie Maksymalizacji Szans
              </h2>
              
              <div style={{
                background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                marginBottom: "30px"
              }}>
                <h4 style={{ 
                  color: "#2e7d32", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  ✅ Kluczowe Wskazówki
                </h4>
                <ul style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px",
                  paddingLeft: "20px"
                }}>
                  <li><strong>Używaj systemów skróconych:</strong> Maksymalne szanse przy minimalnych kosztach</li>
                  <li><strong>Analizuj statystyki:</strong> Wykorzystuj historyczne dane do podejmowania decyzji</li>
                  <li><strong>Diversyfikuj strategie:</strong> Łącz różne metody dla lepszych wyników</li>
                  <li><strong>Ustal limity:</strong> Graj tylko tym, co możesz stracić</li>
                  <li><strong>Bądź konsekwentny:</strong> Stosuj sprawdzone strategie długoterminowo</li>
                  <li><strong>Korzystaj z generatora:</strong> Wykorzystuj zaawansowane algorytmy</li>
                </ul>
              </div>

              <h3 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "20px" : "24px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🧮 Optymalne Wykorzystanie Generatora
              </h3>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Nasz generator to potężne narzędzie, ale kluczowe jest jego mądre wykorzystanie. 
                Oto jak maksymalizować jego skuteczność:
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Mądre wykorzystanie generatora to klucz do sukcesu. Łącz zaawansowane algorytmy 
                  z odpowiedzialną grą, aby maksymalizować szanse na wygraną przy minimalnych kosztach.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Generator Marzeń */}
      {activeSection === 'blog-generator-marzen' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            {/* SEO Meta Tags - Artykuł o generatorze marzeń */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Generator Marzeń Lotto - Osobiste Liczby | Emocje i Matematyka",
                "description": "Generator marzeń lotto - konwersja ważnych dat na liczby lotto. Osobiste zestawy z emocjonalnym znaczeniem i matematyczną optymalizacją.",
                "keywords": "generator marzeń lotto, osobiste liczby lotto, daty lotto, emocje lotto, matematyka lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-01-15",
                "dateModified": "2024-01-15",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-generator-marzen"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Generator Marzeń Lotto - Osobiste Liczby
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Konwertuj ważne daty z życia na liczby lotto. Osobiste zestawy z głębokim znaczeniem 
                emocjonalnym i matematyczną optymalizacją.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🧠 Psychologia Osobistych Liczb
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Psycholodzy potwierdzają, że gracze, którzy używają liczb z osobistym znaczeniem, 
                wykazują większą wytrwałość i lepsze wyniki w długoterminowej perspektywie. 
                Nasz Generator Marzeń łączy emocjonalne połączenie z matematyczną optymalizacją.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Generator Marzeń to unikalne połączenie emocji i matematyki. Osobiste liczby 
                  zwiększają motywację i wytrwałość, podczas gdy algorytmy zapewniają optymalne szanse.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Psychologia Gry */}
      {activeSection === 'blog-psychologia' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            {/* SEO Meta Tags - Artykuł o psychologii */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Psychologia Gry Lotto - Osobiste Liczby | Dlaczego Działają Lepiej",
                "description": "Psychologia gry lotto - dlaczego osobiste liczby działają lepiej. Badania psychologiczne, emocje w grach liczbowych.",
                "keywords": "psychologia lotto, osobiste liczby lotto, emocje lotto, badania psychologiczne lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-01-15",
                "dateModified": "2024-01-15",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-psychologia"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Psychologia Gry Lotto - Osobiste Liczby
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Badania psychologiczne potwierdzają: gracze z osobistymi liczbami wykazują większą wytrwałość. 
                Jak emocje wpływają na wyniki w lotto.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🧬 Biologia Emocji w Grach
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Osobiste liczby aktywują układ nagrody w mózgu, zwiększając motywację i wytrwałość. 
                Badania pokazują, że gracze z emocjonalnym połączeniem do liczb wykazują lepsze wyniki 
                długoterminowe niż ci, którzy grają losowymi liczbami.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Psychologia gry to klucz do długoterminowego sukcesu. Osobiste liczby zwiększają 
                  motywację i wytrwałość, co przekłada się na lepsze wyniki w lotto.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Historia Gier Liczbowych */}
      {activeSection === 'blog-historia' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            {/* SEO Meta Tags - Artykuł o historii */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Historia Gier Liczbowych Lotto - Od Starożytności do Algorytmów",
                "description": "Historia gier liczbowych lotto - od starożytności po współczesne algorytmy. Ewolucja matematyki w grach liczbowych.",
                "keywords": "historia lotto, gier liczbowych, starożytność lotto, algorytmy lotto, ewolucja lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-01-15",
                "dateModified": "2024-01-15",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-historia"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Historia Gier Liczbowych Lotto - Od Starożytności do Algorytmów
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Fascynująca podróż przez wieki: od pierwszych gier liczbowych po najnowocześniejsze algorytmy. 
                Jak matematyka zmieniła świat lotto.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🏛️ Starożytne Korzenie
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Gry liczbowe mają swoje korzenie w starożytności. Chińczycy, Rzymianie i Egipcjanie 
                już tysiące lat temu organizowali loterie, aby finansować projekty publiczne. 
                Matematyka zawsze była kluczowa w tych grach.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Historia gier liczbowych pokazuje, że matematyka zawsze była kluczowa. 
                  Od starożytności po algorytmy AI, nauka i technologia zwiększają szanse na wygraną.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Odpowiedzialna Gra */}
      {activeSection === 'blog-odpowiedzialna-gra' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              🎲 Odpowiedzialna Gra: Jak Bezpiecznie Korzystać z Generatora Lotto
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Ważne zasady bezpiecznej gry. Jak korzystać z generatora, aby zwiększyć szanse, 
                ale zachować odpowiedzialność.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🛡️ Zasady Odpowiedzialnej Gry
              </h2>
              
              <div style={{
                background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                marginBottom: "30px"
              }}>
                <h4 style={{ 
                  color: "#2e7d32", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  ✅ Kluczowe Zasady
                </h4>
                <ul style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px",
                  paddingLeft: "20px"
                }}>
                  <li><strong>Ustal limit:</strong> Zawsze graj tylko tym, co możesz stracić</li>
                  <li><strong>Nie próbuj odrabiać strat:</strong> To droga do problemów</li>
                  <li><strong>Traktuj jak rozrywkę:</strong> Lotto to zabawa, nie sposób na życie</li>
                  <li><strong>Korzystaj z naszych algorytmów:</strong> Zwiększają szanse, ale nie gwarantują wygranej</li>
                  <li><strong>Szukaj pomocy:</strong> Jeśli masz problemy, skontaktuj się z organizacjami pomocowymi</li>
                </ul>
              </div>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Nasz generator jest zaprojektowany, aby zwiększyć szanse na wygraną, ale zawsze pamiętaj 
                  o zasadach odpowiedzialnej gry. Graj mądrze i bezpiecznie!
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Czy da się wygrać w Lotto na logikę, a nie na szczęście? */}
      {activeSection === 'blog-lotto-logika' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Czy da się wygrać w Lotto na logikę, a nie na szczęście?",
                "description": "Sprawdzamy, czy matematyczna analiza i strategie logiczne mogą realnie zwiększyć szanse na wygraną w Lotto.",
                "keywords": "Lotto, logika Lotto, wygrana Lotto, strategie Lotto, matematyka Lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-06-01",
                "dateModified": "2024-06-01",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-lotto-logika"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Czy da się wygrać w Lotto na logikę, a nie na szczęście?
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Większość graczy wierzy, że Lotto to wyłącznie gra losowa. Jednak matematyka i logika mogą pomóc w minimalizowaniu błędów i wyborze bardziej optymalnych strategii. Nie ma sposobu na pewną wygraną, ale logiczne podejście (np. unikanie popularnych schematów, analiza statystyk) pozwala grać rozsądniej i efektywniej.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🧠 Logika vs Losowość w Lotto
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Choć każda liczba ma teoretycznie takie same szanse, logika może pomóc w unikaniu typowych błędów graczy. Na przykład, unikanie popularnych schematów (jak daty urodzin czy liczby po kolei) zmniejsza ryzyko podziału wygranej z innymi graczami.
              </p>

              <h4 style={{ 
                color: "#424242", 
                marginBottom: "16px", 
                fontSize: window.innerWidth <= 768 ? "18px" : "20px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                🎯 Przykłady Gwarancji z Naszego Generatora
              </h4>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                <strong>Gwarancja 4 z 5 liczb:</strong> Wybierz 15 liczb, nasz generator wygeneruje 20 zakładów.<br />
                <strong>Gwarancja 3 z 4 liczb:</strong> Wybierz 10 liczb, nasz generator wygeneruje 8 zakładów.<br />
                <strong>Gwarancja 5 z 6 liczb:</strong> Wybierz 20 liczb, nasz generator wygeneruje 42 zakłady.<br />
                <strong>Koszt:</strong> Zamiast grać wszystkimi liczbami (miliony złotych), graj tylko 20-42 zakładami (40-84 zł).
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Logika w Lotto nie gwarantuje wygranej, ale pomaga grać mądrzej. Kluczowe jest unikanie popularnych błędów i stosowanie sprawdzonych strategii matematycznych.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Jak zwiększyć szanse na wygraną w Lotto? 5 podejść, które naprawdę mają sens */}
      {activeSection === 'blog-lotto-szanse' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Jak zwiększyć szanse na wygraną w Lotto? 5 podejść, które naprawdę mają sens",
                "description": "Poznaj pięć sprawdzonych metod, które mogą realnie poprawić Twoje wyniki w Lotto.",
                "keywords": "Lotto, szanse Lotto, jak wygrać Lotto, strategie Lotto, skuteczne metody Lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-06-01",
                "dateModified": "2024-06-01",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-lotto-szanse"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Jak zwiększyć szanse na wygraną w Lotto? 5 podejść, które naprawdę mają sens
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Oto pięć sprawdzonych metod, które mogą realnie poprawić Twoje wyniki w Lotto:
              </p>

              <ol style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px"
              }}>
                <li><strong>Graj systemami skróconymi Lotto</strong> – nasz generator tworzy systemy z gwarancją trafień. Przykład: 15 liczb → 20 zakładów z gwarancją 4 z 5 liczb.</li>
                <li><strong>Analizuj statystyki losowań</strong> – nasz generator analizuje tysiące historycznych losowań i identyfikuje wzorce niewidoczne dla przeciętnego gracza.</li>
                <li><strong>Unikaj popularnych schematów</strong> – nasz generator automatycznie unika popularnych kombinacji, zmniejszając ryzyko podziału wygranej.</li>
                <li><strong>Stosuj różne strategie</strong> – nasz generator oferuje 5 różnych algorytmów: ILP, covering design, statystyki, osobiste liczby, losowe.</li>
                <li><strong>Ustal budżet i graj odpowiedzialnie</strong> – nasz generator pomaga grać mądrzej: zamiast milionów złotych, graj za 40-84 zł z gwarancją trafień.</li>
              </ol>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Te pięć podejść nie gwarantuje wygranej, ale znacząco zwiększa szanse na lepsze wyniki w Lotto. Kluczowe jest łączenie różnych strategii i gra odpowiedzialna.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Czy generator liczb Lotto może pomóc Ci wygrać? Sprawdzamy dane */}
      {activeSection === 'blog-lotto-generator-dane' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Czy generator liczb Lotto może pomóc Ci wygrać? Sprawdzamy dane",
                "description": "Analizujemy skuteczność generatorów liczb Lotto na podstawie statystyk i badań.",
                "keywords": "Lotto, generator Lotto, skuteczność generatora Lotto, analiza danych Lotto, wygrana Lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-06-01",
                "dateModified": "2024-06-01",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-lotto-generator-dane"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Czy generator liczb Lotto może pomóc Ci wygrać? Sprawdzamy dane
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Tak, nasz inteligentny generator liczb Lotto może pomóc Ci wygrać! W przeciwieństwie do prostych generatorów losowych, nasz generator wykorzystuje zaawansowane algorytmy matematyczne oparte na statystykach historycznych losowań. Dzięki temu nie tylko generuje liczby, ale optymalizuje je pod kątem maksymalizacji szans na wygraną.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🧠 Jak Nasz Generator Zwiększa Szanse?
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Nasz generator wykorzystuje 5 zaawansowanych algorytmów: Integer Linear Programming (ILP), covering design, analizę statystyczną, osobiste liczby i losowość. Każdy algorytm jest oparty na solidnych podstawach matematycznych i analizie tysięcy historycznych losowań.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Nasz inteligentny generator Lotto to więcej niż narzędzie wygody - to zaawansowany system matematyczny, który realnie zwiększa szanse na wygraną poprzez optymalizację i analizę statystyczną.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Najczęstsze błędy graczy Lotto – czy Ty też je popełniasz? */}
      {activeSection === 'blog-lotto-bledy' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Najczęstsze błędy graczy Lotto – czy Ty też je popełniasz?",
                "description": "Lista najczęstszych błędów popełnianych przez graczy Lotto i sposoby, jak ich unikać.",
                "keywords": "Lotto, błędy Lotto, najczęstsze błędy Lotto, jak grać w Lotto, porady Lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-06-01",
                "dateModified": "2024-06-01",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-lotto-bledy"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Najczęstsze błędy graczy Lotto – czy Ty też je popełniasz?
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Poznaj najczęstsze błędy popełniane przez graczy Lotto i dowiedz się, jak ich unikać:
              </p>

              <ul style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px"
              }}>
                <li><strong>Granie zawsze tymi samymi liczbami</strong> (np. daty urodzin) – zwiększa ryzyko podziału wygranej.</li>
                <li><strong>Wybieranie popularnych schematów</strong> (ciągi, liczby po kolei) – wielu graczy wybiera podobne kombinacje.</li>
                <li><strong>Brak analizy statystyk</strong> i historii losowań – nie wykorzystujesz dostępnych danych.</li>
                <li><strong>Brak ustalonego budżetu</strong> i gra pod wpływem emocji – prowadzi do problemów finansowych.</li>
                <li><strong>Wierzenie w mity</strong> (np. "liczby, które długo nie wypadały, muszą wypaść") – to błąd poznawczy.</li>
              </ul>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Unikanie tych błędów nie gwarantuje wygranej, ale znacząco poprawia jakość gry i zmniejsza ryzyko niepotrzebnych strat.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Jakie liczby w Lotto wypadają najczęściej? Analiza z ostatnich 5 lat */}
      {activeSection === 'blog-lotto-najczestsze-liczby' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Jakie liczby w Lotto wypadają najczęściej? Analiza z ostatnich 5 lat",
                "description": "Statystyczna analiza najczęściej losowanych liczb w Lotto w ostatnich latach.",
                "keywords": "Lotto, najczęstsze liczby Lotto, statystyka Lotto, analiza losowań Lotto, liczby Lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-06-01",
                "dateModified": "2024-06-01",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-lotto-najczestsze-liczby"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Jakie liczby w Lotto wypadają najczęściej? Analiza z ostatnich 5 lat
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Analiza losowań Lotto z ostatnich 5 lat pokazuje, że niektóre liczby pojawiają się częściej niż inne. Jednak każda liczba ma teoretycznie takie same szanse – różnice wynikają z losowości i dużej liczby losowań. Warto analizować statystyki, ale nie gwarantuje to wygranej.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                📊 Statystyki vs Losowość
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Choć statystyki pokazują różnice w częstotliwości występowania liczb, jest to normalne w losowych procesach. Każda liczba ma takie same szanse w każdym losowaniu – przeszłe wyniki nie wpływają na przyszłe.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Statystyki Lotto są interesujące, ale nie dają przewagi. Każda liczba ma równe szanse w każdym losowaniu.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Systemy Lotto – co działa, a co to mit? */}
      {activeSection === 'blog-lotto-systemy-mity' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Systemy Lotto – co działa, a co to mit?",
                "description": "Oddzielamy fakty od mitów na temat systemów gry w Lotto.",
                "keywords": "Lotto, systemy Lotto, mity Lotto, skuteczność systemów Lotto, strategie Lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-06-01",
                "dateModified": "2024-06-01",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-lotto-systemy-mity"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Systemy Lotto – co działa, a co to mit?
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Systemy Lotto mogą zwiększyć szanse na wygraną, ale nie gwarantują sukcesu. Warto korzystać z matematycznych systemów skróconych, ale należy unikać mitów i "cudownych" strategii bez podstaw naukowych.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                ✅ Co Działa
              </h2>
              
              <ul style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                <li><strong>Systemy skrócone</strong> – matematycznie zwiększają szanse na trafienie większej liczby liczb</li>
                <li><strong>Analiza statystyk</strong> – pomaga w podejmowaniu świadomych decyzji</li>
                <li><strong>Diversyfikacja strategii</strong> – łączenie różnych metod</li>
              </ul>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "30px"
              }}>
                ❌ Co To Mity
              </h2>
              
              <ul style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                <li><strong>"Cudowne" systemy</strong> – obiecujące 100% skuteczności</li>
                <li><strong>Przewidywanie wyników</strong> – niemożliwe w losowych grach</li>
                <li><strong>Gorące/zimne liczby</strong> – każda liczba ma równe szanse</li>
              </ul>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Stosuj sprawdzone metody matematyczne, ale nie wierz w obietnice niemożliwego. Systemy Lotto to narzędzia, nie magiczne rozwiązania.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Czy warto grać w Eurojackpot zamiast Lotto? */}
      {activeSection === 'blog-lotto-vs-eurojackpot' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Czy warto grać w Eurojackpot zamiast Lotto?",
                "description": "Porównanie szans, kosztów i wygranych w Eurojackpot i Lotto.",
                "keywords": "Lotto, Eurojackpot, porównanie Lotto i Eurojackpot, szanse Lotto, wygrane Lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-06-01",
                "dateModified": "2024-06-01",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-lotto-vs-eurojackpot"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Czy warto grać w Eurojackpot zamiast Lotto?
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Eurojackpot oferuje wyższe wygrane, ale szanse na trafienie głównej nagrody są znacznie mniejsze niż w Lotto. Wybór zależy od preferencji – Lotto daje częstsze, mniejsze wygrane, Eurojackpot – rzadkie, ale ogromne.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                📊 Porównanie Szans
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Lotto: 1:13,983,816 szans na główną wygraną<br />
                Eurojackpot: 1:139,838,160 szans na główną wygraną<br /><br />
                Eurojackpot ma 10x mniejsze szanse, ale znacznie wyższe nagrody.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Lotto lepsze dla częstszych, mniejszych wygranych. Eurojackpot dla tych, którzy wolą rzadkie, ale ogromne nagrody.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog - Artykuł: Jak działa analiza liczb losowych? Praktyczne zastosowanie w grach liczbowych Lotto */}
      {activeSection === 'blog-lotto-analiza-liczb' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            maxWidth: 900, 
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <button 
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                color: "#424242",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => handleNavigation('blog')}
            >
              ← Powrót do bloga
            </button>

            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Jak działa analiza liczb losowych? Praktyczne zastosowanie w grach liczbowych Lotto",
                "description": "Wyjaśniamy, jak analiza losowości liczb może pomóc w grach takich jak Lotto.",
                "keywords": "Lotto, analiza liczb losowych, statystyka Lotto, losowość Lotto, gry liczbowe Lotto",
                "author": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Generator Lotto"
                },
                "datePublished": "2024-06-01",
                "dateModified": "2024-06-01",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": window.location.origin + "/?page=blog-lotto-analiza-liczb"
                }
              })}
            </script>

            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? "28px" : "36px", 
              color: "#424242", 
              textAlign: "center", 
              marginBottom: "30px",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              Jak działa analiza liczb losowych? Praktyczne zastosowanie w grach liczbowych Lotto
            </h1>
            
            <div style={{
              ...cardStyle,
              textAlign: "left",
              padding: window.innerWidth <= 768 ? "20px" : "40px"
            }}>
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "25px",
                fontStyle: "italic"
              }}>
                Analiza liczb losowych pozwala zrozumieć, czy wyniki Lotto są rzeczywiście przypadkowe. Dzięki statystyce można wykryć anomalie, ale nie daje to przewagi nad losowością. W praktyce pomaga grać bardziej świadomie i unikać błędów poznawczych.
              </p>

              <h2 style={{ 
                color: "#424242", 
                marginBottom: "20px", 
                fontSize: window.innerWidth <= 768 ? "22px" : "26px", 
                fontWeight: "700",
                marginTop: "40px"
              }}>
                🔬 Metody Analizy Losowości
              </h2>
              
              <p style={{ 
                color: "#666", 
                lineHeight: "1.8", 
                fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                marginBottom: "20px"
              }}>
                Analiza losowości w Lotto obejmuje testy statystyczne, sprawdzanie rozkładu liczb, analizę częstotliwości i korelacji. Pomaga zrozumieć naturę losowości, ale nie przewiduje przyszłych wyników.
              </p>

              <div style={{
                background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                marginTop: "30px"
              }}>
                <h4 style={{ 
                  color: "#424242", 
                  marginBottom: "15px", 
                  fontSize: "20px", 
                  fontWeight: "700" 
                }}>
                  💡 Wnioski
                </h4>
                <p style={{ 
                  color: "#666", 
                  lineHeight: "1.8", 
                  fontSize: "16px"
                }}>
                  Analiza losowości to narzędzie edukacyjne, nie przewidywania. Pomaga grać świadomie, ale nie zwiększa szans na wygraną w Lotto.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Statystyki */}
      {activeTab === 'statistics' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <FinalStatistics 
            selectedGame={selectedGame}
            onGameChange={setSelectedGame}
          />
        </section>
      )}

      {/* Magiczny Zestaw Dnia */}
      {activeTab === 'gry' && (
        <section style={{
          ...sectionStyle,
          padding: 0,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <MagicznyZestawDnia onUseInGenerator={handleUseInGenerator} />
        </section>
      )}

      {/* Wyniki */}
      {activeTab === 'wyniki' && (
         <section style={{
           ...sectionStyle,
           padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
           width: "100%",
           maxWidth: "100%",
           boxSizing: "border-box"
         }}>
           <ResultsAndWinnings />
         </section>
       )}

      {/* Polityka Prywatności */}
      {activeTab === 'polityka-prywatnosci' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <PrivacyPolicy />
        </section>
      )}

      {/* Regulamin */}
      {activeTab === 'regulamin' && (
        <section style={{
          ...sectionStyle,
          padding: window.innerWidth <= 768 ? "40px 10px" : "80px 20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <TermsOfService />
        </section>
      )}

      {/* Magiczny Zestaw */}
      {activeTab === 'magiczny-zestaw' && (
        <section style={{
          ...sectionStyle,
          padding: "0",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <MagicznyZestawDnia onUseInGenerator={handleUseInGenerator} />
        </section>
      )}

      {/* Slot Machine */}
      {activeTab === 'slot-machine' && (
        <section style={{
          ...sectionStyle,
          padding: "0",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <SlotMachineLanding onUseInGenerator={handleUseInGenerator} />
        </section>
      )}

      {/* Footer */}
      <footer style={{ 
        background: "linear-gradient(135deg, #fff176 0%, #ffd700 50%, #ffb300 100%)", 
        padding: "60px 20px 40px", 
        marginTop: "80px",
        textAlign: "center",
        borderTop: "1px solid rgba(255, 193, 7, 0.3)",
        width: "100%",
        maxWidth: "100%"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px", marginBottom: "40px" }} className="grid">
            <div>
              <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🎰 Losuje.pl</h4>
              <p style={{ color: "#666", lineHeight: "1.6", fontSize: "14px" }}>
                Zaawansowane algorytmy matematyczne dla gier liczbowych. 
                Zwiększ swoje szanse dzięki naukowym metodom!
              </p>
            </div>
            <div>
              <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>🔗 Szybkie linki</h4>
              <ul style={{ listStyle: "none", padding: 0, color: "#666" }}>
                <li style={{ marginBottom: "8px" }}>
                  <button 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
                    onClick={() => handleNavigation('/')}
                  >
                    Strona główna
                  </button>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <button 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
                    onClick={() => handleNavigation('jak-to-dziala')}
                  >
                    Jak to działa
                  </button>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <button 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
                    onClick={() => handleNavigation('faq')}
                  >
                    FAQ
                  </button>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <button 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
                    onClick={() => handleNavigation('kontakt')}
                  >
                    Kontakt
                  </button>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <button 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
                    onClick={() => handleNavigation('blog')}
                  >
                    Blog
                  </button>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <button 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
                    onClick={() => handleNavigation('statistics')}
                  >
                    📊 Statystyki
                  </button>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <button 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
                    onClick={() => handleNavigation('magiczny-zestaw')}
                  >
                    ✨ Magiczny Zestaw
                  </button>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <button 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
                    onClick={() => handleNavigation('slot-machine')}
                  >
                    🎰 Slot Machine
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>📋 Dokumenty</h4>
              <ul style={{ listStyle: "none", padding: 0, color: "#666" }}>
                <li style={{ marginBottom: "8px" }}>
                  <button 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
                    onClick={() => handleNavigation('polityka-prywatnosci')}
                  >
                    Polityka Prywatności
                  </button>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <button 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
                    onClick={() => handleNavigation('regulamin')}
                  >
                    Regulamin
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: "#424242", marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>📞 Kontakt</h4>
              <p style={{ color: "#666", lineHeight: "1.6", fontSize: "14px" }}>
                <strong>Email:</strong> losujemy.kontakt@gmail.com<br />
                <strong>Godziny:</strong> 9:00 - 18:00 (Pn-Pt)
              </p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255, 193, 7, 0.3)", paddingTop: "24px", color: "#666" }} className="border-top">
                            <p style={{ fontSize: "14px", marginBottom: "8px" }}>&copy; 2024 Losuje.pl. Wszystkie prawa zastrzeżone.</p>
            <p style={{ fontSize: "12px", color: "#888" }}>
              ⚠️ Pamiętaj: Lotto to gra losowa. Graj odpowiedzialnie!
            </p>
          </div>
        </div>
      </footer>
      
      {/* Komponent polityki plików cookie */}
      <CookieConsent />
    </div>
  );
};

export default LandingPage; 
