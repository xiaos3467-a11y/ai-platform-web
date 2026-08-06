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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import '@/styles/global.css';
import { ThemeProvider, useThemeTokens } from '@/contexts/theme';
import { initSentry } from '@/lib/sentry';
import '@/i18n';

// Initialize Sentry as early as possible
initSentry();

// Shared React Query client — configured once, used everywhere
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s — data stays fresh
      gcTime: 5 * 60_000, // 5min — unused queries get garbage-collected
      retry: 1,
      refetchOnWindowFocus: false,
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
