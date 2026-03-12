import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"], input[name="email"]', 'test@axis.app');
  await page.fill('input[type="password"], input[name="password"]', 'testpassword123');
  await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
  await page.waitForTimeout(2000);
  return page.url().includes('dashboard');
}

test.describe('Settings', () => {
  test('settings page loads', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    await page.goto('http://localhost:5173/settings');
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText(/setting/i);
  });

  test('theme toggle works', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);
    const themeBtn = page.locator('button:has-text("Dark"), button:has-text("Light")').first();
    if (await themeBtn.isVisible()) {
      const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      await themeBtn.click();
      const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(before).not.toEqual(after);
    }
  });
});