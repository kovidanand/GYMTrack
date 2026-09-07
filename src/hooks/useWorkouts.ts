import { useState, useEffect, useCallback } from 'react'
import { 
  getWorkoutPlans, 
  getActiveWorkoutPlan, 
  getWorkouts,
  deleteWorkout,
  deleteWorkoutPlan,
  setActivePlan,
  createStarterRoutine
} from '@/lib/workouts'
import { useAuth } from '@/context/AuthContext'
import type { WorkoutPlan, Workout } from '@/types'

export function useWorkouts() {
  const { user } = useAuth()
  
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [activePlan, setActivePlanState] = useState<WorkoutPlan | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const [plansRes, activePlanRes, workoutsRes] = await Promise.all([
      getWorkoutPlans(user.id),
      getActiveWorkoutPlan(user.id),
      getWorkouts(user.id)
    ])

    if (plansRes.error || workoutsRes.error) {
      setError(plansRes.error || workoutsRes.error || 'Failed to load data')
    } else {
      setPlans(plansRes.data || [])
      setActivePlanState(activePlanRes.data)
      setWorkouts(workoutsRes.data || [])
    }
    
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteWorkout = async (id: string) => {
    const success = await deleteWorkout(id)
    if (success) {
      setWorkouts(prev => prev.filter(w => w.id !== id))
    }
    return success
  }

  const handleDeletePlan = async (id: string) => {
    const success = await deleteWorkoutPlan(id)
    if (success) {
      setPlans(prev => prev.filter(p => p.id !== id))
      if (activePlan?.id === id) setActivePlanState(null)
    }
    return success
  }

  const handleSetActivePlan = async (id: string) => {
    if (!user) return false
    const success = await setActivePlan(user.id, id)
    if (success) {
      // Optimistically update local state
      setPlans(prev => prev.map(p => ({ ...p, is_active: p.id === id })))
      const newActive = plans.find(p => p.id === id)
      if (newActive) {
        setActivePlanState({ ...newActive, is_active: true })
      }
    }
    return success
  }

  const handleCreateStarterRoutine = async () => {
    if (!user) return false
    setLoading(true)
    const { data, error: err } = await createStarterRoutine(user.id)
    if (data) {
      await fetchData()
      return true
    }
    setError(err || 'Failed to generate starter routine')
    setLoading(false)
    return false
  }

  return {
    plans,
    activePlan,
    workouts,
    loading,
    error,
    refresh: fetchData,
    deleteWorkout: handleDeleteWorkout,
    deletePlan: handleDeletePlan,
    setActivePlan: handleSetActivePlan,
    createStarterRoutine: handleCreateStarterRoutine
  }
}
