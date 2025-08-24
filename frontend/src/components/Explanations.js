import React from 'react';

const Explanations = ({ user, userStatus, hasPremiumAccess }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>📖 Wyjaśnienia</h2>
      <p>Poznaj zasady działania generatorów!</p>
      <div style={{ 
        background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)", 
        padding: "20px", 
        borderRadius: 16, 
        marginBottom: "24px", 
        border: "2px solid #9c27b0" 
      }}>
        <h3 style={{ color: "#7b1fa2", marginBottom: "12px", textAlign: "center" }}>
          📖 Wyjaśnienia metod
        </h3>
        <p style={{ lineHeight: 1.6, marginBottom: "12px" }}>
          <strong>Jak to działa:</strong> Poznaj zasady działania różnych generatorów liczb.
        </p>
      </div>
      <p>Funkcja w trakcie implementacji...</p>
    </div>
  );
};

export default Explanations;
