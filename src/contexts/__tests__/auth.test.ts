/**
 * Auth store (contexts/auth.ts) — state management and JWT expiry logic.
 *
 * Covers:
 *   1. Initial state: loads token/user from localStorage on module load.
 *   2. login() persists to storage and sets state.
 *   3. logout() clears storage and state.
 *   4. syncFromStorage() reflects cross-tab changes.
 *   5. Expired token on module load triggers cleanup.
 *   6. parseJwtExpiry — non-JWT tokens are passed through.
 *   7. Storage event listener triggers syncFromStorage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeJwt, mockUser, resetAuthStore } from '@/test/utils';
import { useAuthStore } from '../auth';

// We need to reset the module between tests because auth.ts has
// top-level side effects (reads localStorage once on import).
// vitest's resetModules() allows fresh import per test.

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  // Reset store state
  useAuthStore.setState({
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
});

/** Fresh import of the auth module */
async function loadAuth() {
  return import('../auth');
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useAuthStore', () => {
  describe('login', () => {
    it('stores token + refresh token + user in localStorage and state', async () => {
      const { useAuthStore: store } = await loadAuth();
      const token = 'test-token-xyz';
      const refreshToken = 'test-refresh-xyz';

      store.getState().login(token, refreshToken, mockUser);

      expect(store.getState().token).toBe(token);
      expect(store.getState().refreshToken).toBe(refreshToken);
      expect(store.getState().user).toEqual(mockUser);
      expect(store.getState().isAuthenticated).toBe(true);

      expect(localStorage.getItem('ai_platform_token')).toBe(token);
      expect(localStorage.getItem('ai_platform_refresh_token')).toBe(refreshToken);
      expect(JSON.parse(localStorage.getItem('ai_platform_user')!)).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('clears token + refresh token + user from localStorage and state', async () => {
      const { useAuthStore: store } = await loadAuth();
      store.getState().login('tok', 'rtok', mockUser);
      expect(store.getState().isAuthenticated).toBe(true);

      store.getState().logout();

      expect(store.getState().token).toBeNull();
      expect(store.getState().refreshToken).toBeNull();
      expect(store.getState().user).toBeNull();
      expect(store.getState().isAuthenticated).toBe(false);

      expect(localStorage.getItem('ai_platform_token')).toBeNull();
      expect(localStorage.getItem('ai_platform_refresh_token')).toBeNull();
      expect(localStorage.getItem('ai_platform_user')).toBeNull();
    });
  });

  describe('syncFromStorage', () => {
    it('restores auth when another tab stored a valid token', async () => {
      const { useAuthStore: store } = await loadAuth();
      // Simulate another tab logging in
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = makeJwt({ exp: futureExp, sub: mockUser.id });
      localStorage.setItem('ai_platform_token', token);
      localStorage.setItem('ai_platform_user', JSON.stringify(mockUser));

      store.getState().syncFromStorage();

      expect(store.getState().isAuthenticated).toBe(true);
      expect(store.getState().token).toBe(token);
    });

    it('clears auth when another tab removed the token', async () => {
      const { useAuthStore: store } = await loadAuth();
      store.getState().login('tok', 'rtok', mockUser);

      // Simulate another tab logging out
      localStorage.removeItem('ai_platform_token');
      localStorage.removeItem('ai_platform_user');

      store.getState().syncFromStorage();

      expect(store.getState().isAuthenticated).toBe(false);
      expect(store.getState().token).toBeNull();
    });

    it('clears auth when token is expired', async () => {
      const { useAuthStore: store } = await loadAuth();
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const token = makeJwt({ exp: pastExp });
      localStorage.setItem('ai_platform_token', token);

      store.getState().syncFromStorage();

      expect(store.getState().isAuthenticated).toBe(false);
      expect(localStorage.getItem('ai_platform_token')).toBeNull();
    });
  });

  describe('JWT expiry handling', () => {
    it('valid JWT (future exp) — user stays logged in', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = makeJwt({ exp: futureExp, sub: 'u1' });
      localStorage.setItem('ai_platform_token', token);
      localStorage.setItem('ai_platform_user', JSON.stringify(mockUser));

      const { useAuthStore: store } = await loadAuth();

      expect(store.getState().isAuthenticated).toBe(true);
      expect(store.getState().token).toBe(token);
    });

    it('expired JWT (past exp) — user logged out, storage cleaned', async () => {
      const pastExp = Math.floor(Date.now() / 1000) - 60;
      const token = makeJwt({ exp: pastExp });
      localStorage.setItem('ai_platform_token', token);
      localStorage.setItem('ai_platform_user', JSON.stringify(mockUser));

      const { useAuthStore: store } = await loadAuth();

      expect(store.getState().isAuthenticated).toBe(false);
      expect(store.getState().token).toBeNull();
      expect(localStorage.getItem('ai_platform_token')).toBeNull();
      expect(localStorage.getItem('ai_platform_user')).toBeNull();
    });

    it('non-JWT token (not 3 parts) — treated as valid, server decides', async () => {
      localStorage.setItem('ai_platform_token', 'opaque-token');
      localStorage.setItem('ai_platform_user', JSON.stringify(mockUser));

      const { useAuthStore: store } = await loadAuth();

      // Non-JWT tokens are NOT expired by client — server will validate
      expect(store.getState().isAuthenticated).toBe(true);
    });

    it('token within 30s clock skew grace period is still valid', async () => {
      // exp = now - 15 seconds → within 30s grace, should be valid
      const exp = Math.floor(Date.now() / 1000) - 15;
      const token = makeJwt({ exp });
      localStorage.setItem('ai_platform_token', token);
      localStorage.setItem('ai_platform_user', JSON.stringify(mockUser));

      const { useAuthStore: store } = await loadAuth();

      expect(store.getState().isAuthenticated).toBe(true);
    });

    it('token past 30s clock skew is expired', async () => {
      // exp = now - 60 seconds → past 30s grace, should be invalid
      const exp = Math.floor(Date.now() / 1000) - 60;
      const token = makeJwt({ exp });
      localStorage.setItem('ai_platform_token', token);

      const { useAuthStore: store } = await loadAuth();

      expect(store.getState().isAuthenticated).toBe(false);
    });
  });

  describe('storage event listener', () => {
    it('syncs when TOKEN_KEY storage event fires', async () => {
      const { useAuthStore: store } = await loadAuth();
      const syncSpy = vi.spyOn(store.getState(), 'syncFromStorage');

      // Dispatch storage event
      const event = new StorageEvent('storage', {
        key: 'ai_platform_token',
        newValue: null,
      });
      window.dispatchEvent(event);

      expect(syncSpy).toHaveBeenCalled();
    });

    it('ignores storage events for other keys', async () => {
      const { useAuthStore: store } = await loadAuth();
      const syncSpy = vi.spyOn(store.getState(), 'syncFromStorage');

      const event = new StorageEvent('storage', {
        key: 'some_other_key',
      });
      window.dispatchEvent(event);

      expect(syncSpy).not.toHaveBeenCalled();
    });
  });
});

describe('resetAuthStore helper', () => {
  it('clears to unauthenticated state when called with no args', () => {
    useAuthStore.setState({ token: 'x', user: mockUser, isAuthenticated: true });
    localStorage.setItem('ai_platform_token', 'x');

    resetAuthStore();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem('ai_platform_token')).toBeNull();
  });

  it('sets authenticated state when called with auth', () => {
    resetAuthStore({ token: 'abc', user: mockUser });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().token).toBe('abc');
    expect(localStorage.getItem('ai_platform_token')).toBe('abc');
  });
});
