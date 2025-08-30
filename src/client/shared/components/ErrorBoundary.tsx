import React from "react";

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
    // eslint-disable-next-line no-console
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
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#1b1b1b",
        color: "#fff",
        padding: "2em",
        boxSizing: "border-box",
      }}>
        <div style={{
          maxWidth: 720,
          width: "100%",
          border: "1px solid #3a3a3a",
          borderRadius: 8,
          padding: "1.5em",
          background: "#232323",
          boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontSize: "1.125em", marginBottom: "0.5em", fontWeight: 600 }}>
            Application Error
          </div>
          <div style={{ opacity: 0.85, marginBottom: "1em" }}>
            Something went wrong while rendering. You can try reloading the app.
          </div>
          {this.state.error && (
            <div style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
              fontSize: "0.875em",
              whiteSpace: "pre-wrap",
              background: "#181818",
              border: "1px solid #333",
              borderRadius: 6,
              padding: "0.75em",
              marginBottom: "1em",
            }}>
              {this.state.error?.message}
              {this.state.errorInfo?.componentStack && (
                <div style={{ opacity: 0.7, marginTop: "0.5em" }}>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>
          )}
          <div>
            <button
              onClick={this.handleReload}
              style={{
                background: "#e53935",
                color: "#fff",
                border: 0,
                borderRadius: 6,
                padding: "0.5em 0.9em",
                fontSize: "0.95em",
                cursor: "pointer",
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      </div>
    );
  }
}

