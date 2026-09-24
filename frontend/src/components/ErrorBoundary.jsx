import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production this would report to an error-tracking service.
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-6 py-20">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="text-rose-500" size={28} />
            </div>
            <h2 className="text-xl font-display font-bold">Something went wrong</h2>
            <p className="text-ink/60 dark:text-paper/60 max-w-sm">
              This part of the page hit a snag. You can try again, or head back to the homepage.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold transition-colors"
            >
              <RefreshCcw size={16} /> Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
