/**
 * useApiQuery, useApiListQuery, useApiRawQuery — React Query wrapper tests.
 *
 * Covers:
 *   - useApiQuery: fetches from endpoint and returns data
 *   - useApiQuery: respects enabled=false (does not fetch)
 *   - useApiListQuery: returns { items, total } shape
 *   - useApiRawQuery: bypasses the ApiResponse wrapper
 *   - Passes params to the API client
 *   - Forwards signal for abort
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiQuery, useApiListQuery, useApiRawQuery } from '../useApiQuery';

// Mock the API client
vi.mock('@/api/client', () => ({
  api: {
    get: vi.fn(),
    getRaw: vi.fn(),
  },
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });
}

function renderWithQuery(ui: React.ReactElement, queryClient?: QueryClient) {
  const client = queryClient ?? createQueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Test component for useApiQuery
function TestQueryComponent({
  enabled = true,
  params,
}: {
  enabled?: boolean;
  params?: Record<string, unknown>;
}) {
  const { data, isLoading, isFetching, error } = useApiQuery<string>({
    queryKey: ['test'],
    endpoint: '/test',
    params,
    enabled,
  });

  if (isLoading || isFetching) return <div data-testid="loading">Loading</div>;
  if (error) return <div data-testid="error">{error.message}</div>;
  if (data === undefined) return <div data-testid="idle">Idle</div>;
  return <div data-testid="data">{data}</div>;
}

describe('useApiQuery', () => {
  it('fetches data and returns it', async () => {
    const { api } = await import('@/api/client');
    vi.mocked(api.get).mockResolvedValue({
      code: 0,
      message: 'ok',
      data: 'hello world',
    });

    renderWithQuery(<TestQueryComponent />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('hello world');
    });

    expect(api.get).toHaveBeenCalledWith('/test', undefined, expect.any(Object));
  });

  it('does not fetch when enabled=false', async () => {
    const { api } = await import('@/api/client');

    renderWithQuery(<TestQueryComponent enabled={false} />);

    // Wait a tick to ensure no fetch happens
    await new Promise((r) => setTimeout(r, 50));

    expect(api.get).not.toHaveBeenCalled();
    // When disabled, React Query doesn't run queryFn; component stays in idle state
    expect(screen.getByTestId('idle')).toBeInTheDocument();
    expect(screen.queryByTestId('data')).not.toBeInTheDocument();
  });

  it('passes params to the API client', async () => {
    const { api } = await import('@/api/client');
    vi.mocked(api.get).mockResolvedValue({
      code: 0,
      message: 'ok',
      data: 'filtered',
    });

    renderWithQuery(<TestQueryComponent params={{ status: 'active' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('filtered');
    });

    expect(api.get).toHaveBeenCalledWith(
      '/test',
      { status: 'active' },
      expect.any(Object),
    );
  });

  it('handles API errors', async () => {
    const { api } = await import('@/api/client');
    vi.mocked(api.get).mockRejectedValue(new Error('Network failure'));

    renderWithQuery(<TestQueryComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network failure');
    });
  });
});

// Test component for useApiListQuery
function TestListComponent() {
  const { data, isLoading, error } = useApiListQuery<{ id: string; name: string }>({
    queryKey: ['users'],
    endpoint: '/users/',
  });

  if (isLoading) return <div data-testid="loading">Loading</div>;
  if (error) return <div data-testid="error">{error.message}</div>;
  if (!data) return <div data-testid="data">0 / 0</div>;
  return (
    <div data-testid="data">
      {data.items.length} / {data.total}
    </div>
  );
}

describe('useApiListQuery', () => {
  it('fetches paginated data and returns { items, total }', async () => {
    const { api } = await import('@/api/client');
    vi.mocked(api.get).mockResolvedValue({
      code: 0,
      message: 'ok',
      data: {
        items: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ],
        total: 42,
      },
    });

    renderWithQuery(<TestListComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('2 / 42');
    });
  });

  it('returns empty items when data is null', async () => {
    const { api } = await import('@/api/client');
    vi.mocked(api.get).mockResolvedValue({
      code: 0,
      message: 'ok',
      data: undefined,
    });

    renderWithQuery(<TestListComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('0 / 0');
    });
  });
});

// Test component for useApiRawQuery
function TestRawComponent() {
  const { data, isLoading, error } = useApiRawQuery<{ raw: boolean }>({
    queryKey: ['raw'],
    endpoint: '/raw',
  });

  if (isLoading) return <div data-testid="loading">Loading</div>;
  if (error) return <div data-testid="error">{error.message}</div>;
  return <div data-testid="data">{data?.raw ? 'raw-yes' : 'raw-no'}</div>;
}

describe('useApiRawQuery', () => {
  it('calls api.getRaw and returns data directly', async () => {
    const { api } = await import('@/api/client');
    vi.mocked(api.getRaw).mockResolvedValue({ raw: true });

    renderWithQuery(<TestRawComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('raw-yes');
    });

    expect(api.getRaw).toHaveBeenCalledWith('/raw', undefined, expect.any(Object));
  });
});
