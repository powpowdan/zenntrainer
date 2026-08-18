## Context

The current builder stores an ordered array of task blocks in `App.jsx`, renders that array as a vertically stacked timeline, and keeps notes in a separate panel. Add, delete, notes, reorder, and save operations currently use different paths, while the live-class surface already consumes the same block data. Supabase tasks now include an integer `position` field for per-user ordering; existing rows must be backfilled before it is enforced. See `proposal.md` for motivation and `specs/class-planning-experience/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Create one responsive planning workspace that works as a wide-screen editor and a phone-sized preparation flow.
- Make a block's editable fields coherent and keep selection synchronized between timeline and editor.
- Route all plan mutations through one state/persistence coordination approach while adding durable per-user block positions.
- Make plan status, duration, progress, and empty states immediately understandable.
- Preserve the existing live-class behavior and its ordered block input.

**Non-Goals:**

- Adding class records, names, dates, sports, templates, history, or duplication.
- Changing live-mode timing, navigation, transitions, or completion semantics.
- Introducing a new backend service or changing the live-mode persistence contract; the existing tasks table position field is the only storage prerequisite.
- Adding background sync, notifications, audio alerts, or offline conflict resolution.

## Decisions

### Use a responsive workspace with a selected-block editor

The wide layout will place the timeline beside a selected-block editor, with a compact summary and primary start/save actions in the header. Narrow screens will retain the same information architecture but present the editor as a stacked section or sheet so the timeline remains usable first.

An always-stacked layout was rejected because it forces the coach to scroll between a block and its notes. A separate route was rejected because live mode already owns the run-time surface and preparation should remain a single plan context.

### Keep the task array as the data model and identify selection by ID

The existing block fields remain the source of truth for live mode and persistence. Selection will be represented by a stable block ID rather than a copied task object, allowing deletion, reorder, and server refreshes to reconcile safely.

Introducing a normalized store would add migration risk without solving the immediate planning problem. The existing tasks table may add the single integer position field needed for ordering.

### Centralize mutations behind one plan update path

Add, edit, delete, and reorder operations will update the visible task array through a consistent coordinator that also handles the active persistence mode. The coordinator will expose a status suitable for `Saved`, `Saving`, `Unsaved changes`, and failure feedback.

This is preferred over retaining separate component-level persistence calls, which currently allow reorder and some edits to bypass persistence. A full event-sourcing or optimistic-sync system is unnecessary for this single-user planner.

### Persist order as a per-user zero-based position

The planner will treat the first block as position `0` and persist contiguous positions for each user's plan. The database will enforce uniqueness on `(user_id, position)`, not on `position` globally, so different users can each have a first block. Reorder and delete operations will write a consistent position set rather than relying on task IDs.

Existing rows must be backfilled in current task order before `position` becomes non-null. If updates can temporarily collide with the composite uniqueness constraint, the mutation coordinator will use a safe update sequence or transaction boundary rather than exposing duplicate positions.

### Make the editor the canonical place for block fields

The selected-block editor will own name, duration, color, and notes editing. The add-block flow will use the same field conventions, with notes available during creation rather than requiring a second interaction. Timeline cards will remain focused on selection, ordering, and concise preview.

Duplicating full editing controls inside every timeline card was rejected because it would make long plans noisy and harder to use on touch screens.

### Use readable minimum block sizing with semantic progress treatment

Timeline blocks will have a minimum visual height while retaining duration metadata, so short blocks are selectable and legible. Current progress and selection will use position, border, label, or indicator changes in addition to color.

Keeping height strictly proportional to minutes was rejected because one- or two-minute blocks become unusable. A fully abstract list was rejected because duration and sequence are core planning information.

### Consolidate visual primitives without forcing a full UI-library rewrite

The builder will use shared CSS variables and primitives for surfaces, typography, spacing, focus states, and buttons. Existing Material UI usage may remain where it reduces risk, but builder controls should no longer appear as unrelated styling systems.

Replacing every existing component with one library in this change would increase scope without improving the planning contract.

## Risks / Trade-offs

- [Mutation coordination regresses authenticated or guest persistence] -> Preserve both existing persistence modes, test every mutation type in each mode, and keep visible edits on failure.
- [Position backfill or reorder writes create duplicate user positions] -> Backfill before enforcing constraints, scope uniqueness to `(user_id, position)`, and update positions through a safe sequence.
- [The responsive editor becomes too dense on phones] -> Use a timeline-first narrow layout, large controls, and a sheet or stacked editor with explicit close/cancel behavior.
- [Minimum block heights make long plans cumbersome] -> Cap the planner viewport, preserve scrolling, and provide compact metadata so the timeline remains scannable.
- [Changing selection state affects live-mode entry] -> Keep live mode derived from the task array and verify start, reset, exit, and return-to-builder flows.
- [Mixed Material UI and CSS remains visually inconsistent] -> Define shared tokens and audit builder controls as a group before adding isolated styling.
- [Failed saves leave the coach uncertain] -> Keep the plan visible, expose failure status, and provide a retry or explicit recovery action.

## Migration Plan

1. Backfill existing task positions, enforce non-null per-user ordering, and verify the `(user_id, position)` uniqueness constraint.
2. Introduce the workspace structure and selection-by-ID behavior while preserving the existing task array.
3. Add complete block creation and editing, then verify duration totals and live-mode input remain correct.
4. Route all mutations through the shared persistence path and verify guest and authenticated behavior, including reloaded order.
5. Add timeline readability, accessibility, responsive refinements, and empty/error states.
6. Verify lint, build, representative planning flows, and live-mode regression behavior.
7. Roll back by restoring the prior builder presentation and mutation handlers; retain the additive position column and its backfill if the feature is rolled back.

## Open Questions

- Whether successful local guest changes should persist immediately or continue requiring an explicit Save action can be decided during implementation without changing the block contract.
