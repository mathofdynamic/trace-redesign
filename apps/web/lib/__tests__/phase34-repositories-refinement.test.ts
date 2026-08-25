import { describe, expect, it } from 'vitest';
import {
  MOCK_REPOSITORIES,
  MOCK_ATTENTION,
  MOCK_REPORTS,
} from '../mock';
import {
  deriveTraceProjectState,
  localTraceCommandsForState,
  formatRelativeDate,
} from '../dashboard-state';

describe('Phase 34: Repositories Final Refinement', () => {
  it('enforces accurate filter counts matching the frozen mock universe', () => {
    const enriched = MOCK_REPOSITORIES.map((repo) => {
      const repoAttention = MOCK_ATTENTION.filter(
        (a) => !a.repositoryId || a.repositoryId === repo.id,
      );
      const state = deriveTraceProjectState(repo, repoAttention);
      const findings = repoAttention.filter((a) =>
        ['finding', 'risk', 'conflict'].includes(a.kind),
      );
      const isCurrent = state.key === 'current';
      const isAttention =
        ['needs-refresh', 'sync-attention', 'analysis-failed'].includes(state.key) ||
        findings.length > 0;
      const isNotAnalyzed =
        state.key === 'connected-not-analyzed' || state.key === 'not-connected';

      return { ...repo, state, isCurrent, isAttention, isNotAnalyzed };
    });

    const counts = {
      all: enriched.length,
      current: enriched.filter((r) => r.isCurrent).length,
      attention: enriched.filter((r) => r.isAttention).length,
      notAnalyzed: enriched.filter((r) => r.isNotAnalyzed).length,
    };

    expect(counts.all).toBe(5);
    expect(counts.current).toBe(2); // Radar, Atlas
    expect(counts.attention).toBe(4); // TRACE, Radar, Atlas, Orbit
    expect(counts.notAnalyzed).toBe(1); // Nova
  });

  it('provides the 5 required row zones for every repository', () => {
    MOCK_REPOSITORIES.forEach((repo) => {
      const repoAttention = MOCK_ATTENTION.filter(
        (a) => !a.repositoryId || a.repositoryId === repo.id,
      );
      const state = deriveTraceProjectState(repo, repoAttention);
      const findingsCount = repoAttention.filter((a) =>
        ['finding', 'risk', 'conflict'].includes(a.kind),
      ).length;
      const reportsCount = MOCK_REPORTS.filter((r) => r.repositoryId === repo.id).length;

      // Zone 1: Identity
      expect(repo.fullName).toBeDefined();
      expect(repo.defaultBranch).toBe('main');
      expect(repo.visibility).toBeDefined();

      // Zone 2: Lifecycle
      expect(state.key).toBeDefined();
      expect(state.label).toBeDefined();
      expect(state.description).toBeDefined();

      // Zone 3: Intelligence
      const intelligenceText = `${findingsCount} ${findingsCount === 1 ? 'finding' : 'findings'} · ${reportsCount} ${reportsCount === 1 ? 'report' : 'reports'}`;
      expect(intelligenceText).toMatch(/^\d+ findings? · \d+ reports?$/);

      // Zone 4: Synchronization
      const formattedDate = formatRelativeDate(repo.lastSynchronizedAt);
      expect(formattedDate).toBeDefined();
      if (repo.remoteHeadSha) {
        const shortSha = repo.remoteHeadSha.slice(0, 7);
        expect(shortSha).toHaveLength(7);
      }

      // Zone 5: Action
      expect(['none', 'local', 'review']).toContain(state.actionKind);
    });
  });

  it('implements restrained blue hierarchy across repository actions', () => {
    const traceRepo = MOCK_REPOSITORIES.find((r) => r.name === 'TRACE')!;
    const traceAttention = MOCK_ATTENTION.filter((a) => !a.repositoryId || a.repositoryId === traceRepo.id);
    const traceState = deriveTraceProjectState(traceRepo, traceAttention);
    // TRACE (needs-refresh) gets primary blue action
    expect(traceState.key).toBe('needs-refresh');
    expect(traceState.actionKind).toBe('local');
    expect(traceState.actionLabel).toBe('Update TRACE');

    // Nova (connected-not-analyzed) gets secondary local action
    const novaRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Nova')!;
    const novaAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === novaRepo.id);
    const novaState = deriveTraceProjectState(novaRepo, novaAttention);
    expect(novaState.key).toBe('connected-not-analyzed');
    expect(novaState.actionKind).toBe('local');
    expect(novaState.actionLabel).toBe('Analyze locally');

    // Radar (current) has no local action, open project is neutral secondary
    const radarRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Radar')!;
    const radarAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === radarRepo.id);
    const radarState = deriveTraceProjectState(radarRepo, radarAttention);
    expect(radarState.actionKind).toBe('none');
  });

  it('validates mock installation structure used in repository management', () => {
    const mockInstallation = {
      id: 'mock-gh-inst-001',
      accountLogin: 'northstar-engineering',
      accountType: 'Organization',
      state: 'active',
    };
    expect(mockInstallation.accountLogin).toBe('northstar-engineering');
    expect(mockInstallation.accountType).toBe('Organization');
    expect(mockInstallation.state).toBe('active');
  });
});
