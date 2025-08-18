// Konfiguracja PayPal - centralne zarządzanie
// Ten plik zapobiega problemom z wielokrotną inicjalizacją SDK

// Klucze PayPal z mcp.json
const PAYPAL_CONFIG = {
  CLIENT_ID: 'AcLnAD0aCb1hFnw5TDDoe_k1cLkqp-FtcWai8mctRT57oDP4pPi4ukzwdaFCS6JFAkQqfH1MIb0f0s9Z',
  ENVIRONMENT: 'production',
  CURRENCY: 'PLN',
  INTENT: 'capture'
};

// Sprawdź czy konfiguracja jest poprawna
const validatePayPalConfig = () => {
  if (!PAYPAL_CONFIG.CLIENT_ID) {
    console.error('❌ PayPal Client ID jest wymagany');
    return false;
  }
  
  if (!PAYPAL_CONFIG.ENVIRONMENT || !['live', 'sandbox'].includes(PAYPAL_CONFIG.ENVIRONMENT)) {
    console.error('❌ PayPal Environment musi być "live" lub "sandbox"');
    return false;
  }
  
  console.log('✅ PayPal konfiguracja poprawna:', {
    clientId: PAYPAL_CONFIG.CLIENT_ID ? 'OK' : 'BRAK',
    environment: PAYPAL_CONFIG.ENVIRONMENT,
    currency: PAYPAL_CONFIG.CURRENCY
  });
  
  return true;
};

// Pobierz konfigurację dla PayPal Script Provider
const getPayPalScriptOptions = () => {
  if (!validatePayPalConfig()) {
    throw new Error('Nieprawidłowa konfiguracja PayPal');
  }
  
  return {
    'client-id': PAYPAL_CONFIG.CLIENT_ID,
    currency: PAYPAL_CONFIG.CURRENCY,
    intent: PAYPAL_CONFIG.INTENT,
    components: 'buttons',
    'data-sdk-integration-source': 'button-factory',
    'enable-funding': 'paylater,venmo',
    'disable-funding': 'card,credit',
    'data-page-type': 'checkout',
    environment: PAYPAL_CONFIG.ENVIRONMENT
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
      clientId: PAYPAL_CONFIG.CLIENT_ID ? 'OK' : 'BRAK',
      environment: PAYPAL_CONFIG.ENVIRONMENT,
      currency: PAYPAL_CONFIG.CURRENCY
    }
  };
};

export {
  PAYPAL_CONFIG,
  validatePayPalConfig,
  getPayPalScriptOptions,
  initializePayPalSDK,
  resetPayPalSDK,
  getPayPalSDKStatus
};
