import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  X, 
  Check, 
  Plus, 
  Minus, 
  Timer, 
  FastForward, 
  WifiOff, 
  Search, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Dumbbell,
  Clock,
  BarChart2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useWorkoutExecution } from '@/hooks/useWorkoutExecution'
import { useAuth } from '@/context/AuthContext'
import { ConnectionStatusBadge } from '@/components/shared/ConnectionStatusBadge'
import { getPreviousExercisePerformance } from '@/lib/workouts'
import { getExercises } from '@/lib/exercises'
import { getExerciseVisual } from '@/lib/exerciseMedia'
import { formatDuration, cn } from '@/lib/utils'
import { WorkoutTimerModal } from '@/components/workout/WorkoutTimerModal'
import { SmartRestTimer } from '@/components/workout/SmartRestTimer'
import { useSmartRestTimer } from '@/hooks/useSmartRestTimer'
import type { Exercise, WorkoutExercise } from '@/types'

export default function WorkoutRunner() {
  const { id } = useParams<{ id: string }>()
  const workoutId = id || 'quick'
  const navigate = useNavigate()
  const { user } = useAuth()

  const { 
    workout, 
    loading, 
    error, 
    currentExerciseIndex, 
    currentExercise, 
    completedSets,
    sessionSetsData,
    sessionStartTime,
    timerState, 
    timeRemaining,
    completeSet, 
    removeSet, 
    skipRest, 
    nextExercise, 
    prevExercise,
    setCurrentExerciseIndex,
    addExercise,
    addSetToExercise,
    removeSetFromExercise,
    removeExerciseFromWorkout,
    finishWorkout
  } = useWorkoutExecution(workoutId)

  const [isFinished, setIsFinished] = useState(false)
  const [isOfflineCompleted, setIsOfflineCompleted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [finishedSummary, setFinishedSummary] = useState<{
    dateStr: string
    durationMins: number
    exercisesCount: number
    setsCount: number
    totalVolume: number
    exerciseBreakdown: Array<{ name: string; summary: string }>
  } | null>(null)

  // Exercise search modal state
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isTimerOpen, setIsTimerOpen] = useState(false)

  // Previous performance for current exercise
  const [prevPerformance, setPrevPerformance] = useState<{ weight: number; reps: number } | null>(null)

  // Smart Rest Timer
  const smartTimer = useSmartRestTimer()
  const [autoRestEnabled, setAutoRestEnabled] = useState(true)

  useEffect(() => {
    let active = true
    if (currentExercise?.exercise_id && user?.id) {
      getPreviousExercisePerformance(currentExercise.exercise_id, user.id).then(res => {
        if (active) setPrevPerformance(res)
      })
    } else {
      setPrevPerformance(null)
    }
    return () => { active = false }
  }, [currentExercise?.exercise_id, user?.id])

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-medium text-surface-500 text-sm animate-pulse space-y-2">
        <Dumbbell className="w-8 h-8 text-brand-600 animate-bounce" />
        <p>Loading workout session...</p>
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="p-8 text-center text-red-500 space-y-4">
        <p>{error || 'Workout not found'}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Home
        </button>
      </div>
    )
  }

  // ── WORKOUT COMPLETED SCREEN ──
  if (isFinished && finishedSummary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-surface-50 animate-fade-in select-none">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-200 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              WORKOUT COMPLETE
            </h1>
            <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">
              {finishedSummary.dateStr}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-2 py-3 bg-surface-50 rounded-2xl border border-surface-100 text-center">
            <div>
              <p className="text-base sm:text-lg font-extrabold text-surface-900">{finishedSummary.exercisesCount}</p>
              <p className="text-[10px] uppercase font-bold text-surface-400">Exercises</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-extrabold text-surface-900">{finishedSummary.setsCount}</p>
              <p className="text-[10px] uppercase font-bold text-surface-400">Sets</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-extrabold text-surface-900">{finishedSummary.totalVolume.toLocaleString()}</p>
              <p className="text-[10px] uppercase font-bold text-surface-400">kg</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-extrabold text-surface-900">{finishedSummary.durationMins}</p>
              <p className="text-[10px] uppercase font-bold text-surface-400">min</p>
            </div>
          </div>

          {/* Today's Training Progress Bar 100% */}
          <div className="space-y-1.5 text-left bg-surface-50/90 p-4 rounded-2xl border border-surface-200">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-surface-800">Today's training</span>
              <span className="text-emerald-600 font-mono">100%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-200 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-full transition-all duration-1000" />
            </div>
          </div>

          {/* Exercise Sets Breakdown */}
          {finishedSummary.exerciseBreakdown.length > 0 && (
            <div className="text-left space-y-2 max-h-44 overflow-y-auto pr-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Session Breakdown</h3>
              {finishedSummary.exerciseBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-surface-50 border border-surface-100 text-xs">
                  <span className="font-bold text-surface-900 truncate max-w-[190px]">{item.name}</span>
                  <span className="font-mono text-brand-600 font-semibold">{item.summary}</span>
                </div>
              ))}
            </div>
          )}

          {isOfflineCompleted && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2 text-left">
              <WifiOff size={16} className="text-amber-600 flex-shrink-0" />
              <span>
                <strong>Saved locally:</strong> Session will sync automatically to your account as soon as connectivity returns.
              </span>
            </div>
          )}

          {/* Primary Done Action */}
          <div className="pt-2">
            <button 
              onClick={() => navigate('/dashboard')} 
              id="workout-completed-done-btn"
              className="btn-primary w-full py-3.5 text-sm font-bold shadow-md flex items-center justify-center gap-2"
            >
              <span>Done</span>
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleFinish = async () => {
    setIsSaving(true)
    
    // Calculate summary metrics
    const now = new Date()
    const durationMins = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000))
    
    let totalVol = 0
    const exMap: Record<string, { name: string; sets: Array<{ weight: number | null; reps: number | null }> }> = {}

    sessionSetsData.forEach(s => {
      if (s.weight && s.reps) {
        totalVol += (s.weight * s.reps)
      }
      const name = s.exercise_name || 'Exercise'
      if (!exMap[name]) {
        exMap[name] = { name, sets: [] }
      }
      exMap[name].sets.push({ weight: s.weight ?? null, reps: s.reps ?? null })
    })

    const breakdown = Object.values(exMap).map(ex => {
      const count = ex.sets.length
      const avgReps = ex.sets[0]?.reps || 10
      const avgWeight = ex.sets[0]?.weight != null ? `@ ${ex.sets[0].weight} kg` : ''
      return {
        name: ex.name,
        summary: `${count} × ${avgReps} ${avgWeight}`.trim()
      }
    })

    const summary = {
      dateStr: now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      durationMins,
      exercisesCount: Object.keys(exMap).length || workout.workout_exercises?.length || 0,
      setsCount: sessionSetsData.length,
      totalVolume: totalVol,
      exerciseBreakdown: breakdown.length > 0 ? breakdown : (workout.workout_exercises?.map(we => ({
        name: we.exercise?.name || 'Exercise',
        summary: `${we.sets} sets`
      })) || [])
    }

    const result = await finishWorkout()
    setIsSaving(false)
    if (result.success) {
      setFinishedSummary(summary)
      setIsOfflineCompleted(result.isOffline)
      setIsFinished(true)
    }
  }

  const handleCompleteSet = async (exercise: WorkoutExercise, setNumber: number, weight: number | null, reps: number | null) => {
    // 1. Existing completion logic
    await completeSet(exercise, setNumber, weight, reps)
    
    // 2. Prevent the old full-screen modal
    skipRest()

    // 3. Start the Smart Rest Timer if auto rest is enabled
    const isLastSet = setNumber === exercise.sets
    const isLastExercise = currentExerciseIndex === (workout.workout_exercises?.length || 1) - 1
    if (autoRestEnabled && (!isLastSet || !isLastExercise)) {
      smartTimer.start(exercise.rest_seconds || smartTimer.selectedDuration)
    }
  }

  const exerciseCount = workout.workout_exercises?.length || 0
  const totalSetsForEx = currentExercise?.sets || 3
  const visualUrl = getExerciseVisual(currentExercise?.exercise?.slug, currentExercise?.exercise?.image_url)

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col fixed inset-0 z-[100] animate-fade-in select-none">
      {/* ── Top Bar ── */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-surface-200 flex-shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-1.5 -ml-1 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
            aria-label="Exit runner"
          >
            <X size={18} />
          </button>
          <div>
            <h1 className="text-xs font-bold text-surface-900 leading-tight truncate max-w-[170px] sm:max-w-xs">
              {workout.name}
            </h1>
            <p className="text-[10px] text-surface-400 font-medium">
              {exerciseCount > 0 ? `Exercise ${currentExerciseIndex + 1} of ${exerciseCount}` : 'No exercises added'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoRestEnabled(!autoRestEnabled)}
            className={cn(
              "p-1.5 rounded-lg transition-colors text-[10px] font-bold flex flex-col items-center leading-none",
              autoRestEnabled ? "text-brand-600 bg-brand-50" : "text-surface-400 bg-surface-100 hover:text-surface-600"
            )}
            title="Auto Rest Timer On/Off"
          >
            <span>Auto</span>
            <span>Rest</span>
          </button>
          <button
            onClick={() => setIsTimerOpen(true)}
            className="p-1.5 text-surface-500 hover:text-brand-600 hover:bg-surface-100 rounded-lg transition-colors"
            title="Open Workout Timer / Stopwatch"
            aria-label="Open Workout Timer"
          >
            <Timer size={18} />
          </button>
          <ConnectionStatusBadge />
          <button 
            onClick={handleFinish}
            disabled={isSaving}
            className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Finish'}
          </button>
        </div>
      </header>

      {/* ── Rest Timer Overlay ── */}
      {/* 
        The old giant modal is intentionally hidden here. We call skipRest() 
        immediately when a set is completed and use SmartRestTimer instead. 
        In case it ever flickers, it's commented out/removed. 
        Note: We actually don't render it anymore to prevent the giant modal.
      */}

      {/* ── Main Workout Logging Area ── */}
      <main className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full pb-28 space-y-4">
        {/* Compact Workout Progress Indicator */}
        {exerciseCount > 0 && (
          <div className="card p-3 sm:p-3.5 bg-white border border-surface-200 rounded-xl space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-surface-700">
                {currentExerciseIndex + 1} / {exerciseCount} exercises
              </span>
              <span className="text-brand-600 font-bold font-mono">
                {sessionSetsData.length} sets completed
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-100 overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(((currentExerciseIndex + 1) / exerciseCount) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {exerciseCount === 0 ? (
          /* Empty Session State */
          <div className="card p-8 text-center bg-white border border-surface-200 mt-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
              <Dumbbell size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900">Start Logging Exercises</h2>
              <p className="text-xs text-surface-500 mt-1 max-w-xs mx-auto">
                Tap the button below to select an exercise from the library and record your sets.
              </p>
            </div>
            <button
              onClick={() => setIsPickerOpen(true)}
              className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Exercise
            </button>
          </div>
        ) : currentExercise ? (
          /* Active Exercise Card */
          <div className="space-y-4 animate-fade-in">
            {/* Exercise Switcher Pills */}
            {exerciseCount > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {workout.workout_exercises?.map((we, idx) => (
                  <button
                    key={we.id}
                    onClick={() => setCurrentExerciseIndex(idx)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1",
                      currentExerciseIndex === idx
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-white text-surface-600 border border-surface-200 hover:bg-surface-50"
                    )}
                  >
                    <span>{idx + 1}.</span>
                    <span>{we.exercise?.name || 'Exercise'}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Exercise Details Card */}
            <div className="card p-4 bg-white border border-surface-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {visualUrl ? (
                    <img 
                      src={visualUrl} 
                      alt={currentExercise.exercise?.name} 
                      className="w-12 h-12 rounded-xl object-contain bg-surface-50 border border-surface-100 p-1 flex-shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <Dumbbell size={20} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-surface-900 leading-tight">
                      {currentExercise.exercise?.name}
                    </h2>
                    <p className="text-[11px] text-surface-500 font-medium capitalize mt-0.5">
                      {currentExercise.exercise?.primary_muscle} · {currentExercise.exercise?.muscle_group}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeExerciseFromWorkout(currentExercise.id)}
                  className="text-surface-400 hover:text-red-500 p-1 rounded transition-colors"
                  title="Remove exercise"
                  aria-label="Remove exercise"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Previous Performance Hint */}
              {prevPerformance && (
                <div className="p-2.5 px-3 bg-brand-50/70 border border-brand-100 rounded-xl flex items-center justify-between text-xs text-brand-900">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-brand-600" />
                    <span>Previous: <strong>{prevPerformance.weight} kg × {prevPerformance.reps} reps</strong></span>
                  </div>
                  <span className="text-[10px] text-brand-600 font-bold">Suggested baseline</span>
                </div>
              )}
            </div>

            {/* Sets Logging Table */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-2.5 px-3 bg-surface-50 border-b border-surface-200 text-[11px] font-bold text-surface-500 uppercase tracking-wider text-center">
                <div className="col-span-2">Set</div>
                <div className="col-span-5">Weight (kg)</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-2 flex items-center justify-center">
                  <Check size={14} className="text-surface-500" />
                </div>
              </div>

              <div className="divide-y divide-surface-100">
                {Array.from({ length: totalSetsForEx }).map((_, i) => {
                  const setNum = i + 1
                  const isCompleted = completedSets[currentExercise.id]?.includes(setNum)
                  
                  // Set duplication: inherit from immediately previous set if logged
                  const prevLoggedSet = sessionSetsData.find(
                    s => s.exercise_id === currentExercise.exercise_id && s.set_number === i
                  )
                  const fallbackWeight = prevLoggedSet?.weight ?? prevPerformance?.weight ?? currentExercise.weight ?? 50
                  const fallbackReps = prevLoggedSet?.reps ?? prevPerformance?.reps ?? 10

                  return (
                    <FrictionlessSetRow 
                      key={`${currentExercise.id}-set-${setNum}`}
                      setNum={setNum}
                      defaultWeight={fallbackWeight}
                      defaultReps={fallbackReps}
                      isCompleted={isCompleted}
                      onComplete={(w, r) => handleCompleteSet(currentExercise, setNum, w, r)}
                      onRemove={() => removeSet(currentExercise.id, setNum)}
                    />
                  )
                })}
              </div>

              {/* Set Action Controls */}
              <div className="p-2.5 bg-surface-50/70 border-t border-surface-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => addSetToExercise(currentExercise.id)}
                  className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-brand-50 transition-colors"
                >
                  <Plus size={14} /> Add Set
                </button>
                {totalSetsForEx > 1 && (
                  <button
                    onClick={() => removeSetFromExercise(currentExercise.id)}
                    className="text-surface-400 hover:text-surface-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-surface-100 transition-colors text-[11px]"
                  >
                    <Minus size={12} /> Remove Last Set
                  </button>
                )}
              </div>
            </div>

            {/* Add More Exercises Button */}
            <button
              onClick={() => setIsPickerOpen(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-surface-300 hover:border-brand-500 text-surface-600 hover:text-brand-600 bg-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Plus size={15} /> Add Another Exercise
            </button>
          </div>
        ) : null}
      </main>

      {/* ── Sticky Bottom Bar ── */}
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-surface-200 p-3 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          {exerciseCount > 1 && (
            <button 
              onClick={prevExercise} 
              disabled={currentExerciseIndex === 0}
              className="btn-secondary py-2.5 px-3 text-xs font-bold disabled:opacity-30"
              aria-label="Previous Exercise"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {exerciseCount > 1 && currentExerciseIndex < exerciseCount - 1 ? (
            <button 
              onClick={nextExercise}
              className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <span>Next Exercise</span>
              <ChevronRight size={16} />
            </button>
          ) : null}

          <button 
            onClick={handleFinish}
            disabled={isSaving}
            className={cn(
              "btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm",
              exerciseCount > 1 && currentExerciseIndex < exerciseCount - 1
                ? "bg-surface-800 hover:bg-surface-900 border-surface-800 px-4"
                : "flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
            )}
          >
            <CheckCircle2 size={16} />
            <span>Finish Workout</span>
          </button>
        </div>
      </footer>

      {/* ── Exercise Picker Search Modal ── */}
      <ExercisePickerModal 
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(ex) => {
          addExercise(ex, 3, '10', 50)
          setIsPickerOpen(false)
        }}
      />

      {/* ── Workout Stopwatch / Timer Modal ── */}
      <WorkoutTimerModal
        isOpen={isTimerOpen}
        onOpenChange={setIsTimerOpen}
      />

      {/* ── Smart Rest Timer (Floating Component) ── */}
      <SmartRestTimer timer={smartTimer} />
    </div>
  )
}

// ─── Set Row with Quick Steppers & One-Tap Completion ─────────────────────────

interface FrictionlessSetRowProps {
  setNum: number
  defaultWeight: number
  defaultReps: number
  isCompleted: boolean
  onComplete: (weight: number | null, reps: number | null) => void
  onRemove: () => void
}

function FrictionlessSetRow({ 
  setNum, 
  defaultWeight, 
  defaultReps, 
  isCompleted, 
  onComplete, 
  onRemove 
}: FrictionlessSetRowProps) {
  const [weight, setWeight] = useState<number>(defaultWeight)
  const [reps, setReps] = useState<number>(defaultReps)

  useEffect(() => {
    if (!isCompleted) {
      setWeight(defaultWeight)
      setReps(defaultReps)
    }
  }, [defaultWeight, defaultReps, isCompleted])

  const handleToggle = () => {
    if (isCompleted) {
      onRemove()
    } else {
      onComplete(weight, reps)
    }
  }

  return (
    <div className={cn(
      "grid grid-cols-12 gap-1.5 p-2 px-3 items-center transition-colors text-xs",
      isCompleted ? "bg-emerald-50/40" : "bg-white"
    )}>
      {/* Set Number */}
      <div className="col-span-2 text-center font-extrabold text-surface-400">
        {setNum}
      </div>

      {/* Weight Controls with Steppers */}
      <div className="col-span-5 flex items-center justify-center gap-1">
        <button
          type="button"
          disabled={isCompleted || weight <= 0}
          onClick={() => setWeight(prev => Math.max(0, prev - 2.5))}
          className="w-6 h-6 rounded-md bg-surface-100 hover:bg-surface-200 text-surface-700 flex items-center justify-center font-bold disabled:opacity-30"
          aria-label="Decrease weight"
        >
          -
        </button>

        <input 
          type="number" 
          step="0.5"
          value={weight}
          onChange={e => setWeight(parseFloat(e.target.value) || 0)}
          disabled={isCompleted}
          className={cn(
            "w-14 text-center font-bold text-sm rounded-lg py-1 px-0.5 border border-surface-200 focus:outline-none focus:ring-1 focus:ring-brand-500",
            isCompleted ? "bg-transparent text-surface-500 border-transparent" : "bg-surface-50 text-surface-900"
          )}
        />

        <button
          type="button"
          disabled={isCompleted}
          onClick={() => setWeight(prev => prev + 2.5)}
          className="w-6 h-6 rounded-md bg-surface-100 hover:bg-surface-200 text-surface-700 flex items-center justify-center font-bold disabled:opacity-30"
          aria-label="Increase weight"
        >
          +
        </button>
      </div>

      {/* Reps Controls with Steppers */}
      <div className="col-span-3 flex items-center justify-center gap-1">
        <button
          type="button"
          disabled={isCompleted || reps <= 1}
          onClick={() => setReps(prev => Math.max(1, prev - 1))}
          className="w-6 h-6 rounded-md bg-surface-100 hover:bg-surface-200 text-surface-700 flex items-center justify-center font-bold disabled:opacity-30"
          aria-label="Decrease reps"
        >
          -
        </button>

        <input 
          type="number" 
          value={reps}
          onChange={e => setReps(parseInt(e.target.value) || 0)}
          disabled={isCompleted}
          className={cn(
            "w-10 text-center font-bold text-sm rounded-lg py-1 px-0.5 border border-surface-200 focus:outline-none focus:ring-1 focus:ring-brand-500",
            isCompleted ? "bg-transparent text-surface-500 border-transparent" : "bg-surface-50 text-surface-900"
          )}
        />

        <button
          type="button"
          disabled={isCompleted}
          onClick={() => setReps(prev => prev + 1)}
          className="w-6 h-6 rounded-md bg-surface-100 hover:bg-surface-200 text-surface-700 flex items-center justify-center font-bold disabled:opacity-30"
          aria-label="Increase reps"
        >
          +
        </button>
      </div>

      {/* Confirm Checkmark */}
      <div className="col-span-2 flex justify-center">
        <button 
          type="button"
          onClick={handleToggle}
          title={isCompleted ? "Click to edit" : "Confirm set"}
          aria-label={isCompleted ? `Set ${setNum} completed. Click to edit` : `Confirm set ${setNum}`}
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-xs",
            isCompleted 
              ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600" 
              : "bg-surface-100 text-surface-400 hover:bg-brand-500 hover:text-white"
          )}
        >
          <Check size={17} strokeWidth={isCompleted ? 3 : 2} />
        </button>
      </div>
    </div>
  )
}

// ─── Exercise Picker Modal ───────────────────────────────────────────────────

const CATEGORIES = ['all', 'chest', 'back', 'shoulders', 'legs', 'biceps', 'triceps'] as const

function ExercisePickerModal({ 
  isOpen, 
  onClose, 
  onSelect 
}: { 
  isOpen: boolean
  onClose: () => void
  onSelect: (ex: Exercise) => void 
}) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      getExercises({ 
        search: search.trim() || undefined,
        muscleGroup: selectedCategory === 'all' ? undefined : (selectedCategory as any)
      }).then(res => {
        if (res.data) setExercises(res.data)
        setLoading(false)
      })
    }
  }, [isOpen, search, selectedCategory])

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 sm:top-1/2 sm:bottom-auto left-1/2 -translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[94vw] max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-surface-200 z-50 animate-slide-up sm:animate-scale-in focus:outline-none flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-100 flex-shrink-0">
            <div>
              <Dialog.Title className="text-base font-bold text-surface-900 leading-none">
                Select Exercise
              </Dialog.Title>
              <p className="text-[11px] text-surface-400 mt-0.5">Choose an exercise to add to your workout</p>
            </div>
            <Dialog.Close asChild>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Search Input */}
          <div className="mt-3 relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={15} />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name (e.g. Bench Press)..."
              className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              autoFocus
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto py-2 flex-shrink-0 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize whitespace-nowrap transition-colors",
                  selectedCategory === cat
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-surface-100">
            {loading ? (
              <p className="text-xs text-center py-6 text-surface-400">Loading exercise library...</p>
            ) : exercises.length === 0 ? (
              <p className="text-xs text-center py-6 text-surface-400">No exercises found.</p>
            ) : (
              exercises.map(ex => {
                const img = getExerciseVisual(ex.slug, ex.image_url)
                return (
                  <button
                    key={ex.id}
                    onClick={() => onSelect(ex)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-surface-50 transition-colors flex items-center gap-3 group"
                  >
                    {img ? (
                      <img src={img} alt={ex.name} className="w-10 h-10 rounded-lg object-contain bg-surface-50 p-1 border border-surface-100 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                        <Dumbbell size={16} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-surface-900 group-hover:text-brand-600 transition-colors truncate">
                        {ex.name}
                      </p>
                      <p className="text-[10px] text-surface-400 capitalize truncate">
                        {ex.primary_muscle} · {ex.muscle_group}
                      </p>
                    </div>
                    <Plus size={16} className="text-surface-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                )
              })
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
