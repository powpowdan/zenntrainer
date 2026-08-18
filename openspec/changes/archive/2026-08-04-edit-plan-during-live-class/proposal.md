## Why

Once a class is running, the coach cannot adjust the plan mid-flight: today entering the planner requires exiting live mode (`App.jsx:414` `exitLiveMode`), which pauses the clock. Real classes drift — blocks run long, a segment gets cut, notes need a quick addition — and forcing the coach to choose between "keep the class running" and "fix the plan" is an avoidable compromise. The coach needs to pop into the plan, see exactly where the class is, make adjustments, and return to the live timer without the clock ever stopping.

## What Changes

- The planner becomes reachable **while a class is running**, presented as an overlay (right-side drawer on desktop, bottom sheet on mobile) above a still-mounted, still-ticking `LiveClass`.
- The clock **keeps running** while the planner overlay is open; the coach is never forced to pause to edit.
- The planner timeline shows a **live progress indicator** (a horizontal progress line at the playhead position) and highlights the **active block** — but only while a class is actually running. With no class running, the planner behaves exactly as today.
- The playhead is re-anchored from absolute-seconds-from-start to **(active block id, offset within block)**, so edits to non-active blocks have no effect on the coach's current position; editing the active block's duration updates its remaining countdown.
- Edits to time-relevant fields during a run use a **smart + confirm** policy: notes/name/color are always free; duration/reorder/deletes that affect the active or past blocks require explicit confirmation spelling out the consequence; deletes of the active block default to advancing the playhead to the next block.
- A persistent **"return to live" affordance** is available wherever the overlay is open. On entering the planner during a run, the selected block in the editor pre-initializes to the active block.
- **BREAKING**: replaces the existing `class-planning-experience` requirement that forbids the planner from rendering any live-class run state. That prohibition was correct when the planner and live view were mutually exclusive; the two surfaces now intentionally share run state when a class is in progress.

## Capabilities

### New Capabilities
<!-- None. The change extends two existing capabilities rather than introducing a third; the bridging behaviors are natural extensions of each surface. -->

### Modified Capabilities
- `class-planning-experience`: the requirement forbidding the planner from rendering live-class run state (progress line, active-block highlight) is replaced with conditional behavior — render run state while a class is running, suppress it otherwise. A new requirement covers edit semantics during a run (anchoring, confirmation policy).
- `live-class-mode`: new requirements cover the control for opening the planner during a live class, the guarantee that the run continues while the planner is open, and the affordance to return to the live view.

## Impact

- **`src/App.jsx`** — largest change. The exclusive `return <LiveClass />` early-return at line 425 must become a conditional overlay rather than a full-surface swap. Playhead state refactored from absolute seconds (`elapsedTime`, `baseElapsed`, `runStartedAt`) to an identity-anchored model derived per render. `commitPlan` gains run-aware edit guards. `exitLiveMode` semantics split into "pause + leave" (today's behavior) vs. "open planner while running."
- **`src/components/LiveClass.jsx`** — add an "Edit plan" control in the live header; the component must remain mounted and ticking while the planner overlay is open.
- **`src/components/Timeline.jsx`** — accept run-state props (active index, elapsed time) and render the progress line + active-block highlight conditionally.
- **`src/components/TaskBlock.jsx`** — add an `active` visual state distinct from `selected`, reusing the existing accent-ring visual language.
- **New component** — the planner overlay shell (drawer on desktop, bottom sheet on mobile) with backdrop dimming and the persistent "return to live" affordance.
- **`src/App.css`** — overlay, backdrop, progress-line, and mobile bottom-sheet styling; responsive rules extending the existing `min-width: 700px` / `max-width: 699px` breakpoints.
- **Specs** — `class-planning-experience` and `live-class-mode` capability specs both updated.
- **No backend/DB changes** — persistence flow (`commitPlan`) and Supabase schema are unchanged; run-state anchoring is a client-only model.
