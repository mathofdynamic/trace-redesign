import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../mock/adapter';
import { MOCK_ACTIVITY, getActivityByRepository } from '../mock/activity';
import {
  deriveActivityCategory,
  parseActivityTokens,
  formatEventGroupDate,
  formatEventTime,
} from '../../app/(app)/app/_components/activity-view';

describe('Phase 21: Workspace Activity Surface (/app/activity)', () => {
  it('preserves all 35 frozen events across workspace-wide mock ledger', () => {
    expect(MOCK_ACTIVITY).toHaveLength(35);

    const universe = mockDataProvider.getUniverse();
    expect(universe.activity).toHaveLength(35);

    const summary = mockDataProvider.getDashboardSummary();
    expect(summary.activity).toHaveLength(35);
  });

  it('correctly attributes events to repositories and enforces Nova truth', () => {
    const traceActivity = getActivityByRepository('repo-trace-001');
    expect(traceActivity).toHaveLength(14);

    const atlasActivity = getActivityByRepository('repo-atlas-003');
    expect(atlasActivity).toHaveLength(9);

    const radarActivity = getActivityByRepository('repo-radar-002');
    expect(radarActivity).toHaveLength(5);

    const orbitActivity = getActivityByRepository('repo-orbit-004');
    expect(orbitActivity).toHaveLength(6);

    const novaActivity = getActivityByRepository('repo-nova-005');
    // Nova only has the connection event, no impossible analysis or report records
    expect(novaActivity).toHaveLength(1);
    expect(novaActivity[0]?.kind).toBe('repository-connected');
    expect(novaActivity[0]?.title).toBe('Repository connected to workspace');
  });

  it('correctly derives categories for diverse engineering event types', () => {
    const actReport = MOCK_ACTIVITY.find((a) => a.id === 'act-001')!;
    expect(deriveActivityCategory(actReport)).toBe('report');

    const actDecision = MOCK_ACTIVITY.find((a) => a.id === 'act-017')!;
    expect(deriveActivityCategory(actDecision)).toBe('decision');

    const actRule = MOCK_ACTIVITY.find((a) => a.id === 'act-031')!;
    expect(deriveActivityCategory(actRule)).toBe('rule');

    const actConflict = MOCK_ACTIVITY.find((a) => a.id === 'act-007')!;
    expect(deriveActivityCategory(actConflict)).toBe('conflict');

    const actAnalysis = MOCK_ACTIVITY.find((a) => a.id === 'act-004')!;
    expect(deriveActivityCategory(actAnalysis)).toBe('analysis');

    const actSystem = MOCK_ACTIVITY.find((a) => a.id === 'act-011')!;
    expect(deriveActivityCategory(actSystem)).toBe('system');
  });

  it('correctly parses linked entity tokens from activity detail strings', () => {
    const act001Tokens = parseActivityTokens(MOCK_ACTIVITY[0]!.detail);
    expect(act001Tokens.some((t) => t.type === 'report' && t.id === 'art-report-radar-001')).toBe(true);

    const act002Tokens = parseActivityTokens(MOCK_ACTIVITY[1]!.detail);
    expect(act002Tokens.some((t) => t.type === 'pr' && t.number === 'PR #41')).toBe(true);
    expect(act002Tokens.some((t) => t.type === 'commit' && t.sha === '1e9b8a4746f3')).toBe(true);

    const act017Tokens = parseActivityTokens(MOCK_ACTIVITY.find((a) => a.id === 'act-017')!.detail);
    expect(act017Tokens.some((t) => t.type === 'decision' && t.id === 'art-decision-trace-003')).toBe(true);

    const act035Tokens = parseActivityTokens(MOCK_ACTIVITY.find((a) => a.id === 'act-035')!.detail);
    expect(act035Tokens.some((t) => t.type === 'rule' && t.id === 'art-rule-trace-001')).toBe(true);
  });

  it('verifies Orbit sync sequence and schema mismatch integrity', () => {
    const orbitEvents = getActivityByRepository('repo-orbit-004');
    const hasSchemaMismatch = orbitEvents.some((e) => e.title.includes('Dashboard artifact schema mismatch'));
    const hasBridgeReport = orbitEvents.some((e) => e.title.includes('CLI Ingestion Schema & Bridge Sync Failure'));
    const hasBaselineSync = orbitEvents.some((e) => e.title.includes('Baseline change intelligence synchronized'));

    expect(hasSchemaMismatch).toBe(true);
    expect(hasBridgeReport).toBe(true);
    expect(hasBaselineSync).toBe(true);
  });

  it('verifies anti-surveillance guarantees across all 35 activity records', () => {
    for (const act of MOCK_ACTIVITY) {
      expect(act.title).not.toMatch(/developer score/i);
      expect(act.title).not.toMatch(/developer rank/i);
      expect(act.title).not.toMatch(/productivity rating/i);
      expect(act.detail).not.toMatch(/developer score/i);
      expect(act.detail).not.toMatch(/developer rank/i);
    }
  });

  it('formats dates and timestamps accurately without throwing', () => {
    const dateFormatted = formatEventGroupDate('2026-08-19T10:15:00.000Z');
    expect(dateFormatted).toContain('August 19, 2026');
    expect(dateFormatted).toContain('Today');

    const timeFormatted = formatEventTime('2026-08-19T10:15:00.000Z');
    expect(timeFormatted).toMatch(/10:15/);
  });
});
