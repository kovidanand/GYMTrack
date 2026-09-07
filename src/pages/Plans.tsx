import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Target, Calendar, Trophy, Trash2, CheckCircle2 } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/shared'
import { useWorkouts } from '@/hooks/useWorkouts'
import { formatRelativeDate } from '@/lib/utils'

export default function Plans() {
  const navigate = useNavigate()
  const { plans, workouts, loading, error, deletePlan, setActivePlan, createStarterRoutine } = useWorkouts()
  const [generating, setGenerating] = useState(false)

  if (loading || generating) return <div className="p-8 text-center text-surface-500 animate-pulse">Loading plans...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  const handleGenerateStarter = async () => {
    setGenerating(true)
    await createStarterRoutine()
    setGenerating(false)
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <PageHeader
        title="Training Plans"
        description="Organize your workouts into structured weekly routines."
        action={
          <div className="flex gap-2">
            {plans.length === 0 && (
              <button
                className="btn-secondary"
                onClick={handleGenerateStarter}
              >
                Starter Split
              </button>
            )}
            <button
              className="btn-primary"
              onClick={() => navigate('/plans/new')}
            >
              <Plus size={16} />
              Create Plan
            </button>
          </div>
        }
      />

      {plans.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map(plan => {
            const planWorkouts = workouts
              .filter(w => w.plan_id === plan.id)
              .sort((a, b) => (a.day_number || 0) - (b.day_number || 0))

            return (
              <div key={plan.id} className={`card overflow-hidden transition-all duration-300 ${plan.is_active ? 'ring-2 ring-brand-500 shadow-brand-500/10' : 'hover:border-surface-300'}`}>
                <div className={`p-6 ${plan.is_active ? 'bg-gradient-to-br from-brand-50 to-white' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-surface-900">{plan.name}</h3>
                      <p className="text-sm text-surface-500 mt-1">
                        Created {formatRelativeDate(plan.created_at)}
                      </p>
                    </div>
                    {plan.is_active && (
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-3 py-1 rounded-full">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    )}
                  </div>

                  {plan.description && (
                    <p className="text-surface-600 text-sm mb-6 line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-surface-700 mb-6">
                    {plan.goal && (
                      <div className="flex items-center gap-1.5">
                        <Target size={16} className="text-brand-500" />
                        <span className="font-medium">Goal:</span> {plan.goal}
                      </div>
                    )}
                    {plan.days_per_week && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-brand-500" />
                        <span className="font-medium">Frequency:</span> {plan.days_per_week} days/week
                      </div>
                    )}
                    {plan.difficulty && (
                      <div className="flex items-center gap-1.5">
                        <Trophy size={16} className="text-brand-500" />
                        <span className="font-medium">Level:</span> <span className="capitalize">{plan.difficulty}</span>
                      </div>
                    )}
                  </div>

                  {/* Plan Workouts */}
                  <div className="mb-6 border-t border-surface-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500">
                        Workouts ({planWorkouts.length})
                      </h4>
                      <button
                        onClick={() => navigate(`/workouts/new?planId=${plan.id}`)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Workout
                      </button>
                    </div>

                    {planWorkouts.length > 0 ? (
                      <div className="space-y-2">
                        {planWorkouts.map(w => (
                          <div
                            key={w.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors cursor-pointer group"
                            onClick={() => navigate(`/workouts/${w.id}`)}
                          >
                            <div>
                              <p className="text-sm font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                                {w.day_number ? `Day ${w.day_number}: ` : ''}{w.name}
                              </p>
                              <p className="text-xs text-surface-500">
                                {w.workout_exercises?.length || 0} exercises · ~{w.estimated_duration || 45}m
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/workouts/${w.id}/run`)
                              }}
                              className="btn-primary text-xs py-1 px-3"
                            >
                              Start
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-surface-400 italic">
                        No workouts added yet. Click "+ Add Workout" to schedule workouts for this routine.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-surface-100">
                    {!plan.is_active && (
                      <button 
                        className="btn-primary flex-1"
                        onClick={() => setActivePlan(plan.id)}
                      >
                        Set as Active
                      </button>
                    )}
                    <button 
                      className={`btn-secondary ${plan.is_active ? 'flex-1' : 'px-4'}`}
                      onClick={() => {
                        if(confirm('Delete this plan? Workouts associated with it will not be deleted.')) {
                          deletePlan(plan.id)
                        }
                      }}
                    >
                      {plan.is_active ? <><Trash2 size={16}/> Delete Plan</> : <Trash2 size={18}/>}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="w-12 h-12 text-surface-300" />}
          title="No training plans"
          description="Create a custom plan or generate a proven 3-day routine to get started immediately."
          action={
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="btn-primary" onClick={handleGenerateStarter}>
                Generate Starter Routine
              </button>
              <button className="btn-secondary" onClick={() => navigate('/plans/new')}>
                Create Custom Plan
              </button>
            </div>
          }
        />
      )}
    </div>
  )
}
