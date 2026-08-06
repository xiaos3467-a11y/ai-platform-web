/**
 * E2E: Dashboard page
 *
 * Verifies that the dashboard loads and renders key elements:
 *   - Page title "仪表盘"
 *   - Stat cards
 *   - Health pills
 *   - Chart sections
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth token in localStorage
    await page.goto('/login');
    await page.evaluate(() => {
      // Create a fake valid JWT (exp in the future)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
      const sig = btoa('fake');
      localStorage.setItem('ai_platform_token', `${header}.${payload}.${sig}`);
      localStorage.setItem(
        'ai_platform_user',
        JSON.stringify({ id: 'u1', username: 'admin', tenant_id: 't1', role: 'admin' }),
      );
    });
  });

  test('renders dashboard title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('仪表盘')).toBeVisible();
  });

  test('renders stat cards', async ({ page }) => {
    // Mock API responses
    await page.route('**/costs/summary*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          message: 'ok',
          data: {
            total_cost_usd: 100,
            total_input_tokens: 500000,
            total_output_tokens: 300000,
            total_requests: 1000,
            by_model: {},
            period_start: '2024-01-01',
            period_end: '2024-01-07',
          },
        }),
      });
    });

    await page.route('**/costs/daily*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          message: 'ok',
          data: [],
        }),
      });
    });

    await page.route('**/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          service: 'api',
          version: '1.0.0',
          env: 'test',
          dependencies: {},
        }),
      });
    });

    await page.goto('/');

    // Stat cards should be visible
    await expect(page.getByText('总请求数')).toBeVisible();
    await expect(page.getByText('Token 消耗')).toBeVisible();
    await expect(page.getByText('总成本')).toBeVisible();
    await expect(page.getByText('健康状态')).toBeVisible();
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/');

    // Click on model management
    await page.getByText('模型管理').click();
    await expect(page).toHaveURL(/.*models/);
  });
});
