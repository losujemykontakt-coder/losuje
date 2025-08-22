// Dynamiczny URL API - localhost w development, losuje.pl w produkcji
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'https://losuje.pl/api';

class PayPalService {
  // Tworzenie zamówienia PayPal
  async createOrder(amount, currency = 'PLN', description = 'Plan Premium - Lotek') {
    try {
      console.log('🔄 [PAYPAL] Tworzenie zamówienia...');
      console.log('📋 Dane zamówienia:', { amount, currency, description });
      console.log('🌐 API URL:', `${API_BASE_URL}/paypal/create-order`);
      console.log('🔧 Environment:', process.env.NODE_ENV);
      
      const response = await fetch(`${API_BASE_URL}/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          description
        })
      });

      console.log('📡 [PAYPAL] Status odpowiedzi:', response.status);
      console.log('📡 [PAYPAL] Headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📤 [PAYPAL] Odpowiedź serwera:', data);
      
      if (data.success) {
        console.log('✅ [PAYPAL] Zamówienie utworzone pomyślnie');
        return {
          success: true,
          orderId: data.orderId,
          approvalUrl: data.approvalUrl
        };
      } else {
        console.log('❌ [PAYPAL] Błąd z serwera:', data.error);
        return {
          success: false,
          error: data.error
        };
      }
    } catch (error) {
      console.error('💥 [PAYPAL] Błąd tworzenia zamówienia:', error);
      console.error('💥 [PAYPAL] Szczegóły błędu:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Sprawdź typ błędu
      if (error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Brak połączenia z serwerem. Sprawdź czy backend jest uruchomiony.'
        };
      } else if (error.message.includes('timeout')) {
        return {
          success: false,
          error: 'Timeout - serwer nie odpowiada. Spróbuj ponownie.'
        };
      }
      
      return {
        success: false,
        error: 'Błąd połączenia z serwerem'
      };
    }
  }

  // Finalizacja płatności PayPal
  async capturePayment(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/paypal/capture-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          transactionId: data.transactionId,
          status: data.status,
          amount: data.amount,
          currency: data.currency
        };
      } else {
        return {
          success: false,
          error: data.error
        };
      }
    } catch (error) {
      console.error('Błąd finalizacji płatności PayPal:', error);
      return {
        success: false,
        error: 'Błąd połączenia z serwerem'
      };
    }
  }

  // Pobieranie szczegółów zamówienia
  async getOrderDetails(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/paypal/order/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          order: data.order
        };
      } else {
        return {
          success: false,
          error: data.error
        };
      }
    } catch (error) {
      console.error('Błąd pobierania szczegółów zamówienia:', error);
      return {
        success: false,
        error: 'Błąd połączenia z serwerem'
      };
    }
  }

  // Zwrot pieniędzy
  async refundPayment(captureId, amount, reason = 'Refund requested') {
    try {
      const response = await fetch(`${API_BASE_URL}/paypal/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          captureId,
          amount,
          reason
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          refundId: data.refundId,
          status: data.status
        };
      } else {
        return {
          success: false,
          error: data.error
        };
      }
    } catch (error) {
      console.error('Błąd zwrotu pieniędzy PayPal:', error);
      return {
        success: false,
        error: 'Błąd połączenia z serwerem'
      };
    }
  }

  // Przekierowanie do PayPal
  redirectToPayPal(approvalUrl) {
    window.location.href = approvalUrl;
  }

  // Obsługa powrotu z PayPal
  handlePayPalReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const PayerID = urlParams.get('PayerID');
    
    return {
      token,
      PayerID,
      hasReturned: !!token && !!PayerID
    };
  }
}

export default new PayPalService(); 