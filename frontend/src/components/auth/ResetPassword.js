import React, { useState, useEffect } from 'react';
import { confirmPasswordResetWithCode } from '../../utils/firebaseAuth';

// Komponent animowanej złotej kuli (taki sam jak w Login.js)
const AnimatedGoldenBall = () => {
  const [bounce, setBounce] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounce(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'relative',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #fffde7 0%, #ffd700 50%, #ffb300 100%)',
        boxShadow: `
          0 0 20px rgba(255, 215, 0, 0.6),
          0 8px 32px rgba(255, 215, 0, 0.4),
          inset 0 2px 4px rgba(255, 255, 255, 0.8),
          inset 0 -2px 4px rgba(0, 0, 0, 0.2)
        `,
        transform: `translateY(${Math.sin(bounce * 0.5) * 10}px)`,
        transition: 'transform 0.3s ease-in-out',
        position: 'relative',
        animation: 'float 3s ease-in-out infinite'
      }}>
        {/* Refleks na kuli */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '25%',
          height: '25%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 70%, transparent 100%)',
          filter: 'blur(1px)'
        }} />
        
        {/* Drugi refleks */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '60%',
          width: '15%',
          height: '15%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
          filter: 'blur(0.5px)'
        }} />
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(2deg); }
          50% { transform: translateY(-5px) rotate(0deg); }
          75% { transform: translateY(-15px) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
};

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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Responsywne style
  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;

  const containerStyle = {
    minHeight: "100vh",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: windowWidth <= 400 ? "5px" : isSmallMobile ? "10px" : "20px"
  };

  const cardStyle = {
    background: "white",
    borderRadius: windowWidth <= 400 ? "12px" : isMobile ? "16px" : "24px",
    padding: windowWidth <= 400 ? "16px" : isSmallMobile ? "24px" : isMobile ? "32px" : "40px",
    maxWidth: windowWidth <= 400 ? "90%" : isSmallMobile ? "100%" : isSmallMobile ? "350px" : "400px",
    width: windowWidth <= 400 ? "90%" : "100%",
    position: "relative",
    overflow: "hidden"
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
    background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
    padding: isSmallMobile ? "16px" : "20px",
    borderRadius: isMobile ? "8px" : "12px",
    marginBottom: "30px",
    border: "2px solid #4caf50",
    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)"
  };

  const infoTextStyle = {
    margin: 0,
    color: "#2e7d32",
    fontSize: isSmallMobile ? "13px" : "14px",
    lineHeight: 1.5,
    textAlign: "center"
  };

  const errorBoxStyle = {
    background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
    padding: isSmallMobile ? "16px" : "20px",
    borderRadius: isMobile ? "8px" : "12px",
    marginBottom: "30px",
    border: "2px solid #f44336",
    boxShadow: "0 4px 12px rgba(244, 67, 54, 0.2)"
  };

  const errorTextStyle = {
    margin: 0,
    color: "#d32f2f",
    fontSize: isSmallMobile ? "13px" : "14px",
    lineHeight: 1.5,
    textAlign: "center"
  };

  const inputStyle = {
    width: "100%",
    marginBottom: isMobile ? "16px" : "20px",
    padding: isSmallMobile ? "16px 18px" : "18px 20px",
    border: "2px solid #e0e0e0",
    borderRadius: isMobile ? "8px" : "12px",
    fontSize: isSmallMobile ? "16px" : "18px",
    boxSizing: "border-box",
    transition: "border-color 0.3s ease",
    outline: "none",
    minHeight: isSmallMobile ? "50px" : "60px",
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
    fontSize: isSmallMobile ? "16px" : "18px",
    cursor: "pointer",
    marginTop: "12px",
    boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
    transition: "all 0.3s ease",
    minHeight: isSmallMobile ? "50px" : "60px",
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

  if (!oobCode) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
                  <div style={logoStyle}>
          <AnimatedGoldenBall />
          <h1 style={titleStyle}>
            Błąd linku resetowania
          </h1>
        </div>
          
          <div style={errorBoxStyle}>
            <p style={errorTextStyle}>
              ❌ Nieprawidłowy link resetowania hasła.
            </p>
          </div>
          
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
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>
          <AnimatedGoldenBall />
          <h1 style={titleStyle}>
            Ustaw nowe hasło
          </h1>
        </div>
        
        <div style={infoBoxStyle}>
          <p style={infoTextStyle}>
            ✅ Link jest prawidłowy. Ustaw nowe hasło dla swojego konta.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} autoComplete="off" style={{ width: "100%" }}>
          <div>
            <label style={labelStyle}>Nowe hasło</label>
            <input
              type="password"
              placeholder="Nowe hasło (minimum 6 znaków)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: newPassword ? "#1976d2" : "#e0e0e0"
              }}
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label style={labelStyle}>Potwierdź hasło</label>
            <input
              type="password"
              placeholder="Potwierdź nowe hasło"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: confirmPassword ? "#1976d2" : "#e0e0e0"
              }}
              required
              minLength={6}
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
            {loading ? "Zmienianie hasła..." : "Zmień hasło"}
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

export default ResetPassword; 