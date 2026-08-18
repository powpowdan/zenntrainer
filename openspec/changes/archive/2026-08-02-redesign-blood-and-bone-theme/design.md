## Context

ZennTrainer is a React 19 + Vite application that uses Material UI v7, Emotion, `@hello-pangea/dnd`, and Supabase. Material UI is already a dependency and is used in the planning header, but no `createTheme` or `ThemeProvider` exists anywhere in the source. Styling currently flows through four unrelated channels: CSS custom properties and classes in `index.css` and `App.css`, inline `style` objects on several components, MUI `sx` props that hardcode hex values, and the unused Emotion runtime. Task blocks carry a `color` field that is assigned at random from a five-color palette duplicated across three files. The login screen still uses light-mode inline styles. See `proposal.md` for motivation and `specs/theme/spec.md` for the contract.

## Goals / Non-Goals

**Goals:**

- Make one Material UI theme the only source of truth for color, radius, and typography, consumed by both MUI components and raw CSS.
- Give the product a single coherent "Blood & Bone" identity: near-black surfaces, bone-white text, one crimson accent used with restraint.
- Make the redesign durable by enforcing that no raw hex exists outside `theme.js`.
- Bring every screen, including login, into the same theme.

**Non-Goals:**

- Re-architecting screen layouts, the planning workspace structure, or live-mode behavior; this is a reskin.
- Migrating or removing the stored `tasks.color` column.
- Introducing block categories, templates, or any new feature.
- Changing backend, auth, or Supabase behavior.
- Replacing Material UI with another library or rewriting components that do not need it.

## Decisions

### Make Material UI the single source of truth

Design tokens will be defined once as a plain `tokens` object in `src/theme.js`. `createTheme` will consume that object to produce palette, shape, typography, and component overrides, and `main.jsx` will wrap the application in `<ThemeProvider>` with `<CssBaseline />`. `index.css` will mirror the same token values as CSS custom properties so that raw CSS and any remaining inline styles reference `var(--*)` rather than hex.

Continuing to treat CSS variables and MUI as separate systems was rejected because it is the root cause of the current inconsistency. Introducing a third-party design-tokens pipeline was rejected as disproportionate for a codebase of this size.

### Adopt the Blood & Bone palette and crimson discipline

Surfaces will use a near-black ramp (`#0a0a0b`, `#141416`, `#1b1b1e`) with bone-white text (`#f2f2f0`) and a single crimson accent ramp (`#dc2626` base, `#ef4444` hover or glow, `#7f1d1d` deep fill, `#fff5f5` text on crimson). The crimson accent is reserved for the active timeline block stripe and glow, the moving progress line, the live block accent bar, focus rings, primary actions in a live or running context, and the destructive state of the trash zone while dragging over. Every other element is neutral.

A "Carbon / Stealth" identity built around electric blue was rejected because it reads as a generic productivity tool and loses the martial edge the product wants. A "Disciplined Color" compromise that kept per-block color was rejected because, as long as color is assigned without meaning, no palette can read as professional.

### Use monochrome semantics

Because the accent itself is red, danger and primary action would blur together if danger also used a red fill. Danger will therefore be a crimson outline only, never a fill, so it reads as a warning rather than a primary action. Success will use neutral typography and a checkmark with no green, keeping a single hue across the product.

Allowing red for both primary and danger was rejected on the grounds that a delete affordance glowing red is indistinguishable from a primary action. Introducing a second muted tone such as amber for danger was rejected because it would compromise the single-accent identity.

### Stop rendering per-task color, keep the stored column

The UI will no longer read or render `task.color`, and the color picker controls will be removed from the add-block sheet and the selected-block editor. The `color` column will remain in Supabase and in `localStorage` payloads; it will simply be ignored. New tasks will not be assigned a color.

Purging the column entirely was rejected because it requires a database migration and a `localStorage` resync for no behavioral benefit in this change. Reserving the field for a future category-driven color feature was rejected as speculative; if that feature is wanted later it can be proposed on its own.

### Use a tactical radius scale and monospace numerals

Corner radii will be drawn from a fixed scale: 4 px for inputs and small controls, 6 px for blocks and cards, 10 px for large surfaces, and 999 px for true pill buttons only. All time, duration, and count displays will use a monospace stack with `font-variant-numeric: tabular-nums`; body text will remain `system-ui`.

An austere 0 to 3 px radius set was rejected because it reads as harsh on small touch targets. Keeping the current 10 to 22 px range was rejected because soft corners conflict with the deadly identity. Introducing a display typeface was rejected as unnecessary; monospace numerals alone carry the tactical feel.

## Risks / Trade-offs

- [A theme regression breaks existing Material UI behavior] -> Define tokens and component overrides together, keep MUI default props where they already work, and verify header, speed dial, and inputs after wiring.
- [Removing color rendering confuses existing coaches] -> Differentiate blocks by sequence number, name, and duration typography, and let the active block be the only colored element; the change is a reskin, not a data change.
- [Monochrome semantics hide destructive actions] -> Render danger as a crimson outline with explicit labels and icons, and keep existing confirmation prompts on delete.
- [Hex values leak back in over time] -> Gate completion on a hex audit so `rg "#[0-9a-fA-F]{3,6}" src/` matches only `src/theme.js`.
- [Inline styles resist tokenization] -> Move the heaviest offenders (TaskBlock, AddTaskForm, Login) to themed `sx` or `styled` forms, and leave `var(--*)` as the escape hatch for raw CSS.

## Migration Plan

1. Add `src/theme.js` with tokens, `createTheme`, and Material UI component overrides, then wire `<ThemeProvider>` and `<CssBaseline />` in `main.jsx`.
2. Retoken `index.css` and restyle the base button and input rules so every non-MUI surface reads from CSS variables.
3. Restyle the CSS-driven builder and live surfaces in `App.css`, including removing decorative gradients and recoloring active, selected, progress, and completion states.
4. Sweep each Material UI and inline-styled component file to replace hardcoded hex with theme tokens, remove the color pickers, and recolor primary and danger affordances.
5. Restyle `Login.jsx` into the dark theme.
6. Remove `COLOR_PALETTE`, `getRandomColor`, and visible color from the default seed tasks in `App.jsx`.
7. Run lint and build, perform the hex audit, and walk Login, Builder, Live, and Complete to confirm coherence; roll back by restoring the previous styling while leaving the retained `color` column untouched.

## Open Questions

- Whether a future category-driven color feature should reuse the retained `color` column or introduce a separate `category` field can be decided when that feature is proposed; it does not affect this change.
