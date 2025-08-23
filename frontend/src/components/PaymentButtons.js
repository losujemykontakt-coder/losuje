import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getPayPalScriptOptions, validatePayPalConfig } from '../utils/paypalConfig';
import PayPalButtonWrapper from './PayPalButtonWrapper';
import './PaymentButtons.css';

const PaymentButtons = ({ 
  user = null, 
  amount = 9.99, 
  selectedPaymentMethod = "paypal",
  setSelectedPaymentMethod = () => {}
}) => {
  const [paypalLoading, setPaypalLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' lub 'yearly'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalInitialized, setPaypalInitialized] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  
  // Ref do śledzenia czy PayPal SDK został już załadowany - NIE RESETUJEMY
  const paypalSdkLoaded = useRef(false);
  const paypalContainerRef = useRef(null);

  // Konfiguracja planów
  const plans = {
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
  };

  const selectedPlanData = plans[selectedPlan];

  // Konfiguracja PayPal - MEMOIZOWANA, żeby nie zmieniała się przy każdym renderze
  const paypalConfig = useMemo(() => {
    try {
      const config = getPayPalScriptOptions();
      console.log('🔧 PayPal Config - MEMOIZED:', { 
        clientId: config['client-id'] ? 'OK' : 'BRAK', 
        environment: config.environment
      });
      return config;
    } catch (error) {
      console.error('❌ Błąd konfiguracji PayPal:', error);
      return null;
    }
  }, []); // Pusta zależność - konfiguracja się nie zmienia

  // Sprawdź konfigurację PayPal przy montowaniu - tylko raz
  useEffect(() => {
    if (!paypalConfig) {
      setError('Błąd konfiguracji: Nieprawidłowa konfiguracja PayPal');
      setPaypalLoading(false);
      return;
    }
    
    if (!paypalConfig['client-id']) {
      setError('Błąd konfiguracji: Brak PayPal Client ID');
      setPaypalLoading(false);
      return;
    }
    
    console.log('✅ PayPal konfiguracja załadowana:', { 
      clientId: paypalConfig['client-id'] ? 'OK' : 'BRAK',
      environment: paypalConfig.environment
    });
  }, [paypalConfig]);

  // Notification helper
  const showNotification = (message, type = 'info') => {
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
  };

  // Funkcja obsługująca płatność
  const handlePayment = async (method) => {
    // Sprawdź czy użytkownik jest zalogowany
    if (!user) {
      showNotification('❌ Musisz być zalogowany, aby wykonać płatność. Przejdź do zakładki "Konto" i zaloguj się.', 'error');
      return;
    }

    // Sprawdź czy użytkownik ma email
    if (!user.email) {
      showNotification('❌ Twoje konto nie ma przypisanego adresu email. Zaktualizuj dane w zakładce "Konto".', 'error');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    // Timeout dla żądania (2 minuty)
    const timeoutDuration = 120000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout - przerywam żądanie po', timeoutDuration, 'ms');
      controller.abort();
    }, timeoutDuration);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://losuje.pl';
      
      // Test połączenia z backendem
      console.log('🔄 Test połączenia z backendem...');
      const testResponse = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      if (!testResponse.ok) {
        throw new Error(`Backend nie odpowiada: ${testResponse.status} ${testResponse.statusText}`);
      }
      
      console.log('✅ Backend odpowiada poprawnie');
      
      const response = await fetch(`${apiUrl}/api/paypal/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPlanData.price,
          currency: 'PLN',
          description: `${selectedPlanData.name} - Lotek Generator`,
          email: user?.email || 'test@example.com',
          plan: selectedPlan
        }),
        signal: controller.signal
      });

      // Wyczyść timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Zamówienie utworzone:', result);
      
      if (result.success && result.id) {
        showNotification(`✅ Przekierowanie do płatności PayPal...`, 'success');
        
        // Przekierowanie do PayPal
        if (method === 'paypal') {
          // Dla PayPal używamy SDK do otwarcia popup
          console.log('🔗 Przekierowanie do PayPal popup...');
          console.log('🔗 Order ID:', result.id);
          // PayPal SDK automatycznie otworzy popup z płatnością
          // Zwróć orderId do PayPal SDK
          return result.id;
        } else {
          // Dla innych metod przekierowanie do strony płatności
          window.location.href = result.redirectUrl || `/payments?orderId=${result.id}`;
        }
      } else {
        throw new Error(result.error || 'Błąd tworzenia zamówienia');
      }
      
    } catch (error) {
      // Wyczyść timeout
      clearTimeout(timeoutId);
      
      console.error('❌ Błąd płatności:', error);
      
      // Sprawdź typ błędu
      if (error.name === 'AbortError') {
        setError('Timeout - Backend nie odpowiada po 2 minutach. Sprawdź czy backend jest uruchomiony na porcie 3001');
        showNotification('❌ Timeout - Backend nie odpowiada', 'error');
      } else if (error.message.includes('Failed to fetch')) {
        setError('Brak połączenia z backendem. Sprawdź czy backend jest uruchomiony na porcie 3001');
        showNotification('❌ Brak połączenia z backendem', 'error');
      } else {
        setError('Błąd płatności: ' + error.message);
        showNotification('❌ Błąd płatności', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handlery dla PayPal
  const handlePayPalSuccess = (details) => {
    console.log('✅ PayPal payment success:', details);
    showNotification(`✅ Płatność PayPal zrealizowana pomyślnie! ${selectedPlanData.name}`, 'success');
    window.location.href = `/payments?status=success&method=paypal&amount=${selectedPlanData.price}&plan=${selectedPlan}`;
  };

  const handlePayPalError = (error) => {
    console.error('❌ PayPal error:', error);
    showNotification('❌ Błąd płatności PayPal', 'error');
  };

  const handlePayPalCancel = (data) => {
    console.log('❌ PayPal payment cancelled:', data);
    showNotification('❌ Płatność PayPal anulowana', 'error');
  };

  const handlePayPalInit = () => {
    console.log('✅ PayPal SDK załadowany');
    setPaypalLoading(false);
    setError(null);
    setPaypalInitialized(true);
    paypalSdkLoaded.current = true;
  };

  // Sprawdź połączenie internetowe
  const checkInternetConnection = () => {
    if (!navigator.onLine) {
      setError('Brak połączenia internetowego');
      setPaypalLoading(false);
      return false;
    }
    return true;
  };

  // Sprawdź połączenie przy montowaniu - tylko raz
  useEffect(() => {
    if (!checkInternetConnection()) return;
    
    // Sprawdź status backendu
    const checkBackendStatus = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'https://losuje.pl';
        const response = await fetch(`${apiUrl}/api/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          setBackendStatus('connected');
          setError(null);
        } else {
          setBackendStatus('error');
          setError('Backend nie odpowiada poprawnie');
        }
      } catch (error) {
        setBackendStatus('error');
        setError('Brak połączenia z backendem');
      }
    };
    
    checkBackendStatus();
    
    // Sprawdź ponownie przy zmianie stanu połączenia
    const handleOnline = () => {
      setError(null);
      checkBackendStatus();
    };
    
    const handleOffline = () => {
      setError('Brak połączenia internetowego');
      setPaypalLoading(false);
      setBackendStatus('error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Jeśli brak konfiguracji PayPal, pokaż błąd
  if (!paypalConfig || !paypalConfig['client-id']) {
    return (
      <div className="payment-container w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto p-4 sm:p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          <strong>Błąd konfiguracji:</strong> Brak PayPal Client ID. Sprawdź plik mcp.json
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto p-4 sm:p-6 overflow-hidden">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
        Plany Premium
      </h2>
      
      {/* Status połączenia */}
      <div className="mb-4 text-center">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          backendStatus === 'connected' ? 'bg-green-100 text-green-800' :
          backendStatus === 'error' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          <span className={`w-2 h-2 rounded-full mr-2 ${
            backendStatus === 'connected' ? 'bg-green-500' :
            backendStatus === 'error' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}></span>
          {backendStatus === 'connected' ? '✅ Backend połączony' :
           backendStatus === 'error' ? '❌ Brak połączenia z backendem' :
           '⏳ Sprawdzanie połączenia...'}
        </div>
      </div>

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
            
            {paypalLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 text-sm">Ładowanie PayPal...</span>
              </div>
            )}
            
            <div className="paypal-container w-full overflow-x-auto" ref={paypalContainerRef}>
              <PayPalButtonWrapper
                amount={selectedPlanData.price}
                currency="PLN"
                description={`${selectedPlanData.name} - Lotek Generator`}
                email={user?.email || 'test@example.com'}
                plan={selectedPlan}
                onSuccess={handlePayPalSuccess}
                onError={handlePayPalError}
                onCancel={handlePayPalCancel}
                                  onInit={() => {
                    console.log('✅ PayPal SDK załadowany w PaymentButtons komponencie');
                    handlePayPalInit();
                  }}
              />
              
              {/* Pokaż status PayPal tylko jeśli SDK zostało załadowane */}
              {paypalSdkLoaded.current && paypalInitialized && (
                <div className="text-center py-4">
                  <div className="text-green-600 text-sm font-medium">
                    ✅ PayPal gotowy do płatności
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Przycisk Płać - główny */}
        <button
          onClick={() => handlePayment('manual')}
          disabled={isProcessing}
          className={`w-full max-w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base lg:text-lg transition-all duration-200 ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span className="truncate">Przetwarzanie...</span>
            </div>
          ) : (
            <span className="truncate">💳 Zapłać {selectedPlanData.price} PLN</span>
          )}
        </button>

        {/* Informacje dodatkowe */}
        <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600 space-y-1">
          <p>🔒 Bezpieczne płatności przez PayPal</p>
          <p>📧 Potwierdzenie zostanie wysłane na: {user?.email || 'Twój email'}</p>
          <p>🔄 Możesz anulować subskrypcję w dowolnym momencie</p>
          <p className="text-green-600 font-medium">✅ Tryb produkcyjny - prawdziwe płatności</p>
          {paypalSdkLoaded.current && (
            <p className="text-green-600 font-medium">✅ PayPal SDK załadowany stabilnie</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentButtons;

