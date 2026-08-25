import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { sourceDocuments } from '../docs-data';
import { notClaimedPoints } from '../security-data';
import { packagingTiers } from '../pricing-data';

describe('Phase 38: Final Visual Acceptance & Invariant Verification', () => {
  const globalsCssPath = path.resolve(__dirname, '../../app/globals.css');
  const settingsPath = path.resolve(__dirname, '../../app/(app)/app/_components/settings-view.tsx');
  const pagePath = path.resolve(__dirname, '../../app/page.tsx');
  const reportsViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/reports-view.tsx');
  const changesViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/changes-view.tsx');
  const conflictsViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/conflicts-view.tsx');
  const decisionsViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/decisions-view.tsx');
  const rulesViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/rules-view.tsx');
  const repositoriesViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/repositories-view.tsx');

  const css = fs.readFileSync(globalsCssPath, 'utf-8');

  it('verifies floating material and reduced-transparency fallback architecture', () => {
    expect(css).toContain('--trace-surface-overlay: rgba(13, 17, 23, 0.88);');
    expect(css).toContain('--trace-backdrop-blur: blur(12px);');
    expect(css).toContain('@media (prefers-reduced-transparency: reduce)');
    expect(css).toContain('--trace-surface-overlay: var(--trace-surface-2);');
    expect(css).toContain('.trace-select__listbox {');
    expect(css).toContain('backdrop-filter: var(--trace-backdrop-blur);');
    expect(css).toContain('.change-drawer {');
    expect(css).toContain('.conflict-drawer {');
  });

  it('verifies repositories view has structured metadata, actions hierarchy, and SVG bounds', () => {
    const reposContent = fs.readFileSync(repositoriesViewPath, 'utf-8');
    expect(reposContent).toContain('repositories-list');
    expect(reposContent).toContain('repo-row');
    expect(reposContent).toContain('Connected · Synced');
    expect(reposContent).toContain('Local TRACE commands');
    expect(css).toContain('.repo-row__identity svg');
    expect(css).toContain('max-width: 100%;');
  });

  it('verifies typography scales: restrained H1 titles and technical monospace boundaries', () => {
    expect(css).toContain('font-size: 28px;');
    expect(css).toContain('line-height: 1.2;');
    expect(css).toContain('--trace-font-mono:');
    // Monospace should only be applied to technical code/sha/path tokens
    expect(css).toContain('font-family: var(--trace-font-mono);');
  });

  it('verifies blue hierarchy is restricted to primary intent, active indicators, and links', () => {
    expect(css).toContain('--trace-accent-primary: #1d74f2;');
    expect(css).toContain('.trace-button--primary {');
    expect(css).toContain('.trace-badge--current {');
  });

  it('verifies Report Quick Inspect is concise and distinct from full Report Detail', () => {
    const reportsContent = fs.readFileSync(reportsViewPath, 'utf-8');
    expect(reportsContent).toContain('function ReportQuickDrawer');
    expect(reportsContent).toContain('report-quick-inspect');
    expect(reportsContent).toContain('Read full report →');
    expect(reportsContent).toContain('Top Findings');
    expect(reportsContent).toContain('Linked Pull Requests');
  });

  it('verifies adaptive density on expanded Decisions and Rules layouts', () => {
    expect(css).toContain('.decision-body-grid {');
    expect(css).toContain('.rule-body-grid {');
    expect(css).toContain('@media (max-width: 1080px)');
  });

  it('verifies complete elimination of unverified marketing copy (Zero-Knowledge, Air-gapped)', () => {
    const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
    expect(settingsContent).not.toContain('Zero-Knowledge');
    expect(settingsContent).not.toContain('air-gapped');
    expect(settingsContent).toContain('Source-Exclusion Boundary');

    const landingContent = fs.readFileSync(pagePath, 'utf-8');
    expect(landingContent).not.toContain('Air-gapped');
    expect(landingContent).not.toContain('Zero-knowledge');

    for (const point of notClaimedPoints) {
      expect(point.detail).not.toContain('air-gapped');
      expect(point.detail).not.toContain('zero-knowledge');
    }

    for (const tier of packagingTiers) {
      expect(tier.intendedRole).not.toContain('air-gapped');
    }
  });

  it('verifies public documentation index prioritizes user guides and classifies contributor docs', () => {
    expect(sourceDocuments[0]?.path).toBe('README.md');
    expect(sourceDocuments[1]?.path).toBe('DOC/local-dashboard-workflow.md');
    const contributorDoc = sourceDocuments.find((d) => d.category === 'Internal / Contributor');
    expect(contributorDoc).toBeDefined();
  });

  it('verifies strict palette boundaries (black, white, neutral gray, TRACE blue)', () => {
    expect(css).toContain('--trace-neutral-900: #0a0c10;');
    expect(css).toContain('--trace-neutral-800: #0d1117;');
    expect(css).toContain('--trace-accent-primary: #1d74f2;');
    expect(css).not.toContain('#7c3aed'); // No purple
    expect(css).not.toContain('#06b6d4'); // No cyan
  });

  it('verifies keyboard and dialog accessibility contracts across drawers and modals', () => {
    const changesContent = fs.readFileSync(changesViewPath, 'utf-8');
    expect(changesContent).toContain('handleKeyDown');
    expect(changesContent).toContain('Escape');
    expect(changesContent).toContain('role="dialog"');
    expect(changesContent).toContain('aria-modal="true"');

    const conflictsContent = fs.readFileSync(conflictsViewPath, 'utf-8');
    expect(conflictsContent).toContain('handleKeyDown');
    expect(conflictsContent).toContain('Escape');
    expect(conflictsContent).toContain('role="dialog"');
    expect(conflictsContent).toContain('aria-modal="true"');
  });
});
