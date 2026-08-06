/**
 * Login page — form submission and navigation tests.
 *
 * Covers:
 *   1. Renders username/password fields and submit button.
 *   2. Submitting empty form shows validation error.
 *   3. Successful login stores token/user and navigates to "/".
 *   4. Failed login (401) does not navigate.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { resetAuthStore } from '@/test/utils';

// Mock the api client
vi.mock('@/api/client', () => ({
  api: {
    post: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  resetAuthStore();
});

/**
 * Helper: find the login submit button element.
 * antd Button renders "登录" with an internal space as "登 录",
 * so we match with a regex that tolerates optional whitespace.
 * Returns the <button> element (not the inner text span).
 */
function getLoginButton(): HTMLElement {
  const textEl = screen.getByText(/登\s*录/);
  return textEl.closest('button') ?? textEl;
}

describe('LoginPage', () => {
  it('renders title and form fields', async () => {
    const LoginPage = (await import('@/pages/Login')).default;
    render(<LoginPage />, { routerProps: { initialEntries: ['/login'] } });

    expect(screen.getByText('AI 中台')).toBeInTheDocument();
    expect(screen.getByText('用户名')).toBeInTheDocument();
    expect(screen.getByText('密码')).toBeInTheDocument();
    expect(screen.getByText(/登\s*录/)).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const LoginPage = (await import('@/pages/Login')).default;
    const user = userEvent.setup();
    render(<LoginPage />, { routerProps: { initialEntries: ['/login'] } });

    await user.click(getLoginButton());

    // antd form validation messages
    await waitFor(() => {
      expect(screen.getByText('请输入用户名')).toBeInTheDocument();
    });
  });

  it('calls api.post with credentials on successful submit', async () => {
    const { api } = await import('@/api/client');
    vi.mocked(api.post).mockResolvedValue({
      code: 0,
      message: 'ok',
      data: {
        token: 'jwt-token-123',
        refresh_token: 'refresh-token-123',
        expires_in: 1800,
        user: {
          id: 'u1',
          username: 'admin',
          tenant_id: 't1',
          roles: [{ id: 'r1', name: 'admin' }],
        },
      },
    });

    const LoginPage = (await import('@/pages/Login')).default;
    const user = userEvent.setup();
    render(<LoginPage />, { routerProps: { initialEntries: ['/login'] } });

    await user.type(screen.getByPlaceholderText('输入用户名'), 'admin');
    await user.type(screen.getByPlaceholderText('输入密码'), 'password123');
    await user.click(getLoginButton());

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'admin',
        password: 'password123',
      });
    });

    // Verify auth store was updated
    const { useAuthStore } = await import('@/contexts/auth');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().token).toBe('jwt-token-123');
    expect(useAuthStore.getState().user?.role).toBe('admin');

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('does not navigate on failed login', async () => {
    const { api } = await import('@/api/client');
    vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'));

    const LoginPage = (await import('@/pages/Login')).default;
    const user = userEvent.setup();
    render(<LoginPage />, { routerProps: { initialEntries: ['/login'] } });

    await user.type(screen.getByPlaceholderText('输入用户名'), 'admin');
    await user.type(screen.getByPlaceholderText('输入密码'), 'wrong');
    await user.click(getLoginButton());

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    // Should NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders footer version text', async () => {
    const LoginPage = (await import('@/pages/Login')).default;
    render(<LoginPage />, { routerProps: { initialEntries: ['/login'] } });

    expect(screen.getByText(/AI Platform v0.1.0/)).toBeInTheDocument();
  });

  it('disables submit button while submitting', async () => {
    const { api } = await import('@/api/client');
    // Make the API call hang
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolvePromise: (v: any) => void = () => {};
    vi.mocked(api.post).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const LoginPage = (await import('@/pages/Login')).default;
    const user = userEvent.setup();
    render(<LoginPage />, { routerProps: { initialEntries: ['/login'] } });

    await user.type(screen.getByPlaceholderText('输入用户名'), 'admin');
    await user.type(screen.getByPlaceholderText('输入密码'), 'password');
    await user.click(getLoginButton());

    // Button should be in loading state — antd adds ant-btn-loading class
    await waitFor(() => {
      const btn = getLoginButton();
      expect(btn.className).toContain('ant-btn-loading');
    });

    // Resolve the promise to cleanup
    resolvePromise!({
      code: 0,
      message: '',
      data: {
        token: 'tok',
        refresh_token: 'rtok',
        expires_in: 1800,
        user: { id: 'u1', username: 'admin', tenant_id: 't1' },
      },
    });
  });
});
