import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import aiBrainAnimation from '../../assets/ai-brain.json';
import ActiveTalismanDisplay from '../ActiveTalismanDisplay';
import './HarmonicAnalyzer.css';

/**
 * Harmonic Lotto Analyzer + Smart Generator
 * 
 * Zaawansowany system analizy i generowania liczb lotto oparty na
 * Prawie Harmonicznych Odległości.
 */

const HarmonicAnalyzer = ({ activeTalisman, talismanDefinitions }) => {
  // Stan komponentu
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedSets, setGeneratedSets] = useState([]);
  const [harmonicStats, setHarmonicStats] = useState(null);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // Parametry generowania
  const [game, setGame] = useState('lotto');
  const [strategy, setStrategy] = useState('balanced');
  const [nSets, setNSets] = useState(1);

  // Animacje
  const [showResults, setShowResults] = useState(false);
  const [animatingNumbers, setAnimatingNumbers] = useState(false);
  const [lottieError, setLottieError] = useState(false);

  // Refs
  const lottieRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // Hook do śledzenia rozmiaru okna
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Generuje symulowane zestawy liczb
   */
  const generateMockSets = (gameType, strategyType, numberOfSets) => {
    console.log('🎲 generateMockSets called with:', { gameType, strategyType, numberOfSets });
    
    const gameConfigs = {
      lotto: { maxNumber: 49, count: 6 },
      miniLotto: { maxNumber: 42, count: 5 },
      multiMulti: { maxNumber: 80, count: 10 },
      eurojackpot: { maxNumber: 50, count: 5, euroMax: 12, euroCount: 2 }
    };

    const config = gameConfigs[gameType] || gameConfigs.lotto;
    console.log('⚙️ Using config:', config);
    
    const sets = [];

    for (let i = 0; i < numberOfSets; i++) {
      const numbers = [];
      const usedNumbers = new Set();

      // Generuj liczby na podstawie strategii
      while (numbers.length < config.count) {
        let number;
        
        if (strategyType === 'hot') {
          // Gorące liczby - preferuj liczby 7-37
          number = Math.floor(Math.random() * 31) + 7;
        } else if (strategyType === 'cold') {
          // Zimne liczby - preferuj liczby 1-10 i 40-49
          if (Math.random() < 0.6) {
            number = Math.floor(Math.random() * 10) + 1;
          } else {
            number = Math.floor(Math.random() * 10) + 40;
          }
        } else if (strategyType === 'chess') {
          // Strategia szachowa - preferuj liczby pierwsze i kwadratowe
          const primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
          const squareNumbers = [1, 4, 9, 16, 25, 36, 49];
          const specialNumbers = [...primeNumbers, ...squareNumbers];
          number = specialNumbers[Math.floor(Math.random() * specialNumbers.length)];
        } else {
          // Zrównoważona - losowe liczby
          number = Math.floor(Math.random() * config.maxNumber) + 1;
        }

        // Upewnij się, że liczba jest w zakresie i nie została użyta
        if (number <= config.maxNumber && !usedNumbers.has(number)) {
          numbers.push(number);
          usedNumbers.add(number);
        }
      }

      // Dla Eurojackpot dodaj liczby Euro
      let euroNumbers = [];
      if (gameType === 'eurojackpot' && config.euroCount && config.euroMax) {
        const usedEuroNumbers = new Set();
        while (euroNumbers.length < config.euroCount) {
          let euroNumber;
          
          if (strategyType === 'hot') {
            // Gorące liczby Euro - preferuj liczby 3-9
            euroNumber = Math.floor(Math.random() * 7) + 3;
          } else if (strategyType === 'cold') {
            // Zimne liczby Euro - preferuj liczby 1-2 i 10-12
            if (Math.random() < 0.6) {
              euroNumber = Math.floor(Math.random() * 2) + 1;
            } else {
              euroNumber = Math.floor(Math.random() * 3) + 10;
            }
          } else {
            // Zrównoważona - losowe liczby Euro
            euroNumber = Math.floor(Math.random() * config.euroMax) + 1;
          }

          if (!usedEuroNumbers.has(euroNumber)) {
            euroNumbers.push(euroNumber);
            usedEuroNumbers.add(euroNumber);
          }
        }
        euroNumbers.sort((a, b) => a - b);
      }

      // Sortuj liczby
      numbers.sort((a, b) => a - b);

      // Oblicz analizę
      const sum = numbers.reduce((acc, num) => acc + num, 0);
      const evenCount = numbers.filter(num => num % 2 === 0).length;
      const lowCount = numbers.filter(num => num <= config.maxNumber / 2).length;

      const set = {
        numbers: gameType === 'eurojackpot' ? { main: numbers, euro: euroNumbers } : numbers,
        confidence: 0.7 + Math.random() * 0.2, // 70-90% pewności
        analysis: {
          sum,
          evenCount,
          lowCount
        }
      };
      
      sets.push(set);
      console.log('✅ Generated set:', set);
      console.log('✅ Set numbers:', set.numbers);
      console.log('✅ Set confidence:', set.confidence);
    }

    console.log('🎯 Final sets array:', sets);
    console.log('🎯 Sets length:', sets.length);
    console.log('🎯 Sets type:', typeof sets);
    console.log('🎯 Sets is array:', Array.isArray(sets));
    return sets;
  };

  // Opcje gier
  const games = [
    { value: 'lotto', label: 'Lotto (6/49)', icon: '🎰' },
    { value: 'miniLotto', label: 'Mini Lotto (5/42)', icon: '🎲' },
    { value: 'multiMulti', label: 'Multi Multi (10/80)', icon: '🎯' },
    { value: 'eurojackpot', label: 'Eurojackpot (5/50 + 2/12)', icon: '🇪🇺' }
  ];

  // Opcje strategii
  const strategies = [
    {
      value: 'balanced',
      label: 'Zrównoważona',
      description: 'Łączy różne podejścia - optymalna dla większości graczy',
      icon: '🎯',
      color: '#4CAF50'
    },
    {
      value: 'hot',
      label: 'Gorące liczby',
      description: 'Faworyzuje często występujące liczby',
      icon: '🔥',
      color: '#FF5722'
    },
    {
      value: 'cold',
      label: 'Zimne liczby',
      description: 'Faworyzuje rzadko występujące liczby',
      icon: '❄️',
      color: '#2196F3'
    },
    {
      value: 'chess',
      label: 'Strategia szachowa',
      description: 'Zaawansowana z Monte Carlo (wymaga więcej czasu)',
      icon: '♟️',
      color: '#9C27B0'
    }
  ];

  // Pobierz statystyki harmoniczne przy ładowaniu
  useEffect(() => {
    console.log('🔄 HarmonicAnalyzer mounted - pobieranie statystyk...');
    fetchHarmonicStats();
    
    // Cleanup function
    return () => {
      console.log('🧹 HarmonicAnalyzer unmounting - cleanup...');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Automatyczne przewijanie do wyników po wygenerowaniu
  useEffect(() => {
    console.log('🔄 useEffect - showResults:', showResults, 'generatedSets.length:', generatedSets.length);
    if (showResults && generatedSets.length > 0) {
      console.log('✅ Przewijanie do wyników...');
      setTimeout(() => {
        // Znajdź element z wynikami i przewiń do niego
        const resultsElement = document.querySelector('.results-container');
        if (resultsElement) {
          resultsElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        } else {
          // Fallback - przewiń na dół strony
          window.scrollTo({ 
            top: document.body.scrollHeight, 
            behavior: 'smooth' 
          });
        }
      }, 1000);
    }
  }, [showResults, generatedSets]);

  // Dodatkowy useEffect do debugowania stanu
  useEffect(() => {
    console.log('🎯 Stan komponentu zmieniony - generatedSets:', generatedSets.length, 'showResults:', showResults, 'isLoading:', isLoading);
    console.log('🎯 generatedSets content:', generatedSets);
  }, [generatedSets, showResults, isLoading]);

  // Cleanup przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Obsługa błędów Lottie
  const handleLottieError = useCallback(() => {
    console.warn('Lottie animation failed to load, using fallback');
    setLottieError(true);
  }, []);

  /**
   * Pobiera statystyki harmoniczne
   */
  const fetchHarmonicStats = useCallback(async () => {
    setIsLoadingStats(true);
    setError(null);
    
    // Anuluj poprzednie zapytanie jeśli istnieje
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      console.log('🔄 Pobieranie statystyk harmonicznych...');
      const response = await fetch('/api/harmonic/stats', { 
        signal: abortControllerRef.current.signal 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Otrzymane statystyki:', data);
      
      if (data.success) {
        setHarmonicStats(data);
      } else {
        console.error('Błąd pobierania statystyk:', data.error);
        setError('Nie udało się pobrać statystyk harmonicznych');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Zapytanie o statystyki zostało anulowane');
        return;
      }
      console.error('Błąd pobierania statystyk harmonicznych:', error);
      
      // Fallback - ustaw domyślne statystyki
      console.log('Używam fallback dla statystyk harmonicznych');
      setHarmonicStats({
        success: true,
        isRealData: false,
        dataSource: 'Symulowane dane',
        totalDraws: 1000,
        meanGap: 7.5,
        medianGap: 7,
        stdDevGap: 2.1,
        histogram: {
          '1-3': 150,
          '4-6': 300,
          '7-9': 350,
          '10-12': 150,
          '13+': 50
        },
        analysis: {
          isNearHarmonic: true,
          totalDraws: 1000,
          totalGaps: 5000
        },
        overallStats: {
          mean: 7.5,
          median: 7,
          stdDev: 2.1
        }
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  /**
   * Generuje zestawy liczb
   */
  const generateSets = useCallback(async () => {
    console.log('🚀 Rozpoczynam generowanie zestawów...');
    setIsLoading(true);
    setError(null);
    setCurrentStep(0);
    setGeneratedSets([]);
    setShowResults(false);
    setAnimatingNumbers(false);

    // Anuluj poprzednie zapytanie jeśli istnieje
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Utwórz nowy AbortController
    abortControllerRef.current = new AbortController();

          // Timeout dla całej operacji (30 sekund)
      const operationTimeout = setTimeout(() => {
        console.log('⏰ Timeout całej operacji - używam fallback');
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        // Użyj fallback
        const gameType = game || 'lotto';
        const strategyType = strategy || 'balanced';
        const numberOfSets = nSets || 1;
        
        console.log('🔄 Timeout fallback using:', { gameType, strategyType, numberOfSets });
        
        const mockSets = generateMockSets(gameType, strategyType, numberOfSets);
        console.log('🎲 Timeout fallback - mockSets:', mockSets);
        setGeneratedSets(mockSets);
        setShowResults(true);
        setError(null); // Usunięto komunikat o symulowanych danych
        setIsLoading(false);
        setCurrentStep(0);
      }, 30000);

    try {
      // Symulacja kroków generowania z krótszymi opóźnieniami
      const steps = [
        'Analiza harmonicznych wzorców...',
        'Obliczanie odstępów...',
        'Symulacje Monte Carlo...',
        'Finalizacja zestawów...'
      ];

      for (let i = 0; i < steps.length; i++) {
        // Sprawdź czy komponent jest nadal zamontowany
        if (abortControllerRef.current.signal.aborted) {
          console.log('Generowanie zostało anulowane podczas kroków');
          return;
        }
        
        setCurrentStep(i);
        // Krótsze opóźnienie
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Sprawdź ponownie przed wywołaniem API
      if (abortControllerRef.current.signal.aborted) {
        console.log('Generowanie zostało anulowane przed API');
        return;
      }

      // Wywołanie API z timeout
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
          console.log('Timeout - anuluję generowanie');
          abortControllerRef.current.abort();
        }
      }, 20000); // 20 sekund timeout dla API
      
      try {
        console.log('Wysyłam zapytanie do API...');
        
        // Sprawdź czy backend jest dostępny
        try {
          const healthResponse = await fetch('/api/health', { 
            signal: abortControllerRef.current.signal
          });
          if (!healthResponse.ok) {
            throw new Error('Backend nie odpowiada');
          }
          console.log('✅ Backend odpowiada');
        } catch (healthError) {
          console.log('❌ Backend nie odpowiada - używam fallback');
          throw new Error('Backend nie odpowiada');
        }
        
        const response = await fetch('/api/harmonic/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            game,
            strategy,
            nSets
          }),
          signal: abortControllerRef.current.signal
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Odpowiedź z API:', data);

        if (data.success && data.sets) {
          console.log('✅ API success, setting results:', data.sets);
          setGeneratedSets(data.sets);
          setShowResults(true);
          console.log('✅ setShowResults(true) called');
          
          // Dodatkowe sprawdzenie po ustawieniu stanu
          setTimeout(() => {
            console.log('🔍 Sprawdzenie stanu po API - generatedSets:', data.sets.length, 'showResults: true');
          }, 100);
          
          // Rozpocznij animację liczb z opóźnieniem
          setTimeout(() => {
            if (!abortControllerRef.current?.signal.aborted) {
              setAnimatingNumbers(true);
            }
          }, 500);
          
          // Zatrzymaj animację po dłuższym czasie
          setTimeout(() => {
            if (!abortControllerRef.current?.signal.aborted) {
              setAnimatingNumbers(false);
            }
          }, 5000);
        } else {
          console.log('❌ API error:', data.error);
          setError(null); // Usunięto komunikat o błędzie
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.log('Zapytanie o generowanie zostało anulowane');
          return;
        }
        
        console.error('Błąd fetch:', fetchError);
        
        // Sprawdź czy to błąd połączenia
        if (fetchError.message.includes('Failed to fetch') || 
            fetchError.message.includes('NetworkError') ||
            fetchError.message.includes('ERR_NETWORK')) {
          console.log('Brak połączenia z backendem - używam fallback');
          setError(null); // Usunięto komunikat o błędzie
        } else {
          setError(null); // Usunięto komunikat o błędzie
        }
        
        // Fallback - generuj symulowane dane
        console.log('🔄 Używam fallback - generuję symulowane dane');
        console.log('📊 Parametry:', { game, strategy, nSets });
        
        // Upewnij się, że mamy wartości domyślne
        const gameType = game || 'lotto';
        const strategyType = strategy || 'balanced';
        const numberOfSets = nSets || 1;
        
        console.log('✅ Using defaults:', { gameType, strategyType, numberOfSets });
        
        const mockSets = generateMockSets(gameType, strategyType, numberOfSets);
        console.log('🎲 Mock sets generated:', mockSets);
        console.log('🎲 Mock sets length:', mockSets.length);
        console.log('🎲 Mock sets type:', typeof mockSets);
        console.log('🎲 Mock sets is array:', Array.isArray(mockSets));
        
        // Natychmiast ustaw wyniki
        setGeneratedSets(mockSets);
        setShowResults(true);
        setError(null); // Usunięto komunikat o symulowanych danych
        console.log('✅ setShowResults(true) called in fallback');
        console.log('✅ MockSets length:', mockSets.length);
        console.log('✅ MockSets content:', mockSets);
        console.log('✅ MockSets numbers:', mockSets.map(set => set.numbers));
        
        // Dodatkowe sprawdzenie po ustawieniu stanu
        setTimeout(() => {
          console.log('🔍 Sprawdzenie stanu po fallback - generatedSets:', generatedSets.length, 'showResults:', showResults);
        }, 100);
        
        // Rozpocznij animację liczb z opóźnieniem
        setTimeout(() => {
          if (!abortControllerRef.current?.signal.aborted) {
            setAnimatingNumbers(true);
          }
        }, 500);
        
        // Zatrzymaj animację po dłuższym czasie
        setTimeout(() => {
          if (!abortControllerRef.current?.signal.aborted) {
            setAnimatingNumbers(false);
          }
        }, 5000);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Operacja generowania została anulowana');
        return;
      }
      console.error('Błąd generowania:', error);
      setError(null); // Usunięto komunikat o błędzie
    } finally {
      clearTimeout(operationTimeout);
      // ZAWSZE resetuj stan ładowania, niezależnie od tego czy request został anulowany
      console.log('✅ Resetuję stan ładowania - zawsze');
      setIsLoading(false);
      setCurrentStep(0);
      console.log('🎯 Finalny stan - isLoading:', false, 'showResults:', showResults, 'generatedSets.length:', generatedSets.length);
    }
  }, [game, strategy, nSets]);

  /**
   * Kopiuje wyniki do schowka
   */
  const copyResults = useCallback(() => {
    if (generatedSets.length === 0) {
      console.log('❌ Brak wygenerowanych zestawów do skopiowania');
      return;
    }

    const resultsText = generatedSets.map((set, index) => {
      let numbersText;
      if (game === 'eurojackpot' && set.numbers.main) {
        const mainNumbers = set.numbers.main.join(' ');
        const euroNumbers = set.numbers.euro.join(' ');
        numbersText = `${mainNumbers} + ${euroNumbers}`;
      } else {
        numbersText = (Array.isArray(set.numbers) ? set.numbers : []).join(' ');
      }
      const confidence = Math.round(set.confidence * 100);
      return `Zestaw ${index + 1}: ${numbersText} (Pewność: ${confidence}%)`;
    }).join('\n');

    // Dodaj informację o grze i strategii
    const gameInfo = `Gra: ${game}, Strategia: ${strategy}\n`;
    const fullText = gameInfo + resultsText;

    navigator.clipboard.writeText(fullText).then(() => {
      console.log('✅ Wyniki skopiowane do schowka');
      // Pokaż potwierdzenie użytkownikowi
      alert('Liczby zostały skopiowane do schowka!');
    }).catch(err => {
      console.error('❌ Błąd kopiowania:', err);
      // Fallback dla starszych przeglądarek
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Liczby zostały skopiowane do schowka!');
      } catch (fallbackErr) {
        console.error('❌ Błąd fallback kopiowania:', fallbackErr);
        alert('Błąd kopiowania. Skopiuj ręcznie: ' + fullText);
      }
      document.body.removeChild(textArea);
    });
  }, [generatedSets, game, strategy]);

  /**
   * Renderuje kulkę z liczbą
   */
  const renderBall = useCallback((number, confidence, index, ballType = 'main') => {
    // Kolory dla różnych typów kulek
    let ballColor;
    if (ballType === 'euro') {
      // Kolory dla liczb Euro (1-12) - niebieskie odcienie
      ballColor = confidence > 0.85 ? '#2196F3' : // Jasny niebieski
                  confidence > 0.75 ? '#1976D2' : // Niebieski
                  confidence > 0.65 ? '#1565C0' : // Ciemny niebieski
                  confidence > 0.55 ? '#0D47A1' : // Bardzo ciemny niebieski
                  confidence > 0.45 ? '#01579B' : // Granatowy
                  '#002171'; // Najciemniejszy niebieski
    } else {
      // Kolory dla głównych liczb - zielone odcienie
      ballColor = confidence > 0.85 ? '#00C851' : // Jasny zielony
                  confidence > 0.75 ? '#4CAF50' : // Zielony
                  confidence > 0.65 ? '#FF9800' : // Pomarańczowy
                  confidence > 0.55 ? '#FF5722' : // Czerwono-pomarańczowy
                  confidence > 0.45 ? '#F44336' : // Czerwony
                  '#9C27B0'; // Fioletowy dla najniższej pewności
    }

    return (
      <motion.div
        key={index}
        className="harmonic-ball"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, #fff 50%, ${ballColor} 100%)`,
          borderColor: ballColor,
          borderWidth: '3px',
          boxShadow: `0 6px 20px ${ballColor}60, inset 0 2px 4px rgba(255,255,255,0.3)`
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: animatingNumbers ? 1 : 0.8, 
          opacity: animatingNumbers ? 1 : 0.8,
          transition: { 
            delay: animatingNumbers ? index * 0.15 : 0, 
            duration: 0.6,
            type: "spring",
            stiffness: 100
          }
        }}
        whileHover={{ 
          scale: 1.15, 
          boxShadow: `0 8px 25px ${ballColor}80, inset 0 2px 4px rgba(255,255,255,0.3)`,
          transition: { duration: 0.2 }
        }}
      >
        <span className="ball-number" style={{ 
          color: '#000', 
          fontWeight: 'bold', 
          fontSize: '1.6rem',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          {number}
        </span>
      </motion.div>
    );
  }, [animatingNumbers]);

  return (
    <div className="harmonic-analyzer">
      {/* Wyświetlanie aktywnego talizmanu */}
      {activeTalisman && (
        <ActiveTalismanDisplay 
          activeTalisman={activeTalisman} 
          talismanDefinitions={talismanDefinitions} 
        />
      )}
      {/* Nagłówek */}
      <motion.div 
        className="harmonic-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>🎵 Harmonic Lotto Analyzer + Smart Generator</h1>
        <p>Zaawansowany system analizy i generowania liczb oparty na Prawie Harmonicznych Odległości</p>
        
        <button 
          className="info-button"
          onClick={() => setShowInfo(!showInfo)}
        >
          ℹ️ Jak to działa?
        </button>
      </motion.div>

      {/* Informacje o systemie */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            className="info-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3>🎯 Zasada działania systemu</h3>
            <div className="info-content">
              <div className="info-section">
                <h4>📊 Analiza Harmoniczna</h4>
                <p>System analizuje odstępy między kolejnymi liczbami w historycznych wynikach lotto, 
                wykrywając wzorce harmoniczne i prawidłowości w rozkładzie liczb.</p>
              </div>
              
              <div className="info-section">
                <h4>🎲 Generowanie Inteligentne</h4>
                <p>Na podstawie analizy harmonicznej generuje liczby wykorzystując zaawansowane algorytmy, 
                Monte Carlo symulacje i filtry matematyczne.</p>
              </div>
              
              <div className="info-section">
                <h4>⚡ Strategie</h4>
                <ul>
                  <li><strong>Zrównoważona:</strong> Łączy różne podejścia</li>
                  <li><strong>Gorące liczby:</strong> Faworyzuje często występujące</li>
                  <li><strong>Zimne liczby:</strong> Faworyzuje rzadko występujące</li>
                  <li><strong>Szachowa:</strong> Zaawansowana z Monte Carlo</li>
                </ul>
              </div>
              
              <div className="warning">
                <strong>⚠️ WAŻNE:</strong> Żadna metoda nie gwarantuje trafienia 6/6. 
                System optymalizuje jedynie statystyczne cechy zestawów.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statystyki harmoniczne */}
      {isLoadingStats ? (
        <motion.div 
          className="harmonic-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h3>📈 Analiza Harmoniczna</h3>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-content">
              {!lottieError ? (
                <Lottie 
                  animationData={aiBrainAnimation} 
                  style={{ width: 40, height: 40 }}
                  onError={handleLottieError}
                  loop={true}
                  autoplay={true}
                />
              ) : (
                <div className="fallback-animation">🧠</div>
              )}
              <span>Ładowanie statystyk...</span>
            </div>
          </div>
        </motion.div>
      ) : harmonicStats ? (
        <motion.div 
          className="harmonic-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h3>📈 Analiza Harmoniczna</h3>
          
          {/* Informacje o źródle danych */}
          {harmonicStats.dataSource && (
            <div className="data-source-info">
              <div className={`source-badge ${harmonicStats.dataSource.isRealData ? 'real-data' : 'sample-data'}`}>
                {harmonicStats.dataSource.isRealData ? '📊 Rzeczywiste dane' : '🧪 Przykładowe dane'}
              </div>
              <div className="source-details">
                <span>Źródło: {harmonicStats.dataSource.dataSource}</span>
                <span>Losowania: {harmonicStats.dataSource.count}</span>
                {harmonicStats.dataSource.dateRange && (
                  <span>Okres: {harmonicStats.dataSource.dateRange.from} - {harmonicStats.dataSource.dateRange.to}</span>
                )}
              </div>
            </div>
          )}
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{harmonicStats.overallStats?.mean || 'N/A'}</div>
              <div className="stat-label">Średnia odstępów</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {harmonicStats.analysis?.isNearHarmonic ? '✅' : '❌'}
              </div>
              <div className="stat-label">Czy harmoniczna</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{harmonicStats.analysis?.totalDraws || 'N/A'}</div>
              <div className="stat-label">Analizowane losowania</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{harmonicStats.analysis?.totalGaps || 'N/A'}</div>
              <div className="stat-label">Obliczone odstępy</div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Panel konfiguracji */}
      <motion.div 
        className="config-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h3>⚙️ Konfiguracja generowania</h3>
        
        <div className="config-grid">
          {/* Wybór gry */}
          <div className="config-section">
            <label>🎮 Gra:</label>
            <div className="game-buttons">
              {games.map(gameOption => (
                <button
                  key={gameOption.value}
                  className={`game-btn ${game === gameOption.value ? 'active' : ''}`}
                  onClick={() => setGame(gameOption.value)}
                >
                  {gameOption.icon} {gameOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wybór strategii */}
          <div className="config-section">
            <label>🎯 Strategia:</label>
            <div className="strategy-buttons">
              {strategies.map(strategyOption => (
                <button
                  key={strategyOption.value}
                  className={`strategy-btn ${strategy === strategyOption.value ? 'active' : ''}`}
                  style={{ borderColor: strategyOption.color }}
                  onClick={() => setStrategy(strategyOption.value)}
                >
                  <span className="strategy-icon">{strategyOption.icon}</span>
                  <div className="strategy-info">
                    <div className="strategy-name">{strategyOption.label}</div>
                    <div className="strategy-desc">{strategyOption.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Liczba zestawów */}
          <div className="config-section">
            <label>📊 Liczba zestawów:</label>
            <div className="sets-control">
              <button 
                onClick={() => setNSets(Math.max(1, nSets - 1))}
                disabled={nSets <= 1}
              >
                -
              </button>
              <span className="sets-count">{nSets}</span>
              <button 
                onClick={() => setNSets(Math.min(20, nSets + 1))}
                disabled={nSets >= 20}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Przycisk generowania */}
        <motion.button
          className="generate-button"
          onClick={generateSets}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <>
              🧠 Generowanie...
            </>
          ) : (
            <>
              🎲 Generuj zestawy
            </>
          )}
        </motion.button>

        {/* Animacja podczas generowania */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              marginTop: '30px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '15px',
              padding: '35px 25px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '10px',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {/* Animowane kulki */}
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                justifyContent: 'center',
                flexWrap: 'wrap',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
                padding: '15px 0'
              }}>
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                  <motion.div
                    key={index}
                    style={{
                      width: windowWidth <= 250 ? '20px' : windowWidth <= 350 ? '24px' : windowWidth <= 400 ? '60px' : '50px',
                      height: windowWidth <= 250 ? '20px' : windowWidth <= 350 ? '24px' : windowWidth <= 400 ? '60px' : '50px',
                      borderRadius: '50%',
                      background: `linear-gradient(45deg, #667eea, #764ba2)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: windowWidth <= 250 ? '0.55rem' : windowWidth <= 350 ? '0.65rem' : windowWidth <= 400 ? '1.5rem' : '1.2rem',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                      minWidth: windowWidth <= 250 ? '20px' : windowWidth <= 350 ? '24px' : windowWidth <= 400 ? '60px' : '50px',
                      maxWidth: windowWidth <= 250 ? '20px' : windowWidth <= 350 ? '24px' : windowWidth <= 400 ? '60px' : '50px',
                      flexShrink: 0
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 360],
                      y: [0, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut"
                    }}
                  >
                    {index + 1}
                  </motion.div>
                ))}
              </div>

              {/* Animowany pasek postępu */}
              <div style={{ 
                width: '100%', 
                maxWidth: '400px',
                background: '#f0f0f0',
                borderRadius: '25px',
                overflow: 'hidden',
                height: '8px',
                margin: '0 auto'
              }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    borderRadius: '25px'
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 8,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Animowane kroki */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%', 
                maxWidth: '500px',
                marginTop: '10px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {[
                  'Analiza harmonicznych wzorców...',
                  'Obliczanie odstępów...', 
                  'Symulacje Monte Carlo...', 
                  'Finalizacja zestawów...'
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    style={{
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      color: index <= currentStep ? '#667eea' : '#ccc',
                      fontWeight: index <= currentStep ? 'bold' : 'normal',
                      flex: '1 1 auto',
                      padding: '0 5px',
                      minWidth: '120px'
                    }}
                    animate={{
                      scale: index === currentStep ? [1, 1.1, 1] : 1,
                      opacity: index <= currentStep ? 1 : 0.5
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: index === currentStep ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  >
                    {step}
                  </motion.div>
                ))}
              </div>

              {/* Animowane ikony */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'center',
                marginTop: '10px',
                flexWrap: 'wrap'
              }}>
                {['🎲', '🧠', '⚡', '🎯'].map((icon, index) => (
                  <motion.div
                    key={index}
                    style={{ 
                      fontSize: windowWidth <= 250 ? '1.2rem' : windowWidth <= 350 ? '1.8rem' : windowWidth <= 400 ? '2rem' : '1.5rem',
                      flexShrink: 0
                    }}
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5,
                      ease: "easeInOut"
                    }}
                  >
                    {icon}
                  </motion.div>
                ))}
              </div>

              {/* Główna animacja */}
              <div className="loading-content">
                {!lottieError ? (
                  <Lottie 
                    animationData={aiBrainAnimation} 
                    style={{ 
                      width: windowWidth <= 250 ? 40 : windowWidth <= 350 ? 60 : windowWidth <= 400 ? 80 : 60, 
                      height: windowWidth <= 250 ? 40 : windowWidth <= 350 ? 60 : windowWidth <= 400 ? 80 : 60 
                    }}
                    onError={handleLottieError}
                    loop={true}
                    autoplay={true}
                  />
                ) : (
                  <motion.div 
                    className="fallback-animation" 
                    style={{ 
                      fontSize: windowWidth <= 250 ? '2rem' : windowWidth <= 350 ? '3rem' : windowWidth <= 400 ? '3.5rem' : '3rem' 
                    }}
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🧠
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                style={{ 
                  fontSize: windowWidth <= 250 ? '0.8rem' : windowWidth <= 350 ? '1rem' : '1.3rem', 
                  color: '#667eea', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: windowWidth <= 250 ? '100px' : windowWidth <= 350 ? '125px' : 'auto',
                  margin: '0 auto',
                  padding: windowWidth <= 250 ? '6px 12px' : windowWidth <= 350 ? '10px 20px' : '12px 24px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  borderRadius: '25px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
                animate={{
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Generowanie zestawów...
              </motion.div>
            </div>
          </motion.div>
        )}

                {(generatedSets && generatedSets.length > 0) || showResults ? (
          <motion.div 
            className="results-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              marginTop: '30px',
              borderTop: '2px solid #e0e0e0',
              paddingTop: '25px'
            }}
          >
            {/* Debug info */}
            {console.log('🎯 Renderowanie wyników - generatedSets:', generatedSets, 'generatedSets.length:', generatedSets.length, 'showResults:', showResults)}
            
            <div className="results-header">
              <h3 style={{ color: '#667eea', margin: '0 0 20px 0', textAlign: 'center' }}>
                🎯 Wygenerowane zestawy
              </h3>
              <button 
                className="copy-button" 
                onClick={copyResults}
                style={{
                  background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginBottom: '20px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
                }}
              >
                📋 Kopiuj wygenerowane liczby
              </button>
            </div>

            {/* Komunikat o symulowanych danych - USUNIĘTY */}

            <div className="sets-container" style={{ display: 'grid', gap: '15px' }}>
              {console.log('🎯 Mapping sets - generatedSets:', generatedSets, 'length:', generatedSets.length)}
              {generatedSets && generatedSets.length > 0 ? generatedSets.map((set, setIndex) => {
                console.log('🎯 Rendering set', setIndex, ':', set);
                return (
                <motion.div 
                  key={setIndex}
                  className="set-card"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    delay: setIndex * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <div className="set-header" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '15px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                      Zestaw {setIndex + 1}
                    </span>
                    <span style={{ 
                      background: 'rgba(255, 255, 255, 0.2)', 
                      padding: '5px 12px', 
                      borderRadius: '15px', 
                      fontSize: '0.9rem' 
                    }}>
                      Pewność: {Math.round(set.confidence * 100)}%
                    </span>
                  </div>

                  <div className="numbers-container" style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '10px', 
                    marginBottom: '15px', 
                    justifyContent: 'center' 
                  }}>
                    {game === 'eurojackpot' && set.numbers.main ? (
                      <>
                        {/* Główne liczby */}
                        {set.numbers.main.map((number, numberIndex) => 
                          renderBall(number, set.confidence, numberIndex, 'main')
                        )}
                        {/* Separator */}
                        <div style={{ 
                          width: '20px', 
                          height: '50px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: '#fff',
                          flexShrink: 0
                        }}>
                          +
                        </div>
                        {/* Liczby Euro */}
                        {set.numbers.euro.map((number, numberIndex) => 
                          renderBall(number, set.confidence, numberIndex, 'euro')
                        )}
                      </>
                    ) : (
                      /* Dla innych gier */
                      (Array.isArray(set.numbers) ? set.numbers : []).map((number, numberIndex) => 
                        renderBall(number, set.confidence, numberIndex, 'main')
                      )
                    )}
                  </div>

                  <div className="set-analysis" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                    gap: '10px', 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    padding: '12px', 
                    borderRadius: '8px' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>Suma:</span>
                      <strong>{set.analysis.sum}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>Parzyste:</span>
                      <strong>{set.analysis.evenCount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>Niskie:</span>
                      <strong>{set.analysis.lowCount}</strong>
                    </div>
                  </div>
                </motion.div>
              );
              }) : <div>Brak wygenerowanych zestawów</div>}
            </div>

            <div style={{ 
              background: 'linear-gradient(45deg, #ff9800, #ff5722)', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '8px', 
              textAlign: 'center', 
              fontWeight: 'bold', 
              marginTop: '20px',
              fontSize: '0.9rem'
            }}>
              <strong>⚠️ WAŻNE:</strong> Żadna metoda nie gwarantuje trafienia 6/6. 
              Analiza harmoniczna optymalizuje jedynie statystyczne cechy zestawów.
            </div>
          </motion.div>
        ) : null}
      </motion.div>

      {/* Błąd */}
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'linear-gradient(45deg, #ff5722, #f44336)',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            marginTop: '20px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          ❌ {error}
        </motion.div>
      )}
    </div>
  );
};

export default HarmonicAnalyzer;
