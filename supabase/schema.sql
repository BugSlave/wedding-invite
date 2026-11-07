-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

-- ─── GUESTS TABLE ────────────────────────────────────────────────────────────
-- Each guest gets a UUID-based invite link: yoursite.com/?id=<uuid>
-- UUIDs are unguessable, so no extra auth is needed for link validation.

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.guests enable row level security;

-- Anyone can look up a guest by their UUID (to validate invite links).
-- UUIDs are cryptographically random and practically unguessable.
create policy "Anyone can read guests"
  on public.guests
  for select
  to anon
  using (true);

-- INSERT / UPDATE / DELETE only via service-role key (admin API routes).
-- No anon policy for writes = only service role can modify the table.

-- ─── RSVPS TABLE ─────────────────────────────────────────────────────────────

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  attendance text not null check (attendance in ('yes', 'no', 'maybe')),
  guest_count integer not null default 1 check (guest_count >= 1 and guest_count <= 20),
  message text,
  created_at timestamptz not null default now()
);

-- Row Level Security: locked down by default.
alter table public.rsvps enable row level security;

-- Allow anyone with the public anon key to INSERT a new RSVP (the form
-- needs this), but NOT to select/update/delete existing rows. This is
-- what keeps guest records from being publicly readable (Section 16).
create policy "Anyone can submit an RSVP"
  on public.rsvps
  for insert
  to anon
  with check (true);

-- Deliberately no SELECT/UPDATE/DELETE policy for the anon role.
-- To view responses yourself, use the Supabase Dashboard's Table Editor
-- (you're authenticated as the project owner there, RLS doesn't apply)
-- or query with the service-role key from a secure server context only
-- -- never from the browser.
