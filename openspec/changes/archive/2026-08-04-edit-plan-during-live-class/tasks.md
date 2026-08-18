## 1. Identity-anchored playhead refactor (behavior-preserving)

This group changes the playhead model without adding any new UI. Every existing live-mode behavior must remain unchanged after this group lands.

- [x] 1.1 Add `activeTaskId` and `offsetWithinBlock` state to `App.jsx`; remove `elapsedTime` and `baseElapsed` as sources of truth (derive `elapsedTime` on each render from `activeTaskId` + `offsetWithinBlock` + tasks preceding the active block)
- [x] 1.2 Rewrite the clock interval (`App.jsx:96-118`) to advance `offsetWithinBlock` while running, advance `activeTaskId` and reset offset on block boundary, and fire `isComplete` when the final block's offset reaches its duration
- [x] 1.3 Rewrite `startClass`, `pauseClass`, `resumeClass`, `resetClass` to read/write the anchor instead of absolute seconds
- [x] 1.4 Rewrite `moveToBlock`, `moveNext`, `movePrevious` to set `activeTaskId` to the target block and `offsetWithinBlock` to 0
- [x] 1.5 Convert `activeIndex` derivation to identity-first (find the index of `activeTaskId` in the current task list); fire the transition toast (`App.jsx:144-168`) on `activeTaskId` change rather than on `activeIndex` change
- [x] 1.6 Manually exercise every existing live-mode flow (start, pause, resume, reset, next, prev, boundary auto-advance, transition toast, completion) and confirm none regressed before proceeding to group 2

## 2. Break the exclusive live-mode early-return

- [x] 2.1 Add `isPlannerOverlayOpen` state to `App.jsx`
- [x] 2.2 Replace the exclusive `return <LiveClass />` (`App.jsx:425-444`) with always-mounted `LiveClass` plus a conditional render of the planner overlay when `isPlannerOverlayOpen` is true
- [x] 2.3 Add an "Edit plan" control in the live header (`LiveClass.jsx`) that sets `isPlannerOverlayOpen=true` without pausing the clock
- [x] 2.4 Wire overlay dismissal (backdrop tap, X, and "Return to live" affordance) to set `isPlannerOverlayOpen=false` without altering run state
- [x] 2.5 On overlay open during a run, set `selectedTaskId` to `activeTaskId` so the editing surface lands on the active block

## 3. Run-position rendering in the planner

- [x] 3.1 Pass `isRunning`, `activeTaskId`, and `elapsedTime` (or the active block's offset) down to `Timeline` and `TaskBlock` as run-state props
- [x] 3.2 Add an `active` prop to `TaskBlock` and render an accent left-edge bar plus subtle accent tint that is visually distinct from the existing `selected` ring/fill
- [x] 3.3 Add a progress-line element in `Timeline` positioned at `y = elapsedTime * PIXELS_PER_MINUTE` relative to the timeline content; render only when `isRunning` is true
- [x] 3.4 Confirm the active and selected treatments compose readably when both apply to the same block (the initial overlay-entry case)

## 4. Edit-during-run guards in `commitPlan`

- [x] 4.1 Add a run-aware classifier in `commitPlan` (`App.jsx:275`) that bins each mutation as free (name/notes edit, add-to-end, reorder of purely-future blocks, delete of purely-future blocks) or confirming (active duration change, reorder involving active or past blocks, delete of active block, delete of any past block)
- [x] 4.2 Wire `window.confirm` prompts (reusing the pattern at `App.jsx:325`) for confirming-class mutations, with copy that names the consequence
- [x] 4.3 Implement active-block deletion semantics: on confirm, advance `activeTaskId` to the block now occupying that position, or set `isComplete` if the deleted block was the final remaining block
- [x] 4.4 Verify the identity-anchor invariants from the `class-planning-experience` spec hold across each edit type: non-active duration change, active duration change (preserve offset), reorder (carry active with it), delete active, delete past, delete future

## 5. Overlay surface: desktop drawer + mobile sheet

- [x] 5.1 Create a `PlannerOverlay` component shell that renders its children with a backdrop
- [x] 5.2 Desktop (wide viewport): render the overlay as a right-side drawer over a dimmed live view
- [x] 5.3 Mobile (`max-width: 699px`): render the overlay as a bottom sheet in a partial-height default state that leaves the live class clock visible above it, with a drag handle
- [x] 5.4 Include a persistent "Return to live" affordance in the overlay header
- [x] 5.5 Add responsive rules in `App.css` extending the existing `min-width: 700px` / `max-width: 699px` breakpoints; ensure primary planner actions remain reachable without horizontal scrolling on both form factors

## 6. Verification

- [x] 6.1 Walk through each scenario in `specs/class-planning-experience/spec.md` and `specs/live-class-mode/spec.md` against the implementation and confirm each passes
- [x] 6.2 Run `openspec validate edit-plan-during-live-class --strict` and resolve any reported issues
- [x] 6.3 Smoke-test on a phone-sized viewport (DevTools device mode or real device): drawer becomes sheet, live clock stays visible while editing, no horizontal scroll, return-to-live works
