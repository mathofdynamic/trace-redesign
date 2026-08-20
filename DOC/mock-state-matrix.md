# TRACE Mock State Matrix & Truth Table

This document defines the deterministic mock universe, operational edge states, repository status mappings, and trust boundaries implemented in Phase 4B.

---

## 1. Primary Mock Universe Overview

The base TRACE mock universe represents **Northstar Engineering** (`ws-northstar-001`), an engineering team led by **Mohammad Mohammadi** (`mohammad@northstar.engineering`, `@mohammadm`) operating in **Local TRACE** execution mode.

### Entity Inventory (Default State)

| Entity Type | Count | Key Identifiers / Details |
| :--- | :---: | :--- |
| **Repositories** | 5 | `TRACE`, `Radar`, `Atlas`, `Orbit`, `Nova` |
| **Changes** | 9 | `PR-104`, `PR-102`, `PR-98`, `PR-45`, `PR-88`, `PR-82`, `PR-79`, `PR-31`, `PR-27` |
| **Findings (Attention)** | 31 | TRACE (14), Radar (3), Atlas (8), Orbit (6), Nova (0) |
| **Reports** | 12 | TRACE (5), Radar (2), Atlas (3), Orbit (2), Nova (0) |
| **Conflicts** | 4 | `conf-001`, `conf-002`, `conf-003`, `conf-004` |
| **Decisions** | 9 | `dec-001` through `dec-009` |
| **Rules** | 8 | `rule-001` through `rule-008` (3 workspace-wide, 5 repo-scoped) |
| **Activity Events** | 35 | Comprehensive audit trail across commits, syncs, rules, decisions |
| **Authorized Devices** | 4 | 3 Active, 1 Revoked |

---

## 2. Default Repository State Matrix

| Repository | Remote HEAD SHA | Analyzed Commit SHA | Freshness | Conflict Count | Report Count | Finding Count | Derived State |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **TRACE** | `8c74d21054a...` | `4953addc899...` | Stale (`stale: true`) | 0 | 5 | 14 | **Needs refresh** (`needs-refresh`) |
| **Radar** | `1e9b8a4c21f...` | `1e9b8a4c21f...` | Current (`stale: false`) | 0 | 2 | 3 | **Current with GitHub** (`current`) |
| **Atlas** | `f2c9a18d45e...` | `f2c9a18d45e...` | Current (`stale: false`) | 2 | 3 | 8 | **Current with engineering conflicts** (`current`) |
| **Orbit** | `3d4e5f6a7b8...` | `7a8b9c0d1e2...` | Stale (`stale: true`) | 1 | 2 | 6 | **Sync needs attention** (`sync-attention`) |
| **Nova** | `b1c2d3e4f5a...` | `null` | Unanalyzed (`null`) | 0 | 0 | 0 | **Connected - Not analyzed** (`connected-not-analyzed`) |

---

## 3. Scenario Truth Table

| Scenario Key | Repository Mutated | Remote Head | Freshness | Prior Intelligence Preserved | Recovery / Next Action | Key Semantic Requirement |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `default` | None (all baseline) | Per table above | Per table above | Yes (31 findings, 12 reports) | Normal workflow | Canonical multi-repo baseline |
| `github-unavailable` | All repositories | `null` | `null` (Unknown) | Yes (100% preserved) | Verify GitHub connection | Does NOT erase intelligence; does NOT falsely claim local analysis needed |
| `permission-missing` | All repositories | `null` | `null` (Unknown) | Yes (100% preserved) | Re-authorize GitHub App | Distinguishes permission loss from network outage; preserves prior verified facts |
| `analysis-running` | `TRACE` (`repo-trace-001`) | `8c74d21054a` | `stale: true` | Yes (14 TRACE findings preserved) | Wait for local completion | Shows "Analysis in progress" with no fake percentage |
| `analysis-failed` | `TRACE` (`repo-trace-001`) | `8c74d21054a` | `stale: true` | Yes (14 TRACE findings preserved) | Fix syntax / `trace analyze` | Shows failed attempt detail without erasing prior verified snapshot |
| `sync-running` | `TRACE` (`repo-trace-001`) | `8c74d21054a` | `stale: true` | Yes (14 TRACE findings preserved) | Wait for sync completion | Analysis completed; artifact upload in flight; dashboard updates on promotion |
| `sync-failed` | `TRACE` (`repo-trace-001`) | `8c74d21054a` | `stale: true` | Yes (14 TRACE findings preserved) | `trace sync` / `trace sync --dry-run` | Analysis valid; recovery targets sync, NOT re-running analysis |
| `freshness-unavailable`| All repositories | `null` | `null` (Unknown) | Yes (100% preserved) | Normal local sync | Labels state as unknown/unavailable, not stale |
| `no-analysis` | All repositories | Baseline remote | `null` (Unanalyzed) | Cleared (0 findings, 0 reports) | `trace analyze` | Complete workspace unanalyzed baseline; GitHub repos available |

---

## 4. Operational Surfaces & Boundaries (Settings)

### Workspace Settings
- **Name**: `Northstar Engineering`
- **Identifier**: `ws-northstar-001`
- **Slug**: `northstar-engineering`
- **Lead / Current User**: `Mohammad Mohammadi` (Engineering Lead)
- **Team**: 9 team members
- **Usage**: `Team`
- **Execution Mode**: `Local TRACE`
- **Connected Repositories**: 5 repositories selected

### GitHub Connection Settings
- **Installation**: `Northstar Engineering (GitHub App)`
- **Identity**: `github-inst-northstar-001`
- **Status**: `Connected` (active verification)
- **Permission Scope**: `Read-only (Metadata, Pull Requests, Commits)`
- **Last Verification**: `Aug 19, 2026, 10:45 AM`
- **Default Branch**: `main`

### Local TRACE & Trust Boundaries
- **Execution Engine**: Runs locally on user's machine (never in the cloud).
- **Zero Source Upload**: Raw source files and inline code snippets are never transmitted to or stored on cloud servers.
- **Synchronized Artifacts**: Only approved `.trace` projection manifests, rule validations, checksum digests, branch references, and commit SHAs are synchronized.
- **Pre-Flight Verification**: Developers can inspect exact payloads using `trace sync --dry-run` before transmission.

### Authorized Computers (Devices)

| Device Label | Status | Last Used | Expiration | Key Constraints / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Mohammad's MacBook Pro** | Active | Aug 19, 2026, 10:45 AM | Nov 1, 2026 | Primary development workstation |
| **Studio Workstation** | Active | Aug 18, 2026, 4:20 PM | Nov 5, 2026 | Build / CI execution node |
| **Office Desktop** | Active | Aug 12, 2026, 9:00 AM | Oct 25, 2026 | Secondary workstation |
| **Old Laptop** | Revoked | Aug 9, 2026, 2:30 PM | Oct 15, 2026 | Revoked Aug 10, 2026, 12:00 PM; future sync blocked; historical records preserved |

---

## 5. Security & Truth Invariants

1. **No Token Exposure**: No raw secrets, tokens, private keys, or credentials are rendered in the UI or stored in mock fixtures. Tokens are represented strictly by non-reversible cryptographic hashes.
2. **Deterministic Isolation**: Applying a scenario mutates only the facts required by that scenario and does not pollute unrelated domains or entities.
3. **Preservation of Truth**: A transient network failure (`github-unavailable`) or sync failure (`sync-failed`) never destroys or overwrites historical verified project intelligence.
