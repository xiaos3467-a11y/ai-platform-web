/**
 * Test utilities — custom render with all the providers components expect.
 *
 * Components use:
 *   - react-router-dom (useNavigate, useLocation)
 *   - antd App context (App.useApp() for message/modal)
 *   - zustand auth store (useAuthStore)
 *   - theme context (useTheme)
 *
 * We wrap renders with the minimum providers required and expose
 * helpers for resetting state between tests.
 */

import React, { type ReactElement } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { App as AntdApp, ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/contexts/auth';
import type { UserInfo } from '@/types';

// Shared test query client — isolated per test via wrapper
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

/* ── Auth store helpers ─────────────────────────────────────────── */

/**
 * Reset the zustand auth store to a clean unauthenticated state.
 * Also clears localStorage to avoid leaking state between tests.
 */
export function resetAuthStore(auth?: { token: string; refreshToken?: string; user: UserInfo }) {
  // Clear localStorage
  localStorage.removeItem('ai_platform_token');
  localStorage.removeItem('ai_platform_refresh_token');
  localStorage.removeItem('ai_platform_user');

  if (auth) {
    const refreshToken = auth.refreshToken ?? 'test-refresh-token';
    useAuthStore.setState({
      token: auth.token,
      refreshToken,
      user: auth.user,
      isAuthenticated: true,
    });
    localStorage.setItem('ai_platform_token', auth.token);
    localStorage.setItem('ai_platform_refresh_token', refreshToken);
    localStorage.setItem('ai_platform_user', JSON.stringify(auth.user));
  } else {
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  }
}

/** Sample user fixture used by most tests */
export const mockUser: UserInfo = {
  id: 'user-001',
  username: 'tester',
  tenant_id: 'tenant-001',
  role: 'super_admin',
  roles: ['super_admin'],
};

/** Generate a fake but structurally valid JWT (HS256, unsigned) */
export function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  // Fake signature — the client does NOT verify, only decodes
  const sig = btoa('fake-signature');
  return `${header}.${body}.${sig}`;
}

/* ── Provider wrapper ───────────────────────────────────────────── */

interface WrapperOptions {
  routerProps?: MemoryRouterProps;
  auth?: { token: string; user: UserInfo } | null;
}

function createWrapper(options: WrapperOptions = {}) {
  const { routerProps, auth } = options;

  // Reset auth state before mounting
  if (auth === null) {
    resetAuthStore();
  } else if (auth) {
    resetAuthStore(auth);
  }

  // Fresh query client per render to avoid cache leakage between tests
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter {...routerProps}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#0a84ff',
              },
            }}
          >
            <AntdApp>{children}</AntdApp>
          </ConfigProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

/* ── Custom render ──────────────────────────────────────────────── */

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
  auth?: { token: string; user: UserInfo } | null;
}

/**
 * render() with all providers baked in.
 *
 * @example
 *   render(<StatCard title="Total" value={100} ... />)
 *   render(<Dashboard />, { auth: { token: '...', user: mockUser } })
 *   render(<Login />, { routerProps: { initialEntries: ['/login'] } })
 */
export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {},
): RenderResult & { router: { currentPath: () => string } } {
  const { routerProps, auth, ...rest } = options;

  const result = render(ui, {
    wrapper: createWrapper({ routerProps, auth }),
    ...rest,
  });

  // Expose current path for route-assertion helpers
  const router = {
    currentPath: () => window.location.pathname,
  };

  return { ...result, router };
}

// Re-export everything from testing-library so tests can import from one place
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override the default render
export { customRender as render };
