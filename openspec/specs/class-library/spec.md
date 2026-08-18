# class-library Specification

## Purpose

Lets coaches keep a personal library of named classes, switch between them, duplicate them, and see when each was last taught, instead of being limited to a single implicit plan.

## Requirements

### Requirement: Coach can manage a library of named classes

The system SHALL let a coach create, rename, and delete named classes, and each class SHALL hold its own ordered block plan independent of other classes. A coach SHALL be able to duplicate an existing class into a new class with a distinct name and a full copy of its blocks. Deleting a class SHALL require an explicit confirmation that names the consequence, and SHALL remove that class's blocks and run history.

#### Scenario: Coach creates a new class
- **WHEN** the coach creates a new class from the library
- **THEN** the system adds a class with the provided or default name, empty of blocks, ready for editing

#### Scenario: Coach renames a class
- **WHEN** the coach renames a class from the library
- **THEN** the new name appears in the library and in the current-class indicator, and other class data is unchanged

#### Scenario: Coach duplicates a class
- **WHEN** the coach duplicates a class
- **THEN** the system creates a new class containing copies of every block in the same order, with a name derived from the original, without altering the original class

#### Scenario: Coach deletes a class
- **WHEN** the coach confirms deletion of a class
- **THEN** the class, its blocks, and its run history are removed, and the library no longer lists it

#### Scenario: Coach cancels deletion
- **WHEN** the coach dismisses the delete confirmation
- **THEN** the class and all its data remain unchanged

### Requirement: Library presents classes with identifying and history details

The system SHALL present the coach's classes as a list where each entry shows the class name, block count, total planned duration, the date it was last taught (or a never-run indication), and how many times it has been taught. Opening a class entry SHALL switch the planner to that class.

#### Scenario: Coach opens the library
- **WHEN** the coach opens the class library
- **THEN** every saved class is listed with its name, block count, total planned minutes, last-taught date or never-run indication, and times taught

#### Scenario: Coach opens a class from the library
- **WHEN** the coach selects a class in the library
- **THEN** the planner loads that class's blocks in their saved order and the current-class indicator shows the opened class

#### Scenario: Library reflects recent activity
- **WHEN** a class is taught, edited, renamed, or created
- **THEN** reopening the library shows updated history and summary details for that class

### Requirement: Coach can switch classes from the planner header

The system SHALL display the current class name in the planner header as a control that opens the class library, so the coach can always see which class is being edited. Switching classes while a live run is in progress SHALL require an explicit confirmation that the run will be left behind. Edits to a class SHALL NOT affect any other class.

#### Scenario: Coach identifies the current class
- **WHEN** the planner is open
- **THEN** the header shows the name of the class being edited via a control that opens the library

#### Scenario: Coach switches classes while a run is in progress
- **WHEN** the coach opens a different class while a live class is running
- **THEN** the system asks for confirmation before switching, naming that the current run will be left

#### Scenario: Coach switches classes with no run in progress
- **WHEN** the coach opens a different class with no live run in progress
- **THEN** the planner loads the selected class immediately without prompting

#### Scenario: Edits stay within a class
- **WHEN** the coach edits, adds, deletes, or reorders blocks in the current class
- **THEN** no other class's blocks or history change

### Requirement: App restores the last-opened class on startup

After the coach signs in or continues as a guest, the system SHALL reopen the class that was last opened on that device. A coach with no last-opened class on the device SHALL be taken to the library or an editable first class rather than an empty dead end.

#### Scenario: Returning coach reopens the app
- **WHEN** a coach who previously opened a class returns to the app and signs in or continues as a guest
- **THEN** the planner opens with the class they last had open on that device

#### Scenario: First-time coach starts the app
- **WHEN** a coach with no saved classes opens the app for the first time
- **THEN** the system provides a first class seeded with a sample block plan the coach can edit, run, or replace

#### Scenario: Last-opened class was deleted on another flow
- **WHEN** the class remembered as last opened no longer exists
- **THEN** the system opens the library or a fallback class instead of an empty plan

### Requirement: Completed runs are recorded per class

The system SHALL record a history entry when a class run completes, capturing the class, the run's start, its finish, and the planned minutes at the time of the run. The entry SHALL be written without interrupting the completion experience. History SHALL be visible only as last-taught date and times-taught in the library.

#### Scenario: Coach completes a class run
- **WHEN** a class run reaches completion
- **THEN** the system records a run entry for that class with start, finish, and planned minutes

#### Scenario: Library shows teaching history
- **WHEN** the library lists a class that has been taught
- **THEN** the card shows the most recent run date and the total number of recorded runs

#### Scenario: Coach never finishes a run
- **WHEN** a coach starts a run but exits or resets before completion
- **THEN** no run entry is recorded for that attempt

### Requirement: Guests receive the same class library capabilities

The system SHALL provide class creation, switching, duplication, renaming, deletion, and run history to guest coaches using device-local storage. Guest run history SHALL remain on the device and SHALL NOT be treated as following the coach across devices.

#### Scenario: Guest manages multiple classes
- **WHEN** a guest coach creates, edits, and switches between classes
- **THEN** all classes persist on the device across sessions, with the same library behavior as authenticated coaches

#### Scenario: Guest teaches a class
- **WHEN** a guest coach completes a class run
- **THEN** the run history is recorded on the device and shows on the library card

### Requirement: Existing single plans migrate into a default class

The system SHALL preserve existing coaches' current plans by migrating them into a named class on first use after this change, so no plan data is lost.

#### Scenario: Existing authenticated coach loads the app
- **WHEN** a coach with existing saved blocks opens the app after this change
- **THEN** their blocks appear in a migrated class with a default name, editable like any other class

#### Scenario: Existing guest returns
- **WHEN** a guest with a previously saved plan returns after this change
- **THEN** their saved plan appears as a migrated class in their device-local library
