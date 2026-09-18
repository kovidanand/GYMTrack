import React, { useState, useEffect, useMemo } from 'react'
import { Dumbbell, X, ArrowLeft, CheckCircle2, Loader2, Sparkles, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/shared/Toast'
import { logCanonicalWorkout } from '@/lib/workoutService'
import { MuscleGroupBadge } from '@/components/shared'
import { getEquipmentLabel } from '@/lib/utils'
import type { Exercise } from '@/types'

interface ExerciseLogModalProps {
  isOpen: boolean
  exercise: Exercise | null
  onClose: () => void
  onSuccess?: () => void
}

export function ExerciseLogModal({
  isOpen,
  exercise,
  onClose,
  onSuccess
}: ExerciseLogModalProps) {
  const { user } = useAuth()
  const toast = useToast()

  // Steps: 'input' | 'review'
  const [step, setStep] = useState<'input' | 'review'>('input')

  // Form fields
  const [weight, setWeight] = useState<number>(50)
  const [sets, setSets] = useState<number>(3)
  const [reps, setReps] = useState<number>(10)
  const [durationMinutes, setDurationMinutes] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const isBodyweight = useMemo(() => {
    if (!exercise) return false
    const eq = exercise.equipment || []
    return eq.includes('bodyweight') || eq.includes('none')
  }, [exercise])

  // Reset form whenever modal opens with a new exercise
  useEffect(() => {
    if (isOpen && exercise) {
      setStep('input')
      setSets(3)
      setReps(10)
      setNotes('')
      setDurationMinutes(0)
      setShowOptionalFields(false)

      if (isBodyweight) {
        setWeight(0)
      } else {
        // Default weighted baseline
        setWeight(50)
      }
    }
  }, [isOpen, exercise, isBodyweight])

  if (!isOpen || !exercise) return null

  // Volume calculation
  const estimatedVolumeKg = weight * reps * sets

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (sets <= 0 || reps <= 0) {
      toast.error('Please enter at least 1 set and 1 rep.')
      return
    }
    setStep('review')
  }

  const handleConfirmAndSave = async () => {
    if (!user) {
      toast.error('Please sign in to log workouts.')
      return
    }

    setIsSaving(true)
    try {
      // Build individual set items
      const setInputs = Array.from({ length: sets }, (_, idx) => ({
        setNumber: idx + 1,
        weight: Number(weight) || 0,
        reps: Number(reps) || 0,
        completed: true
      }))

      const result = await logCanonicalWorkout({
        userId: user.id,
        workoutName: `${exercise.name} Training`,
        durationSeconds: durationMinutes > 0 ? durationMinutes * 60 : Math.max(300, sets * 90),
        source: 'library',
        exercises: [
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: setInputs
          }
        ]
      })

      if (result.success) {
        const volumeText = estimatedVolumeKg > 0 ? ` · ${estimatedVolumeKg.toLocaleString()} kg volume` : ''
        toast.success(
          `${exercise.name} logged successfully!`,
          `${sets} sets × ${reps} reps${volumeText}`
        )
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Failed to save workout.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error recording workout.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-surface-950/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-log-modal-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-surface-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="p-4 sm:p-5 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Dumbbell size={18} />
            </div>
            <div>
              <h2 id="exercise-log-modal-title" className="text-base font-bold text-surface-900 leading-tight">
                {step === 'input' ? `Log ${exercise.name}` : `Review ${exercise.name}`}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MuscleGroupBadge group={exercise.muscle_group} />
                {exercise.equipment && exercise.equipment.length > 0 && (
                  <span className="badge bg-surface-100 text-surface-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {getEquipmentLabel(exercise.equipment[0])}
                  </span>
                )}
                <span className="text-[10px] text-surface-400 flex items-center gap-0.5">
                  <Calendar size={10} /> Today
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 overflow-y-auto space-y-4">
          {step === 'input' ? (
            <form id="exercise-log-form" onSubmit={handleReview} className="space-y-4">
              {/* Weight Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="log-weight-input" className="text-xs font-bold text-surface-700 uppercase tracking-wider">
                    Weight (kg)
                  </label>
                  {isBodyweight && (
                    <span className="text-[11px] text-surface-400 font-medium">Bodyweight movement</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeight(w => Math.max(0, w - (w >= 20 ? 5 : 2.5)))}
                    className="w-11 h-11 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-800 font-black text-base flex items-center justify-center transition-colors"
                    aria-label="Decrease weight"
                  >
                    -
                  </button>

                  <div className="relative flex-1">
                    <input
                      id="log-weight-input"
                      type="number"
                      step="any"
                      min="0"
                      value={weight === 0 && isBodyweight ? '' : weight}
                      onChange={e => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder={isBodyweight ? '0 (Bodyweight)' : '50'}
                      className="input w-full text-center text-lg font-black text-surface-900 pr-9"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-surface-400">
                      kg
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWeight(w => w + (w >= 20 ? 5 : 2.5))}
                    className="w-11 h-11 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-800 font-black text-base flex items-center justify-center transition-colors"
                    aria-label="Increase weight"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Sets & Reps Inputs */}
              <div className="grid grid-cols-2 gap-3">
                {/* Sets */}
                <div className="space-y-1.5">
                  <label htmlFor="log-sets-input" className="text-xs font-bold text-surface-700 uppercase tracking-wider">
                    Sets
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSets(s => Math.max(1, s - 1))}
                      className="w-9 h-10 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-800 font-black text-base flex items-center justify-center transition-colors"
                      aria-label="Decrease sets"
                    >
                      -
                    </button>
                    <input
                      id="log-sets-input"
                      type="number"
                      min="1"
                      max="20"
                      value={sets}
                      onChange={e => setSets(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="input w-full text-center text-lg font-black text-surface-900"
                    />
                    <button
                      type="button"
                      onClick={() => setSets(s => Math.min(20, s + 1))}
                      className="w-9 h-10 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-800 font-black text-base flex items-center justify-center transition-colors"
                      aria-label="Increase sets"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Reps */}
                <div className="space-y-1.5">
                  <label htmlFor="log-reps-input" className="text-xs font-bold text-surface-700 uppercase tracking-wider">
                    Reps
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReps(r => Math.max(1, r - 1))}
                      className="w-9 h-10 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-800 font-black text-base flex items-center justify-center transition-colors"
                      aria-label="Decrease reps"
                    >
                      -
                    </button>
                    <input
                      id="log-reps-input"
                      type="number"
                      min="1"
                      max="100"
                      value={reps}
                      onChange={e => setReps(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="input w-full text-center text-lg font-black text-surface-900"
                    />
                    <button
                      type="button"
                      onClick={() => setReps(r => Math.min(100, r + 1))}
                      className="w-9 h-10 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-800 font-black text-base flex items-center justify-center transition-colors"
                      aria-label="Increase reps"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsed Secondary Fields: Notes & Duration */}
              <div className="pt-2 border-t border-surface-100">
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="text-xs font-semibold text-surface-500 hover:text-surface-700 flex items-center gap-1 transition-colors"
                >
                  {showOptionalFields ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{showOptionalFields ? 'Hide optional details' : '+ Add duration or notes'}</span>
                </button>

                {showOptionalFields && (
                  <div className="mt-3 space-y-3 animate-fade-in">
                    <div>
                      <label htmlFor="log-duration-input" className="text-[11px] font-bold text-surface-600 uppercase">
                        Duration (Minutes)
                      </label>
                      <input
                        id="log-duration-input"
                        type="number"
                        min="0"
                        max="240"
                        value={durationMinutes || ''}
                        onChange={e => setDurationMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        placeholder="e.g. 15"
                        className="input w-full text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label htmlFor="log-notes-input" className="text-[11px] font-bold text-surface-600 uppercase">
                        Session Notes
                      </label>
                      <textarea
                        id="log-notes-input"
                        rows={2}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="RPE, tempo cues, or equipment adjustments..."
                        className="input w-full text-sm mt-1 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* ── Step 2: Review State ── */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-brand-100 pb-2.5">
                  <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">
                    Planned Record
                  </span>
                  <span className="badge bg-brand-500 text-white text-[11px] font-bold">
                    Ready to Log
                  </span>
                </div>

                <div className="text-center py-2">
                  <p className="text-xl sm:text-2xl font-black text-surface-900">
                    {weight > 0 ? `${weight} kg` : 'Bodyweight'} × {reps} reps × {sets} sets
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    {sets} completed working {sets === 1 ? 'set' : 'sets'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-100 text-center">
                  <div className="p-2 rounded-lg bg-white/80">
                    <p className="text-[10px] uppercase font-bold text-surface-400">Estimated Volume</p>
                    <p className="text-sm font-black text-surface-900 mt-0.5">
                      {estimatedVolumeKg > 0 ? `${estimatedVolumeKg.toLocaleString()} kg` : 'Bodyweight'}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80">
                    <p className="text-[10px] uppercase font-bold text-surface-400">Date</p>
                    <p className="text-sm font-black text-surface-900 mt-0.5">
                      Today
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-600 flex items-start gap-2">
                <Sparkles size={15} className="text-brand-600 flex-shrink-0 mt-0.5" />
                <p>
                  Confirming will immediately update your Home dashboard, volume analytics, and any corresponding scheduled plan workout.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="p-4 border-t border-surface-100 flex items-center justify-end gap-2.5 bg-surface-50/50">
          {step === 'input' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary py-2 px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="exercise-log-form"
                id="btn-review-and-log"
                className="btn-primary py-2 px-5 text-xs font-bold"
              >
                Review &amp; Log
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('input')}
                disabled={isSaving}
                className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSave}
                disabled={isSaving}
                id="btn-confirm-and-log"
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Saving Workout...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Confirm &amp; Log</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
