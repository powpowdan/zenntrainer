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
