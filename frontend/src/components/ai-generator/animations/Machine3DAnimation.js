import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const Machine3DAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('idle'); // 'idle', 'spinning', 'stopping', 'complete'
  const [reel1Symbols, setReel1Symbols] = useState(['🍇', '7', '🍋']);
  const [reel2Symbols, setReel2Symbols] = useState(['🍒', '7', '🍀']);
  const [reel3Symbols, setReel3Symbols] = useState(['BAR', '7', '🔔']);
  const [finalNumbers, setFinalNumbers] = useState([]);
  const [handlePulled, setHandlePulled] = useState(false);
  const [jackpotGlow, setJackpotGlow] = useState(0);
  const [reelSpinning, setReelSpinning] = useState({ r1: false, r2: false, r3: false });
  const animationRef = useRef(null);
  const isMountedRef = useRef(true);

  // Casino symbols for the reels
  const casinoSymbols = ['🍇', '🍒', '🍋', '🍊', '🍑', '🔔', '💎', 'BAR', '7', '🍀', '⭐', '🎰'];

  // Generate random symbols for each reel
  const generateReelSymbols = () => {
    const symbols = [];
    for (let i = 0; i < 12; i++) {
      symbols.push(casinoSymbols[Math.floor(Math.random() * casinoSymbols.length)]);
    }
    return symbols;
  };

  // Create spinning sequence for each reel
  const createReelSequence = (finalSymbols) => {
    const sequence = [];
    const symbols = generateReelSymbols();
    
    // Add random symbols for spinning effect
    for (let i = 0; i < 25; i++) {
      sequence.push(symbols[i % symbols.length]);
    }
    
    // Add final symbols at the end
    sequence.push(...finalSymbols);
    
    return sequence;
  };

  useEffect(() => {
    isMountedRef.current = true;

    const startAnimation = async () => {
      setPhase('spinning');
      setHandlePulled(true);
      
      // Final numbers to generate
      const targetNumbers = [1, 24, 30, 34, 43, 45];
      setFinalNumbers(targetNumbers);
      
      // Start jackpot glow effect
      const glowInterval = setInterval(() => {
        if (!isMountedRef.current) {
          clearInterval(glowInterval);
          return;
        }
        setJackpotGlow(prev => prev === 0 ? 1 : 0);
      }, 800);
      
      // Create sequences for each reel
      const reel1Sequence = createReelSequence(['🍇', '7', '🍋']);
      const reel2Sequence = createReelSequence(['🍒', '7', '🍀']);
      const reel3Sequence = createReelSequence(['BAR', '7', '🔔']);
      
      // Start all reels spinning at once
      setReelSpinning({ r1: true, r2: true, r3: true });
      
      // Animate all reels simultaneously
      let currentIndex = 0;
      const spinInterval = setInterval(() => {
        if (!isMountedRef.current) {
          clearInterval(spinInterval);
          return;
        }
        
        // Update all reels at the same time
        setReel1Symbols([
          reel1Sequence[currentIndex % reel1Sequence.length],
          reel1Sequence[(currentIndex + 1) % reel1Sequence.length],
          reel1Sequence[(currentIndex + 2) % reel1Sequence.length]
        ]);
        
        setReel2Symbols([
          reel2Sequence[currentIndex % reel2Sequence.length],
          reel2Sequence[(currentIndex + 1) % reel2Sequence.length],
          reel2Sequence[(currentIndex + 2) % reel2Sequence.length]
        ]);
        
        setReel3Symbols([
          reel3Sequence[currentIndex % reel3Sequence.length],
          reel3Sequence[(currentIndex + 1) % reel3Sequence.length],
          reel3Sequence[(currentIndex + 2) % reel3Sequence.length]
        ]);
        
        currentIndex++;
        
        // Stop after 25 cycles
        if (currentIndex >= 25) {
          clearInterval(spinInterval);
          
          // Stop reels one by one with delay
          setTimeout(() => {
            if (!isMountedRef.current) return;
            setReelSpinning(prev => ({ ...prev, r1: false }));
          }, 800);
          
          setTimeout(() => {
            if (!isMountedRef.current) return;
            setReelSpinning(prev => ({ ...prev, r2: false }));
          }, 1600);
          
          setTimeout(() => {
            if (!isMountedRef.current) return;
            setReelSpinning(prev => ({ ...prev, r3: false }));
          }, 2400);
        }
      }, 500); // Much slower speed - 500ms instead of 300ms
      
      // Stop glow effect
      setTimeout(() => {
        clearInterval(glowInterval);
      }, 6000);
      
      if (!isMountedRef.current) return;
      
      // Complete animation
      setTimeout(() => {
        if (!isMountedRef.current) return;
        setPhase('complete');
        
        // Call onComplete after showing final result
        setTimeout(() => {
          if (isMountedRef.current && onComplete) onComplete();
        }, 2000);
      }, 6000);
    };

    startAnimation();

    return () => {
      isMountedRef.current = false;
    };
  }, [onComplete]);

  return (
    <div className="machine-3d-animation">
      {/* Background gradient */}
      <div className="machine-background" />
      
      {/* Casino Slot Machine Container */}
      <motion.div
        className="slot-machine-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Slot Machine SVG - Bigger reels */}
        <svg
          width="400"
          height="550"
          viewBox="0 0 400 550"
          className="slot-machine-svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="machineFrame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#8B0000', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#DC143C', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#8B0000', stopOpacity: 1 }} />
            </linearGradient>
            
            <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
            </linearGradient>
            
            <linearGradient id="jackpotGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 0.8 }} />
            </linearGradient>
            
            <linearGradient id="handleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#DC143C', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#8B0000', stopOpacity: 1 }} />
            </linearGradient>
            
            <linearGradient id="spinButtonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#DC143C', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#FF4500', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#DC143C', stopOpacity: 1 }} />
            </linearGradient>
            
            <linearGradient id="reelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#2a2a2a', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#1a1a1a', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2a2a2a', stopOpacity: 1 }} />
            </linearGradient>
            
            <linearGradient id="reelBorderGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 0.8 }} />
            </linearGradient>
            
            {/* Filters */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="sparkle">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="reelGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Slot Machine Frame - Bigger size */}
          <rect
            x="30"
            y="70"
            width="340"
            height="420"
            rx="20"
            fill="url(#machineFrame)"
            stroke="url(#goldBorder)"
            strokeWidth="4"
            filter="url(#glow)"
          />
          
          {/* Gold studs/rivets around the frame */}
          <circle cx="45" cy="90" r="3" fill="url(#goldBorder)" filter="url(#sparkle)" />
          <circle cx="355" cy="90" r="3" fill="url(#goldBorder)" filter="url(#sparkle)" />
          <circle cx="45" cy="470" r="3" fill="url(#goldBorder)" filter="url(#sparkle)" />
          <circle cx="355" cy="470" r="3" fill="url(#goldBorder)" filter="url(#sparkle)" />
          <circle cx="45" cy="280" r="3" fill="url(#goldBorder)" filter="url(#sparkle)" />
          <circle cx="355" cy="280" r="3" fill="url(#goldBorder)" filter="url(#sparkle)" />
          
          {/* JACKPOT Marquee */}
          <motion.rect
            x="45"
            y="90"
            width="290"
            height="50"
            rx="10"
            fill="url(#jackpotGlow)"
            stroke="url(#goldBorder)"
            strokeWidth="3"
            filter="url(#neonGlow)"
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              opacity: jackpotGlow === 1 ? 1 : 0.7
            }}
          />
          
          {/* Crown icon */}
          <text
            x="200"
            y="110"
            textAnchor="middle"
            fill="url(#goldBorder)"
            fontSize="18"
            fontFamily="Arial, sans-serif"
            filter="url(#sparkle)"
          >
            👑
          </text>
          
          {/* JACKPOT Text */}
          <text
            x="200"
            y="125"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="16"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            filter="url(#neonGlow)"
          >
            JACKPOT
          </text>
          
          {/* Reels Display Window */}
          <rect
            x="60"
            y="160"
            width="280"
            height="110"
            rx="8"
            fill="#000000"
            stroke="url(#goldBorder)"
            strokeWidth="3"
          />
          
          {/* Reel 1 - Bigger and more stylized */}
          <motion.g
            animate={{
              scale: reelSpinning.r1 ? [1, 1.05, 1] : 1,
              y: reelSpinning.r1 ? [0, -2, 0] : 0,
              rotate: reelSpinning.r1 ? [0, 1, 0] : 0
            }}
            transition={{
              duration: 0.6,
              repeat: reelSpinning.r1 ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {/* Reel background with gradient */}
            <rect
              x="75"
              y="170"
              width="60"
              height="90"
              rx="5"
              fill="url(#reelGradient)"
              stroke="url(#reelBorderGlow)"
              strokeWidth="2"
              filter="url(#reelGlow)"
            />
            
            {/* Inner reel border */}
            <rect
              x="78"
              y="173"
              width="54"
              height="84"
              rx="3"
              fill="none"
              stroke="url(#goldBorder)"
              strokeWidth="1"
              opacity="0.5"
            />
            
            <text
              x="105"
              y="190"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="14"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              {reel1Symbols[0]}
            </text>
            <text
              x="105"
              y="215"
              textAnchor="middle"
              fill="#ff0000"
              fontSize="18"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
              filter="url(#neonGlow)"
            >
              {reel1Symbols[1]}
            </text>
            <text
              x="105"
              y="240"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="14"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              {reel1Symbols[2]}
            </text>
          </motion.g>
          
          {/* Reel 2 - Bigger and more stylized */}
          <motion.g
            animate={{
              scale: reelSpinning.r2 ? [1, 1.05, 1] : 1,
              y: reelSpinning.r2 ? [0, -2, 0] : 0,
              rotate: reelSpinning.r2 ? [0, 1, 0] : 0
            }}
            transition={{
              duration: 0.6,
              repeat: reelSpinning.r2 ? Infinity : 0,
              ease: "easeInOut",
              delay: 0.1
            }}
          >
            {/* Reel background with gradient */}
            <rect
              x="170"
              y="170"
              width="60"
              height="90"
              rx="5"
              fill="url(#reelGradient)"
              stroke="url(#reelBorderGlow)"
              strokeWidth="2"
              filter="url(#reelGlow)"
            />
            
            {/* Inner reel border */}
            <rect
              x="173"
              y="173"
              width="54"
              height="84"
              rx="3"
              fill="none"
              stroke="url(#goldBorder)"
              strokeWidth="1"
              opacity="0.5"
            />
            
            <text
              x="200"
              y="190"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="14"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              {reel2Symbols[0]}
            </text>
            <text
              x="200"
              y="215"
              textAnchor="middle"
              fill="#ff0000"
              fontSize="18"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
              filter="url(#neonGlow)"
            >
              {reel2Symbols[1]}
            </text>
            <text
              x="200"
              y="240"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="14"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              {reel2Symbols[2]}
            </text>
          </motion.g>
          
          {/* Reel 3 - Bigger and more stylized */}
          <motion.g
            animate={{
              scale: reelSpinning.r3 ? [1, 1.05, 1] : 1,
              y: reelSpinning.r3 ? [0, -2, 0] : 0,
              rotate: reelSpinning.r3 ? [0, 1, 0] : 0
            }}
            transition={{
              duration: 0.6,
              repeat: reelSpinning.r3 ? Infinity : 0,
              ease: "easeInOut",
              delay: 0.2
            }}
          >
            {/* Reel background with gradient */}
            <rect
              x="265"
              y="170"
              width="60"
              height="90"
              rx="5"
              fill="url(#reelGradient)"
              stroke="url(#reelBorderGlow)"
              strokeWidth="2"
              filter="url(#reelGlow)"
            />
            
            {/* Inner reel border */}
            <rect
              x="268"
              y="173"
              width="54"
              height="84"
              rx="3"
              fill="none"
              stroke="url(#goldBorder)"
              strokeWidth="1"
              opacity="0.5"
            />
            
            <text
              x="295"
              y="190"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="14"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              {reel3Symbols[0]}
            </text>
            <text
              x="295"
              y="215"
              textAnchor="middle"
              fill="#ff0000"
              fontSize="18"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
              filter="url(#neonGlow)"
            >
              {reel3Symbols[1]}
            </text>
            <text
              x="295"
              y="240"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="14"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              {reel3Symbols[2]}
            </text>
          </motion.g>
          
          {/* SPIN Button */}
          <motion.rect
            x="130"
            y="290"
            width="140"
            height="50"
            rx="25"
            fill="url(#spinButtonGlow)"
            stroke="url(#goldBorder)"
            strokeWidth="3"
            filter="url(#neonGlow)"
            animate={{
              scale: phase === 'spinning' ? [1, 1.05, 1] : 1
            }}
            transition={{
              duration: 0.8,
              repeat: phase === 'spinning' ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          
          {/* SPIN Text */}
          <text
            x="200"
            y="320"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="16"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            filter="url(#neonGlow)"
          >
            SPIN
          </text>
          
          {/* Handle */}
          <motion.line
            x1="360"
            y1="180"
            x2="380"
            y2="90"
            stroke="url(#handleGlow)"
            strokeWidth="8"
            filter="url(#neonGlow)"
            animate={{
              rotate: handlePulled ? [0, -25, 0] : 0
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          />
          
          <motion.circle
            cx="385"
            cy="85"
            r="10"
            fill="url(#handleGlow)"
            filter="url(#neonGlow)"
            animate={{
              scale: handlePulled ? [1, 1.4, 1] : 1
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          />
          
          {/* Light rays effect */}
          <path
            d="M200 50 L180 30 L220 30 Z"
            fill="url(#goldBorder)"
            opacity="0.4"
            filter="url(#sparkle)"
          />
          <path
            d="M200 50 L160 40 L240 40 Z"
            fill="url(#goldBorder)"
            opacity="0.3"
            filter="url(#sparkle)"
          />
        </svg>
      </motion.div>
      
      {/* Status Text */}
      <motion.div
        className="machine-status"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {phase === 'idle' && 'Przygotowanie maszyny...'}
        {phase === 'spinning' && 'Losowanie liczb...'}
        {phase === 'stopping' && 'Analiza wyników...'}
        {phase === 'complete' && 'Liczby wygenerowane!'}
      </motion.div>
      
      {/* Final Numbers Display */}
      {phase === 'complete' && (
        <motion.div
          className="final-numbers"
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h3>🎯 Wygenerowane liczby:</h3>
          <div className="numbers-display">
            {finalNumbers.map((num, index) => (
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
        </motion.div>
      )}
      
      {/* Progress indicator */}
      <motion.div
        className="machine-progress"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 6, ease: "easeInOut" }}
      />
    </div>
  );
};

export default Machine3DAnimation;

