-- =============================================================================
-- GYMTrack — Migration 011: Safe profile schema alignment
-- Ensures sex and session_duration columns exist on public.profiles,
-- and relaxes check constraints on fitness_goal to prevent save failures.
-- =============================================================================

-- 1. Ensure columns exist on public.profiles
alter table public.profiles
  add column if not exists sex text,
  add column if not exists session_duration integer default 60;

-- 2. Drop check constraint if present so extended/recomposition goals are accepted
alter table public.profiles
  drop constraint if exists profiles_fitness_goal_check;
