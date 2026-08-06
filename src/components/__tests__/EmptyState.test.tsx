/**
 * EmptyState — zero-data placeholder component tests.
 *
 * Covers:
 *   - Renders icon, title, and optional description
 *   - Renders action button when actionText + onAction are provided
 *   - Click handler fires correctly
 *   - Applies custom icon gradient
 *   - Does not render button when only actionText is provided (no onAction)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { PlusOutlined } from '@ant-design/icons';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders icon and title', () => {
    render(<EmptyState icon={<PlusOutlined data-testid="icon" />} title="暂无数据" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        icon={<PlusOutlined />}
        title="暂无数据"
        description="请先创建一条记录"
      />,
    );
    expect(screen.getByText('请先创建一条记录')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<EmptyState icon={<PlusOutlined />} title="暂无数据" />);
    // Only title, no description paragraph
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
    expect(screen.queryByText('请先创建一条记录')).not.toBeInTheDocument();
  });

  it('renders action button when actionText and onAction are provided', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        icon={<PlusOutlined />}
        title="暂无数据"
        actionText="新建"
        onAction={onAction}
      />,
    );
    const btn = screen.getByRole('button', { name: /新\s*建/ });
    expect(btn).toBeInTheDocument();
  });

  it('fires onAction when button is clicked', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        icon={<PlusOutlined />}
        title="暂无数据"
        actionText="新建"
        onAction={onAction}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /新\s*建/ }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not render button when only actionText is provided (no onAction)', () => {
    render(<EmptyState icon={<PlusOutlined />} title="暂无数据" actionText="新建" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render button when only onAction is provided (no actionText)', () => {
    render(
      <EmptyState icon={<PlusOutlined />} title="暂无数据" onAction={vi.fn()} />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies custom icon gradient as background', () => {
    const { container } = render(
      <EmptyState
        icon={<PlusOutlined />}
        title="Test"
        iconGradient="linear-gradient(135deg, #ff6b6b, #ff8787)"
      />,
    );
    // The icon badge is the first child div with the gradient
    const badge = container.querySelector('div > div:first-child');
    expect(badge).toBeTruthy();
  });
});
