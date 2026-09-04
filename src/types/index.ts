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
  category: ExerciseCategory
  muscleGroup: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  equipment: EquipmentType[]
  difficulty: DifficultyLevel
  instructions: string[]
  tips: string[]
  commonMistakes: string[]
  imageUrl?: string
  videoUrl?: string
  tags: string[]
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

// ─── Workouts ─────────────────────────────────────────────────────────────────

export interface Workout {
  id: string
  name: string
  description?: string
  exercises: WorkoutExercise[]
  estimatedDuration: number // minutes
  createdAt: string
  lastCompleted?: string
  tags: string[]
  isTemplate: boolean
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  exercise?: Exercise
  sets: SetConfig[]
  order: number
  notes?: string
}

export interface SetConfig {
  id: string
  targetReps?: number
  targetWeight?: number  // kg
  targetDuration?: number // seconds
  restTime: number // seconds
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

export interface WorkoutSession {
  id: string
  workoutId: string
  workoutName: string
  startedAt: string
  completedAt?: string
  duration: number // minutes
  exercises: SessionExercise[]
  totalVolume: number // kg
  notes?: string
}

export interface SessionExercise {
  id: string
  exerciseId: string
  exerciseName: string
  sets: WorkoutSet[]
}

export interface WorkoutSet {
  id: string
  setNumber: number
  reps?: number
  weight?: number  // kg
  duration?: number // seconds
  completed: boolean
  isPersonalRecord: boolean
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
