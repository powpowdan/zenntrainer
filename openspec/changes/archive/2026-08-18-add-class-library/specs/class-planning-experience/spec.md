# class-planning-experience Delta

## MODIFIED Requirements

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
