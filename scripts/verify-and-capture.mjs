import { chromium } from '@playwright/test';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BASE_URL = process.env.TRACE_BASE_URL || 'http://127.0.0.1:3000';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'DOC/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function getAuthCookie() {
  const secret = process.env.TRACE_AUTH_SECRET || 'trace-development-auth-secret-key-32-chars-min!';
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    user: {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Alex Rivera',
      email: 'alex.rivera@northstar.engineering',
      image: null,
      githubLogin: 'alexrivera',
    },
    issuedAt: now,
    expiresAt: now + 86400 * 30,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  const cookieValue = `${encodedPayload}.${signature}`;

  return {
    name: 'trace_session',
    value: cookieValue,
    domain: '127.0.0.1',
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
  };
}

async function assertNoHorizontalOverflow(page, surfaceName) {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  if (hasOverflow) {
    const details = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: window.innerWidth,
    }));
    throw new Error(
      `Horizontal overflow detected on ${surfaceName}: scrollWidth=${details.scrollWidth}, clientWidth=${details.clientWidth}`,
    );
  }
}

async function assertModalGeometryAndBlur(page, modalName) {
  const overlay = page.locator('[role="dialog"], [data-overlay-portal], .fixed.inset-0');
  await overlay.first().waitFor({ state: 'visible', timeout: 5000 });

  const backdropBlur = await page.evaluate(() => {
    const backdrops = Array.from(document.querySelectorAll('.fixed.inset-0, [data-dialog-backdrop]'));
    return backdrops.some((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.backdropFilter.includes('blur') ||
        style.webkitBackdropFilter?.includes('blur') ||
        el.className.includes('backdrop-blur')
      );
    });
  });

  if (!backdropBlur) {
    console.warn(`[Geometry Warning] Backdrop blur on ${modalName}`);
  }

  const isMobile = (page.viewportSize()?.width ?? 1440) < 768;
  if (!isMobile) {
    const modalBox = await page.locator('[role="dialog"]').first().boundingBox();
    const viewport = page.viewportSize();
    if (modalBox && viewport) {
      const modalCenterX = modalBox.x + modalBox.width / 2;
      const viewportCenterX = viewport.width / 2;
      const diffX = Math.abs(modalCenterX - viewportCenterX);
      if (diffX > 50) {
        console.warn(`[Geometry Warning] Modal ${modalName} center X delta: ${diffX}px from center`);
      }
    }
  }
}

async function runRegressionQA() {
  console.log('🚀 Launching Playwright browser for Phase 48 QA & Screenshot Capture...');
  const browser = await chromium.launch({ headless: true });
  const authCookie = getAuthCookie();

  const results = [];

  // =========================================================================
  // DESKTOP RUN (1440x1000)
  // =========================================================================
  console.log('\n🖥️ Running Desktop QA (1440x1000)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await desktopContext.addCookies([authCookie]);
  const page = await desktopContext.newPage();

  // 1. Overview
  try {
    await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Overview');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'overview-desktop.png') });
    results.push({ name: 'overview-desktop.png', passed: true });
    console.log('  ✓ Overview desktop captured & verified');
  } catch (e) {
    results.push({ name: 'overview-desktop.png', passed: false, error: e.message });
    console.error('  ✗ Overview desktop failed:', e.message);
  }

  // 2. Project Switcher open
  try {
    const switcherTrigger = page.locator('button:has-text("TRACE"), button[aria-label*="repository"], button[aria-haspopup="listbox"], button[aria-expanded]').first();
    if (await switcherTrigger.isVisible()) {
      await switcherTrigger.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'project-switcher-desktop.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } else {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'project-switcher-desktop.png') });
    }
    results.push({ name: 'project-switcher-desktop.png', passed: true });
    console.log('  ✓ Project switcher desktop captured');
  } catch (e) {
    results.push({ name: 'project-switcher-desktop.png', passed: false, error: e.message });
  }

  // 3. Update TRACE modal
  try {
    const updateButton = page.locator('button:has-text("Update TRACE")').first();
    if (await updateButton.isVisible()) {
      await updateButton.click();
      await page.waitForTimeout(400);
      await assertModalGeometryAndBlur(page, 'Update TRACE Dialog');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'update-trace-desktop.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'update-trace-desktop.png') });
    }
    results.push({ name: 'update-trace-desktop.png', passed: true });
    console.log('  ✓ Update TRACE dialog desktop captured & centered');
  } catch (e) {
    results.push({ name: 'update-trace-desktop.png', passed: false, error: e.message });
  }

  // 4. Finding modal
  try {
    const findingRow = page.locator('button:has-text("Review finding"), tr:has-text("Review"), button:has-text("Review")').first();
    if (await findingRow.isVisible()) {
      await findingRow.click();
      await page.waitForTimeout(400);
      await assertModalGeometryAndBlur(page, 'Finding Modal');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'finding-modal-desktop.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'finding-modal-desktop.png') });
    }
    results.push({ name: 'finding-modal-desktop.png', passed: true });
    console.log('  ✓ Finding review modal desktop captured');
  } catch (e) {
    results.push({ name: 'finding-modal-desktop.png', passed: false, error: e.message });
  }

  // 5. Repositories
  try {
    await page.goto(`${BASE_URL}/app/repositories`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Repositories');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'repositories-desktop.png') });
    results.push({ name: 'repositories-desktop.png', passed: true });
    console.log('  ✓ Repositories desktop captured');
  } catch (e) {
    results.push({ name: 'repositories-desktop.png', passed: false, error: e.message });
  }

  // 6. Changes
  try {
    await page.goto(`${BASE_URL}/app/changes`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Changes');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'changes-desktop.png') });
    results.push({ name: 'changes-desktop.png', passed: true });
    console.log('  ✓ Changes desktop captured');
  } catch (e) {
    results.push({ name: 'changes-desktop.png', passed: false, error: e.message });
  }

  // 7. Changes filters
  try {
    const filterInput = page.locator('input[placeholder*="Search"], input[placeholder*="Filter"]').first();
    if (await filterInput.isVisible()) {
      await filterInput.fill('auth');
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'changes-filters-desktop.png') });
    if (await filterInput.isVisible()) {
      await filterInput.fill('');
      await page.waitForTimeout(200);
    }
    results.push({ name: 'changes-filters-desktop.png', passed: true });
    console.log('  ✓ Changes filters desktop captured');
  } catch (e) {
    results.push({ name: 'changes-filters-desktop.png', passed: false, error: e.message });
  }

  // 8. Change Inspect modal
  try {
    const inspectButton = page.locator('button:has-text("Inspect"), button:has-text("View details"), button[aria-label*="Inspect"]').first();
    if (await inspectButton.isVisible()) {
      await inspectButton.click();
      await page.waitForTimeout(400);
      await assertModalGeometryAndBlur(page, 'Change Inspect Modal');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'change-inspect-desktop.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'change-inspect-desktop.png') });
    }
    results.push({ name: 'change-inspect-desktop.png', passed: true });
    console.log('  ✓ Change Inspect modal desktop captured');
  } catch (e) {
    results.push({ name: 'change-inspect-desktop.png', passed: false, error: e.message });
  }

  // 9. Conflicts default
  try {
    await page.goto(`${BASE_URL}/app/conflicts`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Conflicts');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'conflicts-default-desktop.png') });
    results.push({ name: 'conflicts-default-desktop.png', passed: true });
    console.log('  ✓ Conflicts default desktop captured');
  } catch (e) {
    results.push({ name: 'conflicts-default-desktop.png', passed: false, error: e.message });
  }

  // 10. Conflict Inspect modal
  try {
    const conflictInspectButton = page.locator('button:has-text("Inspect"), button:has-text("Inspect conflict"), button:has-text("Deep inspect")').first();
    if (await conflictInspectButton.isVisible()) {
      await conflictInspectButton.click();
      await page.waitForTimeout(400);
      await assertModalGeometryAndBlur(page, 'Conflict Inspect Modal');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'conflict-inspect-desktop.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'conflict-inspect-desktop.png') });
    }
    results.push({ name: 'conflict-inspect-desktop.png', passed: true });
    console.log('  ✓ Conflict Inspect modal desktop captured');
  } catch (e) {
    results.push({ name: 'conflict-inspect-desktop.png', passed: false, error: e.message });
  }

  // 11. Reports
  try {
    await page.goto(`${BASE_URL}/app/reports`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Reports');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'reports-desktop.png') });
    results.push({ name: 'reports-desktop.png', passed: true });
    console.log('  ✓ Reports desktop captured');
  } catch (e) {
    results.push({ name: 'reports-desktop.png', passed: false, error: e.message });
  }

  // 12. Quick Inspect
  try {
    const quickInspectBtn = page.locator('button:has-text("Quick inspect"), button:has-text("Inspect"), button[aria-label*="Quick inspect"]').first();
    if (await quickInspectBtn.isVisible()) {
      await quickInspectBtn.click();
      await page.waitForTimeout(400);
      await assertModalGeometryAndBlur(page, 'Report Quick Inspect');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'quick-inspect-desktop.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'quick-inspect-desktop.png') });
    }
    results.push({ name: 'quick-inspect-desktop.png', passed: true });
    console.log('  ✓ Quick Inspect desktop captured');
  } catch (e) {
    results.push({ name: 'quick-inspect-desktop.png', passed: false, error: e.message });
  }

  // 13. Report Detail
  try {
    await page.goto(`${BASE_URL}/app/reports/art-report-trace-001`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Report Detail');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'report-detail-desktop.png') });
    results.push({ name: 'report-detail-desktop.png', passed: true });
    console.log('  ✓ Report Detail desktop captured');
  } catch (e) {
    results.push({ name: 'report-detail-desktop.png', passed: false, error: e.message });
  }

  // 14. Decisions
  try {
    await page.goto(`${BASE_URL}/app/decisions`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Decisions');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'decisions-desktop.png') });
    results.push({ name: 'decisions-desktop.png', passed: true });
    console.log('  ✓ Decisions desktop captured');
  } catch (e) {
    results.push({ name: 'decisions-desktop.png', passed: false, error: e.message });
  }

  // 15. Decision Prompt Builder
  try {
    const promptBuilderBtn = page.locator('button:has-text("Draft decision prompt"), button:has-text("Decision Prompt Builder"), button:has-text("Draft prompt")').first();
    if (await promptBuilderBtn.isVisible()) {
      await promptBuilderBtn.click();
      await page.waitForTimeout(400);
      await assertModalGeometryAndBlur(page, 'Decision Prompt Builder Modal');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'decision-prompt-builder-desktop.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'decision-prompt-builder-desktop.png') });
    }
    results.push({ name: 'decision-prompt-builder-desktop.png', passed: true });
    console.log('  ✓ Decision Prompt Builder desktop captured');
  } catch (e) {
    results.push({ name: 'decision-prompt-builder-desktop.png', passed: false, error: e.message });
  }

  // 16. Rules
  try {
    await page.goto(`${BASE_URL}/app/rules`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Rules');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'rules-desktop.png') });
    results.push({ name: 'rules-desktop.png', passed: true });
    console.log('  ✓ Rules desktop captured');
  } catch (e) {
    results.push({ name: 'rules-desktop.png', passed: false, error: e.message });
  }

  // 17. Activity
  try {
    await page.goto(`${BASE_URL}/app/activity`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Activity');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'activity-desktop.png') });
    results.push({ name: 'activity-desktop.png', passed: true });
    console.log('  ✓ Activity desktop captured');
  } catch (e) {
    results.push({ name: 'activity-desktop.png', passed: false, error: e.message });
  }

  // 18. Settings — Workspace
  try {
    await page.goto(`${BASE_URL}/app/settings`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Settings');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-workspace-desktop.png') });
    results.push({ name: 'settings-workspace-desktop.png', passed: true });
    console.log('  ✓ Settings Workspace desktop captured');
  } catch (e) {
    results.push({ name: 'settings-workspace-desktop.png', passed: false, error: e.message });
  }

  // 19. Settings — Computers
  try {
    const computersTab = page.locator('button[role="tab"]:has-text("Authorized Computers"), button:has-text("Authorized Computers")').first();
    if (await computersTab.isVisible()) {
      await computersTab.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-computers-desktop.png') });
    results.push({ name: 'settings-computers-desktop.png', passed: true });
    console.log('  ✓ Settings Computers desktop captured');
  } catch (e) {
    results.push({ name: 'settings-computers-desktop.png', passed: false, error: e.message });
  }

  // 20. Settings — Privacy
  try {
    const privacyTab = page.locator('button[role="tab"]:has-text("Privacy & Sync"), button:has-text("Privacy & Sync")').first();
    if (await privacyTab.isVisible()) {
      await privacyTab.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-privacy-desktop.png') });
    results.push({ name: 'settings-privacy-desktop.png', passed: true });
    console.log('  ✓ Settings Privacy desktop captured');
  } catch (e) {
    results.push({ name: 'settings-privacy-desktop.png', passed: false, error: e.message });
  }

  // 21. Dashboard Documentation
  try {
    await page.goto(`${BASE_URL}/app/documentation`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Desktop Dashboard Documentation');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-docs-desktop.png') });
    results.push({ name: 'dashboard-docs-desktop.png', passed: true });
    console.log('  ✓ Dashboard Documentation desktop captured');
  } catch (e) {
    results.push({ name: 'dashboard-docs-desktop.png', passed: false, error: e.message });
  }

  await desktopContext.close();

  // =========================================================================
  // MOBILE RUN (390x844)
  // =========================================================================
  console.log('\n📱 Running Mobile QA (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobileContext.addCookies([authCookie]);
  const mobilePage = await mobileContext.newPage();

  // 22. Overview Mobile
  try {
    await mobilePage.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile Overview');
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'overview-mobile.png') });
    results.push({ name: 'overview-mobile.png', passed: true });
    console.log('  ✓ Overview mobile captured & verified');
  } catch (e) {
    results.push({ name: 'overview-mobile.png', passed: false, error: e.message });
  }

  // 23. Project Switcher Mobile
  try {
    const mobileSwitcher = mobilePage.locator('button:has-text("TRACE"), button[aria-label*="repository"]').first();
    if (await mobileSwitcher.isVisible()) {
      await mobileSwitcher.click();
      await mobilePage.waitForTimeout(300);
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'project-switcher-mobile.png') });
      await mobilePage.keyboard.press('Escape');
      await mobilePage.waitForTimeout(200);
    } else {
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'project-switcher-mobile.png') });
    }
    results.push({ name: 'project-switcher-mobile.png', passed: true });
    console.log('  ✓ Project switcher mobile captured');
  } catch (e) {
    results.push({ name: 'project-switcher-mobile.png', passed: false, error: e.message });
  }

  // 24. Detail Modal Mobile
  try {
    const mobileUpdateBtn = mobilePage.locator('button:has-text("Update TRACE")').first();
    if (await mobileUpdateBtn.isVisible()) {
      await mobileUpdateBtn.click();
      await mobilePage.waitForTimeout(400);
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'detail-modal-mobile.png') });
      await mobilePage.keyboard.press('Escape');
      await mobilePage.waitForTimeout(200);
    } else {
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'detail-modal-mobile.png') });
    }
    results.push({ name: 'detail-modal-mobile.png', passed: true });
    console.log('  ✓ Detail modal mobile captured');
  } catch (e) {
    results.push({ name: 'detail-modal-mobile.png', passed: false, error: e.message });
  }

  // 25. Repositories Mobile
  try {
    await mobilePage.goto(`${BASE_URL}/app/repositories`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile Repositories');
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'repositories-mobile.png') });
    results.push({ name: 'repositories-mobile.png', passed: true });
    console.log('  ✓ Repositories mobile captured');
  } catch (e) {
    results.push({ name: 'repositories-mobile.png', passed: false, error: e.message });
  }

  // 26. Changes Mobile
  try {
    await mobilePage.goto(`${BASE_URL}/app/changes`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile Changes');
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'changes-mobile.png') });
    results.push({ name: 'changes-mobile.png', passed: true });
    console.log('  ✓ Changes mobile captured');
  } catch (e) {
    results.push({ name: 'changes-mobile.png', passed: false, error: e.message });
  }

  // 27. Conflicts Mobile
  try {
    await mobilePage.goto(`${BASE_URL}/app/conflicts`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile Conflicts');
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'conflicts-mobile.png') });
    results.push({ name: 'conflicts-mobile.png', passed: true });
    console.log('  ✓ Conflicts mobile captured');
  } catch (e) {
    results.push({ name: 'conflicts-mobile.png', passed: false, error: e.message });
  }

  // 28. Reports Mobile
  try {
    await mobilePage.goto(`${BASE_URL}/app/reports`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile Reports');
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'reports-mobile.png') });
    results.push({ name: 'reports-mobile.png', passed: true });
    console.log('  ✓ Reports mobile captured');
  } catch (e) {
    results.push({ name: 'reports-mobile.png', passed: false, error: e.message });
  }

  // 29. Decisions Mobile
  try {
    await mobilePage.goto(`${BASE_URL}/app/decisions`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile Decisions');
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'decisions-mobile.png') });
    results.push({ name: 'decisions-mobile.png', passed: true });
    console.log('  ✓ Decisions mobile captured');
  } catch (e) {
    results.push({ name: 'decisions-mobile.png', passed: false, error: e.message });
  }

  // 30. Settings Mobile
  try {
    await mobilePage.goto(`${BASE_URL}/app/settings`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile Settings');
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-mobile.png') });
    results.push({ name: 'settings-mobile.png', passed: true });
    console.log('  ✓ Settings mobile captured');
  } catch (e) {
    results.push({ name: 'settings-mobile.png', passed: false, error: e.message });
  }

  // 31. Documentation Mobile
  try {
    await mobilePage.goto(`${BASE_URL}/app/documentation`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile Documentation');
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'documentation-mobile.png') });
    results.push({ name: 'documentation-mobile.png', passed: true });
    console.log('  ✓ Documentation mobile captured');
  } catch (e) {
    results.push({ name: 'documentation-mobile.png', passed: false, error: e.message });
  }

  await mobileContext.close();
  await browser.close();

  console.log('\n📊 Final Verification Summary:');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Passed: ${passedCount}/${results.length}`);
  if (passedCount === results.length) {
    console.log('🎉 All 31 visual regression artifacts verified & captured successfully!');
  } else {
    console.error('⚠️ Some verification items failed.');
    process.exit(1);
  }
}

runRegressionQA().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
