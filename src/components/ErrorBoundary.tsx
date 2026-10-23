import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Crash guard: if anything throws on stage, show a one-tap reset instead of a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SunD] crash guard caught', error, info.componentStack);
  }

  reset = () => {
    try {
      localStorage.removeItem('sund-wallet-demo-v3');
    } catch {
      /* storage may be blocked; a reload still recovers */
    }
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="font-display text-[24px] font-bold">Something went wrong</div>
        <p className="text-ink-muted">The demo hit an unexpected state. Reset it to carry on from the start.</p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
          <button type="button" className="btn btn-red" onClick={this.reset}>
            Reset demo
          </button>
        </div>
      </div>
    );
  }
}
