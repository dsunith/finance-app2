import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI subtree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="error-fallback-card">
          <h3>Something went wrong rendering this section</h3>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            className="btn-retry"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry Section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
