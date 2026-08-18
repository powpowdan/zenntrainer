## Why

During a live class the coach is watching athletes, not the screen. Block changes that happen through natural time progression are currently visual-only, so a missed glance means a missed transition. An audible cue at each natural block change — and at natural class completion — lets the coach run the class by ear.

## What Changes

- Play a bell sound (`src/beep.mp3`, already in the repo) when the active block changes through natural time progression, including boundaries crossed while the planner overlay is open.
- Play the same bell when the class completes through natural time progression of the final block.
- No sound when the coach manually navigates (Next/Previous) or when a plan edit forces the run to advance or complete — only natural progression is audible.
- Add a mute toggle to the live view header that silences all live-class sounds, persisted across sessions.
- Unlock browser audio inside the Start/Resume taps to satisfy autoplay policies.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `live-class-mode`: The automatic-block-advance requirement changes from a visual-only transition to a non-blocking audio-visual transition (bell on natural boundaries only, silent on manual/edit-forced changes). The pause/resume/reset/completion requirement gains a natural-completion bell (silent on edit-forced completion). A new requirement adds the persisted mute control.

## Impact

- `src/sound.js` (new) — module-scoped audio element, unlock helper, play helper.
- `src/App.jsx` — unlock on start/resume, bell hooks into the existing transition effect and the timer's natural-completion branch, mute state + persistence.
- `src/components/LiveClass.jsx` — mute toggle button in the live header.
- `src/beep.mp3` — imported as a bundled asset (no move needed).
- No timer, geometry, plan-persistence, or data-model changes.
