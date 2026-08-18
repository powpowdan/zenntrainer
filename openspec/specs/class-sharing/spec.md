# class-sharing Specification

## Purpose

Lets a coach hand a class to another coach as a link, and lets the recipient add that class to their own library as an independent copy — with no account required on either end.

## Requirements

### Requirement: Coach can create a share link for a class

The system SHALL provide a share action for a class that publishes an immutable snapshot of that class — its name and ordered blocks with durations, notes, and colors — and produces a link that opens the app with the share token. The snapshot SHALL be taken at share time; later edits to the class SHALL NOT affect an already-published share. Sharing SHALL be available to guest coaches without any account.

#### Scenario: Guest coach shares a class
- **WHEN** a guest coach uses the share action on a class
- **THEN** the system publishes a snapshot of the class and produces a share link, without requiring sign-in

#### Scenario: Coach shares from a phone
- **WHEN** the coach uses the share action on a device that offers the system share sheet
- **THEN** the share link is handed to the native share sheet for sending through any installed app

#### Scenario: Coach shares from a desktop
- **WHEN** the device has no native share sheet
- **THEN** the system offers the link for copying to the clipboard and confirms when it has been copied

#### Scenario: Share succeeds offline or on server failure
- **WHEN** the share action cannot reach the server
- **THEN** the system shows an explicit failure message and no link is presented as shared

#### Scenario: Shared class is edited afterwards
- **WHEN** the sharing coach edits or deletes the class after sharing
- **THEN** the published snapshot and any already-imported copies are unchanged

### Requirement: Opening a share link shows an import preview

When the app is opened with a share token, the system SHALL fetch the referenced snapshot and show a preview of the class — its name, block count, and total planned minutes — with actions to add it to the coach's library or dismiss it. The preview SHALL be reachable regardless of whether the coach then signs in or continues as guest. An invalid or expired token SHALL show a clear, friendly explanation that the share is no longer available and that the sender can share again, without dead-ending the app.

#### Scenario: Recipient opens a fresh share link
- **WHEN** a coach opens the app via a valid, unexpired share link and completes the sign-in or guest choice
- **THEN** the app shows a preview of the shared class with its name, block count, and total minutes

#### Scenario: Recipient dismisses the preview
- **WHEN** the recipient dismisses the import preview without adding the class
- **THEN** the app continues to the normal library or planner experience and the share link is not re-shown on subsequent boots

#### Scenario: Recipient opens an expired link
- **WHEN** a coach opens a share link whose snapshot has expired
- **THEN** the app explains that the share is no longer available and that they can ask the sender to share again, and continues to the normal experience

#### Scenario: Recipient opens an invalid link
- **WHEN** a coach opens the app with a share token that matches no snapshot
- **THEN** the app behaves the same as an expired link, without dead-ending

### Requirement: Imported class becomes the recipient's own copy

Confirming the import SHALL create a new class in the recipient's library containing the shared name and blocks in their shared order. The imported class SHALL behave exactly like any class the recipient created — editable, runnable, duplicable, with its own run history — and SHALL have no ongoing connection to the sender's class. The import SHALL land in the recipient's library even if the share later expires.

#### Scenario: Guest coach imports a shared class
- **WHEN** a guest coach confirms adding a shared class from the preview
- **THEN** a new class with the shared name and blocks appears in the guest's device library, ready to open and run

#### Scenario: Authenticated coach imports a shared class
- **WHEN** a signed-in coach confirms adding a shared class from the preview
- **THEN** the class is saved to their account and appears in their library on all their devices

#### Scenario: Imported copy is independent
- **WHEN** the recipient edits or runs the imported class
- **THEN** the sender's original class is unaffected, and the sender's history never appears in the recipient's library

#### Scenario: Same class imported twice
- **WHEN** a coach imports the same share link again
- **THEN** a second independent class is created with the same name and blocks, following the library's existing duplicate-name behavior

### Requirement: Share snapshots expire and are resource-bounded

Published snapshots SHALL expire and become openable no longer after 30 days. The system SHALL cap the size of an accepted snapshot and SHALL reject shares that exceed the cap. Acceptance of a snapshot SHALL NOT depend on any user identity, and a snapshot SHALL be readable only through its unguessable token.

#### Scenario: Snapshot ages past 30 days
- **WHEN** a share link is opened more than 30 days after publishing
- **THEN** the snapshot is reported as no longer available

#### Scenario: Oversized class is shared
- **WHEN** a share is attempted for a class whose snapshot exceeds the size cap
- **THEN** the system rejects it with a clear message instead of storing a truncated plan
