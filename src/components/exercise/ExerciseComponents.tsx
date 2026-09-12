import { useState, useRef, useEffect } from 'react'
import { cn, getDifficultyColor, getEquipmentLabel, getMuscleGroupLabel } from '@/lib/utils'
import type { Exercise } from '@/types'
import { MuscleGroupBadge } from '@/components/shared'
import { Dumbbell, Heart, Plus } from 'lucide-react'
import { getExerciseVisual, resolveExerciseMedia } from '@/lib/exerciseMedia'

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
  onAddToWorkout?: (exercise: Exercise, e: React.MouseEvent) => void
  onClick: (exercise: Exercise) => void
}

export function ExerciseCard({ exercise, isFavorite = false, onToggleFavorite, onAddToWorkout, onClick }: ExerciseCardProps) {
  const difficultyClass = getDifficultyColor(exercise.difficulty)
  const media = resolveExerciseMedia(exercise)
  const videoUrl = media?.videoUrl || media?.maleVideoUrl || media?.femaleVideoUrl
  const posterUrl = media?.posterUrl || media?.thumbnailUrl || getExerciseVisual(exercise.slug, exercise.image_url)

  const cardRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // IntersectionObserver to only load/play video when in viewport
  useEffect(() => {
    const cardEl = cardRef.current
    if (!cardEl || !videoUrl) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.3 }
    )

    observer.observe(cardEl)
    return () => observer.disconnect()
  }, [videoUrl])

  // Manage playback based on visibility or hover
  useEffect(() => {
    const video = videoRef.current
    if (!video || videoError) return

    if (isVisible || isHovered) {
      video.play().catch(() => {
        // Autoplay may be restricted or pending interaction
      })
    } else {
      video.pause()
    }
  }, [isVisible, isHovered, videoError])

  return (
    <article
      ref={cardRef}
      className="card card-hover cursor-pointer group overflow-hidden animate-fade-in relative flex flex-col justify-between"
      onClick={() => onClick(exercise)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(exercise)}
      aria-label={`View ${exercise.name} exercise details`}
    >
      {/* Favorite Button Overlay */}
      {onToggleFavorite && (
        <button
          onClick={(e) => onToggleFavorite(exercise.id, e)}
          className="absolute top-2 right-2 p-2 bg-white/85 backdrop-blur-sm rounded-full z-10 hover:scale-110 transition-transform shadow-sm"
          aria-label={isFavorite ? `Remove ${exercise.name} from favorites` : `Add ${exercise.name} to favorites`}
        >
          <Heart 
            size={16} 
            className={cn("transition-colors", isFavorite ? "fill-brand-500 text-brand-500" : "text-surface-400 hover:text-brand-500")} 
          />
        </button>
      )}

      <div>
        {/* Visual Media Video Preview area */}
        <div className="h-36 mb-3 -mx-5 -mt-5 rounded-t-xl overflow-hidden bg-surface-900 flex items-center justify-center relative">
          {videoUrl && !videoError ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl || undefined}
              muted
              loop
              playsInline
              preload="none"
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              aria-label={`${exercise.name} preview demonstration`}
            />
          ) : posterUrl ? (
            <img
              src={posterUrl}
              alt={exercise.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <ExerciseIllustration
              muscleGroup={exercise.muscle_group}
              className="w-full h-full rounded-none"
            />
          )}

          {/* Subtle Video badge */}
          {videoUrl && !videoError && (
            <div className="absolute bottom-1.5 left-2 z-10 bg-black/50 backdrop-blur-xs text-[9px] font-semibold text-white/90 px-1.5 py-0.5 rounded">
              HD
            </div>
          )}
        </div>

        <div className="space-y-2 relative z-0">
          {/* Name */}
          <h3 className="font-bold text-surface-900 text-sm leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
            {exercise.name}
          </h3>

          {/* Muscle + Equipment */}
          <div className="flex flex-wrap gap-1.5">
            <MuscleGroupBadge group={exercise.muscle_group} />
            {exercise.equipment && exercise.equipment.length > 0 && (
              <span className="badge bg-surface-100 text-surface-600 text-[11px]">
                {getEquipmentLabel(exercise.equipment[0])}
              </span>
            )}
          </div>

          {/* Difficulty & Type */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className={cn('badge border text-[10px]', difficultyClass)}>
              {exercise.difficulty}
            </span>
            <span className="text-[11px] text-surface-400 capitalize">{exercise.exercise_type}</span>
          </div>
        </div>
      </div>

      {/* Quick Add to Workout Button */}
      {onAddToWorkout && (
        <div className="mt-3 pt-2.5 border-t border-surface-100">
          <button
            type="button"
            onClick={(e) => onAddToWorkout(exercise, e)}
            id={`exercise-card-add-${exercise.slug}`}
            className="w-full py-2 px-3 rounded-xl bg-surface-50 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-surface-200 text-surface-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            title={`Add ${exercise.name} to today's workout`}
            aria-label={`Add ${exercise.name} to today's workout`}
          >
            <Plus size={14} className="text-brand-600 stroke-[2.5]" />
            <span>+ Add</span>
          </button>
        </div>
      )}
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
