import { useNavigate } from 'react-router-dom'
import { Plus, Clock, Dumbbell, Calendar, Target, Trophy } from 'lucide-react'
import { PageHeader, SectionHeader, EmptyState } from '@/components/shared'
import { useWorkouts } from '@/hooks/useWorkouts'
import { formatDuration } from '@/lib/utils'
import type { Workout } from '@/types'

export default function Workouts() {
  const navigate = useNavigate()
  const { plans, activePlan, workouts, loading, error } = useWorkouts()

  if (loading) {
    return (
      <div className="p-8 text-center text-surface-500 animate-pulse">
        Loading workouts...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">
        Error loading workouts: {error}
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <PageHeader
        title="Workouts"
        description="Plan your training, track your progress, and stay consistent."
        action={
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              onClick={() => navigate('/plans')}
              aria-label="Manage Plans"
            >
              Plans
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate('/workouts/new')}
              id="workouts-create-btn"
              aria-label="Create a new workout"
            >
              <Plus size={16} aria-hidden="true" />
              Create Workout
            </button>
          </div>
        }
      />

      {/* ── Active Plan Summary ── */}
      <section aria-label="Active Training Plan">
        <SectionHeader title="Active Plan" />
        {activePlan ? (
          <div className="card p-6 bg-gradient-to-br from-brand-50 to-white border-brand-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-brand-900">{activePlan.name}</h3>
                {activePlan.description && (
                  <p className="text-surface-600 mt-1">{activePlan.description}</p>
                )}
              </div>
              <span className="badge bg-brand-100 text-brand-700 font-semibold uppercase tracking-wider text-xs">
                Active
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-surface-700">
              {activePlan.goal && (
                <div className="flex items-center gap-1.5">
                  <Target size={16} className="text-brand-500" />
                  <span className="font-medium">Goal:</span> {activePlan.goal}
                </div>
              )}
              {activePlan.days_per_week && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-brand-500" />
                  <span className="font-medium">Frequency:</span> {activePlan.days_per_week} days/week
                </div>
              )}
              {activePlan.difficulty && (
                <div className="flex items-center gap-1.5">
                  <Trophy size={16} className="text-brand-500" />
                  <span className="font-medium">Level:</span> <span className="capitalize">{activePlan.difficulty}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-dashed border-2 bg-surface-50/50">
            <div>
              <h3 className="font-semibold text-surface-900">No active plan</h3>
              <p className="text-surface-500 text-sm">Create a structured training plan to stay on track.</p>
            </div>
            <button className="btn-secondary whitespace-nowrap" onClick={() => navigate('/plans/new')}>
              Create a Plan
            </button>
          </div>
        )}
      </section>

      {/* ── My Workouts ── */}
      <section aria-label="My standalone workouts">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-surface-900">My Workouts</h2>
        </div>
        
        {workouts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onClick={(w) => navigate(`/workouts/${w.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Dumbbell className="w-12 h-12 text-surface-300" />}
            title="No workouts yet"
            description="Create your first workout to get started."
            action={
              <button className="btn-primary" onClick={() => navigate('/workouts/new')}>
                Create Workout
              </button>
            }
          />
        )}
      </section>
    </div>
  )
}

// ─── Minimal WorkoutCard for Dashboard ───
interface WorkoutCardProps {
  workout: Workout
  onClick: (workout: Workout) => void
}

function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  const exerciseCount = workout.workout_exercises?.length || 0
  
  return (
    <div 
      className="card p-5 cursor-pointer hover:border-brand-300 transition-colors group flex flex-col h-full"
      onClick={() => onClick(workout)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(workout)}
    >
      <h3 className="font-bold text-surface-900 group-hover:text-brand-600 transition-colors mb-2 line-clamp-1">
        {workout.name}
      </h3>
      {workout.description && (
        <p className="text-sm text-surface-500 line-clamp-2 mb-4 flex-1">
          {workout.description}
        </p>
      )}
      
      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-surface-100 text-sm text-surface-600">
        <span className="flex items-center gap-1.5">
          <Dumbbell size={14} className="text-brand-500" /> 
          {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
        </span>
        {workout.estimated_duration && (
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-surface-400" />
            {formatDuration(workout.estimated_duration)}
          </span>
        )}
      </div>
    </div>
  )
}
