import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import aiAnimation from '../../../assets/ai-brain.json';

const StartScreenAnimation = ({ onComplete }) => {
  const [rocketPhase, setRocketPhase] = useState('launching'); // 'launching' or 'flying'
  const [fireSize, setFireSize] = useState(0);
  const [aiText, setAiText] = useState('');
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    // Fazy animacji
    const phases = [
      'Inicjalizacja AI...',
      'Ładowanie silników...',
      'Przygotowanie do startu...',
      'Odpalanie rakiety...',
      'Gotowy do generowania!'
    ];

    // Zmiana faz co 900ms
    const phaseInterval = setInterval(() => {
      if (currentPhase < phases.length - 1) {
        setCurrentPhase(prev => prev + 1);
        setAiText(phases[currentPhase + 1]);
      } else {
        clearInterval(phaseInterval);
      }
    }, 900);

    // Animacja ognia przez 4 sekundy
    const fireInterval = setInterval(() => {
      setFireSize(prev => {
        if (prev < 100) {
          return prev + 2; // Zwiększaj ogień co 100ms
        } else {
          clearInterval(fireInterval);
          return 100;
        }
      });
    }, 100);

    // Po 4 sekundach rakieta leci do góry
    const flyTimer = setTimeout(() => {
      setRocketPhase('flying');
    }, 4000);

    // Zakończenie po 5 sekundach
    const completionTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(fireInterval);
      clearTimeout(flyTimer);
      clearTimeout(completionTimer);
    };
  }, [currentPhase, onComplete]);

  return (
    <div className="start-screen-animation">
      <motion.div 
        className="ai-brain-container"
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          rotate: { duration: 3, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <Lottie 
          animationData={aiAnimation} 
          style={{ width: 200, height: 200 }}
          loop={true}
          autoplay={true}
        />
      </motion.div>
      
      {/* Rakieta */}
      <motion.div 
        className="rocket-container"
        animate={{
          y: rocketPhase === 'flying' ? [-50, -300] : [0, 0],
          scale: rocketPhase === 'flying' ? [1, 0.8] : [1, 1.1, 1]
        }}
        transition={{ 
          duration: rocketPhase === 'flying' ? 1 : 4,
          ease: rocketPhase === 'flying' ? "easeOut" : "easeInOut"
        }}
      >
        <div className="rocket">
          <div className="rocket-body">
            <div className="rocket-nose">🚀</div>
            <div className="rocket-base">
              <div className="rocket-window">●</div>
              <div className="rocket-fins">
                <div className="fin fin-left">◢</div>
                <div className="fin fin-right">◣</div>
              </div>
            </div>
          </div>
          
          {/* Ogień rakiety */}
          <motion.div 
            className="rocket-fire"
            animate={{
              scale: [1, fireSize / 50, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              height: `${fireSize}px`,
              background: `linear-gradient(to top, 
                rgba(255, 69, 0, 0.8) 0%, 
                rgba(255, 140, 0, 0.9) 30%, 
                rgba(255, 215, 0, 1) 60%, 
                rgba(255, 255, 255, 0.8) 100%)`
            }}
          >
            {/* Iskry */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="spark"
                style={{
                  left: `${20 + (i * 10)}%`,
                  animationDelay: `${i * 0.1}s`
                }}
                animate={{
                  y: [0, -50],
                  x: [0, Math.random() * 20 - 10],
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Pulsujące kropki */}
      <div className="pulse-dots">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="pulse-dot"
            style={{
              left: `${20 + (i * 12)}%`,
              top: '70%'
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </div>

      <motion.div 
        className="ai-text"
        key={aiText}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {aiText}
      </motion.div>

      {/* Progress bar */}
      <motion.div 
        className="ai-progress"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 5, ease: "easeInOut" }}
      />
    </div>
  );
};

export default StartScreenAnimation;
