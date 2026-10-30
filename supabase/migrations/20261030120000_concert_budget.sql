-- Concert budget planner: concerts, ticket categories, and income/expense entries.
-- Only the single admin account (bsanka27@gmail.com) can read or write any row.

create table public.concerts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  event_date date,
  venue text check (char_length(venue) <= 200),
  city text check (char_length(city) <= 100),
  budget numeric(14, 2) check (budget >= 0),
  notes text check (char_length(notes) <= 4000),
  created_at timestamptz not null default now()
);

create table public.ticket_categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  concert_id uuid not null references public.concerts (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  price numeric(14, 2) not null default 0 check (price >= 0),
  seats integer check (seats >= 0),
  sold integer not null default 0 check (sold >= 0),
  created_at timestamptz not null default now()
);

-- One table for both sides of the ledger. `settled` means paid (expense) or received (income).
create table public.budget_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  concert_id uuid not null references public.concerts (id) on delete cascade,
  kind text not null check (kind in ('expense', 'income')),
  category text not null check (char_length(category) between 1 and 50),
  label text check (char_length(label) <= 200),
  amount numeric(14, 2) not null check (amount >= 0),
  settled boolean not null default false,
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);

create index concerts_owner_id_idx on public.concerts (owner_id);
create index ticket_categories_concert_id_idx on public.ticket_categories (concert_id);
create index ticket_categories_owner_id_idx on public.ticket_categories (owner_id);
create index budget_entries_concert_id_idx on public.budget_entries (concert_id);
create index budget_entries_owner_id_idx on public.budget_entries (owner_id);

-- Data API access: signed-in users only, never anonymous visitors.
revoke all on public.concerts, public.ticket_categories, public.budget_entries from anon;
grant select, insert, update, delete on public.concerts, public.ticket_categories, public.budget_entries to authenticated;

alter table public.concerts enable row level security;
alter table public.ticket_categories enable row level security;
alter table public.budget_entries enable row level security;

-- The `email` claim is set by Supabase Auth (not user-editable metadata), so it is safe to authorize on.
create policy "Admin manages own concerts" on public.concerts
  for all to authenticated
  using (
    (select auth.jwt() ->> 'email') = 'bsanka27@gmail.com'
    and owner_id = (select auth.uid())
  )
  with check (
    (select auth.jwt() ->> 'email') = 'bsanka27@gmail.com'
    and owner_id = (select auth.uid())
  );

create policy "Admin manages own ticket categories" on public.ticket_categories
  for all to authenticated
  using (
    (select auth.jwt() ->> 'email') = 'bsanka27@gmail.com'
    and owner_id = (select auth.uid())
  )
  with check (
    (select auth.jwt() ->> 'email') = 'bsanka27@gmail.com'
    and owner_id = (select auth.uid())
    and exists (select 1 from public.concerts c where c.id = concert_id and c.owner_id = (select auth.uid()))
  );

create policy "Admin manages own budget entries" on public.budget_entries
  for all to authenticated
  using (
    (select auth.jwt() ->> 'email') = 'bsanka27@gmail.com'
    and owner_id = (select auth.uid())
  )
  with check (
    (select auth.jwt() ->> 'email') = 'bsanka27@gmail.com'
    and owner_id = (select auth.uid())
    and exists (select 1 from public.concerts c where c.id = concert_id and c.owner_id = (select auth.uid()))
  );
