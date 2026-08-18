## Why

The current class planner is a functional prototype, but it makes preparation harder than it needs to be: the timeline, notes, and add-block controls are stacked, blocks cannot be fully edited after creation, and mutations do not share a reliable persistence path. The live-class change established a focused running experience; this change makes the preparation experience equally clear and dependable without changing live-mode behavior.

## What Changes

- Replace the stacked planning layout with a responsive workspace containing a class summary, ordered timeline, and selected-block editor.
- Add complete block editing for name, duration, color, and coaching notes, including validation and useful empty states.
- Make add, edit, delete, and reorder operations use consistent state and persistence behavior for guest and authenticated users.
- Show save status and unsaved-change feedback so coaches know whether the plan is current.
- Improve timeline readability for short and long classes, including clearer active-progress treatment.
- Improve keyboard access, touch targets, dialog behavior, labels, and destructive-action clarity.
- Keep the existing task/block data shape and live-class behavior compatible, adding per-user block position data for durable ordering.
- Defer class names, dates, sports, reusable templates, saved-plan history, and plan duplication to a future change.

## Capabilities

### New Capabilities

- `class-planning-experience`: Responsive class preparation, block editing, plan state, persistence feedback, and accessible timeline interactions.

### Modified Capabilities

- None.

## Impact

- Planning shell and responsive styles in `src/App.css` and `src/index.css`.
- Builder state, selection, mutations, and persistence coordination in `src/App.jsx`.
- Timeline and block interaction behavior in `src/components/Timeline.jsx` and `src/components/TaskBlock.jsx`.
- Block creation and editing in `src/components/AddTaskForm.jsx` and `src/components/Notes.jsx`.
- Planning header actions and status presentation in `src/components/Header.jsx`.
- Existing Supabase task storage uses a per-user `position` field for durable ordering; no new service or live-mode contract is required.
