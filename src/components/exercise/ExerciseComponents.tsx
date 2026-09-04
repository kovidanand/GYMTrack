import { cn, getDifficultyColor, getEquipmentLabel, getMuscleGroupLabel } from '@/lib/utils'
import type { Exercise } from '@/types'
import { MuscleGroupBadge } from '@/components/shared'
import { Dumbbell } from 'lucide-react'

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

function ExerciseIllustration({ muscleGroup, className }: { muscleGroup: string; className?: string }) {
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
  onClick: (exercise: Exercise) => void
}

export function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  const difficultyClass = getDifficultyColor(exercise.difficulty)

  return (
    <article
      className="card card-hover cursor-pointer group overflow-hidden animate-fade-in"
      onClick={() => onClick(exercise)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(exercise)}
      aria-label={`View ${exercise.name} exercise details`}
    >
      {/* Illustration area */}
      <ExerciseIllustration
        muscleGroup={exercise.muscleGroup}
        className="h-28 mb-4 -mx-5 -mt-5 rounded-t-xl rounded-b-none"
      />

      <div className="space-y-2.5">
        {/* Name */}
        <h3 className="font-semibold text-surface-900 text-sm leading-snug group-hover:text-brand-600 transition-colors">
          {exercise.name}
        </h3>

        {/* Muscle + Equipment */}
        <div className="flex flex-wrap gap-1.5">
          <MuscleGroupBadge group={exercise.muscleGroup} />
          <span className="badge bg-surface-100 text-surface-600">
            {getEquipmentLabel(exercise.equipment[0])}
          </span>
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-between">
          <span className={cn('badge border', difficultyClass)}>
            {exercise.difficulty}
          </span>
          <span className="text-xs text-surface-400 capitalize">{exercise.category}</span>
        </div>
      </div>
    </article>
  )
}

// ─── Exercise Detail Panel ──────────────────────────────────────────────────────

interface ExerciseDetailProps {
  exercise: Exercise
  onClose: () => void
}

export function ExerciseDetail({ exercise, onClose }: ExerciseDetailProps) {
  const difficultyClass = getDifficultyColor(exercise.difficulty)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-2xl max-h-[92vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-slide-up">
        {/* Header illustration */}
        <ExerciseIllustration
          muscleGroup={exercise.muscleGroup}
          className="h-32 flex-shrink-0 rounded-none"
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur rounded-full w-8 h-8 flex items-center justify-center text-surface-600 hover:bg-white transition-colors"
          aria-label="Close exercise detail"
        >
          ✕
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title + meta */}
          <div>
            <h2 className="text-xl font-bold text-surface-900 mb-2">{exercise.name}</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <MuscleGroupBadge group={exercise.muscleGroup} />
              {exercise.equipment.map(eq => (
                <span key={eq} className="badge bg-surface-100 text-surface-600">{getEquipmentLabel(eq)}</span>
              ))}
              <span className={cn('badge border', difficultyClass)}>{exercise.difficulty}</span>
              <span className="badge bg-brand-50 text-brand-700 border border-brand-200 capitalize">{exercise.category}</span>
            </div>
            <p className="text-sm text-surface-600 leading-relaxed">{exercise.description}</p>
          </div>

          {/* Secondary muscles */}
          {exercise.secondaryMuscles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-surface-700 mb-2">Also works</h3>
              <div className="flex flex-wrap gap-1.5">
                {exercise.secondaryMuscles.map(m => (
                  <span key={m} className="badge bg-surface-50 text-surface-500 border border-surface-200">
                    {getMuscleGroupLabel(m)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h3 className="text-sm font-semibold text-surface-700 mb-3">How to perform</h3>
            <ol className="space-y-3">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-surface-600 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {exercise.tips.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-surface-700 mb-3">Key tips</h3>
              <ul className="space-y-2">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-surface-600">
                    <span className="text-brand-500 mt-0.5 flex-shrink-0">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common mistakes */}
          {exercise.commonMistakes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-surface-700 mb-3">Common mistakes</h3>
              <ul className="space-y-2">
                {exercise.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-surface-600">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-safe">
            <button className="btn-primary flex-1" aria-label={`Add ${exercise.name} to workout`}>
              Add to Workout
            </button>
            <button className="btn-secondary flex-1" aria-label={`Start ${exercise.name} exercise`}>
              Start Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
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
