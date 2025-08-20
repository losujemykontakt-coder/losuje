const express = require('express');
const router = express.Router();
const paypal = require('@paypal/checkout-server-sdk');
const config = require('../config');

// Konfiguracja PayPal z prawdziwymi kluczami LIVE
const clientId = process.env.PAYPAL_CLIENT_ID || 'Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EL-rOID1Th-ByzT-IcWGGxUQNkXw1sz9gwlSK_LeYTTG839kTlRqTY6VrDa2iwoLAkY-5F2edJ2kOkbR';

const environment = new paypal.core.LiveEnvironment(
  clientId,
  clientSecret
);

const client = new paypal.core.PayPalHttpClient(environment);

// POST /api/paypal/create - Tworzenie zamówienia PayPal
router.post('/create', async (req, res) => {
  try {
    console.log('🔄 [PAYPAL] Otrzymano żądanie tworzenia zamówienia');
    console.log('📋 Request body:', req.body);
    
    const { amount, currency = 'PLN', description, email, plan = 'monthly' } = req.body;
    
    // Walidacja danych
    if (!amount || !description || !email) {
      console.log('❌ [PAYPAL] Brak wymaganych pól:', { amount, description, email });
      return res.status(400).json({ 
        success: false,
        error: 'Kwota, opis i email są wymagane' 
      });
    }

    if (amount <= 0) {
      console.log('❌ [PAYPAL] Nieprawidłowa kwota:', amount);
      return res.status(400).json({ 
        success: false,
        error: 'Kwota musi być większa od 0' 
      });
    }

    // Sprawdź format emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ [PAYPAL] Nieprawidłowy format emaila:', email);
      return res.status(400).json({ 
        success: false,
        error: 'Nieprawidłowy format adresu email' 
      });
    }

    console.log('🔄 [PAYPAL] Tworzenie zamówienia PayPal:', { 
      amount, 
      currency, 
      description, 
      email, 
      plan 
    });

    // Dodaj informację o planie do opisu
    const planInfo = plan === 'yearly' ? ' (Plan Roczny - 12 miesięcy)' : ' (Plan Miesięczny)';
    const fullDescription = description + planInfo;

    // Utwórz zamówienie PayPal
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      application_context: {
        return_url: `${process.env.FRONTEND_URL || 'https://losuje.pl'}/payments?status=success&method=paypal&amount=${amount}&plan=${plan}`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://losuje.pl'}/payments?status=cancelled&method=paypal`,
        brand_name: 'Lotek Generator',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING'
      },
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: amount.toString()
            }
          }
        },
        description: fullDescription,
        custom_id: `lotek_${plan}_${Date.now()}`,
        invoice_id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        items: [{
          name: fullDescription,
          description: `Plan Premium - ${plan === 'yearly' ? '12 miesięcy' : '1 miesiąc'}`,
          quantity: '1',
          unit_amount: {
            currency_code: currency,
            value: amount.toString()
          },
          category: 'DIGITAL_GOODS'
        }]
      }]
    });

    const order = await client.execute(request);
    
    console.log('✅ [PAYPAL] Zamówienie utworzone pomyślnie:', {
      orderId: order.result.id,
      status: order.result.status,
      plan: plan,
      amount: amount,
      email: email
    });

    res.json({
      success: true,
      id: order.result.id,
      status: order.result.status,
      plan: plan,
      amount: amount,
      links: order.result.links
    });

  } catch (error) {
    console.error('❌ [PAYPAL] Błąd tworzenia zamówienia:', error);
    console.error('❌ [PAYPAL] Stack trace:', error.stack);
    
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera PayPal: ' + error.message 
    });
  }
});

// POST /api/paypal/capture/:orderID - Przechwytywanie płatności PayPal
router.post('/capture/:orderID', async (req, res) => {
  try {
    const { orderID } = req.params;
    const { plan = 'monthly' } = req.body;
    
    console.log('🔄 [PAYPAL] Przechwytywanie płatności PayPal:', orderID, 'Plan:', plan);
    
    if (!orderID) {
      console.log('❌ [PAYPAL] Brak ID zamówienia');
      return res.status(400).json({ 
        success: false,
        error: 'ID zamówienia jest wymagane' 
      });
    }

    // Przechwyć płatność
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.prefer("return=representation");
    
    const capture = await client.execute(request);
    
    console.log('✅ [PAYPAL] Płatność przechwycona:', {
      orderID: orderID,
      captureId: capture.result.purchase_units[0].payments.captures[0].id,
      status: capture.result.status,
      amount: capture.result.purchase_units[0].payments.captures[0].amount.value,
      plan: plan
    });

    // Oblicz datę końca subskrypcji na podstawie planu
    const now = new Date();
    const endDate = new Date(now);
    
    if (plan === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Tutaj możesz dodać logikę zapisywania do bazy danych
    // np. aktualizacja statusu subskrypcji użytkownika

    res.json({
      success: true,
      captureId: capture.result.purchase_units[0].payments.captures[0].id,
      status: capture.result.status,
      amount: capture.result.purchase_units[0].payments.captures[0].amount.value,
      plan: plan,
      subscriptionStart: now.toISOString(),
      subscriptionEnd: endDate.toISOString(),
      orderID: orderID
    });

  } catch (error) {
    console.error('❌ [PAYPAL] Błąd przechwytywania płatności:', error);
    console.error('❌ [PAYPAL] Stack trace:', error.stack);
    
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera PayPal: ' + error.message 
    });
  }
});

// GET /api/paypal/order/:orderID - Pobieranie szczegółów zamówienia
router.get('/order/:orderID', async (req, res) => {
  try {
    const { orderID } = req.params;
    
    console.log('🔄 [PAYPAL] Pobieranie szczegółów zamówienia:', orderID);
    
    if (!orderID) {
      return res.status(400).json({ 
        success: false,
        error: 'ID zamówienia jest wymagane' 
      });
    }

    const request = new paypal.orders.OrdersGetRequest(orderID);
    const order = await client.execute(request);
    
    console.log('✅ [PAYPAL] Szczegóły zamówienia pobrane:', {
      orderId: order.result.id,
      status: order.result.status
    });

    res.json({
      success: true,
      order: order.result
    });

  } catch (error) {
    console.error('❌ [PAYPAL] Błąd pobierania zamówienia:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera PayPal: ' + error.message 
    });
  }
});

module.exports = router;

