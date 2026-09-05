import { cn, getDifficultyColor, getEquipmentLabel, getMuscleGroupLabel } from '@/lib/utils'
import type { Exercise } from '@/types'
import { MuscleGroupBadge } from '@/components/shared'
import { Dumbbell, Heart } from 'lucide-react'

// ─── Muscle Group Visual ────────────────────────────────────────────────────────

const muscleIllustrationColors: Record<string, { bg: string; accent: string }> = {
  chest:       { bg: 'bg-rose-50',    accent: 'text-rose-400' },
  back:        { bg: 'bg-blue-50',    accent: 'text-blue-400' },
  shoulders:   { bg: 'bg-violet-50',  accent: 'text-violet-400' },
  biceps:      { bg: 'bg-sky-50',     accent: 'text-sky-400' },
  triceps:     { bg: 'bg-indigo-50',  accent: 'text-indigo-400' },
  quads:       { bg: 'bg-amber-50',   accent: 'text-amber-400' },
  legs:        { bg: 'bg-amber-50',   accent: 'text-amber-400' },
  hamstrings:  { bg: 'bg-orange-50',  accent: 'text-orange-400' },
  glutes:      { bg: 'bg-pink-50',    accent: 'text-pink-400' },
  calves:      { bg: 'bg-yellow-50',  accent: 'text-yellow-400' },
  core:        { bg: 'bg-teal-50',    accent: 'text-teal-400' },
  full_body:   { bg: 'bg-emerald-50', accent: 'text-emerald-400' },
  forearms:    { bg: 'bg-cyan-50',    accent: 'text-cyan-400' },
  traps:       { bg: 'bg-purple-50',  accent: 'text-purple-400' },
}

export function ExerciseIllustration({ muscleGroup, className }: { muscleGroup: string; className?: string }) {
  const style = muscleIllustrationColors[muscleGroup] ?? { bg: 'bg-surface-50', accent: 'text-surface-300' }
  return (
    <div className={cn('flex items-center justify-center rounded-lg', style.bg, className)}>
      <Dumbbell className={cn('w-8 h-8 opacity-60', style.accent)} aria-hidden="true" />
    </div>
  )
}

// ─── Exercise Card ──────────────────────────────────────────────────────────────

interface ExerciseCardProps {
  exercise: Exercise
  isFavorite?: boolean
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void
  onClick: (exercise: Exercise) => void
}

export function ExerciseCard({ exercise, isFavorite = false, onToggleFavorite, onClick }: ExerciseCardProps) {
  const difficultyClass = getDifficultyColor(exercise.difficulty)

  return (
    <article
      className="card card-hover cursor-pointer group overflow-hidden animate-fade-in relative"
      onClick={() => onClick(exercise)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(exercise)}
      aria-label={`View ${exercise.name} exercise details`}
    >
      {/* Favorite Button Overlay */}
      {onToggleFavorite && (
        <button
          onClick={(e) => onToggleFavorite(exercise.id, e)}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full z-10 hover:scale-110 transition-transform shadow-sm"
          aria-label={isFavorite ? `Remove ${exercise.name} from favorites` : `Add ${exercise.name} to favorites`}
        >
          <Heart 
            size={18} 
            className={cn("transition-colors", isFavorite ? "fill-brand-500 text-brand-500" : "text-surface-400 hover:text-brand-500")} 
          />
        </button>
      )}

      {/* Illustration area */}
      <ExerciseIllustration
        muscleGroup={exercise.muscle_group}
        className="h-28 mb-4 -mx-5 -mt-5 rounded-t-xl rounded-b-none"
      />

      <div className="space-y-2.5 relative z-0">
        {/* Name */}
        <h3 className="font-semibold text-surface-900 text-sm leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
          {exercise.name}
        </h3>

        {/* Muscle + Equipment */}
        <div className="flex flex-wrap gap-1.5">
          <MuscleGroupBadge group={exercise.muscle_group} />
          {exercise.equipment && exercise.equipment.length > 0 && (
            <span className="badge bg-surface-100 text-surface-600">
              {getEquipmentLabel(exercise.equipment[0])}
            </span>
          )}
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-between pt-1">
          <span className={cn('badge border', difficultyClass)}>
            {exercise.difficulty}
          </span>
          <span className="text-xs text-surface-400 capitalize">{exercise.exercise_type}</span>
        </div>
      </div>
    </article>
  )
}

// ─── Filter Bar ─────────────────────────────────────────────────────────────────

interface FilterOption {
  value: string
  label: string
}

interface FilterBarProps {
  label: string
  options: FilterOption[]
  value: string
  onChange: (v: string) => void
  id: string
}

export function FilterChips({ label, options, value, onChange, id }: FilterBarProps) {
  return (
    <div>
      <p className="label-sm mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        <button
          id={`${id}-all`}
          onClick={() => onChange('all')}
          className={cn(
            'badge cursor-pointer transition-colors',
            value === 'all'
              ? 'bg-brand-500 text-white border border-brand-500'
              : 'bg-white text-surface-600 border border-surface-200 hover:border-surface-300'
          )}
        >
          All
        </button>
        {options.map(opt => (
          <button
            key={opt.value}
            id={`${id}-${opt.value}`}
            onClick={() => onChange(opt.value === value ? 'all' : opt.value)}
            className={cn(
              'badge cursor-pointer transition-colors',
              value === opt.value
                ? 'bg-brand-500 text-white border border-brand-500'
                : 'bg-white text-surface-600 border border-surface-200 hover:border-surface-300'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
