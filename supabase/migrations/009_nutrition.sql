-- =============================================================================
-- GYMTrack — Phase 9 Database Migration: Nutrition Tracking Module
-- Adds tables for nutrition goals, custom foods, food diary entries, and water logging.
-- =============================================================================

-- ─── 1. Nutrition Goals ───────────────────────────────────────────────────────
create table if not exists public.nutrition_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calorie_target integer not null default 2000,
  protein_target integer not null default 150,
  carb_target integer not null default 200,
  fat_target integer not null default 65,
  fiber_target integer not null default 30,
  water_target integer not null default 2500,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_goals_user_id_key unique (user_id)
);

create index if not exists nutrition_goals_user_idx on public.nutrition_goals(user_id);

drop trigger if exists set_nutrition_goals_updated_at on public.nutrition_goals;
create trigger set_nutrition_goals_updated_at
  before update on public.nutrition_goals
  for each row execute function public.handle_updated_at();

alter table public.nutrition_goals enable row level security;

drop policy if exists "nutrition_goals: select own" on public.nutrition_goals;
create policy "nutrition_goals: select own"
  on public.nutrition_goals for select
  using (auth.uid() = user_id);

drop policy if exists "nutrition_goals: insert own" on public.nutrition_goals;
create policy "nutrition_goals: insert own"
  on public.nutrition_goals for insert
  with check (auth.uid() = user_id);

drop policy if exists "nutrition_goals: update own" on public.nutrition_goals;
create policy "nutrition_goals: update own"
  on public.nutrition_goals for update
  using (auth.uid() = user_id);

drop policy if exists "nutrition_goals: delete own" on public.nutrition_goals;
create policy "nutrition_goals: delete own"
  on public.nutrition_goals for delete
  using (auth.uid() = user_id);

grant all on public.nutrition_goals to authenticated;


-- ─── 2. Custom User Foods ────────────────────────────────────────────────────
create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  serving_size numeric not null default 100,
  serving_unit text not null default 'g',
  calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  fiber numeric not null default 0,
  barcode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_foods_user_idx on public.custom_foods(user_id);
create index if not exists custom_foods_name_idx on public.custom_foods(name);

drop trigger if exists set_custom_foods_updated_at on public.custom_foods;
create trigger set_custom_foods_updated_at
  before update on public.custom_foods
  for each row execute function public.handle_updated_at();

alter table public.custom_foods enable row level security;

drop policy if exists "custom_foods: select own" on public.custom_foods;
create policy "custom_foods: select own"
  on public.custom_foods for select
  using (auth.uid() = user_id);

drop policy if exists "custom_foods: insert own" on public.custom_foods;
create policy "custom_foods: insert own"
  on public.custom_foods for insert
  with check (auth.uid() = user_id);

drop policy if exists "custom_foods: update own" on public.custom_foods;
create policy "custom_foods: update own"
  on public.custom_foods for update
  using (auth.uid() = user_id);

drop policy if exists "custom_foods: delete own" on public.custom_foods;
create policy "custom_foods: delete own"
  on public.custom_foods for delete
  using (auth.uid() = user_id);

grant all on public.custom_foods to authenticated;


-- ─── 3. Food Entries (Daily Diary) ───────────────────────────────────────────
create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null,
  brand text,
  serving_size numeric not null default 1,
  serving_unit text not null default 'serving',
  servings_logged numeric not null default 1,
  calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  fiber numeric not null default 0,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists food_entries_user_date_idx on public.food_entries(user_id, date);
create index if not exists food_entries_meal_idx on public.food_entries(meal_type);

drop trigger if exists set_food_entries_updated_at on public.food_entries;
create trigger set_food_entries_updated_at
  before update on public.food_entries
  for each row execute function public.handle_updated_at();

alter table public.food_entries enable row level security;

drop policy if exists "food_entries: select own" on public.food_entries;
create policy "food_entries: select own"
  on public.food_entries for select
  using (auth.uid() = user_id);

drop policy if exists "food_entries: insert own" on public.food_entries;
create policy "food_entries: insert own"
  on public.food_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "food_entries: update own" on public.food_entries;
create policy "food_entries: update own"
  on public.food_entries for update
  using (auth.uid() = user_id);

drop policy if exists "food_entries: delete own" on public.food_entries;
create policy "food_entries: delete own"
  on public.food_entries for delete
  using (auth.uid() = user_id);

grant all on public.food_entries to authenticated;


-- ─── 4. Water Entries ─────────────────────────────────────────────────────────
create table if not exists public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  amount_ml integer not null check (amount_ml > 0),
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists water_entries_user_date_idx on public.water_entries(user_id, date);

alter table public.water_entries enable row level security;

drop policy if exists "water_entries: select own" on public.water_entries;
create policy "water_entries: select own"
  on public.water_entries for select
  using (auth.uid() = user_id);

drop policy if exists "water_entries: insert own" on public.water_entries;
create policy "water_entries: insert own"
  on public.water_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "water_entries: delete own" on public.water_entries;
create policy "water_entries: delete own"
  on public.water_entries for delete
  using (auth.uid() = user_id);

grant all on public.water_entries to authenticated;
