import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIPersonaMode = ({ selectedGame, onGenerate, isGenerating }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const [currentBall, setCurrentBall] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [currentComment, setCurrentComment] = useState('');
  const [avatarState, setAvatarState] = useState('idle');
  
  const gameConfig = {
    lotto: { count: 6, max: 49, name: "Lotto" },
    miniLotto: { count: 5, max: 42, name: "Mini Lotto" },
    multiMulti: { count: 10, max: 80, name: "Multi Multi" },
    eurojackpot: { count: 5, max: 50, euroCount: 2, euroMax: 12, name: "Eurojackpot" },
    ekstraPensja: { count: 5, max: 35, extraCount: 1, extraMax: 4, name: "Ekstra Pensja" }
  };

  const aiComments = [
    "Hmm... ta liczba była szczęśliwa w 23% poprzednich losowań!",
    "Czuję, że 7 to dziś twój szczęśliwy numer.",
    "Ostatni ruch — zaufam intuicji!",
    "Ta kombinacja ma świetną energię!",
    "Widzę wzorzec w historii losowań...",
    "To będzie dobry dzień dla parzystych liczb!",
    "Moja analiza pokazuje, że warto postawić na wysokie liczby.",
    "Czuję pozytywną wibrację od tej liczby!",
    "To będzie hit! Ufam swoim obliczeniom.",
    "Kombinacja idealna — matematyka i intuicja w harmonii!"
  ];

  useEffect(() => {
    if (isGenerating) {
      setShowResults(false);
      setCurrentBall(0);
      setAvatarState('thinking');
      setCurrentComment('Rozpoczynam analizę...');
      
      const numbers = generateNumbers();
      setGeneratedNumbers(numbers);
      startCommentSequence(numbers);
    }
  }, [isGenerating]);

  const generateNumbers = () => {
    const config = gameConfig[selectedGame];
    if (!config) return [];

    let numbers = [];
    const usedNumbers = new Set();

    while (numbers.length < config.count) {
      const num = Math.floor(Math.random() * config.max) + 1;
      if (!usedNumbers.has(num)) {
        numbers.push(num);
        usedNumbers.add(num);
      }
    }

    if (selectedGame === 'eurojackpot') {
      const euroNumbers = [];
      const usedEuro = new Set();
      while (euroNumbers.length < config.euroCount) {
        const num = Math.floor(Math.random() * config.euroMax) + 1;
        if (!usedEuro.has(num)) {
          euroNumbers.push(num);
          usedEuro.add(num);
        }
      }
      numbers = [numbers.sort((a, b) => a - b), euroNumbers.sort((a, b) => a - b)];
    } else if (selectedGame === 'ekstraPensja') {
      const extraNumber = Math.floor(Math.random() * config.extraMax) + 1;
      numbers = [numbers.sort((a, b) => a - b), [extraNumber]];
    } else {
      numbers = numbers.sort((a, b) => a - b);
    }

    return numbers;
  };

  const startCommentSequence = (numbers) => {
    const flatNumbers = Array.isArray(numbers[0]) ? [...numbers[0], ...numbers[1]] : numbers;
    let currentIndex = 0;
    
    const showNextBall = () => {
      if (currentIndex < flatNumbers.length) {
        setCurrentBall(currentIndex + 1);
        setAvatarState('speaking');
        
        const comment = aiComments[Math.floor(Math.random() * aiComments.length)];
        setCurrentComment(comment);
        
        setTimeout(() => {
          currentIndex++;
          showNextBall();
        }, 3000);
      } else {
        setAvatarState('excited');
        setCurrentComment('Powodzenia! 🍀');
        setTimeout(() => {
          setShowResults(true);
          if (onGenerate) {
            onGenerate(numbers);
          }
        }, 3000);
      }
    };
    
    showNextBall();
  };

  const avatarVariants = {
    idle: { 
      scale: 1,
      rotateY: 0
    },
    thinking: {
      scale: [1, 1.05, 1],
      rotateY: [0, 5, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    speaking: {
      scale: [1, 1.1, 1],
      rotateY: [0, 10, -10, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    },
    excited: {
      scale: [1, 1.2, 1],
      rotateY: [0, 360],
      transition: {
        duration: 1,
        repeat: 3,
        ease: "easeInOut"
      }
    }
  };

  const commentVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 1.0, type: "spring" }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.8,
      transition: { duration: 0.8 }
    }
  };

  const ballVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      y: 50
    },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        type: "spring",
        stiffness: 200
      }
    })
  };

  const getAvatarEmoji = () => {
    switch (avatarState) {
      case 'thinking': return '🤔';
      case 'speaking': return '💬';
      case 'excited': return '🎉';
      default: return '🤖';
    }
  };

  // Responsive values
  const getResponsiveValue = (mobile, tablet, desktop) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  return (
    <div className="ai-persona-mode" style={{
      minHeight: getResponsiveValue('400px', '450px', '500px'),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
      borderRadius: getResponsiveValue('15px', '18px', '20px'),
      padding: getResponsiveValue('20px 15px', '30px 20px', '40px 20px'),
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Tło z bąbelkami */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        opacity: 0.2
      }}>
        {Array.from({ length: getResponsiveValue(15, 18, 20) }, (_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * (isMobile ? 350 : isTablet ? 700 : 1000),
              y: (isMobile ? 600 : isTablet ? 800 : 1000) + 50,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: -50,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: getResponsiveValue('20px', '25px', '30px'),
              height: getResponsiveValue('20px', '25px', '30px'),
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.5)'
            }}
          />
        ))}
      </div>

      {/* Avatar AI */}
      <motion.div
        variants={avatarVariants}
        animate={avatarState}
        style={{
          fontSize: getResponsiveValue('80px', '100px', '120px'),
          marginBottom: getResponsiveValue('20px', '25px', '30px'),
          filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
          position: 'relative',
          zIndex: 2
        }}
      >
        {getAvatarEmoji()}
      </motion.div>

      {/* Chat bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentComment}
          variants={commentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: getResponsiveValue('15px', '18px', '20px'),
            padding: getResponsiveValue('15px 20px', '18px 25px', '20px 30px'),
            maxWidth: getResponsiveValue('280px', '350px', '400px'),
            width: '90%',
            textAlign: 'center',
            position: 'relative',
            marginBottom: getResponsiveValue('20px', '25px', '30px'),
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            zIndex: 2
          }}
        >
          <div style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid rgba(255,255,255,0.95)'
          }} />
          
          <div style={{
            fontSize: getResponsiveValue('14px', '15px', '16px'),
            color: '#333',
            fontWeight: '500',
            lineHeight: '1.4'
          }}>
            {currentComment}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Postęp */}
      <div style={{
        marginBottom: getResponsiveValue('20px', '25px', '30px'),
        textAlign: 'center',
        color: '#fff'
      }}>
        <div style={{ 
          fontSize: getResponsiveValue('16px', '17px', '18px'), 
          marginBottom: getResponsiveValue('8px', '9px', '10px') 
        }}>
          LottoBot 3000
        </div>
        <div style={{ 
          fontSize: getResponsiveValue('12px', '13px', '14px'), 
          opacity: 0.8 
        }}>
          Wybrane liczby: {currentBall}/{Array.isArray(generatedNumbers[0]) ? 
            generatedNumbers[0].length + generatedNumbers[1].length : 
            generatedNumbers.length}
        </div>
      </div>

      {/* Wybrane kule */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: getResponsiveValue('8px', '9px', '10px'),
        marginBottom: getResponsiveValue('20px', '25px', '30px'),
        maxWidth: '100%',
        padding: '0 10px'
      }}>
        {Array.isArray(generatedNumbers[0]) ? (
          <>
            {generatedNumbers[0].slice(0, currentBall).map((num, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={ballVariants}
                initial="hidden"
                animate="visible"
                style={{
                  width: getResponsiveValue('35px', '40px', '45px'),
                  height: getResponsiveValue('35px', '40px', '45px'),
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: getResponsiveValue('14px', '16px', '18px'),
                  boxShadow: '0 4px 15px rgba(255,107,107,0.4)',
                  border: '3px solid rgba(255,255,255,0.3)'
                }}
              >
                {num}
              </motion.div>
            ))}
            {generatedNumbers[1] && generatedNumbers[1].slice(0, Math.max(0, currentBall - generatedNumbers[0].length)).map((num, i) => (
              <motion.div
                key={`euro-${i}`}
                custom={i + generatedNumbers[0].length}
                variants={ballVariants}
                initial="hidden"
                animate="visible"
                style={{
                  width: getResponsiveValue('35px', '40px', '45px'),
                  height: getResponsiveValue('35px', '40px', '45px'),
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: getResponsiveValue('14px', '16px', '18px'),
                  boxShadow: '0 4px 15px rgba(78,205,196,0.4)',
                  border: '3px solid rgba(255,255,255,0.3)'
                }}
              >
                {num}
              </motion.div>
            ))}
          </>
        ) : (
          generatedNumbers.slice(0, currentBall).map((num, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={ballVariants}
              initial="hidden"
              animate="visible"
              style={{
                width: getResponsiveValue('35px', '40px', '45px'),
                height: getResponsiveValue('35px', '40px', '45px'),
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: getResponsiveValue('14px', '16px', '18px'),
                boxShadow: '0 4px 15px rgba(255,107,107,0.4)',
                border: '3px solid rgba(255,255,255,0.3)'
              }}
            >
              {num}
            </motion.div>
          ))
        )}
      </div>

      {/* Wyniki końcowe */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: getResponsiveValue('15px', '18px', '20px'),
              padding: getResponsiveValue('20px', '25px', '30px'),
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)',
              textAlign: 'center',
              width: '90%',
              maxWidth: '500px'
            }}
          >
            <h3 style={{ 
              color: '#fff', 
              marginBottom: getResponsiveValue('20px', '22px', '25px'), 
              fontSize: getResponsiveValue('16px', '18px', '20px') 
            }}>
              🎯 Wygenerowane liczby dla {gameConfig[selectedGame]?.name}
            </h3>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: getResponsiveValue('8px', '10px', '12px') 
            }}>
              {Array.isArray(generatedNumbers[0]) ? (
                <>
                  <div style={{ marginBottom: getResponsiveValue('15px', '18px', '20px'), width: '100%' }}>
                    <div style={{ 
                      fontSize: getResponsiveValue('14px', '15px', '16px'), 
                      color: '#ff6b6b', 
                      marginBottom: getResponsiveValue('8px', '9px', '10px'), 
                      fontWeight: 'bold' 
                    }}>
                      Główne liczby:
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: getResponsiveValue('8px', '9px', '10px'),
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      {generatedNumbers[0].map((num, i) => (
                        <div
                          key={i}
                          style={{
                            width: getResponsiveValue('40px', '45px', '50px'),
                            height: getResponsiveValue('40px', '45px', '50px'),
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: getResponsiveValue('16px', '18px', '20px'),
                            boxShadow: '0 6px 20px rgba(255,107,107,0.4)',
                            border: '3px solid rgba(255,255,255,0.3)'
                          }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ width: '100%' }}>
                    <div style={{ 
                      fontSize: getResponsiveValue('14px', '15px', '16px'), 
                      color: '#4ecdc4', 
                      marginBottom: getResponsiveValue('8px', '9px', '10px'), 
                      fontWeight: 'bold' 
                    }}>
                      {selectedGame === 'eurojackpot' ? 'Liczby Euro:' : 'Liczba dodatkowa:'}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: getResponsiveValue('8px', '9px', '10px'),
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      {generatedNumbers[1].map((num, i) => (
                        <div
                          key={i}
                          style={{
                            width: getResponsiveValue('40px', '45px', '50px'),
                            height: getResponsiveValue('40px', '45px', '50px'),
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: getResponsiveValue('16px', '18px', '20px'),
                            boxShadow: '0 6px 20px rgba(78,205,196,0.4)',
                            border: '3px solid rgba(255,255,255,0.3)'
                          }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                generatedNumbers.map((num, i) => (
                  <div
                    key={i}
                    style={{
                      width: getResponsiveValue('40px', '45px', '50px'),
                      height: getResponsiveValue('40px', '45px', '50px'),
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: getResponsiveValue('16px', '18px', '20px'),
                      boxShadow: '0 6px 20px rgba(255,107,107,0.4)',
                      border: '3px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {num}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Efekt konfetti */}
      {showResults && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
          {Array.from({ length: getResponsiveValue(20, 25, 30) }, (_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * (isMobile ? 350 : isTablet ? 700 : 1000), 
                y: -10,
                opacity: 1,
                rotate: 0
              }}
              animate={{ 
                y: (isMobile ? 600 : isTablet ? 800 : 1000) + 10,
                opacity: 0,
                rotate: 360
              }}
              transition={{ 
                duration: 4 + Math.random() * 2,
                delay: Math.random() * 2
              }}
              style={{
                position: 'absolute',
                width: getResponsiveValue('8px', '9px', '10px'),
                height: getResponsiveValue('8px', '9px', '10px'),
                background: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0'
              }}
            />
          ))}
        </div>
      )}

      {/* Przycisk generowania */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (onGenerate) {
            const numbers = generateNumbers();
            setGeneratedNumbers(numbers);
            startCommentSequence(numbers);
          }
        }}
        disabled={isGenerating}
        style={{
          width: getResponsiveValue('180px', '220px', '250px'),
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
          border: 'none',
          borderRadius: getResponsiveValue('10px', '11px', '12px'),
          padding: getResponsiveValue('10px', '12px', '15px'),
          color: 'white',
          fontSize: getResponsiveValue('12px', '14px', '16px'),
          fontWeight: 'bold',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          opacity: isGenerating ? 0.7 : 1,
          transition: 'all 0.3s ease',
          marginTop: getResponsiveValue('15px', '18px', '20px'),
          boxShadow: '0 4px 15px rgba(255,107,107,0.3)'
        }}
      >
        {isGenerating ? '🔄 THINKING...' : '🤖 ASK AI'}
      </motion.button>
    </div>
  );
};

export default AIPersonaMode;
