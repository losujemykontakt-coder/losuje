import React, { useState, useEffect } from 'react';
import { resetPassword } from '../../utils/firebaseAuth';



const ForgotPassword = ({ onSwitchToLogin, styles }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Responsywne style
  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;

  const containerStyle = {
    minHeight: "100vh",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    margin: "0",
    width: "100vw"
  };

  const cardStyle = {
    background: "white",
    borderRadius: "0",
    padding: "30px",
    maxWidth: "100vw",
    width: "100vw",
    boxSizing: "border-box",
    margin: "0",

    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  };

  const logoStyle = {
    textAlign: "center",
    marginBottom: isMobile ? "24px" : "30px"
  };

  const titleStyle = {
    fontSize: isSmallMobile ? "20px" : isMobile ? "24px" : "28px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 8px 0",
    textAlign: "center"
  };

  const subtitleStyle = {
    color: "#666",
    fontSize: isSmallMobile ? "12px" : "14px",
    margin: "0",
    textAlign: "center"
  };

  const infoBoxStyle = {
    background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
    padding: isSmallMobile ? "16px" : "20px",
    borderRadius: isMobile ? "8px" : "12px",
    marginBottom: "30px",
    border: "2px solid #2196f3",
    boxShadow: "0 4px 12px rgba(33, 150, 243, 0.2)"
  };

  const infoTextStyle = {
    margin: 0,
    color: "#1976d2",
    fontSize: isSmallMobile ? "13px" : "14px",
    lineHeight: 1.5,
    textAlign: "center"
  };

  const inputStyle = {
    width: "100%",
    marginBottom: windowWidth <= 400 ? "12px" : isMobile ? "16px" : "20px",
    padding: windowWidth <= 400 ? "14px 16px" : isSmallMobile ? "16px 18px" : "18px 20px",
    border: "2px solid #e0e0e0",
    borderRadius: windowWidth <= 400 ? "6px" : isMobile ? "8px" : "12px",
    fontSize: windowWidth <= 400 ? "14px" : isSmallMobile ? "16px" : "18px",
    boxSizing: "border-box",
    transition: "border-color 0.3s ease",
    outline: "none",
    minHeight: windowWidth <= 400 ? "44px" : isSmallMobile ? "50px" : "60px",
    maxWidth: "100%"
  };

  const labelStyle = {
    fontWeight: "600",
    marginBottom: isSmallMobile ? "4px" : "6px",
    display: "block",
    fontSize: isSmallMobile ? "14px" : "16px",
    color: "#333"
  };

  const submitButtonStyle = {
    width: windowWidth <= 400 ? "85%" : isSmallMobile ? "80%" : "70%",
    padding: windowWidth <= 400 ? "14px 16px" : isSmallMobile ? "16px 20px" : "18px 24px",
    background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
    color: "#222",
    border: "none",
    borderRadius: windowWidth <= 400 ? "6px" : isMobile ? "8px" : "12px",
    fontWeight: "bold",
    fontSize: windowWidth <= 400 ? "14px" : isSmallMobile ? "16px" : "18px",
    cursor: "pointer",
    marginTop: "12px",
    boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
    transition: "all 0.3s ease",
    minHeight: windowWidth <= 400 ? "44px" : isSmallMobile ? "50px" : "60px",
    margin: "12px auto 0 auto"
  };

  const linkButtonStyle = {
    ...submitButtonStyle,
    background: "none",
    color: "#1976d2",
    border: "2px solid #1976d2",
    marginTop: "18px",
    fontWeight: "normal"
  };

  const messageStyle = {
    marginTop: "22px",
    color: message.includes("Błąd") ? "#d32f2f" : "#388e3c",
    textAlign: "center",
    fontSize: isSmallMobile ? "14px" : "17px",
    padding: "10px",
    borderRadius: "8px",
    background: message.includes("Błąd") ? "#ffebee" : "#e8f5e8"
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>
          <h1 style={titleStyle}>
            Resetowanie hasła
          </h1>
        </div>
        
        <div style={infoBoxStyle}>
          <p style={infoTextStyle}>
            📧 Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} autoComplete="off" style={{ width: "100%" }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="Wprowadź swój adres email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: email ? "#1976d2" : "#e0e0e0"
              }}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              ...submitButtonStyle,
              opacity: loading ? 0.7 : 1,
              transform: loading ? "scale(0.98)" : "scale(1)"
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "scale(1.02)";
                e.target.style.boxShadow = "0 6px 16px rgba(255, 215, 0, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.3)";
              }
            }}
          >
            {loading ? "Wysyłanie..." : "Wyślij link resetowania"}
          </button>
        </form>
        
        <button
          onClick={onSwitchToLogin}
          style={linkButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.background = "#f5f5f5";
            e.target.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "none";
            e.target.style.transform = "scale(1)";
          }}
        >
          Powrót do logowania
        </button>
        
        {message && <div style={messageStyle}>{message}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword; 