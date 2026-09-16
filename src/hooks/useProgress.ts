import { useState, useEffect, useCallback, useMemo } from 'react'
import { getWorkoutHistory, getProgressStats, getVolumeChartData, getPersonalRecords, getExerciseProgress } from '@/lib/progress'
import { useAuth } from '@/context/AuthContext'
import { subscribeGymtrackEvent } from '@/lib/events'
import type { WorkoutSession, ProgressStats, ChartDataPoint, PersonalRecord } from '@/types'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'

export type TimeRange = '7d' | '30d' | 'all'

const RANGE_DAYS: Record<Exclude<TimeRange, 'all'>, number> = {
  '7d': 7,
  '30d': 30,
}

/**
 * Returns calendar-date-aware period boundaries using LOCAL dates.
 * Avoids UTC midnight bugs where workouts near midnight appear on wrong day.
 */
function computePeriodBoundaries(timeRange: TimeRange): {
  currentStart: Date
  currentEnd: Date
  previousStart: Date
  previousEnd: Date
} {
  const now = new Date()
  // Set to end of today in local time
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  
  if (timeRange === 'all') {
    // All time: epoch to now, no meaningful "previous period"
    const epoch = new Date(0)
    return {
      currentStart: epoch,
      currentEnd: endOfToday,
      previousStart: epoch,
      previousEnd: epoch,
    }
  }

  const days = RANGE_DAYS[timeRange]
  
  // Current period: last N days (inclusive of today)
  const currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1), 0, 0, 0, 0)
  
  // Previous period: the N days immediately before
  const previousEnd = new Date(currentStart.getTime() - 1) // 1ms before current start
  const previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), previousEnd.getDate() - (days - 1), 0, 0, 0, 0)

  return { currentStart, currentEnd: endOfToday, previousStart, previousEnd }
}

/**
 * Filters sessions to those that fall within a date range using LOCAL calendar dates.
 */
function filterSessionsByPeriod(sessions: WorkoutSession[], start: Date, end: Date): WorkoutSession[] {
  return sessions.filter(s => {
    if (!s.started_at) return false
    const sessionDate = new Date(s.started_at)
    return sessionDate >= start && sessionDate <= end
  })
}

/**
 * Computes total volume from session sets (weight × reps).
 * Falls back to session-level total_volume if sets aren't loaded.
 */
function computeVolume(sessions: WorkoutSession[]): number {
  let vol = 0
  for (const s of sessions) {
    if (s.workout_session_sets && s.workout_session_sets.length > 0) {
      for (const set of s.workout_session_sets) {
        if (set.completed) {
          vol += (Number(set.weight) || 0) * (Number(set.reps) || 0)
        }
      }
    } else {
      vol += s.total_volume || 0
    }
  }
  return vol
}

// Pre-build exercise name → muscle group lookup at module level (static, no circular dep issues)
const EXERCISE_MUSCLE_MAP = new Map<string, string>(
  DEFAULT_EXERCISES.map(ex => [ex.name.toLowerCase(), ex.muscle_group])
)

/**
 * Computes muscle group distribution as % of completed sets per muscle group.
 * Uses exercise_name to look up muscle group via DEFAULT_EXERCISES catalog.
 */
function computeMuscleDistribution(sessions: WorkoutSession[]): Record<string, number> {
  const muscleCounts: Record<string, number> = {}
  let totalSets = 0

  for (const session of sessions) {
    if (!session.workout_session_sets) continue
    for (const set of session.workout_session_sets) {
      if (!set.completed) continue
      const muscle = EXERCISE_MUSCLE_MAP.get(set.exercise_name?.toLowerCase() || '') || 'other'
      muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1
      totalSets++
    }
  }

  if (totalSets === 0) return {}

  const dist: Record<string, number> = {}
  for (const [muscle, count] of Object.entries(muscleCounts)) {
    dist[muscle] = Math.round((count / totalSets) * 100)
  }
  return dist
}

export interface PeriodComparison {
  currentVolume: number
  previousVolume: number
  volumePctChange: number | null
  currentSessions: number
  previousSessions: number
  sessionsPctChange: number | null
  hasPreviousData: boolean
}

export { computeMuscleDistribution }

export function useProgress() {
  const { user } = useAuth()
  const userId = user?.id
  
  const [history, setHistory] = useState<WorkoutSession[]>(() => {
    if (user?.id) {
      try {
        const raw = localStorage.getItem('gymtrack_cached_history_' + user.id)
        return raw ? JSON.parse(raw) : []
      } catch {
        return []
      }
    }
    return []
  })
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [volumeChart, setVolumeChart] = useState<ChartDataPoint[]>([])
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  
  const [loading, setLoading] = useState(() => history.length === 0)
  const [error, setError] = useState<string | null>(null)

  // Sync cache when userId becomes available
  useEffect(() => {
    if (userId) {
      try {
        const raw = localStorage.getItem('gymtrack_cached_history_' + userId)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed.length > 0) {
            setHistory(parsed)
            setLoading(false)
          }
        }
      } catch {}
    }
  }, [userId])

  const fetchData = useCallback(async () => {
    if (!userId) return
    // Only set loading to true if we have no existing history to prevent flicker
    if (history.length === 0) {
      setLoading(true)
    }
    setError(null)

    const days = timeRange === 'all' ? 3650 : RANGE_DAYS[timeRange]

    const [historyRes, statsRes, volumeRes, prsRes] = await Promise.all([
      getWorkoutHistory(userId),
      getProgressStats(userId),
      getVolumeChartData(userId, days),
      getPersonalRecords(userId)
    ])

    if (historyRes.error || statsRes.error) {
      setError(historyRes.error || statsRes.error || 'Failed to load progress data')
    } else {
      setHistory(historyRes.data || [])
      setStats(statsRes.data || null)
      setVolumeChart(volumeRes)
      setPersonalRecords(prsRes.data || [])
    }
    
    setLoading(false)
  }, [userId, timeRange, history.length])

  useEffect(() => {
    fetchData()

    const readCache = () => {
      if (userId) {
        try {
          const raw = localStorage.getItem('gymtrack_cached_history_' + userId)
          if (raw) {
            setHistory(JSON.parse(raw))
          }
        } catch {}
      }
    }

    // Listen for reactive session completions and sync flushes
    const unsub1 = subscribeGymtrackEvent('gymtrack:session_completed', () => {
      readCache()
      fetchData()
    })
    const unsub2 = subscribeGymtrackEvent('gymtrack:sync_completed', () => fetchData())
    const unsub3 = subscribeGymtrackEvent('gymtrack:workout_updated', () => fetchData())
    const unsub4 = subscribeGymtrackEvent('gymtrack:sets_logged', () => {
      readCache()
      fetchData()
    })

    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
    }
  }, [fetchData, userId])

  // ── Derived period-filtered data ──────────────────────────────────────────

  const periodBoundaries = useMemo(() => computePeriodBoundaries(timeRange), [timeRange])

  const filteredHistory = useMemo(() => {
    if (timeRange === 'all') return history
    return filterSessionsByPeriod(history, periodBoundaries.currentStart, periodBoundaries.currentEnd)
  }, [history, timeRange, periodBoundaries])

  const previousPeriodHistory = useMemo(() => {
    if (timeRange === 'all') return []
    return filterSessionsByPeriod(history, periodBoundaries.previousStart, periodBoundaries.previousEnd)
  }, [history, timeRange, periodBoundaries])

  const periodComparison = useMemo((): PeriodComparison => {
    const currentVolume = computeVolume(filteredHistory)
    const previousVolume = computeVolume(previousPeriodHistory)
    const currentSessions = filteredHistory.filter(s => s.status === 'completed').length
    const previousSessions = previousPeriodHistory.filter(s => s.status === 'completed').length
    const hasPreviousData = previousPeriodHistory.length > 0

    const volumePctChange = hasPreviousData && previousVolume > 0
      ? Math.round(((currentVolume - previousVolume) / previousVolume) * 100)
      : null

    const sessionsPctChange = hasPreviousData && previousSessions > 0
      ? Math.round(((currentSessions - previousSessions) / previousSessions) * 100)
      : null

    return {
      currentVolume,
      previousVolume,
      volumePctChange,
      currentSessions,
      previousSessions,
      sessionsPctChange,
      hasPreviousData,
    }
  }, [filteredHistory, previousPeriodHistory])

  const muscleDistribution = useMemo(
    () => computeMuscleDistribution(filteredHistory),
    [filteredHistory]
  )

  return {
    history,
    filteredHistory,
    previousPeriodHistory,
    periodComparison,
    muscleDistribution,
    stats,
    volumeChart,
    personalRecords,
    timeRange,
    setTimeRange,
    loading,
    error,
    refresh: fetchData,
    getExerciseProgress,
    periodBoundaries,
  }
}
