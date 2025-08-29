import React, { useState, useEffect } from 'react';
import { registerUser, loginWithGoogle } from '../../utils/firebaseAuth';
import { Link } from 'react-router-dom';

const Register = ({ onSwitchToLogin, styles }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);
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
    
    if (!acceptRules) {
      setMessage("Musisz zaakceptować regulamin serwisu.");
      setLoading(false);
      return;
    }
    
    try {
      const result = await registerUser(email, password, name);
      
      if (result.success) {
        setMessage("Rejestracja udana! Możesz się zalogować.");
        setName("");
        setAcceptRules(false);
        onSwitchToLogin();
      } else {
        setMessage(result.error || "Błąd rejestracji");
      }
    } catch (err) {
      setMessage("Błąd połączenia z Firebase");
    }
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    setMessage("");
    setGoogleLoading(true);
    
    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        setMessage("Rejestracja przez Google udana! Możesz się zalogować.");
        onSwitchToLogin();
      } else {
        setMessage(result.error || "Błąd rejestracji przez Google");
      }
    } catch (err) {
      console.error('Błąd w handleGoogleRegister:', err);
      setMessage("Błąd rejestracji przez Google");
    }
    setGoogleLoading(false);
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
    padding: "10px"
  };

  const cardStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "400px",
    width: "100%",
    position: "relative",
    overflow: "hidden"
  };

  const logoStyle = {
    textAlign: "center",
    marginBottom: windowWidth <= 400 ? "12px" : isSmallMobile ? "16px" : isMobile ? "20px" : "24px"
  };

  const titleStyle = {
    fontSize: windowWidth <= 400 ? "18px" : isSmallMobile ? "20px" : isMobile ? "24px" : "28px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 6px 0",
    textAlign: "center"
  };

  const subtitleStyle = {
    color: "#666",
    fontSize: isSmallMobile ? "12px" : "14px",
    margin: "0",
    textAlign: "center",
    fontWeight: "600"
  };

  const googleButtonStyle = {
    width: windowWidth <= 400 ? "85%" : isSmallMobile ? "80%" : "70%",
    padding: windowWidth <= 400 ? "14px 16px" : isSmallMobile ? "14px 18px" : "16px 20px",
    background: "#4285f4",
    color: "white",
    border: "none",
    borderRadius: windowWidth <= 400 ? "6px" : isMobile ? "8px" : "12px",
    fontWeight: "600",
    fontSize: windowWidth <= 400 ? "16px" : isSmallMobile ? "17px" : "19px",
    cursor: "pointer",
    marginBottom: windowWidth <= 400 ? "12px" : isSmallMobile ? "15px" : "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: windowWidth <= 400 ? "8px" : "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(66, 133, 244, 0.3)",
    minHeight: windowWidth <= 400 ? "44px" : isSmallMobile ? "50px" : "60px",
    margin: "0 auto 12px auto"
  };

  const separatorStyle = {
    display: "flex",
    alignItems: "center",
    margin: isSmallMobile ? "15px 0" : "20px 0",
    color: "#666"
  };

  const lineStyle = {
    flex: 1,
    height: "1px",
    background: "#ddd"
  };

  const separatorTextStyle = {
    margin: "0 15px",
    fontSize: isSmallMobile ? "12px" : "14px"
  };

  const inputStyle = {
    width: "100%",
    marginBottom: windowWidth <= 400 ? "10px" : isSmallMobile ? "12px" : isMobile ? "14px" : "16px",
    padding: windowWidth <= 400 ? "14px 16px" : isSmallMobile ? "14px 16px" : "16px 18px",
    border: "2px solid #e0e0e0",
    borderRadius: windowWidth <= 400 ? "6px" : isMobile ? "8px" : "12px",
    fontSize: windowWidth <= 400 ? "14px" : isSmallMobile ? "15px" : "17px",
    boxSizing: "border-box",
    transition: "border-color 0.3s ease",
    outline: "none",
    minHeight: windowWidth <= 400 ? "44px" : isSmallMobile ? "50px" : "60px",
    maxWidth: "100%"
  };

  const labelStyle = {
    fontWeight: "600",
    marginBottom: isSmallMobile ? "3px" : "5px",
    display: "block",
    fontSize: isSmallMobile ? "13px" : "15px",
    color: "#333"
  };

  const submitButtonStyle = {
    width: windowWidth <= 400 ? "85%" : isSmallMobile ? "80%" : "70%",
    padding: windowWidth <= 400 ? "14px 16px" : isSmallMobile ? "14px 18px" : "16px 20px",
    background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
    color: "#222",
    border: "none",
    borderRadius: windowWidth <= 400 ? "6px" : isMobile ? "8px" : "12px",
    fontWeight: "bold",
    fontSize: windowWidth <= 400 ? "16px" : isSmallMobile ? "17px" : "19px",
    cursor: "pointer",
    marginTop: windowWidth <= 400 ? "6px" : isSmallMobile ? "8px" : "12px",
    boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
    transition: "all 0.3s ease",
    minHeight: windowWidth <= 400 ? "44px" : isSmallMobile ? "50px" : "60px",
    margin: "6px auto 0 auto"
  };

  const linkButtonStyle = {
    ...submitButtonStyle,
    background: "none",
    color: "#1976d2",
    border: "2px solid #1976d2",
    marginTop: windowWidth <= 400 ? "8px" : isSmallMobile ? "12px" : "18px",
    fontWeight: "normal",
    minHeight: windowWidth <= 400 ? "44px" : isSmallMobile ? "50px" : "60px",
    margin: "8px auto 0 auto"
  };

  const checkboxStyle = {
    marginRight: "8px",
    transform: "scale(1.2)"
  };

  const checkboxLabelStyle = {
    fontSize: isSmallMobile ? "11px" : "14px",
    display: "flex",
    alignItems: "center",
    marginBottom: isSmallMobile ? "12px" : "18px"
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
    <div className="register-container" style={containerStyle}>
      <div className="main-panel" style={cardStyle}>
        <div style={logoStyle}>
          <h1 style={titleStyle}>
            Rejestracja
          </h1>
        </div>
        
        {/* Przycisk Google */}
        <button 
          className="google-button"
          onClick={handleGoogleRegister}
          disabled={googleLoading}
          style={{
            ...googleButtonStyle,
            opacity: googleLoading ? 0.7 : 1,
            transform: googleLoading ? "scale(0.98)" : "scale(1)",
            position: "relative"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.02)";
            e.target.style.boxShadow = "0 6px 16px rgba(66, 133, 244, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 12px rgba(66, 133, 244, 0.3)";
          }}
        >
          {googleLoading ? (
            "Przetwarzanie..."
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ flexShrink: 0, position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)" }}>
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span style={{ textAlign: "center", width: "100%" }}>Zarejestruj się z Google</span>
            </>
          )}
        </button>

        {/* Separator */}
        <div style={separatorStyle}>
          <div style={lineStyle}></div>
          <span style={separatorTextStyle}>lub</span>
          <div style={lineStyle}></div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" style={{ width: "100%" }}>
          <div>
            <label style={labelStyle}>Imię</label>
            <input
              type="text"
              placeholder="Wprowadź swoje imię"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: name ? "#1976d2" : "#e0e0e0"
              }}
              required
              minLength={2}
              maxLength={30}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="Wprowadź swój email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: email ? "#1976d2" : "#e0e0e0"
              }}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Hasło</label>
            <input
              type="password"
              placeholder="Wprowadź swoje hasło"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: password ? "#1976d2" : "#e0e0e0"
              }}
              required
              minLength={6}
            />
          </div>
          
          <div style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={acceptRules}
              onChange={e => setAcceptRules(e.target.checked)}
              style={checkboxStyle}
            />
            Akceptuję <Link to="/?page=regulamin" style={{ color: "#1976d2", textDecoration: "underline" }}>regulamin serwisu</Link>
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
            {loading ? "Przetwarzanie..." : "Zarejestruj się"}
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
          Masz już konto? Zaloguj się
        </button>
        
        {message && <div style={messageStyle}>{message}</div>}
      </div>
      
      <style>{`
        /* Responsywność skopiowana z losujemy.web.app */
        .register-container {
          min-height: 100vh;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          width: 100vw;
        }
        
        .main-panel {
          background: white;
          border-radius: 0;
          padding: 20px;
          max-width: 100vw;
          width: 100vw;
          box-sizing: border-box;
          margin: 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 50px;
        }
        
        .google-button,
        button[type="submit"] {
          width: 100% !important;
          padding: 16px 24px !important;
          font-size: 18px !important;
          margin-bottom: 12px !important;
          border-radius: 10px !important;
          min-height: 50px !important;
          display: block !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
        }
        
        input[type="text"],
        input[type="email"],
        input[type="password"] {
          width: 100% !important;
          padding: 16px 20px !important;
          font-size: 18px !important;
          margin-bottom: 12px !important;
          border: 2px solid #e0e0e0 !important;
          border-radius: 10px !important;
          box-sizing: border-box !important;
          min-height: 50px !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        
        label {
          display: block !important;
          margin-bottom: 6px !important;
          font-weight: bold !important;
          font-size: 16px !important;
        }
        
        h1 {
          font-size: 32px !important;
          margin-bottom: 20px !important;
          text-align: center !important;
          font-weight: bold !important;
        }
        
        /* Responsywność dla małych ekranów - skopiowana z losujemy.web.app */
        @media (max-width: 768px) {
          .main-panel { 
            max-width: 100vw !important; 
            width: 100vw !important;
            padding: 10px !important; 
            margin: 0 !important; 
            padding-top: 30px !important; 
            touch-action: manipulation;
            border-radius: 0 !important;
          }
          
          /* Lepsze wsparcie dla touch */
          button, input, select, textarea {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          
          .google-button,
          button[type="submit"] {
            width: 100% !important;
            padding: 12px !important;
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }
          
          input[type="text"],
          input[type="email"],
          input[type="password"] {
            width: 100% !important;
            margin-bottom: 8px !important;
            padding: 10px !important;
            font-size: 18px !important;
          }
          
          label {
            display: block !important;
            margin-bottom: 4px !important;
            font-weight: bold !important;
            font-size: 14px !important;
          }
          
          h1 {
            font-size: 18px !important;
            margin-bottom: 12px !important;
            text-align: center !important;
          }
        }
        
        @media (max-width: 480px) {
          .main-panel {
            padding-top: 20px !important;
            max-width: 100vw !important;
            width: 100vw !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          
          .google-button,
          button[type="submit"] {
            padding: 10px !important;
            font-size: 16px !important;
          }
          
          input[type="text"],
          input[type="email"],
          input[type="password"] {
            padding: 8px !important;
            font-size: 16px !important;
          }
          
          label {
            font-size: 12px !important;
          }
          
          h1 {
            font-size: 24px !important;
            margin-bottom: 15px !important;
            margin-top: 5px !important;
            text-align: center !important;
          }
          
          /* Przezroczyste menu hamburger dla małych ekranów */
          .mobile-menu-toggle {
            background: rgba(255, 255, 255, 0.85) !important;
            backdrop-filter: blur(3px) !important;
            -webkit-backdrop-filter: blur(3px) !important;
            border: 1px solid rgba(255, 215, 0, 0.2) !important;
          }
        }
        
        @media (max-width: 360px) {
          .main-panel {
            max-width: 100vw !important;
            width: 100vw !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .google-button,
          button[type="submit"] {
            padding: 8px !important;
            font-size: 14px !important;
          }
          
          input[type="text"],
          input[type="email"],
          input[type="password"] {
            padding: 6px !important;
            font-size: 12px !important;
          }
          
          label {
            font-size: 11px !important;
          }
          
          h1 {
            font-size: 20px !important;
          }
        }
        
        @media (max-width: 320px) {
          .main-panel {
            max-width: 100vw !important;
            width: 100vw !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .google-button,
          button[type="submit"] {
            padding: 6px !important;
            font-size: 10px !important;
            margin-bottom: 4px !important;
          }
          
          input[type="text"],
          input[type="email"],
          input[type="password"] {
            padding: 4px !important;
            font-size: 10px !important;
            margin-bottom: 4px !important;
          }
          
          label {
            font-size: 10px !important;
            margin-bottom: 2px !important;
          }
          
          h1 {
            font-size: 12px !important;
            margin-bottom: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Register; 