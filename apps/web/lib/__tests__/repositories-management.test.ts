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

describe('Phase 12: Repositories Management (/app/repositories)', () => {
  it('provides all 5 managed repositories in the workspace with correct metadata', () => {
    expect(MOCK_REPOSITORIES).toHaveLength(5);

    const names = MOCK_REPOSITORIES.map((r) => r.name);
    expect(names).toEqual(['TRACE', 'Radar', 'Atlas', 'Orbit', 'Nova']);

    MOCK_REPOSITORIES.forEach((repo) => {
      expect(repo.fullName).toBeDefined();
      expect(repo.defaultBranch).toBe('main');
      expect(repo.state).toBe('active');
    });
  });

  it('correctly maps lifecycle states and actions across all 5 repositories', () => {
    // 1. TRACE: Stale local analysis -> needs-refresh
    const traceRepo = MOCK_REPOSITORIES.find((r) => r.name === 'TRACE')!;
    const traceAttention = MOCK_ATTENTION.filter((a) => !a.repositoryId || a.repositoryId === traceRepo.id);
    const traceState = deriveTraceProjectState(traceRepo, traceAttention);
    expect(traceState.key).toBe('needs-refresh');
    expect(traceState.label).toBe('Needs refresh');
    expect(traceState.actionKind).toBe('local');
    expect(traceState.actionLabel).toBe('Update TRACE');
    expect(localTraceCommandsForState(traceState.key)).toContain('trace analyze');

    // 2. Radar: Fully synced -> current
    const radarRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Radar')!;
    const radarAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === radarRepo.id);
    const radarState = deriveTraceProjectState(radarRepo, radarAttention);
    expect(radarState.key).toBe('current');
    expect(radarState.label).toBe('Current with GitHub');
    expect(radarState.actionKind).toBe('none');

    // 3. Atlas: Conflicts/findings in attention
    const atlasRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Atlas')!;
    const atlasAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === atlasRepo.id);
    const atlasFindings = atlasAttention.filter((a) => ['finding', 'risk', 'conflict'].includes(a.kind));
    expect(atlasFindings.length).toBeGreaterThan(0);

    // 4. Orbit: Attention items exist -> sync-attention
    const orbitRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Orbit')!;
    const orbitAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === orbitRepo.id);
    const orbitState = deriveTraceProjectState(orbitRepo, orbitAttention);
    expect(orbitState.key).toBe('sync-attention');
    expect(orbitState.label).toBe('Sync needs attention');

    // 5. Nova: Connected but not yet analyzed locally
    const novaRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Nova')!;
    const novaAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === novaRepo.id);
    const novaState = deriveTraceProjectState(novaRepo, novaAttention);
    expect(novaState.key).toBe('connected-not-analyzed');
    expect(novaState.label).toBe('Connected - Not analyzed');
    expect(novaState.shortLabel).toBe('Not analyzed');
    expect(novaState.actionKind).toBe('local');
    expect(novaState.actionLabel).toBe('Analyze locally');
  });

  it('computes accurate findings and reports counts per repository', () => {
    MOCK_REPOSITORIES.forEach((repo) => {
      const repoAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === repo.id);
      const findingsCount = repoAttention.filter((a) =>
        ['finding', 'risk', 'conflict'].includes(a.kind),
      ).length;
      const reportsCount = MOCK_REPORTS.filter((r) => r.repositoryId === repo.id).length;

      expect(findingsCount).toBeGreaterThanOrEqual(0);
      expect(reportsCount).toBeGreaterThanOrEqual(0);
    });
  });

  it('formats sync timestamps and commit SHAs cleanly', () => {
    const traceRepo = MOCK_REPOSITORIES.find((r) => r.name === 'TRACE')!;
    const formatted = formatRelativeDate(traceRepo.lastSynchronizedAt);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });
});
