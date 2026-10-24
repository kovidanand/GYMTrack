import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, AlertCircle, Loader2, RotateCcw } from 'lucide-react'
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
  const prevSrcRef = useRef<string | undefined>(undefined)

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Update source smoothly on stable <video> element without tearing down DOM
  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentVideoUrl) return

    if (prevSrcRef.current !== currentVideoUrl) {
      prevSrcRef.current = currentVideoUrl
      setHasError(false)
      // Switch source directly without blanking the element
      video.src = currentVideoUrl
      video.preload = 'metadata'
      if (autoPlay && !prefersReducedMotion) {
        const p = video.play()
        if (p !== undefined) {
          p.catch(() => {
            // Autoplay policy or user interaction needed
          })
        }
      }
    }
  }, [currentVideoUrl, autoPlay, prefersReducedMotion])

  // Clean up media resources on unmount so video does not continue playing in background
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

  const handleTogglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [])

  const handleSwitchGender = useCallback((gender: DemoGender) => {
    if (gender === targetGender) return
    // Instant switch without blanking previous frame
    setDemoGender(gender)
  }, [targetGender, setDemoGender])

  const handleRetryPlayback = useCallback(() => {
    const video = videoRef.current
    if (!video || !currentVideoUrl) return
    setHasError(false)
    setIsBuffering(true)
    video.src = currentVideoUrl
    video.load()
    video.play().then(() => {
      setIsBuffering(false)
      setIsPlaying(true)
    }).catch(() => {
      setIsBuffering(false)
    })
  }, [currentVideoUrl])

  // Fallback state when no video URL is available at all
  if (!currentVideoUrl) {
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
      {/* Genuine Error State Overlay with Retry Option */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-surface-900/95 text-white z-20">
          <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
          <p className="text-sm font-bold text-white mb-1">Demonstration video playback interrupted</p>
          <p className="text-xs text-surface-300 max-w-xs mb-4">
            Could not stream demonstration video. Check your connection or tap retry.
          </p>
          <button
            type="button"
            onClick={handleRetryPlayback}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            aria-label="Retry video playback"
          >
            <RotateCcw size={14} />
            <span>Retry Playback</span>
          </button>
        </div>
      ) : null}

      {/* Stable Video Element (no unstable key so DOM node is never needlessly recreated) */}
      <video
        ref={videoRef}
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
        onCanPlay={() => {
          setIsBuffering(false)
        }}
        onWaiting={() => {
          // Allow natural recovery without resetting currentTime or calling load()
          setIsBuffering(true)
        }}
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none z-10">
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
                  ? 'bg-brand-500 text-white shadow-xs font-bold'
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
                  ? 'bg-brand-500 text-white shadow-xs font-bold'
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
      {(showControls || prefersReducedMotion) && !hasError && (
        <button
          type="button"
          onClick={handleTogglePlay}
          className="absolute bottom-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
          aria-label={isPlaying ? 'Pause demonstration video' : 'Play demonstration video'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="translate-x-0.5" />}
        </button>
      )}
    </div>
  )
}
