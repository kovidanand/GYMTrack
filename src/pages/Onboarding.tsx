import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Check,
  Dumbbell,
  Flame,
  Trophy,
  Activity,
  Heart,
  Sparkles,
  Zap,
  Target,
  Calendar,
  Building2,
  Home,
  User
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { GYMTrackLogo } from '@/components/shared'
import { cn } from '@/lib/utils'
import type { FitnessGoal, ExperienceLevel } from '@/types/supabase'

// ─── Option Card ──────────────────────────────────────────────────────────────

interface OptionCardProps {
  id: string
  label: string
  description?: string
  icon: ReactNode
  selected: boolean
  onClick: () => void
}

function OptionCard({ id, label, description, icon, selected, onClick }: OptionCardProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full text-left p-4 rounded-xl border-2 transition-all duration-150 active:scale-[0.98]',
        selected
          ? 'border-brand-500 bg-brand-50 shadow-sm'
          : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm'
      )}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
          selected ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-600"
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold', selected ? 'text-brand-700' : 'text-surface-900')}>
            {label}
          </p>
          {description && (
            <p className="text-xs text-surface-500 mt-0.5">{description}</p>
          )}
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-white" aria-hidden="true" />
          </div>
        )}
      </div>
    </button>
  )
}

// ─── Step data ────────────────────────────────────────────────────────────────

const goalOptions: { value: FitnessGoal; label: string; description: string; icon: ReactNode }[] = [
  { value: 'build_muscle',       label: 'Build Muscle',       description: 'Gain size and strength over time',           icon: <Dumbbell size={20} /> },
  { value: 'lose_weight',        label: 'Lose Fat',           description: 'Reduce body fat through training',           icon: <Flame size={20} /> },
  { value: 'improve_strength',   label: 'Improve Strength',   description: 'Get stronger in the main lifts',             icon: <Trophy size={20} /> },
  { value: 'increase_endurance', label: 'Improve Fitness',    description: 'Better stamina and cardiovascular health',   icon: <Activity size={20} /> },
  { value: 'maintain_fitness',   label: 'General Fitness',    description: 'Stay active and healthy',                    icon: <Heart size={20} /> },
  { value: 'improve_flexibility',label: 'Improve Mobility',   description: 'Flexibility, movement and recovery',         icon: <Sparkles size={20} /> },
]

const experienceOptions: { value: ExperienceLevel; label: string; description: string; icon: ReactNode }[] = [
  { value: 'beginner',     label: 'Beginner',     description: 'Less than 1 year of consistent training',     icon: <User size={20} /> },
  { value: 'intermediate', label: 'Intermediate', description: '1–3 years of training experience',           icon: <Zap size={20} /> },
  { value: 'advanced',     label: 'Advanced',     description: '3+ years and good knowledge of programming',  icon: <Target size={20} /> },
]

const frequencyOptions: { value: number; label: string; icon: ReactNode }[] = [
  { value: 2, label: '2 days / week', icon: <Calendar size={18} /> },
  { value: 3, label: '3 days / week', icon: <Calendar size={18} /> },
  { value: 4, label: '4 days / week', icon: <Calendar size={18} /> },
  { value: 5, label: '5 days / week', icon: <Calendar size={18} /> },
  { value: 6, label: '6+ days / week', icon: <Calendar size={18} /> },
]

const equipmentOptions: { value: string; label: string; description: string; icon: ReactNode }[] = [
  { value: 'full_gym',        label: 'Full Gym',         description: 'Barbells, cables, machines, everything', icon: <Building2 size={20} /> },
  { value: 'home_gym',        label: 'Home Gym',         description: 'A solid set of equipment at home',       icon: <Home size={20} /> },
  { value: 'dumbbells',       label: 'Dumbbells',        description: 'Adjustable or fixed dumbbells',          icon: <Dumbbell size={20} /> },
  { value: 'bodyweight',      label: 'Bodyweight',       description: 'No equipment needed',                    icon: <User size={20} /> },
  { value: 'resistance_band', label: 'Resistance Bands', description: 'Bands and minimal equipment',            icon: <Activity size={20} /> },
]

// ─── Onboarding Page ──────────────────────────────────────────────────────────

export default function Onboarding() {
  const { profile, updateUserProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0) // 0=goal, 1=experience, 2=frequency+equipment
  const [goal, setGoal]           = useState<FitnessGoal | null>(null)
  const [experience, setExperience] = useState<ExperienceLevel | null>(null)
  const [frequency, setFrequency] = useState<number | null>(null)
  const [equipment, setEquipment] = useState<string[]>([])
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const totalSteps = 3
  const progressPct = ((step) / totalSteps) * 100

  const toggleEquipment = (value: string) => {
    setEquipment(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const canProceed = () => {
    if (step === 0) return goal !== null
    if (step === 1) return experience !== null
    if (step === 2) return frequency !== null && equipment.length > 0
    return false
  }

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(s => s + 1)
  }

  const handleFinish = async () => {
    if (!canProceed()) return
    setError(null)
    setSaving(true)

    const { error: saveError } = await updateUserProfile({
      fitness_goal: goal,
      experience_level: experience,
      training_frequency: frequency,
      preferred_equipment: equipment,
      onboarding_complete: true,
    })

    setSaving(false)

    if (saveError) {
      setError(saveError)
      return
    }

    navigate('/dashboard')
  }

  const firstName = profile?.first_name || 'there'

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-4 py-4 flex items-center justify-between">
        <GYMTrackLogo size="sm" />
        <span className="text-xs text-surface-500 font-medium">
          Step {step + 1} of {totalSteps}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-surface-100" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
        <div
          className="h-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPct + (1 / totalSteps) * 100}%` }}
        />
      </div>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg animate-fade-in">

          {/* ── Step 0: Goal ── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <p className="text-brand-600 text-sm font-medium mb-1">Welcome, {firstName}! 👋</p>
                <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
                  What's your primary fitness goal?
                </h1>
                <p className="text-surface-500 text-sm mt-1.5">
                  This helps us tailor your GYMTrack experience.
                </p>
              </div>
              <div className="space-y-2.5">
                {goalOptions.map(opt => (
                  <OptionCard
                    key={opt.value}
                    id={`goal-${opt.value}`}
                    label={opt.label}
                    description={opt.description}
                    icon={opt.icon}
                    selected={goal === opt.value}
                    onClick={() => setGoal(opt.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: Experience ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-brand-600 text-sm font-medium mb-1">Step 2 of 3</p>
                <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
                  What's your training experience?
                </h1>
                <p className="text-surface-500 text-sm mt-1.5">
                  Be honest — there's no wrong answer here.
                </p>
              </div>
              <div className="space-y-2.5">
                {experienceOptions.map(opt => (
                  <OptionCard
                    key={opt.value}
                    id={`exp-${opt.value}`}
                    label={opt.label}
                    description={opt.description}
                    icon={opt.icon}
                    selected={experience === opt.value}
                    onClick={() => setExperience(opt.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Frequency + Equipment ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-brand-600 text-sm font-medium mb-1">Step 3 of 3 — almost done!</p>
                <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
                  Training setup
                </h1>
                <p className="text-surface-500 text-sm mt-1.5">
                  How often do you train, and what equipment do you have?
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-surface-700 mb-3">Training frequency</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {frequencyOptions.map(opt => (
                    <button
                      key={opt.value}
                      id={`freq-${opt.value}`}
                      type="button"
                      onClick={() => setFrequency(opt.value)}
                      aria-pressed={frequency === opt.value}
                      className={cn(
                        'p-3.5 rounded-xl border-2 text-center transition-all duration-150',
                        frequency === opt.value
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300'
                      )}
                    >
                      <div className="flex justify-center mb-1 text-surface-600">{opt.icon}</div>
                      <p className="text-xs font-medium">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-surface-700 mb-1">Available equipment</p>
                <p className="text-xs text-surface-500 mb-3">Select all that apply.</p>
                <div className="space-y-2.5">
                  {equipmentOptions.map(opt => (
                    <OptionCard
                      key={opt.value}
                      id={`equip-${opt.value}`}
                      label={opt.label}
                      description={opt.description}
                      icon={opt.icon}
                      selected={equipment.includes(opt.value)}
                      onClick={() => toggleEquipment(opt.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-4">
              {error}
            </p>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-surface-100">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="btn-secondary"
                id="onboarding-back"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}

            <div className="flex-1" />

            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary"
                id="onboarding-next"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={!canProceed() || saving}
                className="btn-primary"
                id="onboarding-finish"
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving…</>
                ) : (
                  <>Start training 🚀</>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
