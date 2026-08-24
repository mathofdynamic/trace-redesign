import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../mock/adapter';
import { MOCK_DECISIONS, getDecisionById, getDecisionsForRepository } from '../mock/decisions';

describe('Phase 19: Architectural Decisions Surface (/app/decisions)', () => {
  it('preserves all 9 frozen decisions across the 4 active repositories', () => {
    expect(MOCK_DECISIONS).toHaveLength(9);

    const universe = mockDataProvider.getUniverse();
    expect(universe.decisions).toHaveLength(9);

    const summary = mockDataProvider.getDashboardSummary();
    expect(summary.decisions).toHaveLength(9);
  });

  it('correctly maps decisions by repository with zero records for Nova', () => {
    const traceDecisions = getDecisionsForRepository('repo-trace-001');
    expect(traceDecisions).toHaveLength(3);

    const radarDecisions = getDecisionsForRepository('repo-radar-002');
    expect(radarDecisions).toHaveLength(2);

    const atlasDecisions = getDecisionsForRepository('repo-atlas-003');
    expect(atlasDecisions).toHaveLength(2);

    const orbitDecisions = getDecisionsForRepository('repo-orbit-004');
    expect(orbitDecisions).toHaveLength(2);

    const novaDecisions = getDecisionsForRepository('repo-nova-005');
    expect(novaDecisions).toHaveLength(0);
  });

  it('verifies TRACE decisions preserve privacy invariants and deterministic pipelines', () => {
    const d1 = getDecisionById('decision-trace-001');
    expect(d1).toBeDefined();
    expect(d1?.title).toBe('Single-Direction Local-to-Cloud Intelligence Synchronization');
    expect(d1?.items[0]?.evidence).toContain('DOC/technical-overview.md');
    expect(d1?.content).toContain('Zero intellectual property exposure');

    const d2 = getDecisionById('decision-trace-002');
    expect(d2).toBeDefined();
    expect(d2?.title).toBe('Deterministic Finding Extraction Precedes Semantic Inference');
    expect(d2?.items[0]?.classification).toBe('deterministic');

    const d3 = getDecisionById('decision-trace-003');
    expect(d3).toBeDefined();
    expect(d3?.title).toBe('Constant-Time Digest Verification for CLI Device Authentication');
    expect(d3?.items[0]?.evidence).toContain('packages/auth/src/index.ts:160');
  });

  it('verifies Radar, Atlas, and Orbit engineering memory invariants', () => {
    // Radar
    const r1 = getDecisionById('decision-radar-001');
    expect(r1?.title).toBe('Strict Memory Limits on Ingestion Ring Buffers');
    expect(r1?.items[0]?.evidence).toContain('src/buffer/ring.rs');

    // Atlas
    const a1 = getDecisionById('decision-atlas-001');
    expect(a1?.title).toBe('Staged Database Migration Sequences for Multi-Tenant Schemas');
    expect(a1?.content).toContain('Phase 1 (Expand)');

    const a2 = getDecisionById('decision-atlas-002');
    expect(a2?.title).toBe('Strict Parameterized Tenant Boundary in Shared Query Layers');
    expect(a2?.items[0]?.evidence).toContain('packages/auth/src/tenant.ts');

    // Orbit
    const o1 = getDecisionById('decision-orbit-001');
    expect(o1?.title).toBe('Semantic Versioning & Schema Negotiation on Ingestion Bridge');
    expect(o1?.items[0]?.evidence).toContain('crates/orbit-bridge/src/validator.rs');

    const o2 = getDecisionById('decision-orbit-002');
    expect(o2?.title).toBe('Idempotent Sync Retry with Exponential Jitter');
  });

  it('verifies anti-surveillance and local provenance guarantees for all decisions', () => {
    for (const decision of MOCK_DECISIONS) {
      expect(decision.origin).toBe('local');
      expect(decision.status).toBe('recorded');
      expect(decision.content).not.toMatch(/developer score/i);
      expect(decision.content).not.toMatch(/developer rank/i);
      expect(decision.content).not.toMatch(/individual productivity/i);
    }
  });
});
