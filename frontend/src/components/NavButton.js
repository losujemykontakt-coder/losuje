import React from 'react';
import { motion } from 'framer-motion';

const NavButton = ({ 
  label, 
  color = "#007bff", 
  onClick, 
  isActive = false, 
  hasSparkles = false,
  className = "",
  style = {},
  isMenuButton = false,
  isAuthButton = false
}) => {
  // Style dla przycisków menu (białe z czarnym napisem)
  const menuButtonStyle = {
    backgroundColor: isActive ? '#ff9800' : '#ffffff',
    background: isActive ? `linear-gradient(135deg, #ff9800 0%, #ffb300 100%)` : 
               `linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)`,
    color: isActive ? "#fff" : "#333",
    border: `2px solid ${isActive ? '#ff9800' : '#333'}`,
    borderRadius: "12px",
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "600",
    width: "100%",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    zIndex: 10,
    boxShadow: isActive ? "0 4px 16px rgba(255, 152, 0, 0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
    ...style
  };

  // Style dla przycisków autoryzacji (kolorowe)
  const authButtonStyle = {
    backgroundColor: isActive ? color : color,
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    color: "#fff",
    border: `2px solid ${color}`,
    borderRadius: "12px",
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "600",
    width: "100%",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    zIndex: 10,
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    ...style
  };

  // Style dla przycisków hero (duże kolorowe)
  const heroButtonStyle = {
    backgroundColor: color,
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    color: "#fff",
    border: `2px solid ${color}`,
    borderRadius: "12px",
    padding: "16px 32px",
    fontSize: "16px",
    fontWeight: "600",
    width: "auto",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    zIndex: 10,
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    ...style
  };

  // Wybierz odpowiedni styl
  let buttonStyle;
  if (isMenuButton) {
    buttonStyle = menuButtonStyle;
  } else if (isAuthButton) {
    buttonStyle = authButtonStyle;
  } else {
    buttonStyle = heroButtonStyle;
  }

  return (
    <div className={`button-container relative ${className}`} style={{ overflow: 'visible' }}>
      {/* Animacja iskier */}
      {hasSparkles && (
        <div className="sparkle-animation absolute pointer-events-none" 
             style={{ top: '-20px', left: '-20px', right: '-20px', bottom: '-20px' }}>
          {/* Pierwsza warstwa iskier - większe */}
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={`large-${i}`}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-red-400 to-red-600 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                x: [0, Math.cos(i * 22.5 * Math.PI / 180) * 100],
                y: [0, Math.sin(i * 22.5 * Math.PI / 180) * 100],
                opacity: [0, 1, 0],
                scale: [0, 2, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
          {/* Druga warstwa iskier - średnie */}
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={`medium-${i}`}
              className="absolute w-1 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                x: [0, Math.cos(i * 15 * Math.PI / 180) * 120],
                y: [0, Math.sin(i * 15 * Math.PI / 180) * 120],
                opacity: [0, 0.8, 0],
                scale: [0, 1.8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut"
              }}
            />
          ))}
          {/* Trzecia warstwa iskier - małe */}
          {[...Array(32)].map((_, i) => (
            <motion.div
              key={`small-${i}`}
              className="absolute w-0.5 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                x: [0, Math.cos(i * 11.25 * Math.PI / 180) * 140],
                y: [0, Math.sin(i * 11.25 * Math.PI / 180) * 140],
                opacity: [0, 0.6, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
      
      <button
        style={buttonStyle}
        onClick={onClick}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = buttonStyle.boxShadow;
        }}
      >
        {label}
      </button>
    </div>
  );
};

export default NavButton;
