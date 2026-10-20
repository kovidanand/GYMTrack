import { useState, useEffect, useRef } from 'react'
import { Play, Pause, AlertCircle, Loader2 } from 'lucide-react'
import type { ExerciseMedia } from '@/types'
import { cn } from '@/lib/utils'
import { useExerciseDemo, type DemoGender } from '@/context/ExerciseDemoContext'

interface ExerciseVideoPlayerProps {
  media?: ExerciseMedia | null
  exerciseName: string
  className?: string
  aspectRatio?: '16/9' | '4/3' | 'square' | 'auto'
  autoPlay?: boolean
  showControls?: boolean
  showGenderToggle?: boolean
  objectFit?: 'cover' | 'contain'
  preferredGender?: DemoGender
}

export function ExerciseVideoPlayer({
  media,
  exerciseName,
  className = '',
  aspectRatio = '16/9',
  autoPlay = true,
  showControls = false,
  showGenderToggle = true,
  objectFit = 'cover',
  preferredGender,
}: ExerciseVideoPlayerProps) {
  const { demoGender, setDemoGender, resolveDemoVideo } = useExerciseDemo()
  const targetGender = preferredGender || demoGender

  const resolved = resolveDemoVideo(media, targetGender)
  const currentVideoUrl = resolved.videoUrl
  const currentPosterUrl = resolved.posterUrl
  const isFallback = resolved.isFallback
  const activeGender = resolved.activeGender

  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [hasError, setHasError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Reset error & load state when video source changes
  useEffect(() => {
    setHasError(false)
    setIsLoaded(false)
    setIsBuffering(true)
  }, [currentVideoUrl])

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

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

  const handleSwitchGender = (gender: DemoGender) => {
    if (gender === targetGender) return
    setIsLoaded(false)
    setDemoGender(gender)
  }

  // Fallback state when no video is available or error loading
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
            <p className="text-sm font-semibold text-surface-700">Exercise demonstration unavailable</p>
            <p className="text-xs text-surface-400 max-w-xs">
              Refer to the step-by-step form cues and instructions below for proper movement execution.
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
        key={currentVideoUrl}
        src={currentVideoUrl}
        poster={currentPosterUrl}
        autoPlay={autoPlay && !prefersReducedMotion}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => {
          setIsLoaded(true)
          setIsBuffering(false)
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false)
          setIsPlaying(true)
        }}
        onError={() => {
          setHasError(true)
          setIsBuffering(false)
        }}
        onPause={() => setIsPlaying(false)}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFit === 'cover' ? 'object-cover' : 'object-contain',
          isLoaded ? 'opacity-100' : 'opacity-90'
        )}
        aria-label={`${exerciseName} ${activeGender} exercise demonstration`}
      />

      {/* Buffering Spinner */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-10">
          <Loader2 className="w-7 h-7 text-white/90 animate-spin" />
        </div>
      )}

      {/* Top Left: Gender Switcher Badge (Male / Female Demo) */}
      {showGenderToggle && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center p-0.5 bg-black/60 backdrop-blur-md rounded-full border border-white/15 text-[11px] font-medium text-white/90 shadow-md">
            <button
              type="button"
              onClick={() => handleSwitchGender('male')}
              id={`video-toggle-male-${exerciseName.replace(/\s+/g, '-').toLowerCase()}`}
              className={cn(
                'px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold',
                activeGender === 'male'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-white/70 hover:text-white'
              )}
              aria-label="Show male demonstration"
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGender('female')}
              id={`video-toggle-female-${exerciseName.replace(/\s+/g, '-').toLowerCase()}`}
              className={cn(
                'px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold',
                activeGender === 'female'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-white/70 hover:text-white'
              )}
              aria-label="Show female demonstration"
            >
              Female
            </button>
          </div>

          {/* Graceful Fallback Notice Pill */}
          {isFallback && resolved.fallbackMessage && (
            <span className="text-[10px] font-medium bg-black/70 backdrop-blur-md text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30 shadow-xs">
              Showing {activeGender} variant
            </span>
          )}
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
    </div>
  )
}
