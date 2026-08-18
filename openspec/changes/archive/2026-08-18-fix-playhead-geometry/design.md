## Context

See proposal.md - Why. Today `Timeline.jsx` positions the progress line at `PADDING_TOP + (elapsedSeconds / 60) * PIXELS_PER_MINUTE`, while blocks are laid out as `height = max(duration × PIXELS_PER_MINUTE, 64)` with a 6px bottom margin each. The two drift apart by 6px per passed block plus the min-height over-render of short blocks (a 10-min block renders 64px but "earns" 60px of line travel). The render condition is `isRunning`, so pausing makes the line vanish even though the run position (active task + frozen offset) still exists.

Time semantics are already correct and stay untouched: `elapsedTime` is derived in `App.jsx` (`elapsedBeforeActive + liveOffsetWithinBlock`), and `moveToBlock` resets the within-block offset on skips, which deducts unspent time from class remaining. The fix is purely presentational geometry plus the pause render condition.

## Goals / Non-Goals

**Goals:**
- Progress line position agrees with the rendered position of the active block at all times, including after skips and mid-run plan edits.
- Progress line stays visible (frozen) while a live session is paused; suppressed only when no live session is in progress.
- Keep the change contained to `Timeline.jsx` plus one derived prop from `App.jsx`.

**Non-Goals:**
- No wall-clock / actual-vs-planned time tracking (a possible future capability).
- No changes to the timing model, skip semantics, class-remaining math, or persistence.
- No fix for past-block deletion refunding elapsed time (separate concern, deferred).

## Decisions

### D1: Compute the line from rendered layout, not raw time

```
lineTop = PADDING_TOP
        + Σ_{k < activeIndex} ( height(k) + BLOCK_MARGIN_BOTTOM )
        + clamp(offsetWithinBlock / activeDurationSec, 0, 1) × height(active)

height(k) = max(duration(k) × PIXELS_PER_MINUTE, MIN_BLOCK_HEIGHT)
```

- Why: the line and the blocks then share one source of truth (the same height function), so they cannot disagree. All inputs are already available.
- Alternatives rejected:
  - *Remove min-height/margins from layout so time-math matches* — min-height is required for readability of short blocks (spec scenario: "Plan contains short blocks"); margins are required for visual separation.
  - *Measure DOM node positions via refs* — unnecessary; layout is deterministic from constants already declared in the component. DOM measurement adds resize/drag complexity for zero accuracy gain.

### D2: Derive `offsetWithinBlock` inside Timeline instead of adding a prop

`offsetWithinBlock = elapsedTime − Σ planned-seconds before the active block`. Both `elapsedTime` and `activeTaskId` are already props, so no App.jsx plumbing changes for the geometry itself. When the active block has zero duration, treat the fraction as 0 (guard the division); always clamp to [0, 1] to absorb any tick race.

### D3: New derived prop for the render condition

Timeline cannot distinguish "paused inside a live session" (line should stay) from "no live session" (no line) — both have `isRunning === false`. `App.jsx` passes one derived boolean, e.g. `showRunPosition = isLiveMode && !isComplete && activeTaskId !== null`, and Timeline renders the line on that condition instead of `isRunning`.

- Paused mid-class: `isLiveMode` true, `isComplete` false → line frozen at the paused position (position comes from frozen `elapsedTime`, so no extra work).
- Exited live mode (even with a resumable position preserved): `isLiveMode` false → no line, matching the suppression scenario.
- Completed: `isComplete` true → no line.
- Note: `isRunning === true` implies `isLiveMode === true` in current App state flow (start/resume only happen in live mode), so the new condition is a strict superset of the old one during active runs.

### D4: Single source for layout constants

The padding (`8px`), block margin (`6px`), `PIXELS_PER_MINUTE`, and `MIN_BLOCK_HEIGHT` currently exist as JS constants *and* hardcoded inline styles in the same file. Extract them to one set of module-level constants and reference them from both the line math and the container/block styles so they cannot drift apart later.

### D5: Hide the line during block drags

While a drag is active (`isDragging`), blocks are transformed out of document flow, so the line's position is momentarily meaningless. Hide it for the duration of the drag and restore on drop. Transient polish; not spec-level.

## Risks / Trade-offs

- [Fractional positions when scaling progress through a block's height] → harmless sub-pixel rendering; no rounding needed.
- [Line math silently diverging if styles are edited without touching constants] → mitigated by D4 (constants drive both math and styles).
- [A 0-duration active block from mid-run edits] → division guarded, fraction treated as 0; block advance logic in App already handles the state transition.
- [Drag-transformed layout vs static line] → D5 hides the line during drags.

## Migration Plan

Pure render-layer change; no data, persistence, or API impact. Deploy and rollback are a single-file revert.

## Open Questions

None.
