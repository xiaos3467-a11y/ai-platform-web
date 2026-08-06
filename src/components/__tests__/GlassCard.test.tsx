/**
 * GlassCard — Apple-style glass surface.
 *
 * Tests:
 *   - Renders children
 *   - hoverable prop triggers translateY on mouse events
 *   - animate prop adds entrance class
 *   - Custom className is preserved
 *   - Passes through extra Card props
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import GlassCard from '../GlassCard';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Card content</GlassCard>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('has glass-card class by default', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    expect(container.querySelector('.glass-card')).toBeInTheDocument();
  });

  it('applies animate-fade-in-up when animate=true', () => {
    const { container } = render(<GlassCard animate>Content</GlassCard>);
    const card = container.querySelector('.glass-card');
    expect(card).toHaveClass('animate-fade-in-up');
  });

  it('does NOT add animate class when animate=false', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    const card = container.querySelector('.glass-card');
    expect(card).not.toHaveClass('animate-fade-in-up');
  });

  it('merges custom className', () => {
    const { container } = render(<GlassCard className="custom">Content</GlassCard>);
    const card = container.querySelector('.glass-card');
    expect(card).toHaveClass('custom');
    expect(card).toHaveClass('glass-card');
  });

  describe('hover effects', () => {
    it('lifts card on mouseEnter when hoverable', () => {
      const { container } = render(<GlassCard hoverable>Content</GlassCard>);
      const card = container.querySelector('.ant-card') as HTMLElement;

      fireEvent.mouseEnter(card);
      expect(card.style.transform).toBe('translateY(-2px)');
      expect(card.style.boxShadow).toContain('8px 24px');
    });

    it('lowers card on mouseLeave when hoverable', () => {
      const { container } = render(<GlassCard hoverable>Content</GlassCard>);
      const card = container.querySelector('.ant-card') as HTMLElement;

      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      expect(card.style.transform).toBe('translateY(0)');
      expect(card.style.boxShadow).toBe('none');
    });

    it('does NOT lift when hoverable=false', () => {
      const { container } = render(<GlassCard>Content</GlassCard>);
      const card = container.querySelector('.ant-card') as HTMLElement;

      fireEvent.mouseEnter(card);
      expect(card.style.transform).toBe('');
    });

    it('calls user-provided onMouseEnter/Leave', () => {
      const onEnter = vi.fn();
      const onLeave = vi.fn();
      const { container } = render(
        <GlassCard hoverable onMouseEnter={onEnter} onMouseLeave={onLeave}>
          Content
        </GlassCard>,
      );
      const card = container.querySelector('.ant-card') as HTMLElement;

      fireEvent.mouseEnter(card);
      expect(onEnter).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(card);
      expect(onLeave).toHaveBeenCalledTimes(1);
    });
  });

  it('applies backdrop-filter (frosted glass)', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    const card = container.querySelector('.glass-card') as HTMLElement;
    expect(card.style.backdropFilter).toContain('blur');
  });

  it('applies border radius of 16px', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    const card = container.querySelector('.glass-card') as HTMLElement;
    expect(card.style.borderRadius).toBe('16px');
  });
});
