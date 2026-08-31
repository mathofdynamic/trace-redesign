import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Phase 51: Authenticated Dashboard Page-by-Page Motion Coverage', () => {
  const componentsDir = path.resolve(__dirname, '../../app/(app)/app/_components');
  const appDir = path.resolve(__dirname, '../../app/(app)/app');

  const authenticatedViews = [
    { file: 'page.tsx', name: 'Overview Dashboard' },
    { file: 'repositories/page.tsx', name: 'Repositories List' },
    { file: 'repositories/[repositoryId]/page.tsx', name: 'Repository Detail' },
    { file: 'repositories/[repositoryId]/[view]/page.tsx', name: 'Repository Sub-views' },
    { file: '_components/changes-view.tsx', name: 'Changes Feed' },
    { file: '_components/conflicts-view.tsx', name: 'Conflicts & Incompatibilities' },
    { file: '_components/reports-view.tsx', name: 'Reports Archive' },
    { file: '_components/report-detail-view.tsx', name: 'Report Detail' },
    { file: '_components/decisions-view.tsx', name: 'Architecture Decisions (ADRs)' },
    { file: '_components/rules-view.tsx', name: 'Governance Rules' },
    { file: '_components/activity-view.tsx', name: 'Workspace Activity Timeline' },
    { file: '_components/settings-view.tsx', name: 'Workspace Settings' },
    { file: '_components/documentation-view.tsx', name: 'Technical Documentation' },
  ];

  it('verifies all 13 authenticated views contain valid motion markup', () => {
    for (const view of authenticatedViews) {
      const filePath = path.join(appDir, view.file);
      expect(fs.existsSync(filePath), `Component file ${view.file} should exist`).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for motion attributes
      const hasMotionItem = content.includes('data-trace-motion="item"');
      const hasMotionSection = content.includes('data-trace-motion="section"');
      const hasMotionIndex = content.includes('--motion-index');

      expect(
        hasMotionItem || hasMotionSection,
        `${view.name} (${view.file}) should contain data-trace-motion markup`,
      ).toBe(true);

      expect(
        hasMotionIndex,
        `${view.name} (${view.file}) should define --motion-index for staggered entrance`,
      ).toBe(true);
    }
  });

  it('verifies DashboardShell maintains persistent fixtures and entrance motion properties', () => {
    const shellPath = path.join(componentsDir, 'dashboard-shell.tsx');
    expect(fs.existsSync(shellPath)).toBe(true);
    const content = fs.readFileSync(shellPath, 'utf-8');

    // Sidebar and topbar are persistent fixtures in dashboard shell
    expect(content.includes('dashboard-sidebar')).toBe(true);
    expect(content.includes('dashboard-topbar')).toBe(true);

    // Sidebar and topbar contain motion attributes for initial entrance
    expect(content.includes('data-trace-motion="item"')).toBe(true);
  });

  it('verifies global CSS contains motion keyframes and reduced motion rules', () => {
    const cssPath = path.resolve(__dirname, '../../app/globals.css');
    expect(fs.existsSync(cssPath)).toBe(true);
    const css = fs.readFileSync(cssPath, 'utf-8');

    // Keyframes and tokens
    expect(css.includes('--trace-motion-lead: 66.6667ms')).toBe(true);
    expect(css.includes('--trace-motion-duration: 200ms')).toBe(true);
    expect(css.includes('@keyframes traceItemEntrance')).toBe(true);
    expect(css.includes('@media (prefers-reduced-motion: reduce)')).toBe(true);
    expect(css.includes('[data-trace-motion="item"]')).toBe(true);
    expect(css.includes('[data-trace-motion="section"]')).toBe(true);
  });
});


