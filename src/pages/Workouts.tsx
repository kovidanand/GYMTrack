import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Clock, Dumbbell, Calendar, Target, Trophy, Play } from 'lucide-react'
import { PageHeader, SectionHeader, EmptyState } from '@/components/shared'
import { useWorkouts } from '@/hooks/useWorkouts'
import { formatDuration } from '@/lib/utils'
import type { Workout } from '@/types'

export default function Workouts() {
  const navigate = useNavigate()
  const { activePlan, workouts, loading, error, createStarterRoutine } = useWorkouts()
  const [generating, setGenerating] = useState(false)

  if (loading || generating) {
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

  const handleGenerateStarter = async () => {
    setGenerating(true)
    await createStarterRoutine()
    setGenerating(false)
  }

  const activePlanWorkouts = activePlan
    ? workouts.filter(w => w.plan_id === activePlan.id).sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
    : []

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <PageHeader
        title="Workouts"
        description="Plan your training, track your progress, and stay consistent."
        action={
          <div className="flex gap-2">
            {workouts.length === 0 && (
              <button
                className="btn-secondary"
                onClick={handleGenerateStarter}
              >
                Starter Split
              </button>
            )}
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

            {/* Workouts in Active Plan */}
            {activePlanWorkouts.length > 0 && (
              <div className="mt-6 pt-5 border-t border-brand-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-surface-600">
                    Plan Routine ({activePlanWorkouts.length} Workouts)
                  </span>
                  <button
                    onClick={() => navigate(`/workouts/new?planId=${activePlan.id}`)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Workout
                  </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {activePlanWorkouts.map(w => (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-xl bg-white border border-brand-100 shadow-sm hover:border-brand-300 transition-all cursor-pointer group flex flex-col justify-between"
                      onClick={() => navigate(`/workouts/${w.id}`)}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-brand-600 uppercase">
                            {w.day_number ? `Day ${w.day_number}` : 'Workout'}
                          </span>
                          <span className="text-[11px] text-surface-500">
                            ~{w.estimated_duration || 45}m
                          </span>
                        </div>
                        <p className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors text-sm line-clamp-1 mb-2">
                          {w.name}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/workouts/${w.id}/run`)
                        }}
                        className="btn-primary text-xs py-1.5 w-full justify-center gap-1.5 mt-2"
                      >
                        <Play size={12} fill="currentColor" /> Start Workout
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-dashed border-2 bg-surface-50/50">
            <div>
              <h3 className="font-semibold text-surface-900">No active plan</h3>
              <p className="text-surface-500 text-sm">Create a structured training plan or generate a starter split to stay on track.</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary whitespace-nowrap" onClick={handleGenerateStarter}>
                Starter Routine
              </button>
              <button className="btn-secondary whitespace-nowrap" onClick={() => navigate('/plans/new')}>
                Create a Plan
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── My Workouts ── */}
      <section aria-label="My standalone workouts">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-surface-900">All Workouts ({workouts.length})</h2>
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
            description="Generate a proven 3-day Push-Pull-Legs routine or create your own custom workout."
            action={
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn-primary" onClick={handleGenerateStarter}>
                  Generate Starter Routine
                </button>
                <button className="btn-secondary" onClick={() => navigate('/workouts/new')}>
                  Create Custom Workout
                </button>
              </div>
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
