import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Phase 23 — Mobile & Responsive Pass Verification', () => {
  const cssPath = fs.existsSync(path.resolve(process.cwd(), 'app/globals.css'))
    ? path.resolve(process.cwd(), 'app/globals.css')
    : path.resolve(process.cwd(), 'apps/web/app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  it('includes mobile typography clamp constraints for hero headlines', () => {
    // Verifies hero clamp scales appropriately on small screens without overwhelming the viewport
    expect(cssContent).toContain('font-size: clamp(26px, 7.5vw, 36px)');
  });

  it('includes mobile breakpoints for app shell topbar and breadcrumb truncation', () => {
    expect(cssContent).toContain('.breadcrumb__workspace,');
    expect(cssContent).toContain('.breadcrumb__separator {');
    expect(cssContent).toContain('display: none;');
  });

  it('includes repository context and switcher responsive modal positioning', () => {
    expect(cssContent).toContain('.repository-switcher {');
    expect(cssContent).toContain('position: fixed;');
  });

  it('includes responsive stacking for conflict paired comparison cards', () => {
    expect(cssContent).toContain('.conflict-side-card--a {');
    expect(cssContent).toContain('order: 1;');
    expect(cssContent).toContain('.conflict-shared-boundary {');
    expect(cssContent).toContain('order: 2;');
    expect(cssContent).toContain('.conflict-side-card--b {');
    expect(cssContent).toContain('order: 3;');
  });

  it('includes horizontal scrolling with touch support for repository tabs', () => {
    expect(cssContent).toContain('.repository-tabs {');
    expect(cssContent).toContain('overflow-x: auto;');
    expect(cssContent).toContain('-webkit-overflow-scrolling: touch;');
  });

  it('includes report detail single column layout on smaller screens', () => {
    expect(cssContent).toContain('.report-detail-layout {');
    expect(cssContent).toContain('grid-template-columns: 1fr;');
  });

  it('includes touch-friendly minimum heights and reduced motion query', () => {
    expect(cssContent).toContain('@media (hover: none) and (pointer: coarse)');
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('overflow-wrap: anywhere;');
  });
});
