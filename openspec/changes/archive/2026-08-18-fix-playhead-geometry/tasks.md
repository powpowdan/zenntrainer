## 1. Layout constants

- [x] 1.1 In `src/components/Timeline.jsx`, hoist `PIXELS_PER_MINUTE`, `MIN_BLOCK_HEIGHT`, `PADDING_TOP`, and `BLOCK_MARGIN_BOTTOM` to module-level constants and reference them from the container padding, block margin, and height calculations (replacing the hardcoded `8px`/`6px` inline values) per design D4

## 2. Progress line geometry

- [x] 2.1 Replace the time-based `progressLineTop` with layout-based math: `PADDING_TOP + Σ(height(k) + margin) for blocks before the active block + clamped fraction × height(active)` per design D1
- [x] 2.2 Derive the within-block offset as `elapsedTime − planned seconds before the active block`; guard zero-duration active blocks (fraction = 0) and clamp the fraction to [0, 1] per design D2

## 3. Render condition

- [x] 3.1 In `src/App.jsx`, pass a derived `showRunPosition = isLiveMode && !isComplete && activeTaskId !== null` prop to `Timeline` (both render paths use `renderPlanner()`, so one prop addition covers both) per design D3
- [x] 3.2 In `Timeline.jsx`, render the progress line on `showRunPosition` instead of `isRunning`, and hide it while `isDragging` per design D5

## 4. Verification

- [x] 4.1 Manual run-through (dev server, default plan): straight-through run — line sits at each block's rendered top edge on boundary and travels through the active block's extent; with short blocks present, line stays inside the highlighted block through the whole class
- [x] 4.2 Manual skip checks: skip forward mid-block — line lands exactly at the new active block's top edge and class remaining drops by the skipped unspent time; Previous — line rewinds to the preceding block's top edge
- [x] 4.3 Manual pause checks: pause mid-class with planner open — line stays frozen (does not disappear); resume — line continues; exit live mode — line gone; reset from complete — line at first block top
- [x] 4.4 Run `npm run lint` and fix any findings
