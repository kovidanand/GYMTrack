/**
 * GYMTrack Home Dashboard Data Aggregation & Local Date Layer
 * 
 * Provides unified, reliable aggregation of today's workout sessions and sets
 * strictly bound to the user's local day, with instant reactivity and fallback guards.
 */

import type { WorkoutSession, WorkoutSessionSet } from '@/types'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'

// Pre-build map for fast exercise name resolution by id, slug, or normalized name
const EXERCISE_CATALOG_MAP = new Map<string, string>()
DEFAULT_EXERCISES.forEach(ex => {
  EXERCISE_CATALOG_MAP.set(ex.id, ex.name)
  EXERCISE_CATALOG_MAP.set(ex.id.toLowerCase(), ex.name)
  EXERCISE_CATALOG_MAP.set(ex.id.replace(/^ex-/, ''), ex.name)
  EXERCISE_CATALOG_MAP.set(ex.slug, ex.name)
  EXERCISE_CATALOG_MAP.set(ex.slug.toLowerCase(), ex.name)
  EXERCISE_CATALOG_MAP.set(ex.name.toLowerCase(), ex.name)
})

export interface TodayExerciseBreakdownItem {
  exerciseId: string
  name: string
  sets: number
  reps: number
  minWeight: number
  maxWeight: number
  weightDisplay: string
  volume: number
}

export interface TodayMetrics {
  exercises: number
  sets: number
  volume: number
  durationMins: number
  durationSeconds: number
  workoutName: string | null
  exerciseBreakdown: TodayExerciseBreakdownItem[]
  hasActivity: boolean
}

/**
 * Returns the start of the local day (00:00:00.000) for a given date.
 */
export function getLocalDayStart(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

/**
 * Returns the end of the local day (23:59:59.999) for a given date.
 */
export function getLocalDayEnd(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

/**
 * Checks if two dates fall on the same local calendar day.
 */
export function isSameDayLocal(d1: Date | string, d2: Date | string = new Date()): boolean {
  const date1 = typeof d1 === 'string' ? new Date(d1) : d1
  const date2 = typeof d2 === 'string' ? new Date(d2) : d2
  
  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return false

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Checks if a given timestamp falls on today in the user's local timezone.
 */
export function isTodayLocal(date: Date | string): boolean {
  return isSameDayLocal(date, new Date())
}

/**
 * Resolves an exercise name from the set, session, or default exercise catalog.
 */
export function resolveExerciseName(set?: Partial<WorkoutSessionSet> | null, defaultName = 'Exercise'): string {
  if (!set) return defaultName
  
  if (set.exercise_name && set.exercise_name.trim()) {
    return set.exercise_name.trim()
  }

  if (set.exercise?.name && set.exercise.name.trim()) {
    return set.exercise.name.trim()
  }

  if (set.exercise_id) {
    const fromCatalog = EXERCISE_CATALOG_MAP.get(set.exercise_id)
    if (fromCatalog) return fromCatalog
  }

  return defaultName
}

/**
 * Filters a list of workout sessions to strictly those started today (local calendar day).
 */
export function filterTodaySessions(sessions: WorkoutSession[], referenceDate = new Date()): WorkoutSession[] {
  return sessions.filter(session => {
    if (!session.started_at) return false
    return isSameDayLocal(session.started_at, referenceDate)
  })
}

/**
 * Derives today's dashboard metrics from the actual persisted workout/session records.
 * Ensures that if sets exist, exercise count and volume are accurately computed.
 */
export function aggregateTodayMetrics(todaySessions: WorkoutSession[]): TodayMetrics {
  let totalSets = 0
  let totalVolume = 0
  let totalDurationSecs = 0
  let primaryWorkoutName: string | null = null

  // Map keyed by distinct exercise identifier (exercise_id or resolved name)
  const breakdownMap = new Map<string, TodayExerciseBreakdownItem>()

  for (const session of todaySessions) {
    totalDurationSecs += session.duration_seconds || 0
    if (!primaryWorkoutName && session.workout_name) {
      primaryWorkoutName = session.workout_name
    }

    const sets = session.workout_session_sets || []

    if (sets.length > 0) {
      for (const set of sets) {
        // Consider set completed unless explicitly marked false
        if (set.completed === false) continue

        totalSets += 1
        const weight = Number(set.weight) || 0
        const reps = Number(set.reps) || 0
        const setVolume = weight * reps
        totalVolume += setVolume

        const resolvedName = resolveExerciseName(set, session.workout_name || 'Exercise')
        const exerciseKey = (set.exercise_id || resolvedName).toLowerCase()

        const existing = breakdownMap.get(exerciseKey)
        if (!existing) {
          breakdownMap.set(exerciseKey, {
            exerciseId: set.exercise_id || exerciseKey,
            name: resolvedName,
            sets: 1,
            reps: reps,
            minWeight: weight,
            maxWeight: weight,
            weightDisplay: weight > 0 ? `${weight} kg` : 'Bodyweight',
            volume: setVolume
          })
        } else {
          existing.sets += 1
          existing.reps += reps
          existing.volume += setVolume
          if (weight < existing.minWeight) existing.minWeight = weight
          if (weight > existing.maxWeight) existing.maxWeight = weight
          
          if (existing.minWeight === existing.maxWeight) {
            existing.weightDisplay = existing.maxWeight > 0 ? `${existing.maxWeight} kg` : 'Bodyweight'
          } else {
            existing.weightDisplay = `${existing.minWeight} kg → ${existing.maxWeight} kg`
          }
        }
      }
    } else {
      // Fallback to session-level aggregates when sets relation was not eager loaded
      const sessionSets = session.completed_sets || session.total_sets || 0
      const sessionVol = Number(session.total_volume) || 0
      totalSets += sessionSets
      totalVolume += sessionVol

      const sessionExerciseCount = session.total_exercises || (sessionSets > 0 ? 1 : 0)
      if (sessionExerciseCount > 0 && session.workout_name) {
        const key = session.workout_name.toLowerCase()
        if (!breakdownMap.has(key)) {
          breakdownMap.set(key, {
            exerciseId: session.workout_id || key,
            name: session.workout_name,
            sets: sessionSets,
            reps: 0,
            minWeight: 0,
            maxWeight: 0,
            weightDisplay: sessionVol > 0 ? `${sessionVol.toLocaleString()} kg total` : 'Completed',
            volume: sessionVol
          })
        }
      }
    }
  }

  // Determine distinct exercises count
  let distinctExercises = breakdownMap.size

  // Critical safeguard: if sets > 0, exercise count must NEVER be 0!
  if (distinctExercises === 0 && totalSets > 0) {
    const sessionTotalEx = todaySessions.reduce((acc, s) => acc + (s.total_exercises || 0), 0)
    distinctExercises = Math.max(1, sessionTotalEx)
  }

  // Fallback volume safeguard: if calculated volume is 0 but sessions recorded volume
  if (totalVolume === 0) {
    const fallbackVol = todaySessions.reduce((acc, s) => acc + (Number(s.total_volume) || 0), 0)
    if (fallbackVol > 0) {
      totalVolume = fallbackVol
    }
  }

  const exerciseBreakdown = Array.from(breakdownMap.values())

  return {
    exercises: distinctExercises,
    sets: totalSets,
    volume: Math.round(totalVolume),
    durationMins: Math.round(totalDurationSecs / 60),
    durationSeconds: totalDurationSecs,
    workoutName: primaryWorkoutName,
    exerciseBreakdown,
    hasActivity: totalSets > 0 || distinctExercises > 0
  }
}
