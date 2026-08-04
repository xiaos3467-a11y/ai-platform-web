/**
 * Theme Context — toggles between Apple-style dark (default) and light themes
 *
 * Persists preference in localStorage; syncs a `light` class on <html>
 * so the CSS overrides in global.css kick in, and provides a mode flag
 * that components (and main.tsx's ConfigProvider) can react to.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { darkTokens, lightTokens } from '@/styles/themeTokens';

export type ThemeMode = 'light' | 'dark';

interface ThemeCtx {
  mode: ThemeMode;
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = 'ai-platform-theme';

function getInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage unavailable (SSR / privacy mode)
  }
  return 'dark';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  // Sync the html class + localStorage whenever mode changes
  useEffect(() => {
    const html = document.documentElement;
    if (mode === 'light') html.classList.add('light');
    else html.classList.remove('light');
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const toggle = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

/** Returns the AntD ConfigProvider theme object for the current mode. */
export function useThemeTokens() {
  const { mode } = useTheme();
  return mode === 'dark' ? darkTokens : lightTokens;
}

export { darkTokens, lightTokens };
