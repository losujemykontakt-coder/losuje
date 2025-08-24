import React from 'react';

const NumberPicker = ({ user, userStatus, hasPremiumAccess }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>🎯 Wybór Liczb</h2>
      <p>Wybierz swoje ulubione liczby!</p>
      <div style={{ 
        background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)", 
        padding: "20px", 
        borderRadius: 16, 
        marginBottom: "24px", 
        border: "2px solid #4caf50" 
      }}>
        <h3 style={{ color: "#2e7d32", marginBottom: "12px", textAlign: "center" }}>
          🎯 Wybierz swoje liczby!
        </h3>
        <p style={{ lineHeight: 1.6, marginBottom: "12px" }}>
          <strong>Jak to działa:</strong> Wybierz swoje ulubione liczby i generuj zestawy.
        </p>
      </div>
      <p>Funkcja w trakcie implementacji...</p>
    </div>
  );
};

export default NumberPicker;
