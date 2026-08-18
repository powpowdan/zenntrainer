## Why

The current interface reads as multicolored and cheap, and the cause is structural rather than cosmetic. A random five-color candy palette is assigned to task blocks with no semantic meaning, so color is pure visual noise. A loud lime accent sits on every primary action, reading as energetic rather than professional. Blue-to-green gradient buttons carry the signature of a default template. Underneath all of this there is no Material UI theme at all, so CSS variables, inline styles, MUI `sx` props, and Emotion operate as four parallel styling channels with nothing to enforce coherence. Any purely cosmetic refresh would decay back to "cheap" as soon as the next component is added.

## What Changes

- Establish one Material UI theme as the single source of truth. Design tokens are defined exactly once in `src/theme.js`; the MUI theme consumes them, and `index.css` mirrors them as CSS variables. No raw hex values are permitted anywhere except `theme.js`.
- Adopt a "Blood & Bone" visual identity: near-black surfaces, bone-white text, and a single crimson accent (`#dc2626` family) used with strict discipline.
- Apply monochrome semantics. The only crimson element at rest is the active or running element. Danger is rendered as a crimson outline only, never a fill. Success uses neutral typography and a checkmark, with no green.
- Stop rendering per-task color and remove the color pickers from the add and edit surfaces. The stored `tasks.color` column is retained but ignored, so no data migration is required.
- Move to a tactical corner-radius scale (4 / 6 / 10 px plus pill) and render all time, duration, and count displays in a monospace stack with tabular numerals.
- Fold the currently light-mode login screen into the same dark theme.

## Capabilities

### New Capabilities

- `theme`: A single themed design system covering tokens, palette, semantic color usage, radii, numeric typography, and the discipline that governs where the crimson accent may appear.

### Modified Capabilities

- `class-planning-experience`: Block creation and editing no longer expose a color field, and the accessible color-control scenario is removed.

## Impact

- Adds `src/theme.js` and wires `<ThemeProvider>` plus `<CssBaseline />` in `src/main.jsx`.
- Retokens `src/index.css` and restyles every class in `src/App.css`.
- Sweeps inline styles and hardcoded hex out of `src/App.jsx` and `src/components/{Header,TaskBlock,Timeline,Notes,AddTaskForm,LiveClass}.jsx`.
- Fully restyles `src/Login.jsx` into the dark theme.
- Retains the existing `tasks.color` storage column and the live-class timing contract; no backend, auth, or migration work is in scope.
