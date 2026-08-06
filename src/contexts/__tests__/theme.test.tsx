/**
 * ThemeContext (contexts/theme.tsx) — theme toggle and persistence tests.
 *
 * Covers:
 *   - Default mode is 'dark'
 *   - Reads stored preference from localStorage on mount
 *   - toggle() flips between dark and light
 *   - Toggling sets/clears 'light' class on <html>
 *   - Persists preference to localStorage
 *   - useTheme() throws outside ThemeProvider
 *   - useThemeTokens() returns correct token set per mode
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@/test/utils';
import { ThemeProvider, useTheme, useThemeTokens } from '../theme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('light');
});

function ToggleButton() {
  const { mode, isDark, toggle } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="is-dark">{isDark ? 'yes' : 'no'}</span>
      <button onClick={toggle} data-testid="toggle">
        Toggle
      </button>
    </div>
  );
}

function TokenDisplay() {
  const tokens = useThemeTokens();
  return <span data-testid="color-primary">{tokens.token?.colorPrimary}</span>;
}

describe('ThemeProvider', () => {
  it('defaults to dark mode when no stored preference', () => {
    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('yes');
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('reads stored preference from localStorage on mount', () => {
    localStorage.setItem('ai-platform-theme', 'light');

    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('no');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('reads stored dark preference from localStorage', () => {
    localStorage.setItem('ai-platform-theme', 'dark');

    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('toggle() flips from dark to light', () => {
    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');

    act(() => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('no');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('toggle() flips from light to dark', () => {
    localStorage.setItem('ai-platform-theme', 'light');

    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');

    act(() => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('persists preference to localStorage on toggle', () => {
    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );

    act(() => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    expect(localStorage.getItem('ai-platform-theme')).toBe('light');
  });

  it('ignores invalid stored values and defaults to dark', () => {
    localStorage.setItem('ai-platform-theme', 'invalid-value');

    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('handles localStorage unavailable (no throw)', () => {
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.getItem = () => {
      throw new Error('blocked');
    };
    Storage.prototype.setItem = () => {
      throw new Error('blocked');
    };

    expect(() => {
      render(
        <ThemeProvider>
          <ToggleButton />
        </ThemeProvider>,
      );
    }).not.toThrow();

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');

    // Restore
    Storage.prototype.getItem = originalGetItem;
    Storage.prototype.setItem = originalSetItem;
  });
});

describe('useTheme', () => {
  it('throws when used outside ThemeProvider', () => {
    // Suppress React error boundary logs
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<ToggleButton />)).toThrow(
      'useTheme must be used within a ThemeProvider',
    );

    spy.mockRestore();
  });
});

describe('useThemeTokens', () => {
  it('returns dark tokens when in dark mode', () => {
    render(
      <ThemeProvider>
        <TokenDisplay />
      </ThemeProvider>,
    );

    // Dark mode has its own color primary
    const token = screen.getByTestId('color-primary').textContent;
    expect(token).toBeTruthy();
  });

  it('returns light tokens when in light mode', () => {
    localStorage.setItem('ai-platform-theme', 'light');

    render(
      <ThemeProvider>
        <TokenDisplay />
      </ThemeProvider>,
    );

    const token = screen.getByTestId('color-primary').textContent;
    expect(token).toBeTruthy();
  });

  it('tokens change when mode toggles', () => {
    render(
      <ThemeProvider>
        <ToggleButton />
        <TokenDisplay />
      </ThemeProvider>,
    );

    const darkToken = screen.getByTestId('color-primary').textContent;

    act(() => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    const lightToken = screen.getByTestId('color-primary').textContent;
    // Tokens should differ between modes (different color palettes)
    expect(darkToken).not.toBe(lightToken);
  });
});
