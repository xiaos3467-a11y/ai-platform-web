/**
 * Button (ui/Button.tsx) — Apple-style button variants.
 *
 * Covers:
 *   - All 4 variants render and apply their respective styles
 *   - All 3 sizes set height correctly
 *   - Disabled state: visual opacity, cursor, and click does not fire
 *   - Loading state delegates to antd
 *   - Hover effects for primary/secondary/ghost/danger
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import Button from '../ui/Button';

describe('Button (ui/Button)', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('defaults to secondary variant and md size', () => {
    render(<Button>Btn</Button>);
    const btn = screen.getByRole('button');
    // md height = 40px
    expect(btn.style.height).toBe('40px');
    // secondary: has border
    expect(btn.style.border).toContain('0.5px solid');
  });

  describe('variants', () => {
    it('primary variant has gradient background', () => {
      render(<Button variant="primary">P</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.background).toContain('linear-gradient');
      expect(btn.style.color).toBe('rgb(255, 255, 255)');
    });

    it('danger variant has red gradient', () => {
      render(<Button variant="danger">D</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.background).toContain('linear-gradient');
      expect(btn.style.background).toContain('255, 69, 58');
    });

    it('ghost variant has transparent background', () => {
      render(<Button variant="ghost">G</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.background).toBe('transparent');
    });
  });

  describe('sizes', () => {
    it('sm = 32px', () => {
      render(<Button size="sm">S</Button>);
      expect(screen.getByRole('button').style.height).toBe('32px');
    });

    it('md = 40px', () => {
      render(<Button size="md">M</Button>);
      expect(screen.getByRole('button').style.height).toBe('40px');
    });

    it('lg = 48px', () => {
      render(<Button size="lg">L</Button>);
      expect(screen.getByRole('button').style.height).toBe('48px');
    });
  });

  describe('disabled state', () => {
    it('applies disabled attribute and reduced opacity', () => {
      render(<Button disabled>Disabled</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn.style.opacity).toBe('0.4');
      expect(btn.style.cursor).toBe('not-allowed');
    });

    it('does not fire onClick when disabled', () => {
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          No
        </Button>,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('hover effects', () => {
    it('primary hover brightens', () => {
      render(<Button variant="primary">P</Button>);
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      expect(btn.style.filter).toBe('brightness(1.08)');
    });

    it('danger hover brightens', () => {
      render(<Button variant="danger">D</Button>);
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      expect(btn.style.filter).toBe('brightness(1.08)');
    });

    it('secondary hover changes background', () => {
      render(<Button variant="secondary">S</Button>);
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      expect(btn.style.background).toBe('var(--bg-elevated-2)');
    });

    it('ghost hover shows elevated bg', () => {
      render(<Button variant="ghost">G</Button>);
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      expect(btn.style.background).toBe('var(--bg-elevated)');
    });

    it('disabled button does not react to hover', () => {
      render(
        <Button variant="primary" disabled>
          X
        </Button>,
      );
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      // Filter should NOT be set because disabled
      expect(btn.style.filter).not.toBe('brightness(1.08)');
    });
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
