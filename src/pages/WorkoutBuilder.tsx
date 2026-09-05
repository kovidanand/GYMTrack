import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Plus, GripVertical, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getWorkoutById, createWorkout, updateWorkout, addWorkoutExercise, updateWorkoutExercise, deleteWorkoutExercise } from '@/lib/workouts'
import { ExerciseSelector } from '@/components/exercise/ExerciseSelector'
import { PageHeader } from '@/components/shared'
import type { Workout, WorkoutExercise, Exercise } from '@/types'

// Helper type for local state
type LocalExercise = Partial<WorkoutExercise> & { tempId: string, exercise?: Exercise, _isDeleted?: boolean }

export default function WorkoutBuilder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const isEditing = Boolean(id)
  
  // Workout State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState(60)
  
  // Exercises State
  const [exercises, setExercises] = useState<LocalExercise[]>([])
  
  // UI State
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [showSelector, setShowSelector] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!isEditing || !id) return
      
      const { data, error } = await getWorkoutById(id)
      if (error || !data) {
        setError(error || 'Failed to load workout')
        setLoading(false)
        return
      }
      
      setName(data.name)
      setDescription(data.description || '')
      setEstimatedDuration(data.estimated_duration || 60)
      
      if (data.workout_exercises) {
        setExercises(data.workout_exercises.map(we => ({
          ...we,
          tempId: we.id, // use real ID as tempId for existing
        })))
      }
      setLoading(false)
    }
    load()
  }, [id, isEditing])

  const handleAddExercise = (exercise: Exercise) => {
    setExercises(prev => [
      ...prev,
      {
        tempId: `temp-${Date.now()}`,
        exercise_id: exercise.id,
        exercise,
        sets: 3,
        reps: '8-12',
        weight: null,
        rest_seconds: 90,
        exercise_order: prev.length
      }
    ])
    setShowSelector(false)
  }

  const handleUpdateExercise = (tempId: string, updates: Partial<LocalExercise>) => {
    setExercises(prev => prev.map(ex => 
      ex.tempId === tempId ? { ...ex, ...updates } : ex
    ))
  }

  const handleRemoveExercise = (tempId: string) => {
    setExercises(prev => prev.map(ex => 
      ex.tempId === tempId ? { ...ex, _isDeleted: true } : ex
    ))
  }

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const activeExercises = exercises.filter(e => !e._isDeleted)
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === activeExercises.length - 1)
    ) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newActive = [...activeExercises]
    const temp = newActive[index]
    newActive[index] = newActive[newIndex]
    newActive[newIndex] = temp

    // Reconstruct the full list, keeping deleted ones at the end (or where they were, doesn't matter much for save logic as long as order is updated)
    const newExercises = exercises.map(ex => {
      if (ex._isDeleted) return ex
      const newOrderIndex = newActive.findIndex(a => a.tempId === ex.tempId)
      return { ...ex, exercise_order: newOrderIndex }
    }).sort((a, b) => {
      if (a._isDeleted) return 1
      if (b._isDeleted) return -1
      return (a.exercise_order || 0) - (b.exercise_order || 0)
    })

    setExercises(newExercises)
  }

  const handleSave = async () => {
    if (!user) return
    if (!name.trim()) {
      setError('Workout name is required')
      return
    }

    setSaving(true)
    setError(null)
    
    try {
      let currentWorkoutId = id

      // 1. Create or Update Workout
      const workoutData = {
        name: name.trim(),
        description: description.trim() || null,
        estimated_duration: estimatedDuration,
        user_id: user.id
      }

      if (isEditing && currentWorkoutId) {
        const { error: wErr } = await updateWorkout(currentWorkoutId, workoutData)
        if (wErr) throw new Error(wErr)
      } else {
        const { data: newW, error: wErr } = await createWorkout(workoutData)
        if (wErr || !newW) throw new Error(wErr || 'Failed to create workout')
        currentWorkoutId = newW.id
      }

      // 2. Sync Exercises
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i]
        
        if (ex._isDeleted) {
          if (!ex.tempId.startsWith('temp-')) {
             await deleteWorkoutExercise(ex.id!)
          }
          continue
        }

        const exData = {
          workout_id: currentWorkoutId!,
          exercise_id: ex.exercise_id!,
          exercise_order: ex.exercise_order ?? i,
          sets: ex.sets!,
          reps: ex.reps!,
          weight: ex.weight || null,
          rest_seconds: ex.rest_seconds!
        }

        if (ex.tempId.startsWith('temp-')) {
          // Create new
          await addWorkoutExercise(exData)
        } else {
          // Update existing
          await updateWorkoutExercise(ex.id!, exData)
        }
      }

      navigate('/workouts')
    } catch (err: any) {
      setError(err.message || 'Failed to save workout')
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center animate-pulse">Loading...</div>

  const activeExercises = exercises.filter(e => !e._isDeleted)

  return (
    <div className="animate-fade-in pb-24 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/workouts')}
          className="flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="btn-primary gap-2"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Workout'}
        </button>
      </div>

      <PageHeader 
        title={isEditing ? 'Edit Workout' : 'Create Workout'}
        description="Design your training session by adding exercises and configuring sets."
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="card p-5 sm:p-6 space-y-4">
        <div>
          <label className="label-sm">Workout Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Upper Body Power"
            className="input-base"
            required
          />
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-sm">Estimated Duration (mins)</label>
            <input
              type="number"
              value={estimatedDuration}
              onChange={e => setEstimatedDuration(parseInt(e.target.value) || 0)}
              min={10}
              step={5}
              className="input-base"
            />
          </div>
        </div>

        <div>
          <label className="label-sm">Description (Optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is the focus of this workout?"
            className="input-base min-h-[80px] resize-y"
          />
        </div>
      </section>

      {/* Exercises */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-surface-900">Exercises</h2>
          <button 
            onClick={() => setShowSelector(true)}
            className="btn-secondary text-sm py-1.5"
          >
            <Plus size={16} /> Add Exercise
          </button>
        </div>

        {activeExercises.length === 0 ? (
          <div className="card p-8 text-center border-dashed border-2 bg-surface-50/50">
            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mx-auto mb-3">
              <Plus size={24} />
            </div>
            <h3 className="font-semibold text-surface-900 mb-1">No exercises yet</h3>
            <p className="text-sm text-surface-500 mb-4">Add exercises from the library to build your workout.</p>
            <button onClick={() => setShowSelector(true)} className="btn-primary mx-auto">
              Browse Library
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeExercises.map((ex, index) => (
              <div key={ex.tempId} className="card p-4 flex flex-col sm:flex-row gap-4 border-surface-200 shadow-sm animate-fade-in group">
                {/* Drag Handle & Info */}
                <div className="flex items-start sm:items-center gap-3 sm:w-1/3">
                  <div className="flex flex-col gap-1 text-surface-300">
                    <button 
                      onClick={() => handleMoveExercise(index, 'up')} 
                      disabled={index === 0}
                      className="hover:text-surface-600 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button 
                      onClick={() => handleMoveExercise(index, 'down')}
                      disabled={index === activeExercises.length - 1}
                      className="hover:text-surface-600 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-500 mb-0.5">EXERCISE {index + 1}</p>
                    <h4 className="font-bold text-surface-900 leading-snug">{ex.exercise?.name}</h4>
                    <p className="text-xs text-surface-500 capitalize mt-1">{ex.exercise?.muscle_group}</p>
                  </div>
                </div>

                {/* Config */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-surface-400 block mb-1">Sets</label>
                    <input 
                      type="number" 
                      value={ex.sets} 
                      onChange={e => handleUpdateExercise(ex.tempId, { sets: parseInt(e.target.value) || 1 })}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg px-2 py-1.5 text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-surface-400 block mb-1">Reps</label>
                    <input 
                      type="text" 
                      value={ex.reps} 
                      onChange={e => handleUpdateExercise(ex.tempId, { reps: e.target.value })}
                      placeholder="e.g. 8-12"
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-surface-400 block mb-1">Rest (sec)</label>
                    <input 
                      type="number" 
                      value={ex.rest_seconds} 
                      onChange={e => handleUpdateExercise(ex.tempId, { rest_seconds: parseInt(e.target.value) || 0 })}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg px-2 py-1.5 text-sm"
                      step="15"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-surface-400 block mb-1">Target Wt</label>
                    <input 
                      type="number" 
                      value={ex.weight || ''} 
                      onChange={e => handleUpdateExercise(ex.tempId, { weight: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="kg"
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
                
                {/* Delete */}
                <button 
                  onClick={() => handleRemoveExercise(ex.tempId)}
                  className="sm:self-center p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove exercise"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {showSelector && (
        <ExerciseSelector
          onSelect={handleAddExercise}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  )
}
