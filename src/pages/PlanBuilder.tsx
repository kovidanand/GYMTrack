import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createWorkoutPlan } from '@/lib/workouts'
import { PageHeader } from '@/components/shared'

export default function PlanBuilder() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [difficulty, setDifficulty] = useState('beginner')
  const [daysPerWeek, setDaysPerWeek] = useState(3)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!user) return
    if (!name.trim()) {
      setError('Plan name is required')
      return
    }

    setSaving(true)
    setError(null)
    
    try {
      const { error: wErr } = await createWorkoutPlan({
        name: name.trim(),
        description: description.trim() || null,
        goal: goal || null,
        difficulty,
        days_per_week: daysPerWeek,
        user_id: user.id,
        is_active: false // user can activate it later
      })

      if (wErr) throw new Error(wErr)
      
      navigate('/plans')
    } catch (err: any) {
      setError(err.message || 'Failed to create plan')
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in pb-24 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/plans')}
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
          {saving ? 'Saving...' : <><Save size={16} /> Create Plan</>}
        </button>
      </div>

      <PageHeader 
        title="Create Training Plan"
        description="Design a structured routine to hit your goals."
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      <section className="card p-5 sm:p-6 space-y-5">
        <div>
          <label className="label-sm">Plan Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Push Pull Legs 6-Day"
            className="input-base"
            required
          />
        </div>
        
        <div>
          <label className="label-sm">Description (Optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is the focus of this plan?"
            className="input-base min-h-[80px] resize-y"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label-sm">Primary Goal</label>
            <select
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="input-base bg-white"
            >
              <option value="">Select a goal</option>
              <option value="Muscle Gain">Muscle Gain (Hypertrophy)</option>
              <option value="Strength">Strength</option>
              <option value="Fat Loss">Fat Loss</option>
              <option value="Endurance">Endurance</option>
              <option value="General Fitness">General Fitness</option>
            </select>
          </div>
          
          <div>
            <label className="label-sm">Difficulty</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="input-base bg-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="label-sm">Days Per Week</label>
            <input
              type="number"
              value={daysPerWeek}
              onChange={e => setDaysPerWeek(parseInt(e.target.value) || 1)}
              min={1}
              max={7}
              className="input-base"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
