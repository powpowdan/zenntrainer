## ADDED Requirements

### Requirement: Coach can open the planner without leaving a live class

The system SHALL provide a control in the live class view that opens the planner as an overlay above the live view. Opening the planner SHALL NOT pause the class clock; the run SHALL continue while the planner overlay is open, including across block boundaries.

#### Scenario: Coach opens the planner from the live view
- **WHEN** the coach activates the planner-opening control during a running class
- **THEN** the planner appears as an overlay above the live view and the class clock continues running

#### Scenario: Active block advances while the planner overlay is open
- **WHEN** the active block reaches zero while the planner overlay is open
- **THEN** the next block becomes active, the visual transition fires, and the planner's run-position indicator advances to the new active block without coach intervention

### Requirement: Coach can dismiss the planner overlay and return to the live view

The system SHALL provide a persistent affordance to dismiss the planner overlay and return to the full live class view. Dismissing the overlay SHALL NOT alter the run state. When the planner overlay is opened during a run, the editing surface's selected block SHALL initialize to the active block so the coach lands on their current position.

#### Scenario: Coach returns to the live view
- **WHEN** the coach activates the return-to-live affordance or dismisses the overlay backdrop
- **THEN** the planner overlay closes and the full live class view is restored without changing the run state

#### Scenario: Planner overlay opens with the active block selected
- **WHEN** the coach opens the planner overlay during a running class
- **THEN** the editing surface's selected block is the active block

### Requirement: Planner overlay adapts to wide and phone-sized screens

The system SHALL present the planner overlay as a side drawer on wide screens and as a full-screen surface on phone-sized screens. On phone-sized screens, the overlay SHALL occupy the full viewport so the coach has maximum edit space. The overlay header SHALL display the live class countdown on both form factors so the coach can read the remaining class time while editing, including when the overlay covers the live class view. Primary planner actions SHALL remain reachable without horizontal scrolling on both form factors.

#### Scenario: Coach opens the planner on a wide screen
- **WHEN** the coach opens the planner overlay on a wide viewport
- **THEN** the planner appears as a side drawer over a dimmed live view and the overlay header shows the live class countdown

#### Scenario: Coach opens the planner on a phone-sized screen
- **WHEN** the coach opens the planner overlay on a phone-sized viewport
- **THEN** the planner fills the viewport and the overlay header shows the live class countdown so the coach can read the time without dismissing the overlay
