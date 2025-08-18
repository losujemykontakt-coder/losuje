import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NeuronAIAnimation.css';

const NeuronAIAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('initializing');
  const [activeImpulses, setActiveImpulses] = useState([]);
  const [holographicNumbers, setHolographicNumbers] = useState([]);
  const [finalNumbers, setFinalNumbers] = useState([]);
  const [progress, setProgress] = useState(0);
  const [networkGlow, setNetworkGlow] = useState(0);
  
  // Generate neural network nodes
  const neuralNodes = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < 50; i++) {
      nodes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 50 - 25,
        connections: [],
        isActive: false,
        glow: 0
      });
    }
    
    // Create connections between nearby nodes
    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + 
            Math.pow(node.y - otherNode.y, 2) + 
            Math.pow(node.z - otherNode.z, 2)
          );
          if (distance < 30 && Math.random() > 0.7) {
            node.connections.push(j);
          }
        }
      });
    });
    
    return nodes;
  }, []);

  useEffect(() => {
    // Generate random numbers
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
    
    const randomNumbers = generateRandomNumbers();
    console.log('Generated numbers:', randomNumbers);
    setFinalNumbers(randomNumbers);

    // Initialize phase
    setTimeout(() => {
      setHolographicNumbers([]);
      setPhase('generating');
    }, 1000);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
         }, 120); // 7 seconds total (2 seconds longer)

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (phase === 'generating' && finalNumbers.length > 0) {
      console.log('Starting neural generation with numbers:', finalNumbers);
      
      const generateNumber = (index) => {
        if (index < finalNumbers.length) {
          // Create impulse path
          const startNode = Math.floor(Math.random() * neuralNodes.length);
          const endNode = Math.floor(Math.random() * neuralNodes.length);
          
          const impulse = {
            id: index,
            path: [startNode, endNode],
            progress: 0,
            number: finalNumbers[index],
            isActive: true
          };
          
          setActiveImpulses(prev => [...prev, impulse]);
          
          // Animate impulse
          const impulseInterval = setInterval(() => {
            setActiveImpulses(prev => 
              prev.map(imp => 
                imp.id === index 
                  ? { ...imp, progress: Math.min(imp.progress + 0.02, 1) }
                  : imp
              )
            );
          }, 50);
          
          setTimeout(() => {
            clearInterval(impulseInterval);
            
            // Add holographic number
            const newHologram = {
              id: index,
              number: finalNumbers[index],
              isVisible: true,
              nodeId: endNode
            };
            console.log('Adding hologram:', newHologram);
            setHolographicNumbers(prev => [...prev, newHologram]);
            
            // Remove impulse
            setActiveImpulses(prev => prev.filter(imp => imp.id !== index));
            
            // Continue to next number
            setTimeout(() => {
              generateNumber(index + 1);
                         }, 700);
                     }, 3500);
        } else {
          // Complete animation - network explosion
          setTimeout(() => {
            setNetworkGlow(1);
            setPhase('complete');
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 3000);
          }, 1500);
        }
      };
      
      generateNumber(0);
    }
  }, [phase, finalNumbers, onComplete, neuralNodes]);

  return (
    <div className="neuron-ai-animation">
      <div className="neural-scene">
        {/* Neural Network Background */}
        <div className="neural-background">
          <div className="fog-layer fog-1" />
          <div className="fog-layer fog-2" />
          <div className="fog-layer fog-3" />
        </div>

        {/* Neural Network Nodes */}
        <div className="neural-network">
          {neuralNodes.map((node, index) => (
            <motion.div
              key={node.id}
              className="neural-node"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: `translateZ(${node.z}px)`,
                '--node-glow': networkGlow
              }}
                             animate={{
                 scale: [1, 1.12, 1],
                 opacity: [0.4, 1, 0.4]
               }}
               transition={{
                 duration: 6,
                 repeat: Infinity,
                 delay: index * 0.03,
                 ease: "easeInOut"
               }}
            >
              <div className="node-core" />
              <div className="node-aura" />
            </motion.div>
          ))}
        </div>

        {/* Neural Connections */}
        <svg className="neural-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
          {neuralNodes.map((node, index) =>
            node.connections.map((connectionId, connIndex) => {
              const targetNode = neuralNodes[connectionId];
              return (
                                 <motion.line
                   key={`connection-${index}-${connectionId}-${connIndex}`}
                   x1={`${node.x}%`}
                   y1={`${node.y}%`}
                   x2={`${targetNode.x}%`}
                   y2={`${targetNode.y}%`}
                   className="neural-connection"
                   initial={{ pathLength: 0, opacity: 0 }}
                   animate={{ 
                     pathLength: 1, 
                     opacity: 0.3,
                     stroke: networkGlow > 0 ? '#00ffff' : '#4a4a4a'
                   }}
                   transition={{
                     duration: 2,
                     delay: (index + connIndex) * 0.01,
                     ease: "easeOut"
                   }}
                 />
              );
            })
          )}
        </svg>

        {/* Active Impulses */}
        <div className="impulse-container">
                     {activeImpulses.map((impulse, impulseIndex) => {
             const startNode = neuralNodes[impulse.path[0]];
             const endNode = neuralNodes[impulse.path[1]];
             
             return (
               <motion.div
                 key={`impulse-${impulse.id}-${impulseIndex}`}
                 className="neural-impulse"
                 style={{
                   left: `${startNode.x + (endNode.x - startNode.x) * impulse.progress}%`,
                   top: `${startNode.y + (endNode.y - startNode.y) * impulse.progress}%`
                 }}
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ 
                   scale: [0, 1.5, 0], 
                   opacity: [0, 1, 0]
                 }}
                 transition={{
                   duration: 1.5,
                   repeat: Infinity,
                   ease: "easeInOut"
                 }}
               >
                 <div className="impulse-core" />
                 <div className="impulse-trail" />
               </motion.div>
             );
           })}
        </div>

        {/* Holographic Numbers */}
        <div className="holographic-numbers">
                     {holographicNumbers.map((hologram, index) => {
             const node = neuralNodes[hologram.nodeId];
             return (
               <motion.div
                 key={`hologram-${hologram.id}-${index}`}
                 className="holographic-number"
                 style={{
                   left: `${node.x}%`,
                   top: `${node.y}%`
                 }}
                 initial={{ scale: 0, opacity: 0, rotateY: -90 }}
                 animate={{ 
                   scale: hologram.isVisible ? 1 : 0, 
                   opacity: hologram.isVisible ? 1 : 0,
                   rotateY: hologram.isVisible ? 0 : -90
                 }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
               >
                 {hologram.number}
               </motion.div>
             );
           })}
        </div>

        {/* Final Numbers Display */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="final-numbers-display"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="final-numbers-title">Wylosowane liczby:</div>
              <div className="final-numbers-grid">
                                 {finalNumbers.map((number, index) => (
                   <motion.div
                     key={`final-number-${number}-${index}`}
                     className="final-number"
                     initial={{ scale: 0, rotate: -180 }}
                     animate={{ scale: 1, rotate: 0 }}
                     transition={{ 
                       duration: 0.5, 
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

      {/* Status Overlay */}
      <div className="neural-status">
        <motion.div 
          className="status-text"
          animate={{ textShadow: ['0 0 10px #00ffff', '0 0 20px #00ffff', '0 0 10px #00ffff'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {phase === 'initializing' && 'Inicjalizacja sieci neuronowej...'}
          {phase === 'generating' && 'Analiza wzorców neuronowych...'}
          {phase === 'complete' && 'Analiza zakończona!'}
        </motion.div>
        
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

export default NeuronAIAnimation;
