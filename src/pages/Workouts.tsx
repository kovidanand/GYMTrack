import { useState } from 'react'
import { Plus, Clock, Dumbbell, Calendar } from 'lucide-react'
import { PageHeader, SectionHeader, EmptyState } from '@/components/shared'
import { WorkoutCard, SessionCard } from '@/components/workout/WorkoutComponents'
import { workouts, recentSessions } from '@/data/workouts'
import { formatDuration, formatRelativeDate } from '@/lib/utils'
import type { Workout } from '@/types'

export default function Workouts() {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [showCreateToast, setShowCreateToast] = useState(false)

  const handleCreateWorkout = () => {
    setShowCreateToast(true)
    setTimeout(() => setShowCreateToast(false), 3000)
  }

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Workouts"
        description="Your workout library and recent training history."
        action={
          <button
            className="btn-primary"
            onClick={handleCreateWorkout}
            id="workouts-create-btn"
            aria-label="Create a new workout"
          >
            <Plus size={16} aria-hidden="true" />
            Create Workout
          </button>
        }
      />

      {/* Toast notification */}
      {showCreateToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 z-50 bg-surface-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-slide-up"
        >
          ✨ Workout creator coming in Phase 2!
        </div>
      )}

      {/* ── My Workouts ── */}
      <section aria-label="My workouts">
        <SectionHeader title="My Workouts" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map(workout => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onClick={setSelectedWorkout}
            />
          ))}
        </div>
      </section>

      {/* Workout Detail Panel */}
      {selectedWorkout && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedWorkout.name} workout details`}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedWorkout(null)}
            aria-hidden="true"
          />
          <div className="relative bg-white w-full sm:max-w-md max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-5 text-white flex-shrink-0">
              <button
                onClick={() => setSelectedWorkout(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                aria-label="Close workout details"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-2 pr-8">{selectedWorkout.name}</h2>
              {selectedWorkout.description && (
                <p className="text-brand-200 text-sm">{selectedWorkout.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-brand-200">
                <span className="flex items-center gap-1.5">
                  <Dumbbell size={14} /> {selectedWorkout.exercises.length} exercises
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> ~{formatDuration(selectedWorkout.estimatedDuration)}
                </span>
                {selectedWorkout.lastCompleted && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> {formatRelativeDate(selectedWorkout.lastCompleted)}
                  </span>
                )}
              </div>
            </div>

            {/* Exercise list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <p className="label-sm mb-3">Exercises</p>
              {selectedWorkout.exercises.map((we, i) => {
                const exMap: Record<string, string> = {
                  'ex-001': 'Barbell Bench Press',
                  'ex-002': 'Back Squat',
                  'ex-003': 'Conventional Deadlift',
                  'ex-004': 'Lat Pulldown',
                  'ex-005': 'Dumbbell Shoulder Press',
                  'ex-006': 'Cable Triceps Pushdown',
                  'ex-007': 'Incline Dumbbell Press',
                  'ex-008': 'Barbell Row',
                  'ex-009': 'Pull-Up',
                  'ex-010': 'Romanian Deadlift',
                  'ex-011': 'Dumbbell Bicep Curl',
                  'ex-012': 'Leg Press',
                  'ex-013': 'Face Pull',
                  'ex-014': 'Plank',
                  'ex-015': 'Hip Thrust',
                  'ex-016': 'Overhead Triceps Extension',
                }
                const name = exMap[we.exerciseId] ?? we.exerciseId
                return (
                  <div key={we.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{name}</p>
                      <p className="text-xs text-surface-500">
                        {we.sets.length} sets
                        {we.sets[0]?.targetReps && ` · ${we.sets[0].targetReps} reps`}
                        {we.sets[0]?.targetWeight && ` · ${we.sets[0].targetWeight} kg`}
                        {we.sets[0]?.targetDuration && ` · ${we.sets[0].targetDuration}s`}
                      </p>
                    </div>
                    <span className="text-xs text-surface-400 flex-shrink-0">
                      {Math.round(we.sets[0]?.restTime / 60)}min rest
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-surface-100 flex gap-3 flex-shrink-0">
              <button
                className="btn-primary flex-1"
                id={`workout-start-${selectedWorkout.id}`}
                aria-label={`Start ${selectedWorkout.name}`}
              >
                Start Workout
              </button>
              <button
                className="btn-secondary px-4"
                onClick={() => setSelectedWorkout(null)}
                aria-label="Close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Sessions ── */}
      <section aria-label="Recent training sessions">
        <SectionHeader title="Recent Sessions" />
        {recentSessions.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {recentSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No sessions yet"
            description="Complete your first workout to see your history here."
            action={
              <button className="btn-primary" onClick={() => setSelectedWorkout(workouts[0])}>
                Start Your First Workout
              </button>
            }
          />
        )}
      </section>
    </div>
  )
}
