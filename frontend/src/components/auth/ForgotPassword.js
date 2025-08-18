import React, { useState } from 'react';
import { resetPassword } from '../../utils/firebaseAuth';

const ForgotPassword = ({ onSwitchToLogin, styles }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setMessage("Link do resetowania hasła został wysłany na email!");
        setEmail("");
      } else {
        setMessage(result.error || "Błąd wysyłania linku resetowania");
      }
    } catch (err) {
      setMessage("Błąd połączenia z Firebase");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <div className="main-panel" style={styles.mainStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 32, color: "#222", fontSize: 32 }}>
          Zapomniałeś hasła?
        </h2>
        
        <div style={{ 
          background: "#e3f2fd", 
          padding: 20, 
          borderRadius: 8, 
          marginBottom: 30,
          border: "1px solid #2196f3"
        }}>
          <p style={{ margin: 0, color: "#1976d2", fontSize: 14, lineHeight: 1.5 }}>
            📧 Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} autoComplete="off" style={{ width: "100%" }}>
          <div>
            <label style={{ fontWeight: "bold", marginBottom: 6, display: "block", fontSize: 16 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="Twój adres email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.inputStyle}
              required
            />
          </div>
          
          <button type="submit" className="auth-btn" style={styles.buttonStyle} disabled={loading}>
            {loading ? "Wysyłanie..." : "Wyślij link resetowania"}
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

export default ForgotPassword; 