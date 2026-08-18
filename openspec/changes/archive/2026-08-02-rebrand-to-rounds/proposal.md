## Why

Two things surfaced after the Blood & Bone redesign. First, the product name no longer fits: the app is generalizing beyond "class" and beyond Muay Thai (the tagline is being shortened to "Sessions"), and "Zenn Class Tracker" reads as both dated and narrow. Second, the planner still carries a live-progress indicator — a moving line and active-block highlight driven by elapsed class time — that made sense when planning and running shared a screen, but live mode is now its own surface. The planner should be a pure planning view; run state belongs only to live mode.

## What Changes

- Rebrand the application to "Rounds" across every surface: header title, login heading, document title, and package name.
- Shorten the header subtitle from "Plan and run Muay Thai sessions" to "Sessions".
- Remove the planner's live-progress indicator: the moving progress line and the active-block highlight. Run state is confined to the live-class surface.
- Preserve mid-class resume by keeping elapsed time internally; `startClass` still resumes from where the coach left off.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `class-planning-experience`: the planner no longer renders live-class run state (progress indicator or active-block highlight); selection remains visually distinct.

## Impact

- Branding strings in `src/components/Header.jsx`, `src/Login.jsx`, `index.html`, and `package.json` (with lockfile regeneration).
- Progress-line removal in `src/components/Timeline.jsx`, the elapsed-time prop in `src/App.jsx`, and now-dead active/highlight code in `src/components/TaskBlock.jsx` and rules in `src/App.css`.
- Out of scope: a new favicon (needs a design asset), renaming the repository folder, any Supabase project rename, and new features.
