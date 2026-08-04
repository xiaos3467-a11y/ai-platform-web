/** Auth state management */

import { create } from 'zustand';
import type { UserInfo } from '@/types';

const TOKEN_KEY = 'ai_platform_token';
const USER_KEY = 'ai_platform_user';

/** Safely parse a JWT payload without verification (client-side hint only). */
function parseJwtExpiry(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = parseJwtExpiry(token);
  if (!exp) return false; // Non-JWT token — let server decide
  return exp < Date.now() / 1000 - 30; // 30s clock skew
}

function loadStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  /** Re-read auth state from storage (e.g. after another tab logs out) */
  syncFromStorage: () => void;
}

const initialToken = localStorage.getItem(TOKEN_KEY);
const initialValid = !!initialToken && !isTokenExpired(initialToken);
if (initialToken && !initialValid) {
  // Clean up expired token on app load
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: initialValid ? loadStoredUser() : null,
  token: initialValid ? initialToken : null,
  isAuthenticated: initialValid,

  login: (token: string, user: UserInfo) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  syncFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const valid = !!token && !isTokenExpired(token);
    if (!valid) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    } else {
      set({ token, user: loadStoredUser(), isAuthenticated: true });
    }
  },
}));
