/**
 * Dashboard page — renders stat cards, charts, and handles loading/error states.
 *
 * Covers:
 *   - Renders page title and health pills
 *   - Shows loading state via StatCardsRow skeleton
 *   - Renders stat cards with cost summary data
 *   - Renders error alert when all API calls fail
 *   - Renders health pills from API response
 *   - Falls back to default health pills when no data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import Dashboard from '../Dashboard';

// Mock sub-components to isolate Dashboard's rendering logic
vi.mock('../dashboard/DashboardHeader', () => ({
  default: () => <div data-testid="dashboard-header">DashboardHeader</div>,
}));

vi.mock('../dashboard/StatCardsRow', () => ({
  default: ({ loading, costSummary }: { loading: boolean; costSummary: unknown }) => (
    <div data-testid="stat-cards-row">
      {loading ? 'loading' : JSON.stringify(costSummary)}
    </div>
  ),
}));

vi.mock('../dashboard/ChartsRow', () => ({
  default: ({ loading }: { loading: boolean }) => (
    <div data-testid="charts-row">{loading ? 'loading' : 'ready'}</div>
  ),
}));

vi.mock('../dashboard/RequestVolumeChart', () => ({
  default: ({ loading }: { loading: boolean }) => (
    <div data-testid="request-volume">{loading ? 'loading' : 'ready'}</div>
  ),
}));

vi.mock('../dashboard/ModelTable', () => ({
  default: () => <div data-testid="model-table">ModelTable</div>,
}));

// Mock the data hook
const mockUseDashboardData = vi.fn();
vi.mock('../dashboard/useDashboardData', () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseDashboardData.mockReturnValue({
    health: null,
    costSummary: null,
    dailyCosts: [],
    isLoading: false,
    error: null,
  });
});

describe('Dashboard', () => {
  it('renders header and health pills section', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('stat-cards-row')).toBeInTheDocument();
    expect(screen.getByTestId('charts-row')).toBeInTheDocument();
    expect(screen.getByTestId('request-volume')).toBeInTheDocument();
    expect(screen.getByTestId('model-table')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    mockUseDashboardData.mockReturnValue({
      health: null,
      costSummary: null,
      dailyCosts: [],
      isLoading: true,
      error: null,
    });

    render(<Dashboard />);
    expect(screen.getByTestId('stat-cards-row')).toHaveTextContent('loading');
    expect(screen.getByTestId('charts-row')).toHaveTextContent('loading');
  });

  it('renders error alert when all API calls fail', () => {
    mockUseDashboardData.mockReturnValue({
      health: null,
      costSummary: null,
      dailyCosts: [],
      isLoading: false,
      error: '无法连接到后端服务，请检查网络或联系管理员',
    });

    render(<Dashboard />);
    expect(screen.getByText('数据加载异常')).toBeInTheDocument();
    expect(
      screen.getByText('无法连接到后端服务，请检查网络或联系管理员'),
    ).toBeInTheDocument();
  });

  it('does not render error alert when error is null', () => {
    render(<Dashboard />);
    expect(screen.queryByText('数据加载异常')).not.toBeInTheDocument();
  });

  it('renders health pills from API response', () => {
    mockUseDashboardData.mockReturnValue({
      health: {
        status: 'ok',
        dependencies: {
          'API Gateway': 'ok',
          PostgreSQL: 'ok',
          Redis: 'warning',
        },
      },
      costSummary: null,
      dailyCosts: [],
      isLoading: false,
      error: null,
    });

    render(<Dashboard />);
    // HealthPill renders "name · status-text"
    expect(screen.getByText(/API Gateway/)).toBeInTheDocument();
    expect(screen.getByText(/PostgreSQL/)).toBeInTheDocument();
    expect(screen.getByText(/Redis/)).toBeInTheDocument();
  });

  it('falls back to default health pills when no API data', () => {
    mockUseDashboardData.mockReturnValue({
      health: null,
      costSummary: null,
      dailyCosts: [],
      isLoading: false,
      error: null,
    });

    render(<Dashboard />);
    // Default health pills
    expect(screen.getByText(/OpenAI/)).toBeInTheDocument();
    expect(screen.getByText(/Anthropic/)).toBeInTheDocument();
    expect(screen.getByText(/Google AI/)).toBeInTheDocument();
  });

  it('falls back to default health pills when dependencies is empty', () => {
    mockUseDashboardData.mockReturnValue({
      health: { status: 'ok', dependencies: {} },
      costSummary: null,
      dailyCosts: [],
      isLoading: false,
      error: null,
    });

    render(<Dashboard />);
    expect(screen.getByText(/OpenAI/)).toBeInTheDocument();
    expect(screen.getByText(/Anthropic/)).toBeInTheDocument();
  });

  it('passes cost summary data to StatCardsRow', () => {
    const costSummary = {
      total_cost: 123.45,
      total_tokens: 67890,
      total_requests: 1234,
      avg_cost_per_request: 0.1,
    };

    mockUseDashboardData.mockReturnValue({
      health: null,
      costSummary,
      dailyCosts: [],
      isLoading: false,
      error: null,
    });

    render(<Dashboard />);
    const statRow = screen.getByTestId('stat-cards-row');
    expect(statRow).toHaveTextContent('123.45');
    expect(statRow).toHaveTextContent('1234');
  });
});
