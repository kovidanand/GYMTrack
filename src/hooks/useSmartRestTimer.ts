import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'gymtrack_rest_duration'

export function useSmartRestTimer() {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [selectedDuration, setSelectedDuration] = useState(90)
  const [isComplete, setIsComplete] = useState(false)
  
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load default from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const val = parseInt(stored, 10)
        if (!isNaN(val) && val > 0) {
          setSelectedDuration(val)
        }
      }
    } catch (e) {
      console.warn('Could not read rest duration from localStorage', e)
    }
  }, [])

  // Timer tick logic
  useEffect(() => {
    if (isActive && !isPaused && remainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
            setIsComplete(true)
            setIsActive(false)
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try {
                navigator.vibrate([200, 100, 200])
              } catch (e) {
                // ignore
              }
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [isActive, isPaused, remainingSeconds])

  const setDuration = useCallback((seconds: number) => {
    setSelectedDuration(seconds)
    try {
      localStorage.setItem(STORAGE_KEY, seconds.toString())
    } catch (e) {
      console.warn('Could not save rest duration to localStorage', e)
    }
  }, [])

  const start = useCallback((seconds?: number) => {
    const dur = seconds || selectedDuration
    setRemainingSeconds(dur)
    setIsActive(true)
    setIsPaused(false)
    setIsComplete(false)
  }, [selectedDuration])

  const pause = useCallback(() => setIsPaused(true), [])
  
  const resume = useCallback(() => setIsPaused(false), [])

  const addTime = useCallback((seconds: number) => {
    setRemainingSeconds(prev => prev + seconds)
  }, [])

  const skip = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    setIsComplete(false)
    setRemainingSeconds(0)
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
  }, [])

  const close = useCallback(() => {
    setIsComplete(false)
    setIsActive(false)
  }, [])

  return {
    isActive,
    isPaused,
    remainingSeconds,
    selectedDuration,
    isComplete,
    setDuration,
    start,
    pause,
    resume,
    addTime,
    skip,
    close
  }
}
