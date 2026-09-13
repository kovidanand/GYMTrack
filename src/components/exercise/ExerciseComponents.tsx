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
    <div className={cn('flex flex-col items-center justify-center gap-2 rounded-lg', style.bg, className)}>
      <Dumbbell className={cn('w-8 h-8 opacity-50', style.accent)} aria-hidden="true" />
      <span className="text-[10px] font-medium text-surface-400">Demonstration unavailable</span>
    </div>
  )
}

// ─── Exercise Card Media (owns all states: loading / video / poster / fallback) ────

interface ExerciseMediaProps {
  exercise: Exercise
  variant?: 'card' | 'detail'
}

export function ExerciseMedia({ exercise, variant = 'card' }: ExerciseMediaProps) {
  const media = resolveExerciseMedia(exercise)
  const videoUrl = media?.videoUrl || media?.maleVideoUrl || media?.femaleVideoUrl
  const posterUrl = media?.posterUrl || media?.thumbnailUrl || getExerciseVisual(exercise.slug, exercise.image_url)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // IntersectionObserver — only play when in viewport (card mode) or always (detail mode)
  useEffect(() => {
    if (variant === 'detail') {
      setIsVisible(true)
      return
    }
    const el = containerRef.current
    if (!el || !videoUrl) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [videoUrl, variant])

  // Manage video playback
  useEffect(() => {
    const video = videoRef.current
    if (!video || videoError) return
    if (isVisible || isHovered) {
      video.play().catch(() => {/* autoplay blocked */})
    } else {
      video.pause()
    }
  }, [isVisible, isHovered, videoError])

  return (
    <div
      ref={containerRef}
      className="exercise-card-media"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading skeleton while video fetches */}
      {videoUrl && !videoError && !videoLoaded && posterUrl && (
        <img
          src={posterUrl}
          alt={`${exercise.name} demonstration poster`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      )}

      {videoUrl && !videoError ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl || undefined}
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-transform duration-300',
            (isVisible || isHovered) && 'group-hover:scale-105'
          )}
          aria-label={`${exercise.name} exercise demonstration`}
        />
      ) : posterUrl ? (
        <img
          src={posterUrl}
          alt={exercise.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <ExerciseIllustration
          muscleGroup={exercise.muscle_group}
          className="absolute inset-0 w-full h-full rounded-none"
        />
      )}
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

  return (
    <article
      className="exercise-library-card group"
      onClick={() => onClick(exercise)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(exercise)}
      aria-label={`View ${exercise.name} exercise details`}
    >
      {/* Favorite Button Overlay */}
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(exercise.id, e) }}
          className="absolute top-2 right-2 p-1.5 bg-white/85 backdrop-blur-sm rounded-full z-20 hover:scale-110 transition-transform shadow-sm"
          aria-label={isFavorite ? `Remove ${exercise.name} from favorites` : `Add ${exercise.name} to favorites`}
          type="button"
        >
          <Heart
            size={14}
            className={cn("transition-colors", isFavorite ? "fill-brand-500 text-brand-500" : "text-surface-400 hover:text-brand-500")}
          />
        </button>
      )}

      {/* ── Media Area (standardized 16:9, never overflows) ── */}
      <ExerciseMedia exercise={exercise} variant="card" />

      {/* ── Content ── */}
      <div className="exercise-card-content">
        <div className="exercise-card-info">
          {/* Exercise Name — never clipped, wraps naturally */}
          <h3 className="exercise-card-title group-hover:text-brand-600 transition-colors">
            {exercise.name}
          </h3>

          {/* Muscle + Equipment chips */}
          <div className="flex flex-wrap gap-1 mt-1">
            <MuscleGroupBadge group={exercise.muscle_group} />
            {exercise.equipment && exercise.equipment.length > 0 && (
              <span className="badge bg-surface-100 text-surface-600 text-[10px]">
                {getEquipmentLabel(exercise.equipment[0])}
              </span>
            )}
          </div>

          {/* Difficulty + Type */}
          <div className="flex items-center justify-between text-xs mt-1.5">
            <span className={cn('badge border text-[10px]', difficultyClass)}>
              {exercise.difficulty}
            </span>
            <span className="text-[10px] text-surface-400 capitalize">{exercise.exercise_type}</span>
          </div>
        </div>

        {/* ── Footer: Add Button (always bottom-aligned via margin-top: auto) ── */}
        {onAddToWorkout && (
          <div className="exercise-card-footer">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAddToWorkout(exercise, e) }}
              id={`exercise-card-add-${exercise.slug}`}
              className="w-full py-2 px-3 rounded-xl bg-surface-50 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-surface-200 text-surface-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              title={`Add ${exercise.name} to today's workout`}
              aria-label={`Add ${exercise.name} to today's workout`}
            >
              <Plus size={13} className="text-brand-600 stroke-[2.5]" aria-hidden="true" />
              <span>+ Add</span>
            </button>
          </div>
        )}
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
