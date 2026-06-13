import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white" style={{ fontFamily: 'var(--font-sans, sans-serif)' }}>
          <div className="glass-card max-w-md w-full p-8 border-[rgba(220,80,60,0.3)] bg-gradient-to-br from-[rgba(30,15,15,0.9)] to-[rgba(15,10,10,0.95)] shadow-[0_10px_40px_rgba(220,80,60,0.08)] rounded-2xl text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-full bg-[rgba(220,80,60,0.1)] border border-[rgba(220,80,60,0.25)] flex items-center justify-center text-[rgba(255,160,140,0.95)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-serif text-white mb-2">Something went wrong</h2>
              <p className="text-sm text-[rgba(255,180,160,0.7)] font-light leading-relaxed">
                An error occurred in the {this.props.componentName || 'application'} component.
              </p>
            </div>
            
            {this.state.error && (
              <div className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(220,80,60,0.15)] rounded-xl p-4 text-left overflow-x-auto max-h-40">
                <code className="text-xs text-[rgba(255,160,140,0.9)] font-mono whitespace-pre">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex gap-4 w-full mt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white border border-[rgba(255,255,255,0.15)] rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer"
              >
                Reload
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
                className="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white rounded-full hover:bg-white/90 transition-all cursor-pointer"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
