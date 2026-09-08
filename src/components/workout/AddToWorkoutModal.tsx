import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus, Dumbbell, Check, Loader2, Zap, Calendar, Play } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getWorkouts, createWorkout, addWorkoutExercise } from '@/lib/workouts'
import { queueExerciseForTodayWorkout } from '@/lib/offline/db'
import { emitGymtrackEvent } from '@/lib/events'
import { useToast } from '@/components/shared/Toast'
import type { Exercise, Workout } from '@/types'

interface AddToWorkoutModalProps {
  exercise: Exercise | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToWorkoutModal({ exercise, isOpen, onOpenChange }: AddToWorkoutModalProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { success: showSuccessToast } = useToast()

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Quick vs Routine Tab
  const [showRoutines, setShowRoutines] = useState(false)
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newWorkoutName, setNewWorkoutName] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      loadWorkouts()
    }
    if (!isOpen) {
      setShowRoutines(false)
      setIsCreatingNew(false)
      setNewWorkoutName('')
      setError(null)
    }
  }, [isOpen, user])

  const loadWorkouts = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await getWorkouts(user.id)
      if (!err && data) {
        setWorkouts(data)
        if (data.length > 0) {
          setSelectedWorkoutId(data[0].id)
        }
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false)
    }
  }

  // 1-Tap Quick Action: Add to Today's Workout
  const handleAddToTodayWorkout = () => {
    if (!exercise) return
    queueExerciseForTodayWorkout(exercise, 3, '10', null)
    emitGymtrackEvent('gymtrack:workout_updated', {
      workoutId: 'quick',
      action: 'add_exercise'
    })
    showSuccessToast(
      `Added ${exercise.name} to Today's Workout!`,
      'Ready to log in your active session.'
    )
    onOpenChange(false)
  }

  // Quick Start Now
  const handleStartTodayWorkoutNow = () => {
    handleAddToTodayWorkout()
    navigate('/workouts/quick')
  }

  // Routine Submission
  const handleRoutineSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !exercise) return

    setSaving(true)
    setError(null)

    try {
      let targetWorkoutId = selectedWorkoutId
      let targetWorkoutName = ''

      if (isCreatingNew) {
        const trimmed = newWorkoutName.trim()
        if (!trimmed) {
          setError('Please provide a workout routine name.')
          setSaving(false)
          return
        }

        const { data: newW, error: createErr } = await createWorkout({
          user_id: user.id,
          name: trimmed,
          estimated_duration: 45
        })

        if (createErr || !newW) {
          throw new Error(createErr || 'Failed to create new routine.')
        }

        targetWorkoutId = newW.id
        targetWorkoutName = newW.name
      } else {
        const found = workouts.find(w => w.id === targetWorkoutId)
        targetWorkoutName = found?.name || 'Workout'
      }

      const targetWorkout = workouts.find(w => w.id === targetWorkoutId)
      const currentOrder = targetWorkout?.workout_exercises?.length ? targetWorkout.workout_exercises.length + 1 : 1

      const { error: addErr } = await addWorkoutExercise({
        workout_id: targetWorkoutId,
        exercise_id: exercise.id,
        exercise_order: currentOrder,
        sets: 3,
        reps: '10',
        weight: null,
        rest_seconds: 60
      })

      if (addErr) throw new Error(addErr)

      emitGymtrackEvent('gymtrack:workout_updated', {
        workoutId: targetWorkoutId,
        action: 'add_exercise'
      })

      showSuccessToast(`Added ${exercise.name} to ${targetWorkoutName}!`, 'Routine updated successfully')
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add exercise to workout.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (!exercise) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 sm:top-1/2 sm:bottom-auto left-1/2 -translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[94vw] max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-surface-200 z-50 animate-slide-up sm:animate-scale-in focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-surface-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Dumbbell size={18} />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-surface-900 leading-tight">
                  Add to Workout
                </Dialog.Title>
                <p className="text-xs text-surface-500 line-clamp-1">{exercise.name}</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 leading-relaxed">
                {error}
              </div>
            )}

            {/* ── 1-Tap Fast Logging Action (Phase 15) ── */}
            <div className="card p-4 bg-gradient-to-br from-brand-50/60 to-surface-50 border border-brand-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-brand-600 fill-brand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-800">
                  Today's Workout
                </h3>
              </div>
              <p className="text-xs text-surface-600 leading-relaxed">
                Instantly stage <strong>{exercise.name}</strong> to your session. When you start your workout, it will appear ready to log with default 3 sets.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddToTodayWorkout}
                  className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus size={15} />
                  Add to Today's Workout
                </button>
                <button
                  type="button"
                  onClick={handleStartTodayWorkoutNow}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                  title="Add and start workout runner immediately"
                >
                  <Play size={13} />
                  Start Now
                </button>
              </div>
            </div>

            {/* ── Optional: Add to Saved Routine ── */}
            <div className="border-t border-surface-100 pt-3">
              <button
                type="button"
                onClick={() => setShowRoutines(!showRoutines)}
                className="w-full text-left text-xs font-semibold text-surface-500 hover:text-surface-800 flex items-center justify-between py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Or add to a saved routine
                </span>
                <span>{showRoutines ? '▲' : '▼'}</span>
              </button>

              {showRoutines && (
                <form onSubmit={handleRoutineSubmit} className="mt-3 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-surface-600 uppercase tracking-wider">
                      Select Routine
                    </label>
                    {workouts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingNew(!isCreatingNew)}
                        className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                      >
                        {isCreatingNew ? 'Choose Existing' : '+ New Routine'}
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-2 text-surface-400 gap-2 text-xs">
                      <Loader2 size={14} className="animate-spin text-brand-500" />
                      Loading routines...
                    </div>
                  ) : isCreatingNew || workouts.length === 0 ? (
                    <input
                      type="text"
                      value={newWorkoutName}
                      onChange={e => setNewWorkoutName(e.target.value)}
                      placeholder="e.g. Upper Body Push"
                      className="input-base text-xs"
                      required
                      autoFocus
                    />
                  ) : (
                    <select
                      value={selectedWorkoutId}
                      onChange={e => setSelectedWorkoutId(e.target.value)}
                      className="input-base text-xs"
                      required
                    >
                      {workouts.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.workout_exercises?.length || 0} exercises)
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    type="submit"
                    disabled={saving || loading}
                    className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5 font-bold"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Save to Routine
                  </button>
                </form>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
