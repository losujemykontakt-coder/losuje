import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const GooglePlayPayments = ({ user, subscription, paymentHistory, onClose, onSubscriptionUpdate }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const plans = [
    {
      id: 'premium_monthly',
      name: 'Premium Miesięczny',
      price: '9.99 zł',
      period: 'miesiąc',
      features: [
        '🚀 AI Generator Ultra Pro',
        '🎵 Analizator Harmoniczny',
        '🎲 Generator Schonheim',
        '✨ System Talizmanów',
        '📈 Zaawansowane statystyki',
        '🎰 Wszystkie gry lotto'
      ]
    },
    {
      id: 'premium_yearly',
      name: 'Premium Roczny',
      price: '59.90 zł',
      period: 'rok',
      savings: '59.88 zł',
      features: [
        '🚀 AI Generator Ultra Pro',
        '🎵 Analizator Harmoniczny',
        '🎲 Generator Schonheim',
        '✨ System Talizmanów',
        '📈 Zaawansowane statystyki',
        '🎰 Wszystkie gry lotto',
        '💎 6 miesięcy gratis!'
      ]
    }
  ];

  const handlePurchase = async (planId) => {
    setLoading(true);
    setMessage('');

    try {
      console.log('🛒 Próba zakupu planu:', planId);
      
      // Symulacja zakupu Google Play
      const purchaseToken = 'simulated_' + Date.now();
      const orderId = 'order_' + Date.now();
      
      // Weryfikacja zakupu na backend
      const response = await fetch('/api/google-play/verify-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          purchaseToken,
          productId: planId,
          orderId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage('✅ Zakup udany! Twoja subskrypcja została aktywowana.');
        
        // Aktualizacja subskrypcji
        if (onSubscriptionUpdate) {
          onSubscriptionUpdate({
            status: 'active',
            plan: planId,
            startDate: new Date().toISOString(),
            endDate: planId === 'premium_monthly' 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      } else {
        throw new Error(result.error || 'Błąd weryfikacji zakupu');
      }
    } catch (error) {
      console.error('❌ Błąd zakupu:', error);
      setMessage('❌ Błąd podczas zakupu. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Czy na pewno chcesz anulować subskrypcję?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Tutaj będzie integracja z Google Play Billing
      console.log('❌ Anulowanie subskrypcji');
      
      // Symulacja anulowania
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('✅ Subskrypcja została anulowana.');
      
      if (onSubscriptionUpdate) {
        onSubscriptionUpdate(null);
      }
    } catch (error) {
      console.error('❌ Błąd anulowania:', error);
      setMessage('❌ Błąd podczas anulowania subskrypcji.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee'
      }}>
        <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
          💳 Płatności i Subskrypcja
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            padding: '5px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* Current Subscription */}
      {subscription && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            📋 Twoja Subskrypcja
          </h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Status:</span>
              <span style={{ 
                color: subscription.status === 'active' ? '#28a745' : '#dc3545',
                fontWeight: 'bold'
              }}>
                {subscription.status === 'active' ? 'Aktywna' : 'Nieaktywna'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Plan:</span>
              <span>{subscription.plan === 'premium_monthly' ? 'Premium Miesięczny' : 'Premium Roczny'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Data rozpoczęcia:</span>
              <span>{formatDate(subscription.startDate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Data zakończenia:</span>
              <span>{formatDate(subscription.endDate)}</span>
            </div>
          </div>
          
          {subscription.status === 'active' && (
            <button
              onClick={handleCancelSubscription}
              disabled={loading}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                marginTop: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Anulowanie...' : 'Anuluj Subskrypcję'}
            </button>
          )}
        </div>
      )}

      {/* Available Plans */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
          🎯 Dostępne Plany
        </h3>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{
              border: '2px solid #e9ecef',
              borderRadius: '12px',
              padding: '25px',
              position: 'relative',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              ':hover': {
                borderColor: '#007bff',
                transform: 'translateY(-2px)'
              }
            }}>
              {plan.savings && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  background: '#28a745',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  Oszczędź {plan.savings}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, fontSize: '20px', color: '#333' }}>
                  {plan.name}
                </h4>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                    {plan.price}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    na {plan.period}
                  </div>
                </div>
              </div>
              
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: '0 0 20px 0',
                display: 'grid',
                gap: '8px'
              }}>
                {plan.features.map((feature, index) => (
                  <li key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={loading || (subscription && subscription.status === 'active')}
                style={{
                  width: '100%',
                  background: subscription && subscription.status === 'active' 
                    ? '#6c757d' 
                    : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: subscription && subscription.status === 'active' ? 'not-allowed' : 'pointer',
                  opacity: loading || (subscription && subscription.status === 'active') ? 0.6 : 1
                }}
              >
                {loading ? 'Przetwarzanie...' : 
                 subscription && subscription.status === 'active' ? 'Subskrypcja Aktywna' : 
                 `Wybierz ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      {paymentHistory && paymentHistory.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
            📊 Historia Płatności
          </h3>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {paymentHistory.map((payment, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                borderBottom: index < paymentHistory.length - 1 ? '1px solid #e9ecef' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    {payment.plan === 'premium_monthly' ? 'Premium Miesięczny' : 'Premium Roczny'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {formatDate(payment.date)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                    {payment.amount}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: payment.status === 'completed' ? '#28a745' : '#dc3545'
                  }}>
                    {payment.status === 'completed' ? 'Zapłacone' : 'Błąd'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{
        background: '#e7f3ff',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #b3d9ff'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>
          ℹ️ Informacje
        </h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px', 
          color: '#0056b3',
          fontSize: '14px'
        }}>
          <li>Płatności są przetwarzane przez Google Play Store</li>
          <li>Subskrypcja automatycznie się odnawia</li>
          <li>Możesz anulować subskrypcję w dowolnym momencie</li>
          <li>Wszystkie funkcje premium są dostępne natychmiast po zakupie</li>
        </ul>
      </div>
    </div>
  );
};

export default GooglePlayPayments;
