/**
 * App entry — Apple-inspired dark theme default
 * — Neutral palette, frosted glass, generous spacing, micro-animations
 *
 * Theme tokens live in src/styles/themeTokens.ts so they can be shared
 * with the ThemeContext; ThemeProvider wires dark/light switching and
 * feeds the active token set into AntD's ConfigProvider.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { QueryClient, QueryClientProvider, keepPreviousData } from '@tanstack/react-query';
import App from './App';
import '@/styles/global.css';
import { ThemeProvider, useThemeTokens } from '@/contexts/theme';
import { initSentry } from '@/lib/sentry';
import '@/i18n';

// Initialize Sentry as early as possible
initSentry();

// ─── Global chunk loading error handler ───────────────────────────────────
// When Vercel deploys a new build, old chunk filenames are removed from the
// server. If the browser still has old HTML referencing old chunks, the
// dynamic import fails with "Failed to fetch dynamically imported module".
// Auto-reload the page (with a retry counter to prevent infinite loops).
const CHUNK_RELOAD_KEY = 'chunk_reload_count';
function isChunkError(msg: string): boolean {
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Loading chunk')
  );
}

window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason?.message || event.reason || '');
  if (isChunkError(msg)) {
    const count = parseInt(sessionStorage.getItem(CHUNK_RELOAD_KEY) || '0', 10);
    if (count < 2) {
      console.warn('[chunk] Dynamic import failed, reloading page...', count + 1);
      sessionStorage.setItem(CHUNK_RELOAD_KEY, String(count + 1));
      window.location.reload();
    }
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (isChunkError(msg)) {
    const count = parseInt(sessionStorage.getItem(CHUNK_RELOAD_KEY) || '0', 10);
    if (count < 2) {
      console.warn('[chunk] Script load error, reloading page...', count + 1);
      sessionStorage.setItem(CHUNK_RELOAD_KEY, String(count + 1));
      event.preventDefault();
      window.location.reload();
    }
  }
});

// Shared React Query client — configured once, used everywhere
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s — data stays fresh
      gcTime: 5 * 60_000, // 5min — unused queries get garbage-collected
      retry: 1,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData, // Keep previous data during route transitions
    },
  },
});

/**
 * Inner wrapper that re-renders ConfigProvider with the active token set
 * whenever the user toggles themes. Kept as a separate component so the
 * `useThemeTokens` hook can read from ThemeContext above it.
 */
const ThemeAwareConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useThemeTokens();
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeAwareConfigProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeAwareConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
