import { test, expect } from '@playwright/test';
import { fa } from '@/shared/i18n/fa';

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
    const ignored = (e: string) =>
      e.includes('favicon') || e.includes('404') || e.includes('Failed to load resource');
    expect(errors.filter((e) => !ignored(e))).toHaveLength(0);
  });

  test('should have proper landmarks', async ({ page, isMobile }) => {
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    if (isMobile) {
      await expect(page.getByRole('navigation', { name: fa.bottomNav.navLabel })).toBeVisible();
    } else {
      await expect(page.getByRole('navigation', { name: fa.header.navLabel })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'footer links' })).toBeVisible();
    }
  });

  test('should have bottom navigation on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Bottom navigation only on mobile');
    await expect(page.getByRole('navigation', { name: fa.bottomNav.navLabel })).toBeVisible({
      timeout: 5000,
    });
  });
});
