## Why

During a live class, the timeline progress line drifts away from the block it claims to represent. The line's pixel position is computed from raw elapsed time (`elapsedMinutes × 6px`), but blocks are laid out with a 64px minimum height and 6px inter-block margins that the line math ignores. The error accumulates all class (≈66px by the end of the default 7-block plan) and becomes instantly obvious when the coach skips blocks — the line lands inside the wrong block while a different block is highlighted as active.

## What Changes

- Compute the progress line's vertical position from the actual rendered block layout: sum of rendered heights (respecting the 64px minimum) plus margins of all preceding blocks, plus a duration-proportional fraction of the active block's rendered height.
- Keep the line's *time* semantics unchanged: position reflects plan position (planned time before the active block + offset within it). Skipping blocks deducts unspent time from class remaining, exactly as today — no timing model changes.
- Render the progress line whenever a run position exists, not only while the clock is ticking: the line stays frozen in place while the class is paused instead of disappearing.
- Scope is contained to the Timeline component; no state, timer, or persistence changes.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `class-planning-experience`: The "Timeline communicates duration, selection, and live run position" requirement changes — the progress line SHALL be positioned against the rendered block layout (min heights and margins included) so it aligns with the active block, and SHALL remain visible (frozen) while a run is paused rather than only while running.

## Impact

- `src/components/Timeline.jsx` — progress line position calculation and render condition (the only file modified).
- No API, data model, persistence, or timer-state changes.
- Spec `openspec/specs/class-planning-experience/spec.md` gains sharpened scenarios for line alignment and paused visibility upon archive.
