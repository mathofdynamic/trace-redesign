import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../mock/adapter';
import { MOCK_RULES, getRuleById, getRulesForRepository } from '../mock/rules';

describe('Phase 20: Governance Rules Surface (/app/rules)', () => {
  it('preserves all 8 frozen rules across the 4 active repositories', () => {
    expect(MOCK_RULES).toHaveLength(8);

    const universe = mockDataProvider.getUniverse();
    expect(universe.rules).toHaveLength(8);

    const summary = mockDataProvider.getDashboardSummary();
    expect(summary.rules).toHaveLength(8);
  });

  it('correctly maps rules by repository with zero records for Nova', () => {
    const traceRules = getRulesForRepository('repo-trace-001');
    expect(traceRules).toHaveLength(3);

    const radarRules = getRulesForRepository('repo-radar-002');
    expect(radarRules).toHaveLength(2);

    const atlasRules = getRulesForRepository('repo-atlas-003');
    expect(atlasRules).toHaveLength(2);

    const orbitRules = getRulesForRepository('repo-orbit-004');
    expect(orbitRules).toHaveLength(1);

    const novaRules = getRulesForRepository('repo-nova-005');
    expect(novaRules).toHaveLength(0);
  });

  it('verifies TRACE governance rules preserve privacy invariants and security bounds', () => {
    const r1 = getRuleById('rule-trace-001');
    expect(r1).toBeDefined();
    expect(r1?.title).toBe('Cryptographic Review & Secret Ingestion Invariant');
    expect(r1?.items[0]?.evidence).toContain('packages/auth/**');
    expect(r1?.items[1]?.evidence).toContain('.trace/**');
    expect(r1?.items[0]?.severity).toBe('high');

    const r2 = getRuleById('rule-trace-002');
    expect(r2).toBeDefined();
    expect(r2?.title).toBe('Zero Circular Package Dependencies Across Monorepo');
    expect(r2?.items[0]?.classification).toBe('deterministic');
    expect(r2?.items[0]?.evidence).toContain('package.json');

    const r3 = getRuleById('rule-trace-003');
    expect(r3).toBeDefined();
    expect(r3?.title).toBe('Privacy Guard — Source Code Exclusion on Synchronization');
    expect(r3?.items[0]?.evidence).toContain('packages/trace-schema/src/artifact.ts');
    expect(r3?.content).toContain('sourceCodeIncluded: false');
  });

  it('verifies Radar, Atlas, and Orbit engineering constraints', () => {
    // Radar
    const radar1 = getRuleById('rule-radar-001');
    expect(radar1?.title).toBe('Deterministic Memory Bounds Policy');
    expect(radar1?.items[0]?.evidence).toContain('src/ingestion/**');
    expect(radar1?.items[0]?.severity).toBe('medium');

    const radar2 = getRuleById('rule-radar-002');
    expect(radar2?.title).toBe('Telemetry Ingestion Latency Ceiling & Batch Interval');
    expect(radar2?.items[0]?.evidence).toContain('src/pipeline/batcher.rs:89');
    expect(radar2?.items[0]?.severity).toBe('low');

    // Atlas
    const atlas1 = getRuleById('rule-atlas-001');
    expect(atlas1?.title).toBe('Database Migration Zero-Downtime & Backward Compatibility');
    expect(atlas1?.items[0]?.evidence).toContain('migrations/**');
    expect(atlas1?.items[0]?.severity).toBe('high');

    const atlas2 = getRuleById('rule-atlas-002');
    expect(atlas2?.title).toBe('Multi-Tenant Query Authorization Check');
    expect(atlas2?.items[0]?.evidence).toContain('packages/db/src/queries.ts');

    // Orbit
    const orbit1 = getRuleById('rule-orbit-001');
    expect(orbit1?.title).toBe('Minimum Supported CLI Tooling Version');
    expect(orbit1?.items[0]?.evidence).toContain('.trace/run-metadata.json');
    expect(orbit1?.items[0]?.severity).toBe('medium');
  });

  it('verifies anti-surveillance and local provenance guarantees for all rules', () => {
    for (const rule of MOCK_RULES) {
      expect(rule.origin).toBe('local');
      expect(rule.status).toBe('active');
      expect(rule.content).not.toMatch(/developer score/i);
      expect(rule.content).not.toMatch(/developer rank/i);
      expect(rule.content).not.toMatch(/compliance score/i);
      expect(rule.content).not.toMatch(/productivity rating/i);
    }
  });
});
