import React, { useState } from 'react';
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

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <div className="main-panel" style={styles.mainStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 32, color: "#222", fontSize: 32 }}>
          Rejestracja
        </h2>
        
        {/* Przycisk Google */}
        <button 
          onClick={handleGoogleRegister}
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
              Zarejestruj się z Google
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
            <label style={{ fontWeight: "bold", marginBottom: 6, display: "block", fontSize: 16 }}>Imię</label>
            <input
              type="text"
              placeholder="Twoje imię"
              value={name}
              onChange={e => setName(e.target.value)}
              style={styles.inputStyle}
              required
              minLength={2}
              maxLength={30}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 15 }}>
              <input
                type="checkbox"
                checked={acceptRules}
                onChange={e => setAcceptRules(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Akceptuję <Link to="/?page=regulamin" style={{ color: "#1976d2", textDecoration: "underline" }}>regulamin serwisu</Link>
            </label>
          </div>
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
            {loading ? "Przetwarzanie..." : "Zarejestruj się"}
          </button>
        </form>
        <button
          onClick={onSwitchToLogin}
          style={{ ...styles.buttonStyle, background: "none", color: "#1976d2", border: "1px solid #1976d2", marginTop: 18, fontWeight: "normal" }}
        >
          Masz już konto? Zaloguj się
        </button>
        {message && <div style={{ marginTop: 22, color: message.includes("Błąd") ? "#d32f2f" : "#388e3c", textAlign: "center", fontSize: 17 }}>{message}</div>}
      </div>
    </div>
  );
};

export default Register; 