/** Auth state management */

import { create } from 'zustand';
import type { UserInfo } from '@/types';
import { setSentryUser } from '@/lib/sentry';

const TOKEN_KEY = 'ai_platform_token';
const REFRESH_KEY = 'ai_platform_refresh_token';
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

/** Check if token will expire soon (within threshold seconds). */
function willExpireSoon(token: string, thresholdSeconds = 120): boolean {
  const exp = parseJwtExpiry(token);
  if (!exp) return false;
  return exp < Date.now() / 1000 + thresholdSeconds;
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
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: UserInfo) => void;
  logout: () => void;
  /** Update tokens after a silent refresh */
  updateTokens: (token: string, refreshToken: string) => void;
  /** Re-read auth state from storage (e.g. after another tab logs out) */
  syncFromStorage: () => void;
  /** Get current refresh token */
  getRefreshToken: () => string | null;
  /** Check if user has any of the given roles */
  hasRole: (role: string) => boolean;
  /** Check if user has a specific permission */
  hasPermission: (permission: string) => boolean;
}

const initialToken = localStorage.getItem(TOKEN_KEY);
const initialRefresh = localStorage.getItem(REFRESH_KEY);
const initialValid = !!initialToken && !isTokenExpired(initialToken);
if (initialToken && !initialValid) {
  // Clean up expired token on app load
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Compute the effective roles array for a user.
 * Supports both legacy single-role (`role`) and new multi-role (`roles[]`) formats.
 */
function getUserRoles(user: UserInfo | null): string[] {
  if (!user) return [];
  if (user.roles && user.roles.length > 0) return user.roles;
  if (user.role) return [user.role];
  return [];
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialValid ? loadStoredUser() : null,
  token: initialValid ? initialToken : null,
  refreshToken: initialRefresh,
  isAuthenticated: initialValid,

  login: (token: string, refreshToken: string, user: UserInfo) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, refreshToken, user, isAuthenticated: true });
    // Track user in Sentry for error attribution
    setSentryUser({ id: user.id, username: user.username, tenant_id: user.tenant_id });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
    // Clear Sentry user context
    setSentryUser(null);
  },

  updateTokens: (token: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    set({ token, refreshToken });
  },

  getRefreshToken: () => get().refreshToken ?? localStorage.getItem(REFRESH_KEY),

  syncFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);
    const valid = !!token && !isTokenExpired(token);
    if (!valid) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
    } else {
      set({ token, refreshToken: refresh, user: loadStoredUser(), isAuthenticated: true });
    }
  },

  hasRole: (role: string) => {
    const user = get().user;
    const roles = getUserRoles(user);
    return roles.includes(role);
  },

  hasPermission: (permission: string) => {
    const user = get().user;
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  },
}));

// Sync auth state across tabs — when another tab logs in or out, reflect it here
window.addEventListener('storage', (e) => {
  if (e.key === TOKEN_KEY) {
    useAuthStore.getState().syncFromStorage();
  }
});

export { willExpireSoon, getUserRoles };
