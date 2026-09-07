import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Check, Timer, Play, Pause, FastForward, WifiOff, Cloud } from 'lucide-react'
import { useWorkoutExecution } from '@/hooks/useWorkoutExecution'
import { ConnectionStatusBadge } from '@/components/shared/ConnectionStatusBadge'
import { cn } from '@/lib/utils'
import type { WorkoutExercise } from '@/types'

export default function WorkoutRunner() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    workout, loading, error, 
    currentExerciseIndex, currentExercise, completedSets,
    timerState, timeRemaining,
    completeSet, removeSet, skipRest, nextExercise, prevExercise,
    finishWorkout
  } = useWorkoutExecution(id!)

  const [isFinished, setIsFinished] = useState(false)
  const [isOfflineCompleted, setIsOfflineCompleted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (loading) return <div className="h-screen flex items-center justify-center font-semibold text-brand-600 animate-pulse">Loading workout...</div>
  if (error || !workout) return <div className="p-8 text-center text-red-500">{error || 'Workout not found'}</div>

  // If completed everything
  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-brand-50">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        <h1 className="text-3xl font-bold text-surface-900 mb-2">Workout Complete!</h1>
        <p className="text-surface-600 mb-4 max-w-sm">
          Great job! You crushed {workout.name}.
        </p>

        {isOfflineCompleted && (
          <div className="mb-6 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2 max-w-sm text-left">
            <WifiOff size={18} className="text-amber-600 flex-shrink-0" />
            <span>
              <strong>Saved Offline in Gym:</strong> Your sets are securely preserved on this device. They will synchronize automatically to your account as soon as you reconnect to internet.
            </span>
          </div>
        )}

        <div className="flex flex-col w-full max-w-xs gap-3">
          <button onClick={() => navigate('/progress')} className="btn-primary">
            View Progress
          </button>
          <button onClick={() => navigate('/history')} className="btn-secondary bg-white">
            View History
          </button>
        </div>
      </div>
    )
  }

  const handleFinish = async () => {
    if (confirm('Are you sure you want to finish this workout?')) {
      setIsSaving(true)
      const result = await finishWorkout()
      setIsSaving(false)
      if (result.success) {
        setIsOfflineCompleted(result.isOffline)
        setIsFinished(true)
      } else {
        alert("Failed to save workout session. Please try again.")
      }
    }
  }

  const exerciseCount = workout.workout_exercises?.length || 0
  const isLastExercise = currentExerciseIndex === exerciseCount - 1
  const exSetsCompleted = currentExercise ? (completedSets[currentExercise.id]?.length || 0) : 0
  const totalSetsForEx = currentExercise?.sets || 0

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col fixed inset-0 z-[100] animate-slide-up">
      {/* ── Top Bar ── */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{workout.name}</span>
          <span className="text-sm font-bold text-surface-900">
            Exercise {currentExerciseIndex + 1} of {exerciseCount}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatusBadge />
          <button 
            onClick={handleFinish}
            className="text-xs font-bold text-surface-500 hover:text-brand-600 px-3 py-1.5 rounded-full bg-surface-100 hover:bg-brand-50 transition-colors"
          >
            Finish
          </button>
        </div>
      </header>

      {/* ── Progress Bar ── */}
      <div className="h-1 bg-surface-200 w-full flex-shrink-0">
        <div 
          className="h-full bg-brand-500 transition-all duration-300"
          style={{ width: `${((currentExerciseIndex) / Math.max(1, exerciseCount - 1)) * 100}%` }}
        />
      </div>

      {/* ── Rest Timer Overlay ── */}
      {timerState === 'running' && (
        <div className="absolute inset-0 z-50 bg-brand-600 flex flex-col items-center justify-center text-white animate-fade-in">
          <Timer size={48} className="mb-6 opacity-80 animate-pulse" />
          <h2 className="text-xl font-medium text-brand-100 mb-2">Rest</h2>
          <div className="text-7xl font-bold font-mono tracking-tighter mb-12">
            {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
          <button 
            onClick={skipRest}
            className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-full font-bold transition-colors flex items-center gap-2"
          >
            <FastForward size={18} /> Skip Rest
          </button>
        </div>
      )}

      {/* ── Main Content (Current Exercise) ── */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col relative pb-32">
        {currentExercise && (
          <div className="max-w-xl mx-auto w-full space-y-6 animate-fade-in">
            {/* Exercise Header */}
            <div className="text-center mt-4 mb-8">
              <h1 className="text-3xl font-extrabold text-surface-900 leading-tight mb-2">
                {currentExercise.exercise?.name}
              </h1>
              <p className="text-surface-500 font-medium">
                {currentExercise.exercise?.primary_muscle} · {currentExercise.sets} sets
              </p>
            </div>

            {/* Set Tracker List */}
            <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-3 bg-surface-50 border-b border-surface-200 text-xs font-bold text-surface-500 uppercase tracking-wider text-center">
                <div className="col-span-2">Set</div>
                <div className="col-span-4">kg</div>
                <div className="col-span-4">Reps</div>
                <div className="col-span-2">✓</div>
              </div>
              
              <div className="divide-y divide-surface-100">
                {Array.from({ length: totalSetsForEx }).map((_, i) => {
                  const setNum = i + 1
                  const isCompleted = completedSets[currentExercise.id]?.includes(setNum)
                  
                  return (
                    <SetRow 
                      key={setNum}
                      setNum={setNum}
                      targetReps={currentExercise.reps}
                      targetWeight={currentExercise.weight}
                      isCompleted={isCompleted}
                      onComplete={(weight, reps) => completeSet(currentExercise, setNum, weight, reps)}
                      onRemove={() => removeSet(currentExercise.id, setNum)}
                    />
                  )
                })}
              </div>
            </div>

            {/* Notes */}
            {currentExercise.notes && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900 text-sm">
                <strong>Notes:</strong> {currentExercise.notes}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Bottom Navigation Controls ── */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-surface-200 p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-xl mx-auto flex gap-3">
          <button 
            onClick={prevExercise} 
            disabled={currentExerciseIndex === 0}
            className="flex-1 btn-secondary disabled:opacity-30"
          >
            Previous
          </button>
          
          {isLastExercise && exSetsCompleted === totalSetsForEx ? (
            <button onClick={handleFinish} disabled={isSaving} className="flex-[2] btn-primary bg-emerald-500 hover:bg-emerald-600 border-emerald-500">
              {isSaving ? 'Saving...' : 'Complete Workout'}
            </button>
          ) : (
            <button 
              onClick={nextExercise}
              disabled={isLastExercise}
              className="flex-[2] btn-primary"
            >
              Next Exercise
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface SetRowProps {
  setNum: number
  targetReps: string
  targetWeight: number | null
  isCompleted: boolean
  onComplete: (weight: number | null, reps: number | null) => void
  onRemove: () => void
}

function SetRow({ setNum, targetReps, targetWeight, isCompleted, onComplete, onRemove }: SetRowProps) {
  // Local state for the inputs
  const [weight, setWeight] = useState<string>(targetWeight ? String(targetWeight) : '')
  const parsedTargetReps = parseInt(targetReps.split('-')[0]) || ''
  const [reps, setReps] = useState<string>(String(parsedTargetReps))

  const handleToggle = () => {
    if (isCompleted) {
      onRemove()
    } else {
      onComplete(weight ? parseFloat(weight) : null, reps ? parseInt(reps) : null)
    }
  }

  return (
    <div className={cn("grid grid-cols-12 gap-2 p-3 items-center transition-colors", isCompleted ? "bg-surface-50" : "bg-white")}>
      <div className="col-span-2 text-center font-bold text-surface-400">
        {setNum}
      </div>
      
      <div className="col-span-4 px-1">
        <input 
          type="number" 
          value={weight}
          onChange={e => setWeight(e.target.value)}
          disabled={isCompleted}
          placeholder="-"
          className={cn(
            "w-full text-center font-bold text-lg rounded-lg py-1 transition-all",
            isCompleted ? "bg-transparent text-surface-500 cursor-not-allowed" : "bg-surface-100 text-surface-900 focus:bg-white focus:ring-2 focus:ring-brand-500"
          )}
        />
      </div>
      
      <div className="col-span-4 px-1 relative">
        <input 
          type="number" 
          value={reps}
          onChange={e => setReps(e.target.value)}
          disabled={isCompleted}
          placeholder="-"
          className={cn(
            "w-full text-center font-bold text-lg rounded-lg py-1 transition-all",
            isCompleted ? "bg-transparent text-surface-500 cursor-not-allowed" : "bg-surface-100 text-surface-900 focus:bg-white focus:ring-2 focus:ring-brand-500"
          )}
        />
      </div>
      
      <div className="col-span-2 flex justify-center">
        <button 
          onClick={handleToggle}
          title={isCompleted ? "Click to unlock and edit this set" : "Mark set as completed"}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm",
            isCompleted 
              ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600" 
              : "bg-surface-200 text-surface-400 hover:bg-brand-50 hover:text-brand-500 hover:shadow-brand-500/20"
          )}
        >
          <Check size={18} strokeWidth={isCompleted ? 3 : 2} />
        </button>
      </div>
    </div>
  )
}
