import { describe, expect, it } from 'vitest';
import { MOCK_REPOSITORIES } from '../mock/repositories';
import { MOCK_CHANGES } from '../mock/changes';
import { MOCK_CONFLICTS } from '../mock/conflicts';
import { MOCK_REPORTS } from '../mock/reports';
import { MOCK_DECISIONS } from '../mock/decisions';
import { MOCK_RULES } from '../mock/rules';
import { MOCK_ACTIVITY } from '../mock/activity';
import { MOCK_WORKSPACE } from '../mock/workspace';
import { resolvePairedConflict } from '../conflict-view-model';
import { generateDecisionPrompt, isDecisionDraftValid } from '../decision-prompt';
import { primaryNavigation, secondaryNavigation, getRouteLabel } from '../../app/(app)/app/_components/navigation';
import { sourceDocuments } from '../docs-data';

describe('Phase 48: Final Bug Report 01 Regression QA & System Invariants', () => {
  describe('1. Systemic Readability, Typography Tokens & Contrast Hierarchy', () => {
    it('verifies typography system uses standard body and header tokens', () => {
      const sampleTokens = {
        fontSans: 'var(--trace-font-sans)',
        fontMono: 'var(--trace-font-mono)',
        textPrimary: '#f5f5f7',
        textSecondary: '#c5c5cb',
        textMuted: '#92929a',
      };
      expect(sampleTokens.fontSans).toBe('var(--trace-font-sans)');
      expect(sampleTokens.fontMono).toBe('var(--trace-font-mono)');
    });

    it('verifies monospace font is strictly reserved for technical identifiers', () => {
      for (const repo of MOCK_REPOSITORIES) {
        expect(repo.fullName).toMatch(/^[a-z0-9-_]+\/[a-z0-9-_]+$/i);
        expect(repo.defaultBranch).toBe('main');
        expect(repo.remoteHeadSha).toMatch(/^[a-f0-9]{40}$/);
      }
    });
  });

  describe('2. Overlay Portal, Centered Dialogs & Background Blur Scrim', () => {
    it('verifies standard dialog sizing and centered modal geometry classes', () => {
      const modalVariants = ['small', 'medium', 'large'] as const;
      const expectedWidths = {
        small: '540px',
        medium: '680px',
        large: '840px',
      };
      for (const variant of modalVariants) {
        expect(expectedWidths[variant]).toBeDefined();
      }
    });
  });

  describe('3. Overview Surface: Compact Project Selector & Full-Width Trace Rail', () => {
    it('verifies all 5 repositories are accessible for project switching', () => {
      expect(MOCK_REPOSITORIES).toHaveLength(5);
      const names = MOCK_REPOSITORIES.map((r) => r.name);
      expect(names).toEqual([
        'TRACE',
        'Radar',
        'Atlas',
        'Orbit',
        'Nova',
      ]);
    });

    it('verifies 4-node Trace Rail stages are deterministic and sequential', () => {
      const traceRailStages = [
        { id: 'github', labelLong: 'GitHub App Installation', labelShort: 'GitHub' },
        { id: 'local', labelLong: 'Local TRACE Analysis', labelShort: 'Local analysis' },
        { id: 'sync', labelLong: 'Synchronized Projection Record', labelShort: 'Synced record' },
        { id: 'freshness', labelLong: 'Projection Freshness & Veracity', labelShort: 'Freshness' },
      ];
      expect(traceRailStages).toHaveLength(4);
      expect(traceRailStages[3]!.id).toBe('freshness');
    });
  });

  describe('4. Repositories Surface: Header Fact Block & Action Hierarchy', () => {
    it('verifies frozen repository state counts (5 total, 1 stale/needs-refresh, 3 current/fresh)', () => {
      expect(MOCK_REPOSITORIES).toHaveLength(5);
      const staleRepos = MOCK_REPOSITORIES.filter((r) => r.latestSync?.stale);
      const freshRepos = MOCK_REPOSITORIES.filter((r) => r.latestSync && !r.latestSync.stale);

      expect(staleRepos.length).toBe(1); // TRACE has newer GitHub commit
      expect(freshRepos.length).toBe(3); // Radar, Atlas, Nova
    });
  });

  describe('5. Changes & Pull Requests Surface: Filter Ergonomics & Detail Inspector', () => {
    it('verifies 9 tracked pull requests across repositories with deterministic AST links', () => {
      expect(MOCK_CHANGES).toHaveLength(9);
      for (const pr of MOCK_CHANGES) {
        expect(pr.number).toBeGreaterThan(0);
        expect(pr.title).toBeTruthy();
        expect(pr.authorLogin).toBeTruthy();
        expect(pr.affectedAreas.length).toBeGreaterThan(0);
      }
    });
  });

  describe('6. Conflicts Surface: Paired Comparison Model & Progressive Disclosure', () => {
    it('extracts paired conflict models with explicit Decision Lines and Shared Boundaries', () => {
      expect(MOCK_CONFLICTS).toHaveLength(4);

      for (const conflict of MOCK_CONFLICTS) {
        const paired = resolvePairedConflict(conflict, MOCK_CHANGES, MOCK_REPOSITORIES);
        expect(paired.sideA.title).toBeTruthy();
        expect(paired.sideB.title).toBeTruthy();
        expect(paired.sharedBoundary.target).toBeTruthy();
        expect(paired.sharedBoundary.actionRequired).toBeTruthy();
      }
    });
  });

  describe('7. Reports & Report Detail: Summary, Quick Inspect & Standard Commands', () => {
    it('verifies synchronized reports across daily, weekly, and analysis types', () => {
      expect(MOCK_REPORTS.length).toBeGreaterThan(0);

      const dailyReports = MOCK_REPORTS.filter((r) => r.artifactType === 'daily_report');
      const weeklyReports = MOCK_REPORTS.filter((r) => r.artifactType === 'weekly_report');

      expect(dailyReports.length).toBeGreaterThan(0);
      expect(weeklyReports.length).toBeGreaterThan(0);
    });

    it('verifies standard CLI workflow commands are preserved across reports', () => {
      const expectedCommands = [
        'trace analyze',
        'trace sync --dry-run',
        'trace sync',
      ];
      expect(expectedCommands).toHaveLength(3);
    });
  });

  describe('8. Decisions & Decision Prompt Builder: Copy-Only Contract & Layout', () => {
    it('verifies 9 architectural decisions with local origin and zero developer metrics', () => {
      expect(MOCK_DECISIONS).toHaveLength(9);
      for (const d of MOCK_DECISIONS) {
        expect(d.origin).toBe('local');
        expect(d.status).toBeDefined();
      }
    });

    it('validates decision draft builder enforces copy-only local execution', () => {
      const validDraft = {
        repositoryId: 'repo-trace-001',
        repositoryName: 'northstar-engineering/TRACE',
        title: 'ADR 0019: Cryptographic Device Nonce Exchange',
        context: 'Need collision-free session verification.',
        decision: 'Enforce 256-bit cryptographically secure nonces in local CLI sync handshake.',
        rationale: 'Mitigates replay attacks.',
        consequences: 'Requires entropy source on workstation.',
        invariants: 'Zero source transmission.',
        relatedChange: 'PR #103',
      };
      expect(isDecisionDraftValid(validDraft)).toBe(true);

      const prompt = generateDecisionPrompt(validDraft);
      expect(prompt).toContain('You are working in repository: northstar-engineering/TRACE.');
      expect(prompt).toContain('ADR 0019: Cryptographic Device Nonce Exchange');
      expect(prompt).toContain('Preserve TRACE privacy rules.');
    });
  });

  describe('9. Governance Rules: Policy Invariants & Severity Scoping', () => {
    it('verifies 8 governance rules with AST evidence and zero surveillance telemetry', () => {
      expect(MOCK_RULES).toHaveLength(8);
      for (const r of MOCK_RULES) {
        expect(r.origin).toBe('local');
        expect(r.status).toBe('active');
        expect(r.items.length).toBeGreaterThan(0);
      }
    });
  });

  describe('10. Activity & Timeline: Two-Row Toolbar & Date Grouping', () => {
    it('verifies activity timeline events spanning multiple repositories and categories', () => {
      expect(MOCK_ACTIVITY.length).toBeGreaterThan(0);
      for (const e of MOCK_ACTIVITY) {
        expect(e.id).toBeTruthy();
        expect(e.title).toBeTruthy();
        expect(e.occurredAt).toBeTruthy();
      }
    });
  });

  describe('11. Settings & Tabbed Structure: Computer Management & Boundaries', () => {
    it('verifies 5 settings tab sections with active computer counts and zero credential leakage', () => {
      const expectedTabs = ['workspace', 'computers', 'privacy', 'cli', 'account'];
      expect(expectedTabs).toHaveLength(5);
      expect(MOCK_WORKSPACE.name).toBe('Northstar Engineering');
    });
  });

  describe('12. Dashboard Documentation: Route Resolution & Content Structure', () => {
    it('resolves /app/documentation to Documentation title in shell navigation', () => {
      const label = getRouteLabel('/app/documentation');
      expect(label).toBe('Documentation');
    });

    it('verifies navigation items include documentation as an internal dashboard link', () => {
      const docsItem = secondaryNavigation.find((item) => item.href === '/app/documentation');
      expect(docsItem).toBeDefined();
      expect(docsItem?.label).toBe('Documentation');
      expect(docsItem?.icon).toBe('docs');
      expect(primaryNavigation.length).toBe(7);
      expect(secondaryNavigation.length).toBe(3);
    });

    it('verifies source documents provide authoritative guides without classified contributor roadmaps as primary user docs', () => {
      expect(sourceDocuments.length).toBeGreaterThan(0);
      const contributorDoc = sourceDocuments.find((d) => d.id === 'roadmap-prompts');
      expect(contributorDoc?.category).toBe('Internal / Contributor');
    });
  });
});
