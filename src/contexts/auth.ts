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
    if (!raw) return null;
    const user = JSON.parse(raw) as UserInfo;
    // Migrate stale data: filter out undefined/null role entries
    // (can happen when old login code mapped string roles via r.code → undefined)
    if (user.roles && user.roles.some((r) => !r)) {
      user.roles = user.roles.filter(Boolean);
      // Persist cleaned data so this only runs once
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return user;
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
  /** Switch the active role (multi-role support) */
  switchRole: (activeRole: string, permissions: string[]) => void;
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
 *
 * Backward compatibility: before init_rbac.sql migration the DB stores Chinese
 * role names (超级管理员/管理员/开发者/观察者). Map them to the new code-based
 * equivalents so every `hasRole('super_admin')` check works for legacy users too.
 */
const LEGACY_ROLE_MAP: Record<string, string[]> = {
  // init_rbac.sql 新角色名 → code（后端未部署时 API 返回中文名而非 code）
  超级管理员: ['super_admin'],
  平台运营员: ['platform_ops'],
  租户管理员: ['tenant_admin'],
  租户开发者: ['tenant_developer'],
  租户观察者: ['tenant_viewer'],
  // 更早期的旧角色名（兼容历史数据）
  管理员: ['platform_ops'],
  开发者: ['tenant_developer'],
  观察者: ['tenant_viewer'],
};

function getUserRoles(user: UserInfo | null): string[] {
  if (!user) return [];

  // When a multi-role user has selected an active role, use ONLY that role
  // for menu/permission gating so the UI reflects the current context.
  // Legacy names are still expanded for backward compatibility.
  if (user.active_role) {
    const expanded = new Set<string>([user.active_role]);
    const aliases = LEGACY_ROLE_MAP[user.active_role];
    if (aliases) aliases.forEach((a) => expanded.add(a));
    return [...expanded];
  }

  // Filter out undefined/null entries (can happen from stale localStorage after migration)
  const raw: string[] = (
    user.roles && user.roles.length > 0 ? user.roles : user.role ? [user.role] : []
  ).filter(Boolean);
  // Expand legacy names → new codes (keep originals for any code still matching on Chinese name)
  const expanded = new Set<string>();
  for (const r of raw) {
    expanded.add(r);
    const aliases = LEGACY_ROLE_MAP[r];
    if (aliases) aliases.forEach((a) => expanded.add(a));
  }
  return [...expanded];
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

  switchRole: (activeRole: string, permissions: string[]) => {
    const user = get().user;
    if (user) {
      const updated = { ...user, active_role: activeRole, permissions };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      set({ user: updated });
    }
  },
}));

// Sync auth state across tabs — when another tab logs in or out, reflect it here
window.addEventListener('storage', (e) => {
  if (e.key === TOKEN_KEY) {
    useAuthStore.getState().syncFromStorage();
  }
});

export { willExpireSoon, getUserRoles };
