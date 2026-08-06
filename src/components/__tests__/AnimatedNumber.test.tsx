/**
 * AnimatedNumber — count-up animation logic tests.
 *
 * We cannot easily test the animation frames themselves, so we focus on:
 *   1. Initial render starts at 0 (or previous value).
 *   2. After animation completes (we fast-forward rAF), the final value
 *      is displayed.
 *   3. Custom format() is applied.
 *   4. Changing `value` triggers re-animation from the previous value.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@/test/utils';
import AnimatedNumber from '../AnimatedNumber';

// ── rAF mock ────────────────────────────────────────────────────────
// We replace requestAnimationFrame with a synchronous callback that
// immediately invokes with a fake timestamp. This lets tests assert the
// final rendered value without waiting for real frames.

let rafCallbacks: Array<{ id: number; cb: FrameRequestCallback }> = [];
let rafCounter = 0;
let fakeNow = 0;

beforeEach(() => {
  fakeNow = 0;
  rafCallbacks = [];
  vi.spyOn(performance, 'now').mockImplementation(() => fakeNow);

  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((cb: FrameRequestCallback) => {
      const id = ++rafCounter;
      rafCallbacks.push({ id, cb });
      return id;
    }),
  );
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id: number) => {
      rafCallbacks = rafCallbacks.filter((c) => c.id !== id);
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Run all queued rAF callbacks once with the given timestamp */
function flushRAF(time: number) {
  fakeNow = time;
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  for (const { cb } of cbs) cb(time);
}

/** Fast-forward rAF until the animation completes.
 *  Resets fakeNow to 0 first so performance.now() calls inside the effect
 *  get a consistent startTime regardless of prior test state.
 */
function runFullAnimation(duration = 800) {
  // Reset clock so the effect's startTime = performance.now() = 0
  fakeNow = 0;
  // First rAF — start (effect has already captured startTime=0)
  act(() => {
    flushRAF(0);
  });
  // Second rAF — at or past the duration so progress === 1
  act(() => {
    flushRAF(duration + 50);
  });
}

// ── Tests ───────────────────────────────────────────────────────────

describe('AnimatedNumber', () => {
  it('renders with initial value of 0 before animation starts', () => {
    render(<AnimatedNumber value={100} />);
    // Before any rAF fires, displayValue is 0 → toLocaleString("0")
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('animates to the target value', () => {
    render(<AnimatedNumber value={42} />);
    runFullAnimation();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('supports custom duration', () => {
    render(<AnimatedNumber value={500} duration={1200} />);
    // Advance halfway — should NOT have finished yet
    act(() => flushRAF(0));
    act(() => flushRAF(600));
    // Value mid-flight: not yet 500
    expect(screen.queryByText('500')).not.toBeInTheDocument();

    // Now past duration
    act(() => flushRAF(1300));
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('applies custom format() function', () => {
    render(<AnimatedNumber value={1234} format={(v) => `$${v.toFixed(0)}`} />);
    runFullAnimation();
    expect(screen.getByText('$1234')).toBeInTheDocument();
  });

  it('re-animates when value changes', () => {
    const { rerender } = render(<AnimatedNumber value={100} />);
    runFullAnimation();
    expect(screen.getByText('100')).toBeInTheDocument();

    // Reset clock BEFORE rerender so the new effect's startTime = 0
    fakeNow = 0;
    rerender(<AnimatedNumber value={200} />);
    // Now flush the new animation
    act(() => { flushRAF(0); });
    act(() => { flushRAF(850); });
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('cleans up animation frame on unmount', () => {
    const { unmount } = render(<AnimatedNumber value={999} />);
    // Start animation
    act(() => flushRAF(0));
    expect(cancelAnimationFrame).not.toHaveBeenCalled();

    unmount();
    // After unmount the cleanup function should cancel pending frames
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('applies className and style', () => {
    render(<AnimatedNumber value={10} className="my-class" style={{ color: 'red' }} />);
    const span = screen.getByText('0');
    expect(span).toHaveClass('my-class');
    expect(span.style.color).toBe('red');
  });

  it('uses toLocaleString by default (no format)', () => {
    render(<AnimatedNumber value={10000} />);
    runFullAnimation();
    // 10000 → "10,000" in en-US locale (jsdom default)
    expect(screen.getByText('10,000')).toBeInTheDocument();
  });

  it('does not re-trigger animation if value is unchanged', () => {
    const { rerender } = render(<AnimatedNumber value={50} />);
    runFullAnimation();
    const spy = vi.mocked(globalThis.requestAnimationFrame);
    const callsBefore = spy.mock.calls.length;

    rerender(<AnimatedNumber value={50} />);
    // No new rAF since diff === 0
    expect(spy.mock.calls.length).toBe(callsBefore);
  });
});
