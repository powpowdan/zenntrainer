## Context

See `proposal.md` for motivation. The relevant current-state facts that shape this design:

- `App.jsx:425-444` does an exclusive early `return <LiveClass />` that fully replaces the app surface when `isLiveMode` is true. There is no path back to the planner that doesn't first call `exitLiveMode` (`App.jsx:414`), which pauses the clock (`setIsRunning(false); setRunStartedAt(null)`).
- The clock is driven from absolute seconds: `elapsedTime`, `baseElapsed`, `runStartedAt` (`App.jsx:88-118`). `activeIndex` is derived each render by walking task boundaries against `elapsedTime` (`App.jsx:120-128`).
- The planner timeline is already a proportional spatial representation: `PIXELS_PER_MINUTE = 6` in `Timeline.jsx:12`, so block heights scale linearly with duration. A "progress line" is therefore a 1-D position computation, not a new layout primitive.
- `TaskBlock.jsx` already supports a `selected` visual state using an accent ring (`TaskBlock.jsx:42-49`); the same visual language can extend to an `active` state.
- `commitPlan` (`App.jsx:275`) is the single chokepoint for every plan mutation (add/edit/delete/reorder). It has no run-awareness today because the planner is unreachable during a run.
- `moveToBlock(targetIndex)` (`App.jsx:396`) already exists for jumping the playhead; it suppresses the boundary transition and is the primitive for any "advance the playhead to the next block" semantics.

## Goals / Non-Goals

**Goals:**
- Make the planner reachable while a class is running, with the clock continuing to tick.
- Show the coach, at a glance, exactly where the run is within the plan.
- Keep the coach's perceived position stable across plan edits they make mid-run.
- Work on both desktop and mobile without a separate code path per form factor.

**Non-Goals:**
- Multi-user or collaborative editing of a running class.
- Undo / history of plan edits.
- Insertion of blocks at arbitrary positions mid-plan (AddTaskForm only appends today; this change does not add insertion).
- Backend or persistence-schema changes.
- Changing the existing "Exit" affordance that pauses and leaves a live class.

## Decisions

### Decision 1: Overlay/drawer over mini-player or unified single view

The planner overlay is rendered above a still-mounted `LiveClass`. On wide viewports it anchors to the right as a drawer; on phone viewports it anchors to the bottom as a sheet.

**Rationale.** Matches the coach's mental model ("live is home; planner is a visit"), keeps the clock visible at the periphery (desktop) or above the sheet (mobile), and requires no re-architecture of the planner itself — the planner renders identically whether mounted directly or inside the overlay.

**Alternatives considered.**
- *Persistent mini-player* (LiveClass demotes to a widget, planner becomes the main surface): rejected because it inverts the coach's mental model and requires the planner grid to make room for a permanent live widget on every render, not just during the rare mid-class edit.
- *Unified single view* (live becomes a pane beside the planner): rejected for the same reason, plus it would force a layout redesign on mobile where there is no room for two panes.

### Decision 2: Break the exclusive early-return; keep `LiveClass` mounted while the overlay is open

The exclusive `return <LiveClass />` at `App.jsx:425` becomes a conditional render: when `isLiveMode` is true, `LiveClass` is always mounted; an additional `isPlannerOverlayOpen` flag gates whether the planner overlay renders above it.

**Rationale.** Keeping `LiveClass` mounted means its 100ms clock interval (`App.jsx:116`) keeps firing, the transition toast keeps working, and there is no remount cost when dismissing the overlay. The clock state stays in `App.jsx` either way, so this is purely a rendering change.

**Alternative considered.** Lifting the clock to a context/hook. Rejected for this change — the state is already correctly hoisted in `App.jsx`; the issue is only the rendering structure, not state ownership.

### Decision 3: Identity-anchored playhead

Replace the absolute-seconds model (`elapsedTime`, `baseElapsed`, `runStartedAt`) with an identity anchor: store `(activeTaskId, offsetWithinBlock)` as the source of truth and derive `elapsedTime` from it on each render.

Derivation: `elapsedTime = sum(durations of blocks before the active block) + offsetWithinBlock`. The clock interval advances `offsetWithinBlock` by `(now - lastTick)/1000` while running, clamping at the active block's duration; on reaching the boundary it advances `activeTaskId` to the next block and resets `offsetWithinBlock` to 0 (or marks the run complete if it was the final block).

**Rationale.** This is the only model under which the requirement "edits to non-active blocks don't move the coach" is naturally true. Under absolute-seconds, lengthening a past block would silently shift the coach's perceived position; a pile of special-case clamps would be needed to fake stability. Identity anchoring makes the desired behavior the default.

**Migration of existing semantics.**
- `startClass`, `pauseClass`, `resumeClass`, `resetClass`, `moveToBlock`, and `moveNext`/`movePrevious` all become reads/writes against `(activeTaskId, offsetWithinBlock)` rather than against absolute seconds. `moveToBlock(targetIndex)` becomes "set `activeTaskId` to the block at that index, `offsetWithinBlock` to 0."
- `isComplete` fires when the final block's `offsetWithinBlock` reaches its duration.
- The transition toast (`App.jsx:144-168`) fires on `activeTaskId` change rather than on `activeIndex` change.

**Risks of this decision.** It is the largest single piece of the change and touches every time-related code path. See Risks.

**Alternative considered.** Keep absolute seconds, add clamp logic on each edit to "remember" the active block. Rejected — fragile, special-cased per edit type, and easy to break with future edits.

### Decision 4: Smart+confirm edit policy in `commitPlan`

`commitPlan` gains a run-aware pre-flight. When the run is in progress, mutations are classified:
- **Free**: name, notes edits; add-to-end; reorder of purely-future blocks; delete of purely-future blocks.
- **Confirming**: duration change to the active block; reorder involving the active or any past block; delete of the active block; delete of any past block.

The confirmation prompt names the consequence ("This is the active block — the run will advance") and only proceeds on explicit confirm. The existing `window.confirm` pattern (used for deletes in `App.jsx:325`) is reused for consistency.

**Rationale.** Pure permissiveness lets the coach accidentally destroy an in-progress class; pure restrictiveness defeats the use case. Naming the consequence in the prompt matches how the coach thinks about the edit.

**Alternative considered.** Locking time-relevant fields entirely during a run. Rejected because extending the active block mid-class ("cardio needs 5 more minutes") is one of the most common real use cases.

### Decision 5: Active-block highlight is visually distinct from selected

`TaskBlock` gains an `active` prop distinct from `selected`. Both use the accent-token visual language but combine differently: `selected` uses a ring + filled background (today's behavior); `active` uses a left-edge accent bar + subtle accent tint. When a block is both active and selected, both treatments apply and remain individually readable.

**Rationale.** The existing `class-planning-experience` spec requires selected to be distinguishable without color alone; introducing a second run-state highlight cannot regress that, so the two states must compose.

## Risks / Trade-offs

- **[Largest risk] Identity-anchor refactor touches every time path.** A regression in the clock, pause/resume, or block navigation would break the core live-class experience. → *Mitigation:* do this refactor as the first task, behind the existing manual run flow (no overlay yet), and verify every existing live-mode behavior is unchanged before building the overlay. The refactor must be behavior-preserving for the non-overlay paths.
- **Edits during a run interact with the persistence queue.** `commitPlan` already serializes writes via `persistenceQueue` (`App.jsx:42, 195-199`); rapid mid-run edits could stack up against Supabase latency. → *Mitigation:* no behavior change required for correctness (the queue handles it), but the planner's "saving/saved" indicator must remain accurate under rapid edits. Verify during implementation.
- **Mobile bottom sheet could obscure the live clock if poorly sized.** → *Mitigation:* spec requires the clock to remain visible above the sheet; the sheet should open in a partial-height state with the clock pinned above it, draggable to full-height.
- **Breaking change to the `class-planning-experience` spec.** The previous "planner shall not render live-class run state" requirement is replaced. → *Mitigation:* the replacement is conditional (show run state only while running), so the no-run-state behavior is preserved exactly when no class is in progress — the regression risk for the common case is zero.
- **Two simultaneous visual states (active + selected) could confuse.** → *Mitigation:* pre-selecting the active block on overlay entry means initially `active === selected` (one treatment, not two); they diverge only after the coach clicks a different block, which is an intentional action.

## Migration Plan

Client-only; no data migration. Rollout is a single frontend deploy. Rollback is reverting the deploy; no persisted state references the new client-only model (the Supabase `tasks` schema and `commitPlan` persistence flow are unchanged).

The recommended task ordering (see `tasks.md`) isolates the identity-anchor refactor as a behavior-preserving step before any overlay UI is added, so the clock change can land and be verified independently of the new surface.

## Open Questions

These defaulted to the most defensible answer during planning; they are safely adjustable later without changing the specs or the approach:

- **On deleting the active block, does the run advance to *next* or *previous*?** Default: next (keeps forward momentum). The corresponding task notes this as adjustable.
- **Does the progress line follow a dragged block in real time, or snap on drop?** Default: snap on drop (less jitter). The reorder-during-run behavior in the specs is unaffected either way; this is a pure UX polish decision.
- **What are the exact entry affordances?** Default: an "Edit plan" button in the live header plus swipe-up-to-open on the mobile bottom sheet; the existing "Exit" button is unchanged.
- **Does the "Up next" transition toast fire while the overlay is open?** Default: yes (LiveClass stays mounted; the toast appears over the overlay). The spec explicitly requires the run to advance across boundaries while the overlay is open, so suppressing the toast would be inconsistent.
- **Does the editing surface pre-select the active block on overlay entry?** Default: yes; this is a spec requirement, not an open question — listed here for traceability.
