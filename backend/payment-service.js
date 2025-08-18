const paypalService = require('./paypal-service');
const przelewy24Service = require('./przelewy24-service');

class PaymentService {
  // Obsługa różnych metod płatności
  async processPayment(method, amount, currency = 'PLN', description = 'Plan Premium', email, sessionId) {
    switch (method.toLowerCase()) {
      case 'paypal':
        return await this.processPayPalPayment(amount, currency, description);
      
      case 'card':
        return await this.processCardPayment(amount, currency, description, email, sessionId);
      
      case 'blik':
        return await this.processBlikPayment(amount, currency, description, email, sessionId);
      
      case 'transfer':
        return await this.processTransferPayment(amount, currency, description, email, sessionId);
      
      default:
        return {
          success: false,
          error: 'Nieobsługiwana metoda płatności'
        };
    }
  }

  // PayPal
  async processPayPalPayment(amount, currency, description) {
    return await paypalService.createOrder(amount, currency, description);
  }

  // Karty (przez Przelewy24)
  async processCardPayment(amount, currency, description, email, sessionId) {
    return await przelewy24Service.createPaymentForMethod('card', amount, currency, description, email, sessionId);
  }

  // BLIK (przez Przelewy24)
  async processBlikPayment(amount, currency, description, email, sessionId) {
    return await przelewy24Service.createPaymentForMethod('blik', amount, currency, description, email, sessionId);
  }

  // Przelew bankowy (przez Przelewy24)
  async processTransferPayment(amount, currency, description, email, sessionId) {
    return await przelewy24Service.createPaymentForMethod('transfer', amount, currency, description, email, sessionId);
  }

  // Finalizacja płatności
  async finalizePayment(method, sessionId, amount, currency = 'PLN') {
    switch (method.toLowerCase()) {
      case 'paypal':
        return await paypalService.capturePayment(sessionId);
      
      case 'card':
      case 'blik':
      case 'transfer':
        return await przelewy24Service.verifyPayment(sessionId, amount, currency);
      
      default:
        return {
          success: false,
          error: 'Nieobsługiwana metoda płatności'
        };
    }
  }

  // Sprawdzenie statusu płatności
  async checkPaymentStatus(method, sessionId) {
    switch (method.toLowerCase()) {
      case 'paypal':
        return await paypalService.getOrderDetails(sessionId);
      
      case 'card':
      case 'blik':
      case 'transfer':
        return await przelewy24Service.getPaymentStatus(sessionId);
      
      default:
        return {
          success: false,
          error: 'Nieobsługiwana metoda płatności'
        };
    }
  }

  // Zwrot pieniędzy
  async refundPayment(method, captureId, amount, reason) {
    switch (method.toLowerCase()) {
      case 'paypal':
        return await paypalService.refundPayment(captureId, amount, reason);
      
      case 'card':
      case 'blik':
      case 'transfer':
        // Przelewy24 obsługuje zwroty automatycznie
        return {
          success: true,
          message: 'Zwrot zostanie przetworzony przez Przelewy24'
        };
      
      default:
        return {
          success: false,
          error: 'Nieobsługiwana metoda płatności'
        };
    }
  }

  // Pobieranie dostępnych metod płatności
  getAvailablePaymentMethods() {
    return [
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Bezpieczne płatności online',
        icon: '💳',
        fees: '2.9% + 1.35 PLN'
      },
      {
        id: 'card',
        name: 'Karta kredytowa/debetowa',
        description: 'Visa, Mastercard, American Express',
        icon: '💳',
        fees: '1.9% + 0.35 PLN'
      },
      {
        id: 'blik',
        name: 'BLIK',
        description: 'Szybkie płatności mobilne',
        icon: '📱',
        fees: '1.9% + 0.35 PLN'
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

module.exports = new PaymentService(); 