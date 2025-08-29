import React, { useState, useEffect } from 'react';
import { loginUser, loginWithGoogle } from '../../utils/firebaseAuth';

const Login = ({ onLogin, onSwitchToRegister, onSwitchToForgot, styles }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 Login handleSubmit wywołany:', { email, password: '***' });
    setMessage("");
    setLoading(true);
    
    try {
      console.log('🔄 Wywołuję loginUser...');
      const result = await loginUser(email, password);
      console.log('🔄 loginUser result:', result);
      
      if (result.success) {
        console.log('✅ Logowanie udane, wywołuję onLogin');
        onLogin(result.user.uid, result.user);
        setMessage("");
      } else {
        console.error('❌ Logowanie nieudane:', result.error);
        setMessage(result.error || "Błąd logowania");
      }
    } catch (err) {
      console.error('❌ Błąd w handleSubmit:', err);
      setMessage("Błąd połączenia z Firebase. Sprawdź internet i spróbuj ponownie.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    console.log('🔄 Google Login handleGoogleLogin wywołany');
    setMessage("");
    setGoogleLoading(true);
    
    try {
      console.log('🔄 Wywołuję loginWithGoogle...');
      const result = await loginWithGoogle();
      console.log('🔄 loginWithGoogle result:', result);
      
      if (result.success) {
        console.log('✅ Google logowanie udane, wywołuję onLogin');
        onLogin(result.user.uid, result.user);
        setMessage("");
      } else {
        console.error('❌ Google logowanie nieudane:', result.error);
        setMessage(result.error || "Błąd logowania przez Google");
      }
    } catch (err) {
      console.error('❌ Błąd w handleGoogleLogin:', err);
      setMessage("Błąd logowania przez Google. Sprawdź internet i spróbuj ponownie.");
    }
    setGoogleLoading(false);
  };

  // Komponent animowanej złotej kuli
  const AnimatedGoldenBall = () => {
    const [bounce, setBounce] = useState(0);
    const [number, setNumber] = useState(8);

    useEffect(() => {
      // Animacja skakania - wolniejsza i płynniejsza
      const bounceInterval = setInterval(() => {
        setBounce(prev => prev + 1);
      }, 3000); // 3 sekundy zamiast 2

      // Zmiana liczby co 2 sekundy
      const numberInterval = setInterval(() => {
        setNumber(Math.floor(Math.random() * 49) + 1);
      }, 2000);

      return () => {
        clearInterval(bounceInterval);
        clearInterval(numberInterval);
      };
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
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #fffde7 0%, #ffd700 50%, #ffb300 100%)',
          boxShadow: `
            inset 0 2px 4px rgba(255, 255, 255, 0.8),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2)
          `,
          transform: `translateY(${Math.sin(bounce * 0.3) * 8}px)`, // Wolniejsza animacja
          transition: 'transform 0.5s ease-in-out', // Płynniejsza animacja
          position: 'relative',
          animation: 'float 4s ease-in-out infinite', // Wolniejsza animacja
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
          
          {/* Napis z losową liczbą */}
          <span style={{
            color: '#000',
            fontSize: '14px',
            fontWeight: 'bold',
            position: 'relative',
            zIndex: 2,
            transition: 'opacity 0.3s ease'
          }}>
            {number}
          </span>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-8px) rotate(1deg); }
            50% { transform: translateY(-4px) rotate(0deg); }
            75% { transform: translateY(-12px) rotate(-1deg); }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="login-container" style={{ 
      minHeight: "100vh", 
      background: "white",
      padding: "10px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="main-panel" style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        margin: "0 auto",
        maxWidth: "400px",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <div className="header-section" style={{ 
          textAlign: "center", 
          marginBottom: "20px"
        }}>
          <AnimatedGoldenBall />
          <h1 className="login-title" style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
            margin: "0 0 20px 0",
            textAlign: "center"
          }}>
            Logowanie
          </h1>
        </div>
        
        {/* Przycisk Google */}
        <button 
          className="google-button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{
            width: "80%",
            background: "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "16px 20px",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(66, 133, 244, 0.3)",
            minHeight: "50px",
            margin: "0 auto 15px auto",
            position: "relative"
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
              <span style={{ textAlign: "center", width: "100%" }}>Zaloguj się z Google</span>
            </>
          )}
        </button>

        {/* Separator */}
        <div className="separator" style={{ 
          display: "flex", 
          alignItems: "center", 
          margin: "20px 0",
          color: "#666"
        }}>
          <div style={{ flex: 1, height: "1px", background: "#ddd" }}></div>
          <span style={{ 
            margin: "0 15px", 
            fontSize: "14px" 
          }}>lub</span>
          <div style={{ flex: 1, height: "1px", background: "#ddd" }}></div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="login-form" style={{ width: "100%" }}>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label className="form-label" style={{ 
              fontWeight: "600", 
              marginBottom: "4px", 
              display: "block", 
              fontSize: "14px",
              color: "#333"
            }}>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="form-input"
              style={{
                width: "100%",
                padding: "16px 18px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
                transition: "border-color 0.3s ease",
                outline: "none",
                minHeight: "50px"
              }}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label className="form-label" style={{ 
              fontWeight: "600", 
              marginBottom: "4px", 
              display: "block", 
              fontSize: "14px",
              color: "#333"
            }}>Hasło</label>
            <input
              type="password"
              placeholder="Hasło"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input"
              style={{
                width: "100%",
                padding: "16px 18px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
                transition: "border-color 0.3s ease",
                outline: "none",
                minHeight: "50px"
              }}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="auth-btn login-button" style={{
            width: "80%",
            background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
            color: "#222",
            border: "none",
            borderRadius: "8px",
            padding: "16px 20px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "12px",
            boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
            transition: "all 0.3s ease",
            minHeight: "50px",
            margin: "12px auto 0 auto"
          }} disabled={loading}>
            {loading ? "Przetwarzanie..." : "Zaloguj się"}
          </button>
        </form>
        <div className="footer-section" style={{ 
          marginTop: "15px", 
          textAlign: "center" 
        }}>
          <button
            className="register-button"
            onClick={onSwitchToRegister}
            style={{ 
              width: "80%",
              background: "none", 
              color: "#1976d2", 
              border: "2px solid #1976d2", 
              borderRadius: "8px",
              marginBottom: "8px", 
              fontWeight: "normal",
              fontSize: "18px",
              padding: "14px 18px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              minHeight: "50px",
              margin: "0 auto 8px auto"
            }}
          >
            Nie masz konta? Zarejestruj się
          </button>
          
          <div style={{ marginTop: "10px" }}>
            <button
              className="forgot-password-link"
              onClick={onSwitchToForgot}
              style={{ 
                background: "none", 
                color: "#666", 
                border: "none", 
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Zapomniałeś hasła?
            </button>
          </div>
        </div>
        {message && <div className="message" style={{ 
          marginTop: "15px", 
          color: message.includes("Błąd") ? "#d32f2f" : "#388e3c", 
          textAlign: "center", 
          fontSize: "14px" 
        }}>{message}</div>}
      </div>
      
      <style>{`
        /* Responsywność skopiowana z losujemy.web.app */
        .login-container {
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
        .login-button,
        .register-button {
          width: 100% !important;
          padding: 16px 24px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          margin-bottom: 12px !important;
          border-radius: 10px !important;
          min-height: 50px !important;
          display: block !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
        }
        
        .form-input {
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
        
        .form-label {
          display: block !important;
          margin-bottom: 6px !important;
          font-weight: bold !important;
          font-size: 16px !important;
        }
        
        .login-title {
          font-size: 32px !important;
          margin-bottom: 20px !important;
          text-align: center !important;
          font-weight: bold !important;
        }
        
        .separator {
          margin: 20px 0 !important;
        }
        
        .separator span {
          font-size: 14px !important;
        }
        
        .footer-section {
          margin-top: 12px !important;
        }
        
        .forgot-password-link {
          font-size: 14px !important;
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
          .login-button,
          .register-button {
            width: 100% !important;
            padding: 12px !important;
            font-size: 18px !important;
            margin-bottom: 8px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
          }
          
          .google-button {
            gap: 12px !important;
            font-size: 18px !important;
          }
          
          .google-button svg {
            width: 24px !important;
            height: 24px !important;
            position: absolute !important;
            left: 20px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
          }
          
          .google-button span {
            text-align: center !important;
            width: 100% !important;
          }
          
          .form-input {
            width: 100% !important;
            margin-bottom: 8px !important;
            padding: 10px !important;
            font-size: 18px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
          }
          
          .form-label {
            display: block !important;
            margin-bottom: 4px !important;
            font-weight: bold !important;
            font-size: 14px !important;
          }
          
          .login-title {
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
          .login-button,
          .register-button {
            width: 100% !important;
            padding: 10px !important;
            font-size: 16px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
          }
          
          .google-button {
            gap: 10px !important;
            font-size: 16px !important;
          }
          
          .google-button svg {
            width: 22px !important;
            height: 22px !important;
            position: absolute !important;
            left: 16px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
          }
          
          .google-button span {
            text-align: center !important;
            width: 100% !important;
          }
          
          .form-input {
            width: 100% !important;
            padding: 8px !important;
            font-size: 16px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
          }
          
          .form-label {
            font-size: 12px !important;
          }
          
          .login-title {
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
          .login-button,
          .register-button {
            width: 100% !important;
            padding: 8px !important;
            font-size: 14px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
          }
          
          .google-button {
            gap: 8px !important;
            font-size: 14px !important;
          }
          
          .google-button svg {
            width: 20px !important;
            height: 20px !important;
            position: absolute !important;
            left: 14px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
          }
          
          .google-button span {
            text-align: center !important;
            width: 100% !important;
          }
          
          .form-input {
            width: 100% !important;
            padding: 6px !important;
            font-size: 14px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
          }
          
          .form-label {
            font-size: 11px !important;
          }
          
          .login-title {
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
          .login-button,
          .register-button {
            width: 100% !important;
            padding: 6px !important;
            font-size: 12px !important;
            margin-bottom: 4px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
          }
          
          .google-button {
            gap: 6px !important;
            font-size: 12px !important;
          }
          
          .google-button svg {
            width: 18px !important;
            height: 18px !important;
            position: absolute !important;
            left: 12px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
          }
          
          .google-button span {
            text-align: center !important;
            width: 100% !important;
          }
          
          .form-input {
            width: 100% !important;
            padding: 4px !important;
            font-size: 12px !important;
            margin-bottom: 4px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
          }
          
          .form-label {
            font-size: 10px !important;
            margin-bottom: 2px !important;
          }
          
          .login-title {
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login; 