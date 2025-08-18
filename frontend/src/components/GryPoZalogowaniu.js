import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { checkUserAccess as checkUserAccessFirebase } from '../utils/firebaseAuth';
import { handleAccessError } from '../utils/auth';


const GryPoZalogowaniu = ({ user, userSubscription }) => {
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
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  
  // Nowe stany dla Slot Machine
  const [slotNumbers, setSlotNumbers] = useState([[], [], [], [], [], []]);
  const [isSlotSpinning, setIsSlotSpinning] = useState(false);
  const [slotResults, setSlotResults] = useState([]);
  const [currentReel, setCurrentReel] = useState(0);
  const [showSlotResults, setShowSlotResults] = useState(false);
  
  // Nowe stany dla Magiczne Losowanie
  const [mysticalNumbers, setMysticalNumbers] = useState([]);
  const [isMysticalAnimating, setIsMysticalAnimating] = useState(false);
  const [mysticalParticles, setMysticalParticles] = useState([]);
  const [mysticalGlow, setMysticalGlow] = useState(false);
  
  // Nowy stan dla głównej sekcji
  const [activeSection, setActiveSection] = useState('magic-ball'); // 'magic-ball', 'slot-machine', 'mystical-drawing', 'catch-ball', 'wheel-fortune', 'aim-select'
  
  // Nowe stany dla Złap szczęśliwą kulę
  const [catchBallNumbers, setCatchBallNumbers] = useState([]);
  const [catchBallBalls, setCatchBallBalls] = useState([]);
  const [isCatchBallActive, setIsCatchBallActive] = useState(false);
  
  // Nowe stany dla Kręć Kołem Liczb
  const [wheelNumbers, setWheelNumbers] = useState([]);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  

  

  
  // Sprawdź status dostępu użytkownika
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const accessResult = checkUserAccessFirebase(userSubscription);
        
        if (accessResult) {
          setHasAccess(true);
          setTrialDaysLeft(7); // Domyślnie 7 dni trial
          setIsTrialActive(true);
        } else {
          setHasAccess(false);
          setTrialDaysLeft(0);
          setIsTrialActive(false);
          
          // Pokaż modal płatności
          setShowPaymentModal(true);
        }
      } catch (error) {
        console.error('Błąd sprawdzania dostępu:', error);
        setHasAccess(true); // Domyślnie daj dostęp w przypadku błędu
        setTrialDaysLeft(7);
        setIsTrialActive(true);
      }
    };

    checkAccess();
  }, [userSubscription]);



  // Funkcja resetująca liczby po zmianie gry
  const resetNumbers = () => {
    setNumbers([]);
    setEuroNumbers([]);
    setHasGenerated(false);
    setShowSmoke(false);
    setParticles([]);
    setConfetti([]);
    // Reset slot machine
    setSlotNumbers([[], [], [], [], [], []]);
    setSlotResults([]);
    setShowSlotResults(false);
    setCurrentReel(0);
    // Reset mystical drawing
    setMysticalNumbers([]);
    setIsMysticalAnimating(false);
    setMysticalParticles([]);
    setMysticalGlow(false);
    // Reset nowych gier
    setCatchBallNumbers([]);
    setCatchBallBalls([]);
    setIsCatchBallActive(false);
    setWheelNumbers([]);
    setIsWheelSpinning(false);
    setWheelAngle(0);
    
    // Nie resetuj activeSection - pozwól zostać w aktualnej sekcji
  };

  // Funkcja generująca liczby dla slot machine
  const generateSlotNumbers = (maxNumbers = 6) => {
    const reels = [];
    for (let i = 0; i < maxNumbers; i++) {
      const reelNumbers = [];
      for (let j = 0; j < 20; j++) {
        reelNumbers.push(Math.floor(Math.random() * 49) + 1);
      }
      reels.push(reelNumbers);
    }
    return reels;
  };

  // Funkcja obsługująca animację slot machine
  const handleSlotMachine = async () => {
    if (isSlotSpinning) return;
    
    // Sprawdź czy użytkownik ma dostęp
    if (!hasAccess) {
      setShowPaymentModal(true);
      return;
    }
    
    // Sprawdź dostęp przed wykonaniem akcji
    try {
      const accessResult = checkUserAccessFirebase(userSubscription);
      if (!accessResult) {
        setShowPaymentModal(true);
        return;
      }
    } catch (error) {
      console.error('Błąd sprawdzania dostępu:', error);
      setShowPaymentModal(true);
      return;
    }
    
    setIsSlotSpinning(true);
    setShowSlotResults(false);
    setCurrentReel(0);
    
    // Debug: sprawdź wartość selectedGame
    console.log('Selected Game:', selectedGame);
    
    // Określ ilość kul i zakres w zależności od wybranej gry
    const maxNumbers = selectedGame === 'eurojackpot' ? 7 : 
                      selectedGame === 'mini-lotto' || selectedGame === 'ekstra-pensja' ? 5 :
                      selectedGame === 'multi-multi' || selectedGame === 'keno' ? 10 : 6;
    
    const maxRange = selectedGame === 'eurojackpot' ? 50 : 
                    selectedGame === 'mini-lotto' ? 42 :
                    selectedGame === 'multi-multi' || selectedGame === 'keno' ? 80 :
                    selectedGame === 'ekstra-pensja' ? 35 : 49;
    
    // Debug: sprawdź obliczone wartości
    console.log('Max Numbers:', maxNumbers, 'Max Range:', maxRange);
    
    // Generuj liczby dla każdego bębna
    const newSlotNumbers = generateSlotNumbers(maxNumbers);
    setSlotNumbers(newSlotNumbers);
    
    // Symuluj zatrzymywanie bębnów jeden po drugim
    const finalResults = [];
    for (let i = 0; i < maxNumbers; i++) {
      setTimeout(() => {
        let result;
        
        // Specjalna logika dla Eurojackpot - ostatnie 2 liczby z zakresu 1-12
        if (selectedGame === 'eurojackpot' && i >= 5) {
          result = Math.floor(Math.random() * 12) + 1;
        } else {
          result = Math.floor(Math.random() * maxRange) + 1;
        }
        
        finalResults.push(result);
        setCurrentReel(i + 1);
        
        if (i === maxNumbers - 1) {
          // Ostatni bęben zatrzymał się
          setTimeout(() => {
            setSlotResults(finalResults);
            setShowSlotResults(true);
            setIsSlotSpinning(false);
            playSuccessSound();
            
            // Pokaż konfetti
            setTimeout(() => {
              setConfetti(generateConfetti());
            }, 500);
          }, 1000);
        }
      }, (i + 1) * 800);
    }
  };

  // Funkcja dla Magiczne Losowanie
  const handleMysticalDrawing = async () => {
    if (!hasAccess) {
      setShowPaymentModal(true);
      return;
    }

    if (isMysticalAnimating) return;
    
    // Sprawdź dostęp przed wykonaniem akcji
    try {
      const accessResult = checkUserAccessFirebase(userSubscription);
      if (!accessResult) {
        setShowPaymentModal(true);
        return;
      }
    } catch (error) {
      console.error('Błąd sprawdzania dostępu:', error);
      setShowPaymentModal(true);
      return;
    }

    setIsMysticalAnimating(true);
    setMysticalNumbers([]);
    setMysticalGlow(true);

    // Generuj cząsteczki dymu/światła
    const generateMysticalParticles = () => {
      const particles = [];
      for (let i = 0; i < 30; i++) {
        particles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 6 + 3,
          opacity: Math.random() * 0.9 + 0.1,
          delay: Math.random() * 3,
          color: `hsl(${Math.random() * 120 + 240}, 80%, 70%)` // Fioletowe/niebieskie/cyjanowe odcienie
        });
      }
      setMysticalParticles(particles);
    };

    generateMysticalParticles();

    // Generuj liczby co 0.8-1s z efektem materializacji
    const generateMysticalNumbers = () => {
      const numbers = [];
      const maxNumbers = selectedGame === 'eurojackpot' ? 7 : 
                        selectedGame === 'mini-lotto' || selectedGame === 'ekstra-pensja' ? 5 :
                        selectedGame === 'multi-multi' || selectedGame === 'keno' ? 10 : 6;
      
      const maxRange = selectedGame === 'eurojackpot' ? 50 : 
                      selectedGame === 'mini-lotto' ? 42 :
                      selectedGame === 'multi-multi' || selectedGame === 'keno' ? 80 :
                      selectedGame === 'ekstra-pensja' ? 35 : 49;

      for (let i = 0; i < maxNumbers; i++) {
        setTimeout(() => {
          let randomNumber;
          // Specjalna logika dla Eurojackpot - ostatnie 2 liczby z zakresu 1-12
          if (selectedGame === 'eurojackpot' && i >= 5) {
            randomNumber = Math.floor(Math.random() * 12) + 1;
          } else {
            randomNumber = Math.floor(Math.random() * maxRange) + 1;
          }
          numbers.push(randomNumber);
          setMysticalNumbers([...numbers]);
          
          if (i === maxNumbers - 1) {
            // Ostatnia liczba została wylosowana
            setTimeout(() => {
              setIsMysticalAnimating(false);
              setMysticalGlow(false);
              playSuccessSound();
              generateConfetti();
            }, 1000);
          }
        }, i * 900 + 1000); // Co 900ms + 1s opóźnienia
      }
    };

    setTimeout(generateMysticalNumbers, 2000); // Rozpocznij po 2s
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
  const handleBallClick = async () => {
    if (isAnimating) return;
    
    // Sprawdź czy użytkownik ma dostęp
    if (!hasAccess) {
      setShowPaymentModal(true);
      return;
    }
    
    // Sprawdź dostęp przed wykonaniem akcji
    try {
      const accessResult = checkUserAccessFirebase(userSubscription);
      if (!accessResult) {
        setShowPaymentModal(true);
        return;
      }
    } catch (error) {
      console.error('Błąd sprawdzania dostępu:', error);
      setShowPaymentModal(true);
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

  // Funkcja obsługująca płatność
  const handlePayment = () => {
    // Przekieruj bezpośrednio do strony płatności
    navigate('/payments');
    setShowPaymentModal(false);
  };

  // Modal płatności
  const PaymentModal = () => {
    if (!showPaymentModal) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowPaymentModal(false)}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-2 sm:p-4 md:p-8 max-w-md w-full border border-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">🔒 Dostęp wymagany</h3>
            <p className="text-gray-300 mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">
              Twój okres próbny wygasł. Wykup subskrypcję za 9.99 zł, aby kontynuować korzystanie z wszystkich funkcji.
            </p>
            
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-2 sm:p-3 md:p-4 mb-4 sm:mb-6">
              <h4 className="text-yellow-200 font-bold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">✨ Co otrzymasz:</h4>
              <ul className="text-yellow-100 text-xs sm:text-sm space-y-1">
                <li>• Nieograniczony dostęp do wszystkich gier</li>
                <li>• Zaawansowane statystyki lotto</li>
                <li>• Szczegółowe wyniki i wygrane</li>
                <li>• Aktualizacje w czasie rzeczywistym</li>
                <li>• Wsparcie techniczne</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={handlePayment}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-2 min-h-[36px] sm:min-h-0"
              >
                <span>💳</span>
                <span>Wykup subskrypcję</span>
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-600 text-white font-bold py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg hover:bg-gray-700 transition-all duration-300 text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-2 min-h-[36px] sm:min-h-0"
              >
                <span>❌</span>
                <span>Anuluj</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Funkcja dla Złap szczęśliwą kulę - ULEPSZONA
  const handleCatchBall = async () => {
    if (!hasAccess) {
      setShowPaymentModal(true);
      return;
    }
    
    // Sprawdź dostęp przed wykonaniem akcji
    try {
      const accessResult = checkUserAccessFirebase(userSubscription);
      if (!accessResult) {
        setShowPaymentModal(true);
        return;
      }
    } catch (error) {
      console.error('Błąd sprawdzania dostępu:', error);
      setShowPaymentModal(true);
      return;
    }

    setIsCatchBallActive(true);
    setCatchBallNumbers([]);
    
    // Generuj 25 losowych kul z numerami 1-49 - UKRYTE LICZBY
    const balls = [];
    const usedNumbers = new Set();
    
    for (let i = 0; i < 25; i++) {
      let number;
      do {
        number = Math.floor(Math.random() * 49) + 1;
      } while (usedNumbers.has(number));
      usedNumbers.add(number);
      
      balls.push({
        id: i,
        number: number,
        x: Math.random() * 80 + 10, // 10-90% szerokości
        y: Math.random() * 60 + 20, // 20-80% wysokości
        vx: (Math.random() - 0.5) * 1.5, // Znacznie wolniejsza prędkość X (było 6)
        vy: (Math.random() - 0.5) * 1.5, // Znacznie wolniejsza prędkość Y (było 6)
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        isVisible: true,
        showNumber: false // Liczby ukryte na początku
      });
    }
    
    setCatchBallBalls(balls);
  };

  // Funkcja obsługująca kliknięcie w kulę w grze Złap szczęśliwą kulę - ULEPSZONA
  const handleCatchBallClick = (ballId) => {
    if (catchBallNumbers.length >= 6) return;
    
    const ball = catchBallBalls.find(b => b.id === ballId);
    if (ball && ball.isVisible) {
      // Dodaj numer do zestawu
      setCatchBallNumbers(prev => [...prev, ball.number]);
      
      // Ukryj kulę (nie pokazuj numeru na kuli)
      setCatchBallBalls(prev => prev.map(b => 
        b.id === ballId ? { ...b, isVisible: false } : b
      ));
      
      playClickSound();
      
      // Sprawdź czy wylosowano 6 liczb i pokaż konfetti
      if (catchBallNumbers.length + 1 >= 6) {
        setTimeout(() => {
          // Generuj więcej konfetti
          const moreConfetti = [];
          for (let i = 0; i < 100; i++) { // Więcej konfetti (było 50)
            moreConfetti.push({
              id: i,
              x: Math.random() * 100,
              y: Math.random() * 100,
              color: ['#FFD700', '#FFA500', '#FF6347', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00', '#00FF00', '#FF00FF', '#00FFFF'][Math.floor(Math.random() * 10)],
              size: Math.random() * 12 + 6, // Większe konfetti
              rotation: Math.random() * 360,
              delay: Math.random() * 3
            });
          }
          setConfetti(moreConfetti);
          playSuccessSound();
        }, 500);
      }
    }
  };

  // Funkcja animacji ruchu kul z odbijaniem - NOWA
  useEffect(() => {
    if (!isCatchBallActive || catchBallBalls.length === 0) return;

    const interval = setInterval(() => {
      setCatchBallBalls(prev => prev.map(ball => {
        if (!ball.isVisible) return ball;

        let newX = ball.x + ball.vx;
        let newY = ball.y + ball.vy;
        let newVx = ball.vx;
        let newVy = ball.vy;

        // Odbijanie od krawędzi z delikatnym spowolnieniem
        if (newX <= 5 || newX >= 95) {
          newVx = -ball.vx * 0.95; // Delikatne spowolnienie przy odbiciu
          newX = newX <= 5 ? 5 : 95;
        }
        if (newY <= 5 || newY >= 95) {
          newVy = -ball.vy * 0.95; // Delikatne spowolnienie przy odbiciu
          newY = newY <= 5 ? 5 : 95;
        }

        return {
          ...ball,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy
        };
      }));
    }, 32); // Wolniejsza animacja (30 FPS - było 16)

    return () => clearInterval(interval);
  }, [isCatchBallActive, catchBallBalls.length]);

  // Funkcja dla Kręć Kołem Liczb - ZMODYFIKOWANA
  const handleWheelSpin = async () => {
    if (!hasAccess) {
      setShowPaymentModal(true);
      return;
    }

    if (wheelNumbers.length >= 6) return;
    
    // Sprawdź dostęp przed wykonaniem akcji
    try {
      const accessResult = checkUserAccessFirebase(userSubscription);
      if (!accessResult) {
        setShowPaymentModal(true);
        return;
      }
    } catch (error) {
      console.error('Błąd sprawdzania dostępu:', error);
      setShowPaymentModal(true);
      return;
    }
    
    setIsWheelSpinning(true);
    playClickSound();
    
    // Losuj liczbę 1-49
    const randomNumber = Math.floor(Math.random() * 49) + 1;
    const spinAngle = Math.random() * 360 + 720; // 2-3 pełne obroty
    
    setWheelAngle(spinAngle);
    
    setTimeout(() => {
      setWheelNumbers(prev => [...prev, randomNumber]);
      setIsWheelSpinning(false);
      playSuccessSound();
      
      // Pokaż konfetti po wylosowaniu
      setTimeout(() => {
        setConfetti(generateConfetti());
      }, 500);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modal płatności */}
      <PaymentModal />
      {/* Tło z gwiazdami - DELIKATNIEJSZE */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => ( // Mniej gwiazd (było 50)
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full" // Delikatniejsze (było bg-white)
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1], // Delikatniejsze miganie (było [0.1, 0.8, 0.1])
            }}
            transition={{
              duration: Math.random() * 6 + 4, // Wolniejsze miganie (było 4 + 3)
              repeat: Infinity,
              delay: Math.random() * 4, // Większe opóźnienie (było 3)
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

      <div className="text-center max-w-6xl mx-auto relative z-10 w-full max-w-[500px] mx-auto sm:scale-100 scale-90 min-w-[320px] min-h-[300px] overflow-hidden">
        {/* Status dostępu */}
        {hasAccess ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4"
          >
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 inline-block">
              <p className="text-green-200 text-sm font-medium">
                ✅ Dostęp aktywny - {trialDaysLeft > 0 ? `${trialDaysLeft} dni trial` : 'Plan Premium'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4"
          >
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 inline-block">
              <p className="text-red-200 text-sm font-medium">
                ⚠️ Dostęp wygasł - wymagana płatność 9.99
              </p>
            </div>
          </motion.div>
        )}

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
          className="text-3xl md:text-5xl font-bold text-white mb-8 drop-shadow-lg"
        >
          Pełny zestaw szczęścia
        </motion.h1>

        {/* Główne sekcje - Magic Ball, Slot Machine i Magiczne Losowanie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 mb-6 max-w-6xl mx-auto"

        >
          {/* Sekcja Magic Ball */}
          <motion.div
            className={`bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border-2 transition-all duration-300 cursor-pointer min-h-[120px] flex flex-col justify-between ${
              activeSection === 'magic-ball' 
                ? 'border-yellow-400 scale-105 shadow-lg' 
                : 'border-yellow-300/30 hover:scale-105'
            }`}
            onClick={() => setActiveSection('magic-ball')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <h2 className="text-sm lg:text-base xl:text-lg font-bold text-yellow-200 mb-2 leading-tight">
                🎱 Gra z magiczną kulą
              </h2>
              <p className="text-yellow-100 text-xs lg:text-sm mb-2 leading-relaxed">
                Klasyczne losowanie z animowaną kulą
              </p>
            </div>
            <div className="bg-yellow-500/20 rounded p-2 border border-yellow-400/30">
              <p className="text-yellow-200 text-xs lg:text-sm font-medium">
                {activeSection === 'magic-ball' ? '✅ Aktywna' : '🎯 Kliknij'}
              </p>
            </div>
          </motion.div>

          {/* Sekcja Slot Machine */}
          <motion.div
            className={`bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border-2 transition-all duration-300 cursor-pointer min-h-[120px] flex flex-col justify-between ${
              activeSection === 'slot-machine' 
                ? 'border-purple-400 scale-105 shadow-lg' 
                : 'border-purple-300/30 hover:scale-105'
            }`}
            onClick={() => setActiveSection('slot-machine')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <h2 className="text-sm lg:text-base xl:text-lg font-bold text-purple-200 mb-2 leading-tight">
                🎰 Slot Machine Lotto
              </h2>
              <p className="text-purple-100 text-xs lg:text-sm mb-2 leading-relaxed">
                Jednoręki bandyta z animowanymi bębnami
              </p>
            </div>
            <div className="bg-purple-500/20 rounded p-2 border border-purple-400/30">
              <p className="text-purple-200 text-xs lg:text-sm font-medium">
                {activeSection === 'slot-machine' ? '✅ Aktywna' : '🎰 Kliknij'}
              </p>
            </div>
          </motion.div>

          {/* Sekcja Magiczne Losowanie */}
          <motion.div
            className={`bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg p-4 border-2 transition-all duration-300 cursor-pointer min-h-[120px] flex flex-col justify-between ${
              activeSection === 'mystical-drawing' 
                ? 'border-cyan-400 scale-105 shadow-lg' 
                : 'border-cyan-300/30 hover:scale-105'
            }`}
            onClick={() => setActiveSection('mystical-drawing')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <h2 className="text-sm lg:text-base xl:text-lg font-bold text-cyan-200 mb-2 leading-tight">
                🔮 Magiczne losowanie
              </h2>
              <p className="text-cyan-100 text-xs lg:text-sm mb-2 leading-relaxed">
                Mistyczne materializowanie kul z dymu
              </p>
            </div>
            <div className="bg-cyan-500/20 rounded p-2 border border-cyan-400/30">
              <p className="text-cyan-200 text-xs lg:text-sm font-medium">
                {activeSection === 'mystical-drawing' ? '✅ Aktywna' : '🔮 Kliknij'}
              </p>
            </div>
          </motion.div>

          {/* Sekcja Złap szczęśliwą kulę */}
          <motion.div
            className={`bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border-2 transition-all duration-300 cursor-pointer min-h-[120px] flex flex-col justify-between ${
              activeSection === 'catch-ball' 
                ? 'border-green-400 scale-105 shadow-lg' 
                : 'border-green-300/30 hover:scale-105'
            }`}
            onClick={() => setActiveSection('catch-ball')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <h2 className="text-sm lg:text-base xl:text-lg font-bold text-green-200 mb-2 leading-tight">
                🖱️ Złap szczęśliwą kulę
              </h2>
              <p className="text-green-100 text-xs lg:text-sm mb-2 leading-relaxed">
                Kliknij w poruszające się kule
              </p>
            </div>
            <div className="bg-green-500/20 rounded p-2 border border-green-400/30">
              <p className="text-green-200 text-xs lg:text-sm font-medium">
                {activeSection === 'catch-ball' ? '✅ Aktywna' : '🖱️ Kliknij'}
              </p>
            </div>
          </motion.div>

          {/* Sekcja Kręć Kołem Liczb */}
          <motion.div
            className={`bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg p-4 border-2 transition-all duration-300 cursor-pointer min-h-[120px] flex flex-col justify-between ${
              activeSection === 'wheel-fortune' 
                ? 'border-red-400 scale-105 shadow-lg' 
                : 'border-red-300/30 hover:scale-105'
            }`}
            onClick={() => setActiveSection('wheel-fortune')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <h2 className="text-sm lg:text-base xl:text-lg font-bold text-red-200 mb-2 leading-tight">
                🎡 Kręć Kołem Liczb
              </h2>
              <p className="text-red-100 text-xs lg:text-sm mb-2 leading-relaxed">
                Koło fortuny z liczbami 1-49
              </p>
            </div>
            <div className="bg-red-500/20 rounded p-2 border border-red-400/30">
              <p className="text-red-200 text-xs lg:text-sm font-medium">
                {activeSection === 'wheel-fortune' ? '✅ Aktywna' : '🎡 Kliknij'}
              </p>
            </div>
          </motion.div>




        </motion.div>



        {/* Informacja o wybranej grze */}
        {activeSection === 'magic-ball' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
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
        )}

        {/* Animowana kula - tylko dla Magic Ball */}
        {activeSection === 'magic-ball' && (
          <motion.div
            className="relative mx-auto mb-12 w-full max-w-[500px] mx-auto sm:scale-100 scale-90"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
          {/* Cząsteczki iskier wokół kuli */}
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

          {/* Główna kula */}
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
            {/* Efekt wirujących cząsteczek wewnątrz kuli */}
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

            {/* Liczby w kuli */}
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
          </motion.div>
        </motion.div>
        )}

        {/* Przyciski akcji - ukryte dla Slot Machine */}
        {selectedGame !== 'slot-machine' && (
          <AnimatePresence>
            {activeSection === 'magic-ball' && hasGenerated && numbers.length > 0 && (
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
        )}

        {/* Instrukcja - tylko dla Magic Ball */}
        {activeSection === 'magic-ball' && (
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
        )}

        {/* Sekcja z grami Lotto - tylko dla Magic Ball */}
        {activeSection === 'magic-ball' && (
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
              🎯 Wszystkie gry Lotto
            </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Lotto */}
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
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
                <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
              </div>
            </motion.div>

            {/* Mini Lotto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className={`bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'mini-lotto' ? 'ring-2 ring-green-400 scale-105' : 'hover:scale-105'}`}
              onClick={() => {
                setSelectedGame('mini-lotto');
                resetNumbers();
              }}
            >
              <h3 className="text-xl font-bold text-green-200 mb-2">🍀 Mini Lotto</h3>
              <p className="text-green-100 text-sm mb-3">5 liczb z 42</p>
              <p className="text-green-200/80 text-xs">Mniejsza gra z większymi szansami na wygraną</p>
              <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
              </div>
            </motion.div>

            {/* Multi Multi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.0 }}
              className={`bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg p-6 border border-pink-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'multi-multi' ? 'ring-2 ring-pink-400 scale-105' : 'hover:scale-105'}`}
              onClick={() => {
                setSelectedGame('multi-multi');
                resetNumbers();
              }}
            >
              <h3 className="text-xl font-bold text-pink-200 mb-2">🎲 Multi Multi</h3>
              <p className="text-pink-100 text-sm mb-3">10 liczb z 80</p>
              <p className="text-pink-200/80 text-xs">Wybierz 10 liczb z 80 dostępnych</p>
              <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
              </div>
            </motion.div>

            {/* Ekstra Pensja */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
              className={`bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-lg p-6 border border-indigo-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'ekstra-pensja' ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
              onClick={() => {
                setSelectedGame('ekstra-pensja');
                resetNumbers();
              }}
            >
              <h3 className="text-xl font-bold text-indigo-200 mb-2">💰 Ekstra Pensja</h3>
              <p className="text-indigo-100 text-sm mb-3">5 liczb z 35</p>
              <p className="text-indigo-200/80 text-xs">Gra z gwarantowaną wygraną w każdym losowaniu</p>
              <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
              </div>
            </motion.div>

            {/* Kaskada */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.4 }}
              className={`bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-lg p-6 border border-cyan-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'kaskada' ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-105'}`}
              onClick={() => {
                setSelectedGame('kaskada');
                resetNumbers();
              }}
            >
              <h3 className="text-xl font-bold text-cyan-200 mb-2">🌊 Kaskada</h3>
              <p className="text-cyan-100 text-sm mb-3">6 liczb z 40</p>
              <p className="text-cyan-200/80 text-xs">Gra z rosnącymi nagrodami w kolejnych losowaniach</p>
              <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
              </div>
            </motion.div>

            {/* Keno */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.6 }}
              className={`bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'keno' ? 'ring-2 ring-purple-400 scale-105' : 'hover:scale-105'}`}
              onClick={() => {
                setSelectedGame('keno');
                resetNumbers();
              }}
            >
              <h3 className="text-xl font-bold text-purple-200 mb-2">🎯 Keno</h3>
              <p className="text-purple-100 text-sm mb-3">10 liczb z 80</p>
              <p className="text-purple-200/80 text-xs">Gra podobna do Multi Multi - wybierz 10 liczb</p>
              <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
              </div>
            </motion.div>

            {/* Eurojackpot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.8 }}
              className={`bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg p-6 border border-red-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'eurojackpot' ? 'ring-2 ring-red-400 scale-105' : 'hover:scale-105'}`}
              onClick={() => {
                setSelectedGame('eurojackpot');
                resetNumbers();
              }}
            >
              <h3 className="text-xl font-bold text-red-200 mb-2">🇪🇺 Eurojackpot</h3>
              <p className="text-red-100 text-sm mb-3">5+2 liczb</p>
              <p className="text-red-200/80 text-xs">5 liczb z 50 + 2 Euro liczby z 12</p>
              <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
        )}

        {/* Slot Machine Section - tylko dla Slot Machine */}
        {activeSection === 'slot-machine' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
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

              {/* Przycisk start - bezpośrednio pod bębnami */}
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
                  {isSlotSpinning ? '🎰 Kręci się...' : '🎰 Rozpocznij losowanie'}
                </motion.button>
              </div>

              {/* Sekcja z grami Lotto dla Slot Machine */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
                className="mt-8"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 2.0 }}
                  className="text-xl md:text-2xl font-bold text-purple-200 mb-6 text-center drop-shadow-lg"
                >
                  🎯 Wybierz grę Lotto
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Lotto */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 2.2 }}
                    className={`bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'lotto' ? 'ring-2 ring-yellow-400 scale-105' : 'hover:scale-105'}`}
                    onClick={() => {
                      setSelectedGame('lotto');
                      resetNumbers();
                    }}
                  >
                    <h3 className="text-lg font-bold text-yellow-200 mb-2">🎰 Lotto</h3>
                    <p className="text-yellow-100 text-sm mb-2">6 liczb z 49</p>
                    <p className="text-yellow-200/80 text-xs">Klasyczna gra Lotto - wybierz 6 liczb z zakresu 1-49</p>
                    <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                      <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
                    </div>
                  </motion.div>

                  {/* Mini Lotto */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 2.4 }}
                    className={`bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'mini-lotto' ? 'ring-2 ring-green-400 scale-105' : 'hover:scale-105'}`}
                    onClick={() => {
                      setSelectedGame('mini-lotto');
                      resetNumbers();
                    }}
                  >
                    <h3 className="text-lg font-bold text-green-200 mb-2">🍀 Mini Lotto</h3>
                    <p className="text-green-100 text-sm mb-2">5 liczb z 42</p>
                    <p className="text-green-200/80 text-xs">Mniejsza gra z większymi szansami na wygraną</p>
                    <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                      <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
                    </div>
                  </motion.div>

                  {/* Multi Multi */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 2.6 }}
                    className={`bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg p-4 border border-pink-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'multi-multi' ? 'ring-2 ring-pink-400 scale-105' : 'hover:scale-105'}`}
                    onClick={() => {
                      setSelectedGame('multi-multi');
                      resetNumbers();
                    }}
                  >
                    <h3 className="text-lg font-bold text-pink-200 mb-2">🎲 Multi Multi</h3>
                    <p className="text-pink-100 text-sm mb-2">10 liczb z 80</p>
                    <p className="text-pink-200/80 text-xs">Wybierz 10 liczb z 80 dostępnych</p>
                    <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                      <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
                    </div>
                  </motion.div>

                  {/* Ekstra Pensja */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 2.8 }}
                    className={`bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-lg p-4 border border-indigo-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'ekstra-pensja' ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
                    onClick={() => {
                      setSelectedGame('ekstra-pensja');
                      resetNumbers();
                    }}
                  >
                    <h3 className="text-lg font-bold text-indigo-200 mb-2">💰 Ekstra Pensja</h3>
                    <p className="text-indigo-100 text-sm mb-2">5 liczb z 35</p>
                    <p className="text-indigo-200/80 text-xs">Gra z gwarantowaną wygraną w każdym losowaniu</p>
                    <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                      <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
                    </div>
                  </motion.div>

                  {/* Kaskada */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 3.0 }}
                    className={`bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-lg p-4 border border-cyan-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'kaskada' ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-105'}`}
                    onClick={() => {
                      setSelectedGame('kaskada');
                      resetNumbers();
                    }}
                  >
                    <h3 className="text-lg font-bold text-cyan-200 mb-2">🌊 Kaskada</h3>
                    <p className="text-cyan-100 text-sm mb-2">6 liczb z 40</p>
                    <p className="text-cyan-200/80 text-xs">Gra z rosnącymi nagrodami w kolejnych losowaniach</p>
                    <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                      <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
                    </div>
                  </motion.div>

                  {/* Keno */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 3.2 }}
                    className={`bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'keno' ? 'ring-2 ring-purple-400 scale-105' : 'hover:scale-105'}`}
                    onClick={() => {
                      setSelectedGame('keno');
                      resetNumbers();
                    }}
                  >
                    <h3 className="text-lg font-bold text-purple-200 mb-2">🎯 Keno</h3>
                    <p className="text-purple-100 text-sm mb-2">10 liczb z 80</p>
                    <p className="text-purple-200/80 text-xs">Gra podobna do Multi Multi - wybierz 10 liczb</p>
                    <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                      <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
                    </div>
                  </motion.div>

                  {/* Eurojackpot */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 3.4 }}
                    className={`bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg p-4 border border-red-300/30 backdrop-blur-sm cursor-pointer transition-all duration-300 ${selectedGame === 'eurojackpot' ? 'ring-2 ring-red-400 scale-105' : 'hover:scale-105'}`}
                    onClick={() => {
                      setSelectedGame('eurojackpot');
                      resetNumbers();
                    }}
                  >
                    <h3 className="text-lg font-bold text-red-200 mb-2">🇪🇺 Eurojackpot</h3>
                    <p className="text-red-100 text-sm mb-2">5+2 liczb</p>
                    <p className="text-red-200/80 text-xs">5 liczb z 50 + 2 Euro liczby z 12</p>
                    <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-400/30">
                      <p className="text-green-200 text-xs font-medium">✅ Dostępne</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>



              {/* Wyniki */}
              {showSlotResults && slotResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <h4 className="text-xl font-bold text-green-200 mb-3">🎉 Wylosowane liczby:</h4>
                  <div className="flex flex-wrap justify-center gap-3">
                    {slotResults.map((number, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 ${
                          selectedGame === 'eurojackpot' && index >= 5
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300'
                            : 'bg-gradient-to-br from-green-400 to-green-600 border-green-300'
                        }`}
                      >
                        {number}
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    onClick={() => {
                      const numbersText = slotResults.join(', ');
                      navigator.clipboard.writeText(numbersText);
                    }}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📋 Kopiuj liczby
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Magiczne Losowanie Section - tylko dla Mystical Drawing */}
        {activeSection === 'mystical-drawing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mb-8"
          >
            {/* Ciemne tło z animowanym gradientem */}
            <div className="relative min-h-[600px] bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm overflow-hidden">
              
              {/* Animowany dym/światło w tle */}
              <div className="absolute inset-0">
                {mysticalParticles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      width: `${particle.size}px`,
                      height: `${particle.size}px`,
                      background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
                    }}
                    animate={{
                      opacity: [0, particle.opacity, 0],
                      scale: [0, 2, 0],
                      y: [0, -150],
                      x: [0, (Math.random() - 0.5) * 100],
                    }}
                    transition={{
                      duration: 4,
                      delay: particle.delay,
                      ease: "easeOut",
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>

              {/* Główny tytuł */}
              <div className="relative z-10 text-center mb-8">
                <motion.h3 
                  className="text-3xl md:text-4xl font-bold text-white mb-4"
                  animate={{
                    textShadow: ["0 0 20px rgba(255, 255, 255, 0.5)", "0 0 40px rgba(255, 255, 255, 0.8)", "0 0 20px rgba(255, 255, 255, 0.5)"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  🔮 Magiczne Losowanie
                </motion.h3>
                <p className="text-purple-200 text-lg opacity-80">Mistyczne materializowanie liczb z energii kosmosu</p>
              </div>

              {/* Wybór gier */}
              <div className="relative z-10 mb-8">
                <h4 className="text-lg font-semibold text-purple-200 mb-4 text-center">Wybierz grę:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 max-w-5xl mx-auto">
                  {[
                    { id: 'lotto', name: 'Lotto', desc: '6 liczb z 49', color: 'from-blue-500 to-blue-600' },
                    { id: 'mini-lotto', name: 'Mini Lotto', desc: '5 liczb z 42', color: 'from-green-500 to-green-600' },
                    { id: 'multi-multi', name: 'Multi Multi', desc: '10 liczb z 80', color: 'from-purple-500 to-purple-600' },
                    { id: 'ekstra-pensja', name: 'Ekstra Pensja', desc: '5 liczb z 35', color: 'from-yellow-500 to-yellow-600' },
                    { id: 'kaskada', name: 'Kaskada', desc: '6 liczb z 49', color: 'from-red-500 to-red-600' },
                    { id: 'keno', name: 'Keno', desc: '10 liczb z 80', color: 'from-indigo-500 to-indigo-600' },
                    { id: 'eurojackpot', name: 'Eurojackpot', desc: '5 liczb z 50 + 2 Euro', color: 'from-pink-500 to-pink-600' }
                  ].map((game) => (
                    <motion.div
                      key={game.id}
                      onClick={() => {
                        setSelectedGame(game.id);
                        resetNumbers();
                      }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        selectedGame === game.id
                          ? `bg-gradient-to-r ${game.color} border-white shadow-lg`
                          : 'bg-gray-800/50 border-gray-600 hover:border-purple-400 hover:bg-gray-700/50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-center">
                        <div className={`font-bold text-sm ${
                          selectedGame === game.id ? 'text-white' : 'text-gray-300'
                        }`}>
                          {game.name}
                        </div>
                        <div className={`text-xs ${
                          selectedGame === game.id ? 'text-white/80' : 'text-gray-400'
                        }`}>
                          {game.desc}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Obszar materializacji liczb z kosmosu */}
              <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-2xl min-h-[300px] flex items-center justify-center">
                  {isMysticalAnimating ? (
                    <motion.div
                      className="text-purple-200 text-xl font-medium"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [0.95, 1.05, 0.95],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      ✨ Materializowanie z kosmosu...
                    </motion.div>
                  ) : mysticalNumbers.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-3">
                      {mysticalNumbers.map((number, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0, opacity: 0, y: -100, rotate: -180 }}
                          animate={{ 
                            scale: 1, 
                            opacity: 1, 
                            y: 0,
                            rotate: 0,
                            boxShadow: mysticalGlow ? "0 0 30px rgba(168, 85, 247, 0.8)" : "0 0 15px rgba(168, 85, 247, 0.5)"
                          }}
                          transition={{ 
                            duration: 1.2, 
                            delay: index * 0.8,
                            type: "spring",
                            stiffness: 200,
                            damping: 15
                          }}
                          className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-purple-300"
                          whileHover={{ 
                            scale: 1.3, 
                            boxShadow: "0 0 40px rgba(168, 85, 247, 0.9)",
                            rotate: 360
                          }}
                        >
                          {number}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-purple-200 text-xl font-medium cursor-pointer text-center"
                      whileHover={{ scale: 1.05 }}
                      onClick={handleMysticalDrawing}
                    >
                      ✨ Kliknij, aby materializować liczby z kosmosu
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Przycisk start */}
              <div className="text-center mb-6">
                <motion.button
                  onClick={handleMysticalDrawing}
                  disabled={isMysticalAnimating}
                  className={`px-8 py-4 text-xl font-bold rounded-full shadow-lg transition-all duration-300 border-2 ${
                    isMysticalAnimating
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 border-purple-300 hover:scale-105'
                  }`}
                  whileHover={!isMysticalAnimating ? { scale: 1.05 } : {}}
                  whileTap={!isMysticalAnimating ? { scale: 0.95 } : {}}
                >
                  {isMysticalAnimating ? '🔮 Materializowanie...' : '🔮 Rozpocznij mistyczne losowanie'}
                </motion.button>
              </div>

              {/* Wyniki z przyciskiem do generatora */}
              {mysticalNumbers.length > 0 && !isMysticalAnimating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h4 className="text-xl font-bold text-purple-200 mb-4">✨ Wylosowane liczby:</h4>
                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {mysticalNumbers.map((number, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 ${
                          selectedGame === 'eurojackpot' && index >= 5
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300'
                            : 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-300'
                        }`}
                      >
                        {number}
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Przyciski akcji */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      onClick={() => {
                        const numbersText = mysticalNumbers.join(', ');
                        navigator.clipboard.writeText(numbersText);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📋 Kopiuj liczby
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        // Przekierowanie do generatora z wylosowanymi liczbami
                        const numbersText = mysticalNumbers.join(', ');
                        // Tutaj można dodać logikę przekierowania do /generator
                        console.log('Przekierowanie do generatora z liczbami:', numbersText);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎯 Użyj zestawu w generatorze
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Złap szczęśliwą kulę Section - ULEPSZONA */}
        {activeSection === 'catch-ball' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mb-8 w-full max-w-[500px] mx-auto sm:scale-100 scale-90 min-w-[320px] min-h-[300px] overflow-hidden"
          >
            <div className="relative min-h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl p-8 border border-gray-500/30 backdrop-blur-sm overflow-hidden">
              
              {/* Tło z animowanymi cząsteczkami */}
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-green-400/30 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -100],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Główny tytuł */}
              <div className="relative z-10 text-center mb-8">
                <motion.h3 
                  className="text-3xl md:text-4xl font-bold text-green-200 mb-4"
                  animate={{
                    textShadow: ["0 0 20px rgba(34, 197, 94, 0.5)", "0 0 40px rgba(34, 197, 94, 0.8)", "0 0 20px rgba(34, 197, 94, 0.5)"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  🖱️ Złap szczęśliwą kulę
                </motion.h3>
                <p className="text-green-100 text-lg opacity-80">Kliknij w poruszające się kule aby je złapać - liczby pojawią się po wybraniu</p>
              </div>

              {/* Obszar gry */}
              <div className="relative z-10 text-center mb-8">
                {!isCatchBallActive ? (
                  <motion.button
                    onClick={handleCatchBall}
                    className="px-8 py-4 text-xl font-bold rounded-full shadow-lg transition-all duration-300 border-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 border-green-300 hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🖱️ Rozpocznij łapanie kul
                  </motion.button>
                ) : (
                  <div className="relative w-full h-96 bg-gradient-to-br from-green-800/50 to-emerald-800/50 rounded-xl border border-green-400/30 overflow-hidden">
                    {/* Poruszające się kule - ULEPSZONE */}
                    {catchBallBalls.map((ball) => (
                      ball.isVisible && (
                        <motion.div
                          key={ball.id}
                          className="absolute cursor-pointer"
                          style={{
                            left: `${ball.x}%`,
                            top: `${ball.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                          onClick={() => handleCatchBallClick(ball.id)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2"
                            style={{
                              background: ball.color,
                              boxShadow: `0 0 8px ${ball.color}`,
                            }}
                          >
                            {/* Ukryte liczby - pokazują się po kliknięciu */}
                            ?
                          </div>
                        </motion.div>
                      )
                    ))}
                    
                    {/* Licznik złapanych kul */}
                    <div className="absolute top-4 right-4 bg-green-500/80 text-white px-4 py-2 rounded-full font-bold">
                      Złapane: {catchBallNumbers.length}/6
                    </div>
                  </div>
                )}
              </div>

              {/* Konfetti po wylosowaniu 6 liczb */}
              {catchBallNumbers.length >= 6 && confetti.length > 0 && (
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

              {/* Wyniki */}
              {catchBallNumbers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h4 className="text-xl font-bold text-green-200 mb-4">🎯 Złapane liczby:</h4>
                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {catchBallNumbers.map((number, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-green-300"
                      >
                        {number}
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Przyciski akcji */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      onClick={() => {
                        const numbersText = catchBallNumbers.join(', ');
                        navigator.clipboard.writeText(numbersText);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📋 Kopiuj liczby
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        const numbersText = catchBallNumbers.join(', ');
                        console.log('Przekierowanie do generatora z liczbami:', numbersText);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎯 Użyj zestawu w generatorze
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        setCatchBallNumbers([]);
                        setCatchBallBalls([]);
                        setIsCatchBallActive(false);
                        setConfetti([]); // Resetuj konfetti
                        setShowSmoke(false); // Resetuj dym
                        setParticles([]); // Resetuj cząsteczki
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🔄 Resetuj grę
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Kręć Kołem Liczb Section - ZMODYFIKOWANE */}
        {activeSection === 'wheel-fortune' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mb-8 w-full max-w-[500px] mx-auto sm:scale-100 scale-90 min-w-[320px] min-h-[300px] overflow-hidden"
          >
            <div className="relative min-h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl p-8 border border-gray-500/30 backdrop-blur-sm overflow-hidden">
              
              {/* Główny tytuł */}
              <div className="relative z-10 text-center mb-8">
                <motion.h3 
                  className="text-3xl md:text-4xl font-bold text-gray-200 mb-4"
                  animate={{
                    textShadow: ["0 0 20px rgba(239, 68, 68, 0.5)", "0 0 40px rgba(239, 68, 68, 0.8)", "0 0 20px rgba(239, 68, 68, 0.5)"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  🎡 Kręć Kołem Liczb
                </motion.h3>
                <p className="text-gray-100 text-lg opacity-80">Koło fortuny z liczbami 1-49 jak w Lotto</p>
                <p className="text-yellow-200 text-sm mt-2">🎯 Strzałka na środku wskazuje wylosowaną liczbę na górze</p>
              </div>

              {/* Koło fortuny - ZMODYFIKOWANE */}
              <div className="relative z-10 text-center mb-8">
                <div className="relative w-64 h-64 md:w-80 md:h-80 sm:w-56 sm:h-56 xs:w-48 xs:h-48 mx-auto">
                  {/* Koło z liczbami 1-49 */}
                  <motion.div
                    className="w-full h-full rounded-full border-4 border-red-400 relative overflow-hidden"
                    style={{
                      background: 'conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #84cc16, #22c55e, #14b8a6, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #f43f5e, #ef4444)',
                    }}
                    animate={{
                      rotate: isWheelSpinning ? wheelAngle : 0,
                    }}
                    transition={{
                      duration: isWheelSpinning ? 3 : 0,
                      ease: "easeOut",
                    }}
                  >
                    {/* Liczby 1-49 na krawędzi koła - DOKŁADNE POZYCJONOWANIE */}
                    {[...Array(49)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-4 h-4 md:w-6 md:h-6 sm:w-5 sm:h-5 xs:w-4 xs:h-4 bg-white rounded-full flex items-center justify-center text-xs md:text-sm sm:text-xs xs:text-xs font-bold border-2 border-red-300 shadow-lg z-10"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) rotate(${i * (360 / 49)}deg) translateY(-${window.innerWidth < 500 ? '100px' : '120px'})`,
                        }}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </motion.div>
                  
                  {/* Strzałka zawsze na środku wskazująca do góry - NIERUCHOMA */}
                  <motion.div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-40 border-l-transparent border-r-transparent border-b-yellow-400 z-30 shadow-lg"
                    animate={{
                      scale: [1, 1.1, 1],
                      filter: ["drop-shadow(0 0 5px rgba(255, 255, 0, 0.5))", "drop-shadow(0 0 15px rgba(255, 255, 0, 0.8))", "drop-shadow(0 0 5px rgba(255, 255, 0, 0.5))"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  ></motion.div>
                  
                  {/* Dodatkowa strzałka dla lepszej widoczności */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-36 border-l-transparent border-r-transparent border-b-white z-40"></div>
                  
                  {/* Wylosowana liczba na górze - PO WYLOSOWANIU */}
                  {wheelNumbers.length > 0 && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 bg-yellow-400 text-black font-bold text-lg px-3 py-1 rounded-full border-2 border-white shadow-lg z-50">
                      {wheelNumbers[wheelNumbers.length - 1]}
                    </div>
                  )}
                  
                  {/* Środek koła z dodatkowym wskaźnikiem */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg z-50"></div>
                  
                  {/* Dodatkowa strzałka tekstowa na górze */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-lg z-50">⬆️</div>
                </div>
                
                {/* Przycisk kręcenia */}
                <motion.button
                  onClick={handleWheelSpin}
                  disabled={isWheelSpinning || wheelNumbers.length >= 6}
                  className={`mt-8 px-8 py-4 text-xl font-bold rounded-full shadow-lg transition-all duration-300 border-2 ${
                    isWheelSpinning || wheelNumbers.length >= 6
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 border-red-300 hover:scale-105'
                  }`}
                  whileHover={!isWheelSpinning && wheelNumbers.length < 6 ? { scale: 1.05 } : {}}
                  whileTap={!isWheelSpinning && wheelNumbers.length < 6 ? { scale: 0.95 } : {}}
                >
                  {isWheelSpinning ? '🎡 Kręcę...' : wheelNumbers.length >= 6 ? '✅ Wszystkie liczby wylosowane' : '🎡 Kręć kołem'}
                </motion.button>
              </div>

              {/* Wylosowane liczby */}
              {wheelNumbers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h4 className="text-xl font-bold text-red-200 mb-4">🎯 Wylosowane liczby:</h4>
                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {wheelNumbers.map((number, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-red-300"
                      >
                        {number}
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Przyciski akcji */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      onClick={() => {
                        const numbersText = wheelNumbers.join(', ');
                        navigator.clipboard.writeText(numbersText);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📋 Kopiuj liczby
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        const numbersText = wheelNumbers.join(', ');
                        console.log('Przekierowanie do generatora z liczbami:', numbersText);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎯 Użyj zestawu w generatorze
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        setWheelNumbers([]);
                        setIsWheelSpinning(false);
                        setWheelAngle(0);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🔄 Resetuj grę
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}



        {/* USUNIĘTE - Celuj i wybieraj Section */}
        {/* {activeSection === 'aim-select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mb-8"
          >
            ... cała sekcja Celuj i wybieraj została usunięta ...
          </motion.div>
        )} */}

        {/* Dodatkowe informacje SEO */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-12 text-yellow-300 text-xs opacity-60"
        >
          <p>🎰 Pełny generator liczb Lotto | 🎯 Magiczny zestaw dnia | ✨ Animowane losowanie</p>
        </motion.div>
      </div>



      {/* Modal płatności */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-2 sm:p-4 md:p-8 max-w-md w-full border border-purple-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4 text-center">💳 Wymagana płatność</h3>
              <p className="text-gray-300 text-center mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">
                Twój okres próbny wygasł. Aby kontynuować korzystanie z wszystkich generatorów, 
                wymagana jest płatność w wysokości 9.99 PLN.
              </p>
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-2 sm:p-3 md:p-4 mb-4 sm:mb-6">
                <p className="text-purple-200 text-xs sm:text-sm text-center">
                  <span className="font-bold">Cena:</span> 9.99 PLN<br/>
                  <span className="font-bold">Dostęp:</span> Pełny dostęp do wszystkich generatorów<br/>
                  <span className="font-bold">Czas:</span> Bezterminowo<br/>
                  <span className="font-bold">Status:</span> {userSubscription?.subscription_status === 'trial' ? 'Okres próbny wygasł' : 'Brak aktywnej subskrypcji'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                <motion.button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 md:py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-2 min-h-[36px] sm:min-h-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>❌</span>
                  <span>Anuluj</span>
                </motion.button>
                <motion.button
                  onClick={handlePayment}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-colors text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-2 min-h-[36px] sm:min-h-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>💳</span>
                  <span>Zapłać 9.99 PLN</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GryPoZalogowaniu; 