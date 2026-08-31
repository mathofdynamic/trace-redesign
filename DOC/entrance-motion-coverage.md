# TRACE Entrance Motion Coverage Inventory

## Public & Auth Routes (Phase 50)

| Route | Page file | Page type | Motion sections | Meaningful items | Observer needed | Transient surfaces | Desktop verified | Mobile verified | Reduced-motion verified | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `apps/web/app/page.tsx` | Marketing / Editorial Landing | Hero, Bottleneck (`bottleneck`), Preserves (`preserves`), Spec Memory (`memory`), Execution (`execution`), CTA (`cta`), Footer (`footer`) | Hero copy & CTA lockup, Intelligence card, Bottleneck analysis points, Narrative layer nodes, Repo tree & artifact preview panes, Execution mode matrix table, Final CTA lockup & ledger badge | Yes (below-the-fold sections) | Mobile navigation drawer popover | Yes | Yes (390x844) | Yes | Complete |
| `/product` | `apps/web/app/product/page.tsx` | Product Architecture | Header, Flow, Capabilities (`capabilities`), Boundary (`boundary`), Status (`status`), Footer (`footer`) | PageHeader, Architecture flow diagram nodes, Capability cards (1-5), Boundary cards (1-4), Truth disclosure columns & verification footer | Yes (below-the-fold sections) | Mobile navigation drawer popover | Yes | Yes (390x844) | Yes | Complete |
| `/security` | `apps/web/app/security/page.tsx` | Security & Privacy Architecture | Header, Boundary Flow, Matrix (`matrix`), Not Claimed (`not-claimed`), Footer (`footer`) | PageHeader, Trust-boundary flow nodes, Perimeter gates (1-3), Matrix categories (1-3), Non-claimed commitments list | Yes (below-the-fold sections) | Mobile navigation drawer popover | Yes | Yes (390x844) | Yes | Complete |
| `/specification` | `apps/web/app/specification/page.tsx` | Artifact Specification (RFC-001) | Header, Lifecycle, Relationships (`relationships`), Questions (`questions`), Footer (`footer`) | PageHeader, Lifecycle flow nodes, Core invariant notice, Artifact directory cards (1-6), Architectural FAQ cards (1-5) | Yes (below-the-fold sections) | Mobile navigation drawer popover | Yes | Yes (390x844) | Yes | Complete |
| `/pricing` | `apps/web/app/pricing/page.tsx` | Packaging & Principles | Header, Packaging Matrix (`packaging`), Principles (`principles`), Footer (`footer`) | PageHeader, Packaging mode cards (Local, Team, Enterprise), Commercial principles cards (1-4) | Yes (below-the-fold sections) | Mobile navigation drawer popover | Yes | Yes (390x844) | Yes | Complete |
| `/docs` | `apps/web/app/docs/page.tsx` | Technical In-Tree Docs | Header, TOC, Source Docs (`source-docs`), Local Flow (`local-flow`), Local CLI (`local-cli`), Cloud Sync (`cloud-sync`), Footer (`footer`) | PageHeader, Sticky TOC navigation, Source document index table, Pipeline flow steps, Interactive command code blocks | Yes (below-the-fold sections) | Mobile navigation drawer popover | Yes | Yes (390x844) | Yes | Complete |
| `/sign-in` | `apps/web/app/sign-in/page.tsx` | Auth Entry | AuthShell (`auth-shell`) | Brand & back-link, Auth card (title, intro, GitHub auth button, demo button, privacy disclosure), Footer note | No (single viewport) | None | Yes | Yes (390x844) | Yes | Complete |
| `/sign-up` | `apps/web/app/sign-up/page.tsx` | Auth Redirect | N/A (Server redirect to `/sign-in`) | N/A (Redirect preserves intent) | No | None | Yes | Yes (390x844) | Yes | Complete |
| `/onboarding` | `apps/web/app/onboarding/page.tsx` | User Setup Wizard | Onboarding Shell (`onboarding-shell`) | Wordmark & step indicator, Setup progress bar, Onboarding profile card & interactive form | No (single viewport) | None | Yes | Yes (390x844) | Yes | Complete |
| `/cli/authorize` | `apps/web/app/cli/authorize/page.tsx` | CLI Device Authorization | Auth Page (`auth-page`) | Cli auth card (title, explanation, code input form/details, manage connections) | No (single viewport) | None | Yes | Yes (390x844) | Yes | Complete |
| `/auth/error` | `apps/web/app/auth/error/page.tsx` | Auth Error State | AuthShell (`auth-shell`) | Brand & back-link, Error explanation card, Action buttons, Diagnostic technical details | No (single viewport) | None | Yes | Yes (390x844) | Yes | Complete |
| `/*` (Not Found) | `apps/web/app/not-found.tsx` | Error / 404 Recovery | Not Found (`not-found`), Footer (`footer`) | 404 label & header, explanation copy, recovery actions (Return Home, View Docs) | No (single viewport) | Mobile navigation drawer popover | Yes | Yes (390x844) | Yes | Complete |

## Authenticated Dashboard Routes (Phase 51)

| Route | Component / File | View Type | Stagger Structure | Key Sections | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/app` | `apps/web/app/(app)/app/page.tsx` | Overview Dashboard | Staggered 0-4 | Header, Status KPIs, Attention Feed, Repositories, Activity Stream | Complete |
| `/app/repositories` | `apps/web/app/(app)/app/repositories/page.tsx` | Repositories Directory | Staggered 0-3 | Header, Filter/Search, Repository Cards Grid, Empty State | Complete |
| `/app/repositories/[id]` | `apps/web/app/(app)/app/repositories/[repositoryId]/page.tsx` | Repository Detail Command Center | Staggered 0-4 | Repo Header, Breadcrumbs, Metrics Row, Tab Navigation, Active Sub-view | Complete |
| `/app/repositories/[id]/changes` | `apps/web/app/(app)/app/_components/changes-view.tsx` | Changes Feed | Staggered 0-3 | Change Groups, PR Badges, Incompatibility Tags, Diff Summary | Complete |
| `/app/repositories/[id]/conflicts` | `apps/web/app/(app)/app/_components/conflicts-view.tsx` | Conflicts & Incompatibilities | Staggered 0-3 | Conflict Matrix, Colliding PR Badges, Evidence Diff, Resolution Status | Complete |
| `/app/repositories/[id]/reports` | `apps/web/app/(app)/app/_components/reports-view.tsx` | Reports Archive | Staggered 0-3 | Report Timeline, AST Metric Cards, Invariant Verdicts, Filter Toolbar | Complete |
| `/app/repositories/[id]/reports/[reportId]` | `apps/web/app/(app)/app/_components/report-detail-view.tsx` | Report Detail View | Staggered 0-4 | Report Header, AST Metrics, Invariants Verification, Diagnostics Log | Complete |
| `/app/repositories/[id]/decisions` | `apps/web/app/(app)/app/_components/decisions-view.tsx` | Architectural Decisions (ADRs) | Staggered 0-3 | Decision Cards, Status Filters, Superceded Links, Prompt Trigger | Complete |
| `/app/repositories/[id]/rules` | `apps/web/app/(app)/app/_components/rules-view.tsx` | Governance Rules | Staggered 0-3 | Rule Cards, Severity Filters, AST Invariant Constraints, Rule Generator | Complete |
| `/app/repositories/[id]/activity` | `apps/web/app/(app)/app/_components/activity-view.tsx` | Repository Activity Feed | Staggered 0-2 | Activity Feed, Actor Badges, Timestamp Groups, Event Filters | Complete |
| `/app/repositories/[id]/settings` | `apps/web/app/(app)/app/_components/settings-view.tsx` | Repository & Device Settings | Staggered 0-3 | Authorized Devices Table, Webhook Config, Sync Status, Danger Zone | Complete |
| `/app/documentation` | `apps/web/app/(app)/app/_components/documentation-view.tsx` | Technical Architecture Docs | Staggered 0-3 | Document Index, Pipeline Flow, CLI Guidance, RFC Specification | Complete |

## Transient Surfaces, Popovers, Drawers & Dialogs (Phase 52)

| Surface | File | Trigger / Parent View | Lifecycle Engine | Animation Structure | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `LocalActionPanel` | `trace-redesign.tsx` | "Local Setup & Commands" button | `usePresence(isOpen)` | Header (0), Command list (1), Footer (2) | Complete |
| `FindingDetailModal` | `trace-redesign.tsx` | Finding item click | `usePresence(isOpen)` | Header (0), Intro & Evidence (1), Actions (2) | Complete |
| `RulePromptBuilderModal` | `rule-prompt-builder.tsx` | "Create Rule" / Rule Card click | `usePresence(isOpen)` | Header (0), Config Form (1), Preview/Prompt (2) | Complete |
| `DecisionPromptBuilderModal` | `decision-prompt-builder.tsx` | "New Decision" / ADR Card click | `usePresence(isOpen)` | Header (0), Context Form (1), Prompt Generation (2) | Complete |
| `ConflictDetailModal` | `conflicts-view.tsx` | "Inspect Conflict" button / row click | `usePresence(isOpen)` | Header (0), Conflict Intro (1), Colliding PRs (2), Code (3) | Complete |
| `ReportQuickDrawer` | `reports-view.tsx` | "Quick Inspect" button on report item | `usePresence(isOpen)` | Header (0), Overview (1), Invariants (2), Files (3) | Complete |
| `ChangeDetailDrawer` | `changes-view.tsx` | "Inspect Change" / PR row click | `usePresence(isOpen)` | Header (0), PR Summary (1), Diff & Intent (2) | Complete |
| `DeviceRenameModal` | `settings-view.tsx` | "Rename" button on authorized device | `usePresence(isOpen)` | Header (0), Rename Form (1), Actions (2) | Complete |
| `DeviceRevokeModal` | `settings-view.tsx` | "Revoke" button on authorized device | `usePresence(isOpen)` | Header (0), Warning Body (1), Actions (2) | Complete |
| `RepositoryAccessModal` | `repository-selector.tsx` | "Adjust repository access" button | `usePresence(isOpen)` | Header (0), Intro (1), Toolbar (2), Grid (3), Actions (4) | Complete |

## Verification Invariants

1. **Physical & Timing Contract**:
   - `ENTRANCE_DURATION_MS = 200ms`
   - `ENTRANCE_LEAD_MS = 66.6667ms` (mathematically derived from `200 / 3`)
   - `ENTRANCE_DISTANCE_PX = 20px`
   - `ENTRANCE_EASING = cubic-bezier(.16, 1, .3, 1)`
   - `EXIT_DURATION_MS = 66ms`, `EXIT_DISTANCE_PX = 8px`, `EXIT_EASING = cubic-bezier(.4, 0, 1, 1)`

2. **Progressive Enhancement**:
   - `html:not([data-trace-motion-ready="true"])` forces immediate 100% opacity and `transform: none` on all items and sections.
   - Zero layout shifts, no flash of unstyled content, no blocking fonts or artificial wait states.

3. **No Double Entrance**:
   - All legacy route-enter keyframes and ad-hoc CSS transitions have been migrated into the unified engine.

4. **Reduced Motion**:
   - `@media (prefers-reduced-motion: reduce)` immediately renders all sections and items with `opacity: 1`, `transform: none`, and `transition: none`.
