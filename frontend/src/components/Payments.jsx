import React, { useState, useMemo, useCallback } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import './PaymentButtons.css';

const Payments = ({ user = null }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paypalLoading, setPaypalLoading] = useState(true);

  // Konfiguracja planów
  const plans = useMemo(() => ({
    monthly: {
      name: 'Plan Miesięczny',
      price: 9.99,
      period: 'miesiąc',
      description: 'Pełny dostęp na 1 miesiąc'
    },
    yearly: {
      name: 'Plan Roczny',
      price: 59.99,
      period: 'rok',
      description: 'Pełny dostęp na 12 miesięcy',
      savings: 'Oszczędzasz 59,89 PLN (50%)'
    }
  }), []);

  const selectedPlanData = plans[selectedPlan];

  // Notification helper
  const showNotification = useCallback((message, type = 'info') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : 
                   type === 'error' ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' : 
                   'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
      word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 5000);
  }, []);

  // Walidacja użytkownika
  const validateUser = useCallback(() => {
    if (!user) {
      showNotification('❌ Musisz być zalogowany, aby wykonać płatność. Przejdź do zakładki "Konto" i zaloguj się.', 'error');
      return false;
    }

    if (!user.email) {
      showNotification('❌ Twoje konto nie ma przypisanego adresu email. Zaktualizuj dane w zakładce "Konto".', 'error');
      return false;
    }

    return true;
  }, [user, showNotification]);

  // Obsługa płatności PayPal
  const handlePayPalCreateOrder = useCallback(async (data, actions) => {
    if (!validateUser()) {
      throw new Error('Użytkownik nie jest uprawniony do płatności');
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/paypal/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPlanData.price,
          currency: 'PLN',
          description: `${selectedPlanData.name} - Lotek Generator`,
          email: user.email,
          plan: selectedPlan
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ PayPal order created:', result);
      return result.id;
    } catch (error) {
      console.error('❌ PayPal create order error:', error);
      showNotification('❌ Błąd tworzenia zamówienia PayPal: ' + error.message, 'error');
      throw error;
    }
  }, [selectedPlanData, selectedPlan, user, validateUser, showNotification]);

  const handlePayPalApprove = useCallback(async (data, actions) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/paypal/capture/${data.orderID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ PayPal payment captured:', result);
      
      setSuccess(`✅ Płatność PayPal zrealizowana pomyślnie! ${selectedPlanData.name}`);
      showNotification(`✅ Płatność PayPal zrealizowana pomyślnie! ${selectedPlanData.name}`, 'success');
      
      // Przekierowanie po sukcesie
      setTimeout(() => {
        window.location.href = `/payments?status=success&method=paypal&amount=${selectedPlanData.price}&plan=${selectedPlan}`;
      }, 2000);
      
    } catch (error) {
      console.error('❌ PayPal capture error:', error);
      showNotification('❌ Błąd płatności PayPal: ' + error.message, 'error');
      throw error;
    }
  }, [selectedPlan, selectedPlanData, showNotification]);

  // Timer do ukrycia ładowania PayPal po 5 sekundach
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPaypalLoading(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="payment-container w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto p-4 sm:p-6 overflow-hidden">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
        Plany Premium
      </h2>

      {/* Wybór planu */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedPlan === 'monthly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-sm sm:text-base font-semibold">{plans.monthly.name}</div>
            <div className="text-lg sm:text-xl font-bold">{plans.monthly.price} PLN/mies.</div>
            <div className="text-xs sm:text-sm text-gray-600">{plans.monthly.description}</div>
          </button>
          
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedPlan === 'yearly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-sm sm:text-base font-semibold">{plans.yearly.name}</div>
            <div className="text-lg sm:text-xl font-bold">{plans.yearly.price} PLN/rok</div>
            <div className="text-xs sm:text-sm text-gray-600">{plans.yearly.description}</div>
            {plans.yearly.savings && (
              <div className="text-xs text-green-600 font-medium mt-1">
                {plans.yearly.savings}
              </div>
            )}
          </button>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-center text-gray-800">
        Wybierz metodę płatności
      </h3>
      
      {error && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl w-full">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl w-full">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-500 hover:text-green-700 text-sm font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Sekcja przycisków płatności */}
      <div className="payment-methods-container w-full space-y-3 sm:space-y-4">
        
        {/* PAYPAL */}
        <div className="payment-method-item w-full">
          <div className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm w-full overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                <span className="mr-2">PayPal</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  LIVE
                </span>
              </div>
            </div>
            
            {paypalLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 text-sm">Ładowanie PayPal...</span>
              </div>
            ) : (
                            <div className="paypal-container w-full overflow-x-auto">
                <PayPalButtons
                  style={{ 
                    layout: "vertical", 
                    color: "blue", 
                    shape: "rect",
                    label: "pay",
                    width: "100%",
                    minWidth: "200px"
                  }}
                  createOrder={handlePayPalCreateOrder}
                  onApprove={handlePayPalApprove}
                  onInit={() => {
                    console.log('✅ PayPal SDK załadowany w Payments komponencie');
                    setPaypalLoading(false);
                    showNotification('✅ PayPal gotowy do płatności', 'success');
                  }}
                  onCancel={(data) => {
                    console.log('❌ PayPal payment cancelled:', data);
                    showNotification('ℹ️ Płatność PayPal anulowana przez użytkownika', 'info');
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err);
                    
                    // Ignoruj błędy sesji, sandbox i popup close - to normalne zachowanie
                    if (err.message && (
                      err.message.includes('global_session_not_found') || 
                      err.message.includes('session') ||
                      err.message.includes('sandbox') ||
                      err.message.includes('clientID') ||
                      err.message.includes('popup close') ||
                      err.message.includes('Detected popup close')
                    )) {
                      console.log('🔄 Ignorowanie błędu PayPal (normalne):', err.message);
                      return;
                    }
                    
                    // Dla innych błędów pokaż powiadomienie
                    const errorMessage = err.message || 'Nieznany błąd PayPal';
                    console.error('❌ Błąd PayPal (krytyczny):', errorMessage);
                    setError('Błąd PayPal: ' + errorMessage);
                    showNotification('❌ Błąd PayPal: ' + errorMessage, 'error');
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Informacje dodatkowe */}
        <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600 space-y-1">
          <p>🔒 Bezpieczne płatności przez PayPal</p>
          <p>📧 Potwierdzenie zostanie wysłane na: {user?.email || 'Twój email'}</p>
          <p>🔄 Możesz anulować subskrypcję w dowolnym momencie</p>
          <p className="text-green-600 font-medium">✅ Tryb produkcyjny - prawdziwe płatności</p>
        </div>
      </div>
    </div>
  );
};

export default Payments;
