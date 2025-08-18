import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const RocketLaunchAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('preparing');
  const [fireIntensity, setFireIntensity] = useState(0);
  const [particles, setParticles] = useState([]);
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const rocketControls = useAnimation();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Responsive canvas
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const createParticle = (x, y) => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -6 - 3,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      size: Math.random() * 5 + 3,
      color: '#FFD700'
    });

    const updateParticles = () => {
      if (!isMountedRef.current) return;
      
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - p.decay,
            vy: p.vy + 0.1 // gravity
          }))
          .filter(p => p.life > 0)
      );
    };

    // Animation phases
    const startAnimation = async () => {
      // Increase fire intensity over 4 seconds
      const fireInterval = setInterval(() => {
        if (!isMountedRef.current) {
          clearInterval(fireInterval);
          return;
        }
        
        setFireIntensity(prev => {
          if (prev < 100) {
            // Add lots of particles based on fire intensity
            const newParticles = [];
            
            // More sparks during preparation - intensity increases
            const sparkCount = Math.floor(8 + (prev / 100) * 12); // 8 to 20 sparks
            for (let i = 0; i < sparkCount; i++) {
              newParticles.push(createParticle(
                canvas.width / 2 + (Math.random() - 0.5) * 80,
                canvas.height - 50
              ));
            }
            
            setParticles(prev => [...prev, ...newParticles]);
            return prev + 2;
          } else {
            clearInterval(fireInterval);
            return 100;
          }
        });
      }, 100);

      // Launch after 4 seconds
      setTimeout(async () => {
        if (!isMountedRef.current) return;
        
        // Intense launch particles
        const launchParticles = [];
        for (let i = 0; i < 40; i++) {
          launchParticles.push(createParticle(
            canvas.width / 2 + (Math.random() - 0.5) * 100,
            canvas.height - 40
          ));
        }
        setParticles(prev => [...prev, ...launchParticles]);
        
        // Flying phase
        setTimeout(async () => {
          if (!isMountedRef.current) return;
          
          // Smooth flight animation - 2 seconds
          try {
            await rocketControls.start({
              y: -600,
              scale: 0.6,
              rotate: -5,
              opacity: 0,
              transition: {
                duration: 2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            });
          } catch (error) {
            // Ignore errors if component unmounted
            if (isMountedRef.current) {
              console.error('Animation error:', error);
            }
          }
          
          // After rocket flies up and disappears, show numbers
          setTimeout(() => {
            if (!isMountedRef.current) return;
            
            const numbers = [1, 24, 30, 34, 43, 45];
            setGeneratedNumbers(numbers);
            
            // Call onComplete after showing numbers
            setTimeout(() => {
              if (isMountedRef.current && onComplete) onComplete();
            }, 2000);
          }, 500);
        }, 1000);
      }, 4000);

      return () => clearInterval(fireInterval);
    };

    // Animation loop
    const animate = () => {
      if (!isMountedRef.current) return;
      
      updateParticles();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    startAnimation();

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onComplete, rocketControls]);

  return (
    <div className="rocket-launch-animation">
      {/* Background gradient */}
      <div className="rocket-background" />
      
      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        className="particle-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      
      {/* SVG Rocket */}
      <motion.div
        className="rocket-svg-container"
        animate={rocketControls}
        initial={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
        style={{
          willChange: 'transform'
        }}
      >
        <svg
          width="120"
          height="200"
          viewBox="0 0 120 200"
          className="rocket-svg"
        >
          {/* Rocket body */}
          <defs>
            <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
            </linearGradient>
            
            <linearGradient id="rocketNose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF6B35', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#FF8C42', stopOpacity: 1 }} />
            </linearGradient>
            
            <linearGradient id="rocketWindow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#87CEEB', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#4ECDC4', stopOpacity: 1 }} />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Rocket nose cone */}
          <path
            d="M60 20 L80 60 L40 60 Z"
            fill="url(#rocketNose)"
            filter="url(#glow)"
          />
          
          {/* Rocket body */}
          <rect
            x="45"
            y="60"
            width="30"
            height="80"
            rx="15"
            fill="url(#rocketBody)"
            filter="url(#glow)"
          />
          
          {/* Window */}
          <circle
            cx="60"
            cy="90"
            r="8"
            fill="url(#rocketWindow)"
            filter="url(#glow)"
          />
          
          {/* Fins */}
          <path
            d="M45 140 L25 160 L45 160 Z"
            fill="#FF6B35"
            filter="url(#glow)"
          />
          <path
            d="M75 140 L95 160 L75 160 Z"
            fill="#FF6B35"
            filter="url(#glow)"
          />
          
          {/* Engine nozzle */}
          <rect
            x="50"
            y="140"
            width="20"
            height="10"
            rx="5"
            fill="#333"
            filter="url(#glow)"
          />
        </svg>
      </motion.div>
      
      {/* Animated Fire */}
      <motion.div
        className="rocket-fire"
        animate={{
          scale: [1, fireIntensity / 50, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          height: `${fireIntensity}px`,
          background: `linear-gradient(to top, 
            rgba(255, 69, 0, 0.9) 0%, 
            rgba(255, 140, 0, 1) 30%, 
            rgba(255, 215, 0, 1) 60%, 
            rgba(255, 255, 255, 0.9) 100%)`,
          filter: 'blur(1px)',
          boxShadow: `
            0 0 ${fireIntensity / 2}px rgba(255, 69, 0, 0.8),
            0 0 ${fireIntensity}px rgba(255, 140, 0, 0.6),
            0 0 ${fireIntensity * 1.5}px rgba(255, 215, 0, 0.4)
          `,
          willChange: 'transform, opacity'
        }}
      >
        {/* Fire animation layers */}
        <div className="fire-layer fire-layer-1" />
        <div className="fire-layer fire-layer-2" />
        <div className="fire-layer fire-layer-3" />
      </motion.div>
      
      {/* Generated Numbers */}
      {generatedNumbers.length > 0 && (
        <motion.div
          className="generated-numbers"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h3>🎯 Wygenerowane liczby:</h3>
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
        </motion.div>
      )}
      
      {/* Progress indicator */}
      <motion.div
        className="rocket-progress"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 6, ease: "easeInOut" }}
      />
    </div>
  );
};

export default RocketLaunchAnimation;

