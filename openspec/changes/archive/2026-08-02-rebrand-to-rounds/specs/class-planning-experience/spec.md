## REMOVED Requirements

### Requirement: Timeline communicates duration and current position

## ADDED Requirements

### Requirement: Timeline communicates duration and selection

The system SHALL make each block's name, sequence, and duration readable even for short blocks, show the total planned duration, and provide a visually distinct selected position without relying on color alone. The planner SHALL NOT render live-class run state such as a progress indicator or an active-block highlight; live-class timing state is confined to the live-class surface.

#### Scenario: Plan contains short blocks
- **WHEN** one or more blocks have a short duration
- **THEN** each block remains large enough to identify and select, with its duration still readable

#### Scenario: Planner does not render live-class run state
- **WHEN** the coach is in the planner, including after leaving a live class mid-flight
- **THEN** the planner shows no progress line and no active-block highlight, while any internally-held elapsed time is preserved so the class can still be resumed
