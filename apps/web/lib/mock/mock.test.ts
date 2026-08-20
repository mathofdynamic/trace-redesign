import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  isMockModeEnabled,
  getActiveMockScenario,
  mockDataProvider,
  createBaseUniverse,
  MOCK_PRIMARY_USER,
  MOCK_WORKSPACE,
  MOCK_REPOSITORIES,
} from './index';
import { deriveTraceProjectState } from '../dashboard-state';

describe('TRACE Mock Data Foundation (Phase 1)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('Mock Mode Configuration & Security', () => {
    it('is disabled by default when no flag is set', () => {
      delete (process.env as Record<string, string | undefined>).TRACE_MOCK_MODE;
      delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_TRACE_MOCK_MODE;
      expect(isMockModeEnabled()).toBe(false);
    });

    it('is enabled when TRACE_MOCK_MODE=true is set in development', () => {
      process.env.TRACE_MOCK_MODE = 'true';
      delete (process.env as Record<string, string | undefined>).NODE_ENV;
      expect(isMockModeEnabled()).toBe(true);
    });

    it('rejects silent activation in production without explicit authorization', () => {
      process.env.TRACE_MOCK_MODE = 'true';
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      delete (process.env as Record<string, string | undefined>).TRACE_ALLOW_PRODUCTION_MOCKS;
      expect(isMockModeEnabled()).toBe(false);
    });

    it('resolves active mock scenario accurately', () => {
      process.env.TRACE_MOCK_SCENARIO = 'github-unavailable';
      expect(getActiveMockScenario()).toBe('github-unavailable');

      delete (process.env as Record<string, string | undefined>).TRACE_MOCK_SCENARIO;
      expect(getActiveMockScenario()).toBe('default');
    });
  });

  describe('Deterministic Base Universe', () => {
    it('provides deterministic workspace identity "Northstar Engineering"', () => {
      expect(MOCK_WORKSPACE.name).toBe('Northstar Engineering');
      expect(MOCK_WORKSPACE.slug).toBe('northstar-engineering');
      expect(MOCK_WORKSPACE.id).toBe('ws-northstar-001');
      expect(MOCK_WORKSPACE.profileComplete).toBe(true);
    });

    it('provides deterministic current user "Mohammad Mohammadi"', () => {
      expect(MOCK_PRIMARY_USER.name).toBe('Mohammad Mohammadi');
      expect(MOCK_PRIMARY_USER.email).toBe('mohammad@northstar.engineering');
      expect(MOCK_PRIMARY_USER.githubLogin).toBe('mohammadm');
      expect(MOCK_PRIMARY_USER.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('contains exactly five distinct repository identities with unique IDs', () => {
      expect(MOCK_REPOSITORIES).toHaveLength(5);
      const repoIds = MOCK_REPOSITORIES.map((r) => r.id);
      const uniqueIds = new Set(repoIds);
      expect(uniqueIds.size).toBe(5);

      const repoNames = MOCK_REPOSITORIES.map((r) => r.name);
      expect(repoNames).toEqual(['TRACE', 'Radar', 'Atlas', 'Orbit', 'Nova']);
    });
  });

  describe('Repository State Model Requirements', () => {
    const universe = createBaseUniverse();

    it('models TRACE as mature, analyzed, synchronized, and needs-refresh', () => {
      const traceRepo = universe.repositories.find((r) => r.name === 'TRACE')!;
      expect(traceRepo).toBeDefined();
      expect(traceRepo.latestSync).not.toBeNull();
      expect(traceRepo.latestSync?.stale).toBe(true);
      expect(traceRepo.analysis?.status).toBe('completed');

      const derivedState = deriveTraceProjectState(traceRepo, universe.attention);
      expect(derivedState.key).toBe('needs-refresh');
    });

    it('models Radar as analyzed, synchronized, and current', () => {
      const radarRepo = universe.repositories.find((r) => r.name === 'Radar')!;
      expect(radarRepo).toBeDefined();
      expect(radarRepo.latestSync).not.toBeNull();
      expect(radarRepo.latestSync?.stale).toBe(false);
      expect(radarRepo.analysis?.status).toBe('completed');

      const derivedState = deriveTraceProjectState(radarRepo, universe.attention);
      expect(derivedState.key).toBe('current');
    });

    it('models Atlas with active engineering conflicts', () => {
      const atlasRepo = universe.repositories.find((r) => r.name === 'Atlas')!;
      expect(atlasRepo).toBeDefined();
      const conflicts = universe.conflicts.filter((c) => c.repositoryId === atlasRepo.id);
      expect(conflicts.length).toBeGreaterThan(0);
    });

    it('models Orbit with sync attention requirement', () => {
      const orbitRepo = universe.repositories.find((r) => r.name === 'Orbit')!;
      expect(orbitRepo).toBeDefined();

      const derivedState = deriveTraceProjectState(orbitRepo, universe.attention);
      expect(derivedState.key).toBe('sync-attention');
    });

    it('models Nova as connected and not analyzed', () => {
      const novaRepo = universe.repositories.find((r) => r.name === 'Nova')!;
      expect(novaRepo).toBeDefined();
      expect(novaRepo.latestSync).toBeNull();
      expect(novaRepo.analysis?.status).toBe('not-started');

      const derivedState = deriveTraceProjectState(novaRepo, universe.attention);
      expect(derivedState.key).toBe('connected-not-analyzed');
    });
  });

  describe('Mock Scenarios Registry', () => {
    it('handles github-unavailable scenario', () => {
      const summary = mockDataProvider.getDashboardSummary('github-unavailable');
      expect(summary.repositories).toHaveLength(5);
      expect(summary.attention.some((a) => a.id === 'att-github-unavailable-001')).toBe(true);
    });

    it('handles permission-missing scenario', () => {
      const summary = mockDataProvider.getDashboardSummary('permission-missing');
      expect(summary.attention.some((a) => a.id === 'att-permission-missing-001')).toBe(true);
    });

    it('handles analysis-running scenario', () => {
      const summary = mockDataProvider.getDashboardSummary('analysis-running');
      expect(summary.repositories[0]?.analysis?.status).toBe('running');
    });

    it('handles analysis-failed scenario', () => {
      const summary = mockDataProvider.getDashboardSummary('analysis-failed');
      expect(summary.repositories[0]?.analysis?.status).toBe('failed');
      expect(summary.attention.some((a) => a.kind === 'analysis-failed')).toBe(true);
    });

    it('handles sync-failed scenario', () => {
      const summary = mockDataProvider.getDashboardSummary('sync-failed');
      expect(summary.attention.some((a) => a.kind === 'sync-failed')).toBe(true);
    });

    it('handles no-analysis scenario', () => {
      const summary = mockDataProvider.getDashboardSummary('no-analysis');
      expect(summary.repositories.every((r) => r.analysis?.status === 'not-started')).toBe(true);
      expect(summary.latestReports).toHaveLength(0);
    });
  });

  describe('Dashboard Summary Contract Conformance', () => {
    it('produces complete DashboardSummary matching UI consumption requirements', () => {
      const summary = mockDataProvider.getDashboardSummary('default');
      expect(summary.workspace.name).toBe('Northstar Engineering');
      expect(summary.setup.authenticated).toBe(true);
      expect(summary.setup.localAnalysisAvailable).toBe(true);
      expect(summary.setup.cloudAnalysisAvailable).toBe(false);
      expect(summary.repositories.length).toBe(5);
      expect(summary.attention.length).toBeGreaterThan(0);
      expect(summary.latestChanges.length).toBeGreaterThan(0);
      expect(summary.latestReports.length).toBeGreaterThan(0);
      expect(summary.conflicts.length).toBeGreaterThan(0);
      expect(summary.decisions.length).toBeGreaterThan(0);
      expect(summary.rules.length).toBeGreaterThan(0);
      expect(summary.activity.length).toBeGreaterThan(0);
      expect(summary.capabilities).toEqual({
        changes: true,
        conflicts: true,
        reports: true,
        decisions: true,
        rules: true,
        activity: true,
      });
    });
  });
});
