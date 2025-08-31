import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';

const PayPalButtonWrapper = ({ 
  amount, 
  currency = 'PLN', 
  description, 
  email, 
  plan, 
  onSuccess, 
  onError, 
  onCancel,
  onInit,
  style = {}
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const buttonRef = useRef(null);
  
  // Memoizuj style przycisku
  const buttonStyle = useMemo(() => ({
    layout: "vertical", 
    color: "blue", 
    shape: "rect",
    label: "pay",
    width: "100%",
    minWidth: "200px",
    ...style
  }), [style]);

  // Sprawdź czy komponent jest już zamontowany
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleInit = (data, actions) => {
    if (!isMounted.current) return;
    
    console.log('✅ PayPal Button załadowany');
    console.log('PayPal environment:', data?.env || 'unknown');
    console.log('PayPal client ID:', data?.clientId || 'unknown');
    console.log('PayPal data:', data);
    
    // Sprawdź czy środowisko jest poprawne
    if (data?.env && data.env !== 'live') {
      console.warn('⚠️ PayPal environment mismatch:', data.env, 'expected: live');
    }
    
    setIsInitialized(true);
    setHasError(false);
    
    // Wywołaj callback onInit jeśli jest dostępny
    if (onInit) {
      onInit();
    }
  };

  const handleCreateOrder = (data, actions) => {
    // W produkcji użyj bezpośredniego URL funkcji jako fallback
    const apiUrl = process.env.NODE_ENV === 'development' ? '' : 'https://us-central1-losujemy.cloudfunctions.net/api';
    console.log('🔍 PayPal Create Order API URL:', `${apiUrl}/paypal/create`);
    
    return fetch(`${apiUrl}/paypal/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        description: description,
        email: email,
        plan: plan
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((order) => {
        console.log('✅ PayPal order created:', order);
        return order.id;
      })
      .catch((error) => {
        console.error('❌ PayPal create order error:', error);
        throw error;
      });
  };

  const handleApprove = (data, actions) => {
    // W produkcji użyj bezpośredniego URL funkcji jako fallback
    const apiUrl = process.env.NODE_ENV === 'development' ? '' : 'https://us-central1-losujemy.cloudfunctions.net/api';
    console.log('🔍 PayPal Capture API URL:', `${apiUrl}/paypal/capture/${data.orderID}`);
    
    return fetch(`${apiUrl}/paypal/capture/${data.orderID}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: plan
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((details) => {
        console.log("PayPal payment success:", details);
        if (onSuccess) {
          onSuccess(details);
        }
      })
      .catch((error) => {
        console.error('❌ PayPal capture error:', error);
        if (onError) {
          onError(error);
        }
      });
  };

  const handleCancel = (data) => {
    console.log('❌ PayPal payment cancelled:', data);
    if (onCancel) {
      onCancel(data);
    }
  };

  const handleError = (err) => {
    console.error('PayPal error:', err);
    console.error('PayPal error details:', {
      message: err.message,
      stack: err.stack,
      details: err.details,
      name: err.name,
      code: err.code
    });
    
    // Sprawdź czy to błąd sesji - ignoruj te błędy
    if (err.message && (err.message.includes('global_session_not_found') || err.message.includes('session'))) {
      console.log('🔄 Wykryto błąd sesji PayPal - ignorowanie...');
      console.log('PayPal environment:', err.env || 'unknown');
      console.log('PayPal client ID:', err.clientId || 'unknown');
      
      // Nie pokazuj błędu użytkownikowi dla błędów sesji
      // PayPal SDK sam się naprawi
      return;
    } else if (err.message && err.message.includes('timeout')) {
      console.error('Timeout - PayPal nie odpowiada. Sprawdź połączenie internetowe.');
    } else if (err.message && err.message.includes('network')) {
      console.error('Błąd sieci - sprawdź połączenie internetowe.');
    } else if (err.message && err.message.includes('sandbox')) {
      // Ignoruj błędy związane z sandbox - to może być problem z konfiguracją
      console.log('🔄 Ignorowanie błędu sandbox - używamy live environment');
      return;
    } else {
      console.error('Błąd PayPal: ' + err.message);
    }
    
    setHasError(true);
    if (onError) {
      onError(err);
    }
  };

  // Jeśli wystąpił błąd, nie renderuj przycisku
  if (hasError) {
    return (
      <div className="text-center py-4">
        <div className="text-red-600 text-sm font-medium">
          ❌ Błąd PayPal - spróbuj odświeżyć stronę
        </div>
      </div>
    );
  }

  return (
    <div ref={buttonRef} className="paypal-button-wrapper">
      <PayPalButtons
        style={buttonStyle}
        onInit={handleInit}
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
        onCancel={handleCancel}
        onError={handleError}
      />
      
      {/* Status inicjalizacji */}
      {isInitialized && (
        <div className="text-center py-2">
          <div className="text-green-600 text-xs font-medium">
            ✅ PayPal gotowy
          </div>
        </div>
      )}
    </div>
  );
};

export default PayPalButtonWrapper;
