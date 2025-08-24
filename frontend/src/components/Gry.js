import React from 'react';

const Gry = ({ user, userStatus, hasPremiumAccess }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>🎰 Gry</h2>
      <p>Różne gry i generatory!</p>
      <div style={{ 
        background: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)", 
        padding: "20px", 
        borderRadius: 16, 
        marginBottom: "24px", 
        border: "2px solid #ffc107" 
      }}>
        <h3 style={{ color: "#f57f17", marginBottom: "12px", textAlign: "center" }}>
          🎰 Gry i generatory
        </h3>
        <p style={{ lineHeight: 1.6, marginBottom: "12px" }}>
          <strong>Jak to działa:</strong> Wybierz różne gry i generatory liczb.
        </p>
      </div>
      <p>Funkcja w trakcie implementacji...</p>
    </div>
  );
};

export default Gry;
