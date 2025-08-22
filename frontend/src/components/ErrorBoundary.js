import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Aktualizuje state, aby następny render pokazał fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Loguje błąd do konsoli
    console.error('🔴 ErrorBoundary złapał błąd:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Można tutaj dodać logowanie do zewnętrznego serwisu
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>
              Wystąpił błąd aplikacji
            </h1>
            <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
              Przepraszamy za niedogodności. Wystąpił nieoczekiwany błąd w aplikacji.
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginRight: '12px'
                }}
              >
                Odśwież stronę
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Wróć do strony głównej
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#495057' }}>
                  Szczegóły błędu (tylko w trybie deweloperskim)
                </summary>
                <pre style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#f1f3f4',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  color: '#d32f2f'
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;






















