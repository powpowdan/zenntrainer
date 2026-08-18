## 1. Rebrand

- [x] 1.1 Change the header title in `src/components/Header.jsx` from "Zenn Class Tracker" to "Rounds".
- [x] 1.2 Change the login heading in `src/Login.jsx` from "ZennClass" to "Rounds".
- [x] 1.3 Change the document title in `index.html` from "zenntrainer" to "Rounds".
- [x] 1.4 Change the package name in `package.json` from "zenntrainer" to "rounds" and regenerate the lockfile.

## 2. Tagline

- [x] 2.1 Change the header subtitle in `src/components/Header.jsx` from "Plan and run Muay Thai sessions" to "Sessions".

## 3. Planner Progress Sever

- [x] 3.1 In `src/components/Timeline.jsx`, remove the `elapsedTime` prop, the `progressPx` computation, the `isActive` highlight logic, and the `.timeline-progress-line` element.
- [x] 3.2 In `src/App.jsx`, stop passing `elapsedTime` to `<Timeline>`; keep elapsed state so `startClass` can still resume.
- [x] 3.3 In `src/components/TaskBlock.jsx`, remove the now-dead `highlight` prop and the active-branch styling, leaving normal and selected states only.
- [x] 3.4 In `src/App.css`, remove the dead `.timeline-progress-line` and `.task-block-active` rules.

## 4. Verify

- [x] 4.1 Run `npm run lint` and `npm run build` and confirm both are clean.
- [x] 4.2 Confirm the hex audit still matches only `src/theme.js`.
- [x] 4.3 Walk Login, Builder, and Live to confirm the "Rounds" name, the "Sessions" tagline, the absence of the planner progress line and active highlight, and that a mid-class exit followed by Start still resumes.
