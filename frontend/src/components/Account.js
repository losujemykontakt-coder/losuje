import React from 'react';

const Account = ({ user, userStatus, hasPremiumAccess }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>👤 Moje Konto</h2>
      <p>Zarządzaj swoim kontem!</p>
      <div style={{ 
        background: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)", 
        padding: "20px", 
        borderRadius: 16, 
        marginBottom: "24px", 
        border: "2px solid #009688" 
      }}>
        <h3 style={{ color: "#00695c", marginBottom: "12px", textAlign: "center" }}>
          👤 Moje Konto
        </h3>
        <p style={{ lineHeight: 1.6, marginBottom: "12px" }}>
          <strong>Email:</strong> {user?.email}
        </p>
        <p style={{ lineHeight: 1.6, marginBottom: "12px" }}>
          <strong>Status:</strong> {hasPremiumAccess ? 'Premium' : 'Darmowy'}
        </p>
      </div>
      <p>Funkcja w trakcie implementacji...</p>
    </div>
  );
};

export default Account;
