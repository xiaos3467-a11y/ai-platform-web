/**
 * Vitest configuration — mirrors vite.config.ts for path aliases and plugins.
 *
 * - Uses jsdom environment by default (React component tests).
 * - Provides @ alias resolution consistent with tsconfig paths.
 * - Coverage via v8 (more accurate than istanbul for TS).
 * - Setup file loads @testing-library/jest-dom matchers globally.
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Match test files: *.test.ts, *.test.tsx, *.spec.ts, *.spec.tsx
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/vite-env.d.ts',
        'src/main.tsx', // Entry point — just mounts React
        // P1/P2 — pages and page sub-components not yet tested
        'src/pages/Agents.tsx',
        'src/pages/Costs.tsx',
        'src/pages/Evaluations.tsx',
        'src/pages/KnowledgeBases.tsx',
        'src/pages/ModelProviders.tsx',
        'src/pages/NotFound.tsx',
        'src/pages/Prompts.tsx',
        'src/pages/Roles.tsx',
        'src/pages/Settings.tsx',
        'src/pages/Users.tsx',
        'src/pages/Workflows.tsx',
        'src/pages/**/index.ts',
        'src/pages/dashboard/**',     // P1 — Dashboard sub-components
        'src/pages/conversations/**', // P1 — Conversation sub-components
        'src/pages/tenant/**',        // P2 — Tenant sub-pages (not in Phase 1 scope)
        'src/components/GradientIcon.tsx',
        'src/components/SectionCard.tsx',
        'src/components/Skeletons.tsx',
        'src/components/ThemeToggle.tsx',
        'src/components/ui/Table.tsx',
        'src/layouts/**',
        'src/styles/**',
        'src/lib/**',
        'src/hooks/useApiMutation.ts', // P2 — not in Phase 1 scope
        'src/types/**',                // Type definitions and const enums
        'src/features/**',
      ],
      // Phase 1 coverage thresholds.
      // Actual: lines ~78%, branches ~80%, functions ~56%, statements ~75%.
      // Will be raised as P2 pages get tested in subsequent phases.
      thresholds: {
        lines: 75,
        branches: 75,
        functions: 55,
        statements: 72,
      },
    },
    // Retry flaky tests once in CI
    retry: process.env.CI ? 1 : 0,
  },
});
