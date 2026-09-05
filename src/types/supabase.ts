// ─── Supabase Database Types (Phase 2) ────────────────────────────────────────
// Manually maintained for Phase 2. In Phase 3+ these should be auto-generated
// via `supabase gen types typescript --project-id <id> > src/types/supabase.ts`

export type FitnessGoal =
  | 'build_muscle'
  | 'lose_weight'
  | 'improve_strength'
  | 'increase_endurance'
  | 'maintain_fitness'
  | 'improve_flexibility'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Profile {
  id: string                       // UUID — matches auth.users.id
  first_name: string
  last_name: string
  avatar_url: string | null
  fitness_goal: FitnessGoal | null
  experience_level: ExperienceLevel | null
  training_frequency: number | null // days per week
  height: number | null             // cm
  weight: number | null             // kg
  age: number | null
  preferred_equipment: string[]
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>

// ─── Auth error codes from Supabase ──────────────────────────────────────────

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_already_exists'
  | 'weak_password'
  | 'user_not_found'
  | 'email_not_confirmed'
  | 'too_many_requests'
  | 'network_error'
  | 'unknown'
