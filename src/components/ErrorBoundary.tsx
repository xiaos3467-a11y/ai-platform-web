/**
 * ErrorBoundary — catches render errors and shows ErrorState fullscreen.
 * Automatically reloads on chunk loading failures (Vercel deployment).
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

const CHUNK_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'Loading chunk',
  'Loading CSS chunk',
];

function isChunkLoadingError(error: Error): boolean {
  const msg = error.message || '';
  return CHUNK_ERROR_PATTERNS.some((pattern) => msg.includes(pattern));
}

function shouldRetryReload(): boolean {
  // Prevent infinite reload loops
  const key = 'chunk_reload_count';
  const count = parseInt(sessionStorage.getItem(key) || '0', 10);
  if (count >= 2) return false; // Give up after 2 attempts
  sessionStorage.setItem(key, String(count + 1));
  return true;
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

    // If chunk loading error, reload page instead of showing error screen
    if (isChunkLoadingError(error)) {
      if (shouldRetryReload()) {
        console.warn('[ErrorBoundary] Chunk loading failed, reloading page...');
        window.location.reload();
        return; // Don't render error state
      } else {
        console.error('[ErrorBoundary] Chunk reload failed twice, showing error');
      }
    }

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
