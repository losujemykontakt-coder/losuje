import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActiveTalismanDisplay = ({ activeTalisman, talismanDefinitions }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (activeTalisman) {
      // Generuj bardzo delikatne iskry co 3 sekundy
      const interval = setInterval(() => {
        const newSparkles = Array.from({ length: 3 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 80 - 10, // Mniejszy zasięg wokół ikony
          y: Math.random() * 80 - 10,
          delay: i * 0.2,
          size: Math.random() * 1.5 + 0.5 // Bardzo małe rozmiary
        }));
        setSparkles(prev => [...prev, ...newSparkles]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activeTalisman]);

  useEffect(() => {
    // Usuń iskry po 3 sekundach
    const timeout = setTimeout(() => {
      setSparkles(prev => prev.filter(sparkle => 
        Date.now() - sparkle.id < 3000
      ));
    }, 3000);

    return () => clearTimeout(timeout);
  }, [sparkles]);

  if (!activeTalisman) return null;

  const talisman = talismanDefinitions.find(t => t.id === activeTalisman.talisman_id);

  if (!talisman) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-4 left-4 z-50"
    >
      <div className="relative">
        {/* Główny kontener talizmanu - czysta ikona bez tła */}
        <motion.div
          className="flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.9, 1, 0.9]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
          style={{
            width: "40px",
            height: "40px"
          }}
        >
          {talisman.icon === '🐎' ? (
            <img 
              src="/horseshoe.png" 
              alt="Aktywny talizman" 
              style={{
                width: "32px",
                height: "32px"
              }}
            />
          ) : (
            <div 
              className="text-2xl"
              style={{
                lineHeight: "1"
              }}
            >
              {talisman.icon}
            </div>
          )}
        </motion.div>

        {/* Delikatne iskry wokół talizmanu */}
        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute bg-gradient-to-r from-yellow-100 to-orange-200 rounded-full opacity-40"
              style={{
                width: `${sparkle.size}px`,
                height: `${sparkle.size}px`
              }}
              initial={{
                x: "50%",
                y: "50%",
                opacity: 0,
                scale: 0
              }}
              animate={{
                x: `${sparkle.x}%`,
                y: `${sparkle.y}%`,
                opacity: [0, 0.3, 0],
                scale: [0, 0.8, 0]
              }}
              transition={{
                duration: 2.5,
                delay: sparkle.delay,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ActiveTalismanDisplay;







