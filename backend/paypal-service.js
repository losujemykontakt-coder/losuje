const paypal = require('@paypal/checkout-server-sdk');
const { client } = require('./paypal-config');
const config = require('./config');

class PayPalService {
  // Tworzenie zamówienia PayPal zgodnie z dokumentacją REST API
  async createOrder(amount, currency = 'PLN', description = 'Plan Premium - Lotek') {
    try {
      console.log('=== TWORZENIE ZAMÓWIENIA PAYPAL ===');
      console.log('Kwota:', amount);
      console.log('Waluta:', currency);
      console.log('Opis:', description);
      console.log('Environment:', config.PAYPAL.ENVIRONMENT);
      console.log('Client ID:', config.PAYPAL.CLIENT_ID ? 'OK' : 'BRAK');
      console.log('Client Secret:', config.PAYPAL.CLIENT_SECRET ? 'OK' : 'BRAK');
      
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        application_context: {
          return_url: config.PAYPAL.RETURN_URL,
          cancel_url: config.PAYPAL.CANCEL_URL,
          brand_name: 'Lotek - Generator Liczb',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING'
        },
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString()
          },
          description: description,
          custom_id: `premium_plan_${Date.now()}`,
          invoice_id: `INV-${Date.now()}`
        }]
      });

      console.log('Wysyłanie żądania do PayPal...');
      console.log('Request body:', JSON.stringify(request.requestBody, null, 2));
      
      // Dodaj timeout do żądania PayPal
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PayPal request timeout')), 10000)
      );
      
      const orderPromise = client.execute(request);
      const order = await Promise.race([orderPromise, timeoutPromise]);
      
      console.log('Odpowiedź PayPal:', order.result);
      console.log('Order ID:', order.result?.id);
      console.log('Status:', order.result?.status);
      
      // Sprawdź czy zamówienie zostało utworzone
      if (!order.result || !order.result.id) {
        throw new Error('Nieprawidłowa odpowiedź PayPal - brak ID zamówienia');
      }
      
      const approvalUrl = order.result.links.find(link => link.rel === 'approve');
      if (!approvalUrl) {
        throw new Error('Brak URL zatwierdzenia w odpowiedzi PayPal');
      }
      
      console.log('URL zatwierdzenia:', approvalUrl.href);
      console.log('=== KONIEC TWORZENIA ZAMÓWIENIA PAYPAL ===');
      
      return {
        success: true,
        orderId: order.result.id,
        approvalUrl: approvalUrl.href,
        status: order.result.status
      };
    } catch (error) {
      console.error('❌ Błąd tworzenia zamówienia PayPal:', error);
      console.error('Szczegóły błędu:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        details: error.details
      });
      
      return {
        success: false,
        error: error.message || 'Błąd tworzenia zamówienia PayPal'
      };
    }
  }

  // Weryfikacja i finalizacja płatności
  async capturePayment(orderId) {
    try {
      console.log('=== FINALIZACJA PŁATNOŚCI PAYPAL ===');
      console.log('Order ID:', orderId);
      console.log('Environment:', config.PAYPAL.ENVIRONMENT);
      
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.prefer("return=representation");
      
      console.log('Wysyłanie żądania finalizacji do PayPal...');
      const capture = await client.execute(request);
      console.log('Odpowiedź finalizacji:', capture.result);
      console.log('Capture ID:', capture.result?.purchase_units?.[0]?.payments?.captures?.[0]?.id);
      
      const payment = capture.result.purchase_units[0].payments.captures[0];
      
      return {
        success: true,
        transactionId: payment.id,
        status: capture.result.status,
        amount: payment.amount.value,
        currency: payment.amount.currency_code
      };
    } catch (error) {
      console.error('❌ Błąd finalizacji płatności PayPal:', error);
      console.error('Szczegóły błędu:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return {
        success: false,
        error: error.message || 'Błąd finalizacji płatności PayPal'
      };
    }
  }

  // Sprawdzenie statusu zamówienia
  async getOrderDetails(orderId) {
    try {
      console.log('=== SPRAWDZENIE SZCZEGÓŁÓW ZAMÓWIENIA ===');
      console.log('Order ID:', orderId);
      
      const request = new paypal.orders.OrdersGetRequest(orderId);
      const order = await client.execute(request);
      
      console.log('Szczegóły zamówienia:', order.result);
      
      return {
        success: true,
        order: order.result
      };
    } catch (error) {
      console.error('❌ Błąd pobierania szczegółów zamówienia:', error);
      console.error('Szczegóły błędu:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return {
        success: false,
        error: error.message || 'Błąd pobierania szczegółów zamówienia'
      };
    }
  }

  // Zwrot pieniędzy
  async refundPayment(captureId, amount, reason = 'Refund requested') {
    try {
      console.log('=== ZWROT PIENIĘDZY PAYPAL ===');
      console.log('Capture ID:', captureId);
      console.log('Kwota:', amount);
      console.log('Powód:', reason);
      
      const request = new paypal.captures.CapturesRefundRequest(captureId);
      request.requestBody({
        amount: {
          currency_code: 'PLN',
          value: amount.toString()
        },
        note_to_payer: reason
      });

      console.log('Wysyłanie żądania zwrotu do PayPal...');
      const refund = await client.execute(request);
      console.log('Odpowiedź zwrotu:', refund.result);
      
      return {
        success: true,
        refundId: refund.result.id,
        status: refund.result.status
      };
    } catch (error) {
      console.error('❌ Błąd zwrotu pieniędzy PayPal:', error);
      console.error('Szczegóły błędu:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return {
        success: false,
        error: error.message || 'Błąd zwrotu pieniędzy PayPal'
      };
    }
  }
}

module.exports = new PayPalService(); 