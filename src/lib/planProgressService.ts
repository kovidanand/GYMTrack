import { supabase } from '@/lib/supabase'
import { emitGymtrackEvent } from '@/lib/events'

export interface PlanExerciseCompletion {
  instanceId: string
  planId: string
  weekNumber: number
  dayNumber: number
  workoutExerciseId?: string
  exerciseId: string
  exerciseName?: string
  completedAt: string
  sessionId?: string
  setsCount?: number
}

export interface PlanInstanceData {
  instanceId: string
  startedAt: string
  completedExercises: Record<string, PlanExerciseCompletion>
}

export interface PlanProgressState {
  planId: string
  userId: string
  activeInstanceId: string
  instances: Record<string, PlanInstanceData>
}

const LOCAL_PROGRESS_PREFIX = 'gymtrack:plan_progress_'

function getCacheKey(planId: string, userId: string): string {
  return `${LOCAL_PROGRESS_PREFIX}${planId}_${userId}`
}

function getCompletionKey(weekNumber: number, dayNumber: number, identifier: string): string {
  return `w${weekNumber}_d${dayNumber}_${identifier.toLowerCase()}`
}

export function generateInstanceId(): string {
  return `inst_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Load plan progress from local cache
 */
export function getLocalPlanProgress(planId: string, userId: string): PlanProgressState | null {
  try {
    const raw = localStorage.getItem(getCacheKey(planId, userId))
    if (raw) return JSON.parse(raw) as PlanProgressState
  } catch (err) {
    console.warn('[PlanProgress] Error reading local progress cache:', err)
  }
  return null
}

/**
 * Save plan progress to local cache
 */
export function setLocalPlanProgress(planId: string, userId: string, state: PlanProgressState): void {
  try {
    localStorage.setItem(getCacheKey(planId, userId), JSON.stringify(state))
  } catch (err) {
    console.warn('[PlanProgress] Error writing local progress cache:', err)
  }
}

/**
 * Sync plan progress state to Supabase workout_plans.plan_data
 */
async function syncProgressToSupabase(planId: string, userId: string, state: PlanProgressState): Promise<void> {
  try {
    const { data: planRow } = await supabase
      .from('workout_plans')
      .select('plan_data')
      .eq('id', planId)
      .eq('user_id', userId)
      .single()

    const currentPlanData = planRow?.plan_data || {}
    const updatedPlanData = {
      ...currentPlanData,
      current_instance_id: state.activeInstanceId,
      progress: {
        activeInstanceId: state.activeInstanceId,
        instances: state.instances
      }
    }

    await supabase
      .from('workout_plans')
      .update({ plan_data: updatedPlanData })
      .eq('id', planId)
      .eq('user_id', userId)
  } catch (err) {
    console.warn('[PlanProgress] Error syncing progress to Supabase:', err)
  }
}

/**
 * Initialize or resume a plan instance.
 * If isNew = true (Start New Plan), generates a fresh instanceId with 0 completed exercises.
 * If isNew = false (Resume Plan), restores the existing instance and past completions.
 */
export async function initPlanInstance(
  planId: string,
  userId: string,
  isNew: boolean = false,
  existingStartedAt?: string | null
): Promise<PlanInstanceData> {
  let state = getLocalPlanProgress(planId, userId)

  // Also check remote plan_data if local cache is empty
  if (!state) {
    try {
      const { data: planRow } = await supabase
        .from('workout_plans')
        .select('plan_data, started_at')
        .eq('id', planId)
        .eq('user_id', userId)
        .single()

      if (planRow?.plan_data?.progress) {
        const remoteProg = planRow.plan_data.progress
        state = {
          planId,
          userId,
          activeInstanceId: remoteProg.activeInstanceId,
          instances: remoteProg.instances || {}
        }
      }
    } catch {}
  }

  const now = new Date().toISOString()

  if (isNew || !state || !state.activeInstanceId || !state.instances[state.activeInstanceId]) {
    // Brand new instance
    const newInstanceId = generateInstanceId()
    const startedAt = now

    const newInstanceData: PlanInstanceData = {
      instanceId: newInstanceId,
      startedAt,
      completedExercises: {}
    }

    const newState: PlanProgressState = {
      planId,
      userId,
      activeInstanceId: newInstanceId,
      instances: {
        ...(state?.instances || {}),
        [newInstanceId]: newInstanceData
      }
    }

    setLocalPlanProgress(planId, userId, newState)
    syncProgressToSupabase(planId, userId, newState).catch(() => {})
    emitGymtrackEvent('gymtrack:plan_progress_updated', { planId, instanceId: newInstanceId })
    return newInstanceData
  }

  // Resume existing instance
  const activeInstance = state.instances[state.activeInstanceId]
  const startedAt = existingStartedAt || activeInstance.startedAt || now
  activeInstance.startedAt = startedAt

  setLocalPlanProgress(planId, userId, state)
  syncProgressToSupabase(planId, userId, state).catch(() => {})
  emitGymtrackEvent('gymtrack:plan_progress_updated', { planId, instanceId: state.activeInstanceId })
  return activeInstance
}

/**
 * Retrieve current active instance data
 */
export function getActivePlanInstance(planId: string, userId: string): PlanInstanceData | null {
  const state = getLocalPlanProgress(planId, userId)
  if (!state || !state.activeInstanceId) return null
  return state.instances[state.activeInstanceId] || null
}

/**
 * Check whether a specific plan exercise occurrence is completed in the current plan instance.
 * Scoped strictly to: instanceId + weekNumber + dayNumber + (workoutExerciseId || exerciseId).
 * Supports both object signature and positional parameters.
 */
export function isPlanExerciseCompleted(
  planIdOrParams:
    | string
    | {
        planId?: string | null
        userId?: string | null
        instanceId?: string | null
        weekNumber: number
        dayNumber: number
        workoutExerciseId?: string | null
        exerciseId?: string | null
        exerciseSlug?: string | null
        exerciseName?: string | null
      }
    | null
    | undefined,
  userId?: string | null,
  weekNumber?: number,
  dayNumber?: number,
  workoutExerciseId?: string | null,
  exerciseId?: string | null
): boolean {
  let planId: string | null | undefined
  let effectiveUserId: string | null | undefined
  let instanceId: string | null | undefined
  let week = 1
  let day = 1
  let weId: string | null | undefined
  let exId: string | null | undefined
  let slug: string | null | undefined
  let name: string | null | undefined

  if (typeof planIdOrParams === 'object' && planIdOrParams !== null) {
    planId = planIdOrParams.planId
    effectiveUserId = planIdOrParams.userId
    instanceId = planIdOrParams.instanceId
    week = planIdOrParams.weekNumber
    day = planIdOrParams.dayNumber
    weId = planIdOrParams.workoutExerciseId
    exId = planIdOrParams.exerciseId
    slug = planIdOrParams.exerciseSlug
    name = planIdOrParams.exerciseName
  } else {
    planId = planIdOrParams
    effectiveUserId = userId
    week = weekNumber || 1
    day = dayNumber || 1
    weId = workoutExerciseId
    exId = exerciseId
  }

  if (!planId || !effectiveUserId) return false

  const state = getLocalPlanProgress(planId, effectiveUserId)
  if (!state) return false

  const targetInstanceId = instanceId || state.activeInstanceId
  if (!targetInstanceId) return false

  const instance = state.instances[targetInstanceId]
  if (!instance || !instance.completedExercises) return false

  // Check matching keys for this specific week and day
  const identifiers = [
    weId,
    exId,
    slug,
    name?.toLowerCase()
  ].filter(Boolean) as string[]

  for (const id of identifiers) {
    const key = getCompletionKey(week, day, id)
    if (instance.completedExercises[key]) {
      return true
    }
  }

  return false
}

/**
 * Mark a specific plan exercise occurrence as completed in the current plan instance.
 */
export async function markPlanExerciseCompleted(params: {
  planId: string
  userId: string
  instanceId: string
  weekNumber: number
  dayNumber: number
  workoutExerciseId?: string
  exerciseId: string
  exerciseName?: string
  sessionId?: string
  setsCount?: number
}): Promise<boolean> {
  const { planId, userId, instanceId, weekNumber, dayNumber, workoutExerciseId, exerciseId, exerciseName, sessionId, setsCount } = params
  let state = getLocalPlanProgress(planId, userId)

  if (!state) {
    state = {
      planId,
      userId,
      activeInstanceId: instanceId,
      instances: {
        [instanceId]: {
          instanceId,
          startedAt: new Date().toISOString(),
          completedExercises: {}
        }
      }
    }
  }

  if (!state.instances[instanceId]) {
    state.instances[instanceId] = {
      instanceId,
      startedAt: new Date().toISOString(),
      completedExercises: {}
    }
  }

  const record: PlanExerciseCompletion = {
    instanceId,
    planId,
    weekNumber,
    dayNumber,
    workoutExerciseId,
    exerciseId,
    exerciseName,
    completedAt: new Date().toISOString(),
    sessionId,
    setsCount
  }

  // Register completion under workoutExerciseId, exerciseId, and exerciseName for resilient matching
  const keysToRegister = [
    workoutExerciseId ? getCompletionKey(weekNumber, dayNumber, workoutExerciseId) : null,
    exerciseId ? getCompletionKey(weekNumber, dayNumber, exerciseId) : null,
    exerciseName ? getCompletionKey(weekNumber, dayNumber, exerciseName.toLowerCase()) : null
  ].filter(Boolean) as string[]

  for (const k of keysToRegister) {
    state.instances[instanceId].completedExercises[k] = record
  }

  setLocalPlanProgress(planId, userId, state)
  await syncProgressToSupabase(planId, userId, state)
  emitGymtrackEvent('gymtrack:plan_progress_updated', { planId, instanceId })
  return true
}

/**
 * Reset a plan to start fresh from Week 1 Day 1 with 0 completed exercises.
 */
export async function resetPlanToFresh(planId: string, userId: string): Promise<PlanInstanceData> {
  return initPlanInstance(planId, userId, true)
}
