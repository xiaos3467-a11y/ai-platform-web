/**
 * App.tsx — routing and ProtectedRoute guard tests.
 *
 * Strategy:
 *   - Mock lazy-loaded pages to lightweight components.
 *   - Assert ProtectedRoute redirects unauthenticated users to /login.
 *   - Assert authenticated users can access protected pages.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { mockUser, resetAuthStore } from '@/test/utils';

// Mock all lazy-loaded pages so they render instantly (no Suspense delay)
vi.mock('@/pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('@/pages/Login', () => ({ default: () => <div>Login Page</div> }));
vi.mock('@/pages/NotFound', () => ({ default: () => <div>404 Page</div> }));
vi.mock('@/pages/ModelProviders', () => ({ default: () => <div>Models Page</div> }));
vi.mock('@/pages/KnowledgeBases', () => ({ default: () => <div>Knowledge Page</div> }));
vi.mock('@/pages/Agents', () => ({ default: () => <div>Agents Page</div> }));
vi.mock('@/pages/Conversations', () => ({ default: () => <div>Conversations Page</div> }));
vi.mock('@/pages/Prompts', () => ({ default: () => <div>Prompts Page</div> }));
vi.mock('@/pages/Workflows', () => ({ default: () => <div>Workflows Page</div> }));
vi.mock('@/pages/Evaluations', () => ({ default: () => <div>Evaluations Page</div> }));
vi.mock('@/pages/Costs', () => ({ default: () => <div>Costs Page</div> }));
vi.mock('@/pages/Settings', () => ({ default: () => <div>Settings Page</div> }));
vi.mock('@/pages/Users', () => ({ default: () => <div>Users Page</div> }));
vi.mock('@/pages/Roles', () => ({ default: () => <div>Roles Page</div> }));

// Mock AppLayout to render Outlet directly
vi.mock('@/layouts/AppLayout', async () => {
  const { Outlet } = await import('react-router-dom');
  return {
    default: () => (
      <div data-testid="app-layout">
        <Outlet />
      </div>
    ),
  };
});

beforeEach(() => {
  resetAuthStore();
});

describe('App routing', () => {
  it('redirects unauthenticated user from / to /login', async () => {
    resetAuthStore(); // explicitly unauthenticated
    const App = (await import('@/App')).default;

    render(<App />, { routerProps: { initialEntries: ['/'] } });

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('shows login page directly at /login', async () => {
    const App = (await import('@/App')).default;
    render(<App />, { routerProps: { initialEntries: ['/login'] } });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders Dashboard when authenticated and at /', async () => {
    resetAuthStore({ token: 'valid', user: mockUser });
    const App = (await import('@/App')).default;

    render(<App />, { routerProps: { initialEntries: ['/'] } });

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
  });

  it('renders Models page when authenticated and at /models', async () => {
    resetAuthStore({ token: 'valid', user: mockUser });
    const App = (await import('@/App')).default;

    render(<App />, { routerProps: { initialEntries: ['/models'] } });

    await waitFor(() => {
      expect(screen.getByText('Models Page')).toBeInTheDocument();
    });
  });

  it('renders 404 for unknown paths when authenticated', async () => {
    resetAuthStore({ token: 'valid', user: mockUser });
    const App = (await import('@/App')).default;

    render(<App />, { routerProps: { initialEntries: ['/nonexistent'] } });

    expect(screen.getByText('404 Page')).toBeInTheDocument();
  });

  it('redirects unauthenticated user from /models to /login', async () => {
    resetAuthStore();
    const App = (await import('@/App')).default;

    render(<App />, { routerProps: { initialEntries: ['/models'] } });

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Models Page')).not.toBeInTheDocument();
  });
});
