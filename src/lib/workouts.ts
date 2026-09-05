import { supabase } from '@/lib/supabase'
import type { WorkoutPlan, Workout, WorkoutExercise, WorkoutSetLog } from '@/types'

// ─── Workout Plans ────────────────────────────────────────────────────────────

export async function getWorkoutPlans(userId: string): Promise<{ data: WorkoutPlan[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GYMTrack] getWorkoutPlans error:', error.message)
    return { data: null, error: 'Failed to load workout plans.' }
  }
  return { data, error: null }
}

export async function getActiveWorkoutPlan(userId: string): Promise<{ data: WorkoutPlan | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('[GYMTrack] getActiveWorkoutPlan error:', error.message)
    return { data: null, error: 'Failed to load active plan.' }
  }
  return { data: data || null, error: null }
}

export async function createWorkoutPlan(plan: Partial<WorkoutPlan>): Promise<{ data: WorkoutPlan | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workout_plans')
    .insert(plan)
    .select()
    .single()

  if (error) {
    console.error('[GYMTrack] createWorkoutPlan error:', error.message)
    return { data: null, error: 'Failed to create plan.' }
  }
  return { data, error: null }
}

export async function updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<{ data: WorkoutPlan | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workout_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[GYMTrack] updateWorkoutPlan error:', error.message)
    return { data: null, error: 'Failed to update plan.' }
  }
  return { data, error: null }
}

export async function deleteWorkoutPlan(id: string): Promise<boolean> {
  const { error } = await supabase.from('workout_plans').delete().eq('id', id)
  if (error) {
    console.error('[GYMTrack] deleteWorkoutPlan error:', error.message)
    return false
  }
  return true
}

export async function setActivePlan(userId: string, planId: string): Promise<boolean> {
  // First, deactivate all plans for the user
  const { error: err1 } = await supabase
    .from('workout_plans')
    .update({ is_active: false })
    .eq('user_id', userId)
    
  if (err1) {
    console.error('[GYMTrack] Error deactivating plans:', err1.message)
    return false
  }

  // Then activate the target plan
  const { error: err2 } = await supabase
    .from('workout_plans')
    .update({ is_active: true })
    .eq('id', planId)
    .eq('user_id', userId)

  if (err2) {
    console.error('[GYMTrack] Error activating plan:', err2.message)
    return false
  }

  return true
}


// ─── Workouts ─────────────────────────────────────────────────────────────────

export async function getWorkouts(userId: string): Promise<{ data: Workout[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercises (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GYMTrack] getWorkouts error:', error.message)
    return { data: null, error: 'Failed to load workouts.' }
  }
  return { data, error: null }
}

export async function getWorkoutById(id: string): Promise<{ data: Workout | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercises (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('[GYMTrack] getWorkoutById error:', error.message)
    return { data: null, error: 'Failed to load workout.' }
  }
  
  // Sort workout exercises by order
  if (data && data.workout_exercises) {
    data.workout_exercises.sort((a: WorkoutExercise, b: WorkoutExercise) => a.exercise_order - b.exercise_order)
  }
  
  return { data, error: null }
}

export async function createWorkout(workout: Partial<Workout>): Promise<{ data: Workout | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workouts')
    .insert(workout)
    .select()
    .single()

  if (error) {
    console.error('[GYMTrack] createWorkout error:', error.message)
    return { data: null, error: 'Failed to create workout.' }
  }
  return { data, error: null }
}

export async function updateWorkout(id: string, updates: Partial<Workout>): Promise<{ data: Workout | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[GYMTrack] updateWorkout error:', error.message)
    return { data: null, error: 'Failed to update workout.' }
  }
  return { data, error: null }
}

export async function deleteWorkout(id: string): Promise<boolean> {
  const { error } = await supabase.from('workouts').delete().eq('id', id)
  if (error) {
    console.error('[GYMTrack] deleteWorkout error:', error.message)
    return false
  }
  return true
}


// ─── Workout Exercises ────────────────────────────────────────────────────────

export async function addWorkoutExercise(workoutExercise: Partial<WorkoutExercise>): Promise<{ data: WorkoutExercise | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert(workoutExercise)
    .select(`*, exercise:exercises(*)`)
    .single()

  if (error) {
    console.error('[GYMTrack] addWorkoutExercise error:', error.message)
    return { data: null, error: 'Failed to add exercise to workout.' }
  }
  return { data, error: null }
}

export async function updateWorkoutExercise(id: string, updates: Partial<WorkoutExercise>): Promise<boolean> {
  const { error } = await supabase
    .from('workout_exercises')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('[GYMTrack] updateWorkoutExercise error:', error.message)
    return false
  }
  return true
}

export async function deleteWorkoutExercise(id: string): Promise<boolean> {
  const { error } = await supabase.from('workout_exercises').delete().eq('id', id)
  if (error) {
    console.error('[GYMTrack] deleteWorkoutExercise error:', error.message)
    return false
  }
  return true
}


// ─── Workout Set Logs ─────────────────────────────────────────────────────────

export async function logSet(setLog: Partial<WorkoutSetLog>): Promise<{ data: WorkoutSetLog | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workout_set_logs')
    .insert({
      ...setLog,
      completed_at: setLog.completed ? new Date().toISOString() : null
    })
    .select()
    .single()

  if (error) {
    console.error('[GYMTrack] logSet error:', error.message)
    return { data: null, error: 'Failed to log set.' }
  }
  return { data, error: null }
}
