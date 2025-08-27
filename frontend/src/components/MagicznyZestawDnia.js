import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MagicznyZestawDnia = ({ onUseInGenerator }) => {
  const navigate = useNavigate();
  const [numbers, setNumbers] = useState([]);
  const [euroNumbers, setEuroNumbers] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const [quote] = useState("Los sprzyja odważnym");
  const [particles, setParticles] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [selectedGame, setSelectedGame] = useState('lotto');

  // Funkcja resetująca liczby po zmianie gry
  const resetNumbers = () => {
    setNumbers([]);
    setEuroNumbers([]);
    setHasGenerated(false);
    setShowSmoke(false);
    setParticles([]);
    setConfetti([]);
  };

  // Funkcja generująca unikalne liczby dla różnych gier
  const generateNumbers = (gameType = 'lotto') => {
    const newNumbers = [];
    
    switch (gameType) {
      case 'lotto':
        while (newNumbers.length < 6) {
          const randomNum = Math.floor(Math.random() * 49) + 1;
          if (!newNumbers.includes(randomNum)) {
            newNumbers.push(randomNum);
          }
        }
        break;
      case 'mini-lotto':
        while (newNumbers.length < 5) {
          const randomNum = Math.floor(Math.random() * 42) + 1;
          if (!newNumbers.includes(randomNum)) {
            newNumbers.push(randomNum);
          }
        }
        break;
      case 'multi-multi':
        while (newNumbers.length < 10) {
          const randomNum = Math.floor(Math.random() * 80) + 1;
          if (!newNumbers.includes(randomNum)) {
            newNumbers.push(randomNum);
          }
        }
        break;
      case 'ekstra-pensja':
        while (newNumbers.length < 5) {
          const randomNum = Math.floor(Math.random() * 35) + 1;
          if (!newNumbers.includes(randomNum)) {
            newNumbers.push(randomNum);
          }
        }
        break;
      case 'kaskada':
        while (newNumbers.length < 6) {
          const randomNum = Math.floor(Math.random() * 40) + 1;
          if (!newNumbers.includes(randomNum)) {
            newNumbers.push(randomNum);
          }
        }
        break;
      case 'keno':
        while (newNumbers.length < 10) {
          const randomNum = Math.floor(Math.random() * 80) + 1;
          if (!newNumbers.includes(randomNum)) {
            newNumbers.push(randomNum);
          }
        }
        break;
      case 'eurojackpot':
        // 5 liczb z 50 + 2 liczb z 12
        const mainNumbers = [];
        while (mainNumbers.length < 5) {
          const randomNum = Math.floor(Math.random() * 50) + 1;
          if (!mainNumbers.includes(randomNum)) {
            mainNumbers.push(randomNum);
          }
        }
        const euroNumbers = [];
        while (euroNumbers.length < 2) {
          const randomNum = Math.floor(Math.random() * 12) + 1;
          if (!euroNumbers.includes(randomNum)) {
            euroNumbers.push(randomNum);
          }
        }
        return {
          main: mainNumbers.sort((a, b) => a - b),
          euro: euroNumbers.sort((a, b) => a - b)
        };
      default:
        while (newNumbers.length < 6) {
          const randomNum = Math.floor(Math.random() * 49) + 1;
          if (!newNumbers.includes(randomNum)) {
            newNumbers.push(randomNum);
          }
        }
    }
    
    return newNumbers.sort((a, b) => a - b);
  };

  // Funkcja generująca cząsteczki dymu
  const generateSmokeParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        delay: Math.random() * 2
      });
    }
    return newParticles;
  };

  // Funkcja obsługująca kliknięcie w kulę
  const handleBallClick = () => {
    if (isAnimating) return;
    
    // Sprawdź czy wybrana gra wymaga rejestracji
    if (selectedGame !== 'lotto') {
      // Pokaż informację o rejestracji
      alert('🎯 Ta gra wymaga rejestracji konta! Zarejestruj się, aby uzyskać dostęp do wszystkich generatorów.');
      // Przekieruj do rejestracji
      navigate('/?page=register');
      return;
    }
    
    // Odtwórz dźwięk kliknięcia
    playClickSound();
    
    setIsAnimating(true);
    setNumbers([]);
    setEuroNumbers([]);
    setHasGenerated(false);
    setShowSmoke(false);
    setParticles([]);
    setConfetti([]);
    
    // Symulacja losowania z opóźnieniem
    setTimeout(() => {
      const result = generateNumbers(selectedGame);
      
      if (selectedGame === 'eurojackpot') {
        setNumbers(result.main);
        setEuroNumbers(result.euro);
      } else {
        setNumbers(result);
      }
      
      setHasGenerated(true);
      setIsAnimating(false);
      
      // Odtwórz dźwięk wylosowania
      playSuccessSound();
      
      // Pokaż dym i konfetti po wylosowaniu
      setTimeout(() => {
        setShowSmoke(true);
        setParticles(generateSmokeParticles());
        setConfetti(generateConfetti());
      }, 500);
    }, 2000);
  };

  // Funkcja odtwarzająca dźwięk kliknięcia
  const playClickSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Dźwięk niedostępny:', error);
    }
  };

  // Funkcja odtwarzająca dźwięk sukcesu
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Melodia sukcesu
      const frequencies = [523, 659, 784, 1047]; // C, E, G, C
      const now = audioContext.currentTime;
      
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.2);
      });
    } catch (error) {
      console.log('Dźwięk niedostępny:', error);
    }
  };

  // Funkcja kopiowania wylosowanych liczb
  const copyNumbers = () => {
    let numbersText = '';
    
    if (selectedGame === 'eurojackpot' && euroNumbers.length > 0) {
      numbersText = `Główne: ${numbers.join(', ')} | Euro: ${euroNumbers.join(', ')}`;
    } else if (numbers.length > 0) {
      numbersText = numbers.join(', ');
    }
    
    if (numbersText) {
      navigator.clipboard.writeText(numbersText).then(() => {
        console.log('Liczby skopiowane:', numbersText);
      }).catch(err => {
        console.error('Błąd kopiowania:', err);
      });
    }
  };

  // Funkcja generująca konfetti
  const generateConfetti = () => {
    const confetti = [];
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00'];
    
    for (let i = 0; i < 50; i++) {
      confetti.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        delay: Math.random() * 2
      });
    }
    return confetti;
  };

  // Dodaj meta tagi dla SEO
  useEffect(() => {
    // Dodaj meta tagi dynamicznie
    const metaTags = [
      { name: 'description', content: 'Generator Liczb Lotto AI - Darmowy generator z zaawansowanymi algorytmami matematycznymi. Systemy skrócone, ILP, covering design. Losuj szczęśliwe liczby Lotto z gwarancją trafień.' },
      { name: 'keywords', content: 'generator liczb lotto, generator lotto, darmowy generator lotto, AI generator lotto, systemy skrócone lotto, algorytmy matematyczne lotto, ILP lotto, covering design lotto, szczęśliwe liczby lotto, losowanie lotto' },
      { name: 'author', content: 'Losuje.pl' },
      { property: 'og:title', content: 'Generator Liczb Lotto AI | Darmowy Generator Lotto z Algorytmami Matematycznymi' },
      { property: 'og:description', content: 'Generator Liczb Lotto AI - Darmowy generator z zaawansowanymi algorytmami matematycznymi. Systemy skrócone, ILP, covering design. Losuj szczęśliwe liczby Lotto z gwarancją trafień.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Generator Liczb Lotto AI | Darmowy Generator Lotto z Algorytmami Matematycznymi' },
      { name: 'twitter:description', content: 'Generator Liczb Lotto AI - Darmowy generator z zaawansowanymi algorytmami matematycznymi. Systemy skrócone, ILP, covering design.' }
    ];

    metaTags.forEach(tag => {
      let meta = document.querySelector(`meta[name="${tag.name}"]`) || 
                 document.querySelector(`meta[property="${tag.property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (tag.name) meta.setAttribute('name', tag.name);
        if (tag.property) meta.setAttribute('property', tag.property);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', tag.content);
    });

    return () => {
      // Cleanup meta tagów przy odmontowaniu
      metaTags.forEach(tag => {
        const meta = document.querySelector(`meta[name="${tag.name}"]`) || 
                    document.querySelector(`meta[property="${tag.property}"]`);
        if (meta) meta.remove();
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
             {/* Tło z gwiazdami - tylko przygasanie i rozjaśnianie */}
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

      {/* Cząsteczki dymu */}
      <AnimatePresence>
        {showSmoke && (
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                                 className="absolute bg-gradient-to-r from-yellow-400/50 to-orange-400/50 rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  y: 0,
                  x: 0
                }}
                animate={{ 
                  opacity: [0, particle.opacity, 0],
                  scale: [0, 1, 0],
                  y: [-20, -100],
                  x: [0, (Math.random() - 0.5) * 50]
                }}
                transition={{ 
                  duration: 3,
                  delay: particle.delay,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="text-center max-w-4xl mx-auto relative z-10">
        {/* Cytat dnia */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <p className="text-yellow-200 text-lg md:text-xl italic font-light drop-shadow-lg">
            "{quote}"
          </p>
        </motion.div>

                 {/* Tytuł */}
         <motion.h1
           initial={{ opacity: 0, y: -30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 0.2 }}
                       className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg"
         >
           Dzisiejszy zestaw szczęścia
         </motion.h1>

         {/* Informacja o wybranej grze */}
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="mb-8"
         >
           <p className="text-yellow-300 text-lg md:text-xl font-medium drop-shadow-lg">
             Wybrana gra: {selectedGame === 'lotto' ? '🎰 Lotto' : 
               selectedGame === 'mini-lotto' ? '🍀 Mini Lotto' :
               selectedGame === 'multi-multi' ? '🎲 Multi Multi' :
               selectedGame === 'ekstra-pensja' ? '💰 Ekstra Pensja' :
               selectedGame === 'kaskada' ? '🌊 Kaskada' :
               selectedGame === 'keno' ? '🎯 Keno' :
               selectedGame === 'eurojackpot' ? '🇪🇺 Eurojackpot' : '🎰 Lotto'}
           </p>
         </motion.div>

        {/* Animowana kula */}
        <motion.div
          className="relative mx-auto mb-12"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
           {/* Cząsteczki iskier wokół kuli - żółte i więcej */}
           <div className="absolute inset-0">
             {[...Array(32)].map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                 style={{
                   left: '50%',
                   top: '50%',
                   transform: 'translate(-50%, -50%)',
                 }}
                 animate={{
                   x: [0, Math.cos(i * 11.25 * Math.PI / 180) * 150],
                   y: [0, Math.sin(i * 11.25 * Math.PI / 180) * 150],
                   opacity: [0, 1, 0],
                   scale: [0, 1.5, 0],
                 }}
                 transition={{
                   duration: 2,
                   repeat: Infinity,
                   delay: i * 0.08,
                   ease: "easeInOut"
                 }}
               />
             ))}
           </div>

           {/* Dodatkowe iskry w różnych kierunkach */}
           <div className="absolute inset-0">
             {[...Array(20)].map((_, i) => (
               <motion.div
                 key={`extra-${i}`}
                 className="absolute w-1 h-1 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                 style={{
                   left: '50%',
                   top: '50%',
                   transform: 'translate(-50%, -50%)',
                 }}
                 animate={{
                   x: [0, Math.cos(i * 18 * Math.PI / 180) * 120],
                   y: [0, Math.sin(i * 18 * Math.PI / 180) * 120],
                   opacity: [0, 0.8, 0],
                   scale: [0, 1, 0],
                 }}
                 transition={{
                   duration: 2.5,
                   repeat: Infinity,
                   delay: i * 0.12,
                   ease: "easeInOut"
                 }}
               />
             ))}
           </div>

           
           
           {/* Główna kula - żółta pulsująca */}
           <motion.div
             className="relative w-64 h-64 md:w-80 md:h-80 mx-auto bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full border-2 border-yellow-300 backdrop-blur-sm cursor-pointer shadow-2xl"
             onClick={handleBallClick}
             animate={{
               scale: [1, 1.03, 1],
             }}
             transition={{ 
               duration: 4,
               repeat: Infinity,
               ease: "easeInOut"
             }}
           >
                         {/* Efekt wirujących cząsteczek wewnątrz kuli - żółte */}
             <div className="absolute inset-0">
               {[...Array(16)].map((_, i) => (
                 <motion.div
                   key={i}
                   className="absolute w-2 h-2 bg-yellow-400/50 rounded-full"
                   style={{
                     left: '50%',
                     top: '50%',
                     transform: 'translate(-50%, -50%)',
                   }}
                   animate={{
                     x: [0, Math.cos(i * 22.5 * Math.PI / 180) * 80],
                     y: [0, Math.sin(i * 22.5 * Math.PI / 180) * 80],
                     opacity: [0, 0.8, 0],
                     scale: [0, 1.3, 0],
                   }}
                   transition={{
                     duration: 3,
                     repeat: Infinity,
                     delay: i * 0.15,
                     ease: "easeInOut"
                   }}
                 />
               ))}
             </div>

             {/* Dodatkowe magiczne cząsteczki */}
             <div className="absolute inset-0">
               {[...Array(8)].map((_, i) => (
                 <motion.div
                   key={`magic-${i}`}
                   className="absolute w-1 h-1 bg-white/60 rounded-full"
                   style={{
                     left: '50%',
                     top: '50%',
                     transform: 'translate(-50%, -50%)',
                   }}
                   animate={{
                     x: [0, Math.cos(i * 45 * Math.PI / 180) * 50],
                     y: [0, Math.sin(i * 45 * Math.PI / 180) * 50],
                     opacity: [0, 1, 0],
                     scale: [0, 1.5, 0],
                   }}
                   transition={{
                     duration: 2.5,
                     repeat: Infinity,
                     delay: i * 0.3,
                     ease: "easeInOut"
                   }}
                 />
               ))}
             </div>

             {/* Efekt krystaliczny - dostosowany do żółtego */}
             <motion.div
               className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 via-orange-400/30 to-red-400/30 rounded-full"
               animate={{
                 opacity: [0, 0.6, 0],
                 scale: [0.9, 1.1, 0.9],
               }}
               transition={{
                 duration: 3,
                 repeat: Infinity,
                 ease: "easeInOut",
                 delay: 0.5
               }}
             />

             {/* Dodatkowy efekt pulsujący */}
             <motion.div
               className="absolute inset-4 bg-gradient-to-br from-yellow-200/20 to-orange-300/20 rounded-full"
               animate={{
                 opacity: [0, 0.4, 0],
                 scale: [0.8, 1.2, 0.8],
               }}
               transition={{
                 duration: 2,
                 repeat: Infinity,
                 ease: "easeInOut",
                 delay: 1
               }}
             />

                                                   {/* Liczby w kuli - czarne jak w Lotto */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence>
                  {hasGenerated && numbers.length > 0 ? (
                    <motion.div
                      key="numbers"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="flex flex-col items-center justify-center"
                    >
                      {/* Główne liczby */}
                      <motion.div
                        className={`grid gap-2 md:gap-3 ${
                          selectedGame === 'eurojackpot' ? 'grid-cols-5' :
                          selectedGame === 'mini-lotto' || selectedGame === 'ekstra-pensja' ? 'grid-cols-5' :
                          selectedGame === 'multi-multi' || selectedGame === 'keno' ? 'grid-cols-5' :
                          'grid-cols-3'
                        }`}
                      >
                        {numbers.map((number, index) => (
                          <motion.div
                            key={number}
                            initial={{ opacity: 0, scale: 0, y: 20, rotate: -180 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1, 
                              y: 0,
                              rotate: 0,
                              boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)"
                            }}
                            transition={{ 
                              duration: 0.8, 
                              delay: index * 0.15,
                              type: "spring",
                              stiffness: 200,
                              damping: 15
                            }}
                            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-black font-bold text-sm md:text-base shadow-lg border-2 border-black"
                            whileHover={{ 
                              scale: 1.2, 
                              boxShadow: "0 0 30px rgba(0, 0, 0, 0.5)",
                              rotate: 360
                            }}
                          >
                            {number}
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Euro liczby dla Eurojackpot */}
                      {selectedGame === 'eurojackpot' && euroNumbers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="mt-4"
                        >
                          <p className="text-black/80 text-xs md:text-sm font-medium mb-2">Euro liczby:</p>
                          <div className="flex gap-2 justify-center">
                            {euroNumbers.map((number, index) => (
                              <motion.div
                                key={`euro-${number}`}
                                initial={{ opacity: 0, scale: 0, y: 10 }}
                                animate={{ 
                                  opacity: 1, 
                                  scale: 1, 
                                  y: 0,
                                  boxShadow: "0 0 15px rgba(255, 215, 0, 0.5)"
                                }}
                                transition={{ 
                                  duration: 0.6, 
                                  delay: 0.8 + index * 0.1,
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15
                                }}
                                className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-xs md:text-sm shadow-lg border-2 border-yellow-600"
                                whileHover={{ 
                                  scale: 1.2, 
                                  boxShadow: "0 0 20px rgba(255, 215, 0, 0.7)",
                                  rotate: 360
                                }}
                              >
                                {number}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-black/80 text-lg md:text-xl font-medium drop-shadow-lg"
                    >
                      {isAnimating ? "Losowanie..." : "Kliknij, aby losować"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

                           {/* Konfetti po wylosowaniu */}
              {hasGenerated && numbers.length > 0 && confetti.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {confetti.map((piece) => (
                    <motion.div
                      key={`confetti-${piece.id}`}
                      className="absolute"
                      style={{
                        left: `${piece.x}%`,
                        top: `${piece.y}%`,
                        width: `${piece.size}px`,
                        height: `${piece.size}px`,
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
                        delay: piece.delay,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              )}

                         {/* Efekt iskier podczas animacji - dostosowany do żółtego */}
             {isAnimating && (
               <motion.div
                 className="absolute inset-0"
                 animate={{
                   background: [
                     "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
                     "radial-gradient(circle, rgba(255,193,7,0.4) 0%, transparent 70%)",
                     "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)"
                   ]
                 }}
                 transition={{ duration: 0.8, repeat: Infinity }}
               />
             )}
          </motion.div>
        </motion.div>

        

                                                       {/* Przyciski akcji */}
           <AnimatePresence>
             {hasGenerated && numbers.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
                  onClick={copyNumbers}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-base rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-yellow-300 backdrop-blur-sm"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(255, 193, 7, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  📋 Kopiuj liczby
                </motion.button>
              </div>
            )}
          </AnimatePresence>

         {/* Instrukcja */}
         <motion.p
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.8, delay: 1 }}
           className="text-yellow-200 text-sm md:text-base mt-8 max-w-md mx-auto drop-shadow-lg"
         >
           Kliknij w magiczną kulę, aby otrzymać dzisiejszy zestaw szczęścia. 
           Liczby są generowane specjalnym algorytmem, który uwzględnia 
           wzorce kosmiczne i matematyczne prawdopodobieństwa.
         </motion.p>

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
                     resetNumbers();
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
                     resetNumbers();
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
                     resetNumbers();
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
                     resetNumbers();
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
                     resetNumbers();
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
                     resetNumbers();
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
                     resetNumbers();
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
                  📝 Zarejestruj darmowe konto aby poznać więcej generatorów!
                </motion.button>
             </motion.div>
         </motion.div>

        {/* Dodatkowe informacje SEO */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-12 text-yellow-300 text-xs opacity-60"
        >
          <p>🎰 Darmowy generator liczb Lotto | 🎯 Magiczny zestaw dnia | ✨ Animowane losowanie</p>
        </motion.div>
      </div>
    </div>
  );
};

export default MagicznyZestawDnia; 