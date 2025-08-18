import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import { authStyles } from '../../utils/styles';

const AuthContainer = ({ onLogin, initialView = 'login' }) => {
  const [currentView, setCurrentView] = useState(initialView); // 'login', 'register', 'forgot', 'reset'

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToForgot = () => {
    setCurrentView('forgot');
  };

  const handleLogin = (token, user) => {
    onLogin(token, user);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgot={handleSwitchToForgot}
            styles={authStyles}
          />
        );
      case 'register':
        return (
          <Register 
            onSwitchToLogin={handleSwitchToLogin}
            styles={authStyles}
          />
        );
      case 'forgot':
        return (
          <ForgotPassword 
            onSwitchToLogin={handleSwitchToLogin}
            styles={authStyles}
          />
        );
      case 'reset':
        return (
          <ResetPassword 
            onSwitchToLogin={handleSwitchToLogin}
            styles={authStyles}
          />
        );
      default:
        return (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgot={handleSwitchToForgot}
            styles={authStyles}
          />
        );
    }
  };

  return (
    <>
      {renderCurrentView()}
    </>
  );
};

export default AuthContainer; 