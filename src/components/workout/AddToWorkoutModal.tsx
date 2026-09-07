import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus, Dumbbell, Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getWorkouts, createWorkout, addWorkoutExercise } from '@/lib/workouts'
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
  const { success: showSuccessToast } = useToast()

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selection & Form state
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newWorkoutName, setNewWorkoutName] = useState('')
  const [targetSets, setTargetSets] = useState<number>(3)
  const [targetReps, setTargetReps] = useState<string>('8-12')
  const [targetWeight, setTargetWeight] = useState<string>('')

  useEffect(() => {
    if (isOpen && user) {
      loadWorkouts()
    }
    if (!isOpen) {
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
      if (err) {
        setError(err)
      } else {
        const list = data || []
        setWorkouts(list)
        if (list.length > 0) {
          setSelectedWorkoutId(list[0].id)
        } else {
          setIsCreatingNew(true)
        }
      }
    } catch {
      setError('Failed to load workouts.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
          setError('Please provide a workout name.')
          setSaving(false)
          return
        }

        const { data: newW, error: createErr } = await createWorkout({
          user_id: user.id,
          name: trimmed,
          estimated_duration: 45
        })

        if (createErr || !newW) {
          throw new Error(createErr || 'Failed to create new workout.')
        }

        targetWorkoutId = newW.id
        targetWorkoutName = newW.name
      } else {
        const found = workouts.find(w => w.id === targetWorkoutId)
        targetWorkoutName = found?.name || 'Workout'
      }

      // Calculate next exercise order
      const targetWorkout = workouts.find(w => w.id === targetWorkoutId)
      const currentOrder = targetWorkout?.workout_exercises?.length ? targetWorkout.workout_exercises.length + 1 : 1

      // Add exercise to workout
      const { error: addErr } = await addWorkoutExercise({
        workout_id: targetWorkoutId,
        exercise_id: exercise.id,
        exercise_order: currentOrder,
        sets: Math.max(1, targetSets),
        reps: targetReps.trim() || '8-12',
        weight: targetWeight ? parseFloat(targetWeight) : null,
        rest_seconds: 90
      })

      if (addErr) {
        throw new Error(addErr)
      }

      // Emit global synchronization event
      emitGymtrackEvent('gymtrack:workout_updated', {
        workoutId: targetWorkoutId,
        action: 'add_exercise'
      })

      showSuccessToast(`Added ${exercise.name} to ${targetWorkoutName}!`, 'Exercise configured with target sets and reps')
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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md bg-white rounded-2xl p-6 shadow-xl border border-surface-200 z-50 animate-scale-in focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-100">
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

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 leading-relaxed">
                {error}
              </div>
            )}

            {/* Target Workout Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">
                  Target Workout
                </label>
                {workouts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(!isCreatingNew)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    {isCreatingNew ? 'Choose Existing' : '+ New Workout'}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-4 text-surface-400 gap-2 text-sm">
                  <Loader2 size={16} className="animate-spin text-brand-500" />
                  Loading your workouts...
                </div>
              ) : isCreatingNew || workouts.length === 0 ? (
                <div>
                  <input
                    type="text"
                    value={newWorkoutName}
                    onChange={e => setNewWorkoutName(e.target.value)}
                    placeholder="e.g. Upper Body Push, Leg Day"
                    className="input-base"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-surface-500 mt-1">
                    A new workout will be created and added to your routines.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedWorkoutId}
                  onChange={e => setSelectedWorkoutId(e.target.value)}
                  className="input-base"
                  required
                >
                  {workouts.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.workout_exercises?.length || 0} exercises)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Configuration: Sets, Reps, Weight */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-surface-700 block mb-1">
                  Sets
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={targetSets}
                  onChange={e => setTargetSets(parseInt(e.target.value) || 1)}
                  className="input-base text-center font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-surface-700 block mb-1">
                  Reps
                </label>
                <input
                  type="text"
                  value={targetReps}
                  onChange={e => setTargetReps(e.target.value)}
                  placeholder="8-12"
                  className="input-base text-center font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-surface-700 block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={targetWeight}
                  onChange={e => setTargetWeight(e.target.value)}
                  placeholder="Optional"
                  className="input-base text-center font-bold"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 btn-secondary text-sm py-2.5"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                disabled={saving || loading}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Confirm Add
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
