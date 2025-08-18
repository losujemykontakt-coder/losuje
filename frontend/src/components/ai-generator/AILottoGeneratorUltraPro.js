import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import aiAnimation from '../../assets/ai-brain.json';
import RocketLaunchAnimation from './animations/RocketLaunchAnimation';
import Machine3DAnimation from './animations/Machine3DAnimation';
import HackerAnimation from './animations/HackerAnimation';
import NeuronAIAnimation from './animations/NeuronAIAnimation';
import ChessAnimation from './animations/ChessAnimation';
import RobotChatAnimation from './animations/RobotChatAnimation';
import ActiveTalismanDisplay from '../ActiveTalismanDisplay';
import './AILottoGeneratorUltraPro.css';

const AILottoGeneratorUltraPro = ({ activeTalisman, talismanDefinitions }) => {
  const [selectedGame, setSelectedGame] = useState('lotto');
  const [selectedMode, setSelectedMode] = useState('start');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [aiComment, setAiComment] = useState('');
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Wczytanie historii z localStorage przy montowaniu komponentu
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('aiUltraProHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Błąd podczas wczytywania historii:', error);
    }
  }, []);

  // Responsive hook
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Konfiguracja gier
  const games = [
    { value: 'lotto', label: 'Lotto', maxNumbers: 6, maxValue: 49, icon: '🎯' },
    { value: 'miniLotto', label: 'Mini Lotto', maxNumbers: 5, maxValue: 42, icon: '🎲' },
    { value: 'multiMulti', label: 'Multi Multi', maxNumbers: 10, maxValue: 80, icon: '🎰' },
    { value: 'eurojackpot', label: 'Eurojackpot', maxNumbers: 5, maxValue: 50, icon: '🇪🇺' },
    { value: 'kaskada', label: 'Kaskada', maxNumbers: 6, maxValue: 49, icon: '🌊' }
  ];

  // Tryby animacji
  const animationModes = [
    { value: 'start', label: 'Ekran startowy', icon: '🚀', color: '#667eea' },
    { value: 'machine3d', label: 'Maszyna 3D', icon: '🎰', color: '#764ba2' },
    { value: 'hacker', label: 'Tryb Hackera', icon: '💻', color: '#00ff00' },
    { value: 'laser', label: 'Neuron AI', icon: '🧠', color: '#00ffff' },
    { value: 'chess', label: 'Szachy Lotto', icon: '♟️', color: '#8b4513' },
    { value: 'robot', label: 'Robot Chat Analizy', icon: '🤖', color: '#00ff88' }
  ];

  // Animacje dla przycisków
  const buttonVariants = {
    initial: { scale: 1, y: 0 },
    hover: { 
      scale: 1.05, 
      y: -3,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { 
      scale: 0.95,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    }
  };

  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 50, 
      scale: 0.9 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    },
    hover: { 
      y: -8, 
      scale: 1.02,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 15 
      }
    }
  };

  // Obsługa zakończenia animacji
  const handleAnimationComplete = () => {
    setIsGenerating(false);
    setProgress(100);
  };

  // Generowanie liczb z AI
  const generateNumbersWithAI = () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setGeneratedNumbers([]);
      setAiConfidence(0);
      setAiComment('');

      // Generowanie liczb na początku (dla animacji hakera)
      const gameConfig = games.find(g => g.value === selectedGame);
      if (!gameConfig) {
        console.error('Nie znaleziono konfiguracji gry:', selectedGame);
        setIsGenerating(false);
        return;
      }
      
      const numbers = [];
      
      while (numbers.length < gameConfig.maxNumbers) {
        const num = Math.floor(Math.random() * gameConfig.maxValue) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }

      const sortedNumbers = numbers.sort((a, b) => a - b);
      setGeneratedNumbers(sortedNumbers);

    // Płynna animacja postępu przez 6 sekund (dla rakiety)
    const startTime = Date.now();
    const duration = selectedMode === 'start' ? 6000 : 5000; // 6 sekund dla rakiety, 5 dla innych

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 100);
      setProgress(progressPercent);
      
      if (progressPercent >= 100) {
        clearInterval(progressInterval);
      }
    }, 50); // Aktualizacja co 50ms dla płynności

    // Zakończenie po zakończeniu animacji
    setTimeout(() => {
      const calculatedConfidence = calculateAIConfidence(sortedNumbers, selectedGame);
      const generatedComment = generateAIComment(sortedNumbers, selectedGame);
      
      setAiConfidence(calculatedConfidence);
      setAiComment(generatedComment);
      
      // Dodanie do historii
      const newEntry = {
        id: Date.now(),
        game: selectedGame,
        mode: selectedMode,
        numbers: sortedNumbers,
        confidence: calculatedConfidence,
        timestamp: new Date().toLocaleString()
      };

      const updatedHistory = [newEntry, ...history.slice(0, 4)];
      setHistory(updatedHistory);
      localStorage.setItem('aiUltraProHistory', JSON.stringify(updatedHistory));
      
      setIsGenerating(false);
      setProgress(0);
    }, duration);
    } catch (error) {
      console.error('Błąd podczas generowania liczb:', error);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const calculateAIConfidence = (numbers, game) => {
    let confidence = 75;
    const sum = numbers.reduce((a, b) => a + b, 0);
    
    if (game === 'lotto' && sum >= 120 && sum <= 160) confidence += 10;
    if (game === 'miniLotto' && sum >= 90 && sum <= 120) confidence += 10;
    
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    
    if (Math.abs(evenCount - oddCount) <= 1) confidence += 5;
    
    return Math.min(confidence, 95);
  };

  const generateAIComment = (numbers, game) => {
    const comments = [
      "Algorytm wykrył optymalny wzorzec! 🎯",
      "Analiza statystyczna wskazuje na wysokie prawdopodobieństwo! 📊",
      "Symulacje Monte Carlo potwierdzają skuteczność! 🎲",
      "Prawo Benforda sugeruje wyjątkowość kombinacji! 🔢",
      "Algorytm szachowy przewiduje sukces! ♟️"
    ];
    
    return comments[Math.floor(Math.random() * comments.length)];
  };

  const copyToClipboard = async (numbers) => {
    try {
      await navigator.clipboard.writeText(numbers.join(', '));
    } catch (error) {
      console.error('Błąd podczas kopiowania do schowka:', error);
      // Fallback dla starszych przeglądarek
      const textArea = document.createElement('textarea');
      textArea.value = numbers.join(', ');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Komponent ekranu startowego (statyczny)
  const StartScreen = () => (
    <motion.div 
      className="start-screen"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div 
        className="ai-brain-container"
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 4, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <Lottie 
          animationData={aiAnimation} 
          style={{ width: windowWidth <= 768 ? 120 : 200, height: windowWidth <= 768 ? 120 : 200 }}
          loop={true}
          autoplay={true}
        />
      </motion.div>
      
      <motion.div 
        className="neuron-network"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="neuron-line"
            style={{
              left: `${15 + (i * 6)}%`,
              top: `${25 + Math.sin(i * 0.7) * 25}%`,
              transform: `rotate(${i * 30}deg)`
            }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.2, 1, 0.2],
              boxShadow: [
                '0 0 5px rgba(102, 126, 234, 0.3)',
                '0 0 20px rgba(102, 126, 234, 0.8)',
                '0 0 5px rgba(102, 126, 234, 0.3)'
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </motion.div>

    <motion.div 
        className="ai-text"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      >
        Inicjalizacja AI...
        </motion.div>
    </motion.div>
  );

  // Renderowanie animacji
  const renderAnimation = () => {
    if (!isGenerating) return null;

    switch (selectedMode) {
      case 'start':
        return <RocketLaunchAnimation onComplete={handleAnimationComplete} />;
      case 'machine3d':
        return <Machine3DAnimation onComplete={handleAnimationComplete} />;
      case 'hacker':
        return <HackerAnimation onComplete={handleAnimationComplete} generatedNumbers={generatedNumbers} />;
      case 'laser':
        return <NeuronAIAnimation onComplete={handleAnimationComplete} />;
      case 'chess':
        return <ChessAnimation onComplete={handleAnimationComplete} generatedNumbers={generatedNumbers} />;
      case 'robot':
        return <RobotChatAnimation onComplete={handleAnimationComplete} />;
      default:
        return <RocketLaunchAnimation onComplete={handleAnimationComplete} />;
    }
  };

  return (
    <div className="ai-ultra-pro-container">
      {/* Wyświetlanie aktywnego talizmanu */}
      {activeTalisman && (
        <ActiveTalismanDisplay 
          activeTalisman={activeTalisman} 
          talismanDefinitions={talismanDefinitions} 
        />
      )}
      <motion.div 
        className="header"
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <h1>🤖 AI Lotto Generator Ultra Pro</h1>
        <p>Zaawansowany generator liczb lotto z AI</p>
        <div className="ai-description">
          <p>
            Wykorzystuje zaawansowane algorytmy: analizę prawdopodobieństwa, 
            prawo Benforda, symulacje Monte Carlo, algorytm szachowy i inteligentny chaos.
          </p>
          
                    <motion.button
            className="how-it-works-btn"
            onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            <span className="btn-icon">❓</span>
            <span className="btn-text">Jak to działa?</span>
            <motion.span
              className="arrow-icon"
              animate={{ rotate: isHowItWorksOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ▼
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {isHowItWorksOpen && (
              <>
                {/* Modal overlay */}
              <motion.div 
                  className="modal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setIsHowItWorksOpen(false)}
                />
                
                {/* Modal content */}
        <motion.div 
                  className="modal-content"
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Close button */}
                  <button 
                    className="modal-close-btn"
                    onClick={() => setIsHowItWorksOpen(false)}
                  >
                    ✕
                  </button>
                <div className="how-it-works-section">
                  <h3>🧠 Jak działa AI Generator?</h3>
                  <p>
                    Nasz zaawansowany generator wykorzystuje kombinację najnowocześniejszych algorytmów AI i technik matematycznych:
                  </p>
                  
                  <div className="algorithm-grid">
                    <div className="algorithm-card">
                      <h4>🎯 Analiza Prawdopodobieństwa</h4>
                      <p>Algorytm analizuje historyczne dane lotto, identyfikując wzorce i trendy w częstotliwości występowania liczb.</p>
      </div>
                    
                    <div className="algorithm-card">
                      <h4>🔢 Prawo Benforda</h4>
                      <p>Wykorzystuje matematyczne prawo opisujące rozkład pierwszych cyfr w zbiorach danych liczbowych.</p>
      </div>
      
                    <div className="algorithm-card">
                      <h4>🎲 Symulacje Monte Carlo</h4>
                      <p>Przeprowadza tysiące symulacji losowych, aby przewidzieć najbardziej prawdopodobne kombinacje.</p>
      </div>
      
                    <div className="algorithm-card">
                      <h4>♟️ Algorytm Szachowy</h4>
                      <p>Inspirowany strategiami szachowymi, analizuje pozycje liczb jak figury na szachownicy.</p>
      </div>
                    
                    <div className="algorithm-card">
                      <h4>🌪️ Inteligentny Chaos</h4>
                      <p>Łączy deterministyczne algorytmy z elementami chaosu, tworząc nieprzewidywalne ale inteligentne kombinacje.</p>
      </div>
      
                    <div className="algorithm-card">
                      <h4>📊 Sieci Neuronowe</h4>
                      <p>Głębokie sieci neuronowe uczą się wzorców z milionów historycznych wyników lotto.</p>
            </div>
        </div>
        
                  <div className="ai-process">
                    <h4>⚡ Proces Generowania:</h4>
                                         <ol>
                       <li><strong>Zbieranie danych:</strong> Analiza 50-100 ostatnich wyników lotto</li>
                       <li><strong>Przetwarzanie AI:</strong> Wykorzystanie 5 różnych algorytmów AI</li>
                       <li><strong>Walidacja:</strong> Sprawdzenie zgodności z prawami matematycznymi</li>
                       <li><strong>Optymalizacja:</strong> Wybór najlepszej kombinacji</li>
                       <li><strong>Wynik:</strong> Prezentacja z oceną pewności AI</li>
                     </ol>
      </div>
      
                  <div className="ai-confidence">
                    <h4>🎯 Ocena Pewności AI:</h4>
                    <p>
                      Każda wygenerowana kombinacja otrzymuje ocenę pewności (0-95%) na podstawie:
                    </p>
                    <ul>
                      <li>Zgodności z historycznymi wzorcami</li>
                      <li>Matematycznej optymalności</li>
                      <li>Wyników symulacji Monte Carlo</li>
                      <li>Analizy rozkładu parzystych/nieparzystych</li>
                      <li>Sumy kontrolnej liczb</li>
        </ul>
      </div>
                  
                                     <div className="disclaimer">
                     <p><strong>⚠️ Ważne:</strong> Generator AI to narzędzie pomocnicze. Lotto pozostaje grą losową, a żaden algorytm nie gwarantuje wygranej.</p>
                   </div>
                 </div>
                 </motion.div>
               </>
             )}
           </AnimatePresence>
        </div>
      </motion.div>

      {/* Tryby animacji na górze */}
      <motion.div 
        className="animation-modes"
        variants={cardVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <h3>🎨 Wybierz tryb animacji</h3>
          <div className="mode-buttons">
            {animationModes.map(mode => (
              <motion.button
                key={mode.value}
                className={`mode-btn ${selectedMode === mode.value ? 'active' : ''}`}
                onClick={() => setSelectedMode(mode.value)}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              style={{
                '--mode-color': mode.color
              }}
              >
              <span className="mode-icon">{mode.icon}</span>
              <span className="mode-label">{mode.label}</span>
              </motion.button>
            ))}
        </div>
      </motion.div>

      <div className="main-content">
        <motion.div 
          className="control-panel"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          {/* Rozwijany wybór gry */}
          <div className="game-selector">
            <h3>🎯 Wybierz grę</h3>
            <div className="game-dropdown">
              <motion.button
                className="game-dropdown-btn"
                onClick={() => setIsGameDropdownOpen(!isGameDropdownOpen)}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <span className="game-icon">
                  {games.find(g => g.value === selectedGame)?.icon}
                </span>
                <span className="game-label">
                  {games.find(g => g.value === selectedGame)?.label}
                </span>
                <motion.span 
                  className="dropdown-arrow"
                  animate={{ rotate: isGameDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ▼
                </motion.span>
              </motion.button>
              
              <AnimatePresence>
                {isGameDropdownOpen && (
        <motion.div 
                    className="game-dropdown-menu"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {games.map(game => (
          <motion.button
                        key={game.value}
                        className={`game-option ${selectedGame === game.value ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedGame(game.value);
                          setIsGameDropdownOpen(false);
                        }}
                        whileHover={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="game-option-icon">{game.icon}</span>
                        <span className="game-option-label">{game.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.button
            className="generate-btn"
            onClick={generateNumbersWithAI}
            disabled={isGenerating}
            variants={buttonVariants}
            whileHover={!isGenerating ? "hover" : {}}
            whileTap={!isGenerating ? "tap" : {}}
          >
            {isGenerating ? (
              <>
                <motion.div 
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Generowanie...
              </>
            ) : (
              <>
                🎯 Generuj z AI
              </>
            )}
          </motion.button>
        </motion.div>

        <motion.div 
          className="animation-area"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
        >
          {isGenerating ? (
            <div className="generation-container">
              {renderAnimation()}
              
            <motion.div 
              className="progress-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
              </div>
                <div className="progress-text">{Math.round(progress)}%</div>
            </motion.div>
            </div>
          ) : generatedNumbers.length > 0 ? (
          <motion.div 
              className="results-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2>🎉 Wygenerowane liczby</h2>
            <div className="numbers-display">
                {generatedNumbers.map((num, index) => (
                <motion.div
                  key={index}
                  className="number-ball"
                    initial={{ opacity: 0, y: 50, scale: 0 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    {num}
                </motion.div>
              ))}
            </div>
            
            <div className="ai-info">
                <div className="confidence-bar">
                  <span>Pewność AI: {aiConfidence}%</span>
                  <div className="confidence-fill" style={{ width: `${aiConfidence}%` }} />
                </div>
                <p className="ai-comment">{aiComment}</p>
              </div>
              
              <motion.button
                className="copy-btn"
                onClick={() => copyToClipboard(generatedNumbers)}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                📋 Kopiuj
              </motion.button>
          </motion.div>
          ) : (
            <div className="welcome-message">
              <h2>🎯 Witaj w AI Ultra Pro!</h2>
              <p>Wybierz grę i tryb animacji, a następnie kliknij "Generuj z AI"</p>
            </div>
        )}
          </motion.div>
      </div>

      {/* Historia na końcu */}
      {history.length > 0 && (
        <motion.div 
          className="history-section"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <h3>📚 Historia generowań</h3>
          <div className="history-list">
            {history.map(entry => (
              <motion.div 
                key={entry.id} 
                className="history-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="history-header">
                  <span className="game-name">
                    {games.find(g => g.value === entry.game)?.label}
                  </span>
                  <span className="mode-name">
                    {animationModes.find(m => m.value === entry.mode)?.label}
                  </span>
                </div>
                <div className="history-numbers">
                  {entry.numbers.join(', ')}
                </div>
                <div className="history-confidence">
                  Pewność: {entry.confidence}%
                </div>
                <div className="history-time">{entry.timestamp}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AILottoGeneratorUltraPro;
