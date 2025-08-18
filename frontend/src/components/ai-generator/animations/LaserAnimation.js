import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LaserAnimation = ({ onComplete }) => {
  const [laserLines, setLaserLines] = useState([]);
  const [targetNumbers, setTargetNumbers] = useState([]);
  const [particles, setParticles] = useState([]);
  const [currentLaser, setCurrentLaser] = useState(0);

  useEffect(() => {
    // Generowanie linii laserowych
    const lines = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: Math.random() * 100,
      endY: Math.random() * 100,
      color: `hsl(${i * 60}, 100%, 60%)`
    }));
    setLaserLines(lines);

    // Generowanie cząsteczek
    const particleElements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`
    }));
    setParticles(particleElements);

    // Aktywacja laserów co 600ms
    const laserInterval = setInterval(() => {
      if (currentLaser < lines.length) {
        setCurrentLaser(prev => prev + 1);
      } else {
        clearInterval(laserInterval);
      }
    }, 600);

    // Generowanie liczb docelowych po 2.5 sekundach
    const targetTimer = setTimeout(() => {
      const numbers = [1, 24, 30, 34, 43, 45];
      numbers.forEach((num, index) => {
        setTimeout(() => {
          setTargetNumbers(prev => [...prev, num]);
        }, index * 400);
      });

      // Zakończenie po 4.5 sekundach
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 4500);
    }, 2500);

    return () => {
      clearInterval(laserInterval);
      clearTimeout(targetTimer);
    };
  }, [currentLaser, onComplete]);

  return (
    <div className="laser-animation">
      <div className="laser-scene">
        {/* Tło futurystyczne */}
        <div className="futuristic-background">
          <div className="grid-lines" />
        </div>

        {/* Linie laserowe */}
        {laserLines.slice(0, currentLaser).map((line) => (
          <motion.div
            key={line.id}
            className="laser-line"
            style={{
              '--start-x': `${line.startX}%`,
              '--start-y': `${line.startY}%`,
              '--end-x': `${line.endX}%`,
              '--end-y': `${line.endY}%`,
              '--laser-color': line.color
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}

        {/* Cząsteczki */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              boxShadow: `0 0 10px ${particle.color}`
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: particle.id * 0.2
            }}
          />
        ))}

        {/* Liczby docelowe */}
        {targetNumbers.map((num, index) => (
          <motion.div
            key={index}
            className="target-number"
            style={{
              left: `${20 + (index * 12)}%`,
              top: `${30 + Math.sin(index) * 20}%`
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: [
                '0 0 10px rgba(255, 0, 0, 0.5)',
                '0 0 30px rgba(255, 0, 0, 1), 0 0 50px rgba(255, 0, 0, 0.8)',
                '0 0 10px rgba(255, 0, 0, 0.5)'
              ]
            }}
            transition={{ 
              duration: 0.8,
              ease: "backOut"
            }}
          >
            {num}
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="laser-text"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Laser AI celuje...
      </motion.div>
    </div>
  );
};

export default LaserAnimation;



