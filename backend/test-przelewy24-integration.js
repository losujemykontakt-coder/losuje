const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');

// Konfiguracja testowa
const config = {
  merchantId: '269321',
  posId: '269321',
  crc: '1a2b3c4d5e6f7',
  baseUrl: 'https://sandbox.przelewy24.pl'
};

// Generowanie p24_sign zgodnie z dokumentacją
function generateP24Sign(sessionId, merchantId, amount, currency, crc) {
  const data = `${sessionId}|${merchantId}|${amount}|${currency}|${crc}`;
  console.log(`Generowanie p24_sign dla danych: ${data}`);
  return crypto.createHash('md5').update(data).digest('hex');
}

// Test rejestracji płatności
async function testPaymentRegistration() {
  try {
    console.log('=== TEST REJESTRACJI PŁATNOŚCI PRZELEWY24 ===');
    
    const sessionId = `test_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amount = 9.99;
    const currency = 'PLN';
    const description = 'Test płatności - Plan Premium';
    const email = 'test@example.com';
    
    console.log(`Session ID: ${sessionId}`);
    console.log(`Kwota: ${amount} ${currency}`);
    console.log(`Opis: ${description}`);
    console.log(`Email: ${email}`);
    
    const amountInGrosz = Math.round(amount * 100);
    console.log(`Kwota w groszach: ${amountInGrosz}`);
    
    // Generowanie p24_sign
    const p24Sign = generateP24Sign(
      sessionId,
      config.merchantId,
      amountInGrosz,
      currency,
      config.crc
    );
    
    console.log(`p24_sign: ${p24Sign}`);
    
    // Przygotowanie danych do rejestracji
    const registerData = {
      p24_merchant_id: config.merchantId,
      p24_pos_id: config.posId,
      p24_api_version: '3.2',
      p24_session_id: sessionId,
      p24_amount: amountInGrosz,
      p24_currency: currency,
      p24_description: description,
      p24_email: email,
      p24_country: 'PL',
      p24_language: 'pl',
      p24_url_return: 'https://example.com/payment-success',
      p24_url_status: 'https://example.com/api/przelewy24/status',
      p24_sign: p24Sign
    };
    
    console.log('Dane do rejestracji:', registerData);
    
    // Konwersja danych do formatu x-www-form-urlencoded
    const formData = qs.stringify(registerData);
    console.log('Form data:', formData);
    
    // Wysłanie żądania do Przelewy24
    console.log(`Wysyłanie żądania do: ${config.baseUrl}/trnRegister`);
    const response = await axios.post(
      `${config.baseUrl}/trnRegister`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }
    );
    
    console.log('Status odpowiedzi:', response.status);
    console.log('Headers odpowiedzi:', response.headers);
    console.log('Odpowiedź Przelewy24:', response.data);
    
    if (response.data && response.data.token) {
      console.log(`✅ Token otrzymany: ${response.data.token}`);
      console.log(`🔗 URL przekierowania: ${config.baseUrl}/trnRequest/${response.data.token}`);
      return {
        success: true,
        token: response.data.token,
        sessionId: sessionId,
        redirectUrl: `${config.baseUrl}/trnRequest/${response.data.token}`
      };
    } else {
      console.error('❌ Brak tokenu w odpowiedzi Przelewy24');
      console.error('Pełna odpowiedź:', response.data);
      return {
        success: false,
        error: 'Brak tokenu w odpowiedzi Przelewy24'
      };
    }
    
  } catch (error) {
    console.error('💥 Błąd testu rejestracji płatności:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      success: false,
      error: error.message
    };
  }
}

// Test weryfikacji płatności
async function testPaymentVerification(sessionId, amount, currency = 'PLN') {
  try {
    console.log('=== TEST WERYFIKACJI PŁATNOŚCI PRZELEWY24 ===');
    
    const amountInGrosz = Math.round(amount * 100);
    
    // Generowanie p24_sign dla weryfikacji
    const p24Sign = generateP24Sign(
      sessionId,
      config.merchantId,
      amountInGrosz,
      currency,
      config.crc
    );
    
    const verifyData = {
      p24_merchant_id: config.merchantId,
      p24_pos_id: config.posId,
      p24_session_id: sessionId,
      p24_amount: amountInGrosz,
      p24_currency: currency,
      p24_sign: p24Sign
    };
    
    console.log('Dane weryfikacji:', verifyData);
    
    // Konwersja danych do formatu x-www-form-urlencoded
    const formData = qs.stringify(verifyData);
    
    // Wysłanie żądania weryfikacji do Przelewy24
    const response = await axios.post(
      `${config.baseUrl}/trnVerify`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }
    );
    
    console.log('Status odpowiedzi weryfikacji:', response.status);
    console.log('Odpowiedź weryfikacji:', response.data);
    
    if (response.data && response.data.error === '0') {
      console.log('✅ Płatność zweryfikowana pomyślnie');
      return {
        success: true,
        verified: true
      };
    } else {
      console.error('❌ Błąd weryfikacji płatności:', response.data);
      return {
        success: false,
        error: response.data.errorMessage || 'Nieznany błąd weryfikacji'
      };
    }
    
  } catch (error) {
    console.error('💥 Błąd testu weryfikacji płatności:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Główna funkcja testowa
async function runTests() {
  console.log('🚀 Rozpoczynam testy integracji Przelewy24...\n');
  
  // Test 1: Rejestracja płatności
  console.log('📋 TEST 1: Rejestracja płatności');
  const registrationResult = await testPaymentRegistration();
  
  if (registrationResult.success) {
    console.log('\n✅ Test rejestracji zakończony sukcesem!');
    console.log(`Token: ${registrationResult.token}`);
    console.log(`Session ID: ${registrationResult.sessionId}`);
    console.log(`URL przekierowania: ${registrationResult.redirectUrl}`);
    
    // Test 2: Weryfikacja płatności (opcjonalny)
    console.log('\n📋 TEST 2: Weryfikacja płatności (symulacja)');
    console.log('⚠️ Uwaga: Ten test wymaga rzeczywistej płatności w Przelewy24');
    console.log('Możesz go uruchomić po dokonaniu płatności w sandboxie');
    
    // Odkomentuj poniższą linię, aby przetestować weryfikację
    // await testPaymentVerification(registrationResult.sessionId, 9.99);
    
  } else {
    console.log('\n❌ Test rejestracji zakończony błędem!');
    console.log(`Błąd: ${registrationResult.error}`);
  }
  
  console.log('\n🏁 Testy zakończone!');
}

// Uruchom testy jeśli plik jest uruchamiany bezpośrednio
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testPaymentRegistration,
  testPaymentVerification,
  generateP24Sign
}; 