import { supabase } from '@/lib/supabase'
import type { WorkoutPlan, Workout, WorkoutExercise, WorkoutSetLog } from '@/types'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import { emitGymtrackEvent } from '@/lib/events'
import { initPlanInstance } from '@/lib/planProgressService'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUUID(str?: string | null): boolean {
  if (!str) return false
  return UUID_REGEX.test(str)
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getLocalPlans(userId: string): WorkoutPlan[] {
  try {
    const raw = localStorage.getItem(`gymtrack:local_workout_plans_${userId}`) || localStorage.getItem('gymtrack:local_workout_plans')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setLocalPlans(userId: string, plans: WorkoutPlan[]) {
  try {
    localStorage.setItem(`gymtrack:local_workout_plans_${userId}`, JSON.stringify(plans))
    localStorage.setItem('gymtrack:local_workout_plans', JSON.stringify(plans))
  } catch (err) {
    console.warn('[GYMTrack] Error saving local plans:', err)
  }
}

function getLocalWorkouts(userId: string): Workout[] {
  try {
    const raw = localStorage.getItem(`gymtrack:local_workouts_${userId}`) || localStorage.getItem('gymtrack:local_workouts')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setLocalWorkouts(userId: string, workouts: Workout[]) {
  try {
    localStorage.setItem(`gymtrack:local_workouts_${userId}`, JSON.stringify(workouts))
    localStorage.setItem('gymtrack:local_workouts', JSON.stringify(workouts))
  } catch (err) {
    console.warn('[GYMTrack] Error saving local workouts:', err)
  }
}

// ─── Workout Plans ────────────────────────────────────────────────────────────

export async function getWorkoutPlans(userId: string): Promise<{ data: WorkoutPlan[] | null; error: string | null }> {
  const localPlans = getLocalPlans(userId)

  try {
    const { data: dbPlans, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      if (localPlans.length > 0) return { data: localPlans, error: null }
      return { data: null, error: 'Failed to load workout plans.' }
    }

    const combined = [...(dbPlans || [])]
    const ids = new Set(combined.map(p => p.id))
    for (const lp of localPlans) {
      if (!ids.has(lp.id)) {
        combined.push(lp)
        ids.add(lp.id)
      }
    }

    return { data: combined, error: null }
  } catch (err) {
    if (localPlans.length > 0) return { data: localPlans, error: null }
    return { data: null, error: 'Failed to load workout plans.' }
  }
}

export async function getActiveWorkoutPlan(userId: string): Promise<{ data: WorkoutPlan | null; error: string | null }> {
  const localPlans = getLocalPlans(userId)
  const localActive = localPlans.find(p => p.is_active)

  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      if (localActive) return { data: localActive, error: null }
      return { data: null, error: 'Failed to load active plan.' }
    }

    if (data) {
      return { data, error: null }
    }

    return { data: localActive || null, error: null }
  } catch (err) {
    return { data: localActive || null, error: null }
  }
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
  // 1. Remove from local storage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('gymtrack:local_workout_plans')) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          const list = JSON.parse(raw).filter((p: any) => p.id !== id)
          localStorage.setItem(key, JSON.stringify(list))
        }
      } catch {}
    }
  }

  // 2. Remove from Supabase
  try {
    await supabase.from('workout_plans').delete().eq('id', id)
  } catch (err) {
    console.warn('[GYMTrack] deleteWorkoutPlan Supabase notice:', err)
  }

  emitGymtrackEvent('gymtrack:workout_updated')
  return true
}

export async function setActivePlan(userId: string, planId: string): Promise<boolean> {
  // 1. Update local storage
  const localPlans = getLocalPlans(userId)
  const updatedLocal = localPlans.map(p => ({
    ...p,
    is_active: p.id === planId,
    started_at: p.id === planId ? (p.started_at || new Date().toISOString()) : p.started_at
  }))
  setLocalPlans(userId, updatedLocal)

  // 2. Update Supabase
  try {
    await supabase
      .from('workout_plans')
      .update({ is_active: false })
      .eq('user_id', userId)

    await supabase
      .from('workout_plans')
      .update({ 
        is_active: true,
        started_at: new Date().toISOString()
      })
      .eq('id', planId)
      .eq('user_id', userId)
  } catch (err) {
    console.warn('[GYMTrack] setActivePlan Supabase notice:', err)
  }

  emitGymtrackEvent('gymtrack:workout_updated')
  return true
}


// ─── Workouts ─────────────────────────────────────────────────────────────────

export async function getWorkouts(userId: string): Promise<{ data: Workout[] | null; error: string | null }> {
  const localWorkouts = getLocalWorkouts(userId)

  try {
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
      if (localWorkouts.length > 0) return { data: localWorkouts, error: null }
      return { data: null, error: 'Failed to load workouts.' }
    }

    // Merge Supabase workouts with local workouts
    const combined = [...(data || [])]
    const ids = new Set(combined.map(w => w.id))
    for (const lw of localWorkouts) {
      if (!ids.has(lw.id)) {
        combined.push(lw)
        ids.add(lw.id)
      }
    }

    return { data: combined, error: null }
  } catch (err) {
    if (localWorkouts.length > 0) return { data: localWorkouts, error: null }
    return { data: null, error: 'Failed to load workouts.' }
  }
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

// ─── Starter Routine Generator ────────────────────────────────────────────────

export async function createStarterRoutine(userId: string): Promise<{ data: WorkoutPlan | null; error: string | null }> {
  try {
    // 1. Create a 3-day Starter Plan
    const { data: plan, error: pErr } = await supabase
      .from('workout_plans')
      .insert({
        user_id: userId,
        name: 'Push Pull Legs (Starter Split)',
        description: 'A proven 3-day routine targeting all major muscle groups with balanced compound and isolation work.',
        goal: 'build_muscle',
        difficulty: 'beginner',
        days_per_week: 3,
        is_active: true
      })
      .select()
      .single()

    if (pErr || !plan) throw new Error(pErr?.message || 'Failed to create starter plan')

    // 2. Query available exercises to link to workouts
    const { data: allExercises } = await supabase
      .from('exercises')
      .select('id, slug, name')

    const exMap = new Map<string, string>()
    allExercises?.forEach(ex => {
      exMap.set(ex.slug, ex.id)
      exMap.set(ex.name.toLowerCase(), ex.id)
    })

    const findExId = (...candidates: string[]) => {
      for (const c of candidates) {
        if (exMap.has(c)) return exMap.get(c)
        if (exMap.has(c.toLowerCase())) return exMap.get(c.toLowerCase())
      }
      return allExercises?.[0]?.id || null
    }

    // 3. Create 3 Workouts
    const templates = [
      {
        name: 'Push Day (Chest, Shoulders, Triceps)',
        day_number: 1,
        estimated_duration: 50,
        target_muscle_groups: ['chest', 'shoulders', 'triceps'],
        description: 'Focus on horizontal pressing, overhead strength, and triceps extension.',
        exercises: [
          { slug: 'bench-press', sets: 3, reps: '8-10', weight: 50, rest_seconds: 120 },
          { slug: 'incline-bench-press', sets: 3, reps: '10-12', weight: 40, rest_seconds: 90 },
          { slug: 'overhead-press', sets: 3, reps: '8-10', weight: 35, rest_seconds: 90 },
          { slug: 'tricep-pushdown', sets: 3, reps: '12-15', weight: 20, rest_seconds: 60 }
        ]
      },
      {
        name: 'Pull Day (Back & Biceps)',
        day_number: 2,
        estimated_duration: 50,
        target_muscle_groups: ['back', 'biceps'],
        description: 'Focus on vertical and horizontal pulls for back width, thickness, and arm size.',
        exercises: [
          { slug: 'deadlift', sets: 3, reps: '5', weight: 70, rest_seconds: 180 },
          { slug: 'barbell-row', sets: 3, reps: '8-10', weight: 45, rest_seconds: 90 },
          { slug: 'pull-up', sets: 3, reps: '6-8', weight: null, rest_seconds: 90 },
          { slug: 'dumbbell-bicep-curl', sets: 3, reps: '10-12', weight: 12, rest_seconds: 60 }
        ]
      },
      {
        name: 'Leg Day (Quads, Hamstrings, Calves)',
        day_number: 3,
        estimated_duration: 55,
        target_muscle_groups: ['legs', 'quads', 'hamstrings'],
        description: 'Lower body power development targeting quadriceps, hamstrings, and core.',
        exercises: [
          { slug: 'barbell-squat', sets: 3, reps: '8-10', weight: 60, rest_seconds: 150 },
          { slug: 'romanian-deadlift', sets: 3, reps: '10-12', weight: 50, rest_seconds: 90 },
          { slug: 'leg-press', sets: 3, reps: '12-15', weight: 80, rest_seconds: 90 },
          { slug: 'calf-raise', sets: 3, reps: '15-20', weight: 30, rest_seconds: 60 }
        ]
      }
    ]

    for (const t of templates) {
      const { data: wo } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          plan_id: plan.id,
          name: t.name,
          day_number: t.day_number,
          description: t.description,
          estimated_duration: t.estimated_duration,
          target_muscle_groups: t.target_muscle_groups
        })
        .select()
        .single()

      if (wo) {
        for (let i = 0; i < t.exercises.length; i++) {
          const item = t.exercises[i]
          const exerciseId = findExId(item.slug)
          if (exerciseId) {
            await supabase.from('workout_exercises').insert({
              workout_id: wo.id,
              exercise_id: exerciseId,
              exercise_order: i + 1,
              sets: item.sets,
              reps: item.reps,
              weight: item.weight,
              rest_seconds: item.rest_seconds
            })
          }
        }
      }
    }

    return { data: plan, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { data: null, error: msg }
  }
}

export async function getPreviousExercisePerformance(exerciseId: string, userId: string): Promise<{ weight: number; reps: number } | null> {
  try {
    const { data } = await supabase
      .from('workout_session_sets')
      .select('weight, reps')
      .eq('exercise_id', exerciseId)
      .not('weight', 'is', null)
      .not('reps', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data && data.weight != null && data.reps != null) {
      return { weight: Number(data.weight), reps: Number(data.reps) }
    }
  } catch (err) {
    console.warn('[GYMTrack] Error fetching previous performance:', err)
  }
  return null
}

// ─── Multi-Week Structured Plans Engine ───────────────────────────────────────

import type { StructuredPlanDefinition } from '@/types'

export async function saveStructuredPlan(
  userId: string,
  definition: StructuredPlanDefinition
): Promise<{ data: WorkoutPlan | null; error: string | null }> {
  try {
    // Check if user has an active authenticated session
    const { data: sessionData } = await supabase.auth.getSession()
    const isAuthenticated = Boolean(sessionData?.session?.user && sessionData.session.user.id === userId)

    let savedPlan: WorkoutPlan | null = null

    if (isAuthenticated) {
      const { data: plan, error: planErr } = await supabase
        .from('workout_plans')
        .insert({
          user_id: userId,
          name: definition.plan_name,
          description: `${definition.goal} • ${definition.duration_weeks} Weeks • ${definition.training_days_per_week} days/week`,
          goal: definition.goal,
          difficulty: definition.difficulty,
          days_per_week: definition.training_days_per_week,
          duration_weeks: definition.duration_weeks,
          session_duration: definition.session_duration,
          training_location: definition.training_location,
          available_equipment: definition.available_equipment,
          plan_data: definition,
          is_active: false
        })
        .select()
        .single()

      if (!planErr && plan) {
        savedPlan = plan

        // 2. Fetch exercise lookup table from database
        const { data: exercisesData } = await supabase.from('exercises').select('id, slug, name')
        const exerciseMap = new Map<string, string>()
        if (exercisesData) {
          for (const ex of exercisesData) {
            exerciseMap.set(ex.slug, ex.id)
            exerciseMap.set(ex.name.toLowerCase(), ex.id)
            exerciseMap.set(ex.id, ex.id)
          }
        }

        // 3. Insert Workouts for each day in weekly schedule
        for (const day of definition.weekly_schedule) {
          const { data: wo, error: woErr } = await supabase
            .from('workouts')
            .insert({
              plan_id: plan.id,
              user_id: userId,
              name: day.focus || day.day_name,
              description: `${day.day_name}: ${day.focus}`,
              day_number: day.day_number,
              day_type: day.day_type,
              estimated_duration: day.estimated_duration
            })
            .select()
            .single()

          if (!woErr && wo && day.exercises && day.exercises.length > 0) {
            for (let i = 0; i < day.exercises.length; i++) {
              const exItem = day.exercises[i]
              let exId: string | undefined = undefined

              // Check if exItem.exercise_id is already a valid UUID
              if (exItem.exercise_id && isUUID(exItem.exercise_id)) {
                exId = exItem.exercise_id
              }

              // Match by slug or name in database
              if (!exId && exItem.exercise_slug) {
                exId = exerciseMap.get(exItem.exercise_slug)
              }
              if (!exId) {
                exId = exerciseMap.get(exItem.exercise_name.toLowerCase())
              }
              // Fallback to any valid database exercise id to satisfy foreign key
              if (!exId && exercisesData && exercisesData.length > 0) {
                exId = exercisesData[0].id
              }

              if (exId && isUUID(exId)) {
                await supabase.from('workout_exercises').insert({
                  workout_id: wo.id,
                  exercise_id: exId,
                  exercise_order: i + 1,
                  sets: exItem.sets || 3,
                  reps: String(exItem.reps || '8-12'),
                  rest_seconds: exItem.rest_seconds || 90
                })
              }
            }
          }
        }
      } else if (planErr) {
        console.warn('[GYMTrack] Supabase saveStructuredPlan failed, falling back to local persistence:', planErr.message)
      }
    }

    // If unauthenticated, in demo mode, or if Supabase insert was rejected by RLS, save locally with complete relational structure
    if (!savedPlan) {
      const planId = generateUUID()
      const now = new Date().toISOString()
      savedPlan = {
        id: planId,
        user_id: userId,
        name: definition.plan_name,
        description: `${definition.goal} • ${definition.duration_weeks} Weeks • ${definition.training_days_per_week} days/week`,
        goal: definition.goal,
        difficulty: definition.difficulty,
        days_per_week: definition.training_days_per_week,
        duration_weeks: definition.duration_weeks,
        session_duration: definition.session_duration,
        training_location: definition.training_location,
        available_equipment: definition.available_equipment,
        plan_data: definition,
        is_active: false,
        created_at: now,
        updated_at: now
      }

      // Generate local workouts and workout exercises with rich exercise data from DEFAULT_EXERCISES
      const generatedWorkouts: Workout[] = definition.weekly_schedule.map(day => {
        const woId = generateUUID()
        const exercisesList = (day.exercises || []).map((exItem, idx) => {
          const catalogEx = DEFAULT_EXERCISES.find(e => 
            e.slug === exItem.exercise_slug || 
            e.name.toLowerCase() === exItem.exercise_name.toLowerCase() ||
            e.id === exItem.exercise_id
          ) || DEFAULT_EXERCISES[0]

          return {
            id: generateUUID(),
            workout_id: woId,
            exercise_id: catalogEx.id,
            exercise_order: idx + 1,
            sets: exItem.sets || 3,
            reps: String(exItem.reps || '8-12'),
            weight: null,
            rest_seconds: exItem.rest_seconds || 90,
            notes: null,
            created_at: now,
            updated_at: now,
            exercise: catalogEx
          }
        })

        return {
          id: woId,
          plan_id: planId,
          user_id: userId,
          name: day.focus || day.day_name,
          description: `${day.day_name}: ${day.focus}`,
          day_number: day.day_number,
          day_type: day.day_type,
          notes: null,
          estimated_duration: day.estimated_duration,
          created_at: now,
          updated_at: now,
          workout_exercises: exercisesList
        }
      })

      // Persist to local storage
      const localPlans = getLocalPlans(userId)
      localPlans.unshift(savedPlan)
      setLocalPlans(userId, localPlans)

      const existingWorkouts = getLocalWorkouts(userId)
      setLocalWorkouts(userId, [...generatedWorkouts, ...existingWorkouts])
    }

    emitGymtrackEvent('gymtrack:workout_updated')
    return { data: savedPlan, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[GYMTrack] Exception in saveStructuredPlan:', msg)
    return { data: null, error: msg }
  }
}

export async function activatePlan(
  userId: string,
  planId: string,
  options?: { isNewInstance?: boolean }
): Promise<boolean> {
  const isNew = Boolean(options?.isNewInstance)
  try {
    const localPlans = getLocalPlans(userId)
    const targetPlan = localPlans.find(p => p.id === planId)

    // Initialize or resume plan instance
    const { startedAt } = await initPlanInstance(
      planId,
      userId,
      isNew,
      isNew ? null : targetPlan?.started_at
    )

    // 1. Update local storage
    const updatedLocal = localPlans.map(p => ({
      ...p,
      is_active: p.id === planId,
      started_at: p.id === planId ? startedAt : p.started_at
    }))
    setLocalPlans(userId, updatedLocal)

    // 2. Update Supabase
    try {
      await supabase
        .from('workout_plans')
        .update({ is_active: false })
        .eq('user_id', userId)

      await supabase
        .from('workout_plans')
        .update({ 
          is_active: true,
          started_at: startedAt
        })
        .eq('id', planId)
        .eq('user_id', userId)
    } catch (err) {
      console.warn('[GYMTrack] activatePlan Supabase notice:', err)
    }

    emitGymtrackEvent('gymtrack:workout_updated')
    return true
  } catch (err) {
    console.error('[GYMTrack] activatePlan exception:', err)
    return false
  }
}

export async function pauseActivePlan(userId: string, planId: string): Promise<boolean> {
  try {
    // 1. Update local storage
    const localPlans = getLocalPlans(userId)
    const updatedLocal = localPlans.map(p => p.id === planId ? { ...p, is_active: false } : p)
    setLocalPlans(userId, updatedLocal)

    // 2. Update Supabase
    try {
      await supabase
        .from('workout_plans')
        .update({ is_active: false })
        .eq('id', planId)
        .eq('user_id', userId)
    } catch (err) {
      console.warn('[GYMTrack] pauseActivePlan Supabase notice:', err)
    }

    emitGymtrackEvent('gymtrack:workout_updated')
    return true
  } catch (err) {
    console.error('[GYMTrack] pauseActivePlan exception:', err)
    return false
  }
}

export async function getPlanDayCompletions(
  planId: string,
  userId: string
): Promise<{ week_number: number; day_number: number; status: string; completed_at: string }[]> {
  const localKey = `gymtrack:plan_day_completions_${planId}_${userId}`
  let localComps: { week_number: number; day_number: number; status: string; completed_at: string }[] = []
  try {
    const raw = localStorage.getItem(localKey)
    if (raw) localComps = JSON.parse(raw)
  } catch {}

  try {
    const { data, error } = await supabase
      .from('plan_day_completions')
      .select('week_number, day_number, status, completed_at')
      .eq('plan_id', planId)
      .eq('user_id', userId)

    if (error || !data) {
      return localComps
    }

    const merged = [...data]
    const set = new Set(data.map(d => `${d.week_number}_${d.day_number}`))
    for (const lc of localComps) {
      if (!set.has(`${lc.week_number}_${lc.day_number}`)) {
        merged.push(lc)
      }
    }
    return merged
  } catch (err) {
    console.warn('[GYMTrack] Error fetching plan completions:', err)
    return localComps
  }
}

export async function markPlanDayCompleted(
  planId: string,
  userId: string,
  weekNumber: number,
  dayNumber: number,
  workoutId?: string,
  completedExercises = 0,
  totalExercises = 0
): Promise<boolean> {
  const now = new Date().toISOString()

  // 1. Local update
  const localKey = `gymtrack:plan_day_completions_${planId}_${userId}`
  let localComps: any[] = []
  try {
    const raw = localStorage.getItem(localKey)
    if (raw) localComps = JSON.parse(raw)
  } catch {}

  const existingIdx = localComps.findIndex(c => c.week_number === weekNumber && c.day_number === dayNumber)
  const newComp = {
    plan_id: planId,
    user_id: userId,
    week_number: weekNumber,
    day_number: dayNumber,
    workout_id: workoutId || null,
    status: 'completed',
    completed_exercises: completedExercises,
    total_exercises: totalExercises,
    completed_at: now
  }

  if (existingIdx >= 0) {
    localComps[existingIdx] = newComp
  } else {
    localComps.push(newComp)
  }
  try {
    localStorage.setItem(localKey, JSON.stringify(localComps))
  } catch {}

  // 2. Supabase update
  try {
    await supabase
      .from('plan_day_completions')
      .upsert(newComp, { onConflict: 'plan_id,user_id,week_number,day_number' })
  } catch (dbErr) {
    console.warn('[GYMTrack] markPlanDayCompleted Supabase notice:', dbErr)
  }

  emitGymtrackEvent('gymtrack:workout_updated')
  emitGymtrackEvent('gymtrack:session_completed')
  return true
}

