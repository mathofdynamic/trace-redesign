import { expect, test } from '@playwright/test';

test.describe('TRACE Entrance Motion & Presence Lifecycle E2E', () => {
  test('activates document motion ready state and reveals above-the-fold content', async ({ page }) => {
    await page.goto('/');

    // Verify document root receives data-trace-motion-ready
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-trace-motion-ready', 'true');

    // Verify header and hero sections are rendered and revealed
    const main = page.locator('main');
    await expect(main).toBeVisible();

    const sections = page.locator('[data-trace-motion="section"]');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);

    // Verify above-the-fold sections are revealed
    const firstSection = sections.first();
    await expect(firstSection).toHaveAttribute('data-motion-state', 'revealed');
  });

  test('preserves instant visibility when prefers-reduced-motion is active', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/product');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-trace-motion-ready', 'true');

    // Verify all sections are visible without layout blocking
    const sections = page.locator('[data-trace-motion="section"]');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(sections.nth(i)).toBeVisible();
    }
  });

  test('verifies motion items have deterministic stagger indices', async ({ page }) => {
    await page.goto('/specification');

    const motionItems = page.locator('[data-trace-motion="item"]');
    const count = await motionItems.count();
    expect(count).toBeGreaterThan(0);

    // Verify items have style with --motion-index
    const firstItem = motionItems.first();
    const styleAttr = await firstItem.getAttribute('style');
    expect(styleAttr).toContain('--motion-index');
  });

  test('verifies public routes entrance across documentation and security pages', async ({ page }) => {
    for (const path of ['/docs', '/security', '/pricing']) {
      await page.goto(path);
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-trace-motion-ready', 'true');

      const content = page.locator('main');
      await expect(content).toBeVisible();
    }
  });

  test('verifies long page below-the-fold observer latching and no-replay invariant', async ({ page }) => {
    await page.goto('/specification');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-trace-motion-ready', 'true');

    // Wait at top for > 1.5s to ensure idle stability
    await page.waitForTimeout(1500);

    const sections = page.locator('[data-trace-motion="section"]');
    const count = await sections.count();
    expect(count).toBeGreaterThan(1);

    // Scroll down to the last section
    const lastSection = sections.last();
    await lastSection.scrollIntoViewIfNeeded();
    await expect(lastSection).toHaveAttribute('data-motion-state', 'revealed');

    // Scroll back up to the top
    const firstSection = sections.first();
    await firstSection.scrollIntoViewIfNeeded();
    await expect(firstSection).toHaveAttribute('data-motion-state', 'revealed');

    // Verify last section remains marked revealed without replay glitch
    await expect(lastSection).toHaveAttribute('data-motion-state', 'revealed');
  });

  test('verifies mobile 390x844 viewport has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-trace-motion-ready', 'true');

    // Verify scrollWidth matches innerWidth (no horizontal overflow)
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);
  });
});
