import type { DashboardSyncedRecord } from '../dashboard';

export const MOCK_DECISIONS: DashboardSyncedRecord[] = [
  // --- TRACE (3 Decisions) ---
  {
    id: 'decision-trace-001',
    artifactId: 'art-decision-trace-001',
    artifactType: 'decision',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Single-Direction Local-to-Cloud Intelligence Synchronization',
    summary:
      'Dashboard surfaces only digest hashes, finding metadata, and report summaries; raw source code is never transmitted across the network boundary.',
    status: 'recorded',
    relatedFindingIds: ['att-trace-003'],
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
    content: `# Architectural Decision: Privacy and Trust Boundary Invariant

## Status
Recorded · Approved by Architecture Guild

## Context
Engineering organizations require deep code change intelligence and conflict detection across distributed teams without transmitting proprietary source code or credentials to external servers.

## Decision
1. All AST parsing, symbol extraction, and deterministic verification run locally on the developer workstation via \`trace analyze\`.
2. Synchronized payloads in \`.trace/\` are restricted to cryptographic hashes, AST metric summaries, rule violations, and generated report markdown.
3. Ingestion bridge rejects any upload payload where \`sourceCodeIncluded\` or \`codeSnippetsIncluded\` is true.

## Consequences
- Zero intellectual property exposure in cloud-hosted dashboard.
- Developer machines bear AST parsing workload, keeping hosted backend lean and scalable.`,
  },
  {
    id: 'decision-trace-002',
    artifactId: 'art-decision-trace-002',
    artifactType: 'decision',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Deterministic Finding Extraction Precedes Semantic Inference',
    summary:
      'All static code analysis, AST checks, test coverage checks, and dependency validations run deterministically before any optional AI model inference is invoked.',
    status: 'recorded',
    relatedFindingIds: ['att-trace-005'],
    items: [
      {
        id: 'item-decision-trace-002',
        title: 'Fact vs Inference Separation Principle',
        detail:
          'Deterministic facts establish indisputable ground truth; semantic outputs are strictly tagged with classification: probabilistic and cannot override deterministic evidence.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/trace-core/src/analysis.ts', 'spec/RFC-001-ANALYSIS-PIPELINE.md'],
      },
    ],
    generatedAt: '2026-08-16T10:00:00.000Z',
    syncedAt: '2026-08-16T10:00:00.000Z',
    origin: 'local',
    content: `# Architectural Decision: Deterministic-First Analysis Pipeline

## Status
Recorded · Approved by Core Team

## Context
AI-assisted code analysis often produces non-deterministic hallucinations or noisy suggestions that undermine developer trust in automated tooling.

## Decision
- Static AST parsing, TypeScript compiler diagnostic extraction, test coverage diffing, and dependency graph analysis execute first as Stage 1 (Deterministic).
- Optional model inference (Stage 2) is strictly grounded in Stage 1 deterministic facts and labeled with \`classification: "probabilistic"\`.
- Findings generated deterministically cannot be suppressed by model interpretations.

## Consequences
- Total reproducibility across repeated local runs on the same commit SHA.
- Clear cognitive distinction for developers between verified bugs and advisory suggestions.`,
  },
  {
    id: 'decision-trace-003',
    artifactId: 'art-decision-trace-003',
    artifactType: 'decision',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Constant-Time Digest Verification for CLI Device Authentication',
    summary:
      'All CLI authentication token comparisons and session signature validations must use constant-time cryptographic hash equality to prevent timing side-channel attacks.',
    status: 'recorded',
    relatedFindingIds: ['att-trace-001'],
    items: [
      {
        id: 'item-decision-trace-003',
        title: 'Timing attack mitigation standard',
        detail:
          'crypto.timingSafeEqual enforced across all device code and session validation paths.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/auth/src/index.ts:160', 'packages/trace-cli/src/auth.ts:45'],
      },
    ],
    generatedAt: '2026-08-17T14:30:00.000Z',
    syncedAt: '2026-08-17T14:30:00.000Z',
    origin: 'local',
    content: `# Architectural Decision: Constant-Time Digest Verification

## Status
Recorded · Approved by Security Architect (Sarah Chen)

## Context
High-resolution network timing analysis on authentication endpoints could allow attackers to incrementally deduce device pairing tokens and session digests.

## Decision
All device code verification, session token lookup, and signature validation functions must utilize \`crypto.timingSafeEqual\` or equivalent constant-time comparison buffers.

## Consequences
- Immune to remote timing side-channel attacks on device pairing and sync authentication.`,
  },

  // --- Radar (2 Decisions) ---
  {
    id: 'decision-radar-001',
    artifactId: 'art-decision-radar-001',
    artifactType: 'decision',
    repositoryId: 'repo-radar-002',
    repositoryName: 'northstar-engineering/Radar',
    title: 'Strict Memory Limits on Ingestion Ring Buffers',
    summary:
      'All stream buffers must declare hard capacity bounds and reject overflows gracefully rather than expanding heap allocations dynamically.',
    status: 'recorded',
    relatedFindingIds: ['att-radar-001'],
    items: [
      {
        id: 'item-decision-radar-001',
        title: 'Deterministic resource consumption guarantee',
        detail: 'Prevents out-of-memory crashes on containerized ingestion pods during high-throughput bursts.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['src/ingestion/config.rs', 'src/buffer/ring.rs'],
      },
    ],
    generatedAt: '2026-08-10T14:00:00.000Z',
    syncedAt: '2026-08-10T14:00:00.000Z',
    origin: 'local',
    content: `# Architectural Decision: Bounded Ring Buffers for Ingestion Stream

## Status
Recorded · Approved by Telemetry Lead

## Context
Unbounded dynamic vector allocations during sustained traffic spikes caused container pods to exceed memory limits, triggering OOM kills and cascading connection drops.

## Decision
1. Standardize all telemetry ingestion pipelines on pre-allocated circular ring buffers with fixed memory caps.
2. When capacity is exceeded, apply backpressure signaling or deterministic drop policies based on event priority.

## Consequences
- Predictable, flat memory consumption under arbitrary traffic volumes.
- Eliminates JVM / Rust heap fragmentation and garbage collection pauses on ingestion hot-paths.`,
  },
  {
    id: 'decision-radar-002',
    artifactId: 'art-decision-radar-002',
    artifactType: 'decision',
    repositoryId: 'repo-radar-002',
    repositoryName: 'northstar-engineering/Radar',
    title: 'Connection Pool Recycling & Keepalive Probing Policy',
    summary:
      'TCP transport workers must actively probe idle sockets with keepalive heartbeats and recycle connections after 300 seconds of inactivity.',
    status: 'recorded',
    relatedFindingIds: ['att-radar-002'],
    items: [
      {
        id: 'item-decision-radar-002',
        title: 'Half-open TCP socket teardown protocol',
        detail: 'Eliminates stale connection retention during network partition recovery.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['src/transport/socket.rs:64', 'src/transport/pool.rs:112'],
      },
    ],
    generatedAt: '2026-08-12T16:00:00.000Z',
    syncedAt: '2026-08-12T16:00:00.000Z',
    origin: 'local',
    content: `# Architectural Decision: Connection Pool Lifecycle and Socket Recycling

## Status
Recorded · Approved by Platform Team

## Context
Network partitions and load balancer failovers left half-open TCP connections in ESTABLISHED state, consuming operating system file descriptors indefinitely.

## Decision
Configure SO_KEEPALIVE with a 60-second idle probe interval and enforce pool socket recycling after 300 seconds of inactivity.

## Consequences
- Rapid detection and cleanup of dead connections.
- Prevents file descriptor exhaustion during regional network transients.`,
  },

  // --- Atlas (2 Decisions) ---
  {
    id: 'decision-atlas-001',
    artifactId: 'art-decision-atlas-001',
    artifactType: 'decision',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Staged Database Migration Sequences for Multi-Tenant Schemas',
    summary:
      'Database migrations modifying shared multi-tenant tables must execute in backward-compatible stages (expand, migrate, contract) with zero downtime.',
    status: 'recorded',
    relatedFindingIds: ['att-atlas-001'],
    items: [
      {
        id: 'item-decision-atlas-001',
        title: 'Zero-downtime migration policy',
        detail: 'Prohibits direct NOT NULL additions without default backfills and staged index creation.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['migrations/README.md', 'packages/db/src/schema.ts'],
      },
    ],
    generatedAt: '2026-08-14T09:00:00.000Z',
    syncedAt: '2026-08-14T09:00:00.000Z',
    origin: 'local',
    content: `# Architectural Decision: Staged Database Migrations for Multi-Tenant Tables

## Status
Recorded · Approved by Database Architect

## Context
Direct table alterations (such as adding non-nullable columns or renaming foreign keys) caused locking contention and broke concurrently running backend worker pods.

## Decision
1. All multi-tenant schema changes must adhere to a 3-phase rollout:
   - **Phase 1 (Expand)**: Add column as nullable or with a safe default.
   - **Phase 2 (Migrate)**: Deploy code writing to new columns and backfill existing rows.
   - **Phase 3 (Contract)**: Apply constraints or drop deprecated columns in a subsequent release.
2. Concurrent migrations touching the same tables must be sequenced in staging before release.

## Consequences
- Zero-downtime database upgrades with seamless rollback capabilities.`,
  },
  {
    id: 'decision-atlas-002',
    artifactId: 'art-decision-atlas-002',
    artifactType: 'decision',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Strict Parameterized Tenant Boundary in Shared Query Layers',
    summary:
      'Every database query touching tenant data must require explicit organizationId parameter binding enforced at compile-time.',
    status: 'recorded',
    relatedFindingIds: ['att-atlas-003'],
    items: [
      {
        id: 'item-decision-atlas-002',
        title: 'Organization isolation invariant',
        detail: 'Prevents cross-tenant data leakage via automated query wrapper verification.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/db/src/queries.ts', 'packages/auth/src/tenant.ts'],
      },
    ],
    generatedAt: '2026-08-15T15:00:00.000Z',
    syncedAt: '2026-08-15T15:00:00.000Z',
    origin: 'local',
    content: `# Architectural Decision: Compile-Time Tenant Isolation Invariant

## Status
Recorded · Approved by Security & Compliance Lead

## Context
Multi-tenant architectures run the risk of developer oversight omitting tenant filters in complex SQL joins, causing cross-organization data leakage.

## Decision
1. Enforce parameterized database query helpers that require \`organizationId: string\` as the primary argument.
2. AST analysis in CI flags and rejects any raw SQL query touching tenant tables without an explicit organization predicate.

## Consequences
- Mathematically enforced tenant isolation across all query execution paths.`,
  },

  // --- Orbit (2 Decisions) ---
  {
    id: 'decision-orbit-001',
    artifactId: 'art-decision-orbit-001',
    artifactType: 'decision',
    repositoryId: 'repo-orbit-004',
    repositoryName: 'northstar-engineering/Orbit',
    title: 'Semantic Versioning & Schema Negotiation on Ingestion Bridge',
    summary:
      'Artifact sync ingestion bridge must support N-1 minor schema versions and gracefully reject unsupported versions with structured error envelopes.',
    status: 'recorded',
    relatedFindingIds: ['att-orbit-001', 'att-orbit-002'],
    items: [
      {
        id: 'item-decision-orbit-001',
        title: 'Ingestion protocol backward compatibility',
        detail: 'Prevents silent artifact drop during rolling CLI or service upgrades.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['crates/orbit-bridge/src/validator.rs', 'crates/orbit-protocol/src/manifest.rs'],
      },
    ],
    generatedAt: '2026-08-11T11:00:00.000Z',
    syncedAt: '2026-08-11T11:00:00.000Z',
    origin: 'local',
    content: `# Architectural Decision: Schema Negotiation on Ingestion Bridge

## Status
Recorded · Approved by Distributed Systems Guild

## Context
CLI client updates occur asynchronously across developer workstations, resulting in varied manifest format versions communicating with the ingestion bridge simultaneously.

## Decision
1. Manifest schemas use SemVer (\`vMAJOR.MINOR.PATCH\`).
2. Ingestion bridges must parse and promote all manifests within the current MAJOR version.
3. Unsupported manifests must receive structured HTTP 422 error envelopes detailing migration steps.

## Consequences
- Smooth rolling upgrades of developer tooling without synchronized deployment lockstep.`,
  },
  {
    id: 'decision-orbit-002',
    artifactId: 'art-decision-orbit-002',
    artifactType: 'decision',
    repositoryId: 'repo-orbit-004',
    repositoryName: 'northstar-engineering/Orbit',
    title: 'Idempotent Sync Retry with Exponential Jitter',
    summary:
      'Failed artifact uploads must be safely retryable without duplicate promotion, using transaction-level operation locks and exponential backoff.',
    status: 'recorded',
    relatedFindingIds: ['att-orbit-003'],
    items: [
      {
        id: 'item-decision-orbit-002',
        title: 'Resilient sync recovery guarantee',
        detail: 'Guarantees atomic commit or rollback of multi-artifact sync operations.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['crates/orbit-sync/src/recovery.rs', 'crates/orbit-sync/src/client.rs'],
      },
    ],
    generatedAt: '2026-08-13T13:30:00.000Z',
    syncedAt: '2026-08-13T13:30:00.000Z',
    origin: 'local',
    content: `# Architectural Decision: Idempotent Sync Retry with Exponential Jitter

## Status
Recorded · Approved by Systems Engineering

## Context
Transient network dropouts during large multi-artifact uploads caused partial sync state and left incomplete operations stranded in the database.

## Decision
1. Ingestion operations are uniquely identified by \`operationId\` and locked in PostgreSQL during promotion.
2. Clients execute retries with exponential backoff and randomized jitter to prevent thundering herd spikes.
3. Repeated uploads for the same completed \`operationId\` return \`idempotent: true\` with 0 bytes transferred.

## Consequences
- Safe, self-healing synchronization recovery under unpredictable network conditions.`,
  },
];

export function getDecisionById(id: string): DashboardSyncedRecord | undefined {
  return MOCK_DECISIONS.find((decision) => decision.id === id || decision.artifactId === id);
}

export function getDecisionsForRepository(repositoryId: string): DashboardSyncedRecord[] {
  return MOCK_DECISIONS.filter((decision) => decision.repositoryId === repositoryId);
}

