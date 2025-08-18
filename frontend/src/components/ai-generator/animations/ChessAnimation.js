import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Komponent planszy szachowej
const ChessBoard = ({ highlightedSquares = [] }) => {
  const boardRef = useRef();
  
  useFrame((state) => {
    if (boardRef.current) {
      boardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  const squares = useMemo(() => {
    const squares = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isWhite = (row + col) % 2 === 0;
        const isHighlighted = highlightedSquares.includes(`${row}-${col}`);
        squares.push({ row, col, isWhite, isHighlighted });
      }
    }
    return squares;
  }, [highlightedSquares]);

  return (
    <group ref={boardRef} position={[0, 0, 0]}>
      {squares.map(({ row, col, isWhite, isHighlighted }) => (
        <Box
          key={`${row}-${col}`}
          position={[(col - 3.5) * 1.2, 0, (row - 3.5) * 1.2]}
          args={[1, 0.1, 1]}
        >
          <meshStandardMaterial
            color={isWhite ? '#f0d9b5' : '#b58863'}
            transparent
            opacity={isHighlighted ? 0.8 : 1}
            emissive={isHighlighted ? '#ffd700' : '#000000'}
            emissiveIntensity={isHighlighted ? 0.5 : 0}
          />
        </Box>
      ))}
    </group>
  );
};

// Komponent pionka szachowego
const ChessPiece = ({ position, type, isActive, isMoving, targetPosition, onMoveComplete }) => {
  const pieceRef = useRef();
  const [hover, setHover] = useState(false);
  
  useFrame((state) => {
    if (pieceRef.current) {
      // Animacja unoszenia się gdy aktywny
      if (isActive) {
        pieceRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.5;
        pieceRef.current.rotation.y += 0.02;
      }
      
      // Animacja ruchu - bardziej płynna
      if (isMoving && targetPosition) {
        const time = state.clock.elapsedTime;
        
        // Płynny skok w górę z łagodnym opadaniem
        const jumpHeight = Math.sin(time * 3) * 0.3;
        pieceRef.current.position.y = targetPosition.y + 0.5 + jumpHeight;
        
        // Bardziej płynny ruch do celu
        pieceRef.current.position.lerp(
          new THREE.Vector3(targetPosition.x, targetPosition.y + 0.5, targetPosition.z),
          0.03
        );
        
        // Delikatny obrót podczas ruchu
        pieceRef.current.rotation.y += 0.05;
      }
    }
  });

  const getPieceGeometry = () => {
    switch (type) {
      case 'pawn':
        return <Cylinder args={[0.3, 0.3, 0.8, 8]} />;
      case 'rook':
        return <Box args={[0.4, 0.8, 0.4]} />;
      case 'knight':
        return <Sphere args={[0.3, 8, 6]} />;
      case 'bishop':
        return <Cylinder args={[0.2, 0.4, 0.8, 8]} />;
      case 'queen':
        return <Sphere args={[0.35, 8, 6]} />;
      case 'king':
        return <Cylinder args={[0.25, 0.25, 1, 8]} />;
      default:
        return <Cylinder args={[0.3, 0.3, 0.8, 8]} />;
    }
  };

  return (
    <group
      ref={pieceRef}
      position={[position.x, position.y, position.z]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <mesh>
        {getPieceGeometry()}
        <meshStandardMaterial
          color={isActive ? '#00ff88' : hover ? '#ffaa00' : '#444444'}
          metalness={0.8}
          roughness={0.2}
          emissive={isActive ? '#00ff88' : '#000000'}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </mesh>
      
      {/* Neonowe światło pod pionkiem */}
      {isActive && (
        <pointLight
          position={[0, -0.5, 0]}
          color="#00ff88"
          intensity={2}
          distance={3}
        />
      )}
    </group>
  );
};

// Komponent hologramu liczby
const NumberHologram = ({ number, position, isVisible }) => {
  const textRef = useRef();
  
  useFrame((state) => {
    if (textRef.current && isVisible) {
      textRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + position.y;
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  if (!isVisible) return null;

  return (
    <group position={[position.x, position.y, position.z]}>
      <Text
        ref={textRef}
        fontSize={1}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        {number}
      </Text>
      
      {/* Hologram glow */}
      <pointLight
        position={[0, 0, 0]}
        color="#00ffff"
        intensity={3}
        distance={5}
      />
    </group>
  );
};

// Główna scena 3D
const ChessScene = ({ 
  pieces, 
  highlightedSquares, 
  revealedNumbers, 
  onMoveComplete 
}) => {
  const { camera } = useThree();
  
  useFrame((state) => {
    // Delikatne poruszanie kamerą
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 2;
    camera.position.z = Math.cos(state.clock.elapsedTime * 0.1) * 2;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Oświetlenie */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, 10, -10]} intensity={1} color="#ff00ff" />
      <pointLight position={[0, 15, 0]} intensity={0.5} color="#ffff00" />
      
      {/* Plansza */}
      <ChessBoard highlightedSquares={highlightedSquares} />
      
      {/* Pionki */}
      {pieces.map((piece, index) => (
        <ChessPiece
          key={index}
          position={piece.position}
          type={piece.type}
          isActive={piece.isActive}
          isMoving={piece.isMoving}
          targetPosition={piece.targetPosition}
          onMoveComplete={onMoveComplete}
        />
      ))}
      
      {/* Hologramy liczb */}
      {revealedNumbers.map((number, index) => (
        <NumberHologram
          key={index}
          number={number}
          position={[index * 2 - (revealedNumbers.length - 1), 3, 0]}
          isVisible={true}
        />
      ))}
      
      {/* Efekt mgły */}
      <fog attach="fog" args={['#000000', 5, 20]} />
    </>
  );
};

// Główny komponent animacji
const ChessAnimation = ({ onComplete, generatedNumbers = [] }) => {
  const [pieces, setPieces] = useState([]);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [revealedNumbers, setRevealedNumbers] = useState([]);
  const [phase, setPhase] = useState('initial'); // initial, moving, revealing, complete

  // Inicjalizacja pionków
  useEffect(() => {
    const initialPieces = [
      { position: { x: -3, y: 0.5, z: -3 }, type: 'pawn', isActive: false, isMoving: false },
      { position: { x: -1, y: 0.5, z: -3 }, type: 'knight', isActive: false, isMoving: false },
      { position: { x: 1, y: 0.5, z: -3 }, type: 'bishop', isActive: false, isMoving: false },
      { position: { x: 3, y: 0.5, z: -3 }, type: 'rook', isActive: false, isMoving: false },
      { position: { x: -2, y: 0.5, z: 3 }, type: 'queen', isActive: false, isMoving: false },
      { position: { x: 2, y: 0.5, z: 3 }, type: 'king', isActive: false, isMoving: false },
    ];
    setPieces(initialPieces);
  }, []);

  // Animacja ruchów - uproszczona
  useEffect(() => {
    if (phase === 'initial') {
      setTimeout(() => setPhase('moving'), 1000);
    }
  }, [phase]);

  // Animacja ruchów - dynamiczna 6-sekundowa
  useEffect(() => {
    if (phase === 'moving') {
      // Aktywuj wszystkie pionki na początku
      setPieces(prev => prev.map(piece => ({ ...piece, isActive: true })));

      // Pierwszy ruch po 1 sekundzie
      setTimeout(() => {
        setPieces(prev => prev.map((piece, index) => 
          index === 0 ? { 
            ...piece, 
            isMoving: true, 
            targetPosition: { x: Math.random() * 6 - 3, y: 0.5, z: Math.random() * 6 - 3 }
          } : piece
        ));
      }, 1000);

      // Drugi ruch po 2 sekundach
      setTimeout(() => {
        setPieces(prev => prev.map((piece, index) => 
          index === 1 ? { 
            ...piece, 
            isMoving: true, 
            targetPosition: { x: Math.random() * 6 - 3, y: 0.5, z: Math.random() * 6 - 3 }
          } : piece
        ));
      }, 2000);

      // Trzeci ruch po 3 sekundach
      setTimeout(() => {
        setPieces(prev => prev.map((piece, index) => 
          index === 2 ? { 
            ...piece, 
            isMoving: true, 
            targetPosition: { x: Math.random() * 6 - 3, y: 0.5, z: Math.random() * 6 - 3 }
          } : piece
        ));
      }, 3000);

      // Czwarty ruch po 4 sekundach
      setTimeout(() => {
        setPieces(prev => prev.map((piece, index) => 
          index === 3 ? { 
            ...piece, 
            isMoving: true, 
            targetPosition: { x: Math.random() * 6 - 3, y: 0.5, z: Math.random() * 6 - 3 }
          } : piece
        ));
      }, 4000);

      // Piąty ruch po 5 sekundach
      setTimeout(() => {
        setPieces(prev => prev.map((piece, index) => 
          index === 4 ? { 
            ...piece, 
            isMoving: true, 
            targetPosition: { x: Math.random() * 6 - 3, y: 0.5, z: Math.random() * 6 - 3 }
          } : piece
        ));
      }, 5000);

      // Szósty ruch po 6 sekundach
      setTimeout(() => {
        setPieces(prev => prev.map((piece, index) => 
          index === 5 ? { 
            ...piece, 
            isMoving: true, 
            targetPosition: { x: Math.random() * 6 - 3, y: 0.5, z: Math.random() * 6 - 3 }
          } : piece
        ));
      }, 6000);

      // Zakończ animację po 7 sekundach
      setTimeout(() => {
        setPieces(prev => prev.map(piece => ({ 
          ...piece, 
          isActive: false, 
          isMoving: false 
        })));
        setPhase('revealing');
      }, 7000);
    }
  }, [phase]);



  // Ujawnianie liczb
  useEffect(() => {
    if (phase === 'revealing') {
      const revealNumbers = async () => {
        for (let i = 0; i < generatedNumbers.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setRevealedNumbers(prev => [...prev, generatedNumbers[i]]);
        }
        
        setTimeout(() => {
          setPhase('complete');
          if (onComplete) onComplete();
        }, 3000);
      };

      revealNumbers();
    }
  }, [phase, generatedNumbers, onComplete]);

  // Podświetlanie pól
  useEffect(() => {
    if (phase === 'moving') {
      const highlightInterval = setInterval(() => {
        const newHighlight = `${Math.floor(Math.random() * 8)}-${Math.floor(Math.random() * 8)}`;
        setHighlightedSquares(prev => [...prev.slice(-5), newHighlight]);
      }, 300);

      return () => clearInterval(highlightInterval);
    }
  }, [phase]);

  return (
    <div className="chess-animation-3d">
      <Canvas
        camera={{ position: [8, 8, 8], fov: 60 }}
        style={{ background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e)' }}
      >
        <ChessScene
          pieces={pieces}
          highlightedSquares={highlightedSquares}
          revealedNumbers={revealedNumbers}
          onMoveComplete={() => {}}
        />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
        <Environment preset="night" />
      </Canvas>
      

    </div>
  );
};

export default ChessAnimation;

