# link-supabase-migrations

## Why

The class-library migration was committed to the repo but never applied to the hosted Supabase project — password signups then failed with "Could not create the class" because the `classes` and `runs` tables didn't exist online (fixed manually via SQL Editor paste on 2026-08-18). Root cause: no link between repo migrations and the hosted DB, so drift goes unnoticed until it breaks in production.

## What Changes

- Run `supabase link --project-ref rwvwjlvawhzbcqmvzqfw` and store the project ref in `supabase/config.toml` so the CLI targets the hosted project.
- Pull the remote schema into migration history (`supabase pull` / `supabase db dump`) so local migration state matches what's actually deployed, preventing the CLI from thinking the DB is empty.
- Document the migration workflow (link once, then `supabase db push` for future migrations) in the README alongside the existing manual-SQL note.
- Verify: `supabase db push` reports "remote database is up to date" against the hosted project.

## Capabilities

### New Capabilities
<!-- None: this is tooling/config only, no app behavior changes. Intended to set
     skip_specs: true since there are no spec-level behavioral requirements. -->

### Modified Capabilities

## Impact

- **Tooling only**: `supabase/config.toml` (new), README docs. No app code, no schema changes.
- **Requires**: Supabase access token (`SUPABASE_ACCESS_TOKEN`) and dashboard login for the initial `link`/`pull`.
