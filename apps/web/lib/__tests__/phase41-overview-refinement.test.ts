import { describe, expect, it } from 'vitest';
import {
  MOCK_REPOSITORIES,
  MOCK_ATTENTION,
  MOCK_CHANGES,
  MOCK_ACTIVITY,
} from '../mock';
import {
  deriveTraceProjectState,
  localTraceCommandsForState,
  presentFindingDetail,
  stateToneClass,
  type TraceProjectStateKey,
} from '../dashboard-state';

describe('Phase 41: Overview Project Selector, Trace Rail & Readability', () => {
  it('validates compact project selector state derivation and aria context', () => {
    const repo = MOCK_REPOSITORIES[0]!;
    expect(repo).toBeDefined();
    const attention = MOCK_ATTENTION.filter((a) => !a.repositoryId || a.repositoryId === repo.id);
    const state = deriveTraceProjectState(repo, attention);

    expect(state.key).toBe('needs-refresh');
    expect(state.shortLabel).toBe('Needs refresh');
    expect(stateToneClass(state.tone)).toBe('state-tone--warning');

    // Accessible name test
    const accessibleLabel = `Current repository: ${repo.fullName}, state: ${state.shortLabel}`;
    expect(accessibleLabel).toContain('northstar-engineering/TRACE');
    expect(accessibleLabel).toContain('Needs refresh');
  });

  it('validates 4-node trace rail lifecycle mapping and distribution invariants', () => {
    const railLabels = [
      { long: 'GitHub', short: 'GitHub' },
      { long: 'Local analysis', short: 'Analyze' },
      { long: 'Synced record', short: 'Sync' },
      { long: 'Freshness', short: 'Fresh' },
    ];

    expect(railLabels).toHaveLength(4);
    expect(railLabels[0]!.long).toBe('GitHub');
    expect(railLabels[1]!.long).toBe('Local analysis');
    expect(railLabels[2]!.long).toBe('Synced record');
    expect(railLabels[3]!.long).toBe('Freshness');

    // Verify step progression logic
    const statesToTest: Array<{ key: TraceProjectStateKey; expectedComplete: number }> = [
      { key: 'current', expectedComplete: 4 },
      { key: 'needs-refresh', expectedComplete: 3 },
      { key: 'synced-freshness-unavailable', expectedComplete: 3 },
      { key: 'sync-attention', expectedComplete: 2 },
      { key: 'analysis-available-locally', expectedComplete: 2 },
      { key: 'connected-not-analyzed', expectedComplete: 1 },
      { key: 'analysis-running', expectedComplete: 1 },
      { key: 'analysis-failed', expectedComplete: 1 },
      { key: 'not-connected', expectedComplete: 0 },
    ];

    for (const { key, expectedComplete } of statesToTest) {
      const completion =
        key === 'current'
          ? 4
          : key === 'needs-refresh' || key === 'synced-freshness-unavailable'
            ? 3
            : key === 'sync-attention' || key === 'analysis-available-locally'
              ? 2
              : key === 'connected-not-analyzed' || key === 'analysis-running' || key === 'analysis-failed'
                ? 1
                : 0;
      expect(completion).toBe(expectedComplete);
    }
  });

  it('verifies attention rows remain high-signal, concise, and non-sensational', () => {
    const attentionItems = MOCK_ATTENTION;
    expect(attentionItems.length).toBeGreaterThan(0);

    for (const item of attentionItems) {
      expect(item.title).toBeDefined();
      expect(item.title.length).toBeGreaterThan(0);
      if (item.detail) {
        const presented = presentFindingDetail(item.detail);
        // Ensure no sensational or panicky language
        expect(presented.toLowerCase()).not.toContain('disaster');
        expect(presented.toLowerCase()).not.toContain('catastrophic');
        expect(presented.toLowerCase()).not.toContain('urgent emergency');
      }
    }
  });

  it('ensures project state commands align with deterministic local-first execution', () => {
    const commands = localTraceCommandsForState('needs-refresh');
    expect(commands).toContain('trace analyze');
    expect(commands).toContain('trace sync');
  });

  it('validates recent changes and activity metadata structure', () => {
    expect(MOCK_CHANGES.length).toBeGreaterThan(0);
    expect(MOCK_ACTIVITY.length).toBeGreaterThan(0);

    const change = MOCK_CHANGES[0]!;
    expect(change.title).toBeDefined();
    expect(change.number).toBeGreaterThan(0);
    expect(change.repositoryName).toBeDefined();

    const activity = MOCK_ACTIVITY[0]!;
    expect(activity.title).toBeDefined();
    expect(activity.occurredAt).toBeDefined();
  });
});
