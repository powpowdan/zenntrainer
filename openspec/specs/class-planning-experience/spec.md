# class-planning-experience Specification

## Purpose
This capability gives coaches a clear, responsive workspace for preparing an ordered class plan before entering the existing live class experience. It makes block editing, selection, persistence feedback, and timeline comprehension reliable on desktop and phone-sized screens.
## Requirements
### Requirement: Planner presents a responsive preparation workspace

The system SHALL present the class plan as a preparation workspace with an ordered timeline, a class summary, a selected-block editing surface, and an obvious action for adding a block. On phone-sized screens, the same functions SHALL remain usable without horizontal scrolling or overlapping controls.

#### Scenario: Coach opens a populated plan on a wide screen
- **WHEN** the coach views a plan with one or more blocks on a wide viewport
- **THEN** the system shows the timeline and selected-block editor together, along with total block count, total planned duration, and a control to start the class

#### Scenario: Coach opens an empty plan
- **WHEN** the plan contains no blocks
- **THEN** the system shows an instructional empty state with a clear action to add the first block

#### Scenario: Coach prepares a plan on a phone-sized screen
- **WHEN** the planner is displayed on a narrow viewport
- **THEN** timeline, editing, add-block, save, and start actions remain readable and reachable without horizontal scrolling

### Requirement: Coach can create and edit complete blocks

The system SHALL allow the coach to create and edit a block's name, positive duration, and coaching notes. Invalid duration input SHALL be rejected with a clear explanation, and editing a block SHALL preserve its position in the ordered plan. The system SHALL NOT expose a block color field.

#### Scenario: Coach edits a selected block

- **WHEN** the coach changes the selected block's name, duration, or notes and confirms the edit
- **THEN** the timeline and class summary immediately reflect the valid changes while the block keeps its existing position

#### Scenario: Coach submits an invalid duration

- **WHEN** the coach submits a missing, zero, negative, or otherwise invalid duration
- **THEN** the system does not apply the change and identifies the duration field as needing correction

#### Scenario: Coach creates a block with notes

- **WHEN** the coach submits a valid new block with optional notes
- **THEN** the new block appears at the end of the timeline with all submitted values available for later editing and live mode

### Requirement: Selection and block lifecycle remain coherent

The system SHALL identify the selected block consistently across the timeline and editor. The coach SHALL be able to reorder and delete blocks, and the editor SHALL not display a deleted block as if it were still part of the plan.

#### Scenario: Coach selects a block
- **WHEN** the coach selects a block in the timeline
- **THEN** that block is visibly selected and its current values appear in the editing surface

#### Scenario: Coach reorders blocks
- **WHEN** the coach moves a block to another valid position
- **THEN** the timeline order, total duration, and subsequent live-class order reflect the new position

#### Scenario: Coach deletes the selected block
- **WHEN** the coach confirms deletion of the selected block
- **THEN** the block is removed, selection moves to a valid remaining block or the empty state, and no deleted notes remain visible

### Requirement: Plan mutations provide reliable persistence feedback

The system SHALL persist additions, edits, deletions, and reorder operations automatically for both guest and authenticated coaches, without requiring a manual save action. For authenticated plans, each block's persisted position SHALL be unique within its class and SHALL be restored when that class is loaded again. The planner SHALL communicate whether the current class is saved, saving, or has unsaved changes, and a failed persistence operation SHALL NOT silently discard the coach's visible edits.

#### Scenario: Coach changes a plan successfully
- **WHEN** the coach adds, edits, deletes, or reorders a block and persistence succeeds
- **THEN** the system shows that the current class is saved

#### Scenario: Authenticated coach reloads a reordered plan
- **WHEN** an authenticated coach reorders blocks, the mutation succeeds, and the class is loaded again
- **THEN** the blocks return in the saved order with unique positions within that class

#### Scenario: Coach edits without saving manually
- **WHEN** the coach edits a block and takes no save action
- **THEN** the change is persisted automatically for both guest and authenticated coaches

#### Scenario: Coach has changes awaiting persistence
- **WHEN** the visible plan differs from the last persisted plan
- **THEN** the system clearly shows an unsaved or saving state and keeps the changes visible

#### Scenario: Persistence fails
- **WHEN** a plan mutation cannot be persisted
- **THEN** the system communicates the failure and preserves enough local state for the coach to retry or recover rather than silently reverting without explanation

### Requirement: Planning interactions are accessible

The system SHALL provide keyboard-accessible block selection and editing, accessible names for icon controls, focusable dialog controls, and touch targets suitable for phone use. Destructive actions SHALL be clearly identified and require an intentional action.

#### Scenario: Coach navigates without a pointer
- **WHEN** the coach uses keyboard navigation in the planner
- **THEN** the coach can reach, identify, select, edit, submit, cancel, and delete block controls with visible focus treatment

#### Scenario: Coach opens the add-block editor
- **WHEN** the add-block editor opens
- **THEN** focus moves to the first meaningful field, the editor exposes its dialog purpose, and the coach can close it with a visible control or Escape

### Requirement: Timeline communicates duration, selection, and live run position

The system SHALL make each block's name, sequence, and duration readable even for short blocks, show the total planned duration, and provide a visually distinct selected position without relying on color alone. WHEN a live class session is in progress and the planner is open, the planner SHALL render the current run position as both a progress line and a visually distinct active-block highlight; the active-block highlight SHALL be distinguishable from the selected-block treatment so the two states are independently readable. The progress line SHALL be positioned against the timeline's rendered block layout — accounting for how short blocks are rendered at a minimum readable height and for the spacing between blocks — so that it tracks the active block's rendered extent as elapsed time advances through it. The progress line SHALL remain visible, frozen at its current position, while the live session is paused. WHEN no live class session is in progress, the planner SHALL NOT render any live-class run state.

#### Scenario: Plan contains short blocks
- **WHEN** one or more blocks have a short duration
- **THEN** each block remains large enough to identify and select, with its duration still readable

#### Scenario: Planner renders run state while a class is in progress
- **WHEN** the coach opens the planner while a class is running
- **THEN** the timeline shows a progress line at the current playhead position and highlights the active block distinctly from any selected block

#### Scenario: Progress line aligns with the rendered active block
- **WHEN** blocks render taller than their duration maps (minimum readable heights) and/or blocks are separated by spacing, and the run advances into a block
- **THEN** the progress line sits within the active block's rendered extent — at the active block's rendered top edge the moment the block becomes active, and proportionally through its rendered height as its time elapses — rather than at a position derived only from raw elapsed minutes

#### Scenario: Progress line stays frozen while the class is paused
- **WHEN** the coach pauses during a live class and the planner is open
- **THEN** the progress line remains visible at the paused position instead of disappearing, and resumes advancing when the coach resumes the class

#### Scenario: Planner suppresses run state when no class is running
- **WHEN** the coach opens the planner and no live class session is in progress, including immediately after leaving a live class that has been paused or completed
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

