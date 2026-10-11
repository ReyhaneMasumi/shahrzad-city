import { test, expect } from '@playwright/test';
import { fa } from '@/shared/i18n/fa';

// The shell switches between header/footer (desktop) and bottom nav below the
// 64rem (1024px) breakpoint. Kept as a literal so the spec does not import tokens.
const SHELL_BREAKPOINT_PX = 1024;

test.describe('Home page', () => {
  let consoleErrors: string[];
  let pageErrors: string[];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];
    // Listeners attached before navigation so load/hydration-time errors are captured.
    page.on('console', (msg) => {
      // Playwright omits the resource URL from msg.text(); append it so the
      // ignored predicate can scope past expected next/link RSC prefetch 404s.
      if (msg.type() === 'error') consoleErrors.push(`${msg.text()} ${msg.location().url}`);
    });
    page.on('pageerror', (error) => pageErrors.push(String(error)));

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load without console errors', async ({ page }) => {
    await page.waitForTimeout(2000);
    const ignored = (e: string) =>
      e.includes('favicon') ||
      (e.includes('?_rsc=') && e.includes('404')) ||
      e.includes('Service Worker context closed') ||
      e.includes('Network Error') ||
      e.includes('ApiError');
    expect(consoleErrors.filter((e) => !ignored(e))).toHaveLength(0);
    expect(pageErrors).toHaveLength(0);
  });

  test('should have proper landmarks', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    const width = page.viewportSize()?.width ?? 0;
    if (width >= SHELL_BREAKPOINT_PX) {
      await expect(page.getByRole('navigation', { name: fa.header.navLabel })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'footer links' })).toBeVisible();
    } else {
      await expect(page.getByRole('navigation', { name: fa.bottomNav.navLabel })).toBeVisible();
    }
  });

  test('should have bottom navigation on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Bottom navigation only on mobile');
    await expect(page.getByRole('navigation', { name: fa.bottomNav.navLabel })).toBeVisible({
      timeout: 5000,
    });
  });
});
