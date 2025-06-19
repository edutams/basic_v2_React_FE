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
    console.error("❌ Uncaught error (React lifecycle):", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    try {
      if (this.state.hasError) {
        return (
          <div style={{ padding: '2rem', color: 'red' }}>
            <h2>Something went wrong.</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={this.handleReset} style={{ marginTop: '1rem' }}>
              Try Again
            </button>
          </div>
        );
      }

      return this.props.children;
    } catch (error) {
      console.error("❌ Caught error during render:", error);
      return (
        <div style={{ padding: '2rem', color: 'red' }}>
          <h2>Render failure.</h2>
          <p>{error.message}</p>
        </div>
      );
    }
  }
}

export default ErrorBoundary;
