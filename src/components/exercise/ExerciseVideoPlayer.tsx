import { useState, useEffect, useRef } from 'react'
import { Play, Pause, AlertCircle } from 'lucide-react'
import type { ExerciseMedia } from '@/types'
import { cn } from '@/lib/utils'

interface ExerciseVideoPlayerProps {
  media?: ExerciseMedia | null
  exerciseName: string
  className?: string
  aspectRatio?: '16/9' | '4/3' | 'square' | 'auto'
  autoPlay?: boolean
  showControls?: boolean
  showGenderToggle?: boolean
  objectFit?: 'cover' | 'contain'
}

export function ExerciseVideoPlayer({
  media,
  exerciseName,
  className = '',
  aspectRatio = '16/9',
  autoPlay = true,
  showControls = false,
  showGenderToggle = true,
  objectFit = 'cover'
}: ExerciseVideoPlayerProps) {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male')
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [hasError, setHasError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Auto switch to available gender if selected is not present
  useEffect(() => {
    if (media) {
      if (selectedGender === 'male' && !media.maleVideoUrl && media.femaleVideoUrl) {
        setSelectedGender('female')
      } else if (selectedGender === 'female' && !media.femaleVideoUrl && media.maleVideoUrl) {
        setSelectedGender('male')
      }
    }
  }, [media, selectedGender])

  const currentVideoUrl = selectedGender === 'female'
    ? (media?.femaleVideoUrl || media?.videoUrl)
    : (media?.maleVideoUrl || media?.videoUrl)

  const currentPosterUrl = selectedGender === 'female'
    ? (media?.thumbnailUrl || media?.posterUrl)
    : (media?.posterUrl || media?.thumbnailUrl)

  const hasMultipleGenders = Boolean(media?.maleVideoUrl && media?.femaleVideoUrl)

  const handleTogglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Fallback state when no video is available
  if (!currentVideoUrl || hasError) {
    return (
      <div
        className={cn(
          'w-full rounded-2xl bg-surface-100 border border-surface-200/80 overflow-hidden relative flex flex-col items-center justify-center p-6 text-center text-surface-500',
          aspectRatio === '16/9' && 'aspect-video',
          className
        )}
      >
        {currentPosterUrl ? (
          <img
            src={currentPosterUrl}
            alt={`${exerciseName} poster`}
            className="absolute inset-0 w-full h-full object-contain p-4 opacity-75"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 z-10">
            <AlertCircle className="w-8 h-8 text-surface-400 stroke-1" />
            <p className="text-sm font-semibold text-surface-700">Demonstration video coming soon</p>
            <p className="text-xs text-surface-400 max-w-xs">
              Check step-by-step instructions below for proper movement execution.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl bg-surface-950 shadow-sm border border-surface-200/60',
        aspectRatio === '16/9' && 'aspect-video',
        className
      )}
    >
      <video
        ref={videoRef}
        src={currentVideoUrl}
        poster={currentPosterUrl}
        autoPlay={autoPlay && !prefersReducedMotion}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFit === 'cover' ? 'object-cover' : 'object-contain',
          isLoaded ? 'opacity-100' : 'opacity-90'
        )}
        aria-label={`${exerciseName} exercise demonstration`}
      />

      {/* Gender Switcher Badge (Male / Female Demo) */}
      {showGenderToggle && hasMultipleGenders && (
        <div className="absolute top-3 left-3 z-10 flex items-center p-0.5 bg-black/55 backdrop-blur-md rounded-full border border-white/10 text-[11px] font-medium text-white/80 shadow-md">
          <button
            type="button"
            onClick={() => setSelectedGender('male')}
            className={cn(
              'px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold',
              selectedGender === 'male'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-white/70 hover:text-white'
            )}
            aria-label="Show male demonstration"
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => setSelectedGender('female')}
            className={cn(
              'px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold',
              selectedGender === 'female'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-white/70 hover:text-white'
            )}
            aria-label="Show female demonstration"
          >
            Female
          </button>
        </div>
      )}

      {/* Reduced motion or manual play control toggle */}
      {(showControls || prefersReducedMotion) && (
        <button
          type="button"
          onClick={handleTogglePlay}
          className="absolute bottom-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all hover:scale-105"
          aria-label={isPlaying ? 'Pause demonstration video' : 'Play demonstration video'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="translate-x-0.5" />}
        </button>
      )}

      {/* Subtle indicator tag */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-xs text-[10px] text-white/80 px-2 py-0.5 rounded-md">
        Continuous Demo · HD
      </div>
    </div>
  )
}
