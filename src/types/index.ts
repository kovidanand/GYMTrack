// ─── User & Profile ───────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  joinedAt: string
  fitnessGoal: FitnessGoal
  experienceLevel: ExperienceLevel
  trainingFrequency: number // days per week
  preferredEquipment: EquipmentType[]
  bodyStats: BodyStats
  units: UnitSystem
}

export interface BodyStats {
  height: number   // cm
  weight: number   // kg
  age: number
}

export type FitnessGoal =
  | 'build_muscle'
  | 'lose_weight'
  | 'improve_strength'
  | 'increase_endurance'
  | 'maintain_fitness'
  | 'improve_flexibility'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type UnitSystem = 'metric' | 'imperial'

// ─── Exercise Library ─────────────────────────────────────────────────────────

export interface Exercise {
  id: string
  name: string
  slug: string
  description: string
  instructions: string[]
  tips: string[]
  common_mistakes: string[]
  primary_muscle: string
  secondary_muscles: string[]
  muscle_group: MuscleGroup
  equipment: EquipmentType[]
  difficulty: DifficultyLevel
  exercise_type: ExerciseCategory
  movement_pattern: string
  image_url?: string | null
  video_url?: string | null
  is_compound: boolean
  is_unilateral: boolean
  created_at: string
  updated_at: string
}

export interface UserFavoriteExercise {
  id: string
  user_id: string
  exercise_id: string
  created_at: string
}

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'full_body'
  | 'forearms'
  | 'traps'

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'resistance_band'
  | 'kettlebell'
  | 'pull_up_bar'
  | 'bench'
  | 'none'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export type ExerciseCategory = 'strength' | 'cardio' | 'mobility' | 'stretching'

// ─── Workouts & Plans (Supabase Schema) ───────────────────────────────────────

export interface WorkoutPlan {
  id: string
  user_id: string
  name: string
  description: string | null
  goal: string | null
  difficulty: string | null
  days_per_week: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  plan_id?: string | null
  user_id?: string
  name: string
  description?: string | null
  day_number?: number | null
  notes?: string | null
  estimated_duration?: number | null
  created_at?: string
  updated_at?: string
  
  // Joined relation (populated on fetch)
  workout_exercises?: WorkoutExercise[]
  
  // Legacy fields for Phase 1/2 Mock Dashboard compatibility
  exercises?: any[]
  estimatedDuration?: number
  lastCompleted?: string
  tags?: string[]
  createdAt?: string
  isTemplate?: boolean
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  exercise_order: number
  sets: number
  reps: string
  weight: number | null
  rest_seconds: number
  notes: string | null
  created_at: string
  updated_at: string
  
  // Joined relation (populated on fetch)
  exercise?: Exercise
  workout_set_logs?: WorkoutSetLog[]
}

export interface WorkoutSetLog {
  id: string
  user_id: string
  workout_exercise_id: string
  set_number: number
  weight: number | null
  reps: number | null
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ─── Workout History & Sessions (Phase 5 Supabase Schema) ─────────────────────

export interface WorkoutSession {
  id: string
  user_id: string
  workout_id: string | null
  workout_name: string
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  total_exercises: number
  total_sets: number
  completed_sets: number
  total_volume: number
  calories_burned: number | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  
  // Joined relation
  workout_session_sets?: WorkoutSessionSet[]
}

export interface WorkoutSessionSet {
  id: string
  session_id: string
  workout_exercise_id: string | null
  exercise_id: string
  exercise_name: string
  set_number: number
  weight: number | null
  reps: number | null
  completed: boolean
  is_personal_record: boolean
  created_at: string
  updated_at: string
  
  // Joined relation
  exercise?: Exercise
}

// ─── Analytics & Progress (Phase 5) ───────────────────────────────────────────

export interface ProgressStats {
  totalWorkouts: number
  workoutsThisWeek: number
  workoutsThisMonth: number
  totalTrainingTime: number // seconds
  totalVolume: number // kg
  currentStreak: number // days
  longestStreak: number // days
  exercisesPerformed: number
  personalRecordsCount: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface PersonalRecord {
  id: string // this will be the set_id
  exerciseId: string
  exerciseName: string
  value: number
  unit: string
  achievedAt: string
  previousValue?: number
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressEntry {
  date: string
  value: number
  unit: string
  exerciseId?: string
  exerciseName?: string
}

export interface PersonalRecord {
  id: string
  exerciseId: string
  exerciseName: string
  value: number
  unit: string
  achievedAt: string
  previousValue?: number
}

export interface WeeklyActivity {
  day: string  // 'Mon', 'Tue', etc.
  date: string
  trained: boolean
  duration?: number
  volume?: number
}

export interface MonthlyConsistency {
  date: string
  trained: boolean
  duration?: number
}

export interface ProgressMetric {
  label: string
  value: string | number
  unit?: string
  change?: number    // percentage
  trend: 'up' | 'down' | 'neutral'
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface FilterState {
  muscleGroup: MuscleGroup | 'all'
  equipment: EquipmentType | 'all'
  difficulty: DifficultyLevel | 'all'
  category: ExerciseCategory | 'all'
  search: string
}

// ─── AI Coach ───────────────────────────────────────────────────────────────

export interface AIConversation {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface AIWorkoutExercise {
  exercise_name: string
  sets: number
  reps: string
  rest_seconds: number
  notes?: string
}

export interface AIWorkoutProposal {
  name: string
  description: string
  exercises: AIWorkoutExercise[]
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  structured_data: AIWorkoutProposal | null
  created_at: string
}

export interface CoachContext {
  profile?: any
  progress?: any
  recentWorkouts?: any[]
  personalRecords?: any[]
  activePlan?: any
}

