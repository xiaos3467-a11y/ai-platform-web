/**
 * Breadcrumb — Vitest tests
 *
 * Coverage targets:
 *   - Renders explicit items
 *   - Renders home icon link
 *   - Renders separator between items
 *   - Last item renders as plain text (not a link)
 *   - Other items render as links
 *   - Custom renderItem is used when provided
 *   - Returns null when no items
 *   - Home icon links to "/"
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import Breadcrumb from '../Breadcrumb';

describe('Breadcrumb', () => {
  it('renders explicit items', () => {
    render(
      <Breadcrumb
        items={[
          { label: '首页', to: '/' },
          { label: '设置' },
        ]}
      />,
    );
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('设置')).toBeInTheDocument();
  });

  it('renders a home icon linking to /', () => {
    render(<Breadcrumb items={[{ label: 'Page' }]} />);
    const homeLink = screen.getByLabelText('首页');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.tagName).toBe('A');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders nav with aria-label', () => {
    render(<Breadcrumb items={[{ label: 'Page' }]} />);
    expect(screen.getByLabelText('面包屑导航')).toBeInTheDocument();
  });

  it('renders items with separators (RightOutlined icons)', () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: 'A', to: '/a' },
          { label: 'B', to: '/b' },
          { label: 'C' },
        ]}
      />,
    );
    // antd RightOutlined renders as <span class="anticon anticon-right">
    const separators = container.querySelectorAll('.anticon-right');
    // Should be 3 separators (one for each item, after the home icon)
    expect(separators.length).toBe(3);
  });

  it('renders the last item as plain text (no link)', () => {
    render(
      <Breadcrumb
        items={[
          { label: '首页', to: '/' },
          { label: '当前页' },
        ]}
      />,
    );
    // "首页" should be a link
    const homeLink = screen.getByText('首页').closest('a');
    expect(homeLink).toBeTruthy();

    // "当前页" should NOT be a link
    const currentPage = screen.getByText('当前页');
    // The parent <a> should not have "当前页" as direct text content
    expect(currentPage.closest('a')?.textContent).not.toBe('当前页');
  });

  it('renders items with to as links', () => {
    render(
      <Breadcrumb
        items={[
          { label: '首页', to: '/' },
          { label: '设置', to: '/settings' },
          { label: '通用' },
        ]}
      />,
    );
    const settingsLink = screen.getByText('设置').closest('a');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('supports custom renderItem', () => {
    render(
      <Breadcrumb
        items={[{ label: 'Page' }]}
        renderItem={(item) => <span data-testid="custom">{item.label}</span>}
      />,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.getByText('Page')).toBeInTheDocument();
  });

  it('returns null when no items provided and not in data router', () => {
    // Without explicit items and without a data router, auto-crumbs returns []
    const { container } = render(<Breadcrumb />);
    // No nav element should be rendered
    expect(container.querySelector('nav[aria-label="面包屑导航"]')).toBeNull();
  });

  it('renders items with icons', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Dashboard', icon: <span data-testid="dash-icon">📊</span> },
        ]}
      />,
    );
    expect(screen.getByTestId('dash-icon')).toBeInTheDocument();
  });
});
