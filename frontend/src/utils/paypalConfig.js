// Konfiguracja PayPal dla frontend
const paypalConfig = {
  CLIENT_ID: process.env.REACT_APP_PAYPAL_CLIENT_ID,
  ENVIRONMENT: (() => {
    const envFromFile = process.env.REACT_APP_PAYPAL_ENVIRONMENT || 'live';
    // PayPal SDK oczekuje "production" zamiast "live"
    return envFromFile === 'live' ? 'production' : envFromFile;
  })(),
  CURRENCY: 'PLN',
  LOCALE: 'pl_PL'
};

// Debug: Sprawdź wartości zmiennych środowiskowych
console.log('🔍 PayPal Environment Variables Debug:', {
  REACT_APP_PAYPAL_CLIENT_ID: process.env.REACT_APP_PAYPAL_CLIENT_ID,
  REACT_APP_PAYPAL_ENVIRONMENT: process.env.REACT_APP_PAYPAL_ENVIRONMENT,
  NODE_ENV: process.env.NODE_ENV
});

// Sprawdź czy konfiguracja jest poprawna
const validatePayPalConfig = () => {
  if (!paypalConfig.CLIENT_ID) {
    console.error('❌ PayPal Client ID jest wymagany');
    return false;
  }
  
  if (!paypalConfig.ENVIRONMENT || !['production', 'sandbox'].includes(paypalConfig.ENVIRONMENT)) {
    console.error('❌ PayPal Environment musi być "production" lub "sandbox"');
    return false;
  }
  
  console.log('✅ PayPal konfiguracja poprawna:', {
    clientId: paypalConfig.CLIENT_ID ? 'OK' : 'BRAK',
    environment: paypalConfig.ENVIRONMENT,
    currency: paypalConfig.CURRENCY
  });
  
  return true;
};

// Pobierz konfigurację dla PayPal Script Provider
const getPayPalScriptOptions = () => {
  if (!validatePayPalConfig()) {
    throw new Error('Nieprawidłowa konfiguracja PayPal');
  }
  
  return {
    'client-id': paypalConfig.CLIENT_ID,
    currency: paypalConfig.CURRENCY,
    intent: 'capture', // Default intent, can be overridden if needed
    components: 'buttons',
    'data-sdk-integration-source': 'button-factory',
    'enable-funding': 'paylater,venmo',
    'disable-funding': 'card,credit',
    'data-page-type': 'checkout',
    environment: paypalConfig.ENVIRONMENT,
    locale: paypalConfig.LOCALE
  };
};

// Sprawdź czy PayPal SDK jest już załadowany
let paypalSdkLoaded = false;
let paypalSdkPromise = null;

const initializePayPalSDK = () => {
  if (paypalSdkLoaded) {
    console.log('✅ PayPal SDK już załadowany');
    return Promise.resolve();
  }
  
  if (paypalSdkPromise) {
    console.log('🔄 PayPal SDK w trakcie ładowania...');
    return paypalSdkPromise;
  }
  
  console.log('🔄 Inicjalizacja PayPal SDK...');
  
  paypalSdkPromise = new Promise((resolve, reject) => {
    // Symulacja ładowania SDK
    setTimeout(() => {
      paypalSdkLoaded = true;
      console.log('✅ PayPal SDK załadowany pomyślnie');
      resolve();
    }, 1000);
  });
  
  return paypalSdkPromise;
};

// Resetuj stan PayPal SDK (tylko w przypadku błędu)
const resetPayPalSDK = () => {
  console.log('🔄 Resetowanie PayPal SDK...');
  paypalSdkLoaded = false;
  paypalSdkPromise = null;
};

// Sprawdź status PayPal SDK
const getPayPalSDKStatus = () => {
  return {
    loaded: paypalSdkLoaded,
    loading: !!paypalSdkPromise,
    config: {
      clientId: paypalConfig.CLIENT_ID ? 'OK' : 'BRAK',
      environment: paypalConfig.ENVIRONMENT,
      currency: paypalConfig.CURRENCY
    }
  };
};

export {
  paypalConfig,
  validatePayPalConfig,
  getPayPalScriptOptions,
  initializePayPalSDK,
  resetPayPalSDK,
  getPayPalSDKStatus
};
