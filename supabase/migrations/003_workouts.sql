-- =============================================================================
-- GYMTrack — Phase 4 Database Migration: Workouts & Plans
-- =============================================================================

-- ─── 1. workout_plans table ──────────────────────────────────────────────────
create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  goal text,
  difficulty text,
  days_per_week integer,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure only one active plan per user using a partial unique index
create unique index if not exists workout_plans_single_active_idx 
  on public.workout_plans(user_id) 
  where (is_active = true);

create index if not exists workout_plans_user_id_idx on public.workout_plans(user_id);

-- Trigger for updated_at
drop trigger if exists set_workout_plans_updated_at on public.workout_plans;
create trigger set_workout_plans_updated_at
  before update on public.workout_plans
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.workout_plans enable row level security;
drop policy if exists "workout_plans: select own" on public.workout_plans;
create policy "workout_plans: select own" on public.workout_plans for select using (auth.uid() = user_id);
drop policy if exists "workout_plans: insert own" on public.workout_plans;
create policy "workout_plans: insert own" on public.workout_plans for insert with check (auth.uid() = user_id);
drop policy if exists "workout_plans: update own" on public.workout_plans;
create policy "workout_plans: update own" on public.workout_plans for update using (auth.uid() = user_id);
drop policy if exists "workout_plans: delete own" on public.workout_plans;
create policy "workout_plans: delete own" on public.workout_plans for delete using (auth.uid() = user_id);


-- ─── 2. workouts table ───────────────────────────────────────────────────────
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.workout_plans(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  day_number integer,
  notes text,
  estimated_duration integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workouts_user_id_idx on public.workouts(user_id);
create index if not exists workouts_plan_id_idx on public.workouts(plan_id);

-- Trigger for updated_at
drop trigger if exists set_workouts_updated_at on public.workouts;
create trigger set_workouts_updated_at
  before update on public.workouts
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.workouts enable row level security;
drop policy if exists "workouts: select own" on public.workouts;
create policy "workouts: select own" on public.workouts for select using (auth.uid() = user_id);
drop policy if exists "workouts: insert own" on public.workouts;
create policy "workouts: insert own" on public.workouts for insert with check (auth.uid() = user_id);
drop policy if exists "workouts: update own" on public.workouts;
create policy "workouts: update own" on public.workouts for update using (auth.uid() = user_id);
drop policy if exists "workouts: delete own" on public.workouts;
create policy "workouts: delete own" on public.workouts for delete using (auth.uid() = user_id);


-- ─── 3. workout_exercises table ──────────────────────────────────────────────
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  exercise_order integer not null,
  sets integer not null default 3,
  reps text not null default '8-12',
  weight numeric,
  rest_seconds integer not null default 90,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workout_exercises_workout_id_idx on public.workout_exercises(workout_id);
create index if not exists workout_exercises_exercise_id_idx on public.workout_exercises(exercise_id);

-- Trigger for updated_at
drop trigger if exists set_workout_exercises_updated_at on public.workout_exercises;
create trigger set_workout_exercises_updated_at
  before update on public.workout_exercises
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.workout_exercises enable row level security;
-- Since workout_exercises don't have user_id directly, we check through workouts table
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


-- ─── 4. workout_set_logs table ───────────────────────────────────────────────
create table if not exists public.workout_set_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  set_number integer not null,
  weight numeric,
  reps integer,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workout_set_logs_user_id_idx on public.workout_set_logs(user_id);
create index if not exists workout_set_logs_workout_exercise_id_idx on public.workout_set_logs(workout_exercise_id);

-- Trigger for updated_at
drop trigger if exists set_workout_set_logs_updated_at on public.workout_set_logs;
create trigger set_workout_set_logs_updated_at
  before update on public.workout_set_logs
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.workout_set_logs enable row level security;
drop policy if exists "workout_set_logs: select own" on public.workout_set_logs;
create policy "workout_set_logs: select own" on public.workout_set_logs for select using (auth.uid() = user_id);
drop policy if exists "workout_set_logs: insert own" on public.workout_set_logs;
create policy "workout_set_logs: insert own" on public.workout_set_logs for insert with check (auth.uid() = user_id);
drop policy if exists "workout_set_logs: update own" on public.workout_set_logs;
create policy "workout_set_logs: update own" on public.workout_set_logs for update using (auth.uid() = user_id);
drop policy if exists "workout_set_logs: delete own" on public.workout_set_logs;
create policy "workout_set_logs: delete own" on public.workout_set_logs for delete using (auth.uid() = user_id);

-- Grants
grant all on public.workout_plans to authenticated;
grant all on public.workouts to authenticated;
grant all on public.workout_exercises to authenticated;
grant all on public.workout_set_logs to authenticated;
