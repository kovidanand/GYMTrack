// ─── Supabase Database Types ──────────────────────────────────────────────────

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
  secondary_goal: FitnessGoal | null
  experience_level: ExperienceLevel | null
  training_frequency: number | null // days per week
  session_duration: number | null   // minutes
  height: number | null             // cm
  weight: number | null             // kg
  age: number | null
  sex: string | null                // 'male' | 'female' | 'other' | null
  preferred_equipment: string[]
  training_location: string | null  // 'full_gym' | 'home_gym' | 'outdoors'
  preferred_split: string | null    // 'upper_lower' | 'push_pull_legs' | 'full_body' | 'bro_split'
  preferred_exercises: string[]
  disliked_exercises: string[]
  health_limitations: string | null
  onboarding_complete: boolean
  onboarding_step: number | null
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
