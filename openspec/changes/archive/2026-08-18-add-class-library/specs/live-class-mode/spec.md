# live-class-mode Delta

## ADDED Requirements

### Requirement: Class completion is recorded without interrupting the completion experience

The system SHALL record a run history entry for the current class when the live session completes through natural time progression. The recording SHALL be silent and SHALL NOT alter, delay, or add UI to the existing completion state.

#### Scenario: Run completes naturally
- **WHEN** the final block reaches zero through natural time progression
- **THEN** the system records a run entry for the class while presenting the existing completion state unchanged

#### Scenario: Completion reached through plan edits
- **WHEN** the run completes because of a plan edit rather than elapsed time
- **THEN** no run entry is recorded, matching the existing rule that suppresses the completion cue for non-natural completion
