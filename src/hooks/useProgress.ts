import { useState, useEffect, useCallback } from 'react'
import { getWorkoutHistory, getProgressStats, getVolumeChartData, getPersonalRecords, getExerciseProgress } from '@/lib/progress'
import { useAuth } from '@/context/AuthContext'
import type { WorkoutSession, ProgressStats, ChartDataPoint, PersonalRecord } from '@/types'

export type TimeRange = '7d' | '30d' | '90d' | '1y'

const RANGE_DAYS: Record<TimeRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
}

export function useProgress() {
  const { user } = useAuth()
  
  const [history, setHistory] = useState<WorkoutSession[]>([])
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [volumeChart, setVolumeChart] = useState<ChartDataPoint[]>([])
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const [historyRes, statsRes, volumeRes, prsRes] = await Promise.all([
      getWorkoutHistory(user.id),
      getProgressStats(user.id),
      getVolumeChartData(user.id, RANGE_DAYS[timeRange]),
      getPersonalRecords(user.id)
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
  }, [user, timeRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    history,
    stats,
    volumeChart,
    personalRecords,
    timeRange,
    setTimeRange,
    loading,
    error,
    refresh: fetchData,
    getExerciseProgress
  }
}
