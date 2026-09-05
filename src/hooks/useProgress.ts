import { useState, useEffect, useCallback } from 'react'
import { getWorkoutHistory, getProgressStats, getVolumeChartData, getPersonalRecords, getExerciseProgress } from '@/lib/progress'
import { useAuth } from '@/context/AuthContext'
import type { WorkoutSession, ProgressStats, ChartDataPoint, PersonalRecord } from '@/types'

export function useProgress() {
  const { user } = useAuth()
  
  const [history, setHistory] = useState<WorkoutSession[]>([])
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [volumeChart, setVolumeChart] = useState<ChartDataPoint[]>([])
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const [historyRes, statsRes, volumeRes, prsRes] = await Promise.all([
      getWorkoutHistory(user.id),
      getProgressStats(user.id),
      getVolumeChartData(user.id, 30),
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
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    history,
    stats,
    volumeChart,
    personalRecords,
    loading,
    error,
    refresh: fetchData,
    getExerciseProgress
  }
}
