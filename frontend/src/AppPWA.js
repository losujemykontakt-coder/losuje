import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import './i18n';
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
import DreamsGenerator from './components/DreamsGenerator';
import LuckyNumbersGenerator from './components/LuckyNumbersGenerator';
import NumberPicker from './components/NumberPicker';
import SystemsGenerator from './components/SystemsGenerator';
import Explanations from './components/Explanations';
import Account from './components/Account';
import Gry from './components/Gry';

import { logoutUser, onAuthStateChange } from './utils/firebaseAuth';
import {
  getUserSubscription,
  getPaymentHistory,
  getUserStatus,
  checkUserAccess,
  cancelSubscription,
  checkAndBlockExpiredTrials
} from './utils/firebaseAuth';
import { initEmailJS } from './utils/emailjs';
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
];

function AppPWA() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeTalisman, setActiveTalisman] = useState(null);
  const [showTalismanModal, setShowTalismanModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState('lotto');
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('pl');

  // Inicjalizacja EmailJS
  useEffect(() => {
    initEmailJS();
  }, []);

  // Nasłuchiwanie zmian stanu autoryzacji
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        loadUserData(user);
      } else {
        setUserStatus(null);
        setSubscription(null);
        setPaymentHistory([]);
        setActiveTalisman(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Ładowanie danych użytkownika
  const loadUserData = async (user) => {
    try {
      const [status, sub, history, talisman] = await Promise.all([
        getUserStatus(user.uid),
        getUserSubscription(user.uid),
        getPaymentHistory(user.uid),
        checkUserAccess(user.uid)
      ]);

      setUserStatus(status);
      setSubscription(sub);
      setPaymentHistory(history);
      setActiveTalisman(talisman);
    } catch (error) {
      console.error('Błąd ładowania danych użytkownika:', error);
    }
  };

  // Sprawdzanie dostępu do funkcji premium
  const hasPremiumAccess = useMemo(() => {
    if (!userStatus) return false;
    return userStatus.isPremium || userStatus.trialActive || userStatus.subscriptionActive;
  }, [userStatus]);

  // Generowanie liczb
  const generateNumbers = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const numbers = await luckyNumbersGenerator.generateNumbers(selectedGame, activeTalisman);
      setGeneratedNumbers(numbers);
      
      const historyEntry = {
        id: Date.now(),
        game: selectedGame,
        numbers: numbers,
        timestamp: new Date().toISOString(),
        talisman: activeTalisman?.name || null
      };
      
      setGenerationHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Błąd generowania liczb:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Wylogowanie
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  // Zmiana języka
  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    // Tutaj możesz dodać logikę zmiany języka w i18n
  };

  // Stylowanie przycisków menu
  const menuBtnStyle = (isActive) => ({
    padding: '8px 16px',
    backgroundColor: isActive ? '#FFD700' : '#ffffff',
    color: isActive ? '#333' : '#666',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: isActive ? '#FFD700' : '#f8f9fa'
    }
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Ładowanie aplikacji...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Jeśli użytkownik nie jest zalogowany, pokaż stronę logowania
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <LanguageSwitcher 
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </div>
        
        <Routes>
          <Route path="/" element={<AuthContainer />} />
          <Route path="/login" element={<AuthContainer />} />
          <Route path="/register" element={<AuthContainer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // Jeśli użytkownik jest zalogowany, pokaż główną aplikację
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#FFD700',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px', 
            color: '#333',
            fontWeight: 'bold'
          }}>
            🎰 Magiczny Zestaw Dnia
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <LanguageSwitcher 
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav style={{
        backgroundColor: '#f8f9fa',
        padding: '10px 20px',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center'
      }}>
        <button onClick={() => navigate('/')} style={menuBtnStyle(location.pathname === '/')}>
          🏠 Strona główna
        </button>
        <button onClick={() => navigate('/ai-generator')} style={menuBtnStyle(location.pathname === '/ai-generator')}>
          🚀 AI Generator Ultra Pro
        </button>
        <button onClick={() => navigate('/gry')} style={menuBtnStyle(location.pathname === '/gry')}>
          🎰 Gry
        </button>
                 <button onClick={() => navigate('/harmonic-analyzer')} style={menuBtnStyle(location.pathname === '/harmonic-analyzer')}>
           🎵 Analizator Harmoniczny
         </button>
         <button onClick={() => navigate('/dreams')} style={menuBtnStyle(location.pathname === '/dreams')}>
           💭 Generator Snów
         </button>
         <button onClick={() => navigate('/lucky')} style={menuBtnStyle(location.pathname === '/lucky')}>
           🍀 Szczęśliwe Liczby
         </button>
         <button onClick={() => navigate('/numberPicker')} style={menuBtnStyle(location.pathname === '/numberPicker')}>
           🎯 Wybór Liczb
         </button>
         <button onClick={() => navigate('/systems')} style={menuBtnStyle(location.pathname === '/systems')}>
           📊 Systemy Skrócone
         </button>
         <button onClick={() => navigate('/statistics')} style={menuBtnStyle(location.pathname === '/statistics')}>
           📈 Statystyki
         </button>
        <button onClick={() => navigate('/my-lucky-numbers')} style={menuBtnStyle(location.pathname === '/my-lucky-numbers')}>
          🎲 Moje Szczęśliwe Liczby
        </button>
        <button onClick={() => navigate('/talismans')} style={menuBtnStyle(location.pathname === '/talismans')}>
          ✨ Talizmany
        </button>
                 <button onClick={() => navigate('/schonheim')} style={menuBtnStyle(location.pathname === '/schonheim')}>
           🎲 Generator Schonheim
         </button>
         <button onClick={() => navigate('/explanations')} style={menuBtnStyle(location.pathname === '/explanations')}>
           📖 Wyjaśnienia
         </button>
         <button onClick={() => navigate('/account')} style={menuBtnStyle(location.pathname === '/account')}>
           👤 Moje Konto
         </button>
       </nav>

      {/* Main Content */}
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={
            <GryPoZalogowaniu 
              user={user}
              userStatus={userStatus}
              subscription={subscription}
              activeTalisman={activeTalisman}
              setActiveTalisman={setActiveTalisman}
              showTalismanModal={showTalismanModal}
              setShowTalismanModal={setShowTalismanModal}
              selectedGame={selectedGame}
              setSelectedGame={setSelectedGame}
              generatedNumbers={generatedNumbers}
              isGenerating={isGenerating}
              generationHistory={generationHistory}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
              generateNumbers={generateNumbers}
              hasPremiumAccess={hasPremiumAccess}
              talismanDefinitions={talismanDefinitions}
            />
          } />
          
          <Route path="/ai-generator" element={
            <AILottoGeneratorUltraPro 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="/harmonic-analyzer" element={
            <HarmonicAnalyzer 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="/statistics" element={
            <FinalStatistics 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="/my-lucky-numbers" element={
            <MyLuckyNumbersScreen 
              user={user}
              generationHistory={generationHistory}
            />
          } />
          
          <Route path="/talismans" element={
            <Talizmany 
              user={user}
              userStatus={userStatus}
              activeTalisman={activeTalisman}
              setActiveTalisman={setActiveTalisman}
              talismanDefinitions={talismanDefinitions}
            />
          } />
          
          <Route path="/schonheim" element={
            <SchonheimGenerator 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="/dreams" element={
            <DreamsGenerator 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="/lucky" element={
            <LuckyNumbersGenerator 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="/numberPicker" element={
            <NumberPicker 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="/systems" element={
            <SystemsGenerator 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="/explanations" element={
            <Explanations 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="/account" element={
            <Account 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="/gry" element={
            <Gry 
              user={user}
              userStatus={userStatus}
              hasPremiumAccess={hasPremiumAccess}
            />
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Active Talisman Display */}
      {activeTalisman && (
        <ActiveTalismanDisplay 
          talisman={activeTalisman}
          onClose={() => setShowTalismanModal(false)}
          isVisible={showTalismanModal}
        />
      )}
    </div>
  );
}

export default AppPWA;
