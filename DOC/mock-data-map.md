# TRACE Route & Mock Data Map

## Document Purpose

This document maps all application surfaces, routes, data dependencies, and domain entity relationships in TRACE. It serves as the single source of truth for the mock-data foundation introduced in Phase 1 and ensures data coherence across future implementation phases.

---

## 1. Domain Entity Relationships

All TRACE intelligence flows through a strict entity hierarchy. No mock or runtime data should exist in isolation without tracing back to this graph.

```text
Workspace ("Northstar Engineering")
├── Users & Team Members (Lead, Engineers, Architects)
├── Authorized Computers / Devices (CLI connections)
└── Repositories
    ├── TRACE (mature, analyzed, needs-refresh)
    ├── Radar (analyzed, synchronized, current)
    ├── Atlas (analyzed, active conflicts)
    ├── Orbit (analyzed locally, sync attention)
    └── Nova (connected, not analyzed)
        │
        ├── Changes (PR snapshots & metadata)
        ├── Analysis Runs (Deterministic evidence + inference)
        │   └── Findings (Verified deterministic evidence & interpretations)
        │       └── Evidence References (File paths, symbol references)
        ├── Sync Operations (Local .trace artifacts promoted to dashboard)
        │   ├── Reports (Daily, weekly Markdown briefs)
        │   ├── Decisions (Architectural records with rationale)
        │   ├── Conflicts (Incompatible concurrent changes)
        │   └── Rules (Repository governance & review policies)
        └── Activity Events (Workspace & repository lifecycle timeline)
```

---

## 2. Route & Data Dependency Map

| Route | Purpose | Current Data Dependency | Important Data Types | Mock-Ready? | Notes |
|---|---|---|---|---|---|
| `/` | Public marketing home | Static content | None | Yes | Unauthenticated landing page |
| `/product` | Product overview | Static content | None | Yes | Core capabilities and execution models |
| `/pricing` | Pricing & tiers | Static content | None | Yes | Team, Enterprise, Local-first tiers |
| `/security` | Security & trust boundaries | Static content | None | Yes | Privacy, source-code boundary explanations |
| `/docs` | Documentation & CLI guide | Static content | None | Yes | Local execution, commands, sync guide |
| `/specification` | Artifact spec & schemas | Static content | None | Yes | `.trace` artifact directory schemas |
| `/sign-in` | GitHub auth entry & demo preview | `@trace/auth` / Session cookie | `TraceUser`, `TraceSession` | Yes | Includes demo preview login button |
| `/sign-up` | Registration redirect | Redirects to `/sign-in` | None | Yes | Preserves single sign-in flow |
| `/auth/error` | OAuth error display | Query params | Error string | Yes | Shows safe authentication errors |
| `/onboarding` | Workspace setup step 1 | `onboardingProfiles` table | `OnboardingProfile` | Yes | Bypassed when profile is marked complete |
| `/cli/authorize` | CLI device code confirmation | `cliDeviceAuthorizations`, `memberships`, `organizations` | `CliDeviceAuthorization`, `Organization` | Yes | Approves terminal CLI connection |
| `/app` | Dashboard overview / command center | `getAuthenticatedDashboardSummary()` | `DashboardSummary`, `DashboardRepository`, `DashboardAttention` | Yes | Primary entry point for logged-in user |
| `/app/repositories` | Repository management & selector | `githubRepositories`, `githubInstallations`, `organizations` | `GithubRepository`, `GithubInstallation` | Yes | Lists connected repos, enables switching |
| `/app/repositories/[id]` | Repository command & intelligence | `getAuthenticatedDashboardSummary()` | `DashboardRepository`, `TraceProjectState`, `DashboardAttention` | Yes | Displays repository lifecycle rail & metrics |
| `/app/repositories/[id]/pull-requests` | Repository changes / PR view | `getAuthenticatedDashboardSummary()` | `DashboardChange`, `DashboardRepository` | Yes | Filtered by `repositoryId` |
| `/app/repositories/[id]/findings` | Repository findings & evidence view | `getAuthenticatedDashboardSummary()` | `DashboardAttention` (kind: finding/risk) | Yes | Standalone findings with evidence disclosures |
| `/app/changes` | Workspace-wide active changes | `getAuthenticatedDashboardSummary()` | `DashboardChange` | Yes | Pull request snapshots from connected repos |
| `/app/conflicts` | Concurrent-change conflict intelligence | `getAuthenticatedDashboardSummary()` | `DashboardSyncedRecord` (type: conflict) | Yes | Cross-change incompatibility records |
| `/app/decisions` | Architectural decision records | `getAuthenticatedDashboardSummary()` | `DashboardSyncedRecord` (type: decision) | Yes | Durable rationale surviving beyond PRs |
| `/app/reports` | Daily & weekly change briefs | `getAuthenticatedDashboardSummary()` | `DashboardSyncedRecord` (type: report) | Yes | Includes parsed native Markdown renderer |
| `/app/rules` | Team governance & review rules | `getAuthenticatedDashboardSummary()` | `DashboardSyncedRecord` (type: rule) | Yes | Active review policies and boundaries |
| `/app/settings` | Workspace settings & authorized CLI devices | `getAuthenticatedDashboardSummary()`, `cliConnections` | `DashboardSummary`, `CliConnection` | Yes | Trust boundaries, active CLI machines |
| `/app/activity` | Workspace activity feed | `getAuthenticatedDashboardSummary()` | `DashboardActivity` | Yes | Chronological event stream across repos |
| `/api/dashboard/summary` | Dashboard data JSON endpoint | `getDashboardSummary()` | `DashboardSummary` JSON | Yes | Consumed by client-side polling/loaders |
| `/api/auth/demo` | Development demo session handler | `@trace/auth` cookie generation | `TraceUser` | Yes | Issues signed session cookie for mock user |

---

## 3. Data Flow & Interception Points

1. **Server-Side Summary Loading (`dashboard-server.ts`)**:
   - Primary loader `getAuthenticatedDashboardSummary()` checks `isMockModeEnabled()`.
   - If mock mode is active, it immediately returns the deterministic mock `TraceSession` and `DashboardSummary` without initializing any database connection.
   - If mock mode is disabled, it executes the standard PostgreSQL query path via `getDashboardSummary(db, userId)`.

2. **Client-Side Navigation & State Derivation (`dashboard-state.ts`)**:
   - `deriveTraceProjectState()` derives project lifecycle keys (`needs-refresh`, `current`, `sync-attention`, `connected-not-analyzed`) purely from `DashboardRepository` and `DashboardAttention` items.
   - `localTraceCommandsForState()` outputs exact CLI commands (`trace analyze`, `trace sync`) based on derived lifecycle key.

3. **Repository Detail Subviews (`[repositoryId]/page.tsx`, `[view]/page.tsx`)**:
   - Reads `summary.repositories.find(r => r.id === repositoryId)`.
   - Filters `summary.attention`, `summary.latestChanges`, and `summary.latestReports` by `repositoryId`.

---

## 4. Entity Shared Identifiers (Phase 1 Baseline)

- **Workspace ID**: `ws-northstar-001` (`Northstar Engineering`)
- **Primary User ID**: `00000000-0000-0000-0000-000000000001` (`Mohammad Mohammadi`)
- **Repository IDs**:
  - TRACE: `repo-trace-001`
  - Radar: `repo-radar-002`
  - Atlas: `repo-atlas-003`
  - Orbit: `repo-orbit-004`
  - Nova: `repo-nova-005`
