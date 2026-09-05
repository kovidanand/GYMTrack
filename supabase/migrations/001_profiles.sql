-- =============================================================================
-- GYMTrack — Phase 2 Database Migration
-- Run this SQL in your Supabase project's SQL Editor
-- (Database → SQL Editor → New Query → paste → Run)
-- =============================================================================

-- ─── profiles table ───────────────────────────────────────────────────────────
-- Each row is linked 1:1 to a Supabase auth.users row via the same UUID.
-- The `id` column IS the user's auth ID — no separate foreign key needed.

create table if not exists public.profiles (
  id                    uuid        primary key references auth.users(id) on delete cascade,
  first_name            text        not null default '',
  last_name             text        not null default '',
  avatar_url            text,
  fitness_goal          text        check (fitness_goal in (
                                      'build_muscle','lose_weight','improve_strength',
                                      'increase_endurance','maintain_fitness','improve_flexibility'
                                    )),
  experience_level      text        check (experience_level in ('beginner','intermediate','advanced')),
  training_frequency    int         check (training_frequency between 1 and 7),
  height                numeric(5,1),   -- cm
  weight                numeric(5,1),   -- kg
  age                   int         check (age between 1 and 120),
  preferred_equipment   text[]      default '{}',
  onboarding_complete   boolean     not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users can read ONLY their own profile
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert ONLY their own profile row
create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update ONLY their own profile row
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── Grant access ─────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant all on public.profiles to authenticated;

-- =============================================================================
-- DONE — your profiles table is ready.
-- Next: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local
-- =============================================================================
