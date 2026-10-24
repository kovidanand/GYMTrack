import { useState, useRef, useEffect } from 'react'
import { cn, getDifficultyColor, formatTagLabel } from '@/lib/utils'
import type { Exercise } from '@/types'
import { MuscleGroupBadge } from '@/components/shared'
import { Dumbbell, Heart } from 'lucide-react'
import { getExerciseVisual, resolveExerciseMedia } from '@/lib/exerciseMedia'
import { useExerciseDemo, type DemoGender } from '@/context/ExerciseDemoContext'

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
  const style = muscleIllustrationColors[muscleGroup] ?? { bg: 'bg-surface-50', accent: 'text-surface-400' }
  return (
    <div className={cn('flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center select-none', style.bg, className)}>
      <Dumbbell className={cn('w-6 h-6 opacity-60', style.accent)} aria-hidden="true" />
      <span className="text-[10px] font-bold text-surface-700 capitalize">{muscleGroup.replace('_', ' ')}</span>
      <span className="text-[9px] text-surface-400 font-medium">Demonstration unavailable</span>
    </div>
  )
}

// ─── Exercise Card Media (owns all states: loading / video / poster / fallback) ────

interface ExerciseMediaProps {
  exercise: Exercise
  variant?: 'card' | 'detail' | 'thumbnail'
  className?: string
  preferredGender?: DemoGender
}

export function ExerciseMedia({ exercise, variant = 'card', className, preferredGender }: ExerciseMediaProps) {
  const { demoGender, resolveDemoVideo } = useExerciseDemo()
  const media = resolveExerciseMedia(exercise)
  const resolved = resolveDemoVideo(media, preferredGender || demoGender)
  const videoUrl = resolved.videoUrl
  const posterUrl = resolved.posterUrl || getExerciseVisual(exercise.slug, exercise.image_url)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevSrcRef = useRef<string | undefined>(undefined)
  const [isVisible, setIsVisible] = useState(false)
  const [hasEnteredViewport, setHasEnteredViewport] = useState(variant === 'detail')
  const [isHovered, setIsHovered] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // IntersectionObserver: detect visibility with rootMargin for smooth preloading
  useEffect(() => {
    if (variant === 'detail') {
      setIsVisible(true)
      setHasEnteredViewport(true)
      return
    }
    const el = containerRef.current
    if (!el || !videoUrl) return

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredViewport(true)
          if (debounceTimer) clearTimeout(debounceTimer)
          // 80ms debounce avoids spinning up decoders during rapid fling-scrolls
          debounceTimer = setTimeout(() => {
            setIsVisible(true)
          }, 80)
        } else {
          if (debounceTimer) {
            clearTimeout(debounceTimer)
            debounceTimer = null
          }
          setIsVisible(false)
        }
      },
      {
        rootMargin: '100px 0px 100px 0px',
        threshold: 0.2,
      }
    )

    observer.observe(el)
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      observer.disconnect()
    }
  }, [videoUrl, variant])

  // Sync video source stably without destroying DOM element
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl || !hasEnteredViewport) return

    if (prevSrcRef.current !== videoUrl) {
      prevSrcRef.current = videoUrl
      setVideoLoaded(false)
      setVideoError(false)
      video.src = videoUrl
      video.preload = 'metadata'
      video.muted = true
      video.defaultMuted = true
      video.playsInline = true
      if (isVisible || isHovered || variant === 'detail') {
        const p = video.play()
        if (p !== undefined) {
          p.catch(() => {
            // Autoplay rejection or interrupted
          })
        }
      }
    }
  }, [videoUrl, hasEnteredViewport, isVisible, isHovered, variant])

  // Manage inline playback: start when visible in viewport (cards/detail) or hovered
  const shouldPlay = (variant === 'detail') || (variant === 'card' && isVisible) || isHovered

  useEffect(() => {
    const video = videoRef.current
    if (!video || !hasEnteredViewport || videoError) return

    if (shouldPlay) {
      video.muted = true
      video.defaultMuted = true
      video.playsInline = true
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true)
        }).catch(() => {
          // Handled gracefully: keep poster visible if browser autoplay blocks
          setIsPlaying(false)
        })
      }
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [shouldPlay, hasEnteredViewport, videoError])

  // Resource cleanup on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current
      if (video) {
        video.pause()
        video.removeAttribute('src')
        video.load()
      }
    }
  }, [])

  const containerClasses = variant === 'thumbnail'
    ? cn('relative w-full h-full overflow-hidden bg-surface-100 rounded-lg flex-shrink-0', className)
    : variant === 'detail'
    ? cn('relative w-full h-full aspect-video overflow-hidden bg-surface-100 rounded-xl', className)
    : cn('exercise-card-media bg-surface-100', className)

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fallback & Loading Poster Image: always rendered behind video to prevent black flash */}
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={`${exercise.name} demonstration poster`}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none',
            videoLoaded && isPlaying && !videoError ? 'opacity-0' : 'opacity-100'
          )}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <ExerciseIllustration
          muscleGroup={exercise.muscle_group}
          className="absolute inset-0 w-full h-full rounded-none"
        />
      )}

      {/* Inline Demonstration Video */}
      {videoUrl && !videoError && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload={hasEnteredViewport ? 'metadata' : 'none'}
          onLoadedData={() => {
            setVideoLoaded(true)
            if (shouldPlay) setIsPlaying(true)
          }}
          onCanPlay={() => {
            setVideoLoaded(true)
            if (shouldPlay) setIsPlaying(true)
          }}
          onPlaying={() => {
            setIsPlaying(true)
            setVideoLoaded(true)
          }}
          onError={() => {
            setVideoError(true)
            setIsPlaying(false)
          }}
          onPause={() => setIsPlaying(false)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            videoLoaded && isPlaying ? 'opacity-100' : 'opacity-0',
            'group-hover:scale-105'
          )}
          aria-label={`${exercise.name} exercise demonstration`}
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
  onLogExercise?: (exercise: Exercise, e: React.MouseEvent) => void
  onClick: (exercise: Exercise) => void
}

export function ExerciseCard({ exercise, isFavorite = false, onToggleFavorite, onLogExercise, onClick }: ExerciseCardProps) {
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
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <MuscleGroupBadge group={exercise.muscle_group} />
            {exercise.equipment && exercise.equipment.length > 0 && (
              <span className="badge bg-surface-100 text-surface-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {formatTagLabel(exercise.equipment[0])}
              </span>
            )}
          </div>

          {/* Difficulty + Goal / Type */}
          <div className="flex items-center justify-between gap-1.5 text-xs mt-2">
            <span className={cn('badge border text-[10px] font-semibold px-2 py-0.5 rounded-full', difficultyClass)}>
              {formatTagLabel(exercise.difficulty)}
            </span>
            <span className="badge bg-surface-50 text-surface-600 border border-surface-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {formatTagLabel(exercise.exercise_type)}
            </span>
          </div>
        </div>

        {/* ── Footer: Single Primary Log Button ── */}
        {onLogExercise && (
          <div className="exercise-card-footer mt-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onLogExercise(exercise, e) }}
              id={`exercise-card-log-${exercise.slug}`}
              className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-xs"
              title={`Log ${exercise.name} sets now`}
              aria-label={`Log ${exercise.name} sets now`}
            >
              <Dumbbell size={13} aria-hidden="true" />
              <span>Log</span>
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
