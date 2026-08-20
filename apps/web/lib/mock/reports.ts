import type { DashboardSyncedRecord } from '../dashboard';
import { MOCK_REPOSITORIES } from './repositories';
import { MOCK_CHANGES } from './changes';
import { MOCK_ATTENTION } from './findings';
import { MOCK_EVIDENCE } from './evidence';

export const MOCK_REPORTS: DashboardSyncedRecord[] = [
  // =========================================================================
  // TRACE (repo-trace-001) — 5 reports
  // Analyzed commit: 4953addc8992f882a1c983bad061fb8035213276
  // Remote HEAD: 8c74d21054a329e7104b689a7f3d5e219084c7aa (Needs refresh)
  // =========================================================================
  {
    id: 'report-trace-001',
    artifactId: 'art-report-trace-001',
    artifactType: 'daily_report',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Daily Change Brief — August 19, 2026',
    summary:
      '3 active PRs reviewed across authentication, synchronization, and artifact management. 1 high-severity cryptographic finding flagged on CLI token comparison, monorepo lockfile consistency verified, and 0 architectural regressions detected.',
    status: 'approved',
    timeWindow: '2026-08-19',
    generatedAt: '2026-08-19T09:30:00.000Z',
    syncedAt: '2026-08-19T09:30:00.000Z',
    origin: 'local',
    analyzedCommit: '4953addc8992f882a1c983bad061fb8035213276',
    remoteHeadCommit: '8c74d21054a329e7104b689a7f3d5e219084c7aa',
    freshness: 'needs-refresh',
    relatedChangeIds: ['change-trace-101', 'change-trace-102', 'change-trace-103'],
    relatedFindingIds: ['att-trace-001', 'att-trace-002', 'att-trace-007', 'att-trace-008'],
    relatedEvidenceIds: ['ev-trace-001', 'ev-trace-002', 'ev-trace-003', 'ev-trace-004'],
    items: [
      {
        id: 'item-report-trace-001',
        title: 'Auth cryptographic boundary verification flagged',
        detail:
          'A deterministic local record indicates token hashes may be compared without constant-time digest verification in PR #101.',
        severity: 'high',
        classification: 'deterministic',
        evidence: ['packages/auth/src/index.ts:160', 'packages/trace-cli/src/auth.ts:45'],
        changeId: 'change-trace-101',
        changeNumber: 101,
        findingId: 'att-trace-001',
        evidenceId: 'ev-trace-001',
      },
      {
        id: 'item-report-trace-002',
        title: 'GitHub freshness polling cadence verified',
        detail: 'Sync webhook signature validation timeout handling audited in PR #102.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['packages/sync/src/github.ts:92'],
        changeId: 'change-trace-102',
        changeNumber: 102,
        findingId: 'att-trace-007',
        evidenceId: 'ev-trace-002',
      },
      {
        id: 'item-report-trace-003',
        title: 'Synchronized artifact identity hashing audited',
        detail:
          'Artifact deduplication digest verified against SHA-256 collision invariant in PR #103.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['packages/sync/src/manifest.ts:118'],
        changeId: 'change-trace-103',
        changeNumber: 103,
        findingId: 'att-trace-008',
        evidenceId: 'ev-trace-003',
      },
      {
        id: 'item-report-trace-004',
        title: 'Monorepo workspace lockfile consistency verified',
        detail:
          'All workspace dependencies audited against pnpm-lock.yaml with zero unpinned version ranges.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['pnpm-lock.yaml:1-40'],
        findingId: 'att-trace-004',
        evidenceId: 'ev-trace-004',
      },
    ],
    content: `# Daily Change Brief — August 19, 2026

Repository: northstar-engineering/TRACE
Generated: 2026-08-19T09:30:00.000Z
Analyzed commit: 4953addc8992f882a1c983bad061fb8035213276
GitHub remote head: 8c74d21054a329e7104b689a7f3d5e219084c7aa
Freshness status: Needs refresh (local analysis describes commit 4953addc8992; newer commits exist on GitHub)

## Summary
3 active PRs reviewed across authentication, synchronization, and artifact management. 1 high-severity cryptographic finding was flagged in CLI device-token comparison, while 0 architectural regressions were detected across the package boundary graph.

## Changes Reviewed
- PR #101 (Harden CLI device-token verification, branch: fix/cli-token-hashing, author: alex-chen): Introduces SHA-256 token hashing for CLI devices. Flagged for standard string comparison vulnerability.
- PR #102 (Improve GitHub freshness verification, branch: feat/github-sync-cadence, author: maya-lin): Refactors webhook timestamp validation and freshness cache TTL.
- PR #103 (Refactor synchronized artifact identity handling, branch: refactor/artifact-dedup, author: sam-taylor): Deduplicates incoming sync manifests using deterministic SHA-256 content addressing.

## Important Findings
- [High · Deterministic] Unverified cryptographic boundary in CLI token issuance (packages/auth/src/index.ts:160): Token hashes compared with equality operator rather than constant-time crypto.timingSafeEqual.
- [Medium · Deterministic] GitHub sync webhook signature validation timeout (packages/sync/src/github.ts:92): Webhook handler lacks explicit replay timeout guard.
- [Medium · Deterministic] Artifact identity deduplication hash collision potential (packages/sync/src/manifest.ts:118): Manifest identity key lacks namespace prefix separator.

## Privacy-Preserving Evidence Summary
- File location: packages/auth/src/index.ts (lines 158-164) — Token hash comparison AST scan
- File location: packages/trace-cli/src/auth.ts (lines 42-48) — CLI auth verification callsite
- Configuration: packages/sync/src/github.ts (lines 88-104) — Sync cadence and timeout boundaries
- Schema: packages/sync/src/manifest.ts (lines 112-130) — Manifest artifact identity index
Source code and code snippets remain excluded.

## Operational & Architectural State
- Monorepo package isolation verified across @trace/core, @trace/cli, @trace/auth, @trace/db, and apps/web.
- Zero circular imports detected in build topology.

## What Changed Since Previous Report
- PR #101 added token hashing requirements to replace legacy plaintext device pairings.
- Freshness verification in PR #102 updated cache TTL from 60s to 300s.

## Recommended Next Actions
1. Update PR #101 to use crypto.timingSafeEqual before merging to main.
2. Run local TRACE analysis (\`trace analyze && trace sync\`) after pulling remote HEAD 8c74d21054a3 to refresh project intelligence.

## Provenance
- Local TRACE CLI version 0.1.0 run on 4953addc8992f882a1c983bad061fb8035213276.
- Synchronized record approved by human engineer; raw source code never transmitted.`,
  },
  {
    id: 'report-trace-002',
    artifactId: 'art-report-trace-002',
    artifactType: 'security_audit',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Authentication Boundary & Token Lifecycle Audit',
    summary:
      'Comprehensive security assessment of session signing, token exchange, and device pairing protocol. Verified zero hardcoded secrets and enforced single-use authorization codes.',
    status: 'approved',
    timeWindow: '2026-08-18',
    generatedAt: '2026-08-18T16:00:00.000Z',
    syncedAt: '2026-08-18T16:30:00.000Z',
    origin: 'local',
    analyzedCommit: '4953addc8992f882a1c983bad061fb8035213276',
    remoteHeadCommit: '8c74d21054a329e7104b689a7f3d5e219084c7aa',
    freshness: 'needs-refresh',
    relatedFindingIds: ['att-trace-001', 'att-trace-003'],
    relatedEvidenceIds: ['ev-trace-001', 'ev-trace-004'],
    items: [
      {
        id: 'item-report-trace-005',
        title: 'CLI pairing nonce entropy validated',
        detail:
          'Nonce generation uses cryptographically secure random bytes with 256-bit strength.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/auth/src/nonce.ts:24'],
        findingId: 'att-trace-001',
        evidenceId: 'ev-trace-001',
      },
      {
        id: 'item-report-trace-006',
        title: 'Session cookie SameSite policy audited',
        detail: 'OAuth callback cookies configured with SameSite=Lax and Secure flags in production.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/auth/src/session.ts:32'],
        findingId: 'att-trace-003',
        evidenceId: 'ev-trace-004',
      },
    ],
    content: `# Authentication Boundary & Token Lifecycle Audit

Repository: northstar-engineering/TRACE
Generated: 2026-08-18T16:00:00.000Z
Analyzed commit: 4953addc8992f882a1c983bad061fb8035213276
Freshness status: Needs refresh (analyzed @ 4953addc8992)

## Summary
Audit of CLI device authorization flow, session cookies, and bearer token verification. Confirmed single-use authorization code invalidation and 256-bit cryptographic entropy.

## Findings
- CLI pairing nonce generation uses CSPRNG crypto.randomBytes(32).
- Session revocation successfully purges active device access tokens from session store.

## Privacy-Preserving Evidence Summary
- File location: packages/auth/src/nonce.ts (lines 20-35) — Entropy generation check
- File location: packages/auth/src/session.ts (lines 28-44) — Cookie header flags
Source code excluded.

## Recommended Next Actions
- Enforce strict 15-minute expiration on pending CLI authorization codes.

## Provenance
- Local security audit run on commit 4953addc8992f882a1c983bad061fb8035213276.`,
  },
  {
    id: 'report-trace-003',
    artifactId: 'art-report-trace-003',
    artifactType: 'architecture_review',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Monorepo Boundary and Module Isolation Report',
    summary:
      'Verified strict unidirectional separation between web frontend, backend database schemas, and client-side CLI tooling with 0 circular imports.',
    status: 'approved',
    timeWindow: '2026-08-17',
    generatedAt: '2026-08-17T14:00:00.000Z',
    syncedAt: '2026-08-17T14:15:00.000Z',
    origin: 'local',
    analyzedCommit: '4953addc8992f882a1c983bad061fb8035213276',
    freshness: 'needs-refresh',
    relatedFindingIds: ['att-trace-006'],
    relatedEvidenceIds: ['ev-trace-006'],
    items: [
      {
        id: 'item-report-trace-007',
        title: 'Zero circular package dependencies',
        detail:
          'All internal package imports follow directional hierarchy graph (@trace/core -> @trace/auth -> @trace/cli -> apps/web).',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['turbo.json:1-32'],
        findingId: 'att-trace-006',
        evidenceId: 'ev-trace-006',
      },
    ],
    content: `# Monorepo Boundary and Module Isolation Report

Repository: northstar-engineering/TRACE
Generated: 2026-08-17T14:00:00.000Z
Analyzed commit: 4953addc8992f882a1c983bad061fb8035213276
Freshness status: Needs refresh

## Summary
Package graph audit across all 5 workspace modules. Confirmed strictly directional dependency hierarchy.

## Architecture Notes
- Core parser engine (@trace/core) maintains zero external runtime dependencies.
- Web application (apps/web) accesses database schemas strictly through @trace/db.

## Evidence Summary
- Configuration: turbo.json — Monorepo build pipeline topological sort verified.
Source code excluded.`,
  },
  {
    id: 'report-trace-004',
    artifactId: 'art-report-trace-004',
    artifactType: 'weekly_report',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Weekly Change Intelligence Brief — Week 33',
    summary:
      '14 local findings analyzed across 3 active PRs, 1 high-severity finding in auth boundary, AST parser throughput sustained at 18.4k lines/sec, and 0 breaking schema migrations.',
    status: 'approved',
    timeWindow: '2026-W33 (2026-08-11 – 2026-08-17)',
    generatedAt: '2026-08-15T17:00:00.000Z',
    syncedAt: '2026-08-15T17:30:00.000Z',
    origin: 'local',
    analyzedCommit: '4953addc8992f882a1c983bad061fb8035213276',
    remoteHeadCommit: '8c74d21054a329e7104b689a7f3d5e219084c7aa',
    freshness: 'needs-refresh',
    relatedChangeIds: ['change-trace-101', 'change-trace-102', 'change-trace-103'],
    relatedFindingIds: [
      'att-trace-001',
      'att-trace-002',
      'att-trace-003',
      'att-trace-004',
      'att-trace-007',
      'att-trace-008',
    ],
    items: [
      {
        id: 'item-report-trace-008',
        title: 'CLI daemon stabilization completed',
        detail: 'Deterministic process recovery verified on abrupt terminal disconnect.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/trace-cli/src/daemon.ts:50'],
        findingId: 'att-trace-009',
      },
      {
        id: 'item-report-trace-009',
        title: 'AST parser throughput verified',
        detail:
          'Core parser maintained 18,400 lines/second benchmark with sub-128MB heap footprint.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/core/benchmarks/parser.bench.ts:25'],
      },
    ],
    content: `# Weekly Change Intelligence Brief — Week 33

Repository: northstar-engineering/TRACE
Time Window: Week 33 (August 11 – August 17, 2026)
Generated: 2026-08-15T17:00:00.000Z
Analyzed commit: 4953addc8992f882a1c983bad061fb8035213276
GitHub remote head: 8c74d21054a329e7104b689a7f3d5e219084c7aa
Freshness status: Needs refresh

## Summary
Week 33 engineering rollup: 14 total findings cataloged (1 High, 5 Medium, 8 Low). High release velocity sustained with zero breaking database schema changes and 100% boundary isolation across monorepo packages.

## Major Changes
- PR #101: CLI device-token constant-time verification.
- PR #102: GitHub sync cadence and freshness cache tuning.
- PR #103: Artifact identity deduplication.

## Findings by Severity
- High (1): Constant-time digest check on CLI auth tokens (PR #101).
- Medium (5): Webhook signature timeouts, cache TTL mismatch, session debug logging, artifact identity hashing, database audit partition filtering.
- Low (8): Lockfile pinning, daemon disconnect recovery, AST identifier checks, parser benchmarks, type annotations.

## Recurring Engineering Themes
1. Cryptographic Boundary Hardening: Transitioning all CLI and daemon authentication to constant-time comparisons.
2. Ingestion Cadence Tuning: Balancing webhook throughput with freshness verification backoff.
3. Monorepo Isolation: Preserving zero cyclic dependencies in Turbo workspace.

## Evidence Summary
- 14 deterministic rule matches verified against local TypeScript ASTs.
- Zero source code or snippets transmitted to cloud dashboard.

## Provenance
- Aggregated from approved local TRACE runs on commit 4953addc8992f882a1c983bad061fb8035213276.`,
  },
  {
    id: 'report-trace-005',
    artifactId: 'art-report-trace-005',
    artifactType: 'performance_review',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'AST Parser Throughput and Memory Benchmark',
    summary:
      'Parser throughput sustained at 18,400 lines/second with flat heap allocation curve and sub-12ms GC pauses on 100k LOC benchmark.',
    status: 'approved',
    timeWindow: '2026-08-14',
    generatedAt: '2026-08-14T11:00:00.000Z',
    syncedAt: '2026-08-14T11:20:00.000Z',
    origin: 'local',
    analyzedCommit: '4953addc8992f882a1c983bad061fb8035213276',
    freshness: 'needs-refresh',
    items: [
      {
        id: 'item-report-trace-010',
        title: 'Heap memory usage capped under 128MB',
        detail:
          'Garbage collection pause times remained under 12ms during 100k LOC project benchmark.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/core/benchmarks/parser.bench.ts:15-45'],
      },
    ],
    content: `# AST Parser Benchmark Report

Repository: northstar-engineering/TRACE
Generated: 2026-08-14T11:00:00.000Z
Analyzed commit: 4953addc8992f882a1c983bad061fb8035213276
Freshness status: Needs refresh

## Summary
Benchmark results for @trace/core TypeScript AST visitor and rule evaluation engine.

## Performance Metrics
- Parsing throughput: 18,400 LOC/sec.
- Max heap residency: 114MB across 100k lines of TypeScript source.
- Average GC pause: 8.4ms.

## Evidence Summary
- Benchmark run: packages/core/benchmarks/parser.bench.ts (lines 15-45)
Source code excluded.`,
  },

  // =========================================================================
  // Radar (repo-radar-002) — 2 reports
  // Analyzed commit: 1e9b8a4746f328109dcb49281735ae89104fa281
  // Remote HEAD: 1e9b8a4746f328109dcb49281735ae89104fa281 (Current)
  // =========================================================================
  {
    id: 'report-radar-001',
    artifactId: 'art-report-radar-001',
    artifactType: 'weekly_report',
    repositoryId: 'repo-radar-002',
    repositoryName: 'northstar-engineering/Radar',
    title: 'Weekly Change Intelligence Brief — Week 33',
    summary:
      'High throughput telemetry stream stabilized with bounded ring-buffer backpressure control in PR #41; 3 deterministic findings logged with zero pipeline stalls.',
    status: 'approved',
    timeWindow: '2026-W33 (2026-08-11 – 2026-08-17)',
    generatedAt: '2026-08-19T10:15:00.000Z',
    syncedAt: '2026-08-19T10:15:00.000Z',
    origin: 'local',
    analyzedCommit: '1e9b8a4746f328109dcb49281735ae89104fa281',
    remoteHeadCommit: '1e9b8a4746f328109dcb49281735ae89104fa281',
    freshness: 'current',
    relatedChangeIds: ['change-radar-41'],
    relatedFindingIds: ['att-radar-001', 'att-radar-002', 'att-radar-003'],
    relatedEvidenceIds: ['ev-radar-001', 'ev-radar-002', 'ev-radar-003'],
    items: [
      {
        id: 'item-report-radar-001',
        title: 'Telemetry stream memory bounds checked',
        detail: 'Ring-buffer capacity constraints verified in PR #41.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['src/ingestion/stream.rs:52-78'],
        changeId: 'change-radar-41',
        changeNumber: 41,
        findingId: 'att-radar-001',
        evidenceId: 'ev-radar-001',
      },
      {
        id: 'item-report-radar-002',
        title: 'Socket keepalive timeout configuration',
        detail: 'TCP keepalive probed every 30s to prevent stale connection accumulation.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['src/transport/socket.rs:30-48'],
        findingId: 'att-radar-002',
        evidenceId: 'ev-radar-002',
      },
    ],
    content: `# Weekly Change Intelligence Brief — Week 33

Repository: northstar-engineering/Radar
Time Window: Week 33 (August 11 – August 17, 2026)
Generated: 2026-08-19T10:15:00.000Z
Analyzed commit: 1e9b8a4746f328109dcb49281735ae89104fa281
GitHub remote head: 1e9b8a4746f328109dcb49281735ae89104fa281
Freshness status: Current (analyzed commit matches GitHub HEAD)

## Summary
Telemetry ingestion pipeline remains calm and stable. Backpressure ring-buffer implementation in PR #41 passed deterministic memory threshold verification with zero dropped packets.

## Changes Reviewed
- PR #41 (Improve telemetry stream backpressure handling, branch: perf/backpressure-ring-buffer, author: marcus-vance): Implements bounded circular queue with drop-oldest overflow policy.

## Important Findings
- [Medium · Deterministic] Ring buffer drop-tail policy on telemetry queue saturation (src/ingestion/stream.rs:55): Verified queue bound of 100,000 telemetry messages before dropping metrics.
- [Low · Deterministic] Socket keepalive timeout configuration (src/transport/socket.rs:35): Idle timeout set to 60s.

## Privacy-Preserving Evidence Summary
- File location: src/ingestion/stream.rs (lines 52-78) — Bounded buffer capacity checks
- File location: src/transport/socket.rs (lines 30-48) — Connection pool lifecycle
Source code excluded.

## Operational State
- Zero pipeline stalls or backpressure thrashing detected over 7-day ingestion window.

## Recommended Next Actions
- Merge PR #41 into main following standard staging deployment.

## Provenance
- Local TRACE analysis run on commit 1e9b8a4746f328109dcb49281735ae89104fa281.`,
  },
  {
    id: 'report-radar-002',
    artifactId: 'art-report-radar-002',
    artifactType: 'daily_report',
    repositoryId: 'repo-radar-002',
    repositoryName: 'northstar-engineering/Radar',
    title: 'Daily Telemetry Ingestion Verification — August 18, 2026',
    summary:
      'Zero dropped events over 24-hour ingestion cycle across distributed agent fleet; socket connection pool gracefully recycled.',
    status: 'approved',
    timeWindow: '2026-08-18',
    generatedAt: '2026-08-18T18:00:00.000Z',
    syncedAt: '2026-08-18T18:15:00.000Z',
    origin: 'local',
    analyzedCommit: '1e9b8a4746f328109dcb49281735ae89104fa281',
    remoteHeadCommit: '1e9b8a4746f328109dcb49281735ae89104fa281',
    freshness: 'current',
    relatedFindingIds: ['att-radar-002'],
    relatedEvidenceIds: ['ev-radar-002'],
    items: [
      {
        id: 'item-report-radar-003',
        title: 'Socket connection pool health checked',
        detail: 'All worker connections gracefully recycled after max lifetime threshold.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['src/transport/socket.rs:30-48'],
        findingId: 'att-radar-002',
        evidenceId: 'ev-radar-002',
      },
    ],
    content: `# Daily Telemetry Ingestion Verification — August 18, 2026

Repository: northstar-engineering/Radar
Generated: 2026-08-18T18:00:00.000Z
Analyzed commit: 1e9b8a4746f328109dcb49281735ae89104fa281
Freshness status: Current

## Summary
Ingestion fleet operational verification: 99.999% message delivery reliability across distributed agent telemetry endpoints.

## Evidence Summary
- File location: src/transport/socket.rs (lines 30-48) — Connection recycling loop verified.
Source code excluded.`,
  },

  // =========================================================================
  // Atlas (repo-atlas-003) — 3 reports
  // Analyzed commit: 5b2e917409218201a4e129304194019283401294
  // Remote HEAD: 5b2e917409218201a4e129304194019283401294 (Current)
  // =========================================================================
  {
    id: 'report-atlas-001',
    artifactId: 'art-report-atlas-001',
    artifactType: 'architecture_review',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Schema Migration & Concurrent Branch Collision Report',
    summary:
      'Critical schema conflict flagged between PR #88 and PR #89 on user_workspaces constraint defaults. Merging either independently will break the migration sequence.',
    status: 'approved',
    timeWindow: '2026-08-19',
    generatedAt: '2026-08-19T08:45:00.000Z',
    syncedAt: '2026-08-19T08:45:00.000Z',
    origin: 'local',
    analyzedCommit: '5b2e917409218201a4e129304194019283401294',
    remoteHeadCommit: '5b2e917409218201a4e129304194019283401294',
    freshness: 'current',
    relatedChangeIds: ['change-atlas-88', 'change-atlas-89', 'change-atlas-87'],
    relatedFindingIds: ['att-atlas-001', 'att-atlas-002', 'att-atlas-003'],
    relatedEvidenceIds: ['ev-atlas-001', 'ev-atlas-002', 'ev-atlas-003'],
    items: [
      {
        id: 'item-report-atlas-001',
        title: 'user_workspaces migration collision',
        detail:
          'PR #88 sets default role bitmask to 0 while PR #89 introduces non-nullable assumptions without default fallback on migrations/0014_user_workspaces.sql.',
        severity: 'high',
        classification: 'deterministic',
        evidence: [
          'migrations/0014_user_workspaces.sql:15',
          'packages/db/src/schema.ts:90',
        ],
        changeId: 'change-atlas-88',
        changeNumber: 88,
        findingId: 'att-atlas-001',
        evidenceId: 'ev-atlas-001',
      },
      {
        id: 'item-report-atlas-002',
        title: 'Unindexed foreign key on workspace membership',
        detail:
          'Query plan analysis shows full table scan on organization member lookup.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['packages/db/src/schema.ts:102'],
        findingId: 'att-atlas-002',
        evidenceId: 'ev-atlas-002',
      },
    ],
    content: `# Schema Migration & Concurrent Branch Collision Report

Repository: northstar-engineering/Atlas
Generated: 2026-08-19T08:45:00.000Z
Analyzed commit: 5b2e917409218201a4e129304194019283401294
Freshness status: Current

## Summary
Emerging coordination risk detected across active branches. PR #88 and PR #89 alter overlapping database migration scripts targeting table user_workspaces with conflicting column constraint assumptions.

## Affected Changes
- PR #88 (Introduce staged database migration pipeline, branch: feature/staged-migrations, author: elena-rostova): Adds staged migration pipeline and sets default role bitmask to 0.
- PR #89 (Update worker schema assumptions, branch: fix/worker-schema-alignment, author: marcus-vance): Alters worker query expectations assuming non-null workspace role without default fallback.

## Important Findings
- [High · Deterministic] Schema mutation collision on user_workspaces table: Merging either branch independently will cause SQL migration execution failures in deployment pipeline.

## Coordination & Architecture Notes
- Elena Rostova (PR #88 author) and Marcus Vance (PR #89 author) need to align on migration sequencing and default role bitmask column definitions before merging either branch.

## Evidence Summary
- Migration script: migrations/0014_user_workspaces.sql (lines 12-28)
- Schema definition: packages/db/src/schema.ts (lines 85-110)
Source code excluded.

## Recommended Next Actions
1. Coordinate PR #88 and PR #89 merge sequence.
2. Rebase PR #89 onto feature/staged-migrations branch to resolve conflicting DDL statements.

## Provenance
- Local TRACE conflict analysis on commit 5b2e917409218201a4e129304194019283401294.`,
  },
  {
    id: 'report-atlas-002',
    artifactId: 'art-report-atlas-002',
    artifactType: 'security_audit',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Enterprise SSO & Multi-Tenant Isolation Audit',
    summary:
      'Evaluated SAML 2.0 and OIDC callback validation logic against tenant impersonation vectors; verified parameterized tenant scoping.',
    status: 'approved',
    timeWindow: '2026-08-17',
    generatedAt: '2026-08-17T15:00:00.000Z',
    syncedAt: '2026-08-17T15:30:00.000Z',
    origin: 'local',
    analyzedCommit: '5b2e917409218201a4e129304194019283401294',
    freshness: 'current',
    relatedFindingIds: ['att-atlas-004', 'att-atlas-005'],
    items: [
      {
        id: 'item-report-atlas-003',
        title: 'Tenant isolation verified on core queries',
        detail: 'All customer queries parameterized with verified organization context.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/auth/src/sso.ts:60'],
        findingId: 'att-atlas-005',
      },
    ],
    content: `# Enterprise SSO & Multi-Tenant Isolation Audit

Repository: northstar-engineering/Atlas
Generated: 2026-08-17T15:00:00.000Z
Analyzed commit: 5b2e917409218201a4e129304194019283401294
Freshness status: Current

## Summary
Comprehensive verification of SAML 2.0 assertion signature validation and organization tenant parameterization.

## Findings
- All database queries enforce organizationId filter at repository data access layer.
- Zero tenant impersonation vectors found in assertion consumer service endpoint.

## Evidence Summary
- File location: packages/auth/src/sso.ts (lines 50-82)
- Schema location: packages/db/src/queries/tenant.ts (lines 15-38)
Source code excluded.`,
  },
  {
    id: 'report-atlas-003',
    artifactId: 'art-report-atlas-003',
    artifactType: 'daily_report',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Daily Change Brief — August 18, 2026',
    summary:
      '2 PRs merged, database connection pool resized for peak loads, zero production alerts.',
    status: 'approved',
    timeWindow: '2026-08-18',
    generatedAt: '2026-08-18T19:00:00.000Z',
    syncedAt: '2026-08-18T19:20:00.000Z',
    origin: 'local',
    analyzedCommit: '5b2e917409218201a4e129304194019283401294',
    freshness: 'current',
    relatedChangeIds: ['change-atlas-87'],
    relatedFindingIds: ['att-atlas-006'],
    items: [
      {
        id: 'item-report-atlas-004',
        title: 'Database connection pool resized',
        detail: 'Max connections adjusted to 50 per replica with 5s idle timeout.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/db/src/pool.ts:25'],
        changeId: 'change-atlas-87',
        changeNumber: 87,
        findingId: 'att-atlas-006',
      },
    ],
    content: `# Daily Change Brief — August 18, 2026

Repository: northstar-engineering/Atlas
Generated: 2026-08-18T19:00:00.000Z
Analyzed commit: 5b2e917409218201a4e129304194019283401294
Freshness status: Current

## Summary
Database resilience updates deployed: connection pool tuned for peak workloads with idle connection recycling.

## Evidence Summary
- File location: packages/db/src/pool.ts (lines 20-45)
Source code excluded.`,
  },

  // =========================================================================
  // Orbit (repo-orbit-004) — 2 reports
  // Analyzed commit: 3f4a9b2019485720193857102948571029384756
  // Remote HEAD: 3f4a9b2019485720193857102948571029384756 (Sync Attention)
  // =========================================================================
  {
    id: 'report-orbit-001',
    artifactId: 'art-report-orbit-001',
    artifactType: 'daily_report',
    repositoryId: 'repo-orbit-004',
    repositoryName: 'northstar-engineering/Orbit',
    title: 'Daily Change Brief — August 18, 2026',
    summary:
      'Synchronized local intelligence snapshot prior to manifest v1.1.0 bridge upgrade. Synchronization bridge attention flagged due to CLI schema version mismatch.',
    status: 'approved',
    timeWindow: '2026-08-18',
    generatedAt: '2026-08-18T18:00:00.000Z',
    syncedAt: '2026-08-18T18:00:00.000Z',
    origin: 'local',
    analyzedCommit: '3f4a9b2019485720193857102948571029384756',
    remoteHeadCommit: '3f4a9b2019485720193857102948571029384756',
    freshness: 'attention',
    relatedChangeIds: ['change-orbit-54', 'change-orbit-55'],
    relatedFindingIds: ['att-orbit-001', 'att-orbit-002'],
    relatedEvidenceIds: ['ev-orbit-001', 'ev-orbit-002'],
    items: [
      {
        id: 'item-report-orbit-001',
        title: 'Local intelligence baseline captured',
        detail: '6 local findings registered before ingestion bridge sync error.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['.trace/manifest.json:1-25'],
        changeId: 'change-orbit-55',
        changeNumber: 55,
        findingId: 'att-orbit-001',
        evidenceId: 'ev-orbit-001',
      },
      {
        id: 'item-report-orbit-002',
        title: 'Artifact retry exponential backoff',
        detail: 'Sync retry loop incorporates jittered exponential backoff in PR #54.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['src/bridge/sync.ts:44-70'],
        changeId: 'change-orbit-54',
        changeNumber: 54,
        findingId: 'att-orbit-002',
        evidenceId: 'ev-orbit-002',
      },
    ],
    content: `# Daily Change Brief — August 18, 2026

Repository: northstar-engineering/Orbit
Generated: 2026-08-18T18:00:00.000Z
Analyzed commit: 3f4a9b2019485720193857102948571029384756
Freshness status: Sync attention (local analysis valid; sync bridge requires CLI version alignment)

## Summary
Local analysis snapshot generated on Orbit repo. Dashboard sync bridge flagged schema version discrepancy (CLI 0.0.9 vs Dashboard 1.0.0).

## Changes Reviewed
- PR #54 (Improve artifact synchronization recovery, branch: fix/sync-exponential-backoff, author: kai-nakamura): Adds exponential backoff to transient network failures during sync.
- PR #55 (Validate manifest compatibility before ingest, branch: feat/manifest-v1-schema-validator, author: alex-chen): Adds JSON schema validation to incoming sync manifests.

## Important Findings
- [Medium · Deterministic] Ingestion bridge manifest version discrepancy (.trace/manifest.json:10): Local CLI emits manifest schema v0.9; dashboard server expects v1.0.

## Evidence Summary
- File location: .trace/manifest.json (lines 1-25) — Manifest schema version header
- File location: src/bridge/sync.ts (lines 44-70) — Exponential retry backoff loop
Source code excluded.

## Recommended Next Actions
- Upgrade local TRACE CLI (\`npm i -g @trace/cli@latest\`) and execute \`trace sync\` to restore automated sync bridge.

## Provenance
- Local TRACE run on commit 3f4a9b2019485720193857102948571029384756.`,
  },
  {
    id: 'report-orbit-002',
    artifactId: 'art-report-orbit-002',
    artifactType: 'architecture_review',
    repositoryId: 'repo-orbit-004',
    repositoryName: 'northstar-engineering/Orbit',
    title: 'CLI Compatibility & Ingestion Protocol Evaluation',
    summary:
      'Identified manifest version discrepancy between local CLI 0.0.9 and dashboard schema 1.0.0. Upgrade required for automated sync.',
    status: 'approved',
    timeWindow: '2026-08-18',
    generatedAt: '2026-08-18T12:00:00.000Z',
    syncedAt: '2026-08-18T12:30:00.000Z',
    origin: 'local',
    analyzedCommit: '3f4a9b2019485720193857102948571029384756',
    freshness: 'attention',
    relatedFindingIds: ['att-orbit-001', 'att-orbit-003'],
    items: [
      {
        id: 'item-report-orbit-003',
        title: 'Manifest version alignment required',
        detail:
          'Upgrade local TRACE CLI to version 0.1.0 to resolve sync verification error.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['.trace/run-metadata.json:15'],
        findingId: 'att-orbit-001',
      },
    ],
    content: `# CLI Compatibility & Ingestion Protocol Evaluation

Repository: northstar-engineering/Orbit
Generated: 2026-08-18T12:00:00.000Z
Analyzed commit: 3f4a9b2019485720193857102948571029384756
Freshness status: Sync attention

## Summary
Audit of artifact ingestion contract between CLI daemon and remote synchronization endpoint.

## Architecture Notes
- Protocol migration path supports backwards compatibility with schema adapters.

## Evidence Summary
- Configuration: .trace/run-metadata.json — CLI daemon build info.
Source code excluded.`,
  },

  // =========================================================================
  // Nova (repo-nova-005) — 0 reports (Truthful empty state)
  // =========================================================================
];

export function getReportById(id: string): DashboardSyncedRecord | undefined {
  return MOCK_REPORTS.find((r) => r.id === id);
}

export function getReportsForRepository(repositoryId: string): DashboardSyncedRecord[] {
  return MOCK_REPORTS.filter((r) => r.repositoryId === repositoryId);
}

export function getRelatedEntitiesForReport(reportId: string) {
  const report = getReportById(reportId);
  if (!report) {
    return { changes: [], findings: [], evidence: [] };
  }

  const changes = MOCK_CHANGES.filter(
    (c) =>
      c.repositoryId === report.repositoryId &&
      (report.relatedChangeIds?.includes(c.id) ||
        report.items.some((i) => i.changeId === c.id || i.changeNumber === c.number)),
  );

  const findings = MOCK_ATTENTION.filter(
    (a) =>
      a.repositoryId === report.repositoryId &&
      (report.relatedFindingIds?.includes(a.id) ||
        report.items.some((i) => i.findingId === a.id)),
  );

  const evidence = MOCK_EVIDENCE.filter(
    (e) =>
      e.repositoryId === report.repositoryId &&
      (report.relatedEvidenceIds?.includes(e.id) ||
        report.items.some((i) => i.evidenceId === e.id) ||
        findings.some((f) => f.id === e.findingId)),
  );

  return { changes, findings, evidence };
}
