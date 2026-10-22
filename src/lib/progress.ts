import { supabase } from '@/lib/supabase'
import { getPendingSyncOperations } from '@/lib/offline/db'
import type { WorkoutSession, WorkoutSessionSet, ProgressStats, ChartDataPoint, PersonalRecord } from '@/types'

// ─── Core Session Saving ──────────────────────────────────────────────────────

export async function saveWorkoutSession(sessionData: Partial<WorkoutSession>, setsData: Partial<WorkoutSessionSet>[]): Promise<{ data: WorkoutSession | null; error: string | null }> {
  // 1. Insert session
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert(sessionData)
    .select()
    .single()

  if (sessionError || !session) {
    console.error('[GYMTrack] saveWorkoutSession error:', sessionError?.message)
    return { data: null, error: 'Failed to save workout session.' }
  }

  // 2. Insert all sets linked to this session with automatic Personal Record detection
  if (setsData.length > 0) {
    const exerciseIds = [...new Set(setsData.map(s => s.exercise_id).filter(Boolean))] as string[]
    
    // Fetch previous maximum weights for these exercises to evaluate PRs
    const previousMaxes = new Map<string, number>()
    if (exerciseIds.length > 0 && sessionData.user_id) {
      try {
        const { data: previousSets } = await supabase
          .from('workout_session_sets')
          .select('exercise_id, weight')
          .in('exercise_id', exerciseIds)
          .gt('weight', 0)
        
        if (previousSets) {
          previousSets.forEach(ps => {
            const w = Number(ps.weight) || 0
            const currentMax = previousMaxes.get(ps.exercise_id) || 0
            if (w > currentMax) {
              previousMaxes.set(ps.exercise_id, w)
            }
          })
        }
      } catch (err) {
        console.error('[GYMTrack] Error evaluating previous PRs:', err)
      }
    }

    // Evaluate PRs for each completed set
    const setsToInsert = setsData.map(s => {
      const weight = Number(s.weight) || 0
      const prevMax = previousMaxes.get(s.exercise_id || '') || 0
      let isPR = false

      if (weight > 0 && weight > prevMax) {
        isPR = true
        // Update running best for this workout so subsequent sets don't re-trigger PR unless higher
        previousMaxes.set(s.exercise_id || '', weight)
      }

      return {
        ...s,
        session_id: session.id,
        is_personal_record: isPR
      }
    })

    const { error: setsError } = await supabase
      .from('workout_session_sets')
      .insert(setsToInsert)

    if (setsError) {
      console.error('[GYMTrack] saveWorkoutSession sets error:', setsError.message)
    }
  }

  return { data: session, error: null }
}

// ─── Fetching History ─────────────────────────────────────────────────────────

const CACHED_HISTORY_PREFIX = 'gymtrack_cached_history_'

export async function getWorkoutHistory(userId: string): Promise<{ data: WorkoutSession[] | null; error: string | null }> {
  // 1. Fetch any pending local sessions waiting to sync
  let pendingSessions: WorkoutSession[] = []
  try {
    const pendingOps = await getPendingSyncOperations(userId)
    pendingSessions = pendingOps
      .filter(op => op.operationType === 'SAVE_WORKOUT_SESSION' && op.payload?.sessionData)
      .map(op => ({
        ...op.payload.sessionData,
        workout_session_sets: op.payload.setsData || []
      })) as unknown as WorkoutSession[]
  } catch (err) {
    console.warn('[GYMTrack] Failed to read pending operations from IndexedDB:', err)
  }

  // 2. Fetch from Supabase
  let remoteSessions: WorkoutSession[] = []
  let fetchError: string | null = null

  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_session_sets (*)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (error) {
      fetchError = error.message
    } else if (data) {
      remoteSessions = data as WorkoutSession[]
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Network error'
  }

  // 3. Merge: cached sessions, remote sessions, and pending local sessions
  const sessionMap = new Map<string, WorkoutSession>()

  try {
    const cachedRaw = localStorage.getItem(CACHED_HISTORY_PREFIX + userId)
    if (cachedRaw) {
      const cachedSessions: WorkoutSession[] = JSON.parse(cachedRaw)
      cachedSessions.forEach(s => {
        if (s.id) sessionMap.set(s.id, s)
      })
    }
  } catch {
    /* ignore cached history parsing error */
  }

  // 4. Remote sessions overlay (and take precedence for finalized server data)
  remoteSessions.forEach(s => {
    if (s.id) sessionMap.set(s.id, s)
  })

  // Pending local sessions take precedence
  pendingSessions.forEach(s => {
    if (s.id) sessionMap.set(s.id, s)
  })

  const merged = Array.from(sessionMap.values()).sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  )

  // 5. Update local cache for instant offline loads
  if (merged.length > 0) {
    try {
      localStorage.setItem(CACHED_HISTORY_PREFIX + userId, JSON.stringify(merged))
    } catch {
      /* ignore storage quota notice */
    }
  }

  return { data: merged, error: null }
}

export async function getWorkoutSessionById(sessionId: string): Promise<{ data: WorkoutSession | null; error: string | null }> {
  // 1. Check remote
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_session_sets (
          *,
          exercise:exercises (*)
        )
      `)
      .eq('id', sessionId)
      .single()

    if (!error && data) {
      if (data.workout_session_sets) {
        data.workout_session_sets.sort((a: WorkoutSessionSet, b: WorkoutSessionSet) => a.set_number - b.set_number)
      }
      return { data, error: null }
    }
  } catch {
    /* fallback to local pending operations if network fails */
  }

  // 2. Check local pending operations or cached history
  try {
    const pendingOps = await getPendingSyncOperations()
    const op = pendingOps.find(o => o.sessionId === sessionId || o.payload?.sessionData?.id === sessionId)
    if (op && op.payload?.sessionData) {
      const localSession: WorkoutSession = {
        ...op.payload.sessionData,
        workout_session_sets: op.payload.setsData || []
      } as unknown as WorkoutSession
      return { data: localSession, error: null }
    }
  } catch {
    /* ignore local lookup notice */
  }

  return { data: null, error: 'Session not found.' }
}

// ─── Analytics Aggregation ────────────────────────────────────────────────────

export async function getProgressStats(userId: string): Promise<{ data: ProgressStats | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('started_at, duration_seconds, total_volume, completed_sets, total_exercises')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })

  if (error) {
    console.error('[GYMTrack] getProgressStats error:', error.message)
    return { data: null, error: 'Failed to fetch stats.' }
  }

  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const stats: ProgressStats = {
    totalWorkouts: data.length,
    workoutsThisWeek: 0,
    workoutsThisMonth: 0,
    totalTrainingTime: 0,
    totalVolume: 0,
    currentStreak: 0,
    longestStreak: 0,
    exercisesPerformed: 0,
    personalRecordsCount: 0
  }

  // Calculate streaks
  let currentStreak = 0
  let maxStreak = 0
  let previousDate: string | null = null

  // We need unique days sorted descending
  const uniqueDays = [...new Set(data.map(d => d.started_at.split('T')[0]))]

  uniqueDays.forEach((dayStr, i) => {
    const day = new Date(dayStr)
    day.setHours(0,0,0,0)

    if (i === 0) {
      // Check if the most recent workout was today or yesterday
      const today = new Date()
      today.setHours(0,0,0,0)
      const diff = (today.getTime() - day.getTime()) / (1000 * 3600 * 24)
      
      if (diff <= 1) {
        currentStreak = 1
      }
    } else if (previousDate) {
      const prevDay = new Date(previousDate)
      prevDay.setHours(0,0,0,0)
      const diff = (prevDay.getTime() - day.getTime()) / (1000 * 3600 * 24)
      
      if (diff === 1) {
        if (currentStreak > 0) currentStreak++
      } else {
        if (currentStreak > maxStreak) maxStreak = currentStreak
        currentStreak = 0
      }
    }
    previousDate = dayStr
  })
  
  if (currentStreak > maxStreak) maxStreak = currentStreak
  if (data.length === 1 && currentStreak === 0) {
     // fallback if they only have 1 workout ever and it was today
     const d = new Date(data[0].started_at)
     const today = new Date()
     if (d.toDateString() === today.toDateString()) {
       currentStreak = 1
       maxStreak = 1
     }
  }

  stats.currentStreak = currentStreak
  stats.longestStreak = maxStreak

  // Accumulate totals
  data.forEach(session => {
    const sessionDate = new Date(session.started_at)
    
    if (sessionDate >= oneWeekAgo) stats.workoutsThisWeek++
    if (sessionDate >= oneMonthAgo) stats.workoutsThisMonth++
    
    stats.totalTrainingTime += session.duration_seconds || 0
    stats.totalVolume += session.total_volume || 0
    stats.exercisesPerformed += session.total_exercises || 0
  })

  // To get PRs, we need a separate query on the sets table
  const { count: prCount } = await supabase
    .from('workout_session_sets')
    .select('id', { count: 'exact', head: true })
    .eq('is_personal_record', true)
    
  stats.personalRecordsCount = prCount || 0

  return { data: stats, error: null }
}

export interface VolumeChartResult {
  chartData: ChartDataPoint[]
  totalPeriodVolume: number
  hasWorkoutData: boolean
}

/**
 * Computes daily volume over time strictly from actual workout session sets.
 * Volume = sum(weight * reps) for every completed set.
 * Multiple sets and multiple exercises on the same date are summed into the daily total.
 * For the active period (7d, 30d, all), all calendar dates are generated so inactive days
 * correctly appear with 0 kg to show training consistency.
 */
export function computeVolumeChartData(
  sessions: WorkoutSession[],
  timeRange: '7d' | '30d' | 'all' = '30d'
): VolumeChartResult {
  // 1. Build a map of YYYY-MM-DD -> total daily volume (kg)
  const dailyVolumeMap = new Map<string, number>()
  let totalAccountVolume = 0
  let totalAccountCompletedSets = 0

  for (const session of sessions) {
    if (!session.started_at) continue
    const d = new Date(session.started_at)
    if (isNaN(d.getTime())) continue

    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    let sessionVol = 0

    if (session.workout_session_sets && session.workout_session_sets.length > 0) {
      for (const set of session.workout_session_sets) {
        if (set.completed !== false) {
          totalAccountCompletedSets++
          const w = Number(set.weight) || 0
          const r = Number(set.reps) || 0
          if (w > 0 && r > 0) {
            sessionVol += (w * r)
          }
        }
      }
    } else if (session.total_volume) {
      sessionVol = Number(session.total_volume) || 0
    }

    if (sessionVol > 0) {
      totalAccountVolume += sessionVol
      dailyVolumeMap.set(dateKey, (dailyVolumeMap.get(dateKey) || 0) + sessionVol)
    }
  }

  // If user has no sessions or no completed sets/volume across their entire account, return empty indicator
  const hasWorkoutData = sessions.length > 0 && (totalAccountCompletedSets > 0 || totalAccountVolume > 0)
  if (!hasWorkoutData) {
    return {
      chartData: [],
      totalPeriodVolume: 0,
      hasWorkoutData: false,
    }
  }

  // 2. Generate calendar days for the requested time range
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let numDays = 30

  if (timeRange === '7d') {
    numDays = 7
  } else if (timeRange === '30d') {
    numDays = 30
  } else if (timeRange === 'all') {
    // Find earliest session date
    let earliestTime = today.getTime()
    for (const session of sessions) {
      if (!session.started_at) continue
      const t = new Date(session.started_at).getTime()
      if (!isNaN(t) && t < earliestTime) {
        earliestTime = t
      }
    }
    const diffDays = Math.ceil((today.getTime() - earliestTime) / (1000 * 60 * 60 * 24)) + 1
    // At least 7 days to give the chart proper visual context
    numDays = Math.max(7, Math.min(365, diffDays))
  }

  const chartData: ChartDataPoint[] = []
  let totalPeriodVolume = 0

  for (let i = numDays - 1; i >= 0; i--) {
    const dayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`
    const displayDate = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dayVol = dailyVolumeMap.get(dateKey) || 0

    totalPeriodVolume += dayVol
    chartData.push({
      date: displayDate,
      value: dayVol,
      label: dateKey,
    })
  }

  return {
    chartData,
    totalPeriodVolume,
    hasWorkoutData: true,
  }
}

export async function getVolumeChartData(userId: string, days: number = 30): Promise<ChartDataPoint[]> {
  const { data: sessions } = await getWorkoutHistory(userId)
  const timeRange = days <= 7 ? '7d' : days <= 30 ? '30d' : 'all'
  const result = computeVolumeChartData(sessions || [], timeRange)
  return result.chartData
}

export async function getExerciseProgress(userId: string, exerciseId: string): Promise<ChartDataPoint[]> {
  const { data } = await supabase
    .from('workout_session_sets')
    .select('weight, created_at')
    .eq('exercise_id', exerciseId)
    // we need to join to sessions to filter by user, but workout_session_sets doesn't have user_id directly.
    // However, our RLS policy ensures users can only select their own sets.
    .order('created_at', { ascending: true })

  if (!data) return []

  // Get max weight per day
  const grouped: Record<string, number> = {}
  data.forEach(set => {
    if (!set.weight) return
    const dateStr = new Date(set.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    if (!grouped[dateStr] || set.weight > grouped[dateStr]) {
      grouped[dateStr] = set.weight
    }
  })

  return Object.entries(grouped).map(([date, weight]) => ({
    date,
    value: weight
  }))
}

export async function getPersonalRecords(_userId: string): Promise<{ data: PersonalRecord[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('workout_session_sets')
    .select(`
      id,
      exercise_id,
      exercise_name,
      weight,
      created_at
    `)
    // Normally we'd filter `is_personal_record`, but for robustness let's just calculate the max per exercise here
    // In a huge DB we'd use a SQL View for this.
    .order('created_at', { ascending: false })

  if (error || !data) return { data: null, error: error?.message || 'Failed to load PRs' }

  const prsMap = new Map<string, PersonalRecord>()
  
  data.forEach(set => {
    if (!set.weight) return
    
    const existing = prsMap.get(set.exercise_id)
    if (!existing || set.weight > existing.value) {
      prsMap.set(set.exercise_id, {
        id: set.id,
        exerciseId: set.exercise_id,
        exerciseName: set.exercise_name,
        value: set.weight,
        unit: 'kg',
        achievedAt: set.created_at
      })
    }
  })

  return { data: Array.from(prsMap.values()), error: null }
}

// Re-export exercise intelligence functions
export { calculate1RM, getExerciseIntelligence } from '@/lib/exerciseIntelligence'

