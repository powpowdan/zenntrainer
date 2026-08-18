## RENAMED Requirements

- FROM: `Blocks advance automatically with a visual-only transition`
- TO: `Blocks advance automatically with a non-blocking transition`

## MODIFIED Requirements

### Requirement: Blocks advance automatically with a visual-only transition

The system SHALL automatically make the next block active when the current block reaches zero. At the boundary, the system SHALL show a short, non-blocking visual transition identifying the next block and SHALL play an audible cue. The transition SHALL NOT add time to the planned class duration or prevent the coach from using live controls. The audible cue SHALL play only when the active block changes through natural time progression — including boundaries crossed while the planner overlay is open — and SHALL NOT play when the change results from manual navigation or from a plan edit forcing the run to advance.

#### Scenario: Current block reaches zero with a following block
- **WHEN** the active block reaches zero while another block follows it
- **THEN** the next block becomes active, its countdown begins at its configured duration, a short visual transition identifies the newly active block, and an audible cue plays

#### Scenario: Boundary occurs while the planner overlay is open
- **WHEN** the active block reaches zero while the planner overlay is open
- **THEN** the audible cue plays as the run advances, alongside the visual transition

#### Scenario: Coach manually navigates between blocks
- **WHEN** the coach changes blocks with Next or Previous
- **THEN** no audible cue plays

#### Scenario: Plan edit forces the active block to change
- **WHEN** a mid-run plan edit causes the run to advance to a different block
- **THEN** no audible cue plays

#### Scenario: Current block reaches zero for the final block
- **WHEN** the final active block reaches zero
- **THEN** the live view enters a class-complete state instead of attempting to activate a nonexistent block

### Requirement: Live mode supports pause, resume, reset, and completion

The system SHALL expose pause or resume, reset, and completion behavior without losing the current class sequence or its notes. Reset SHALL return the live session to the first block with the full planned class duration. The completion state SHALL make it clear that the planned class has ended and SHALL provide a way to reset or leave live mode. WHEN the class completes through natural time progression of the final block, the system SHALL play an audible completion cue exactly once; completion reached through plan edits or manual actions SHALL NOT trigger it.

#### Scenario: Coach resets a running class
- **WHEN** the coach presses Reset during a live class
- **THEN** timing stops, the first block is selected, both timers return to their full planned values, and the first block's notes are shown

#### Scenario: Coach reaches class completion
- **WHEN** the final block completes
- **THEN** the system shows a completion state with no negative timer values and offers reset or an action to leave live mode

#### Scenario: Final block completes naturally
- **WHEN** the final block reaches zero through natural time progression
- **THEN** the audible completion cue plays once as the live view enters the class-complete state

#### Scenario: Class is run again after completion
- **WHEN** the coach resets and runs the class again to natural completion
- **THEN** the completion cue plays again for the new run

#### Scenario: Completion reached through plan edits
- **WHEN** the run completes because a plan edit removed or shortened blocks rather than through elapsed time
- **THEN** no completion cue plays

## ADDED Requirements

### Requirement: Coach can mute live class sounds

The system SHALL provide a mute control in the live class view that silences all live-class sounds, including block-change and completion cues. The mute state SHALL persist across sessions, and toggling it SHALL NOT affect the run state or timers.

#### Scenario: Coach mutes the class
- **WHEN** the coach activates the mute control during a live class
- **THEN** subsequent natural block changes and class completion produce no sound while the class continues normally

#### Scenario: Coach unmutes the class
- **WHEN** the coach deactivates the mute control
- **THEN** sounds play again for subsequent natural block changes and completion

#### Scenario: Mute preference persists
- **WHEN** the coach returns to the app after muting
- **THEN** the mute control reflects the saved preference and it is applied to new live classes
