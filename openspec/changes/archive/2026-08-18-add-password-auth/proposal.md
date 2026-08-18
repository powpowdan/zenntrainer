# add-password-auth

## Why

The app currently signs users in with Supabase magic links (`signInWithOtp`), which depend on Supabase's built-in email service capped at roughly 2 auth emails per hour. This hard-limits new signups and makes every login dependent on email deliverability. Switching to email + password authentication removes emails from signup and login entirely, making the rate limit irrelevant.

## What Changes

- Replace the magic-link-only login screen with an email + password auth card supporting three modes: **sign in**, **sign up** (with optional username), and **forgot password**.
- New signups use `supabase.auth.signUp({ email, password })` with the username stored in `user_metadata` (no new tables).
- Sign-in uses `supabase.auth.signInWithPassword`.
- Password reset uses `supabase.auth.resetPasswordForEmail`, with a new **set-new-password** screen shown when the user returns from the reset email (recovery session detected). This screen is also the migration path for the existing magic-link users.
- Email confirmation must be disabled in the Supabase dashboard (manual pre-deploy step) so signup sends zero emails and returns a session immediately.
- Replace `alert()` calls in the auth flow with inline error/success messages.
- Remove magic-link (`signInWithOtp`) usage from the app.
- **BREAKING** (for existing magic-link users): they can no longer sign in via magic link; they migrate by using "Forgot password" once to set a password.
- Guest mode is unchanged. Data layer (RLS policies, `user_id` keys, session handling in App.jsx) is unchanged.

## Capabilities

### New Capabilities
- `password-auth`: Email + password sign-up, sign-in, password reset, and recovery-session password-setting behavior, including username capture at signup and inline auth feedback.

### Modified Capabilities
<!-- No existing capability's spec-level behavior changes. Guest mode, class library,
     sharing, and planning specs are untouched by the auth method swap. -->

## Impact

- **Code**: `src/Login.jsx` rewritten as a multi-mode auth card (sign in / sign up / forgot password); a new set-password view for recovery sessions; a stale comment referencing the magic-link round trip in `src/App.jsx` (~line 134). Session bootstrap and `onAuthStateChange` handling in `src/App.jsx` remain as-is.
- **Database/RLS**: None. No migrations; all policies key off `auth.uid()`, which is auth-method-agnostic.
- **Supabase dashboard (manual step)**: Authentication → Sign In / Up → Email → disable "Confirm email". Password reset emails remain under the 2/hr built-in cap, which is acceptable for rare resets.
- **Existing users**: Magic-link users set a password once via "Forgot password".
- **Dependencies**: No new packages; uses `@supabase/supabase-js` auth methods already available.
