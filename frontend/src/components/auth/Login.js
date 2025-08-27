import React, { useState } from 'react';
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

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <div className="main-panel" style={styles.mainStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 32, color: "#222", fontSize: 32 }}>
          Logowanie
        </h2>
        
        {/* Przycisk Google */}
        <button 
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{
            ...styles.buttonStyle,
            background: "#4285f4",
            color: "white",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
          }}
        >
          {googleLoading ? (
            "Przetwarzanie..."
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Zaloguj się z Google
            </>
          )}
        </button>

        {/* Separator */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          margin: "20px 0",
          color: "#666"
        }}>
          <div style={{ flex: 1, height: "1px", background: "#ddd" }}></div>
          <span style={{ margin: "0 15px", fontSize: "14px" }}>lub</span>
          <div style={{ flex: 1, height: "1px", background: "#ddd" }}></div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" style={{ width: "100%" }}>
          <div>
            <label style={{ fontWeight: "bold", marginBottom: 6, display: "block", fontSize: 16 }}>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.inputStyle}
              required
            />
          </div>
          <div>
            <label style={{ fontWeight: "bold", marginBottom: 6, display: "block", fontSize: 16 }}>Hasło</label>
            <input
              type="password"
              placeholder="Hasło"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.inputStyle}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="auth-btn" style={styles.buttonStyle} disabled={loading}>
            {loading ? "Przetwarzanie..." : "Zaloguj się"}
          </button>
        </form>
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <button
            onClick={onSwitchToRegister}
            style={{ ...styles.buttonStyle, background: "none", color: "#1976d2", border: "1px solid #1976d2", marginBottom: 10, fontWeight: "normal" }}
          >
            Nie masz konta? Zarejestruj się
          </button>
          
          <div style={{ marginTop: 10 }}>
            <button
              onClick={onSwitchToForgot}
              style={{ 
                background: "none", 
                color: "#666", 
                border: "none", 
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: 14
              }}
            >
              Zapomniałeś hasła?
            </button>
          </div>
        </div>
        {message && <div style={{ marginTop: 22, color: message.includes("Błąd") ? "#d32f2f" : "#388e3c", textAlign: "center", fontSize: 17 }}>{message}</div>}
      </div>
    </div>
  );
};

export default Login; 