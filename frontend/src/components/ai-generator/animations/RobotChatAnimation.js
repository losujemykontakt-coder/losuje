import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RobotChatAnimation.css';

const RobotChatAnimation = ({ onComplete }) => {
  const [currentBubble, setCurrentBubble] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [finalNumbers, setFinalNumbers] = useState([]);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  const messages = [
    "Analizuję szanse wygranej...",
    "Obliczam wzorce liczb...",
    "Sprawdzam statystyki...",
    "Symuluję wyniki...",
    "Łączę dane historyczne...",
    "Ta liczba na pewno będzie trafiona...",
    "Wykrywam ukryte wzorce...",
    "Przewiduję następny wynik...",
    "Algorytm AI potwierdza...",
    "Prawdopodobieństwo wzrasta...",
    "Analiza harmoniczna...",
    "Sprawdzam częstotliwości...",
    "Waliduję kombinacje...",
    "Optymalizuję wybór...",
    "Finalizuję obliczenia..."
  ];

  const generateRandomNumbers = () => {
    const numbers = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    // Start progress bar - 16 seconds total
    progressIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return;
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          return 100;
        }
        return prev + 0.625; // 16 seconds total (100/160 = 0.625)
      });
    }, 100);

    // Start chat animation - EXACTLY 4 bubbles, 2s visible + 2s gap each
    let messageIndex = 0;
    
    const showNextBubble = () => {
      if (!isMountedRef.current) return;
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCurrentBubble({
        id: Date.now(),
        message: randomMessage
      });
      
      messageIndex++;
      
      // Continue animation or complete - EXACTLY 4 bubbles (0,1,2,3)
      if (messageIndex < 4) { // Show 4 bubbles total (0,1,2,3)
        setTimeout(() => {
          setCurrentBubble(null); // Hide bubble after 2 seconds
          setTimeout(showNextBubble, 2000); // Show next bubble after 2s gap
        }, 2000); // Each bubble visible for 2 seconds
      } else {
        // Animation complete - 4th bubble (index 3)
        setTimeout(() => {
          if (!isMountedRef.current) return;
          setCurrentBubble(null);
          setIsComplete(true);
          const numbers = generateRandomNumbers();
          setFinalNumbers(numbers);
          
          setTimeout(() => {
            if (!isMountedRef.current) return;
            onComplete && onComplete(numbers);
          }, 1000);
        }, 2000); // Last bubble also visible for 2 seconds
      }
    };
    
    // Start first bubble after 1 second
    setTimeout(showNextBubble, 1000);

    return () => {
      isMountedRef.current = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [onComplete]);

  return (
    <div className="robot-chat-animation">
      <div className="robot-scene">
        {/* Robot and Chat Container */}
        <div className="robot-chat-container">
          {/* Large Robot Head - LEFT SIDE - ALWAYS VISIBLE */}
          <motion.div 
            className="robot-head-large"
            animate={{ 
              rotateY: [0, 1, -1, 0], // Gentle swaying 1-2 degrees
              rotateZ: [0, 0.5, -0.5, 0] // Slight tilt
            }}
            transition={{ 
              duration: 3, // 3 seconds per cycle
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            {/* Robot Head Structure */}
            <div className="robot-head-inner-large">
              {/* Main Head */}
              <div className="robot-skull-large">
                {/* Antennas */}
                <div className="robot-antenna-large left">
                  <div className="antenna-tip-large red"></div>
                </div>
                <div className="robot-antenna-large right">
                  <div className="antenna-tip-large blue"></div>
                </div>
                
                {/* Eyes */}
                <div className="robot-eyes-large">
                  <motion.div 
                    className="robot-eye-large left"
                    animate={{ 
                      backgroundColor: ["#00ffff", "#ff0088", "#00ffff"],
                      boxShadow: [
                        "0 0 15px #00ffff",
                        "0 0 25px #ff0088", 
                        "0 0 15px #00ffff"
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="eye-pupil-large"></div>
                  </motion.div>
                  
                  <motion.div 
                    className="robot-eye-large right"
                    animate={{ 
                      backgroundColor: ["#ff0088", "#00ffff", "#ff0088"],
                      boxShadow: [
                        "0 0 15px #ff0088",
                        "0 0 25px #00ffff",
                        "0 0 15px #ff0088"
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  >
                    <div className="eye-pupil-large"></div>
                  </motion.div>
                </div>
                
                {/* Mouth */}
                <motion.div 
                  className="robot-mouth-large"
                  animate={isComplete ? { 
                    scale: [1, 1.2, 1],
                    backgroundColor: "#00ff88"
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mouth-line-large"></div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Chat Bubble - RIGHT SIDE of robot */}
          <AnimatePresence mode="wait">
            {currentBubble && (
              <motion.div
                key={currentBubble.id}
                className="chat-bubble-large"
                initial={{ 
                  opacity: 0, 
                  scale: 0.8,
                  x: -30 // Start from left (towards robot)
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: 0 // Bounce to final position
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.9,
                  y: -20, // Move up when disappearing
                  x: 10
                }}
                transition={{ 
                  duration: 0.3, // Quick fade-in
                  ease: "easeOut"
                }}
              >
                <div className="bubble-content-large">
                  {currentBubble.message}
                </div>
                <div className="bubble-tail-large"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Final Numbers Display - SEPARATE AnimatePresence - only for results */}
        <AnimatePresence mode="wait">
          {isComplete && finalNumbers.length > 0 && (
            <motion.div
              className="final-numbers-display"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h3 className="final-numbers-title">🎯 Wygenerowane liczby</h3>
              <div className="final-numbers-grid">
                {finalNumbers.map((number, index) => (
                  <motion.div
                    key={index}
                    className="final-number"
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    {number}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="robot-status">
        <div className="status-text">
          {isComplete ? "✅ Analiza zakończona!" : "🤖 Robot analizuje dane..."}
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </div>
  );
};

export default RobotChatAnimation;
