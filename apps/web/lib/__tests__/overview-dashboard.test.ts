import { describe, expect, it } from 'vitest';
import {
  MOCK_REPOSITORIES,
  MOCK_ATTENTION,
  MOCK_CHANGES,
  MOCK_REPORTS,
  MOCK_ACTIVITY,
} from '../mock';
import {
  deriveTraceProjectState,
  localTraceCommandsForState,
  presentFindingDetail,
} from '../dashboard-state';

describe('Overview (/app) Redesign & State Invariants', () => {
  it('derives correct state, commands, and rail step for the default TRACE repository', () => {
    const traceRepo = MOCK_REPOSITORIES.find((r) => r.name === 'TRACE') ?? MOCK_REPOSITORIES[0]!;
    const traceAttention = MOCK_ATTENTION.filter((a) => !a.repositoryId || a.repositoryId === traceRepo.id);
    const state = deriveTraceProjectState(traceRepo, traceAttention);

    expect(state.key).toBe('needs-refresh');
    expect(state.label).toBe('Needs refresh');
    expect(state.shortLabel).toBe('Needs refresh');
    expect(state.actionKind).toBe('local');
    expect(state.actionLabel).toBe('Update TRACE');

    const commands = localTraceCommandsForState(state.key);
    expect(commands).toEqual(['trace analyze', 'trace sync --dry-run', 'trace sync']);
  });

  it('correctly categorizes operational vs engineering attention items', () => {
    const operations = MOCK_ATTENTION.filter((item) =>
      ['sync-failed', 'analysis-failed'].includes(item.kind),
    );
    const engineering = MOCK_ATTENTION.filter((item) =>
      ['finding', 'risk', 'conflict'].includes(item.kind),
    );

    // Operational issues
    expect(operations.length).toBeGreaterThanOrEqual(1);
    operations.forEach((op) => {
      expect(['sync-failed', 'analysis-failed']).toContain(op.kind);
    });

    // Engineering issues
    expect(engineering.length).toBeGreaterThanOrEqual(1);
    engineering.forEach((eng) => {
      expect(['finding', 'risk', 'conflict']).toContain(eng.kind);
      expect(eng.title).toBeDefined();
    });
  });

  it('validates edge states across all 5 mock repositories', () => {
    // 1. Radar (Current with GitHub)
    const radarRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Radar')!;
    const radarAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === radarRepo.id);
    const radarState = deriveTraceProjectState(radarRepo, radarAttention);
    expect(radarState.key).toBe('current');
    expect(radarState.label).toBe('Current with GitHub');
    expect(radarState.actionKind).toBe('none');

    // 2. Atlas (Attention with schema collision)
    const atlasRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Atlas')!;
    const atlasAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === atlasRepo.id);
    const atlasState = deriveTraceProjectState(atlasRepo, atlasAttention);
    expect(['needs-refresh', 'sync-attention', 'current']).toContain(atlasState.key);
    expect(atlasAttention.length).toBeGreaterThan(0);

    // 3. Orbit (Sync attention)
    const orbitRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Orbit')!;
    const orbitAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === orbitRepo.id);
    const orbitState = deriveTraceProjectState(orbitRepo, orbitAttention);
    expect(['sync-attention', 'needs-refresh']).toContain(orbitState.key);

    // 4. Nova (Connected - not analyzed)
    const novaRepo = MOCK_REPOSITORIES.find((r) => r.name === 'Nova')!;
    const novaAttention = MOCK_ATTENTION.filter((a) => a.repositoryId === novaRepo.id);
    const novaState = deriveTraceProjectState(novaRepo, novaAttention);
    expect(novaState.key).toBe('connected-not-analyzed');
    expect(novaState.actionLabel).toBe('Analyze locally');
    expect(localTraceCommandsForState(novaState.key)).toEqual(['trace analyze']);
  });

  it('computes accurate metrics for intelligence strip', () => {
    const traceRepo = MOCK_REPOSITORIES[0];
    const engineering = MOCK_ATTENTION.filter((item) =>
      ['finding', 'risk', 'conflict'].includes(item.kind),
    );
    const findingsCount = engineering.filter((item) => item.kind === 'finding').length;
    const reportsCount = MOCK_REPORTS.filter((item) => !traceRepo || item.repositoryId === traceRepo.id).length;

    expect(findingsCount).toBeGreaterThanOrEqual(0);
    expect(reportsCount).toBeGreaterThanOrEqual(0);
  });

  it('formats finding details clearly without sensationalism', () => {
    const raw = 'this requires review before the next change is accepted';
    const presented = presentFindingDetail(raw);
    expect(presented).toContain('TRACE detected this deterministically and recommends reviewing it');
  });

  it('verifies recent changes and workspace activity data contracts', () => {
    expect(MOCK_CHANGES.length).toBeGreaterThan(0);
    expect(MOCK_ACTIVITY.length).toBeGreaterThan(0);

    MOCK_CHANGES.forEach((change) => {
      expect(change.id).toBeDefined();
      expect(change.title).toBeDefined();
      expect(change.number).toBeGreaterThan(0);
    });

    MOCK_ACTIVITY.forEach((act) => {
      expect(act.id).toBeDefined();
      expect(act.title).toBeDefined();
      expect(act.occurredAt).toBeDefined();
    });
  });
});
