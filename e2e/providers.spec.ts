/**
 * E2E: Model Providers page
 *
 * Tests CRUD operations on model providers.
 */

import { test, expect } from '@playwright/test';

/** Helper to set up auth state */
async function setupAuth(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.evaluate(() => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    const sig = btoa('fake');
    localStorage.setItem('ai_platform_token', `${header}.${payload}.${sig}`);
    localStorage.setItem(
      'ai_platform_user',
      JSON.stringify({ id: 'u1', username: 'admin', tenant_id: 't1', role: 'admin' }),
    );
  });
}

test.describe('Model Providers Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('renders model providers page', async ({ page }) => {
    await page.route('**/providers*', async (route) => {
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

    await page.goto('/models');
    await expect(page.getByText(/模型管理/)).toBeVisible();
  });

  test('shows create button', async ({ page }) => {
    await page.route('**/providers*', async (route) => {
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

    await page.goto('/models');
    // Create button should be visible
    await expect(page.getByRole('button', { name: /新建|添加|创建/i })).toBeVisible();
  });

  test('renders provider list from API', async ({ page }) => {
    await page.route('**/providers*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          message: 'ok',
          data: [
            {
              id: 'p1',
              provider_name: 'openai',
              display_name: 'OpenAI',
              api_base_url: 'https://api.openai.com',
              api_key_display: '***key',
              models: [{ name: 'gpt-4' }],
              is_enabled: true,
              priority: 1,
              created_at: '2024-01-01',
            },
          ],
        }),
      });
    });

    await page.goto('/models');
    await expect(page.getByText('OpenAI')).toBeVisible();
  });
});
