-- Step 1 of multi-customer: an `invites` table + invite_id on every guest-related table.
-- Safe to run more than once. Run in Supabase -> SQL Editor.

create table if not exists invites (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  owner_id   uuid references auth.users(id) on delete set null,  -- the customer who owns it (used in the login step)
  content    jsonb not null default '{}'::jsonb,                 -- names, events, photos, story...
  created_at timestamptz not null default now()
);

-- No public policies: only the server (service role) can read/write invites for now.
alter table invites enable row level security;

alter table guests add column if not exists invite_id uuid references invites(id) on delete cascade;
alter table rsvps  add column if not exists invite_id uuid references invites(id) on delete cascade;
alter table wishes add column if not exists invite_id uuid references invites(id) on delete cascade;

create index if not exists guests_invite_idx on guests(invite_id);
create index if not exists rsvps_invite_idx  on rsvps(invite_id);
create index if not exists wishes_invite_idx on wishes(invite_id);

-- The existing wedding becomes the first invite.
insert into invites (slug) values ('ram-mansi') on conflict (slug) do nothing;

update guests set invite_id = (select id from invites where slug = 'ram-mansi') where invite_id is null;
update rsvps  set invite_id = (select id from invites where slug = 'ram-mansi') where invite_id is null;
update wishes set invite_id = (select id from invites where slug = 'ram-mansi') where invite_id is null;
