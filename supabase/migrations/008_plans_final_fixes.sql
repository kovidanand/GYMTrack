-- =============================================================================
-- GYMTrack — Phase 8 Database Migration: Plans Security & Catalog Fixes
-- =============================================================================

-- ─── 1. Allow public & authenticated read on exercises ────────────────────────
-- Exercise catalog is public reference data needed for plans and library
drop policy if exists "exercises: select all" on public.exercises;
create policy "exercises: select all"
  on public.exercises for select
  using (true);

grant select on public.exercises to anon, authenticated;

-- ─── 2. Ensure workout_plans RLS and index optimizations ──────────────────────
alter table public.workout_plans enable row level security;

drop policy if exists "workout_plans: select own" on public.workout_plans;
create policy "workout_plans: select own"
  on public.workout_plans for select
  using (auth.uid() = user_id);

drop policy if exists "workout_plans: insert own" on public.workout_plans;
create policy "workout_plans: insert own"
  on public.workout_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "workout_plans: update own" on public.workout_plans;
create policy "workout_plans: update own"
  on public.workout_plans for update
  using (auth.uid() = user_id);

drop policy if exists "workout_plans: delete own" on public.workout_plans;
create policy "workout_plans: delete own"
  on public.workout_plans for delete
  using (auth.uid() = user_id);

-- ─── 3. Ensure workouts RLS ───────────────────────────────────────────────────
alter table public.workouts enable row level security;

drop policy if exists "workouts: select own" on public.workouts;
create policy "workouts: select own"
  on public.workouts for select
  using (auth.uid() = user_id);

drop policy if exists "workouts: insert own" on public.workouts;
create policy "workouts: insert own"
  on public.workouts for insert
  with check (auth.uid() = user_id);

drop policy if exists "workouts: update own" on public.workouts;
create policy "workouts: update own"
  on public.workouts for update
  using (auth.uid() = user_id);

drop policy if exists "workouts: delete own" on public.workouts;
create policy "workouts: delete own"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- ─── 4. Ensure workout_exercises RLS ───────────────────────────────────────────
alter table public.workout_exercises enable row level security;

drop policy if exists "workout_exercises: select own" on public.workout_exercises;
create policy "workout_exercises: select own" 
  on public.workout_exercises for select 
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

drop policy if exists "workout_exercises: insert own" on public.workout_exercises;
create policy "workout_exercises: insert own" 
  on public.workout_exercises for insert 
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

drop policy if exists "workout_exercises: update own" on public.workout_exercises;
create policy "workout_exercises: update own" 
  on public.workout_exercises for update 
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

drop policy if exists "workout_exercises: delete own" on public.workout_exercises;
create policy "workout_exercises: delete own" 
  on public.workout_exercises for delete 
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

-- ─── 5. Grants ────────────────────────────────────────────────────────────────
grant all on public.workout_plans to authenticated;
grant all on public.workouts to authenticated;
grant all on public.workout_exercises to authenticated;
grant all on public.plan_day_completions to authenticated;
