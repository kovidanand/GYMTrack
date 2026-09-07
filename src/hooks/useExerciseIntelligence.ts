import { useState, useEffect, useCallback } from 'react'
import { getExerciseIntelligence } from '@/lib/exerciseIntelligence'
import { useAuth } from '@/context/AuthContext'
import type { ExerciseIntelligence } from '@/types'

export function useExerciseIntelligence(exerciseId: string | null | undefined) {
  const { user } = useAuth()
  const [intelligence, setIntelligence] = useState<ExerciseIntelligence | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIntelligence = useCallback(async () => {
    if (!user || !exerciseId) {
      setIntelligence(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: err } = await getExerciseIntelligence(user.id, exerciseId)

    if (err) {
      setError(err)
      setIntelligence(null)
    } else {
      setIntelligence(data)
    }

    setLoading(false)
  }, [user, exerciseId])

  useEffect(() => {
    fetchIntelligence()
  }, [fetchIntelligence])

  return {
    intelligence,
    loading,
    error,
    refresh: fetchIntelligence
  }
}
