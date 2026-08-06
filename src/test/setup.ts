/**
 * Global test setup — loaded by vitest before every test file.
 *
 * - Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.).
 * - Provides polyfills for APIs that jsdom does not implement.
 * - Resets mocks between tests.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Initialize i18n for tests so useTranslation() works with zh-CN defaults
import '@/i18n';

// Auto-cleanup DOM after each test
afterEach(() => {
  cleanup();
});

/* ── jsdom polyfills ────────────────────────────────────────────── */

// requestAnimationFrame / cancelAnimationFrame — jsdom ships these but
// some tests run in "happy-dom" or node env; safe to stub.
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number;
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
}

// window.matchMedia — used by antd internals
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// window.ResizeObserver — used by antd Table / Layout
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
});

// Element.prototype.scrollIntoView — jsdom does not implement this
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = vi.fn();
}

// fetch — jsdom does not ship fetch before Node 18; we stub it here so
// API client tests can control it per-test via vi.spyOn.
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = vi.fn();
}

// getComputedStyle — jsdom returns empty; antd reads some props
const origGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt: Element) => origGetComputedStyle(elt);

// Suppress antd's console.error noise during tests (keep real errors visible)
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (msg.includes('Warning: `validateDomInBrowser`')) return;
  if (msg.includes('ReactDOM.render is no longer supported')) return;
  if (msg.includes('act(...)')) return;
  originalError.call(console, ...args);
};
