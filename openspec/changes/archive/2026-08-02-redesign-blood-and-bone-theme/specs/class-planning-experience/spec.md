## MODIFIED Requirements

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

### Requirement: Planning interactions are accessible

The system SHALL provide keyboard-accessible block selection and editing, accessible names for icon controls, focusable dialog controls, and touch targets suitable for phone use. Destructive actions SHALL be clearly identified and require an intentional action.

#### Scenario: Coach navigates without a pointer

- **WHEN** the coach uses keyboard navigation in the planner
- **THEN** the coach can reach, identify, select, edit, submit, cancel, and delete block controls with visible focus treatment

#### Scenario: Coach opens the add-block editor

- **WHEN** the add-block editor opens
- **THEN** focus moves to the first meaningful field, the editor exposes its dialog purpose, and the coach can close it with a visible control or Escape
