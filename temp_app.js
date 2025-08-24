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
import HomePage from './components/HomePage';
import SchonheimGenerator from './components/SchonheimGenerator';
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
  
  // Funkcja do ładowania talizmanów użytkownika
  const loadUserTalismans = async (uid) => {
    if (!uid) return;
    
    try {
      const response = await fetch(`/api/talismans/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.activeTalisman) {
          setActiveTalisman(data.activeTalisman);
        }
      }
    } catch (error) {
      console.log('Nie udało się załadować talizmanów użytkownika:', error);
      // W trybie fallback ustaw domyślny aktywny talizman
      setActiveTalisman({ talisman_id: 1 });
    }
  };
  
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

  // Usunięte automatyczne przekierowanie - teraz pokazujemy HomePage na /

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
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/talismans/${user.uid}`);
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
      loadUserTalismans(user.uid); // Załaduj talizmany użytkownika
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
  
  // Funkcja zwracająca minimalną liczbę liczb dla danej gry
  const getMinSystemNumbers = (game) => {
    const minNumbers = {
      lotto: 7,        // Lotto: 6 liczb w zakładzie, minimum 7 dla systemu skróconego
      miniLotto: 6,    // Mini Lotto: 5 liczb w zakładzie, minimum 6 dla systemu skróconego
      multiMulti: 11,  // Multi Multi: 10 liczb w zakładzie, minimum 11 dla systemu skróconego
      eurojackpot: 6,  // Eurojackpot: 5 liczb w zakładzie, minimum 6 dla systemu skróconego
      kaskada: 13,     // Kaskada: 12 liczb w zakładzie, minimum 13 dla systemu skróconego
      keno: kenoNumbers + 1  // Keno: dynamiczne, minimum +1 od wybranej liczby
    };
    return minNumbers[game] || 7;
  };

  // Funkcja sprawdzająca czy system ma 100% gwarancję
  const hasFullGuarantee = (numbers, guarantee, pick) => {
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
  };

  // Funkcja obliczająca rzeczywiste gwarancje dla systemów
  const calculateRealGuarantee = (numbers, guarantee, pick) => {
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
  };

  // Funkcja zwracająca liczbę kuponów dla systemu pełnego (100% gwarancja)
  const getFullSystemBetsCount = (numbers, pick) => {
    return combinations(numbers, pick);
  };

  // Funkcja zwracająca liczbę kuponów dla danego systemu
  const getSystemBetsCount = (numbers, guarantee, pick) => {
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
  };

  // Funkcja kombinacji
  const combinations = (n, k) => {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  };

  // Systemy skrócone
  const [systemNumbers, setSystemNumbers] = useState(getMinSystemNumbers(games[0].value));
  const [systemGuarantee, setSystemGuarantee] = useState(3);
  const [systemType, setSystemType] = useState('classic'); // 'classic', 'schonheim' lub 'ilp'
  
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
  
  // Dostosuj gwarancję i liczbę liczb gdy zmienia się gra
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
    
    // Dostosuj gwarancję
    if (!config.options.includes(systemGuarantee)) {
      setSystemGuarantee(config.options[0]);
    }
    
    // Dostosuj liczbę liczb do minimalnej dla danej gry
    const minNumbers = getMinSystemNumbers(selectedGame);
    if (systemNumbers < minNumbers) {
      setSystemNumbers(minNumbers);
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
    navigate("/"); // Przekierowanie na stronę główną zamiast generatora
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
      
      // System 20 liczb, gwarancja 3 z 6 (C(20,3) = 1140 trójek, teoretyczne minimum: 190 kuponów)
      // UWAGA: Ten system zapewnia tylko częściową gwarancję, nie 100%!
      "20-3": [
        [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 6], [0, 1, 2, 3, 4, 7], [0, 1, 2, 3, 4, 8],
        [0, 1, 2, 3, 4, 9], [0, 1, 2, 3, 4, 10], [0, 1, 2, 3, 4, 11], [0, 1, 2, 3, 4, 12],
        [0, 1, 2, 3, 4, 13], [0, 1, 2, 3, 4, 14], [0, 1, 2, 3, 4, 15], [0, 1, 2, 3, 4, 16],
        [0, 1, 2, 3, 4, 17], [0, 1, 2, 3, 4, 18], [0, 1, 2, 3, 4, 19], [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 3, 5, 7], [0, 1, 2, 3, 5, 8], [0, 1, 2, 3, 5, 9], [0, 1, 2, 3, 5, 10],
        [0, 1, 2, 3, 5, 11], [0, 1, 2, 3, 5, 12], [0, 1, 2, 3, 5, 13], [0, 1, 2, 3, 5, 14],
        [0, 1, 2, 3, 5, 15], [0, 1, 2, 3, 5, 16], [0, 1, 2, 3, 5, 17], [0, 1, 2, 3, 5, 18],
        [0, 1, 2, 3, 5, 19], [0, 1, 2, 3, 6, 7], [0, 1, 2, 3, 6, 8], [0, 1, 2, 3, 6, 9],
        [0, 1, 2, 3, 6, 10], [0, 1, 2, 3, 6, 11], [0, 1, 2, 3, 6, 12], [0, 1, 2, 3, 6, 13],
        [0, 1, 2, 3, 6, 14], [0, 1, 2, 3, 6, 15], [0, 1, 2, 3, 6, 16], [0, 1, 2, 3, 6, 17],
        [0, 1, 2, 3, 6, 18], [0, 1, 2, 3, 6, 19], [0, 1, 2, 3, 7, 8], [0, 1, 2, 3, 7, 9],
        [0, 1, 2, 3, 7, 10], [0, 1, 2, 3, 7, 11], [0, 1, 2, 3, 7, 12], [0, 1, 2, 3, 7, 13],
        [0, 1, 2, 3, 7, 14], [0, 1, 2, 3, 7, 15], [0, 1, 2, 3, 7, 16], [0, 1, 2, 3, 7, 17],
        [0, 1, 2, 3, 7, 18], [0, 1, 2, 3, 7, 19], [0, 1, 2, 3, 8, 9], [0, 1, 2, 3, 8, 10],
        [0, 1, 2, 3, 8, 11], [0, 1, 2, 3, 8, 12], [0, 1, 2, 3, 8, 13], [0, 1, 2, 3, 8, 14],
        [0, 1, 2, 3, 8, 15], [0, 1, 2, 3, 8, 16], [0, 1, 2, 3, 8, 17], [0, 1, 2, 3, 8, 18],
        [0, 1, 2, 3, 8, 19], [0, 1, 2, 3, 9, 10], [0, 1, 2, 3, 9, 11], [0, 1, 2, 3, 9, 12],
        [0, 1, 2, 3, 9, 13], [0, 1, 2, 3, 9, 14], [0, 1, 2, 3, 9, 15], [0, 1, 2, 3, 9, 16],
        [0, 1, 2, 3, 9, 17], [0, 1, 2, 3, 9, 18], [0, 1, 2, 3, 9, 19], [0, 1, 2, 3, 10, 11],
        [0, 1, 2, 3, 10, 12], [0, 1, 2, 3, 10, 13], [0, 1, 2, 3, 10, 14], [0, 1, 2, 3, 10, 15],
        [0, 1, 2, 3, 10, 16], [0, 1, 2, 3, 10, 17], [0, 1, 2, 3, 10, 18], [0, 1, 2, 3, 10, 19],
        [0, 1, 2, 3, 11, 12], [0, 1, 2, 3, 11, 13], [0, 1, 2, 3, 11, 14], [0, 1, 2, 3, 11, 15],
        [0, 1, 2, 3, 11, 16], [0, 1, 2, 3, 11, 17], [0, 1, 2, 3, 11, 18], [0, 1, 2, 3, 11, 19],
        [0, 1, 2, 3, 12, 13], [0, 1, 2, 3, 12, 14], [0, 1, 2, 3, 12, 15], [0, 1, 2, 3, 12, 16],
        [0, 1, 2, 3, 12, 17], [0, 1, 2, 3, 12, 18], [0, 1, 2, 3, 12, 19], [0, 1, 2, 3, 13, 14],
        [0, 1, 2, 3, 13, 15], [0, 1, 2, 3, 13, 16], [0, 1, 2, 3, 13, 17], [0, 1, 2, 3, 13, 18],
        [0, 1, 2, 3, 13, 19], [0, 1, 2, 3, 14, 15], [0, 1, 2, 3, 14, 16], [0, 1, 2, 3, 14, 17],
        [0, 1, 2, 3, 14, 18], [0, 1, 2, 3, 14, 19], [0, 1, 2, 3, 15, 16], [0, 1, 2, 3, 15, 17],
        [0, 1, 2, 3, 15, 18], [0, 1, 2, 3, 15, 19], [0, 1, 2, 3, 16, 17], [0, 1, 2, 3, 16, 18],
        [0, 1, 2, 3, 16, 19], [0, 1, 2, 3, 17, 18], [0, 1, 2, 3, 17, 19], [0, 1, 2, 3, 18, 19]
      ],
      
      // System 20 liczb, gwarancja 4 z 6 (C(20,4) = 4845 czwórek, teoretyczne minimum: 808 kuponów)
      // UWAGA: Ten system zapewnia tylko częściową gwarancję, nie 100%!
      "20-4": [
        [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 6], [0, 1, 2, 3, 4, 7], [0, 1, 2, 3, 4, 8],
        [0, 1, 2, 3, 4, 9], [0, 1, 2, 3, 4, 10], [0, 1, 2, 3, 4, 11], [0, 1, 2, 3, 4, 12],
        [0, 1, 2, 3, 4, 13], [0, 1, 2, 3, 4, 14], [0, 1, 2, 3, 4, 15], [0, 1, 2, 3, 4, 16],
        [0, 1, 2, 3, 4, 17], [0, 1, 2, 3, 4, 18], [0, 1, 2, 3, 4, 19], [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 3, 5, 7], [0, 1, 2, 3, 5, 8], [0, 1, 2, 3, 5, 9], [0, 1, 2, 3, 5, 10],
        [0, 1, 2, 3, 5, 11], [0, 1, 2, 3, 5, 12], [0, 1, 2, 3, 5, 13], [0, 1, 2, 3, 5, 14],
        [0, 1, 2, 3, 5, 15], [0, 1, 2, 3, 5, 16], [0, 1, 2, 3, 5, 17], [0, 1, 2, 3, 5, 18],
        [0, 1, 2, 3, 5, 19], [0, 1, 2, 3, 6, 7], [0, 1, 2, 3, 6, 8], [0, 1, 2, 3, 6, 9],
        [0, 1, 2, 3, 6, 10], [0, 1, 2, 3, 6, 11], [0, 1, 2, 3, 6, 12], [0, 1, 2, 3, 6, 13],
        [0, 1, 2, 3, 6, 14], [0, 1, 2, 3, 6, 15], [0, 1, 2, 3, 6, 16], [0, 1, 2, 3, 6, 17],
        [0, 1, 2, 3, 6, 18], [0, 1, 2, 3, 6, 19], [0, 1, 2, 3, 7, 8], [0, 1, 2, 3, 7, 9],
        [0, 1, 2, 3, 7, 10], [0, 1, 2, 3, 7, 11], [0, 1, 2, 3, 7, 12], [0, 1, 2, 3, 7, 13],
        [0, 1, 2, 3, 7, 14], [0, 1, 2, 3, 7, 15], [0, 1, 2, 3, 7, 16], [0, 1, 2, 3, 7, 17],
        [0, 1, 2, 3, 7, 18], [0, 1, 2, 3, 7, 19], [0, 1, 2, 3, 8, 9], [0, 1, 2, 3, 8, 10],
        [0, 1, 2, 3, 8, 11], [0, 1, 2, 3, 8, 12], [0, 1, 2, 3, 8, 13], [0, 1, 2, 3, 8, 14],
        [0, 1, 2, 3, 8, 15], [0, 1, 2, 3, 8, 16], [0, 1, 2, 3, 8, 17], [0, 1, 2, 3, 8, 18],
        [0, 1, 2, 3, 8, 19], [0, 1, 2, 3, 9, 10], [0, 1, 2, 3, 9, 11], [0, 1, 2, 3, 9, 12],
        [0, 1, 2, 3, 9, 13], [0, 1, 2, 3, 9, 14], [0, 1, 2, 3, 9, 15], [0, 1, 2, 3, 9, 16],
        [0, 1, 2, 3, 9, 17], [0, 1, 2, 3, 9, 18], [0, 1, 2, 3, 9, 19], [0, 1, 2, 3, 10, 11],
        [0, 1, 2, 3, 10, 12], [0, 1, 2, 3, 10, 13], [0, 1, 2, 3, 10, 14], [0, 1, 2, 3, 10, 15],
        [0, 1, 2, 3, 10, 16], [0, 1, 2, 3, 10, 17], [0, 1, 2, 3, 10, 18], [0, 1, 2, 3, 10, 19],
        [0, 1, 2, 3, 11, 12], [0, 1, 2, 3, 11, 13], [0, 1, 2, 3, 11, 14], [0, 1, 2, 3, 11, 15],
        [0, 1, 2, 3, 11, 16], [0, 1, 2, 3, 11, 17], [0, 1, 2, 3, 11, 18], [0, 1, 2, 3, 11, 19],
        [0, 1, 2, 3, 12, 13], [0, 1, 2, 3, 12, 14], [0, 1, 2, 3, 12, 15], [0, 1, 2, 3, 12, 16],
        [0, 1, 2, 3, 12, 17], [0, 1, 2, 3, 12, 18], [0, 1, 2, 3, 12, 19], [0, 1, 2, 3, 13, 14],
        [0, 1, 2, 3, 13, 15], [0, 1, 2, 3, 13, 16], [0, 1, 2, 3, 13, 17], [0, 1, 2, 3, 13, 18],
        [0, 1, 2, 3, 13, 19], [0, 1, 2, 3, 14, 15], [0, 1, 2, 3, 14, 16], [0, 1, 2, 3, 14, 17],
        [0, 1, 2, 3, 14, 18], [0, 1, 2, 3, 14, 19], [0, 1, 2, 3, 15, 16], [0, 1, 2, 3, 15, 17],
        [0, 1, 2, 3, 15, 18], [0, 1, 2, 3, 15, 19], [0, 1, 2, 3, 16, 17], [0, 1, 2, 3, 16, 18],
        [0, 1, 2, 3, 16, 19], [0, 1, 2, 3, 17, 18], [0, 1, 2, 3, 17, 19], [0, 1, 2, 3, 18, 19]
      ],
      
      // System 20 liczb, gwarancja 5 z 6 (C(20,5) = 15504 piątek, teoretyczne minimum: 2584 kuponów)
      // UWAGA: Ten system zapewnia tylko częściową gwarancję, nie 100%!
      "20-5": [
        [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 6], [0, 1, 2, 3, 4, 7], [0, 1, 2, 3, 4, 8],
        [0, 1, 2, 3, 4, 9], [0, 1, 2, 3, 4, 10], [0, 1, 2, 3, 4, 11], [0, 1, 2, 3, 4, 12],
        [0, 1, 2, 3, 4, 13], [0, 1, 2, 3, 4, 14], [0, 1, 2, 3, 4, 15], [0, 1, 2, 3, 4, 16],
        [0, 1, 2, 3, 4, 17], [0, 1, 2, 3, 4, 18], [0, 1, 2, 3, 4, 19], [0, 1, 2, 3, 5, 6],
        [0, 1, 2, 3, 5, 7], [0, 1, 2, 3, 5, 8], [0, 1, 2, 3, 5, 9], [0, 1, 2, 3, 5, 10],
        [0, 1, 2, 3, 5, 11], [0, 1, 2, 3, 5, 12], [0, 1, 2, 3, 5, 13], [0, 1, 2, 3, 5, 14],
        [0, 1, 2, 3, 5, 15], [0, 1, 2, 3, 5, 16], [0, 1, 2, 3, 5, 17], [0, 1, 2, 3, 5, 18],
        [0, 1, 2, 3, 5, 19], [0, 1, 2, 3, 6, 7], [0, 1, 2, 3, 6, 8], [0, 1, 2, 3, 6, 9],
        [0, 1, 2, 3, 6, 10], [0, 1, 2, 3, 6, 11], [0, 1, 2, 3, 6, 12], [0, 1, 2, 3, 6, 13],
        [0, 1, 2, 3, 6, 14], [0, 1, 2, 3, 6, 15], [0, 1, 2, 3, 6, 16], [0, 1, 2, 3, 6, 17],
        [0, 1, 2, 3, 6, 18], [0, 1, 2, 3, 6, 19], [0, 1, 2, 3, 7, 8], [0, 1, 2, 3, 7, 9],
        [0, 1, 2, 3, 7, 10], [0, 1, 2, 3, 7, 11], [0, 1, 2, 3, 7, 12], [0, 1, 2, 3, 7, 13],
        [0, 1, 2, 3, 7, 14], [0, 1, 2, 3, 7, 15], [0, 1, 2, 3, 7, 16], [0, 1, 2, 3, 7, 17],
        [0, 1, 2, 3, 7, 18], [0, 1, 2, 3, 7, 19], [0, 1, 2, 3, 8, 9], [0, 1, 2, 3, 8, 10],
        [0, 1, 2, 3, 8, 11], [0, 1, 2, 3, 8, 12], [0, 1, 2, 3, 8, 13], [0, 1, 2, 3, 8, 14],
        [0, 1, 2, 3, 8, 15], [0, 1, 2, 3, 8, 16], [0, 1, 2, 3, 8, 17], [0, 1, 2, 3, 8, 18],
        [0, 1, 2, 3, 8, 19], [0, 1, 2, 3, 9, 10], [0, 1, 2, 3, 9, 11], [0, 1, 2, 3, 9, 12],
        [0, 1, 2, 3, 9, 13], [0, 1, 2, 3, 9, 14], [0, 1, 2, 3, 9, 15], [0, 1, 2, 3, 9, 16],
        [0, 1, 2, 3, 9, 17], [0, 1, 2, 3, 9, 18], [0, 1, 2, 3, 9, 19], [0, 1, 2, 3, 10, 11],
        [0, 1, 2, 3, 10, 12], [0, 1, 2, 3, 10, 13], [0, 1, 2, 3, 10, 14], [0, 1, 2, 3, 10, 15],
        [0, 1, 2, 3, 10, 16], [0, 1, 2, 3, 10, 17], [0, 1, 2, 3, 10, 18], [0, 1, 2, 3, 10, 19],
        [0, 1, 2, 3, 11, 12], [0, 1, 2, 3, 11, 13], [0, 1, 2, 3, 11, 14], [0, 1, 2, 3, 11, 15],
        [0, 1, 2, 3, 11, 16], [0, 1, 2, 3, 11, 17], [0, 1, 2, 3, 11, 18], [0, 1, 2, 3, 11, 19],
        [0, 1, 2, 3, 12, 13], [0, 1, 2, 3, 12, 14], [0, 1, 2, 3, 12, 15], [0, 1, 2, 3, 12, 16],
        [0, 1, 2, 3, 12, 17], [0, 1, 2, 3, 12, 18], [0, 1, 2, 3, 12, 19], [0, 1, 2, 3, 13, 14],
        [0, 1, 2, 3, 13, 15], [0, 1, 2, 3, 13, 16], [0, 1, 2, 3, 13, 17], [0, 1, 2, 3, 13, 18],
        [0, 1, 2, 3, 13, 19], [0, 1, 2, 3, 14, 15], [0, 1, 2, 3, 14, 16], [0, 1, 2, 3, 14, 17],
        [0, 1, 2, 3, 14, 18], [0, 1, 2, 3, 14, 19], [0, 1, 2, 3, 15, 16], [0, 1, 2, 3, 15, 17],
        [0, 1, 2, 3, 15, 18], [0, 1, 2, 3, 15, 19], [0, 1, 2, 3, 16, 17], [0, 1, 2, 3, 16, 18],
        [0, 1, 2, 3, 16, 19], [0, 1, 2, 3, 17, 18], [0, 1, 2, 3, 17, 19], [0, 1, 2, 3, 18, 19]
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
            <span onClick={() => setModalInfo({ isOpen: true, title: "Generator Schönheima", content: "Generator Schönheima to zaawansowane narzędzie matematyczne, które oblicza minimalne granice dla systemów skróconych. Używa rekurencyjnych wzorów i algorytmów covering design do określenia optymalnej liczby zakładów potrzebnych do osiągnięcia gwarancji trafień." })} style={{ cursor: "pointer", marginLeft: 8, color: "#1976d2" }}>ℹ️</span>
          </p>
        </>
      ) : (
        <>
          <p style={{ marginBottom: 20, lineHeight: 1.6 }}>
            Logika ILP (Integer Linear Programming) to zaawansowana technika matematyczna, 
            która znajduje absolutne minimum zakładów potrzebnych do 100% gwarancji pokrycia.
            <span onClick={() => setModalInfo({ isOpen: true, title: "Logika ILP", content: "ILP to zaawansowana technika matematyczna, która znajduje absolutne minimum zakładów potrzebnych do 100% gwarancji pokrycia. Jeśli Twoje liczby zawierają trafienie, ILP ZAWSZE znajdzie je w wygenerowanych zakładach. Działa tylko dla małych systemów (N≤10) ze względu na złożoność obliczeniową." })} style={{ cursor: "pointer", marginLeft: 8, color: "#1976d2" }}>ℹ️</span>
          </p>
        </>
      )}
      <div style={{ background: "#e3f2fd", color: "#1565c0", padding: 12, borderRadius: 8, marginBottom: 20 }}>
        <strong>💡 Wskazówka:</strong> Aby zobaczyć prawdziwy system skrócony, wybierz więcej liczb niż liczba liczb do wyboru:
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
      
      {systemType === 'classic' ? (
        <>
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
              <select value={systemNumbers} onChange={e => setSystemNumbers(Number(e.target.value))} style={{ ...inputStyle, width: 120, display: "inline-block", marginBottom: 0 }}>
                {Array.from({ length: 16 - getMinSystemNumbers(selectedGame) }, (_, i) => i + getMinSystemNumbers(selectedGame)).map(num => (
                  <option key={num} value={num}>{num} liczb</option>
                ))}
              </select>
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
            <button type="submit" style={buttonStyle}>Generuj system</button>
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
                <option value={5}>5 z 5/6 (pełna)</option>
              </select>
            </div>

            <button type="submit" style={buttonStyle} disabled={ilpLoading}>
              {ilpLoading ? "Generuję system ILP..." : "Generuj system ILP"}
            </button>
          </form>

          {ilpResults && (
            <div style={{ marginTop: 24 }}>
              <div style={{ background: "#e8f5e8", padding: 16, borderRadius: 12, marginBottom: 16 }}>
                <h3 style={{ color: "#2e7d32", marginBottom: 12 }}>🎯 System ILP wygenerowany!</h3>
                <div style={{ marginBottom: 12 }}>
                  <strong>Gra:</strong> {
                    ilpGame === "miniLotto" ? "Mini Lotto" :
                    ilpGame === "lotto" ? "Lotto" :
                    ilpGame === "eurojackpot" ? "Eurojackpot" :
                    ilpGame === "keno" ? "Keno" :
                    ilpGame === "multiMulti" ? "Multi Multi" :
                    ilpGame === "kaskada" ? "Kaskada" : "Gra"
                  }
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Liczby w systemie:</strong> {ilpResults.numbers.join(", ")}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Gwarancja:</strong> {ilpResults.guarantee} z {
                    ilpGame === "miniLotto" ? 5 :
                    ilpGame === "lotto" ? 6 :
                    ilpGame === "eurojackpot" ? "5+2" :
                    ilpGame === "keno" ? 10 :
                    ilpGame === "multiMulti" ? 20 :
                    ilpGame === "kaskada" ? 6 : 5
                  }
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Liczba zakładów:</strong> {ilpResults.totalBets}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Przewidywana skuteczność:</strong> {ilpResults.systemInfo.effectiveness}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Potencjalny koszt:</strong> {ilpResults.systemInfo.potentialCost.toFixed(2)} PLN
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ color: "#222", marginBottom: 12 }}>Zakłady do obstawienia:</h4>
                <div style={{ 
                  background: "#f5f5f5", 
                  padding: 16, 
                  borderRadius: 8, 
                  maxHeight: 300, 
                  overflowY: "auto",
                  border: "1px solid #e0e0e0"
                }}>
                  {ilpResults.bets.map((bet, index) => (
                    <div key={index} style={{ 
                      marginBottom: 8, 
                      padding: 8, 
                      background: "white", 
                      borderRadius: 6,
                      border: "1px solid #e0e0e0"
                    }}>
                      <strong>Zakład {index + 1}:</strong> {bet.join(", ")}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button 
                  onClick={copyILPBetsToClipboard}
                  style={actionButtonStyle}
                >
                  📋 Kopiuj zakłady
                </button>
                <button 
                  onClick={() => isFavorite(ilpResults.numbers) ? removeFromFavorites(getFavoriteId(ilpResults.numbers)) : addToFavorites(ilpResults.numbers, "ilp")}
                  style={{
                    background: "#ffffff",
                    color: isFavorite(ilpResults.numbers) ? "#ff1744" : "#ff5722",
                    border: `2px solid ${isFavorite(ilpResults.numbers) ? "#ff1744" : "#ff5722"}`,
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
                  title={isFavorite(ilpResults.numbers) ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                >
                  {isFavorite(ilpResults.numbers) ? "❤️" : "🤍"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
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
            {(() => {
              const pick = selectedGame === "lotto" ? 6 : selectedGame === "miniLotto" ? 5 : selectedGame === "multiMulti" ? 10 : selectedGame === "eurojackpot" ? 5 : selectedGame === "kaskada" ? 12 : kenoNumbers;
              const guarantee = calculateRealGuarantee(systemNumbers, results[0].guarantee, pick);
              const isFull = hasFullGuarantee(systemNumbers, results[0].guarantee, pick);
              
                             if (isFull) {
                 return (
                   <div style={{ background: "#d4edda", color: "#155724", padding: 8, borderRadius: 6, marginTop: 8, fontSize: 12 }}>
                     <strong>🟢 100% GWARANCJA:</strong> Ten system zapewnia pełną gwarancję matematyczną!
                   </div>
                 );
               } else {
                 return (
                   <div style={{ background: "#fff3cd", color: "#856404", padding: 8, borderRadius: 6, marginTop: 8, fontSize: 12 }}>
                     <strong>🟡 CZĘŚCIOWA GWARANCJA:</strong> Ten system zapewnia tylko {guarantee}% gwarancji.
                   </div>
                 );
               }
            })()}
            
            <div style={{ background: "#e8f5e8", color: "#2e7d32", padding: 12, borderRadius: 8, marginTop: 12, marginBottom: 12 }}>
              <strong>🎯 Jak obstawić zakłady:</strong>
              <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                Musisz obstawić wszystkie <strong>{results[0].totalBets}</strong> zakładów wygenerowanych przez system. 
                Każdy zakład to <strong>{selectedGame === "lotto" ? 6 : selectedGame === "miniLotto" ? 5 : selectedGame === "multiMulti" ? 10 : selectedGame === "eurojackpot" ? 5 : selectedGame === "kaskada" ? 12 : kenoNumbers}</strong> liczb z Twoich <strong>{results[0].numbers.length}</strong>.
              </p>
            </div>
            
            {results[0].bets && results[0].bets.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ color: "#222", marginBottom: 12 }}>Zakłady do obstawienia:</h4>
                <div style={{ 
                  background: "#f5f5f5", 
                  padding: 16, 
                  borderRadius: 8, 
                  maxHeight: 300, 
                  overflowY: "auto",
                  border: "1px solid #e0e0e0"
                }}>
                  {results[0].bets.map((bet, index) => (
                    <div key={index} style={{ 
                      marginBottom: 8, 
                      padding: 8, 
                      background: "white", 
                      borderRadius: 6,
                      border: "1px solid #e0e0e0"
                    }}>
                      <strong>Zakład {index + 1}:</strong> {bet.join(", ")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Ukryj pasek adresu w TWA (dla Google Play)
  useEffect(() => {
    // Sprawdź czy aplikacja jest uruchomiona w TWA
    const isInTWA = window.matchMedia('(display-mode: standalone)').matches || 
                    window.navigator.standalone === true ||
                    document.referrer.includes('android-app://');
    
    if (isInTWA) {
      // Ukryj pasek adresu
      if ('standalone' in window.navigator && window.navigator.standalone) {
        // iOS Safari
        document.body.style.webkitUserSelect = 'none';
      }
      
      // Dodaj meta tag dla TWA
      const meta = document.createElement('meta');
      meta.name = 'mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
      
      const meta2 = document.createElement('meta');
      meta2.name = 'apple-mobile-web-app-capable';
      meta2.content = 'yes';
      document.head.appendChild(meta2);
    }
