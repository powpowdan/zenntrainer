## 1. Sound module

- [x] 1.1 Create `src/sound.js`: module-scoped `Audio` element from imported `./beep.mp3` with `preload = "auto"`; export `unlockAudio()` (muted play → pause → rewind → unmute, swallow rejections) and `playBell(isMuted)` (no-op when muted; reset `currentTime` to 0, play, swallow rejections) per design D1

## 2. Block-change bell

- [x] 2.1 In `src/App.jsx`, call `unlockAudio()` inside `startClass` and `resumeClass` tap handlers per design D2
- [x] 2.2 In `src/App.jsx`, call `playBell(isMuted)` inside the existing `suppressTransition`-gated transition effect (where the "Up next" banner fires) so the bell plays only on natural-progression boundaries, overlay open or not, per design D3

## 3. Completion bell

- [x] 3.1 In `src/App.jsx`, add a `completionBellPlayed` ref; call `playBell(isMuted)` in `updateClock`'s natural-completion branch (where `setIsComplete(true)` happens) guarded by the ref; reset the ref in `startClass` and `resetClass` so "Run again" re-arms it, per design D4

## 4. Mute toggle

- [x] 4.1 In `src/App.jsx`, add `isMuted` state initialized from `localStorage.getItem("liveSoundMuted")`, persist on toggle, and pass `isMuted` + `onToggleMute` to `LiveClass` per design D5
- [x] 4.2 In `src/components/LiveClass.jsx`, add an MUI `IconButton` with `VolumeUp`/`VolumeOff` (aria-labeled) to the running view's `live-header-actions` group per design D6

## 5. Verification

- [x] 5.1 Manual: natural boundary rings the bell (short-duration blocks make this quick); boundary crossed while planner overlay open also rings; manual Next/Previous silent; delete-active-block advance silent
- [x] 5.2 Manual: natural completion rings exactly once; "Run again" → natural completion rings again; edit-forced completion (delete final remaining blocks) silent
- [x] 5.3 Manual: mute toggle silences both cues without affecting timers; unmute restores sound; preference survives a page reload
- [x] 5.4 Run `npm run lint` and fix any findings
