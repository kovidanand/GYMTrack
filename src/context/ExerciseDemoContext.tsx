import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { ExerciseMedia } from '@/types'

export type DemoGender = 'male' | 'female'

export interface ResolvedExerciseDemo {
  videoUrl?: string
  posterUrl?: string
  activeGender: DemoGender
  isFallback: boolean
  hasAlternative: boolean
  fallbackMessage?: string
}

export interface ExerciseDemoContextType {
  demoGender: DemoGender
  profileDefaultGender: DemoGender
  isManualOverride: boolean
  setDemoGender: (gender: DemoGender) => void
  resetToProfileDefault: () => void
  resolveDemoVideo: (
    media?: ExerciseMedia | null,
    explicitGender?: DemoGender
  ) => ResolvedExerciseDemo
}

const STORAGE_KEY = 'gymtrack_demo_gender_pref'
const OVERRIDE_KEY = 'gymtrack_demo_manual_override'

const ExerciseDemoContext = createContext<ExerciseDemoContextType | undefined>(undefined)

export function ExerciseDemoProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()

  // Derive profile default gender strictly from Biological / Metabolic Sex
  const profileDefaultGender: DemoGender = useMemo(() => {
    const rawSex = (profile?.sex || '').toLowerCase().trim()
    if (rawSex === 'female') return 'female'
    if (rawSex === 'male') return 'male'

    // If profile sex is not set, check cached preference or fallback to 'male'
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached === 'female' || cached === 'male') {
        return cached as DemoGender
      }
    } catch {
      /* ignore storage errors */
    }
    return 'male'
  }, [profile?.sex])

  // Track session-level manual override
  const [manualOverride, setManualOverride] = useState<DemoGender | null>(() => {
    try {
      const saved = sessionStorage.getItem(OVERRIDE_KEY)
      if (saved === 'female' || saved === 'male') {
        return saved as DemoGender
      }
    } catch {
      /* ignore storage errors */
    }
    return null
  })

  // When profile sex changes/saves, update stored baseline
  useEffect(() => {
    const rawSex = (profile?.sex || '').toLowerCase().trim()
    if (rawSex === 'female' || rawSex === 'male') {
      try {
        localStorage.setItem(STORAGE_KEY, rawSex)
      } catch {
        /* ignore storage errors */
      }
    }
  }, [profile?.sex])

  // Listen for gymtrack:profile_updated event to sync immediately without reload
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ sex?: string | null }>
      const newSex = (customEvent.detail?.sex || '').toLowerCase().trim()
      if (newSex === 'female' || newSex === 'male') {
        try {
          localStorage.setItem(STORAGE_KEY, newSex)
          // Profile change updates the preference and resets manual override so user's explicit profile change takes effect
          setManualOverride(null)
          sessionStorage.removeItem(OVERRIDE_KEY)
        } catch {
          /* ignore storage errors */
        }
      }
    }

    window.addEventListener('gymtrack:profile_updated', handleProfileUpdate)
    return () => window.removeEventListener('gymtrack:profile_updated', handleProfileUpdate)
  }, [])

  // Active gender: manual override takes precedence for the current session/interaction, else profile default
  const demoGender: DemoGender = manualOverride ?? profileDefaultGender

  const setDemoGender = useCallback((gender: DemoGender) => {
    setManualOverride(gender)
    try {
      sessionStorage.setItem(OVERRIDE_KEY, gender)
      localStorage.setItem(STORAGE_KEY, gender)
    } catch {
      /* ignore storage errors */
    }
  }, [])

  const resetToProfileDefault = useCallback(() => {
    setManualOverride(null)
    try {
      sessionStorage.removeItem(OVERRIDE_KEY)
    } catch {
      /* ignore storage errors */
    }
  }, [])

  const resolveDemoVideo = useCallback(
    (media?: ExerciseMedia | null, explicitGender?: DemoGender): ResolvedExerciseDemo => {
      const targetGender = explicitGender || demoGender

      if (!media) {
        return {
          videoUrl: undefined,
          posterUrl: undefined,
          activeGender: targetGender,
          isFallback: false,
          hasAlternative: false,
        }
      }

      const hasMale = Boolean(media.maleVideoUrl)
      const hasFemale = Boolean(media.femaleVideoUrl)

      if (targetGender === 'female') {
        if (hasFemale && media.femaleVideoUrl) {
          return {
            videoUrl: media.femaleVideoUrl,
            posterUrl: media.thumbnailUrl || media.posterUrl,
            activeGender: 'female',
            isFallback: false,
            hasAlternative: hasMale,
          }
        }
        if (hasMale && (media.maleVideoUrl || media.videoUrl)) {
          return {
            videoUrl: media.maleVideoUrl || media.videoUrl,
            posterUrl: media.posterUrl || media.thumbnailUrl,
            activeGender: 'male',
            isFallback: true,
            hasAlternative: false,
            fallbackMessage: 'Female demonstration unavailable; showing verified male demonstration.',
          }
        }
      } else {
        // Target is male
        if (hasMale && media.maleVideoUrl) {
          return {
            videoUrl: media.maleVideoUrl,
            posterUrl: media.posterUrl || media.thumbnailUrl,
            activeGender: 'male',
            isFallback: false,
            hasAlternative: hasFemale,
          }
        }
        if (hasFemale && (media.femaleVideoUrl || media.videoUrl)) {
          return {
            videoUrl: media.femaleVideoUrl || media.videoUrl,
            posterUrl: media.thumbnailUrl || media.posterUrl,
            activeGender: 'female',
            isFallback: true,
            hasAlternative: false,
            fallbackMessage: 'Male demonstration unavailable; showing verified female demonstration.',
          }
        }
      }

      // Generic fallback (videoUrl / posterUrl)
      const genericVideo = media.videoUrl || media.maleVideoUrl || media.femaleVideoUrl
      const genericPoster = media.posterUrl || media.thumbnailUrl

      return {
        videoUrl: genericVideo,
        posterUrl: genericPoster,
        activeGender: targetGender,
        isFallback: false,
        hasAlternative: false,
      }
    },
    [demoGender]
  )

  const value = useMemo<ExerciseDemoContextType>(
    () => ({
      demoGender,
      profileDefaultGender,
      isManualOverride: manualOverride !== null,
      setDemoGender,
      resetToProfileDefault,
      resolveDemoVideo,
    }),
    [demoGender, profileDefaultGender, manualOverride, setDemoGender, resetToProfileDefault, resolveDemoVideo]
  )

  return (
    <ExerciseDemoContext.Provider value={value}>
      {children}
    </ExerciseDemoContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExerciseDemo(): ExerciseDemoContextType {
  const context = useContext(ExerciseDemoContext)
  if (!context) {
    // Sensible fallback if used outside provider (e.g. testing)
    return {
      demoGender: 'male',
      profileDefaultGender: 'male',
      isManualOverride: false,
      setDemoGender: () => {},
      resetToProfileDefault: () => {},
      resolveDemoVideo: (media) => ({
        videoUrl: media?.videoUrl || media?.maleVideoUrl || media?.femaleVideoUrl,
        posterUrl: media?.posterUrl || media?.thumbnailUrl,
        activeGender: 'male',
        isFallback: false,
        hasAlternative: Boolean(media?.maleVideoUrl && media?.femaleVideoUrl),
      }),
    }
  }
  return context
}
