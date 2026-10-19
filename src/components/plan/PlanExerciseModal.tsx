import { useState, useEffect } from 'react'
import { X, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Dumbbell } from 'lucide-react'
import { ExerciseMedia } from '@/components/exercise/ExerciseComponents'
import { MuscleGroupBadge } from '@/components/shared'
import { useAuth } from '@/context/AuthContext'
import { getPreviousExercisePerformance } from '@/lib/workouts'
import { logCanonicalWorkout } from '@/lib/workoutService'
import { markPlanExerciseCompleted } from '@/lib/planProgressService'
import type { Exercise } from '@/types'

interface SetRow {
  setNumber: number
  weight: number
  reps: number
  completed: boolean
}

interface PlanExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  exercise: Exercise | null
  workoutId: string
  workoutName: string
  workoutExerciseId?: string
  targetSets?: number
  targetReps?: string
  restSeconds?: number
  planId?: string
  instanceId?: string
  weekNumber?: number
  dayNumber?: number
  onCompleted: (exerciseId: string, sets: SetRow[]) => void
}

export function PlanExerciseModal({
  isOpen,
  onClose,
  exercise,
  workoutId,
  workoutName,
  workoutExerciseId,
  targetSets = 3,
  targetReps = '8-12',
  restSeconds = 90,
  planId,
  instanceId,
  weekNumber,
  dayNumber,
  onCompleted
}: PlanExerciseModalProps) {
  const { user } = useAuth()
  const [sets, setSets] = useState<SetRow[]>([])
  const [saving, setSaving] = useState(false)
  const [showCues, setShowCues] = useState(false)
  const [prevWeight, setPrevWeight] = useState<number | null>(null)
  const [successToast, setSuccessToast] = useState(false)

  // Initialize sets with sensible defaults and previous performance
  useEffect(() => {
    if (!isOpen || !exercise || !user) return

    const initSets = async () => {
      const prev = await getPreviousExercisePerformance(exercise.id, user.id)
      const defaultWeight = prev?.weight || 20
      const defaultReps = prev?.reps || parseInt(targetReps.split('-')[0]) || 10
      setPrevWeight(prev?.weight || null)

      const initial: SetRow[] = []
      const count = Math.max(1, targetSets)
      for (let i = 1; i <= count; i++) {
        initial.push({
          setNumber: i,
          weight: defaultWeight,
          reps: defaultReps,
          completed: true
        })
      }
      setSets(initial)
    }

    initSets()
    setSuccessToast(false)
  }, [isOpen, exercise, user, targetSets, targetReps])

  if (!isOpen || !exercise) return null

  const handleWeightChange = (index: number, delta: number) => {
    setSets(prev => {
      const next = [...prev]
      const current = next[index].weight
      next[index] = { ...next[index], weight: Math.max(0, Math.round((current + delta) * 10) / 10) }
      return next
    })
  }

  const handleRepsChange = (index: number, delta: number) => {
    setSets(prev => {
      const next = [...prev]
      const current = next[index].reps
      next[index] = { ...next[index], reps: Math.max(1, current + delta) }
      return next
    })
  }

  const handleAddSet = () => {
    setSets(prev => {
      const last = prev[prev.length - 1]
      return [
        ...prev,
        {
          setNumber: prev.length + 1,
          weight: last ? last.weight : 20,
          reps: last ? last.reps : 10,
          completed: true
        }
      ]
    })
  }

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) return
    setSets(prev => {
      const next = prev.filter((_, i) => i !== index)
      return next.map((s, i) => ({ ...s, setNumber: i + 1 }))
    })
  }

  const handleSaveExercise = async () => {
    if (!user || sets.length === 0 || saving) return
    setSaving(true)

    try {
      const result = await logCanonicalWorkout({
        userId: user.id,
        workoutName: workoutName || 'Plan Workout',
        workoutId: workoutId || null,
        exercises: [{
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          workoutExerciseId: workoutExerciseId || undefined,
          sets: sets.map(s => ({
            setNumber: s.setNumber,
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
            completed: s.completed !== false
          }))
        }],
        source: 'plan'
      })

      if (!result.success) {
        console.error('[PlanExerciseModal] Save failed:', result.error)
        setSaving(false)
        return
      }

      // Record exercise-specific completion in current plan instance
      if (planId && instanceId && weekNumber != null && dayNumber != null) {
        await markPlanExerciseCompleted({
          planId,
          userId: user.id,
          instanceId,
          weekNumber,
          dayNumber,
          workoutExerciseId,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sessionId: result.sessionId,
          setsCount: sets.length
        })
      }

      // Show success feedback
      setSuccessToast(true)
      onCompleted(exercise.id, sets)

      setTimeout(() => {
        onClose()
      }, 500)
    } catch (err) {
      console.error('[PlanExerciseModal] Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-surface-900/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-exercise-modal-title"
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-surface-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-surface-100 flex items-center justify-between gap-3 bg-surface-50/70">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h2 id="plan-exercise-modal-title" className="text-base sm:text-lg font-bold text-surface-900 truncate">
                {exercise.name}
              </h2>
              {exercise.muscle_group && (
                <MuscleGroupBadge group={exercise.muscle_group} />
              )}
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Target: {targetSets} sets × {targetReps} reps · {restSeconds}s rest
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-200/60 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Exercise Video Demonstration */}
          <div className="rounded-xl overflow-hidden bg-surface-100 border border-surface-200 aspect-video relative shadow-xs">
            <ExerciseMedia exercise={exercise} variant="detail" />
          </div>

          {/* Form Cues Accordion */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div className="border border-surface-200 rounded-xl overflow-hidden bg-surface-50">
              <button
                type="button"
                onClick={() => setShowCues(!showCues)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-surface-700 hover:bg-surface-100/70 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-brand-600" />
                  Key Form Instructions & Cues
                </span>
                {showCues ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {showCues && (
                <div className="px-3.5 pb-3 text-xs text-surface-600 space-y-1.5 border-t border-surface-200/60 pt-2">
                  {exercise.instructions.map((inst, i) => (
                    <p key={i} className="flex gap-2">
                      <span className="font-bold text-brand-600">{i + 1}.</span>
                      <span>{inst}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Previous Performance Note */}
          {prevWeight !== null && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-brand-50/70 border border-brand-100 text-xs text-brand-900 font-medium">
              <Dumbbell size={14} className="text-brand-600 flex-shrink-0" />
              <span>Last logged resistance: <b>{prevWeight} kg</b>. Aim for clean reps or a slight load increase.</span>
            </div>
          )}

          {/* Sets Recording Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">
                Log Your Completed Sets
              </h3>
              <button
                type="button"
                onClick={handleAddSet}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus size={13} /> Add Set
              </button>
            </div>

            <div className="space-y-2">
              {sets.map((set, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-surface-200 bg-surface-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2 min-w-[60px]">
                    <span className="text-xs font-bold text-surface-700">Set {set.setNumber}</span>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Weight Controls */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-surface-400">Weight:</span>
                      <button
                        type="button"
                        onClick={() => handleWeightChange(idx, -2.5)}
                        className="w-7 h-7 rounded-lg bg-white border border-surface-200 font-bold text-xs text-surface-700 hover:bg-surface-100 active:scale-95 transition-all"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={set.weight}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0
                          setSets(prev => {
                            const next = [...prev]
                            next[idx] = { ...next[idx], weight: Math.max(0, val) }
                            return next
                          })
                        }}
                        className="w-14 text-center font-bold text-xs py-1 rounded-lg border border-surface-200 bg-white text-surface-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleWeightChange(idx, 2.5)}
                        className="w-7 h-7 rounded-lg bg-white border border-surface-200 font-bold text-xs text-surface-700 hover:bg-surface-100 active:scale-95 transition-all"
                      >
                        +
                      </button>
                      <span className="text-[11px] font-medium text-surface-500">kg</span>
                    </div>

                    {/* Reps Controls */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-surface-400">Reps:</span>
                      <button
                        type="button"
                        onClick={() => handleRepsChange(idx, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-surface-200 font-bold text-xs text-surface-700 hover:bg-surface-100 active:scale-95 transition-all"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={set.reps}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 1
                          setSets(prev => {
                            const next = [...prev]
                            next[idx] = { ...next[idx], reps: Math.max(1, val) }
                            return next
                          })
                        }}
                        className="w-12 text-center font-bold text-xs py-1 rounded-lg border border-surface-200 bg-white text-surface-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleRepsChange(idx, 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-surface-200 font-bold text-xs text-surface-700 hover:bg-surface-100 active:scale-95 transition-all"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete Set */}
                    {sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(idx)}
                        className="text-surface-400 hover:text-red-500 p-1 transition-colors"
                        title="Remove set"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 border-t border-surface-100 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs sm:text-sm py-2 px-4"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveExercise}
            disabled={saving}
            className="btn-primary text-xs sm:text-sm py-2 px-5 flex items-center gap-2 shadow-sm font-bold"
          >
            {saving ? (
              <span>Saving Sets...</span>
            ) : successToast ? (
              <>
                <CheckCircle2 size={16} className="text-white" />
                <span>✓ Completed!</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Mark Exercise Complete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
