/**
 * Tag (ui/Tag.tsx) — colored tag / chip.
 *
 * Covers:
 *   - All 6 color variants apply correct styles
 *   - Renders children
 *   - Close button renders when onClose is provided
 *   - Close button calls onClose and stopPropagation
 *   - Default color is blue
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import Tag from '../ui/Tag';

describe('Tag (ui/Tag)', () => {
  it('renders children', () => {
    render(<Tag>Hello</Tag>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('defaults to blue color', () => {
    const { container } = render(<Tag>Blue</Tag>);
    const tag = container.querySelector('span') as HTMLElement;
    expect(tag.style.color).toContain('var(--color-primary)');
  });

  describe('color variants', () => {
    const colors = [
      { name: 'blue', expected: 'var(--color-primary)' },
      { name: 'green', expected: 'var(--color-success)' },
      { name: 'yellow', expected: 'var(--color-warning)' },
      { name: 'red', expected: 'var(--color-error)' },
      // purple uses a CSS variable with fallback — jsdom preserves the var() syntax
      { name: 'purple', expected: 'var(--color-purple' },
      { name: 'gray', expected: 'var(--text-soft)' },
    ] as const;

    for (const { name, expected } of colors) {
      it(`${name} variant applies correct text color`, () => {
        const { container } = render(<Tag color={name}>{name}</Tag>);
        const tag = container.querySelector('span') as HTMLElement;
        expect(tag.style.color).toContain(expected);
      });
    }
  });

  describe('close button', () => {
    it('does NOT render close icon when no onClose', () => {
      const { container } = render(<Tag>NoClose</Tag>);
      // ant-design CloseOutlined renders as <span class="anticon">
      expect(container.querySelector('.anticon-close')).not.toBeInTheDocument();
    });

    it('renders close icon when onClose is provided', () => {
      const { container } = render(<Tag onClose={() => {}}>WithClose</Tag>);
      expect(container.querySelector('.anticon-close')).toBeInTheDocument();
    });

    it('calls onClose when close icon is clicked', () => {
      const onClose = vi.fn();
      const { container } = render(<Tag onClose={onClose}>Close me</Tag>);
      const closeIcon = container.querySelector('.anticon-close') as HTMLElement;
      fireEvent.click(closeIcon);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('stops propagation on close click', () => {
      const onClose = vi.fn();
      const onParentClick = vi.fn();
      const { container } = render(
        <div onClick={onParentClick}>
          <Tag onClose={onClose}>Child</Tag>
        </div>,
      );
      const closeIcon = container.querySelector('.anticon-close') as HTMLElement;
      fireEvent.click(closeIcon);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onParentClick).not.toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<Tag className="my-tag">T</Tag>);
    expect(container.querySelector('span')).toHaveClass('my-tag');
  });

  it('applies custom style', () => {
    const { container } = render(<Tag style={{ marginLeft: 10 }}>T</Tag>);
    const tag = container.querySelector('span') as HTMLElement;
    expect(tag.style.marginLeft).toBe('10px');
  });
});
