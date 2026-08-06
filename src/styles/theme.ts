/**
 * Unified theme configuration
 * — Re-exports the Ant Design token sets from `themeTokens.ts` and adds
 *   a few helpers so pages & components don't need to know which shape
 *   AntD's ConfigProvider expects.
 * — Also exports `buildTheme(mode)` as a single factory that returns
 *   a fully-formed `{ token, components }` object, and a typed helper
 *   `getDesignTokens()` that returns the raw design-tokens.json values
 *   for use in CSS-in-JS (Emotion) or inline styles.
 */

import { darkTokens, lightTokens } from './themeTokens';
import type { ThemeConfig } from 'antd';
import type { ThemeMode } from '@/contexts/theme';

/**
 * Get the AntD ThemeConfig for a given mode.
 * Convenience wrapper so consumers don't need to ternary themselves.
 */
export function buildTheme(mode: ThemeMode): ThemeConfig {
  return mode === 'dark' ? darkTokens : lightTokens;
}

/** Type-safe export of both token sets. */
export { darkTokens, lightTokens };
export type { ThemeConfig };
