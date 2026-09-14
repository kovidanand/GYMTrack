-- =============================================================================
-- GYMTrack — Phase 7 Database Migration: Training Plans & Multi-Week Progression
-- =============================================================================

-- ─── 1. Extend workout_plans with multi-week & duration attributes ────────────
alter table public.workout_plans
  add column if not exists duration_weeks integer not null default 8,
  add column if not exists session_duration integer not null default 60,
  add column if not exists training_location text not null default 'gym',
  add column if not exists available_equipment text[] default array['barbell', 'dumbbell', 'cables', 'machines'],
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists plan_data jsonb;

-- ─── 2. Extend workouts with day_type and progression phases ──────────────────
alter table public.workouts
  add column if not exists day_type text not null default 'workout' check (day_type in ('workout', 'recovery', 'rest')),
  add column if not exists phase_number integer not null default 1,
  add column if not exists week_number integer;

create index if not exists workouts_phase_idx on public.workouts(phase_number);
create index if not exists workouts_week_idx on public.workouts(week_number);

-- ─── 3. Create plan_day_completions table ────────────────────────────────────
-- Tracks completion of specific plan days across multi-week routines
create table if not exists public.plan_day_completions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_number integer not null default 1,
  day_number integer not null,
  workout_id uuid references public.workouts(id) on delete set null,
  status text not null default 'completed' check (status in ('completed', 'partial', 'skipped')),
  completed_exercises integer not null default 0,
  total_exercises integer not null default 0,
  notes text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique index to prevent duplicate completion logs for the exact same plan day
create unique index if not exists plan_day_completions_unique_idx
  on public.plan_day_completions(plan_id, user_id, week_number, day_number);

create index if not exists plan_day_completions_plan_idx on public.plan_day_completions(plan_id);
create index if not exists plan_day_completions_user_idx on public.plan_day_completions(user_id);
create index if not exists plan_day_completions_completed_at_idx on public.plan_day_completions(completed_at);

-- Trigger for updated_at
drop trigger if exists set_plan_day_completions_updated_at on public.plan_day_completions;
create trigger set_plan_day_completions_updated_at
  before update on public.plan_day_completions
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.plan_day_completions enable row level security;

drop policy if exists "plan_day_completions: select own" on public.plan_day_completions;
create policy "plan_day_completions: select own"
  on public.plan_day_completions for select
  using (auth.uid() = user_id);

drop policy if exists "plan_day_completions: insert own" on public.plan_day_completions;
create policy "plan_day_completions: insert own"
  on public.plan_day_completions for insert
  with check (auth.uid() = user_id);

drop policy if exists "plan_day_completions: update own" on public.plan_day_completions;
create policy "plan_day_completions: update own"
  on public.plan_day_completions for update
  using (auth.uid() = user_id);

drop policy if exists "plan_day_completions: delete own" on public.plan_day_completions;
create policy "plan_day_completions: delete own"
  on public.plan_day_completions for delete
  using (auth.uid() = user_id);

-- Grants
grant all on public.plan_day_completions to authenticated;
