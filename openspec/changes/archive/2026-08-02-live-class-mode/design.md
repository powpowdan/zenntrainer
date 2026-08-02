## Context

The existing app stores an ordered list of task blocks with durations and notes, and derives the active block from a shared elapsed-time value. The current shell combines planning, notes, timeline, and timer controls in one screen, while the timer interval advances a numeric counter independently of wall-clock precision. See `proposal.md` for the motivation and `specs/live-class-mode/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Establish a dedicated live presentation for the coach's phone.
- Keep whole-class and active-block timing synchronized from one live-session position.
- Make automatic advancement and manual navigation predictable at block boundaries.
- Preserve the existing task/block data shape and persistence approach.
- Make the transition state visual-only so it does not extend the planned class.

**Non-Goals:**

- Introducing named class records, dates, sports, or reusable templates.
- Redesigning the planning timeline or add-block workflow beyond what is needed to enter live mode.
- Adding audio alerts, configurable transition lengths, background execution, or notifications.
- Creating a new backend or persistence model.

## Decisions

### Use a dedicated live-mode surface

Live mode should replace the planning-heavy composition while a class is being run, rather than adding more panels to the existing screen. This gives the active timer, notes, and navigation enough space for a phone. The existing builder remains the source for class preparation.

An in-place responsive rearrangement was considered, but it would leave planning controls competing with the live controls and make the coach scan more content during class.

### Treat elapsed class seconds as the session source of truth

The live session should derive the active block and both timer displays from one elapsed class position. Timer updates should be based on elapsed wall-clock time rather than assuming that interval callbacks occur exactly on schedule, preventing drift when the phone is busy. Block boundaries are calculated from the ordered block durations.

Keeping one position avoids independent class and block counters becoming inconsistent after pause, reset, or manual navigation.

### Model manual navigation as block-boundary jumps

Next and Previous move the session to a block boundary. Next enters the following block at its full duration; Previous enters the preceding block at its full duration. This is easier for a coach to reason about than restoring an arbitrary prior elapsed position and makes a correction immediately useful.

When navigation occurs while running, the session continues running. When paused, navigation changes the selected block and timer positions without resuming the session.

### Make transitions a non-blocking visual state

At an automatic boundary, the next block becomes active at the exact planned boundary and a short overlay or visual treatment announces it. The transition is not a separate timed block and does not pause or extend the class clock. Manual controls remain available during the announcement.

An inserted three-second delay was considered, but it would make the actual class longer than the configured plan. Coaches who need setup or rest time can later add an explicit block for it.

### Keep the live hierarchy intentionally narrow

The layout should prioritize, in order: active block countdown, active block name and notes, whole-class remaining time, next block preview, and navigation controls. Secondary planning actions should not be prominent in live mode. Touch targets should be large enough for use while moving around a class.

## Risks / Trade-offs

- [Timer drift or background throttling] -> Calculate position from timestamps and clamp values at block and class boundaries; do not rely solely on incrementing interval callbacks.
- [A transition is missed on a bright or noisy gym floor] -> Make the active block change itself obvious and keep the next block name visible; treat vibration or sound as a later enhancement rather than a dependency.
- [Manual navigation creates an unexpected class-time jump] -> Keep the class countdown derived from the new block boundary and use clear labels for Previous and Next.
- [Very long notes reduce timer visibility] -> Constrain or scroll the notes region while keeping the active countdown fixed and visible.
- [Existing builder behavior regresses when live mode is added] -> Keep live-session state separate from task editing state and verify builder interactions remain available after leaving or resetting live mode.

## Migration Plan

1. Add live-session behavior while retaining the existing task/block representation.
2. Enter live mode from the existing start control and preserve the existing planning view outside a running session.
3. Verify timer, navigation, transition, completion, and narrow-viewport behavior with representative classes.
4. If the live mode is rolled back, remove the live presentation and session behavior while leaving task data and existing persistence untouched.
