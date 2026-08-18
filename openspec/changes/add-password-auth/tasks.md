# Tasks: add-password-auth

## 1. Supabase configuration (manual, pre-deploy)

- [ ] 1.1 In Supabase dashboard, disable Authentication → Sign In / Up → Email → "Confirm email"
- [ ] 1.2 Verify Site URL / email redirect points at the deployed app so reset links land correctly

## 2. Auth UI

- [x] 2.1 Rewrite `src/Login.jsx` as a three-mode auth card (signin / signup / forgot) with mode toggle links, keeping guest mode button and existing card styling
- [x] 2.2 Implement sign-in mode: email + password via `signInWithPassword`, inline `Alert` on invalid credentials
- [x] 2.3 Implement sign-up mode: email + password + optional username via `signUp` with `options.data.username`, inline errors for duplicate email and short password
- [x] 2.4 Implement forgot-password mode: email via `resetPasswordForEmail`, generic inline confirmation ("if an account exists…"), link back to sign-in
- [x] 2.5 Remove all `alert()` usage and `signInWithOtp` from the auth flow

## 3. Recovery / set-password flow

- [x] 3.1 Create `SetPassword` component: new password + confirm fields, calls `updateUser({ password })`, inline success and error messages
- [x] 3.2 In `src/App.jsx`, detect `PASSWORD_RECOVERY` event in the existing `onAuthStateChange` subscription and render `SetPassword` instead of `Login` until the password is updated
- [x] 3.3 Update the stale magic-link comment in `src/App.jsx` (~line 134) to reflect password/recovery flows (share-token stash behavior is unchanged)

## 4. Verification

- [ ] 4.1 Sign up with a new email: session established immediately, zero emails sent, username stored in `user_metadata`
- [ ] 4.2 Sign out and sign in with the new credentials; wrong password shows inline error without revealing email existence
- [ ] 4.3 Forgot password for an existing (magic-link) account: reset email arrives, link opens the app on the set-password screen, new password persists, sign-in works with it
- [ ] 4.4 Guest mode still works end-to-end (local storage, no session)
- [x] 4.5 Run `npm run lint` and fix any issues
