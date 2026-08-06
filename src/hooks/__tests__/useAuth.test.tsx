/**
 * useAuthStore hook-level tests — role/permission checks and token updates.
 *
 * The store's login/logout/sync behavior is covered in
 * src/contexts/__tests__/auth.test.ts. These tests focus on the
 * convenience methods (hasRole, hasPermission, updateTokens, getRefreshToken)
 * and the getUserRoles helper for both legacy single-role and new
 * multi-role user formats.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockUser, makeJwt } from '@/test/utils';
import { useAuthStore, getUserRoles, willExpireSoon } from '@/contexts/auth';
import type { UserInfo } from '@/types';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  useAuthStore.setState({
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
});

describe('useAuthStore.hasRole', () => {
  it('returns true when user.roles[] contains the role', () => {
    const user: UserInfo = {
      ...mockUser,
      roles: ['admin', 'developer'],
    };
    useAuthStore.setState({ user, isAuthenticated: true });

    expect(useAuthStore.getState().hasRole('admin')).toBe(true);
    expect(useAuthStore.getState().hasRole('developer')).toBe(true);
    expect(useAuthStore.getState().hasRole('viewer')).toBe(false);
  });

  it('falls back to user.role (legacy single-role format)', () => {
    const user: UserInfo = {
      ...mockUser,
      role: 'admin',
      roles: undefined,
    };
    useAuthStore.setState({ user, isAuthenticated: true });

    expect(useAuthStore.getState().hasRole('admin')).toBe(true);
    expect(useAuthStore.getState().hasRole('viewer')).toBe(false);
  });

  it('returns false when no user is logged in', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    expect(useAuthStore.getState().hasRole('admin')).toBe(false);
  });

  it('returns false when user has empty roles array', () => {
    const user: UserInfo = {
      ...mockUser,
      roles: [],
      role: '', // Legacy role cleared; relies on empty roles[]
    };
    useAuthStore.setState({ user, isAuthenticated: true });
    expect(useAuthStore.getState().hasRole('admin')).toBe(false);
  });
});

describe('useAuthStore.hasPermission', () => {
  it('returns true when permissions array includes the permission', () => {
    const user: UserInfo = {
      ...mockUser,
      permissions: ['users.read', 'users.write'],
    };
    useAuthStore.setState({ user, isAuthenticated: true });

    expect(useAuthStore.getState().hasPermission('users.read')).toBe(true);
    expect(useAuthStore.getState().hasPermission('users.write')).toBe(true);
    expect(useAuthStore.getState().hasPermission('users.delete')).toBe(false);
  });

  it('returns false when user has no permissions field', () => {
    const user: UserInfo = {
      ...mockUser,
      permissions: undefined,
    };
    useAuthStore.setState({ user, isAuthenticated: true });
    expect(useAuthStore.getState().hasPermission('users.read')).toBe(false);
  });

  it('returns false when no user is logged in', () => {
    expect(useAuthStore.getState().hasPermission('users.read')).toBe(false);
  });
});

describe('useAuthStore.updateTokens', () => {
  it('updates token and refreshToken in state and localStorage', () => {
    useAuthStore.setState({
      token: 'old-token',
      refreshToken: 'old-refresh',
      user: mockUser,
      isAuthenticated: true,
    });
    localStorage.setItem('ai_platform_token', 'old-token');
    localStorage.setItem('ai_platform_refresh_token', 'old-refresh');

    useAuthStore.getState().updateTokens('new-token', 'new-refresh');

    expect(useAuthStore.getState().token).toBe('new-token');
    expect(useAuthStore.getState().refreshToken).toBe('new-refresh');
    expect(localStorage.getItem('ai_platform_token')).toBe('new-token');
    expect(localStorage.getItem('ai_platform_refresh_token')).toBe('new-refresh');
    // User and auth state preserved
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});

describe('useAuthStore.getRefreshToken', () => {
  it('returns token from state when set', () => {
    useAuthStore.setState({ refreshToken: 'state-refresh' });
    expect(useAuthStore.getState().getRefreshToken()).toBe('state-refresh');
  });

  it('falls back to localStorage when state token is null', () => {
    localStorage.setItem('ai_platform_refresh_token', 'storage-refresh');
    useAuthStore.setState({ refreshToken: null });
    expect(useAuthStore.getState().getRefreshToken()).toBe('storage-refresh');
  });

  it('returns null when neither state nor storage has token', () => {
    useAuthStore.setState({ refreshToken: null });
    expect(useAuthStore.getState().getRefreshToken()).toBeNull();
  });
});

describe('getUserRoles helper', () => {
  it('returns user.roles when present', () => {
    const user: UserInfo = { ...mockUser, roles: ['admin', 'dev'] };
    expect(getUserRoles(user)).toEqual(['admin', 'dev']);
  });

  it('falls back to [user.role] when roles is empty', () => {
    const user: UserInfo = { ...mockUser, role: 'admin', roles: [] };
    expect(getUserRoles(user)).toEqual(['admin']);
  });

  it('falls back to [user.role] when roles is undefined', () => {
    const user: UserInfo = { ...mockUser, role: 'viewer', roles: undefined };
    expect(getUserRoles(user)).toEqual(['viewer']);
  });

  it('returns empty array when no user', () => {
    expect(getUserRoles(null)).toEqual([]);
  });

  it('returns empty array when user has no role or roles', () => {
    const user = { ...mockUser, role: '', roles: undefined } as UserInfo;
    expect(getUserRoles(user)).toEqual([]);
  });
});

describe('willExpireSoon helper', () => {
  it('returns false for non-JWT tokens', () => {
    expect(willExpireSoon('opaque-token')).toBe(false);
  });

  it('returns true when exp is within default threshold (120s)', () => {
    const exp = Math.floor(Date.now() / 1000) + 60; // 60s from now
    const token = makeJwt({ exp });
    expect(willExpireSoon(token)).toBe(true);
  });

  it('returns false when exp is well beyond threshold', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const token = makeJwt({ exp });
    expect(willExpireSoon(token)).toBe(false);
  });

  it('returns true when exp is in the past', () => {
    const exp = Math.floor(Date.now() / 1000) - 60;
    const token = makeJwt({ exp });
    expect(willExpireSoon(token)).toBe(true);
  });

  it('respects custom threshold parameter', () => {
    const exp = Math.floor(Date.now() / 1000) + 30; // 30s from now
    const token = makeJwt({ exp });
    // With default 120s threshold → true
    expect(willExpireSoon(token)).toBe(true);
    // With 10s threshold → false (30s > 10s)
    expect(willExpireSoon(token, 10)).toBe(false);
  });
});
