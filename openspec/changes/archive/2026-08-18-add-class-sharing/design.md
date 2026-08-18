## Context

Today a class lives in exactly one place: `localStorage` (`cadenceData` in `src/classStorage.js`) for guests, or Supabase `classes` + `tasks` tables behind RLS keyed to `auth.uid()` for signed-in coaches. There is no router — the app is a single URL booting through login/guest choice into the planner (`src/App.jsx`). Every real user is currently a guest on a phone. Sharing has to bridge two guests on two phones through the deployed app at `https://zenntrainer.vercel.app/`.

A class is self-contained: a name plus ordered blocks (`name`, `duration`, `plan`, `color`), no references to other entities. Runs history is per-owner and not part of what travels.

## Goals / Non-Goals

**Goals:**
- Guest-to-guest sharing end to-end, on phones, with no account on either end.
- Copy semantics: recipient gets an independent class via the existing create-class paths.
- Minimal backend surface: one table, plain RLS, no edge functions.

**Non-Goals:**
- Live-linked / reference sharing, permissions, or revocation UI.
- Share-to-specific-user (the "Shared with me" shelf) — future phase.
- Human-readable file export / pasted-text import — the link carries perfect data; can be added later.
- Run history transfer — a copied class starts with no history for the recipient.

## Decisions

### D1: Public mailbox table with token-gated reads

New table `public.shared_classes`:

```sql
token      text primary key,            -- client-generated, 22-char base64url (128-bit)
payload    jsonb not null,              -- versioned class snapshot
created_at timestamptz not null default now(),
expires_at timestamptz not null         -- created_at + 30 days, client-computed
```

RLS policies:
- **Insert**: allowed for anyone (`to anon, authenticated`), `with check` that `char_length(payload::text) <= 32768` and `expires_at <= now() + interval '31 days'`.
- **Select**: allowed for anyone, `using (expires_at > now())` — expired shares are invisible, which is exactly the "no longer available" behavior the spec wants.
- **No update or delete policies** — snapshots are immutable and clients never remove them.

*Why over alternatives:* Anonymous Supabase auth (the alternative) would tangle the existing guest → real-account linking for no gain. The mailbox is one controllable surface: writes are capped and self-expiring; reads require a 128-bit unguessable token. This is the app's first anonymous-writable table, accepted deliberately and bounded.

### D2: Versioned snapshot codec, client-side

New module (e.g. `src/classCodec.js`) owning the only two functions that touch the wire format:

```
serialize(className, tasks)  ->  { v: 1, name, blocks: [{ name, duration, plan, color }] }
parseSnapshot(payload)       ->  { name, blocks } | throws
```

`parseSnapshot` validates version, trims/filters garbage (non-positive durations dropped, unknown fields ignored), and is the single place a future `v: 2` would be handled. Both share and import go through it; nothing else serializes a class.

### D3: Token generated client-side, 128-bit

`crypto.getRandomValues` → 16 bytes → base64url (22 chars). Client-generated primary keys keep the insert a single anonymous round trip with no server round trip for ID allocation.

### D4: `?s=TOKEN` handled at boot, no router

`src/App.jsx` reads the param once on mount. If present it is stripped from the URL immediately (`history.replaceState`) so refresh never re-shows the import, and held in state through the login/guest choice. Once the library is reachable, the app fetches `shared_classes` by token and shows the import preview dialog. Invalid/expired/missing rows all render the same friendly explanation. This preserves the no-router architecture.

### D5: Import reuses existing create paths

- Guest: `guestStore.createClass(data, name, blocks)` — already accepts name + task list, zero storage changes.
- Signed in: existing `createClassRecord` flow (insert class row + task rows).
No new library semantics; imported classes are ordinary classes from the moment they land.

### D6: Share entry point in the library card menu

The Share action joins the existing per-class actions (rename/duplicate/delete) in the library. Sharing is a library-level intent ("hand someone this class"), not a mid-planning or mid-run intent. Native share sheet via `navigator.share` when available; clipboard copy + confirmation otherwise. Link is `${location.origin}/?s=${token}` so it works on Vercel and dev equally.

## Risks / Trade-offs

- [Anonymous inserts are spammable by anyone with the project URL] → 32KB payload cap, 31-day max expiry enforced by policy, 30-day intended expiry, tiny storage footprint per row. Acceptable at current scale; revisit with Supabase rate limiting if abused.
- [Expired rows accumulate in the table] → they're unreadable by policy, so behavior is correct; storage cleanup is optional housekeeping (a future `pg_cron` sweep), not a functional need.
- [Sender expects later edits to propagate] → copy semantics is inherent to the snapshot design; the preview UI phrases the action as "Add to my classes" to set expectations.
- [Snapshot format drift across app versions] → `v` field with a single validating parser isolates change; old shares keep parsing under `v: 1`.
- [Oversized classes rejected at the server after upload attempt] → client checks the serialized size first and refuses with a clear message before any network call; DB check remains the backstop.

## Migration Plan

1. Add `supabase/migrations/<date>_add_shared_classes.sql` (table + RLS per D1); apply with `supabase db push` or the SQL editor.
2. Ship frontend (share action, codec, boot param handling, import preview).
3. Rollback: frontend feature is additive and inert without shares; backend rolls back by dropping `shared_classes`. No existing tables or policies are touched.
