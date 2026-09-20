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
