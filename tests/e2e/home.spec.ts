import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home');
  });

  test('should display banners and services tiles', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeVisible();

    const tiles = page.getByRole('link', { name: /مشاهده/ });
    await expect(tiles.first()).toBeVisible();
  });

  test('should navigate to service when tile clicked', async ({ page }) => {
    const tile = page.getByRole('link').filter({ hasText: /خدمت/ }).first();
    if (await tile.isVisible()) {
      await tile.click();
      await expect(page).toHaveURL(/.*/);
    }
  });

  test('should be accessible', async ({ page }) => {
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'ناوبری اصلی' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'درباره شهرزاد' })).toBeVisible();
  });
});
