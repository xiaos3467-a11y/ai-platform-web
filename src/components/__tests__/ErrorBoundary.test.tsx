/**
 * ErrorBoundary — catches render errors and shows fallback UI.
 *
 * Strategy:
 *   - Render a child that throws on mount.
 *   - Assert that the fallback UI appears instead.
 *   - Assert that console.error is called (spy).
 *   - Assert "返回首页" button triggers navigation (mock useNavigate).
 */

import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/** A component that throws on first render, can be toggled by a button */
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <div>Child OK</div>;
}

// Wrapper to control throwing via state
function Harness() {
  const [throwErr, setThrowErr] = useState(false);
  return (
    <>
      <button onClick={() => setThrowErr(true)}>Trigger Error</button>
      <ErrorBoundary>
        <Bomb shouldThrow={throwErr} />
      </ErrorBoundary>
    </>
  );
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders children normally when no error', () => {
    render(
      <ErrorBoundary>
        <div>Everything is fine</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
  });

  it('catches render error and shows fallback UI', () => {
    // Suppress error logs during this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Harness />);
    // Initially OK
    expect(screen.getByText('Child OK')).toBeInTheDocument();

    // Trigger the error
    fireEvent.click(screen.getByText('Trigger Error'));

    // Fallback should show
    expect(screen.getByText('出了点问题')).toBeInTheDocument();
    expect(screen.getByText(/应用遇到了意外错误/)).toBeInTheDocument();
    expect(screen.getByText('Test render error')).toBeInTheDocument();
    expect(screen.getByText('返回首页')).toBeInTheDocument();

    spy.mockRestore();
  });

  it('logs error via console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Harness />);
    fireEvent.click(screen.getByText('Trigger Error'));

    expect(spy).toHaveBeenCalled();
    const firstCallArgs = spy.mock.calls.find(
      (c) => typeof c[0] === 'string' && c[0].includes('[ErrorBoundary]'),
    );
    expect(firstCallArgs).toBeDefined();

    spy.mockRestore();
  });

  it('"返回首页" button navigates to "/"', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Harness />);
    fireEvent.click(screen.getByText('Trigger Error'));

    const homeButton = screen.getByText('返回首页');
    fireEvent.click(homeButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');

    spy.mockRestore();
  });

  it('renders the error message in the fallback UI', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Harness />);
    fireEvent.click(screen.getByText('Trigger Error'));

    // Error message is rendered in the fallback UI
    expect(screen.getByText('Test render error')).toBeInTheDocument();

    spy.mockRestore();
  });
});
