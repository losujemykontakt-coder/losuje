import React from 'react';

const SystemsGenerator = ({ user, userStatus, hasPremiumAccess }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>📊 Systemy Skrócone</h2>
      <p>Generuj systemy skrócone dla różnych gier!</p>
      <div style={{ 
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)", 
        padding: "20px", 
        borderRadius: 16, 
        marginBottom: "24px", 
        border: "2px solid #2196f3" 
      }}>
        <h3 style={{ color: "#1565c0", marginBottom: "12px", textAlign: "center" }}>
          📊 Systemy skrócone
        </h3>
        <p style={{ lineHeight: 1.6, marginBottom: "12px" }}>
          <strong>Jak to działa:</strong> Systemy skrócone pozwalają grać większą liczbą liczb przy mniejszej liczbie zakładów.
        </p>
      </div>
      <p>Funkcja w trakcie implementacji...</p>
    </div>
  );
};

export default SystemsGenerator;
