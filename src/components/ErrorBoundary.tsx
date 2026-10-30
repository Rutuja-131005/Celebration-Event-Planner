import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('[Celebration Atelier ErrorBoundary Caught]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="max-w-lg w-full bg-stone-900/90 border border-amber-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-serif">
              ✦
            </div>
            <h1 className="text-2xl font-serif font-light text-stone-100 mb-3 tracking-wide">
              Celebration Atelier Interruption
            </h1>
            <p className="text-stone-400 text-sm leading-relaxed mb-6 font-sans">
              An unexpected render anomaly occurred within the workspace. Your celebration plans,
              budgets, and vendor records remain safely persisted in the master database.
            </p>

            {this.state.error && (
              <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-3 text-left mb-6 overflow-x-auto text-xs font-mono text-red-300">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-medium text-sm rounded-lg transition-all shadow-lg shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900"
              >
                Reload Atelier Workspace
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-medium rounded-lg transition-all border border-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                Return to Overview
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
