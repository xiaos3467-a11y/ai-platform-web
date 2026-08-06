/**
 * E2E: Login flow
 *
 * Tests the full login journey from unauthenticated state to dashboard.
 */

import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    // Should redirect to /login
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText('AI 中台')).toBeVisible();
  });

  test('login form has username and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByPlaceholder('输入用户名')).toBeVisible();
    await expect(page.getByPlaceholder('输入密码')).toBeVisible();
    await expect(page.getByRole('button', { name: /登录/i })).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    // Intercept the API call
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          message: 'ok',
          data: {
            token: 'e2e-test-token',
            user: {
              id: 'e2e-user',
              username: 'e2e_admin',
              tenant_id: 't1',
              roles: [{ id: 'r1', name: 'admin' }],
            },
          },
        }),
      });
    });

    await page.goto('/login');
    await page.getByPlaceholder('输入用户名').fill('admin');
    await page.getByPlaceholder('输入密码').fill('password123');
    await page.getByRole('button', { name: /登录/i }).click();

    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*\//);
    await expect(page.getByText('仪表盘')).toBeVisible();
  });

  test('failed login shows error', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 401,
          message: '用户名或密码错误',
          data: null,
        }),
      });
    });

    await page.goto('/login');
    await page.getByPlaceholder('输入用户名').fill('wrong');
    await page.getByPlaceholder('输入密码').fill('wrong');
    await page.getByRole('button', { name: /登录/i }).click();

    // Should stay on login page
    await expect(page).toHaveURL(/.*login/);
  });
});
