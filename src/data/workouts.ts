export interface MockWorkoutExerciseSet {
  id: string
  targetReps?: number
  targetWeight?: number
  targetDuration?: number
  restTime: number
}

export interface MockWorkoutExercise {
  id: string
  exerciseId: string
  order: number
  sets: MockWorkoutExerciseSet[]
}

export interface MockWorkout {
  id: string
  name: string
  description: string
  estimated_duration: number
  lastCompleted?: string
  created_at: string
  isTemplate: boolean
  tags: string[]
  exercises: MockWorkoutExercise[]
}

export const workouts: MockWorkout[] = []

export function getWorkoutById(id: string): MockWorkout | undefined {
  return workouts.find(w => w.id === id)
}
