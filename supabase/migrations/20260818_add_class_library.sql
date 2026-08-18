-- add-class-library: classes, runs, class-scoped tasks
-- Apply with: supabase db push (or paste into the Supabase SQL editor).
-- Runs as postgres, which bypasses RLS, so backfill is unaffected by policies.

-- 1. classes -----------------------------------------------------------------

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'My class',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.classes enable row level security;

create policy "classes_select_own"
  on public.classes for select
  using (auth.uid() = user_id);

create policy "classes_insert_own"
  on public.classes for insert
  with check (auth.uid() = user_id);

create policy "classes_update_own"
  on public.classes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "classes_delete_own"
  on public.classes for delete
  using (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists classes_touch_updated_at on public.classes;
create trigger classes_touch_updated_at
  before update on public.classes
  for each row execute function public.touch_updated_at();

-- 2. runs --------------------------------------------------------------------

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  planned_minutes integer not null
);

alter table public.runs enable row level security;

create policy "runs_select_own"
  on public.runs for select
  using (auth.uid() = user_id);

create policy "runs_insert_own"
  on public.runs for insert
  with check (auth.uid() = user_id);

create policy "runs_delete_own"
  on public.runs for delete
  using (auth.uid() = user_id);

-- 3. tasks: class_id + class-scoped position uniqueness ----------------------

alter table public.tasks
  add column if not exists class_id uuid
  references public.classes (id) on delete cascade;

-- Drop the legacy unique(user_id, position) constraints: positions are now
-- unique per class, and two classes of the same user both legitimately hold
-- position 0. Constraint names are not known statically, so drop dynamically.
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.tasks'::regclass
      and contype = 'u'
  loop
    execute format('alter table public.tasks drop constraint %I', c.conname);
  end loop;
end;
$$;

-- Partial unique index: legacy rows with null class_id are excluded (Postgres
-- treats nulls as distinct anyway, but the partial index states the intent).
-- Safe with the app's two-phase position writes: survivor rows stage at
-- -1000000 - index, newly inserted rows stage at -2000000 - index, final
-- writes land on 0..n-1, so no transient duplicate (class_id, position) exists.
create unique index if not exists tasks_class_position_unique
  on public.tasks (class_id, position)
  where class_id is not null;

-- Replace tasks policies: ownership still keyed on user_id (rows keep the
-- column and the app keeps writing it), with the added rule that a non-null
-- class_id must belong to the acting user. Null class_id stays permitted so a
-- pre-deploy app version keeps working during the release window.
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'tasks'
  loop
    execute format('drop policy %I on public.tasks', p.policyname);
  end loop;
end;
$$;

create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (
    auth.uid() = user_id
    and (
      class_id is null
      or exists (
        select 1 from public.classes c
        where c.id = class_id and c.user_id = auth.uid()
      )
    )
  );

create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      class_id is null
      or exists (
        select 1 from public.classes c
        where c.id = class_id and c.user_id = auth.uid()
      )
    )
  );

create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 4. backfill: one default class per user who owns tasks ---------------------
-- Idempotent: users who already own a class never get a second one; their
-- orphan rows are stamped into their earliest class instead.

insert into public.classes (user_id, name)
select distinct t.user_id, 'My class'
from public.tasks t
where t.class_id is null
  and not exists (
    select 1 from public.classes c where c.user_id = t.user_id
  );

update public.tasks t
set class_id = (
  select c.id
  from public.classes c
  where c.user_id = t.user_id
  order by c.created_at asc
  limit 1
)
where t.class_id is null;

-- Verify no task was left classless (raises and rolls back the migration).
do $$
declare
  leftover integer;
begin
  select count(*) into leftover from public.tasks where class_id is null;
  if leftover > 0 then
    raise exception 'backfill incomplete: % task(s) still have no class', leftover;
  end if;
end;
$$;

-- Manual verification queries (run after applying):
--   select count(*) from public.tasks where class_id is null;            -- 0
--   select count(*) from (
--     select distinct user_id from public.tasks
--     except
--     select user_id from public.classes
--   ) x;                                                                   -- 0
