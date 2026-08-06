/**
 * Playwright configuration for E2E tests.
 *
 * Tests run against the local dev server (vite, port 3001).
 * CI will build and serve static dist instead.
 */

import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.CI ? 4173 : 3001;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  /* Shared settings for all the projects below. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    /* Screenshot on failure for debugging. */
    screenshot: 'only-on-failure',
    /* Default navigation timeout */
    navigationTimeout: 30_000,
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'npm run preview -- --port 4173' : 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
