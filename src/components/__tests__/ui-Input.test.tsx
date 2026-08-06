/**
 * Input (ui/Input.tsx) — Apple-style input field.
 *
 * Covers:
 *   - Label rendering
 *   - Error state: red border, error message display
 *   - Disabled state: opacity, pointer events
 *   - Prefix/suffix icons rendering
 *   - Large size: height
 *   - Focus/blur border color changes
 *   - Forwards input props (placeholder, value, onChange)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import Input from '../ui/Input';

describe('Input (ui/Input)', () => {
  it('renders an input element', () => {
    render(<Input data-testid="my-input" />);
    expect(screen.getByTestId('my-input')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="用户名" />);
    expect(screen.getByText('用户名')).toBeInTheDocument();
  });

  it('does NOT render label when not provided', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('renders placeholder', () => {
    render(<Input placeholder="输入..." />);
    expect(screen.getByPlaceholderText('输入...')).toBeInTheDocument();
  });

  describe('error state', () => {
    it('shows error message', () => {
      render(<Input error="必填项" />);
      expect(screen.getByText('必填项')).toBeInTheDocument();
    });

    it('applies red border color', () => {
      const { container } = render(<Input error="错误" />);
      const input = container.querySelector('input') as HTMLInputElement;
      // Component uses `border` shorthand — jsdom may not decompose to borderColor
      const border = input.style.border || input.style.borderColor;
      expect(border).toContain('color-error');
    });
  });

  describe('disabled state', () => {
    it('sets disabled attribute', () => {
      render(<Input disabled data-testid="i" />);
      expect(screen.getByTestId('i')).toBeDisabled();
    });

    it('reduces opacity', () => {
      const { container } = render(<Input disabled />);
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.style.opacity).toBe('0.4');
    });
  });

  describe('sizes', () => {
    it('default height is 40px', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.style.height).toBe('40px');
    });

    it('large height is 48px', () => {
      const { container } = render(<Input large />);
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.style.height).toBe('48px');
    });
  });

  describe('icons', () => {
    it('renders prefix icon', () => {
      render(<Input prefixIcon={<span data-testid="prefix">🔍</span>} />);
      expect(screen.getByTestId('prefix')).toBeInTheDocument();
    });

    it('renders suffix icon', () => {
      render(<Input suffixIcon={<span data-testid="suffix">✕</span>} />);
      expect(screen.getByTestId('suffix')).toBeInTheDocument();
    });
  });

  describe('focus / blur', () => {
    it('shows blue glow on focus (no error)', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input') as HTMLInputElement;

      fireEvent.focus(input);
      expect(input.style.borderColor).toBe('var(--color-primary)');
      expect(input.style.boxShadow).toContain('10, 132, 255');
    });

    it('shows red glow on focus when has error', () => {
      const { container } = render(<Input error="Bad" />);
      const input = container.querySelector('input') as HTMLInputElement;

      fireEvent.focus(input);
      expect(input.style.boxShadow).toContain('255, 69, 58');
    });

    it('clears glow on blur', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input') as HTMLInputElement;

      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(input.style.boxShadow).toBe('none');
    });
  });

  describe('forwards events', () => {
    it('calls onChange', () => {
      const onChange = vi.fn();
      const { container } = render(<Input onChange={onChange} />);
      const input = container.querySelector('input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'hello' } });
      expect(onChange).toHaveBeenCalled();
    });

    it('calls custom onFocus/onBlur', () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      const { container } = render(<Input onFocus={onFocus} onBlur={onBlur} />);
      const input = container.querySelector('input') as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  it('supports wrapperClassName', () => {
    const { container } = render(<Input wrapperClassName="custom-wrap" />);
    // wrapperClassName is applied to the outermost div of the Input component
    const wrapper = container.querySelector('.custom-wrap');
    expect(wrapper).toBeInTheDocument();
  });
});
