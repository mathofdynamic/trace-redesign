import type { DashboardSyncedRecord } from '../dashboard';

export const MOCK_RULES: DashboardSyncedRecord[] = [
  // --- TRACE (3 Rules) ---
  {
    id: 'rule-trace-001',
    artifactId: 'art-rule-trace-001',
    artifactType: 'rule',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Cryptographic Review & Secret Ingestion Invariant',
    summary:
      'Any changes touching auth signing keys, tokens, or credential storage require explicit two-person security review and automated constant-time verification.',
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
    id: 'rule-trace-002',
    artifactId: 'art-rule-trace-002',
    artifactType: 'rule',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Zero Circular Package Dependencies Across Monorepo',
    summary:
      'Package dependency graph must form a strict directed acyclic graph (DAG); circular dependencies across workspace packages are rejected at build time.',
    status: 'active',
    items: [
      {
        id: 'item-rule-trace-003',
        title: 'Monorepo topological layering enforcement',
        detail:
          'UI and CLI packages may depend on core and auth, but core packages cannot depend on leaf consumers.',
        severity: 'high',
        classification: 'deterministic',
        evidence: ['package.json', 'pnpm-workspace.yaml', 'turbo.json'],
      },
    ],
    generatedAt: '2026-08-02T10:00:00.000Z',
    syncedAt: '2026-08-02T10:00:00.000Z',
    origin: 'local',
    content: `# Repository Rule: Monorepo Topological Dependency Hierarchy

1. Dependencies must flow strictly from application entrypoints down to shared packages (\`apps/*\` -> \`packages/ui\` -> \`packages/trace-core\`).
2. Shared kernel packages must never import higher-level application packages.`,
  },
  {
    id: 'rule-trace-003',
    artifactId: 'art-rule-trace-003',
    artifactType: 'rule',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Privacy Guard — Source Code Exclusion on Synchronization',
    summary:
      'Artifacts synchronized to the dashboard must enforce sourceCodeIncluded: false and codeSnippetsIncluded: false.',
    status: 'active',
    items: [
      {
        id: 'item-rule-trace-004',
        title: 'Source-free synchronization guarantee',
        detail:
          'Validation rejects any payload containing raw source file contents or unredacted code blocks.',
        severity: 'high',
        classification: 'deterministic',
        evidence: ['packages/trace-schema/src/artifact.ts', 'spec/RFC-002-SYNC.md'],
      },
    ],
    generatedAt: '2026-08-03T09:00:00.000Z',
    syncedAt: '2026-08-03T09:00:00.000Z',
    origin: 'local',
    content: `# Repository Rule: Privacy-Preserving Artifact Synchronization

1. \`trace sync\` must verify that all artifacts declare \`sourceCodeIncluded: false\` and \`codeSnippetsIncluded: false\`.
2. Cloud endpoints automatically reject and audit any payload containing source code strings.`,
  },

  // --- Radar (2 Rules) ---
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
  {
    id: 'rule-radar-002',
    artifactId: 'art-rule-radar-002',
    artifactType: 'rule',
    repositoryId: 'repo-radar-002',
    repositoryName: 'northstar-engineering/Radar',
    title: 'Telemetry Ingestion Latency Ceiling & Batch Interval',
    summary:
      'Batching pipelines must flush queues within 250ms or when capacity reaches 1,000 items, and dynamically throttle timers during low traffic.',
    status: 'active',
    items: [
      {
        id: 'item-rule-radar-002',
        title: 'Adaptive flush timer constraint',
        detail: 'Eliminates busy-wait CPU loops when telemetry input queues are idle.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['src/pipeline/batcher.rs:89'],
      },
    ],
    generatedAt: '2026-08-06T11:00:00.000Z',
    syncedAt: '2026-08-06T11:00:00.000Z',
    origin: 'local',
    content: `# Repository Rule: Telemetry Batch Flush Interval & Queue Ceiling

1. Telemetry batches must flush at maximum 250ms latency or 1,000 records.
2. Flush threads must yield when queues are empty to avoid burning container CPU cycles.`,
  },

  // --- Atlas (2 Rules) ---
  {
    id: 'rule-atlas-001',
    artifactId: 'art-rule-atlas-001',
    artifactType: 'rule',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Database Migration Zero-Downtime & Backward Compatibility',
    summary:
      'All DDL migrations modifying production tables must be backward-compatible with running application worker instances.',
    status: 'active',
    items: [
      {
        id: 'item-rule-atlas-001',
        title: 'Non-blocking column and constraint addition',
        detail:
          'Columns must be added as nullable or with DEFAULT values; destructive column drops require a 2-phase release cycle.',
        severity: 'high',
        classification: 'deterministic',
        evidence: ['migrations/**', 'packages/db/src/schema.ts'],
      },
    ],
    generatedAt: '2026-08-07T14:00:00.000Z',
    syncedAt: '2026-08-07T14:00:00.000Z',
    origin: 'local',
    content: `# Repository Rule: Zero-Downtime Database Migrations

1. Direct \`ALTER TABLE ... ADD COLUMN ... NOT NULL\` without a default value is prohibited.
2. Index creation on tables exceeding 100k rows must use concurrent index creation.`,
  },
  {
    id: 'rule-atlas-002',
    artifactId: 'art-rule-atlas-002',
    artifactType: 'rule',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Multi-Tenant Query Authorization Check',
    summary:
      'Every API endpoint and repository query must validate active organization membership before executing database lookups.',
    status: 'active',
    items: [
      {
        id: 'item-rule-atlas-002',
        title: 'Tenant isolation validation',
        detail: 'Queries missing WHERE organizationId = ? filters trigger compile-time AST lint errors.',
        severity: 'high',
        classification: 'deterministic',
        evidence: ['packages/db/src/queries.ts', 'packages/auth/src/tenant.ts'],
      },
    ],
    generatedAt: '2026-08-08T15:30:00.000Z',
    syncedAt: '2026-08-08T15:30:00.000Z',
    origin: 'local',
    content: `# Repository Rule: Multi-Tenant Query Authorization

1. All repository query functions must accept \`organizationId\` and bind it in the WHERE clause.
2. Bypassing tenant filtering requires an explicit \`adminOverride\` token signed by the security module.`,
  },

  // --- Orbit (1 Rule) ---
  {
    id: 'rule-orbit-001',
    artifactId: 'art-rule-orbit-001',
    artifactType: 'rule',
    repositoryId: 'repo-orbit-004',
    repositoryName: 'northstar-engineering/Orbit',
    title: 'Minimum Supported CLI Tooling Version',
    summary:
      'Artifact synchronization requires TRACE CLI version >= 0.1.0 and manifest schema version >= 1.0.0.',
    status: 'active',
    items: [
      {
        id: 'item-rule-orbit-001',
        title: 'CLI version compatibility threshold',
        detail: 'Sync daemon blocks upload attempts from deprecated CLI binaries.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['.trace/run-metadata.json', 'crates/orbit-bridge/src/validator.rs'],
      },
    ],
    generatedAt: '2026-08-09T12:00:00.000Z',
    syncedAt: '2026-08-09T12:00:00.000Z',
    origin: 'local',
    content: `# Repository Rule: CLI Version Compatibility Threshold

1. Developer workstations synchronizing to Orbit must run TRACE CLI version 0.1.0 or newer.
2. Older binaries must update via \`pnpm update @trace/cli\` before sync negotiation will succeed.`,
  },
];

export function getRuleById(id: string): DashboardSyncedRecord | undefined {
  return MOCK_RULES.find((rule) => rule.id === id || rule.artifactId === id);
}

export function getRulesForRepository(repositoryId: string): DashboardSyncedRecord[] {
  return MOCK_RULES.filter((rule) => rule.repositoryId === repositoryId);
}

