## Why

Coaches currently have no way to hand a class to another coach. Classes are locked to one device (guest, localStorage) or one account (Supabase RLS), so a coach who builds a good session has to rebuild it block-by-block on the other coach's phone. The primary audience is guest coaches on separate phones — sharing must work end-to-end without either party signing in.

## What Changes

- Add a **Share** action per class that publishes an immutable snapshot of the class (name + ordered blocks) to a public, token-addressed store and produces a share link (`https://zenntrainer.vercel.app/?s=<token>`).
- Use the phone's native share sheet when available, with a copy-link fallback on desktop.
- Opening a share link boots the app, holds the token through the login/guest choice, and shows an **import preview** (class name, block count, total minutes) with a single **Add to my classes** action.
- Importing creates a **copy**: the class lands in the recipient's library under its own name (no suffix), fully theirs to edit and run. No ongoing link to the sender; the recipient's run history is their own.
- Share payloads expire after **30 days**; tapping an expired or invalid link shows a friendly explanation and a path to recover (ask the sender to share again). Expiry never affects an imported copy.
- Both sharing and importing work fully for **guest coaches** — no account required on either end.

## Capabilities

### New Capabilities
- `class-sharing`: Create share links for classes (snapshot + token + expiry), open share links into an import preview, and import the shared class as an independent copy — for guests and authenticated coaches alike.

### Modified Capabilities

(None — the class library's requirements are unchanged; imported classes enter through the existing create-class path.)

## Impact

- **Supabase**: new `shared_classes` table (token, class snapshot JSON, created_at, expires_at) with RLS allowing anonymous insert of size-capped rows and anonymous select by unguessable token; new migration file in `supabase/migrations/`.
- **Frontend**: `src/App.jsx` (read `?s=` param on boot, hold through auth choice, route to import flow); new share/import components alongside existing `src/components/`; a serialize/deserialize module for the class snapshot format (versioned).
- **Guest storage**: import reuses `createClass` in `src/classStorage.js`; no shape changes to `cadenceData`.
- **No router added**: the app stays single-URL; the share token is a query param handled at boot.
- **No breaking changes** to existing capabilities.
