import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import tłumaczeń
import enTranslations from './locales/en.json';
import plTranslations from './locales/pl.json';
import deTranslations from './locales/de.json';

const resources = {
  en: {
    translation: enTranslations
  },
  pl: {
    translation: plTranslations
  },
  de: {
    translation: deTranslations
  }
};

i18n
  // Wykrywanie języka przeglądarki
  .use(LanguageDetector)
  // Integracja z React
  .use(initReactI18next)
  // Inicjalizacja
  .init({
    resources,
    fallbackLng: 'en', // Fallback na angielski
    debug: process.env.NODE_ENV === 'development',
    
    // Opcje wykrywania języka
    detection: {
      order: ['navigator', 'localStorage', 'cookie', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React już zabezpiecza przed XSS
    },

    // Opcje dla PWA
    react: {
      useSuspense: false, // Ważne dla PWA
    },

    // Obsługa błędów
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      console.warn(`Missing translation key: ${key} for language: ${lng}`);
    }
  });

export default i18n;
