## 1. Backend: shared_classes mailbox

- [x] 1.1 Add `supabase/migrations/<date>_add_shared_classes.sql`: `shared_classes` table (`token` text PK, `payload` jsonb, `created_at`, `expires_at`), RLS with anonymous insert (32KB payload cap, expiry ≤ 31 days) and anonymous select (`expires_at > now()`), no update/delete policies
- [x] 1.2 Apply the migration (`supabase db push` or SQL editor) and verify: anon can insert a valid row, anon cannot insert oversized/expiry-too-far rows, anon select returns unexpired rows only, update/delete are rejected

## 2. Snapshot codec

- [x] 2.1 Create `src/classCodec.js` with `serialize(className, tasks)` producing `{ v: 1, name, blocks: [{ name, duration, plan, color }] }` and a client-side size check (≤ 32KB serialized)
- [x] 2.2 Implement `parseSnapshot(payload)` with validation: reject unknown versions, drop blocks with missing/invalid name or non-positive duration, ignore unknown fields; throw on structurally invalid input
- [x] 2.3 Add token generation helper: 16 random bytes → 22-char base64url string

## 3. Sharing flow (sender)

- [x] 3.1 Add a Share action to the class library card menu (alongside rename/duplicate/delete)
- [x] 3.2 Implement the share flow: serialize class → check size → insert into `shared_classes` with token and `expires_at = now + 30 days` → build link `${location.origin}/?s=${token}`
- [x] 3.3 Hand the link to `navigator.share` when available, otherwise copy to clipboard with a confirmation; show explicit error states for offline/server/oversize failures with no link presented on failure

## 4. Import flow (recipient)

- [x] 4.1 On boot in `src/App.jsx`, read `?s=TOKEN`, strip it from the URL via `history.replaceState`, and hold it through the sign-in/guest choice
- [x] 4.2 After the library is reachable with a pending token, fetch `shared_classes` by token; on miss/expiry show the friendly "no longer available — ask them to share again" dialog and continue to the normal experience
- [x] 4.3 Build the import preview dialog: class name, block count, total planned minutes, "Add to my classes" and dismiss actions
- [x] 4.4 Implement import: guest path via `guestStore.createClass(data, name, blocks)`, signed-in path via the existing `createClassRecord` flow; open the imported class after creation and confirm it appears in the library with its shared name and no history

## 5. Verification

- [x] 5.1 End-to-end on two devices/browsers as guests: share from one, open link on the other, import, run the imported class; confirm sender edits after sharing don't propagate
- [x] 5.2 Verify link handling edge cases: expired token (insert with short expiry), invalid token, dismissed preview not re-shown on refresh, `npm run lint` and `npm run build` pass
