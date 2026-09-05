import { useState, useEffect, useCallback } from 'react'
import { getWorkoutById, logSet } from '@/lib/workouts'
import { saveWorkoutSession } from '@/lib/progress'
import { useAuth } from '@/context/AuthContext'
import type { Workout, WorkoutExercise, WorkoutSessionSet } from '@/types'

export type TimerState = 'idle' | 'running' | 'paused' | 'finished'

export function useWorkoutExecution(workoutId: string) {
  const { user } = useAuth()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Execution state
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [completedSets, setCompletedSets] = useState<Record<string, number[]>>({}) // exercise_id -> array of completed set numbers
  const [sessionSetsData, setSessionSetsData] = useState<Partial<WorkoutSessionSet>[]>([])
  
  // Timer state
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [timeRemaining, setTimeRemaining] = useState(0)
  
  // Fetch workout data
  useEffect(() => {
    async function loadWorkout() {
      setLoading(true)
      const { data, error } = await getWorkoutById(workoutId)
      if (error || !data) {
        setError(error || 'Workout not found')
      } else {
        setWorkout(data)
        setSessionStartTime(Date.now())
      }
      setLoading(false)
    }
    loadWorkout()
  }, [workoutId])

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (timerState === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && timerState === 'running') {
      setTimerState('finished')
      // Optional: play a sound or vibration here
    }
    return () => clearInterval(interval)
  }, [timerState, timeRemaining])

  const startRestTimer = useCallback((seconds: number) => {
    setTimeRemaining(seconds)
    setTimerState('running')
  }, [])

  const skipRest = useCallback(() => {
    setTimerState('idle')
    setTimeRemaining(0)
  }, [])

  // Set completion logic
  const completeSet = async (
    exercise: WorkoutExercise, 
    setNumber: number, 
    actualWeight: number | null, 
    actualReps: number | null
  ) => {
    if (!user) return false
    
    // Optimistic UI update
    setCompletedSets(prev => {
      const existing = prev[exercise.id] || []
      return {
        ...prev,
        [exercise.id]: [...existing, setNumber]
      }
    })
    
    // Store for session save
    setSessionSetsData(prev => [
      ...prev,
      {
        workout_exercise_id: exercise.id,
        exercise_id: exercise.exercise_id,
        exercise_name: exercise.exercise?.name || 'Unknown Exercise',
        set_number: setNumber,
        weight: actualWeight,
        reps: actualReps,
        completed: true,
        is_personal_record: false // We evaluate PRs on the backend/later
      }
    ])

    // Auto-start rest timer if there are more sets, or more exercises
    const isLastSet = setNumber === exercise.sets
    const isLastExercise = currentExerciseIndex === (workout?.workout_exercises?.length || 1) - 1
    
    if (!isLastSet || !isLastExercise) {
       startRestTimer(exercise.rest_seconds)
    }

    // Save to Supabase (Legacy Phase 4 log)
    // We still log to workout_set_logs so Phase 4 template data remains intact
    const { error } = await logSet({
      user_id: user.id,
      workout_exercise_id: exercise.id,
      set_number: setNumber,
      weight: actualWeight,
      reps: actualReps,
      completed: true
    })

    if (error) {
      console.error("Failed to log set", error)
      return false
    }

    // Auto advance exercise if all sets completed
    if (isLastSet && !isLastExercise) {
      setCurrentExerciseIndex(prev => prev + 1)
    }

    return true
  }
  
  const finishWorkout = async () => {
    if (!user || !workout) return false
    
    const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000)
    
    let totalVolume = 0
    sessionSetsData.forEach(s => {
      if (s.weight && s.reps) {
        totalVolume += (s.weight * s.reps)
      }
    })
    
    const totalSets = workout.workout_exercises?.reduce((acc, ex) => acc + ex.sets, 0) || 0
    const totalExercises = workout.workout_exercises?.length || 0
    
    const { data, error } = await saveWorkoutSession({
      user_id: user.id,
      workout_id: workout.id,
      workout_name: workout.name,
      started_at: new Date(sessionStartTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      total_exercises: totalExercises,
      total_sets: totalSets,
      completed_sets: sessionSetsData.length,
      total_volume: totalVolume,
      status: 'completed'
    }, sessionSetsData)
    
    return !error
  }

  // Navigation
  const nextExercise = () => {
    if (workout?.workout_exercises && currentExerciseIndex < workout.workout_exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
      skipRest()
    }
  }

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
      skipRest()
    }
  }

  return {
    workout,
    loading,
    error,
    currentExerciseIndex,
    currentExercise: workout?.workout_exercises?.[currentExerciseIndex] || null,
    completedSets,
    timerState,
    timeRemaining,
    completeSet,
    startRestTimer,
    skipRest,
    nextExercise,
    prevExercise,
    finishWorkout
  }
}
