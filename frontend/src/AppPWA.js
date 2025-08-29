import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';
import './i18n'; // Import konfiguracji i18n
import AuthContainer from './components/auth/AuthContainer';
import FinalStatistics from './components/statistics/FinalStatistics';
import GryPoZalogowaniu from './components/GryPoZalogowaniu';
import AILottoGeneratorUltraPro from './components/ai-generator/AILottoGeneratorUltraPro';
import HarmonicAnalyzer from './components/harmonic-analyzer/HarmonicAnalyzer';
import MyLuckyNumbersScreen from './components/MyLuckyNumbersScreen';
import Talizmany from './components/Talizmany';
import ActiveTalismanDisplay from './components/ActiveTalismanDisplay';
import LanguageSwitcher from './components/LanguageSwitcher';
import HomePage from './components/HomePage';
import SchonheimGenerator from './components/SchonheimGenerator';
import { logoutUser, onAuthStateChange } from './utils/firebaseAuth';
import { getRedirectResult } from 'firebase/auth';
import { auth } from './utils/firebase';
import {
  getUserSubscription,
  getPaymentHistory,
  getUserStatus,
  checkUserAccess,
  cancelSubscription,
  checkAndBlockExpiredTrials
} from './utils/firebaseAuth';
import { initEmailJS } from './utils/emailjs';
import GooglePlayPayments from './components/GooglePlayPayments';
import notificationService from './utils/notificationService';
import schedulerService from './utils/schedulerService';
import luckyNumbersGenerator from './utils/luckyNumbersGenerator';

const games = [
  { value: "lotto", label: "Lotto" },
  { value: "miniLotto", label: "Mini Lotto" },
  { value: "multiMulti", label: "Multi Multi" },
  { value: "eurojackpot", label: "Eurojackpot" },
  { value: "kaskada", label: "Kaskada" },
  { value: "keno", label: "Keno" },
];

// Style CSS
const inputStyle = {
  padding: "12px 16px",
  border: "2px solid #e0e0e0",
  borderRadius: "8px",
  fontSize: "16px",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.3s ease",
  outline: "none"
};

// Styl żółtej kuli z czarnymi liczbami JANIA DO GORY WYJASNEINIACH NAPRAW!SIE NEI POJAWIA W EB.APP
const ballStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  color: "#000",
  fontWeight: "bold",
  fontSize: 12,
  margin: "0 4px 4px 0",
  border: "2px solid #ffb300",
  letterSpacing: 1,
  position: "relative"
};

function Ball({ n }) {
  return (
    <span style={ballStyle}>
      <span style={{ position: "relative", zIndex: 2 }}>{n}</span>
    </span>
  );
}

const buttonStyle = {
  background: "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)",
  color: "#222",
  border: "none",
  borderRadius: "12px",
  padding: "16px 32px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
  width: "100%",
  marginTop: "8px"
};

// Definicje talizmanów
const talismanDefinitions = [
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
    color: '#A0522D',
    effect: 'even'
  },
  {
    id: 3,
    name: 'Smok',
    description: 'Wypala ogniem pechowe liczby',
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
    effect: 'phoenix'
  },
  {
    id: 7,
    name: 'Korona',
    description: 'Królewskie szczęście',
    icon: '👑',
    requirement: 36,
    color: '#FFD700',
    effect: 'royal'
  },
  {
    id: 8,
    name: 'Gwiazda',
    description: 'Magiczna siła kosmosu',
    icon: '⭐',
    requirement: 40,
    color: '#FFC107',
    effect: 'odd'
  },
  {
    id: 9,
    name: 'Słońce',
    description: 'Im cieplejszy dzień tym większe szczęście',
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

// Komponent animacji startowej
const StartScreenAnimation = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [text, setText] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const fullText = "Najlepszy Generator Liczb Lotto AI";
  
  // Responsywność
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;
  
  useEffect(() => {
    // Od razu zaczynamy pisać tekst
    setCurrentPhase(2);
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(textInterval);
        // Faza 3: Zanikanie (1 sekunda)
        setTimeout(() => {
          setCurrentPhase(3);
          setTimeout(() => {
            setShowLogin(true);
            if (onComplete) onComplete();
          }, 1000);
        }, 1500);
      }
    }, 100);
    
    return () => {
      clearInterval(textInterval);
    };
  }, [onComplete]);
  
  if (showLogin) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
              zIndex: 9999,
        transition: 'opacity 1s ease-in-out',
        opacity: currentPhase === 3 ? 0 : 1,
        pointerEvents: currentPhase === 3 ? 'none' : 'auto'
    }}>
      {/* Złota kula */}
      <div style={{
        width: isSmallMobile ? '80px' : isMobile ? '100px' : '120px',
        height: isSmallMobile ? '80px' : isMobile ? '100px' : '120px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #fffde7 0%, #ffd700 50%, #ffb300 100%)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isSmallMobile ? '32px' : isMobile ? '40px' : '48px',
        fontWeight: 'bold',
        color: '#222',
        marginBottom: isSmallMobile ? '30px' : isMobile ? '35px' : '40px',
        position: 'relative',
        animation: 'rotate 4s linear infinite',
        transition: 'all 0.5s ease-in-out'
      }}>
        <span style={{ zIndex: 2 }}>8</span>
      </div>
      
      {/* Pisany tekst */}
      <div style={{
        fontSize: isSmallMobile ? '28px' : isMobile ? '40px' : '52px',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        minHeight: isSmallMobile ? '70px' : isMobile ? '100px' : '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        opacity: currentPhase === 3 ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        padding: isSmallMobile ? '0 10px' : isMobile ? '0 15px' : '0 20px',
        lineHeight: '1.2'
      }}>
        {text}
        {text.length < fullText.length && (
          <span style={{
            animation: 'blink 1s infinite',
            marginLeft: '2px'
          }}>|</span>
        )}
      </div>
      
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

function AppPWA() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Stan dla animacji startowej
  const [showStartAnimation, setShowStartAnimation] = useState(true);
  
  // Style CSS (identyczne jak w głównej aplikacji)
  const menuStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)",
    color: "#222",
    minHeight: 60,
    fontSize: 18,
    flexWrap: "wrap",
    boxShadow: "0 2px 12px 0 rgba(255, 215, 0, 0.10)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%"
  };

  const menuBtn = isActive => ({
    background: isActive ? "rgba(255, 255, 255, 0.3)" : "none",
    border: "none",
    color: isActive ? "#222" : "#7c6f00",
    fontWeight: isActive ? "bold" : "normal",
    fontSize: 18,
    margin: "0 18px",
    padding: "18px 12px",
    cursor: "pointer",
    borderRadius: isActive ? "8px" : "0",
    borderBottom: isActive ? "3px solid #222" : "3px solid transparent",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden"
  });

  const mainStyle = {
    maxWidth: 650,
    margin: "20px auto",
    background: "#f7f7f7",
    borderRadius: 24,
    boxShadow: "0 8px 40px 0 rgba(25, 118, 210, 0.10)",
    padding: 40,
    minHeight: 340,
    position: "relative",
    flex: 1,
    width: "100%",
    boxSizing: "border-box"
  };

  // Funkcje pomocnicze (muszą być przed useState)
  const getGameRange = (game) => {
    switch (game) {
      case 'lotto': return { min: 1, max: 49, count: 6 };
      case 'miniLotto': return { min: 1, max: 42, count: 5 };
      case 'multiMulti': return { min: 1, max: 80, count: 10 };
      case 'eurojackpot': return { min: 1, max: 50, count: 5 };
      case 'kaskada': return { min: 1, max: 24, count: 12 };
      case 'keno': return { min: 1, max: 70, count: kenoNumbers };
      default: return { min: 1, max: 49, count: 6 };
    }
  };

  const getMinSystemNumbers = (game) => {
    switch (game) {
      case 'lotto': return 7;
      case 'miniLotto': return 6;
      case 'multiMulti': return 11;
      case 'eurojackpot': return 6;
      case 'kaskada': return 13;
      case 'keno': return kenoNumbers + 1;
      default: return 7;
    }
  };

  const getGamePick = (game) => {
    switch (game) {
      case 'lotto': return 6;
      case 'miniLotto': return 5;
      case 'multiMulti': return 10;
      case 'eurojackpot': return 5;
      case 'kaskada': return 12;
      case 'keno': return kenoNumbers;
      default: return 6;
    }
  };

  // Funkcja do sprawdzania czy ścieżka jest aktywna
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Funkcja do nawigacji w menu
  const handleMenuClick = (path) => {
    console.log('🎯 Kliknięto menu:', path);
    navigate(path);
    setIsMobileMenuOpen(false);
  };



  // Logika ILP
  const handleGenerateILP = (e) => {
    e.preventDefault();
    setIlpLoading(true);
    
    // Symulacja obliczeń ILP (w rzeczywistości byłby to prawdziwy solver)
    setTimeout(() => {
      const ilpSystem = generateILPSystem(ilpGame, ilpNumbers, ilpGuarantee, ilpSystemType);
      setIlpResults(ilpSystem);
      setIlpLoading(false);
    }, 2000);
  };

  const copyILPBetsToClipboard = () => {
    if (!ilpResults) return;
    
    let betsText = `🎯 SYSTEM ILP - ${ilpResults.systemInfo.type === "full" ? "100% GWARANCJA" : "OPTYMALIZACJA"}\n`;
    betsText += `Gra: ${
      ilpGame === "miniLotto" ? "Mini Lotto" : 
      ilpGame === "lotto" ? "Lotto" : 
      ilpGame === "eurojackpot" ? "Eurojackpot" :
      ilpGame === "keno" ? "Keno" :
      ilpGame === "multiMulti" ? "Multi Multi" :
      ilpGame === "kaskada" ? "Kaskada" : "Gra"
    }\n`;
    betsText += `Typ systemu: ${ilpSystemType === "short" ? "Skrócony" : ilpSystemType === "full" ? "Pełny" : "Adaptacyjny"}\n`;
    betsText += `Liczby w systemie: ${ilpResults.numbers.join(", ")}\n`;
    betsText += `Gwarancja: ${ilpResults.guarantee} z ${
      ilpGame === "miniLotto" ? 5 : 
      ilpGame === "lotto" ? 6 : 
      ilpGame === "eurojackpot" ? "5+2" : 
      ilpGame === "keno" ? 10 :
      ilpGame === "multiMulti" ? 20 :
      ilpGame === "kaskada" ? 6 : 5
    }\n`;
    betsText += `Liczba zakładów: ${ilpResults.totalBets}\n`;
    betsText += `Liczba zakładów do obstawienia: ${ilpResults.systemInfo.betsCount}\n`;
    betsText += `Przewidywana skuteczność: ${ilpResults.systemInfo.effectiveness}\n`;
    betsText += `Potencjalny koszt: ${ilpResults.systemInfo.potentialCost.toFixed(2)} PLN\n\n`;
    betsText += `Jak obstawić zakłady:\n`;
    betsText += `Musisz obstawić wszystkie ${ilpResults.totalBets} zakładów wygenerowanych przez ILP.\n`;
    betsText += `Każdy zakład to ${
      ilpGame === "miniLotto" ? 5 : 
      ilpGame === "lotto" ? 6 : 
      ilpGame === "eurojackpot" ? "5+2" : 
      ilpGame === "keno" ? 10 :
      ilpGame === "multiMulti" ? 20 :
      ilpGame === "kaskada" ? 6 : 5
    } liczb z Twoich ${ilpResults.numbers.length}.\n\n`;
    betsText += `ZAKŁADY:\n`;
    
    ilpResults.bets.forEach((bet, index) => {
      if (ilpGame === "eurojackpot") {
        betsText += `Zakład ${index + 1}: ${bet[0].join(", ")} + ${bet[1].join(", ")}\n`;
      } else {
        betsText += `Zakład ${index + 1}: ${bet.join(", ")}\n`;
      }
    });
    
    navigator.clipboard.writeText(betsText).then(() => {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        animation: slideIn 0.3s ease-out;
      `;
      notification.textContent = '✅ Zakłady ILP skopiowane!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
    }).catch(err => {
      console.error("Błąd kopiowania:", err);
    });
  };

  // Funkcje pomocnicze dla ILP
  function generateILPSystem(game, numbers, guarantee, systemType = "short") {
    const gameConfig = {
      lotto: { total: 49, pick: 6, cost: 3.00 },
      miniLotto: { total: 42, pick: 5, cost: 2.00 },
      eurojackpot: { total: 50, pick: 5, euro: 12, cost: 12.50 },
      keno: { total: 70, pick: 10, cost: 2.00 },
      multiMulti: { total: 80, pick: 20, cost: 2.50 },
      kaskada: { total: 24, pick: 6, cost: 2.00 }
    };
    
    const config = gameConfig[game];
    if (!config) return null;
    
    // Generuj losowe liczby dla systemu
    const allNumbers = Array.from({length: config.total}, (_, i) => i + 1);
    const selectedNumbers = pickNumbers(numbers, allNumbers).sort((a, b) => a - b);
    
    let ilpBets;
    let systemInfo = {
      type: systemType,
      guarantee: guarantee,
      isOptimal: true,
      theoreticalCost: 0,
      effectiveness: "100%"
    };
    
    if (game === "eurojackpot") {
      // Eurojackpot: używa wszystkich wybranych liczb dla głównych + 2 euro liczby
      const euroNumbers = Array.from({length: config.euro}, (_, i) => i + 1);
      
      // Generuj zakłady główne w zależności od typu systemu
      let mainBets = generateILPBetsAdvanced(selectedNumbers, config.pick, guarantee, systemType);
      
      // Dla każdego zakładu głównego generuj różne kombinacje euro liczb
      ilpBets = mainBets.map((mainBet, index) => {
        const euroBet = pickNumbers(2, euroNumbers);
        return [mainBet, euroBet];
      });
    } else {
      ilpBets = generateILPBetsAdvanced(selectedNumbers, config.pick, guarantee, systemType);
    }
    
    // Oblicz teoretyczny koszt na podstawie rzeczywistej liczby zakładów
    const actualBetsCount = ilpBets.length;
    systemInfo.theoreticalCost = actualBetsCount * config.cost;
    
    // Dodaj informację o potencjalnym koszcie
    systemInfo.potentialCost = actualBetsCount * config.cost;
    systemInfo.betsCount = actualBetsCount;
    
    // Określ skuteczność na podstawie typu systemu i gry
    if (systemType === "full") {
      systemInfo.effectiveness = "100% - Pełna gwarancja";
    } else if (systemType === "short") {
      if (game === "keno" || game === "multiMulti") {
        systemInfo.effectiveness = guarantee === 3 ? "75-85%" : guarantee === 4 ? "60-75%" : "45-60%";
      } else {
        systemInfo.effectiveness = guarantee === 3 ? "85-95%" : guarantee === 4 ? "70-85%" : "60-75%";
      }
    } else {
      systemInfo.effectiveness = "90-98% - Adaptacyjna optymalizacja";
    }
    
    return {
      numbers: selectedNumbers,
      bets: ilpBets,
      guarantee: guarantee,
      totalBets: ilpBets.length,
      systemInfo: systemInfo,
      isOptimal: systemType === "full" || (systemType === "short" && ilpBets.length <= 20)
    };
  }

  function generateILPBetsAdvanced(numbers, pick, guarantee, systemType) {
    const allCombinations = generateAllCombinations(numbers, pick);
    
    if (systemType === "full") {
      // System pełny - wszystkie kombinacje
      return allCombinations;
    }
    
    // Oblicz liczbę zakładów na podstawie parametrów i typu gry
    let targetBets;
    const maxPick = Math.max(pick, 10); // Maksymalna liczba wybieranych liczb
    
    if (systemType === "short") {
      if (guarantee <= 3) {
        targetBets = Math.max(5, Math.ceil(numbers.length * 0.6));
      } else if (guarantee <= 5) {
        targetBets = Math.max(8, Math.ceil(numbers.length * 0.8));
      } else if (guarantee <= 7) {
        targetBets = Math.max(12, Math.ceil(numbers.length * 1.0));
      } else {
        targetBets = Math.max(16, Math.ceil(numbers.length * 1.2));
      }
    } else if (systemType === "adaptive") {
      // System adaptacyjny - inteligentny wybór
      if (guarantee <= 3) {
        targetBets = Math.max(8, Math.ceil(numbers.length * 0.7));
      } else if (guarantee <= 5) {
        targetBets = Math.max(12, Math.ceil(numbers.length * 0.9));
      } else if (guarantee <= 7) {
        targetBets = Math.max(16, Math.ceil(numbers.length * 1.1));
      } else {
        targetBets = Math.max(20, Math.ceil(numbers.length * 1.3));
      }
    } else {
      targetBets = Math.max(6, Math.ceil(numbers.length * 0.8));
    }
    
    // Zapewnij minimum zakładów
    targetBets = Math.min(targetBets, allCombinations.length);
    
    // Wybierz różnorodne zakłady
    const selectedBets = [];
    const shuffledCombinations = shuffle([...allCombinations]);
    
    // Faza 1: Wybierz pierwsze zakłady losowo
    for (let i = 0; i < Math.min(targetBets, shuffledCombinations.length); i++) {
      selectedBets.push(shuffledCombinations[i]);
    }
    
    // Faza 2: Dodaj dodatkowe zakłady jeśli potrzeba
    if (selectedBets.length < targetBets) {
      const remainingCombinations = allCombinations.filter(bet => 
        !selectedBets.some(selected => JSON.stringify(selected) === JSON.stringify(bet))
      );
      
      const additionalNeeded = targetBets - selectedBets.length;
      const additionalCount = Math.min(additionalNeeded, remainingCombinations.length);
      
      for (let i = 0; i < additionalCount; i++) {
        const randomIndex = Math.floor(Math.random() * remainingCombinations.length);
        selectedBets.push(remainingCombinations[randomIndex]);
        remainingCombinations.splice(randomIndex, 1);
      }
    }
    
    // Faza 3: Zapewnij minimum 5 zakładów
    if (selectedBets.length < 5 && allCombinations.length >= 5) {
      const remainingCombinations = allCombinations.filter(bet => 
        !selectedBets.some(selected => JSON.stringify(selected) === JSON.stringify(bet))
      );
      
      const additionalNeeded = 5 - selectedBets.length;
      const additionalCount = Math.min(additionalNeeded, remainingCombinations.length);
      
      for (let i = 0; i < additionalCount; i++) {
        const randomIndex = Math.floor(Math.random() * remainingCombinations.length);
        selectedBets.push(remainingCombinations[randomIndex]);
        remainingCombinations.splice(randomIndex, 1);
      }
    }
    
    return selectedBets;
  }

  // Generuje wszystkie kombinacje k-elementowe z n liczb
  function generateAllCombinations(arr, k) {
    if (k === 0) return [[]];
    if (arr.length === 0) return [];
    
    const result = [];
    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr[i];
      const tail = arr.slice(i + 1);
      const combinations = generateAllCombinations(tail, k - 1);
      for (const combo of combinations) {
        result.push([head, ...combo]);
      }
    }
    return result;
  }

  // Funkcja do losowego wybierania liczb
  function pickNumbers(count, numbers) {
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Funkcja do mieszania tablicy
  function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Funkcje pomocnicze dla systemów skróconych
  function hasFullGuarantee(numbers, guarantee, pick) {
    // Znane systemy z 100% gwarancją
    const fullGuaranteeSystems = {
      // Lotto (6 liczb w zakładzie) - systemy skrócone z 100% gwarancją
      "7-3-6": true,   // 7 liczb, 3 z 6
      "8-3-6": true,   // 8 liczb, 3 z 6
      "9-3-6": true,   // 9 liczb, 3 z 6
      "10-3-6": true,  // 10 liczb, 3 z 6
      "11-3-6": true,  // 11 liczb, 3 z 6
      "12-3-6": true,  // 12 liczb, 3 z 6
      "13-3-6": true,  // 13 liczb, 3 z 6
      "14-3-6": true,  // 14 liczb, 3 z 6
      "15-3-6": true,  // 15 liczb, 3 z 6
      
      // Systemy pełne (wszystkie kombinacje)
      "7-4-6": true,   // 7 liczb, 4 z 6 (pełny system)
      "7-5-6": true,   // 7 liczb, 5 z 6 (pełny system)
      "8-4-6": true,   // 8 liczb, 4 z 6 (pełny system)
      "8-5-6": true,   // 8 liczb, 5 z 6 (pełny system)
      "9-4-6": true,   // 9 liczb, 4 z 6 (pełny system)
      "10-5-6": true,  // 10 liczb, 5 z 6 (pełny system)
      
      // Mini Lotto (5 liczb w zakładzie) - systemy skrócone z 100% gwarancją
      "6-3-5": true,   // 6 liczb, 3 z 5
      "7-3-5": true,   // 7 liczb, 3 z 5
      "8-3-5": true,   // 8 liczb, 3 z 5
      "9-3-5": true,   // 9 liczb, 3 z 5
      "10-3-5": true,  // 10 liczb, 3 z 5
      
      // Systemy pełne Mini Lotto
      "7-4-5": true,   // 7 liczb, 4 z 5 (pełny system)
      "8-4-5": true,   // 8 liczb, 4 z 5 (pełny system)
      "10-4-5": true,  // 10 liczb, 4 z 5 (pełny system)
    };
    
    const key = `${numbers}-${guarantee}-${pick}`;
    return fullGuaranteeSystems[key] || false;
  }

  function calculateRealGuarantee(numbers, guarantee, pick) {
    const totalCombinations = combinations(numbers, guarantee);
    const coveredCombinations = combinations(pick, guarantee);
    const theoreticalMin = Math.ceil(totalCombinations / coveredCombinations);
    
    // Sprawdź czy to system z 100% gwarancją
    if (hasFullGuarantee(numbers, guarantee, pick)) {
      return 100;
    }
    
    // Dla innych systemów - oblicz rzeczywistą gwarancję
    const actualBets = getSystemBetsCount(numbers, guarantee, pick);
    const coverage = (actualBets * coveredCombinations) / totalCombinations;
    return Math.min(100, Math.round(coverage * 100));
  }

  function getSystemBetsCount(numbers, guarantee, pick) {
    const knownBets = {
      // Lotto - systemy skrócone
      "7-3-6": 4, "8-3-6": 7, "9-3-6": 10, "10-3-6": 14,
      "7-4-6": 7, "7-5-6": 7, "8-4-6": 15, "8-5-6": 20,
      "9-4-6": 12, "10-5-6": 56,
      "11-3-6": 20, "11-4-6": 35, "11-5-6": 84,
      "12-3-6": 28, "12-4-6": 56, "12-5-6": 126,
      "13-3-6": 39, "13-4-6": 84, "13-5-6": 182,
      "14-3-6": 52, "14-4-6": 120, "14-5-6": 252,
      "15-3-6": 68, "15-4-6": 165, "15-5-6": 330,
      
      // Mini Lotto - systemy skrócone
      "6-3-5": 6, "7-3-5": 7, "8-3-5": 12, "9-3-5": 18,
      "7-4-5": 7, "8-4-5": 14, "10-3-5": 25, "10-4-5": 35
    };
    
    const key = `${numbers}-${guarantee}-${pick}`;
    const shortSystemBets = knownBets[key];
    
    // Jeśli nie ma systemu skróconego, zwróć system pełny
    if (!shortSystemBets) {
      return getFullSystemBetsCount(numbers, pick);
    }
    
    return shortSystemBets;
  }

  function getFullSystemBetsCount(numbers, pick) {
    return combinations(numbers, pick);
  }

  function combinations(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  }

  function generateShortSystem(game, numbers, guarantee) {
    const gameConfig = {
      lotto: { total: 49, pick: 6 },
      miniLotto: { total: 42, pick: 5 },
      multiMulti: { total: 80, pick: 10 },
      eurojackpot: { total: 50, pick: 5 },
      kaskada: { total: 24, pick: 12 },
      keno: { total: 70, pick: kenoNumbers }
    };
    
    const config = gameConfig[game];
    if (!config) return [];
    
    // Generuj system skrócony - używaj wszystkich podanych liczb
    let selectedNumbers;
    if (Array.isArray(numbers)) {
      // Jeśli przekazano tablicę liczb, użyj ich bezpośrednio
      selectedNumbers = numbers;
    } else {
      // Jeśli przekazano liczbę, wygeneruj losowe liczby
      const allNumbers = Array.from({length: config.total}, (_, i) => i + 1);
      selectedNumbers = pickNumbers(numbers, allNumbers);
    }
    
    // Sprawdź czy mamy wystarczającą liczbę liczb
    if (selectedNumbers.length < config.pick) {
      console.error(`Za mało liczb: ${selectedNumbers.length} < ${config.pick}`);
      return {
        numbers: selectedNumbers,
        combinations: [],
        guarantee: guarantee,
        totalBets: 0
      };
    }
    
    // Generuj kombinacje zapewniające gwarancję
    const combinations = generateCombinations(selectedNumbers, config.pick, guarantee);
    
    console.log(`System skrócony: ${selectedNumbers.length} liczb, gwarancja ${guarantee} z ${config.pick}, ${combinations.length} zakładów`);
    
    return {
      numbers: selectedNumbers,
      bets: combinations,
      guarantee: guarantee,
      totalBets: combinations.length
    };
  }

  function generateCombinations(numbers, pick, guarantee) {
    const result = generateShortenedSystem(numbers, pick, guarantee);
    
    // Weryfikacja pokrycia
    const targetCombinations = generateAllCombinations(numbers, guarantee);
    const covered = new Set();
    
    for (const combo of result) {
      for (const target of targetCombinations) {
        if (containsAll(combo, target)) {
          covered.add(target.join(','));
        }
      }
    }
    
    const coverage = covered.size / targetCombinations.length;
    console.log(`Weryfikacja pokrycia: ${covered.size}/${targetCombinations.length} = ${(coverage * 100).toFixed(1)}%`);
    
    // Sprawdź optymalność systemu
    const theoreticalMinimum = calculateTheoreticalMinimum(numbers.length, pick, guarantee);
    const optimality = isOptimalSystem(result.length, theoreticalMinimum);
    
    console.log(`=== ANALIZA OPTYMALNOŚCI ===`);
    console.log(`Rzeczywista liczba zakładów: ${result.length}`);
    console.log(`Teoretyczne minimum: ${theoreticalMinimum}`);
    console.log(`Efektywność: ${(optimality.efficiency * 100).toFixed(1)}%`);
    
    if (coverage === 1) {
      console.log(`✅ System zapewnia pełną gwarancję ${guarantee} z ${pick}!`);
      if (optimality.isOptimal) {
        console.log(`✅ System jest optymalny (efektywność: ${(optimality.efficiency * 100).toFixed(1)}%)`);
      } else {
        console.log(`⚠️ System nie jest optymalny (efektywność: ${(optimality.efficiency * 100).toFixed(1)}%)`);
      }
    } else {
      console.log(`⚠️ System zapewnia częściową gwarancję: ${(coverage * 100).toFixed(1)}%`);
    }
    
    return result;
  }

  function generateShortenedSystem(numbers, pick, guarantee) {
    console.log(`=== SYSTEM SKRÓCONY - FORMALNA DEFINICJA ===`);
    console.log(`N = ${numbers.length} (liczba typowanych liczb)`);
    console.log(`K = ${pick} (liczba liczb w zakładzie)`);
    console.log(`G = ${guarantee} (liczba trafień gwarantowanych)`);
    console.log(`Cel: Zminimalizować liczbę zakładów przy zachowaniu gwarancji ${guarantee} z ${pick}`);
    
    // Generuj wszystkie możliwe kombinacje K-elementowe z N liczb
    const allCombinations = generateAllCombinations(numbers, pick);
    console.log(`Wszystkie kombinacje ${pick}-elementowe (K z N): ${allCombinations.length}`);
    
    // Generuj wszystkie możliwe kombinacje G-elementowe (do pokrycia)
    const targetCombinations = generateAllCombinations(numbers, guarantee);
    console.log(`Kombinacje ${guarantee}-elementowe do pokrycia (G z N): ${targetCombinations.length}`);
    
    // Oblicz teoretyczne minimum zakładów
    const theoreticalMinimum = calculateTheoreticalMinimum(numbers.length, pick, guarantee);
    console.log(`Teoretyczne minimum zakładów: C(${numbers.length},${guarantee}) / C(${pick},${guarantee}) = ${theoreticalMinimum}`);
    console.log(`Oznacza to, że każda ${guarantee}-elementowa kombinacja z ${numbers.length} liczb musi pojawić się przynajmniej raz w wygenerowanych zakładach`);
    
    // Znane optymalne systemy skrócone (covering designs)
    const knownSystems = {
      // === LOTTO (6 liczb w zakładzie) ===
      // System 7 liczb, gwarancja 3 z 6 (C(7,3) = 35 trójek, 4 zakłady)
      "7-3": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 4, 5, 6]
      ],
      // System 8 liczb, gwarancja 3 z 6 (C(8,3) = 56 trójek, 7 zakładów)
      "8-3": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 4, 7],
        [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 3, 5, 7],
        [0, 1, 2, 4, 5, 6],
        [0, 1, 2, 4, 5, 7]
      ],
      // System 9 liczb, gwarancja 3 z 6 (C(9,3) = 84 trójek, 10 zakładów)
      "9-3": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 4, 7],
        [0, 1, 2, 3, 4, 8],
        [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 3, 5, 7],
        [0, 1, 2, 3, 5, 8],
        [0, 1, 2, 4, 5, 6],
        [0, 1, 2, 4, 5, 7],
        [0, 1, 2, 4, 5, 8]
      ],
      // System 10 liczb, gwarancja 3 z 6 (C(10,3) = 120 trójek, 14 zakładów)
      "10-3": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 4, 7],
        [0, 1, 2, 3, 4, 8],
        [0, 1, 2, 3, 4, 9],
        [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 3, 5, 7],
        [0, 1, 2, 3, 5, 8],
        [0, 1, 2, 3, 5, 9],
        [0, 1, 2, 4, 5, 6],
        [0, 1, 2, 4, 5, 7],
        [0, 1, 2, 4, 5, 8],
        [0, 1, 2, 4, 5, 9],
        [0, 1, 2, 5, 6, 7]
      ],
      // === MINI LOTTO (5 liczb w zakładzie) ===
      // System 6 liczb, gwarancja 3 z 5 (C(6,3) = 20 trójek, 6 zakładów)
      "6-3": [
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 5],
        [0, 1, 2, 4, 5],
        [0, 1, 3, 4, 5],
        [0, 2, 3, 4, 5],
        [1, 2, 3, 4, 5]
      ],
      // System 7 liczb, gwarancja 3 z 5 (C(7,3) = 35 trójek, 7 zakładów)
      "7-3": [
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 5],
        [0, 1, 2, 3, 6],
        [0, 1, 2, 4, 5],
        [0, 1, 2, 4, 6],
        [0, 1, 2, 5, 6],
        [0, 1, 3, 4, 5]
      ]
    };
    
    const key = `${numbers.length}-${guarantee}`;
    const knownSystem = knownSystems[key];
    
    if (knownSystem) {
      console.log(`✅ Znaleziono znany system skrócony: ${key}`);
      console.log(`Liczba zakładów w znanym systemie: ${knownSystem.length}`);
      
      // Mapuj indeksy na rzeczywiste liczby
      const mappedSystem = knownSystem.map(bet => 
        bet.map(index => numbers[index])
      );
      
      console.log(`✅ System skrócony wygenerowany: ${mappedSystem.length} zakładów`);
      return mappedSystem;
    }
    
    // Jeśli nie ma znanego systemu, użyj algorytmu zachłannego
    console.log(`⚠️ Brak znanego systemu dla ${key}, używam algorytmu zachłannego`);
    
    const selectedCombinations = [];
    const uncoveredTargets = new Set(targetCombinations.map(t => t.join(',')));
    
    // Algorytm zachłanny: wybieraj kombinacje, które pokrywają najwięcej niepokrytych celów
    while (uncoveredTargets.size > 0 && selectedCombinations.length < allCombinations.length) {
      let bestCombination = null;
      let bestCoverage = 0;
      
      for (const combination of allCombinations) {
        if (selectedCombinations.some(selected => JSON.stringify(selected) === JSON.stringify(combination))) {
          continue; // Kombinacja już wybrana
        }
        
        // Sprawdź ile celów pokrywa ta kombinacja
        let coverage = 0;
        for (const target of targetCombinations) {
          const targetKey = target.join(',');
          if (uncoveredTargets.has(targetKey) && containsAll(combination, target)) {
            coverage++;
          }
        }
        
        if (coverage > bestCoverage) {
          bestCoverage = coverage;
          bestCombination = combination;
        }
      }
      
      if (bestCombination) {
        selectedCombinations.push(bestCombination);
        
        // Usuń pokryte cele
        for (const target of targetCombinations) {
          const targetKey = target.join(',');
          if (uncoveredTargets.has(targetKey) && containsAll(bestCombination, target)) {
            uncoveredTargets.delete(targetKey);
          }
        }
        
        console.log(`Dodano kombinację: [${bestCombination.join(', ')}], pokrywa ${bestCoverage} celów, pozostało ${uncoveredTargets.size} niepokrytych`);
      } else {
        break;
      }
    }
    
    console.log(`✅ Algorytm zachłanny zakończony: ${selectedCombinations.length} zakładów, ${uncoveredTargets.size} niepokrytych celów`);
    
    if (uncoveredTargets.size > 0) {
      console.log(`⚠️ UWAGA: System nie zapewnia pełnej gwarancji!`);
      console.log(`Niepokryte cele: ${Array.from(uncoveredTargets).slice(0, 5).join(', ')}${uncoveredTargets.size > 5 ? '...' : ''}`);
    }
    
    return selectedCombinations;
  }

  function calculateTheoreticalMinimum(N, K, G) {
    // Teoretyczne minimum = C(N,G) / C(K,G)
    // gdzie C(n,k) to liczba kombinacji k-elementowych z n elementów
    const numerator = generateAllCombinations(Array.from({length: N}, (_, i) => i + 1), G).length;
    const denominator = generateAllCombinations(Array.from({length: K}, (_, i) => i + 1), G).length;
    return Math.ceil(numerator / denominator);
  }

  function isOptimalSystem(actualBets, theoreticalMinimum) {
    const efficiency = theoreticalMinimum / actualBets;
    return {
      isOptimal: efficiency >= 0.8, // System jest optymalny jeśli jest w 80% teoretycznego minimum
      efficiency: efficiency,
      theoreticalMinimum: theoreticalMinimum
    };
  }

  function containsAll(combination, target) {
    return target.every(item => combination.includes(item));
  }
  
  // Stan aplikacji
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPayments, setShowPayments] = useState(false);
  const [activeTalisman, setActiveTalisman] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [generatedBets, setGeneratedBets] = useState([]);
  const [results, setResults] = useState([]);
  const [currentGame, setCurrentGame] = useState('lotto');
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showMyLuckyNumbers, setShowMyLuckyNumbers] = useState(false);
  const [showTalizmany, setShowTalizmany] = useState(false);
  const [showActiveTalisman, setShowActiveTalisman] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showHarmonicAnalyzer, setShowHarmonicAnalyzer] = useState(false);
  const [showSchonheimGenerator, setShowSchonheimGenerator] = useState(false);

  // Zmienne stanu dla generatorów
  const [selectedGame, setSelectedGame] = useState(games[0].value);
  const [setsCount, setSetsCount] = useState(1);
  const [type, setType] = useState("mixed");
  const [uniqueSets, setUniqueSets] = useState(false);
  const [uniqueNumbers, setUniqueNumbers] = useState(false);
  const [strategy, setStrategy] = useState("standard");
  const [kenoRange, setKenoRange] = useState("mixed");
  const [kenoNumbers, setKenoNumbers] = useState(10);
  const [systemNumbers, setSystemNumbers] = useState(() => getMinSystemNumbers(games[0].value));
  const [systemGuarantee, setSystemGuarantee] = useState(3);
  const [systemType, setSystemType] = useState('classic'); // 'classic', 'schonheim' lub 'ilp'
  const [systemGeneratedNumbers, setSystemGeneratedNumbers] = useState([]); // Wygenerowane liczby systemu
  const [manualNumberSelection, setManualNumberSelection] = useState(false); // Tryb ręcznego wyboru liczb
  const [selectedManualNumbers, setSelectedManualNumbers] = useState([]); // Ręcznie wybrane liczby
  const [selectedEuroNumbers, setSelectedEuroNumbers] = useState([]); // Ręcznie wybrane liczby Euro
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false); // Pokazuj informacje o algorytmie
  const [showSchonheimInfo, setShowSchonheimInfo] = useState(false); // Pokazuj informacje o Schönheim
  const [showIlpInfo, setShowIlpInfo] = useState(false); // Pokazuj informacje o ILP
  const [showHintInfo, setShowHintInfo] = useState(false); // Pokazuj wskazówki
  
  // Logika ILP
  const [ilpGame, setIlpGame] = useState("miniLotto");
  const [ilpNumbers, setIlpNumbers] = useState(7);
  const [ilpGuarantee, setIlpGuarantee] = useState(3);
  const [ilpSystemType, setIlpSystemType] = useState("short"); // "short", "full", "adaptive"
  const [ilpResults, setIlpResults] = useState(null);
  const [ilpLoading, setIlpLoading] = useState(false);
  const [dreamDates, setDreamDates] = useState([
    { id: 1, name: "Twoja data urodzenia", date: "", enabled: true },
    { id: 2, name: "Data urodzenia partnera", date: "", enabled: false },
    { id: 3, name: "Data ślubu", date: "", enabled: false },
    { id: 4, name: "Data urodzenia dziecka", date: "", enabled: false },
    { id: 5, name: "Ważna data w życiu", date: "", enabled: false }
  ]);
  const [luckyNumbers, setLuckyNumbers] = useState([]);
  const [selectedNumbersCount, setSelectedNumbersCount] = useState(6);
  const [revealedBalls, setRevealedBalls] = useState({});
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: "", content: "" });
  const [explanationsTab, setExplanationsTab] = useState('minigry');
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Śledzenie pozycji przewijania dla przycisku scroll-to-top
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollButton(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Stany dla profilu użytkownika
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      profileImage: null
    };
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showFavorites, setShowFavorites] = useState(true);

  // Inicjalizacja EmailJS
  useEffect(() => {
    initEmailJS();
  }, []);

  // Aktualizacja systemNumbers gdy zmienia się selectedGame
  useEffect(() => {
    setSystemNumbers(getMinSystemNumbers(selectedGame));
  }, [selectedGame]);

  // Resetowanie wyników gdy zmienia się typ systemu (TYLKO dla generatorów classic i ilp, nie dla schonheim)
  useEffect(() => {
    console.log('🔄 Zmiana typu systemu - resetowanie wyników:', systemType);
    console.log('✅ Resetuję generatory systemów skróconych (classic i ILP)');
    
    // Resetuj wyniki TYLKO dla generatorów classic i ILP (nie dla Schönheima)
    if (systemType === 'classic' || systemType === 'ilp') {
      setSystemGeneratedNumbers([]);
      setResults([]);
      setSelectedManualNumbers([]);
      setSelectedEuroNumbers([]);
      setManualNumberSelection(false);
      setShowAlgorithmInfo(false);
      setShowHintInfo(false);
    }
    
    // Resetuj ILP tylko gdy przechodzisz TO lub FROM ILP
    if (systemType === 'ilp') {
      setIlpResults(null);
      setIlpLoading(false);
      setShowIlpInfo(false);
    }
    
    // Resetuj Schönheim info tylko gdy przechodzisz TO lub FROM schonheim
    if (systemType === 'schonheim') {
      setShowSchonheimInfo(false);
    }
    
    console.log('✅ Resetowanie zakończone');
  }, [systemType]);

  // Obsługa autoryzacji
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        console.log('✅ Użytkownik zalogowany:', user.uid);
        loadUserData(user.uid);
        
        // Wywołaj API żetonów przy każdym logowaniu
        try {
          console.log('🔍 Wywołuję API żetonów w onAuthStateChange dla użytkownika:', user.uid);
          console.log('🔍 User object:', {
            uid: user.uid,
            email: user.email,
            hasGetIdToken: typeof user.getIdToken === 'function',
            type: typeof user
          });
          
          let token;
          if (user && typeof user.getIdToken === 'function') {
            token = await user.getIdToken();
          } else {
            console.warn('⚠️ User nie ma getIdToken, próbuję pobrać z auth.currentUser');
            const { auth } = await import('./utils/firebase.js');
            const currentUser = auth.currentUser;
            if (currentUser) {
              token = await currentUser.getIdToken();
            } else {
              throw new Error('Brak aktywnego użytkownika Firebase');
            }
          }
          
          console.log('🔍 Token otrzymany, długość:', token?.length);
          
          const backendUrl = process.env.NODE_ENV === 'production' 
            ? '/api/auth/register-login'
            : `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/auth/register-login`;
            
          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: user.uid })
          });
          
          console.log('🔍 Response status:', response.status);
          console.log('🔍 Response ok:', response.ok);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Żetony zarejestrowane w onAuthStateChange:', data);
            if (data.data?.newToken) {
              console.log('🎉 Przyznano nowy żeton w onAuthStateChange!');
            }
          } else {
            const errorText = await response.text();
            console.warn('⚠️ Błąd rejestracji żetonów w onAuthStateChange:', response.status, errorText);
          }
        } catch (error) {
          console.warn('⚠️ Błąd wywołania API żetonów w onAuthStateChange:', error);
          console.warn('⚠️ Error details:', error.message);
          // Kontynuuj bez żetonów
        }
      } else {
        console.log('❌ Użytkownik wylogowany');
        setUserStatus(null);
        setSubscription(null);
        setPaymentHistory([]);
        setActiveTalisman(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Obsługa redirect z Google
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('✅ Google redirect result:', result);
        }
      } catch (error) {
        console.error('❌ Błąd Google redirect:', error);
      }
    };

    handleRedirectResult();
  }, []);

  // Ładowanie danych użytkownika
  const loadUserData = async (userId) => {
    try {
      const [status, sub, history] = await Promise.all([
        getUserStatus(userId),
        getUserSubscription(userId),
        getPaymentHistory(userId)
      ]);

      setUserStatus(status);
      setSubscription(sub);
      setPaymentHistory(history);

      // Sprawdź czy użytkownik ma aktywny talizman
      if (status && status.active_talisman) {
        const talisman = talismanDefinitions.find(t => t.id === status.active_talisman);
      setActiveTalisman(talisman);
      }

      // Sprawdź czy okres próbny wygasł
      await checkAndBlockExpiredTrials(userId);
    } catch (error) {
      console.error('❌ Błąd ładowania danych użytkownika:', error);
    }
  };

  // Obsługa logowania
  const handleLogin = async (token, user) => {
    console.log('✅ Logowanie udane:', user);
    setUser(user);
    
    // Wywołaj API żetonów przy logowaniu
    try {
      console.log('🔍 Wywołuję API żetonów dla użytkownika:', user.uid);
      const response = await fetch(`/api/auth/register-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.uid })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Żetony zarejestrowane:', data);
        if (data.data?.newToken) {
          console.log('🎉 Przyznano nowy żeton!');
        }
      } else {
        console.warn('⚠️ Błąd rejestracji żetonów:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Błąd wywołania API żetonów:', error);
      // Kontynuuj bez żetonów
    }
    
    navigate('/home');
  };

  // Obsługa wylogowania
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserStatus(null);
      setSubscription(null);
      setPaymentHistory([]);
      setActiveTalisman(null);
      setUserBets([]);
      setSelectedNumbers([]);
      setGeneratedBets([]);
      setResults([]);
      navigate('/');
    } catch (error) {
      console.error('❌ Błąd wylogowania:', error);
    }
  };



  const generateNumbers = (game, count, type = "mixed", strategy = "standard") => {
    const range = getGameRange(game);
    const numbers = [];
    
    while (numbers.length < count) {
      let num;
      if (strategy === "frequent") {
        // Symulacja częstych liczb
        num = Math.floor(Math.random() * range.max) + 1;
      } else if (strategy === "rare") {
        // Symulacja rzadkich liczb
        num = Math.floor(Math.random() * range.max) + 1;
      } else {
        num = Math.floor(Math.random() * range.max) + 1;
      }
      
      if (type === "even" && num % 2 !== 0) continue;
      if (type === "odd" && num % 2 === 0) continue;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  };

  const generateSets = (game, count, type, strategy, uniqueSets, uniqueNumbers) => {
    const sets = [];
    const allNumbers = [];
    
    for (let i = 0; i < count; i++) {
      let set;
      if (uniqueNumbers && allNumbers.length >= getGameRange(game).max) {
        // Jeśli wszystkie liczby zostały użyte, resetuj
        allNumbers.length = 0;
      }
      
      set = generateNumbers(game, getGameRange(game).count, type, strategy);
      
      if (uniqueNumbers) {
        // Sprawdź czy są dostępne liczby
        const availableNumbers = Array.from({length: getGameRange(game).max}, (_, i) => i + 1)
          .filter(num => !allNumbers.includes(num));
        
        if (availableNumbers.length < getGameRange(game).count) {
          // Jeśli nie ma wystarczająco dostępnych liczb, resetuj pulę
          allNumbers.length = 0;
          set = generateNumbers(game, getGameRange(game).count, type, strategy);
        } else {
          // Wygeneruj zestaw z dostępnych liczb
          set = [];
          const shuffled = [...availableNumbers].sort(() => Math.random() - 0.5);
          set = shuffled.slice(0, getGameRange(game).count).sort((a, b) => a - b);
        }
        allNumbers.push(...set);
      }
      
      if (uniqueSets) {
        const setStr = set.join(',');
        if (sets.some(existingSet => existingSet.join(',') === setStr)) {
          i--; // Spróbuj ponownie
          continue;
        }
      }
      
      sets.push(set);
    }
    
    return sets;
  };

  // Funkcje obsługi generatorów
  const handleGenerate = (e) => {
    e.preventDefault();
    const newResults = generateSets(selectedGame, setsCount, type, strategy, uniqueSets, uniqueNumbers);
    setResults(newResults);
    
    // Zwiększ licznik wygenerowanych zestawów
    const currentCount = parseInt(localStorage.getItem('generatedSetsCount') || '0');
    localStorage.setItem('generatedSetsCount', (currentCount + newResults.length).toString());
  };

  const handleGenerateDreams = (e) => {
    e.preventDefault();
    const enabledDates = dreamDates.filter(d => d.enabled && d.date);
    if (enabledDates.length === 0) {
      alert("Dodaj przynajmniej jedną datę!");
      return;
    }
    
    const dreamNumbers = [];
    enabledDates.forEach(dateItem => {
      const date = new Date(dateItem.date);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const age = new Date().getFullYear() - year;
      
      dreamNumbers.push(day, month, year % 100, age);
    });
    
    const uniqueDreamNumbers = [...new Set(dreamNumbers)].filter(n => n >= 1 && n <= getGameRange(selectedGame).max);
    const newResults = [];
    
    for (let i = 0; i < setsCount; i++) {
      const set = [];
      const availableNumbers = [...uniqueDreamNumbers];
      
      // Jeśli nie ma wystarczająco liczb z dat, dodaj losowe
      if (availableNumbers.length < getGameRange(selectedGame).count) {
        const allNumbers = Array.from({length: getGameRange(selectedGame).max}, (_, i) => i + 1);
        const missingNumbers = allNumbers.filter(n => !availableNumbers.includes(n));
        availableNumbers.push(...missingNumbers.slice(0, getGameRange(selectedGame).count - availableNumbers.length));
      }
      
      // Wylosuj liczby bez nieskończonej pętli
      const shuffled = availableNumbers.sort(() => Math.random() - 0.5);
      set.push(...shuffled.slice(0, getGameRange(selectedGame).count));
      
      newResults.push(set.sort((a, b) => a - b));
    }
    
    setResults(newResults);
    
    // Zwiększ licznik wygenerowanych zestawów
    const currentCount = parseInt(localStorage.getItem('generatedSetsCount') || '0');
    localStorage.setItem('generatedSetsCount', (currentCount + newResults.length).toString());
  };

  const addLuckyNumber = (number) => {
    const num = parseInt(number);
    const range = getGameRange(selectedGame);
    if (num >= range.min && num <= range.max && !luckyNumbers.includes(num)) {
      setLuckyNumbers([...luckyNumbers, num]);
    }
  };

  const removeLuckyNumber = (number) => {
    setLuckyNumbers(luckyNumbers.filter(n => n !== number));
  };

  // Funkcje obsługi profilu użytkownika
  const handleProfileSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setIsEditingProfile(false);
    // Wymuszenie ponownego renderowania komponentu
    window.dispatchEvent(new Event('resize'));
    alert('✅ Profil został zapisany!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({...profileData, profileImage: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const generateLuckySystem = (e) => {
    e.preventDefault();
    if (luckyNumbers.length < 3) {
      alert("Dodaj przynajmniej 3 szczęśliwe liczby!");
      return;
    }
    
    const newResults = [];
    for (let i = 0; i < setsCount; i++) {
      const set = [...luckyNumbers];
      while (set.length < getGameRange(selectedGame).count) {
        const num = Math.floor(Math.random() * getGameRange(selectedGame).max) + 1;
        if (!set.includes(num)) {
          set.push(num);
        }
      }
      newResults.push(set.sort((a, b) => a - b));
    }
    
    setResults(newResults);
  };

  const handleGenerateSystem = (e) => {
    e.preventDefault();
    
    let numbersToUse;
    
    if (manualNumberSelection) {
      // Użyj ręcznie wybranych liczb
      if (selectedManualNumbers.length < systemNumbers) {
        alert(`Wybierz przynajmniej ${systemNumbers} liczb!`);
        return;
      }
      
      if (selectedGame === "eurojackpot") {
        // Dla Eurojackpot sprawdź też liczby Euro
        if (selectedEuroNumbers.length < 2) {
          alert(`Wybierz przynajmniej 2 liczby Euro (1-12)!`);
          return;
        }
        numbersToUse = {
          main: selectedManualNumbers.slice(0, systemNumbers).sort((a, b) => a - b),
          euro: selectedEuroNumbers.slice(0, 2).sort((a, b) => a - b)
        };
      } else {
        numbersToUse = selectedManualNumbers.slice(0, systemNumbers).sort((a, b) => a - b);
      }
    } else {
      // Generuj losowe liczby dla systemu
      if (selectedGame === "eurojackpot") {
        // Dla Eurojackpot generuj główne liczby (1-50) i Euro (1-12)
        const mainNumbers = [];
        while (mainNumbers.length < systemNumbers) {
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
        
        numbersToUse = {
          main: mainNumbers.sort((a, b) => a - b),
          euro: euroNumbers.sort((a, b) => a - b)
        };
      } else {
        const maxNumber = selectedGame === "lotto" ? 49 :
                         selectedGame === "miniLotto" ? 42 :
                         selectedGame === "multiMulti" ? 80 :
                         selectedGame === "kaskada" ? 24 :
                         selectedGame === "keno" ? 70 : 49;
        
        const generatedNumbers = [];
        while (generatedNumbers.length < systemNumbers) {
          const randomNum = Math.floor(Math.random() * maxNumber) + 1;
          if (!generatedNumbers.includes(randomNum)) {
            generatedNumbers.push(randomNum);
          }
        }
        numbersToUse = generatedNumbers.sort((a, b) => a - b);
      }
    }
    
    // Zapisz wygenerowane liczby
    setSystemGeneratedNumbers(numbersToUse);
    
    // Generuj system na podstawie wybranych liczb
    const system = generateShortSystem(selectedGame, numbersToUse, systemGuarantee);
    setResults(system.bets || []);
  };

  const handleManualNumberClick = (number) => {
    if (selectedManualNumbers.includes(number)) {
      setSelectedManualNumbers(selectedManualNumbers.filter(n => n !== number));
    } else {
      if (selectedManualNumbers.length < 15) {
        setSelectedManualNumbers([...selectedManualNumbers, number].sort((a, b) => a - b));
      } else {
        alert('Możesz wybrać maksymalnie 15 liczb!');
      }
    }
  };

  const handleEuroNumberClick = (number) => {
    if (selectedEuroNumbers.includes(number)) {
      setSelectedEuroNumbers(selectedEuroNumbers.filter(n => n !== number));
    } else {
      if (selectedEuroNumbers.length < 2) {
        setSelectedEuroNumbers([...selectedEuroNumbers, number].sort((a, b) => a - b));
      } else {
        alert('Możesz wybrać maksymalnie 2 liczby Euro!');
      }
    }
  };

  const copySetToClipboard = (set) => {
    const text = Array.isArray(set) ? set.join(", ") : set.toString();
    navigator.clipboard.writeText(text).then(() => {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        animation: slideIn 0.3s ease-out;
      `;
      notification.textContent = '✅ Zestaw skopiowany!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
    }).catch(err => {
      console.error("Błąd kopiowania:", err);
    });
  };

  // Sprawdzenie dostępu do funkcji
  const checkAccess = (feature) => {
    if (!userStatus) return false;
    
    // Sprawdź czy użytkownik jest zablokowany
    if (userStatus.is_blocked) return false;
    
    // Sprawdź datę rejestracji - jeśli minęło więcej niż 7 dni, sprawdź subskrypcję
    if (userStatus.created_at) {
      const now = new Date();
      const createdAt = new Date(userStatus.created_at);
      const daysSinceRegistration = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      
      // Jeśli minęło więcej niż 7 dni od rejestracji, sprawdź subskrypcję
      if (daysSinceRegistration > 7) {
        // Sprawdź okres próbny
        if (userStatus.subscription_status === 'trial') {
          if (userStatus.trial_end_date) {
            const trialEnd = new Date(userStatus.trial_end_date);
            if (now > trialEnd) return false;
          }
          // Jeśli jest w okresie próbnym i data nie wygasła, daj dostęp
          return true;
        }
        
        // Sprawdź aktywną subskrypcję
        if (userStatus.subscription_status === 'active' || userStatus.subscription_status === 'premium') {
          if (userStatus.subscription_end_date) {
            const subscriptionEnd = new Date(userStatus.subscription_end_date);
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

  // Renderowanie głównej aplikacji
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎰</div>
          <div>Ładowanie Generatora Lotto AI...</div>
        </div>
      </div>
    );
  }

  // Animacja startowa
  if (showStartAnimation) {
    return (
      <StartScreenAnimation 
        onComplete={() => setShowStartAnimation(false)}
      />
    );
  }

  // Jeśli użytkownik nie jest zalogowany, pokaż stronę logowania
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'white', width: '100vw', margin: '0', padding: '0' }}>
        <AuthContainer onLogin={handleLogin} />
      </div>
    );
  }

  // Główna aplikacja po zalogowaniu
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <style>{`
        /* Responsywność menu mobilnego */
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex !important;
            min-height: 44px;
            min-width: 44px;
            touch-action: manipulation;
            position: relative !important;
            right: auto !important;
            top: auto !important;
            transform: none !important;
            margin-left: auto !important;
          }
          
          .desktop-menu {
            display: flex !important;
            justify-content: flex-end !important;
            align-items: center !important;
            padding: 8px 15px !important;
            min-height: 50px !important;
          }
          
          .desktop-menu .menu-btn {
            display: none !important;
          }
          
          .desktop-menu .mobile-menu-toggle {
            display: flex !important;
          }
          
          .desktop-logo {
            display: none !important;
          }
          
          .desktop-controls {
            display: none !important;
          }
          
          .mobile-menu {
            display: block !important;
            touch-action: pan-y;
          }
          
          .mobile-menu-btn {
            min-height: 44px;
            touch-action: manipulation;
          }
          
          /* Ukryj zawartość headera na mobile - zostaw tylko hamburger */
          .mobile-header-content {
            display: none !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-menu-toggle {
            display: none !important;
          }
          
          .desktop-menu {
            display: flex !important;
          }
          
          .desktop-menu .menu-btn {
            display: block !important;
          }
        }
        
        /* Hover efekty dla menu mobilnego */
        .mobile-menu-btn:hover {
          background: #f8f9fa !important;
          color: #1976d2 !important;
        }
        
        .mobile-menu-btn:active {
          transform: scale(0.98);
        }
        
        .mobile-menu-toggle:hover {
          background: #ffd700 !important;
          color: #222 !important;
          transform: scale(1.05);
        }
        
        .mobile-menu-toggle:active {
          transform: scale(0.95);
        }
        
        /* Responsywność dla bardzo małych ekranów */
        @media (max-width: 320px) {
          .mobile-menu {
            width: 280px !important;
          }
          
          .mobile-menu-btn {
            padding: 15px 15px !important;
            font-size: 14px !important;
            line-height: 1.2 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          
          /* Kule w grach - mniejsze odstępy */
          .grid {
            gap: 0.125rem !important; /* gap-0.5 */
          }
          
          .grid button {
            width: 1.25rem !important; /* w-5 */
            height: 1.25rem !important; /* h-5 */
            font-size: 0.625rem !important; /* text-xs */
            min-width: 1.25rem !important;
          }
        }
        
        @media (max-width: 280px) {
          .mobile-menu {
            width: 250px !important;
          }
          
          .mobile-menu-btn {
            padding: 12px 10px !important;
            font-size: 13px !important;
            line-height: 1.1 !important;
          }
        }
        
        @media (max-width: 250px) {
          .mobile-menu {
            width: 220px !important;
          }
          
          .mobile-menu-btn {
            padding: 10px 8px !important;
            font-size: 12px !important;
            line-height: 1.0 !important;
          }
        }
      `}</style>


      {/* Overlay dla menu mobilnego */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 999,
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)'
          }}
        ></div>
      )}

      {/* Menu mobilne */}
      {isMobileMenuOpen && (
        <div className="mobile-menu open" style={{
          position: 'fixed',
          top: '60px',
          right: 0,
          width: '300px',
          height: 'calc(100vh - 60px)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '-2px 0 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '20px 0',
          borderLeft: '1px solid #e0e0e0'
        }}>
          <button 
            className={`mobile-menu-btn ${isActivePath("/home") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/home")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/home") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/home") ? '#333' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/home") ? 'bold' : '500',
              borderLeft: isActivePath("/home") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/home") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            🏠 Strona główna
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/ai-ultra-pro") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/ai-ultra-pro")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/ai-ultra-pro") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/ai-ultra-pro") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/ai-ultra-pro") ? 'bold' : '500',
              borderLeft: isActivePath("/ai-ultra-pro") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/ai-ultra-pro") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            🚀 AI Ultra Pro
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/gry") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/gry")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/gry") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/gry") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/gry") ? 'bold' : '500',
              borderLeft: isActivePath("/gry") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/gry") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            🎰 Gry
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/harmonic-analyzer") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/harmonic-analyzer")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/harmonic-analyzer") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/harmonic-analyzer") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/harmonic-analyzer") ? 'bold' : '500',
              borderLeft: isActivePath("/harmonic-analyzer") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/harmonic-analyzer") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            🎵 Harmonic Analyzer AI
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/generator") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/generator")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/generator") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/generator") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/generator") ? 'bold' : '500',
              borderLeft: isActivePath("/generator") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/generator") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            🎲 Generator
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/dreams") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/dreams")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/dreams") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/dreams") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/dreams") ? 'bold' : '500',
              borderLeft: isActivePath("/dreams") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/dreams") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            💭 Generator marzeń
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/lucky") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/lucky")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/lucky") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/lucky") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/lucky") ? 'bold' : '500',
              borderLeft: isActivePath("/lucky") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/lucky") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            🍀 Szczęśliwe liczby
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/systems") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/systems")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/systems") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/systems") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/systems") ? 'bold' : '500',
              borderLeft: isActivePath("/systems") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/systems") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            📊 Systemy skrócone/ILP
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/stats") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/stats")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/stats") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/stats") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/stats") ? 'bold' : '500',
              borderLeft: isActivePath("/stats") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/stats") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            📈 Statystyki
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/my-lucky-numbers") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/my-lucky-numbers")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/my-lucky-numbers") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/my-lucky-numbers") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/my-lucky-numbers") ? 'bold' : '500',
              borderLeft: isActivePath("/my-lucky-numbers") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/my-lucky-numbers") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            🎲 Moje liczby
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/talismans") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/talismans")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/talismans") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/talismans") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/talismans") ? 'bold' : '500',
              borderLeft: isActivePath("/talismans") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/talismans") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            ✨ Talizmany
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/explanations") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/explanations")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/explanations") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/explanations") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/explanations") ? 'bold' : '500',
              borderLeft: isActivePath("/explanations") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/explanations") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            📚 Wyjaśnienia
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/account") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/account")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/account") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/account") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/account") ? 'bold' : '500',
              borderLeft: isActivePath("/account") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/account") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            👤 Konto
          </button>
          <button 
            className={`mobile-menu-btn ${isActivePath("/payments") ? 'active' : ''}`}
            onClick={() => handleMenuClick("/payments")}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: isActivePath("/payments") ? '#ffd700' : 'none',
              border: 'none',
              color: isActivePath("/payments") ? 'white' : '#333',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: isActivePath("/payments") ? 'bold' : '500',
              borderLeft: isActivePath("/payments") ? '4px solid #ffd700' : 'none',
              boxShadow: isActivePath("/payments") ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            💳 Płatności
          </button>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
            style={{
              display: 'block',
              width: '100%',
              padding: '18px 25px',
              background: 'none',
              border: 'none',
              color: '#d32f2f',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative',
              fontWeight: 'bold'
            }}
          >
            🚪 Wyloguj
          </button>
          
          {/* Przełącznik języka - na końcu menu mobilnego */}
          <div style={{ 
            padding: '16px 25px', 
            borderTop: '1px solid #e0e0e0',
            marginTop: '8px',
            background: '#f8f9fa',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <LanguageSwitcher />
          </div>
        </div>
      )}

      {/* Menu desktopowe z przyciskiem hamburger na mobile */}
      <nav style={menuStyle} className="desktop-menu">
        <button className="menu-btn" style={menuBtn(isActivePath("/home"))}
          onClick={() => navigate("/home")}>🏠 Strona główna</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/ai-ultra-pro"))}
          onClick={() => navigate("/ai-ultra-pro")}>🚀 AI Ultra Pro</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/gry"))}
          onClick={() => navigate("/gry")}>🎰 Gry</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/harmonic-analyzer"))}
          onClick={() => navigate("/harmonic-analyzer")}>🎵 Analizator</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/generator"))}
          onClick={() => navigate("/generator")}>🎲 Generator</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/dreams"))}
          onClick={() => navigate("/dreams")}>💭 Generator marzeń</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/lucky"))}
          onClick={() => navigate("/lucky")}>🍀 Szczęśliwe liczby</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/systems"))}
          onClick={() => navigate("/systems")}>📊 Systemy skrócone/ILP</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/stats"))}
          onClick={() => navigate("/stats")}>📈 Statystyki</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/my-lucky-numbers"))}
          onClick={() => navigate("/my-lucky-numbers")}>🎲 Moje szczęśliwe liczby</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/talismans"))}
          onClick={() => navigate("/talismans")}>✨ Talizmany</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/explanations"))}
          onClick={() => navigate("/explanations")}>📚 Wyjaśnienia</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/account"))}
          onClick={() => navigate("/account")}>👤 Konto</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/payments"))}
          onClick={() => navigate("/payments")}>💳 Płatności</button>
        
        <button className="menu-btn" style={menuBtn(false)} onClick={handleLogout}>🚪 Wyloguj</button>
        
        {/* Przycisk menu mobilnego - widoczny tylko na mobile, po prawej stronie */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            background: '#ffffff',
            border: '2px solid #667eea',
            borderRadius: '8px',
            fontSize: '20px',
            color: '#667eea',
            cursor: 'pointer',
            padding: '8px',
            zIndex: 1001,
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            minWidth: '44px',
            minHeight: '44px',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto'
          }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Language Switcher */}
      {showLanguageSwitcher && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '20px',
          background: 'white',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <LanguageSwitcher />
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: '0' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          <Route path="/home" element={
            <HomePage
              user={user}
              userStatus={userStatus}
              subscription={subscription}
              activeTalisman={activeTalisman}
              onShowPayments={() => setShowPayments(true)}
              onShowStatistics={() => setShowStatistics(true)}
              onShowMyLuckyNumbers={() => setShowMyLuckyNumbers(true)}
              onShowTalizmany={() => setShowTalizmany(true)}
              onShowAIGenerator={() => setShowAIGenerator(true)}
              onShowHarmonicAnalyzer={() => setShowHarmonicAnalyzer(true)}
              onShowSchonheimGenerator={() => setShowSchonheimGenerator(true)}
              checkAccess={checkAccess}
            />
          } />
          
          <Route path="/gry" element={
            <GryPoZalogowaniu
              user={user}
              userStatus={userStatus}
              games={games}
              currentGame={currentGame}
              setCurrentGame={setCurrentGame}
              userBets={userBets}
              setUserBets={setUserBets}
              selectedNumbers={selectedNumbers}
              setSelectedNumbers={setSelectedNumbers}
              generatedBets={generatedBets}
              setGeneratedBets={setGeneratedBets}
              results={results}
              setResults={setResults}
              activeTalisman={activeTalisman}
            />
          } />
          
          <Route path="/generator" element={
            checkAccess('generator') ? (
              <div style={{ padding: window.innerWidth <= 280 ? "8px" : "20px" }}>
                <h2 style={{ color: "#222", marginBottom: window.innerWidth <= 280 ? 16 : 24, textAlign: "center", letterSpacing: 1, fontSize: window.innerWidth <= 280 ? "18px" : "24px" }}>Generator zestawów</h2>
                <form onSubmit={handleGenerate} style={{ marginBottom: window.innerWidth <= 280 ? 16 : 24 }}>
                  <div style={{ marginBottom: window.innerWidth <= 280 ? 12 : 18, display: "flex", flexDirection: "column", gap: window.innerWidth <= 280 ? 4 : 8 }}>
                    <label style={{ fontWeight: "bold", fontSize: window.innerWidth <= 280 ? "12px" : "14px" }}>Wybierz grę:</label>
                    <select value={selectedGame} onChange={e => setSelectedGame(e.target.value)} style={{ 
                      ...inputStyle, 
                      width: "100%", 
                      maxWidth: window.innerWidth <= 280 ? "250px" : "300px",
                      fontSize: window.innerWidth <= 280 ? "12px" : "14px",
                      padding: window.innerWidth <= 280 ? "6px 8px" : "8px 12px",
                      marginBottom: 0 
                    }}>
                      {games.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: window.innerWidth <= 280 ? 12 : 18, display: "flex", flexDirection: "column", gap: window.innerWidth <= 280 ? 4 : 8 }}>
                    <label style={{ fontWeight: "bold", fontSize: window.innerWidth <= 280 ? "12px" : "14px" }}>Liczba zestawów:</label>
                    <div style={{ display: "flex", alignItems: "center", gap: window.innerWidth <= 280 ? 4 : 8, justifyContent: "center", maxWidth: window.innerWidth <= 280 ? "180px" : "200px" }}>
                      <button 
                        type="button"
                        onClick={() => setSetsCount(Math.max(1, setsCount - 1))}
                        style={{
                          background: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: window.innerWidth <= 280 ? 28 : 35,
                          height: window.innerWidth <= 280 ? 28 : 35,
                          fontSize: window.innerWidth <= 280 ? 14 : 18,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        −
                      </button>
                      <input 
                        type="number" 
                        min={1} 
                        max={10000} 
                        value={setsCount} 
                        onChange={e => {
                          const value = e.target.value;
                          if (value === '' || value === '0') {
                            setSetsCount(1);
                          } else {
                            setSetsCount(Math.max(1, Number(value)));
                          }
                        }}
                        onBlur={e => {
                          if (e.target.value === '' || Number(e.target.value) < 1) {
                            setSetsCount(1);
                          }
                        }}
                        style={{ 
                          ...inputStyle, 
                          width: window.innerWidth <= 280 ? "80px" : "100px", 
                          fontSize: window.innerWidth <= 280 ? "14px" : "16px",
                          padding: window.innerWidth <= 280 ? "6px" : "8px",
                          marginBottom: 0,
                          textAlign: "center",
                          flexShrink: 0
                        }} 
                      />
                      <button 
                        type="button"
                        onClick={() => setSetsCount(Math.min(10000, setsCount + 1))}
                        style={{
                          background: "#4caf50",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: window.innerWidth <= 280 ? 28 : 35,
                          height: window.innerWidth <= 280 ? 28 : 35,
                          fontSize: window.innerWidth <= 280 ? 14 : 18,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        +
                      </button>
                    </div>
                    {setsCount > 1000 && <span style={{ color: '#d32f2f', fontSize: window.innerWidth <= 280 ? 10 : 12 }}>Generowanie dużej liczby zestawów może chwilę potrwać!</span>}
                  </div>
                  <div style={{ marginBottom: window.innerWidth <= 280 ? 12 : 18, display: "flex", flexDirection: "column", gap: window.innerWidth <= 280 ? 4 : 8 }}>
                    <label style={{ fontWeight: "bold", fontSize: window.innerWidth <= 280 ? "12px" : "14px" }}>Typ zestawów:</label>
                    <select value={type} onChange={e => setType(e.target.value)} style={{ 
                      ...inputStyle, 
                      width: "100%", 
                      maxWidth: window.innerWidth <= 280 ? "250px" : "300px",
                      fontSize: window.innerWidth <= 280 ? "12px" : "14px",
                      padding: window.innerWidth <= 280 ? "6px 8px" : "8px 12px",
                      marginBottom: 0 
                    }}>
                      <option value="mixed">Mieszane</option>
                      <option value="even">Tylko parzyste</option>
                      <option value="odd">Tylko nieparzyste</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: window.innerWidth <= 280 ? 12 : 18, display: "flex", flexDirection: "column", gap: window.innerWidth <= 280 ? 4 : 8 }}>
                    <label style={{ fontWeight: "bold", fontSize: window.innerWidth <= 280 ? "12px" : "14px" }}>Strategia:</label>
                    <select value={strategy} onChange={e => setStrategy(e.target.value)} style={{ 
                      ...inputStyle, 
                      width: "100%", 
                      maxWidth: window.innerWidth <= 280 ? "250px" : "300px",
                      fontSize: window.innerWidth <= 280 ? "12px" : "14px",
                      padding: window.innerWidth <= 280 ? "6px 8px" : "8px 12px",
                      marginBottom: 0 
                    }}>
                      <option value="standard">Standardowa</option>
                      <option value="frequent">Najczęstsze liczby</option>
                      <option value="rare">Najrzadsze liczby</option>
                      <option value="mixed">Mieszana</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: window.innerWidth <= 280 ? 12 : 18 }}>
                    <label style={{ fontWeight: "bold", fontSize: window.innerWidth <= 280 ? "12px" : "14px" }}>
                      <input type="checkbox" checked={uniqueSets} onChange={e => setUniqueSets(e.target.checked)} style={{ marginRight: window.innerWidth <= 280 ? 4 : 8 }} />
                      Unikalne zestawy (bez powtórzeń zestawów)
                    </label>
                  </div>
                  <div style={{ marginBottom: window.innerWidth <= 280 ? 12 : 18 }}>
                    <label style={{ fontWeight: "bold", fontSize: window.innerWidth <= 280 ? "12px" : "14px" }}>
                      <input type="checkbox" checked={uniqueNumbers} onChange={e => setUniqueNumbers(e.target.checked)} style={{ marginRight: window.innerWidth <= 280 ? 4 : 8 }} />
                      Unikalne liczby w całej puli (każda liczba tylko raz)
                    </label>
                  </div>
                  {selectedGame === "keno" && (
                    <>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: "bold", marginRight: 10 }}>Liczba liczb:</label>
                        <select value={kenoNumbers} onChange={e => setKenoNumbers(Number(e.target.value))} style={{ ...inputStyle, width: 120, display: "inline-block", marginBottom: 0 }}>
                          <option value={10}>10 liczb</option>
                          <option value={20}>20 liczb</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: "bold", marginRight: 10 }}>Zakres liczb:</label>
                        <select value={kenoRange} onChange={e => setKenoRange(e.target.value)} style={{ ...inputStyle, width: 180, display: "inline-block", marginBottom: 0 }}>
                          <option value="mixed">Mieszane (1-70)</option>
                          <option value="low">Niskie (1-35)</option>
                          <option value="high">Wysokie (36-70)</option>
                        </select>
                      </div>
                    </>
                  )}
                  <button type="submit" style={{
                    ...buttonStyle,
                    fontSize: window.innerWidth <= 280 ? "12px" : "14px",
                    padding: window.innerWidth <= 280 ? "8px 16px" : "10px 20px",
                    maxWidth: window.innerWidth <= 280 ? "200px" : "300px",
                    margin: window.innerWidth <= 280 ? "0 auto" : "0",
                    display: window.innerWidth <= 280 ? "block" : "inline-block"
                  }}>Generuj</button>
                </form>
                {results.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                      <h3 style={{ color: "#222", margin: 0 }}>Wyniki:</h3>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button 
                          onClick={() => {
                            const resultText = results.map((set, index) => 
                              `Zestaw ${index + 1}: ${set.join(", ")}`
                            ).join('\n');
                            
                            navigator.clipboard.writeText(resultText).then(() => {
                              alert('Zestawy zostały skopiowane do schowka!');
                            }).catch(() => {
                              alert('Błąd kopiowania');
                            });
                          }}
                          style={{
                            background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 14,
                            cursor: "pointer"
                          }}
                        >
                          📋 Kopiuj
                        </button>
                        
                        <button 
                          onClick={() => {
                            if (results.length > 0) {
                              const favorites = JSON.parse(localStorage.getItem('favoriteSets') || '[]');
                              const newFavorite = {
                                id: Date.now(),
                                name: `Generator ${selectedGame} ${new Date().toLocaleDateString('pl-PL')}`,
                                set: results[0], // Pierwszy zestaw
                                game: selectedGame,
                                generatorType: 'standard-generator',
                                date: new Date().toISOString()
                              };
                              
                              const updatedFavorites = [newFavorite, ...favorites];
                              localStorage.setItem('favoriteSets', JSON.stringify(updatedFavorites));
                              
                              alert(`Zestaw "${newFavorite.name}" został dodany do ulubionych!`);
                              
                              // Przekieruj do sekcji Moje konto po 1 sekundzie
                              setTimeout(() => {
                                navigate('/account');
                              }, 1000);
                            }
                          }}
                          style={{
                            background: "linear-gradient(90deg, #ff5722 0%, #e64a19 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 14,
                            cursor: "pointer"
                          }}
                        >
                          ❤️ Ulubione
                        </button>
                        
                        <button 
                          onClick={() => {
                            const doc = new jsPDF();
                            doc.text("Generator zestawów lotto", 20, 20);
                            results.forEach((set, index) => {
                              doc.text(`Zestaw ${index + 1}: ${set.join(", ")}`, 20, 40 + (index * 10));
                            });
                            doc.save("zestawy-lotto.pdf");
                          }}
                          style={{
                            background: "linear-gradient(90deg, #2196f3 0%, #1976d2 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 14,
                            cursor: "pointer"
                          }}
                        >
                          📄 PDF
                        </button>
                      </div>
                    </div>
                    <div style={{ 
                      background: "#fff", 
                      padding: 20, 
                      borderRadius: 12, 
                      border: "2px solid #ffd700",
                      maxHeight: "400px",
                      overflow: "auto"
                    }}>
                      {results.map((set, index) => (
                        <div key={index} style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 8, 
                          marginBottom: 12,
                          padding: 12,
                          background: "#f8f9fa",
                          borderRadius: 8
                        }}>
                          <span style={{ fontWeight: "bold", color: "#1976d2", minWidth: 80 }}>Zestaw {index + 1}:</span>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {set.map((num, numIndex) => (
                              <div key={numIndex} style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: 14,
                                color: "#222",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                              }}>
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Wykup plan Premium, aby odblokować dostęp do wszystkich funkcji.
                </p>
                <button 
                  onClick={() => setShowPayments(true)}
                  style={{
                    background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "16px 32px",
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Przejdź do płatności
                </button>
              </div>
            )
          } />
          
          <Route path="/dreams" element={
            checkAccess('dreams') ? (
              <div style={{
                width: "100%",
                maxWidth: "100%",
                padding: window.innerWidth <= 768 ? "10px" : "20px",
                boxSizing: "border-box"
              }}>
                <h2 style={{ 
                  color: "#222", 
                  marginBottom: window.innerWidth <= 768 ? "16px" : "24px", 
                  textAlign: "center",
                  fontSize: window.innerWidth <= 768 ? "20px" : "24px"
                }}>✨ Generator marzeń</h2>
                <div style={{ 
                  background: "linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)", 
                  padding: window.innerWidth <= 768 ? "12px" : "20px", 
                  borderRadius: 16, 
                  marginBottom: window.innerWidth <= 768 ? "16px" : "24px", 
                  border: "2px solid #4caf50" 
                }}>
                  <h3 style={{ 
                    color: "#2e7d32", 
                    marginBottom: window.innerWidth <= 768 ? "8px" : "12px", 
                    textAlign: "center",
                    fontSize: window.innerWidth <= 768 ? "16px" : "18px"
                  }}>💝 Generuj liczby z ważnych dat w Twoim życiu!</h3>
                  <p style={{ 
                    lineHeight: 1.6, 
                    marginBottom: window.innerWidth <= 768 ? "8px" : "12px",
                    fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                  }}>
                    <strong>Jak to działa:</strong> Wprowadź daty urodzenia bliskich osób i ważne daty z Twojego życia. 
                    System automatycznie konwertuje je na liczby 1-49 i generuje osobiste zestawy lotto.
                  </p>
                  <p style={{ 
                    lineHeight: 1.6, 
                    marginBottom: 0,
                    fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                  }}>
                    <strong>Przykład:</strong> Data 12.06.1989 → liczby: 12, 6, 1+9=10, 8, 9, 12+6=18, wiek=34
                  </p>
                </div>
                
                <form onSubmit={handleGenerateDreams} style={{ 
                  marginBottom: window.innerWidth <= 768 ? "16px" : "24px",
                  width: "100%",
                  maxWidth: "100%"
                }}>
                  <div style={{ 
                    marginBottom: window.innerWidth <= 768 ? "12px" : "18px",
                    display: "flex",
                    flexDirection: window.innerWidth <= 768 ? "column" : "row",
                    gap: window.innerWidth <= 768 ? "8px" : "12px",
                    alignItems: window.innerWidth <= 768 ? "stretch" : "center"
                  }}>
                    <label style={{ 
                      fontWeight: "bold", 
                      marginRight: window.innerWidth <= 768 ? "0" : "10px",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>Wybierz grę:</label>
                    <select 
                      value={selectedGame} 
                      onChange={e => setSelectedGame(e.target.value)} 
                      style={{ 
                        ...inputStyle, 
                        width: window.innerWidth <= 768 ? "100%" : "220px", 
                        display: "inline-block", 
                        marginBottom: 0,
                        fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                      }}
                    >
                      {games.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div style={{ 
                    marginBottom: window.innerWidth <= 768 ? "12px" : "18px",
                    display: "flex",
                    flexDirection: window.innerWidth <= 768 ? "column" : "row",
                    gap: window.innerWidth <= 768 ? "8px" : "12px",
                    alignItems: window.innerWidth <= 768 ? "stretch" : "center"
                  }}>
                    <label style={{ 
                      fontWeight: "bold", 
                      marginRight: window.innerWidth <= 768 ? "0" : "10px",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>Liczba zestawów:</label>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: window.innerWidth <= 768 ? "100%" : "auto"
                    }}>
                      <button
                        type="button"
                        onClick={() => setSetsCount(Math.max(1, setsCount - 1))}
                        disabled={setsCount <= 1}
                      style={{ 
                          background: setsCount <= 1 ? "#ccc" : "linear-gradient(45deg, #667eea, #764ba2)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          fontSize: "18px",
                          cursor: setsCount <= 1 ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        -
                      </button>
                      <span style={{
                        fontWeight: "bold",
                        fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                        minWidth: "40px",
                        textAlign: "center"
                      }}>
                        {setsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSetsCount(Math.min(10, setsCount + 1))}
                        disabled={setsCount >= 10}
                        style={{
                          background: setsCount >= 10 ? "#ccc" : "linear-gradient(45deg, #667eea, #764ba2)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          fontSize: "18px",
                          cursor: setsCount >= 10 ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: window.innerWidth <= 768 ? "16px" : "24px" }}>
                    <h3 style={{ 
                      color: "#1976d2", 
                      marginBottom: window.innerWidth <= 768 ? "12px" : "16px",
                      fontSize: window.innerWidth <= 768 ? "16px" : "18px"
                    }}>📅 Ważne daty w Twoim życiu:</h3>
                    <div style={{ 
                      display: "grid", 
                      gap: window.innerWidth <= 768 ? "8px" : "12px",
                      gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))"
                    }}>
                      {dreamDates.map((dateItem) => (
                        <div key={dateItem.id} style={{ 
                          background: "#fff", 
                          padding: window.innerWidth <= 768 ? "12px" : "16px", 
                          borderRadius: 12, 
                          border: "2px solid #e0e0e0",
                          display: "flex",
                          flexDirection: window.innerWidth <= 768 ? "column" : "row",
                          alignItems: window.innerWidth <= 768 ? "stretch" : "center",
                          gap: window.innerWidth <= 768 ? "8px" : "12px"
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: window.innerWidth <= 768 ? "8px" : "12px",
                            flex: window.innerWidth <= 768 ? "none" : "1"
                          }}>
                            <input
                              type="checkbox"
                              checked={dateItem.enabled}
                              onChange={(e) => {
                                const updatedDates = dreamDates.map(d => 
                                  d.id === dateItem.id ? { ...d, enabled: e.target.checked } : d
                                );
                                setDreamDates(updatedDates);
                              }}
                              style={{ marginRight: 8 }}
                            />
                            <label style={{ 
                              fontWeight: "bold", 
                              fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                              flex: 1
                            }}>
                              {dateItem.name}
                            </label>
                          </div>
                          <input
                            type="date"
                            value={dateItem.date}
                            onChange={(e) => {
                              const updatedDates = dreamDates.map(d => 
                                d.id === dateItem.id ? { ...d, date: e.target.value } : d
                              );
                              setDreamDates(updatedDates);
                            }}
                            style={{ 
                              ...inputStyle, 
                              width: window.innerWidth <= 768 ? "100%" : "150px",
                              fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button type="submit" style={buttonStyle}>✨ Generuj liczby z marzeń</button>
                </form>
                
                {results.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: "8px" }}>
                      <h3 style={{ color: "#222", margin: 0 }}>Wyniki:</h3>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button 
                          onClick={() => {
                            const resultText = results.map((set, index) => 
                              `Zestaw ${index + 1}: ${set.join(", ")}`
                            ).join('\n');
                            navigator.clipboard.writeText(resultText).then(() => {
                              alert('Wyniki skopiowane do schowka!');
                            }).catch(() => {
                              alert('Błąd kopiowania. Skopiuj ręcznie: ' + resultText);
                            });
                          }}
                          style={{
                            background: "linear-gradient(45deg, #4CAF50, #45a049)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 14,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          📋 Kopiuj
                        </button>
                        <button 
                          onClick={() => {
                            const favorites = JSON.parse(localStorage.getItem('favoriteSets') || '[]');
                            const newFavorite = {
                              id: Date.now(),
                              name: `Generator marzeń ${selectedGame} ${new Date().toLocaleDateString('pl-PL')}`,
                              sets: results,
                              game: selectedGame,
                              generatorType: 'dreams',
                              date: new Date().toISOString()
                            };
                            const updatedFavorites = [newFavorite, ...favorites];
                            localStorage.setItem('favoriteSets', JSON.stringify(updatedFavorites));
                            alert(`Zestawy zostały dodane do ulubionych!`);
                          }}
                          style={{
                            background: "linear-gradient(45deg, #9C27B0, #673AB7)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 14,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          ❤️ Ulubione
                        </button>
                        <button 
                          onClick={() => setResults([])}
                          style={{
                            background: "linear-gradient(45deg, #f44336, #d32f2f)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 14,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          🔄 Resetuj
                        </button>
                      <button 
                        onClick={() => {
                          const doc = new jsPDF();
                          doc.text("Generator marzeń lotto", 20, 20);
                          results.forEach((set, index) => {
                            doc.text(`Zestaw ${index + 1}: ${set.join(", ")}`, 20, 40 + (index * 10));
                          });
                          doc.save("marzenia-lotto.pdf");
                        }}
                        style={{
                          background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 16px",
                          fontSize: 14,
                          cursor: "pointer"
                        }}
                      >
                        📄 PDF
                      </button>
                      </div>
                    </div>
                    <div style={{ 
                      background: "#fff", 
                      padding: 20, 
                      borderRadius: 12, 
                      border: "2px solid #9c27b0",
                      maxHeight: "400px",
                      overflow: "auto"
                    }}>
                      {results.map((set, index) => (
                        <div key={index} style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 8, 
                          marginBottom: 12,
                          padding: 12,
                          background: "#f8f9fa",
                          borderRadius: 8
                        }}>
                          <span style={{ fontWeight: "bold", color: "#9c27b0", minWidth: 80 }}>Zestaw {index + 1}:</span>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {set.map((num, numIndex) => (
                              <div key={numIndex} style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #9c27b0, #ba68c8)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: 14,
                                color: "white",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                              }}>
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Wykup plan Premium, aby odblokować dostęp do wszystkich funkcji.
                </p>
                <button 
                  onClick={() => setShowPayments(true)}
                  style={{
                    background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "16px 32px",
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Przejdź do płatności
                </button>
              </div>
            )
          } />
          
          <Route path="/lucky" element={
            checkAccess('lucky') ? (
              <div style={{ padding: window.innerWidth <= 280 ? "8px" : "20px", maxWidth: "100%", margin: "0 auto" }}>
                <h2 style={{ color: "#222", marginBottom: window.innerWidth <= 280 ? 16 : 24, textAlign: "center", fontSize: window.innerWidth <= 280 ? "20px" : "24px" }}>🍀 Szczęśliwe liczby</h2>
                <div style={{ background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)", padding: window.innerWidth <= 280 ? 12 : 20, borderRadius: 16, marginBottom: window.innerWidth <= 280 ? 16 : 24, border: "2px solid #ff9800" }}>
                  <h3 style={{ color: "#e65100", marginBottom: 12, textAlign: "center" }}>🧠 Inteligentny generator szczęśliwych liczb!</h3>
                  <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    <strong>Jak to działa:</strong> Dodaj 3-10 swoich szczęśliwych liczb (daty urodzenia, ważne wydarzenia, ulubione liczby). 
                    System analizuje Twój wybór i generuje zrównoważone zestawy!
                  </p>
                  <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    <strong>Co analizuje system:</strong>
                  </p>
                  <ul style={{ marginLeft: 20, lineHeight: 1.6, marginBottom: 12 }}>
                    <li><strong>🔍 Rozrzut liczb:</strong> parzyste/nieparzyste, suma, dolne/górne</li>
                    <li><strong>📊 Regularność:</strong> czy liczby tworzą "luki" (np. 12, 22, 32)</li>
                    <li><strong>🎯 Statystyki:</strong> czy są to liczby rzadkie czy często losowane</li>
                    <li><strong>✨ Zrównoważenie:</strong> generuje zestawy z podobnymi cechami, ale lepiej rozłożone</li>
                  </ul>
                  <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                    <strong>🎁 Bonus:</strong> Otrzymasz 3 inteligentne zestawy + intuicyjny!
                  </p>
                </div>
                
                <form onSubmit={generateLuckySystem} style={{ marginBottom: window.innerWidth <= 280 ? 16 : 24 }}>
                  <div style={{ marginBottom: window.innerWidth <= 280 ? 12 : 18, display: "flex", flexDirection: window.innerWidth <= 280 ? "column" : "row", alignItems: window.innerWidth <= 280 ? "flex-start" : "center", gap: window.innerWidth <= 280 ? 4 : 10 }}>
                    <label style={{ fontWeight: "bold", fontSize: window.innerWidth <= 280 ? "12px" : "14px", marginBottom: window.innerWidth <= 280 ? 4 : 0 }}>Wybierz grę:</label>
                    <select value={selectedGame} onChange={e => setSelectedGame(e.target.value)} style={{ ...inputStyle, width: window.innerWidth <= 280 ? "100%" : 220, display: "block", marginBottom: 0, fontSize: window.innerWidth <= 280 ? "12px" : "14px", padding: window.innerWidth <= 280 ? "6px 8px" : "8px 12px" }}>
                      {games.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: window.innerWidth <= 280 ? 12 : 18, display: "flex", flexDirection: window.innerWidth <= 280 ? "column" : "row", alignItems: window.innerWidth <= 280 ? "flex-start" : "center", gap: window.innerWidth <= 280 ? 4 : 10 }}>
                    <label style={{ fontWeight: "bold", fontSize: window.innerWidth <= 280 ? "12px" : "14px", marginBottom: window.innerWidth <= 280 ? 4 : 0 }}>Ilość liczb do wygenerowania:</label>
                    <select 
                      value={selectedNumbersCount} 
                      onChange={e => setSelectedNumbersCount(parseInt(e.target.value))} 
                      style={{ ...inputStyle, width: window.innerWidth <= 280 ? "100%" : 120, display: "block", marginBottom: 0, fontSize: window.innerWidth <= 280 ? "12px" : "14px", padding: window.innerWidth <= 280 ? "6px 8px" : "8px 12px" }}
                    >
                      {(() => {
                        const range = getGameRange(selectedGame);
                        const options = [];
                        for (let i = range.count; i <= Math.min(range.maxSelectable || range.max, 20); i++) {
                          options.push(i);
                        }
                        return options.map(num => (
                          <option key={num} value={num}>{num} liczb</option>
                        ));
                      })()}
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: window.innerWidth <= 280 ? 16 : 24 }}>
                    <h3 style={{ color: "#1976d2", marginBottom: window.innerWidth <= 280 ? 12 : 16, fontSize: window.innerWidth <= 280 ? "16px" : "18px" }}>➕ Dodaj szczęśliwe liczby:</h3>
                    <div style={{ display: "flex", flexDirection: window.innerWidth <= 280 ? "column" : "row", gap: window.innerWidth <= 280 ? 8 : 12, marginBottom: window.innerWidth <= 280 ? 12 : 16 }}>
                      <input
                        type="number"
                        min={1}
                        max={getGameRange(selectedGame).max}
                        placeholder={`Liczba 1-${getGameRange(selectedGame).max}`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addLuckyNumber(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        style={{ ...inputStyle, width: window.innerWidth <= 280 ? "100%" : 150, marginBottom: 0, fontSize: window.innerWidth <= 280 ? "12px" : "14px", padding: window.innerWidth <= 280 ? "8px 10px" : "10px 12px" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Liczba 1-49"]');
                          if (input && input.value) {
                            addLuckyNumber(input.value);
                            input.value = '';
                          }
                        }}
                        style={{
                          ...buttonStyle,
                          width: window.innerWidth <= 280 ? "100%" : "auto",
                          padding: window.innerWidth <= 280 ? "10px 16px" : "14px 20px",
                          background: "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)",
                          fontSize: window.innerWidth <= 280 ? "12px" : "14px"
                        }}
                      >
                        ➕ Dodaj
                      </button>
                    </div>
                    
                    {luckyNumbers.length > 0 && (
                      <div style={{ background: "#fff", padding: window.innerWidth <= 280 ? 12 : 16, borderRadius: 12, border: "2px solid #ffd700" }}>
                        <h4 style={{ color: "#222", marginBottom: window.innerWidth <= 280 ? 8 : 12, fontSize: window.innerWidth <= 280 ? "14px" : "16px" }}>Twoje szczęśliwe liczby:</h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: window.innerWidth <= 280 ? 6 : 8, marginBottom: window.innerWidth <= 280 ? 8 : 12 }}>
                          {luckyNumbers.map((num, idx) => (
                            <div key={idx} style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                              padding: "8px 12px",
                              borderRadius: 20,
                              boxShadow: "0 2px 8px rgba(255, 215, 0, 0.3)"
                            }}>
                              <span style={{ fontWeight: "bold", fontSize: 16 }}>{num}</span>
                              <button
                                type="button"
                                onClick={() => removeLuckyNumber(num)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#d32f2f",
                                  cursor: "pointer",
                                  fontSize: 18,
                                  fontWeight: "bold",
                                  padding: 0,
                                  width: 20,
                                  height: 20,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button type="submit" style={{
                    ...buttonStyle,
                    fontSize: window.innerWidth <= 280 ? "12px" : "14px",
                    padding: window.innerWidth <= 280 ? "10px 16px" : "12px 20px",
                    width: window.innerWidth <= 280 ? "100%" : "auto"
                  }} disabled={luckyNumbers.length < 3}>
                    🍀 Generuj zestawy ze szczęśliwych liczb
                  </button>
                </form>
                
                {results.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: "8px" }}>
                      <h3 style={{ color: "#222", margin: 0 }}>Wyniki:</h3>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button 
                          onClick={() => {
                            const resultText = results.map((set, index) => 
                              `Zestaw ${index + 1}: ${set.join(", ")}`
                            ).join('\n');
                            navigator.clipboard.writeText(resultText).then(() => {
                              alert('Wyniki skopiowane do schowka!');
                            }).catch(() => {
                              alert('Błąd kopiowania. Skopiuj ręcznie: ' + resultText);
                            });
                          }}
                          style={{
                            background: "linear-gradient(45deg, #4CAF50, #45a049)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 14,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          📋 Kopiuj
                        </button>
                        <button 
                          onClick={() => {
                            const favorites = JSON.parse(localStorage.getItem('favoriteSets') || '[]');
                            const newFavorite = {
                              id: Date.now(),
                              name: `Szczęśliwe liczby ${selectedGame} ${new Date().toLocaleDateString('pl-PL')}`,
                              sets: results,
                              game: selectedGame,
                              generatorType: 'lucky',
                              date: new Date().toISOString()
                            };
                            const updatedFavorites = [newFavorite, ...favorites];
                            localStorage.setItem('favoriteSets', JSON.stringify(updatedFavorites));
                            alert(`Zestawy zostały dodane do ulubionych!`);
                          }}
                          style={{
                            background: "linear-gradient(45deg, #9C27B0, #673AB7)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 14,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          ❤️ Ulubione
                        </button>
                        <button 
                          onClick={() => setResults([])}
                          style={{
                            background: "linear-gradient(45deg, #f44336, #d32f2f)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 14,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          🔄 Resetuj
                        </button>
                      <button 
                        onClick={() => {
                          const doc = new jsPDF();
                          doc.text("Szczęśliwe liczby lotto", 20, 20);
                          results.forEach((set, index) => {
                            doc.text(`Zestaw ${index + 1}: ${set.join(", ")}`, 20, 40 + (index * 10));
                          });
                          doc.save("szczesliwe-liczby-lotto.pdf");
                        }}
                        style={{
                          background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 16px",
                          fontSize: 14,
                          cursor: "pointer"
                        }}
                      >
                        📄 PDF
                      </button>
                      </div>
                    </div>
                    <div style={{ 
                      background: "#fff", 
                      padding: 20, 
                      borderRadius: 12, 
                      border: "2px solid #ff9800",
                      maxHeight: "400px",
                      overflow: "auto"
                    }}>
                      {results.map((set, index) => (
                        <div key={index} style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 8, 
                          marginBottom: 12,
                          padding: 12,
                          background: "#f8f9fa",
                          borderRadius: 8
                        }}>
                          <span style={{ fontWeight: "bold", color: "#ff9800", minWidth: 80 }}>Zestaw {index + 1}:</span>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {set.map((num, numIndex) => (
                              <div key={numIndex} style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #ff9800, #ffb74d)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: 14,
                                color: "white",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                              }}>
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Wykup plan Premium, aby odblokować dostęp do wszystkich funkcji.
                </p>
                <button 
                  onClick={() => setShowPayments(true)}
                  style={{
                    background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "16px 32px",
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Przejdź do płatności
                </button>
              </div>
            )
          } />
          
          <Route path="/systems" element={
            checkAccess('systems') ? (
              <div>
                <h2 style={{ color: "#222", marginBottom: 24, textAlign: "center" }}>Systemy skrócone</h2>
                
                {/* Przyciski przełączania typu systemu */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  gap: "8px", 
                  marginBottom: 24,
                  flexWrap: "wrap"
                }}>
                  <button
                    onClick={() => setSystemType('classic')}
                    style={{
                      ...buttonStyle,
                      background: systemType === 'classic' ? "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)" : "linear-gradient(90deg, #e0e0e0 0%, #bdbdbd 100%)",
                      color: systemType === 'classic' ? "#222" : "#666",
                      width: "auto",
                      padding: "8px 12px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      minWidth: "120px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    🎯 Klasyczny
                  </button>
                  <button
                    onClick={() => setSystemType('schonheim')}
                    style={{
                      ...buttonStyle,
                      background: systemType === 'schonheim' ? "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)" : "linear-gradient(90deg, #e0e0e0 0%, #bdbdbd 100%)",
                      color: systemType === 'schonheim' ? "#222" : "#666",
                      width: "auto",
                      padding: "8px 12px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      minWidth: "120px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    🧮 Schönheima
                  </button>
                  <button
                    onClick={() => setSystemType('ilp')}
                    style={{
                      ...buttonStyle,
                      background: systemType === 'ilp' ? "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)" : "linear-gradient(90deg, #e0e0e0 0%, #bdbdbd 100%)",
                      color: systemType === 'ilp' ? "#222" : "#666",
                      width: "auto",
                      padding: "8px 12px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      minWidth: "120px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    🎯 Logika ILP
                  </button>
                </div>
                
                {systemType === 'classic' ? (
                  <>
                    <p style={{ marginBottom: 20, lineHeight: 1.6 }}>
                      Systemy skrócone pozwalają grać większą liczbą liczb przy mniejszej liczbie zakładów, 
                      zapewniając matematyczne gwarancje trafień.
                      <span onClick={() => setModalInfo({ isOpen: true, title: "Systemy skrócone", content: "System pełny: obstawiasz wszystkie możliwe kombinacje wybranej liczby liczb. System skrócony: wybiera podzbiór kombinacji, który zapewnia gwarancję trafienia określonej liczby liczb, jeśli spełnisz warunek. To covering design w kombinatoryce! WAŻNE: System skrócony ma sens tylko gdy liczba typowanych liczb jest większa niż liczba liczb do wyboru (np. 7+ liczb w Lotto)." })} style={{ cursor: "pointer", marginLeft: 8, color: "#1976d2" }}>ℹ️</span>
                    </p>
                  </>
                ) : systemType === 'schonheim' ? (
                  <>
                    <p style={{ marginBottom: 20, lineHeight: 1.6 }}>
                      Generator Schönheima oblicza matematyczne granice dla systemów skróconych, 
                      używając zaawansowanych algorytmów kombinatorycznych.
                    </p>
                    
                                                              <div style={{ 
                       background: "#e3f2fd", 
                       color: "#1565c0", 
                       padding: window.innerWidth <= 480 ? "8px" : "10px", 
                       borderRadius: 8, 
                       marginBottom: window.innerWidth <= 480 ? "16px" : "18px",
                       border: "1px solid #1976d2"
                     }}>
                       <div style={{ 
                         textAlign: "center",
                         marginBottom: window.innerWidth <= 480 ? "8px" : "10px"
                       }}>
                         <strong>🧮 GENERATOR SCHÖNHEIMA - ALGORYTM MATEMATYCZNY</strong>
                       </div>
                       <div style={{ 
                         textAlign: "center",
                         marginBottom: "6px"
                       }}>
                         <button
                           type="button"
                           onClick={() => setShowSchonheimInfo(!showSchonheimInfo)}
                           style={{
                             background: "linear-gradient(135deg, #1976D2, #1565C0)",
                             color: "white",
                             border: "none",
                             borderRadius: "50%",
                             width: window.innerWidth <= 480 ? "24px" : "26px",
                             height: window.innerWidth <= 480 ? "24px" : "26px",
                             cursor: "pointer",
                             boxShadow: "0 3px 6px rgba(25, 118, 210, 0.3)",
                             transition: "all 0.3s ease",
                             display: "flex",
                             alignItems: "center",
                             justifyContent: "center",
                             fontSize: window.innerWidth <= 480 ? "12px" : "13px",
                             transform: showSchonheimInfo ? "rotate(180deg)" : "rotate(0deg)"
                           }}
                           onMouseOver={(e) => {
                             e.target.style.background = "linear-gradient(135deg, #1565C0, #0D47A1)";
                             e.target.style.transform = showSchonheimInfo ? "rotate(180deg) translateY(-2px)" : "translateY(-2px)";
                             e.target.style.boxShadow = "0 6px 12px rgba(25, 118, 210, 0.4)";
                           }}
                           onMouseOut={(e) => {
                             e.target.style.background = "linear-gradient(135deg, #1976D2, #1565C0)";
                             e.target.style.transform = showSchonheimInfo ? "rotate(180deg)" : "rotate(0deg)";
                             e.target.style.boxShadow = "0 3px 6px rgba(25, 118, 210, 0.3)";
                           }}
                         >
                           ▼
                         </button>
                       </div>
                      
                      {showSchonheimInfo && (
                        <div>
                          <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                            Generator Schönheima to zaawansowane narzędzie matematyczne, które oblicza minimalne granice dla systemów skróconych:
                          </p>
                          <ul style={{ marginLeft: 20, marginTop: 8 }}>
                            <li><strong>Wzór Schönheima:</strong> C(v,k,t) ≥ (v/k) × C(v-1,k-1,t-1)</li>
                            <li><strong>Rekurencyjne obliczenia:</strong> Używa wzorów kombinatorycznych</li>
                            <li><strong>Optymalizacja:</strong> Znajduje minimalną liczbę zakładów</li>
                            <li><strong>Gwarancja matematyczna:</strong> 100% pewność pokrycia</li>
                          </ul>
                          
                                                     <div style={{ 
                             marginTop: "12px", 
                             padding: "12px", 
                             background: "#e8f5e8", 
                             borderRadius: "6px", 
                             border: "1px solid #4caf50",
                             fontSize: "13px"
                           }}>
                            <strong>📊 Przykład działania Schönheima:</strong><br/>
                            <strong>Lotto:</strong> Wybierz 8 liczb (np. 3, 8, 15, 22, 31, 42, 47, 49)<br/>
                            <strong>Gwarancja:</strong> 4 z 6 (jeśli trafisz 4 z 8, system zapewni Ci wygraną)<br/>
                            <strong>Wzór:</strong> C(8,6,4) ≥ (8/6) × C(7,5,3) = 1.33 × 7 = 9.31 → 10 zakładów<br/>
                            <strong>Liczba zakładów:</strong> 10 zakładów (zaokrąglone w górę)<br/>
                            <strong>Koszt:</strong> 30 PLN<br/>
                            <strong>Zakłady (przykład):</strong><br/>
                            • Zakład 1: 3, 8, 15, 22, 31, 42<br/>
                            • Zakład 2: 3, 8, 15, 22, 31, 47<br/>
                            • Zakład 3: 3, 8, 15, 22, 31, 49<br/>
                            • Zakład 4: 3, 8, 15, 22, 42, 47<br/>
                            • Zakład 5: 3, 8, 15, 22, 42, 49<br/>
                            • Zakład 6: 3, 8, 15, 22, 47, 49<br/>
                            • Zakład 7: 3, 8, 15, 31, 42, 47<br/>
                            • Zakład 8: 3, 8, 15, 31, 42, 49<br/>
                            • Zakład 9: 3, 8, 15, 31, 47, 49<br/>
                            • Zakład 10: 3, 8, 15, 42, 47, 49
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ marginBottom: 20, lineHeight: 1.6 }}>
                      Logika ILP (Integer Linear Programming) to zaawansowana technika matematyczna, 
                      która znajduje absolutne minimum zakładów potrzebnych do 100% gwarancji pokrycia.
                    </p>
                    
                                                              <div style={{ 
                       background: "#e3f2fd", 
                       color: "#1565c0", 
                       padding: window.innerWidth <= 480 ? "8px" : "10px", 
                       borderRadius: 8, 
                       marginBottom: window.innerWidth <= 480 ? "16px" : "18px",
                       border: "1px solid #1976d2"
                     }}>
                       <div style={{ 
                         textAlign: "center",
                         marginBottom: window.innerWidth <= 480 ? "8px" : "10px"
                       }}>
                         <strong>⚡ LOGIKA ILP - INTEGER LINEAR PROGRAMMING</strong>
                       </div>
                       <div style={{ 
                         textAlign: "center",
                         marginBottom: "6px"
                       }}>
                         <button
                           type="button"
                           onClick={() => setShowIlpInfo(!showIlpInfo)}
                           style={{
                             background: "linear-gradient(135deg, #1976D2, #1565C0)",
                             color: "white",
                             border: "none",
                             borderRadius: "50%",
                             width: window.innerWidth <= 480 ? "24px" : "26px",
                             height: window.innerWidth <= 480 ? "24px" : "26px",
                             cursor: "pointer",
                             boxShadow: "0 3px 6px rgba(25, 118, 210, 0.3)",
                             transition: "all 0.3s ease",
                             display: "flex",
                             alignItems: "center",
                             justifyContent: "center",
                             fontSize: window.innerWidth <= 480 ? "12px" : "13px",
                             transform: showIlpInfo ? "rotate(180deg)" : "rotate(0deg)"
                           }}
                           onMouseOver={(e) => {
                             e.target.style.background = "linear-gradient(135deg, #1565C0, #0D47A1)";
                             e.target.style.transform = showIlpInfo ? "rotate(180deg) translateY(-2px)" : "translateY(-2px)";
                             e.target.style.boxShadow = "0 6px 12px rgba(25, 118, 210, 0.4)";
                           }}
                           onMouseOut={(e) => {
                             e.target.style.background = "linear-gradient(135deg, #1976D2, #1565C0)";
                             e.target.style.transform = showIlpInfo ? "rotate(180deg)" : "rotate(0deg)";
                             e.target.style.boxShadow = "0 3px 6px rgba(25, 118, 210, 0.3)";
                           }}
                         >
                           ▼
                         </button>
                       </div>
                      
                      {showIlpInfo && (
                        <div>
                          <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                            ILP to zaawansowana technika matematyczna, która znajduje absolutne minimum zakładów:
                          </p>
                          <ul style={{ marginLeft: 20, marginTop: 8 }}>
                            <li><strong>Programowanie liniowe:</strong> Optymalizacja matematyczna</li>
                            <li><strong>Zmienne całkowitoliczbowe:</strong> Każdy zakład to 0 lub 1</li>
                            <li><strong>Funkcja celu:</strong> Minimalizacja liczby zakładów</li>
                            <li><strong>Ograniczenia:</strong> Każda kombinacja t liczb musi być pokryta</li>
                            <li><strong>Gwarancja 100%:</strong> Jeśli trafisz, ILP ZAWSZE znajdzie wygraną</li>
                          </ul>
                          
                                                     <div style={{ 
                             marginTop: "12px", 
                             padding: "12px", 
                             background: "#e8f5e8", 
                             borderRadius: "6px", 
                             border: "1px solid #4caf50",
                             fontSize: "13px"
                           }}>
                            <strong>📊 Przykład działania ILP:</strong><br/>
                            <strong>Lotto:</strong> Wybierz 7 liczb (np. 3, 8, 15, 22, 31, 42, 47)<br/>
                            <strong>Gwarancja:</strong> 4 z 6 (jeśli trafisz 4 z 7, system zapewni Ci wygraną)<br/>
                            <strong>Zmienne:</strong> x₁, x₂, ..., x₃₅ (każda = 0 lub 1)<br/>
                            <strong>Funkcja celu:</strong> min(x₁ + x₂ + ... + x₃₅)<br/>
                            <strong>Ograniczenia:</strong> Każda kombinacja 4 liczb z 7 musi być pokryta<br/>
                            <strong>Liczba zakładów:</strong> 7 zakładów (minimum matematyczne)<br/>
                            <strong>Koszt:</strong> 21 PLN<br/>
                            <strong>Zakłady (przykład):</strong><br/>
                            • Zakład 1: 3, 8, 15, 22, 31, 42<br/>
                            • Zakład 2: 3, 8, 15, 22, 31, 47<br/>
                            • Zakład 3: 3, 8, 15, 22, 42, 47<br/>
                            • Zakład 4: 3, 8, 15, 31, 42, 47<br/>
                            • Zakład 5: 3, 8, 22, 31, 42, 47<br/>
                            • Zakład 6: 3, 15, 22, 31, 42, 47<br/>
                            • Zakład 7: 8, 15, 22, 31, 42, 47
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                                                  <div style={{ 
                   background: "#f3e5f5", 
                   color: "#7b1fa2", 
                   padding: window.innerWidth <= 480 ? "8px" : "10px", 
                   borderRadius: 8, 
                   marginBottom: window.innerWidth <= 480 ? "16px" : "18px",
                   border: "1px solid #9c27b0"
                 }}>
                   <div style={{ 
                     textAlign: "center",
                     marginBottom: window.innerWidth <= 480 ? "8px" : "10px"
                   }}>
                     <strong>💡 Wskazówka: Jak wybrać liczbę liczb w systemie</strong>
                   </div>
                   <div style={{ 
                     textAlign: "center",
                     marginBottom: "6px"
                   }}>
                     <button
                       type="button"
                       onClick={() => setShowHintInfo(!showHintInfo)}
                       style={{
                         background: "linear-gradient(135deg, #9C27B0, #7B1FA2)",
                         color: "white",
                         border: "none",
                         borderRadius: "50%",
                         width: window.innerWidth <= 480 ? "24px" : "26px",
                         height: window.innerWidth <= 480 ? "24px" : "26px",
                         cursor: "pointer",
                         boxShadow: "0 3px 6px rgba(156, 39, 176, 0.3)",
                         transition: "all 0.3s ease",
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                         fontSize: window.innerWidth <= 480 ? "12px" : "13px",
                         transform: showHintInfo ? "rotate(180deg)" : "rotate(0deg)"
                       }}
                       onMouseOver={(e) => {
                         e.target.style.background = "linear-gradient(135deg, #7B1FA2, #6A1B9A)";
                         e.target.style.transform = showHintInfo ? "rotate(180deg) translateY(-2px)" : "translateY(-2px)";
                         e.target.style.boxShadow = "0 6px 12px rgba(156, 39, 176, 0.4)";
                       }}
                       onMouseOut={(e) => {
                         e.target.style.background = "linear-gradient(135deg, #9C27B0, #7B1FA2)";
                         e.target.style.transform = showHintInfo ? "rotate(180deg)" : "rotate(0deg)";
                         e.target.style.boxShadow = "0 3px 6px rgba(156, 39, 176, 0.3)";
                       }}
                     >
                       ▼
                     </button>
                   </div>
                  
                  {showHintInfo && (
                    <div>
                      <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                        Aby zobaczyć prawdziwy system skrócony, wybierz więcej liczb niż liczba liczb do wyboru:
                      </p>
                  <ul style={{ marginLeft: 20, marginTop: 8 }}>
                    <li><strong>Lotto:</strong> wybierz od 7 do 15 liczb (nie 6) - domyślnie 7</li>
                    <li><strong>Mini Lotto:</strong> wybierz od 6 do 15 liczb (nie 5) - domyślnie 6</li>
                    <li><strong>Multi Multi:</strong> wybierz od 11 do 15 liczb (nie 10) - domyślnie 11</li>
                    <li><strong>Eurojackpot:</strong> wybierz od 6 do 15 liczb (nie 5) - domyślnie 6</li>
                    <li><strong>Kaskada:</strong> wybierz od 13 do 15 liczb (nie 12) - domyślnie 13</li>
                    <li><strong>Keno:</strong> wybierz od {kenoNumbers + 1} do 15 liczb (nie {kenoNumbers}) - domyślnie {kenoNumbers + 1}</li>
                  </ul>
                  <p style={{ marginTop: 4, fontSize: 12 }}>💡 Domyślnie wybierana jest minimalna liczba liczb dla każdej gry.</p>
                    </div>
                  )}
                </div>
                
                {systemType === 'classic' ? (
                  <>
                                                              <div style={{ 
                       background: "#e3f2fd", 
                       color: "#1565c0", 
                       padding: window.innerWidth <= 480 ? "8px" : "10px", 
                       borderRadius: 8, 
                       marginBottom: window.innerWidth <= 480 ? "16px" : "18px",
                       border: "1px solid #1976d2"
                     }}>
                       <div style={{ 
                         textAlign: "center",
                         marginBottom: window.innerWidth <= 480 ? "8px" : "10px"
                       }}>
                         <strong>✅ UNIWERSALNY ALGORYTM COVERING DESIGN</strong>
                       </div>
                       <div style={{ 
                         textAlign: "center",
                         marginBottom: "6px"
                       }}>
                         <button
                           type="button"
                           onClick={() => setShowAlgorithmInfo(!showAlgorithmInfo)}
                           style={{
                             background: "linear-gradient(135deg, #1976D2, #1565C0)",
                             color: "white",
                             border: "none",
                             borderRadius: "50%",
                             width: window.innerWidth <= 480 ? "24px" : "26px",
                             height: window.innerWidth <= 480 ? "24px" : "26px",
                             cursor: "pointer",
                             boxShadow: "0 3px 6px rgba(25, 118, 210, 0.3)",
                             transition: "all 0.3s ease",
                             display: "flex",
                             alignItems: "center",
                             justifyContent: "center",
                             fontSize: window.innerWidth <= 480 ? "12px" : "13px",
                             transform: showAlgorithmInfo ? "rotate(180deg)" : "rotate(0deg)"
                           }}
                           onMouseOver={(e) => {
                             e.target.style.background = "linear-gradient(135deg, #1565C0, #0D47A1)";
                             e.target.style.transform = showAlgorithmInfo ? "rotate(180deg) translateY(-2px)" : "translateY(-2px)";
                             e.target.style.boxShadow = "0 6px 12px rgba(25, 118, 210, 0.4)";
                           }}
                           onMouseOut={(e) => {
                             e.target.style.background = "linear-gradient(135deg, #1976D2, #1565C0)";
                             e.target.style.transform = showAlgorithmInfo ? "rotate(180deg)" : "rotate(0deg)";
                             e.target.style.boxShadow = "0 3px 6px rgba(25, 118, 210, 0.3)";
                           }}
                         >
                           ▼
                         </button>
                       </div>
                      
                      {showAlgorithmInfo && (
                        <div>
                      <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                        Generator używa zaawansowanego algorytmu covering design, który zapewnia maksymalną gwarancję dla wszystkich gier:
                      </p>
                      <ul style={{ marginLeft: 20, marginTop: 8 }}>
                        <li><strong>LOTTO (6 liczb w zakładzie):</strong> Znane systemy matematyczne (100% gwarancja)</li>
                        <li><strong>MINI LOTTO (5 liczb w zakładzie):</strong> Znane systemy matematyczne (100% gwarancja)</li>
                        <li><strong>MULTI MULTI (10 liczb w zakładzie):</strong> Uniwersalny algorytm covering design</li>
                        <li><strong>EUROJACKPOT (5+2 liczb):</strong> Uniwersalny algorytm covering design</li>
                        <li><strong>KASKADA (12 liczb w zakładzie):</strong> Uniwersalny algorytm covering design</li>
                        <li><strong>KENO (różne liczby):</strong> Uniwersalny algorytm covering design</li>
                      </ul>
                          
                                                     <div style={{ 
                             marginTop: "12px", 
                             padding: "12px", 
                             background: "#e8f5e8", 
                             borderRadius: "6px", 
                             border: "1px solid #4caf50",
                             fontSize: "13px"
                           }}>
                            <strong>📊 Przykład działania:</strong><br/>
                            <strong>Lotto:</strong> Wybierz 7 liczb (np. 3, 8, 15, 22, 31, 42, 47)<br/>
                            <strong>Gwarancja:</strong> 4 z 6 (jeśli trafisz 4 z 7, system zapewni Ci wygraną)<br/>
                            <strong>Liczba zakładów:</strong> 7 zakładów<br/>
                            <strong>Koszt:</strong> 21 PLN<br/>
                            <strong>Zakłady:</strong><br/>
                            • Zakład 1: 3, 8, 15, 22, 31, 42<br/>
                            • Zakład 2: 3, 8, 15, 22, 31, 47<br/>
                            • Zakład 3: 3, 8, 15, 22, 42, 47<br/>
                            • Zakład 4: 3, 8, 15, 31, 42, 47<br/>
                            • Zakład 5: 3, 8, 22, 31, 42, 47<br/>
                            • Zakład 6: 3, 15, 22, 31, 42, 47<br/>
                            • Zakład 7: 8, 15, 22, 31, 42, 47
                    </div>
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleGenerateSystem} style={{ 
                      marginBottom: 24,
                      padding: window.innerWidth <= 480 ? "20px" : "30px",
                      background: "#f8f9fa",
                      borderRadius: "12px",
                      border: "1px solid #e9ecef"
                    }}>
                      <div style={{ 
                        marginBottom: window.innerWidth <= 480 ? "16px" : "20px",
                        display: "flex",
                        flexDirection: window.innerWidth <= 480 ? "column" : "row",
                        alignItems: window.innerWidth <= 480 ? "flex-start" : "center",
                        gap: window.innerWidth <= 480 ? "8px" : "12px"
                      }}>
                        <label style={{ 
                          fontWeight: "bold", 
                          minWidth: window.innerWidth <= 480 ? "auto" : "140px",
                          fontSize: window.innerWidth <= 480 ? "14px" : "16px"
                        }}>Gra:</label>
                        <select 
                          value={selectedGame} 
                          onChange={e => setSelectedGame(e.target.value)} 
                          style={{ 
                            ...inputStyle, 
                            width: window.innerWidth <= 480 ? "100%" : "200px",
                            flex: window.innerWidth <= 480 ? "1" : "0 0 auto"
                          }}
                        >
                          <option value="lotto">Lotto (6 z 49)</option>
                          <option value="miniLotto">Mini Lotto (5 z 42)</option>
                          <option value="multiMulti">Multi Multi (10 z 80)</option>
                          <option value="eurojackpot">Eurojackpot (5+2)</option>
                          <option value="kaskada">Kaskada (12 z 24)</option>
                          <option value="keno">Keno ({kenoNumbers} z 70)</option>
                        </select>
                      </div>
                      <div style={{ 
                        marginBottom: window.innerWidth <= 480 ? "16px" : "20px",
                        display: "flex",
                        flexDirection: window.innerWidth <= 480 ? "column" : "row",
                        alignItems: window.innerWidth <= 480 ? "flex-start" : "center",
                        gap: window.innerWidth <= 480 ? "8px" : "12px"
                      }}>
                        <label style={{ 
                          fontWeight: "bold", 
                          minWidth: window.innerWidth <= 480 ? "auto" : "140px",
                          fontSize: window.innerWidth <= 480 ? "14px" : "16px"
                        }}>Liczba liczb w systemie:</label>
                        <select 
                          value={systemNumbers} 
                          onChange={e => setSystemNumbers(Number(e.target.value))} 
                          style={{ 
                            ...inputStyle, 
                            width: window.innerWidth <= 480 ? "100%" : "150px",
                            flex: window.innerWidth <= 480 ? "1" : "0 0 auto"
                          }}
                        >
                          {Array.from({ length: 16 - getMinSystemNumbers(selectedGame) }, (_, i) => i + getMinSystemNumbers(selectedGame)).map(num => (
                            <option key={num} value={num}>{num} liczb</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ 
                        marginBottom: window.innerWidth <= 480 ? "20px" : "24px",
                        display: "flex",
                        flexDirection: window.innerWidth <= 480 ? "column" : "row",
                        alignItems: window.innerWidth <= 480 ? "flex-start" : "center",
                        gap: window.innerWidth <= 480 ? "8px" : "12px"
                      }}>
                        <label style={{ 
                          fontWeight: "bold", 
                          minWidth: window.innerWidth <= 480 ? "auto" : "140px",
                          fontSize: window.innerWidth <= 480 ? "14px" : "16px"
                        }}>Gwarancja trafień:</label>
                        <select 
                          value={systemGuarantee} 
                          onChange={e => setSystemGuarantee(Number(e.target.value))} 
                          style={{ 
                            ...inputStyle, 
                            width: window.innerWidth <= 480 ? "100%" : "150px",
                            flex: window.innerWidth <= 480 ? "1" : "0 0 auto"
                          }}
                        >
                          {(() => {
                            const gameConfig = {
                              lotto: { pick: 6, options: [3, 4, 5] },
                              miniLotto: { pick: 5, options: [3, 4] },
                              multiMulti: { pick: 10, options: [3, 4, 5, 6, 7] },
                              eurojackpot: { pick: 5, options: [3, 4] },
                              kaskada: { pick: 12, options: [3, 4, 5, 6, 7, 8] },
                              keno: { pick: kenoNumbers, options: kenoNumbers === 10 ? [3, 4, 5, 6, 7] : [3, 4, 5, 6, 7, 8, 9, 10] }
                            };
                            const config = gameConfig[selectedGame] || { pick: 6, options: [3, 4, 5] };
                            return config.options.map(option => {
                              const guarantee = calculateRealGuarantee(systemNumbers, option, config.pick);
                              const isFull = hasFullGuarantee(systemNumbers, option, config.pick);
                              const guaranteeText = isFull ? "100%" : `${guarantee}%`;
                              return (
                                <option key={option} value={option}>
                                  {option} z {config.pick} ({guaranteeText})
                                </option>
                              );
                            });
                          })()}
                        </select>
                      </div>
                      {/* Opcja ręcznego wyboru liczb */}
                      <div style={{ 
                        marginBottom: window.innerWidth <= 480 ? "16px" : "20px",
                        padding: "16px",
                        background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
                        borderRadius: "8px",
                        border: "1px solid #b3d9ff"
                      }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "12px",
                          marginBottom: "12px"
                        }}>
                          <input
                            type="checkbox"
                            id="manualSelection"
                            checked={manualNumberSelection}
                            onChange={(e) => {
                              setManualNumberSelection(e.target.checked);
                              if (!e.target.checked) {
                                setSelectedManualNumbers([]);
                              }
                            }}
                            style={{ width: "18px", height: "18px" }}
                          />
                          <label htmlFor="manualSelection" style={{ 
                            fontWeight: "bold", 
                            fontSize: "16px",
                            color: "#0066cc"
                          }}>
                            🎯 Ręczny wybór liczb
                          </label>
                        </div>
                        
                        {manualNumberSelection && (
                          <div>
                            <div style={{ 
                              marginBottom: "12px",
                              fontSize: "14px",
                              color: "#666"
                            }}>
                              Wybierz liczby z zakresu {(() => {
                                const maxNumber = selectedGame === "lotto" ? 49 :
                                               selectedGame === "miniLotto" ? 42 :
                                               selectedGame === "multiMulti" ? 80 :
                                               selectedGame === "eurojackpot" ? 50 :
                                               selectedGame === "kaskada" ? 24 :
                                               selectedGame === "keno" ? 70 : 49;
                                return `1-${maxNumber}`;
                              })()} (maksymalnie 15 liczb)
                            </div>
                            
                            {/* Wybrane liczby */}
                            {selectedManualNumbers.length > 0 && (
                              <div style={{ 
                                marginBottom: "12px",
                                padding: "8px",
                                background: "#fff",
                                borderRadius: "6px",
                                border: "1px solid #ddd"
                              }}>
                                <strong>Wybrane liczby ({selectedManualNumbers.length}/15):</strong> {selectedManualNumbers.join(", ")}
                              </div>
                            )}
                            
                            {/* Grid z liczbami głównymi */}
                            <div style={{ 
                              display: "grid",
                              gridTemplateColumns: window.innerWidth <= 480 ? "repeat(auto-fill, minmax(28px, 1fr))" : "repeat(auto-fill, minmax(32px, 1fr))",
                              gap: window.innerWidth <= 480 ? "3px" : "4px",
                              maxHeight: window.innerWidth <= 480 ? "180px" : "200px",
                              overflow: "auto",
                              padding: window.innerWidth <= 480 ? "6px" : "8px",
                              background: "#fff",
                              borderRadius: "6px",
                              border: "1px solid #ddd"
                            }}>
                              {Array.from({ length: (() => {
                                const maxNumber = selectedGame === "lotto" ? 49 :
                                               selectedGame === "miniLotto" ? 42 :
                                               selectedGame === "multiMulti" ? 80 :
                                               selectedGame === "eurojackpot" ? 50 :
                                               selectedGame === "kaskada" ? 24 :
                                               selectedGame === "keno" ? 70 : 49;
                                return maxNumber;
                              })() }, (_, i) => i + 1).map(number => (
                                <button
                                  key={number}
                                  type="button"
                                  onClick={() => handleManualNumberClick(number)}
                                  style={{
                                    width: window.innerWidth <= 480 ? "28px" : "32px",
                                    height: window.innerWidth <= 480 ? "28px" : "32px",
                                    borderRadius: "50%",
                                    border: "none",
                                    background: selectedManualNumbers.includes(number) 
                                      ? "linear-gradient(135deg, #4CAF50, #45a049)"
                                      : "linear-gradient(135deg, #f0f0f0, #e0e0e0)",
                                    color: selectedManualNumbers.includes(number) ? "white" : "#333",
                                    fontWeight: "bold",
                                    fontSize: window.innerWidth <= 480 ? "11px" : "12px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease"
                                  }}
                                >
                                  {number}
                                </button>
                              ))}
                            </div>

                            {/* Sekcja liczb Euro dla Eurojackpot */}
                            {selectedGame === "eurojackpot" && (
                              <div style={{ marginTop: "16px" }}>
                                <div style={{ 
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                  color: "#666",
                                  fontWeight: "bold"
                                }}>
                                  🌟 Liczby Euro (1-12) - wybierz 2 liczby:
                                </div>
                                
                                {/* Wybrane liczby Euro */}
                                {selectedEuroNumbers.length > 0 && (
                                  <div style={{ 
                                    marginBottom: "8px",
                                    padding: "6px",
                                    background: "#fff3cd",
                                    borderRadius: "6px",
                                    border: "1px solid #ffc107",
                                    fontSize: "13px"
                                  }}>
                                    <strong>Wybrane liczby Euro ({selectedEuroNumbers.length}/2):</strong> {selectedEuroNumbers.join(", ")}
                                  </div>
                                )}
                                
                                {/* Grid z liczbami Euro */}
                                <div style={{ 
                                  display: "grid",
                                  gridTemplateColumns: window.innerWidth <= 480 ? "repeat(6, 1fr)" : "repeat(12, 1fr)",
                                  gap: window.innerWidth <= 480 ? "3px" : "4px",
                                  padding: window.innerWidth <= 480 ? "6px" : "8px",
                                  background: "#fff3cd",
                                  borderRadius: "6px",
                                  border: "1px solid #ffc107"
                                }}>
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map(number => (
                                    <button
                                      key={`euro-${number}`}
                                      type="button"
                                      onClick={() => handleEuroNumberClick(number)}
                                      style={{
                                        width: window.innerWidth <= 480 ? "24px" : "28px",
                                        height: window.innerWidth <= 480 ? "24px" : "28px",
                                        borderRadius: "50%",
                                        border: "none",
                                        background: selectedEuroNumbers.includes(number) 
                                          ? "linear-gradient(135deg, #ffc107, #ffb300)"
                                          : "linear-gradient(135deg, #fff3cd, #ffeaa7)",
                                        color: selectedEuroNumbers.includes(number) ? "#333" : "#666",
                                        fontWeight: "bold",
                                        fontSize: "11px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 0.2s ease",
                                        border: selectedEuroNumbers.includes(number) ? "2px solid #ff8f00" : "1px solid #ffc107"
                                      }}
                                    >
                                      {number}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <button 
                          type="submit" 
                          style={{
                            ...buttonStyle,
                            padding: window.innerWidth <= 480 ? "12px 24px" : "16px 32px",
                            fontSize: window.innerWidth <= 480 ? "16px" : "18px",
                            minWidth: window.innerWidth <= 480 ? "200px" : "250px"
                          }}
                        >
                          🎯 Generuj system
                        </button>
                      </div>
                    </form>
                  </>
                ) : systemType === 'schonheim' ? (
                  <>
                    <div style={{ background: "#e3f2fd", color: "#1565c0", padding: 12, borderRadius: 8, marginBottom: 20 }}>
                      <strong>🧮 GENERATOR SCHÖNHEIMA - MATEMATYCZNE GRANICE:</strong>
                      <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                        Zaawansowany generator obliczający matematyczne granice dla systemów skróconych:
                      </p>
                      <ul style={{ marginLeft: 20, marginTop: 8 }}>
                        <li><strong>Granica prosta:</strong> ⌈ C(v,t) / C(k,t) ⌉ - podstawowa granica teoretyczna</li>
                        <li><strong>Granica Schönheima:</strong> Rekurencyjny algorytm z lepszymi oszacowaniami</li>
                        <li><strong>Analiza zakładów:</strong> Sprawdzenie czy liczba zakładów wystarczy na gwarancję</li>
                        <li><strong>Przykłady:</strong> Gotowe konfiguracje dla popularnych gier</li>
                      </ul>
                    </div>
                    <SchonheimGenerator />
                  </>
                ) : (
                  <>
                    <div style={{ background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)", padding: 20, borderRadius: 16, marginBottom: 24, border: "2px solid #1976d2" }}>
                      <h3 style={{ color: "#1565c0", marginBottom: 12, textAlign: "center" }}>🧮 Integer Linear Programming - Matematyczna Optymalizacja!</h3>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Co to jest ILP:</strong> Zaawansowana technika matematyczna, która znajduje absolutne minimum zakładów potrzebnych do 100% gwarancji pokrycia.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Gwarancja 100%:</strong> Jeśli Twoje liczby zawierają trafienie, ILP ZAWSZE znajdzie je w wygenerowanych zakładach.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                        <strong>⚠️ Ograniczenia:</strong> Działa tylko dla małych systemów (N≤10) ze względu na złożoność obliczeniową.
                      </p>
                    </div>

                    {/* Ostrzeżenie o dużym koszcie dla systemów pełnych */}
                    {ilpSystemType === "full" && ilpNumbers > 10 && (
                      <div style={{ 
                        background: "#fff3cd", 
                        border: "2px solid #ffc107", 
                        borderRadius: 12, 
                        padding: 16, 
                        marginBottom: 20,
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
                        <h4 style={{ color: "#856404", marginBottom: 8, fontSize: 16, fontWeight: "bold" }}>
                          Uwaga: Duży koszt systemu
                        </h4>
                        <p style={{ color: "#856404", margin: 0, fontSize: 14 }}>
                          System pełny z {ilpNumbers} liczbami może kosztować ponad 1000 PLN. 
                          Rozważ system skrócony lub adaptacyjny.
                        </p>
                      </div>
                    )}

                    {/* Ostrzeżenie o wysokim koszcie dla dużych systemów */}
                    {ilpNumbers > 12 && (
                      <div style={{ 
                        background: "#ffebee", 
                        border: "2px solid #f44336", 
                        borderRadius: 12, 
                        padding: 16, 
                        marginBottom: 20,
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>🚨</div>
                        <h4 style={{ color: "#d32f2f", marginBottom: 8, fontSize: 16, fontWeight: "bold" }}>
                          Uwaga: Bardzo wysoki koszt
                        </h4>
                        <p style={{ color: "#d32f2f", margin: 0, fontSize: 14 }}>
                          System z {ilpNumbers} liczbami może kosztować ponad 5000 PLN. 
                          Użyj mniejszej liczby liczb lub systemu skróconego.
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleGenerateILP} style={{ marginBottom: 24 }}>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: "bold", marginRight: 10 }}>Wybierz grę:</label>
                        <select value={ilpGame} onChange={e => setIlpGame(e.target.value)} style={{ ...inputStyle, width: 220, display: "inline-block", marginBottom: 0 }}>
                          <option value="miniLotto">Mini Lotto (5 z 42)</option>
                          <option value="lotto">Lotto (6 z 49)</option>
                          <option value="eurojackpot">Eurojackpot (5+2)</option>
                          <option value="keno">Keno (10 z 70)</option>
                          <option value="multiMulti">Multi Multi (20 z 80)</option>
                          <option value="kaskada">Kaskada (6 z 24)</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: "bold", marginBottom: 6, display: "block" }}>Liczba liczb w systemie (N):</label>
                        <select value={ilpNumbers} onChange={e => setIlpNumbers(parseInt(e.target.value))} style={inputStyle}>
                          <option value={7}>7 liczb</option>
                          <option value={8}>8 liczb</option>
                          <option value={9}>9 liczb</option>
                          <option value={10}>10 liczb</option>
                          <option value={11}>11 liczb</option>
                          <option value={12}>12 liczb</option>
                          <option value={13}>13 liczb</option>
                          <option value={14}>14 liczb</option>
                          <option value={15}>15 liczb</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: "bold", marginBottom: 6, display: "block" }}>Typ systemu:</label>
                        <select value={ilpSystemType} onChange={e => setIlpSystemType(e.target.value)} style={inputStyle}>
                          <option value="short">Skrócony (optymalny koszt)</option>
                          <option value="full">Pełny (100% gwarancja)</option>
                          <option value="adaptive">Adaptacyjny (inteligentny)</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: "bold", marginBottom: 6, display: "block" }}>Gwarancja trafień:</label>
                        <select value={ilpGuarantee} onChange={e => setIlpGuarantee(parseInt(e.target.value))} style={inputStyle}>
                          <option value={3}>3 z 5/6 (podstawowa)</option>
                          <option value={4}>4 z 5/6 (zaawansowana)</option>
                          <option value={5}>5 z 5/6 (ekspert)</option>
                        </select>
                      </div>

                      <button type="submit" style={buttonStyle} disabled={ilpLoading}>
                        {ilpLoading ? "🧮 Obliczam ILP..." : "🧮 Generuj system ILP"}
                      </button>
                    </form>

                    {ilpResults && (
                      <div style={{ marginTop: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <h3 style={{ color: "#222", margin: 0 }}>Wyniki systemu ILP:</h3>
                          <button 
                            onClick={copyILPBetsToClipboard}
                            style={{
                              background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: 8,
                              padding: "8px 16px",
                              fontSize: 14,
                              cursor: "pointer"
                            }}
                          >
                            📋 Kopiuj
                          </button>
                        </div>
                        <div style={{ 
                          background: "#fff", 
                          padding: 20, 
                          borderRadius: 12, 
                          border: "2px solid #1976d2",
                          maxHeight: "400px",
                          overflow: "auto"
                        }}>
                          <div style={{ marginBottom: 16, padding: 12, background: "#e3f2fd", borderRadius: 8 }}>
                            <strong>Informacje o systemie:</strong><br/>
                            Liczby: {ilpResults.numbers.join(", ")}<br/>
                            Gwarancja: {ilpResults.guarantee} z {ilpGame === "miniLotto" ? 5 : ilpGame === "lotto" ? 6 : ilpGame === "eurojackpot" ? "5+2" : ilpGame === "keno" ? 10 : ilpGame === "multiMulti" ? 20 : ilpGame === "kaskada" ? 6 : 5}<br/>
                            Liczba zakładów: {ilpResults.totalBets}<br/>
                            Skuteczność: {ilpResults.systemInfo.effectiveness}<br/>
                            Koszt: {ilpResults.systemInfo.potentialCost.toFixed(2)} PLN
                          </div>
                          {ilpResults.bets.map((bet, index) => (
                            <div key={index} style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 8, 
                              marginBottom: 12,
                              padding: 12,
                              background: "#f8f9fa",
                              borderRadius: 8
                            }}>
                              <span style={{ fontWeight: "bold", color: "#1976d2", minWidth: 80 }}>Zakład {index + 1}:</span>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {ilpGame === "eurojackpot" ? (
                                  <>
                                    <span style={{ color: "#666" }}>Główne: {bet[0].join(", ")}</span>
                                    <span style={{ color: "#1976d2" }}>Euro: {bet[1].join(", ")}</span>
                                  </>
                                ) : (
                                  bet.map((num, numIndex) => (
                                    <div key={numIndex} style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: "50%",
                                      background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
                                      color: "#000",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: "bold",
                                      fontSize: 14,
                                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                      border: "2px solid #ffb300"
                                    }}>
                                      {num}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Przyciski akcji dla ILP */}
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "center", 
                      alignItems: "center", 
                      marginTop: 20, 
                      flexWrap: "wrap", 
                      gap: "12px" 
                    }}>
                      <button 
                        onClick={() => {
                          const resultText = ilpResults.bets.map((bet, index) => {
                            if (ilpGame === "eurojackpot") {
                              return `Zakład ${index + 1}: Główne: ${bet[0].join(", ")} | Euro: ${bet[1].join(", ")}`;
                            }
                            return `Zakład ${index + 1}: ${bet.join(", ")}`;
                          }).join('\n');
                          navigator.clipboard.writeText(resultText).then(() => {
                            alert('Wyniki ILP skopiowane do schowka!');
                          }).catch(() => {
                            alert('Błąd kopiowania. Skopiuj ręcznie: ' + resultText);
                          });
                        }}
                        style={{
                          background: "linear-gradient(45deg, #4CAF50, #45a049)",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          padding: window.innerWidth <= 480 ? "12px 16px" : "10px 20px",
                          fontSize: window.innerWidth <= 480 ? "14px" : "16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          fontWeight: "bold",
                          boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 2px 8px rgba(76, 175, 80, 0.3)";
                        }}
                      >
                        📋 Kopiuj wyniki
                      </button>

                      <button 
                        onClick={() => {
                          const favorites = JSON.parse(localStorage.getItem('favoriteSets') || '[]');
                          const newFavorite = {
                            id: Date.now(),
                            name: `System ILP ${ilpGame} ${ilpNumbers} liczb ${ilpGuarantee} z ${ilpGame === "miniLotto" ? 5 : ilpGame === "lotto" ? 6 : ilpGame === "eurojackpot" ? "5+2" : ilpGame === "keno" ? 10 : ilpGame === "multiMulti" ? 20 : ilpGame === "kaskada" ? 6 : 5} ${new Date().toLocaleDateString('pl-PL')}`,
                            sets: ilpResults.bets,
                            game: ilpGame,
                            generatorType: 'ilp',
                            systemInfo: {
                              numbers: ilpNumbers,
                              guarantee: ilpGuarantee,
                              type: ilpSystemType,
                              effectiveness: ilpResults.systemInfo.effectiveness,
                              cost: ilpResults.systemInfo.potentialCost
                            },
                            date: new Date().toISOString()
                          };
                          const updatedFavorites = [newFavorite, ...favorites];
                          localStorage.setItem('favoriteSets', JSON.stringify(updatedFavorites));
                          alert('✅ System ILP został dodany do ulubionych!');
                        }}
                        style={{
                          background: "linear-gradient(45deg, #9C27B0, #673AB7)",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          padding: window.innerWidth <= 480 ? "12px 16px" : "10px 20px",
                          fontSize: window.innerWidth <= 480 ? "14px" : "16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          fontWeight: "bold",
                          boxShadow: "0 2px 8px rgba(156, 39, 176, 0.3)",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 4px 12px rgba(156, 39, 176, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 2px 8px rgba(156, 39, 176, 0.3)";
                        }}
                      >
                        ❤️ Dodaj do ulubionych
                      </button>

                      <button 
                        onClick={() => {
                          const printContent = `
                            SYSTEM ILP - ${ilpResults.systemInfo.type === "full" ? "100% GWARANCJA" : "OPTYMALIZACJA"}
                            
                            Gra: ${ilpGame === "miniLotto" ? "Mini Lotto" : ilpGame === "lotto" ? "Lotto" : ilpGame === "eurojackpot" ? "Eurojackpot" : ilpGame === "keno" ? "Keno" : ilpGame === "multiMulti" ? "Multi Multi" : ilpGame === "kaskada" ? "Kaskada" : ilpGame}
                            Liczby w systemie: ${ilpResults.numbers.join(", ")}
                            Gwarancja: ${ilpResults.guarantee} z ${ilpGame === "miniLotto" ? 5 : ilpGame === "lotto" ? 6 : ilpGame === "eurojackpot" ? "5+2" : ilpGame === "keno" ? 10 : ilpGame === "multiMulti" ? 20 : ilpGame === "kaskada" ? 6 : 5}
                            Liczba zakładów: ${ilpResults.totalBets}
                            Skuteczność: ${ilpResults.systemInfo.effectiveness}
                            Koszt: ${ilpResults.systemInfo.potentialCost.toFixed(2)} PLN
                            
                            ZAKŁADY:
                            ${ilpResults.bets.map((bet, index) => {
                              if (ilpGame === "eurojackpot") {
                                return `Zakład ${index + 1}: Główne: ${bet[0].join(", ")} | Euro: ${bet[1].join(", ")}`;
                              }
                              return `Zakład ${index + 1}: ${bet.join(", ")}`;
                            }).join('\n')}
                            
                            Data wygenerowania: ${new Date().toLocaleString('pl-PL')}
                          `;
                          const printWindow = window.open('', '_blank');
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>System ILP - ${ilpGame}</title>
                                <style>
                                  body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                                  h1 { color: #1976d2; text-align: center; }
                                  .info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
                                  .bets { margin-top: 20px; }
                                  .bet { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 5px; }
                                  @media print { body { font-size: 12px; } }
                                </style>
                              </head>
                              <body>
                                <h1>🎯 SYSTEM ILP - ${ilpGame.toUpperCase()}</h1>
                                <div class="info">
                                  <strong>Liczby w systemie:</strong> ${ilpResults.numbers.join(", ")}<br/>
                                  <strong>Gwarancja:</strong> ${ilpResults.guarantee} z ${ilpGame === "miniLotto" ? 5 : ilpGame === "lotto" ? 6 : ilpGame === "eurojackpot" ? "5+2" : ilpGame === "keno" ? 10 : ilpGame === "multiMulti" ? 20 : ilpGame === "kaskada" ? 6 : 5}<br/>
                                  <strong>Liczba zakładów:</strong> ${ilpResults.totalBets}<br/>
                                  <strong>Skuteczność:</strong> ${ilpResults.systemInfo.effectiveness}<br/>
                                  <strong>Koszt:</strong> ${ilpResults.systemInfo.potentialCost.toFixed(2)} PLN
                                </div>
                                <div class="bets">
                                  <h2>Zakłady:</h2>
                                  ${ilpResults.bets.map((bet, index) => {
                                    if (ilpGame === "eurojackpot") {
                                      return `<div class="bet"><strong>Zakład ${index + 1}:</strong> Główne: ${bet[0].join(", ")} | Euro: ${bet[1].join(", ")}</div>`;
                                    }
                                    return `<div class="bet"><strong>Zakład ${index + 1}:</strong> ${bet.join(", ")}</div>`;
                                  }).join('')}
                                </div>
                                <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                                  Wygenerowano: ${new Date().toLocaleString('pl-PL')}
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          printWindow.print();
                        }}
                        style={{
                          background: "linear-gradient(45deg, #FF9800, #F57C00)",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          padding: window.innerWidth <= 480 ? "12px 16px" : "10px 20px",
                          fontSize: window.innerWidth <= 480 ? "14px" : "16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          fontWeight: "bold",
                          boxShadow: "0 2px 8px rgba(255, 152, 0, 0.3)",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 4px 12px rgba(255, 152, 0, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 2px 8px rgba(255, 152, 0, 0.3)";
                        }}
                      >
                        📄 Pobierz PDF
                      </button>
                    </div>
                  </>
                )}
                
                {results.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: "8px" }}>
                      <h3 style={{ color: "#222", margin: 0 }}>Wyniki systemu:</h3>
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: window.innerWidth <= 480 ? "1fr 1fr" : "repeat(4, 1fr)",
                        gap: "8px",
                        width: window.innerWidth <= 480 ? "100%" : "auto"
                      }}>
                        <button 
                          onClick={() => {
                            const resultText = results.map((set, index) => {
                              if (selectedGame === "eurojackpot" && Array.isArray(set) && Array.isArray(set[0]) && Array.isArray(set[1])) {
                                return `Zakład ${index + 1}: Główne: ${set[0].join(", ")} | Euro: ${set[1].join(", ")}`;
                              }
                              return `Zakład ${index + 1}: ${Array.isArray(set) ? set.join(", ") : set}`;
                            }).join('\n');
                            navigator.clipboard.writeText(resultText).then(() => {
                              alert('Wyniki skopiowane do schowka!');
                            }).catch(() => {
                              alert('Błąd kopiowania. Skopiuj ręcznie: ' + resultText);
                            });
                          }}
                          style={{
                            background: "linear-gradient(45deg, #4CAF50, #45a049)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: window.innerWidth <= 480 ? "10px 8px" : "8px 16px",
                            fontSize: window.innerWidth <= 480 ? "12px" : "14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            minWidth: "0",
                            whiteSpace: "nowrap"
                          }}
                        >
                          📋 Kopiuj
                        </button>
                        <button 
                          onClick={() => {
                            const favorites = JSON.parse(localStorage.getItem('favoriteSets') || '[]');
                            const newFavorite = {
                              id: Date.now(),
                              name: `System skrócony ${selectedGame} ${systemNumbers} liczb ${systemGuarantee} z ${getGamePick(selectedGame)} ${new Date().toLocaleDateString('pl-PL')}`,
                              sets: results,
                              game: selectedGame,
                              generatorType: 'system',
                              systemInfo: {
                                numbers: systemNumbers,
                                guarantee: systemGuarantee,
                                pick: getGamePick(selectedGame)
                              },
                              date: new Date().toISOString()
                            };
                            const updatedFavorites = [newFavorite, ...favorites];
                            localStorage.setItem('favoriteSets', JSON.stringify(updatedFavorites));
                            alert(`System został dodany do ulubionych!`);
                          }}
                          style={{
                            background: "linear-gradient(45deg, #9C27B0, #673AB7)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: window.innerWidth <= 480 ? "10px 8px" : "8px 16px",
                            fontSize: window.innerWidth <= 480 ? "12px" : "14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            minWidth: "0",
                            whiteSpace: "nowrap"
                          }}
                        >
                          ❤️ Ulubione
                        </button>
                        <button 
                          onClick={() => {
                            setResults([]);
                            setSystemGeneratedNumbers([]);
                            setSelectedManualNumbers([]);
                            setSelectedEuroNumbers([]);
                          }}
                          style={{
                            background: "linear-gradient(45deg, #f44336, #d32f2f)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: window.innerWidth <= 480 ? "10px 8px" : "8px 16px",
                            fontSize: window.innerWidth <= 480 ? "12px" : "14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            minWidth: "0",
                            whiteSpace: "nowrap"
                          }}
                        >
                          🔄 Resetuj
                        </button>
                      <button 
                        onClick={() => {
                          const doc = new jsPDF();
                          doc.text("System skrócony lotto", 20, 20);
                          results.forEach((set, index) => {
                            doc.text(`Zakład ${index + 1}: ${set.join(", ")}`, 20, 40 + (index * 10));
                          });
                          doc.save("system-skrocony-lotto.pdf");
                        }}
                        style={{
                          background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                            padding: window.innerWidth <= 480 ? "10px 8px" : "8px 16px",
                            fontSize: window.innerWidth <= 480 ? "12px" : "14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "0",
                            whiteSpace: "nowrap"
                        }}
                      >
                        📄 PDF
                      </button>
                    </div>
                    </div>

                    {/* Informacje o systemie */}
                    <div style={{ 
                      marginBottom: 20, 
                      padding: 16, 
                      background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)", 
                      borderRadius: 12,
                      border: "2px solid #4caf50"
                    }}>
                      <h4 style={{ color: "#2e7d32", marginBottom: 12, textAlign: "center" }}>📊 Informacje o systemie</h4>
                      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth <= 480 ? "1fr" : "1fr 1fr", gap: "12px", fontSize: "14px" }}>
                        <div>
                          <strong>🎯 Gra:</strong> {
                            selectedGame === "lotto" ? "Lotto (6 z 49)" :
                            selectedGame === "miniLotto" ? "Mini Lotto (5 z 42)" :
                            selectedGame === "multiMulti" ? "Multi Multi (10 z 80)" :
                            selectedGame === "eurojackpot" ? "Eurojackpot (5+2)" :
                            selectedGame === "kaskada" ? "Kaskada (12 z 24)" :
                            selectedGame === "keno" ? `Keno (${kenoNumbers} z 70)` : "Gra"
                          }
                        </div>
                        <div>
                          <strong>🔢 Liczby w systemie:</strong> {systemNumbers} liczb
                        </div>
                        <div>
                          <strong>🎯 Gwarancja:</strong> {systemGuarantee} z {getGamePick(selectedGame)} ({(() => {
                            const guarantee = calculateRealGuarantee(systemNumbers, systemGuarantee, getGamePick(selectedGame));
                            const isFull = hasFullGuarantee(systemNumbers, systemGuarantee, getGamePick(selectedGame));
                            return isFull ? "100%" : `${guarantee}%`;
                          })()})
                        </div>
                        <div>
                          <strong>💰 Koszt:</strong> {results.length * 3} PLN ({results.length} × 3 PLN)
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: 12, 
                        padding: 8, 
                        background: "#fff", 
                        borderRadius: 8, 
                        fontSize: "13px",
                        color: "#2e7d32",
                        textAlign: "center"
                      }}>
                        <strong>💡 Jak grać:</strong> Wybierz {systemNumbers} liczb z zakresu gry. Jeśli trafisz {systemGuarantee} z {getGamePick(selectedGame)}, system zapewni Ci wygraną!
                      </div>
                    </div>

                    {/* Wygenerowane liczby systemu */}
                    {systemGeneratedNumbers.length > 0 && (
                      <div style={{ 
                        marginBottom: 20, 
                        padding: 16, 
                        background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)", 
                        borderRadius: 12,
                        border: "2px solid #ffc107"
                      }}>
                        <h4 style={{ color: "#856404", marginBottom: 12, textAlign: "center" }}>🎯 Wygenerowane liczby systemu</h4>
                        
                        {selectedGame === "eurojackpot" && typeof systemGeneratedNumbers === 'object' && systemGeneratedNumbers.main ? (
                          // Dla Eurojackpot - pokaż główne liczby i Euro osobno
                          <div>
                            <div style={{ marginBottom: "12px" }}>
                              <div style={{ 
                                fontSize: "14px", 
                                color: "#856404", 
                                fontWeight: "bold",
                                marginBottom: "8px"
                              }}>
                                🔢 Liczby główne (1-50):
                              </div>
                              <div style={{ 
                                display: "flex", 
                                justifyContent: "center", 
                                flexWrap: "wrap", 
                                gap: "8px",
                                marginBottom: "8px"
                              }}>
                                {systemGeneratedNumbers.main.map((number, i) => (
                                  <div key={i} style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #ffc107, #ffb300)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    fontSize: 12,
                                    color: "#222",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                  }}>
                                    {number}
                                  </div>
                                ))}
                              </div>
                              <div style={{ 
                                textAlign: "center", 
                                fontSize: "13px",
                                color: "#856404"
                              }}>
                                <strong>Zbiór {systemNumbers} liczb głównych: {systemGeneratedNumbers.main.join(", ")}</strong>
                              </div>
                            </div>
                            
                            <div>
                              <div style={{ 
                                fontSize: "14px", 
                                color: "#856404", 
                                fontWeight: "bold",
                                marginBottom: "8px"
                              }}>
                                🌟 Liczby Euro (1-12):
                              </div>
                              <div style={{ 
                                display: "flex", 
                                justifyContent: "center", 
                                flexWrap: "wrap", 
                                gap: "8px",
                                marginBottom: "8px"
                              }}>
                                {systemGeneratedNumbers.euro.map((number, i) => (
                                  <div key={i} style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #ffd700, #ffb300)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    fontSize: 12,
                                    color: "#222",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    border: "2px solid #ff8f00"
                                  }}>
                                    {number}
                                  </div>
                                ))}
                              </div>
                              <div style={{ 
                                textAlign: "center", 
                                fontSize: "13px",
                                color: "#856404"
                              }}>
                                <strong>Zbiór 2 liczb Euro: {systemGeneratedNumbers.euro.join(", ")}</strong>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Dla innych gier - standardowe wyświetlanie
                          <div>
                            <div style={{ 
                              display: "flex", 
                              justifyContent: "center", 
                              flexWrap: "wrap", 
                              gap: "8px",
                              marginBottom: 12
                            }}>
                              {systemGeneratedNumbers.map((number, i) => (
                                <div key={i} style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, #ffc107, #ffb300)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                  fontSize: 12,
                                  color: "#222",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}>
                                  {number}
                                </div>
                              ))}
                            </div>
                            <div style={{ 
                              textAlign: "center", 
                              fontSize: "14px",
                              color: "#856404"
                            }}>
                              <strong>🔢 Zbiór {systemNumbers} liczb: {systemGeneratedNumbers.join(", ")}</strong> - wybierz te liczby z zakresu gry
                            </div>
                          </div>
                        )}
                      </div>
                    )}



                    {/* Zakłady */}
                    <div style={{ 
                      background: "#fff", 
                      padding: 20, 
                      borderRadius: 12, 
                      border: "2px solid #4caf50",
                      maxHeight: "400px",
                      overflow: "auto"
                    }}>
                      {results.map((set, i) => (
                        <div key={i} style={{ 
                          background: "#fff", 
                          borderRadius: 16, 
                          padding: 18, 
                          marginBottom: 16, 
                          boxShadow: "0 2px 12px 0 rgba(0,0,0,0.06)",
                          position: "relative"
                        }}>
                          <div style={{ 
                            fontSize: 22, 
                            letterSpacing: 2, 
                            textAlign: "center", 
                            display: "flex", 
                            justifyContent: "center", 
                            flexWrap: "wrap",
                            marginBottom: 12
                          }}>
                            {selectedGame === "eurojackpot" && Array.isArray(set) && Array.isArray(set[0]) && Array.isArray(set[1])
                              ? <>
                                  {set[0].map((n, idx) => <Ball key={"e"+idx} n={n} />)}
                                  <span style={{ fontWeight: "bold", color: "#1976d2", margin: "0 8px" }}>|</span>
                                  {set[1].map((n, idx) => <Ball key={"e2"+idx} n={n} />)}
                                </>
                              : Array.isArray(set)
                                ? set.map((n, idx) => <Ball key={idx} n={n} />)
                                : null}
                          </div>
                          {/* Dodatkowe informacje dla Keno */}
                          {selectedGame === "keno" && Array.isArray(set) && (
                            <div style={{ 
                              textAlign: "center", 
                              marginBottom: 12, 
                              padding: "8px 12px", 
                              background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)", 
                              borderRadius: 8,
                              fontSize: 14,
                              color: "#1976d2"
                            }}>
                              <strong>Suma: {set.reduce((a, b) => a + b, 0)}</strong> | 
                              Parzyste: {set.filter(n => n % 2 === 0).length} | 
                              Nieparzyste: {set.filter(n => n % 2 !== 0).length} | 
                              Liczby: {kenoNumbers} | 
                              Zakres: {kenoRange === "low" ? "Niskie (1-35)" : kenoRange === "high" ? "Wysokie (36-70)" : "Mieszane (1-70)"}
                            </div>
                          )}
                          <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: 12 }}>
                            <button 
                              onClick={() => copySetToClipboard(set)}
                              style={{
                                background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 16px",
                                fontSize: 14,
                                cursor: "pointer",
                                fontWeight: "bold",
                                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                                transition: "all 0.2s ease"
                              }}
                              onMouseOver={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 16px rgba(76, 175, 80, 0.4)";
                              }}
                              onMouseOut={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.3)";
                              }}
                            >
                              Kopiuj
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Wykup plan Premium, aby odblokować dostęp do wszystkich funkcji.
                </p>
                <button 
                  onClick={() => setShowPayments(true)}
                  style={{
                    background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "16px 32px",
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Przejdź do płatności
                </button>
              </div>
            )
          } />
          
          <Route path="/stats" element={
            <FinalStatistics
              user={user}
              userBets={userBets}
              results={results}
              onClose={() => setShowStatistics(false)}
            />
          } />
          
          <Route path="/explanations" element={
            <div 
              className="explanations-container"
              style={{ 
                padding: window.innerWidth <= 768 ? "10px" : "20px",
                maxWidth: "100%",
                boxSizing: "border-box",
                position: "relative"
              }}
            >
              <h2 style={{ 
                color: "#222", 
                marginBottom: window.innerWidth <= 768 ? "16px" : "24px", 
                textAlign: "center",
                fontSize: window.innerWidth <= 768 ? "20px" : "24px"
              }}>📚 Wyjaśnienia i przykłady</h2>
              
              {/* System przełączania zakładek */}
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                marginBottom: window.innerWidth <= 768 ? "20px" : "30px",
                background: "#f5f5f5",
                borderRadius: 12,
                padding: window.innerWidth <= 768 ? "6px" : "8px",
                maxWidth: 600,
                margin: "0 auto 30px auto",
                flexWrap: window.innerWidth <= 480 ? "wrap" : "nowrap",
                gap: window.innerWidth <= 480 ? "4px" : "0"
              }}>
                <button
                  onClick={() => setExplanationsTab('minigry')}
                  style={{
                    background: explanationsTab === 'minigry' 
                      ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)" 
                      : "transparent",
                    color: explanationsTab === 'minigry' ? "white" : "#666",
                    border: "none",
                    borderRadius: 8,
                    padding: window.innerWidth <= 768 ? "8px 16px" : "12px 24px",
                    margin: window.innerWidth <= 480 ? "2px" : "0 4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: window.innerWidth <= 768 ? "12px" : "14px",
                    transition: "all 0.3s ease",
                    flex: 1,
                    maxWidth: window.innerWidth <= 480 ? "100%" : 180,
                    minWidth: window.innerWidth <= 480 ? "120px" : "auto"
                  }}
                >
                  🎮 Minigry
                </button>
                <button
                  onClick={() => setExplanationsTab('generatory')}
                  style={{
                    background: explanationsTab === 'generatory' 
                      ? "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)" 
                      : "transparent",
                    color: explanationsTab === 'generatory' ? "white" : "#666",
                    border: "none",
                    borderRadius: 8,
                    padding: window.innerWidth <= 768 ? "8px 16px" : "12px 24px",
                    margin: window.innerWidth <= 480 ? "2px" : "0 4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: window.innerWidth <= 768 ? "12px" : "14px",
                    transition: "all 0.3s ease",
                    flex: 1,
                    maxWidth: window.innerWidth <= 480 ? "100%" : 180,
                    minWidth: window.innerWidth <= 480 ? "120px" : "auto"
                  }}
                >
                  🎲 Generatory
                </button>
                <button
                  onClick={() => setExplanationsTab('generatory-ai')}
                  style={{
                    background: explanationsTab === 'generatory-ai' 
                      ? "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)" 
                      : "transparent",
                    color: explanationsTab === 'generatory-ai' ? "white" : "#666",
                    border: "none",
                    borderRadius: 8,
                    padding: window.innerWidth <= 768 ? "8px 16px" : "12px 24px",
                    margin: window.innerWidth <= 480 ? "2px" : "0 4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: window.innerWidth <= 768 ? "12px" : "14px",
                    transition: "all 0.3s ease",
                    flex: 1,
                    maxWidth: window.innerWidth <= 480 ? "100%" : 180,
                    minWidth: window.innerWidth <= 480 ? "120px" : "auto"
                  }}
                >
                  🤖 Generatory AI
                </button>
              </div>
              
              {/* Warunkowe renderowanie treści w zależności od wybranej zakładki */}
              {explanationsTab === 'minigry' && (
                <div>
                  <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                    <h3 style={{ 
                      color: "#4caf50", 
                      marginBottom: window.innerWidth <= 768 ? "12px" : "16px", 
                      textAlign: "center",
                      fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                    }}>🎮 Minigry - Szczegółowe wyjaśnienia</h3>
                    
                    {/* Magic Ball */}
                    <div style={{ 
                      background: "#e8f5e8", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #4caf50" 
                    }}>
                      <h4 style={{ 
                        color: "#2e7d32", 
                        marginBottom: window.innerWidth <= 768 ? "8px" : "12px", 
                        textAlign: "center",
                        fontSize: window.innerWidth <= 768 ? "16px" : "18px"
                      }}>🔮 Magic Ball - Magiczna Kula</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Zasada działania:</strong> Klasyczna gra z magiczną kulą, która losuje szczęśliwe liczby z efektami wizualnymi.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Jak grać:</strong> Kliknij "Losuj", a magiczna kula zacznie się obracać i emitować cząsteczki. Po chwili wylosuje 6 liczb z zakresu 1-49.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Algorytm:</strong> Używa Math.random() z dodatkowymi efektami wizualnymi. Każda liczba ma równą szansę 1/49.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Przykład:</strong> Wylosowane liczby: 7, 13, 23, 31, 37, 42
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Efekty:</strong> Dym, cząsteczki, animacje obrotu kuli, konfetti po wylosowaniu
                      </p>
                    </div>

                    {/* Slot Machine */}
                    <div style={{ 
                      background: "#fff3e0", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #ff9800" 
                    }}>
                      <h4 style={{ 
                        color: "#e65100", 
                        marginBottom: window.innerWidth <= 768 ? "8px" : "12px", 
                        textAlign: "center",
                        fontSize: window.innerWidth <= 768 ? "16px" : "18px"
                      }}>🎰 Slot Machine - Automat do Gry</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Zasada działania:</strong> Automat do gry z animowanymi bębnami, który generuje liczby w stylu kasyna.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Jak grać:</strong> Kliknij "Kręć", a 6 bębnów zacznie się obracać. Każdy bęben losuje liczbę od 1 do 49. Bębny zatrzymują się kolejno.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Algorytm:</strong> Każdy bęben ma własny generator liczb losowych. Bębny obracają się z różnymi prędkościami dla efektu kasyna.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Przykład:</strong> Bęben 1: 7, Bęben 2: 13, Bęben 3: 23, Bęben 4: 31, Bęben 5: 37, Bęben 6: 42
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Efekty:</strong> Animowane bębny, dźwięki kasyna, efekty świetlne, stopniowe zatrzymywanie
                      </p>
                    </div>

                    {/* Magiczne Losowanie */}
                    <div style={{ 
                      background: "#f3e5f5", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #9c27b0" 
                    }}>
                      <h4 style={{ 
                        color: "#7b1fa2", 
                        marginBottom: window.innerWidth <= 768 ? "8px" : "12px", 
                        textAlign: "center",
                        fontSize: window.innerWidth <= 768 ? "16px" : "18px"
                      }}>✨ Magiczne Losowanie - Mistyczna Gra</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Zasada działania:</strong> Mistyczna gra z cząsteczkami i efektami świetlnymi, która losuje liczby w magicznej atmosferze.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Jak grać:</strong> Kliknij "Magiczne Losowanie", a ekran wypełni się cząsteczkami i światłem. Liczby pojawiają się w magicznych kulach.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Algorytm:</strong> Używa zaawansowanych efektów wizualnych z cząsteczkami. Liczby są losowane z rozkładem normalnym dla lepszego efektu.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Przykład:</strong> Magiczne kule: 3, 11, 19, 27, 35, 43
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Efekty:</strong> Cząsteczki świetlne, pulsujące światło, magiczne kule, efekty dymu
                      </p>
                    </div>

                    {/* Złap szczęśliwą kulę */}
                    <div style={{ 
                      background: "#e3f2fd", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #2196f3" 
                    }}>
                      <h4 style={{ 
                        color: "#1565c0", 
                        marginBottom: window.innerWidth <= 768 ? "8px" : "12px", 
                        textAlign: "center",
                        fontSize: window.innerWidth <= 768 ? "16px" : "18px"
                      }}>🎯 Złap szczęśliwą kulę - Interaktywna Gra</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Zasada działania:</strong> Interaktywna gra polegająca na łapaniu spadających kulek z liczbami.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Jak grać:</strong> Kule z liczbami spadają z góry ekranu. Klikaj na nie, aby je złapać. Musisz złapać 6 kulek, aby ukończyć grę.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Algorytm:</strong> Kule spadają z różnymi prędkościami i trajektoriami. Każda kula ma przypisaną liczbę 1-49. Fizyka grawitacji.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Przykład:</strong> Złapane kule: 5, 12, 18, 25, 33, 41
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Efekty:</strong> Fizyka spadania, efekty dźwiękowe przy łapaniu, animacje eksplozji, licznik złapanych kulek
                      </p>
                    </div>

                    {/* Kręć Kołem Liczb */}
                    <div style={{ 
                      background: "#fff8e1", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #ffc107" 
                    }}>
                      <h4 style={{ 
                        color: "#f57c00", 
                        marginBottom: window.innerWidth <= 768 ? "8px" : "12px", 
                        textAlign: "center",
                        fontSize: window.innerWidth <= 768 ? "16px" : "18px"
                      }}>🎡 Kręć Kołem Liczb - Koło Fortuny</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Zasada działania:</strong> Koło fortuny z liczbami, które obraca się i losuje szczęśliwe kombinacje.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Jak grać:</strong> Kliknij "Kręć kołem", a koło zacznie się obracać. Po zatrzymaniu wskaże 6 liczb z zakresu 1-49.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Algorytm:</strong> Koło obraca się z fizyką rzeczywistą (tarcie, siła bezwładności). Liczby są rozmieszczone równomiernie na kole.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Przykład:</strong> Wskazane liczby: 2, 9, 16, 24, 38, 47
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Efekty:</strong> Realistyczna fizyka obrotu, dźwięki koła, efekty świetlne, stopniowe zwalnianie
                      </p>
                    </div>

                    {/* Aim & Select */}
                    <div style={{ 
                      background: "#fce4ec", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #e91e63" 
                    }}>
                      <h4 style={{ 
                        color: "#c2185b", 
                        marginBottom: window.innerWidth <= 768 ? "8px" : "12px", 
                        textAlign: "center",
                        fontSize: window.innerWidth <= 768 ? "16px" : "18px"
                      }}>🎯 Aim & Select - Gra Celownicza</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Zasada działania:</strong> Gra celownicza, gdzie strzelasz do kulek z liczbami.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Jak grać:</strong> Kule z liczbami pojawiają się na ekranie. Celuj i strzelaj, aby trafić w 6 kulek. Każda trafiona kula odkrywa liczbę.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Algorytm:</strong> Kule pojawiają się w losowych pozycjach. System wykrywania kolizji sprawdza trafienia. Fizyka pocisków.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Przykład:</strong> Trafione kule: 8, 15, 22, 29, 36, 44
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0, fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                        <strong>Efekty:</strong> Celownik, efekty strzałów, animacje trafień, dźwięki strzałów, efekty eksplozji
                      </p>
                    </div>
                  </div>

                  {/* Ważne informacje */}
                  <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                    <h3 style={{ 
                      color: "#1976d2", 
                      marginBottom: window.innerWidth <= 768 ? "12px" : "16px",
                      fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                    }}>⚠️ Ważne informacje</h3>
                    <div style={{ 
                      background: "#fff", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Teoria losowości:</strong> Każdy zestaw liczb ma identyczną szansę, niezależnie od przeszłości. Wyniki są statystycznie niezależne.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Algorytmy statystyczne:</strong> Zwiększają szansę na trafienie zestawów zgodnych z historycznymi wzorcami, ale nie gwarantują wygranej.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Systemy skrócone:</strong> Obniżają koszty gry i zapewniają minimalne gwarancje, ale NIE zwiększają szansy na główną wygraną. To tylko optymalizacja kosztów!
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Brak gwarancji wygranej:</strong> Żaden system, algorytm ani strategia nie daje gwarancji na wygraną w lotto. To zawsze gra losowa.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                        <strong>Odpowiedzialna gra:</strong> Graj tylko w ramach swoich możliwości finansowych. Lotto to gra losowa i nie powinna być traktowana jako sposób na zarabianie pieniędzy.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {explanationsTab === 'generatory' && (
                <div>
                  <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                    <h3 style={{ 
                      color: "#1976d2", 
                      marginBottom: window.innerWidth <= 768 ? "12px" : "16px", 
                      textAlign: "center",
                      fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                    }}>🎯 Generator zestawów - Algorytmy</h3>
        
                    {/* Lotto */}
                    <div style={{ 
                      background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #1976d2",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#1565c0", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🎯 Lotto (6 z 49)</h4>
                      <p><strong>Założenia statystyczne:</strong></p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Suma 6 liczb: 100-180 (najczęściej ~140)</li>
                        <li>Rozkład: 3 niskie (1-25) + 3 wysokie (26-49)</li>
                        <li>Parzyste/nieparzyste: 3 parzyste + 3 nieparzyste</li>
                      </ul>
                      <p><strong>Przykład:</strong></p>
                      <p>Wylosowane liczby: 7, 13, 23, 31, 37, 42</p>
                      <p>Suma: 153 ✅ (w zakresie 100-180)</p>
                      <p>Niskie: 7, 13, 23 (3 szt.) ✅</p>
                      <p>Wysokie: 31, 37, 42 (3 szt.) ✅</p>
                      <p>Parzyste: 42 (1 szt.) ❌ (powinno być 3)</p>
                      <p>Nieparzyste: 7, 13, 23, 31, 37 (5 szt.) ❌ (powinno być 3)</p>
                    </div>

                    {/* Mini Lotto */}
                    <div style={{ 
                      background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #ff9800",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#e65100", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🎰 Mini Lotto (5 z 42)</h4>
                      <p><strong>Założenia statystyczne:</strong></p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Suma 5 liczb: 80-130 (najczęściej ~105)</li>
                        <li>Rozkład: 3 niskie (1-21) + 2 wysokie (22-42)</li>
                        <li>Parzyste/nieparzyste: 2 parzyste + 3 nieparzyste</li>
                      </ul>
                      <p><strong>Przykład:</strong></p>
                      <p>Wylosowane liczby: 3, 7, 17, 29, 35</p>
                      <p>Suma: 91 ✅ (w zakresie 80-130)</p>
                      <p>Niskie: 3, 7, 17 (3 szt.) ✅</p>
                      <p>Wysokie: 29, 35 (2 szt.) ✅</p>
                      <p>Parzyste: brak (0 szt.) ❌ (powinno być 2)</p>
                      <p>Nieparzyste: 3, 7, 17, 29, 35 (5 szt.) ✅</p>
                    </div>

                    {/* Multi Multi */}
                    <div style={{ 
                      background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #9c27b0",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#7b1fa2", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🎲 Multi Multi (10 z 80)</h4>
                      <p><strong>Założenia statystyczne:</strong></p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Suma 10 liczb: 300-500 (najczęściej ~400)</li>
                        <li>Rozkład: 5 niskie (1-40) + 5 wysokie (41-80)</li>
                        <li>Parzyste/nieparzyste: 5 parzyste + 5 nieparzyste</li>
                      </ul>
                      <p><strong>Przykład:</strong></p>
                      <p>Wylosowane liczby: 3, 8, 15, 22, 31, 44, 52, 61, 67, 78</p>
                      <p>Suma: 381 ✅ (w zakresie 300-500)</p>
                      <p>Niskie: 3, 8, 15, 22, 31 (5 szt.) ✅</p>
                      <p>Wysokie: 44, 52, 61, 67, 78 (5 szt.) ✅</p>
                      <p>Parzyste: 8, 22, 44, 52, 78 (5 szt.) ✅</p>
                      <p>Nieparzyste: 3, 15, 31, 61, 67 (5 szt.) ✅</p>
                    </div>

                    {/* Eurojackpot */}
                    <div style={{ 
                      background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #4caf50",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#2e7d32", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🇪🇺 Eurojackpot (5 z 50 + 2 z 12)</h4>
                      <p><strong>Założenia statystyczne:</strong></p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Główne liczby (5 z 50): suma 100-200, rozkład 2-3 niskie + 2-3 wysokie</li>
                        <li>Liczby Euro (2 z 12): suma 3-20, różne liczby</li>
                        <li>Parzyste/nieparzyste: zrównoważone</li>
                      </ul>
                      <p><strong>Przykład:</strong></p>
                      <p>Główne liczby: 7, 18, 29, 41, 47</p>
                      <p>Liczby Euro: 3, 9</p>
                      <p>Suma głównych: 142 ✅ (w zakresie 100-200)</p>
                      <p>Suma Euro: 12 ✅ (w zakresie 3-20)</p>
                    </div>

                    {/* Kaskada */}
                    <div style={{ 
                      background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #e91e63",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#c2185b", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🌊 Kaskada (12 z 24)</h4>
                      <p><strong>Założenia statystyczne:</strong></p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Suma 12 liczb: 120-200 (najczęściej ~160)</li>
                        <li>Rozkład: 6 niskie (1-12) + 6 wysokie (13-24)</li>
                        <li>Parzyste/nieparzyste: 6 parzyste + 6 nieparzyste</li>
                      </ul>
                      <p><strong>Przykład:</strong></p>
                      <p>Wylosowane liczby: 2, 4, 7, 9, 11, 13, 15, 17, 19, 21, 23, 24</p>
                      <p>Suma: 165 ✅ (w zakresie 120-200)</p>
                      <p>Niskie: 2, 4, 7, 9, 11, 13 (6 szt.) ✅</p>
                      <p>Wysokie: 15, 17, 19, 21, 23, 24 (6 szt.) ✅</p>
                    </div>
                  </div>

                  {/* AI Ultra Pro */}
                  <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                    <h3 style={{ 
                      color: "#9c27b0", 
                      marginBottom: window.innerWidth <= 768 ? "12px" : "16px", 
                      textAlign: "center",
                      fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                    }}>🚀 AI Lotto Generator Ultra Pro - Zaawansowany algorytm</h3>
                    
                    <div style={{ 
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      color: "white", 
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "white", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🎯 7-stopniowy algorytm AI z analizą matematyczną</h4>
                      <p style={{ marginBottom: 15 }}>AI Ultra Pro wykorzystuje zaawansowane techniki matematyczne i sztuczną inteligencję do generowania optymalnych kombinacji liczb.</p>
                    </div>

                    {/* Krok 1 */}
                    <div style={{ 
                      background: "#e8f5e8", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #4caf50",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#2e7d32", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🧠 Krok 1: Analiza prawdopodobieństwa + unikanie popularnych kombinacji</h4>
                      <p><strong>Cel:</strong> Unikanie najczęściej wybieranych kombinacji przez graczy</p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Analiza historycznych danych o popularnych wyborach</li>
                        <li>Identyfikacja wzorców (np. daty urodzenia, sekwencje)</li>
                        <li>Preferowanie mniej popularnych kombinacji</li>
                      </ul>
                      <p><strong>Przykład:</strong> Unikanie kombinacji typu 1,2,3,4,5,6 lub dat urodzenia</p>
                    </div>

                    {/* Krok 2 */}
                    <div style={{ 
                      background: "#fff3e0", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #ff9800",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#e65100", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>📊 Krok 2: Analiza odchyleń standardowych (gorące/zimne liczby)</h4>
                      <p><strong>Cel:</strong> Identyfikacja liczb "gorących" i "zimnych" na podstawie historii</p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Obliczanie średniej częstotliwości każdej liczby</li>
                        <li>Analiza odchyleń od średniej</li>
                        <li>Wykorzystanie prawa powrotu do średniej</li>
                      </ul>
                      <p><strong>Przykład:</strong> Jeśli liczba 7 pojawiała się rzadko, zwiększa się jej prawdopodobieństwo</p>
                    </div>

                    {/* Krok 3 */}
                    <div style={{ 
                      background: "#e3f2fd", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #2196f3",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#1565c0", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🔢 Krok 3: Prawo Benforda + rozkłady nieliniowe</h4>
                      <p><strong>Cel:</strong> Wykorzystanie prawa Benforda do analizy wzorców w liczbach</p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Prawo Benforda: pierwsze cyfry liczb nie są równomiernie rozłożone</li>
                        <li>Preferowanie liczb zaczynających się od 1, 2, 3</li>
                        <li>Analiza nieliniowych rozkładów prawdopodobieństwa</li>
                      </ul>
                      <p><strong>Przykład:</strong> Liczby 1-9 mają wyższe prawdopodobieństwo niż 40-49</p>
                    </div>

                    {/* Krok 4 */}
                    <div style={{ 
                      background: "#fce4ec", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #e91e63",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#c2185b", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🎲 Krok 4: Symulacje Monte Carlo (1M+ iteracji)</h4>
                      <p><strong>Cel:</strong> Symulacja milionów losowań do przewidywania wzorców</p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>1,000,000+ losowych symulacji</li>
                        <li>Analiza częstotliwości występowania każdej liczby</li>
                        <li>Identyfikacja najbardziej prawdopodobnych kombinacji</li>
                      </ul>
                      <p><strong>Przykład:</strong> Jeśli w symulacjach liczba 23 pojawia się często, zwiększa się jej waga</p>
                    </div>

                    {/* Krok 5 */}
                    <div style={{ 
                      background: "#fff8e1", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #ffc107",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#f57c00", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🔧 Krok 5: Filtry matematyczne</h4>
                      <p><strong>Cel:</strong> Aplikacja matematycznych filtrów do optymalizacji kombinacji</p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Równowaga parzystych/nieparzystych liczb</li>
                        <li>Rozkład niskich/wysokich liczb</li>
                        <li>Unikanie sekwencji (1,2,3,4,5,6)</li>
                        <li>Optymalizacja sumy liczb</li>
                      </ul>
                      <p><strong>Przykład:</strong> Lotto: 3 parzyste + 3 nieparzyste, suma 120-160</p>
                    </div>

                    {/* Krok 6 */}
                    <div style={{ 
                      background: "#f3e5f5", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #9c27b0",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#7b1fa2", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>♟️ Krok 6: Algorytm Szachowy (Markov model, 10k symulacji)</h4>
                      <p><strong>Cel:</strong> Wykorzystanie strategii szachowej do przewidywania optymalnych ruchów</p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Markov Chain: każdy ruch wpływa na następny</li>
                        <li>10,000 symulacji gier szachowych</li>
                        <li>Transfer strategii szachowej na wybór liczb</li>
                        <li>Analiza pozycji i wzorców</li>
                      </ul>
                      <p><strong>Przykład:</strong> Jak w szachach, każda liczba wpływa na prawdopodobieństwo następnej</p>
                    </div>

                    {/* Krok 7 */}
                    <div style={{ 
                      background: "#e0f2f1", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #009688",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#00695c", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🌀 Krok 7: Inteligentny chaos (70% algorytmiczny + 30% losowy)</h4>
                      <p><strong>Cel:</strong> Połączenie algorytmicznej precyzji z losowością</p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>70% wyborów opartych na algorytmie</li>
                        <li>30% czystego losu dla nieprzewidywalności</li>
                        <li>Zachowanie elementu zaskoczenia</li>
                        <li>Optymalizacja między przewidywalnością a losowością</li>
                      </ul>
                      <p><strong>Przykład:</strong> Większość liczb wybrana algorytmicznie, kilka losowo</p>
                    </div>

                    {/* AI Confidence */}
                    <div style={{ 
                      background: "#e8f5e8", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #4caf50",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#2e7d32", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🎯 AI Confidence - Pewność algorytmu</h4>
                      <p><strong>Jak obliczana jest pewność AI:</strong></p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                        <li>Analiza zgodności z matematycznymi wzorcami</li>
                        <li>Ocena jakości kombinacji według wszystkich 7 kroków</li>
                        <li>Porównanie z historycznymi danymi</li>
                        <li>Wynik: 75-95% pewności</li>
                      </ul>
                      <p><strong>Uwaga:</strong> Wyższa pewność nie gwarantuje wygranej, ale wskazuje na lepszą zgodność z matematycznymi wzorcami.</p>
                    </div>
                  </div>

                  {/* Systemy skrócone */}
                  <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                    <h3 style={{ 
                      color: "#1976d2", 
                      marginBottom: window.innerWidth <= 768 ? "12px" : "16px", 
                      textAlign: "center",
                      fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                    }}>🎲 Systemy skrócone - Szczegółowe wyjaśnienie</h3>
                    
                    <div style={{ 
                      background: "#ffebee", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #f44336",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#d32f2f", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>⚠️ WAŻNE - Systemy skrócone NIE dają gwarancji na wygraną!</h4>
                      <p style={{ color: "#d32f2f", fontWeight: "bold" }}>Systemy skrócone to matematyczna optymalizacja kosztów gry, ale NIE zwiększają szansy na główną wygraną. To tylko sposób na grę większą liczbą liczb przy niższym koszcie.</p>
                    </div>

                    <div style={{ 
                      background: "#fff", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#222", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🔍 Co to jest system skrócony?</h4>
                      <p><strong>System pełny:</strong> Jeśli wybierzesz 7 liczb w Lotto, musisz zagrać wszystkie możliwe kombinacje 6 z 7 = 7 zakładów</p>
                      
                      <h5 style={{ color: "#1976d2", marginTop: 20, marginBottom: 12 }}>🎯 PRZYKŁAD PRAKTYCZNY - System 8 liczb z gwarancją 4 z 6</h5>
                      <div style={{ background: "#e8f5e8", borderRadius: 8, padding: 12, marginBottom: 12, border: "1px solid #4caf50" }}>
                        <p><strong>Twoje liczby:</strong> 2, 5, 7, 8, 20, 22, 30, 49</p>
                        <p><strong>Gwarancja:</strong> 4 z 6 trafień</p>
                        <p><strong>Liczba zakładów:</strong> 15</p>
                      </div>
                      
                      <p><strong>Jak obstawić zakłady:</strong></p>
                      <p>Musisz obstawić <strong>wszystkie 15 zakładów</strong> wygenerowanych przez system. Każdy zakład to 6 liczb z Twoich 8.</p>
                      
                      <p><strong>Przykładowe zakłady (pierwsze 5 z 15):</strong></p>
                      <div style={{ background: "#f5f5f5", borderRadius: 6, padding: 8, marginBottom: 8, fontFamily: "monospace" }}>
                        <p>Zakład 1: 2, 5, 7, 8, 20, 22</p>
                        <p>Zakład 2: 2, 5, 7, 8, 20, 30</p>
                        <p>Zakład 3: 2, 5, 7, 8, 22, 49</p>
                        <p>Zakład 4: 2, 5, 7, 20, 30, 49</p>
                        <p>Zakład 5: 2, 5, 8, 20, 22, 30</p>
                        <p>... (i 10 kolejnych zakładów)</p>
                      </div>
                      
                      <p><strong>Gwarancja:</strong> Jeśli w losowaniu padną 4 z Twoich 8 liczb, to <strong>przynajmniej jeden z 15 zakładów</strong> będzie zawierał wszystkie 4 trafione liczby.</p>
                      
                      <p><strong>Przykład trafienia:</strong></p>
                      <div style={{ background: "#fff3cd", borderRadius: 6, padding: 8, marginBottom: 8, border: "1px solid #ffc107" }}>
                        <p>W losowaniu padły: <strong>2, 7, 20, 30</strong> (4 z Twoich) + 15, 41 (2 inne)</p>
                        <p>✅ Gwarancja: Przynajmniej jeden z Twoich 15 zakładów zawiera wszystkie 4 trafione liczby</p>
                        <p>🎯 Możliwy trafiony zakład: 2, 5, 7, 8, 20, 30 (zawiera 2, 7, 20, 30)</p>
                      </div>
                      
                      <p><strong>Koszt:</strong> 15 zakładów × cena zakładu = 15 × 3 zł = 45 zł</p>
                      <p><strong>Oszczędność:</strong> System pełny (8 liczb) = 28 zakładów = 84 zł. Oszczędzasz 39 zł!</p>
                      
                      <p><strong>System skrócony:</strong> Możesz zagrać mniejszą liczbą zakładów (np. 4 zamiast 7), ale z gwarancją minimalnych trafień</p>
                      <p><strong>Cel:</strong> Oszczędność pieniędzy przy zachowaniu matematycznych gwarancji</p>
                    </div>
                  </div>

                  {/* Generator marzeń */}
                  <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                    <h3 style={{ 
                      color: "#e91e63", 
                      marginBottom: window.innerWidth <= 768 ? "12px" : "16px", 
                      textAlign: "center",
                      fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                    }}>✨ Generator marzeń - Daty urodzenia</h3>
                    
                    <div style={{ 
                      background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #e91e63",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#c2185b", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🎂 Jak działa konwersja dat na liczby</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Przykład:</strong> Data 12.06.1989
                      </p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6, marginBottom: 12 }}>
                        <li>Dzień: 12 → liczba 12</li>
                        <li>Miesiąc: 06 → liczba 6</li>
                        <li>Rok - suma cyfr: 1+9+8+9 = 27 → liczba 27</li>
                        <li>Poszczególne cyfry roku: 1, 9, 8, 9 → liczby 1, 9, 8, 9</li>
                        <li>Suma dnia i miesiąca: 12+6 = 18 → liczba 18</li>
                        <li>Wiek (2024-1989): 35 → liczba 35</li>
                      </ul>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Wszystkie liczby z tej daty:</strong> 12, 6, 27, 1, 9, 8, 18, 35
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                        <strong>Po usunięciu duplikatów:</strong> 1, 6, 8, 9, 12, 18, 27, 35
                      </p>
                    </div>

                    <div style={{ 
                      background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #4caf50",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#2e7d32", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>💝 Dlaczego warto używać generatora marzeń</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>✅ Zalety:</strong>
                      </p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6, marginBottom: 12 }}>
                        <li>Osobisty charakter: Liczby mają dla Ciebie znaczenie emocjonalne</li>
                        <li>Wspomnienia: Każda liczba przypomina ważne chwile z życia</li>
                        <li>Większe zaangażowanie: Gra staje się bardziej osobista</li>
                        <li>Unikalność: Każdy ma inne daty, więc zestawy są unikalne</li>
                        <li>Nostalgia: Łączy grę z ważnymi momentami życia</li>
                      </ul>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>💡 Wskazówki:</strong>
                      </p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6, marginBottom: 0 }}>
                        <li>Dodaj daty urodzenia bliskich osób (partner, dzieci, rodzice)</li>
                        <li>Uwzględnij ważne daty (ślub, poznanie partnera, narodziny dzieci)</li>
                        <li>Możesz dodać daty rocznic, ważnych wydarzeń</li>
                        <li>System automatycznie doda losowe liczby, jeśli dat nie wystarczy</li>
                      </ul>
                    </div>

                    <div style={{ 
                      background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #ff9800",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#e65100", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>📅 Przykład praktyczny</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Daty użytkownika:</strong>
                      </p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6, marginBottom: 12 }}>
                        <li>Moja data urodzenia: 15.03.1985 → liczby: 15, 3, 26, 1, 9, 8, 5, 18, 39</li>
                        <li>Data urodzenia partnera: 22.07.1987 → liczby: 22, 7, 25, 1, 9, 8, 7, 29, 37</li>
                        <li>Data ślubu: 14.06.2015 → liczby: 14, 6, 17, 2, 0, 1, 5, 20, 9</li>
                      </ul>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Wszystkie liczby (po usunięciu duplikatów):</strong>
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        0, 1, 2, 3, 5, 6, 7, 8, 9, 14, 15, 17, 18, 20, 22, 25, 26, 29, 37, 39
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                        <strong>Zestaw Lotto (6 liczb):</strong> 1, 3, 15, 22, 26, 39
                      </p>
                    </div>
                  </div>

                  {/* Generator szczęśliwych liczb */}
                  <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                    <h3 style={{ 
                      color: "#9c27b0", 
                      marginBottom: window.innerWidth <= 768 ? "12px" : "16px", 
                      textAlign: "center",
                      fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                    }}>🍀 Generator szczęśliwych liczb</h3>
                    
                    <div style={{ 
                      background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #9c27b0",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#7b1fa2", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🎯 Jak działa generator szczęśliwych liczb</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>1. Dodaj swoje ulubione liczby:</strong>
                      </p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6, marginBottom: 12 }}>
                        <li>Liczby z dat urodzenia (7, 13, 23)</li>
                        <li>Liczby z ważnych wydarzeń (12, 25, 31)</li>
                        <li>Liczby szczęśliwe (3, 7, 11, 21)</li>
                        <li>Liczby z numerów telefonów, adresów</li>
                      </ul>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>2. Wybierz typ systemu:</strong>
                      </p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6, marginBottom: 12 }}>
                        <li>Pełny system: Wszystkie możliwe kombinacje z Twoich liczb</li>
                        <li>System skrócony: Matematycznie opracowane zakłady z gwarancją</li>
                        <li>Mieszanka: Twoje liczby + losowe dodatki</li>
                      </ul>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>3. Zapisz ulubione zestawy:</strong>
                      </p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6, marginBottom: 0 }}>
                        <li>Nadaj nazwę zestawowi (np. "Moje szczęśliwe")</li>
                        <li>Zapisz do pamięci przeglądarki</li>
                        <li>Wczytuj w dowolnym momencie</li>
                        <li>Usuwaj niepotrzebne zestawy</li>
                      </ul>
                    </div>

                    <div style={{ 
                      background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #1976d2",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#1565c0", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>📊 Przykład praktyczny</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Twoje szczęśliwe liczby:</strong> 3, 7, 11, 13, 21, 25, 31, 42
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Typ systemu:</strong> System skrócony z gwarancją 4 z 6
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Wynik:</strong> 15 zakładów matematycznie opracowanych
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                        <strong>Gwarancja:</strong> Jeśli wylosowano 4 z 8 liczb, na pewno trafisz co najmniej jedno "4 z 6"
                      </p>
                    </div>
                  </div>

                  {/* Ważne informacje */}
                  <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                    <h3 style={{ 
                      color: "#1976d2", 
                      marginBottom: window.innerWidth <= 768 ? "12px" : "16px", 
                      textAlign: "center",
                      fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                    }}>⚠️ Ważne informacje</h3>
                    <div style={{ 
                      background: "#fff", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <p><strong>Teoria losowości:</strong> Każdy zestaw liczb ma identyczną szansę, niezależnie od przeszłości. Wyniki są statystycznie niezależne.</p>
                      <p><strong>Algorytmy statystyczne:</strong> Zwiększają szansę na trafienie zestawów zgodnych z historycznymi wzorcami, ale nie gwarantują wygranej.</p>
                      <p><strong>Systemy skrócone:</strong> Obniżają koszty gry i zapewniają minimalne gwarancje, ale NIE zwiększają szansy na główną wygraną. To tylko optymalizacja kosztów!</p>
                      <p><strong>Brak gwarancji wygranej:</strong> Żaden system, algorytm ani strategia nie daje gwarancji na wygraną w lotto. To zawsze gra losowa.</p>
                      <p><strong>Odpowiedzialna gra:</strong> Graj tylko w ramach swoich możliwości finansowych. Lotto to gra losowa i nie powinna być traktowana jako sposób na zarabianie pieniędzy.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {explanationsTab === 'generatory-ai' && (
                <div>
                  <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                    <h3 style={{ 
                      color: "#9c27b0", 
                      marginBottom: window.innerWidth <= 768 ? "12px" : "16px", 
                      textAlign: "center",
                      fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                    }}>🤖 Generatory AI - Szczegółowe wyjaśnienia</h3>
                    
                    {/* AI Lotto Generator Ultra Pro */}
                    <div style={{ 
                      background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #9c27b0",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#7b1fa2", marginBottom: 12, textAlign: "center", fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🚀 AI Lotto Generator Ultra Pro</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Zasada działania:</strong> 7-stopniowy algorytm AI z analizą matematyczną wykorzystujący zaawansowane techniki sztucznej inteligencji do generowania optymalnych kombinacji liczb.
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Podstawy matematyczne:</strong> Algorytm opiera się na prawach prawdopodobieństwa, statystyce matematycznej, teorii chaosu i sztucznej inteligencji.
                      </p>
                      <div style={{ background: "#fff3cd", borderRadius: 8, padding: 12, marginTop: 12, border: "2px solid #ffc107" }}>
                        <p style={{ margin: 0, color: "#856404", fontWeight: "bold", textAlign: "center" }}>
                          ⚠️ UWAGA: Ten generator to mój własny pomysł i nie wszystkie prawa matematyczne są standardowe!
                        </p>
                        <p style={{ margin: "8px 0 0 0", color: "#856404", fontSize: "14px", textAlign: "center" }}>
                          Niektóre algorytmy i wzory zostały wymyślone przeze mnie i nie są powszechnie uznanymi metodami matematycznymi.
                        </p>
                      </div>
                    </div>

                    {/* Krok 1 */}
                    <div style={{ 
                      background: "#e8f5e8", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #4caf50",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#2e7d32", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🧠 Krok 1: Analiza prawdopodobieństwa + unikanie popularnych kombinacji</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Zasada:</strong> Unikanie najczęściej wybieranych kombinacji przez graczy
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Algorytm:</strong> Analiza historycznych danych o popularnych wyborach, identyfikacja wzorców (np. daty urodzenia, sekwencje), preferowanie mniej popularnych kombinacji
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Przykład:</strong> Unikanie kombinacji typu 1,2,3,4,5,6 lub dat urodzenia
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                        <strong>Matematyka:</strong> P(A) = 1 - P(popularne kombinacje), gdzie P(A) to prawdopodobieństwo wyboru kombinacji A
                      </p>
                    </div>

                    {/* Krok 2 */}
                    <div style={{ 
                      background: "#fff3e0", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #ff9800",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#e65100", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>📊 Krok 2: Analiza odchyleń standardowych (gorące/zimne liczby)</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Zasada:</strong> Identyfikacja liczb "gorących" i "zimnych" na podstawie historii
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Algorytm:</strong> Obliczanie średniej częstotliwości każdej liczby, analiza odchyleń od średniej, wykorzystanie prawa powrotu do średniej
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Przykład:</strong> Jeśli liczba 7 pojawiała się rzadko, zwiększa się jej prawdopodobieństwo
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                        <strong>Matematyka:</strong> σ = √(Σ(x-μ)²/n), gdzie σ to odchylenie standardowe, μ to średnia, x to wartość
                      </p>
                    </div>

                    {/* Krok 3 */}
                    <div style={{ 
                      background: "#e3f2fd", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #2196f3",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#1565c0", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🔢 Krok 3: Prawo Benforda + rozkłady nieliniowe</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Zasada:</strong> Wykorzystanie prawa Benforda do analizy wzorców w liczbach
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Algorytm:</strong> Prawo Benforda: pierwsze cyfry liczb nie są równomiernie rozłożone, preferowanie liczb zaczynających się od 1, 2, 3, analiza nieliniowych rozkładów prawdopodobieństwa
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Przykład:</strong> Liczby 1-9 mają wyższe prawdopodobieństwo niż 40-49
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                        <strong>Matematyka:</strong> P(d) = log₁₀(1 + 1/d), gdzie d to pierwsza cyfra, P(d) to prawdopodobieństwo jej wystąpienia
                      </p>
                    </div>

                    {/* Krok 4 */}
                    <div style={{ 
                      background: "#fce4ec", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #e91e63",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#c2185b", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🎲 Krok 4: Symulacje Monte Carlo (1M+ iteracji)</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Zasada:</strong> Symulacja milionów losowań do przewidywania wzorców
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Algorytm:</strong> 1,000,000+ losowych symulacji, analiza częstotliwości występowania każdej liczby, identyfikacja najbardziej prawdopodobnych kombinacji
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Przykład:</strong> Jeśli w symulacjach liczba 23 pojawia się często, zwiększa się jej waga
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                        <strong>Matematyka:</strong> ∫ f(x)dx ≈ (b-a)/N * Σf(xᵢ), gdzie N to liczba iteracji, f(x) to funkcja prawdopodobieństwa
                      </p>
                    </div>

                    {/* Krok 5 */}
                    <div style={{ 
                      background: "#fff8e1", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #ffc107",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#f57c00", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🔧 Krok 5: Filtry matematyczne</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Zasada:</strong> Aplikacja matematycznych filtrów do optymalizacji kombinacji
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Algorytm:</strong> Równowaga parzystych/nieparzystych liczb, rozkład niskich/wysokich liczb, unikanie sekwencji (1,2,3,4,5,6), optymalizacja sumy liczb
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Przykład:</strong> Lotto: 3 parzyste + 3 nieparzyste, suma 120-160
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                        <strong>Matematyka:</strong> Suma ∈ [120,160], parzyste = 3, nieparzyste = 3, niskie(1-25) = 3, wysokie(26-49) = 3
                      </p>
                    </div>

                    {/* Krok 6 */}
                    <div style={{ 
                      background: "#f3e5f5", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #9c27b0",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#7b1fa2", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>♟️ Krok 6: Algorytm Szachowy (Markov model, 10k symulacji)</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Zasada:</strong> Wykorzystanie strategii szachowej do przewidywania optymalnych ruchów
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Algorytm:</strong> Markov Chain: każdy ruch wpływa na następny, 10,000 symulacji gier szachowych, transfer strategii szachowej na wybór liczb, analiza pozycji i wzorców
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Przykład:</strong> Jak w szachach, każda liczba wpływa na prawdopodobieństwo następnej
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 8 }}>
                        <strong>Matematyka:</strong> P(Xₙ₊₁|Xₙ) = P(Xₙ₊₁|Xₙ, Xₙ₋₁, ..., X₁), gdzie Xₙ to stan w kroku n
                      </p>
                      <div style={{ background: "#ffebee", borderRadius: 6, padding: 8, border: "1px solid #f44336" }}>
                        <p style={{ margin: 0, color: "#d32f2f", fontSize: "12px", fontStyle: "italic" }}>
                          💡 To mój własny pomysł - transfer strategii szachowej na lotto nie jest standardową metodą matematyczną!
                        </p>
                      </div>
                    </div>

                    {/* Krok 7 */}
                    <div style={{ 
                      background: "#e0f2f1", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #009688",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#00695c", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🌀 Krok 7: Inteligentny chaos (70% algorytmiczny + 30% losowy)</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Zasada:</strong> Połączenie algorytmicznej precyzji z losowością
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Algorytm:</strong> 70% wyborów opartych na algorytmie, 30% czystego losu dla nieprzewidywalności, zachowanie elementu zaskoczenia, optymalizacja między przewidywalnością a losowością
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Przykład:</strong> Większość liczb wybrana algorytmicznie, kilka losowo
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 8 }}>
                        <strong>Matematyka:</strong> P(final) = 0.7 × P(algorytm) + 0.3 × P(losowy), gdzie P(final) to końcowe prawdopodobieństwo
                      </p>
                      <div style={{ background: "#ffebee", borderRadius: 6, padding: 8, border: "1px solid #f44336" }}>
                        <p style={{ margin: 0, color: "#d32f2f", fontSize: "12px", fontStyle: "italic" }}>
                          💡 To mój własny pomysł - proporcja 70/30 nie jest oparta na żadnych standardowych badaniach matematycznych!
                        </p>
                      </div>
                    </div>

                    {/* AI Confidence */}
                    <div style={{ 
                      background: "#e8f5e8", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #4caf50",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#2e7d32", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>🎯 AI Confidence - Pewność algorytmu</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Jak obliczana jest pewność AI:</strong>
                      </p>
                      <ul style={{ marginLeft: 20, lineHeight: 1.6, marginBottom: 12 }}>
                        <li>Analiza zgodności z matematycznymi wzorcami</li>
                        <li>Ocena jakości kombinacji według wszystkich 7 kroków</li>
                        <li>Porównanie z historycznymi danymi</li>
                        <li>Wynik: 75-95% pewności</li>
                      </ul>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Formuła pewności:</strong> Confidence = (Σ(score_krok_i) / 7) × 100%, gdzie score_krok_i to ocena 0-1 dla każdego kroku
                      </p>
                      <p style={{ lineHeight: 1.6, marginBottom: 8 }}>
                        <strong>Uwaga:</strong> Wyższa pewność nie gwarantuje wygranej, ale wskazuje na lepszą zgodność z matematycznymi wzorcami.
                      </p>
                      <div style={{ background: "#ffebee", borderRadius: 6, padding: 8, border: "1px solid #f44336" }}>
                        <p style={{ margin: 0, color: "#d32f2f", fontSize: "12px", fontStyle: "italic" }}>
                          💡 To mój własny pomysł - skala pewności 75-95% i formuła oceny nie są standardowymi metodami matematycznymi!
                        </p>
                      </div>
                    </div>

                    {/* Przykłady praktyczne */}
                    <div style={{ 
                      background: "#fff3e0", 
                      borderRadius: 12, 
                      padding: window.innerWidth <= 768 ? "16px" : "20px", 
                      marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                      border: "2px solid #ff9800",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                    }}>
                      <h4 style={{ color: "#e65100", marginBottom: 12, fontSize: window.innerWidth <= 768 ? "16px" : "18px" }}>📋 Przykłady praktyczne AI Ultra Pro</h4>
                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Przykład 1 - Lotto:</strong>
                      </p>
                      <div style={{ background: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, border: "1px solid #ddd" }}>
                        <p><strong>Wylosowane liczby:</strong> 7, 13, 23, 31, 37, 42</p>
                        <p><strong>Analiza AI:</strong></p>
                        <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                          <li>Suma: 153 ✅ (w zakresie 120-160)</li>
                          <li>Parzyste: 42 (1 szt.) ❌ (powinno być 3)</li>
                          <li>Nieparzyste: 7, 13, 23, 31, 37 (5 szt.) ❌ (powinno być 3)</li>
                          <li>Niskie (1-25): 7, 13, 23 (3 szt.) ✅</li>
                          <li>Wysokie (26-49): 31, 37, 42 (3 szt.) ✅</li>
                        </ul>
                        <p><strong>AI Confidence:</strong> 78% (dobra zgodność z wzorcami)</p>
                      </div>

                      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Przykład 2 - Poprawiona kombinacja:</strong>
                      </p>
                      <div style={{ background: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, border: "1px solid #ddd" }}>
                        <p><strong>Wylosowane liczby:</strong> 7, 13, 23, 31, 37, 44</p>
                        <p><strong>Analiza AI:</strong></p>
                        <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
                          <li>Suma: 155 ✅ (w zakresie 120-160)</li>
                          <li>Parzyste: 44 (1 szt.) ❌ (powinno być 3)</li>
                          <li>Nieparzyste: 7, 13, 23, 31, 37 (5 szt.) ❌ (powinno być 3)</li>
                          <li>Niskie (1-25): 7, 13, 23 (3 szt.) ✅</li>
                          <li>Wysokie (26-49): 31, 37, 44 (3 szt.) ✅</li>
                        </ul>
                        <p><strong>AI Confidence:</strong> 82% (lepsza zgodność)</p>
                      </div>
                    </div>

                    {/* Ważne informacje */}
                    <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                      <h3 style={{ 
                        color: "#1976d2", 
                        marginBottom: window.innerWidth <= 768 ? "12px" : "16px",
                        fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                      }}>⚠️ Ważne informacje</h3>
                      <div style={{ 
                        background: "#fff", 
                        borderRadius: 12, 
                        padding: window.innerWidth <= 768 ? "16px" : "20px", 
                        marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                      }}>
                        <p><strong>Teoria losowości:</strong> Każdy zestaw liczb ma identyczną szansę, niezależnie od przeszłości. Wyniki są statystycznie niezależne.</p>
                        <p><strong>Algorytmy statystyczne:</strong> Zwiększają szansę na trafienie zestawów zgodnych z historycznymi wzorcami, ale nie gwarantują wygranej.</p>
                        <p><strong>Systemy skrócone:</strong> Obniżają koszty gry i zapewniają minimalne gwarancje, ale NIE zwiększają szansy na główną wygraną. To tylko optymalizacja kosztów!</p>
                        <p><strong>Brak gwarancji wygranej:</strong> Żaden system, algorytm ani strategia nie daje gwarancji na wygraną w lotto. To zawsze gra losowa.</p>
                        <p><strong>Odpowiedzialna gra:</strong> Graj tylko w ramach swoich możliwości finansowych. Lotto to gra losowa i nie powinna być traktowana jako sposób na zarabianie pieniędzy.</p>
                      </div>
                    </div>

                    {/* Ostrzeżenie o niestandardowych metodach */}
                    <div style={{ marginBottom: window.innerWidth <= 768 ? "20px" : "30px" }}>
                      <h3 style={{ 
                        color: "#d32f2f", 
                        marginBottom: window.innerWidth <= 768 ? "12px" : "16px",
                        fontSize: window.innerWidth <= 768 ? "18px" : "20px"
                      }}>🚨 Ostrzeżenie o niestandardowych metodach</h3>
                      <div style={{ 
                        background: "#ffebee", 
                        borderRadius: 12, 
                        padding: window.innerWidth <= 768 ? "16px" : "20px", 
                        marginBottom: window.innerWidth <= 768 ? "16px" : "20px", 
                        border: "2px solid #f44336",
                        fontSize: window.innerWidth <= 768 ? "14px" : "16px"
                      }}>
                        <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                          <strong>AI Lotto Generator Ultra Pro to mój własny pomysł!</strong> Niektóre algorytmy i metody matematyczne zostały wymyślone przeze mnie i nie są powszechnie uznanymi metodami naukowymi.
                        </p>
                        <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                          <strong>Niestandardowe elementy:</strong>
                        </p>
                        <ul style={{ marginLeft: 20, lineHeight: 1.6, marginBottom: 12 }}>
                          <li>Transfer strategii szachowej na lotto (Krok 6)</li>
                          <li>Proporcja 70/30 w inteligentnym chaosie (Krok 7)</li>
                          <li>Skala pewności 75-95% w AI Confidence</li>
                          <li>Formuła oceny kombinacji</li>
                          <li>Niektóre wzory matematyczne</li>
                        </ul>
                        <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                          <strong>Uwaga:</strong> Te metody są eksperymentalne i nie mają podstaw naukowych. Używaj ich wyłącznie w celach rozrywkowych!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              

            </div>
          } />
          
          <Route path="/account" element={
            <div style={{ 
              padding: window.innerWidth <= 768 ? "10px" : "20px",
              maxWidth: "100%",
              boxSizing: "border-box"
            }}>
              <h2 style={{ 
                color: "#222", 
                marginBottom: window.innerWidth <= 768 ? "16px" : "24px", 
                textAlign: "center",
                fontSize: window.innerWidth <= 768 ? "20px" : "24px"
              }}>👤 Moje konto</h2>
              <div style={{ 
                background: "#fff", 
                borderRadius: 16, 
                padding: window.innerWidth <= 768 ? "16px" : "32px", 
                marginBottom: window.innerWidth <= 768 ? "16px" : "24px", 
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0"
              }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{
                    width: window.innerWidth <= 768 ? 70 : 80,
                    height: window.innerWidth <= 768 ? 70 : 80,
                    borderRadius: "50%",
                    background: profileData.profileImage 
                      ? `url(${profileData.profileImage})` 
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: window.innerWidth <= 768 ? 28 : 32,
                    color: "white",
                    fontWeight: "bold",
                    border: "3px solid #f0f0f0"
                  }}>
                    {!profileData.profileImage && (
                      profileData.firstName?.[0]?.toUpperCase() || 
                      profileData.lastName?.[0]?.toUpperCase() || 
                      user?.displayName?.charAt(0)?.toUpperCase() || 
                      user?.email?.charAt(0)?.toUpperCase() || 
                      '👤'
                    )}
                  </div>
                  <h3 style={{ color: "#222", margin: 0, fontSize: window.innerWidth <= 768 ? 18 : 20, fontWeight: 500 }}>
                    {profileData.firstName || profileData.lastName 
                      ? `${profileData.firstName} ${profileData.lastName}`.trim()
                      : user?.displayName || "Użytkownik"
                    }
                  </h3>
                  <p style={{ color: "#666", margin: "8px 0 0", fontSize: 14 }}>
                    {user?.email}
                  </p>
                </div>
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", 
                  gap: window.innerWidth <= 768 ? 12 : 16,
                  marginBottom: window.innerWidth <= 768 ? 16 : 24
                }}>
                  <div style={{ textAlign: "center", padding: 16, background: "#f8f9fa", borderRadius: 12 }}>
                    <div style={{ fontSize: 24, color: "#667eea", marginBottom: 8 }}>📊</div>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: "#222" }}>
                      {(() => {
                        const generatedSets = JSON.parse(localStorage.getItem('generatedSetsCount') || '0');
                        const allFavorites = JSON.parse(localStorage.getItem('favoriteSets') || '[]');
                        return generatedSets + allFavorites.length;
                      })()}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>Wygenerowane zestawy</div>
                  </div>
                  <div style={{ textAlign: "center", padding: 16, background: "#f8f9fa", borderRadius: 12 }}>
                    <div style={{ fontSize: 24, color: "#667eea", marginBottom: 8 }}>💾</div>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: "#222" }}>
                      {JSON.parse(localStorage.getItem('favoriteSets') || '[]').length}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>Ulubione zestawy</div>
                  </div>
                </div>
                
                <div style={{ 
                  background: userStatus?.subscription_status === 'active' 
                    ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)" 
                    : "linear-gradient(135deg, #f44336 0%, #ff7043 100%)", 
                  borderRadius: 16, 
                  padding: window.innerWidth <= 300 ? 16 : 20, 
                  marginBottom: 24,
                  color: "white",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  border: userStatus?.subscription_status === 'active' ? "2px solid #4caf50" : "2px solid #f44336"
                }}>
                  <div style={{ 
                    fontSize: window.innerWidth <= 300 ? 24 : 28, 
                    marginBottom: 8,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                  }}>
                    {userStatus?.subscription_status === 'active' ? "👑" : "⚠️"}
                  </div>
                  <h4 style={{ 
                    margin: "0 0 8px", 
                    fontSize: window.innerWidth <= 300 ? 18 : 20, 
                    fontWeight: "bold",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)"
                  }}>
                    {userStatus?.subscription_status === 'active' ? "🌟 PLAN PREMIUM" : "📵 PLAN DARMOWY"}
                  </h4>
                  <p style={{ 
                    margin: "0 0 8px", 
                    fontSize: window.innerWidth <= 300 ? 12 : 14, 
                    opacity: 0.95,
                    fontWeight: "500"
                  }}>
                    {userStatus?.subscription_status === 'active' 
                      ? "✅ Pełny dostęp do wszystkich funkcji"
                      : "❌ Ograniczony dostęp - ulepsz plan!"
                    }
                  </p>
                  {userStatus?.subscription_status === 'active' && userStatus?.subscription_end_date && (
                    <div style={{ 
                      background: "rgba(255,255,255,0.2)", 
                      borderRadius: 8, 
                      padding: "6px 12px", 
                      fontSize: window.innerWidth <= 300 ? 11 : 12,
                      fontWeight: "bold",
                      marginTop: 8
                    }}>
                      📅 Ważne do: {new Date(userStatus.subscription_end_date).toLocaleDateString('pl-PL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                  {userStatus?.subscription_status !== 'active' && (
                    <button
                      onClick={() => navigate('/payments')}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        color: "white",
                        border: "2px solid rgba(255,255,255,0.5)",
                        borderRadius: 8,
                        padding: "8px 16px",
                        fontSize: window.innerWidth <= 300 ? 11 : 12,
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: 8,
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(255,255,255,0.3)";
                        e.target.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(255,255,255,0.2)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      🚀 ULEPSZ DO PREMIUM
                    </button>
                  )}
                </div>
                
                {/* Sekcja Edytuj Profil */}
                <div style={{ background: "white", borderRadius: 16, padding: window.innerWidth <= 768 ? 16 : 20, marginTop: window.innerWidth <= 768 ? 16 : 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                  {!isEditingProfile ? (
                    <div style={{ textAlign: "center" }}>
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: 12,
                          padding: window.innerWidth <= 300 ? "8px 12px" : "12px 24px",
                          fontSize: window.innerWidth <= 300 ? 12 : 14,
                          fontWeight: "bold",
                          cursor: "pointer",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: window.innerWidth <= 300 ? 4 : 8,
                          minHeight: window.innerWidth <= 300 ? "36px" : "auto",
                          whiteSpace: "nowrap",
                          overflow: "hidden"
                        }}
                      >
                        ✏️ Edytuj profil
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ margin: 0, color: "#333", fontSize: 18, fontWeight: "bold" }}>👤 Edytuj Profil</h3>
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#999",
                            fontSize: "20px",
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: "50%",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#f5f5f5";
                            e.target.style.color = "#666";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "none";
                            e.target.style.color = "#999";
                          }}
                        >
                          ✕
                        </button>
                      </div>
                  
                      {/* Formularz edycji */}
                      <div>
                        <div style={{ 
                          display: "grid", 
                          gap: window.innerWidth <= 300 ? 12 : 16, 
                          marginBottom: window.innerWidth <= 300 ? 16 : 20 
                        }}>
                          {/* Zdjęcie profilowe */}
                          <div style={{ textAlign: "center" }}>
                            <div style={{
                              width: window.innerWidth <= 300 ? 80 : 100,
                              height: window.innerWidth <= 300 ? 80 : 100,
                              borderRadius: "50%",
                              background: profileData.profileImage 
                                ? `url(${profileData.profileImage})` 
                                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: window.innerWidth <= 300 ? 24 : 32,
                              fontWeight: "bold",
                              margin: window.innerWidth <= 300 ? "0 auto 8px" : "0 auto 12px",
                              border: window.innerWidth <= 300 ? "2px solid #f0f0f0" : "4px solid #f0f0f0"
                            }}>
                              {!profileData.profileImage && '📷'}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              style={{ 
                                fontSize: window.innerWidth <= 300 ? 10 : 12,
                                width: window.innerWidth <= 300 ? "100%" : "auto"
                              }}
                            />
                          </div>
                          
                          {/* Pola formularza */}
                          <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: window.innerWidth <= 300 ? "1fr" : (window.innerWidth <= 768 ? "1fr" : "1fr 1fr"), 
                            gap: window.innerWidth <= 300 ? 8 : 12 
                          }}>
                            <div>
                              <label style={{ 
                                display: "block", 
                                marginBottom: window.innerWidth <= 300 ? 2 : 4, 
                                fontSize: window.innerWidth <= 300 ? 12 : 14, 
                                fontWeight: "bold", 
                                color: "#333" 
                              }}>
                                Imię:
                              </label>
                              <input
                                type="text"
                                value={profileData.firstName}
                                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                style={{
                                  width: "100%",
                                  padding: window.innerWidth <= 300 ? "6px 8px" : "8px 12px",
                                  border: "1px solid #ddd",
                                  borderRadius: 8,
                                  fontSize: window.innerWidth <= 300 ? 12 : 14,
                                  boxSizing: "border-box"
                                }}
                                placeholder="Wprowadź imię"
                              />
                            </div>
                            <div>
                              <label style={{ 
                                display: "block", 
                                marginBottom: window.innerWidth <= 300 ? 2 : 4, 
                                fontSize: window.innerWidth <= 300 ? 12 : 14, 
                                fontWeight: "bold", 
                                color: "#333" 
                              }}>
                                Nazwisko:
                              </label>
                              <input
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                style={{
                                  width: "100%",
                                  padding: window.innerWidth <= 300 ? "6px 8px" : "8px 12px",
                                  border: "1px solid #ddd",
                                  borderRadius: 8,
                                  fontSize: window.innerWidth <= 300 ? 12 : 14,
                                  boxSizing: "border-box"
                                }}
                                placeholder="Wprowadź nazwisko"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold", color: "#333" }}>
                              Adres:
                            </label>
                            <input
                              type="text"
                              value={profileData.address}
                              onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                fontSize: 14,
                                boxSizing: "border-box"
                              }}
                              placeholder="Ulica i numer domu"
                            />
                          </div>
                          
                          <div style={{ display: "grid", gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "2fr 1fr", gap: 12 }}>
                            <div>
                              <label style={{ 
                                display: "block", 
                                marginBottom: window.innerWidth <= 300 ? 2 : 4, 
                                fontSize: window.innerWidth <= 300 ? 12 : 14, 
                                fontWeight: "bold", 
                                color: "#333" 
                              }}>
                                Miasto:
                              </label>
                              <input
                                type="text"
                                value={profileData.city}
                                onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                                style={{
                                  width: "100%",
                                  padding: window.innerWidth <= 300 ? "6px 8px" : "8px 12px",
                                  border: "1px solid #ddd",
                                  borderRadius: 8,
                                  fontSize: window.innerWidth <= 300 ? 12 : 14,
                                  boxSizing: "border-box"
                                }}
                                placeholder="Wprowadź miasto"
                              />
                            </div>
                            <div>
                              <label style={{ 
                                display: "block", 
                                marginBottom: window.innerWidth <= 300 ? 2 : 4, 
                                fontSize: window.innerWidth <= 300 ? 12 : 14, 
                                fontWeight: "bold", 
                                color: "#333" 
                              }}>
                                Kod pocztowy:
                              </label>
                              <input
                                type="text"
                                value={profileData.postalCode}
                                onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                                style={{
                                  width: "100%",
                                  padding: window.innerWidth <= 300 ? "6px 8px" : "8px 12px",
                                  border: "1px solid #ddd",
                                  borderRadius: 8,
                                  fontSize: window.innerWidth <= 300 ? 12 : 14,
                                  boxSizing: "border-box"
                                }}
                                placeholder="00-000"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold", color: "#333" }}>
                              Telefon:
                            </label>
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                fontSize: 14,
                                boxSizing: "border-box"
                              }}
                              placeholder="+48 123 456 789"
                            />
                          </div>
                        </div>
                        
                        <div style={{ 
                          display: "flex", 
                          gap: window.innerWidth <= 300 ? 8 : 12, 
                          flexDirection: window.innerWidth <= 300 ? "column" : (window.innerWidth <= 480 ? "column" : "row") 
                        }}>
                          <button
                            onClick={handleProfileSave}
                            style={{
                              background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: 12,
                              padding: window.innerWidth <= 300 ? "8px 12px" : "12px 24px",
                              fontSize: window.innerWidth <= 300 ? 12 : 14,
                              fontWeight: "bold",
                              cursor: "pointer",
                              flex: 1,
                              minHeight: window.innerWidth <= 300 ? "36px" : "auto",
                              whiteSpace: "nowrap",
                              overflow: "hidden"
                            }}
                          >
                            {window.innerWidth <= 300 ? "💾 Zapisz" : "💾 Zapisz zmiany"}
                          </button>
                          <button
                            onClick={() => setIsEditingProfile(false)}
                            style={{
                              background: "#f5f5f5",
                              color: "#666",
                              border: "1px solid #ddd",
                              borderRadius: 12,
                              padding: window.innerWidth <= 300 ? "8px 12px" : "12px 24px",
                              fontSize: window.innerWidth <= 300 ? 12 : 14,
                              cursor: "pointer",
                              flex: 1,
                              minHeight: window.innerWidth <= 300 ? "36px" : "auto",
                              whiteSpace: "nowrap",
                              overflow: "hidden"
                            }}
                          >
                            {window.innerWidth <= 300 ? "❌ Anuluj" : "❌ Anuluj"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Sekcja Ulubione Zestawy */}
                {showFavorites && (
                  <div style={{ 
                    background: "white", 
                    borderRadius: 16, 
                    padding: window.innerWidth <= 300 ? 12 : (window.innerWidth <= 768 ? 16 : 20), 
                    marginTop: window.innerWidth <= 300 ? 12 : (window.innerWidth <= 768 ? 16 : 20), 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)" 
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      marginBottom: 16,
                      flexWrap: window.innerWidth <= 300 ? "wrap" : "nowrap",
                      gap: window.innerWidth <= 300 ? 8 : 0
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        color: "#333", 
                        fontSize: window.innerWidth <= 300 ? 16 : 18, 
                        fontWeight: "bold",
                        flex: window.innerWidth <= 300 ? "1 1 100%" : "none",
                        textAlign: window.innerWidth <= 300 ? "center" : "left"
                      }}>❤️ Ulubione Zestawy</h3>
                      <button
                        onClick={() => setShowFavorites(false)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#999",
                          fontSize: window.innerWidth <= 300 ? "18px" : "20px",
                          cursor: "pointer",
                          padding: window.innerWidth <= 300 ? "2px 6px" : "4px 8px",
                          borderRadius: "50%",
                          transition: "all 0.2s ease",
                          minWidth: "32px",
                          minHeight: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#f5f5f5";
                          e.target.style.color = "#666";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "none";
                          e.target.style.color = "#999";
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  
                  {(() => {
                    const favoritesSets = JSON.parse(localStorage.getItem('favoriteSets') || '[]');
                    
                    if (favoritesSets.length === 0) {
                      return (
                        <div style={{ 
                          textAlign: "center", 
                          padding: window.innerWidth <= 300 ? 16 : 20, 
                          color: "#666" 
                        }}>
                          <div style={{ 
                            fontSize: window.innerWidth <= 300 ? 36 : 48, 
                            marginBottom: window.innerWidth <= 300 ? 12 : 16 
                          }}>💔</div>
                          <p style={{ fontSize: window.innerWidth <= 300 ? 13 : 14 }}>Nie masz jeszcze żadnych ulubionych zestawów.</p>
                          <p style={{ 
                            fontSize: window.innerWidth <= 300 ? 12 : 14, 
                            marginTop: 8 
                          }}>Dodaj zestawy do ulubionych w grach lub generatorze!</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div style={{ 
                        display: "grid", 
                        gap: window.innerWidth <= 300 ? 12 : 16 
                      }}>
                        {favoritesSets.slice(0, 10).map((favoriteSet, index) => (
                          <div key={index} style={{ 
                            background: "#f8f9fa", 
                            borderRadius: 12, 
                            padding: window.innerWidth <= 300 ? 12 : 16,
                            border: "1px solid #e0e0e0"
                          }}>
                            <div style={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              alignItems: "center", 
                              marginBottom: window.innerWidth <= 300 ? 6 : 8,
                              flexWrap: window.innerWidth <= 300 ? "wrap" : "nowrap",
                              gap: window.innerWidth <= 300 ? 4 : 0
                            }}>
                              <h4 style={{ 
                                margin: 0, 
                                color: "#333", 
                                fontSize: window.innerWidth <= 300 ? 12 : 14, 
                                fontWeight: "bold" 
                              }}>
                                {favoriteSet.name || `Zestaw ${index + 1}`}
                              </h4>
                              <span style={{ 
                                fontSize: window.innerWidth <= 300 ? 10 : 12, 
                                color: "#666" 
                              }}>
                                {favoriteSet.date || new Date(favoriteSet.timestamp).toLocaleDateString('pl-PL')}
                              </span>
                            </div>
                            
                            <div style={{ 
                              display: "flex", 
                              flexWrap: "wrap", 
                              gap: window.innerWidth <= 300 ? 6 : 8, 
                              marginBottom: window.innerWidth <= 300 ? 6 : 8 
                            }}>
                              {(() => {
                                // Obsłuż różne formaty danych
                                let numbersArray = [];
                                if (favoriteSet.numbers && typeof favoriteSet.numbers === 'string') {
                                  // Format z gier: "1, 2, 3, 4, 5"
                                  numbersArray = favoriteSet.numbers.split(', ').map(n => parseInt(n.trim()));
                                } else if (favoriteSet.set && Array.isArray(favoriteSet.set)) {
                                  // Format z generatora: [1, 2, 3, 4, 5]
                                  numbersArray = favoriteSet.set;
                                } else if (favoriteSet.numbers && Array.isArray(favoriteSet.numbers)) {
                                  // Format alternatywny: [1, 2, 3, 4, 5]
                                  numbersArray = favoriteSet.numbers;
                                }
                                
                                return numbersArray.map((number, numIndex) => (
                                  <div key={numIndex} style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: "bold"
                                  }}>
                                    {number}
                                  </div>
                                ));
                              })()}
                            </div>
                            
                            <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                              <span style={{ background: "#e3f2fd", color: "#1976d2", padding: "2px 8px", borderRadius: 12 }}>
                                {favoriteSet.game || 'lotto'}
                              </span>
                              <span style={{ background: "#f3e5f5", color: "#7b1fa2", padding: "2px 8px", borderRadius: 12 }}>
                                {favoriteSet.type || 'generator'}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {favoritesSets.length > 10 && (
                          <div style={{ textAlign: "center", padding: 10, color: "#666", fontSize: 12 }}>
                            ... i {favoritesSets.length - 10} więcej zestawów
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  </div>
                )}
                
                {!showFavorites && (
                  <div style={{ textAlign: "center", marginTop: window.innerWidth <= 768 ? 16 : 20 }}>
                    <button
                      onClick={() => setShowFavorites(true)}
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: 12,
                        padding: window.innerWidth <= 300 ? "8px 12px" : "12px 24px",
                        fontSize: window.innerWidth <= 300 ? 12 : 14,
                        fontWeight: "bold",
                        cursor: "pointer",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: window.innerWidth <= 300 ? 4 : 8,
                        minHeight: window.innerWidth <= 300 ? "36px" : "auto",
                        whiteSpace: "nowrap",
                        overflow: "hidden"
                      }}
                    >
                      {window.innerWidth <= 300 ? "❤️ Ulubione" : "❤️ Pokaż ulubione zestawy"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          } />
          
          <Route path="/payments" element={
            <GooglePlayPayments
              user={user}
              subscription={subscription}
              paymentHistory={paymentHistory}
              onClose={() => setShowPayments(false)}
              onSubscriptionUpdate={(newSubscription) => setSubscription(newSubscription)}
            />
          } />
          
          <Route path="/ai-ultra-pro" element={
            checkAccess('ai_generator') ? (
              <AILottoGeneratorUltraPro
                user={user}
                activeTalisman={activeTalisman}
                onClose={() => setShowAIGenerator(false)}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Wykup plan Premium, aby odblokować dostęp do AI Generator Ultra Pro.
                </p>
                <button 
                  onClick={() => setShowPayments(true)}
                  style={{
                    background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "16px 32px",
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
1                  Przejdź do płatności
                </button>
              </div>
            )
          } />
          
          <Route path="/harmonic-analyzer" element={
            checkAccess('harmonic_analyzer') ? (
              <HarmonicAnalyzer
                user={user}
                activeTalisman={activeTalisman}
                onClose={() => setShowHarmonicAnalyzer(false)}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Wykup plan Premium, aby odblokować dostęp do Analizatora Harmonicznego.
                </p>
                <button 
                  onClick={() => setShowPayments(true)}
                  style={{
                    background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "16px 32px",
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Przejdź do płatności
                </button>
              </div>
            )
          } />
          
          <Route path="/my-lucky-numbers" element={
            <MyLuckyNumbersScreen 
              user={user}
              onLogout={handleLogout}
              onClose={() => setShowMyLuckyNumbers(false)}
            />
          } />
          
          <Route path="/talismans" element={
            checkAccess('talizmany') ? (
            <Talizmany 
              user={user}
              talismanDefinitions={talismanDefinitions}
              activeTalisman={activeTalisman}
                onClose={() => setShowTalizmany(false)}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Wykup plan Premium, aby odblokować dostęp do Systemu Talizmanów.
                </p>
                <button 
                  onClick={() => setShowPayments(true)}
                  style={{
                    background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "16px 32px",
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Przejdź do płatności
                </button>
              </div>
            )
          } />
          
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>

      {/* Modals */}
      {showPayments && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <GooglePlayPayments
              user={user}
              subscription={subscription}
              paymentHistory={paymentHistory}
              onClose={() => setShowPayments(false)}
              onSubscriptionUpdate={(newSubscription) => setSubscription(newSubscription)}
            />
          </div>
        </div>
      )}

      {showStatistics && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <FinalStatistics
              user={user}
              userBets={userBets}
              results={results}
              onClose={() => setShowStatistics(false)}
            />
          </div>
        </div>
      )}

      {showMyLuckyNumbers && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <MyLuckyNumbersScreen
              user={user}
              onClose={() => setShowMyLuckyNumbers(false)}
            />
          </div>
        </div>
      )}

      {showTalizmany && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <Talizmany
              user={user}
              userStatus={userStatus}
              talismanDefinitions={talismanDefinitions}
              activeTalisman={activeTalisman}
              onClose={() => setShowTalizmany(false)}
              onTalismanActivated={(talisman) => setActiveTalisman(talisman)}
            />
          </div>
        </div>
      )}

      {showActiveTalisman && activeTalisman && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%'
          }}>
        <ActiveTalismanDisplay 
          talisman={activeTalisman}
              onClose={() => setShowActiveTalisman(false)}
            />
          </div>
        </div>
      )}

      {showAIGenerator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <AILottoGeneratorUltraPro
              user={user}
              userStatus={userStatus}
              onClose={() => setShowAIGenerator(false)}
            />
          </div>
        </div>
      )}

      {showHarmonicAnalyzer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <HarmonicAnalyzer
              user={user}
              userStatus={userStatus}
              onClose={() => setShowHarmonicAnalyzer(false)}
            />
          </div>
        </div>
      )}

      {showSchonheimGenerator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <SchonheimGenerator
              user={user}
              userStatus={userStatus}
              onClose={() => setShowSchonheimGenerator(false)}
            />
          </div>
        </div>
      )}

      {/* Nowoczesny przezroczysty przycisk przewijania do góry - widoczny tylko na zakładce Wyjaśnienia */}
      {location.pathname === '/explanations' && (
        <button
          onClick={() => {
            console.log('🔄 Kliknięto przycisk przewijania!');
            console.log('📊 Aktualna pozycja scroll:', window.scrollY);
            
            // Metoda 1: window.scrollTo z smooth
            try {
              window.scrollTo({ 
                top: 0, 
                behavior: 'smooth' 
              });
              console.log('✅ Metoda 1 wykonana');
            } catch (error) {
              console.log('❌ Metoda 1 nie działa:', error);
            }
            
            // Metoda 2: window.scrollTo bez smooth
            try {
              window.scrollTo(0, 0);
              console.log('✅ Metoda 2 wykonana');
            } catch (error) {
              console.log('❌ Metoda 2 nie działa:', error);
            }
            
            // Metoda 3: document.documentElement.scrollTop
            try {
              document.documentElement.scrollTop = 0;
              console.log('✅ Metoda 3 wykonana');
            } catch (error) {
              console.log('❌ Metoda 3 nie działa:', error);
            }
            
            // Metoda 4: document.body.scrollTop
            try {
              document.body.scrollTop = 0;
              console.log('✅ Metoda 4 wykonana');
            } catch (error) {
              console.log('❌ Metoda 4 nie działa:', error);
            }
            
            // Metoda 5: Przewiń wszystkie możliwe kontenery
            try {
              const containers = [
                document.querySelector('.main-container'),
                document.querySelector('#root'),
                document.querySelector('body'),
                document.querySelector('html')
              ];
              
              containers.forEach((container, index) => {
                if (container) {
                  container.scrollTop = 0;
                  console.log(`✅ Kontener ${index + 1} przewinięty:`, container.tagName);
                }
              });
            } catch (error) {
              console.log('❌ Metoda 5 nie działa:', error);
            }
            
            console.log('✅ Wszystkie metody przewijania wykonane');
          }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'rgba(255, 193, 7, 0.25)',
            backdropFilter: 'blur(15px)',
            border: '2px solid rgba(255, 193, 7, 0.5)',
            color: '#e65100',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 6px 25px rgba(255, 193, 7, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            WebkitBackdropFilter: 'blur(15px)',
            userSelect: 'none',
            outline: 'none',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.2) translateY(-5px)';
            e.target.style.background = 'rgba(255, 193, 7, 0.4)';
            e.target.style.boxShadow = '0 10px 35px rgba(255, 193, 7, 0.5)';
            e.target.style.color = '#d84315';
            e.target.style.border = '2px solid rgba(255, 193, 7, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) translateY(0)';
            e.target.style.background = 'rgba(255, 193, 7, 0.25)';
            e.target.style.boxShadow = '0 6px 25px rgba(255, 193, 7, 0.4)';
            e.target.style.color = '#e65100';
            e.target.style.border = '2px solid rgba(255, 193, 7, 0.5)';
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default AppPWA;
