# live-class-mode Specification

## Purpose

This capability gives a coach a focused phone-first view for running an existing class sequence, combining reliable class timing, block timing, notes, and safe navigation during a live session.
## Requirements
### Requirement: Live class view presents the active class clearly

The system SHALL provide a live class view that identifies the class session, current block position, active block name, active block notes, and next block when one exists. The view SHALL prioritize glanceable use on a phone and SHALL keep live controls accessible without requiring the coach to return to the planning view.

#### Scenario: Coach starts a class with multiple blocks
- **WHEN** the coach starts a class containing multiple blocks
- **THEN** the live view shows the first block as active, its notes, the total class duration or remaining time, and the next block preview

#### Scenario: Active block has no notes
- **WHEN** the active block has no coach notes
- **THEN** the live view preserves the active block layout and shows an empty-state prompt or equivalent indication rather than displaying stale notes from another block

### Requirement: Live view tracks class and block time independently

The system SHALL show a countdown for the active block and a separate countdown for the remaining planned class duration. The class countdown SHALL equal the sum of the active block's remaining duration and all following blocks' durations, excluding visual transition time. Pausing SHALL preserve both countdowns.

#### Scenario: Class is running within a block
- **WHEN** a class is running and the active block has remaining duration
- **THEN** both the active block countdown and whole-class countdown decrease with elapsed time

#### Scenario: Coach pauses during a block
- **WHEN** the coach pauses the class
- **THEN** both countdowns stop at their current values and resume from those values when the coach resumes

### Requirement: Blocks advance automatically with a visual-only transition

The system SHALL automatically make the next block active when the current block reaches zero. At the boundary, the system SHALL show a short, non-blocking visual transition identifying the next block. The transition SHALL NOT add time to the planned class duration or prevent the coach from using live controls.

#### Scenario: Current block reaches zero with a following block
- **WHEN** the active block reaches zero while another block follows it
- **THEN** the next block becomes active, its countdown begins at its configured duration, and a short visual transition identifies the newly active block

#### Scenario: Current block reaches zero for the final block
- **WHEN** the final active block reaches zero
- **THEN** the live view enters a class-complete state instead of attempting to activate a nonexistent block

### Requirement: Coach can manually navigate blocks

The system SHALL provide previous and next controls in live mode. Next SHALL immediately activate the following block when one exists. Previous SHALL immediately activate the preceding block at its full configured duration when one exists. Navigation SHALL update the active block, block countdown, class countdown, notes, and next-block preview consistently.

#### Scenario: Coach skips to the next block
- **WHEN** the coach presses Next while a following block exists
- **THEN** the following block becomes active immediately and its countdown starts at the full configured duration

#### Scenario: Coach returns to the previous block
- **WHEN** the coach presses Previous while a preceding block exists
- **THEN** the preceding block becomes active immediately with its full configured duration

#### Scenario: Coach presses a boundary navigation control
- **WHEN** the coach presses Previous on the first block or Next on the final block before completion
- **THEN** the system leaves the active block unchanged and keeps the live view usable

### Requirement: Live mode supports pause, resume, reset, and completion

The system SHALL expose pause or resume, reset, and completion behavior without losing the current class sequence or its notes. Reset SHALL return the live session to the first block with the full planned class duration. The completion state SHALL make it clear that the planned class has ended and SHALL provide a way to reset or leave live mode.

#### Scenario: Coach resets a running class
- **WHEN** the coach presses Reset during a live class
- **THEN** timing stops, the first block is selected, both timers return to their full planned values, and the first block's notes are shown

#### Scenario: Coach reaches class completion
- **WHEN** the final block completes
- **THEN** the system shows a completion state with no negative timer values and offers reset or an action to leave live mode

### Requirement: Live controls remain usable on phone-sized screens

The system SHALL lay out the live view and its controls for touch use on small phone screens. Primary timing, active notes, and navigation controls SHALL remain readable without horizontal scrolling.

#### Scenario: Coach uses live mode on a narrow phone viewport
- **WHEN** the live view is displayed on a phone-sized viewport
- **THEN** the active block timer, class timer, notes, and primary controls fit within the viewport without horizontal scrolling or overlapping controls

### Requirement: Coach can open the planner without leaving a live class

The system SHALL provide a control in the live class view that opens the planner as an overlay above the live view. Opening the planner SHALL NOT pause the class clock; the run SHALL continue while the planner overlay is open, including across block boundaries.

#### Scenario: Coach opens the planner from the live view
- **WHEN** the coach activates the planner-opening control during a running class
- **THEN** the planner appears as an overlay above the live view and the class clock continues running

#### Scenario: Active block advances while the planner overlay is open
- **WHEN** the active block reaches zero while the planner overlay is open
- **THEN** the next block becomes active, the visual transition fires, and the planner's run-position indicator advances to the new active block without coach intervention

### Requirement: Coach can dismiss the planner overlay and return to the live view

The system SHALL provide a persistent affordance to dismiss the planner overlay and return to the full live class view. Dismissing the overlay SHALL NOT alter the run state. When the planner overlay is opened during a run, the editing surface's selected block SHALL initialize to the active block so the coach lands on their current position.

#### Scenario: Coach returns to the live view
- **WHEN** the coach activates the return-to-live affordance or dismisses the overlay backdrop
- **THEN** the planner overlay closes and the full live class view is restored without changing the run state

#### Scenario: Planner overlay opens with the active block selected
- **WHEN** the coach opens the planner overlay during a running class
- **THEN** the editing surface's selected block is the active block

### Requirement: Planner overlay adapts to wide and phone-sized screens

The system SHALL present the planner overlay as a side drawer on wide screens and as a full-screen surface on phone-sized screens. On phone-sized screens, the overlay SHALL occupy the full viewport so the coach has maximum edit space. The overlay header SHALL display the live class countdown on both form factors so the coach can read the remaining class time while editing, including when the overlay covers the live class view. Primary planner actions SHALL remain reachable without horizontal scrolling on both form factors.

#### Scenario: Coach opens the planner on a wide screen
- **WHEN** the coach opens the planner overlay on a wide viewport
- **THEN** the planner appears as a side drawer over a dimmed live view and the overlay header shows the live class countdown

#### Scenario: Coach opens the planner on a phone-sized screen
- **WHEN** the coach opens the planner overlay on a phone-sized viewport
- **THEN** the planner fills the viewport and the overlay header shows the live class countdown so the coach can read the time without dismissing the overlay

