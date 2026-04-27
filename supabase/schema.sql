create table if not exists public.profiles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  target_kcal integer not null default 2100,
  theme text not null default 'dark',
  updated_at timestamptz not null default now(),
  unique (user_id, profile_id)
);

create table if not exists public.planner_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  week integer not null check (week between 1 and 4),
  day integer not null check (day between 1 and 7),
  meal1 text,
  meal2 text,
  meal3 text,
  snack text,
  updated_at timestamptz not null default now(),
  unique (user_id, profile_id, week, day)
);

create table if not exists public.metrics_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  date date not null,
  gender text,
  age integer,
  weight numeric,
  height numeric,
  waist numeric,
  chest numeric,
  hips numeric,
  bmi numeric,
  unique (user_id, profile_id, date)
);

create table if not exists public.consult_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  question text not null,
  answer text not null,
  changes_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  profile_id text not null,
  name text not null,
  is_system boolean not null default false,
  system_profile_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (is_system = true and user_id is null and system_profile_key is not null)
    or
    (is_system = false and user_id is not null and system_profile_key is null)
  )
);

create unique index if not exists user_profiles_user_unique_idx
  on public.user_profiles (user_id, profile_id)
  where is_system = false;

create unique index if not exists user_profiles_system_key_unique_idx
  on public.user_profiles (system_profile_key)
  where is_system = true;

create table if not exists public.system_profile_access (
  id bigint generated always as identity primary key,
  system_profile_key text not null,
  email text not null,
  created_at timestamptz not null default now(),
  unique (system_profile_key, email)
);

create table if not exists public.user_recipes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  recipe_id text not null,
  title text not null,
  kcal integer not null,
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  categories jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, profile_id, recipe_id)
);

create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce((auth.jwt() ->> 'email'), ''));
$$;

create or replace function public.can_access_system_profile(p_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.system_profile_access spa
    where spa.system_profile_key = p_key
      and lower(spa.email) = public.current_user_email()
  );
$$;

alter table public.profiles enable row level security;
alter table public.planner_entries enable row level security;
alter table public.metrics_entries enable row level security;
alter table public.consult_history enable row level security;
alter table public.user_profiles enable row level security;
alter table public.system_profile_access enable row level security;
alter table public.user_recipes enable row level security;

drop policy if exists "own_profiles" on public.profiles;
create policy "own_profiles"
  on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own_planner_entries" on public.planner_entries;
create policy "own_planner_entries"
  on public.planner_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own_metrics_entries" on public.metrics_entries;
create policy "own_metrics_entries"
  on public.metrics_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own_consult_history" on public.consult_history;
create policy "own_consult_history"
  on public.consult_history
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_profiles_select" on public.user_profiles;
create policy "user_profiles_select"
  on public.user_profiles
  for select
  using (
    (is_system = false and auth.uid() = user_id)
    or
    (is_system = true and public.can_access_system_profile(system_profile_key))
  );

drop policy if exists "user_profiles_insert" on public.user_profiles;
create policy "user_profiles_insert"
  on public.user_profiles
  for insert
  with check (
    is_system = false
    and auth.uid() = user_id
  );

drop policy if exists "user_profiles_update" on public.user_profiles;
create policy "user_profiles_update"
  on public.user_profiles
  for update
  using (
    is_system = false
    and auth.uid() = user_id
  )
  with check (
    is_system = false
    and auth.uid() = user_id
  );

drop policy if exists "user_profiles_delete" on public.user_profiles;
create policy "user_profiles_delete"
  on public.user_profiles
  for delete
  using (
    is_system = false
    and auth.uid() = user_id
  );

drop policy if exists "deny_system_profile_access_read" on public.system_profile_access;
create policy "deny_system_profile_access_read"
  on public.system_profile_access
  for select
  using (false);

drop policy if exists "own_user_recipes" on public.user_recipes;
create policy "own_user_recipes"
  on public.user_recipes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.user_profiles (profile_id, name, is_system, system_profile_key)
values
  ('bartek', 'Bartek', true, 'bartek'),
  ('paulina', 'Paulina', true, 'paulina')
on conflict do nothing;

insert into public.system_profile_access (system_profile_key, email)
values
  ('bartek', 'gruszeckibartek@gmail.com'),
  ('paulina', 'gruszeckibartek@gmail.com'),
  ('bartek', 'gruszecka.p@gmail.com'),
  ('paulina', 'gruszecka.p@gmail.com')
on conflict do nothing;
