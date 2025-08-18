const paypal = require('@paypal/checkout-server-sdk');
const config = require('./config');

// Konfiguracja PayPal
let environment;
let client;

try {
  console.log('🔄 Konfiguracja PayPal...');
  console.log('Environment:', config.PAYPAL.ENVIRONMENT);
  console.log('Client ID:', config.PAYPAL.CLIENT_ID ? 'OK' : 'BRAK');
  console.log('Client Secret:', config.PAYPAL.CLIENT_SECRET ? 'OK' : 'BRAK');
  
  // Użyj live environment dla produkcji
  if (config.PAYPAL.ENVIRONMENT === 'live') {
    environment = new paypal.core.LiveEnvironment(
      config.PAYPAL.CLIENT_ID,
      config.PAYPAL.CLIENT_SECRET
    );
    console.log('✅ PayPal Live Environment utworzony');
  } else {
    // Dla development używamy sandbox
    environment = new paypal.core.SandboxEnvironment(
      config.PAYPAL.CLIENT_ID,
      config.PAYPAL.CLIENT_SECRET
    );
    console.log('✅ PayPal Sandbox Environment utworzony');
  }
  
  client = new paypal.core.PayPalHttpClient(environment);
  console.log(`✅ PayPal skonfigurowany dla środowiska: ${config.PAYPAL.ENVIRONMENT}`);
} catch (error) {
  console.error('❌ Błąd konfiguracji PayPal SDK:', error.message);
  console.error('Stack:', error.stack);
  // Fallback - dummy client
  client = {
    execute: async () => ({ success: false, error: 'PayPal nie skonfigurowany' })
  };
}

module.exports = {
  client,
  environment: config.PAYPAL.ENVIRONMENT
}; 