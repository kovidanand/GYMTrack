-- =============================================================================
-- GYMTrack — Migration 010: Nutrition & Fitness Profile
-- Extends profiles with comprehensive fitness goals, dietary preferences,
-- food access, and budget fields to power personalized AI recommendations.
-- =============================================================================

-- ─── 1. Relax check constraint on fitness_goal to allow extended & custom goals ───
alter table public.profiles
  drop constraint if exists profiles_fitness_goal_check;

-- ─── 2. Add Nutrition & Fitness Profile Columns to public.profiles ───────────
alter table public.profiles
  add column if not exists secondary_goal text,
  add column if not exists target_weight numeric(5,1),
  add column if not exists target_date date,
  add column if not exists dietary_preference text default 'non_vegetarian',
  add column if not exists allergies text[] default '{}',
  add column if not exists food_restrictions text[] default '{}',
  add column if not exists preferred_cuisines text[] default '{}',
  add column if not exists preferred_protein_sources text[] default '{}',
  add column if not exists favorite_foods text[] default '{}',
  add column if not exists disliked_foods text[] default '{}',
  add column if not exists food_budget text default 'moderate',
  add column if not exists cooking_access text default 'full_kitchen',
  add column if not exists cooking_skill text default 'intermediate',
  add column if not exists meal_prep_time text default 'moderate',
  add column if not exists meals_per_day integer default 3;

-- ─── 3. Indexes for frequent queries ─────────────────────────────────────────
create index if not exists profiles_dietary_pref_idx on public.profiles(dietary_preference);

-- ─── 4. Re-affirm RLS Policies (Idempotent with DROP before CREATE) ───────────
alter table public.profiles enable row level security;

drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant all on public.profiles to authenticated;
