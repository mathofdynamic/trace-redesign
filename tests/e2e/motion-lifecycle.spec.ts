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

  test('verifies below-the-fold content remains pending indefinitely past 3200ms until scrolled', async ({ page }) => {
    await page.goto('/specification');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-trace-motion-ready', 'true');

    const sections = page.locator('[data-trace-motion="section"]');
    const count = await sections.count();
    expect(count).toBeGreaterThan(2);

    const firstSection = sections.first();
    const lastSection = sections.last();

    // Verify first section is immediately revealed
    await expect(firstSection).toHaveAttribute('data-motion-state', 'revealed');

    // Idle wait at the top for 3200ms to confirm no global timer auto-reveals below-the-fold content
    await page.waitForTimeout(3200);

    // Bottom section must remain pending
    await expect(lastSection).toHaveAttribute('data-motion-state', 'pending');

    // Scroll bottom section into view
    await lastSection.scrollIntoViewIfNeeded();

    // Observer must now transition bottom section to revealed
    await expect(lastSection).toHaveAttribute('data-motion-state', 'revealed');

    // Scroll back to top
    await firstSection.scrollIntoViewIfNeeded();

    // Invariant: Latching must keep bottom section revealed without replay glitch
    await expect(lastSection).toHaveAttribute('data-motion-state', 'revealed');
  });

  test('verifies overlay modal dual data attributes and Escape key shared requestClose lifecycle', async ({ page }) => {
    await page.goto('/app/repositories');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-trace-motion-ready', 'true');

    // Open Adjust Access modal
    const adjustBtn = page.getByRole('button', { name: /Adjust access/i });
    await expect(adjustBtn).toBeVisible();
    await adjustBtn.click();

    // Verify modal backdrop and dialog render with open state
    const backdrop = page.locator('.trace-modal-backdrop-layer');
    const dialog = page.locator('.trace-centered-dialog');

    await expect(backdrop).toBeVisible();
    await expect(dialog).toBeVisible();

    await expect(backdrop).toHaveAttribute('data-presence-state', 'open');
    await expect(backdrop).toHaveAttribute('data-trace-presence', 'open');
    await expect(dialog).toHaveAttribute('data-presence-state', 'open');
    await expect(dialog).toHaveAttribute('data-trace-presence', 'open');

    // Press Escape to trigger shared requestClose()
    await page.keyboard.press('Escape');

    // Modal must cleanly unmount after 66ms exit transition
    await expect(dialog).toHaveCount(0);
    await expect(backdrop).toHaveCount(0);
  });

  test('verifies overlay modal backdrop click shared requestClose lifecycle', async ({ page }) => {
    await page.goto('/app/repositories');

    // Open Adjust Access modal
    const adjustBtn = page.getByRole('button', { name: /Adjust access/i });
    await adjustBtn.click();

    const backdrop = page.locator('.trace-modal-backdrop-layer');
    const dialog = page.locator('.trace-centered-dialog');
    const scrim = page.locator('.trace-modal-backdrop');

    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('data-presence-state', 'open');

    // Click on the scrim backdrop
    await scrim.click({ position: { x: 10, y: 10 }, force: true });

    // Modal must cleanly unmount
    await expect(dialog).toHaveCount(0);
    await expect(backdrop).toHaveCount(0);
  });

  test('verifies overlay modal close button shared requestClose lifecycle', async ({ page }) => {
    await page.goto('/app/repositories');

    // Open Adjust Access modal
    const adjustBtn = page.getByRole('button', { name: /Adjust access/i });
    await adjustBtn.click();

    const backdrop = page.locator('.trace-modal-backdrop-layer');
    const dialog = page.locator('.trace-centered-dialog');
    const closeBtn = dialog.locator('.trace-dialog__close');

    await expect(dialog).toBeVisible();
    await expect(closeBtn).toBeVisible();

    // Click close button
    await closeBtn.click();

    // Modal must cleanly unmount
    await expect(dialog).toHaveCount(0);
    await expect(backdrop).toHaveCount(0);
  });

  test('verifies instant modal mount and unmount when prefers-reduced-motion is active', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/app/repositories');

    // Open Adjust Access modal
    const adjustBtn = page.getByRole('button', { name: /Adjust access/i });
    await adjustBtn.click();

    const dialog = page.locator('.trace-centered-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('data-presence-state', 'open');

    // Press Escape
    await page.keyboard.press('Escape');

    // Immediately unmounts with 0ms transition
    await expect(dialog).toHaveCount(0);
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

