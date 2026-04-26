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

alter table public.profiles enable row level security;
alter table public.planner_entries enable row level security;
alter table public.metrics_entries enable row level security;
alter table public.consult_history enable row level security;

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
