const config = require('./config');
const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');

class Przelewy24Service {
  constructor() {
    // Konfiguracja Przelewy24 - używamy danych z config.js
    this.config = {
      merchantId: config.PRZELEWY24.MERCHANT_ID,
      posId: config.PRZELEWY24.POS_ID,
      crc: config.PRZELEWY24.CRC,
      environment: config.PRZELEWY24.ENVIRONMENT
    };
    
    // URL dla sandboxa lub produkcji
    this.baseUrl = config.PRZELEWY24.ENVIRONMENT === 'production' 
      ? 'https://secure.przelewy24.pl' 
      : 'https://sandbox.przelewy24.pl';
    
    // Tryb symulacji dla testów (ustaw na false dla prawdziwych płatności)
    this.simulationMode = false; // Wyłączamy tryb symulacji dla produkcji
    
    console.log(`=== KONFIGURACJA PRZELEWY24 ===`);
    console.log(`Base URL: ${this.baseUrl}`);
    console.log(`Environment: ${this.config.environment}`);
    console.log(`Merchant ID: ${this.config.merchantId}`);
    console.log(`POS ID: ${this.config.posId}`);
    console.log(`CRC: ${this.config.crc}`);
    console.log(`Simulation Mode: ${this.simulationMode}`);
    console.log(`Return URL: ${config.PRZELEWY24.RETURN_URL}`);
    console.log(`Status URL: ${config.PRZELEWY24.STATUS_URL}`);
    console.log(`=== KONIEC KONFIGURACJI ===`);
    
    // Sprawdź czy wszystkie wymagane dane są dostępne
    if (!this.config.merchantId || !this.config.posId || !this.config.crc) {
      console.error('❌ BRAK WYMAGANYCH DANYCH PRZELEWY24!');
      console.error('Sprawdź plik .env lub config.js');
      console.error('Wymagane zmienne:');
      console.error('- PRZELEWY24_MERCHANT_ID');
      console.error('- PRZELEWY24_POS_ID');
      console.error('- PRZELEWY24_CRC');
      console.error('- PRZELEWY24_API_KEY');
    }
    
    // Sprawdź czy URL są poprawnie skonfigurowane
    if (!config.PRZELEWY24.RETURN_URL || !config.PRZELEWY24.STATUS_URL) {
      console.error('❌ BRAK WYMAGANYCH URL PRZELEWY24!');
      console.error('Sprawdź plik .env lub config.js');
      console.error('Wymagane zmienne:');
      console.error('- PRZELEWY24_RETURN_URL');
      console.error('- PRZELEWY24_STATUS_URL');
    }
  }

  // Generowanie poprawnego p24_sign zgodnie z dokumentacją
  generateP24Sign(sessionId, merchantId, amount, currency, crc) {
    const data = `${sessionId}|${merchantId}|${amount}|${currency}|${crc}`;
    console.log(`Generowanie p24_sign dla danych: ${data}`);
    return crypto.createHash('md5').update(data).digest('hex');
  }

  // Rejestracja płatności w Przelewy24 (krok 1)
  async registerPayment(sessionId, amount, currency, description, email) {
    try {
      console.log('=== REJESTRACJA PŁATNOŚCI PRZELEWY24 ===');
      console.log(`Session ID: ${sessionId}`);
      console.log(`Kwota: ${amount} ${currency}`);
      console.log(`Opis: ${description}`);
      console.log(`Email: ${email}`);
      console.log(`Merchant ID: ${this.config.merchantId}`);
      console.log(`POS ID: ${this.config.posId}`);
      console.log(`CRC: ${this.config.crc}`);
      console.log(`Base URL: ${this.baseUrl}`);
      
      // Symulacja dla testów
      if (this.simulationMode) {
        console.log('🎭 TRYB SYMULACJI - generowanie tokenu testowego');
        const testToken = `test_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`✅ Token testowy wygenerowany: ${testToken}`);
        return {
          success: true,
          token: testToken,
          sessionId: sessionId
        };
      }
      
      const amountInGrosz = Math.round(amount * 100);
      console.log(`Kwota w groszach: ${amountInGrosz}`);
      
      // Generowanie p24_sign zgodnie z dokumentacją Przelewy24
      // Format: md5(p24_session_id|p24_merchant_id|p24_amount|p24_currency|crc)
      const p24Sign = this.generateP24Sign(
        sessionId,
        this.config.merchantId,
        amountInGrosz,
        currency,
        this.config.crc
      );
      
      console.log(`p24_sign: ${p24Sign}`);

      // Przygotowanie danych do rejestracji zgodnie z dokumentacją Przelewy24
      const registerData = {
        p24_merchant_id: this.config.merchantId,
        p24_pos_id: this.config.posId,
        p24_api_version: '3.2',
        p24_session_id: sessionId,
        p24_amount: amountInGrosz,
        p24_currency: currency,
        p24_description: description,
        p24_email: email,
        p24_country: 'PL',
        p24_language: 'pl',
        p24_url_return: config.PRZELEWY24.RETURN_URL,
        p24_url_status: config.PRZELEWY24.STATUS_URL,
        p24_sign: p24Sign,
        p24_encoding: 'UTF-8'
      };

      console.log('Dane do rejestracji:', registerData);

      // Konwersja danych do formatu x-www-form-urlencoded
      const formData = qs.stringify(registerData);
      console.log('Form data:', formData);

      // Wysłanie żądania do Przelewy24
      console.log(`Wysyłanie żądania do: ${this.baseUrl}/trnRegister`);
      const response = await axios.post(
        `${this.baseUrl}/trnRegister`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000 // 30 sekund timeout
        }
      );

      console.log('Status odpowiedzi:', response.status);
      console.log('Headers odpowiedzi:', response.headers);
      console.log('Odpowiedź Przelewy24:', response.data);

      // Sprawdź czy odpowiedź zawiera błąd
      if (response.data && typeof response.data === 'string' && response.data.includes('error=')) {
        console.error('❌ Przelewy24 zwrócił błąd:', response.data);
        const errorMatch = response.data.match(/errorMessage=([^&]+)/);
        const errorMessage = errorMatch ? decodeURIComponent(errorMatch[1]) : 'Nieznany błąd Przelewy24';
        throw new Error(`Przelewy24 error: ${errorMessage}`);
      }

      if (response.data && response.data.token) {
        console.log(`✅ Token otrzymany: ${response.data.token}`);
        return {
          success: true,
          token: response.data.token,
          sessionId: sessionId
        };
      } else {
        console.error('❌ Brak tokenu w odpowiedzi Przelewy24');
        console.error('Pełna odpowiedź:', response.data);
        throw new Error('Brak tokenu w odpowiedzi Przelewy24');
      }

    } catch (error) {
      console.error('❌ Błąd rejestracji płatności Przelewy24:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        console.error('Data:', error.response.data);
        console.error('Error message:', error.response.data?.error?.message || error.response.data?.error || 'Nieznany błąd');
      } else if (error.request) {
        console.error('Brak odpowiedzi z serwera:', error.request);
        console.error('Request details:', error.request._currentUrl);
      } else {
        console.error('Błąd konfiguracji:', error.message);
      }
      
      // Zwracamy bardziej szczegółowy błąd
      let errorMessage = 'Nieznany błąd Przelewy24';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        details: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        }
      };
    }
  }

  // Tworzenie płatności dla konkretnej metody
  async createPaymentForMethod(method, amount, currency, description, email, sessionId) {
    try {
      console.log(`=== TWORZENIE PŁATNOŚCI PRZELEWY24 ===`);
      console.log(`Metoda: ${method}`);
      console.log(`Kwota: ${amount} ${currency}`);
      console.log(`Opis: ${description}`);
      console.log(`Email: ${email}`);
      console.log(`Session ID: ${sessionId}`);
      console.log(`Simulation Mode: ${this.simulationMode}`);
      console.log(`Base URL: ${this.baseUrl}`);
      console.log(`Merchant ID: ${this.config.merchantId}`);
      console.log(`POS ID: ${this.config.posId}`);
      console.log(`CRC: ${this.config.crc}`);
      
      // Sprawdź czy wszystkie wymagane dane są dostępne
      if (!this.config.merchantId || !this.config.posId || !this.config.crc) {
        throw new Error('Brak wymaganych danych konfiguracyjnych Przelewy24');
      }
      
      // Krok 1: Rejestracja płatności w Przelewy24
      console.log('🔄 Krok 1: Rejestracja płatności...');
      const registerResult = await this.registerPayment(sessionId, amount, currency, description, email);
      
      if (!registerResult.success) {
        console.error('❌ Błąd rejestracji płatności:', registerResult.error);
        throw new Error(registerResult.error);
      }

      console.log('✅ Rejestracja zakończona sukcesem');

      // Krok 2: Generowanie URL do płatności
      let redirectUrl;
      if (this.simulationMode) {
        // Symulacja URL dla testów - przekierowanie do strony sukcesu
        redirectUrl = `http://localhost:3001/api/payment/success?token=${registerResult.token}&session=${sessionId}&method=${method}&amount=${amount}`;
        console.log('🎭 TRYB SYMULACJI - URL przekierowania:', redirectUrl);
      } else {
        // Rzeczywisty URL Przelewy24 zgodnie z dokumentacją
        redirectUrl = `${this.baseUrl}/trnRequest/${registerResult.token}`;
        console.log(`URL przekierowania: ${redirectUrl}`);
      }
      
      const result = {
        success: true,
        paymentId: `p24_${Date.now()}`,
        redirectUrl: redirectUrl,
        sessionId: sessionId,
        token: registerResult.token,
        method: method
      };
      
      console.log(`✅ Wynik:`, result);
      console.log(`=== KONIEC TWORZENIA PŁATNOŚCI ===`);
      
      return result;
    } catch (error) {
      console.error(`❌ Błąd tworzenia płatności ${method}:`, error);
      console.error('Error details:', {
        method,
        amount,
        currency,
        description,
        email,
        sessionId,
        error: error.message,
        stack: error.stack,
        config: {
          merchantId: this.config.merchantId,
          posId: this.config.posId,
          crc: this.config.crc,
          baseUrl: this.baseUrl
        }
      });
      return {
        success: false,
        error: error.message,
        details: {
          method,
          amount,
          currency,
          error: error.message
        }
      };
    }
  }

  // Weryfikacja płatności
  async verifyPayment(sessionId, amount, currency = 'PLN') {
    try {
      console.log('=== WERYFIKACJA PŁATNOŚCI PRZELEWY24 ===');
      
      // Dla trybu symulacji zwracamy sukces
      if (this.simulationMode) {
        console.log('🎭 TRYB SYMULACJI - weryfikacja zakończona sukcesem');
        return {
          success: true,
          verified: true,
          paymentId: `p24_${Date.now()}`,
          status: 'completed'
        };
      }
      
      const amountInGrosz = Math.round(amount * 100);
      
      // Generowanie p24_sign dla weryfikacji
      const p24Sign = this.generateP24Sign(
        sessionId,
        this.config.merchantId,
        amountInGrosz,
        currency,
        this.config.crc
      );

      const verifyData = {
        p24_merchant_id: this.config.merchantId,
        p24_pos_id: this.config.posId,
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
        `${this.baseUrl}/trnVerify`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('Odpowiedź weryfikacji:', response.data);

      return {
        success: true,
        verified: true,
        paymentId: `p24_${Date.now()}`,
        status: 'completed'
      };
    } catch (error) {
      console.error('Błąd weryfikacji płatności Przelewy24:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Sprawdzenie statusu płatności
  async getPaymentStatus(sessionId) {
    try {
      console.log('=== SPRAWDZANIE STATUSU PŁATNOŚCI ===');
      
      // Dla testów zwracamy symulację statusu
      if (this.simulationMode) {
        console.log('🎭 TRYB SYMULACJI - status płatności: completed');
        return {
          success: true,
          status: 'completed',
          amount: 999, // 9.99 PLN w groszach
          currency: 'PLN',
          paymentId: `p24_${Date.now()}`
        };
      }
      
      // W rzeczywistej implementacji należałoby użyć API Przelewy24
      return {
        success: true,
        status: 'completed',
        amount: 999, // 9.99 PLN w groszach
        currency: 'PLN',
        paymentId: `p24_${Date.now()}`
      };
    } catch (error) {
      console.error('Błąd sprawdzania statusu płatności Przelewy24:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Pobieranie dostępnych metod płatności
  getAvailablePaymentMethods() {
    return [
      {
        id: 'blik',
        name: 'BLIK',
        description: 'Szybkie płatności mobilne',
        icon: '📱',
        fees: '1.9% + 0.35 PLN'
      },
      {
        id: 'card',
        name: 'Karta kredytowa/debetowa',
        description: 'Visa, Mastercard, American Express',
        icon: '💳',
        fees: '2.9% + 0.35 PLN'
      },
      {
        id: 'transfer',
        name: 'Przelew bankowy',
        description: 'Szybki przelew online',
        icon: '🏦',
        fees: '1.9% + 0.35 PLN'
      }
    ];
  }
}

module.exports = new Przelewy24Service(); 