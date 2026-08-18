## 1. Planning Workspace Foundation

- [x] 1.1 Define planner-level selection state by stable block ID and reconcile it when blocks are added, refreshed, reordered, or deleted.
- [x] 1.2 Add derived class summary values for block count, total planned duration, empty state, and valid start state without changing live-mode timing behavior.
- [x] 1.3 Replace the vertically stacked builder composition with a responsive planning workspace containing a summary/header, timeline, selected-block editor region, and add-block action.
- [x] 1.4 Add a useful empty-plan state that explains the block workflow and provides a primary action to create the first block.
- [x] 1.5 Add the shared planning visual primitives for surfaces, spacing, typography, buttons, focus states, and status labels, preserving the live-mode visual language.
- [x] 1.6 Verify the foundation on populated and empty plans at wide and narrow viewport sizes, including start, reset, and return-to-builder behavior.

## 2. Complete Block Editing

- [x] 2.1 Build a selected-block editor for name, positive duration, color, and coaching notes, with values initialized from the selected block.
- [x] 2.2 Add validation and accessible error feedback for missing names and invalid duration values without applying invalid edits.
- [x] 2.3 Update block creation to use the same field conventions as the selected-block editor and support optional notes during creation.
- [x] 2.4 Make confirmed edits preserve block identity and order while updating timeline previews and total duration immediately.
- [x] 2.5 Add intentional deletion behavior with confirmation or equivalent destructive-action protection, then move selection to a valid remaining block or the empty state.
- [x] 2.6 Verify create, edit, cancel, invalid-input, select, and delete flows, including notes shown by the existing live class surface.

## 3. Mutation Persistence And Status

- [x] 3.1 Confirm existing task rows are backfilled with contiguous zero-based positions, then enforce non-null `position` and uniqueness on `(user_id, position)`.
- [x] 3.2 Centralize add, edit, delete, and reorder mutations behind one plan update path that supports guest and authenticated persistence modes and writes safe position updates.
- [x] 3.3 Persist block reordering and all editable block fields consistently with the existing task storage behavior.
- [x] 3.4 Add visible `Saved`, `Saving`, `Unsaved changes`, and persistence-failure states to the planning header or summary.
- [x] 3.5 Preserve visible edits when persistence fails and provide a clear retry or recovery action without silently discarding the plan.
- [x] 3.6 Clarify guest Save and Load behavior while preserving the current explicit local save model for this change.
- [x] 3.7 Verify every mutation type in guest and authenticated modes, including reloading an authenticated plan and confirming saved block order.

## 4. Timeline Readability And Accessible Polish

- [x] 4.1 Give short timeline blocks a readable minimum presentation while retaining duration and sequence metadata for long plans.
- [x] 4.2 Improve current-progress and selected-block indicators so position is clear without relying only on block color or glow.
- [x] 4.3 Make timeline block selection, drag/reorder behavior, editor controls, color choices, and destructive actions keyboard accessible with visible focus states.
- [x] 4.4 Add dialog semantics, initial focus, Escape handling, accessible labels, and touch-sized controls to the add/edit surface.
- [x] 4.5 Replace ambiguous icon or emoji-only actions with labeled controls and distinguish destructive actions from routine save/load actions.
- [x] 4.6 Verify no horizontal scrolling, clipping, overlapping controls, stale deleted notes, or unusable short/long timeline states on representative phone and desktop viewports.
- [x] 4.7 Run lint and build checks, then perform a regression pass over planning persistence and live-class start, navigation, pause, reset, completion, and exit behavior.
