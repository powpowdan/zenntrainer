## Why

Coaches currently have exactly one implicit class plan per account (or one localStorage slot as a guest). A coach who runs several recurring classes — Fundamentals, Sparring Prep, Kids Class — cannot save them side by side; switching workouts means destroying the current plan. This change makes classes first-class entities a coach can save, switch between, duplicate, and track teaching history for.

## What Changes

- Classes become first-class entities with a name, owned by a user (Supabase) or stored per-device (guest localStorage), each with its own ordered block plan.
- New class library modal: list of saved classes with name, block count, total minutes, last-taught date, and times taught; actions to open, create, rename, duplicate, and delete.
- **BREAKING**: Manual "Save plan" and "Load plan" actions are removed. All plans autosave on every mutation for both authenticated and guest modes; the save/saving/error status indicator remains.
- Header redesigned: current class name becomes a switcher chip that opens the library; the SpeedDial menu is replaced by a plain exit action.
- Cold boot: after login/guest choice, returning devices reopen the last-opened class; first-time users land in a seeded sample class.
- Run history: every completed class run is recorded (started at, finished at, planned minutes) and surfaces on library cards as "last taught" and a count. Guests see device-local history.
- Deleting a class cascades its blocks and run history behind an explicit confirmation.
- Sample seed plan content rewritten with cleaner names and notes.

## Capabilities

### New Capabilities
- `class-library`: Saving, switching, creating, renaming, duplicating, and deleting named classes; the library modal UX; per-device last-opened memory; first-boot seeding; and run-history recording with last-taught/count display.

### Modified Capabilities
- `class-planning-experience`: Plan persistence requirements change from manual save/load to full autosave for both modes, and block positions become unique per class instead of per user.
- `live-class-mode`: Completed runs must be recorded as history entries (silent write, no new UI moment).

## Impact

- **Database (Supabase)**: new `classes` and `runs` tables; `tasks` gains `class_id`; migration stamps existing tasks into one default class per user; cascade deletes; RLS policies for the new tables.
- **src/App.jsx**: gains current-class state; `fetchTasks`/`persistAuthenticatedPlan` become class-scoped; guest persistence moves from single-slot `savedClass` localStorage key to a multi-class structure; run-completion hook writes history; manual save/load paths removed.
- **src/components/Header.jsx**: rebuilt — class chip switcher, autosave status, plain exit action; Save/Load/SpeedDial removed.
- **New components**: `LibraryModal` (and supporting class CRUD helpers).
- **Login.jsx**: post-auth flow routes to last-opened class or seeded first class.
- No new npm dependencies.
