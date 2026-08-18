## 1. Database

- [x] 1.1 Create `classes` table (id, user_id, name, created_at, updated_at) with RLS restricting coaches to their own classes
- [x] 1.2 Create `runs` table (id, class_id FK cascade, user_id, started_at, finished_at, planned_minutes) with RLS
- [x] 1.3 Add `class_id` FK to `tasks` (nullable, cascade), add `unique(class_id, position)` compatible with the two-phase position staging, extend `tasks` RLS to check ownership via `classes`
- [x] 1.4 Write idempotent backfill migration: one default class per user who owns tasks, stamp their task rows with it; verify no user with tasks is left classless

## 2. Guest storage layer

- [x] 2.1 Implement `cadenceData` localStorage schema (classes, tasksByClass, runs capped at 20, lastOpenedClassId) with read/write/migrate helpers
- [x] 2.2 Lazy-migrate legacy `savedClass` data into a default class on first load; remove direct `savedClass` reads/writes from App.jsx

## 3. Class state and persistence in App.jsx

- [x] 3.1 Add `currentClassId` state plus class CRUD helpers (create, rename, delete, duplicate) for auth and guest modes
- [x] 3.2 Scope `fetchTasks` and all `persistAuthenticatedPlan` queries to the current class; reset `persistedIdMap` on class switch; keep the diff/staging logic intact
- [x] 3.3 Route guest mutations through write-through autosave in `commitPlan`; delete manual `savePlan`/`loadPlan` guest paths
- [x] 3.4 Implement duplicate-class (insert class + bulk-insert copied blocks) and delete-class (confirm, cascade, clear run state) flows for both modes

## 4. Class switching and boot

- [x] 4.1 Implement last-opened-class memory (per-device, per-mode) with fallback: first class by created_at, else library/seed path
- [x] 4.2 Implement first-boot seeding: create "My first class" with the rewritten sample plan (cleaned names/notes) for brand-new coaches, once per coach
- [x] 4.3 Implement class switching: load target class's blocks, drain persistence queue first (auth), confirm and abandon any in-progress run, exit live mode on switch

## 5. Run history

- [x] 5.1 Capture `startedAt` and `plannedMinutes` at run start; record a run entry in the natural-completion branch only (no entry for plan-edit completion); write to `runs` (auth) or device storage (guest)
- [x] 5.2 Expose per-class last-taught date and times-taught to the library UI from `runs` (auth) or device runs (guest)

## 6. UI

- [x] 6.1 Build `LibraryModal`: list of classes with name, block count, total minutes, last-taught/never-run, times taught; actions open, new class (with name input), rename, duplicate, delete-with-confirm; empty state for coaches with no classes
- [x] 6.2 Rebuild Header: class-name chip (opens library) + blocks/min/status line; keep Start/Pause/Resume and Reset; replace SpeedDial with a plain exit icon button; remove Save/Load actions and props
- [x] 6.3 Wire post-login/guest flow: open last class, or library modal / seeded class for first-time coaches; handle remembered-class-deleted fallback
- [x] 6.4 Style the chip, modal, and header for phone-sized screens per existing theme; verify no horizontal scrolling

## 7. Verification

- [x] 7.1 Manual pass: create, rename, duplicate, delete, and switch classes as auth and as guest; confirm migrations for both modes; confirm autosave indicator states (saved/saving/unsaved/error + retry)
- [x] 7.2 Run-history pass: complete a run naturally (entry recorded), abandon a run (no entry), complete via plan edit (no entry); confirm last-taught/count update on library cards
- [x] 7.3 Run `npm run lint` and build; fix any failures
