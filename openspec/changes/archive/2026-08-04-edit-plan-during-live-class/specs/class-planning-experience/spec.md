## REMOVED Requirements

### Requirement: Timeline communicates duration and selection
**Reason**: Replaced by "Timeline communicates duration, selection, and live run position," which extends the same behavior to conditionally render live-class run state (progress line and active-block highlight) when a class is in progress.
**Migration**: The replacement requirement preserves every behavior of the removed one (short-block readability, total duration display, distinct selected position) and adds the run-state rendering. No behavior is lost.

## ADDED Requirements

### Requirement: Timeline communicates duration, selection, and live run position

The system SHALL make each block's name, sequence, and duration readable even for short blocks, show the total planned duration, and provide a visually distinct selected position without relying on color alone. WHEN a live class is in progress and the planner is open, the planner SHALL render the current run position as both a progress line positioned at the playhead offset within the timeline and a visually distinct active-block highlight; the active-block highlight SHALL be distinguishable from the selected-block treatment so the two states are independently readable. WHEN no live class is in progress, the planner SHALL NOT render any live-class run state.

#### Scenario: Plan contains short blocks
- **WHEN** one or more blocks have a short duration
- **THEN** each block remains large enough to identify and select, with its duration still readable

#### Scenario: Planner renders run state while a class is in progress
- **WHEN** the coach opens the planner while a class is running
- **THEN** the timeline shows a progress line at the current playhead position and highlights the active block distinctly from any selected block

#### Scenario: Planner suppresses run state when no class is running
- **WHEN** the coach opens the planner and no class is running, including immediately after leaving a live class that has been paused or completed
- **THEN** the planner shows no progress line and no active-block highlight, while any internally-held elapsed time is preserved so a paused class can still be resumed

### Requirement: Plan edits during a live run preserve the coach's current position

The system SHALL anchor the run position to a specific block identity plus an offset within that block, rather than to an absolute offset from class start. Editing a block that is not the active block SHALL NOT change which block is active, the elapsed time within the active block, or the active block's remaining countdown. Editing the active block's duration SHALL preserve the elapsed time within it and update only its remaining countdown. Reordering the active block SHALL carry the run position with it to the new position. The run position SHALL be preserved across any edit unless the edit itself changes the active block.

#### Scenario: Coach edits a non-active block's duration
- **WHEN** the coach changes the duration of a block that is not the active block while a class is running
- **THEN** the active block, the elapsed time within it, and its remaining countdown are unchanged, while the total class duration is updated to reflect the edit

#### Scenario: Coach edits the active block's duration
- **WHEN** the coach changes the duration of the active block while a class is running
- **THEN** the elapsed time within the active block is preserved and its remaining countdown is updated to reflect the new duration

#### Scenario: Coach reorders blocks while running
- **WHEN** the coach reorders blocks while a class is running
- **THEN** the run position follows the active block to its new position and the elapsed time within the active block is preserved

#### Scenario: Coach deletes the active block
- **WHEN** the coach confirms deletion of the active block during a run
- **THEN** the run position advances to the block that now occupies the deleted position, or the run completes if the deleted block was the final remaining block

### Requirement: Destructive run-time edits require explicit confirmation

While a live class is running, the system SHALL allow editing a block's notes and name without confirmation. Edits that change the active block's duration, reorder the active block, delete the active block, or delete any block the run has already passed SHALL require an explicit confirmation that names the consequence before the edit is applied. The system SHALL NOT auto-confirm these destructive edits.

#### Scenario: Coach edits notes on the active block
- **WHEN** the coach edits the notes of the active block during a running class
- **THEN** the change is applied immediately without prompting

#### Scenario: Coach shortens the active block below its elapsed time
- **WHEN** the coach reduces the active block's duration below the time already elapsed within it during a running class
- **THEN** the system prompts to confirm before applying and explains that the run will advance

#### Scenario: Coach deletes a block the run has already passed
- **WHEN** the coach attempts to delete a block earlier in the plan than the active block during a running class
- **THEN** the system prompts to confirm and only deletes the block on confirmation
