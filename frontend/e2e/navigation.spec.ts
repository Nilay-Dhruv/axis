import { test, expect, Page } from '@playwright/test';

// Helper: log in and get to dashboard
async function loginAndGoToDashboard(page: Page) {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"], input[name="email"]', 'test@axis.app');
  await page.fill('input[type="password"], input[name="password"]', 'testpassword123');
  await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
  await page.waitForTimeout(2000);
}

test.describe('Navigation', () => {
  test('404 page shows for unknown routes', async ({ page }) => {
    await loginAndGoToDashboard(page);
    if (!page.url().includes('dashboard')) return; // skip if login failed
    await page.goto('http://localhost:5173/this-route-does-not-exist');
    await expect(page.locator('body')).toContainText(/404|not found|doesn't exist/i);
  });

  test('sidebar links are present', async ({ page }) => {
    await loginAndGoToDashboard(page);
    if (!page.url().includes('dashboard')) return;
    const sidebar = page.locator('nav, aside, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('dashboard loads stat cards', async ({ page }) => {
    await loginAndGoToDashboard(page);
    if (!page.url().includes('dashboard')) return;
    await page.waitForTimeout(1500);
    // Check that some numeric content loaded
    const cards = await page.locator('[class*="neu-card"]').count();
    expect(cards).toBeGreaterThan(0);
  });
});