## Purpose

This capability defines a single themed design system for the application so that every screen, component, and future addition draws color, radius, typography, and semantic meaning from one source of truth. It establishes the "Blood & Bone" identity and the discipline that governs where the crimson accent may appear.

## ADDED Requirements

### Requirement: One source of truth for design tokens

The system SHALL define every color, radius, and typography token exactly once in `src/theme.js`. Every other file SHALL reference tokens through the Material UI theme object or through CSS variables, and raw hex values SHALL NOT appear outside `src/theme.js`.

#### Scenario: Hex audit passes

- **WHEN** the source tree is searched for hex color literals
- **THEN** matches are found only inside `src/theme.js`

#### Scenario: Legacy accent tokens are retired

- **WHEN** the source tree is searched for `--accent-lime`, `--accent-success`, or `--accent-primary`
- **THEN** no definitions or usages remain

### Requirement: The application is wrapped by the Material UI theme

The application SHALL render inside a Material UI `ThemeProvider` backed by the project theme and SHALL include `CssBaseline` so that baseline styles and backgrounds follow the theme.

#### Scenario: Theme is wired at the root

- **WHEN** the application boots
- **THEN** `src/main.jsx` mounts the application inside `<ThemeProvider theme={theme}>` with `<CssBaseline />`

### Requirement: The Blood & Bone palette governs every surface

The system SHALL use a near-black surface ramp (`#0a0a0b`, `#141416`, `#1b1b1e`), bone-white text (`#f2f2f0`), and a single crimson accent ramp (`#dc2626` base, `#ef4444` hover or glow, `#7f1d1d` deep fill, `#fff5f5` text on crimson). No other hue SHALL be used to brand, accent, or distinguish chrome.

#### Scenario: Surfaces follow the neutral ramp

- **WHEN** any application surface, card, or modal is rendered
- **THEN** its background, border, and text colors are drawn from the token ramp rather than from per-component hex

### Requirement: The crimson accent is used with discipline

At rest, the only crimson elements on screen SHALL be the active or running element: the active timeline block stripe and glow, the moving progress line, the live block accent bar, and focus rings. Primary actions in a live or running context MAY use a crimson fill. Idle task blocks SHALL render a neutral hairline rather than a colored stripe.

#### Scenario: Idle block is not colored

- **GIVEN** a task block that is neither active nor selected
- **WHEN** the block renders on the timeline
- **THEN** its accent edge is a neutral hairline, not a crimson stripe

#### Scenario: Active block carries the accent

- **WHEN** a block becomes the active or running block
- **THEN** its stripe and glow render in crimson and it is the only crimson element at rest

### Requirement: Semantic meaning is monochrome

The system SHALL NOT use hue to signal success. Danger SHALL be rendered as a crimson outline only and SHALL NOT use a crimson fill. The only filled crimson elements SHALL be primary actions in a live or running context.

#### Scenario: Destructive affordance is outlined

- **WHEN** a delete or destructive control is rendered
- **THEN** it uses a crimson outline with an explicit label or icon and does not use a crimson background fill

#### Scenario: Completion is not green

- **WHEN** a class completes
- **THEN** the completion mark and messaging are neutral and contain no green

### Requirement: Per-task color is not rendered or edited

The system SHALL NOT render a task's stored `color`, and color picker controls SHALL NOT appear in the add-block or edit-block surfaces. The underlying `tasks.color` storage column MAY be retained without being read.

#### Scenario: Stored color is ignored

- **GIVEN** a task whose stored `color` is non-empty
- **WHEN** the task renders on the timeline or in live mode
- **THEN** its appearance is identical to a task whose `color` is empty

#### Scenario: No color control is offered

- **WHEN** the coach opens the add-block sheet or the selected-block editor
- **THEN** no color picker is present

### Requirement: A tactical radius scale is applied

Corner radii SHALL be drawn from a fixed scale: 4 px for inputs and small controls, 6 px for blocks and cards, 10 px for large surfaces, and 999 px for pill-shaped buttons only. Controls SHALL NOT use arbitrary radii outside this scale.

#### Scenario: Radii are consistent

- **WHEN** any control, card, or surface is rendered
- **THEN** its corner radius is one of the four scale values

### Requirement: Numeric displays use monospace tabular figures

All time, duration, and count displays SHALL render in a monospace font stack with `font-variant-numeric: tabular-nums`. Body and label text SHALL remain in the `system-ui` stack.

#### Scenario: Clocks align

- **WHEN** the live block clock, class-remaining clock, or any duration or count is displayed
- **THEN** the numerals render in a monospace stack with tabular figures

### Requirement: The login screen joins the theme

The login screen SHALL use the same dark surfaces, tokens, component styling, and focus treatment as the rest of the application. Light-mode fallback styling SHALL NOT be present.

#### Scenario: Login is dark and on-theme

- **WHEN** the login screen is displayed
- **THEN** it uses the near-black surface ramp, themed inputs and buttons, and contains no light-mode borders such as `#ccc`
