import { supabase } from '@/lib/supabase'
import type { 
  ExerciseIntelligence, 
  ExerciseSessionHistory, 
  ExerciseProgressionPoint, 
  ExerciseHistoricalSet 
} from '@/types'

/**
 * Calculates estimated One-Rep Max (1RM) using the Epley formula.
 * Epley formula: 1RM = weight * (1 + reps / 30)
 * 
 * Rules:
 * - weight and reps must be > 0
 * - reps = 1 -> 1RM is weight exactly
 * - reps > 30 -> formula is physiologically inaccurate; returns null to avoid misleading values
 * - invalid / incomplete sets return null
 */
export function calculate1RM(weight: number | null | undefined, reps: number | null | undefined): number | null {
  if (weight == null || reps == null) return null
  const numWeight = Number(weight)
  const numReps = Number(reps)
  
  if (isNaN(numWeight) || isNaN(numReps)) return null
  if (numWeight <= 0 || numReps <= 0) return null
  
  if (numReps === 1) {
    return Math.round(numWeight * 10) / 10
  }
  
  // Standard exercise science guideline: 1RM estimations are unreliable beyond ~30 reps
  if (numReps > 30) {
    return null
  }
  
  const estimated = numWeight * (1 + numReps / 30)
  return Math.round(estimated * 10) / 10
}

interface RawSetWithSession {
  id: string
  session_id: string
  exercise_id: string
  exercise_name: string
  set_number: number
  weight: number | null
  reps: number | null
  completed: boolean
  is_personal_record: boolean
  created_at: string
  workout_sessions?: {
    id: string
    user_id: string
    started_at: string
    workout_name: string
  } | null
}

/**
 * Fetches real workout history for a specific exercise and computes full intelligence metrics:
 * 1RM (current and peak), personal bests, progression points for charting, trends, and session breakdowns.
 */
export async function getExerciseIntelligence(
  userId: string, 
  exerciseId: string
): Promise<{ data: ExerciseIntelligence | null; error: string | null }> {
  try {
    // 1. Fetch exercise metadata
    const { data: exerciseData } = await supabase
      .from('exercises')
      .select('id, name, slug, exercise_type, equipment, muscle_group')
      .eq('id', exerciseId)
      .maybeSingle()

    const exerciseName = exerciseData?.name || 'Exercise'
    const slug = exerciseData?.slug || undefined
    const isKnownBodyweightType = 
      exerciseData?.exercise_type === 'cardio' || 
      exerciseData?.exercise_type === 'mobility' || 
      exerciseData?.exercise_type === 'stretching'

    // 2. Fetch all completed sets for this exercise linked to user's sessions
    const { data: sets, error: setsError } = await supabase
      .from('workout_session_sets')
      .select(`
        id,
        session_id,
        exercise_id,
        exercise_name,
        set_number,
        weight,
        reps,
        completed,
        is_personal_record,
        created_at,
        workout_sessions!inner (
          id,
          user_id,
          started_at,
          workout_name
        )
      `)
      .eq('exercise_id', exerciseId)
      .eq('workout_sessions.user_id', userId)
      .order('created_at', { ascending: true })

    if (setsError) {
      console.error('[GYMTrack] getExerciseIntelligence error:', setsError.message)
      return { data: null, error: 'Failed to fetch exercise intelligence.' }
    }

    const rawSets = (sets || []) as unknown as RawSetWithSession[]

    if (rawSets.length === 0) {
      return {
        data: {
          exerciseId,
          exerciseName,
          slug,
          isBodyweightOrTimed: isKnownBodyweightType,
          current1RM: null,
          best1RM: null,
          bestWeight: null,
          latestWeight: null,
          latestReps: null,
          latestProgressionDate: null,
          totalSessions: 0,
          totalSets: 0,
          lastPerformedDate: null,
          trend: 'insufficient_data',
          trendPercentage: null,
          sessions: [],
          progressionPoints: []
        },
        error: null
      }
    }

    // 3. Group sets by session
    const sessionMap = new Map<string, {
      sessionId: string
      workoutName: string
      startedAt: string
      sets: RawSetWithSession[]
    }>()

    let maxAllTimeWeight: number | null = null
    let maxAllTime1RM: number | null = null
    let latestProgressionDate: string | null = null

    rawSets.forEach(set => {
      const sId = set.session_id || 'unassigned'
      const sessionInfo = set.workout_sessions
      const startedAt = sessionInfo?.started_at || set.created_at
      const workoutName = sessionInfo?.workout_name || 'Workout Session'

      if (!sessionMap.has(sId)) {
        sessionMap.set(sId, {
          sessionId: sId,
          workoutName,
          startedAt,
          sets: []
        })
      }
      sessionMap.get(sId)!.sets.push(set)

      // Track all-time peak weight
      const w = set.weight ? Number(set.weight) : null
      const r = set.reps ? Number(set.reps) : null

      if (w != null && w > 0) {
        if (maxAllTimeWeight == null || w > maxAllTimeWeight) {
          maxAllTimeWeight = w
          latestProgressionDate = set.created_at
        }
      }

      // Track 1RM
      const est1RM = calculate1RM(w, r)
      if (est1RM != null) {
        if (maxAllTime1RM == null || est1RM > maxAllTime1RM) {
          maxAllTime1RM = est1RM
          latestProgressionDate = set.created_at
        }
      }

      if (set.is_personal_record) {
        latestProgressionDate = set.created_at
      }
    })

    // Sort sessions chronologically (oldest to newest for progression)
    const sortedSessionEntries = Array.from(sessionMap.values()).sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    )

    const progressionPoints: ExerciseProgressionPoint[] = []
    const sessionsHistory: ExerciseSessionHistory[] = []

    sortedSessionEntries.forEach(s => {
      let sessionBest1RM: number | null = null
      let sessionMaxWeight: number | null = null
      let sessionTotalVolume = 0
      let sessionTotalReps = 0
      let sessionHadPR = false

      const historicalSets: ExerciseHistoricalSet[] = s.sets.map(set => {
        const w = set.weight ? Number(set.weight) : null
        const r = set.reps ? Number(set.reps) : null
        const est1RM = calculate1RM(w, r)

        if (w != null && w > 0) {
          if (sessionMaxWeight == null || w > sessionMaxWeight) {
            sessionMaxWeight = w
          }
        }

        if (est1RM != null) {
          if (sessionBest1RM == null || est1RM > sessionBest1RM) {
            sessionBest1RM = est1RM
          }
        }

        if (w != null && r != null && w > 0 && r > 0) {
          sessionTotalVolume += w * r
        }

        if (r != null && r > 0) {
          sessionTotalReps += r
        }

        if (set.is_personal_record) {
          sessionHadPR = true
        }

        return {
          id: set.id,
          setNumber: set.set_number || 1,
          weight: w,
          reps: r,
          estimated1RM: est1RM,
          isPersonalRecord: Boolean(set.is_personal_record),
          createdAt: set.created_at
        }
      })

      const dateObj = new Date(s.startedAt)
      const formattedDate = dateObj.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      })

      progressionPoints.push({
        date: formattedDate,
        rawDate: s.startedAt,
        estimated1RM: sessionBest1RM,
        maxWeight: sessionMaxWeight,
        totalReps: sessionTotalReps,
        volume: sessionTotalVolume,
        isPR: sessionHadPR
      })

      sessionsHistory.push({
        sessionId: s.sessionId,
        workoutName: s.workoutName,
        date: s.startedAt,
        formattedDate: dateObj.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        sets: historicalSets,
        best1RM: sessionBest1RM,
        maxWeight: sessionMaxWeight,
        totalVolume: sessionTotalVolume,
        totalReps: sessionTotalReps
      })
    })

    // Latest session details
    const latestSession = sortedSessionEntries[sortedSessionEntries.length - 1]
    const latestSessionSets = latestSession.sets
    const lastSet = latestSessionSets[latestSessionSets.length - 1]

    const latestWeight = lastSet?.weight ? Number(lastSet.weight) : null
    const latestReps = lastSet?.reps ? Number(lastSet.reps) : null

    // Latest session best 1RM
    const latestProgressionPoint = progressionPoints[progressionPoints.length - 1]
    const current1RM = latestProgressionPoint?.estimated1RM ?? null

    // Is this bodyweight or timed exercise?
    const isBodyweightOrTimed = isKnownBodyweightType || maxAllTimeWeight == null || maxAllTimeWeight === 0

    // Trend calculation
    let trend: 'improving' | 'declining' | 'stable' | 'insufficient_data' = 'insufficient_data'
    let trendPercentage: number | null = null

    // Require at least 2 sessions to establish a trend
    if (progressionPoints.length >= 2) {
      if (!isBodyweightOrTimed) {
        // Compare first session with valid 1RM or weight against latest session
        const valid1RMs = progressionPoints.filter(p => p.estimated1RM != null && p.estimated1RM > 0)
        if (valid1RMs.length >= 2) {
          const first1RM = valid1RMs[0].estimated1RM!
          const last1RM = valid1RMs[valid1RMs.length - 1].estimated1RM!
          const diffPct = ((last1RM - first1RM) / first1RM) * 100
          trendPercentage = Math.round(diffPct * 10) / 10

          if (trendPercentage >= 2.5) {
            trend = 'improving'
          } else if (trendPercentage <= -2.5) {
            trend = 'declining'
          } else {
            trend = 'stable'
          }
        }
      } else {
        // For bodyweight, compare reps or volume
        const firstReps = progressionPoints[0].totalReps
        const lastReps = progressionPoints[progressionPoints.length - 1].totalReps
        if (firstReps > 0 && lastReps > 0) {
          const diffPct = ((lastReps - firstReps) / firstReps) * 100
          trendPercentage = Math.round(diffPct * 10) / 10
          if (trendPercentage >= 3) {
            trend = 'improving'
          } else if (trendPercentage <= -3) {
            trend = 'declining'
          } else {
            trend = 'stable'
          }
        }
      }
    }

    return {
      data: {
        exerciseId,
        exerciseName,
        slug,
        isBodyweightOrTimed,
        current1RM,
        best1RM: maxAllTime1RM,
        bestWeight: maxAllTimeWeight,
        latestWeight,
        latestReps,
        latestProgressionDate,
        totalSessions: sortedSessionEntries.length,
        totalSets: rawSets.length,
        lastPerformedDate: latestSession.startedAt,
        trend,
        trendPercentage,
        // Reverse sessions history for display (most recent first)
        sessions: sessionsHistory.reverse(),
        progressionPoints
      },
      error: null
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[GYMTrack] getExerciseIntelligence unexpected error:', message)
    return { data: null, error: message }
  }
}
