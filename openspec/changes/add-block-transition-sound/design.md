## Context

See proposal.md - Why. Natural block changes flow through the timer's `updateClock` loop in `App.jsx`, which updates `activeTaskId`; a dedicated effect watches `activeTaskId` and shows the "Up next" banner only when `suppressTransition` is false — manual navigation (`moveToBlock`) and edit-forced advances (`advanceActiveTo`) both set that flag, so the flag already distinguishes natural from coerced changes. Natural completion has its own branch in `updateClock` (final block reaches zero → `setIsComplete(true)`), separate from the transition effect. The bell asset exists at `src/beep.mp3` (~46KB MPEG audio).

## Goals / Non-Goals

**Goals:**
- One bell sound for natural block changes and natural class completion; silence for everything coerced (manual nav, plan-edit advances, edit-forced completion).
- Mute toggle in the live view that silences all cues and persists across sessions.
- Works on iOS/Android browsers despite autoplay policies.

**Non-Goals:**
- No distinct end-of-class sound asset (same bell; a different one can be swapped in later).
- No volume control, vibration, or speech output.
- No changes to timing, transition timing, plan persistence, or live view layout beyond the toggle button.

## Decisions

### D1: One module-scoped HTMLAudioElement over the imported asset

`src/sound.js` creates a single `new Audio(beepUrl)` (Vite-bundled, hashed) with `preload = "auto"`, plus two exports: `unlockAudio()` and `playBell(isMuted)`. `playBell` is a no-op when muted; otherwise it resets `currentTime = 0` (so back-to-back cues restart cleanly) and calls `.play()`, swallowing rejections. Module scope sidesteps React lifecycle issues; one element means one decode and instant replays.

- Alternatives rejected: *Web Audio synthesis* — user supplied a real bell asset; *per-play `new Audio()`* — re-fetches/decodes and complicates unlock; *`AudioContext`* — heavier API for a single fixed sample.

### D2: Autoplay unlock inside the Start and Resume taps

Browsers only allow audio after a user gesture. `startClass` and `resumeClass` are direct tap handlers, so `unlockAudio()` runs there: play muted → pause → rewind → unmute. Silent, invisible, one-time per page load (iOS may re-suspend after interruptions, hence Resume too).

### D3: Block bell rides the existing transition effect

Call `playBell(isMuted)` inside the same `suppressTransition`-gated effect that shows the "Up next" banner (`App.jsx` ~170-197). Natural-only semantics come free from the existing flag, bell and banner always fire together, and boundaries crossed while the planner overlay is open are covered because the effect is part of App, not the live view.

- Alternative rejected: *watching `activeTaskId` changes in a new effect* — would need to re-derive the natural-vs-coerced distinction that the flag already encodes.

### D4: Completion bell inside the natural-completion branch, guarded by a ref

Call `playBell(isMuted)` in `updateClock`'s final-block branch right where `setIsComplete(true)` happens. A `completionBellPlayed` ref (reset in `startClass` and `resetClass`) guarantees exactly-once per run — the timer's immediate invocation plus interval ticks, and React dev-mode double effect runs, all hit the same guard. Edit-forced completion (`advanceActiveTo`'s empty-plan branch) never enters this path, so it stays silent by construction.

### D5: Mute state in App, persisted to localStorage

`isMuted` state initialized from `localStorage.getItem("liveSoundMuted")`, written on every toggle — same pattern as the existing `savedClass` persistence. Passed to `LiveClass` with a toggle handler; `isMuted` also read by both bell call sites.

### D6: Toggle button in the live header

`IconButton` with `VolumeUp`/`VolumeOff` from `@mui/icons-material` (already a dependency), placed in the existing `live-header-actions` group next to "Edit plan" and "Exit", with an `aria-label`. Shown only in the running live view, not on the complete screen (nothing left to hear) nor in the empty state.

## Risks / Trade-offs

- [iOS suspends audio after tab backgrounding or device lock] → inherent web-app limitation; the run continues and the banner still shows. Unlock-on-resume (D2) recovers after foregrounding. Documented, not fixable in-app.
- [First boundary arrives before the asset finishes loading] → 46KB bundled locally with `preload = "auto"`; unlock-on-start also starts the fetch at class start. Negligible.
- [Rapid boundary→completion sequence overlaps rings] → `currentTime = 0` restart (D1) truncates rather than stacks.
- [StrictMode double-invoke double-rings] → ref guard (D4) for completion; the transition effect's banner logic is replace-on-fire so the bell call inside it fires once per actual change.

## Migration Plan

Additive feature; single revert removes it. No data migrations — the localStorage key simply won't exist for prior users (defaults to unmuted).

## Open Questions

None.
