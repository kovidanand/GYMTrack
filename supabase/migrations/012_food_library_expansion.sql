-- =============================================================================
-- GYMTrack — Migration 012: Expanded Food Library, Favorites, & Custom Food Metadata
-- Adds user food favorites table and extends custom_foods with culinary metadata,
-- regional aliases, dietary classification, and micronutrients.
-- =============================================================================

-- ─── 1. User Food Favorites Table ─────────────────────────────────────────────
create table if not exists public.food_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id text not null,
  food_name text not null,
  food_data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint food_favorites_user_food_key unique (user_id, food_id)
);

create index if not exists food_favorites_user_idx on public.food_favorites(user_id);
create index if not exists food_favorites_food_id_idx on public.food_favorites(food_id);

alter table public.food_favorites enable row level security;

drop policy if exists "food_favorites: select own" on public.food_favorites;
create policy "food_favorites: select own"
  on public.food_favorites for select
  using (auth.uid() = user_id);

drop policy if exists "food_favorites: insert own" on public.food_favorites;
create policy "food_favorites: insert own"
  on public.food_favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "food_favorites: delete own" on public.food_favorites;
create policy "food_favorites: delete own"
  on public.food_favorites for delete
  using (auth.uid() = user_id);

grant all on public.food_favorites to authenticated;


-- ─── 2. Extend Custom Foods Table with Culinary & Quality Metadata ────────────
alter table public.custom_foods
  add column if not exists aliases text[] default '{}',
  add column if not exists cuisine text,
  add column if not exists category text default 'Other',
  add column if not exists dietary_classification text default 'vegetarian',
  add column if not exists saturated_fat numeric,
  add column if not exists sugar numeric,
  add column if not exists sodium_mg numeric,
  add column if not exists serving_weight_g numeric,
  add column if not exists is_per_100g boolean default false;

create index if not exists custom_foods_cuisine_idx on public.custom_foods(cuisine);
create index if not exists custom_foods_category_idx on public.custom_foods(category);
create index if not exists custom_foods_dietary_idx on public.custom_foods(dietary_classification);
