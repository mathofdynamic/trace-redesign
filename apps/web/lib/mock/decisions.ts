import type { DashboardSyncedRecord } from '../dashboard';

export const MOCK_DECISIONS: DashboardSyncedRecord[] = [
  {
    id: 'decision-trace-001',
    artifactId: 'art-decision-trace-001',
    artifactType: 'decision',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Single-Direction Local-to-Cloud Intelligence Synchronization',
    summary:
      'Dashboard surfaces only digest hashes and metadata; raw source code is never transmitted across the network boundary.',
    status: 'recorded',
    items: [
      {
        id: 'item-decision-trace-001',
        title: 'Privacy and Trust Boundary Invariant',
        detail:
          'Local CLI handles full source tree parsing; cloud ingestion strictly validates JSON metadata schemas without source payloads.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['DOC/technical-overview.md', 'DOC/security/threat-model.md'],
      },
    ],
    generatedAt: '2026-08-15T12:00:00.000Z',
    syncedAt: '2026-08-15T12:00:00.000Z',
    origin: 'local',
    content: `# Architectural Decision: Privacy and Trust Boundary

## Context
Engineering organizations require deep code change intelligence without transmitting proprietary source code to external servers.

## Decision
All syntactic and semantic analysis runs locally via \`trace analyze\`. Only redacted, structured artifacts in \`.trace/\` are synchronized upon explicit human command.`,
  },
  {
    id: 'decision-radar-001',
    artifactId: 'art-decision-radar-001',
    artifactType: 'decision',
    repositoryId: 'repo-radar-002',
    repositoryName: 'northstar-engineering/Radar',
    title: 'Strict Memory Limits on Ingestion Ring Buffers',
    summary:
      'All stream buffers must declare hard capacity bounds and reject overflows gracefully rather than expanding dynamically.',
    status: 'recorded',
    items: [
      {
        id: 'item-decision-radar-001',
        title: 'Deterministic resource consumption guarantee',
        detail: 'Prevents out-of-memory crashes on containerized ingestion pods.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['src/ingestion/config.rs'],
      },
    ],
    generatedAt: '2026-08-10T14:00:00.000Z',
    syncedAt: '2026-08-10T14:00:00.000Z',
    origin: 'local',
    content: `# Architectural Decision: Bounded Ring Buffers

## Context
High rate ingestion bursts caused variable heap spikes.

## Decision
Standardize on ring buffers with fixed upper bound and deterministic drop policies.`,
  },
];
