## Why

Coaches currently have to use the same planning-oriented screen while running a class, making the active exercise, remaining time, and coaching notes harder to read at a glance on a phone. A dedicated live class mode will turn the existing class sequence into a reliable, phone-first control surface for leading a session.

## What Changes

- Add a live class presentation optimized for a coach holding a phone during class.
- Show the remaining time for the whole class alongside a prominent countdown for the active block.
- Show the active block's notes and a preview of the next block.
- Automatically advance to the next block when the active block reaches zero.
- Show a short visual-only transition state at automatic block boundaries without extending the planned class duration.
- Add manual previous and next controls for correcting or skipping the current position.
- Preserve pause, resume, reset, and class completion behavior in live mode.
- Keep class names, dates, sports, reusable templates, and broader builder redesigns out of this change.

## Capabilities

### New Capabilities

- `live-class-mode`: Phone-first live class timing, block navigation, notes, transitions, and completion behavior.

### Modified Capabilities

- None.

## Impact

- React application state and timer logic in `src/App.jsx`.
- Live-mode presentation and controls in the existing app/component structure.
- Responsive styling for small phone viewports and touch interaction.
- Existing task/block data remains the source for durations, ordering, colors, and notes; no new persistence model is introduced.
