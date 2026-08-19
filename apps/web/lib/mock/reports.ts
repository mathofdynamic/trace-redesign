import type { DashboardSyncedRecord } from '../dashboard';

export const MOCK_REPORTS: DashboardSyncedRecord[] = [
  // --- TRACE (5 reports) ---
  {
    id: 'report-trace-001',
    artifactId: 'art-report-trace-001',
    artifactType: 'daily_report',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Daily Change Brief — August 19, 2026',
    summary:
      '3 active PRs reviewed, 1 high-severity security finding flagged in auth package, zero architectural regressions detected.',
    status: 'approved',
    items: [
      {
        id: 'item-report-trace-001',
        title: 'Auth cryptographic review completed',
        detail: 'Constant-time digest requirement flagged on PR #101.',
        severity: 'high',
        classification: 'deterministic',
        evidence: ['packages/auth/src/index.ts'],
      },
      {
        id: 'item-report-trace-002',
        title: 'Monorepo workspace dependencies audited',
        detail: 'All internal packages verified against lockfile consistency.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['package.json', 'pnpm-lock.yaml'],
      },
    ],
    generatedAt: '2026-08-19T09:30:00.000Z',
    syncedAt: '2026-08-19T09:30:00.000Z',
    origin: 'local',
    content: `# Daily Change Brief — August 19, 2026

## Overview
Active engineering across Northstar repositories remained focused on cryptographic hardening and telemetry reliability.

## Summary of Changes
- PR #101 introduces constant-time verification for CLI device tokens.
- Lockfile consistency verified across all internal workspace packages.

## Evidence & Verification
- Auth verification test suite passed with 100% boundary coverage.
- No source code uploaded to remote cloud infrastructure.`,
  },
  {
    id: 'report-trace-002',
    artifactId: 'art-report-trace-002',
    artifactType: 'security_audit',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Authentication Boundary & Token Lifecycle Audit',
    summary:
      'Comprehensive security assessment of session signing, token exchange, and device pairing protocol.',
    status: 'approved',
    items: [
      {
        id: 'item-report-trace-003',
        title: 'CLI pairing nonce entropy validated',
        detail: 'Nonce generation uses cryptographically secure random bytes with 256-bit strength.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/auth/src/nonce.ts:24'],
      },
    ],
    generatedAt: '2026-08-18T16:00:00.000Z',
    syncedAt: '2026-08-18T16:30:00.000Z',
    origin: 'local',
    content: `# Authentication Boundary & Token Lifecycle Audit\n\nVerified zero hardcoded secrets and enforced single-use authorization codes.`,
  },
  {
    id: 'report-trace-003',
    artifactId: 'art-report-trace-003',
    artifactType: 'architecture_review',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Monorepo Boundary and Module Isolation Report',
    summary:
      'Verified strict separation between web frontend, backend database schemas, and client-side CLI tooling.',
    status: 'approved',
    items: [
      {
        id: 'item-report-trace-004',
        title: 'Zero circular package dependencies',
        detail: 'All internal package imports follow directional hierarchy graph.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['turbo.json'],
      },
    ],
    generatedAt: '2026-08-17T14:00:00.000Z',
    syncedAt: '2026-08-17T14:15:00.000Z',
    origin: 'local',
    content: `# Architecture Review\n\nPackage dependencies remain isolated without circular references.`,
  },
  {
    id: 'report-trace-004',
    artifactId: 'art-report-trace-004',
    artifactType: 'weekly_report',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Weekly Change Intelligence Brief — Week 33',
    summary:
      '14 local findings identified, 3 decisions logged, and all CI pipelines passing deterministically.',
    status: 'approved',
    items: [
      {
        id: 'item-report-trace-005',
        title: 'CLI daemon stabilization completed',
        detail: 'Deterministic process recovery verified on abrupt terminal disconnect.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/trace-cli/src/daemon.ts'],
      },
    ],
    generatedAt: '2026-08-15T17:00:00.000Z',
    syncedAt: '2026-08-15T17:30:00.000Z',
    origin: 'local',
    content: `# Weekly Change Intelligence Brief — Week 33\n\nHigh release velocity maintained with zero breaking schema migrations.`,
  },
  {
    id: 'report-trace-005',
    artifactId: 'art-report-trace-005',
    artifactType: 'performance_review',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'AST Parser Throughput and Memory Benchmark',
    summary:
      'Parser throughput sustained at 18,400 lines/second with flat heap allocation curve.',
    status: 'approved',
    items: [
      {
        id: 'item-report-trace-006',
        title: 'Heap memory usage capped under 128MB',
        detail: 'Garbage collection pause times remained under 12ms during 100k LOC project benchmark.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/core/benchmarks/parser.bench.ts'],
      },
    ],
    generatedAt: '2026-08-14T11:00:00.000Z',
    syncedAt: '2026-08-14T11:20:00.000Z',
    origin: 'local',
    content: `# AST Parser Benchmark\n\nSub-second analysis achieved across all core TypeScript packages.`,
  },

  // --- Radar (2 reports) ---
  {
    id: 'report-radar-001',
    artifactId: 'art-report-radar-001',
    artifactType: 'weekly_report',
    repositoryId: 'repo-radar-002',
    repositoryName: 'northstar-engineering/Radar',
    title: 'Weekly Change Intelligence Brief — Week 33',
    summary:
      'High throughput telemetry stream stabilized with backpressure control and zero pipeline stalls.',
    status: 'approved',
    items: [
      {
        id: 'item-report-radar-001',
        title: 'Telemetry stream memory bounds checked',
        detail: 'Buffer capacity constraints verified in PR #88.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['src/ingestion/stream.rs'],
      },
    ],
    generatedAt: '2026-08-19T10:15:00.000Z',
    syncedAt: '2026-08-19T10:15:00.000Z',
    origin: 'local',
    content: `# Weekly Change Intelligence Brief — Week 33\n\nRadar ingestion pipeline refactoring concluded with deterministic verification of queue thresholds.`,
  },
  {
    id: 'report-radar-002',
    artifactId: 'art-report-radar-002',
    artifactType: 'daily_report',
    repositoryId: 'repo-radar-002',
    repositoryName: 'northstar-engineering/Radar',
    title: 'Daily Telemetry Ingestion Verification — August 18, 2026',
    summary:
      'Zero dropped events over 24-hour ingestion cycle across distributed agent fleet.',
    status: 'approved',
    items: [
      {
        id: 'item-report-radar-002',
        title: 'Socket connection pool health checked',
        detail: 'All worker connections gracefully recycled after max lifetime threshold.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['src/transport/socket.rs'],
      },
    ],
    generatedAt: '2026-08-18T18:00:00.000Z',
    syncedAt: '2026-08-18T18:15:00.000Z',
    origin: 'local',
    content: `# Daily Telemetry Verification\n\nIngestion fleet maintained 99.999% message delivery reliability.`,
  },

  // --- Atlas (3 reports) ---
  {
    id: 'report-atlas-001',
    artifactId: 'art-report-atlas-001',
    artifactType: 'architecture_review',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Schema Migration & Concurrent Branch Collision Report',
    summary:
      'Critical conflict flagged between PR #142 and PR #145 on user_workspaces constraint defaults.',
    status: 'approved',
    items: [
      {
        id: 'item-report-atlas-001',
        title: 'user_workspaces migration collision',
        detail: 'Contradictory NOT NULL defaults on workspace_role column across concurrent PRs.',
        severity: 'high',
        classification: 'deterministic',
        evidence: ['packages/db/src/schema.ts', 'migrations/0014_user_workspaces.sql'],
      },
    ],
    generatedAt: '2026-08-19T08:45:00.000Z',
    syncedAt: '2026-08-19T08:45:00.000Z',
    origin: 'local',
    content: `# Schema Migration Report\n\nIdentified overlapping schema modifications requiring engineering coordination.`,
  },
  {
    id: 'report-atlas-002',
    artifactId: 'art-report-atlas-002',
    artifactType: 'security_audit',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Enterprise SSO & Multi-Tenant Isolation Audit',
    summary:
      'Evaluated SAML 2.0 and OIDC callback validation logic against tenant impersonation vectors.',
    status: 'approved',
    items: [
      {
        id: 'item-report-atlas-002',
        title: 'Tenant isolation verified on core queries',
        detail: 'All customer queries parameterized with verified organization context.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/auth/src/sso.ts'],
      },
    ],
    generatedAt: '2026-08-17T15:00:00.000Z',
    syncedAt: '2026-08-17T15:30:00.000Z',
    origin: 'local',
    content: `# SSO & Multi-Tenant Audit\n\nConfirmed strict cryptographic tenant verification during assertion consumer service flows.`,
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
    items: [
      {
        id: 'item-report-atlas-003',
        title: 'Database connection pool resized',
        detail: 'Max connections adjusted to 50 per replica with 5s idle timeout.',
        severity: 'low',
        classification: 'deterministic',
        evidence: ['packages/db/src/pool.ts'],
      },
    ],
    generatedAt: '2026-08-18T19:00:00.000Z',
    syncedAt: '2026-08-18T19:20:00.000Z',
    origin: 'local',
    content: `# Daily Change Brief\n\nDatabase resilience improvements deployed successfully.`,
  },

  // --- Orbit (2 reports) ---
  {
    id: 'report-orbit-001',
    artifactId: 'art-report-orbit-001',
    artifactType: 'daily_report',
    repositoryId: 'repo-orbit-004',
    repositoryName: 'northstar-engineering/Orbit',
    title: 'Daily Change Brief — August 18, 2026',
    summary:
      'Synchronized local intelligence snapshot prior to manifest v1.1.0 bridge upgrade.',
    status: 'approved',
    items: [
      {
        id: 'item-report-orbit-001',
        title: 'Local intelligence baseline captured',
        detail: '6 local findings registered before ingestion bridge sync error.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['.trace/manifest.json'],
      },
    ],
    generatedAt: '2026-08-18T18:00:00.000Z',
    syncedAt: '2026-08-18T18:00:00.000Z',
    origin: 'local',
    content: `# Daily Change Brief\n\nLocal intelligence snapshot captured prior to protocol upgrade.`,
  },
  {
    id: 'report-orbit-002',
    artifactId: 'art-report-orbit-002',
    artifactType: 'architecture_review',
    repositoryId: 'repo-orbit-004',
    repositoryName: 'northstar-engineering/Orbit',
    title: 'CLI Compatibility & Ingestion Protocol Evaluation',
    summary:
      'Identified manifest version discrepancy between local CLI 0.0.9 and dashboard schema 1.0.0.',
    status: 'approved',
    items: [
      {
        id: 'item-report-orbit-002',
        title: 'Manifest version alignment required',
        detail: 'Upgrade local TRACE CLI to version 0.1.0 to resolve sync verification error.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: ['.trace/run-metadata.json'],
      },
    ],
    generatedAt: '2026-08-18T12:00:00.000Z',
    syncedAt: '2026-08-18T12:30:00.000Z',
    origin: 'local',
    content: `# CLI Compatibility Evaluation\n\nLocal CLI upgrade required to resume automated dashboard synchronization.`,
  },
];
