/**
 * ErrorBoundary — catches render errors and shows ErrorState fullscreen.
 */

import React from 'react';
import { captureError } from '@/lib/sentry';
import ErrorState from './ErrorState';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);

    // Report to Sentry
    captureError(error, {
      componentStack: errorInfo.componentStack,
      boundary: 'RootErrorBoundary',
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState error={this.state.error ?? new Error('Unknown error')} variant="fullscreen" />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
