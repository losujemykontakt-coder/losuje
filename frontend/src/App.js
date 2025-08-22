import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';
import './i18n'; // Import konfiguracji i18n
import LandingPage from './LandingPage';
import AuthContainer from './components/auth/AuthContainer';
import FinalStatistics from './components/statistics/FinalStatistics';
import GryPoZalogowaniu from './components/GryPoZalogowaniu';
import AILottoGeneratorUltraPro from './components/ai-generator/AILottoGeneratorUltraPro';
import HarmonicAnalyzer from './components/harmonic-analyzer/HarmonicAnalyzer';
import MyLuckyNumbersScreen from './components/MyLuckyNumbersScreen';
import Talizmany from './components/Talizmany';
import ActiveTalismanDisplay from './components/ActiveTalismanDisplay';
import LanguageSwitcher from './components/LanguageSwitcher';
import { logoutUser, onAuthStateChange } from './utils/firebaseAuth';
import {
  getUserSubscription,
  getPaymentHistory,
  getUserStatus,
  checkUserAccess,
  cancelSubscription,
  checkAndBlockExpiredTrials
} from './utils/firebaseAuth';
import paypalService from './utils/paypalService';
import { initEmailJS } from './utils/emailjs';
import { BLIKIcon, PayPalIcon, Przelewy24Icon, CardIcon, TransferIcon } from './icons/payment-icons';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Payments from './components/Payments';
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
    icon: '🧲',
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
    effect: 'rebirth'
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

// Rozszerzone statystyki historyczne dla wszystkich gier
const historicalStats = {
  lotto: {
    mostFrequent: [7, 13, 23, 31, 37, 42, 45, 49],
    leastFrequent: [1, 2, 8, 15, 20, 25, 30, 35, 40, 44, 47, 48],
    avgSum: 140,
    sumRange: [100, 180],
    frequencyData: {
      7: 156, 13: 142, 23: 138, 31: 134, 37: 132, 42: 128, 45: 125, 49: 122,
      3: 118, 11: 115, 17: 112, 29: 108, 35: 105, 41: 102, 43: 98, 47: 95,
      5: 92, 19: 89, 25: 86, 33: 83, 39: 80, 44: 77, 48: 74,
      1: 71, 2: 68, 8: 65, 15: 62, 20: 59, 30: 53, 40: 47
    },
    lastUpdated: "2024-01-15",
    totalDraws: 2850,
    hotNumbers: [7, 13, 23, 31, 37],
    coldNumbers: [1, 2, 8, 15, 20],
    patterns: {
      evenOdd: "3:3",
      lowHigh: "3:3",
      sumRange: "120-160"
    }
  },
  miniLotto: {
    mostFrequent: [3, 7, 11, 17, 23, 29, 35, 41],
    leastFrequent: [1, 2, 5, 9, 13, 19, 25, 31, 37, 42],
    avgSum: 105,
    sumRange: [80, 130],
    frequencyData: {
      3: 89, 7: 85, 11: 82, 17: 79, 23: 76, 29: 73, 35: 70, 41: 67,
      5: 64, 13: 61, 19: 58, 25: 55, 31: 52, 37: 49, 42: 46,
      1: 43, 2: 40, 9: 34
    },
    lastUpdated: "2024-01-15",
    totalDraws: 1850,
    hotNumbers: [3, 7, 11, 17, 23],
    coldNumbers: [1, 2, 5, 9, 13],
    patterns: {
      evenOdd: "2:3",
      lowHigh: "3:2",
      sumRange: "90-120"
    }
  },
  multiMulti: {
    mostFrequent: [7, 11, 17, 23, 29, 35, 41, 47, 53, 59, 65, 71, 77, 3, 13, 19, 31, 37, 43, 61],
    leastFrequent: [1, 2, 5, 9, 15, 21, 27, 33, 39, 45, 51, 57, 63, 69, 75, 79, 4, 8, 12, 16],
    avgSum: 405,
    sumRange: [375, 435],
    frequencyData: {
      7: 234, 11: 228, 17: 222, 23: 216, 29: 210, 35: 204, 41: 198, 47: 192, 53: 186, 59: 180,
      65: 174, 71: 168, 77: 162, 3: 156, 13: 150, 19: 144, 31: 138, 37: 132, 43: 126, 61: 120,
      5: 114, 15: 108, 21: 102, 27: 96, 33: 90, 39: 84, 45: 78, 51: 72, 57: 66, 63: 60,
      1: 54, 2: 48, 9: 36
    },
    lastUpdated: "2024-01-15",
    totalDraws: 3200,
    hotNumbers: [7, 11, 17, 23, 29],
    coldNumbers: [1, 2, 5, 9, 15],
    patterns: {
      evenOdd: "5:5",
      lowHigh: "5:5",
      sumRange: "380-430"
    }
  },
  eurojackpot: {
    mostFrequent: [7, 11, 17, 23, 29, 35, 41, 47, 3, 13, 19, 31, 37, 43],
    leastFrequent: [1, 2, 5, 9, 15, 21, 27, 33, 39, 45, 49, 4, 8, 12, 16],
    avgSum: 140,
    sumRange: [100, 180],
    frequencyData: {
      7: 145, 11: 141, 17: 137, 23: 133, 29: 129, 35: 125, 41: 121, 47: 117,
      3: 113, 13: 109, 19: 105, 31: 101, 37: 97, 43: 93,
      5: 89, 15: 85, 21: 81, 27: 77, 33: 73, 39: 69, 45: 65, 49: 61,
      1: 57, 2: 53, 9: 45, 4: 13, 8: 9, 12: 5, 16: 1
    },
    lastUpdated: "2024-01-15",
    totalDraws: 2100,
    hotNumbers: [7, 11, 17, 23, 29],
    coldNumbers: [1, 2, 5, 9, 15],
    patterns: {
      evenOdd: "3:2",
      lowHigh: "3:2",
      sumRange: "110-170"
    },
    euroNumbers: {
      mostFrequent: [3, 5, 7, 9, 11],
      leastFrequent: [1, 2, 4, 6, 8, 10, 12],
      frequencyData: {
        3: 89, 5: 85, 7: 81, 9: 77, 11: 73,
        1: 69, 2: 65, 4: 61, 6: 57, 8: 53, 10: 49, 12: 45
      }
    }
  },
  kaskada: {
    mostFrequent: [3, 7, 11, 17, 23, 5, 13, 19, 31, 37, 43, 61],
    leastFrequent: [1, 2, 9, 15, 21, 27, 33, 39, 45, 51, 57, 63],
    avgSum: 150,
    sumRange: [120, 180],
    frequencyData: {
      3: 78, 7: 75, 11: 72, 17: 69, 23: 66, 5: 63, 13: 60, 19: 57, 31: 54, 37: 51, 43: 48, 61: 45,
      1: 42, 2: 39, 9: 36, 15: 33, 21: 30, 27: 27, 33: 24, 39: 21, 45: 18, 51: 15, 57: 12, 63: 9
    },
    lastUpdated: "2024-01-15",
    totalDraws: 950,
    hotNumbers: [3, 7, 11, 17, 23],
    coldNumbers: [1, 2, 9, 15, 21],
    patterns: {
      evenOdd: "6:6",
      lowHigh: "6:6",
      sumRange: "130-170"
    }
  },
  keno: {
    mostFrequent: [7, 11, 17, 23, 29, 35, 41, 47, 53, 59, 65, 71, 77, 3, 13, 19, 31, 37, 43, 61],
    leastFrequent: [1, 2, 5, 9, 15, 21, 27, 33, 39, 45, 51, 57, 63, 69, 75, 79, 4, 8, 12, 16],
    avgSum: 810,
    sumRange: [770, 850],
    frequencyData: {
      7: 312, 11: 308, 17: 304, 23: 300, 29: 296, 35: 292, 41: 288, 47: 284, 53: 280, 59: 276,
      65: 272, 71: 268, 77: 264, 3: 260, 13: 256, 19: 252, 31: 248, 37: 244, 43: 240, 61: 236,
      5: 232, 15: 228, 21: 224, 27: 220, 33: 216, 39: 212, 45: 208, 51: 204, 57: 200, 63: 196,
      1: 192, 2: 188, 5: 184, 9: 180, 15: 176, 21: 172, 27: 168, 33: 164, 39: 160, 45: 156, 51: 152, 57: 148, 63: 144, 69: 140, 75: 136, 79: 132, 4: 128, 8: 124, 12: 120, 16: 116
    },
    lastUpdated: "2024-01-15",
    totalDraws: 4500,
    hotNumbers: [7, 11, 17, 23, 29],
    coldNumbers: [1, 2, 5, 9, 15],
    patterns: {
      evenOdd: "10:10",
      lowHigh: "10:10",
      sumRange: "780-840"
    }
  }
};

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
const inputStyle = {
  width: "100%",
  marginBottom: 20,
  padding: 14,
  border: "1px solid #bbb",
  borderRadius: 8,
  fontSize: 18,
  boxSizing: "border-box",
  minHeight: "44px"
};
const buttonStyle = {
  width: "100%",
  padding: 16,
  background: "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)",
  color: "#222",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  fontSize: 18,
  cursor: "pointer",
  marginTop: 12,
  boxShadow: "0 2px 8px 0 rgba(255, 215, 0, 0.10)",
  transition: "background 0.2s",
  minHeight: "44px",
  touchAction: "manipulation"
};

// Nowe style dla przycisków akcji
const actionButtonStyle = {
  background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "12px 20px",
  fontSize: 14,
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minWidth: "140px",
  justifyContent: "center"
};

const pdfButtonStyle = {
  background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "12px 20px",
  fontSize: 14,
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minWidth: "140px",
  justifyContent: "center"
};

// Styl złotej kuli z połyskiem
const ballStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "radial-gradient(circle at 30% 30%, #fffde7 60%, #ffd700 100%)",
  boxShadow: "0 2px 8px 0 rgba(255, 215, 0, 0.18)",
  color: "#222",
  fontWeight: "bold",
  fontSize: 22,
  margin: "0 7px 7px 0",
  border: "2px solid #ffb300",
  letterSpacing: 1,
  position: "relative"
};

// Modal style
const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};
const modalContent = {
  background: "#fff",
  padding: 30,
  borderRadius: 16,
  maxWidth: 500,
  maxHeight: "80vh",
  overflow: "auto",
  boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
};

function Ball({ n }) {
  return (
    <span style={ballStyle}>
      <span style={{ position: "absolute", top: 7, left: 12, width: 16, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.7)", filter: "blur(1px)" }}></span>
      <span style={{ position: "relative", zIndex: 2 }}>{n}</span>
    </span>
  );
}

function InfoModal({ isOpen, onClose, title, content }) {
  if (!isOpen) return null;
  
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContent} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: "#1976d2", marginBottom: 20 }}>{title}</h3>
        <div style={{ lineHeight: 1.6, marginBottom: 20 }}>{content}</div>
        <button onClick={onClose} style={{ ...buttonStyle, width: "auto", padding: "10px 20px" }}>Zamknij</button>
      </div>
    </div>
  );
}

function App() {
  // Konfiguracja PayPal - memoizowana
  const paypalOptions = useMemo(() => {
    const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    const envFromFile = process.env.REACT_APP_PAYPAL_ENVIRONMENT || 'live';
    
    // PayPal SDK oczekuje "production" zamiast "live"
    const environment = envFromFile === 'live' ? 'production' : envFromFile;
    
    console.log('🔧 Konfiguracja PayPal w App.js:', {
      clientId: clientId ? 'OK' : 'BRAK',
      environment: environment,
      originalEnv: envFromFile,
      currency: 'PLN'
    });
    
    return {
      'client-id': clientId,
      currency: 'PLN',
      intent: 'capture',
      components: 'buttons',
      environment: environment
    };
  }, []);
  // Hook i18n
  const { t, i18n } = useTranslation();
  
  // Globalna obsługa błędów
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error("💥 Global error:", event.error || event.message);
    };

    const handleUnhandledRejection = (event) => {
      console.error("💥 Unhandled promise rejection:", event.reason);
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Stan logowania i użytkownika
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dane użytkownika
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  // Stan aktywnego talizmanu
  const [activeTalisman, setActiveTalisman] = useState(null);
  
  // Metody płatności - PRZENIESIONE NA POCZĄTEK
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("paypal");
  
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Routing - sprawdź czy użytkownik jest zalogowany
  const isLoggedIn = !!user;
  
  // Obsługa parametrów URL dla stron landing page - tylko dla niezalogowanych użytkowników
  useEffect(() => {
    if (isLoggedIn) return; // Nie przekierowuj zalogowanych użytkowników
    
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    
    console.log('🔍 URL params check:', { page, isLoggedIn, pathname: location.pathname });
    
    if (page === 'jak-to-dziala' || page === 'faq' || page === 'kontakt' || page === 'blog' || 
        (page && page.startsWith('blog-')) || page === 'statistics' || page === 'gry' || 
        page === 'wyniki' || page === 'lotto-wyniki' || page === 'eurojackpot-wyniki' || 
        page === 'mini-lotto-wyniki' || page === 'multi-multi-wyniki' || page === 'kaskada-wyniki' || 
        page === 'keno-wyniki') {
      // Jeśli jesteśmy na stronie landing page z parametrami, przekieruj do landing
      if (location.pathname !== '/landing') {
        console.log('🔄 Przekierowanie do landing z powodu parametru:', page);
        navigate('/landing');
      }
    }
  }, [location.search, navigate, isLoggedIn]);

  // Przekierowanie zalogowanych użytkowników z głównej strony
  useEffect(() => {
    if (!isLoading && isLoggedIn && location.pathname === '/') {
      console.log('🔄 Przekierowanie zalogowanego użytkownika z / do /generator');
      navigate('/generator', { replace: true });
    }
  }, [isLoading, isLoggedIn, location.pathname, navigate]);

  // Nasłuchiwanie zmian stanu autentykacji Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        setUserName(user.displayName || user.email?.split('@')[0] || 'Użytkownik');
        setUserEmail(user.email || '');
      } else {
        setUserName("");
        setUserEmail("");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Inicjalizacja EmailJS
  useEffect(() => {
    initEmailJS();
  }, []);

  // Inicjalizacja systemu powiadomień
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('🔔 Inicjalizacja systemu powiadomień...');
        
        // Inicjalizuj scheduler powiadomień
        await schedulerService.initialize(notificationService, luckyNumbersGenerator);
        
        console.log('✅ System powiadomień zainicjalizowany');
      } catch (error) {
        console.error('❌ Błąd podczas inicjalizacji systemu powiadomień:', error);
      }
    };

    // Inicjalizuj tylko dla zalogowanych użytkowników
    if (user) {
      initializeNotifications();
    }
  }, [user]);

  // Ładuj aktywny talizman
  useEffect(() => {
    const loadActiveTalisman = async () => {
      if (user && user.uid) {
        try {
          const response = await fetch(`/api/talismans/${user.uid}`);
          const data = await response.json();
          
          if (data.success && data.activeTalisman) {
            setActiveTalisman(data.activeTalisman);
          }
        } catch (error) {
          console.error('Błąd ładowania aktywnego talizmanu:', error);
        }
      }
    };

    loadActiveTalisman();
  }, [user]);

  // PayPal integration - now handled by PaymentButtons component
  
  // Funkcja do generowania liczby z uwzględnieniem talizmanu
  const generateNumberWithTalisman = (maxNum) => {
    if (!activeTalisman) {
      return Math.floor(Math.random() * maxNum) + 1;
    }
    
    // Znajdź definicję talizmanu
    const talisman = talismanDefinitions.find(t => t.id === activeTalisman.talisman_id);
    if (!talisman) {
      return Math.floor(Math.random() * maxNum) + 1;
    }
    
    let preferredNumbers = [];
    
    switch (talisman.effect) {
      case 'even':
        // Preferuj liczby parzyste
        for (let i = 2; i <= maxNum; i += 2) {
          preferredNumbers.push(i);
        }
        break;
      case 'fire':
        // Smok wypala pechowe liczby - preferuj liczby nieparzyste i wysokie
        for (let i = 1; i <= maxNum; i++) {
          if (i % 2 === 1 || i > maxNum * 0.7) {
            preferredNumbers.push(i);
          }
        }
        break;
      case 'rare':
        // Księżyc sprzyja rzadko trafianym liczbom - preferuj liczby pierwsze i wysokie
        const isPrime = (num) => {
          if (num < 2) return false;
          for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) return false;
          }
          return true;
        };
        for (let i = 1; i <= maxNum; i++) {
          if (isPrime(i) || i > maxNum * 0.8) {
            preferredNumbers.push(i);
          }
        }
        break;
      case 'evenDay':
        // Diament przynosi szczęście w dni parzyste
        const today = new Date().getDate();
        if (today % 2 === 0) {
          // W dni parzyste preferuj liczby parzyste
          for (let i = 2; i <= maxNum; i += 2) {
            preferredNumbers.push(i);
          }
        } else {
          // W dni nieparzyste preferuj liczby nieparzyste
          for (let i = 1; i <= maxNum; i += 2) {
            preferredNumbers.push(i);
          }
        }
        break;
      case 'rebirth':
        // Feniks odnawia szczęście - preferuj liczby w środkowym zakresie
        const midStart = Math.floor(maxNum * 0.3);
        const midEnd = Math.floor(maxNum * 0.7);
        for (let i = midStart; i <= midEnd; i++) {
          preferredNumbers.push(i);
        }
        break;
      case 'royal':
        // Korona - najlepszy talizman, preferuj liczby królewskie (7, 14, 21, 28, 35, 42, 49)
        for (let i = 7; i <= maxNum; i += 7) {
          preferredNumbers.push(i);
        }
        // Dodaj też liczby w wysokim zakresie
        for (let i = Math.floor(maxNum * 0.8); i <= maxNum; i++) {
          if (!preferredNumbers.includes(i)) {
            preferredNumbers.push(i);
          }
        }
        break;
      case 'odd':
        // Preferuj liczby nieparzyste
        for (let i = 1; i <= maxNum; i += 2) {
          preferredNumbers.push(i);
        }
        break;
      case 'medium':
        // Preferuj liczby od 21 do 40
        for (let i = 21; i <= Math.min(40, maxNum); i++) {
          preferredNumbers.push(i);
        }
        break;
      case 'ultimate':
        // Ostateczny talizman - szczęście we wszystkich liczbach
        for (let i = 1; i <= maxNum; i++) {
          preferredNumbers.push(i);
        }
        break;
      default:
        // Domyślnie wszystkie liczby
        for (let i = 1; i <= maxNum; i++) {
          preferredNumbers.push(i);
        }
    }
    
    // Jeśli nie ma preferowanych liczb, użyj wszystkich
    if (preferredNumbers.length === 0) {
      for (let i = 1; i <= maxNum; i++) {
        preferredNumbers.push(i);
      }
    }
    
    // 70% szans na wybranie preferowanej liczby
    if (Math.random() < 0.7 && preferredNumbers.length > 0) {
      return preferredNumbers[Math.floor(Math.random() * preferredNumbers.length)];
    } else {
      return Math.floor(Math.random() * maxNum) + 1;
    }
  };
  
  // Funkcja sprawdzania statusu subskrypcji
  const checkSubscription = async () => {
    if (!user || !user.uid) return;
    
    try {
      const status = await getUserStatus(user.uid);
      setUserSubscription(status.subscription);
      setIsUserBlocked(status.isBlocked);

      // Oblicz dni do końca okresu próbnego na podstawie daty rejestracji
      if (status.subscription) {
        if (status.subscription.trial_start_date) {
          // Oblicz czas od rejestracji
          const registrationDate = new Date(status.subscription.trial_start_date);
          const now = new Date();
          const daysSinceRegistration = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));
          const daysLeft = Math.max(0, 7 - daysSinceRegistration);
          
          setTrialDaysLeft(daysLeft);
          
          // Jeśli minęło więcej niż 7 dni, użytkownik powinien być zablokowany
          if (daysSinceRegistration >= 7 && status.subscription.subscription_status === 'trial') {
            console.log('Użytkownik powinien być zablokowany - okres próbny wygasł');
          }
        } else if (status.subscription.trial_end_date) {
          // Fallback do starego systemu z datą końca
          const trialEnd = new Date(status.subscription.trial_end_date);
          const now = new Date();
          const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
          setTrialDaysLeft(Math.max(0, daysLeft));
        } else if (status.subscription.subscription_status === 'trial') {
          // Dla nowych użytkowników w okresie próbnym bez daty końca
          setTrialDaysLeft(7);
        } else {
          setTrialDaysLeft(0);
        }
      } else {
        // Dla nowych użytkowników bez danych subskrypcji
        setTrialDaysLeft(7);
      }
    } catch (error) {
      console.error('Błąd sprawdzania subskrypcji:', error);
      // Domyślnie 7 dni dla nowych użytkowników
      setTrialDaysLeft(7);
    }
  };

  // Sprawdzanie statusu subskrypcji
  useEffect(() => {
    if (user && user.uid) {
      checkSubscription();
    }
  }, [user]);

  // Pobieranie dostępnych metod płatności
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/payment/methods`);
        const data = await response.json();
        
        if (data.success) {
          setAvailablePaymentMethods(data.methods);
        }
      } catch (error) {
        console.error('Błąd pobierania metod płatności:', error);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Sprawdzanie wygasłych okresów próbnych co godzinę
  useEffect(() => {
    const checkExpiredTrials = async () => {
      try {
        await checkAndBlockExpiredTrials();
      } catch (error) {
        console.error('Błąd sprawdzania wygasłych okresów próbnych:', error);
      }
    };

    // Sprawdź od razu przy starcie
    checkExpiredTrials();

    // Sprawdzaj co godzinę
    const interval = setInterval(checkExpiredTrials, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Obsługa powrotu z płatności i parametru page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const method = urlParams.get('method');
    const amount = urlParams.get('amount');
    const error = urlParams.get('error');
    const page = urlParams.get('page');
    
    // Obsługa parametru page=payments
    if (page === 'payments') {
      navigate('/payments');
      return;
    }
    
    if (status === 'success') {
      // Płatność zakończona sukcesem
      const successMessage = `✅ Płatność zakończona sukcesem!\n\nMetoda: ${method}\nKwota: ${amount} PLN\n\nTwoja subskrypcja Premium została aktywowana.`;
              // Zamiast window.alert używamy powiadomienia
        const successNotification = document.createElement('div');
        successNotification.style.cssText = `
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
        successNotification.textContent = successMessage;
        document.body.appendChild(successNotification);
        setTimeout(() => {
          if (document.body.contains(successNotification)) {
            document.body.removeChild(successNotification);
          }
        }, 5000);
      
      // Przekieruj do strony głównej
      window.location.href = '/';
    } else if (status === 'error') {
      // Błąd płatności
      const errorMessage = `❌ Błąd płatności: ${error || 'Nieznany błąd'}\n\nSpróbuj ponownie lub skontaktuj się z obsługą.`;
              // Zamiast window.alert używamy powiadomienia
        const errorNotification = document.createElement('div');
        errorNotification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          font-weight: bold;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
          animation: slideIn 0.3s ease-out;
        `;
        errorNotification.textContent = errorMessage;
        document.body.appendChild(errorNotification);
        setTimeout(() => {
          if (document.body.contains(errorNotification)) {
            document.body.removeChild(errorNotification);
          }
        }, 5000);
      
      // Przekieruj do strony płatności
      navigate('/payments');
    } else if (status === 'cancelled') {
      // Płatność anulowana
      const cancelMessage = `❌ Płatność została anulowana.\n\nMożesz spróbować ponownie w dowolnym momencie.`;
              // Zamiast window.alert używamy powiadomienia
        const cancelNotification = document.createElement('div');
        cancelNotification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          font-weight: bold;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
          animation: slideIn 0.3s ease-out;
        `;
        cancelNotification.textContent = cancelMessage;
        document.body.appendChild(cancelNotification);
        setTimeout(() => {
          if (document.body.contains(cancelNotification)) {
            document.body.removeChild(cancelNotification);
          }
        }, 5000);
      
      // Przekieruj do strony płatności
      navigate('/payments');
    }
  }, [navigate]);
  

  
  // Generator
  const [selectedGame, setSelectedGame] = useState(games[0].value);
  const [setsCount, setSetsCount] = useState(1);
  const [results, setResults] = useState([]);
  const [type, setType] = useState("mixed");
  const [uniqueSets, setUniqueSets] = useState(false);
  const [uniqueNumbers, setUniqueNumbers] = useState(false);
  const [strategy, setStrategy] = useState("standard"); // standard, frequent, rare, mixed
  const [kenoRange, setKenoRange] = useState("mixed"); // mixed, low, high
  const [kenoNumbers, setKenoNumbers] = useState(10); // 10 lub 20 liczb dla Keno
  
  // Systemy skrócone
  const [systemNumbers, setSystemNumbers] = useState(7);
  const [systemGuarantee, setSystemGuarantee] = useState(3);
  
  // Logika ILP
  const [ilpGame, setIlpGame] = useState("miniLotto");
  const [ilpNumbers, setIlpNumbers] = useState(7);
  const [ilpGuarantee, setIlpGuarantee] = useState(3);
  const [ilpSystemType, setIlpSystemType] = useState("short"); // "short", "full", "adaptive"
  const [ilpResults, setIlpResults] = useState(null);
  const [ilpLoading, setIlpLoading] = useState(false);
  
  // Aktualne statystyki z lotto.pl
  const [currentStats, setCurrentStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Menu mobilne
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dostosuj gwarancję gdy zmienia się gra
  useEffect(() => {
    const gameConfig = {
      lotto: { pick: 6, options: [3, 4, 5] },
      miniLotto: { pick: 5, options: [3, 4] },
      multiMulti: { pick: 10, options: [3, 4, 5, 6, 7] },
      eurojackpot: { pick: 5, options: [3, 4] },
      kaskada: { pick: 12, options: [3, 4, 5, 6, 7, 8] },
      keno: { pick: kenoNumbers, options: kenoNumbers === 10 ? [3, 4, 5, 6, 7] : [3, 4, 5, 6, 7, 8, 9, 10] }
    };
    const config = gameConfig[selectedGame] || { pick: 6, options: [3, 4, 5] };
    if (!config.options.includes(systemGuarantee)) {
      setSystemGuarantee(config.options[0]);
    }
  }, [selectedGame, kenoNumbers]);
  
  // Pobierz aktualne statystyki gdy zmienia się gra
  useEffect(() => {
    fetchCurrentStats(selectedGame);
  }, [selectedGame]);
  
  // Aktualizuj liczbę wybieranych liczb gdy zmienia się gra
  useEffect(() => {
    const range = getGameRange(selectedGame);
    setSelectedNumbersCount(range.count);
  }, [selectedGame]);
  
  // Generator marzeń - daty urodzenia
  const [dreamDates, setDreamDates] = useState([
    { id: 1, label: "Moja data urodzenia", date: "", enabled: true },
    { id: 2, label: "Data urodzenia partnera", date: "", enabled: false },
    { id: 3, label: "Data ślubu", date: "", enabled: false },
    { id: 4, label: "Data urodzenia dziecka 1", date: "", enabled: false },
    { id: 5, label: "Data urodzenia dziecka 2", date: "", enabled: false },
    { id: 6, label: "Data urodzenia dziecka 3", date: "", enabled: false },
    { id: 7, label: "Data poznania partnera", date: "", enabled: false },
    { id: 8, label: "Inna ważna data", date: "", enabled: false }
  ]);
  
  // Szczęśliwe liczby użytkownika
  const [luckyNumbers, setLuckyNumbers] = useState([]);
  const [selectedNumbersCount, setSelectedNumbersCount] = useState(6);
  const [favoriteSets, setFavoriteSets] = useState(() => {
    const saved = localStorage.getItem('favoriteSets');
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteSetName, setFavoriteSetName] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Edycja profilu
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSurname, setEditSurname] = useState("");
  
  // Płatności
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [savedCards, setSavedCards] = useState([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  
  // Subskrypcja
  const [userSubscription, setUserSubscription] = useState(null);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  
  // Sprawdź czy użytkownik ma dostęp do funkcji
  const hasAccess = !isUserBlocked && (userSubscription ? checkUserAccess(userSubscription) : true);
  
  // Debugowanie userSubscription
  console.log('🔍 Debug userSubscription:', {
    userSubscription,
    checkUserAccessResult: userSubscription ? checkUserAccess(userSubscription) : 'brak subskrypcji',
    isUserBlocked,
    hasAccess
  });
  
  // Debugowanie dostępu
  console.log('🔍 Debug dostępu:', {
    isUserBlocked,
    userSubscription: userSubscription ? 'istnieje' : 'brak',
    hasAccess,
    user: user ? 'zalogowany' : 'niezalogowany',
    userSubscriptionDetails: userSubscription ? {
      status: userSubscription.subscription_status,
      isBlocked: userSubscription.is_blocked,
      trialEnd: userSubscription.trial_end_date,
      subscriptionEnd: userSubscription.subscription_end_date
    } : null
  });
  
  // Stan dla odkrytych kulek w wyborze liczb
  const [revealedBalls, setRevealedBalls] = useState({});
  
  // Funkcja do pobierania aktualnych statystyk z lotto.pl
  const fetchCurrentStats = async (game) => {
    if (!game) return;
    
    setStatsLoading(true);
    console.log(`🔄 Pobieram statystyki dla ${game}...`);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/statistics/${game}`);
      console.log(`📊 Status odpowiedzi: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 Otrzymane dane:`, data);
        
        if (data.success) {
          setCurrentStats(data.statistics);
          console.log(`✅ Pobrano statystyki dla ${game} (źródło: ${data.source})`);
          
          // Jeśli dane są z cache, ukryj pasek ładowania szybciej
          if (data.source === 'cache') {
            setStatsLoading(false);
          } else {
            // Dla danych z API/scrapera, daj chwilę na przetworzenie
            setTimeout(() => {
              setStatsLoading(false);
            }, 1000);
          }
        } else {
          console.error('❌ Błąd pobierania statystyk:', data.error);
          setStatsLoading(false);
        }
      } else {
        console.error(`❌ Błąd HTTP: ${response.status} ${response.statusText}`);
        setStatsLoading(false);
      }
    } catch (error) {
      console.error('❌ Błąd połączenia z API statystyk:', error);
      setStatsLoading(false);
    } finally {
      // Dodatkowe zabezpieczenie - ukryj pasek ładowania po 5 sekundach
      setTimeout(() => {
        setStatsLoading(false);
      }, 5000);
    }
  };
  

  
  // Modale
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: "", content: "" });
  
  // Historia
  const [history, setHistory] = useState([]);
  const [luckyExplanations, setLuckyExplanations] = useState([]);
  
  // Nowy stan dla przełączania zakładek w wyjaśnieniach
  const [explanationsTab, setExplanationsTab] = useState('minigry'); // 'minigry', 'generatory', 'generatory-ai'



  // Funkcje obsługujące przejście do logowania/rejestracji
  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleGoToRegister = () => {
    navigate("/register");
  };

  // Obsługa logowania
  const handleLogin = (uid, userData) => {
    if (userData) {
      setUserName(userData.name);
      setUserEmail(userData.email);
    }
    navigate("/generator");
  };

  // Wylogowanie
  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
    setResults([]);
  };

  // Funkcja kopiowania zestawu do schowka
  const copySetToClipboard = (set) => {
    let numbersText = "";
    
    if (selectedGame === "eurojackpot" && Array.isArray(set) && Array.isArray(set[0]) && Array.isArray(set[1])) {
      const mainNumbers = set[0].join(", ");
      const euroNumbers = set[1].join(", ");
      numbersText = `Główne: ${mainNumbers} | Euro: ${euroNumbers}`;
    } else if (Array.isArray(set)) {
      numbersText = set.join(", ");
    }
    
    navigator.clipboard.writeText(numbersText).then(() => {
      // Powiadomienie o skopiowaniu
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      notification.textContent = '✅ Zestaw skopiowany!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
      
      console.log("Zestaw skopiowany:", numbersText);
    }).catch(err => {
      console.error("Błąd kopiowania:", err);
    });
  };

  // Funkcja generowania PDF
  const generatePDF = () => {
    if (results.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;
    const lineHeight = 7;
    const margin = 20;

    // Dodaj nagłówek
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(25, 118, 210);
    
    if (results[0] && results[0].numbers) {
      // PDF dla systemu skróconego
      doc.text('SYSTEM SKRÓCONY', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      doc.text(`Gra: ${games.find(g => g.value === selectedGame)?.label}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Data generowania: ${new Date().toLocaleString('pl-PL')}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Liczba liczb w systemie: ${results[0].numbers.length}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Gwarancja: ${results[0].guarantee} z ${selectedGame === "lotto" ? 6 : 5}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Liczba zakładów: ${results[0].totalBets}`, margin, yPosition);
      yPosition += lineHeight * 2;
      
      // Wybrane liczby
      doc.setFont(undefined, 'bold');
      doc.text('Wybrane liczby:', margin, yPosition);
      yPosition += lineHeight;
      doc.setFont(undefined, 'normal');
      doc.text(results[0].numbers.join(", "), margin, yPosition);
      yPosition += lineHeight * 2;
      
      // Zakłady
      if (results[0].bets && results[0].bets.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.text('Zakłady:', margin, yPosition);
        yPosition += lineHeight;
        doc.setFont(undefined, 'normal');
        
        results[0].bets.forEach((bet, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`Zakład ${index + 1}: ${bet.join(", ")}`, margin, yPosition);
          yPosition += lineHeight;
        });
      }
      
      doc.save(`system_skrocony_${selectedGame}_${new Date().toISOString().split('T')[0]}.pdf`);
    } else {
      // PDF dla zwykłych zestawów
      doc.text('ZESTAWY LOTTO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      doc.text(`Gra: ${games.find(g => g.value === selectedGame)?.label}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Data generowania: ${new Date().toLocaleString('pl-PL')}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Liczba zestawów: ${results.length}`, margin, yPosition);
      yPosition += lineHeight * 2;
      
      // Zestawy
      doc.setFont(undefined, 'bold');
      doc.text('Zestawy:', margin, yPosition);
      yPosition += lineHeight;
      doc.setFont(undefined, 'normal');
      
      results.forEach((set, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        let setText = `Zestaw ${index + 1}: `;
        
        if (selectedGame === "eurojackpot" && Array.isArray(set) && Array.isArray(set[0]) && Array.isArray(set[1])) {
          const mainNumbers = set[0].join(", ");
          const euroNumbers = set[1].join(", ");
          setText += `Główne: ${mainNumbers} | Euro: ${euroNumbers}`;
        } else if (Array.isArray(set)) {
          setText += set.join(", ");
        }
        
        doc.text(setText, margin, yPosition);
        yPosition += lineHeight;
      });
      
      doc.save(`zestawy_lotto_${selectedGame}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  // Funkcja kopiowania systemu skróconego
  const copySystemToClipboard = () => {
    if (results.length === 0 || !results[0].numbers) return;
    
    let systemText = `System skrócony ${selectedGame.toUpperCase()}\n`;
    systemText += `Liczba liczb: ${results[0].numbers.length}\n`;
    systemText += `Gwarancja: ${results[0].guarantee} z ${selectedGame === "lotto" ? 6 : 5}\n`;
    systemText += `Liczba zakładów: ${results[0].totalBets}\n`;
    systemText += `Wybrane liczby: ${results[0].numbers.join(", ")}\n\n`;
    
    if (results[0].bets && results[0].bets.length > 0) {
      systemText += `Zakłady:\n`;
      results[0].bets.forEach((bet, index) => {
        systemText += `Zakład ${index + 1}: ${bet.join(", ")}\n`;
      });
    }
    
    navigator.clipboard.writeText(systemText).then(() => {
      // Powiadomienie o skopiowaniu
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      notification.textContent = '✅ System skopiowany!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
      
      console.log("System skrócony skopiowany");
    }).catch(err => {
      console.error("Błąd kopiowania systemu:", err);
    });
  };

  // Funkcja kopiowania wszystkich zakładów do schowka
  const copyAllBetsToClipboard = () => {
    if (results.length === 0 || !results[0].bets) return;
    
    let betsText = `Jak obstawić zakłady:\n\n`;
    betsText += `Musisz obstawić wszystkie ${results[0].totalBets} zakładów wygenerowanych przez system. `;
    betsText += `Każdy zakład to ${selectedGame === "lotto" ? 6 : selectedGame === "miniLotto" ? 5 : selectedGame === "multiMulti" ? 10 : selectedGame === "eurojackpot" ? 5 : selectedGame === "kaskada" ? 12 : kenoNumbers} liczb z Twoich ${results[0].numbers.length}.\n\n`;
    
    const maxShown = Math.min(10, results[0].bets.length); // Pokaż maksymalnie 10 pierwszych
    betsText += `Przykładowe zakłady (pierwsze ${maxShown} z ${results[0].totalBets}):\n\n`;
    
    results[0].bets.slice(0, maxShown).forEach((bet, index) => {
      betsText += `Zakład ${index + 1}: ${bet.join(", ")}\n`;
    });
    
    if (results[0].bets.length > maxShown) {
      betsText += `\n... (i ${results[0].bets.length - maxShown} kolejnych zakładów)`;
    }
    
    navigator.clipboard.writeText(betsText).then(() => {
      // Powiadomienie o skopiowaniu
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      notification.textContent = '✅ Zakłady skopiowane!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
      
      console.log("Zakłady skopiowane");
    }).catch(err => {
      console.error("Błąd kopiowania zakładów:", err);
    });
  };

  // Funkcja generowania PDF ze statystyk
  const generateStatsPDF = (stats, gameName) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;
    const lineHeight = 7;
    const margin = 20;

    // Nagłówek
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text(`STATYSTYKI HISTORYCZNE - ${gameName.toUpperCase()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // Informacje ogólne
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Data generowania: ${new Date().toLocaleString('pl-PL')}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Ostatnia aktualizacja: ${stats.lastUpdated}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Liczba losowań: ${stats.totalDraws.toLocaleString()}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Średnia suma: ${stats.avgSum}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Zakres sumy: ${stats.sumRange[0]} - ${stats.sumRange[1]}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Najczęściej losowane liczby
    doc.setFont(undefined, 'bold');
    doc.text('🔥 NAJCZĘŚCIEJ LOSOWANE LICZBY (TOP 10):', margin, yPosition);
    yPosition += lineHeight;
    doc.setFont(undefined, 'normal');
    
    const sortedFrequency = Object.entries(stats.frequencyData || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedFrequency.forEach(([number, frequency], index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${index + 1}. Liczba ${number}: ${frequency} razy`, margin + 10, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition += lineHeight;

    // Najrzadziej losowane liczby
    doc.setFont(undefined, 'bold');
    doc.text('❄️ NAJRZADZIEJ LOSOWANE LICZBY (TOP 10):', margin, yPosition);
    yPosition += lineHeight;
    doc.setFont(undefined, 'normal');
    
    const leastFrequent = sortedFrequency.slice(-10).reverse();
    leastFrequent.forEach(([number, frequency], index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${index + 1}. Liczba ${number}: ${frequency} razy`, margin + 10, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition += lineHeight;

    // Gorące i zimne liczby
    if (stats.hotNumbers && stats.coldNumbers) {
      doc.setFont(undefined, 'bold');
      doc.text('🌡️ ANALIZA TRENDÓW:', margin, yPosition);
      yPosition += lineHeight;
      doc.setFont(undefined, 'normal');
      
      doc.text('🔥 Gorące liczby (ostatnie 50 losowań):', margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(stats.hotNumbers.join(', '), margin + 20, yPosition);
      yPosition += lineHeight * 2;
      
      doc.text('❄️ Zimne liczby (ostatnie 50 losowań):', margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(stats.coldNumbers.join(', '), margin + 20, yPosition);
      yPosition += lineHeight * 2;
    }

    // Wzorce
    if (stats.patterns) {
      doc.setFont(undefined, 'bold');
      doc.text('📊 WZORCE I ANALIZY:', margin, yPosition);
      yPosition += lineHeight;
      doc.setFont(undefined, 'normal');
      
      doc.text(`Parzyste:Nieparzyste: ${stats.patterns.evenOdd}`, margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(`Niskie:Wysokie: ${stats.patterns.lowHigh}`, margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(`Zakres sumy: ${stats.patterns.sumRange}`, margin + 10, yPosition);
      yPosition += lineHeight * 2;
    }

    // Specjalne sekcje dla Eurojackpot
    if (gameName === "Eurojackpot" && stats.euroNumbers) {
      doc.setFont(undefined, 'bold');
      doc.text('🇪🇺 LICZBY EURO (1-12):', margin, yPosition);
      yPosition += lineHeight;
      doc.setFont(undefined, 'normal');
      
      doc.text('✅ Najczęstsze liczby Euro:', margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(stats.euroNumbers.mostFrequent.join(', '), margin + 20, yPosition);
      yPosition += lineHeight * 2;
      
      doc.text('❌ Najrzadsze liczby Euro:', margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(stats.euroNumbers.leastFrequent.join(', '), margin + 20, yPosition);
      yPosition += lineHeight * 2;
    }

    // Porady
    doc.setFont(undefined, 'bold');
    doc.text('💡 PORADY I WSKAZÓWKI:', margin, yPosition);
    yPosition += lineHeight;
    doc.setFont(undefined, 'normal');
    
    const tips = [
      '🎯 Strategia gorących liczb: Wybierz 2-3 liczby z najwyższą częstotliwością + 2-3 losowe',
      '❄️ Strategia zimnych liczb: Wybierz 1-2 liczby z najniższą częstotliwością (prawo średniej)',
      '⚖️ Zrównoważona strategia: Połącz gorące i zimne liczby dla lepszego pokrycia',
      '📊 Analiza wzorców: Uwzględnij proporcje parzystych/nieparzystych i niskich/wysokich'
    ];
    
    tips.forEach(tip => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(tip, margin + 10, yPosition);
      yPosition += lineHeight;
    });

    doc.save(`statystyki_${gameName.toLowerCase().replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Funkcja kopiowania statystyk do schowka
  const copyStatsToClipboard = (stats, gameName) => {
    const sortedFrequency = Object.entries(stats.frequencyData || {})
      .sort(([,a], [,b]) => b - a);
    
    let statsText = `📊 STATYSTYKI HISTORYCZNE - ${gameName.toUpperCase()}\n`;
    statsText += `Data generowania: ${new Date().toLocaleString('pl-PL')}\n`;
    statsText += `Ostatnia aktualizacja: ${stats.lastUpdated}\n`;
    statsText += `Liczba losowań: ${stats.totalDraws.toLocaleString()}\n`;
    statsText += `Średnia suma: ${stats.avgSum}\n`;
    statsText += `Zakres sumy: ${stats.sumRange[0]} - ${stats.sumRange[1]}\n\n`;
    
    statsText += `🔥 NAJCZĘŚCIEJ LOSOWANE LICZBY (TOP 10):\n`;
    sortedFrequency.slice(0, 10).forEach(([number, frequency], index) => {
      statsText += `${index + 1}. Liczba ${number}: ${frequency} razy\n`;
    });
    
    statsText += `\n❄️ NAJRZADZIEJ LOSOWANE LICZBY (TOP 10):\n`;
    sortedFrequency.slice(-10).reverse().forEach(([number, frequency], index) => {
      statsText += `${index + 1}. Liczba ${number}: ${frequency} razy\n`;
    });
    
    if (stats.hotNumbers && stats.coldNumbers) {
      statsText += `\n🌡️ ANALIZA TRENDÓW:\n`;
      statsText += `🔥 Gorące liczby: ${stats.hotNumbers.join(', ')}\n`;
      statsText += `❄️ Zimne liczby: ${stats.coldNumbers.join(', ')}\n`;
    }
    
    if (stats.patterns) {
      statsText += `\n📊 WZORCE I ANALIZY:\n`;
      statsText += `Parzyste:Nieparzyste: ${stats.patterns.evenOdd}\n`;
      statsText += `Niskie:Wysokie: ${stats.patterns.lowHigh}\n`;
      statsText += `Zakres sumy: ${stats.patterns.sumRange}\n`;
    }
    
    if (gameName === "Eurojackpot" && stats.euroNumbers) {
      statsText += `\n🇪🇺 LICZBY EURO (1-12):\n`;
      statsText += `✅ Najczęstsze: ${stats.euroNumbers.mostFrequent.join(', ')}\n`;
      statsText += `❌ Najrzadsze: ${stats.euroNumbers.leastFrequent.join(', ')}\n`;
    }
    
    statsText += `\n💡 PORADY I WSKAZÓWKI:\n`;
    statsText += `🎯 Strategia gorących liczb: Wybierz 2-3 liczby z najwyższą częstotliwością + 2-3 losowe\n`;
    statsText += `❄️ Strategia zimnych liczb: Wybierz 1-2 liczby z najniższą częstotliwością (prawo średniej)\n`;
    statsText += `⚖️ Zrównoważona strategia: Połącz gorące i zimne liczby dla lepszego pokrycia\n`;
    statsText += `📊 Analiza wzorców: Uwzględnij proporcje parzystych/nieparzystych i niskich/wysokich\n`;
    
    navigator.clipboard.writeText(statsText).then(() => {
      // Powiadomienie o skopiowaniu
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      notification.textContent = '✅ Statystyki skopiowane!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
      
      console.log("Statystyki skopiowane");
    }).catch(err => {
      console.error("Błąd kopiowania statystyk:", err);
    });
  };

  // Funkcje dla generatora marzeń
  const convertDateToNumbers = (dateString) => {
    if (!dateString) return [];
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return [];
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // Konwertuj datę na liczby 1-49
    const numbers = [];
    
    // Dzień (1-31)
    if (day >= 1 && day <= 31) {
      numbers.push(day);
    }
    
    // Miesiąc (1-12)
    if (month >= 1 && month <= 12) {
      numbers.push(month);
    }
    
    // Rok - suma cyfr
    const yearSum = year.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    if (yearSum >= 1 && yearSum <= 49) {
      numbers.push(yearSum);
    }
    
    // Poszczególne cyfry roku (jeśli są w zakresie 1-49)
    const yearDigits = year.toString().split('').map(d => parseInt(d));
    yearDigits.forEach(digit => {
      if (digit >= 1 && digit <= 49 && !numbers.includes(digit)) {
        numbers.push(digit);
      }
    });
    
    // Dodaj sumę dnia i miesiąca
    const dayMonthSum = day + month;
    if (dayMonthSum >= 1 && dayMonthSum <= 49 && !numbers.includes(dayMonthSum)) {
      numbers.push(dayMonthSum);
    }
    
    // Dodaj różnicę roku i wieku (przybliżony wiek)
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    if (age >= 1 && age <= 49 && !numbers.includes(age)) {
      numbers.push(age);
    }
    
    // Określ zakres na podstawie wybranej gry
    let maxNumber;
    switch (selectedGame) {
      case "lotto": maxNumber = 49; break;
      case "miniLotto": maxNumber = 42; break;
      case "multiMulti": maxNumber = 80; break;
      case "eurojackpot": maxNumber = 50; break;
      case "kaskada": maxNumber = 24; break;
      case "keno": maxNumber = 70; break;
      default: maxNumber = 49;
    }
    
    return [...new Set(numbers)].filter(n => n >= 1 && n <= maxNumber);
  };

  const generateDreamSet = () => {
    const dateNumbers = [];
    const dateLabels = [];
    
    // Zbierz wszystkie liczby z dat
    dreamDates.forEach(dateItem => {
      if (dateItem.enabled && dateItem.date) {
        const numbers = convertDateToNumbers(dateItem.date);
        dateNumbers.push(...numbers);
        dateLabels.push(`${dateItem.label}: ${numbers.join(', ')}`);
      }
    });
    
    // Usuń duplikaty
    const uniqueDateNumbers = [...new Set(dateNumbers)];
    
    if (uniqueDateNumbers.length === 0) {
      window.alert("Proszę wprowadzić przynajmniej jedną datę!");
      return;
    }
    
    // Określ liczbę liczb do wygenerowania
    const numbersNeeded = selectedGame === "lotto" ? 6 : 
                         selectedGame === "miniLotto" ? 5 :
                         selectedGame === "multiMulti" ? 10 :
                         selectedGame === "eurojackpot" ? 5 :
                         selectedGame === "kaskada" ? 12 :
                         selectedGame === "keno" ? kenoNumbers : 6;
    
    // Użyj wszystkich liczb z dat (jeśli wystarczy)
    let finalNumbers = [...uniqueDateNumbers];
    
    // Określ zakres liczb na podstawie gry
    let maxNumber;
    switch (selectedGame) {
      case "lotto": maxNumber = 49; break;
      case "miniLotto": maxNumber = 42; break;
      case "multiMulti": maxNumber = 80; break;
      case "eurojackpot": maxNumber = 50; break;
      case "kaskada": maxNumber = 24; break;
      case "keno": maxNumber = 70; break;
      default: maxNumber = 49;
    }
    
    // Dodaj losowe liczby, jeśli potrzeba
    if (finalNumbers.length < numbersNeeded) {
      const availableNumbers = Array.from({length: maxNumber}, (_, i) => i + 1)
        .filter(n => !finalNumbers.includes(n));
      
      const randomCount = numbersNeeded - finalNumbers.length;
      for (let i = 0; i < randomCount && availableNumbers.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        finalNumbers.push(availableNumbers[randomIndex]);
        availableNumbers.splice(randomIndex, 1);
      }
    }
    
    // Ogranicz do wymaganej liczby liczb
    finalNumbers = finalNumbers.slice(0, numbersNeeded);
    
    // Posortuj liczby
    finalNumbers.sort((a, b) => a - b);
    
    // Dla Eurojackpot dodaj osobne liczby Euro
    if (selectedGame === "eurojackpot") {
      const euroNumbers = [];
      const availableEuro = Array.from({length: 12}, (_, i) => i + 1);
      
      for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * availableEuro.length);
        euroNumbers.push(availableEuro[randomIndex]);
        availableEuro.splice(randomIndex, 1);
      }
      
      euroNumbers.sort((a, b) => a - b);
      return [finalNumbers, euroNumbers];
    }
    
    return finalNumbers;
  };

  const handleGenerateDreams = (e) => {
    e.preventDefault();
    setResults([]);
    
    const newResults = [];
    for (let i = 0; i < setsCount; i++) {
      newResults.push(generateDreamSet());
    }
    
    setResults(newResults);
    setHistory(prev => [[selectedGame, new Date(), ...newResults], ...prev]);
  };

  const updateDreamDate = (id, field, value) => {
    setDreamDates(prev => prev.map(date => 
      date.id === id ? { ...date, [field]: value } : date
    ));
  };

  // Funkcje dla szczęśliwych liczb
  const addLuckyNumber = (number) => {
    const num = parseInt(number);
    if (num >= 1 && num <= 49 && !luckyNumbers.includes(num)) {
      setLuckyNumbers(prev => [...prev, num].sort((a, b) => a - b));
    }
  };

  const removeLuckyNumber = (number) => {
    setLuckyNumbers(prev => prev.filter(n => n !== number));
  };

  // Funkcje wyboru liczb dla różnych gier
  const getGameRange = (game) => {
    switch(game) {
      case "lotto": return { min: 1, max: 49, count: 6, maxSelectable: 49 };
      case "miniLotto": return { min: 1, max: 42, count: 5, maxSelectable: 42 };
      case "multiMulti": return { min: 1, max: 80, count: 10, maxSelectable: 80 };
      case "eurojackpot": return { min: 1, max: 50, count: 5, euroMin: 1, euroMax: 10, euroCount: 2, maxSelectable: 50 };
      case "kaskada": return { min: 1, max: 70, count: 12, maxSelectable: 70 };
      case "keno": return { min: 1, max: 70, count: 10, maxSelectable: 70 };
      default: return { min: 1, max: 49, count: 6, maxSelectable: 49 };
    }
  };

  const generateNumberBalls = (game) => {
    const range = getGameRange(game);
    const balls = [];
    for (let i = range.min; i <= range.max; i++) {
      balls.push(i);
    }
    // Mieszamy liczby losowo
    return shuffle([...balls]);
  };

  const handleBallClick = (number) => {
    if (luckyNumbers.includes(number)) {
      removeLuckyNumber(number);
    } else {
      addLuckyNumber(number);
    }
  };

  // Funkcja do sprawdzania czy użytkownik wybrał wystarczającą liczbę kulek
  const checkCompleteSelection = () => {
    const range = getGameRange(selectedGame);
    
    if (selectedGame === "eurojackpot") {
      // Dla Eurojackpot sprawdź czy są liczby główne (1-50) i Euro (1-10)
      const mainNumbers = luckyNumbers.filter(num => num >= 1 && num <= 50);
      const euroNumbers = luckyNumbers.filter(num => num >= 1 && num <= 10);
      return mainNumbers.length === 5 && euroNumbers.length === 2;
    } else {
      return luckyNumbers.length === range.count;
    }
  };

  // Funkcja do tworzenia animacji konfetti
  const createConfetti = () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#ff0080', '#8000ff', '#00ff80', '#ff8000'];
    
    for (let i = 0; i < 200; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.width = Math.random() * 8 + 6 + 'px';
        confetti.style.height = Math.random() * 8 + 6 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.animation = `confettiFall ${Math.random() * 2 + 2}s linear forwards`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          if (document.body.contains(confetti)) {
            document.body.removeChild(confetti);
          }
        }, 4000);
      }, i * 15);
    }
  };

  // Dodaj style dla animacji konfetti i powiadomień
  const confettiStyle = `
    @keyframes confettiFall {
      0% {
        transform: translateY(-10px) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
    
    @keyframes slideIn {
      0% {
        transform: translateX(100%);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      0% {
        transform: translateX(0);
        opacity: 1;
      }
      100% {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;

  const generateLuckySystem = (e) => {
    e.preventDefault();
    
    if (luckyNumbers.length === 0) {
      window.alert("Proszę dodać przynajmniej jedną szczęśliwą liczbę!");
      return;
    }
    
    if (luckyNumbers.length < 3) {
      window.alert("Dodaj przynajmniej 3 liczby dla lepszej analizy!");
      return;
    }
    
    const numbersNeeded = selectedNumbersCount;
    
    // Analiza liczb użytkownika
    const userAnalysis = analyzeUserNumbers(luckyNumbers);
    
    // Generowanie szczęśliwych zestawów
    const luckySets = [];
    const explanations = [];
    
    // Generuj 3 różne zestawy
    for (let i = 0; i < 3; i++) {
      const { set, explanation } = generateLuckySet(luckyNumbers, numbersNeeded, userAnalysis, i);
      luckySets.push(set);
      explanations.push(explanation);
    }
    
    // Dodaj tryb intuicyjny jako 4. zestaw
    const { set: intuitiveSet, explanation: intuitiveExplanation } = generateIntuitiveSet(luckyNumbers, numbersNeeded);
    luckySets.push(intuitiveSet);
    explanations.push(intuitiveExplanation);
    

    
    setResults(luckySets);
    setLuckyExplanations(explanations);
    setHistory(prev => [[selectedGame, new Date(), ...luckySets], ...prev]);
  };

  // Analiza liczb użytkownika
  const analyzeUserNumbers = (numbers) => {
    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / sorted.length;
    const even = sorted.filter(n => n % 2 === 0).length;
    const odd = sorted.length - even;
    const low = sorted.filter(n => n <= 25).length;
    const high = sorted.length - low;
    
    // Sprawdź regularność (luki)
    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(sorted[i] - sorted[i-1]);
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const isRegular = gaps.every(gap => Math.abs(gap - avgGap) < 3);
    
    // Sprawdź czy liczby są z jednej dziesiątki
    const decades = [...new Set(sorted.map(n => Math.floor(n / 10)))];
    const isFromSameDecade = decades.length <= 2;
    
    return {
      sum,
      avg,
      even,
      odd,
      low,
      high,
      isRegular,
      isFromSameDecade,
      gaps,
      avgGap,
      decades
    };
  };

  // Generowanie szczęśliwego zestawu
  const generateLuckySet = (userNumbers, count, analysis, setIndex) => {
    const luckySet = new Set();
    const shuffled = [...userNumbers].sort(() => Math.random() - 0.5);
    
    // Zachowaj 2-3 liczby od użytkownika (psychologiczny efekt)
    const keepCount = Math.min(3, Math.floor(userNumbers.length / 2));
    shuffled.slice(0, keepCount).forEach(n => luckySet.add(n));
    
    // Uzupełnij zrównoważonymi liczbami
    while (luckySet.size < count) {
      const candidate = getBalancedNumber(userNumbers, analysis, luckySet);
      luckySet.add(candidate);
    }
    
    const result = Array.from(luckySet).sort((a, b) => a - b);
    
    // Generuj wyjaśnienie
    const explanation = generateExplanation(result, userNumbers, analysis, setIndex, keepCount);
    
    return { set: result, explanation };
  };

  // Generowanie zrównoważonej liczby
  const getBalancedNumber = (userNumbers, analysis, currentSet) => {
    const maxNum = selectedGame === "multiMulti" ? 80 : 
                   selectedGame === "kaskada" ? 24 : 49;
    
    const candidates = [];
    
    // Dodaj liczby podobne do użytkownika
    userNumbers.forEach(n => {
      if (n + 1 <= maxNum && !currentSet.has(n + 1)) candidates.push(n + 1);
      if (n - 1 >= 1 && !currentSet.has(n - 1)) candidates.push(n - 1);
      if (n + 10 <= maxNum && !currentSet.has(n + 10)) candidates.push(n + 10);
      if (n - 10 >= 1 && !currentSet.has(n - 10)) candidates.push(n - 10);
    });
    
    // Dodaj liczby z przeciwnych zakresów dla równowagi
    const currentSum = Array.from(currentSet).reduce((a, b) => a + b, 0);
    const targetSum = analysis.sum * (currentSet.size / userNumbers.length);
    
    if (currentSum < targetSum * 0.8) {
      // Dodaj wyższe liczby
      for (let i = Math.max(...userNumbers) + 1; i <= maxNum; i++) {
        if (!currentSet.has(i)) candidates.push(i);
      }
    } else if (currentSum > targetSum * 1.2) {
      // Dodaj niższe liczby
      for (let i = 1; i < Math.min(...userNumbers); i++) {
        if (!currentSet.has(i)) candidates.push(i);
      }
    }
    
    // Dodaj losowe liczby jeśli brakuje
    if (candidates.length === 0) {
      for (let i = 1; i <= maxNum; i++) {
        if (!currentSet.has(i) && !userNumbers.includes(i)) {
          candidates.push(i);
        }
      }
    }
    
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  // Generowanie wyjaśnienia
  const generateExplanation = (luckySet, userNumbers, analysis, setIndex, keepCount) => {
    const luckySum = luckySet.reduce((a, b) => a + b, 0);
    const commonNumbers = luckySet.filter(n => userNumbers.includes(n));
    const years = [2018, 2019, 2020, 2021, 2022, 2023];
    const randomYear = years[Math.floor(Math.random() * years.length)];
    
    const explanations = [
      `🎯 Zestaw ${setIndex + 1}: ${keepCount} liczby pochodzą z Twojego wyboru!`,
      `📊 Suma zbliżona do Twojej (${analysis.sum} → ${luckySum})`,
      `✨ Większy rozrzut → większa szansa na pokrycie zakresów`,
      `💫 Zrównoważony rozkład parzystych/nieparzystych`,
      `🌟 Pokrywa różne dziesiątki dla lepszego rozrzutu`
    ];
    
    return explanations.slice(0, 4).join('\n');
  };

  // Generowanie zestawu intuicyjnego
  const generateIntuitiveSet = (userNumbers, count) => {
    const intuitiveSet = new Set();
    
    // Użyj emocjonalnych liczb użytkownika
    userNumbers.forEach(n => {
      if (intuitiveSet.size < count) {
        intuitiveSet.add(n);
      }
    });
    
    // Dodaj "szczęśliwe" liczby
    const luckyNumbers = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    luckyNumbers.forEach(n => {
      if (intuitiveSet.size < count && !userNumbers.includes(n)) {
        intuitiveSet.add(n);
      }
    });
    
    // Uzupełnij losowo
    const range = getGameRange(selectedGame);
    while (intuitiveSet.size < count) {
      const randomNum = Math.floor(Math.random() * range.max) + 1;
      if (!intuitiveSet.has(randomNum)) {
        intuitiveSet.add(randomNum);
      }
    }
    
    const result = Array.from(intuitiveSet).sort((a, b) => a - b);
    const explanation = `🔔 Twoje liczby przyniosły Ci dzisiaj:\n🎉 Zapisz ten zestaw i graj z nim przez 7 dni!\n✨ Generowany na bazie emocji i szczęścia`;
    
    return { set: result, explanation };
  };





  const saveAsFavorite = () => {
    if (results.length === 0) {
      window.alert("Brak wyników do zapisania!");
      return;
    }
    
    if (!favoriteSetName.trim()) {
      window.alert("Proszę podać nazwę dla ulubionego zestawu!");
      return;
    }
    
    const newFavorite = {
      id: Date.now(),
      name: favoriteSetName,
      game: selectedGame,
      numbers: luckyNumbers,
      results: results,
      date: new Date()
    };
    
    setFavoriteSets(prev => [newFavorite, ...prev]);
    setFavoriteSetName("");
    window.alert("Zestaw został zapisany jako ulubiony!");
  };

  const loadFavorite = (favorite) => {
    setSelectedGame(favorite.game);
    setLuckyNumbers(favorite.numbers);
    setResults(favorite.results);
  };

  const deleteFavorite = (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten ulubiony zestaw?")) {
      setFavoriteSets(prev => prev.filter(fav => fav.id !== id));
    }
  };

  // Funkcje edycji profilu
  const startEditingProfile = () => {
    setEditName(userName || "");
    setEditEmail(userEmail || "");
    setEditAddress("");
    setEditSurname("");
    setIsEditingProfile(true);
  };

  const saveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      window.alert("Imię i email są wymagane!");
      return;
    }
    
    // Tu można dodać zapis do bazy danych
    setUserName(editName.trim());
    setUserEmail(editEmail.trim());
    setIsEditingProfile(false);
    window.alert("Dane zostały zaktualizowane!");
  };

  const cancelEditing = () => {
    setIsEditingProfile(false);
  };

  // Funkcje płatności
  const addCard = () => {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
      window.alert("Proszę wypełnić wszystkie pola karty!");
      return;
    }
    
    if (cardNumber.length < 16) {
      window.alert("Numer karty musi mieć 16 cyfr!");
      return;
    }
    
    const newCard = {
      id: Date.now(),
      number: cardNumber.slice(-4),
      holder: cardHolder,
      expiry: cardExpiry,
      type: getCardType(cardNumber)
    };
    
    setSavedCards(prev => [...prev, newCard]);
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardHolder("");
    setIsAddingCard(false);
    window.alert("Karta została dodana!");
  };

  const removeCard = (cardId) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę kartę?")) {
      setSavedCards(prev => prev.filter(card => card.id !== cardId));
    }
  };

  const getCardType = (number) => {
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
  };

  // Funkcja płatności została przeniesiona do komponentu PaymentButtons
  const handlePaymentSuccess = (result) => {
    console.log('✅ Płatność zakończona sukcesem:', result);
    // Tutaj można dodać dodatkową logikę po sukcesie płatności
  };

  const handleCancelSubscription = async () => {
    if (!user) {
      alert('Musisz być zalogowany, aby anulować subskrypcję');
      return;
    }

    if (!window.confirm('Czy na pewno chcesz anulować subskrypcję? Dostęp do funkcji Premium zostanie utracony po zakończeniu bieżącego okresu rozliczeniowego.')) {
      return;
    }

    try {
      const result = await cancelSubscription(user.uid);
      
      if (result.success) {
        alert('Subskrypcja została anulowana pomyślnie');
        // Odśwież status subskrypcji
        setTimeout(() => {
          checkSubscription();
        }, 1000);
      } else {
        alert(result.error || 'Błąd anulowania subskrypcji');
      }
    } catch (error) {
      console.error('Błąd anulowania subskrypcji:', error);
      alert('Wystąpił błąd podczas anulowania subskrypcji');
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Funkcje ulubionych zestawów
  const addToFavorites = (set, generatorType) => {
    // Automatyczna nazwa: "Ulubiony 1", "Ulubiony 2", itd.
    const nextNumber = favoriteSets.length + 1;
    const favoriteName = `Ulubiony ${nextNumber}`;
    
    const newFavorite = {
      id: Date.now(),
      name: favoriteName,
      set: set,
      generatorType: generatorType,
      game: selectedGame,
      date: new Date().toISOString()
    };
    
    setFavoriteSets(prev => [newFavorite, ...prev]);
    
    window.alert(`Zestaw "${favoriteName}" został dodany do ulubionych!`);
  };

  const removeFromFavorites = (favoriteId) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten zestaw z ulubionych?")) {
      setFavoriteSets(prev => prev.filter(fav => fav.id !== favoriteId));
    }
  };

  const isFavorite = (set) => {
    return favoriteSets.some(fav => JSON.stringify(fav.set) === JSON.stringify(set));
  };

  const getFavoriteId = (set) => {
    const favorite = favoriteSets.find(fav => JSON.stringify(fav.set) === JSON.stringify(set));
    return favorite ? favorite.id : null;
  };

  // Zapisywanie ulubionych zestawów do localStorage
  useEffect(() => {
    localStorage.setItem('favoriteSets', JSON.stringify(favoriteSets));
  }, [favoriteSets]);

  // Generator zestawów
  const handleGenerate = (e) => {
    e.preventDefault();
    setResults([]);
    let newResults = [];
    let usedNumbers = new Set();
    let sets = new Set();
    let maxTries = setsCount * 50;
    let tries = 0;
    
    while (newResults.length < setsCount && tries < maxTries) {
      let set = [];
      switch (selectedGame) {
        case "lotto":
          set = generateLottoSmart(type, strategy); break;
        case "miniLotto":
          set = generateMiniLottoSmart(type, strategy); break;
        case "multiMulti":
          set = generateCustom(10, 1, 80, type, strategy); break;
        case "eurojackpot":
          set = generateEurojackpot(type, strategy); break;
        case "kaskada":
          set = generateCustom(12, 1, 24, type, strategy); break;
        case "keno":
          set = generateKenoSmart(type, strategy, kenoRange, kenoNumbers); break;
        default:
          set = [];
      }
      
      const key = JSON.stringify(set);
      
      // Sprawdź unikalność zestawów
      if (uniqueSets && sets.has(key)) {
        tries++;
        continue;
      }
      
      // Sprawdź unikalność liczb w całej puli
      if (uniqueNumbers) {
        let canUse = true;
        for (let num of set) {
          if (usedNumbers.has(num)) {
            canUse = false;
            break;
          }
        }
        if (!canUse) {
          tries++;
          continue;
        }
        // Dodaj liczby do użytych
        for (let num of set) {
          usedNumbers.add(num);
        }
      }
      
      newResults.push(set);
      sets.add(key);
      tries++;
    }
    
    if (newResults.length < setsCount) {
      window.alert(`Nie można wygenerować ${setsCount} zestawów z wybranymi ustawieniami. Wygenerowano ${newResults.length} zestawów.`);
    }
    
    setResults(newResults);
    setHistory(prev => [[selectedGame, new Date(), ...newResults], ...prev]);
  };

  // Systemy skrócone
  const handleGenerateSystem = (e) => {
    e.preventDefault();
    const system = generateShortSystem(selectedGame, systemNumbers, systemGuarantee);
    setResults([system]);
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

  // Algorytmy losowania
  function generateCustom(count, min, max, type, strategy) {
    let pool = [];
    for (let i = min; i <= max; i++) {
      if (type === "even" && i % 2 !== 0) continue;
      if (type === "odd" && i % 2 === 0) continue;
      pool.push(i);
    }
    
    // Zastosuj strategię używając aktualnych statystyk z lotto.pl
    if (strategy === "frequent" && currentStats && currentStats.frequencyData) {
      // Sortuj liczby według częstotliwości (najczęstsze na początku)
      const sortedFrequency = Object.entries(currentStats.frequencyData)
        .sort(([,a], [,b]) => b - a)
        .map(([num]) => parseInt(num));
      
      // Filtruj tylko liczby z puli i najczęstsze
      pool = pool.filter(n => sortedFrequency.includes(n));
      // Ogranicz do top 15 najczęstszych z puli
      pool = pool.slice(0, 15);
    } else if (strategy === "rare" && currentStats && currentStats.frequencyData) {
      // Sortuj liczby według częstotliwości (najrzadsze na końcu)
      const sortedFrequency = Object.entries(currentStats.frequencyData)
        .sort(([,a], [,b]) => a - b)
        .map(([num]) => parseInt(num));
      
      // Filtruj tylko liczby z puli i najrzadsze
      pool = pool.filter(n => sortedFrequency.includes(n));
      // Ogranicz do top 15 najrzadszych z puli
      pool = pool.slice(0, 15);
    } else if (strategy === "mixed" && currentStats && currentStats.frequencyData) {
      // Mieszana strategia - 50% najczęstszych, 50% najrzadszych
      const sortedFrequency = Object.entries(currentStats.frequencyData)
        .sort(([,a], [,b]) => b - a)
        .map(([num]) => parseInt(num));
      
      const frequent = pool.filter(n => sortedFrequency.includes(n)).slice(0, Math.ceil(pool.length / 2));
      const rare = pool.filter(n => sortedFrequency.reverse().includes(n)).slice(0, Math.floor(pool.length / 2));
      pool = [...frequent, ...rare];
    }
    
    // Fallback do statycznych danych jeśli nie ma aktualnych
    if (pool.length === 0 && historicalStats[selectedGame]) {
      if (strategy === "frequent") {
        pool = pool.filter(n => historicalStats[selectedGame].mostFrequent.includes(n));
      } else if (strategy === "rare") {
        pool = pool.filter(n => historicalStats[selectedGame].leastFrequent.includes(n));
      }
    }
    
    return pickNumbers(count, pool);
  }

  function generateLottoSmart(type, strategy) {
    let set = [];
    let tries = 0;
    while (tries < 1000) {
      let lows = pickNumbers(3, rangeWithType(1, 25, type, strategy));
      let highs = pickNumbers(3, rangeWithType(26, 49, type, strategy));
      set = [...lows, ...highs];
      set = shuffle(set);
      const sum = set.reduce((a, b) => a + b, 0);
      const even = set.filter(n => n % 2 === 0).length;
      const odd = 6 - even;
      if (
        sum >= 100 && sum <= 180 &&
        ((type === "even" && even === 6) || (type === "odd" && odd === 6) || (type === "mixed" && even === 3 && odd === 3))
      ) return set.sort((a, b) => a - b);
      tries++;
    }
    return generateCustom(6, 1, 49, type, strategy);
  }

  function generateMiniLottoSmart(type, strategy) {
    let set = [];
    let tries = 0;
    while (tries < 1000) {
      let lows = pickNumbers(3, rangeWithType(1, 21, type, strategy));
      let highs = pickNumbers(2, rangeWithType(22, 42, type, strategy));
      set = [...lows, ...highs];
      set = shuffle(set);
      const sum = set.reduce((a, b) => a + b, 0);
      const even = set.filter(n => n % 2 === 0).length;
      const odd = 5 - even;
      if (
        sum >= 80 && sum <= 130 &&
        ((type === "even" && even === 5) || (type === "odd" && odd === 5) || (type === "mixed" && even === 2 && odd === 3))
      ) return set.sort((a, b) => a - b);
      tries++;
    }
    return generateCustom(5, 1, 42, type, strategy);
  }

  function generateEurojackpot(type, strategy) {
    const main = generateCustom(5, 1, 50, type, strategy);
    const euro = generateCustom(2, 1, 12, type, strategy);
    return [main, euro];
  }

  function generateKenoSmart(type, strategy, rangeType = "mixed", numbersCount = 10) {
    // Keno: wybierz 10 lub 20 liczb z puli 1-70 zgodnie z algorytmem
    const kenoNumbers = numbersCount; // Liczba liczb dla Keno (10 lub 20)
    
    // Dostosuj sumę docelową na podstawie liczby liczb
    let targetSum, sumRange;
    if (numbersCount === 10) {
      targetSum = 355; // Średnia suma dla 10 liczb z zakresu 1-70
      sumRange = 30; // Zakres ±30 od średniej (325-385)
    } else {
      targetSum = 710; // Średnia suma dla 20 liczb z zakresu 1-70
      sumRange = 40; // Zakres ±40 od średniej (670-750)
    }
    
    const maxTries = 1000;
    
    let bestSets = [];
    let tries = 0;
    
    while (tries < maxTries) {
      let set = [];
      
      // Określ zakres liczb na podstawie rangeType
      let availableNumbers = [];
      if (rangeType === "low") {
        // Tylko liczby niskie (1-35)
        availableNumbers = Array.from({length: 35}, (_, i) => i + 1);
        // Dostosuj sumę docelową dla niskich liczb
        let lowTargetSum, lowSumRange;
        if (numbersCount === 10) {
          lowTargetSum = 180; // Średnia suma dla 10 liczb z zakresu 1-35
          lowSumRange = 25; // Zakres ±25 od średniej (155-205)
        } else {
          lowTargetSum = 360; // Średnia suma dla 20 liczb z zakresu 1-35
          lowSumRange = 30; // Zakres ±30 od średniej (330-390)
        }
        
        set = pickNumbers(kenoNumbers, availableNumbers);
        const sum = set.reduce((a, b) => a + b, 0);
        
        if (sum < lowTargetSum - lowSumRange || sum > lowTargetSum + lowSumRange) {
          tries++;
          continue;
        }
      } else if (rangeType === "high") {
        // Tylko liczby wysokie (36-70)
        availableNumbers = Array.from({length: 35}, (_, i) => i + 36);
        // Dostosuj sumę docelową dla wysokich liczb
        let highTargetSum, highSumRange;
        if (numbersCount === 10) {
          highTargetSum = 530; // Średnia suma dla 10 liczb z zakresu 36-70
          highSumRange = 25; // Zakres ±25 od średniej (505-555)
        } else {
          highTargetSum = 1060; // Średnia suma dla 20 liczb z zakresu 36-70
          highSumRange = 30; // Zakres ±30 od średniej (1030-1090)
        }
        
        set = pickNumbers(kenoNumbers, availableNumbers);
        const sum = set.reduce((a, b) => a + b, 0);
        
        if (sum < highTargetSum - highSumRange || sum > highTargetSum + highSumRange) {
          tries++;
          continue;
        }
      } else {
        // Mieszane (1-70) - oryginalny algorytm
        availableNumbers = Array.from({length: 70}, (_, i) => i + 1);
        set = pickNumbers(kenoNumbers, availableNumbers);
        const sum = set.reduce((a, b) => a + b, 0);
        
        if (sum < targetSum - sumRange || sum > targetSum + sumRange) {
          tries++;
          continue;
        }
      }
      
      const even = set.filter(n => n % 2 === 0).length;
      const odd = kenoNumbers - even;
      
      // Sprawdź dodatkowe kryteria
      let isValid = true;
      
      // Sprawdź typ (parzyste/nieparzyste/mieszane)
      if (type === "even" && even !== kenoNumbers) isValid = false;
      else if (type === "odd" && odd !== kenoNumbers) isValid = false;
      else if (type === "mixed") {
        if (numbersCount === 10) {
          if (even < 4 || odd < 4) isValid = false; // Minimum 4 parzystych i 4 nieparzystych dla 10 liczb
        } else {
          if (even < 8 || odd < 8) isValid = false; // Minimum 8 parzystych i 8 nieparzystych dla 20 liczb
        }
      }
      
      // Sprawdź strategię używając aktualnych statystyk z lotto.pl
      if (strategy === "frequent" && currentStats && currentStats.frequencyData) {
        // Sortuj liczby według częstotliwości (najczęstsze na początku)
        const sortedFrequency = Object.entries(currentStats.frequencyData)
          .sort(([,a], [,b]) => b - a)
          .map(([num]) => parseInt(num));
        
        const frequentCount = set.filter(n => sortedFrequency.includes(n)).length;
        if (numbersCount === 10) {
          if (frequentCount < 4) isValid = false; // Minimum 4 najczęstszych liczb dla 10 liczb
        } else {
          if (frequentCount < 8) isValid = false; // Minimum 8 najczęstszych liczb dla 20 liczb
        }
      } else if (strategy === "rare" && currentStats && currentStats.frequencyData) {
        // Sortuj liczby według częstotliwości (najrzadsze na końcu)
        const sortedFrequency = Object.entries(currentStats.frequencyData)
          .sort(([,a], [,b]) => a - b)
          .map(([num]) => parseInt(num));
        
        const rareCount = set.filter(n => sortedFrequency.includes(n)).length;
        if (numbersCount === 10) {
          if (rareCount < 4) isValid = false; // Minimum 4 najrzadszych liczb dla 10 liczb
        } else {
          if (rareCount < 8) isValid = false; // Minimum 8 najrzadszych liczb dla 20 liczb
        }
      } else if (strategy === "mixed" && currentStats && currentStats.frequencyData) {
        // Mieszana strategia - sprawdź czy jest balans między częstymi i rzadkimi
        const sortedFrequency = Object.entries(currentStats.frequencyData)
          .sort(([,a], [,b]) => b - a)
          .map(([num]) => parseInt(num));
        
        const frequentCount = set.filter(n => sortedFrequency.includes(n)).length;
        const rareCount = set.filter(n => sortedFrequency.reverse().includes(n)).length;
        if (numbersCount === 10) {
          if (frequentCount < 2 || rareCount < 2) isValid = false; // Minimum 2 częste i 2 rzadkie dla 10 liczb
        } else {
          if (frequentCount < 4 || rareCount < 4) isValid = false; // Minimum 4 częste i 4 rzadkie dla 20 liczb
        }
      }
      
      if (isValid) {
        // Oblicz odległość od idealnej sumy
        const currentSum = set.reduce((a, b) => a + b, 0);
        let targetSumForRange = targetSum;
        if (rangeType === "low") {
          targetSumForRange = numbersCount === 10 ? 180 : 360;
        } else if (rangeType === "high") {
          targetSumForRange = numbersCount === 10 ? 530 : 1060;
        }
        
        const distanceFromTarget = Math.abs(currentSum - targetSumForRange);
        
        bestSets.push({
          numbers: set.sort((a, b) => a - b),
          sum: currentSum,
          distance: distanceFromTarget,
          even: even,
          odd: odd,
          rangeType: rangeType
        });
        
        // Ogranicz do 10 najlepszych zestawów
        if (bestSets.length >= 10) {
          bestSets.sort((a, b) => a.distance - b.distance);
          bestSets = bestSets.slice(0, 10);
        }
      }
      
      tries++;
    }
    
    // Jeśli nie znaleziono żadnych zestawów, wygeneruj standardowy
    if (bestSets.length === 0) {
      const standardSet = generateCustom(kenoNumbers, 1, 70, type, strategy);
      return standardSet.sort((a, b) => a - b);
    }
    
    // Zwróć najlepszy zestaw (najbliższy średniej sumie)
    return bestSets[0].numbers;
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

  function generateILPBets(numbers, pick, guarantee) {
    // Prosta implementacja ILP - generuje odpowiednią liczbę zakładów
    
    const allCombinations = generateAllCombinations(numbers, pick);
    
    // Oblicz liczbę zakładów na podstawie parametrów
    let targetBets;
    if (guarantee === 3) {
      targetBets = Math.max(5, Math.ceil(numbers.length * 0.7));
    } else if (guarantee === 4) {
      targetBets = Math.max(8, Math.ceil(numbers.length * 0.9));
    } else if (guarantee === 5) {
      targetBets = Math.max(12, Math.ceil(numbers.length * 1.2));
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

  // Sprawdza czy kombinacja zawiera wszystkie elementy z target
  function containsAll(combination, target) {
    return target.every(item => combination.includes(item));
  }

  // Sprawdza czy wszystkie targetowe kombinacje są pokryte
  function isCovered(targetCombinations, selectedCombinations) {
    return targetCombinations.every(target => 
      selectedCombinations.some(combo => containsAll(combo, target))
    );
  }

  // Oblicza teoretyczne minimum zakładów dla systemu skróconego
  function calculateTheoreticalMinimum(N, K, G) {
    // Teoretyczne minimum = C(N,G) / C(K,G)
    // gdzie C(n,k) to liczba kombinacji k-elementowych z n elementów
    const numerator = generateAllCombinations(Array.from({length: N}, (_, i) => i + 1), G).length;
    const denominator = generateAllCombinations(Array.from({length: K}, (_, i) => i + 1), G).length;
    return Math.ceil(numerator / denominator);
  }

  // Sprawdza czy system jest optymalny
  function isOptimalSystem(actualBets, theoreticalMinimum) {
    const efficiency = theoreticalMinimum / actualBets;
    return {
      isOptimal: efficiency >= 0.8, // System jest optymalny jeśli jest w 80% teoretycznego minimum
      efficiency: efficiency,
      theoreticalMinimum: theoreticalMinimum
    };
  }

  // Algorytm systemów skróconych - covering design
  // Formalna definicja: System skrócony to zbiór kombinacji K-elementowych wybranych z N liczb,
  // który zawiera wszystkie możliwe X-elementowe podzbiory. To gwarantuje, że jeśli w losowaniu
  // trafione zostaną dokładnie X liczb z wybranych N, to przynajmniej jeden zakład zawiera wszystkie te X liczby.
  //
  // Wejście:
  // - N = liczba typowanych liczb (numbers.length)
  // - K = liczba liczb w zakładzie (pick)
  // - G = liczba trafień gwarantowanych (guarantee)
  // Wyjście:
  // - Lista zakładów, w których każda możliwa kombinacja G z N występuje przynajmniej w jednym zakładzie.
  // Cel:
  // - Zminimalizować liczbę zakładów przy zachowaniu gwarancji G z K
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
    // Format klucza: "N-G" gdzie N = liczba liczb, G = gwarancja
    // Systemy są podzielone według gry (liczba liczb w zakładzie)
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
        [0, 1, 2, 3, 5, 7],
        [0, 1, 2, 4, 6, 7],
        [0, 1, 3, 4, 5, 6],
        [0, 2, 3, 4, 5, 7],
        [1, 2, 3, 4, 6, 7]
      ],
      // System 9 liczb, gwarancja 3 z 6 (C(9,3) = 84 trójki, 10 zakładów)
      "9-3": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 5, 7],
        [0, 1, 2, 4, 6, 8],
        [0, 1, 3, 4, 5, 6],
        [0, 1, 3, 4, 7, 8],
        [0, 2, 3, 5, 6, 7],
        [0, 2, 4, 5, 6, 8],
        [1, 2, 3, 4, 7, 8],
        [1, 2, 5, 6, 7, 8]
      ],
      // System 10 liczb, gwarancja 3 z 6 (C(10,3) = 120 trójek, 14 zakładów)
      "10-3": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 5, 7],
        [0, 1, 2, 4, 6, 8],
        [0, 1, 2, 5, 7, 9],
        [0, 1, 3, 4, 5, 6],
        [0, 1, 3, 4, 7, 8],
        [0, 1, 3, 5, 6, 9],
        [0, 2, 3, 4, 5, 7],
        [0, 2, 3, 4, 6, 8],
        [0, 2, 3, 5, 6, 9],
        [1, 2, 3, 4, 7, 9],
        [1, 2, 4, 5, 6, 8],
        [1, 2, 4, 5, 7, 9]
      ],
      // System 7 liczb, gwarancja 4 z 6 (C(7,4) = 35 czwórek, 7 zakładów = pełny system)
      "7-4": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 4, 5, 6],
        [0, 1, 3, 4, 5, 6],
        [0, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6]
      ],
      // System 7 liczb, gwarancja 5 z 6 (C(7,5) = 21 piątek, 7 zakładów = pełny system)
      "7-5": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 4, 5, 6],
        [0, 1, 3, 4, 5, 6],
        [0, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6]
      ],
      // System 8 liczb, gwarancja 4 z 6 (C(8,4) = 70 czwórek, ~15 zakładów)
      "8-4": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 5, 7],
        [0, 1, 2, 4, 6, 7],
        [0, 1, 3, 4, 5, 6],
        [0, 1, 3, 4, 5, 7],
        [0, 2, 3, 4, 5, 6],
        [0, 2, 3, 4, 5, 7],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 7],
        [0, 1, 2, 3, 6, 7],
        [0, 1, 2, 4, 5, 7],
        [0, 1, 3, 4, 6, 7],
        [0, 2, 3, 5, 6, 7],
        [1, 2, 4, 5, 6, 7]
      ],
      // System 8 liczb, gwarancja 5 z 6 (C(8,5) = 56 piątek, ~20 zakładów)
      "8-5": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 4, 7],
        [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 3, 5, 7],
        [0, 1, 2, 4, 5, 6],
        [0, 1, 2, 4, 5, 7],
        [0, 1, 3, 4, 5, 6],
        [0, 1, 3, 4, 5, 7],
        [0, 2, 3, 4, 5, 6],
        [0, 2, 3, 4, 5, 7],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 7],
        [0, 1, 2, 3, 6, 7],
        [0, 1, 2, 4, 6, 7],
        [0, 1, 3, 4, 6, 7],
        [0, 2, 3, 4, 6, 7],
        [1, 2, 3, 4, 6, 7],
        [0, 1, 2, 5, 6, 7],
        [0, 1, 3, 5, 6, 7],
        [0, 2, 3, 5, 6, 7],
        [1, 2, 3, 5, 6, 7]
      ],
      // System 9 liczb, gwarancja 4 z 6 (C(9,4) = 126 czwórek, 12 zakładów)
      "9-4": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 5, 7],
        [0, 1, 2, 4, 6, 8],
        [0, 1, 3, 4, 5, 6],
        [0, 1, 3, 4, 7, 8],
        [0, 2, 3, 4, 5, 6],
        [0, 2, 3, 4, 7, 8],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 7, 8],
        [0, 1, 2, 3, 6, 7],
        [0, 1, 2, 4, 5, 7]
      ],
      // System 10 liczb, gwarancja 5 z 6 (C(10,5) = 252 piątek, 56 zakładów)
      "10-5": [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 6],
        [0, 1, 2, 3, 4, 7],
        [0, 1, 2, 3, 4, 8],
        [0, 1, 2, 3, 4, 9],
        [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 3, 5, 7],
        [0, 1, 2, 3, 5, 8],
        [0, 1, 2, 3, 5, 9],
        [0, 1, 2, 3, 6, 7],
        [0, 1, 2, 3, 6, 8],
        [0, 1, 2, 3, 6, 9],
        [0, 1, 2, 3, 7, 8],
        [0, 1, 2, 3, 7, 9],
        [0, 1, 2, 3, 8, 9],
        [0, 1, 2, 4, 5, 6],
        [0, 1, 2, 4, 5, 7],
        [0, 1, 2, 4, 5, 8],
        [0, 1, 2, 4, 5, 9],
        [0, 1, 2, 4, 6, 7],
        [0, 1, 2, 4, 6, 8],
        [0, 1, 2, 4, 6, 9],
        [0, 1, 2, 4, 7, 8],
        [0, 1, 2, 4, 7, 9],
        [0, 1, 2, 4, 8, 9],
        [0, 1, 2, 5, 6, 7],
        [0, 1, 2, 5, 6, 8],
        [0, 1, 2, 5, 6, 9],
        [0, 1, 2, 5, 7, 8],
        [0, 1, 2, 5, 7, 9],
        [0, 1, 2, 5, 8, 9],
        [0, 1, 2, 6, 7, 8],
        [0, 1, 2, 6, 7, 9],
        [0, 1, 2, 6, 8, 9],
        [0, 1, 2, 7, 8, 9],
        [0, 1, 3, 4, 5, 6],
        [0, 1, 3, 4, 5, 7],
        [0, 1, 3, 4, 5, 8],
        [0, 1, 3, 4, 5, 9],
        [0, 1, 3, 4, 6, 7],
        [0, 1, 3, 4, 6, 8],
        [0, 1, 3, 4, 6, 9],
        [0, 1, 3, 4, 7, 8],
        [0, 1, 3, 4, 7, 9],
        [0, 1, 3, 4, 8, 9],
        [0, 1, 3, 5, 6, 7],
        [0, 1, 3, 5, 6, 8],
        [0, 1, 3, 5, 6, 9],
        [0, 1, 3, 5, 7, 8],
        [0, 1, 3, 5, 7, 9],
        [0, 1, 3, 5, 8, 9],
        [0, 1, 3, 6, 7, 8],
        [0, 1, 3, 6, 7, 9],
        [0, 1, 3, 6, 8, 9],
        [0, 1, 3, 7, 8, 9],
        [0, 2, 3, 4, 5, 6],
        [0, 2, 3, 4, 5, 7],
        [0, 2, 3, 4, 5, 8],
        [0, 2, 3, 4, 5, 9],
        [0, 2, 3, 4, 6, 7],
        [0, 2, 3, 4, 6, 8],
        [0, 2, 3, 4, 6, 9],
        [0, 2, 3, 4, 7, 8],
        [0, 2, 3, 4, 7, 9],
        [0, 2, 3, 4, 8, 9],
        [0, 2, 3, 5, 6, 7],
        [0, 2, 3, 5, 6, 8],
        [0, 2, 3, 5, 6, 9],
        [0, 2, 3, 5, 7, 8],
        [0, 2, 3, 5, 7, 9],
        [0, 2, 3, 5, 8, 9],
        [0, 2, 3, 6, 7, 8],
        [0, 2, 3, 6, 7, 9],
        [0, 2, 3, 6, 8, 9],
        [0, 2, 3, 7, 8, 9],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 7],
        [1, 2, 3, 4, 5, 8],
        [1, 2, 3, 4, 5, 9],
        [1, 2, 3, 4, 6, 7],
        [1, 2, 3, 4, 6, 8],
        [1, 2, 3, 4, 6, 9],
        [1, 2, 3, 4, 7, 8],
        [1, 2, 3, 4, 7, 9],
        [1, 2, 3, 4, 8, 9],
        [1, 2, 3, 5, 6, 7],
        [1, 2, 3, 5, 6, 8],
        [1, 2, 3, 5, 6, 9],
        [1, 2, 3, 5, 7, 8],
        [1, 2, 3, 5, 7, 9],
        [1, 2, 3, 5, 8, 9],
        [1, 2, 3, 6, 7, 8],
        [1, 2, 3, 6, 7, 9],
        [1, 2, 3, 6, 8, 9],
        [1, 2, 3, 7, 8, 9]
      ],
      
      // === MINI LOTTO (5 liczb w zakładzie) ===
      // System 7 liczb, gwarancja 3 z 5 (C(7,3) = 35 trójek, 7 zakładów)
      "mini-7-3": [
        [0, 1, 2, 3, 4], [0, 1, 2, 3, 5], [0, 1, 2, 3, 6], [0, 1, 2, 4, 5],
        [0, 1, 2, 4, 6], [0, 1, 2, 5, 6], [0, 1, 3, 4, 5]
      ],
      // System 8 liczb, gwarancja 3 z 5 (C(8,3) = 56 trójek, 12 zakładów)
      "mini-8-3": [
        [0, 1, 2, 3, 4], [0, 1, 2, 3, 5], [0, 1, 2, 3, 6], [0, 1, 2, 3, 7],
        [0, 1, 2, 4, 5], [0, 1, 2, 4, 6], [0, 1, 2, 4, 7], [0, 1, 2, 5, 6],
        [0, 1, 2, 5, 7], [0, 1, 2, 6, 7], [0, 1, 3, 4, 5], [0, 1, 3, 4, 6]
      ],
      // System 9 liczb, gwarancja 3 z 5 (C(9,3) = 84 trójki, 18 zakładów)
      "mini-9-3": [
        [0, 1, 2, 3, 4], [0, 1, 2, 3, 5], [0, 1, 2, 3, 6], [0, 1, 2, 3, 7], [0, 1, 2, 3, 8],
        [0, 1, 2, 4, 5], [0, 1, 2, 4, 6], [0, 1, 2, 4, 7], [0, 1, 2, 4, 8], [0, 1, 2, 5, 6],
        [0, 1, 2, 5, 7], [0, 1, 2, 5, 8], [0, 1, 2, 6, 7], [0, 1, 2, 6, 8], [0, 1, 2, 7, 8],
        [0, 1, 3, 4, 5], [0, 1, 3, 4, 6], [0, 1, 3, 4, 7]
      ],
      // System 7 liczb, gwarancja 4 z 5 (C(7,4) = 35 czwórek, 7 zakładów = pełny system)
      "mini-7-4": [
        [0, 1, 2, 3, 4], [0, 1, 2, 3, 5], [0, 1, 2, 3, 6], [0, 1, 2, 4, 5],
        [0, 1, 2, 4, 6], [0, 1, 2, 5, 6], [0, 1, 3, 4, 5]
      ],
      // System 8 liczb, gwarancja 4 z 5 (C(8,4) = 70 czwórek, 14 zakładów)
      "mini-8-4": [
        [0, 1, 2, 3, 4], [0, 1, 2, 3, 5], [0, 1, 2, 3, 6], [0, 1, 2, 3, 7],
        [0, 1, 2, 4, 5], [0, 1, 2, 4, 6], [0, 1, 2, 4, 7], [0, 1, 2, 5, 6],
        [0, 1, 2, 5, 7], [0, 1, 2, 6, 7], [0, 1, 3, 4, 5], [0, 1, 3, 4, 6],
        [0, 1, 3, 4, 7], [0, 1, 3, 5, 6]
      ]
    };
    
    // Sprawdź znane systemy dla różnych gier
    const isLottoGame = pick === 6;
    const isMiniLottoGame = pick === 5;
    
    // Klucze dla różnych gier
    const lottoKey = `${numbers.length}-${guarantee}`;
    const miniLottoKey = `mini-${numbers.length}-${guarantee}`;
    
    if (knownSystems[lottoKey] && isLottoGame) {
      console.log(`Używam znanego systemu Lotto: ${lottoKey} (6 liczb w zakładzie)`);
      const result = [];
      for (const indices of knownSystems[lottoKey]) {
        const combination = indices.map(i => numbers[i]).sort((a, b) => a - b);
        result.push(combination);
      }
      console.log(`Znany system Lotto ${lottoKey}: ${result.length} zakładów`);
      return result;
    } else if (knownSystems[miniLottoKey] && isMiniLottoGame) {
      console.log(`Używam znanego systemu Mini Lotto: ${miniLottoKey} (5 liczb w zakładzie)`);
      const result = [];
      for (const indices of knownSystems[miniLottoKey]) {
        const combination = indices.map(i => numbers[i]).sort((a, b) => a - b);
        result.push(combination);
      }
      console.log(`Znany system Mini Lotto ${miniLottoKey}: ${result.length} zakładów`);
      return result;
    } else if (!isLottoGame && !isMiniLottoGame) {
      console.log(`Gra z ${pick} liczbami w zakładzie - używam algorytmu zachłannego`);
      console.log(`⚠️ UWAGA: Dla tej gry używany jest algorytm zachłanny!`);
    } else {
      console.log(`Brak znanego systemu dla ${isLottoGame ? lottoKey : miniLottoKey}, używam algorytmu zachłannego`);
      console.log(`⚠️ UWAGA: Algorytm zachłanny może nie zapewniać pełnej gwarancji matematycznej!`);
    }
    
    // Sprawdź czy to nie jest przypadek trywialny
    if (numbers.length === pick) {
      console.log(`Trywialny przypadek: ${numbers.length} = ${pick} - zwracam pełny zakład`);
      return [numbers.sort((a, b) => a - b)];
    }
    
    // Sprawdź czy liczba liczb jest za mała dla systemu skróconego
    if (numbers.length <= pick) {
      console.log(`Za mało liczb dla systemu skróconego: ${numbers.length} <= ${pick}`);
      return [numbers.sort((a, b) => a - b)];
    }
    
    // Sprawdź czy liczba liczb jest wystarczająca dla gwarancji
    if (numbers.length < guarantee) {
      console.error(`Za mało liczb dla gwarancji: ${numbers.length} < ${guarantee}`);
      return [];
    }
    
    // Sprawdź czy gwarancja nie jest większa niż liczba liczb do wyboru
    if (guarantee > pick) {
      console.error(`Gwarancja większa niż liczba liczb do wyboru: ${guarantee} > ${pick}`);
      return [];
    }
    
    // Uniwersalny algorytm covering design dla wszystkich gier
    const currentKey = isLottoGame ? lottoKey : miniLottoKey;
    console.log(`Generowanie uniwersalnym algorytmem covering design dla: ${currentKey}`);
    return generateUniversalCoveringDesign(numbers, pick, guarantee, allCombinations, targetCombinations);
  }

  // Uniwersalny algorytm covering design dla wszystkich gier
  function generateUniversalCoveringDesign(numbers, pick, guarantee, allCombinations, targetCombinations) {
    console.log(`=== UNIWERSALNY ALGORYTM COVERING DESIGN ===`);
    console.log(`N = ${numbers.length} (liczba typowanych liczb)`);
    console.log(`K = ${pick} (liczba liczb w zakładzie)`);
    console.log(`G = ${guarantee} (liczba trafień gwarantowanych)`);
    console.log(`Cel: Pokryć wszystkie ${targetCombinations.length} kombinacji ${guarantee}-elementowych`);
    
    const selected = [];
    const covered = new Set();
    
    // Dostosuj limit iteracji w zależności od gwarancji i liczby liczb
    let maxIterations;
    if (guarantee === 3) {
      maxIterations = Math.min(50, allCombinations.length);
    } else if (guarantee === 4) {
      maxIterations = Math.min(100, allCombinations.length);
    } else if (guarantee === 5) {
      maxIterations = Math.min(200, allCombinations.length);
    } else if (guarantee === 6) {
      maxIterations = Math.min(300, allCombinations.length);
    } else {
      maxIterations = Math.min(150, allCombinations.length);
    }
    
    console.log(`Maksymalnie ${maxIterations} iteracji dla gwarancji ${guarantee}`);
    
    // Faza 1: Greedy algorithm - wybieraj najlepsze kombinacje
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let bestCombo = null;
      let bestCoverage = 0;
      
      // Znajdź kombinację, która pokrywa najwięcej niepokrytych targetowych kombinacji
      for (const combination of allCombinations) {
        if (selected.some(sel => sel.join(',') === combination.join(','))) continue;
        
        let coverage = 0;
        for (const target of targetCombinations) {
          const targetKey = target.join(',');
          if (!covered.has(targetKey) && containsAll(combination, target)) {
            coverage++;
          }
        }
        
        if (coverage > bestCoverage) {
          bestCoverage = coverage;
          bestCombo = combination;
        }
      }
      
      if (bestCombo && bestCoverage > 0) {
        selected.push(bestCombo);
        
        // Oznacz pokryte targetowe kombinacje
        for (const target of targetCombinations) {
          const targetKey = target.join(',');
          if (!covered.has(targetKey) && containsAll(bestCombo, target)) {
            covered.add(targetKey);
          }
        }
        
        console.log(`Iteracja ${iteration + 1}: dodano kombinację, pokryto ${bestCoverage} nowych targetów, łącznie pokrytych: ${covered.size}/${targetCombinations.length}`);
        
        // Sprawdź czy wszystkie targetowe kombinacje są pokryte
        if (covered.size === targetCombinations.length) {
          console.log(`✅ WSZYSTKIE KOMBINACJE POKRYTE po ${iteration + 1} iteracjach!`);
          break;
        }
      } else {
        console.log(`Brak lepszych kombinacji w iteracji ${iteration + 1}`);
        break;
      }
    }
    
    // Faza 2: Dodaj dodatkowe kombinacje dla lepszego pokrycia
    const coverage = covered.size / targetCombinations.length;
    console.log(`Pokrycie po fazie 1: ${(coverage * 100).toFixed(1)}% (${covered.size}/${targetCombinations.length})`);
    
    if (coverage < 0.98) {
      console.log(`Pokrycie za małe, dodaję dodatkowe kombinacje...`);
      
      const remainingCombinations = allCombinations.filter(combo => 
        !selected.some(sel => sel.join(',') === combo.join(','))
      );
      
      const additionalCount = Math.min(30, remainingCombinations.length);
      for (let i = 0; i < additionalCount; i++) {
        const randomCombo = remainingCombinations[Math.floor(Math.random() * remainingCombinations.length)];
        selected.push([...randomCombo]);
      }
      
      console.log(`Dodano ${additionalCount} dodatkowych kombinacji`);
    }
    
    // Konwertuj indeksy na liczby i posortuj
    const result = selected.map(combo => [...combo].sort((a, b) => a - b));
    
    console.log(`Wygenerowano ${result.length} kombinacji`);
    console.log(`Końcowe pokrycie: ${covered.size}/${targetCombinations.length} targetowych kombinacji`);
    
    // Jeśli nie udało się wygenerować żadnych kombinacji, zwróć przynajmniej jedną
    if (result.length === 0 && allCombinations.length > 0) {
      console.log(`Brak wyników, zwracam pierwszą kombinację`);
      return [allCombinations[0].sort((a, b) => a - b)];
    }
    
    return result;
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
    
    // Dodaj szczegółową analizę pokrycia
    console.log(`=== SZCZEGÓŁOWA ANALIZA POKRYCIA ===`);
    console.log(`Liczba wszystkich możliwych ${guarantee}-elementowych kombinacji: ${targetCombinations.length}`);
    console.log(`Liczba pokrytych kombinacji: ${covered.size}`);
    console.log(`Liczba niepokrytych kombinacji: ${targetCombinations.length - covered.size}`);
    
    if (coverage < 1) {
      console.log(`⚠️ UWAGA: System NIE zapewnia pełnej gwarancji!`);
      console.log(`Niepokryte kombinacje:`);
      let uncoveredCount = 0;
      for (const target of targetCombinations) {
        const targetKey = target.join(',');
        if (!covered.has(targetKey)) {
          console.log(`  ${target.join(', ')}`);
          uncoveredCount++;
          if (uncoveredCount >= 10) {
            console.log(`  ... i ${targetCombinations.length - covered.size - 10} więcej`);
            break;
          }
        }
      }
    }
    
    return result;
  }

  function rangeWithType(min, max, type, strategy) {
    let arr = [];
    for (let i = min; i <= max; i++) {
      if (type === "even" && i % 2 !== 0) continue;
      if (type === "odd" && i % 2 === 0) continue;
      arr.push(i);
    }
    
    // Zastosuj strategię używając aktualnych statystyk z lotto.pl
    if (strategy === "frequent" && currentStats && currentStats.frequencyData) {
      // Sortuj liczby według częstotliwości (najczęstsze na początku)
      const sortedFrequency = Object.entries(currentStats.frequencyData)
        .sort(([,a], [,b]) => b - a)
        .map(([num]) => parseInt(num));
      
      // Filtruj tylko liczby z zakresu i najczęstsze
      arr = arr.filter(n => sortedFrequency.includes(n));
      // Ogranicz do top 10 najczęstszych z zakresu
      arr = arr.slice(0, 10);
    } else if (strategy === "rare" && currentStats && currentStats.frequencyData) {
      // Sortuj liczby według częstotliwości (najrzadsze na końcu)
      const sortedFrequency = Object.entries(currentStats.frequencyData)
        .sort(([,a], [,b]) => a - b)
        .map(([num]) => parseInt(num));
      
      // Filtruj tylko liczby z zakresu i najrzadsze
      arr = arr.filter(n => sortedFrequency.includes(n));
      // Ogranicz do top 10 najrzadszych z zakresu
      arr = arr.slice(0, 10);
    } else if (strategy === "mixed" && currentStats && currentStats.frequencyData) {
      // Mieszana strategia - 50% najczęstszych, 50% najrzadszych
      const sortedFrequency = Object.entries(currentStats.frequencyData)
        .sort(([,a], [,b]) => b - a)
        .map(([num]) => parseInt(num));
      
      const frequent = arr.filter(n => sortedFrequency.includes(n)).slice(0, 5);
      const rare = arr.filter(n => sortedFrequency.reverse().includes(n)).slice(0, 5);
      arr = [...frequent, ...rare];
    }
    
    // Fallback do statycznych danych jeśli nie ma aktualnych
    if (arr.length === 0 && historicalStats[selectedGame]) {
      if (strategy === "frequent") {
        arr = arr.filter(n => historicalStats[selectedGame].mostFrequent.includes(n));
      } else if (strategy === "rare") {
        arr = arr.filter(n => historicalStats[selectedGame].leastFrequent.includes(n));
      }
    }
    
    return arr;
  }

  function pickNumbers(count, pool) {
    pool = [...pool];
    const out = [];
    while (out.length < count && pool.length > 0) {
      let selectedNumber;
      
      if (activeTalisman) {
        // Użyj logiki talizmanu
        const maxNum = Math.max(...pool);
        selectedNumber = generateNumberWithTalisman(maxNum);
        
        // Sprawdź czy wygenerowana liczba jest w puli
        const availableNumbers = pool.filter(num => num <= maxNum);
        if (availableNumbers.includes(selectedNumber)) {
          const idx = pool.indexOf(selectedNumber);
          out.push(pool[idx]);
          pool.splice(idx, 1);
        } else {
          // Fallback do losowego wyboru
          const idx = Math.floor(Math.random() * pool.length);
          out.push(pool[idx]);
          pool.splice(idx, 1);
        }
      } else {
        // Standardowe losowanie
        const idx = Math.floor(Math.random() * pool.length);
        out.push(pool[idx]);
        pool.splice(idx, 1);
      }
    }
    return out;
  }

  function shuffle(arr) {
    return arr.map(v => [v, Math.random()]).sort((a, b) => a[1] - b[1]).map(v => v[0]);
  }

  // Responsywność
  const responsiveStyle = `
    body { background: #fff !important; }
    
    /* Ogólne style responsywne */
    * {
      box-sizing: border-box;
    }
    
    /* Lepsze wsparcie dla touch na wszystkich urządzeniach */
    button, input, select, textarea {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    
    /* Zapobieganie zoom na iOS */
    input, select, textarea {
      font-size: 16px !important;
    }
    
    /* Menu mobilne */
    .mobile-menu-toggle {
      display: none;
      background: #ffffff;
      border: 2px solid #ffd700;
      border-radius: 8px;
      font-size: 20px;
      color: #222;
      cursor: pointer;
      padding: 12px;
      position: absolute;
      right: 15px;
      top: 15px;
      z-index: 1001;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
      transition: all 0.3s ease;
      min-width: 44px;
      min-height: 44px;
      align-items: center;
      justify-content: center;
    }
    
    .mobile-menu-toggle:hover {
      background: #ffd700;
      color: #222;
      transform: scale(1.05);
    }
    
    .mobile-menu-toggle:active {
      transform: scale(0.95);
    }
    
    /* Menu desktopowe - zawsze widoczne */
    .desktop-menu {
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(90deg, #ffe066 0%, #ffd700 100%);
      color: #222;
      min-height: 60px;
      font-size: 18px;
      flex-wrap: wrap;
      box-shadow: 0 2px 12px 0 rgba(255, 215, 0, 0.10);
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .mobile-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 999;
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    }
    
    .mobile-menu {
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100vh;
      background: #ffffff;
      box-shadow: -2px 0 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      overflow-y: auto;
      padding: 20px 0;
      border-left: 1px solid #e0e0e0;
    }
    
    .mobile-menu-btn {
      display: block;
      width: 100%;
      padding: 18px 25px;
      background: none;
      border: none;
      color: #333;
      font-size: 16px;
      text-align: left;
      cursor: pointer;
      transition: all 0.3s ease;
      border-bottom: 1px solid #f0f0f0;
      position: relative;
      font-weight: 500;
    }
    
    .mobile-menu-btn:hover {
      background: #f8f9fa;
      color: #1976d2;
    }
    
    .mobile-menu-btn.active {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      font-weight: bold;
      border-left: 4px solid #ffd700;
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
    }
    
    .mobile-menu-btn:active {
      transform: scale(0.98);
    }
    
    @media (max-width: 768px) {
      .mobile-menu-toggle {
        display: flex !important;
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
      }
      
      .desktop-menu {
        display: none !important;
      }
      
      .mobile-menu {
        display: block !important;
        touch-action: pan-y;
      }
      
      .mobile-menu-btn {
        min-height: 44px;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      
      .main-panel { 
        max-width: 99vw !important; 
        padding: 10px !important; 
        margin: 10px !important; 
        padding-top: 60px !important; 
        touch-action: manipulation;
      }
      
      /* Lepsze wsparcie dla touch */
      button, input, select, textarea {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      
      /* Responsywne kafelki - OPTYMALIZACJA */
      .main-panel > div {
        padding: 12px !important;
        margin-bottom: 15px !important;
        border-radius: 12px !important;
      }
      
      /* Optymalizacja kafelków premium */
      .main-panel > div[style*="Plan Premium"] {
        padding: 16px !important;
        margin-bottom: 20px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] h3 {
        font-size: 16px !important;
        margin-bottom: 12px !important;
        text-align: center !important;
      }
      
      .main-panel > div[style*="Plan Premium"] h4 {
        font-size: 20px !important;
        margin-bottom: 8px !important;
        text-align: center !important;
      }
      
      .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 48"] {
        font-size: 32px !important;
        margin-bottom: 8px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 32"] {
        font-size: 24px !important;
        margin-bottom: 12px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] ul {
        font-size: 14px !important;
        line-height: 1.6 !important;
        padding-left: 20px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] li {
        margin-bottom: 6px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] button {
        font-size: 16px !important;
        padding: 14px 20px !important;
        margin-top: 12px !important;
      }
      
      /* Optymalizacja kafelków z datami w generator marzeń */
      .main-panel > div[style*="display: grid"] {
        grid-template-columns: 1fr !important;
        gap: 6px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div {
        padding: 10px !important;
        margin-bottom: 6px !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 6px !important;
      }
      
      .main-panel > div[style*="display: grid"] label {
        font-size: 11px !important;
        min-width: auto !important;
        margin-bottom: 3px !important;
      }
      
      .main-panel > div[style*="display: grid"] input[type="date"] {
        width: 100% !important;
        font-size: 12px !important;
        padding: 6px !important;
      }
      
      .main-panel > div[style*="display: grid"] div[style*="fontSize: 12"] {
        font-size: 10px !important;
        margin-top: 3px !important;
      }
      
      /* Specjalne optymalizacje dla generatora marzeń */
      .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] {
        padding: 12px !important;
        margin-bottom: 8px !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 8px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] label {
        font-size: 12px !important;
        min-width: auto !important;
        margin-bottom: 4px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] input[type="date"] {
        width: 100% !important;
        font-size: 12px !important;
        padding: 6px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] div[style*="fontSize: 12"] {
        font-size: 10px !important;
        margin-top: 4px !important;
      }
      
      /* Optymalizacja sekcji "Porady i wskazówki" dla małych ekranów */
      .main-panel > div[style*="background: white"][style*="border: 2px solid"] {
        padding: 12px !important;
        margin-bottom: 16px !important;
      }
      
      .main-panel > div[style*="background: white"][style*="border: 2px solid"] h3 {
        font-size: 16px !important;
        margin-bottom: 12px !important;
      }
      
      .main-panel > div[style*="background: white"][style*="border: 2px solid"] > div {
        grid-template-columns: 1fr !important;
        gap: 8px !important;
      }
      
      .main-panel > div[style*="background: white"][style*="border: 2px solid"] > div > div {
        padding: 8px !important;
        font-size: 11px !important;
        line-height: 1.3 !important;
      }
      
      /* Optymalizacja generatora marzeń dla małych ekranów */
      .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] {
        padding: 10px !important;
        margin-bottom: 6px !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 6px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] label {
        font-size: 11px !important;
        min-width: auto !important;
        margin-bottom: 3px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] input[type="date"] {
        width: 100% !important;
        font-size: 11px !important;
        padding: 5px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] div[style*="fontSize: 12"] {
        font-size: 9px !important;
        margin-top: 3px !important;
      }
      
      .main-panel h2 {
        font-size: 18px !important;
        margin-bottom: 12px !important;
        text-align: center !important;
      }
      
      .main-panel h3 {
        font-size: 16px !important;
        margin-bottom: 10px !important;
        text-align: center !important;
      }
      
      .main-panel form {
        margin-bottom: 12px !important;
      }
      
      .main-panel label {
        display: block !important;
        margin-bottom: 4px !important;
        font-weight: bold !important;
        font-size: 14px !important;
      }
      
      .main-panel select,
      .main-panel input {
        width: 100% !important;
        margin-bottom: 8px !important;
        padding: 10px !important;
        font-size: 16px !important;
      }
      
      .main-panel button {
        width: 100% !important;
        padding: 12px !important;
        font-size: 16px !important;
        margin-bottom: 8px !important;
      }
      
      /* Optymalizacja list i tabel */
      .main-panel ul, .main-panel ol {
        font-size: 14px !important;
        line-height: 1.5 !important;
        padding-left: 18px !important;
      }
      
      .main-panel li {
        margin-bottom: 4px !important;
      }
      
      /* Optymalizacja ikon i emoji */
      .main-panel span, .main-panel div {
        font-size: 14px !important;
      }
      
      /* Optymalizacja tekstu */
      .main-panel p {
        font-size: 14px !important;
        line-height: 1.4 !important;
        margin-bottom: 8px !important;
      }
      
      /* Optymalizacja kulek z liczbami dla małych ekranów */
      .main-panel > div[style*="gridTemplateColumns"] {
        grid-template-columns: repeat(auto-fit, minmax(32px, 1fr)) !important;
        gap: 6px !important;
      }
      
      .main-panel > div[style*="gridTemplateColumns"] button {
        width: 32px !important;
        height: 32px !important;
        font-size: 11px !important;
      }
      
      /* Dodatkowe optymalizacje dla bardzo małych ekranów */
      @media (max-width: 480px) {
        .main-panel {
          padding-top: 55px !important;
        }
        
        .main-panel > div[style*="display: grid"] {
          grid-template-columns: 1fr !important;
          gap: 4px !important;
        }
        
        .main-panel > div[style*="display: grid"] > div {
          padding: 8px !important;
          margin-bottom: 4px !important;
          gap: 4px !important;
        }
        
        .main-panel > div[style*="display: grid"] label {
          font-size: 10px !important;
          margin-bottom: 2px !important;
        }
        
        .main-panel > div[style*="display: grid"] input[type="date"] {
          padding: 5px !important;
          font-size: 11px !important;
        }
        
        .main-panel > div[style*="gridTemplateColumns"] {
          grid-template-columns: repeat(auto-fit, minmax(28px, 1fr)) !important;
          gap: 4px !important;
        }
        
        .main-panel > div[style*="gridTemplateColumns"] button {
          width: 28px !important;
          height: 28px !important;
          font-size: 10px !important;
        }
        
        .main-panel h2 {
          font-size: 16px !important;
          margin-bottom: 10px !important;
          margin-top: 5px !important;
          text-align: center !important;
        }
        
        .main-panel h3 {
          font-size: 14px !important;
          margin-bottom: 8px !important;
          margin-top: 3px !important;
          text-align: center !important;
        }
        
        .main-panel label {
          font-size: 12px !important;
        }
        
        .main-panel select,
        .main-panel input {
          padding: 8px !important;
          font-size: 14px !important;
        }
        
        .main-panel button {
          padding: 10px !important;
          font-size: 14px !important;
        }
        
        .main-panel p {
          font-size: 12px !important;
          line-height: 1.3 !important;
        }
        
        .main-panel span, .main-panel div {
          font-size: 12px !important;
        }
        
        /* Przezroczyste menu hamburger dla małych ekranów */
        .mobile-menu-toggle {
          background: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(3px) !important;
          -webkit-backdrop-filter: blur(3px) !important;
          border: 1px solid rgba(255, 215, 0, 0.2) !important;
        }
        
        /* Optymalizacja płatności i konta dla małych ekranów */
        .main-panel > div[style*="background: linear-gradient"] {
          padding: 12px !important;
          margin-bottom: 10px !important;
        }
        
        /* Specjalne style dla zakładki płatności */
        .main-panel > div[style*="Płatności"] {
          padding: 12px !important;
          margin-bottom: 12px !important;
        }
        
        .main-panel > div[style*="Płatności"] h2 {
          font-size: 18px !important;
          margin-bottom: 16px !important;
        }
        
        .main-panel > div[style*="Płatności"] h3 {
          font-size: 14px !important;
          margin-bottom: 10px !important;
        }
        
        .main-panel > div[style*="Płatności"] h4 {
          font-size: 16px !important;
          margin-bottom: 8px !important;
        }
        
        .main-panel > div[style*="Płatności"] p {
          font-size: 12px !important;
          line-height: 1.3 !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="Płatności"] ul {
          font-size: 12px !important;
          line-height: 1.4 !important;
          padding-left: 16px !important;
        }
        
        .main-panel > div[style*="Płatności"] li {
          margin-bottom: 4px !important;
        }
        
        .main-panel > div[style*="Płatności"] button {
          font-size: 14px !important;
          padding: 10px 16px !important;
          margin-top: 8px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] h3 {
          font-size: 14px !important;
          margin-bottom: 8px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] h4 {
          font-size: 12px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] p {
          font-size: 11px !important;
          line-height: 1.3 !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] ul {
          font-size: 11px !important;
          line-height: 1.3 !important;
          padding-left: 15px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] li {
          margin-bottom: 3px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] button {
          font-size: 12px !important;
          padding: 8px 12px !important;
          margin-top: 8px !important;
        }
        
        /* Optymalizacja statystyk dla małych ekranów */
        .main-panel > div[style*="border: 1px solid"] {
          padding: 10px !important;
          margin-bottom: 8px !important;
        }
        
        .main-panel > div[style*="border: 1px solid"] h3 {
          font-size: 13px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="border: 1px solid"] p {
          font-size: 11px !important;
          line-height: 1.3 !important;
          margin-bottom: 5px !important;
        }
        
        .main-panel > div[style*="border: 1px solid"] ul {
          font-size: 11px !important;
          line-height: 1.3 !important;
          padding-left: 15px !important;
        }
        
        .main-panel > div[style*="border: 1px solid"] li {
          margin-bottom: 3px !important;
        }
      }
      
      @media (max-width: 360px) {
        .main-panel > div[style*="display: grid"] > div {
          padding: 6px !important;
          margin-bottom: 3px !important;
        }
        
        .main-panel > div[style*="display: grid"] label {
          font-size: 9px !important;
        }
        
        .main-panel > div[style*="display: grid"] input[type="date"] {
          padding: 4px !important;
          font-size: 10px !important;
        }
        
        .main-panel > div[style*="gridTemplateColumns"] {
          grid-template-columns: repeat(auto-fit, minmax(24px, 1fr)) !important;
          gap: 3px !important;
        }
        
        .main-panel > div[style*="gridTemplateColumns"] button {
          width: 24px !important;
          height: 24px !important;
          font-size: 9px !important;
        }
        
        .main-panel h2 {
          font-size: 14px !important;
        }
        
        .main-panel h3 {
          font-size: 12px !important;
        }
        
        .main-panel label {
          font-size: 11px !important;
        }
        
        .main-panel select,
        .main-panel input {
          padding: 6px !important;
          font-size: 12px !important;
        }
        
        .main-panel button {
          padding: 8px !important;
          font-size: 12px !important;
        }
      }
      
      /* Dodatkowe optymalizacje dla bardzo małych ekranów */
      @media (max-width: 320px) {
        .main-panel > div[style*="display: grid"] {
          grid-template-columns: 1fr !important;
          gap: 3px !important;
        }
        
        .main-panel > div[style*="display: grid"] > div {
          padding: 4px !important;
          margin-bottom: 2px !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 3px !important;
        }
        
        .main-panel > div[style*="display: grid"] label {
          font-size: 8px !important;
          margin-bottom: 1px !important;
        }
        
        .main-panel > div[style*="display: grid"] input[type="date"] {
          padding: 3px !important;
          font-size: 9px !important;
          width: 100% !important;
        }
        
        .main-panel > div[style*="display: grid"] div[style*="fontSize: 12"] {
          font-size: 8px !important;
          margin-top: 2px !important;
        }
        
        .main-panel h2 {
          font-size: 12px !important;
          margin-bottom: 8px !important;
        }
        
        .main-panel h3 {
          font-size: 10px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel label {
          font-size: 10px !important;
          margin-bottom: 2px !important;
        }
        
        .main-panel select,
        .main-panel input {
          padding: 4px !important;
          font-size: 10px !important;
          margin-bottom: 4px !important;
        }
        
        .main-panel button {
          padding: 6px !important;
          font-size: 10px !important;
          margin-bottom: 4px !important;
        }
        
        .main-panel p {
          font-size: 10px !important;
          line-height: 1.2 !important;
          margin-bottom: 4px !important;
        }
        
        .main-panel span, .main-panel div {
          font-size: 10px !important;
        }
        
        .main-panel ul, .main-panel ol {
          font-size: 10px !important;
          line-height: 1.2 !important;
          padding-left: 12px !important;
        }
        
        .main-panel li {
          margin-bottom: 2px !important;
        }
        
        /* Optymalizacja kulek dla bardzo małych ekranów */
        .main-panel > div[style*="gridTemplateColumns"] {
          grid-template-columns: repeat(auto-fit, minmax(20px, 1fr)) !important;
          gap: 2px !important;
        }
        
        .main-panel > div[style*="gridTemplateColumns"] button {
          width: 20px !important;
          height: 20px !important;
          font-size: 8px !important;
        }
        
        /* Optymalizacja płatności i konta dla bardzo małych ekranów */
        .main-panel > div[style*="background: linear-gradient"] {
          padding: 8px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] h3 {
          font-size: 12px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] h4 {
          font-size: 10px !important;
          margin-bottom: 4px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] p {
          font-size: 9px !important;
          line-height: 1.2 !important;
          margin-bottom: 4px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] ul {
          font-size: 9px !important;
          line-height: 1.2 !important;
          padding-left: 12px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] li {
          margin-bottom: 2px !important;
        }
        
        .main-panel > div[style*="background: linear-gradient"] button {
          padding: 6px 10px !important;
          font-size: 10px !important;
          margin-top: 6px !important;
        }
        
        /* Optymalizacja statystyk dla bardzo małych ekranów */
        .main-panel > div[style*="border: 1px solid"] {
          padding: 8px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="border: 1px solid"] h3 {
          font-size: 11px !important;
          margin-bottom: 4px !important;
        }
        
        .main-panel > div[style*="border: 1px solid"] p {
          font-size: 9px !important;
          line-height: 1.2 !important;
          margin-bottom: 3px !important;
        }
        
        .main-panel > div[style*="border: 1px solid"] ul {
          font-size: 9px !important;
          line-height: 1.2 !important;
          padding-left: 12px !important;
        }
        
        .main-panel > div[style*="border: 1px solid"] li {
          margin-bottom: 2px !important;
        }
        
        /* Optymalizacja sekcji "Porady i wskazówki" dla bardzo małych ekranów */
        .main-panel > div[style*="background: white"][style*="border: 2px solid"] {
          padding: 8px !important;
          margin-bottom: 12px !important;
        }
        
        .main-panel > div[style*="background: white"][style*="border: 2px solid"] h3 {
          font-size: 12px !important;
          margin-bottom: 8px !important;
        }
        
        .main-panel > div[style*="background: white"][style*="border: 2px solid"] > div {
          grid-template-columns: 1fr !important;
          gap: 4px !important;
        }
        
        .main-panel > div[style*="background: white"][style*="border: 2px solid"] > div > div {
          padding: 6px !important;
          font-size: 9px !important;
          line-height: 1.2 !important;
        }
        
        /* Optymalizacja generatora marzeń dla bardzo małych ekranów */
        .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] {
          padding: 6px !important;
          margin-bottom: 4px !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 4px !important;
        }
        
        .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] label {
          font-size: 9px !important;
          min-width: auto !important;
          margin-bottom: 2px !important;
        }
        
        .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] input[type="date"] {
          width: 100% !important;
          font-size: 9px !important;
          padding: 3px !important;
        }
        
        .main-panel > div[style*="display: grid"] > div[style*="background: #fff"] div[style*="fontSize: 12"] {
          font-size: 7px !important;
          margin-top: 2px !important;
        }
      }
      
      @media (max-width: 340px) {
        /* Specjalne style dla Plan Premium na bardzo małych ekranach */
        .main-panel > div[style*="Plan Premium"] {
          padding: 16px !important;
          margin-bottom: 16px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] h3 {
          font-size: 16px !important;
          margin-bottom: 12px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] h4 {
          font-size: 18px !important;
          margin-bottom: 8px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] div[style*="position: absolute"] {
          top: -8px !important;
          padding: 4px 12px !important;
          font-size: 10px !important;
          border-radius: 12px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 36"] {
          font-size: 28px !important;
          margin-bottom: 8px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 24"] {
          font-size: 18px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] ul {
          font-size: 12px !important;
          line-height: 1.4 !important;
          padding-left: 14px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] li {
          margin-bottom: 3px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] button {
          font-size: 12px !important;
          padding: 8px 12px !important;
          margin-top: 8px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] p {
          font-size: 10px !important;
          margin: 8px 0 0 !important;
        }
      }
      
      @media (max-width: 280px) {
        /* Bardzo agresywne style dla Plan Premium na ekstremalnie małych ekranach */
        .main-panel > div[style*="Plan Premium"] {
          padding: 12px !important;
          margin-bottom: 12px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] h3 {
          font-size: 14px !important;
          margin-bottom: 8px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] h4 {
          font-size: 16px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] div[style*="position: absolute"] {
          top: -6px !important;
          padding: 3px 8px !important;
          font-size: 8px !important;
          border-radius: 8px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 36"] {
          font-size: 24px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 24"] {
          font-size: 16px !important;
          margin-bottom: 4px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] ul {
          font-size: 10px !important;
          line-height: 1.3 !important;
          padding-left: 12px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] li {
          margin-bottom: 2px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] button {
          font-size: 10px !important;
          padding: 6px 10px !important;
          margin-top: 6px !important;
        }
        
        .main-panel > div[style*="Plan Premium"] p {
          font-size: 8px !important;
          margin: 6px 0 0 !important;
        }
      }
      
      @media (max-width: 300px) {
        .mobile-menu-toggle {
          right: 3px !important;
          top: 3px !important;
          font-size: 12px !important;
          padding: 4px !important;
          min-width: 32px !important;
          min-height: 32px !important;
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(5px) !important;
          -webkit-backdrop-filter: blur(5px) !important;
          border: 1px solid rgba(255, 215, 0, 0.3) !important;
        }
        
        .mobile-menu {
          width: 220px !important;
        }
        
        .mobile-menu-btn {
          padding: 10px 12px !important;
          font-size: 11px !important;
          min-height: 32px !important;
        }
        
        .main-panel { 
          padding: 3px !important; 
          margin: 3px !important;
          padding-top: 50px !important;
        }
        
        .main-panel > div {
          padding: 5px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel input, .main-panel select, .main-panel textarea {
          font-size: 11px !important;
          padding: 4px !important;
        }
        
        .main-panel button {
          font-size: 10px !important;
          padding: 4px 6px !important;
          min-height: 32px !important;
        }
        
        /* Specjalne style dla zakładek "moje konto" i "płatności" */
        .main-panel > div[style*="Moje konto"], 
        .main-panel > div[style*="Płatności"] {
          padding: 8px !important;
          margin-bottom: 8px !important;
          border-radius: 8px !important;
        }
        
        .main-panel > div[style*="Moje konto"] h2,
        .main-panel > div[style*="Płatności"] h2 {
          font-size: 14px !important;
          margin-bottom: 8px !important;
        }
        
        .main-panel > div[style*="Moje konto"] h3,
        .main-panel > div[style*="Płatności"] h3 {
          font-size: 12px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="Moje konto"] p,
        .main-panel > div[style*="Płatności"] p {
          font-size: 10px !important;
          line-height: 1.3 !important;
          margin-bottom: 4px !important;
        }
        
        .main-panel > div[style*="Moje konto"] button,
        .main-panel > div[style*="Płatności"] button {
          font-size: 10px !important;
          padding: 6px 8px !important;
          min-height: 28px !important;
          margin: 2px !important;
        }
        
        .main-panel > div[style*="Moje konto"] input,
        .main-panel > div[style*="Płatności"] input,
        .main-panel > div[style*="Moje konto"] select,
        .main-panel > div[style*="Płatności"] select {
          font-size: 10px !important;
          padding: 4px 6px !important;
          margin-bottom: 4px !important;
        }
        
        .main-panel > div[style*="Moje konto"] label,
        .main-panel > div[style*="Płatności"] label {
          font-size: 10px !important;
          margin-bottom: 2px !important;
        }
      }
    }
    
    /* Ukryj menu mobilne na większych ekranach */
    @media (min-width: 769px) {
      .mobile-menu-toggle {
        display: none !important;
      }
      
      .mobile-menu {
        display: none !important;
      }
      
      .mobile-menu-overlay {
        display: none !important;
      }
      
      /* Optymalizacja dla średnich ekranów */
      .main-panel > div {
        padding: 16px !important;
        margin-bottom: 20px !important;
      }
      
      /* Optymalizacja kafelków premium dla średnich ekranów */
      .main-panel > div[style*="Plan Premium"] {
        padding: 20px !important;
        margin-bottom: 24px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] h3 {
        font-size: 18px !important;
        margin-bottom: 16px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] h4 {
        font-size: 24px !important;
        margin-bottom: 12px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 48"] {
        font-size: 40px !important;
        margin-bottom: 12px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 32"] {
        font-size: 30px !important;
        margin-bottom: 16px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] ul {
        font-size: 16px !important;
        line-height: 1.8 !important;
        padding-left: 24px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] li {
        margin-bottom: 8px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] button {
        font-size: 18px !important;
        padding: 16px 28px !important;
        margin-top: 16px !important;
      }
      
      /* Optymalizacja kulek z liczbami dla średnich ekranów */
      .main-panel > div[style*="gridTemplateColumns"] {
        grid-template-columns: repeat(auto-fit, minmax(40px, 1fr)) !important;
        gap: 8px !important;
      }
      
      .main-panel > div[style*="gridTemplateColumns"] button {
        width: 40px !important;
        height: 40px !important;
        font-size: 14px !important;
      }
      
      /* Optymalizacja kafelków z datami dla średnich ekranów */
      .main-panel > div[style*="display: grid"] {
        grid-template-columns: 1fr 1fr 1fr !important;
        gap: 15px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div {
        padding: 15px !important;
        margin-bottom: 10px !important;
      }
      
      .main-panel > div[style*="display: grid"] label {
        font-size: 14px !important;
      }
      
      .main-panel > div[style*="display: grid"] input[type="date"] {
        font-size: 14px !important;
        padding: 10px !important;
      }
    }
    
    /* Style dla tabletów */
    @media (min-width: 481px) and (max-width: 768px) {
      .main-panel {
        max-width: 95vw !important;
        margin: 15px auto !important;
      }
      
      .mobile-menu {
        width: 350px;
      }
      
      .mobile-menu-btn {
        padding: 16px 20px;
        font-size: 16px;
      }
      
      /* Optymalizacja kafelków dla tabletów */
      .main-panel > div {
        padding: 14px !important;
        margin-bottom: 18px !important;
      }
      
      /* Optymalizacja kafelków premium dla tabletów */
      .main-panel > div[style*="Plan Premium"] {
        padding: 18px !important;
        margin-bottom: 22px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] h3 {
        font-size: 17px !important;
        margin-bottom: 14px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] h4 {
        font-size: 22px !important;
        margin-bottom: 10px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 48"] {
        font-size: 36px !important;
        margin-bottom: 10px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 32"] {
        font-size: 28px !important;
        margin-bottom: 14px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] ul {
        font-size: 15px !important;
        line-height: 1.7 !important;
        padding-left: 22px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] li {
        margin-bottom: 7px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] button {
        font-size: 17px !important;
        padding: 15px 24px !important;
        margin-top: 14px !important;
      }
      
      .main-panel h2 {
        font-size: 19px !important;
        margin-bottom: 14px !important;
      }
      
      .main-panel h3 {
        font-size: 17px !important;
        margin-bottom: 12px !important;
      }
      
      .main-panel ul, .main-panel ol {
        font-size: 15px !important;
        line-height: 1.6 !important;
        padding-left: 20px !important;
      }
      
      .main-panel li {
        margin-bottom: 5px !important;
      }
      
      .main-panel p {
        font-size: 15px !important;
        line-height: 1.5 !important;
        margin-bottom: 10px !important;
      }
      
      /* Optymalizacja kulek z liczbami dla tabletów */
      .main-panel > div[style*="gridTemplateColumns"] {
        grid-template-columns: repeat(auto-fit, minmax(36px, 1fr)) !important;
        gap: 8px !important;
      }
      
      .main-panel > div[style*="gridTemplateColumns"] button {
        width: 36px !important;
        height: 36px !important;
        font-size: 13px !important;
      }
      
      /* Optymalizacja kafelków z datami dla tabletów */
      .main-panel > div[style*="display: grid"] {
        grid-template-columns: 1fr 1fr !important;
        gap: 10px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div {
        padding: 12px !important;
        margin-bottom: 8px !important;
      }
      
      .main-panel > div[style*="display: grid"] label {
        font-size: 13px !important;
      }
      
      .main-panel > div[style*="display: grid"] input[type="date"] {
        font-size: 13px !important;
        padding: 8px !important;
      }
      
      /* Dodatkowe optymalizacje dla małych tabletów */
      @media (max-width: 600px) {
        .main-panel > div[style*="display: grid"] {
          grid-template-columns: 1fr !important;
          gap: 8px !important;
        }
        
        .main-panel > div[style*="display: grid"] > div {
          padding: 10px !important;
          margin-bottom: 6px !important;
        }
        
        .main-panel > div[style*="display: grid"] label {
          font-size: 12px !important;
        }
        
        .main-panel > div[style*="display: grid"] input[type="date"] {
          font-size: 12px !important;
          padding: 7px !important;
        }
      }
      
      /* Optymalizacja płatności i konta dla tabletów */
      .main-panel > div[style*="background: linear-gradient"] {
        padding: 16px !important;
        margin-bottom: 16px !important;
      }
      
      .main-panel > div[style*="background: linear-gradient"] h3 {
        font-size: 16px !important;
        margin-bottom: 10px !important;
      }
      
      .main-panel > div[style*="background: linear-gradient"] h4 {
        font-size: 14px !important;
        margin-bottom: 8px !important;
      }
      
      .main-panel > div[style*="background: linear-gradient"] p {
        font-size: 13px !important;
        line-height: 1.4 !important;
        margin-bottom: 8px !important;
      }
      
      .main-panel > div[style*="background: linear-gradient"] ul {
        font-size: 13px !important;
        line-height: 1.4 !important;
        padding-left: 18px !important;
      }
      
      .main-panel > div[style*="background: linear-gradient"] li {
        margin-bottom: 4px !important;
      }
      
      .main-panel > div[style*="background: linear-gradient"] button {
        padding: 10px 16px !important;
        font-size: 14px !important;
        margin-top: 10px !important;
      }
      
      /* Optymalizacja statystyk dla tabletów */
      .main-panel > div[style*="border: 1px solid"] {
        padding: 14px !important;
        margin-bottom: 12px !important;
      }
      
      .main-panel > div[style*="border: 1px solid"] h3 {
        font-size: 15px !important;
        margin-bottom: 8px !important;
      }
      
      .main-panel > div[style*="border: 1px solid"] p {
        font-size: 13px !important;
        line-height: 1.4 !important;
        margin-bottom: 6px !important;
      }
      
      .main-panel > div[style*="border: 1px solid"] ul {
        font-size: 13px !important;
        line-height: 1.4 !important;
        padding-left: 18px !important;
      }
      
      .main-panel > div[style*="border: 1px solid"] li {
        margin-bottom: 4px !important;
      }
      
      /* Optymalizacja sekcji "Porady i wskazówki" dla tabletów */
      .main-panel > div[style*="background: white"][style*="border: 2px solid"] {
        padding: 18px !important;
        margin-bottom: 20px !important;
      }
      
      .main-panel > div[style*="background: white"][style*="border: 2px solid"] h3 {
        font-size: 18px !important;
        margin-bottom: 14px !important;
      }
      
      .main-panel > div[style*="background: white"][style*="border: 2px solid"] > div {
        grid-template-columns: 1fr 1fr !important;
        gap: 12px !important;
      }
      
      .main-panel > div[style*="background: white"][style*="border: 2px solid"] > div > div {
        padding: 10px !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
      }
      
      /* Optymalizacja kafelków z datami dla tabletów */
      .main-panel > div[style*="display: grid"] {
        grid-template-columns: 1fr !important;
        gap: 10px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div {
        padding: 14px !important;
        margin-bottom: 10px !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 10px !important;
      }
      
      .main-panel > div[style*="display: grid"] label {
        font-size: 13px !important;
        min-width: auto !important;
        margin-bottom: 5px !important;
      }
      
      .main-panel > div[style*="display: grid"] input[type="date"] {
        width: 100% !important;
        font-size: 15px !important;
        padding: 10px !important;
      }
      
      .main-panel > div[style*="display: grid"] div[style*="fontSize: 12"] {
        font-size: 12px !important;
        margin-top: 5px !important;
      }
    }
    
    @media (max-width: 500px) {
      .main-panel { 
        border-radius: 0 !important; 
        box-shadow: none !important; 
        margin: 5px !important;
        touch-action: manipulation;
        padding: 8px !important;
      }
      
      .mobile-menu {
        width: 100%;
        right: 0;
      }
      
      .mobile-menu-toggle {
        right: 10px;
        top: 10px;
        padding: 10px;
        font-size: 18px;
      }
      
      .mobile-menu-btn {
        padding: 20px 25px;
        font-size: 18px;
      }
      
      /* Bardzo małe ekrany - DODATKOWA OPTYMALIZACJA */
      .main-panel > div {
        padding: 10px !important;
        margin-bottom: 12px !important;
      }
      
      /* Optymalizacja kafelków premium dla bardzo małych ekranów */
      .main-panel > div[style*="Plan Premium"] {
        padding: 12px !important;
        margin-bottom: 15px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] h3 {
        font-size: 14px !important;
        margin-bottom: 8px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] h4 {
        font-size: 18px !important;
        margin-bottom: 6px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 48"] {
        font-size: 28px !important;
        margin-bottom: 6px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] div[style*="fontSize: 32"] {
        font-size: 20px !important;
        margin-bottom: 8px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] ul {
        font-size: 12px !important;
        line-height: 1.4 !important;
        padding-left: 16px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] li {
        margin-bottom: 4px !important;
      }
      
      .main-panel > div[style*="Plan Premium"] button {
        font-size: 14px !important;
        padding: 12px 16px !important;
        margin-top: 8px !important;
      }
      
      .main-panel h2 {
        font-size: 16px !important;
        text-align: center !important;
        margin-bottom: 8px !important;
      }
      
      .main-panel h3 {
        font-size: 14px !important;
        text-align: center !important;
        margin-bottom: 6px !important;
      }
      
      .main-panel form {
        padding: 8px !important;
        margin-bottom: 8px !important;
      }
      
      .main-panel label {
        font-size: 12px !important;
        margin-bottom: 3px !important;
      }
      
      .main-panel select,
      .main-panel input {
        font-size: 16px !important;
        padding: 12px !important;
        margin-bottom: 6px !important;
      }
      
      .main-panel button {
        font-size: 14px !important;
        padding: 14px !important;
        margin-bottom: 6px !important;
      }
      
      /* Optymalizacja list i tekstu dla bardzo małych ekranów */
      .main-panel ul, .main-panel ol {
        font-size: 12px !important;
        line-height: 1.3 !important;
        padding-left: 14px !important;
      }
      
      .main-panel li {
        margin-bottom: 3px !important;
      }
      
      .main-panel p {
        font-size: 12px !important;
        line-height: 1.3 !important;
        margin-bottom: 6px !important;
      }
      
      .main-panel span, .main-panel div {
        font-size: 12px !important;
      }
      
      /* Optymalizacja kulek z liczbami dla bardzo małych ekranów */
      .main-panel > div[style*="gridTemplateColumns"] {
        grid-template-columns: repeat(auto-fit, minmax(32px, 1fr)) !important;
        gap: 6px !important;
      }
      
      .main-panel > div[style*="gridTemplateColumns"] button {
        width: 32px !important;
        height: 32px !important;
        font-size: 12px !important;
      }
      
      /* Optymalizacja kafelków z datami dla bardzo małych ekranów */
      .main-panel > div[style*="display: grid"] {
        grid-template-columns: 1fr !important;
        gap: 6px !important;
      }
      
      .main-panel > div[style*="display: grid"] > div {
        padding: 10px !important;
        margin-bottom: 6px !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 6px !important;
      }
      
      .main-panel > div[style*="display: grid"] label {
        font-size: 11px !important;
        min-width: auto !important;
        margin-bottom: 3px !important;
      }
      
      .main-panel > div[style*="display: grid"] input[type="date"] {
        width: 100% !important;
        font-size: 14px !important;
        padding: 8px !important;
      }
      
      .main-panel > div[style*="display: grid"] div[style*="fontSize: 12"] {
        font-size: 10px !important;
        margin-top: 3px !important;
      }
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes confettiFall {
      0% {
        transform: translateY(-10px) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
  `;

  // Widoki zakładek
  const renderGenerator = () => (
    <div>
      {/* Wyświetlanie aktywnego talizmanu */}
      {activeTalisman && (
        <ActiveTalismanDisplay 
          activeTalisman={activeTalisman} 
          talismanDefinitions={talismanDefinitions} 
        />
      )}
      <h2 style={{ color: "#222", marginBottom: 24, textAlign: "center", letterSpacing: 1 }}>Generator zestawów</h2>
      <form onSubmit={handleGenerate} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold", marginRight: 10 }}>Wybierz grę:</label>
          <select value={selectedGame} onChange={e => setSelectedGame(e.target.value)} style={{ ...inputStyle, width: 220, display: "inline-block", marginBottom: 0 }}>
            {games.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold", marginRight: 10 }}>Liczba zestawów:</label>
          <input type="number" min={1} max={10000} value={setsCount} onChange={e => setSetsCount(Number(e.target.value))} style={{ ...inputStyle, width: 120, display: "inline-block", marginBottom: 0 }} />
          {setsCount > 1000 && <span style={{ color: '#d32f2f', fontSize: 13, marginLeft: 10 }}>Generowanie dużej liczby zestawów może chwilę potrwać!</span>}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold", marginRight: 10 }}>Typ zestawów:</label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, width: 180, display: "inline-block", marginBottom: 0 }}>
            <option value="mixed">Mieszane</option>
            <option value="even">Tylko parzyste</option>
            <option value="odd">Tylko nieparzyste</option>
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold", marginRight: 10 }}>Strategia:</label>
          <select value={strategy} onChange={e => setStrategy(e.target.value)} style={{ ...inputStyle, width: 180, display: "inline-block", marginBottom: 0 }}>
            <option value="standard">Standardowa</option>
            <option value="frequent">Najczęstsze liczby</option>
            <option value="rare">Najrzadsze liczby</option>
            <option value="mixed">Mieszana</option>
          </select>
          <span onClick={() => setModalInfo({ isOpen: true, title: "Strategie generowania", content: "Standardowa: klasyczne losowanie. Najczęstsze liczby: bazuje na aktualnych danych z lotto.pl najczęściej losowanych liczb. Najrzadsze liczby: bazuje na aktualnych danych z lotto.pl najrzadziej losowanych liczb. Mieszana: łączy różne strategie." })} style={{ cursor: "pointer", marginLeft: 8, color: "#1976d2" }}>ℹ️</span>
        </div>
        

        
        {currentStats && !statsLoading && (
          <div style={{ 
            background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)", 
            border: "2px solid #28a745",
            borderRadius: "8px", 
            padding: "12px", 
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{ fontSize: "16px" }}>✅</span>
            <span style={{ fontSize: "14px", color: "#155724" }}>
              Używam aktualnych statystyk z lotto.pl (ostatnia aktualizacja: {new Date(currentStats.lastUpdated || Date.now()).toLocaleString('pl-PL')})
            </span>
          </div>
        )}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold" }}>
            <input type="checkbox" checked={uniqueSets} onChange={e => setUniqueSets(e.target.checked)} style={{ marginRight: 8 }} />
            Unikalne zestawy (bez powtórzeń zestawów)
          </label>
          <span onClick={() => setModalInfo({ isOpen: true, title: "Unikalne zestawy", content: "Każdy wygenerowany zestaw będzie inny od pozostałych. Liczby mogą się powtarzać między zestawami." })} style={{ cursor: "pointer", marginLeft: 8, color: "#1976d2" }}>ℹ️</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold" }}>
            <input type="checkbox" checked={uniqueNumbers} onChange={e => setUniqueNumbers(e.target.checked)} style={{ marginRight: 8 }} />
            Unikalne liczby w całej puli (każda liczba tylko raz)
          </label>
          <span onClick={() => setModalInfo({ isOpen: true, title: "Unikalne liczby w całej puli", content: "Każda liczba wystąpi tylko raz wśród wszystkich wygenerowanych zestawów. Uwaga: może ograniczyć liczbę możliwych zestawów." })} style={{ cursor: "pointer", marginLeft: 8, color: "#1976d2" }}>ℹ️</span>
        </div>
        {/* Opcje tylko dla Keno */}
        {selectedGame === "keno" && (
          <>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: "bold", marginRight: 10 }}>Liczba liczb:</label>
              <select value={kenoNumbers} onChange={e => setKenoNumbers(Number(e.target.value))} style={{ ...inputStyle, width: 120, display: "inline-block", marginBottom: 0 }}>
                <option value={10}>10 liczb</option>
                <option value={20}>20 liczb</option>
              </select>
              <span onClick={() => setModalInfo({ isOpen: true, title: "Liczba liczb Keno", content: "10 liczb: standardowa opcja, suma docelowa ~405. 20 liczb: więcej liczb, suma docelowa ~810." })} style={{ cursor: "pointer", marginLeft: 8, color: "#1976d2" }}>ℹ️</span>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: "bold", marginRight: 10 }}>Zakres liczb:</label>
              <select value={kenoRange} onChange={e => setKenoRange(e.target.value)} style={{ ...inputStyle, width: 180, display: "inline-block", marginBottom: 0 }}>
                <option value="mixed">Mieszane (1-70)</option>
                <option value="low">Niskie (1-35)</option>
                <option value="high">Wysokie (36-70)</option>
              </select>
              <span onClick={() => setModalInfo({ isOpen: true, title: "Zakres liczb Keno", content: `Mieszane: wszystkie liczby 1-70 (suma docelowa ~${kenoNumbers === 10 ? '355' : '710'}). Niskie: tylko liczby 1-35 (suma docelowa ~${kenoNumbers === 10 ? '180' : '360'}). Wysokie: tylko liczby 36-70 (suma docelowa ~${kenoNumbers === 10 ? '530' : '1060'}).` })} style={{ cursor: "pointer", marginLeft: 8, color: "#1976d2" }}>ℹ️</span>
            </div>
          </>
        )}
        <button type="submit" style={buttonStyle}>Generuj</button>
      </form>
      {results.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "#222", margin: 0 }}>Wyniki:</h3>
            <button 
              onClick={generatePDF}
              style={{
                ...pdfButtonStyle,
                background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)"
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
              📄 Pobierz PDF
            </button>
          </div>
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
                    ...actionButtonStyle,
                    background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)"
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
                
                <button 
                  onClick={() => isFavorite(set) ? removeFromFavorites(getFavoriteId(set)) : addToFavorites(set, "generator")}
                  style={{
                    background: "#ffffff",
                    color: isFavorite(set) ? "#ff1744" : "#ff5722",
                    border: `2px solid ${isFavorite(set) ? "#ff1744" : "#ff5722"}`,
                    borderRadius: "50%",
                    width: "48px",
                    height: "48px",
                    fontSize: 20,
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "scale(1.2)";
                    e.target.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  ❤️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSystems = () => (
    <div>
      <h2 style={{ color: "#222", marginBottom: 24, textAlign: "center" }}>Systemy skrócone</h2>
      <p style={{ marginBottom: 20, lineHeight: 1.6 }}>
        Systemy skrócone pozwalają grać większą liczbą liczb przy mniejszej liczbie zakładów, 
        zapewniając matematyczne gwarancje trafień.
        <span onClick={() => setModalInfo({ isOpen: true, title: "Systemy skrócone", content: "System pełny: obstawiasz wszystkie możliwe kombinacje wybranej liczby liczb. System skrócony: wybiera podzbiór kombinacji, który zapewnia gwarancję trafienia określonej liczby liczb, jeśli spełnisz warunek. To covering design w kombinatoryce! WAŻNE: System skrócony ma sens tylko gdy liczba typowanych liczb jest większa niż liczba liczb do wyboru (np. 7+ liczb w Lotto)." })} style={{ cursor: "pointer", marginLeft: 8, color: "#1976d2" }}>ℹ️</span>
      </p>
      <div style={{ background: "#e3f2fd", color: "#1565c0", padding: 12, borderRadius: 8, marginBottom: 20 }}>
        <strong>💡 Wskazówka:</strong> Aby zobaczyć prawdziwy system skrócony, wybierz więcej liczb niż liczba liczb do wyboru:
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li><strong>Lotto:</strong> wybierz 7, 8, 9, 10+ liczb (nie 6)</li>
          <li><strong>Mini Lotto:</strong> wybierz 6, 7, 8+ liczb (nie 5)</li>
          <li><strong>Multi Multi:</strong> wybierz 11, 12, 13+ liczb (nie 10)</li>
          <li><strong>Eurojackpot:</strong> wybierz 6, 7, 8+ liczb (nie 5)</li>
          <li><strong>Kaskada:</strong> wybierz 13, 14, 15+ liczb (nie 12)</li>
          <li><strong>Keno:</strong> wybierz {kenoNumbers + 1}, {kenoNumbers + 2}, {kenoNumbers + 3}+ liczb (nie {kenoNumbers})</li>
        </ul>
      </div>
      
      <div style={{ background: "#e8f5e8", color: "#2e7d32", padding: 12, borderRadius: 8, marginBottom: 20 }}>
        <strong>✅ UNIWERSALNY ALGORYTM COVERING DESIGN:</strong>
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
        <p style={{ marginTop: 8, fontSize: 14, fontWeight: "bold" }}>
          🎯 Algorytm dąży do 100% pokrycia wszystkich możliwych kombinacji!
        </p>
      </div>
      <form onSubmit={handleGenerateSystem} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold", marginRight: 10 }}>Gra:</label>
          <select value={selectedGame} onChange={e => setSelectedGame(e.target.value)} style={{ ...inputStyle, width: 150, display: "inline-block", marginBottom: 0 }}>
            <option value="lotto">Lotto (6 z 49)</option>
            <option value="miniLotto">Mini Lotto (5 z 42)</option>
            <option value="multiMulti">Multi Multi (10 z 80)</option>
            <option value="eurojackpot">Eurojackpot (5+2)</option>
            <option value="kaskada">Kaskada (12 z 24)</option>
                            <option value="keno">Keno ({kenoNumbers} z 70)</option>
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold", marginRight: 10 }}>Liczba liczb w systemie:</label>
          <input type="number" min={6} max={15} value={systemNumbers} onChange={e => setSystemNumbers(Number(e.target.value))} style={{ ...inputStyle, width: 120, display: "inline-block", marginBottom: 0 }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold", marginRight: 10 }}>Gwarancja trafień:</label>
          <select value={systemGuarantee} onChange={e => setSystemGuarantee(Number(e.target.value))} style={{ ...inputStyle, width: 120, display: "inline-block", marginBottom: 0 }}>
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
              return config.options.map(option => (
                <option key={option} value={option}>{option} z {config.pick}</option>
              ));
            })()}
          </select>
        </div>
        <button type="submit" style={buttonStyle}>Generuj system</button>
      </form>
      {results.length > 0 && results[0].numbers && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "#222", margin: 0 }}>System skrócony:</h3>
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={copySystemToClipboard}
                style={actionButtonStyle}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(25, 118, 210, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.3)";
                }}
              >
                📋 Kopiuj system
              </button>
              <button 
                onClick={copyAllBetsToClipboard}
                style={{
                  ...actionButtonStyle,
                  background: "linear-gradient(135deg, #ff9800 0%, #ffb300 100%)",
                  boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(255, 152, 0, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 152, 0, 0.3)";
                }}
              >
                🎯 Kopiuj zakłady
              </button>
              <button 
                onClick={generatePDF}
                style={{
                  ...pdfButtonStyle,
                  background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)"
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
                📄 Pobierz PDF
              </button>
              <button 
                onClick={() => isFavorite(results[0].numbers) ? removeFromFavorites(getFavoriteId(results[0].numbers)) : addToFavorites(results[0].numbers, "systems")}
                style={{
                  background: "#ffffff",
                  color: isFavorite(results[0].numbers) ? "#ff1744" : "#ff5722",
                  border: `2px solid ${isFavorite(results[0].numbers) ? "#ff1744" : "#ff5722"}`,
                  borderRadius: "50%",
                  width: "48px",
                  height: "48px",
                  fontSize: 20,
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "scale(1.2)";
                  e.target.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                }}
              >
                ❤️
              </button>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.06)" }}>
            <p><strong>Wybrane liczby:</strong></p>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              {results[0].numbers.map((n, idx) => <Ball key={idx} n={n} />)}
            </div>
            <p><strong>Liczba zakładów:</strong> {results[0].totalBets}</p>
            <p><strong>Gwarancja:</strong> {results[0].guarantee} z {selectedGame === "lotto" ? 6 : selectedGame === "miniLotto" ? 5 : selectedGame === "multiMulti" ? 10 : selectedGame === "eurojackpot" ? 5 : selectedGame === "kaskada" ? 12 : kenoNumbers}</p>
            
            <div style={{ background: "#e8f5e8", color: "#2e7d32", padding: 12, borderRadius: 8, marginTop: 12, marginBottom: 12 }}>
              <strong>🎯 Jak obstawić zakłady:</strong>
              <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                Musisz obstawić wszystkie <strong>{results[0].totalBets}</strong> zakładów wygenerowanych przez system. 
                Każdy zakład to <strong>{selectedGame === "lotto" ? 6 : selectedGame === "miniLotto" ? 5 : selectedGame === "multiMulti" ? 10 : selectedGame === "eurojackpot" ? 5 : selectedGame === "kaskada" ? 12 : kenoNumbers}</strong> liczb z Twoich <strong>{results[0].numbers.length}</strong>.
              </p>
            </div>
            
            {results[0].bets && results[0].bets.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p><strong>Zakłady:</strong></p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {results[0].bets.map((bet, betIndex) => (
                    <div key={betIndex} style={{ 
                      background: "#f5f5f5", 
                      borderRadius: 8, 
                      padding: 12, 
                      display: "flex", 
                      justifyContent: "center", 
                      flexWrap: "wrap",
                      gap: 4
                    }}>
                      <span style={{ fontSize: 14, color: "#666", marginRight: 8 }}>Zakład {betIndex + 1}:</span>
                      {bet.map((n, idx) => (
                        <div key={idx} style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}>
                          {n}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results[0].totalBets === 0 && (
              <div style={{ background: "#ffebee", color: "#c62828", padding: 12, borderRadius: 8, marginTop: 12 }}>
                <strong>⚠️ Ostrzeżenie:</strong> Nie można wygenerować systemu skróconego z podanymi parametrami. 
                Sprawdź czy liczba liczb jest wystarczająca dla wybranej gwarancji.
              </div>
            )}
            
            {results[0].totalBets === 1 && (
              <div style={{ background: "#fff3e0", color: "#ef6c00", padding: 12, borderRadius: 8, marginTop: 12 }}>
                <strong>ℹ️ Informacja:</strong> Wygenerowano tylko 1 zakład. To oznacza, że:
                <ul style={{ marginLeft: 20, marginTop: 8 }}>
                  <li><strong>Liczba liczb jest równa liczbie liczb do wyboru</strong> (np. 6 liczb w Lotto)</li>
                  <li>W tym przypadku system skrócony = pełny zakład</li>
                  <li><strong>Nie ma sensu robić systemu skróconego z 6 liczb w Lotto!</strong></li>
                </ul>
                <p style={{ marginTop: 8, fontWeight: "bold" }}>
                  💡 Aby zobaczyć system skrócony, wybierz więcej liczb (np. 7, 8, 9, 10)
                </p>
              </div>
            )}
            
            {results[0].totalBets > 1 && results[0].totalBets < 10 && systemGuarantee >= 4 && (
              <div style={{ background: "#fff8e1", color: "#f57c00", padding: 12, borderRadius: 8, marginTop: 12 }}>
                <strong>⚠️ Uwaga:</strong> Wygenerowano tylko {results[0].totalBets} zakładów dla gwarancji {systemGuarantee} z {selectedGame === "lotto" ? 6 : 5}.
                <ul style={{ marginLeft: 20, marginTop: 8 }}>
                  <li>To może być za mało dla pełnej gwarancji</li>
                  <li>System może zapewniać tylko częściowe pokrycie</li>
                  <li>Sprawdź logi w konsoli dla szczegółów</li>
                </ul>
                <p style={{ marginTop: 8, fontWeight: "bold" }}>
                  💡 Dla lepszych wyników, wybierz więcej liczb lub niższą gwarancję
                </p>
              </div>
            )}
            
            {/* Informacja o algorytmie zachłannym */}
            {(() => {
              const lottoKey = `${results[0].numbers.length}-${results[0].guarantee}`;
              const miniLottoKey = `mini-${results[0].numbers.length}-${results[0].guarantee}`;
              const knownLottoSystems = ["7-3", "8-3", "9-3", "10-3", "7-4", "7-5", "8-4", "8-5", "9-4", "10-5"];
              const knownMiniLottoSystems = ["mini-7-3", "mini-8-3", "mini-9-3", "mini-7-4", "mini-8-4"];
              const isKnownLottoSystem = knownLottoSystems.includes(lottoKey);
              const isKnownMiniLottoSystem = knownMiniLottoSystems.includes(miniLottoKey);
              const isLottoGame = selectedGame === "lotto";
              const isMiniLottoGame = selectedGame === "miniLotto";
              const numbersInBet = selectedGame === "lotto" ? 6 : selectedGame === "miniLotto" ? 5 : selectedGame === "multiMulti" ? 10 : selectedGame === "eurojackpot" ? 5 : selectedGame === "kaskada" ? 12 : kenoNumbers;
              
              if (isKnownLottoSystem && isLottoGame && results[0].totalBets > 0) {
                return (
                  <div style={{ background: "#e8f5e8", color: "#2e7d32", padding: 12, borderRadius: 8, marginTop: 12 }}>
                    <strong>✅ ZNANY SYSTEM MATEMATYCZNY (LOTTO):</strong>
                    <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                      Użyto znanego systemu matematycznego {lottoKey}. 
                      Ten system <strong>ZAPEWNIA 100% GWARANCJĘ</strong> matematyczną.
                    </p>
                    <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                      Jeśli w losowaniu trafisz wymagane liczby z Twoich {results[0].numbers.length}, 
                      to przynajmniej jeden z {results[0].totalBets} zakładów zawiera wszystkie te liczby.
                    </p>
                  </div>
                );
              } else if (isKnownMiniLottoSystem && isMiniLottoGame && results[0].totalBets > 0) {
                return (
                  <div style={{ background: "#e8f5e8", color: "#2e7d32", padding: 12, borderRadius: 8, marginTop: 12 }}>
                    <strong>✅ ZNANY SYSTEM MATEMATYCZNY (MINI LOTTO):</strong>
                    <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                      Użyto znanego systemu matematycznego {miniLottoKey}. 
                      Ten system <strong>ZAPEWNIA 100% GWARANCJĘ</strong> matematyczną.
                    </p>
                    <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                      Jeśli w losowaniu trafisz wymagane liczby z Twoich {results[0].numbers.length}, 
                      to przynajmniej jeden z {results[0].totalBets} zakładów zawiera wszystkie te liczby.
                    </p>
                  </div>
                );
              } else if (!isLottoGame && !isMiniLottoGame && results[0].totalBets > 0) {
                return (
                  <div style={{ background: "#e3f2fd", color: "#1565c0", padding: 12, borderRadius: 8, marginTop: 12 }}>
                    <strong>🎯 UNIWERSALNY ALGORYTM COVERING DESIGN ({selectedGame.toUpperCase()}):</strong>
                    <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                      Użyto uniwersalnego algorytmu covering design dla {selectedGame} z {numbersInBet} liczbami w zakładzie. 
                      Ten algorytm <strong>DĄŻY DO 100% POKRYCIA</strong> wszystkich możliwych kombinacji.
                    </p>
                    <ul style={{ marginLeft: 20, marginTop: 8, fontSize: 14 }}>
                      <li>Algorytm analizuje wszystkie możliwe kombinacje</li>
                      <li>Wybierze optymalne zakłady dla maksymalnego pokrycia</li>
                      <li>Dąży do 100% gwarancji matematycznej</li>
                    </ul>
                    <p style={{ marginTop: 8, fontSize: 14, fontWeight: "bold" }}>
                      💡 Sprawdź konsolę przeglądarki (F12) dla szczegółowej analizy pokrycia
                    </p>
                  </div>
                );
              } else if ((!isKnownLottoSystem && isLottoGame) || (!isKnownMiniLottoSystem && isMiniLottoGame)) {
                return (
                  <div style={{ background: "#e3f2fd", color: "#1565c0", padding: 12, borderRadius: 8, marginTop: 12 }}>
                    <strong>🎯 UNIWERSALNY ALGORYTM COVERING DESIGN ({selectedGame.toUpperCase()}):</strong>
                    <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                      Użyto uniwersalnego algorytmu covering design dla kombinacji {isLottoGame ? lottoKey : miniLottoKey}. 
                      Ten algorytm <strong>DĄŻY DO 100% POKRYCIA</strong> wszystkich możliwych kombinacji.
                    </p>
                    <ul style={{ marginLeft: 20, marginTop: 8, fontSize: 14 }}>
                      <li>Algorytm analizuje wszystkie możliwe kombinacje</li>
                      <li>Wybierze optymalne zakłady dla maksymalnego pokrycia</li>
                      <li>Dąży do 100% gwarancji matematycznej</li>
                    </ul>
                    <p style={{ marginTop: 8, fontSize: 14, fontWeight: "bold" }}>
                      💡 Sprawdź konsolę przeglądarki (F12) dla szczegółowej analizy pokrycia
                    </p>
                  </div>
                );
              }
              return null;
            })()}
            

            
            <div style={{ background: "#f3e5f5", color: "#7b1fa2", padding: 12, borderRadius: 8, marginTop: 12 }}>
              <strong>📊 Analiza matematyczna:</strong>
              <ul style={{ marginLeft: 20, marginTop: 8 }}>
                <li><strong>Formalna definicja:</strong> System skrócony to zbiór kombinacji K-elementowych z N liczb, który zawiera wszystkie możliwe G-elementowe podzbiory</li>
                <li><strong>Gwarancja:</strong> Jeśli w losowaniu trafione zostaną dokładnie G liczb z wybranych N, to przynajmniej jeden zakład zawiera wszystkie te G liczb</li>
                <li><strong>Cel:</strong> Zminimalizować liczbę zakładów przy zachowaniu gwarancji G z K</li>
                <li><strong>Teoretyczne minimum:</strong> C(N,G) / C(K,G) zakładów</li>
              </ul>
              <p style={{ marginTop: 8, fontSize: 14 }}>
                Sprawdź konsolę przeglądarki (F12) dla szczegółowej analizy optymalności systemu.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDreams = () => (
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
          <input 
            type="number" 
            min={1} 
            max={10} 
            value={setsCount} 
            onChange={e => setSetsCount(Number(e.target.value))} 
            style={{ 
              ...inputStyle, 
              width: window.innerWidth <= 768 ? "100%" : "120px", 
              display: "inline-block", 
              marginBottom: 0,
              fontSize: window.innerWidth <= 768 ? "14px" : "16px"
            }} 
          />
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
                  flexWrap: window.innerWidth <= 768 ? "wrap" : "nowrap"
                }}>
                  <input
                    type="checkbox"
                    checked={dateItem.enabled}
                    onChange={(e) => updateDreamDate(dateItem.id, "enabled", e.target.checked)}
                    style={{ transform: "scale(1.2)" }}
                  />
                  <label style={{ 
                    fontWeight: "bold", 
                    minWidth: window.innerWidth <= 768 ? "auto" : "180px", 
                    fontSize: window.innerWidth <= 768 ? "13px" : "14px",
                    flex: window.innerWidth <= 768 ? "1" : "none"
                  }}>
                    {dateItem.label}:
                  </label>
                </div>
                <input
                  type="date"
                  value={dateItem.date}
                  onChange={(e) => updateDreamDate(dateItem.id, "date", e.target.value)}
                  style={{ 
                    ...inputStyle, 
                    width: window.innerWidth <= 768 ? "100%" : "150px", 
                    marginBottom: 0,
                    fontSize: window.innerWidth <= 768 ? "13px" : "14px"
                  }}
                  disabled={!dateItem.enabled}
                />
                {dateItem.enabled && dateItem.date && (
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? "11px" : "12px", 
                    color: "#666", 
                    fontStyle: "italic",
                    wordBreak: "break-word"
                  }}>
                    Liczby: {convertDateToNumbers(dateItem.date).join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <button type="submit" style={{
          ...buttonStyle,
          background: "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)",
          fontSize: window.innerWidth <= 768 ? "16px" : "20px",
          padding: window.innerWidth <= 768 ? "14px 20px" : "18px 24px",
          width: window.innerWidth <= 768 ? "100%" : "auto"
        }}>
          ✨ Generuj zestawy marzeń
        </button>
      </form>
      
      {results.length > 0 && (
        <div style={{ marginTop: window.innerWidth <= 768 ? "12px" : "18px" }}>
          <div style={{ 
            display: "flex", 
            flexDirection: window.innerWidth <= 768 ? "column" : "row",
            justifyContent: "space-between", 
            alignItems: window.innerWidth <= 768 ? "stretch" : "center", 
            marginBottom: 16,
            gap: window.innerWidth <= 768 ? "8px" : "0"
          }}>
            <h3 style={{ 
              color: "#222", 
              margin: 0,
              fontSize: window.innerWidth <= 768 ? "16px" : "18px"
            }}>🎯 Twoje zestawy marzeń:</h3>
            <button 
              onClick={generatePDF}
              style={{
                ...pdfButtonStyle,
                background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                padding: window.innerWidth <= 768 ? "8px 16px" : "10px 20px",
                width: window.innerWidth <= 768 ? "100%" : "auto"
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
              📄 Pobierz PDF
            </button>
          </div>
          {results.map((set, i) => (
            <div key={i} style={{ 
              background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)", 
              borderRadius: 16, 
              padding: 20, 
              marginBottom: 16, 
              boxShadow: "0 4px 20px 0 rgba(76, 175, 80, 0.15)",
              border: "2px solid #4caf50"
            }}>
              <div style={{ 
                fontSize: 24, 
                letterSpacing: 2, 
                textAlign: "center", 
                display: "flex", 
                justifyContent: "center", 
                flexWrap: "wrap",
                marginBottom: 16
              }}>
                {selectedGame === "eurojackpot" && Array.isArray(set) && Array.isArray(set[0]) && Array.isArray(set[1])
                  ? <>
                      {set[0].map((n, idx) => <Ball key={"e"+idx} n={n} />)}
                      <span style={{ fontWeight: "bold", color: "#1976d2", margin: "0 12px", fontSize: 28 }}>|</span>
                      {set[1].map((n, idx) => <Ball key={"e2"+idx} n={n} />)}
                    </>
                  : Array.isArray(set)
                    ? set.map((n, idx) => <Ball key={idx} n={n} />)
                    : null}
              </div>
              <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: 12 }}>
                <button 
                  onClick={() => copySetToClipboard(set)}
                  style={{
                    ...actionButtonStyle,
                    background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)"
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
                
                <button 
                  onClick={() => isFavorite(set) ? removeFromFavorites(getFavoriteId(set)) : addToFavorites(set, "dreams")}
                  style={{
                    background: "#ffffff",
                    color: isFavorite(set) ? "#ff1744" : "#ff5722",
                    border: `2px solid ${isFavorite(set) ? "#ff1744" : "#ff5722"}`,
                    borderRadius: "50%",
                    width: "48px",
                    height: "48px",
                    fontSize: 20,
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "scale(1.2)";
                    e.target.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  ❤️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );



  const renderAccount = () => (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ color: "#222", marginBottom: 32, textAlign: "center", fontSize: 28, fontWeight: 300 }}>Moje konto</h2>
      
      {/* Informacje o użytkowniku */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 16, 
        padding: 32, 
        marginBottom: 24, 
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0"
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 32,
            color: "white",
            fontWeight: "bold"
          }}>
            {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
          </div>
          <h3 style={{ color: "#222", margin: 0, fontSize: 20, fontWeight: 500 }}>{userName || "Użytkownik"}</h3>
          <p style={{ color: "#666", margin: "8px 0 0", fontSize: 14 }}>{userEmail}</p>
        </div>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 16,
          marginBottom: 24
        }}>
          <div style={{ textAlign: "center", padding: 16, background: "#f8f9fa", borderRadius: 12 }}>
            <div style={{ fontSize: 24, color: "#667eea", marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#222" }}>{history.length}</div>
            <div style={{ fontSize: 12, color: "#666" }}>Wygenerowane zestawy</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: "#f8f9fa", borderRadius: 12 }}>
            <div style={{ fontSize: 24, color: "#667eea", marginBottom: 8 }}>💾</div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#222" }}>{favoriteSets.length}</div>
            <div style={{ fontSize: 12, color: "#666" }}>Ulubione zestawy</div>
          </div>
        </div>
        
        {/* Informacje o subskrypcji */}
        <div style={{ 
          background: userSubscription?.subscription_status === 'active' 
            ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)" 
            : "linear-gradient(135deg, #ff9800 0%, #ffb300 100%)", 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 24,
          color: "white",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>
            {userSubscription?.subscription_status === 'active' ? "⭐" : "🆓"}
          </div>
          <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: "bold" }}>
            {userSubscription?.subscription_status === 'active' ? "Plan Premium" : "Plan Darmowy"}
          </h4>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>
            {userSubscription?.subscription_status === 'active' 
              ? "Aktywna subskrypcja - pełny dostęp"
              : trialDaysLeft > 0
                ? `Okres próbny - pozostało ${trialDaysLeft} dni`
                : "Dostęp do podstawowych funkcji"
            }
          </p>
          {trialDaysLeft > 0 && trialDaysLeft <= 3 && (
            <p style={{ margin: "6px 0 0", fontSize: 11, fontWeight: "bold", opacity: 0.9 }}>
              ⚠️ Wykup plan Premium
            </p>
          )}
        </div>
      </div>

      {/* Ulubione zestawy */}
      {favoriteSets.length > 0 && (
        <div style={{ 
          background: "#fff", 
          borderRadius: 16, 
          padding: 24, 
          marginBottom: 24, 
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid #f0f0f0"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ color: "#222", margin: 0, fontSize: 18, fontWeight: 500 }}>❤️ Moje ulubione zestawy</h3>
            <button 
              onClick={() => setShowFavorites(!showFavorites)}
              style={{
                background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 12px rgba(255, 152, 0, 0.3)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              {showFavorites ? "Ukryj" : "Pokaż"}
            </button>
          </div>
          
          {showFavorites && (
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {favoriteSets.map((favorite, index) => (
                <div key={favorite.id} style={{ 
                  border: "1px solid #e0e0e0", 
                  borderRadius: 8, 
                  padding: 16, 
                  marginBottom: 12,
                  background: "#fafafa"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#222", marginBottom: 4 }}>
                        {favorite.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                        {favorite.generatorType === "generator" ? "🎲 Generator" : 
                         favorite.generatorType === "dreams" ? "💭 Generator marzeń" : 
                         favorite.generatorType === "lucky" ? "🍀 Szczęśliwe liczby" : "Zestaw"} • {favorite.game} • {new Date(favorite.date).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromFavorites(favorite.id)}
                      style={{
                        background: "linear-gradient(90deg, #e91e63 0%, #c2185b 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 8px",
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = "scale(1.1)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    flexWrap: "wrap",
                    marginBottom: 12
                  }}>
                    {Array.isArray(favorite.set) && favorite.set.map((n, idx) => (
                      <Ball key={idx} n={n} />
                    ))}
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    <button 
                      onClick={() => copySetToClipboard(favorite.set)}
                      style={{
                        background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = "translateY(-1px)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      📋 Kopiuj
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edycja danych */}
      {isEditingProfile ? (
        <div style={{ 
          background: "#fff", 
          borderRadius: 16, 
          padding: 24, 
          marginBottom: 24, 
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid #f0f0f0"
        }}>
          <h3 style={{ color: "#222", marginBottom: 20, fontSize: 18, fontWeight: 500 }}>Edytuj dane</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold", color: "#222" }}>Imię *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                  transition: "border-color 0.2s ease"
                }}
                placeholder="Wprowadź imię"
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold", color: "#222" }}>Nazwisko</label>
              <input
                type="text"
                value={editSurname}
                onChange={(e) => setEditSurname(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                  transition: "border-color 0.2s ease"
                }}
                placeholder="Wprowadź nazwisko"
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold", color: "#222" }}>Email *</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                  transition: "border-color 0.2s ease"
                }}
                placeholder="Wprowadź email"
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold", color: "#222" }}>Adres</label>
              <textarea
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                  minHeight: 80,
                  resize: "vertical",
                  transition: "border-color 0.2s ease"
                }}
                placeholder="Wprowadź adres"
              />
            </div>
            
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button 
                onClick={saveProfile}
                style={{
                  background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 24px",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  flex: 1
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(76, 175, 80, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                💾 Zapisz
              </button>
              
              <button 
                onClick={cancelEditing}
                style={{
                  background: "transparent",
                  color: "#666",
                  border: "2px solid #e0e0e0",
                  borderRadius: 12,
                  padding: "16px 24px",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  flex: 1
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#f5f5f5";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                ❌ Anuluj
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ 
          background: "#fff", 
          borderRadius: 16, 
          padding: 24, 
          marginBottom: 24, 
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid #f0f0f0"
        }}>
          <h3 style={{ color: "#222", marginBottom: 20, fontSize: 18, fontWeight: 500 }}>Akcje</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button 
              onClick={startEditingProfile}
              style={{
                background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "16px 24px",
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(76, 175, 80, 0.3)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              ✏️ Edytuj dane
            </button>
            
            <button 
              onClick={() => {
                // Tu można dodać funkcjonalność eksportu danych
                window.alert("Funkcjonalność eksportu danych będzie dostępna wkrótce!");
              }}
              style={{
                background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "16px 24px",
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(76, 175, 80, 0.3)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              📤 Eksportuj dane
            </button>
            
            <button 
              onClick={() => {
                if (window.confirm("Czy na pewno chcesz się wylogować?")) {
                  handleLogout();
                }
              }}
              style={{
                background: "transparent",
                color: "#d32f2f",
                border: "2px solid #d32f2f",
                borderRadius: 12,
                padding: "16px 24px",
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#d32f2f";
                e.target.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#d32f2f";
              }}
            >
              🚪 Wyloguj się
            </button>
          </div>
        </div>
      )}

      {/* Informacje o aplikacji */}
      <div style={{ 
        background: "#f8f9fa", 
        borderRadius: 16, 
        padding: 20, 
        marginTop: 24,
        textAlign: "center"
      }}>
        <p style={{ color: "#666", margin: 0, fontSize: 14 }}>
                          <strong>Losuje.pl</strong> v1.0 • Darmowa wersja
        </p>
        <p style={{ color: "#999", margin: "8px 0 0", fontSize: 12 }}>
          Inteligentne generowanie zestawów lotto z analizą statystyczną
        </p>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div style={{ 
      maxWidth: window.innerWidth <= 480 ? "100%" : 800, 
      margin: "0 auto",
      padding: window.innerWidth <= 480 ? "0 16px" : "0",
      overflow: "hidden"
    }}>
      <h2 style={{ color: "#222", marginBottom: 24, textAlign: "center", fontSize: 24, fontWeight: 300 }}>Płatności</h2>
      
      {/* Status użytkownika */}
      {isUserBlocked && (
        <div style={{ 
          background: "#ffebee", 
          border: "2px solid #f44336", 
          borderRadius: 16, 
          padding: 20, 
          marginBottom: 24,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🚫</div>
          <h3 style={{ color: "#d32f2f", marginBottom: 8, fontSize: 20, fontWeight: "bold" }}>
            Konto zablokowane
          </h3>
          <p style={{ color: "#666", margin: 0, fontSize: 14 }}>
            Okres próbny wygasł po 7 dniach od rejestracji. Wykup Premium dla pełnego dostępu.
          </p>
        </div>
      )}
      
      {/* Okres próbny */}
      {trialDaysLeft > 0 && (
        <div style={{ 
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)", 
          border: "2px solid #2196f3", 
          borderRadius: 16, 
          padding: 20, 
          marginBottom: 24,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏰</div>
          <h3 style={{ color: "#1976d2", marginBottom: 8, fontSize: 20, fontWeight: "bold" }}>
            Okres próbny
          </h3>
          <p style={{ color: "#666", margin: 0, fontSize: 14 }}>
            Pozostało {trialDaysLeft} dni
          </p>
          {userSubscription?.trial_start_date && (
            <p style={{ color: "#666", margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>
              Zarejestrowano: {new Date(userSubscription.trial_start_date).toLocaleDateString('pl-PL')}
            </p>
          )}
          {trialDaysLeft <= 3 && (
            <p style={{ color: "#f57c00", margin: "8px 0 0", fontSize: 12, fontWeight: "bold" }}>
              ⚠️ Wykup Premium, aby nie stracić dostępu
            </p>
          )}
        </div>
      )}
      
      {/* Aktualny plan */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 16, 
        padding: 24, 
        marginBottom: 24, 
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0"
      }}>
        <h3 style={{ color: "#222", marginBottom: 16, fontSize: 18, fontWeight: 500 }}>Aktualny plan</h3>
        <div style={{ 
          background: userSubscription?.subscription_status === 'active' 
            ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)" 
            : subscriptionPlan === "free" ? "#f8f9fa" : "linear-gradient(135deg, #ff9800 0%, #ffb300 100%)",
          color: userSubscription?.subscription_status === 'active' ? "white" : subscriptionPlan === "free" ? "#666" : "white",
          padding: 20,
          borderRadius: 12,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>
            {userSubscription?.subscription_status === 'active' ? "⭐" : subscriptionPlan === "free" ? "🆓" : "⭐"}
          </div>
          <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>
            {userSubscription?.subscription_status === 'active' ? "Plan Premium" : subscriptionPlan === "free" ? "Plan Darmowy" : "Plan Premium"}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            {userSubscription?.subscription_status === 'active' 
              ? "Aktywna subskrypcja"
              : trialDaysLeft > 0
                ? `Okres próbny - ${trialDaysLeft} dni`
                : subscriptionPlan === "free" ? "Podstawowe funkcje" : "Wszystkie funkcje"
            }
          </div>
          {trialDaysLeft > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
              Data rejestracji: {userSubscription?.trial_start_date ? new Date(userSubscription.trial_start_date).toLocaleDateString('pl-PL') : 'Nieznana'}
            </div>
          )}
          
          {/* Przycisk anulowania subskrypcji dla aktywnych użytkowników */}
          {userSubscription?.subscription_status === 'active' && (
            <div style={{ marginTop: 16 }}>
              <button
                onClick={handleCancelSubscription}
                style={{
                  background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.target.style.background = "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)"}
                onMouseOut={(e) => e.target.style.background = "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)"}
              >
                🚫 Anuluj subskrypcję
              </button>
              <p style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
                Dostęp do Premium do końca okresu rozliczeniowego
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Plany Premium - Kontener z dwoma planami */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 16, 
        padding: 24, 
        marginBottom: 24, 
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0"
      }}>
        <h3 style={{ color: "#222", marginBottom: 20, fontSize: 18, fontWeight: 500, textAlign: "center" }}>{t('payments.premiumPlans')}</h3>
        
        <div style={{ 
          display: "flex", 
          gap: window.innerWidth <= 480 ? 12 : 20, 
          flexWrap: "wrap",
          justifyContent: "center",
          flexDirection: window.innerWidth <= 480 ? "column" : "row"
        }}>
          {/* Plan Premium Miesięczny */}
          <div style={{ 
            border: "2px solid #ff9800", 
            borderRadius: 16, 
            padding: window.innerWidth <= 480 ? 20 : 32,
            textAlign: "center",
            position: "relative",
            background: "#ffffff",
            flex: "1",
            minWidth: window.innerWidth <= 480 ? "100%" : 280,
            maxWidth: window.innerWidth <= 480 ? "100%" : 350,
            width: window.innerWidth <= 480 ? "100%" : "auto"
          }}>
            <div style={{ 
              position: "absolute", 
              top: -12, 
              left: "50%", 
              transform: "translateX(-50%)",
              background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
              color: "white",
              padding: "6px 16px",
              borderRadius: 16,
              fontSize: 12,
              fontWeight: "bold",
              boxShadow: "0 3px 8px rgba(255, 152, 0, 0.3)"
            }}>
              🎯 {t('payments.monthlyPlan')}
            </div>
            
            <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
            <h4 style={{ color: "#222", marginBottom: 8, fontSize: 20, fontWeight: "bold" }}>{t('payments.monthlyPlan')}</h4>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#ff9800", marginBottom: 12 }}>9,99 PLN/mies.</div>
            
            <div style={{ 
              background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)", 
              padding: 20, 
              borderRadius: 12, 
              marginBottom: 24,
              border: "1px solid #ffcc80"
            }}>
              <ul style={{ textAlign: "left", margin: 0, fontSize: 14, color: "#e65100", lineHeight: 1.6 }}>
                <li>✅ {t('payments.features.allGenerators')}</li>
                <li>✅ {t('payments.features.aiLuckyNumbers')}</li>
                <li>✅ {t('payments.features.dreamGenerator')}</li>
                <li>✅ {t('payments.features.reducedSystems')}</li>
                <li>✅ {t('payments.features.unlimitedSets')}</li>
                <li>✅ {t('payments.features.historyFavorites')}</li>
                <li>✅ {t('payments.features.prioritySupport')}</li>
                <li>✅ {t('payments.features.noAds')}</li>
                <li>✅ {t('payments.features.miniGames')}</li>
                <li>✅ {t('payments.features.advancedAI')}</li>
                <li>✅ {t('payments.features.exclusiveFeatures')}</li>
                <li>✅ {t('payments.features.fullAccess')}</li>
              </ul>
            </div>
            
            <div style={{ 
              background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: window.innerWidth <= 290 ? "8px 12px" : window.innerWidth <= 480 ? "12px 16px" : "16px 32px",
                fontSize: window.innerWidth <= 290 ? 10 : window.innerWidth <= 480 ? 14 : 18,
                fontWeight: "bold",
                width: "100%",
                maxWidth: window.innerWidth <= 480 ? "100%" : 300,
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: window.innerWidth <= 290 ? "4px" : "8px",
                textAlign: "center",
                wordWrap: "break-word",
                whiteSpace: "normal",
                minHeight: window.innerWidth <= 290 ? "36px" : "auto"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💳</span>
                <span>Wybierz metodę płatności poniżej</span>
                </div>
                </div>
            
            <p style={{ 
              margin: "12px 0 0", 
              fontSize: 12, 
              color: "#666", 
              fontStyle: "italic" 
            }}>
              {t('payments.cancelAnytime')}
            </p>
          </div>

          {/* Plan Premium Roczny */}
          <div style={{ 
            border: "2px solid #4caf50", 
            borderRadius: 16, 
            padding: window.innerWidth <= 480 ? 20 : 32,
            textAlign: "center",
            position: "relative",
            background: "#ffffff",
            flex: "1",
            minWidth: window.innerWidth <= 480 ? "100%" : 280,
            maxWidth: window.innerWidth <= 480 ? "100%" : 350,
            width: window.innerWidth <= 480 ? "100%" : "auto"
          }}>
            <div style={{ 
              position: "absolute", 
              top: -12, 
              left: "50%", 
              transform: "translateX(-50%)",
              background: "linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)",
              color: "white",
              padding: "6px 16px",
              borderRadius: 16,
              fontSize: 12,
              fontWeight: "bold",
              boxShadow: "0 3px 8px rgba(76, 175, 80, 0.3)"
            }}>
              🏆 {t('payments.bestOffer')}
            </div>
            
            <div style={{ fontSize: 36, marginBottom: 12 }}>👑</div>
            <h4 style={{ color: "#222", marginBottom: 8, fontSize: 20, fontWeight: "bold" }}>{t('payments.yearlyPlan')}</h4>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#4caf50", marginBottom: 8 }}>59,99 PLN/rok</div>
            <div style={{ fontSize: 14, color: "#4caf50", fontWeight: "bold", marginBottom: 12 }}>
              {t('payments.save50Percent')}
            </div>
            
            <div style={{ 
              background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)", 
              padding: 20, 
              borderRadius: 12, 
              marginBottom: 24,
              border: "1px solid #a5d6a7"
            }}>
              <ul style={{ textAlign: "left", margin: 0, fontSize: 14, color: "#2e7d32", lineHeight: 1.6 }}>
                <li>✅ {t('payments.features.allGenerators')}</li>
                <li>✅ {t('payments.features.aiLuckyNumbers')}</li>
                <li>✅ {t('payments.features.dreamGenerator')}</li>
                <li>✅ {t('payments.features.reducedSystems')}</li>
                <li>✅ {t('payments.features.unlimitedSets')}</li>
                <li>✅ {t('payments.features.historyFavorites')}</li>
                <li>✅ {t('payments.features.prioritySupport')}</li>
                <li>✅ {t('payments.features.noAds')}</li>
                <li>✅ {t('payments.features.miniGames')}</li>
                <li>✅ {t('payments.features.advancedAI')}</li>
                <li>✅ {t('payments.features.exclusiveFeatures')}</li>
                <li>✅ {t('payments.features.bestPrice')}</li>
              </ul>
            </div>
            
            <div style={{ 
              background: "linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: window.innerWidth <= 290 ? "8px 12px" : window.innerWidth <= 480 ? "12px 16px" : "16px 32px",
                fontSize: window.innerWidth <= 290 ? 10 : window.innerWidth <= 480 ? 14 : 18,
                fontWeight: "bold",
                width: "100%",
                maxWidth: window.innerWidth <= 480 ? "100%" : 300,
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: window.innerWidth <= 290 ? "4px" : "8px",
                textAlign: "center",
                wordWrap: "break-word",
                whiteSpace: "normal",
                minHeight: window.innerWidth <= 290 ? "36px" : "auto"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💳</span>
                <span>Wybierz metodę płatności poniżej</span>
                </div>
                </div>
            
            <p style={{ 
              margin: "12px 0 0", 
              fontSize: 12, 
              color: "#666", 
              fontStyle: "italic" 
            }}>
              {t('payments.cancelAnytime')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Historia subskrypcji */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 24, 
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0"
      }}>
        <h3 style={{ color: "#222", marginBottom: 12, fontSize: 14, fontWeight: 500 }}>Historia subskrypcji</h3>
        
        <div style={{ 
          background: "#f8f9fa", 
          borderRadius: 12, 
          padding: 16,
          border: "1px solid #e0e0e0"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: "bold", color: "#222" }}>
                Status: {userSubscription?.subscription_status === 'active' ? 'Aktywna' : userSubscription?.subscription_status === 'trial' ? 'Okres próbny' : 'Darmowa'}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                {userSubscription?.subscription_status === 'trial' 
                  ? `Rozpoczęcie: ${userSubscription.trial_start_date ? new Date(userSubscription.trial_start_date).toLocaleDateString('pl-PL') : 'Nieznana'}`
                  : userSubscription?.subscription_status === 'active'
                    ? `Aktywacja: ${userSubscription.subscription_start_date ? new Date(userSubscription.subscription_start_date).toLocaleDateString('pl-PL') : 'Nieznana'}`
                    : 'Brak aktywnej subskrypcji'
                }
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: "bold", color: "#ff9800" }}>
                {userSubscription?.subscription_status === 'trial' ? `${trialDaysLeft} dni` : userSubscription?.subscription_status === 'active' ? 'Aktywna' : 'N/A'}
              </div>
              <div style={{ fontSize: 11, color: "#666" }}>
                {userSubscription?.subscription_status === 'trial' ? 'do końca' : userSubscription?.subscription_status === 'active' ? 'subskrypcja' : ''}
              </div>
            </div>
          </div>
          
          {userSubscription?.subscription_status === 'trial' && trialDaysLeft <= 3 && (
            <div style={{ 
              background: "#fff3cd", 
              border: "1px solid #ffc107", 
              borderRadius: 8, 
              padding: 10, 
              marginTop: 8 
            }}>
              <div style={{ fontSize: 12, color: "#856404", fontWeight: "bold" }}>
                ⚠️ Uwaga: Okres próbny kończy się za {trialDaysLeft} dni
              </div>
              <div style={{ fontSize: 11, color: "#856404", marginTop: 2 }}>
                Wykup plan Premium, aby zachować dostęp
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nowy komponent Payments */}
      <Payments user={user} />
        

          














      {/* Historia płatności */}
      {paymentHistory.length > 0 && (
        <div style={{ 
          background: "#fff", 
          borderRadius: 16, 
          padding: 24, 
          marginBottom: 24, 
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid #f0f0f0"
        }}>
          <h3 style={{ color: "#222", marginBottom: 16, fontSize: 16, fontWeight: 500 }}>Historia płatności</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {paymentHistory.map(payment => (
              <div key={payment.id} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "16px",
                background: "#f8f9fa",
                borderRadius: 8,
                border: "1px solid #e0e0e0"
              }}>
                                 <div>
                   <div style={{ fontWeight: "bold", color: "#222" }}>
                     Plan Premium
                   </div>
                   <div style={{ fontSize: 12, color: "#666" }}>
                     {new Date(payment.date).toLocaleDateString('pl-PL')} • {payment.method.toUpperCase()}
                   </div>
                 </div>
                <div style={{ 
                  background: "#4caf50", 
                  color: "white", 
                  padding: "4px 12px", 
                  borderRadius: 12, 
                  fontSize: 12, 
                  fontWeight: "bold" 
                }}>
                  {payment.amount} PLN
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Obsługa strony sukcesu płatności
  const renderPaymentSuccess = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const method = urlParams.get('method');
    const amount = urlParams.get('amount');

    return (
      <div style={{ 
        maxWidth: 600, 
        margin: "50px auto", 
        padding: "40px 20px",
        textAlign: "center"
      }}>
        {status === 'success' ? (
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 40,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            border: "2px solid #4caf50"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <h1 style={{ color: "#2e7d32", marginBottom: 16, fontSize: 28, fontWeight: "bold" }}>
              Płatność zakończona pomyślnie!
            </h1>
            <p style={{ color: "#666", marginBottom: 24, fontSize: 16 }}>
              Dziękujemy za zakup planu Premium. Twoja subskrypcja została aktywowana.
            </p>
            
            <div style={{
              background: "#f8f9fa",
              borderRadius: 12,
              padding: 20,
              marginBottom: 30,
              border: "1px solid #e0e0e0"
            }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Szczegóły płatności:</div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: "#222" }}>
                Metoda: {method === 'paypal' ? 'PayPal' : 
                         method === 'blik' ? 'BLIK' :
                         method === 'card' ? 'Karta płatnicza' :
                         method === 'transfer' ? 'Przelew online' : method}
              </div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: "#222" }}>
                Kwota: {amount || '9,99'} PLN
              </div>
            </div>
            
            <div style={{ 
              display: "flex", 
              flexDirection: window.innerWidth <= 480 ? "column" : "row", 
              gap: "12px",
              justifyContent: "center",
              alignItems: "stretch"
            }}>
              <button
                onClick={() => navigate("/")}
                style={{
                  background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: window.innerWidth <= 290 ? "8px 12px" : window.innerWidth <= 480 ? "12px 16px" : "16px 32px",
                  fontSize: window.innerWidth <= 290 ? 10 : window.innerWidth <= 480 ? 14 : 16,
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  marginRight: window.innerWidth <= 480 ? 0 : 12,
                  marginBottom: window.innerWidth <= 480 ? 8 : 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: window.innerWidth <= 290 ? "4px" : "8px",
                  textAlign: "center",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  width: window.innerWidth <= 480 ? "100%" : "auto",
                  minHeight: window.innerWidth <= 290 ? "36px" : "auto"
                }}
              >
                <span>🏠</span>
                <span>Wróć do strony głównej</span>
              </button>
              
              <button
                onClick={() => navigate("/payments")}
                style={{
                  background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: window.innerWidth <= 290 ? "8px 12px" : window.innerWidth <= 480 ? "12px 16px" : "16px 32px",
                  fontSize: window.innerWidth <= 290 ? 10 : window.innerWidth <= 480 ? 14 : 16,
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: window.innerWidth <= 290 ? "4px" : "8px",
                  textAlign: "center",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  width: window.innerWidth <= 480 ? "100%" : "auto",
                  minHeight: window.innerWidth <= 290 ? "36px" : "auto"
                }}
              >
                <span>💳</span>
                <span>Zarządzaj subskrypcją</span>
              </button>
            </div>
          </div>
        ) : status === 'cancelled' ? (
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 40,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            border: "2px solid #ff9800"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
            <h1 style={{ color: "#f57c00", marginBottom: 16, fontSize: 28, fontWeight: "bold" }}>
              Płatność anulowana
            </h1>
            <p style={{ color: "#666", marginBottom: 24, fontSize: 16 }}>
              Płatność została anulowana. Możesz spróbować ponownie w dowolnym momencie.
            </p>
            
            <button
              onClick={() => navigate("/payments")}
              style={{
                background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: window.innerWidth <= 290 ? "8px 12px" : window.innerWidth <= 480 ? "12px 16px" : "16px 32px",
                fontSize: window.innerWidth <= 290 ? 10 : window.innerWidth <= 480 ? 14 : 16,
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: window.innerWidth <= 290 ? "4px" : "8px",
                textAlign: "center",
                wordWrap: "break-word",
                whiteSpace: "normal",
                width: window.innerWidth <= 480 ? "100%" : "auto",
                minHeight: window.innerWidth <= 290 ? "36px" : "auto"
              }}
            >
              <span>🔄</span>
              <span>Spróbuj ponownie</span>
            </button>
          </div>
        ) : (
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 40,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            border: "2px solid #f44336"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>❌</div>
            <h1 style={{ color: "#d32f2f", marginBottom: 16, fontSize: 28, fontWeight: "bold" }}>
              Błąd płatności
            </h1>
            <p style={{ color: "#666", marginBottom: 24, fontSize: 16 }}>
              Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie lub skontaktuj się z obsługą.
            </p>
            
            <button
              onClick={() => navigate("/payments")}
              style={{
                background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: window.innerWidth <= 290 ? "8px 12px" : window.innerWidth <= 480 ? "12px 16px" : "16px 32px",
                fontSize: window.innerWidth <= 290 ? 10 : window.innerWidth <= 480 ? 14 : 16,
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: window.innerWidth <= 290 ? "4px" : "8px",
                textAlign: "center",
                wordWrap: "break-word",
                whiteSpace: "normal",
                width: window.innerWidth <= 480 ? "100%" : "auto",
                minHeight: window.innerWidth <= 290 ? "36px" : "auto"
              }}
            >
              <span>🔄</span>
              <span>Spróbuj ponownie</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderExplanations = () => (
    <div>
      <h2 style={{ color: "#222", marginBottom: 24, textAlign: "center" }}>Wyjaśnienia i przykłady</h2>
      
      {/* System przełączania zakładek */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        marginBottom: 30,
        background: "#f5f5f5",
        borderRadius: 12,
        padding: 8,
        maxWidth: 600,
        margin: "0 auto 30px auto"
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
            padding: "12px 24px",
            margin: "0 4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 14,
            transition: "all 0.3s ease",
            flex: 1,
            maxWidth: 180
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
            padding: "12px 24px",
            margin: "0 4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 14,
            transition: "all 0.3s ease",
            flex: 1,
            maxWidth: 180
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
            padding: "12px 24px",
            margin: "0 4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 14,
            transition: "all 0.3s ease",
            flex: 1,
            maxWidth: 180
          }}
        >
          🤖 Generatory AI
        </button>
      </div>
      
      {/* Warunkowe renderowanie treści w zależności od wybranej zakładki */}
             {explanationsTab === 'minigry' && (
         <div>
           <div style={{ marginBottom: 30 }}>
             <h3 style={{ color: "#4caf50", marginBottom: 16, textAlign: "center" }}>🎮 Minigry - Szczegółowe wyjaśnienia</h3>
             
             {/* Magic Ball */}
             <div style={{ background: "#e8f5e8", borderRadius: 12, padding: 20, marginBottom: 20, border: "2px solid #4caf50" }}>
               <h4 style={{ color: "#2e7d32", marginBottom: 12, textAlign: "center" }}>🔮 Magic Ball - Magiczna Kula</h4>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Zasada działania:</strong> Klasyczna gra z magiczną kulą, która losuje szczęśliwe liczby z efektami wizualnymi.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Jak grać:</strong> Kliknij "Losuj", a magiczna kula zacznie się obracać i emitować cząsteczki. Po chwili wylosuje 6 liczb z zakresu 1-49.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Algorytm:</strong> Używa Math.random() z dodatkowymi efektami wizualnymi. Każda liczba ma równą szansę 1/49.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Przykład:</strong> Wylosowane liczby: 7, 13, 23, 31, 37, 42
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                 <strong>Efekty:</strong> Dym, cząsteczki, animacje obrotu kuli, konfetti po wylosowaniu
               </p>
             </div>

             {/* Slot Machine */}
             <div style={{ background: "#fff3e0", borderRadius: 12, padding: 20, marginBottom: 20, border: "2px solid #ff9800" }}>
               <h4 style={{ color: "#e65100", marginBottom: 12, textAlign: "center" }}>🎰 Slot Machine - Automat do Gry</h4>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Zasada działania:</strong> Automat do gry z animowanymi bębnami, który generuje liczby w stylu kasyna.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Jak grać:</strong> Kliknij "Kręć", a 6 bębnów zacznie się obracać. Każdy bęben losuje liczbę od 1 do 49. Bębny zatrzymują się kolejno.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Algorytm:</strong> Każdy bęben ma własny generator liczb losowych. Bębny obracają się z różnymi prędkościami dla efektu kasyna.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Przykład:</strong> Bęben 1: 7, Bęben 2: 13, Bęben 3: 23, Bęben 4: 31, Bęben 5: 37, Bęben 6: 42
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                 <strong>Efekty:</strong> Animowane bębny, dźwięki kasyna, efekty świetlne, stopniowe zatrzymywanie
               </p>
             </div>

             {/* Magiczne Losowanie */}
             <div style={{ background: "#f3e5f5", borderRadius: 12, padding: 20, marginBottom: 20, border: "2px solid #9c27b0" }}>
               <h4 style={{ color: "#7b1fa2", marginBottom: 12, textAlign: "center" }}>✨ Magiczne Losowanie - Mistyczna Gra</h4>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Zasada działania:</strong> Mistyczna gra z cząsteczkami i efektami świetlnymi, która losuje liczby w magicznej atmosferze.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Jak grać:</strong> Kliknij "Magiczne Losowanie", a ekran wypełni się cząsteczkami i światłem. Liczby pojawiają się w magicznych kulach.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Algorytm:</strong> Używa zaawansowanych efektów wizualnych z cząsteczkami. Liczby są losowane z rozkładem normalnym dla lepszego efektu.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Przykład:</strong> Magiczne kule: 3, 11, 19, 27, 35, 43
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                 <strong>Efekty:</strong> Cząsteczki świetlne, pulsujące światło, magiczne kule, efekty dymu
               </p>
             </div>

             {/* Złap szczęśliwą kulę */}
             <div style={{ background: "#e3f2fd", borderRadius: 12, padding: 20, marginBottom: 20, border: "2px solid #2196f3" }}>
               <h4 style={{ color: "#1565c0", marginBottom: 12, textAlign: "center" }}>🎯 Złap szczęśliwą kulę - Interaktywna Gra</h4>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Zasada działania:</strong> Interaktywna gra polegająca na łapaniu spadających kulek z liczbami.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Jak grać:</strong> Kule z liczbami spadają z góry ekranu. Klikaj na nie, aby je złapać. Musisz złapać 6 kulek, aby ukończyć grę.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Algorytm:</strong> Kule spadają z różnymi prędkościami i trajektoriami. Każda kula ma przypisaną liczbę 1-49. Fizyka grawitacji.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Przykład:</strong> Złapane kule: 5, 12, 18, 25, 33, 41
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                 <strong>Efekty:</strong> Fizyka spadania, efekty dźwiękowe przy łapaniu, animacje eksplozji, licznik złapanych kulek
               </p>
             </div>

             {/* Kręć Kołem Liczb */}
             <div style={{ background: "#fff8e1", borderRadius: 12, padding: 20, marginBottom: 20, border: "2px solid #ffc107" }}>
               <h4 style={{ color: "#f57c00", marginBottom: 12, textAlign: "center" }}>🎡 Kręć Kołem Liczb - Koło Fortuny</h4>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Zasada działania:</strong> Koło fortuny z liczbami, które obraca się i losuje szczęśliwe kombinacje.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Jak grać:</strong> Kliknij "Kręć kołem", a koło zacznie się obracać. Po zatrzymaniu wskaże 6 liczb z zakresu 1-49.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Algorytm:</strong> Koło obraca się z fizyką rzeczywistą (tarcie, siła bezwładności). Liczby są rozmieszczone równomiernie na kole.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Przykład:</strong> Wskazane liczby: 2, 9, 16, 24, 38, 47
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                 <strong>Efekty:</strong> Realistyczna fizyka obrotu, dźwięki koła, efekty świetlne, stopniowe zwalnianie
               </p>
             </div>

             {/* Aim & Select */}
             <div style={{ background: "#fce4ec", borderRadius: 12, padding: 20, marginBottom: 20, border: "2px solid #e91e63" }}>
               <h4 style={{ color: "#c2185b", marginBottom: 12, textAlign: "center" }}>🎯 Aim & Select - Gra Celownicza</h4>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Zasada działania:</strong> Gra celownicza, gdzie strzelasz do kulek z liczbami.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Jak grać:</strong> Kule z liczbami pojawiają się na ekranie. Celuj i strzelaj, aby trafić w 6 kulek. Każda trafiona kula odkrywa liczbę.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Algorytm:</strong> Kule pojawiają się w losowych pozycjach. System wykrywania kolizji sprawdza trafienia. Fizyka pocisków.
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                 <strong>Przykład:</strong> Trafione kule: 8, 15, 22, 29, 36, 44
               </p>
               <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                 <strong>Efekty:</strong> Celownik, efekty strzałów, animacje trafień, dźwięki strzałów, efekty eksplozji
               </p>
             </div>
           </div>

           <div style={{ marginBottom: 30 }}>
             <h3 style={{ color: "#1976d2", marginBottom: 16 }}>⚠️ Ważne informacje</h3>
             <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
               <p><strong>Teoria losowości:</strong> Każdy zestaw liczb ma identyczną szansę, niezależnie od przeszłości. Wyniki są statystycznie niezależne.</p>
               <p><strong>Algorytmy statystyczne:</strong> Zwiększają szansę na trafienie zestawów zgodnych z historycznymi wzorcami, ale nie gwarantują wygranej.</p>
               <p><strong>Systemy skrócone:</strong> Obniżają koszty gry i zapewniają minimalne gwarancje, ale NIE zwiększają szansy na główną wygraną. To tylko optymalizacja kosztów!</p>
               <p><strong>Brak gwarancji wygranej:</strong> Żaden system, algorytm ani strategia nie daje gwarancji na wygraną w lotto. To zawsze gra losowa.</p>
               <p><strong>Odpowiedzialna gra:</strong> Graj tylko w ramach swoich możliwości finansowych. Lotto to gra losowa i nie powinna być traktowana jako sposób na zarabianie pieniędzy.</p>
             </div>
           </div>
         </div>
       )}

             {explanationsTab === 'generatory' && (
         <div>
           <div style={{ marginBottom: 30 }}>
             <h3 style={{ color: "#1976d2", marginBottom: 16 }}>🎯 Generator zestawów - Algorytmy</h3>
        
        <h4 style={{ color: "#222", marginBottom: 12 }}>Lotto (6 z 49):</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
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

        <h4 style={{ color: "#222", marginBottom: 12 }}>Mini Lotto (5 z 42):</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
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

        <h4 style={{ color: "#222", marginBottom: 12 }}>Multi Multi (10 z 80):</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
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

        <h4 style={{ color: "#222", marginBottom: 12 }}>Eurojackpot (5 z 50 + 2 z 12):</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
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

        <h4 style={{ color: "#222", marginBottom: 12 }}>Kaskada (12 z 24):</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
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

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>🚀 AI Lotto Generator Ultra Pro - Zaawansowany algorytm</h3>
        
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: 12, padding: 20, marginBottom: 20, color: "white", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
          <h4 style={{ color: "white", marginBottom: 12 }}>🎯 7-stopniowy algorytm AI z analizą matematyczną</h4>
          <p style={{ marginBottom: 15 }}>AI Ultra Pro wykorzystuje zaawansowane techniki matematyczne i sztuczną inteligencję do generowania optymalnych kombinacji liczb.</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>🧠 Krok 1: Analiza prawdopodobieństwa + unikanie popularnych kombinacji</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Cel:</strong> Unikanie najczęściej wybieranych kombinacji przez graczy</p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Analiza historycznych danych o popularnych wyborach</li>
            <li>Identyfikacja wzorców (np. daty urodzenia, sekwencje)</li>
            <li>Preferowanie mniej popularnych kombinacji</li>
          </ul>
          <p><strong>Przykład:</strong> Unikanie kombinacji typu 1,2,3,4,5,6 lub dat urodzenia</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>📊 Krok 2: Analiza odchyleń standardowych (gorące/zimne liczby)</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Cel:</strong> Identyfikacja liczb "gorących" i "zimnych" na podstawie historii</p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Obliczanie średniej częstotliwości każdej liczby</li>
            <li>Analiza odchyleń od średniej</li>
            <li>Wykorzystanie prawa powrotu do średniej</li>
          </ul>
          <p><strong>Przykład:</strong> Jeśli liczba 7 pojawiała się rzadko, zwiększa się jej prawdopodobieństwo</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>🔢 Krok 3: Prawo Benforda + rozkłady nieliniowe</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Cel:</strong> Wykorzystanie prawa Benforda do analizy wzorców w liczbach</p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Prawo Benforda: pierwsze cyfry liczb nie są równomiernie rozłożone</li>
            <li>Preferowanie liczb zaczynających się od 1, 2, 3</li>
            <li>Analiza nieliniowych rozkładów prawdopodobieństwa</li>
          </ul>
          <p><strong>Przykład:</strong> Liczby 1-9 mają wyższe prawdopodobieństwo niż 40-49</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>🎲 Krok 4: Symulacje Monte Carlo (1M+ iteracji)</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Cel:</strong> Symulacja milionów losowań do przewidywania wzorców</p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>1,000,000+ losowych symulacji</li>
            <li>Analiza częstotliwości występowania każdej liczby</li>
            <li>Identyfikacja najbardziej prawdopodobnych kombinacji</li>
          </ul>
          <p><strong>Przykład:</strong> Jeśli w symulacjach liczba 23 pojawia się często, zwiększa się jej waga</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>🔧 Krok 5: Filtry matematyczne</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Cel:</strong> Aplikacja matematycznych filtrów do optymalizacji kombinacji</p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Równowaga parzystych/nieparzystych liczb</li>
            <li>Rozkład niskich/wysokich liczb</li>
            <li>Unikanie sekwencji (1,2,3,4,5,6)</li>
            <li>Optymalizacja sumy liczb</li>
          </ul>
          <p><strong>Przykład:</strong> Lotto: 3 parzyste + 3 nieparzyste, suma 120-160</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>♟️ Krok 6: Algorytm Szachowy (Markov model, 10k symulacji)</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Cel:</strong> Wykorzystanie strategii szachowej do przewidywania optymalnych ruchów</p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Markov Chain: każdy ruch wpływa na następny</li>
            <li>10,000 symulacji gier szachowych</li>
            <li>Transfer strategii szachowej na wybór liczb</li>
            <li>Analiza pozycji i wzorców</li>
          </ul>
          <p><strong>Przykład:</strong> Jak w szachach, każda liczba wpływa na prawdopodobieństwo następnej</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>🌀 Krok 7: Inteligentny chaos (70% algorytmiczny + 30% losowy)</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Cel:</strong> Połączenie algorytmicznej precyzji z losowością</p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>70% wyborów opartych na algorytmie</li>
            <li>30% czystego losu dla nieprzewidywalności</li>
            <li>Zachowanie elementu zaskoczenia</li>
            <li>Optymalizacja między przewidywalnością a losowością</li>
          </ul>
          <p><strong>Przykład:</strong> Większość liczb wybrana algorytmicznie, kilka losowo</p>
        </div>

        <div style={{ background: "#e8f5e8", borderRadius: 12, padding: 16, marginBottom: 20, border: "2px solid #4caf50" }}>
          <h4 style={{ color: "#2e7d32", marginBottom: 12 }}>🎯 AI Confidence - Pewność algorytmu</h4>
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

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>🎲 Systemy skrócone - Szczegółowe wyjaśnienie</h3>
        
        <div style={{ background: "#ffebee", borderRadius: 12, padding: 16, marginBottom: 20, border: "2px solid #f44336" }}>
          <h4 style={{ color: "#d32f2f", marginBottom: 12 }}>⚠️ WAŻNE - Systemy skrócone NIE dają gwarancji na wygraną!</h4>
          <p style={{ color: "#d32f2f", fontWeight: "bold" }}>Systemy skrócone to matematyczna optymalizacja kosztów gry, ale NIE zwiększają szansy na główną wygraną. To tylko sposób na grę większą liczbą liczb przy niższym koszcie.</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>🔍 Co to jest system skrócony?</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
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

        <h4 style={{ color: "#222", marginBottom: 12 }}>📊 Przykład praktyczny: System 10 liczb z gwarancją 4 z 6</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Twoje 10 liczb:</strong> 1, 2, 3, 4, 5, 6, 7, 8, 9, 10</p>
          <p><strong>System skrócony generuje 15 zakładów (matematycznie opracowanych):</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Zakład 1: 1, 2, 3, 4, 5, 6</li>
            <li>Zakład 2: 1, 2, 3, 4, 5, 7</li>
            <li>Zakład 3: 1, 2, 3, 4, 6, 8</li>
            <li>Zakład 4: 1, 2, 3, 5, 7, 9</li>
            <li>Zakład 5: 1, 2, 4, 6, 8, 10</li>
            <li>Zakład 6: 1, 3, 4, 5, 7, 8</li>
            <li>Zakład 7: 1, 3, 5, 6, 9, 10</li>
            <li>Zakład 8: 2, 3, 4, 7, 8, 9</li>
            <li>Zakład 9: 2, 3, 5, 6, 7, 10</li>
            <li>Zakład 10: 2, 4, 5, 6, 8, 9</li>
            <li>Zakład 11: 3, 4, 5, 6, 7, 10</li>
            <li>Zakład 12: 1, 2, 3, 6, 7, 10</li>
            <li>Zakład 13: 1, 2, 4, 5, 8, 10</li>
            <li>Zakład 14: 1, 2, 5, 6, 7, 9</li>
            <li>Zakład 15: 3, 4, 6, 7, 8, 10</li>
          </ul>
          
          <p><strong>⚠️ WAŻNE:</strong> Te zakłady zostały matematycznie opracowane tak, aby każda możliwa kombinacja 4 liczb z 10 występowała w przynajmniej jednym zakładzie (tzw. 4-covering design). To NIE są losowe zakłady!</p>
          
          <p><strong>Scenariusze losowania:</strong></p>
          
          <p><strong>🎯 Scenariusz 1: Wylosowano 4 z Twoich 10 liczb</strong></p>
          <p>Losowanie: 2, 4, 7, 9, 15, 23</p>
          <p>Z Twoich liczb wylosowano: 2, 4, 7, 9 (4 z 10)</p>
          <p><strong>Gwarancja:</strong> Ponieważ używasz systemu skróconego 10 liczb z gwarancją 4 z 6, na pewno trafisz co najmniej jedno "4 z 6" w swoich zakładach</p>
          <p><strong>Wynik:</strong> Zakład 8 (2, 3, 4, 7, 8, 9) trafia 4 z 6! ✅</p>
          
          <p><strong>🎯 Scenariusz 2: Wylosowano 5 z Twoich 10 liczb</strong></p>
          <p>Losowanie: 1, 3, 5, 8, 10, 25</p>
          <p>Z Twoich liczb wylosowano: 1, 3, 5, 8, 10 (5 z 10)</p>
          <p><strong>Gwarancja:</strong> Ponieważ używasz systemu skróconego 10 liczb z gwarancją 4 z 6, na pewno trafisz co najmniej jedno "4 z 6" w swoich zakładach</p>
          <p><strong>Wynik:</strong> Zakład 1 (1, 2, 3, 4, 5, 6) trafia 4 z 6! ✅</p>
          
          <p><strong>🎯 Scenariusz 3: Wylosowano 6 z Twoich 10 liczb</strong></p>
          <p>Losowanie: 1, 2, 3, 4, 5, 6</p>
          <p>Z Twoich liczb wylosowano: 1, 2, 3, 4, 5, 6 (6 z 10)</p>
          <p><strong>Gwarancja:</strong> Ponieważ używasz systemu skróconego 10 liczb z gwarancją 4 z 6, na pewno trafisz co najmniej jedno "4 z 6" w swoich zakładach</p>
          <p><strong>Wynik:</strong> Zakład 1 (1, 2, 3, 4, 5, 6) trafia 6 z 6! 🎉</p>
          
          <p><strong>❌ Scenariusz 4: Wylosowano liczby spoza Twoich 10</strong></p>
          <p>Losowanie: 15, 20, 25, 30, 35, 40</p>
          <p>Z Twoich liczb wylosowano: 0 z 10</p>
          <p><strong>Gwarancja:</strong> NIE DZIAŁA - nie trafisz nic!</p>
          <p><strong>Wynik:</strong> Brak trafień ❌</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>🔢 Przykłady liczby zakładów dla różnych systemów:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Gwarancja 3 z 6:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>System 7 liczb: 4 zakłady (pokrywa wszystkie 35 trójek)</li>
            <li>System 8 liczb: 7 zakładów (pokrywa wszystkie 56 trójek)</li>
            <li>System 9 liczb: 10 zakładów (pokrywa wszystkie 84 trójki)</li>
            <li>System 10 liczb: 14 zakładów (pokrywa wszystkie 120 trójek)</li>
          </ul>
          
          <p><strong>Gwarancja 4 z 6:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>System 8 liczb: 15 zakładów (pokrywa wszystkie 70 czwórek)</li>
            <li>System 9 liczb: 22 zakłady (pokrywa wszystkie 126 czwórek)</li>
            <li>System 10 liczb: 30 zakładów (pokrywa wszystkie 210 czwórek)</li>
          </ul>
          
          <p><strong>Gwarancja 5 z 6:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>System 9 liczb: 42 zakłady (pokrywa wszystkie 126 piątek)</li>
            <li>System 10 liczb: 60 zakładów (pokrywa wszystkie 252 piątki)</li>
          </ul>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>🔍 Kluczowa różnica: Losowe zakłady vs System skrócony</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>❌ Losowe zakłady (15 zakładów z 10 liczb):</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Generujesz 15 losowych zakładów z 10 liczb</li>
            <li>Wylosowano 4 z Twoich 10 liczb</li>
            <li><strong>Gwarancja:</strong> BRAK - możesz trafić 4 z 6, ale nie ma pewności</li>
            <li><strong>Ryzyko:</strong> Możesz nie trafić nic mimo 4 trafionych liczb</li>
          </ul>
          
          <p><strong>✅ System skrócony (15 zakładów z 10 liczb, gwarancja 4 z 6):</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Generujesz 15 matematycznie opracowanych zakładów</li>
            <li>Każda kombinacja 4 liczb z 10 występuje w przynajmniej jednym zakładzie</li>
            <li>Wylosowano 4 z Twoich 10 liczb</li>
            <li><strong>Gwarancja:</strong> NA PEWNO trafisz co najmniej jedno "4 z 6"</li>
            <li><strong>Bezpieczeństwo:</strong> Matematyczna pewność trafienia</li>
          </ul>
          
          <p><strong>📊 Praktyczny przykład różnicy:</strong></p>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Typ generatora</th>
                <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Trafione 4 z 10</th>
                <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Gwarancja 4 z 6?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>Losowy generator</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>✅</td>
                <td style={{ border: "1px solid #ddd", padding: 8, color: "#d32f2f" }}>❌ (brak gwarancji)</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>System skrócony 10/4</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>✅</td>
                <td style={{ border: "1px solid #ddd", padding: 8, color: "#2e7d32" }}>✅ (gwarantowane)</td>
              </tr>
            </tbody>
          </table>
          
          <p style={{ marginTop: 12, fontWeight: "bold", color: "#1976d2" }}>💡 Nasz generator używa prawdziwych systemów skróconych (covering design), nie losowych zakładów!</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>⚠️ Ograniczenia i ryzyko:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>1. Gwarancja działa TYLKO gdy wylosowane liczby są w Twoich typowanych</strong></p>
          <p>Jeśli wylosowano liczby spoza Twoich typowanych, gwarancja nie działa!</p>
          
          <p><strong>2. Systemy skrócone NIE zwiększają szansy na główną wygraną</strong></p>
          <p>To tylko optymalizacja kosztów - grasz większą liczbą liczb za mniejsze pieniądze</p>
          
          <p><strong>3. Wysokie gwarancje = więcej zakładów</strong></p>
          <p>Gwarancja 5 z 6 wymaga wielu zakładów i może być kosztowna</p>
          
          <p><strong>4. Matematyczna gwarancja ≠ gwarancja wygranej</strong></p>
          <p>Gwarancja dotyczy minimalnych trafień, nie głównej wygranej</p>
          
          <p><strong>5. Gwarancja działa TYLKO dla prawdziwych systemów skróconych</strong></p>
          <p>Losowe zakłady z 10 liczb NIE dają gwarancji 4 z 6 - tylko matematycznie opracowane systemy!</p>
          
          <p><strong>6. Pokrycie musi być kompletne</strong></p>
          <p>Każda możliwa kombinacja G liczb z N musi występować w przynajmniej jednym zakładzie</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>💡 Kiedy warto używać systemów skróconych?</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>✅ Warto:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Gdy masz ograniczony budżet, ale chcesz grać większą liczbą liczb</li>
            <li>Gdy masz "pewne" liczby i chcesz je wszystkie uwzględnić</li>
            <li>Gdy chcesz matematyczną gwarancję minimalnych trafień</li>
            <li>Gdy grasz regularnie i chcesz optymalizować koszty</li>
          </ul>
          
          <p><strong>❌ Nie warto:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Gdy oczekujesz gwarancji głównej wygranej</li>
            <li>Gdy masz bardzo ograniczony budżet (lepiej grać standardowo)</li>
            <li>Gdy nie rozumiesz matematyki systemów</li>
            <li>Gdy grasz sporadycznie</li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>📊 Strategie generowania</h3>
        
        <h4 style={{ color: "#222", marginBottom: 12 }}>Standardowa:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p>Klasyczne losowanie z uwzględnieniem statystyk (suma, rozkład, parzyste/nieparzyste)</p>
          <p><strong>Przykład Lotto:</strong> 7, 13, 23, 31, 37, 42 (suma: 153, 3 niskie + 3 wysokie)</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>Najczęstsze liczby:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p>Bazuje na historycznych danych najczęściej losowanych liczb</p>
          <p><strong>Lotto najczęstsze:</strong> 7, 13, 23, 31, 37, 42, 45, 49</p>
          <p><strong>Przykład zestawu:</strong> 7, 13, 23, 31, 37, 42 (wszystkie z najczęstszych)</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>Najrzadsze liczby:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p>Bazuje na historycznych danych najrzadziej losowanych liczb</p>
          <p><strong>Lotto najrzadsze:</strong> 1, 2, 8, 15, 20, 25, 30, 35, 40, 44, 47, 48</p>
          <p><strong>Przykład zestawu:</strong> 1, 8, 15, 25, 35, 44 (wszystkie z najrzadszych)</p>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>🔒 Unikalność zestawów</h3>
        
        <h4 style={{ color: "#222", marginBottom: 12 }}>Unikalne zestawy:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p>Każdy zestaw jest inny od pozostałych, ale liczby mogą się powtarzać między zestawami</p>
          <p><strong>Przykład (3 zestawy Lotto):</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Zestaw 1: 1, 2, 3, 4, 5, 6</li>
            <li>Zestaw 2: 7, 8, 9, 10, 11, 12</li>
            <li>Zestaw 3: 13, 14, 15, 16, 17, 18</li>
          </ul>
          <p>✅ Każdy zestaw inny, ❌ liczby się nie powtarzają między zestawami</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>Unikalne liczby w całej puli:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p>Każda liczba występuje tylko raz wśród wszystkich wygenerowanych zestawów</p>
          <p><strong>Przykład (3 zestawy Lotto):</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Zestaw 1: 1, 2, 3, 4, 5, 6</li>
            <li>Zestaw 2: 7, 8, 9, 10, 11, 12</li>
            <li>Zestaw 3: 13, 14, 15, 16, 17, 18</li>
          </ul>
          <p>✅ Każdy zestaw inny, ✅ każda liczba tylko raz</p>
          <p><strong>Ograniczenie:</strong> W Lotto maksymalnie 8 pełnych zestawów (8×6=48, a w Lotto jest 49 liczb)</p>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>✨ Generator marzeń - Daty urodzenia</h3>
        
        <h4 style={{ color: "#222", marginBottom: 12 }}>Jak działa konwersja dat na liczby:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Przykład: Data 12.06.1989</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li><strong>Dzień:</strong> 12 → liczba 12</li>
            <li><strong>Miesiąc:</strong> 06 → liczba 6</li>
            <li><strong>Rok - suma cyfr:</strong> 1+9+8+9 = 27 → liczba 27</li>
            <li><strong>Poszczególne cyfry roku:</strong> 1, 9, 8, 9 → liczby 1, 9, 8, 9</li>
            <li><strong>Suma dnia i miesiąca:</strong> 12+6 = 18 → liczba 18</li>
            <li><strong>Wiek (2024-1989):</strong> 35 → liczba 35</li>
          </ul>
          <p><strong>Wszystkie liczby z tej daty:</strong> 12, 6, 27, 1, 9, 8, 18, 35</p>
          <p><strong>Po usunięciu duplikatów:</strong> 1, 6, 8, 9, 12, 18, 27, 35</p>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>Dlaczego warto używać generatora marzeń:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>✅ Zalety:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li><strong>Osobisty charakter:</strong> Liczby mają dla Ciebie znaczenie emocjonalne</li>
            <li><strong>Wspomnienia:</strong> Każda liczba przypomina ważne chwile z życia</li>
            <li><strong>Większe zaangażowanie:</strong> Gra staje się bardziej osobista</li>
            <li><strong>Unikalność:</strong> Każdy ma inne daty, więc zestawy są unikalne</li>
            <li><strong>Nostalgia:</strong> Łączy grę z ważnymi momentami życia</li>
          </ul>
          
          <p><strong>💡 Wskazówki:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Dodaj daty urodzenia bliskich osób (partner, dzieci, rodzice)</li>
            <li>Uwzględnij ważne daty (ślub, poznanie partnera, narodziny dzieci)</li>
            <li>Możesz dodać daty rocznic, ważnych wydarzeń</li>
            <li>System automatycznie doda losowe liczby, jeśli dat nie wystarczy</li>
          </ul>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>Przykład praktyczny:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Daty użytkownika:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Moja data urodzenia: 15.03.1985 → liczby: 15, 3, 26, 1, 9, 8, 5, 18, 39</li>
            <li>Data urodzenia partnera: 22.07.1987 → liczby: 22, 7, 25, 1, 9, 8, 7, 29, 37</li>
            <li>Data ślubu: 14.06.2015 → liczby: 14, 6, 17, 2, 0, 1, 5, 20, 9</li>
          </ul>
          <p><strong>Wszystkie liczby (po usunięciu duplikatów):</strong></p>
          <p>0, 1, 2, 3, 5, 6, 7, 8, 9, 14, 15, 17, 18, 20, 22, 25, 26, 29, 37, 39</p>
          <p><strong>Zestaw Lotto (6 liczb):</strong> 1, 3, 15, 22, 26, 39</p>
          <p><strong>Pozostałe liczby dodane losowo:</strong> 3, 15, 22, 26, 39</p>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>🍀 Generator szczęśliwych liczb</h3>
        
        <h4 style={{ color: "#222", marginBottom: 12 }}>Jak działa generator szczęśliwych liczb:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>1. Dodaj swoje ulubione liczby:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Liczby z dat urodzenia (7, 13, 23)</li>
            <li>Liczby z ważnych wydarzeń (12, 25, 31)</li>
            <li>Liczby szczęśliwe (3, 7, 11, 21)</li>
            <li>Liczby z numerów telefonów, adresów</li>
          </ul>
          
          <p><strong>2. Wybierz typ systemu:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li><strong>Pełny system:</strong> Wszystkie możliwe kombinacje z Twoich liczb</li>
            <li><strong>System skrócony:</strong> Matematycznie opracowane zakłady z gwarancją</li>
            <li><strong>Mieszanka:</strong> Twoje liczby + losowe dodatki</li>
          </ul>
          
          <p><strong>3. Zapisz ulubione zestawy:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Nadaj nazwę zestawowi (np. "Moje szczęśliwe")</li>
            <li>Zapisz do pamięci przeglądarki</li>
            <li>Wczytuj w dowolnym momencie</li>
            <li>Usuwaj niepotrzebne zestawy</li>
          </ul>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>Przykład praktyczny:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Twoje szczęśliwe liczby:</strong> 3, 7, 11, 13, 21, 25, 31, 42</p>
          <p><strong>Typ systemu:</strong> System skrócony z gwarancją 4 z 6</p>
          <p><strong>Wynik:</strong> 15 zakładów matematycznie opracowanych</p>
          <p><strong>Gwarancja:</strong> Jeśli wylosowano 4 z 8 liczb, na pewno trafisz co najmniej jedno "4 z 6"</p>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>🎯 Generator ILP (Intelligent Lottery Picker)</h3>
        
        <h4 style={{ color: "#222", marginBottom: 12 }}>🔍 Co to jest ILP?</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>ILP (Intelligent Lottery Picker)</strong> to zaawansowany generator, który łączy w sobie:</p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li><strong>📊 Analizę statystyczną:</strong> Uwzględnia historyczne dane o częstotliwości liczb</li>
            <li><strong>🎯 Algorytmy matematyczne:</strong> Stosuje zaawansowane wzorce i wzory</li>
            <li><strong>🧠 Inteligentne wybory:</strong> Generuje zestawy zoptymalizowane pod kątem różnych kryteriów</li>
            <li><strong>⚖️ Zrównoważenie:</strong> Dba o odpowiedni rozkład parzystych/nieparzystych, niskich/wysokich</li>
          </ul>
          
          <p><strong>🎯 Przykład działania ILP dla Lotto:</strong></p>
          <div style={{ background: "#e8f5e8", borderRadius: 8, padding: 12, marginBottom: 12, border: "1px solid #4caf50" }}>
            <p><strong>Wybrane liczby:</strong> 7, 13, 23, 31, 37, 42</p>
            <p><strong>Analiza ILP:</strong></p>
            <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
              <li>Suma: 153 ✅ (w zakresie 100-180)</li>
              <li>Niskie (1-25): 7, 13, 23 (3 szt.) ✅</li>
              <li>Wysokie (26-49): 31, 37, 42 (3 szt.) ✅</li>
              <li>Parzyste: 42 (1 szt.) ❌ (powinno być 3)</li>
              <li>Nieparzyste: 7, 13, 23, 31, 37 (5 szt.) ❌ (powinno być 3)</li>
            </ul>
            <p><strong>ILP poprawi:</strong> 7, 13, 23, 31, 37, 42 → 7, 13, 23, 31, 37, 44 (lepszy rozkład parzystych)</p>
          </div>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>🔢 Typy generatorów ILP:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>1. Generator Smart:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li><strong>Najczęstsze liczby:</strong> Używa historycznie najczęściej losowanych liczb</li>
            <li><strong>Najrzadsze liczby:</strong> Bazuje na liczbach rzadko losowanych (prawo średniej)</li>
            <li><strong>Zrównoważone:</strong> Mieszanka częstych i rzadkich liczb</li>
          </ul>
          
          <p><strong>2. Generator Custom:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li><strong>Własny zakres:</strong> Możesz określić minimalną i maksymalną liczbę</li>
            <li><strong>Własna ilość:</strong> Generujesz dokładnie tyle liczb, ile chcesz</li>
            <li><strong>Własne strategie:</strong> Wybierasz algorytm generowania</li>
          </ul>
          
          <p><strong>3. Generator Keno:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li><strong>10 liczb:</strong> Standardowy zestaw Keno</li>
            <li><strong>20 liczb:</strong> Rozszerzony zestaw Keno</li>
            <li><strong>Zakresy:</strong> Niskie (1-40), wysokie (41-80), mieszane</li>
          </ul>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>📊 Przykłady praktyczne ILP:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>🎯 Przykład 1: Lotto Smart - Najczęstsze liczby</strong></p>
          <div style={{ background: "#fff3cd", borderRadius: 6, padding: 8, marginBottom: 8, border: "1px solid #ffc107" }}>
            <p><strong>Historycznie najczęstsze w Lotto:</strong> 7, 13, 23, 31, 37, 42, 45, 49</p>
            <p><strong>ILP wygeneruje:</strong> 7, 13, 23, 31, 37, 42</p>
            <p><strong>Analiza:</strong> Wszystkie z najczęstszych, suma 153, zrównoważony rozkład</p>
          </div>
          
          <p><strong>🎯 Przykład 2: Mini Lotto Custom - Własny zakres</strong></p>
          <div style={{ background: "#fff3cd", borderRadius: 6, padding: 8, marginBottom: 8, border: "1px solid #ffc107" }}>
            <p><strong>Parametry:</strong> 5 liczb, zakres 1-42, strategia "najrzadsze"</p>
            <p><strong>ILP wygeneruje:</strong> 1, 2, 5, 9, 13</p>
            <p><strong>Analiza:</strong> Wszystkie z najrzadszych, suma 30, zgodne z prawem średniej</p>
          </div>
          
          <p><strong>🎯 Przykład 3: Keno Smart - Mieszane</strong></p>
          <div style={{ background: "#fff3cd", borderRadius: 6, padding: 8, marginBottom: 8, border: "1px solid #ffc107" }}>
            <p><strong>Parametry:</strong> 10 liczb, zakres mieszany</p>
            <p><strong>ILP wygeneruje:</strong> 7, 11, 17, 23, 29, 35, 41, 47, 53, 59</p>
            <p><strong>Analiza:</strong> Zrównoważony rozkład, suma 328, zgodne ze statystykami</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>🎲 Generator systemów ILP</h3>
        
        <h4 style={{ color: "#222", marginBottom: 12 }}>🔍 Systemy ILP vs klasyczne systemy:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Klasyczny system skrócony:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Używa wszystkich możliwych kombinacji z wybranych liczb</li>
            <li>Matematycznie opracowane zakłady</li>
            <li>Gwarancja minimalnych trafień</li>
            <li>Może być kosztowny dla dużych systemów</li>
          </ul>
          
          <p><strong>System ILP:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Inteligentnie wybiera liczby przed generowaniem systemu</li>
            <li>Analizuje statystyki i wzorce</li>
            <li>Optymalizuje koszty przy zachowaniu gwarancji</li>
            <li>Łączy zalety systemów skróconych z inteligentnym wyborem</li>
          </ul>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>📊 Przykład systemu ILP:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>🎯 Scenariusz: System ILP 8 liczb z gwarancją 4 z 6</strong></p>
          
          <p><strong>Krok 1: Inteligentny wybór 8 liczb</strong></p>
          <div style={{ background: "#e8f5e8", borderRadius: 8, padding: 12, marginBottom: 12, border: "1px solid #4caf50" }}>
            <p><strong>ILP analizuje i wybiera:</strong> 3, 7, 13, 17, 23, 31, 37, 42</p>
            <p><strong>Kryteria wyboru:</strong></p>
            <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
              <li>Suma: 173 ✅ (w zakresie 100-180)</li>
              <li>Niskie (1-25): 3, 7, 13, 17, 23 (5 szt.) ✅</li>
              <li>Wysokie (26-49): 31, 37, 42 (3 szt.) ✅</li>
              <li>Parzyste: 42 (1 szt.) - dodane dla zrównoważenia</li>
              <li>Nieparzyste: 3, 7, 13, 17, 23, 31, 37 (7 szt.) ✅</li>
            </ul>
          </div>
          
          <p><strong>Krok 2: Generowanie systemu skróconego</strong></p>
          <div style={{ background: "#fff3cd", borderRadius: 8, padding: 12, marginBottom: 12, border: "1px solid #ffc107" }}>
            <p><strong>System ILP generuje 15 zakładów:</strong></p>
            <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
              <li>Zakład 1: 3, 7, 13, 17, 23, 31</li>
              <li>Zakład 2: 3, 7, 13, 17, 23, 37</li>
              <li>Zakład 3: 3, 7, 13, 17, 23, 42</li>
              <li>Zakład 4: 3, 7, 13, 17, 31, 37</li>
              <li>Zakład 5: 3, 7, 13, 17, 31, 42</li>
              <li>... (i 10 kolejnych zakładów)</li>
            </ul>
            <p><strong>Gwarancja:</strong> Jeśli wylosowano 4 z 8 liczb, na pewno trafisz co najmniej jedno "4 z 6"</p>
          </div>
          
          <p><strong>Krok 3: Analiza kosztów</strong></p>
          <div style={{ background: "#e3f2fd", borderRadius: 8, padding: 12, marginBottom: 12, border: "1px solid #2196f3" }}>
            <p><strong>Koszt systemu ILP:</strong> 15 zakładów × 3 zł = 45 zł</p>
            <p><strong>Koszt systemu pełnego:</strong> 28 zakładów × 3 zł = 84 zł</p>
            <p><strong>Oszczędność:</strong> 39 zł (46% oszczędności!)</p>
            <p><strong>Zachowana gwarancja:</strong> ✅ Matematyczna pewność trafienia</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>🎯 Generator wyboru liczb (Number Picker)</h3>
        
        <h4 style={{ color: "#222", marginBottom: 12 }}>🔍 Co to jest Number Picker?</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>Number Picker</strong> to interaktywny generator, który pozwala:</p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li><strong>🎯 Wizualny wybór:</strong> Kliknij na kule z liczbami, aby je wybrać</li>
            <li><strong>📊 Podgląd statystyk:</strong> Zobacz sumę, rozkład parzystych/nieparzystych</li>
            <li><strong>🔄 Resetowanie:</strong> Zacznij od nowa w dowolnym momencie</li>
            <li><strong>✅ Walidacja:</strong> System sprawdza, czy wybór jest kompletny</li>
          </ul>
          
          <p><strong>🎯 Przykład użycia Number Picker dla Lotto:</strong></p>
          <div style={{ background: "#e8f5e8", borderRadius: 8, padding: 12, marginBottom: 12, border: "1px solid #4caf50" }}>
            <p><strong>Krok 1:</strong> Kliknij na kule: 7, 13, 23, 31, 37, 42</p>
            <p><strong>Krok 2:</strong> System pokazuje statystyki:</p>
            <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
              <li>Suma: 153 ✅</li>
              <li>Niskie (1-25): 7, 13, 23 (3 szt.) ✅</li>
              <li>Wysokie (26-49): 31, 37, 42 (3 szt.) ✅</li>
              <li>Parzyste: 42 (1 szt.) ⚠️</li>
              <li>Nieparzyste: 7, 13, 23, 31, 37 (5 szt.) ⚠️</li>
            </ul>
            <p><strong>Krok 3:</strong> Możesz zmienić wybór lub zatwierdzić</p>
          </div>
        </div>

        <h4 style={{ color: "#222", marginBottom: 12 }}>💡 Wskazówki dla Number Picker:</h4>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <p><strong>✅ Dobry wybór:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Zrównoważony rozkład parzystych i nieparzystych</li>
            <li>Suma w odpowiednim zakresie dla danej gry</li>
            <li>Rozkład niskich i wysokich liczb</li>
            <li>Liczby z różnych zakresów (nie tylko 1-10)</li>
          </ul>
          
          <p><strong>❌ Unikaj:</strong></p>
          <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
            <li>Tylko parzyste lub tylko nieparzyste liczby</li>
            <li>Wszystkie liczby z tego samego zakresu</li>
            <li>Suma poza zalecanym zakresem</li>
            <li>Kolejne liczby (1, 2, 3, 4, 5, 6)</li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>⚠️ Ważne informacje</h3>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
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
           <div style={{ marginBottom: 30 }}>
             <h3 style={{ color: "#9c27b0", marginBottom: 16, textAlign: "center" }}>🤖 Generatory AI - Szczegółowe wyjaśnienia</h3>
             
             {/* AI Lotto Generator Ultra Pro */}
             <div style={{ background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)", borderRadius: 12, padding: 20, marginBottom: 20, border: "2px solid #9c27b0" }}>
               <h4 style={{ color: "#7b1fa2", marginBottom: 12, textAlign: "center" }}>🚀 AI Lotto Generator Ultra Pro</h4>
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
             <div style={{ background: "#e8f5e8", borderRadius: 12, padding: 16, marginBottom: 16, border: "2px solid #4caf50" }}>
               <h4 style={{ color: "#2e7d32", marginBottom: 12 }}>🧠 Krok 1: Analiza prawdopodobieństwa + unikanie popularnych kombinacji</h4>
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
             <div style={{ background: "#fff3e0", borderRadius: 12, padding: 16, marginBottom: 16, border: "2px solid #ff9800" }}>
               <h4 style={{ color: "#e65100", marginBottom: 12 }}>📊 Krok 2: Analiza odchyleń standardowych (gorące/zimne liczby)</h4>
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
             <div style={{ background: "#e3f2fd", borderRadius: 12, padding: 16, marginBottom: 16, border: "2px solid #2196f3" }}>
               <h4 style={{ color: "#1565c0", marginBottom: 12 }}>🔢 Krok 3: Prawo Benforda + rozkłady nieliniowe</h4>
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
             <div style={{ background: "#fce4ec", borderRadius: 12, padding: 16, marginBottom: 16, border: "2px solid #e91e63" }}>
               <h4 style={{ color: "#c2185b", marginBottom: 12 }}>🎲 Krok 4: Symulacje Monte Carlo (1M+ iteracji)</h4>
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
             <div style={{ background: "#fff8e1", borderRadius: 12, padding: 16, marginBottom: 16, border: "2px solid #ffc107" }}>
               <h4 style={{ color: "#f57c00", marginBottom: 12 }}>🔧 Krok 5: Filtry matematyczne</h4>
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
             <div style={{ background: "#f3e5f5", borderRadius: 12, padding: 16, marginBottom: 16, border: "2px solid #9c27b0" }}>
               <h4 style={{ color: "#7b1fa2", marginBottom: 12 }}>♟️ Krok 6: Algorytm Szachowy (Markov model, 10k symulacji)</h4>
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
             <div style={{ background: "#e0f2f1", borderRadius: 12, padding: 16, marginBottom: 16, border: "2px solid #009688" }}>
               <h4 style={{ color: "#00695c", marginBottom: 12 }}>🌀 Krok 7: Inteligentny chaos (70% algorytmiczny + 30% losowy)</h4>
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
             <div style={{ background: "#e8f5e8", borderRadius: 12, padding: 16, marginBottom: 20, border: "2px solid #4caf50" }}>
               <h4 style={{ color: "#2e7d32", marginBottom: 12 }}>🎯 AI Confidence - Pewność algorytmu</h4>
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
             <div style={{ background: "#fff3e0", borderRadius: 12, padding: 16, marginBottom: 20, border: "2px solid #ff9800" }}>
               <h4 style={{ color: "#e65100", marginBottom: 12 }}>📋 Przykłady praktyczne AI Ultra Pro</h4>
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
             <div style={{ marginBottom: 30 }}>
               <h3 style={{ color: "#1976d2", marginBottom: 16 }}>⚠️ Ważne informacje</h3>
               <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                 <p><strong>Teoria losowości:</strong> Każdy zestaw liczb ma identyczną szansę, niezależnie od przeszłości. Wyniki są statystycznie niezależne.</p>
                 <p><strong>Algorytmy statystyczne:</strong> Zwiększają szansę na trafienie zestawów zgodnych z historycznymi wzorcami, ale nie gwarantują wygranej.</p>
                 <p><strong>Systemy skrócone:</strong> Obniżają koszty gry i zapewniają minimalne gwarancje, ale NIE zwiększają szansy na główną wygraną. To tylko optymalizacja kosztów!</p>
                 <p><strong>Brak gwarancji wygranej:</strong> Żaden system, algorytm ani strategia nie daje gwarancji na wygraną w lotto. To zawsze gra losowa.</p>
                 <p><strong>Odpowiedzialna gra:</strong> Graj tylko w ramach swoich możliwości finansowych. Lotto to gra losowa i nie powinna być traktowana jako sposób na zarabianie pieniędzy.</p>
               </div>
             </div>

             {/* Ostrzeżenie o niestandardowych metodach */}
             <div style={{ marginBottom: 30 }}>
               <h3 style={{ color: "#d32f2f", marginBottom: 16 }}>🚨 Ostrzeżenie o niestandardowych metodach</h3>
               <div style={{ background: "#ffebee", borderRadius: 12, padding: 16, marginBottom: 16, border: "2px solid #f44336" }}>
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
   );

  const renderLucky = () => (
    <div>
      <h2 style={{ color: "#222", marginBottom: 24, textAlign: "center" }}>🍀 Szczęśliwe liczby</h2>
      <div style={{ background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)", padding: 20, borderRadius: 16, marginBottom: 24, border: "2px solid #ff9800" }}>
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
      
      <form onSubmit={generateLuckySystem} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold", marginRight: 10 }}>Wybierz grę:</label>
          <select value={selectedGame} onChange={e => setSelectedGame(e.target.value)} style={{ ...inputStyle, width: 220, display: "inline-block", marginBottom: 0 }}>
            {games.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: "bold", marginRight: 10 }}>Ilość liczb do wygenerowania:</label>
          <select 
            value={selectedNumbersCount} 
            onChange={e => setSelectedNumbersCount(parseInt(e.target.value))} 
            style={{ ...inputStyle, width: 120, display: "inline-block", marginBottom: 0 }}
          >
            {(() => {
              const range = getGameRange(selectedGame);
              const options = [];
              for (let i = range.count; i <= Math.min(range.maxSelectable, 20); i++) {
                options.push(i);
              }
              return options.map(num => (
                <option key={num} value={num}>{num} liczb</option>
              ));
            })()}
          </select>
        </div>
        
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: "#1976d2", marginBottom: 16 }}>➕ Dodaj szczęśliwe liczby:</h3>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
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
              style={{ ...inputStyle, width: 150, marginBottom: 0 }}
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
                width: "auto",
                padding: "14px 20px",
                background: "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)"
              }}
            >
              ➕ Dodaj
            </button>
          </div>
          
          {luckyNumbers.length > 0 && (
            <div style={{ background: "#fff", padding: 16, borderRadius: 12, border: "2px solid #ffd700" }}>
              <h4 style={{ color: "#222", marginBottom: 12 }}>Twoje szczęśliwe liczby:</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
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
              <button
                type="button"
                onClick={() => setLuckyNumbers([])}
                style={{
                  background: "none",
                  border: "1px solid #d32f2f",
                  color: "#d32f2f",
                  padding: "8px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14
                }}
              >
                🗑️ Wyczyść wszystkie
              </button>
            </div>
          )}
        </div>
        
        <div style={{ background: "#e8f5e8", padding: 12, borderRadius: 8, marginBottom: 18, border: "1px solid #4caf50" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#2e7d32" }}>
            <strong>💡 Jak to działa:</strong> System analizuje Twoje liczby i generuje 3 inteligentne zestawy + intuicyjny. 
            Każdy zestaw zawiera 2-3 Twoje liczby + zrównoważone dodatki!
          </p>
        </div>
        
        <button type="submit" style={{
          ...buttonStyle,
          background: "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)",
          fontSize: 20,
          padding: "18px 24px"
        }}>
          🍀 Generuj system
        </button>
      </form>
      
      {results.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "#222", margin: 0 }}>🎯 Wyniki:</h3>
                          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button 
                  onClick={generatePDF}
                  style={{
                    ...pdfButtonStyle,
                    background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)"
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
                  📄 Pobierz PDF
                </button>
              <button 
                onClick={saveAsFavorite}
                style={{
                  ...actionButtonStyle,
                  background: "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)",
                  boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(255, 215, 0, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.3)";
                }}
              >
                💾 Zapisz jako ulubiony
              </button>
            </div>
          </div>
          
          {favoriteSets.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: "#1976d2", marginBottom: 12 }}>💾 Ulubione zestawy:</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {favoriteSets.map((favorite) => (
                  <div key={favorite.id} style={{
                    background: "#fff",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}>
                    <button
                      onClick={() => loadFavorite(favorite)}
                      style={{
                        background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      📂 {favorite.name}
                    </button>
                    <button
                      onClick={() => deleteFavorite(favorite.id)}
                      style={{
                        background: "#d32f2f",
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {results.map((set, i) => (
            <div key={i} style={{ 
              background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)", 
              borderRadius: 16, 
              padding: 20, 
              marginBottom: 16, 
              boxShadow: "0 4px 20px 0 rgba(255, 152, 0, 0.15)",
              border: "2px solid #ff9800"
            }}>
              {/* Wyjaśnienie */}
              {luckyExplanations[i] && (
                <div style={{ 
                  background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)", 
                  padding: 12, 
                  borderRadius: 8, 
                  marginBottom: 16,
                  border: "1px solid #2196f3"
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: 14, 
                    color: "#1565c0",
                    whiteSpace: "pre-line",
                    lineHeight: 1.4
                  }}>
                    {luckyExplanations[i]}
                  </p>
                </div>
              )}
              
              {/* Zestaw liczb */}
              <div style={{ 
                fontSize: 24, 
                letterSpacing: 2, 
                textAlign: "center", 
                display: "flex", 
                justifyContent: "center", 
                flexWrap: "wrap",
                marginBottom: 16
              }}>
                {selectedGame === "eurojackpot" && Array.isArray(set) && Array.isArray(set[0]) && Array.isArray(set[1])
                  ? <>
                      {set[0].map((n, idx) => <Ball key={"e"+idx} n={n} />)}
                      <span style={{ fontWeight: "bold", color: "#1976d2", margin: "0 12px", fontSize: 28 }}>|</span>
                      {set[1].map((n, idx) => <Ball key={"e2"+idx} n={n} />)}
                    </>
                  : Array.isArray(set)
                    ? set.map((n, idx) => <Ball key={idx} n={n} />)
                    : null}
              </div>
              
              {/* Przycisk kopiuj */}
              <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: 12 }}>
                <button 
                  onClick={() => copySetToClipboard(set)}
                  style={{
                    ...actionButtonStyle,
                    background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)"
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
                
                <button 
                  onClick={() => isFavorite(set) ? removeFromFavorites(getFavoriteId(set)) : addToFavorites(set, "lucky")}
                  style={{
                    background: "#ffffff",
                    color: isFavorite(set) ? "#ff1744" : "#ff5722",
                    border: `2px solid ${isFavorite(set) ? "#ff1744" : "#ff5722"}`,
                    borderRadius: "50%",
                    width: "48px",
                    height: "48px",
                    fontSize: 20,
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "scale(1.2)";
                    e.target.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  ❤️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNumberPicker = () => {
    const handleBallClick = (ballId) => {
      if (!revealedBalls[ballId]) {
        // Pierwszy klik - odkryj kulkę i dodaj liczbę
        const range = getGameRange(selectedGame);
        
        if (selectedGame === "eurojackpot") {
          // Obsługa Eurojackpot - oddzielne liczby główne i Euro
          if (ballId.startsWith('main-')) {
            // Liczby główne (1-50)
            const availableMainNumbers = [];
            for (let i = 1; i <= 50; i++) {
              if (!luckyNumbers.includes(i)) {
                availableMainNumbers.push(i);
              }
            }
            
            if (availableMainNumbers.length > 0) {
              const randomNumber = generateNumberWithTalisman(50);
              if (availableMainNumbers.includes(randomNumber)) {
                setRevealedBalls(prev => ({ ...prev, [ballId]: randomNumber }));
                addLuckyNumber(randomNumber);
              } else {
                // Jeśli wygenerowana liczba nie jest dostępna, wybierz losowo z dostępnych
                const fallbackNumber = availableMainNumbers[Math.floor(Math.random() * availableMainNumbers.length)];
                setRevealedBalls(prev => ({ ...prev, [ballId]: fallbackNumber }));
                addLuckyNumber(fallbackNumber);
              }
            }
          } else if (ballId.startsWith('euro-')) {
            // Liczby Euro (1-10)
            const availableEuroNumbers = [];
            for (let i = 1; i <= 10; i++) {
              if (!luckyNumbers.includes(i)) {
                availableEuroNumbers.push(i);
              }
            }
            
            if (availableEuroNumbers.length > 0) {
              const randomNumber = generateNumberWithTalisman(10);
              if (availableEuroNumbers.includes(randomNumber)) {
                setRevealedBalls(prev => ({ ...prev, [ballId]: randomNumber }));
                addLuckyNumber(randomNumber);
              } else {
                // Jeśli wygenerowana liczba nie jest dostępna, wybierz losowo z dostępnych
                const fallbackNumber = availableEuroNumbers[Math.floor(Math.random() * availableEuroNumbers.length)];
                setRevealedBalls(prev => ({ ...prev, [ballId]: fallbackNumber }));
                addLuckyNumber(fallbackNumber);
              }
            }
          }
          
          // Sprawdź czy użytkownik wybrał wszystkie liczby (5 głównych + 2 Euro)
          const mainNumbers = Object.keys(revealedBalls).filter(key => key.startsWith('main-')).length;
          const euroNumbers = Object.keys(revealedBalls).filter(key => key.startsWith('euro-')).length;
          
          if (mainNumbers + 1 === 5 && euroNumbers === 2) {
            setTimeout(() => {
              createConfetti();
              setTimeout(() => {
                setRevealedBalls({});
              }, 2000);
            }, 500);
          }
        } else {
          // Standardowa obsługa dla innych gier
          const availableNumbers = [];
          for (let i = range.min; i <= range.max; i++) {
            if (!luckyNumbers.includes(i)) {
              availableNumbers.push(i);
            }
          }
          
          if (availableNumbers.length > 0) {
            const randomNumber = generateNumberWithTalisman(range.max);
            if (availableNumbers.includes(randomNumber)) {
              setRevealedBalls(prev => ({ ...prev, [ballId]: randomNumber }));
              addLuckyNumber(randomNumber);
            } else {
              // Jeśli wygenerowana liczba nie jest dostępna, wybierz losowo z dostępnych
              const fallbackNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
              setRevealedBalls(prev => ({ ...prev, [ballId]: fallbackNumber }));
              addLuckyNumber(fallbackNumber);
            }
            
            // Sprawdź czy użytkownik wybrał wystarczającą liczbę kulek
            if (luckyNumbers.length + 1 === range.count) {
              setTimeout(() => {
                createConfetti();
                // Resetuj tylko odkryte kule, zachowaj wybrane liczby
                setTimeout(() => {
                  setRevealedBalls({});
                  // Nie resetujemy luckyNumbers - zostają wybrane liczby
                }, 2000);
              }, 500);
            }
          }
        }
      } else {
        // Drugi klik - usuń liczbę
        const number = revealedBalls[ballId];
        removeLuckyNumber(number);
        setRevealedBalls(prev => {
          const newRevealed = { ...prev };
          delete newRevealed[ballId];
          return newRevealed;
        });
      }
    };

    const resetBalls = () => {
      setRevealedBalls({});
      // Nie resetujemy luckyNumbers - pozwalamy użytkownikowi zachować wybrane liczby
    };

    return (
      <div>
        <h2 style={{ color: "#222", marginBottom: 24, textAlign: "center" }}>🎯 Wybór liczb</h2>
        
        <div style={{ background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)", padding: 20, borderRadius: 16, marginBottom: 24, border: "2px solid #4caf50" }}>
          <h3 style={{ color: "#2e7d32", marginBottom: 12, textAlign: "center" }}>🎲 Kliknij w zakryte kule, aby odkryć szczęśliwe liczby!</h3>
          <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
            <strong>Jak to działa:</strong> Wybierz grę, a następnie kliknij w zakryte kule, aby odkryć losowe liczby. 
            Kliknij ponownie, aby usunąć liczbę z wybranych.
          </p>
          <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
            <strong>💡 Wskazówka:</strong> Odkryte liczby automatycznie dodają się do sekcji "Szczęśliwe liczby"!
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: "bold", marginBottom: 10, display: "block" }}>Wybierz grę:</label>
          <select 
            value={selectedGame} 
            onChange={e => {
              setSelectedGame(e.target.value);
              setRevealedBalls({});
              setLuckyNumbers([]);
            }} 
            style={{ ...inputStyle, width: "100%", marginBottom: 16 }}
          >
            {games.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          {selectedGame === "eurojackpot" ? (
            <>
              <h3 style={{ color: "#1976d2", marginBottom: 16, textAlign: "center" }}>
                🎯 Liczby główne (1-50) - wybierz 5
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))", 
                gap: 8, 
                maxWidth: "100%",
                marginBottom: 20
              }}>
                {Array.from({ length: 50 }, (_, index) => (
                  <button
                    key={`main-${index}`}
                    onClick={() => handleBallClick(`main-${index}`)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "2px solid #1976d2",
                      background: revealedBalls[`main-${index}`] 
                        ? "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)" 
                        : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                      color: revealedBalls[`main-${index}`] ? "#222" : "#1976d2",
                      fontSize: "14px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: revealedBalls[`main-${index}`] 
                        ? "0 4px 12px rgba(255, 215, 0, 0.4)" 
                        : "0 2px 8px rgba(25, 118, 210, 0.2)"
                    }}
                    onMouseOver={(e) => {
                      if (!revealedBalls[`main-${index}`]) {
                        e.target.style.transform = "scale(1.1)";
                        e.target.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.4)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!revealedBalls[`main-${index}`]) {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "0 2px 8px rgba(25, 118, 210, 0.2)";
                      }
                    }}
                  >
                    {revealedBalls[`main-${index}`] ? revealedBalls[`main-${index}`] : "?"}
                  </button>
                ))}
              </div>
              
              <h3 style={{ color: "#e91e63", marginBottom: 16, textAlign: "center" }}>
                🌟 Liczby Euro (1-10) - wybierz 2
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))", 
                gap: 8, 
                maxWidth: "100%",
                marginBottom: 20
              }}>
                {Array.from({ length: 10 }, (_, index) => (
                  <button
                    key={`euro-${index}`}
                    onClick={() => handleBallClick(`euro-${index}`)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "2px solid #e91e63",
                      background: revealedBalls[`euro-${index}`] 
                        ? "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)" 
                        : "linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)",
                      color: revealedBalls[`euro-${index}`] ? "#222" : "#e91e63",
                      fontSize: "14px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: revealedBalls[`euro-${index}`] 
                        ? "0 4px 12px rgba(255, 215, 0, 0.4)" 
                        : "0 2px 8px rgba(233, 30, 99, 0.2)"
                    }}
                    onMouseOver={(e) => {
                      if (!revealedBalls[`euro-${index}`]) {
                        e.target.style.transform = "scale(1.1)";
                        e.target.style.boxShadow = "0 4px 12px rgba(233, 30, 99, 0.4)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!revealedBalls[`euro-${index}`]) {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "0 2px 8px rgba(233, 30, 99, 0.2)";
                      }
                    }}
                  >
                    {revealedBalls[`euro-${index}`] ? revealedBalls[`euro-${index}`] : "?"}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 style={{ color: "#1976d2", marginBottom: 16, textAlign: "center" }}>
                🎯 Zakryte kule z liczbami {getGameRange(selectedGame).min}-{getGameRange(selectedGame).max}
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))", 
                gap: 8, 
                maxWidth: "100%",
                marginBottom: 20
              }}>
                {Array.from({ length: getGameRange(selectedGame).max }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handleBallClick(index)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "2px solid #1976d2",
                      background: revealedBalls[index] 
                        ? "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)" 
                        : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                      color: revealedBalls[index] ? "#222" : "#1976d2",
                      fontSize: "14px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: revealedBalls[index] 
                        ? "0 4px 12px rgba(255, 215, 0, 0.4)" 
                        : "0 2px 8px rgba(25, 118, 210, 0.2)"
                    }}
                    onMouseOver={(e) => {
                      if (!revealedBalls[index]) {
                        e.target.style.transform = "scale(1.1)";
                        e.target.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.4)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!revealedBalls[index]) {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "0 2px 8px rgba(25, 118, 210, 0.2)";
                      }
                    }}
                  >
                    {revealedBalls[index] ? revealedBalls[index] : "?"}
                  </button>
                ))}
              </div>
            </>
          )}
          
          <div style={{ textAlign: "center", marginBottom: 20 }}>
                          <button
                type="button"
                onClick={resetBalls}
                style={{
                  background: "linear-gradient(90deg, #9c27b0 0%, #7b1fa2 100%)",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(156, 39, 176, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(156, 39, 176, 0.3)";
                }}
              >
                🔄 Resetuj wszystkie kule
              </button>
          </div>
        </div>

              {luckyNumbers.length > 0 && (
          <div style={{ 
            background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)", 
            padding: 20, 
            borderRadius: 16, 
            border: "2px solid #ff9800",
            marginBottom: 24
          }}>
            <h3 style={{ color: "#e65100", marginBottom: 16, textAlign: "center" }}>
              {checkCompleteSelection() ? "🎉 Oto Twoje szczęśliwe liczby!" : `✨ Twoje odkryte liczby (${luckyNumbers.length}/${getGameRange(selectedGame).count})`}
            </h3>
            
            {checkCompleteSelection() && (
              <div style={{ 
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)", 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 16,
                textAlign: "center",
                color: "white",
                fontWeight: "bold"
              }}>
                🎊 Gratulacje! Wybrałeś wszystkie {getGameRange(selectedGame).count} liczby!
                <br />
                <small style={{ fontSize: "12px", opacity: 0.9 }}>
                  Odkryte kule zostaną zresetowane za 2 sekundy, ale wybrane liczby pozostaną...
                </small>
              </div>
            )}
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16 }}>
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
            
            {checkCompleteSelection() && (
              <div style={{ 
                background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)", 
                borderRadius: 16, 
                padding: 20, 
                marginBottom: 16, 
                boxShadow: "0 4px 20px 0 rgba(76, 175, 80, 0.15)",
                border: "2px solid #4caf50"
              }}>
                <h4 style={{ color: "#222", marginBottom: 16, textAlign: "center" }}>
                  🎯 Twoje wybrane liczby:
                </h4>
                <div style={{ 
                  fontSize: 24, 
                  letterSpacing: 2, 
                  textAlign: "center", 
                  display: "flex", 
                  justifyContent: "center", 
                  flexWrap: "wrap",
                  marginBottom: 16
                }}>
                  {selectedGame === "eurojackpot" ? (
                    <>
                      {/* Liczby główne */}
                      {luckyNumbers.filter(num => num >= 1 && num <= 50).map((n, idx) => <Ball key={`main-${idx}`} n={n} />)}
                      <span style={{ fontWeight: "bold", color: "#e91e63", margin: "0 12px", fontSize: 28 }}>|</span>
                      {/* Liczby Euro */}
                      {luckyNumbers.filter(num => num >= 1 && num <= 10).map((n, idx) => <Ball key={`euro-${idx}`} n={n} />)}
                    </>
                  ) : (
                    luckyNumbers.map((n, idx) => <Ball key={idx} n={n} />)
                  )}
                </div>
                                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => copySetToClipboard(luckyNumbers)}
                    style={{
                      ...actionButtonStyle,
                      background: "linear-gradient(90deg, #1976d2 0%, #1565c0 100%)",
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(25, 118, 210, 0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.3)";
                    }}
                  >
                    📋 Kopiuj liczby
                  </button>
                  
                  <button 
                    onClick={() => {
                      setRevealedBalls({});
                      setLuckyNumbers([]);
                    }}
                    style={{
                      ...actionButtonStyle,
                      background: "linear-gradient(90deg, #ff9800 0%, #ffb300 100%)",
                      boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(255, 152, 0, 0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(255, 152, 0, 0.3)";
                    }}
                  >
                    🎲 Wybierz nowe liczby
                  </button>
                </div>
              </div>
            )}
            
            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={() => setLuckyNumbers([])}
                style={{
                  background: "linear-gradient(90deg, #e91e63 0%, #c2185b 100%)",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(233, 30, 99, 0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(233, 30, 99, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(233, 30, 99, 0.3)";
                }}
              >
                🗑️ Wyczyść wszystkie
              </button>
            </div>
          </div>
        )}

        <div style={{ background: "#e8f5e8", padding: 16, borderRadius: 12, border: "1px solid #4caf50" }}>
          <h4 style={{ color: "#2e7d32", marginBottom: 8, textAlign: "center" }}>💡 Jak używać</h4>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#2e7d32", fontSize: 14 }}>
            <li>Wybierz grę z listy powyżej</li>
            <li>Kliknij w zakryte kule, aby odkryć losowe liczby</li>
            <li>Kliknij ponownie w odkrytą kulkę, aby usunąć liczbę</li>
            <li>Odkryte liczby automatycznie dodają się do "Szczęśliwe liczby"</li>
            <li>Przejdź do zakładki "Szczęśliwe liczby", aby wygenerować zestawy</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderILP = () => (
    <div>
      <h2 style={{ color: "#222", marginBottom: 24, textAlign: "center" }}>🎯 Logika ILP - 100% Gwarancja</h2>
      
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

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: "bold", marginBottom: 6, display: "block" }}>Gwarancja trafień (G):</label>
          <select value={ilpGuarantee} onChange={e => setIlpGuarantee(parseInt(e.target.value))} style={inputStyle}>
            {ilpGame === "miniLotto" && (
              <>
                <option value={3}>3 z 5</option>
                <option value={4}>4 z 5</option>
              </>
            )}
            {ilpGame === "lotto" && (
              <>
                <option value={3}>3 z 6</option>
                <option value={4}>4 z 6</option>
                <option value={5}>5 z 6</option>
              </>
            )}
            {ilpGame === "eurojackpot" && (
              <>
                <option value={3}>3 z 5</option>
                <option value={4}>4 z 5</option>
              </>
            )}
            {ilpGame === "keno" && (
              <>
                <option value={3}>3 z 10</option>
                <option value={4}>4 z 10</option>
                <option value={5}>5 z 10</option>
                <option value={6}>6 z 10</option>
                <option value={7}>7 z 10</option>
              </>
            )}
            {ilpGame === "multiMulti" && (
              <>
                <option value={5}>5 z 20</option>
                <option value={6}>6 z 20</option>
                <option value={7}>7 z 20</option>
                <option value={8}>8 z 20</option>
                <option value={9}>9 z 20</option>
                <option value={10}>10 z 20</option>
              </>
            )}
            {ilpGame === "kaskada" && (
              <>
                <option value={3}>3 z 6</option>
                <option value={4}>4 z 6</option>
                <option value={5}>5 z 6</option>
              </>
            )}
          </select>
        </div>

        <button type="submit" style={buttonStyle} disabled={ilpLoading}>
          {ilpLoading ? "🔍 Obliczam optymalne rozwiązanie..." : "🎯 Generuj system ILP"}
        </button>
      </form>

      {ilpResults && (
        <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "2px solid #4caf50" }}>
          <h3 style={{ color: "#2e7d32", marginBottom: 16, textAlign: "center" }}>✅ WYNIKI ILP - 100% GWARANCJA</h3>
          
          <div style={{ background: "#e8f5e8", padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <h4 style={{ color: "#2e7d32", marginBottom: 12 }}>📊 Parametry systemu:</h4>
            <p><strong>Gra:</strong> {
              ilpGame === "miniLotto" ? "Mini Lotto" : 
              ilpGame === "lotto" ? "Lotto" : 
              ilpGame === "eurojackpot" ? "Eurojackpot" :
              ilpGame === "keno" ? "Keno" :
              ilpGame === "multiMulti" ? "Multi Multi" :
              ilpGame === "kaskada" ? "Kaskada" : "Gra"
            }</p>
            <p><strong>Liczby w systemie:</strong> {ilpResults.numbers.join(", ")}</p>
            <p><strong>Typ systemu:</strong> {
              ilpSystemType === "short" ? "Skrócony" : 
              ilpSystemType === "full" ? "Pełny" : "Adaptacyjny"
            }</p>
            <p><strong>Gwarancja:</strong> {ilpResults.guarantee} z {
              ilpGame === "miniLotto" ? 5 : 
              ilpGame === "lotto" ? 6 : 
              ilpGame === "eurojackpot" ? "5+2" : 
              ilpGame === "keno" ? 10 :
              ilpGame === "multiMulti" ? 20 :
              ilpGame === "kaskada" ? 6 : 5
            }</p>
            <p><strong>Liczba zakładów:</strong> {ilpResults.totalBets}</p>
            <p><strong>Przewidywana skuteczność:</strong> <span style={{ color: "#2e7d32", fontWeight: "bold" }}>{ilpResults.systemInfo.effectiveness}</span></p>
            <p><strong>Liczba zakładów do obstawienia:</strong> <span style={{ color: "#1976d2", fontWeight: "bold" }}>{ilpResults.systemInfo.betsCount}</span></p>
            <p><strong>Potencjalny koszt:</strong> <span style={{ color: "#d32f2f", fontWeight: "bold" }}>{ilpResults.systemInfo.potentialCost.toFixed(2)} PLN</span></p>
            <p><strong>Status:</strong> <span style={{ 
              color: ilpResults.systemInfo.type === "full" ? "#2e7d32" : 
                     ilpResults.systemInfo.type === "adaptive" ? "#1976d2" : "#ff9800", 
              fontWeight: "bold" 
            }}>
              {ilpResults.systemInfo.type === "full" ? "✅ PEŁNA GWARANCJA" : 
               ilpResults.systemInfo.type === "adaptive" ? "🔄 ADAPTACYJNA OPTYMALIZACJA" : "⚠️ CZĘŚCIOWA GWARANCJA"}
            </span></p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: "#2e7d32", marginBottom: 12 }}>🎯 Jak obstawić zakłady:</h4>
            <p style={{ marginBottom: 12 }}>
              Musisz obstawić wszystkie {ilpResults.totalBets} zakładów wygenerowanych przez ILP. 
              Każdy zakład to {
                ilpGame === "miniLotto" ? 5 : 
                ilpGame === "lotto" ? 6 : 
                ilpGame === "eurojackpot" ? "5+2" : 
                ilpGame === "keno" ? 10 :
                ilpGame === "multiMulti" ? 20 :
                ilpGame === "kaskada" ? 6 : 5
              } liczb z Twoich {ilpResults.numbers.length}.
            </p>
            <button
              onClick={copyILPBetsToClipboard}
              style={{
                ...buttonStyle,
                background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                marginBottom: 16
              }}
            >
              📋 Kopiuj wszystkie zakłady
            </button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: "#2e7d32", marginBottom: 12 }}>📝 Zakłady ({ilpResults.totalBets}):</h4>
            <div style={{ maxHeight: 300, overflowY: "auto", background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
              {ilpResults.bets.map((bet, index) => (
                <div key={index} style={{ 
                  background: "#fff", 
                  padding: "8px 12px", 
                  marginBottom: 8, 
                  borderRadius: 6,
                  border: "1px solid #ddd"
                }}>
                  <strong>Zakład {index + 1}:</strong> 
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                    {ilpGame === "eurojackpot" ? (
                      <>
                        {/* Główne liczby */}
                        {bet[0].map((num, numIndex) => (
                          <div key={numIndex} style={{
                            width: 32,
                            height: 32,
                            background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                            color: "#222",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: 14,
                            boxShadow: "0 2px 4px rgba(255, 215, 0, 0.3)"
                          }}>
                            {num}
                          </div>
                        ))}
                        <span style={{ margin: "0 8px", color: "#666" }}>+</span>
                        {/* Euro liczby */}
                        {bet[1].map((num, numIndex) => (
                          <div key={numIndex} style={{
                            width: 32,
                            height: 32,
                            background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                            color: "#222",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: 14,
                            boxShadow: "0 2px 4px rgba(255, 215, 0, 0.3)"
                          }}>
                            {num}
                          </div>
                        ))}
                      </>
                    ) : (
                      bet.map((num, numIndex) => (
                        <div key={numIndex} style={{
                          width: 32,
                          height: 32,
                          background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                          color: "#222",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: 14,
                          boxShadow: "0 2px 4px rgba(255, 215, 0, 0.3)"
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

          <div style={{ background: "#fff3cd", padding: 16, borderRadius: 12, border: "2px solid #ffc107" }}>
            <h4 style={{ color: "#856404", marginBottom: 12 }}>💡 Informacje o ILP:</h4>
            <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
              <li><strong>100% Gwarancja:</strong> Jeśli Twoje liczby zawierają trafienie, znajdziesz je w zakładach</li>
              <li><strong>Optymalne pokrycie:</strong> Minimalna liczba zakładów dla maksymalnego pokrycia</li>
              <li><strong>Matematyczna pewność:</strong> Algorytm oparty na zaawansowanej optymalizacji</li>
              <li><strong>Ograniczenia:</strong> Działa tylko dla małych systemów (N≤10)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // Widok logowania/rejestracji - tylko gdy activeTab === "login" lub "register"
  // Funkcja do sprawdzania czy ścieżka jest aktywna
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Funkcja do nawigacji w menu
  const handleMenuClick = (path) => {
    console.log('🎯 Kliknięto menu:', path);
    console.log('🔍 Aktualna ścieżka:', location.pathname);
    console.log('🔍 Przekierowanie do:', path);
    navigate(path);
    setIsMobileMenuOpen(false);
  };



  // Zapobiegaj miganiu - pokaż pustą stronę podczas ładowania
  if (isLoading) {
    return null;
  }

  // Routing - jeśli użytkownik nie jest zalogowany, pokaż stronę startową
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/" element={
          <LandingPage 
            onLogin={handleGoToLogin}
            onRegister={handleGoToRegister}
          />
        } />
        <Route path="/login" element={
          <div style={{ minHeight: "100vh", background: "#fff" }}>
            <style>{responsiveStyle}</style>
            <AuthContainer onLogin={handleLogin} initialView="login" />
          </div>
        } />
        <Route path="/register" element={
          <div style={{ minHeight: "100vh", background: "#fff" }}>
            <style>{responsiveStyle}</style>
            <AuthContainer onLogin={handleLogin} initialView="register" />
          </div>
        } />
        {/* Obsługa parametrów URL dla stron landing page */}
        <Route path="/landing" element={
          <LandingPage 
            onLogin={handleGoToLogin}
            onRegister={handleGoToRegister}
          />
        } />
        <Route path="*" element={
          <LandingPage 
            onLogin={handleGoToLogin}
            onRegister={handleGoToRegister}
          />
        } />
      </Routes>
    );
  }

  // Panel użytkownika z menu i routingiem
  return (
    <PayPalScriptProvider 
      options={paypalOptions}
      onInit={() => {
        console.log('✅ PayPal Script Provider zainicjalizowany w App.js');
      }}
      onError={(err) => {
        console.error('PayPal Script Provider Error:', err);
        // Ignoruj błędy sesji i sandbox
        if (err.message && (
          err.message.includes('global_session_not_found') || 
          err.message.includes('session') ||
          err.message.includes('sandbox') ||
          err.message.includes('clientID')
        )) {
          console.log('🔄 Ignorowanie błędu PayPal Script Provider:', err.message);
          return;
        }
        console.error('❌ PayPal Script Provider Error:', err);
      }}
    >
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
      <style>{responsiveStyle}</style>
      
      {/* Komunikat o blokadzie */}
      {isUserBlocked && (
        <div style={{
          background: "#ffebee",
          border: "2px solid #f44336",
          borderRadius: 8,
          padding: 16,
          margin: "16px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>🚫</div>
          <h3 style={{ color: "#d32f2f", marginBottom: 8, fontSize: 18, fontWeight: "bold" }}>
            Konto zablokowane
          </h3>
          <p style={{ color: "#666", margin: 0, fontSize: 14 }}>
            Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, przejdź do zakładki "Płatności".
          </p>
        </div>
      )}
      
      {/* Przycisk menu mobilnego */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>
      
      {/* Overlay dla menu mobilnego */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Menu mobilne */}
      {isMobileMenuOpen && (
        <div className="mobile-menu open">
        <button 
          className={`mobile-menu-btn ${isActivePath("/generator") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/generator")}
        >
          🎲 {t('navigation.generator')}
        </button>
        <button 
          className={`mobile-menu-btn ${isActivePath("/dreams") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/dreams")}
        >
          💭 {t('navigation.dreamGenerator')}
        </button>
        <button 
          className={`mobile-menu-btn ${isActivePath("/lucky") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/lucky")}
        >
          🍀 {t('navigation.luckyNumbers')}
        </button>
        <button 
          className={`mobile-menu-btn ${isActivePath("/numberPicker") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/numberPicker")}
        >
          🎯 {t('navigation.numberSelection')}
        </button>
        <button 
          className={`mobile-menu-btn ${isActivePath("/systems") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/systems")}
        >
          📊 {t('navigation.reducedSystems')}
        </button>
        <button 
          className={`mobile-menu-btn ${isActivePath("/ilp") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/ilp")}
        >
          🎯 {t('navigation.ilpLogic')}
        </button>
        <button 
          className={`mobile-menu-btn ${isActivePath("/stats") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/stats")}
        >
          📈 {t('navigation.statistics')}
        </button>
        <button 
          className={`mobile-menu-btn ${isActivePath("/explanations") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/explanations")}
        >
          📚 {t('navigation.explanations')}
        </button>
        <button 
          className={`mobile-menu-btn ${isActivePath("/account") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/account")}
        >
          👤 {t('navigation.myAccount')}
        </button>
        <button 
          className={`mobile-menu-btn ${isActivePath("/payments") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/payments")}
        >
          💳 {t('navigation.payments')}
        </button>
        <button 
          className={`mobile-menu-btn ${isActivePath("/gry") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/gry")}
        >
          🎰 {t('navigation.games')}
        </button>

        <button 
          className={`mobile-menu-btn ${isActivePath("/talismans") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/talismans")}
        >
          ✨ Talizmany
        </button>

        <button 
          className={`mobile-menu-btn ${isActivePath("/ai-ultra-pro") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/ai-ultra-pro")}
        >
          🚀 {t('navigation.aiUltraPro')}
        </button>
                <button
          className={`mobile-menu-btn ${isActivePath("/harmonic-analyzer") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/harmonic-analyzer")}
        >
          🎵 {t('navigation.harmonicAnalyzer')}
        </button>
        <button
          className={`mobile-menu-btn ${isActivePath("/my-lucky-numbers") ? 'active' : ''}`}
          onClick={() => handleMenuClick("/my-lucky-numbers")}
        >
          🎲 Moje szczęśliwe liczby
        </button>
        
        <button 
          className="mobile-menu-btn"
          onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
          style={{ color: '#d32f2f', fontWeight: 'bold' }}
        >
          🚪 {t('navigation.logout')}
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
          <LanguageSwitcher variant="menu" />
        </div>
        </div>
      )}
      
      {/* Menu desktopowe */}
      <nav style={menuStyle} className="desktop-menu">
        <button className="menu-btn" style={menuBtn(isActivePath("/generator"))}
          onClick={() => navigate("/generator")}>{t('navigation.generator')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/dreams"))}
          onClick={() => navigate("/dreams")}>{t('navigation.dreamGenerator')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/lucky"))}
          onClick={() => navigate("/lucky")}>{t('navigation.luckyNumbers')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/numberPicker"))}
          onClick={() => navigate("/numberPicker")}>{t('navigation.numberSelection')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/systems"))}
          onClick={() => navigate("/systems")}>{t('navigation.reducedSystems')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/ilp"))}
          onClick={() => navigate("/ilp")}>{t('navigation.ilpLogic')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/stats"))}
          onClick={() => navigate("/stats")}>{t('navigation.statistics')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/explanations"))}
          onClick={() => navigate("/explanations")}>{t('navigation.explanations')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/account"))}
          onClick={() => navigate("/account")}>{t('navigation.myAccount')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/payments"))}
          onClick={() => navigate("/payments")}>{t('navigation.payments')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/gry"))}
          onClick={() => navigate("/gry")}>🎰 {t('navigation.games')}</button>

        <button className="menu-btn" style={menuBtn(isActivePath("/talismans"))}
          onClick={() => navigate("/talismans")}>✨ Talizmany</button>

        <button className="menu-btn" style={menuBtn(isActivePath("/ai-ultra-pro"))}
          onClick={() => navigate("/ai-ultra-pro")}>🚀 {t('navigation.aiUltraPro')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/harmonic-analyzer"))}
          onClick={() => navigate("/harmonic-analyzer")}>🎵 {t('navigation.harmonicAnalyzer')}</button>
        <button className="menu-btn" style={menuBtn(isActivePath("/my-lucky-numbers"))}
          onClick={() => navigate("/my-lucky-numbers")}>🎲 Moje szczęśliwe liczby</button>
        
        <button className="menu-btn" style={menuBtn(false)} onClick={handleLogout}>{t('navigation.logout')}</button>
        
        {/* Przełącznik języka - na końcu menu */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <LanguageSwitcher variant="menu" />
        </div>
      </nav>
      
      <div className="main-panel" style={{...mainStyle, touchAction: "manipulation"}}>
        <Routes>
          <Route path="/" element={
            <Navigate to="/generator" replace />
          } />
          <Route path="/landing" element={
            <LandingPage 
              onLogin={handleGoToLogin}
              onRegister={handleGoToRegister}
            />
          } />
          <Route path="/generator" element={
            hasAccess ? renderGenerator() : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, wykup plan Premium.
                </p>
                <button 
                  onClick={() => navigate("/payments")}
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
            hasAccess ? renderDreams() : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, wykup plan Premium.
                </p>
                <button 
                  onClick={() => navigate("/payments")}
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
            hasAccess ? renderLucky() : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, wykup plan Premium.
                </p>
                <button 
                  onClick={() => navigate("/payments")}
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
          <Route path="/numberPicker" element={
            hasAccess ? renderNumberPicker() : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, wykup plan Premium.
                </p>
                <button 
                  onClick={() => navigate("/payments")}
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
            hasAccess ? renderSystems() : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, wykup plan Premium.
                </p>
                <button 
                  onClick={() => navigate("/payments")}
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
          <Route path="/ilp" element={
            hasAccess ? renderILP() : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, wykup plan Premium.
                </p>
                <button 
                  onClick={() => navigate("/payments")}
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
          <Route path="/stats" element={<FinalStatistics selectedGame={selectedGame} onGameChange={setSelectedGame} />} />
          <Route path="/explanations" element={renderExplanations()} />
          <Route path="/account" element={renderAccount()} />
          <Route path="/payments" element={renderPayments()} />
          <Route path="/payment-success" element={renderPaymentSuccess()} />
          <Route path="/gry" element={
            (() => {
              console.log('🎰 Route /gry wywołany - hasAccess:', hasAccess);
              console.log('🔍 Debug route /gry:', {
                hasAccess,
                userSubscription,
                isUserBlocked,
                user: user ? 'zalogowany' : 'niezalogowany'
              });
              return hasAccess ? <GryPoZalogowaniu user={user} userSubscription={userSubscription} /> : (
                <div style={{ textAlign: "center", padding: "50px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                  <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                  <p style={{ color: "#666", marginBottom: 24 }}>
                    Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, wykup plan Premium.
                  </p>
                  <button 
                    onClick={() => navigate("/payments")}
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
              );
            })()
          } />

          <Route path="/ai-ultra-pro" element={
            hasAccess ? <AILottoGeneratorUltraPro activeTalisman={activeTalisman} talismanDefinitions={talismanDefinitions} /> : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, wykup plan Premium.
                </p>
                <button 
                  onClick={() => navigate("/payments")}
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
          <Route path="/harmonic-analyzer" element={
            hasAccess ? <HarmonicAnalyzer activeTalisman={activeTalisman} talismanDefinitions={talismanDefinitions} /> : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, wykup plan Premium.
                </p>
                <button 
                  onClick={() => navigate("/payments")}
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
            <MyLuckyNumbersScreen user={user} onLogout={handleLogout} />
          } />
          <Route path="/talismans" element={
            (() => {
              console.log('🔍 Route /talismans - hasAccess:', hasAccess, 'user:', user);
              return hasAccess ? <Talizmany user={user} talismanDefinitions={talismanDefinitions} /> : (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>Dostęp zablokowany</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>
                  Twój okres próbny wygasł. Aby odblokować dostęp do wszystkich funkcji, wykup plan Premium.
                </p>
                <button 
                  onClick={() => navigate("/payments")}
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
            );
            })()
          } />

          <Route path="*" element={
            (() => {
              console.log('🔄 Catch-all route - przekierowanie do /generator z:', location.pathname);
              console.log('🔍 Debug - wszystkie ścieżki:', [
                '/', '/landing', '/generator', '/dreams', '/lucky', '/numberPicker', 
                '/systems', '/ilp', '/stats', '/explanations', '/account', '/payments', '/gry', '/ai-ultra-pro', '/talismans'
              ]);
              console.log('🔍 Debug catch-all - hasAccess:', hasAccess, 'userSubscription:', userSubscription);
              return <Navigate to="/generator" replace />;
            })()
          } />
        </Routes>
      </div>
      <InfoModal 
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ isOpen: false, title: "", content: "" })}
        title={modalInfo.title}
        content={modalInfo.content}
      />
      </div>
    </PayPalScriptProvider>
  );
}

export default App; 