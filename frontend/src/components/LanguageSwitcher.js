import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ variant = 'landing' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'pl', name: t('language.polish'), flag: '🇵🇱' },
    { code: 'en', name: t('language.english'), flag: '🇬🇧' },
    { code: 'de', name: t('language.german'), flag: '🇩🇪' }
  ];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Style dla landing page (białe tło, czarna ramka)
  const landingButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '2px solid #000000',
    background: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000',
    outline: 'none',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  };

  // Style dla menu po zalogowaniu (żółte tło, subtelna ramka)
  const menuButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '1px solid rgba(124, 111, 0, 0.3)',
    background: 'rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '600',
    color: '#7c6f00',
    outline: 'none',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  };

  const buttonStyle = variant === 'menu' ? menuButtonStyle : landingButtonStyle;

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block'
    }}>
      {/* Główny przycisk */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={buttonStyle}
        onMouseOver={(e) => {
          if (variant === 'menu') {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.border = '1px solid rgba(124, 111, 0, 0.5)';
          } else {
            e.target.style.background = '#f8f9fa';
          }
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseOut={(e) => {
          if (variant === 'menu') {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.border = '1px solid rgba(124, 111, 0, 0.3)';
          } else {
            e.target.style.background = '#ffffff';
          }
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        {/* Kod języka - wycentrowany */}
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          color: variant === 'menu' ? '#7c6f00' : '#000000',
          lineHeight: '1',
          letterSpacing: '0.5px'
        }}>
          {currentLanguage.code.toUpperCase()}
        </span>
      </button>
      
      {/* Dropdown z językami */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: variant === 'menu' ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: variant === 'menu' ? '1px solid rgba(124, 111, 0, 0.2)' : '2px solid #000000',
          zIndex: 1000,
          minWidth: '80px',
          overflow: 'hidden',
          animation: 'slideDown 0.2s ease-out'
        }}>
          {languages.map((language, index) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: i18n.language === language.code 
                  ? (variant === 'menu' ? 'rgba(124, 111, 0, 0.1)' : '#f0f0f0')
                  : 'transparent',
                color: variant === 'menu' ? '#7c6f00' : '#000000',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: i18n.language === language.code ? '700' : '600',
                borderBottom: index !== languages.length - 1 ? '1px solid #e0e0e0' : 'none',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                if (i18n.language !== language.code) {
                  e.target.style.background = variant === 'menu' ? 'rgba(124, 111, 0, 0.05)' : '#f8f9fa';
                }
              }}
              onMouseOut={(e) => {
                if (i18n.language !== language.code) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ 
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                {language.code.toUpperCase()}
              </span>
              {i18n.language === language.code && (
                <div style={{
                  position: 'absolute',
                  right: '8px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: variant === 'menu' ? '#7c6f00' : '#000000'
                }} />
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Overlay do zamykania dropdownu */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;
