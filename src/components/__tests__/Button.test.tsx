/**
 * Button (components/Button.tsx) — re-export verification tests.
 *
 * The canonical implementation lives in ui/Button.tsx; this file re-exports
 * it for backward compatibility. We verify the re-export works correctly
 * and that the component is usable from the top-level import path.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import Button from '../Button';
import type { ButtonProps } from '../Button';

describe('Button (re-export)', () => {
  it('renders children via the top-level import', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('accepts all ButtonProps without TypeScript errors', () => {
    const props: ButtonProps = {
      variant: 'primary',
      size: 'lg',
      loading: false,
      disabled: false,
      children: 'Styled',
    };
    render(<Button {...props} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn.style.height).toBe('48px'); // lg size
  });

  it('fires onClick handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is identical to the ui/Button implementation', async () => {
    const UiButton = (await import('../ui/Button')).default;
    // Both should be the same component reference
    expect(Button).toBe(UiButton);
  });
});
