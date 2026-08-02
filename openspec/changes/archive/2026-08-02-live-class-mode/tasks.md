## 1. Live Session Timing

- [x] 1.1 Define live-session state for running, paused, and completed modes without changing the existing task/block data shape.
- [x] 1.2 Replace interval-based elapsed-time assumptions with wall-clock-based session timing that pauses and resumes without drift.
- [x] 1.3 Derive the active block, block remaining time, and whole-class remaining time from one clamped session position.
- [x] 1.4 Implement reset behavior that stops the session and returns to the first block with the full planned duration.

## 2. Block Navigation

- [x] 2.1 Implement automatic advancement at block boundaries without adding transition time to the class duration.
- [x] 2.2 Add manual Previous and Next navigation with full-duration entry into the target block and correct boundary handling.
- [x] 2.3 Keep navigation behavior consistent while running or paused, and prevent negative timer values at completion.
- [x] 2.4 Add a short non-blocking visual transition for automatic advancement and a clear final completion state.

## 3. Phone-First Live Surface

- [x] 3.1 Add the dedicated live-mode presentation entered from the existing class start control.
- [x] 3.2 Display the active block name, position, prominent block countdown, secondary whole-class countdown, and active notes.
- [x] 3.3 Display the next block preview and an empty-state treatment when notes or a following block are unavailable.
- [x] 3.4 Add touch-friendly Previous, Pause or Resume, Next, Reset, and leave or completion actions.
- [x] 3.5 Ensure live-mode content fits narrow phone viewports without horizontal scrolling or overlapping controls.

## 4. Verification

- [x] 4.1 Verify timing, pause/resume, reset, automatic advancement, visual transitions, and completion with a multi-block class.
- [x] 4.2 Verify manual navigation from running and paused states, including first-block and final-block boundaries.
- [x] 4.3 Verify notes and next-block content update correctly after automatic and manual navigation.
- [x] 4.4 Verify one-block, empty, and very short classes do not produce invalid timers or unusable controls.
- [x] 4.5 Run the existing lint and build checks and confirm planning interactions and persistence remain intact outside live mode.
