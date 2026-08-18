# Design: add-password-auth

## Context

Today `src/Login.jsx` calls `supabase.auth.signInWithOtp({ email })` and every auth touchpoint sends an email through Supabase's built-in SMTP (capped ~2/hr), which bottlenecks signups. The rest of the app is auth-method-agnostic: `src/App.jsx` keys all persistence off `session.user.id`, RLS policies key off `auth.uid()`, and guest mode uses local storage. No migrations or policy changes are needed for a password swap.

## Goals / Non-Goals

**Goals:**
- Signup and login complete with zero emails sent.
- Existing magic-link users can migrate themselves via forgot-password.
- Keep guest mode and all data-layer behavior untouched.

**Non-Goals:**
- Username-based login (username is display metadata only; a profiles table with uniqueness is deferred until something actually renders it).
- Custom SMTP, email confirmation, or email templates.
- OAuth providers.
- Displaying the username anywhere in the UI (no consumer exists today).

## Decisions

### 1. One auth component, local mode state (not routing)
Login.jsx becomes a three-mode card (`signin` | `signup` | `forgot`) with a `mode` state value, plus a separate recovery state handled by a `SetPassword` component.
- *Why:* The app has no router; introducing one for auth would be scope creep. Mode state keeps everything in one file pair.
- *Alternative:* React Router with `/login`, `/signup`, `/reset` routes — rejected: new dependency, no other navigation needs it.

### 2. Recovery detection via `onAuthStateChange` `PASSWORD_RECOVERY` event
App.jsx's existing `onAuthStateChange` subscription fires `event === "PASSWORD_RECOVERY"` when the user lands from a reset email. We surface that as state passed down to render `SetPassword` instead of `Login`.
- *Why:* Works with Supabase's default PKCE flow without parsing URL hash fragments manually; the hash is consumed by the client before we'd read it.
- *Alternative:* Parse `type=recovery` from the URL hash — fragile timing (client consumes the hash on load) and duplicated logic.

### 3. Username stored in `user_metadata` via `signUp` options
`supabase.auth.signUp({ email, password, options: { data: { username } } })`.
- *Why:* Zero schema. Nothing reads it today, so a `profiles` table with a unique index would be speculative.
- *Alternative:* `profiles` table + trigger on `auth.users` — rejected for now (adds a migration and RLS for data nothing consumes). Revisit when a UI displays names.

### 4. Inline MUI `Alert` messaging instead of `alert()`
Error and success states render inline in the auth card; Supabase messages are surfaced nearly verbatim ("Invalid login credentials", "User already registered", "Password should be at least 6 characters").
- *Why:* `alert()` blocks and looks broken; the Supabase strings are already user-appropriate.

### 5. Forgot-password accepts any email, confirms generically
One message — "If an account exists for that email, a reset link has been sent" — regardless of registration.
- *Why:* Avoids email enumeration; also matches Supabase behavior when rate-limited.

### 6. Dashboard toggle as a documented manual pre-deploy step
Email confirmation must be OFF (Authentication → Sign In / Up → Email) before the new login ships, otherwise signup still sends emails and returns no session.
- *Why:* No code path can set this; it's project configuration.
- *Rollout order matters:* toggle first, deploy second. Password-reset emails keep using built-in SMTP; the 2/hr cap is acceptable for that rare flow.

## Risks / Trade-offs

- [Confirmation toggle off → typo'd email = permanently unrecoverable account] → Accept for this audience (a coach's private tool, low signup volume); mitigate later with a "change email" setting if it ever matters.
- [Password reset still rate-limited at ~2/hr] → Acceptable: resets are rare. If it bites, wire custom SMTP later.
- [Reset link lands on production URL while testing locally] → Supabase "Site URL" / redirect config must point at the deployed app; verify once during rollout.
- [Existing magic-link users are confused by the new screen] → One-time "set your password via Forgot Password" migration; the spec covers this scenario.

## Migration Plan

1. Supabase dashboard: disable "Confirm email" (manual, before deploy).
2. Deploy the new auth UI.
3. Existing magic-link users: use Forgot Password once to set a password.
4. Rollback: revert deploy; magic-link code path would need restoring (git revert). Dashboard toggle is independent and harmless either way.

## Open Questions

- None blocking. Whether to ever show the username in the Header is a future UI decision that does not affect this design.
