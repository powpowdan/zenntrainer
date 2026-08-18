## 1. Theme Foundation

- [x] 1.1 Create `src/theme.js` exporting a `tokens` object (surfaces, text, borders, crimson ramp, radii, typography) and a `theme` built with `createTheme` that consumes those tokens and adds Material UI component overrides for Button, Paper, AppBar, Input, and SpeedDial.
- [x] 1.2 Wrap the application in `<ThemeProvider theme={theme}>` with `<CssBaseline />` in `src/main.jsx`.
- [x] 1.3 Rewrite the `:root` block in `src/index.css` to mirror the tokens as CSS variables, retire `--accent-lime`, `--accent-success`, and `--accent-primary`, and restyle the base `button` and `input` rules to reference tokens.
- [x] 1.4 Confirm that no raw hex values exist outside `src/theme.js` by running a hex audit across `src/`.

## 2. Core Surfaces (CSS-driven)

- [x] 2.1 Restyle every class in `src/App.css` to reference tokens: replace decorative lime and blue radial gradients with flat or subtly highlighted surfaces.
- [x] 2.2 Recolor active and selected timeline states, the progress line treatment, and completion marks so the only crimson at rest is the active element; render Save and secondary actions as neutral bone fills or outlines.
- [x] 2.3 Apply the 4 / 6 / 10 px radius scale and add a monospace `tabular-nums` stack to every clock, duration, and count display class.
- [x] 2.4 Restyle `src/Login.jsx` fully into the dark theme, removing the light-mode `#ccc` borders and inline hex.

## 3. Component Sweep

- [x] 3.1 In `src/components/Header.jsx`, replace every hardcoded hex `sx` value with theme tokens and make the Start button crimson while running and neutral otherwise; theme the SpeedDial and its actions.
- [x] 3.2 In `src/components/TaskBlock.jsx`, replace the colored `borderLeft` with a neutral hairline, make the active block use a crimson stripe and glow, make the selected block use a crimson outline, and move inline styles to themed `sx` or `styled` forms.
- [x] 3.3 In `src/components/Timeline.jsx`, recolor the progress line crimson, remove the blue radial surface gradient, and make the trash zone neutral at idle and crimson only while dragging over.
- [x] 3.4 In `src/components/Notes.jsx`, remove the color picker fieldset, theme the editor surfaces, and render the Save action as a neutral bone fill.
- [x] 3.5 In `src/components/AddTaskForm.jsx`, remove the blue-to-green gradient from the trigger and submit controls, remove the color picker, and theme the inputs, sheet, and scrim.
- [x] 3.6 In `src/components/LiveClass.jsx`, drive `--block-accent` from the crimson token for the active block only, remove the lime radial gradient, make primary live buttons crimson, and render the completion mark as neutral.

## 4. Data Cleanup

- [x] 4.1 In `src/App.jsx`, remove `COLOR_PALETTE` and `getRandomColor`, stop assigning a visible color when creating tasks, and drop visible color from the default seed tasks while leaving the `color` property untouched on the data model.

## 5. Verify

- [x] 5.1 Run `npm run lint` and `npm run build` and confirm both are clean.
- [x] 5.2 Confirm the hex audit matches only `src/theme.js`.
- [x] 5.3 Walk Login, Builder, Live, and Complete on a desktop and a phone-sized viewport to confirm the product reads as one coherent identity, then regression-check planning persistence and live-class start, pause, reset, completion, and exit flows.
