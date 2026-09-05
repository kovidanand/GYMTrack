import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Edit3, Trash2, Clock, Dumbbell, Copy } from 'lucide-react'
import { getWorkoutById, deleteWorkout, createWorkout, addWorkoutExercise } from '@/lib/workouts'
import { useAuth } from '@/context/AuthContext'
import { formatDuration } from '@/lib/utils'
import type { Workout } from '@/types'

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      const { data, error } = await getWorkoutById(id)
      if (error || !data) {
        setError(error || 'Workout not found')
      } else {
        setWorkout(data)
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this workout? This cannot be undone.')) return
    const success = await deleteWorkout(id)
    if (success) {
      navigate('/workouts')
    } else {
      alert('Failed to delete workout.')
    }
  }

  const handleDuplicate = async () => {
    if (!workout || !user) return
    
    try {
      const { data: newWorkout, error: wErr } = await createWorkout({
        name: `${workout.name} (Copy)`,
        description: workout.description,
        estimated_duration: workout.estimated_duration,
        user_id: user.id
      })
      
      if (wErr || !newWorkout) throw new Error('Failed to duplicate workout')
      
      // Duplicate exercises
      if (workout.workout_exercises) {
        for (const ex of workout.workout_exercises) {
          await addWorkoutExercise({
            workout_id: newWorkout.id,
            exercise_id: ex.exercise_id,
            exercise_order: ex.exercise_order,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest_seconds: ex.rest_seconds
          })
        }
      }
      
      navigate(`/workouts/${newWorkout.id}`)
    } catch (err) {
      alert('Failed to duplicate workout.')
    }
  }

  if (loading) return <div className="p-8 text-center animate-pulse">Loading workout...</div>
  if (error || !workout) return <div className="p-8 text-center text-red-500">{error || 'Workout not found'}</div>

  const exerciseCount = workout.workout_exercises?.length || 0

  return (
    <div className="animate-fade-in pb-24 max-w-3xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/workouts')}
          className="flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        
        <div className="flex items-center gap-2">
          <button onClick={handleDuplicate} className="p-2 text-surface-400 hover:text-brand-500 transition-colors" title="Duplicate">
            <Copy size={18} />
          </button>
          <button onClick={() => navigate(`/workouts/${id}/edit`)} className="p-2 text-surface-400 hover:text-brand-500 transition-colors" title="Edit">
            <Edit3 size={18} />
          </button>
          <button onClick={handleDelete} className="p-2 text-surface-400 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Title & Info */}
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-6 sm:p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-[100px]" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{workout.name}</h1>
          {workout.description && (
            <p className="text-brand-100 text-sm max-w-xl leading-relaxed mb-6">
              {workout.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm font-medium text-white/90 bg-black/20 w-fit px-4 py-2 rounded-xl backdrop-blur-sm">
            <span className="flex items-center gap-1.5">
              <Dumbbell size={16} /> {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
            </span>
            {workout.estimated_duration && (
              <span className="flex items-center gap-1.5 border-l border-white/20 pl-4">
                <Clock size={16} /> ~{formatDuration(workout.estimated_duration)}
              </span>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <button 
            onClick={() => navigate(`/workouts/${id}/run`)}
            className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
          >
            <Play size={18} fill="currentColor" />
            Start Workout
          </button>
        </div>
      </section>

      {/* Exercises List */}
      <section>
        <h2 className="text-lg font-bold text-surface-900 mb-4 px-1">Workout Structure</h2>
        {exerciseCount === 0 ? (
          <div className="text-center p-8 bg-surface-50 rounded-xl border border-surface-200">
            <p className="text-surface-500 mb-4">No exercises added to this workout yet.</p>
            <button onClick={() => navigate(`/workouts/${id}/edit`)} className="btn-secondary">
              Edit Workout to Add Exercises
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workout.workout_exercises?.map((we, index) => (
              <div key={we.id} className="card p-4 sm:p-5 flex items-center gap-4 hover:border-brand-200 transition-colors">
                <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-surface-900 text-base">{we.exercise?.name}</h3>
                  <p className="text-xs text-surface-500 capitalize">{we.exercise?.muscle_group}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-bold text-surface-900">
                    {we.sets} × {we.reps}
                  </p>
                  <p className="text-xs text-surface-500 mt-0.5">
                    {we.weight ? `${we.weight}kg · ` : ''}{we.rest_seconds}s rest
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
