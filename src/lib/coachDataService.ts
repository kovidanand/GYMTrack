/**
 * GYMTrack AI Coach Data Service Layer
 * 
 * Provides server-grade, evidence-grounded retrieval tools querying actual
 * authenticated user profiles, logged workout sessions, sets, personal records,
 * and exercise catalog intelligence with zero fabricated metrics.
 */

import { supabase } from '@/lib/supabase'
import { getWorkoutHistory, getPersonalRecords, getProgressStats } from '@/lib/progress'
import { aggregateTodayMetrics, filterTodaySessions } from '@/lib/dashboardData'
import { resolveExerciseMedia, findExerciseDbRecord } from '@/lib/exerciseMedia'
import { calculate1RM } from '@/lib/exerciseIntelligence'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import type { Exercise, PersonalRecord, WorkoutSession, WorkoutSessionSet } from '@/types'

export interface UserProfileData {
  first_name?: string
  last_name?: string
  height?: number | null
  weight?: number | null
  age?: number | null
  fitness_goal?: string | null
  experience_level?: string | null
  training_frequency?: number | null
}

export interface TodayWorkoutData {
  has_trained_today: boolean
  exercises_count: number
  sets_count: number
  volume_kg: number
  duration_minutes: number
  exercises_names: string[]
  sessions_count: number
}

export interface ExerciseSessionHistory {
  exercise_name: string
  total_sessions: number
  latest_weight: number
  latest_reps: number
  latest_date: string | null
  best_1rm: number
  current_1rm: number
  best_weight: number
  recent_sets: Array<{ weight: number; reps: number; completed: boolean }>
}

export interface ExerciseDetailsData {
  name: string
  slug: string
  target_muscle: string
  secondary_muscles: string[]
  equipment: string[]
  difficulty: string
  instructions: string[]
  tips: string[]
  common_mistakes: string[]
  video_url?: string
  male_video_url?: string
  female_video_url?: string
  poster_url?: string
}

/**
 * 1. get_user_profile()
 */
export async function get_user_profile(userId: string): Promise<UserProfileData | null> {
  if (!userId) return null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name, height, weight, age, fitness_goal, experience_level, training_frequency')
      .eq('id', userId)
      .maybeSingle()

    return data || null
  } catch (err) {
    console.error('[coachDataService] get_user_profile error:', err)
    return null
  }
}

/**
 * 2. get_today_workout()
 */
export async function get_today_workout(userId: string): Promise<TodayWorkoutData> {
  if (!userId) {
    return {
      has_trained_today: false,
      exercises_count: 0,
      sets_count: 0,
      volume_kg: 0,
      duration_minutes: 0,
      exercises_names: [],
      sessions_count: 0
    }
  }

  try {
    const historyRes = await getWorkoutHistory(userId)
    const sessions = historyRes.data || []
    const todaySessions = filterTodaySessions(sessions, new Date())
    const metrics = aggregateTodayMetrics(todaySessions)

    const exerciseNames = metrics.exerciseBreakdown.map(e => e.name)

    return {
      has_trained_today: todaySessions.length > 0 && metrics.sets > 0,
      exercises_count: metrics.exercises,
      sets_count: metrics.sets,
      volume_kg: metrics.volume,
      duration_minutes: metrics.durationMins,
      exercises_names: exerciseNames,
      sessions_count: todaySessions.length
    }
  } catch (err) {
    console.error('[coachDataService] get_today_workout error:', err)
    return {
      has_trained_today: false,
      exercises_count: 0,
      sets_count: 0,
      volume_kg: 0,
      duration_minutes: 0,
      exercises_names: [],
      sessions_count: 0
    }
  }
}

/**
 * 3. get_recent_workouts()
 */
export async function get_recent_workouts(userId: string, limit = 5) {
  if (!userId) return []
  try {
    const historyRes = await getWorkoutHistory(userId)
    const sessions = historyRes.data || []
    return sessions.slice(0, limit).map((s: any) => {
      const sets = s.workout_session_sets || []
      const names = Array.from(new Set(sets.map((st: any) => st.exercise_name).filter(Boolean))) as string[]
      return {
        id: s.id,
        name: s.workout_name,
        started_at: s.started_at,
        duration_minutes: s.duration_minutes || (s.duration_seconds ? Math.round(s.duration_seconds / 60) : 0),
        total_volume: s.total_volume || 0,
        completed_sets: s.completed_sets || sets.length,
        exercises_names: names
      }
    })
  } catch (err) {
    console.error('[coachDataService] get_recent_workouts error:', err)
    return []
  }
}

/**
 * 4. get_workout_history()
 */
export async function get_workout_history(userId: string) {
  const res = await getWorkoutHistory(userId)
  return res.data || []
}

/**
 * 5. get_exercise_history()
 */
export async function get_exercise_history(userId: string, exerciseQuery: string): Promise<ExerciseSessionHistory | null> {
  if (!userId || !exerciseQuery) return null
  try {
    const historyRes = await getWorkoutHistory(userId)
    const sessions = historyRes.data || []
    const qLower = exerciseQuery.trim().toLowerCase()

    let totalSessions = 0
    let latestWeight = 0
    let latestReps = 0
    let latestDate: string | null = null
    let best1rm = 0
    let current1rm = 0
    let bestWeight = 0
    let recentSets: Array<{ weight: number; reps: number; completed: boolean }> = []
    let resolvedName = exerciseQuery

    for (const session of sessions) {
      const sets = (session.workout_session_sets || []).filter((s: any) => {
        const name = (s.exercise_name || '').toLowerCase()
        return name.includes(qLower) || qLower.includes(name)
      })

      if (sets.length > 0) {
        totalSessions++
        if (!latestDate) {
          latestDate = session.started_at
          resolvedName = sets[0].exercise_name || exerciseQuery
          recentSets = sets.map((st: any) => ({
            weight: Number(st.weight) || 0,
            reps: Number(st.reps) || 0,
            completed: Boolean(st.completed)
          }))
          const topSet = sets.reduce((best: any, s: any) => (Number(s.weight) > Number(best.weight) ? s : best), sets[0])
          latestWeight = Number(topSet.weight) || 0
          latestReps = Number(topSet.reps) || 0
          current1rm = calculate1RM(latestWeight, latestReps) || 0
        }

        for (const set of sets) {
          const w = Number(set.weight) || 0
          const r = Number(set.reps) || 0
          if (w > bestWeight) bestWeight = w
          const rm = calculate1RM(w, r) || 0
          if (rm > best1rm) best1rm = rm
        }
      }
    }

    if (totalSessions === 0) return null

    return {
      exercise_name: resolvedName,
      total_sessions: totalSessions,
      latest_weight: latestWeight,
      latest_reps: latestReps,
      latest_date: latestDate,
      best_1rm: best1rm,
      current_1rm: current1rm,
      best_weight: bestWeight,
      recent_sets: recentSets
    }
  } catch (err) {
    console.error('[coachDataService] get_exercise_history error:', err)
    return null
  }
}

/**
 * 6. get_personal_record()
 */
export async function get_personal_record(userId: string, exerciseQuery?: string): Promise<PersonalRecord[] | PersonalRecord | null> {
  if (!userId) return null
  try {
    const { data } = await getPersonalRecords(userId)
    const records = data || []
    if (!exerciseQuery) return records

    const qLower = exerciseQuery.trim().toLowerCase()
    const match = records.find(r => r.exerciseName.toLowerCase().includes(qLower) || qLower.includes(r.exerciseName.toLowerCase()))
    return match || null
  } catch (err) {
    console.error('[coachDataService] get_personal_record error:', err)
    return null
  }
}

/**
 * 7. get_estimated_1rm()
 */
export async function get_estimated_1rm(userId: string, exerciseQuery: string): Promise<number | null> {
  const history = await get_exercise_history(userId, exerciseQuery)
  return history ? history.current_1rm : null
}

/**
 * 8. get_muscle_group_volume()
 */
export async function get_muscle_group_volume(userId: string, days = 14): Promise<Record<string, number>> {
  if (!userId) return {}
  try {
    const historyRes = await getWorkoutHistory(userId)
    const sessions = historyRes.data || []
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

    const volumeMap: Record<string, number> = {}

    for (const session of sessions) {
      if (new Date(session.started_at).getTime() < cutoff) continue
      const sets = session.workout_session_sets || []
      for (const set of sets) {
        if (!set.completed) continue
        const vol = (Number(set.weight) || 0) * (Number(set.reps) || 0)
        const name = (set.exercise_name || '').toLowerCase()

        // Match muscle group from catalog
        const foundEx = DEFAULT_EXERCISES.find(e => e.name.toLowerCase() === name || name.includes(e.name.toLowerCase()))
        const mg = foundEx?.muscle_group || 'other'
        volumeMap[mg] = (volumeMap[mg] || 0) + vol
      }
    }

    return volumeMap
  } catch (err) {
    console.error('[coachDataService] get_muscle_group_volume error:', err)
    return {}
  }
}

/**
 * 9. get_training_frequency()
 */
export async function get_training_frequency(userId: string): Promise<{ last7Days: number; last14Days: number; last30Days: number }> {
  if (!userId) return { last7Days: 0, last14Days: 0, last30Days: 0 }
  try {
    const historyRes = await getWorkoutHistory(userId)
    const sessions = historyRes.data || []
    const now = Date.now()

    let count7 = 0
    let count14 = 0
    let count30 = 0

    for (const s of sessions) {
      const time = new Date(s.started_at).getTime()
      if (now - time <= 7 * 24 * 60 * 60 * 1000) count7++
      if (now - time <= 14 * 24 * 60 * 60 * 1000) count14++
      if (now - time <= 30 * 24 * 60 * 60 * 1000) count30++
    }

    return { last7Days: count7, last14Days: count14, last30Days: count30 }
  } catch (err) {
    console.error('[coachDataService] get_training_frequency error:', err)
    return { last7Days: 0, last14Days: 0, last30Days: 0 }
  }
}

/**
 * 10. get_progress_comparison()
 */
export async function get_progress_comparison(userId: string) {
  if (!userId) {
    return {
      hasData: false,
      recentVolume: 0,
      previousVolume: 0,
      volumeChangePct: null,
      recentSessionsCount: 0,
      previousSessionsCount: 0
    }
  }

  try {
    const historyRes = await getWorkoutHistory(userId)
    const sessions = historyRes.data || []
    const now = Date.now()
    const ms14Days = 14 * 24 * 60 * 60 * 1000

    let recentVol = 0
    let prevVol = 0
    let recentSessions = 0
    let prevSessions = 0

    for (const s of sessions) {
      const time = new Date(s.started_at).getTime()
      const vol = Number(s.total_volume) || 0
      if (now - time <= ms14Days) {
        recentVol += vol
        recentSessions++
      } else if (now - time <= ms14Days * 2) {
        prevVol += vol
        prevSessions++
      }
    }

    const volumeChangePct = prevVol > 0 ? Math.round(((recentVol - prevVol) / prevVol) * 100) : null

    return {
      hasData: sessions.length > 0,
      recentVolume: recentVol,
      previousVolume: prevVol,
      volumeChangePct,
      recentSessionsCount: recentSessions,
      previousSessionsCount: prevSessions
    }
  } catch (err) {
    console.error('[coachDataService] get_progress_comparison error:', err)
    return {
      hasData: false,
      recentVolume: 0,
      previousVolume: 0,
      volumeChangePct: null,
      recentSessionsCount: 0,
      previousSessionsCount: 0
    }
  }
}

/**
 * 11. get_exercise_details()
 */
export function get_exercise_details(exerciseQuery: string): ExerciseDetailsData | null {
  if (!exerciseQuery) return null
  const qLower = exerciseQuery.trim().toLowerCase()

  // Find in default catalog
  const catalogMatch = DEFAULT_EXERCISES.find(e => 
    e.name.toLowerCase() === qLower || 
    e.slug === qLower ||
    e.name.toLowerCase().includes(qLower) ||
    qLower.includes(e.name.toLowerCase())
  )

  const dbRecord = findExerciseDbRecord(catalogMatch || exerciseQuery)
  const media = resolveExerciseMedia(catalogMatch || exerciseQuery)

  if (!catalogMatch && !dbRecord) return null

  const name = catalogMatch?.name || dbRecord?.name || exerciseQuery
  const slug = catalogMatch?.slug || dbRecord?.id || qLower.replace(/\s+/g, '-')
  const target = catalogMatch?.primary_muscle || dbRecord?.target || 'Primary Muscles'
  const secondary = catalogMatch?.secondary_muscles || dbRecord?.secondaryMuscles || []
  const equipment = catalogMatch?.equipment || (dbRecord?.equipment ? [dbRecord.equipment] : ['Gym Equipment'])
  const difficulty = catalogMatch?.difficulty || dbRecord?.difficulty || 'intermediate'

  const instructions = catalogMatch?.instructions?.length 
    ? catalogMatch.instructions 
    : (dbRecord?.steps?.length ? dbRecord.steps : [
        'Set up with proper posture and stable base of support.',
        'Execute the repetition through the full biomechanical range of motion.',
        'Lower with steady control back to the starting point.'
      ])

  const tips = catalogMatch?.tips?.length 
    ? catalogMatch.tips 
    : (dbRecord?.formCues?.length ? dbRecord.formCues : ['Maintain a neutral spine and controlled breathing throughout.'])

  const common_mistakes = catalogMatch?.common_mistakes?.length 
    ? catalogMatch.common_mistakes 
    : (dbRecord?.commonMistakes?.length ? dbRecord.commonMistakes : ['Using momentum instead of controlled muscle contraction.'])

  return {
    name,
    slug,
    target_muscle: target,
    secondary_muscles: secondary,
    equipment,
    difficulty,
    instructions,
    tips,
    common_mistakes,
    video_url: media?.videoUrl,
    male_video_url: media?.maleVideoUrl,
    female_video_url: media?.femaleVideoUrl,
    poster_url: media?.posterUrl || media?.thumbnailUrl
  }
}
