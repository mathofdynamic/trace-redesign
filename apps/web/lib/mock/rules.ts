import type { DashboardSyncedRecord } from '../dashboard';

export const MOCK_RULES: DashboardSyncedRecord[] = [
  {
    id: 'rule-trace-001',
    artifactId: 'art-rule-trace-001',
    artifactType: 'rule',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Cryptographic Review & Secret Ingestion Invariant',
    summary:
      'Any changes touching auth signing keys, tokens, or credential storage require explicit two-person security review.',
    status: 'active',
    items: [
      {
        id: 'item-rule-trace-001',
        title: 'Auth package boundary enforcement',
        detail:
          'Files in packages/auth/** cannot import external networking libraries outside of vetted runtime wrappers.',
        severity: 'high',
        classification: 'deterministic',
        evidence: ['packages/auth/**'],
      },
      {
        id: 'item-rule-trace-002',
        title: 'Zero unredacted secret tokens in artifacts',
        detail: 'Pre-sync scanner enforces high-entropy token exclusion on all .trace artifacts.',
        severity: 'high',
        classification: 'deterministic',
        evidence: ['.trace/**'],
      },
    ],
    generatedAt: '2026-08-01T08:00:00.000Z',
    syncedAt: '2026-08-01T08:00:00.000Z',
    origin: 'local',
    content: `# Repository Rule: Cryptographic & Secret Ingestion Invariants

1. Auth package boundary: files under \`packages/auth/**\` must pass strict lint and constant-time analysis.
2. Zero secret tokens in \`.trace\` synchronization payloads.`,
  },
  {
    id: 'rule-radar-001',
    artifactId: 'art-rule-radar-001',
    artifactType: 'rule',
    repositoryId: 'repo-radar-002',
    repositoryName: 'northstar-engineering/Radar',
    title: 'Deterministic Memory Bounds Policy',
    summary:
      'All buffer allocations in ingestion pipelines must have compile-time or static configuration ceilings.',
    status: 'active',
    items: [
      {
        id: 'item-rule-radar-001',
        title: 'No unbounded Vec allocation in ingestion handlers',
        detail: 'Continuous stream buffers must use bounded capacity ring buffers.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['src/ingestion/**'],
      },
    ],
    generatedAt: '2026-08-05T09:00:00.000Z',
    syncedAt: '2026-08-05T09:00:00.000Z',
    origin: 'local',
    content: `# Repository Rule: Deterministic Memory Bounds Policy

All ingestion stream workers must declare upper buffer bounds.`,
  },
];
