import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActiveTalismanDisplay = ({ activeTalisman, talismanDefinitions }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (activeTalisman) {
      // Generuj iskry co 2 sekundy
      const interval = setInterval(() => {
        const newSparkles = Array.from({ length: 3 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: i * 0.2
        }));
        setSparkles(prev => [...prev, ...newSparkles]);
      }, 2000);

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
      className="fixed top-4 right-4 z-50"
    >
      <div className="relative">
        {/* Główny kontener talizmanu */}
        <motion.div
          className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-full p-3 border-2 border-purple-400 shadow-lg"
          animate={{
            boxShadow: [
              "0 0 20px rgba(147, 51, 234, 0.5)",
              "0 0 40px rgba(147, 51, 234, 0.8)",
              "0 0 20px rgba(147, 51, 234, 0.5)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="text-2xl">{talisman.icon}</div>
        </motion.div>

        {/* Iskry wokół talizmanu */}
        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              initial={{
                x: "50%",
                y: "50%",
                opacity: 1,
                scale: 0
              }}
              animate={{
                x: `${sparkle.x}%`,
                y: `${sparkle.y}%`,
                opacity: [1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: sparkle.delay,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Tooltip z nazwą talizmanu */}
        <motion.div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {talisman.name}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-black/80"></div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ActiveTalismanDisplay;







