import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.waitForTimeout(2000);
    expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  });

  test('should have proper landmarks', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'main navigation' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'footer links' })).toBeVisible();
  });

  test('should have bottom navigation on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Bottom navigation only on mobile');
    await expect(page.getByRole('navigation', { name: 'bottom navigation' })).toBeVisible({
      timeout: 5000,
    });
  });
});
