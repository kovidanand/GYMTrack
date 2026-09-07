import { useState, useEffect, useCallback, useRef } from 'react'
import { getWorkoutById, logSet } from '@/lib/workouts'
import { useAuth } from '@/context/AuthContext'
import { 
  cacheWorkout, 
  getCachedWorkout, 
  saveActiveSession, 
  getActiveSession, 
  clearActiveSession,
  enqueueSyncOperation,
  generateUUID
} from '@/lib/offline/db'
import { syncEngine } from '@/lib/offline/syncEngine'
import type { Workout, WorkoutExercise, WorkoutSessionSet } from '@/types'

export type TimerState = 'idle' | 'running' | 'paused' | 'finished'

export function useWorkoutExecution(workoutId: string) {
  const { user } = useAuth()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Execution state
  const sessionIdRef = useRef<string>(generateUUID())
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [completedSets, setCompletedSets] = useState<Record<string, number[]>>({}) // exercise_id -> array of completed set numbers
  const [sessionSetsData, setSessionSetsData] = useState<Partial<WorkoutSessionSet>[]>([])
  
  // Timer state
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [timeRemaining, setTimeRemaining] = useState(0)
  
  // Fetch workout data and restore active session if present
  useEffect(() => {
    async function loadWorkoutAndSession() {
      setLoading(true)
      setError(null)

      let loadedWorkout: Workout | null = null

      // 1. Try loading workout from cloud or local cache
      try {
        const { data, error: fetchErr } = await getWorkoutById(workoutId)
        if (data && !fetchErr) {
          loadedWorkout = data
          // Cache locally for future offline usage
          await cacheWorkout(data).catch(() => {})
        }
      } catch {
        // Network failure
      }

      if (!loadedWorkout) {
        // Fallback to cached workout in IndexedDB
        loadedWorkout = await getCachedWorkout(workoutId).catch(() => null)
      }

      if (!loadedWorkout) {
        setError('Workout not found. Please connect to the internet to load this workout.')
        setLoading(false)
        return
      }

      setWorkout(loadedWorkout)

      // 2. Check for existing active session in IndexedDB (resume interrupted workout)
      try {
        const active = await getActiveSession(workoutId)
        if (active && (!user || active.userId === user.id)) {
          sessionIdRef.current = active.sessionId || generateUUID()
          setSessionStartTime(active.startedAt)
          setCurrentExerciseIndex(active.currentExerciseIndex || 0)
          setCompletedSets(active.completedSets || {})
          setSessionSetsData(active.sessionSetsData || [])
        } else {
          const now = Date.now()
          const newSessionId = generateUUID()
          sessionIdRef.current = newSessionId
          setSessionStartTime(now)
          
          if (user) {
            await saveActiveSession({
              workoutId,
              userId: user.id,
              sessionId: newSessionId,
              startedAt: now,
              currentExerciseIndex: 0,
              completedSets: {},
              sessionSetsData: [],
              updatedAt: now
            }).catch(() => {})
          }
        }
      } catch (err) {
        console.error('[GYMTrack] Error restoring active session:', err)
        setSessionStartTime(Date.now())
      }

      setLoading(false)
    }

    loadWorkoutAndSession()
  }, [workoutId, user])

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (timerState === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && timerState === 'running') {
      setTimerState('finished')
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

  // Persist in-progress state to IndexedDB
  const persistSessionState = useCallback((
    exerciseIndex: number,
    updatedCompletedSets: Record<string, number[]>,
    updatedSetsData: Partial<WorkoutSessionSet>[]
  ) => {
    if (!user) return
    saveActiveSession({
      workoutId,
      userId: user.id,
      sessionId: sessionIdRef.current,
      startedAt: sessionStartTime,
      currentExerciseIndex: exerciseIndex,
      completedSets: updatedCompletedSets,
      sessionSetsData: updatedSetsData,
      updatedAt: Date.now()
    }).catch(err => {
      console.error('[GYMTrack] Failed to persist active session to IndexedDB:', err)
    })
  }, [user, workoutId, sessionStartTime])

  // Set completion logic
  const completeSet = async (
    exercise: WorkoutExercise, 
    setNumber: number, 
    actualWeight: number | null, 
    actualReps: number | null
  ) => {
    if (!user) return false

    const newCompletedForEx = [...(completedSets[exercise.id] || []), setNumber]
    const updatedCompletedSets = {
      ...completedSets,
      [exercise.id]: newCompletedForEx
    }
    setCompletedSets(updatedCompletedSets)

    const newSetRecord: Partial<WorkoutSessionSet> = {
      id: generateUUID(),
      workout_exercise_id: exercise.id,
      exercise_id: exercise.exercise_id,
      exercise_name: exercise.exercise?.name || 'Unknown Exercise',
      set_number: setNumber,
      weight: actualWeight,
      reps: actualReps,
      completed: true,
      is_personal_record: false
    }

    const updatedSetsData = [...sessionSetsData, newSetRecord]
    setSessionSetsData(updatedSetsData)

    // Auto-advance logic
    const isLastSet = setNumber === exercise.sets
    const isLastExercise = currentExerciseIndex === (workout?.workout_exercises?.length || 1) - 1
    const nextExerciseIdx = isLastSet && !isLastExercise ? currentExerciseIndex + 1 : currentExerciseIndex

    if (isLastSet && !isLastExercise) {
      setCurrentExerciseIndex(nextExerciseIdx)
    }

    // Persist immediately to IndexedDB
    persistSessionState(nextExerciseIdx, updatedCompletedSets, updatedSetsData)

    // Auto-start rest timer
    if (!isLastSet || !isLastExercise) {
      startRestTimer(exercise.rest_seconds || 60)
    }

    // Try logging set in background (online sync / legacy log); do not block UI if offline
    logSet({
      user_id: user.id,
      workout_exercise_id: exercise.id,
      set_number: setNumber,
      weight: actualWeight,
      reps: actualReps,
      completed: true
    }).catch(() => {
      // Ignored if offline; session is fully preserved in sync queue when finished
    })

    return true
  }

  // Remove / un-complete a set (allows editing or undoing mistaken entries)
  const removeSet = (exerciseId: string, setNumber: number) => {
    const existing = completedSets[exerciseId] || []
    const filtered = existing.filter(n => n !== setNumber)
    const updatedCompletedSets = {
      ...completedSets,
      [exerciseId]: filtered
    }
    setCompletedSets(updatedCompletedSets)

    const updatedSetsData = sessionSetsData.filter(
      s => !(s.workout_exercise_id === exerciseId && s.set_number === setNumber)
    )
    setSessionSetsData(updatedSetsData)

    persistSessionState(currentExerciseIndex, updatedCompletedSets, updatedSetsData)
  }

  // Finish workout logic
  const finishWorkout = async (): Promise<{ success: boolean; isOffline: boolean }> => {
    if (!user || !workout) return { success: false, isOffline: false }
    
    const durationSeconds = Math.max(1, Math.floor((Date.now() - sessionStartTime) / 1000))
    
    let totalVolume = 0
    sessionSetsData.forEach(s => {
      if (s.weight && s.reps) {
        totalVolume += (s.weight * s.reps)
      }
    })
    
    const totalSets = workout.workout_exercises?.reduce((acc, ex) => acc + ex.sets, 0) || 0
    const totalExercises = workout.workout_exercises?.length || 0
    const sessionId = sessionIdRef.current

    // Prepare sets with stable UUIDs
    const finalizedSets: Partial<WorkoutSessionSet>[] = sessionSetsData.map(s => ({
      ...s,
      id: s.id || generateUUID(),
      session_id: sessionId
    }))

    const sessionPayload = {
      id: sessionId,
      user_id: user.id,
      workout_id: workout.id,
      workout_name: workout.name,
      started_at: new Date(sessionStartTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      total_exercises: totalExercises,
      total_sets: totalSets,
      completed_sets: finalizedSets.length,
      total_volume: totalVolume,
      status: 'completed'
    }

    try {
      // 1. Clear in-progress session from IndexedDB
      await clearActiveSession(workoutId).catch(() => {})

      // 2. Enqueue in IndexedDB sync queue
      await enqueueSyncOperation({
        id: generateUUID(),
        userId: user.id,
        sessionId,
        operationType: 'SAVE_WORKOUT_SESSION',
        payload: {
          sessionData: sessionPayload,
          setsData: finalizedSets
        },
        createdAt: Date.now(),
        syncStatus: 'pending',
        retryCount: 0
      })

      // 3. Trigger immediate sync if online
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
      if (isOnline) {
        syncEngine.syncPending().catch(err => {
          console.error('[GYMTrack] Immediate sync attempt error:', err)
        })
      }

      return { success: true, isOffline: !isOnline }
    } catch (err) {
      console.error('[GYMTrack] Error finishing workout session:', err)
      return { success: false, isOffline: false }
    }
  }

  // Navigation
  const nextExercise = () => {
    if (workout?.workout_exercises && currentExerciseIndex < workout.workout_exercises.length - 1) {
      const nextIdx = currentExerciseIndex + 1
      setCurrentExerciseIndex(nextIdx)
      persistSessionState(nextIdx, completedSets, sessionSetsData)
      skipRest()
    }
  }

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      const prevIdx = currentExerciseIndex - 1
      setCurrentExerciseIndex(prevIdx)
      persistSessionState(prevIdx, completedSets, sessionSetsData)
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
    removeSet,
    startRestTimer,
    skipRest,
    nextExercise,
    prevExercise,
    finishWorkout
  }
}
