import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 36: Drawers, Quick Inspect & Expanded Density', () => {
  const reportsViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/reports-view.tsx');
  const changesViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/changes-view.tsx');
  const conflictsViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/conflicts-view.tsx');
  const decisionsViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/decisions-view.tsx');
  const rulesViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/rules-view.tsx');
  const globalsCssPath = path.resolve(__dirname, '../../app/globals.css');

  it('verifies ReportQuickDrawer in reports-view.tsx is a summary-only quick inspect surface', () => {
    const content = fs.readFileSync(reportsViewPath, 'utf-8');
    expect(content).toContain('function ReportQuickDrawer');
    expect(content).toContain('report-quick-inspect');
    expect(content).toContain('Quick Inspect');
    expect(content).toContain('trace inspect');
    expect(content).toContain('Read full report');
  });

  it('verifies ChangeDetailDrawer in changes-view.tsx has copyable CLI command and structured context', () => {
    const content = fs.readFileSync(changesViewPath, 'utf-8');
    expect(content).toContain('function ChangeDetailDrawer');
    expect(content).toContain('trace pr inspect');
    expect(content).toContain('copyCliCommand');
  });

  it('verifies ConflictDetailDrawer in conflicts-view.tsx has reproduction CLI action and tight rhythm', () => {
    const content = fs.readFileSync(conflictsViewPath, 'utf-8');
    expect(content).toContain('function ConflictDetailDrawer');
    expect(content).toContain('copyCliCommand');
    expect(content).toContain('trace analyze');
  });

  it('verifies adaptive grid styling for expanded decisions and rules surfaces in globals.css', () => {
    const cssContent = fs.readFileSync(globalsCssPath, 'utf-8');
    expect(cssContent).toContain('.decision-body-grid');
    expect(cssContent).toContain('.rule-body-grid');
    expect(cssContent).toContain('.change-drawer__cli-box');
    expect(cssContent).toContain('.conflict-drawer__cli-box');
  });
});
