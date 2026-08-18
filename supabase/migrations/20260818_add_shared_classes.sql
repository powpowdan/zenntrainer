-- add-shared-classes: public mailbox for class share links
-- Apply with: supabase db push (or paste into the Supabase SQL editor).
--
-- Copy-semantics sharing: a share is an immutable JSON snapshot of one class,
-- addressed by an unguessable client-generated token. Anyone may drop a
-- size-capped, self-expiring snapshot (guests have no auth identity); anyone
-- holding the token may read it while unexpired. No update/delete policies:
-- snapshots are immutable and are never removed by clients.

create table if not exists public.shared_classes (
  token text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.shared_classes enable row level security;

create policy "shared_classes_insert_public"
  on public.shared_classes for insert
  to anon, authenticated
  with check (
    char_length(payload::text) <= 32768
    and expires_at > now()
    and expires_at <= now() + interval '31 days'
  );

create policy "shared_classes_select_public"
  on public.shared_classes for select
  to anon, authenticated
  using (expires_at > now());

-- Manual verification queries (run after applying as anon / logged out):
--   insert with 40KB payload          -> rejected by policy
--   insert with expires_at + 40 days  -> rejected by policy
--   insert valid row, select by token -> row visible
--   update / delete that row          -> rejected (no policies)
--   set expires_at in the past, select -> row invisible
