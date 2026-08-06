/**
 * PageHeader — Vitest tests
 *
 * Coverage targets:
 *   - Renders title (string)
 *   - Renders subtitle
 *   - Renders extra action area
 *   - Renders breadcrumb when provided
 *   - Renders icon when provided
 *   - Uses custom className
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import PageHeader from '../PageHeader';

// Mock the Breadcrumb component to isolate PageHeader tests
vi.mock('../Breadcrumb', () => ({
  default: ({ items }: { items?: { label: string }[] }) =>
    items && items.length > 0 ? (
      <nav data-testid="breadcrumb">
        {items.map((item, i) => (
          <span key={i}>{item.label}</span>
        ))}
      </nav>
    ) : null,
}));

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="仪表盘" />);
    expect(screen.getByText('仪表盘')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<PageHeader title="仪表盘" subtitle="AI 平台运行概览" />);
    expect(screen.getByText('AI 平台运行概览')).toBeInTheDocument();
  });

  it('renders the extra action area', () => {
    render(
      <PageHeader
        title="仪表盘"
        extra={<button>导出数据</button>}
      />,
    );
    expect(screen.getByText('导出数据')).toBeInTheDocument();
  });

  it('renders breadcrumb when provided', () => {
    render(
      <PageHeader
        title="仪表盘"
        breadcrumb={[{ label: '首页', to: '/' }, { label: '概览' }]}
      />,
    );
    const breadcrumb = screen.getByTestId('breadcrumb');
    expect(breadcrumb).toBeInTheDocument();
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('概览')).toBeInTheDocument();
  });

  it('does not render breadcrumb when not provided', () => {
    render(<PageHeader title="仪表盘" />);
    expect(screen.queryByTestId('breadcrumb')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<PageHeader title="仪表盘" icon={<span data-testid="page-icon">📊</span>} />);
    expect(screen.getByTestId('page-icon')).toBeInTheDocument();
  });

  it('uses the default animate-fade-in-up className', () => {
    const { container } = render(<PageHeader title="仪表盘" />);
    const wrapper = container.querySelector('.animate-fade-in-up');
    expect(wrapper).toBeTruthy();
  });

  it('supports custom className', () => {
    const { container } = render(<PageHeader title="仪表盘" className="my-custom-class" />);
    const wrapper = container.querySelector('.my-custom-class');
    expect(wrapper).toBeTruthy();
  });

  it('renders title as ReactNode', () => {
    render(<PageHeader title={<span data-testid="custom-title">Custom Title</span>} />);
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
  });
});
