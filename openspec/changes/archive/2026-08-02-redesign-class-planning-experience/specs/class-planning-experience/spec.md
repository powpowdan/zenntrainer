## Purpose

This capability gives coaches a clear, responsive workspace for preparing an ordered class plan before entering the existing live class experience. It makes block editing, selection, persistence feedback, and timeline comprehension reliable on desktop and phone-sized screens.

## ADDED Requirements

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

The system SHALL allow the coach to create and edit a block's name, positive duration, color, and coaching notes. Invalid duration input SHALL be rejected with a clear explanation, and editing a block SHALL preserve its position in the ordered plan.

#### Scenario: Coach edits a selected block
- **WHEN** the coach changes the selected block's name, duration, color, or notes and confirms the edit
- **THEN** the timeline and class summary immediately reflect the valid changes while the block keeps its existing position

#### Scenario: Coach submits an invalid duration
- **WHEN** the coach submits a missing, zero, negative, or otherwise invalid duration
- **THEN** the system does not apply the change and identifies the duration field as needing correction

#### Scenario: Coach creates a block with notes
- **WHEN** the coach submits a valid new block with optional notes and color
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

The system SHALL persist additions, edits, deletions, and reorder operations through the same persistence behavior used by the current guest and authenticated modes. For authenticated plans, each block's persisted position SHALL be unique within its user's plan and SHALL be restored when the plan is loaded again. The planner SHALL communicate whether the current plan is saved, saving, or has unsaved changes, and a failed persistence operation SHALL not silently discard the coach's visible edits.

#### Scenario: Coach changes a plan successfully
- **WHEN** the coach adds, edits, deletes, or reorders a block and persistence succeeds
- **THEN** the system shows that the current plan is saved

#### Scenario: Authenticated coach reloads a reordered plan
- **WHEN** an authenticated coach reorders blocks, the mutation succeeds, and the plan is loaded again
- **THEN** the blocks return in the saved order with unique positions within that user's plan

#### Scenario: Coach has changes awaiting persistence
- **WHEN** the visible plan differs from the last persisted plan
- **THEN** the system clearly shows an unsaved or saving state and keeps the changes visible

#### Scenario: Persistence fails
- **WHEN** a plan mutation cannot be persisted
- **THEN** the system communicates the failure and preserves enough local state for the coach to retry or recover rather than silently reverting without explanation

### Requirement: Timeline communicates duration and current position

The system SHALL make each block's name, sequence, and duration readable even for short blocks, show the total planned duration, and provide a visually distinct current or selected position without relying on color alone.

#### Scenario: Plan contains short blocks
- **WHEN** one or more blocks have a short duration
- **THEN** each block remains large enough to identify and select, with its duration still readable

#### Scenario: Timer progress is visible in the planner
- **WHEN** a class has elapsed time before the coach leaves or resets live mode
- **THEN** the planner indicates the current progress and active block without obscuring block labels or controls

### Requirement: Planning interactions are accessible

The system SHALL provide keyboard-accessible block selection and editing, accessible names for icon or color controls, focusable dialog controls, and touch targets suitable for phone use. Destructive actions SHALL be clearly identified and require an intentional action.

#### Scenario: Coach navigates without a pointer
- **WHEN** the coach uses keyboard navigation in the planner
- **THEN** the coach can reach, identify, select, edit, submit, cancel, and delete block controls with visible focus treatment

#### Scenario: Coach opens the add-block editor
- **WHEN** the add-block editor opens
- **THEN** focus moves to the first meaningful field, the editor exposes its dialog purpose, and the coach can close it with a visible control or Escape

#### Scenario: Coach uses a color control
- **WHEN** the coach reaches a color option
- **THEN** the option has an accessible name and its selected state is conveyed without depending only on its visual color
