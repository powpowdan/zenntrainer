## MODIFIED Requirements

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
