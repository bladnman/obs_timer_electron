import React from "react";
import "./ErrorBoundary.css";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You could also log to a remote error reporting service here
    // For now, keep it local for development visibility
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    // Best-effort reset: reload the window to clear state
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    // Minimal, self-contained fallback UI
    return (
      <div className="error-boundary">
        <div className="error-boundary__panel">
          <div className="error-boundary__title">Application Error</div>
          <div className="error-boundary__description">
            Something went wrong while rendering. You can try reloading the app.
          </div>
          {this.state.error && (
            <div className="error-boundary__details">
              {this.state.error?.message}
              {this.state.errorInfo?.componentStack && (
                <div className="error-boundary__stack">{this.state.errorInfo.componentStack}</div>
              )}
            </div>
          )}
          <div>
            <button
              onClick={this.handleReload}
              className="error-boundary__reload"
            >
              Reload App
            </button>
          </div>
        </div>
      </div>
    );
  }
}
