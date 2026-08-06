import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // ── Global ignores ───────────────────────────────────────────────
  { ignores: ['dist', 'node_modules', '*.config.*', 'coverage', 'e2e'] },

  // ── Base JS recommended rules ────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript recommended rules (type-checked linting off for speed) ─
  ...tseslint.configs.recommended,

  // ── Project-wide config ──────────────────────────────────────────
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React Hooks
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'warn',

      // React Refresh — ensure components are eligible for HMR
      'react-refresh/only-export-components': 'off',

      // TypeScript — relax a few rules for pragmatism
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // ── Prettier — must come last so it overrides formatting rules ───
  eslintConfigPrettier,
);
