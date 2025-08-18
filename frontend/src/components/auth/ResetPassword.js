import React, { useState, useEffect } from 'react';
import { confirmPasswordResetWithCode } from '../../utils/firebaseAuth';

const ResetPassword = ({ onSwitchToLogin, styles }) => {
  const [searchParams] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams;
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [oobCode, setOobCode] = useState("");

  useEffect(() => {
    const oobCodeFromUrl = searchParams.get('oobCode');
    if (oobCodeFromUrl) {
      setOobCode(oobCodeFromUrl);
    } else {
      setMessage("Nieprawidłowy link resetowania hasła");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (newPassword !== confirmPassword) {
      setMessage("Hasła nie są identyczne");
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage("Hasło musi mieć minimum 6 znaków");
      return;
    }
    
    if (!oobCode) {
      setMessage("Nieprawidłowy link resetowania hasła");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await confirmPasswordResetWithCode(oobCode, newPassword);
      
      if (result.success) {
        setMessage("Hasło zostało zmienione! Możesz się teraz zalogować.");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          onSwitchToLogin();
        }, 3000);
      } else {
        setMessage(result.error || "Błąd resetowania hasła");
      }
    } catch (err) {
      setMessage("Błąd połączenia z Firebase");
    }
    setLoading(false);
  };

  if (!oobCode) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff" }}>
        <div className="main-panel" style={styles.mainStyle}>
          <h2 style={{ textAlign: "center", marginBottom: 32, color: "#222", fontSize: 32 }}>
            Błąd linku
          </h2>
          <div style={{ 
            color: "#d32f2f", 
            textAlign: "center", 
            fontSize: 17,
            padding: 15,
            borderRadius: 8,
            background: "#ffebee"
          }}>
            Nieprawidłowy link resetowania hasła.
          </div>
          <button
            onClick={onSwitchToLogin}
            style={{ 
              ...styles.buttonStyle, 
              background: "none", 
              color: "#1976d2", 
              border: "1px solid #1976d2", 
              marginTop: 18, 
              fontWeight: "normal" 
            }}
          >
            Powrót do logowania
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <div className="main-panel" style={styles.mainStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 32, color: "#222", fontSize: 32 }}>
          Ustaw nowe hasło
        </h2>
        
        <div style={{ 
          background: "#e8f5e8", 
          padding: 20, 
          borderRadius: 8, 
          marginBottom: 30,
          border: "1px solid #4caf50"
        }}>
          <p style={{ margin: 0, color: "#2e7d32", fontSize: 14, lineHeight: 1.5 }}>
            ✅ Link jest prawidłowy. Ustaw nowe hasło dla swojego konta.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} autoComplete="off" style={{ width: "100%" }}>
          <div>
            <label style={{ fontWeight: "bold", marginBottom: 6, display: "block", fontSize: 16 }}>
              Nowe hasło
            </label>
            <input
              type="password"
              placeholder="Nowe hasło (minimum 6 znaków)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={styles.inputStyle}
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: "bold", marginBottom: 6, display: "block", fontSize: 16 }}>
              Potwierdź hasło
            </label>
            <input
              type="password"
              placeholder="Potwierdź nowe hasło"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={styles.inputStyle}
              required
              minLength={6}
            />
          </div>
          
          <button type="submit" className="auth-btn" style={styles.buttonStyle} disabled={loading}>
            {loading ? "Zmienianie hasła..." : "Zmień hasło"}
          </button>
        </form>
        
        <button
          onClick={onSwitchToLogin}
          style={{ 
            ...styles.buttonStyle, 
            background: "none", 
            color: "#1976d2", 
            border: "1px solid #1976d2", 
            marginTop: 18, 
            fontWeight: "normal" 
          }}
        >
          Powrót do logowania
        </button>
        
        {message && (
          <div style={{ 
            marginTop: 22, 
            color: message.includes("Błąd") ? "#d32f2f" : "#388e3c", 
            textAlign: "center", 
            fontSize: 17,
            padding: 15,
            borderRadius: 8,
            background: message.includes("Błąd") ? "#ffebee" : "#e8f5e8"
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 