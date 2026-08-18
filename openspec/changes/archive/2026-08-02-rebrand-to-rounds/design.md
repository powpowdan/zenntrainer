## Context

The Blood & Bone visual redesign is archived, leaving a single themed design system and the `theme` capability in the main specs. The application still carries its original name, "Zenn Class Tracker", and the planner still renders a live-progress indicator that predates live mode becoming a separate screen. See `proposal.md` for motivation and `specs/class-planning-experience/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Rebrand the product to "Rounds" consistently across every user-visible surface and the package manifest.
- Make the planner a pure planning view by removing live-class run state (progress line and active-block highlight).
- Preserve the ability to resume a paused class from where it was left.

**Non-Goals:**

- Designing or shipping a new favicon or logo (needs a separate design asset).
- Renaming the repository folder or any Supabase project.
- Changing live-class timing, navigation, transitions, or completion semantics.
- Adding block categories, templates, or any new feature.

## Decisions

### Rebrand to "Rounds"

The application will be named "Rounds" everywhere it appears: the header title, the login heading, the document `<title>`, and the `package.json` name. The word names the core unit of every session, is sport-agnostic now that the tagline is being generalized, and matches the sleek identity established by the Blood & Bone redesign.

Keeping the "Zenn" brand with an evolved suffix (for example "Zenn Rounds" or "Zenn Sessions") was rejected because the clunky "Class Tracker" portion is the problem and the brand carries no established equity worth preserving in this codebase. "Bell" and "Cadence" were considered as alternatives; "Bell" was rejected as too fight-specific and "Cadence" as less direct than the session unit itself.

### Shorten the tagline to "Sessions"

The header subtitle will change from "Plan and run Muay Thai sessions" to "Sessions". The title above it already conveys purpose, and dropping the sport keeps the product open to any session-based coaching.

### Sever the planner from live-class run state

The planner will stop rendering the moving progress line and the active-block highlight. `Timeline` will no longer receive or use `elapsedTime`, so neither the progress line nor the per-block `isActive` computation will run in the planner. The now-dead `highlight` path on `TaskBlock` and the related CSS rules will be removed. Live-class timing state is confined to the live-class surface.

Elapsed time will continue to be held internally in `App.jsx` so that `startClass` can still resume a paused class mid-flight; only the rendering of run state in the planner is removed.

A minimal change that removed only the progress line but kept the active-block highlight was rejected because it leaves the planner looking half-running after a mid-class exit. Resetting elapsed time on exit was rejected because it destroys mid-class resume, which remains useful behavior.

## Risks / Trade-offs

- [Removing the active highlight hides which block is "current" in the planner] -> Intentional: the planner is for planning, the live surface owns run state, and selection remains visually distinct for editing.
- [Rebrand breaks a link or reference] -> Audit all user-visible strings and the manifest; the rename touches only display text and the package name.
- [Resume regresses after the sever] -> Keep elapsed time in `App.jsx` and verify the exit-live then start-again resume path.
- [Dead active/highlight code lingers in TaskBlock] -> Remove the `highlight` prop and active branch as part of this change.

## Migration Plan

1. Update the branding strings and package name, regenerate the lockfile, and verify lint and build.
2. Remove the progress line and active-block highlight from the planner, stop passing elapsed time to `Timeline`, and delete the dead `highlight` path and CSS rules.
3. Verify lint and build, confirm no regressions in planning flows, and confirm a mid-class exit followed by Start still resumes.

## Open Questions

- None.
