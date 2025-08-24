import React, { useState, useEffect } from 'react';
import googlePlayBilling from '../utils/googlePlayBilling';

const GooglePlayPayments = ({ user, onPurchaseComplete }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [coinsBalance, setCoinsBalance] = useState(0);
  const [hasPremium, setHasPremium] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const allProducts = googlePlayBilling.getAllProducts();
      setProducts(allProducts);
      setCoinsBalance(googlePlayBilling.getCoinsBalance());
      setHasPremium(googlePlayBilling.hasPremiumAccess());
    } catch (error) {
      console.error('Błąd ładowania danych płatności:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId) => {
    try {
      setPurchasing(true);
      setPurchaseStatus('purchasing');
      
      const purchase = await googlePlayBilling.purchaseProduct(productId);
      
      if (purchase.purchaseState === 'PURCHASED') {
        setPurchaseStatus('success');
        setCoinsBalance(googlePlayBilling.getCoinsBalance());
        setHasPremium(googlePlayBilling.hasPremiumAccess());
        
        if (onPurchaseComplete) {
          onPurchaseComplete(purchase);
        }
        
        // Reset status po 3 sekundach
        setTimeout(() => setPurchaseStatus(null), 3000);
      } else {
        setPurchaseStatus('failed');
      }
    } catch (error) {
      console.error('Błąd zakupu:', error);
      setPurchaseStatus('failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      await googlePlayBilling.restorePurchases();
      setCoinsBalance(googlePlayBilling.getCoinsBalance());
      setHasPremium(googlePlayBilling.hasPremiumAccess());
      setPurchaseStatus('restored');
      
      setTimeout(() => setPurchaseStatus(null), 3000);
    } catch (error) {
      console.error('Błąd przywracania zakupów:', error);
      setPurchaseStatus('restore_failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Status zakupu */}
      {purchaseStatus && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: purchaseStatus === 'success' ? '#d4edda' : 
                          purchaseStatus === 'failed' ? '#f8d7da' : '#d1ecf1',
          color: purchaseStatus === 'success' ? '#155724' : 
                 purchaseStatus === 'failed' ? '#721c24' : '#0c5460',
          border: `1px solid ${purchaseStatus === 'success' ? '#c3e6cb' : 
                              purchaseStatus === 'failed' ? '#f5c6cb' : '#bee5eb'}`
        }}>
          {purchaseStatus === 'success' && '✅ Zakup zrealizowany pomyślnie!'}
          {purchaseStatus === 'failed' && '❌ Błąd podczas zakupu. Spróbuj ponownie.'}
          {purchaseStatus === 'purchasing' && '⏳ Przetwarzanie zakupu...'}
          {purchaseStatus === 'restored' && '✅ Zakupy przywrócone pomyślnie!'}
          {purchaseStatus === 'restore_failed' && '❌ Błąd przywracania zakupów.'}
        </div>
      )}

      {/* Status użytkownika */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Status konta</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '5px 0', fontSize: '16px' }}>
              <strong>Premium:</strong> {hasPremium ? '✅ Aktywne' : '❌ Nieaktywne'}
            </p>
            <p style={{ margin: '5px 0', fontSize: '16px' }}>
              <strong>Monety:</strong> {coinsBalance} 🪙
            </p>
          </div>
          <button
            onClick={handleRestorePurchases}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'Przywracanie...' : 'Przywróć zakupy'}
          </button>
        </div>
      </div>

      {/* Subskrypcje Premium */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333', textAlign: 'center' }}>
          🎯 Subskrypcje Premium
        </h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {products.filter(p => p.type === 'subscription').map(product => (
            <div key={product.id} style={{
              backgroundColor: 'white',
              border: '2px solid #FFD700',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
              position: 'relative'
            }}>
              {product.id === 'premium_yearly' && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  OSZCZĘDNOŚĆ 40%
                </div>
              )}
              
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{product.name}</h4>
              <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                {product.description}
              </p>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '15px' }}>
                {product.price}
              </div>
              <button
                onClick={() => handlePurchase(product.id)}
                disabled={purchasing || hasPremium}
                style={{
                  padding: '12px 30px',
                  backgroundColor: hasPremium ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: (purchasing || hasPremium) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                {hasPremium ? 'Już masz Premium' : purchasing ? 'Przetwarzanie...' : 'Kup teraz'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Zakupy jednorazowe */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333', textAlign: 'center' }}>
          🪙 Monety do talizmanów
        </h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {products.filter(p => p.type === 'oneTime' && p.id.startsWith('coins_')).map(product => (
            <div key={product.id} style={{
              backgroundColor: 'white',
              border: '2px solid #17a2b8',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{product.name}</h4>
              <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                {product.description}
              </p>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8', marginBottom: '15px' }}>
                {product.price}
              </div>
              <button
                onClick={() => handlePurchase(product.id)}
                disabled={purchasing}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: purchasing ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                {purchasing ? 'Przetwarzanie...' : 'Kup monety'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Informacje o płatnościach */}
      <div style={{
        backgroundColor: '#e9ecef',
        padding: '20px',
        borderRadius: '10px',
        fontSize: '14px',
        color: '#495057'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>ℹ️ Informacje o płatnościach</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Płatności są przetwarzane przez Google Play Store</li>
          <li>Subskrypcje są automatycznie odnawiane</li>
          <li>Możesz anulować subskrypcję w ustawieniach Google Play</li>
          <li>Monety są dodawane natychmiast po zakupie</li>
          <li>Zakupy można przywrócić na nowym urządzeniu</li>
        </ul>
      </div>
    </div>
  );
};

export default GooglePlayPayments;
