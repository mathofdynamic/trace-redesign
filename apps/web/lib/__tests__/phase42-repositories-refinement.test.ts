import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  MOCK_REPOSITORIES,
  MOCK_ATTENTION,
  MOCK_REPORTS,
} from '../mock';
import { deriveTraceProjectState } from '../dashboard-state';

describe('Phase 42: Repositories Layout & Control Refinement', () => {
  const componentPath = path.resolve(__dirname, '../../app/components/repository-selector.tsx');
  const cssPath = path.resolve(__dirname, '../../app/globals.css');
  const componentContent = fs.readFileSync(componentPath, 'utf-8');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  it('verifies two-zone header composition with non-button GitHub installation fact block', () => {
    // Header two zones
    expect(componentContent).toContain('repositories-header__title-group');
    expect(componentContent).toContain('repositories-header__right');
    expect(componentContent).toContain('repositories-installation-fact');
    expect(componentContent).toContain('installation-fact__label');
    expect(componentContent).toContain('installation-fact__account');
    expect(componentContent).toContain('installation-fact__meta');

    // CSS rules
    expect(cssContent).toContain('.repositories-installation-fact');
    expect(cssContent).toContain('.installation-fact__label');
    expect(cssContent).toContain('.installation-fact__account');
    expect(cssContent).toContain('.installation-fact__meta');
  });

  it('verifies toolbar filter labels and count separation', () => {
    // Check dot separator in filter buttons
    expect(componentContent).toContain('filter-button__sep');
    expect(componentContent).toContain('filter-count-badge');
    expect(componentContent).toContain('repositories-search-input');
    expect(componentContent).toContain('repositories-filter-nav');

    // Filter categories exist
    expect(componentContent).toContain('setActiveFilter(\'all\')');
    expect(componentContent).toContain('setActiveFilter(\'current\')');
    expect(componentContent).toContain('setActiveFilter(\'attention\')');
    expect(componentContent).toContain('setActiveFilter(\'not-analyzed\')');
  });

  it('verifies table caption and helper spacing above table wrapper', () => {
    expect(componentContent).toContain('repositories-collection__header');
    expect(componentContent).toContain('repositories-collection__caption');
    expect(componentContent).toContain('repositories-collection__count');
    expect(componentContent).toContain('List of managed repositories and their synchronization status');
    expect(componentContent).toContain('repositories-table-wrapper');
    expect(cssContent).toContain('.repositories-collection__header');
    expect(cssContent).toContain('.repositories-collection__caption');
  });

  it('verifies action hierarchy across repositories: only needs-refresh is primary, repeated actions are neutral', () => {
    const traceRepo = MOCK_REPOSITORIES.find((r) => r.name === 'TRACE')!;
    const traceAttention = MOCK_ATTENTION.filter((a) => !a.repositoryId || a.repositoryId === traceRepo.id);
    const traceState = deriveTraceProjectState(traceRepo, traceAttention);
    expect(traceState.key).toBe('needs-refresh');
    expect(traceState.actionKind).toBe('local');

    const novaRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Nova')!;
    const novaAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === novaRepo.id);
    const novaState = deriveTraceProjectState(novaRepo, novaAttention);
    expect(novaState.key).toBe('connected-not-analyzed');
    expect(novaState.actionKind).toBe('local');

    // In component, variant is conditionally primary only for needs-refresh
    expect(componentContent).toContain("variant={repo.state.key === 'needs-refresh' ? 'primary' : 'secondary'}");
    // Open project buttons use trace-button--secondary
    expect(componentContent).toContain('trace-button trace-button--secondary repo-open-btn');
  });

  it('verifies lower GitHub App integration controls use standardized TRACE button styling', () => {
    expect(componentContent).toContain('repositories-installation-card');
    expect(componentContent).toContain('installation-card__footer');
    // Button styling instead of unstyled links or browser defaults
    expect(componentContent).toContain('<button\n              type="button"\n              className="trace-button trace-button--secondary"');
    expect(componentContent).toContain('Adjust repository selection ↑');
    expect(componentContent).toContain('Configure GitHub App permissions ↗');
  });

  it('verifies access drawer structure, active/excluded badges, and feedback readability', () => {
    expect(componentContent).toContain('repositories-access-drawer');
    expect(componentContent).toContain('repositories-access-grid');
    expect(componentContent).toContain('repositories-access-item');
    expect(componentContent).toContain('access-item-state');
    expect(componentContent).toContain('access-save-feedback');
    expect(cssContent).toContain('.repositories-access-drawer');
    expect(cssContent).toContain('.access-item-state.is-active');
    expect(cssContent).toContain('.access-item-state.is-excluded');
  });
});
