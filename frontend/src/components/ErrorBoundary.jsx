import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ color: 'var(--color-blunder)' }}>Something went wrong.</h2>
          <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>
            We encountered a runtime error. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              marginTop: '20px', 
              padding: '10px 20px', 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              borderRadius: '8px' 
            }}
          >
            Refresh Page
          </button>
          {this.state.error && (
            <pre style={{ 
              marginTop: '40px', 
              textAlign: 'left', 
              fontSize: '0.8rem', 
              opacity: 0.5,
              overflowX: 'auto',
              padding: '20px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '8px'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
