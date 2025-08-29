import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SchonheimGenerator = () => {
  // Hook do śledzenia szerokości ekranu
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [selectedGame, setSelectedGame] = useState('lotto'); // wybrana gra
  const [selectedNumbers, setSelectedNumbers] = useState([]); // wybrany zbiór liczb
  const [v, setV] = useState(10); // liczba wybranych liczb
  const [k, setK] = useState(6); // wielkość zakładu
  const [t, setT] = useState(5); // wielkość gwarantowanego trafienia
  const [userBets, setUserBets] = useState(0); // liczba zakładów użytkownika
  const [results, setResults] = useState(null);
  const [generatedBets, setGeneratedBets] = useState([]); // wygenerowane zakłady
  const [isGenerating, setIsGenerating] = useState(false); // stan generowania
  const [customNumber, setCustomNumber] = useState(''); // własna liczba do dodania
  const [showCustomInput, setShowCustomInput] = useState(false); // pokaż/ukryj input własnych liczb

  // Konfiguracja gier
  const gameConfigs = {
    lotto: { name: 'Lotto', range: 49, pick: 6, guarantees: [3, 4, 5] },
    miniLotto: { name: 'Mini Lotto', range: 42, pick: 5, guarantees: [3, 4] },
    multiMulti: { name: 'Multi Multi', range: 80, pick: 10, guarantees: [3, 4, 5, 6, 7, 8, 9] },
    eurojackpot: { name: 'Eurojackpot', range: 50, pick: 5, guarantees: [3, 4] },
    kaskada: { name: 'Kaskada', range: 24, pick: 12, guarantees: [3, 4, 5, 6, 7, 8, 9, 10, 11] },
    keno: { name: 'Keno', range: 70, pick: 10, guarantees: [3, 4, 5, 6, 7, 8, 9] }
  };

  // Efekt czyszczący wyniki przy zmianie gry
  useEffect(() => {
    console.log('🔄 Zmiana gry - czyszczenie wyników:', selectedGame);
    setResults(null);
    setGeneratedBets([]);
    setSelectedNumbers([]);
    setUserBets(0);
    
    // Ustaw domyślne wartości dla nowej gry
    const config = gameConfigs[selectedGame];
    if (config) {
      setK(config.pick);
      setT(Math.min(config.guarantees[0] || 3, config.pick - 1));
      setV(Math.min(config.pick + 4, config.range));
    }
  }, [selectedGame]);

  // Funkcja generująca losowy zbiór liczb
  const generateRandomNumberSet = (count, maxNumber) => {
    const numbers = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  };

  // Funkcja obliczająca kombinacje C(n,k)
  const combinations = (n, k) => {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  };

  // Funkcja obliczająca granicę prostą
  const calculateSimpleBound = () => {
    const numerator = combinations(v, t);
    const denominator = combinations(k, t);
    return Math.ceil(numerator / denominator);
  };

  // Funkcja obliczająca granicę Schönheima rekurencyjnie
  const calculateSchonheimBound = (v, k, t) => {
    if (t === 1) {
      return Math.ceil(v / k);
    }
    
    const recursiveBound = calculateSchonheimBound(v - 1, k - 1, t - 1);
    return Math.ceil((v / k) * recursiveBound);
  };

  // Funkcja generująca wszystkie kombinacje k-elementowe z danego zbioru
  const generateCombinations = (arr, k) => {
    if (k === 1) return arr.map(x => [x]);
    if (k === arr.length) return [arr];
    if (k > arr.length) return [];
    
    const result = [];
    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr[i];
      const tailCombos = generateCombinations(arr.slice(i + 1), k - 1);
      for (const combo of tailCombos) {
        result.push([head, ...combo]);
      }
    }
    return result;
  };

  // Algorytm generowania optymalnych zakładów (uproszczony greedy)
  const generateOptimalBets = (numbers, k, t) => {
    const allCombinations = generateCombinations(numbers, k);
    const tCombinations = generateCombinations(numbers, t);
    const bets = [];
    const coveredTCombos = new Set();

    // Greedy: wybierz zakład który pokrywa najwięcej niepokrytych t-kombinacji
    while (coveredTCombos.size < tCombinations.length && bets.length < 1000) { // limit bezpieczeństwa
      let bestBet = null;
      let bestCoverage = 0;

      for (const bet of allCombinations) {
        if (bets.some(existingBet => JSON.stringify(existingBet) === JSON.stringify(bet))) {
          continue; // już wybrany
        }

        let newCoverage = 0;
        for (let i = 0; i < tCombinations.length; i++) {
          const tCombo = tCombinations[i];
          if (!coveredTCombos.has(i) && tCombo.every(num => bet.includes(num))) {
            newCoverage++;
          }
        }

        if (newCoverage > bestCoverage) {
          bestCoverage = newCoverage;
          bestBet = bet;
        }
      }

      if (bestBet) {
        bets.push(bestBet);
        // Oznacz pokryte t-kombinacje
        for (let i = 0; i < tCombinations.length; i++) {
          const tCombo = tCombinations[i];
          if (tCombo.every(num => bestBet.includes(num))) {
            coveredTCombos.add(i);
          }
        }
      } else {
        break; // nie można znaleźć więcej pokryć
      }
    }

    return bets;
  };

  // Funkcja generująca system zakładów
  const generateSystem = async () => {
    setIsGenerating(true);
    setGeneratedBets([]);
    setResults(null); // Wyczyść poprzednie wyniki
    
    try {
      const gameConfig = gameConfigs[selectedGame];
      const numbersToUse = selectedNumbers.length > 0 ? selectedNumbers : generateRandomNumberSet(v, gameConfig.range);
      setSelectedNumbers(numbersToUse);
      
      // Ustaw k na podstawie wybranej gry
      const kValue = gameConfig.pick;
      setK(kValue);
      
      // Generuj zakłady
      const bets = generateOptimalBets(numbersToUse, kValue, t);
      setGeneratedBets(bets);
      
      // Oblicz granice
      const simpleBound = Math.ceil(combinations(numbersToUse.length, t) / combinations(kValue, t));
      const schonheimBound = calculateSchonheimBound(numbersToUse.length, kValue, t);
      
      setResults({
        simpleBound,
        schonheimBound,
        userBets: parseInt(userBets) || 0,
        actualBets: bets.length,
        selectedNumbers: numbersToUse,
        gameConfig
      });
    } catch (error) {
      console.error('Błąd podczas generowania systemu:', error);
    }
    
    setIsGenerating(false);
  };

  // Funkcja obliczająca wszystkie granice (zachowana dla kompatybilności)
  const calculateBounds = () => {
    setGeneratedBets([]); // Wyczyść wygenerowane zakłady
    setResults(null); // Wyczyść poprzednie wyniki
    
    const simpleBound = calculateSimpleBound();
    const schonheimBound = calculateSchonheimBound(v, k, t);
    
    setResults({
      simpleBound,
      schonheimBound,
      userBets: parseInt(userBets) || 0
    });
  };

  // Funkcja sprawdzająca czy liczba zakładów wystarczy
  const checkSufficiency = (userBets, bound) => {
    if (userBets === 0) return null;
    return userBets >= bound;
  };

  // Funkcja dodawania własnej liczby
  const addCustomNumber = () => {
    const num = parseInt(customNumber);
    if (num && num >= 1 && num <= gameConfigs[selectedGame].range && !selectedNumbers.includes(num)) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
      setCustomNumber('');
    }
  };

  // Funkcja usuwania liczby
  const removeNumber = (numberToRemove) => {
    setSelectedNumbers(selectedNumbers.filter(num => num !== numberToRemove));
  };

  // Funkcja generowania losowych liczb
  const generateRandomNumbers = () => {
    const numbers = generateRandomNumberSet(v, gameConfigs[selectedGame].range);
    setSelectedNumbers(numbers);
  };

  // Funkcja czyszczenia wybranych liczb
  const clearNumbers = () => {
    setSelectedNumbers([]);
  };

  return (
    <>
      <style>
        {`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}
      </style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10" style={{ padding: window.innerWidth <= 280 ? "8px" : "0" }}>
        {/* Nagłówek */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
          style={{ padding: window.innerWidth <= 280 ? "8px" : "0" }}
        >
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontSize: window.innerWidth <= 280 ? "20px" : "24px" }}>
            🧮 Generator Systemów Schönheima
          </h1>
          <p className="text-blue-200 text-lg" style={{ fontSize: window.innerWidth <= 280 ? "14px" : "18px" }}>
            Oblicz granice dla systemów skróconych Lotto
          </p>
        </motion.div>

        {/* Formularz */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/20"
          style={{ padding: window.innerWidth <= 280 ? "12px" : "24px", margin: window.innerWidth <= 280 ? "16px 8px" : "32px 0" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" style={{ gap: window.innerWidth <= 280 ? "12px" : "16px" }}>
            {/* Wybór gry */}
            <div className="flex flex-col justify-end">
              <label className="block text-white font-medium mb-2" style={{ fontSize: window.innerWidth <= 280 ? "12px" : "14px" }}>
                Wybierz grę
              </label>
              <div className="relative">
                <select
                  value={selectedGame}
                  onChange={(e) => {
                    setSelectedGame(e.target.value);
                    setSelectedNumbers([]);
                    const config = gameConfigs[e.target.value];
                    setK(config.pick);
                    setT(config.guarantees[0]);
                  }}
                  style={{
                    fontSize: window.innerWidth <= 280 ? "12px" : "14px",
                    height: window.innerWidth <= 280 ? "40px" : "48px"
                  }}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 h-12 appearance-none cursor-pointer pr-10 flex items-center leading-normal"
                >
                  {Object.entries(gameConfigs).map(([key, config]) => (
                    <option key={key} value={key} className="bg-gray-800">
                      {config.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Liczba liczb w systemie */}
            <div className="flex flex-col justify-end">
              <label className="block text-white font-medium mb-2">
                Liczba liczb w systemie
              </label>
              <div className="relative">
                <select
                  value={v}
                  onChange={(e) => {
                    const newV = parseInt(e.target.value);
                    setV(newV);
                    setSelectedNumbers([]);
                  }}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 h-12 appearance-none cursor-pointer pr-10 flex items-center leading-normal"
                >
                  {Array.from({ length: 15 - gameConfigs[selectedGame].pick }, (_, i) => gameConfigs[selectedGame].pick + i + 1).map(num => (
                    <option key={num} value={num} className="bg-gray-800">
                      {num} liczb
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Gwarancja trafień */}
            <div className="flex flex-col justify-end">
              <label className="block text-white font-medium mb-2">
                Gwarancja trafień
              </label>
              <div className="relative">
                <select
                  value={t}
                  onChange={(e) => setT(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 h-12 appearance-none cursor-pointer pr-10 flex items-center leading-normal"
                >
                  {gameConfigs[selectedGame].guarantees.map(guarantee => (
                    <option key={guarantee} value={guarantee} className="bg-gray-800">
                      {guarantee} z {gameConfigs[selectedGame].pick}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pole Twoje zakłady */}
            <div className="flex flex-col justify-end">
              <label className="block text-white font-medium mb-2">
                Twoje zakłady (opcjonalnie)
              </label>
              <div className="flex items-center gap-2" style={{
                gap: window.innerWidth <= 320 ? "4px" : (window.innerWidth <= 480 ? "6px" : "8px"),
                width: window.innerWidth <= 480 ? "100%" : "auto"
              }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserBets(Math.max(0, parseInt(userBets) - 1 || 0))}
                  style={{
                    width: window.innerWidth <= 320 ? "32px" : (window.innerWidth <= 480 ? "36px" : "44px"),
                    height: window.innerWidth <= 320 ? "32px" : (window.innerWidth <= 480 ? "36px" : "44px"),
                    fontSize: window.innerWidth <= 320 ? "12px" : (window.innerWidth <= 480 ? "14px" : "18px"),
                    minWidth: window.innerWidth <= 320 ? "32px" : (window.innerWidth <= 480 ? "36px" : "44px")
                  }}
                  className="bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center shadow-lg"
                >
                  -
                </motion.button>
                <input
                  type="number"
                  value={userBets}
                  onChange={(e) => setUserBets(e.target.value)}
                  min="0"
                  className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 flex items-center leading-normal text-center"
                  placeholder="0"
                  style={{
                    fontSize: window.innerWidth <= 320 ? "12px" : (window.innerWidth <= 480 ? "14px" : "16px"),
                    height: window.innerWidth <= 320 ? "32px" : (window.innerWidth <= 480 ? "36px" : "44px"),
                    padding: window.innerWidth <= 320 ? "4px 8px" : "8px 16px",
                    width: window.innerWidth <= 320 ? "50%" : (window.innerWidth <= 480 ? "60%" : "auto")
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserBets(parseInt(userBets) + 1 || 1)}
                  style={{
                    width: window.innerWidth <= 320 ? "32px" : (window.innerWidth <= 480 ? "36px" : "44px"),
                    height: window.innerWidth <= 320 ? "32px" : (window.innerWidth <= 480 ? "36px" : "44px"),
                    fontSize: window.innerWidth <= 320 ? "12px" : (window.innerWidth <= 480 ? "14px" : "18px"),
                    minWidth: window.innerWidth <= 320 ? "32px" : (window.innerWidth <= 480 ? "36px" : "44px")
                  }}
                  className="bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center shadow-lg"
                >
                  +
                </motion.button>
              </div>
            </div>
          </div>

          {/* Przyciski */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ 
            padding: window.innerWidth <= 480 ? "8px" : "0",
            marginTop: window.innerWidth <= 480 ? "12px" : "16px"
          }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateSystem}
              disabled={isGenerating}
              style={{
                width: window.innerWidth <= 480 ? "100%" : "auto",
                fontSize: window.innerWidth <= 480 ? "14px" : "16px",
                padding: window.innerWidth <= 480 ? "12px 16px" : "12px 24px",
                margin: window.innerWidth <= 480 ? "4px 0" : "0",
                minWidth: window.innerWidth <= 480 ? "auto" : "200px"
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '⏳ Generuję...' : '🎯 Generuj system zakładów'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={calculateBounds}
              style={{
                width: window.innerWidth <= 480 ? "100%" : "auto",
                fontSize: window.innerWidth <= 480 ? "14px" : "16px",
                padding: window.innerWidth <= 480 ? "12px 16px" : "12px 24px",
                margin: window.innerWidth <= 480 ? "4px 0" : "0",
                minWidth: window.innerWidth <= 480 ? "auto" : "200px"
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              🧮 Oblicz tylko granice
            </motion.button>
          </div>
          
                      {/* Wybór własnych liczb */}
                            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10" style={{ 
                  padding: window.innerWidth <= 320 ? "16px" : (window.innerWidth <= 480 ? "12px" : "16px"),
                  marginTop: window.innerWidth <= 480 ? "12px" : "24px"
                }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h4 className="text-white font-medium" style={{ 
                  fontSize: window.innerWidth <= 480 ? "14px" : "16px",
                  textAlign: window.innerWidth <= 480 ? "center" : "left"
                }}>🎯 Wybór liczb ({selectedNumbers.length}/{v})</h4>
                <div className="flex flex-wrap gap-2 items-center justify-center" style={{ 
                  gap: window.innerWidth <= 320 ? "6px" : (window.innerWidth <= 480 ? "8px" : "8px"),
                  width: window.innerWidth <= 480 ? "100%" : "auto",
                  flexDirection: window.innerWidth <= 480 ? "column" : "row"
                }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  style={{
                    fontSize: window.innerWidth <= 320 ? "12px" : (window.innerWidth <= 480 ? "14px" : "14px"),
                    padding: window.innerWidth <= 320 ? "8px 12px" : (window.innerWidth <= 480 ? "12px 16px" : "8px 12px"),
                    height: window.innerWidth <= 320 ? "36px" : (window.innerWidth <= 480 ? "44px" : "40px"),
                    width: window.innerWidth <= 480 ? "100%" : "auto",
                    minWidth: window.innerWidth <= 480 ? "auto" : "120px"
                  }}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center shadow-lg"
                >
                  {showCustomInput ? '✕ Zamknij' : '➕ Dodaj własne'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateRandomNumbers}
                  style={{
                    fontSize: window.innerWidth <= 320 ? "12px" : (window.innerWidth <= 480 ? "14px" : "14px"),
                    padding: window.innerWidth <= 320 ? "8px 12px" : (window.innerWidth <= 480 ? "12px 16px" : "8px 12px"),
                    height: window.innerWidth <= 320 ? "36px" : (window.innerWidth <= 480 ? "44px" : "40px"),
                    width: window.innerWidth <= 480 ? "100%" : "auto",
                    minWidth: window.innerWidth <= 480 ? "auto" : "120px"
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center shadow-lg"
                >
                  🎲 Losuj
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearNumbers}
                  style={{
                    fontSize: window.innerWidth <= 320 ? "12px" : (window.innerWidth <= 480 ? "14px" : "14px"),
                    padding: window.innerWidth <= 320 ? "8px 12px" : (window.innerWidth <= 480 ? "12px 16px" : "8px 12px"),
                    height: window.innerWidth <= 320 ? "36px" : (window.innerWidth <= 480 ? "44px" : "40px"),
                    width: window.innerWidth <= 480 ? "100%" : "auto",
                    minWidth: window.innerWidth <= 480 ? "auto" : "120px"
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center shadow-lg"
                >
                  🗑️ Wyczyść
                </motion.button>
              </div>
            </div>

            {/* Input dla własnych liczb */}
            {showCustomInput && (
              <div className="flex gap-2 mb-4 items-center">
                <input
                  type="number"
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value)}
                  min="1"
                  max={gameConfigs[selectedGame].range}
                  className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 h-10"
                  placeholder={`Liczba 1-${gameConfigs[selectedGame].range}`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addCustomNumber}
                  className="px-4 py-2 bg-blue-500/30 text-blue-200 rounded-lg font-medium hover:bg-blue-500/50 transition-colors h-10 flex items-center justify-center"
                >
                  ➕
                </motion.button>
              </div>
            )}

            {/* Wybrane liczby jako żółte kule */}
            {selectedNumbers.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {selectedNumbers.map((num, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg border-2 border-yellow-300 cursor-pointer hover:scale-110 transition-transform">
                      {num}
                    </div>
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      onClick={() => removeNumber(num)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      ×
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Informacja o braku liczb */}
            {selectedNumbers.length === 0 && (
              <div className="text-center py-8 text-white/60">
                <p>Nie wybrano żadnych liczb. Dodaj własne lub wylosuj automatycznie.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Wyniki */}
        {results && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
            style={{ padding: window.innerWidth <= 280 ? "12px" : "24px", margin: window.innerWidth <= 280 ? "16px 8px" : "32px 0" }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontSize: window.innerWidth <= 280 ? "18px" : "24px", marginBottom: window.innerWidth <= 280 ? "16px" : "24px" }}>
              📊 Wyniki obliczeń
            </h2>

            {/* Informacje o systemie */}
            {results.gameConfig && (
              <div className="mb-6 p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                <h3 className="text-green-200 font-medium mb-2">🎮 Informacje o systemie:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-green-100">
                    <strong>Gra:</strong> {results.gameConfig.name}
                  </div>
                  <div className="text-green-100">
                    <strong>Zbiór liczb:</strong> {results.selectedNumbers?.length || v} z {results.gameConfig.range}
                  </div>
                  <div className="text-green-100">
                    <strong>Gwarancja:</strong> {t} z {results.gameConfig.pick}
                  </div>
                </div>
              </div>
            )}

            {/* Tabelka wyników */}
            <div className="mb-6">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 font-bold" style={{ 
                      fontSize: windowWidth <= 480 ? "10px" : "14px",
                      padding: windowWidth <= 480 ? "6px 4px" : "12px 16px",
                      whiteSpace: windowWidth <= 480 ? "nowrap" : "normal",
                      width: windowWidth <= 480 ? "25%" : "auto"
                    }}>Typ granicy</th>
                    <th className="text-left py-3 px-4 font-bold" style={{ 
                      fontSize: windowWidth <= 480 ? "10px" : "14px",
                      padding: windowWidth <= 480 ? "6px 4px" : "12px 16px",
                      whiteSpace: windowWidth <= 480 ? "nowrap" : "normal",
                      width: windowWidth <= 480 ? "20%" : "auto"
                    }}>Wartość</th>
                    <th className="text-left py-3 px-4 font-bold" style={{ 
                      fontSize: windowWidth <= 480 ? "10px" : "14px",
                      padding: windowWidth <= 480 ? "6px 4px" : "12px 16px",
                      whiteSpace: windowWidth <= 480 ? "nowrap" : "normal",
                      width: windowWidth <= 480 ? "55%" : "auto"
                    }}>Wzór</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4" style={{ 
                      fontSize: windowWidth <= 480 ? "9px" : "14px",
                      padding: windowWidth <= 480 ? "6px 4px" : "12px 16px"
                    }}>
                      <span className="text-blue-300 font-medium">Prosta granica</span>
                    </td>
                    <td className="py-3 px-4" style={{ 
                      fontSize: windowWidth <= 480 ? "9px" : "14px",
                      padding: windowWidth <= 480 ? "6px 4px" : "12px 16px"
                    }}>
                      <span className="text-2xl font-bold text-blue-400" style={{ 
                        fontSize: windowWidth <= 480 ? "16px" : "24px"
                      }}>
                        {results.simpleBound}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300" style={{ 
                      fontSize: windowWidth <= 480 ? "8px" : "14px",
                      padding: windowWidth <= 480 ? "6px 4px" : "12px 16px"
                    }}>
                      ⌈ C({results.selectedNumbers?.length || v},{t}) / C({k},{t}) ⌉
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4" style={{ 
                      fontSize: windowWidth <= 480 ? "9px" : "14px",
                      padding: windowWidth <= 480 ? "6px 4px" : "12px 16px"
                    }}>
                      <span className="text-purple-300 font-medium">Granica Schönheima</span>
                    </td>
                    <td className="py-3 px-4" style={{ 
                      fontSize: windowWidth <= 480 ? "9px" : "14px",
                      padding: windowWidth <= 480 ? "6px 4px" : "12px 16px"
                    }}>
                      <span className="text-2xl font-bold text-purple-400" style={{ 
                        fontSize: windowWidth <= 480 ? "16px" : "24px"
                      }}>
                        {results.schonheimBound}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300" style={{ 
                      fontSize: windowWidth <= 480 ? "8px" : "14px",
                      padding: windowWidth <= 480 ? "6px 4px" : "12px 16px"
                    }}>
                      ⌈ {results.selectedNumbers?.length || v}/{k} × C({(results.selectedNumbers?.length || v)-1},{k-1},{t-1}) ⌉
                    </td>
                  </tr>
                  {results.actualBets !== undefined && (
                    <tr className="border-b border-white/10 bg-green-500/10">
                      <td className="py-3 px-4" style={{ 
                        fontSize: windowWidth <= 480 ? "9px" : "14px",
                        padding: windowWidth <= 480 ? "6px 4px" : "12px 16px"
                      }}>
                        <span className="text-green-300 font-medium">Wygenerowane zakłady</span>
                      </td>
                      <td className="py-3 px-4" style={{ 
                        fontSize: windowWidth <= 480 ? "9px" : "14px",
                        padding: windowWidth <= 480 ? "6px 4px" : "12px 16px"
                      }}>
                        <span className="text-2xl font-bold text-green-400" style={{ 
                          fontSize: windowWidth <= 480 ? "16px" : "24px"
                        }}>
                          {results.actualBets}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300" style={{ 
                        fontSize: windowWidth <= 480 ? "8px" : "14px",
                        padding: windowWidth <= 480 ? "6px 4px" : "12px 16px"
                      }}>
                        Algorytm Schönheima
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Informacje o systemie */}
            {generatedBets.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-400/30">
                <h3 className="text-lg font-bold text-white mb-4">📊 Informacje o systemie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{generatedBets.length}</div>
                    <div className="text-sm text-green-200">Liczba zakładów</div>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{t} z {k}</div>
                    <div className="text-sm text-blue-200">Gwarancja trafień</div>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{results?.schonheimBound || 'N/A'}</div>
                    <div className="text-sm text-purple-200">Skuteczność (granica)</div>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{(generatedBets.length * 3).toFixed(2)} zł</div>
                    <div className="text-sm text-yellow-200">Koszt (3 zł/zakład)</div>
                  </div>
                </div>
              </div>
            )}

            {/* Wygenerowane zakłady */}
            {generatedBets.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">🎯 Wygenerowane zakłady ({generatedBets.length})</h3>
                <div className="max-h-96 overflow-y-auto bg-white/5 rounded-lg border border-white/10 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {generatedBets.map((bet, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30">
                        <div className="text-xs text-blue-200 mb-1">Zakład {index + 1}</div>
                        <div className="flex flex-wrap gap-1">
                          {bet.map((num, numIndex) => (
                            <div key={numIndex} className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm shadow-md border border-yellow-300">
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Przyciski akcji */}
                <div className="flex flex-wrap gap-3 mt-4" style={{ 
                  gap: window.innerWidth <= 480 ? "8px" : "12px",
                  flexDirection: window.innerWidth <= 480 ? "column" : "row"
                }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const betsText = generatedBets.map((bet, index) => 
                        `Zakład ${index + 1}: ${bet.join(', ')}`
                      ).join('\n');
                      navigator.clipboard.writeText(betsText);
                    }}
                    style={{
                      fontSize: window.innerWidth <= 480 ? "14px" : "14px",
                      padding: window.innerWidth <= 480 ? "12px 16px" : "12px 16px",
                      width: window.innerWidth <= 480 ? "100%" : "auto",
                      minWidth: window.innerWidth <= 480 ? "auto" : "160px"
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium"
                  >
                    📋 Kopiuj zakłady
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const printContent = `
                        System Schönheima - ${results?.gameConfig?.name || 'Lotto'}
                        Liczby: ${results?.selectedNumbers?.join(', ') || ''}
                        Gwarancja: ${t} z ${k}
                        Liczba zakładów: ${generatedBets.length}
                        
                        Zakłady:
                        ${generatedBets.map((bet, index) => `Zakład ${index + 1}: ${bet.join(', ')}`).join('\n')}
                      `;
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <html>
                          <head><title>System Schönheima</title></head>
                          <body style="font-family: Arial, sans-serif; padding: 20px;">
                            <pre style="white-space: pre-wrap;">${printContent}</pre>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }}
                    style={{
                      fontSize: window.innerWidth <= 480 ? "14px" : "14px",
                      padding: window.innerWidth <= 480 ? "12px 16px" : "12px 16px",
                      width: window.innerWidth <= 480 ? "100%" : "auto",
                      minWidth: window.innerWidth <= 480 ? "auto" : "160px"
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-lg font-medium"
                  >
                    🖨️ Wydrukuj zakłady
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const favorite = {
                        id: Date.now(),
                        game: results?.gameConfig?.name || 'Lotto',
                        numbers: results?.selectedNumbers || [],
                        bets: generatedBets,
                        guarantee: `${t} z ${k}`,
                        date: new Date().toISOString(),
                        generatorType: 'schonheim'
                      };
                      
                      const existingFavorites = JSON.parse(localStorage.getItem('lottoFavorites') || '[]');
                      existingFavorites.push(favorite);
                      localStorage.setItem('lottoFavorites', JSON.stringify(existingFavorites));
                      
                      alert('✅ Dodano do ulubionych!');
                    }}
                    style={{
                      fontSize: window.innerWidth <= 480 ? "14px" : "14px",
                      padding: window.innerWidth <= 480 ? "12px 16px" : "12px 16px",
                      width: window.innerWidth <= 480 ? "100%" : "auto",
                      minWidth: window.innerWidth <= 480 ? "auto" : "160px"
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg font-medium"
                  >
                    ❤️ Dodaj do ulubionych
                  </motion.button>
                </div>
              </div>
            )}

            {/* Analiza Twoich zakładów */}
            {results.userBets > 0 && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">
                  📋 Analiza Twoich zakładów
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Porównanie z granicą prostą */}
                  <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-200 font-medium">Granica prosta:</span>
                      <span className="text-blue-400 font-bold">{results.simpleBound}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Twoje zakłady:</span>
                      <span className="text-blue-400 font-bold">{results.userBets}</span>
                    </div>
                    <div className="mt-2">
                      {checkSufficiency(results.userBets, results.simpleBound) ? (
                        <span className="text-green-400 text-sm">✅ Wystarczy</span>
                      ) : (
                        <span className="text-red-400 text-sm">❌ Za mało (brakuje {results.simpleBound - results.userBets})</span>
                      )}
                    </div>
                  </div>

                  {/* Porównanie z granicą Schönheima */}
                  <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-200 font-medium">Granica Schönheima:</span>
                      <span className="text-purple-400 font-bold">{results.schonheimBound}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Twoje zakłady:</span>
                      <span className="text-purple-400 font-bold">{results.userBets}</span>
                    </div>
                    <div className="mt-2">
                      {checkSufficiency(results.userBets, results.schonheimBound) ? (
                        <span className="text-green-400 text-sm">✅ Wystarczy</span>
                      ) : (
                        <span className="text-red-400 text-sm">❌ Za mało (brakuje {results.schonheimBound - results.userBets})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Komentarz */}
                <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                  <h4 className="text-yellow-200 font-medium mb-2">💡 Komentarz:</h4>
                  <p className="text-yellow-100 text-sm">
                    {results.userBets >= results.schonheimBound ? (
                      `Gratulacje! Twoje ${results.userBets} zakładów wystarczy na gwarancję ${t} z ${k} trafień. 
                      Możesz być pewien, że osiągniesz przynajmniej ${t} trafień.`
                    ) : results.userBets >= results.simpleBound ? (
                      `Twoje ${results.userBets} zakładów wystarczy na podstawową gwarancję, ale nie na optymalną granicę Schönheima. 
                      Rozważ dodanie ${results.schonheimBound - results.userBets} zakładów dla lepszej gwarancji.`
                    ) : (
                      `Twoje ${results.userBets} zakładów nie wystarczy na gwarancję ${t} z ${k} trafień. 
                      Potrzebujesz minimum ${results.simpleBound} zakładów dla podstawowej gwarancji.`
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Informacje dodatkowe */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                <h4 className="text-green-200 font-medium mb-2">📈 Granica prosta</h4>
                <p className="text-green-100 text-sm">
                  Podstawowa granica teoretyczna obliczona jako iloraz wszystkich możliwych kombinacji t-elementowych 
                  z v liczb przez liczbę kombinacji t-elementowych w jednym zakładzie.
                </p>
              </div>
              
              <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-400/30">
                <h4 className="text-purple-200 font-medium mb-2">🎯 Granica Schönheima</h4>
                <p className="text-purple-100 text-sm">
                  Bardziej precyzyjna granica obliczona rekurencyjnie. Zazwyczaj daje lepsze (niższe) oszacowanie 
                  minimalnej liczby zakładów potrzebnych do osiągnięcia gwarancji.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Przykłady użycia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
          style={{ padding: window.innerWidth <= 280 ? "12px" : "24px", margin: window.innerWidth <= 280 ? "16px 8px" : "32px 0" }}
        >
          <h3 className="text-xl font-bold text-white mb-4" style={{ fontSize: window.innerWidth <= 280 ? "16px" : "20px", marginBottom: window.innerWidth <= 280 ? "12px" : "16px" }}>📝 Przykłady użycia</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <h4 className="text-blue-200 font-medium mb-2">🎰 Lotto (6/49)</h4>
              <ul className="text-blue-100 text-sm space-y-1">
                <li>• v=10, k=6, t=3 → System 10 liczb, gwarancja 3/6</li>
                <li>• v=15, k=6, t=4 → System 15 liczb, gwarancja 4/6</li>
                <li>• v=20, k=6, t=5 → System 20 liczb, gwarancja 5/6</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-500/20 rounded-lg border border-green-400/30">
              <h4 className="text-green-200 font-medium mb-2">🍀 Mini Lotto (5/42)</h4>
              <ul className="text-green-100 text-sm space-y-1">
                <li>• v=8, k=5, t=3 → System 8 liczb, gwarancja 3/5</li>
                <li>• v=12, k=5, t=4 → System 12 liczb, gwarancja 4/5</li>
                <li>• v=15, k=5, t=4 → System 15 liczb, gwarancja 4/5</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default SchonheimGenerator;
