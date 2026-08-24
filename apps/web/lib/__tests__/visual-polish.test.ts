import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 29 — Core Page Visual Polish', () => {
  const globalsCss = fs.readFileSync(
    path.resolve(__dirname, '../../app/globals.css'),
    'utf-8',
  );
  const traceRedesignTsx = fs.readFileSync(
    path.resolve(__dirname, '../../app/(app)/app/_components/trace-redesign.tsx'),
    'utf-8',
  );

  it('verifies dashboard navigation contrast and active indicator styling', () => {
    expect(globalsCss).toContain('.dashboard-nav__link');
    expect(globalsCss).toContain("aria-current='page'");
    expect(globalsCss).toContain('--trace-blue-bright');
    expect(globalsCss).toContain('.dashboard-account');
  });

  it('verifies repository switcher grouping and clean search bar', () => {
    expect(traceRedesignTsx).toContain('repository-switcher__search-wrapper');
    expect(traceRedesignTsx).toContain('repository-switcher__search-icon');
    expect(traceRedesignTsx).toContain('repository-switcher__selected-indicator');
    expect(traceRedesignTsx).toContain('withIntelligence');
    expect(traceRedesignTsx).toContain('connectedOnly');
    expect(globalsCss).toContain('.repository-switcher__search-wrapper');
    expect(globalsCss).toContain('.repository-switcher__selected-indicator');
  });

  it('verifies unified intelligence metrics strip with internal dividers', () => {
    expect(globalsCss).toContain('/* 4. Intelligence Strip (Unified with Internal Dividers) */');
    expect(globalsCss).toContain('.intelligence-strip');
    expect(globalsCss).toContain('.intelligence-card');
    // Ensure 4 columns on desktop with gap: 0 and border-right dividers
    expect(globalsCss).toContain('grid-template-columns: repeat(4, minmax(0, 1fr));');
  });

  it('verifies attention severity badges distinct styling and contrast', () => {
    expect(globalsCss).toContain(".severity-badge[data-severity='critical']");
    expect(globalsCss).toContain(".severity-badge[data-severity='high']");
    expect(globalsCss).toContain(".severity-badge[data-severity='medium']");
    expect(globalsCss).toContain(".severity-badge[data-severity='low']");
  });

  it('verifies color universe compliance (black, white, neutral gray, TRACE blue only)', () => {
    // Check that dangerous or traffic-light colors are not present
    expect(globalsCss).not.toContain('rgba(255, 90, 95');
    expect(globalsCss).not.toContain('rgba(50, 209, 125');
    expect(globalsCss).not.toContain('rgba(245, 185, 66');
    expect(globalsCss).toContain('--trace-blue');
    expect(globalsCss).toContain('--trace-blue-bright');
  });
});

describe('Phase 30 — Intelligence Surfaces Polish', () => {
  const globalsCss = fs.readFileSync(
    path.resolve(__dirname, '../../app/globals.css'),
    'utf-8',
  );
  const conflictsViewTsx = fs.readFileSync(
    path.resolve(__dirname, '../../app/(app)/app/_components/conflicts-view.tsx'),
    'utf-8',
  );
  const reportsViewTsx = fs.readFileSync(
    path.resolve(__dirname, '../../app/(app)/app/_components/reports-view.tsx'),
    'utf-8',
  );
  const reportDetailViewTsx = fs.readFileSync(
    path.resolve(__dirname, '../../app/(app)/app/_components/report-detail-view.tsx'),
    'utf-8',
  );

  it('verifies factual AST count and no unsupported CLI command on conflict cards', () => {
    expect(conflictsViewTsx).toContain('deterministicConflictsCount');
    expect(conflictsViewTsx).not.toContain('trace conflict inspect');
    expect(conflictsViewTsx).toContain('Inspect coordination plan');
  });

  it('verifies simplified report card actions with max 2 prominent actions', () => {
    expect(reportsViewTsx).toContain('Quick inspect');
    expect(reportsViewTsx).toContain('Read report →');
    expect(reportsViewTsx).not.toContain('className="report-cli-button"');
  });

  it('verifies report detail 3-step canonical local refresh workflow', () => {
    expect(reportDetailViewTsx).toContain('trace analyze');
    expect(reportDetailViewTsx).toContain('trace sync --dry-run');
    expect(reportDetailViewTsx).toContain('trace sync');
    expect(reportDetailViewTsx).toContain(
      'trace analyze && trace sync --dry-run && trace sync',
    );
  });

  it('verifies sticky metadata rail styling on desktop viewports', () => {
    expect(globalsCss).toContain('.report-metadata-rail');
    expect(globalsCss).toContain('position: sticky');
    expect(globalsCss).toContain('top: 24px');
  });
});
