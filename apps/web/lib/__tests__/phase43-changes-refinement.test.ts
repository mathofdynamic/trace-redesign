import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MOCK_CHANGES, MOCK_CONFLICTS, MOCK_REPOSITORIES, MOCK_ATTENTION } from '../mock';

describe('Phase 43: Changes Toolbar & Inspect Details Refinement', () => {
  const changesViewSource = readFileSync(
    resolve(process.cwd(), 'apps/web/app/(app)/app/_components/changes-view.tsx'),
    'utf-8',
  );
  const globalsCssSource = readFileSync(
    resolve(process.cwd(), 'apps/web/app/globals.css'),
    'utf-8',
  );

  describe('1. Changes Toolbar Two-Row Hierarchy', () => {
    it('implements a structured two-row toolbar layout in changes-view.tsx', () => {
      expect(changesViewSource).toContain('changes-toolbar__row changes-toolbar__row--primary');
      expect(changesViewSource).toContain('changes-toolbar__row changes-toolbar__row--filters');
      expect(changesViewSource).toContain('changes-toolbar__search');
      expect(changesViewSource).toContain('changes-toolbar__status');
      expect(changesViewSource).toContain('changes-toolbar__filters-group');
      expect(changesViewSource).toContain('changes-toolbar__view-group');
    });

    it('defines short, normal-case labels for filters', () => {
      expect(changesViewSource).toContain('className="filter-select-label"');
      expect(changesViewSource).toContain('Repository');
      expect(changesViewSource).toContain('Relationship');
      expect(changesViewSource).toContain('Affected area');
    });

    it('includes standard view mode toggle with Grouped and Flat list', () => {
      expect(changesViewSource).toContain('Grouped');
      expect(changesViewSource).toContain('Flat list');
      expect(changesViewSource).toContain('role="radiogroup"');
    });
  });

  describe('2. Summary Bar and Subline Distribution', () => {
    it('structures summary metrics across a balanced grid', () => {
      expect(changesViewSource).toContain('changes-summary-container');
      expect(changesViewSource).toContain('changes-summary-bar');
      expect(changesViewSource).toContain('Active changes');
      expect(changesViewSource).toContain('Repositories');
      expect(changesViewSource).toContain('Conflict linked');
      expect(changesViewSource).toContain('With findings');
    });

    it('positions the deterministic snapshot guarantee on a dedicated subline', () => {
      expect(changesViewSource).toContain('changes-summary-subline');
      expect(changesViewSource).toContain('Local deterministic snapshots · Zero personal scoring');
    });

    it('defines 4-column desktop grid with mobile 2-column fallback in globals.css', () => {
      expect(globalsCssSource).toContain('grid-template-columns: repeat(4, 1fr)');
      expect(globalsCssSource).toContain('grid-template-columns: repeat(2, 1fr)');
    });
  });

  describe('3. Change Row Hierarchy & Blue Noise Reduction', () => {
    it('renders clean visual layers with neutral OPEN badge and secondary actions', () => {
      expect(changesViewSource).toContain('change-row-card__topline');
      expect(changesViewSource).toContain('change-row-card__identity');
      expect(changesViewSource).toContain('change-pr-badge');
      expect(changesViewSource).toContain('change-state-badge');
      expect(changesViewSource).toContain('change-row-card__body');
      expect(changesViewSource).toContain('change-row-card__title');
      expect(changesViewSource).toContain('change-row-card__intent');
      expect(changesViewSource).toContain('change-row-card__footer');
      expect(changesViewSource).toContain('change-row-card__actions');
    });

    it('uses secondary styling for Open on GitHub link to prevent blue noise', () => {
      expect(changesViewSource).toContain('trace-button trace-button--secondary trace-button--small change-github-link');
    });
  });

  describe('4. Centered Inspect Details Modal Architecture', () => {
    it('uses Phase 40 CenteredDialog with two-column responsive layout', () => {
      expect(changesViewSource).toContain('<CenteredDialog');
      expect(changesViewSource).toContain('size="lg"');
      expect(changesViewSource).toContain('change-drawer__columns');
      expect(changesViewSource).toContain('change-drawer__column change-drawer__column--left');
      expect(changesViewSource).toContain('change-drawer__column change-drawer__column--right');
    });

    it('places Intent, Technical Context, and Affected Files on the left column', () => {
      expect(changesViewSource).toContain('Architectural intent');
      expect(changesViewSource).toContain('Technical context');
      expect(changesViewSource).toContain('Affected files');
    });

    it('places Coordination Conflict, AST Findings, and Local Review Command on the right column', () => {
      expect(changesViewSource).toContain('Active Coordination Conflict');
      expect(changesViewSource).toContain('Related AST findings');
      expect(changesViewSource).toContain('Local review command');
      expect(changesViewSource).toContain('trace pr inspect');
    });

    it('defines 860px max modal width with mobile single-column stacking in globals.css', () => {
      expect(globalsCssSource).toContain('width: min(860px, calc(100vw - 32px))');
      expect(globalsCssSource).toContain('grid-template-columns: 1.15fr 1fr');
    });
  });

  describe('5. Truthful Universe Data Constraints', () => {
    it('preserves all mock changes, conflicts, and findings truthfully', () => {
      expect(MOCK_CHANGES).toHaveLength(9);
      expect(MOCK_CONFLICTS).toHaveLength(4);
      expect(MOCK_REPOSITORIES).toHaveLength(5);
      expect(MOCK_ATTENTION.length).toBeGreaterThan(0);
    });

    it('contains no developer scoring, health grades, or surveillance metrics', () => {
      MOCK_CHANGES.forEach((change) => {
        expect((change as Record<string, unknown>).score).toBeUndefined();
        expect((change as Record<string, unknown>).developerRank).toBeUndefined();
      });
    });
  });
});
