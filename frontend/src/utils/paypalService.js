const API_BASE_URL = 'http://localhost:3001/api';

class PayPalService {
  // Tworzenie zamówienia PayPal
  async createOrder(amount, currency = 'PLN', description = 'Plan Premium - Lotek') {
    try {
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

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          orderId: data.orderId,
          approvalUrl: data.approvalUrl
        };
      } else {
        return {
          success: false,
          error: data.error
        };
      }
    } catch (error) {
      console.error('Błąd tworzenia zamówienia PayPal:', error);
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