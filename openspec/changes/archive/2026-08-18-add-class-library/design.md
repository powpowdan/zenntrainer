## Context

Today `App.jsx` treats a coach's entire `tasks` table slice (or the single `localStorage["savedClass"]` key for guests) as one implicit plan. `fetchTasks` selects all user rows; `persistAuthenticatedPlan` diffs and syncs that flat list with a two-phase position shuffle. The header exposes manual Save/Load through an MUI SpeedDial. There is no class entity, and run state (active task + offset) lives only in memory. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Classes as first-class entities in Supabase and in guest localStorage, with minimal disruption to the existing diff-based persistence engine
- Full autosave for both modes; delete manual save/load code paths
- Silent run-history capture hooked into the existing natural-completion transition
- A migration that stamps every existing coach's rows into one default class with no data loss

**Non-Goals:**
- Cross-device sync of last-opened class (per-device localStorage only)
- Run-history detail pages, per-run block snapshots, templates
- Sharing classes between coaches

## Decisions

### D1: Data model — `classes` + `runs` tables, `class_id` on `tasks`

```sql
classes: id uuid PK, user_id uuid, name text, created_at, updated_at
tasks:   + class_id uuid FK → classes ON DELETE CASCADE
         unique(class_id, position)  (replaces per-user uniqueness intent)
runs:    id uuid PK, class_id FK → classes ON DELETE CASCADE,
         user_id, started_at, finished_at, planned_minutes
```

RLS: coaches read/write only their own `classes`, `tasks` (via class ownership), and `runs`. `tasks` policies join through `classes` for ownership checks.

*Why not a JSON blob per class:* the per-row task model and the existing diff engine survive; a blob would force a rewrite of `persistAuthenticatedPlan` and lose row-level conflict behavior. *Why cascade deletes:* a class without its blocks or orphaned runs are both nonsense states; the DB guarantees what the spec requires.

### D2: The diff engine becomes class-scoped, not rewritten

`fetchTasks` and every query in `persistAuthenticatedPlan` gain `.eq("class_id", currentClassId)`. The insert/delete/update/two-phase-position logic is unchanged. The local-ID map (`persistedIdMap`) resets when switching classes. Duplicate is implemented as insert-class + bulk insert of copied tasks; it does not flow through the diff engine.

### D3: Guest storage shape — one versioned localStorage key

`localStorage["cadenceData"]` replaces `savedClass`:

```json
{ "v": 1,
  "classes": { "<id>": { "id", "name", "createdAt", "updatedAt" } },
  "tasksByClass": { "<id>": [ {name, duration, plan, color, position} ] },
  "runs": [ { "id", "classId", "startedAt", "finishedAt", "plannedMinutes" } ],
  "lastOpenedClassId": "<id>" }
```

Guest mutations write through synchronously in `commitPlan` (localStorage is cheap; no debounce needed). Runs capped at last 20. On load: if `cadenceData` missing but legacy `savedClass` present, migrate it into a default class.

### D4: Last-opened class is per-device localStorage for both modes

`localStorage["cadenceLastClass:<mode>"]` where mode is `user` or `guest`. Auth users get instant boot to their usual class without a DB round-trip or schema column. Fallback when the remembered id no longer exists: first class by created_at, else library modal / seeded class.

*Alternative rejected:* `last_opened_class` column on the user — cross-device sync is a non-goal and it adds a write to every switch.

### D5: Run capture hooks the existing completion transition

The natural-completion branch (where `setIsComplete(true)` and the completion bell fire in the run-clock effect) records the run. `startedAt` is captured when a run starts (fresh start or reset-then-start) and held in a ref; edits mid-run can change total duration, so `plannedMinutes` is snapshotted at run start. Non-natural completion (plan-edit completion) already bypasses that branch, so it records nothing for free.

### D6: Header rebuild — chip switcher, no SpeedDial

Left block: brand, class-name chip (opens library modal), `N blocks · M min · Saved` status line. Right block: Start/Pause/Resume, Reset, plain icon-button exit (replaces SpeedDial, which only held Exit after Save/Load die). The chip shows the class name always — it's the wrong-class guardrail.

### D7: Switching classes mid-run requires confirmation and exits the run

`isRunning` (or paused with progress) + switch attempt → confirm dialog naming that the run is left behind. On confirm: exit live mode, clear run state, load target class. The persistence queue is drained before the swap (auth mode) since in-flight writes target the old class's rows.

### D8: Seeding and sample content

First boot (no classes anywhere): create one class "My first class" (auth: DB row; guest: localStorage) seeded with the rewritten sample plan — Warmup 20, Stretch 10, Technique 10, Cardio 10, Heavy bag 10, Drills 8, Burnout & Stretch 10 — with cleaned-up notes, and open it. Seed happens once per new coach, not per device.

### D9: Migration — server-side SQL for auth, lazy client migration for guests

Auth: SQL migration creates one `class` per user ("My class"), stamps their tasks with it. Idempotent guard: skip users who already own a class. Rollback: the migration only adds nullable FK + new tables; reverting leaves old reads broken, so rollback = fix forward. Guests: D3's lazy migration.

## Risks / Trade-offs

- [Migration misses a coach → data appears lost] → Migration is idempotent and guarded only by class ownership, not a flag; verify with a count query (users with tasks but no class) before release.
- [Two devices editing the same class race] → Existing risk profile, unchanged; last write wins per block row. Not worsened by this change.
- [`unique(class_id, position)` violations during the two-phase shuffle] → The existing `-1000000 - index` staging phase already avoids collisions; constraint uses deferrable behavior or is validated after the second phase. Keep the staging writes in one transaction-equivalent sequence per class.
- [Guest localStorage exceeds limits with many classes] → Trivial at 5-10 classes; runs capped at 20. No action.
- [SpeedDial removal changes muscle memory] → One-time cost; exit remains one tap and confirm-guarded.
- [Run recorded but class deleted later] → Intended cascade; the confirm dialog names it.

## Migration Plan

1. Ship SQL migration (new tables, FK, RLS, backfill) before or with the app deploy — old app ignores new columns/tables safely.
2. Deploy app. Auth coaches transparently see their migrated class.
3. Guests migrate lazily on first load after deploy.
Rollback: revert app deploy; DB additions are inert to the old app. Do not roll back the backfill.

## Open Questions

- Exact confirm-dialog wording for mid-run switches (copy detail, decided during implementation).
