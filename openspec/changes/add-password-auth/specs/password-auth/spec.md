# password-auth

## Purpose

Email + password authentication for Cadence: sign-up, sign-in, and password reset that operate without sending auth emails at signup or login, freeing the app from the built-in email service rate limit.

## ADDED Requirements

### Requirement: Sign up with email, password, and optional username
The system SHALL allow new users to create an account with an email address, a password, and an optional display username. Signup SHALL NOT require email confirmation and SHALL establish a session immediately upon success. The username SHALL be stored with the user's account metadata.

#### Scenario: Successful signup
- **WHEN** the user submits a valid email, a password meeting the minimum length, and an optional username
- **THEN** the system creates the account, signs the user in without sending any email, and stores the username with the account

#### Scenario: Duplicate email
- **WHEN** the user signs up with an email already registered
- **THEN** the system rejects the signup and shows an inline error indicating the email is already registered

#### Scenario: Password too short
- **WHEN** the user submits a password shorter than the minimum length
- **THEN** the system rejects the signup and shows an inline error stating the minimum password length

### Requirement: Sign in with email and password
The system SHALL allow registered users to sign in with their email and password without sending any email.

#### Scenario: Successful sign-in
- **WHEN** the user submits a registered email and its correct password
- **THEN** the system establishes a session for that user

#### Scenario: Invalid credentials
- **WHEN** the user submits an unregistered email or a wrong password
- **THEN** the system rejects the sign-in and shows an inline error that credentials are invalid, without revealing whether the email exists

### Requirement: Password reset via email link
The system SHALL allow a user to request a password reset email by submitting their email address, and SHALL show an inline confirmation when the request is accepted regardless of whether the email is registered.

#### Scenario: Reset requested
- **WHEN** the user submits an email address on the forgot-password form
- **THEN** the system accepts the request and shows an inline confirmation that a reset link was sent if the account exists

### Requirement: Set a new password from a recovery session
The system SHALL detect when a user arrives from a password-reset email link and present a dedicated screen for choosing a new password. Submitting a valid new password SHALL update the account and keep the user signed in.

#### Scenario: Arriving from reset email
- **WHEN** the app loads with a recovery link from a password-reset email
- **THEN** the app shows the set-new-password screen instead of the sign-in screen

#### Scenario: Password updated
- **WHEN** the user submits a valid new password on the set-new-password screen
- **THEN** the system updates the account password, shows an inline success message, and the user remains signed in

#### Scenario: Existing magic-link user migrates
- **WHEN** a user who previously signed up via magic link completes the forgot-password flow and sets a new password
- **THEN** they can sign in with their email and the new password thereafter

### Requirement: Magic link sign-in removed
The system SHALL NOT offer magic-link (passwordless email link) sign-in. The login screen SHALL present password-based sign-in as the primary authentication path, with guest mode still available.

#### Scenario: Login screen options
- **WHEN** an unauthenticated user views the login screen
- **THEN** they can sign in, sign up, request a password reset, or continue as guest, and no magic-link option is presented
