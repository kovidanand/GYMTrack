-- =============================================================================
-- GYMTrack — Phase 5 Database Migration: Workout History & Progress
-- =============================================================================

-- ─── 1. workout_sessions table ───────────────────────────────────────────────
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete set null,
  workout_name text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  total_exercises integer not null default 0,
  total_sets integer not null default 0,
  completed_sets integer not null default 0,
  total_volume numeric not null default 0,
  calories_burned numeric,
  status text not null default 'completed',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_id_idx on public.workout_sessions(user_id);
create index if not exists workout_sessions_started_at_idx on public.workout_sessions(started_at);

-- Trigger for updated_at
drop trigger if exists set_workout_sessions_updated_at on public.workout_sessions;
create trigger set_workout_sessions_updated_at
  before update on public.workout_sessions
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.workout_sessions enable row level security;
drop policy if exists "workout_sessions: select own" on public.workout_sessions;
create policy "workout_sessions: select own" on public.workout_sessions for select using (auth.uid() = user_id);
drop policy if exists "workout_sessions: insert own" on public.workout_sessions;
create policy "workout_sessions: insert own" on public.workout_sessions for insert with check (auth.uid() = user_id);
drop policy if exists "workout_sessions: update own" on public.workout_sessions;
create policy "workout_sessions: update own" on public.workout_sessions for update using (auth.uid() = user_id);
drop policy if exists "workout_sessions: delete own" on public.workout_sessions;
create policy "workout_sessions: delete own" on public.workout_sessions for delete using (auth.uid() = user_id);


-- ─── 2. workout_session_sets table ───────────────────────────────────────────
create table if not exists public.workout_session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  workout_exercise_id uuid references public.workout_exercises(id) on delete set null,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  exercise_name text not null,
  set_number integer not null,
  weight numeric,
  reps integer,
  completed boolean not null default true,
  is_personal_record boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workout_session_sets_session_id_idx on public.workout_session_sets(session_id);
create index if not exists workout_session_sets_exercise_id_idx on public.workout_session_sets(exercise_id);

-- Trigger for updated_at
drop trigger if exists set_workout_session_sets_updated_at on public.workout_session_sets;
create trigger set_workout_session_sets_updated_at
  before update on public.workout_session_sets
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.workout_session_sets enable row level security;
-- Access is controlled via the parent session table
drop policy if exists "workout_session_sets: select own" on public.workout_session_sets;
create policy "workout_session_sets: select own" 
  on public.workout_session_sets for select 
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));

drop policy if exists "workout_session_sets: insert own" on public.workout_session_sets;
create policy "workout_session_sets: insert own" 
  on public.workout_session_sets for insert 
  with check (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));

drop policy if exists "workout_session_sets: update own" on public.workout_session_sets;
create policy "workout_session_sets: update own" 
  on public.workout_session_sets for update 
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));

drop policy if exists "workout_session_sets: delete own" on public.workout_session_sets;
create policy "workout_session_sets: delete own" 
  on public.workout_session_sets for delete 
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));


-- Grants
grant all on public.workout_sessions to authenticated;
grant all on public.workout_session_sets to authenticated;
