/**
 * StatCard — gradient stat tile tests.
 *
 * Covers:
 *   - Title, numeric value (animated), string value
 *   - Suffix rendering
 *   - Trend indicator (positive ↑ green, negative ↓ red)
 *   - Icon rendering
 *   - Glass-card class applied
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import StatCard from '../StatCard';

// Mock AnimatedNumber to avoid rAF complexity in this test file
vi.mock('../AnimatedNumber', () => ({
  default: ({ value }: { value: number }) => <span data-testid="animated">{value}</span>,
}));

// Icons from ant-design render inline SVGs; we don't need to assert them.

describe('StatCard', () => {
  const defaultProps = {
    title: '总请求数',
    value: 12345,
    icon: <span data-testid="icon">⚡</span>,
    gradient: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
  };

  it('renders the title', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('总请求数')).toBeInTheDocument();
  });

  it('renders a numeric value via AnimatedNumber', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByTestId('animated')).toHaveTextContent('12345');
  });

  it('renders a string value directly (no animation)', () => {
    render(<StatCard {...defaultProps} value="¥9,876" />);
    expect(screen.getByText('¥9,876')).toBeInTheDocument();
  });

  it('renders a suffix next to the value', () => {
    render(<StatCard {...defaultProps} value={3.14} suffix="M" />);
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByTestId('animated')).toBeInTheDocument();
  });

  it('renders the icon element', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies glass-card and animation classes', () => {
    const { container } = render(<StatCard {...defaultProps} />);
    const card = container.querySelector('.glass-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('animate-fade-in-up');
    expect(card).toHaveClass('card-hover');
  });

  describe('trend indicator', () => {
    it('renders a positive trend (↑ green)', () => {
      render(<StatCard {...defaultProps} trend={{ value: 12.5, label: '较上周' }} />);
      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('12.5%')).toBeInTheDocument();
      expect(screen.getByText('较上周')).toBeInTheDocument();
    });

    it('renders a negative trend (↓ red)', () => {
      render(<StatCard {...defaultProps} trend={{ value: -3.2 }} />);
      expect(screen.getByText('↓')).toBeInTheDocument();
      expect(screen.getByText('3.2%')).toBeInTheDocument();
    });

    it('treats zero as positive', () => {
      render(<StatCard {...defaultProps} trend={{ value: 0 }} />);
      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('omits trend section when no trend prop', () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.queryByText('↑')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });
  });

  it('applies inline styles for glass effect', () => {
    const { container } = render(<StatCard {...defaultProps} />);
    const card = container.querySelector('.glass-card') as HTMLElement;
    expect(card.style.borderRadius).toBe('16px');
  });
});
