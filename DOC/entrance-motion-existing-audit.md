# Pre-Flight Motion Audit — TRACE Entrance Motion Runtime

**Target Specification**: TRACE Physical Entrance Motion System (Phase 49)  
**Contract**: Opening: 200ms, lead: 66.6667ms (200 / 3), easing: `cubic-bezier(0.16, 1, 0.3, 1)`, translation: `translate3d(0, 20px, 0)` -> `translate3d(0, 0, 0)`. Exit: 66ms, easing: `cubic-bezier(0.4, 0, 1, 1)`, translation: `translate3d(0, 8px, 0)`.

---

## Motion Audit & Classification Matrix

| File / Component | Selector / Rule | Motion Behavior | Classification | Action | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `apps/web/app/globals.css` | `[data-trace-motion="item"]`, `.trace-motion-item` | Staggered entrance translation + fade | **entrance/reveal** | **migrate / standardize** | Standardize to single timing source `ENTRANCE_DURATION_MS = 200`, `ENTRANCE_LEAD_MS = 66.6667ms`, `ENTRANCE_DISTANCE_PX = 20`. |
| `apps/web/app/globals.css` | `[data-trace-motion="section"]` | IntersectionObserver boundary coordinate | **entrance/reveal** | **keep / enforce** | Serves as deterministic viewport reveal boundary; child items animate sequentially once visible. |
| `apps/web/app/globals.css` | `@keyframes route-enter` | 180ms ease-out route mount keyframe | **entrance/reveal** | **replace** | Replaced with unified 200ms cubic-bezier physical entrance runtime. |
| `apps/web/app/globals.css` | `@keyframes mobileNavMaterialize` | 180ms cubic-bezier drawer flyout | **transient open/close** | **migrate in Phase 52** | Drawer/sheet flyout to be unified under Phase 52 transient motion contract. |
| `apps/web/app/globals.css` | `@keyframes modalScaleMaterialize` | 200ms modal dialog entrance | **transient open/close** | **migrate in Phase 52** | Dialog backdrop + card entrance to be unified under Phase 52 transient motion contract. |
| `apps/web/app/globals.css` | `@keyframes drawerSlideIn` | Mobile drawer slide | **transient open/close** | **migrate in Phase 52** | Retained for drawer semantics until Phase 52 transient surface audit. |
| `apps/web/app/globals.css` | `@keyframes navigation-pulse` | Infinite pulse on sync indicator | **decorative/continuous** | **preserve** | Operational status pulse indicator; outside entrance motion scope. |
| `apps/web/app/globals.css` | `@keyframes route-progress` | Infinite loading bar pulse | **decorative/continuous** | **preserve** | Real route progress indicator; does not gate or delay layout entrance. |
| `apps/web/app/globals.css` | `@keyframes skeleton-pulse` | Subtle pulse for loading states | **loading/skeleton** | **preserve** | Preserved for genuine asynchronous data fetching; never used as artificial gate. |
| `apps/web/app/globals.css` | `.button`, `.nav-link`, etc. | 120ms–150ms hover color & background transitions | **hover/focus/selection** | **preserve** | Non-transform interactive micro-feedback; no conflicts with entrance translate. |
| `apps/web/app/globals.css` | `a:focus-visible`, `button:focus-visible` | Focus rings & outline offsets | **hover/focus/selection** | **preserve** | Essential WCAG 2.2 AA keyboard accessibility requirement. |
| `apps/web/app/globals.css` | `.card:hover`, `.bento-card:hover` | Subtle transform / border-color on hover | **hover/focus/selection** | **preserve** | Animate on inner interactive wrapper or after entrance completion to avoid transform collisions. |
| `apps/web/app/globals.css` | `@media (prefers-reduced-motion: reduce)` | Instant duration & 0 delay override | **accessibility** | **enforce & test** | Ensures 0ms instant display, 0px translation, and zero layout shift for sensitive users. |

---

## Action Plan for Phase 49

1. **Centralize Timing**: Single authoritative source in `apps/web/lib/entrance-motion.ts` exporting:
   - `ENTRANCE_DURATION_MS = 200`
   - `ENTRANCE_LEAD_MS = ENTRANCE_DURATION_MS / 3` (66.66666666666667ms)
   - `ENTRANCE_DISTANCE_PX = 20`
   - `ENTRANCE_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'`
   - `EXIT_DURATION_MS = 66`
   - `EXIT_DISTANCE_PX = 8`
   - `EXIT_EASING = 'cubic-bezier(0.4, 0, 1, 1)'`
2. **Standardize CSS Custom Properties**: Bind `--trace-motion-*` variables in `globals.css` matching the central timing source.
3. **Ensure No-JS & Hydration Fail-Safe**: Content remains 100% visible by default; pre-entrance hiding is strictly gated by positive JavaScript initialization (`html[data-trace-motion-ready="true"]`) with bounded timeout fail-safe.
4. **Enforce Single Shell Reveal**: Sidebar and Topbar initialize once per authenticated session without replaying across internal `/app/*` route navigations.
