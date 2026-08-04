# Cadence

Phone-first class planner and live-run timer for coaches. Build an ordered
session out of timed blocks (warmup, technique, bag work, conditioning, etc.),
attach coaching notes to each block, then run the whole thing live with
per-block and whole-class countdowns. Originally built for Muay Thai, now
generalized for any timed class or session.

Guest mode works offline with local storage, or sign in with email to sync
plans to your own account across devices.

---

## Screenshots

> Place images in `docs/screenshots/` and drop the filenames in below.

| Planner | Live class | Edit plan mid-run |
| --- | --- | --- |
| ![Planner](docs/screenshots/planner.png) | ![Live class](docs/screenshots/live-class.png) | ![Planner overlay](docs/screenshots/planner-overlay.png) |

---

## Features

**Planner workspace**
- Ordered timeline of timed blocks with a class summary (block count + total minutes).
- Full block editor for name, duration, and coaching notes, with validation.
- Add-block sheet and an instructional empty state for fresh plans.
- Responsive layout that stays usable on phone-sized screens without horizontal scrolling.

**Drag-and-drop**
- Reorder blocks by dragging.
- Drag a block to the trash zone at the bottom of the timeline to delete it.

**Live class mode**
- Focused, phone-first run view.
- Independent countdowns for the active block and the remaining whole class.
- Automatic advance to the next block at zero, with a brief non-blocking "up next" transition.
- Manual previous / next controls, plus pause, resume, and reset.
- Completion screen with a clear "class finished" state.

**Edit plan mid-run**
- Open the planner as an overlay without leaving live mode — the clock keeps running.
- Overlay renders as a side drawer on wide screens and full-screen on phones, with the live class countdown in the header.
- Run position is anchored to a block identity plus an offset within it, so editing a non-active block never disturbs the current countdown.
- Destructive run-time edits (deleting the active or a passed block, shortening the active block below elapsed time, reordering the active or passed blocks) require explicit confirmation that names the consequence.

**Persistence**
- Sign in with a magic link to save plans per user with stable, restorable ordering.
- Continue as guest to keep plans in `localStorage`.
- Persistent saved / saving / unsaved / error status indicator with a retry path on failure — failed saves never silently discard your visible edits.

**Accessibility & theming**
- Keyboard-navigable selection and editing, managed dialog focus, and touch-friendly targets.
- Single-source "Blood & Bone" dark design system (one token file, disciplined crimson accent, monospace tabular figures for clocks).

---

## Tech stack

- [React 19](https://react.dev) + [Vite 7](https://vite.dev)
- [Material UI 7](https://mui.com) + Emotion
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) for drag-and-drop
- [Supabase](https://supabase.com) for auth (magic link) and the `tasks` table

---

## Getting started

### Prerequisites

- Node.js (LTS) and npm

### Install

```bash
git clone https://github.com/powpowdan/zenntrainer.git
cd zenntrainer
npm install
```

### Configure environment

The app reads Supabase credentials from env vars. Create a `.env` file in the
project root (it's gitignored) and add:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-anon-key
```

These map to the client created in `src/supabaseClient.js`. You'll need a
Supabase project with a `tasks` table for authenticated saving.

> Want to try it without Supabase? Skip the `.env`, open the app, and choose
> **Continue as guest** — plans persist to `localStorage` instead.

### Run

```bash
npm run dev
```

Vite serves the app with `--host` so it's reachable on your phone over the
local network — handy for testing the phone-first layouts.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server (network-accessible) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Project structure

```
src/
├─ App.jsx                 # App shell, run clock, persistence, plan state
├─ main.jsx                # React root + MUI ThemeProvider/CssBaseline
├─ theme.js                # Single source of truth for design tokens
├─ supabaseClient.js       # Supabase client from env vars
├─ Login.jsx               # Magic-link login + guest entry
├─ index.css / App.css     # Global styles
└─ components/
   ├─ Header.jsx           # Top bar: start/pause/reset, save/load, status
   ├─ Timeline.jsx         # Ordered timeline, drag reorder, trash drop
   ├─ TaskBlock.jsx        # A single block on the timeline
   ├─ Notes.jsx            # Selected-block editor (name/duration/notes)
   ├─ AddTaskForm.jsx      # Add-block sheet
   ├─ LiveClass.jsx        # Phone-first live run view
   └─ PlannerOverlay.jsx   # Mid-run planner overlay (drawer / fullscreen)
```

---

## How it works

1. **Plan** — In the planner, add timed blocks and attach coaching notes.
   Reorder by dragging; the class summary updates live.
2. **Run** — Hit **Start** to enter live mode. The active block counts down
   alongside the whole-class remaining time; blocks advance automatically with
   a short transition, or jump manually with previous/next.
3. **Adjust mid-run** — Open **Edit plan** to tweak notes or structure without
   stopping the clock. Only edits that affect the run position prompt for
   confirmation; everything else applies immediately.
