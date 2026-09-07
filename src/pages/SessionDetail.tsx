import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, BarChart2, Calendar, Activity, Dumbbell } from 'lucide-react'
import { getWorkoutSessionById } from '@/lib/progress'
import { formatDuration } from '@/lib/utils'
import type { WorkoutSession, WorkoutSessionSet } from '@/types'

import { calculate1RM } from '@/lib/exerciseIntelligence'
import { ExerciseDetailModal } from '@/components/exercise/ExerciseDetailModal'

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      const { data, error: err } = await getWorkoutSessionById(id)
      if (err) setError(err)
      else setSession(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="p-8 text-center animate-pulse">Loading session details...</div>
  if (error || !session) return <div className="p-8 text-center text-red-500">{error || 'Session not found'}</div>

  const date = new Date(session.started_at)
  
  // Group sets by exercise_id
  const groupedSets: Record<string, { id: string, name: string, exercise: any, sets: WorkoutSessionSet[] }> = {}
  session.workout_session_sets?.forEach(s => {
    if (!groupedSets[s.exercise_id]) {
      groupedSets[s.exercise_id] = {
        id: s.exercise_id,
        name: s.exercise_name,
        exercise: s.exercise,
        sets: []
      }
    }
    groupedSets[s.exercise_id].sets.push(s)
  })

  return (
    <div className="animate-fade-in space-y-6 pb-24 max-w-2xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-surface-100 transition-colors text-surface-500 hover:text-surface-900"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-sm font-medium text-brand-600 mb-0.5">
            {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold text-surface-900">
            {session.workout_name}
          </h1>
        </div>
      </div>

      {/* ── Overview Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <Clock size={18} className="mx-auto text-brand-500 mb-1" />
          <p className="text-xs text-surface-500 mb-0.5 uppercase tracking-wider">Duration</p>
          <p className="font-bold text-surface-900">{formatDuration(session.duration_seconds || 0)}</p>
        </div>
        <div className="card p-4 text-center">
          <BarChart2 size={18} className="mx-auto text-brand-500 mb-1" />
          <p className="text-xs text-surface-500 mb-0.5 uppercase tracking-wider">Volume</p>
          <p className="font-bold text-surface-900">{((session.total_volume || 0) / 1000).toFixed(1)}k</p>
        </div>
        <div className="card p-4 text-center">
          <Activity size={18} className="mx-auto text-brand-500 mb-1" />
          <p className="text-xs text-surface-500 mb-0.5 uppercase tracking-wider">Exercises</p>
          <p className="font-bold text-surface-900">{session.total_exercises}</p>
        </div>
        <div className="card p-4 text-center">
          <Calendar size={18} className="mx-auto text-brand-500 mb-1" />
          <p className="text-xs text-surface-500 mb-0.5 uppercase tracking-wider">Sets</p>
          <p className="font-bold text-surface-900">{session.completed_sets}</p>
        </div>
      </div>

      {/* ── Exercise Breakdown ── */}
      <div className="space-y-4 mt-8">
        <h2 className="text-lg font-bold text-surface-900 mb-4">Workout Details</h2>
        
        {Object.values(groupedSets).map(group => (
          <div key={group.name} className="card overflow-hidden">
            <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                  <Dumbbell size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">{group.name}</h3>
                  <p className="text-xs text-surface-500">{group.sets.length} sets completed</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedExercise({ id: group.id, name: group.name })}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-brand-200 text-brand-700 hover:bg-brand-50"
              >
                <Activity size={14} /> Analytics & 1RM
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-surface-500 bg-white border-b border-surface-100 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Set</th>
                    <th className="px-4 py-3 font-medium text-center">Weight</th>
                    <th className="px-4 py-3 font-medium text-center">Reps</th>
                    <th className="px-4 py-3 font-medium text-center">Est. 1RM</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {group.sets.map((set, i) => {
                    const est1RM = calculate1RM(set.weight, set.reps)
                    return (
                      <tr key={set.id} className="hover:bg-surface-50">
                        <td className="px-4 py-3 font-medium text-surface-900">
                          #{i + 1}
                        </td>
                        <td className="px-4 py-3 text-center text-surface-700">
                          {set.weight ? `${set.weight} kg` : 'Bodyweight'}
                        </td>
                        <td className="px-4 py-3 text-center text-surface-700">
                          {set.reps || '-'}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-brand-600">
                          {est1RM ? `${est1RM} kg` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {set.is_personal_record ? (
                            <span className="inline-block bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                              PR
                            </span>
                          ) : (
                            <span className="text-surface-400 text-xs">Completed</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* ── Exercise Intelligence Modal ── */}
      <ExerciseDetailModal
        exerciseId={selectedExercise?.id || null}
        exerciseName={selectedExercise?.name}
        open={Boolean(selectedExercise)}
        onOpenChange={(open) => !open && setSelectedExercise(null)}
      />
    </div>
  )
}
