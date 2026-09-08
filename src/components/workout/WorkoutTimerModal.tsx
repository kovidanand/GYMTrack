import { useState, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Timer as TimerIcon, Play, Pause, RotateCcw, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkoutTimerModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

type TimerTab = 'stopwatch' | 'timer' | 'rest'

export function WorkoutTimerModal({ isOpen, onOpenChange }: WorkoutTimerModalProps) {
  const [activeTab, setActiveTab] = useState<TimerTab>('rest')

  // ── Stopwatch State ──
  const [stopwatchMs, setStopwatchMs] = useState(0)
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false)
  const stopwatchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isStopwatchRunning) {
      const start = Date.now() - stopwatchMs
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchMs(Date.now() - start)
      }, 50)
    } else if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current)
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current)
    }
  }, [isStopwatchRunning])

  const handleResetStopwatch = () => {
    setIsStopwatchRunning(false)
    setStopwatchMs(0)
  }

  // ── Countdown Timer State ──
  const [timerDurationSec, setTimerDurationSec] = useState(60)
  const [timerRemainingSec, setTimerRemainingSec] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemainingSec(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([200, 100, 200])
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
  }, [isTimerRunning])

  const handleStartPreset = (sec: number) => {
    setTimerDurationSec(sec)
    setTimerRemainingSec(sec)
    setIsTimerRunning(true)
  }

  const handleResetTimer = () => {
    setIsTimerRunning(false)
    setTimerRemainingSec(timerDurationSec)
  }

  // Format stopwatch: MM:SS.s
  const formatStopwatch = (ms: number) => {
    const totalSec = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSec / 60)
    const seconds = totalSec % 60
    const tenths = Math.floor((ms % 1000) / 100)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`
  }

  // Format countdown: MM:SS
  const formatTimer = (sec: number) => {
    const minutes = Math.floor(sec / 60)
    const seconds = sec % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 sm:top-1/2 sm:bottom-auto left-1/2 -translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[94vw] max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-surface-200 z-50 animate-slide-up sm:animate-scale-in focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <TimerIcon size={18} />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-surface-900 leading-none">
                  Workout Clock
                </Dialog.Title>
                <p className="text-[11px] text-surface-500 mt-0.5">Stopwatch & Rest Interval Timer</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                aria-label="Close timer modal"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-surface-100 p-1 rounded-xl mt-4 mb-5">
            <button
              onClick={() => setActiveTab('rest')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === 'rest'
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-surface-500 hover:text-surface-800"
              )}
            >
              <Zap size={13} />
              Rest Presets
            </button>
            <button
              onClick={() => setActiveTab('stopwatch')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === 'stopwatch'
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-surface-500 hover:text-surface-800"
              )}
            >
              Stopwatch
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === 'timer'
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-surface-500 hover:text-surface-800"
              )}
            >
              Countdown
            </button>
          </div>

          {/* ── TAB: REST PRESETS ── */}
          {activeTab === 'rest' && (
            <div className="space-y-4 text-center">
              <div className="py-4">
                <div className="text-5xl font-extrabold font-mono tracking-tight text-surface-900">
                  {formatTimer(timerRemainingSec)}
                </div>
                {isTimerRunning && (
                  <p className="text-xs text-brand-600 font-medium mt-1 animate-pulse">
                    Rest timer active...
                  </p>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 90, 120].map(sec => (
                  <button
                    key={sec}
                    onClick={() => handleStartPreset(sec)}
                    className={cn(
                      "py-2.5 px-1 rounded-xl text-xs font-bold transition-all border",
                      timerDurationSec === sec && isTimerRunning
                        ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                        : "bg-surface-50 hover:bg-brand-50 border-surface-200 text-surface-800"
                    )}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={handleResetTimer}
                  className="btn-secondary py-2.5 px-4 text-sm"
                  title="Reset"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: STOPWATCH ── */}
          {activeTab === 'stopwatch' && (
            <div className="space-y-4 text-center">
              <div className="py-4">
                <div className="text-5xl font-extrabold font-mono tracking-tight text-surface-900">
                  {formatStopwatch(stopwatchMs)}
                </div>
                <p className="text-xs text-surface-400 mt-1 font-medium">Minutes : Seconds . Tenths</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                  className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {isStopwatchRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isStopwatchRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={handleResetStopwatch}
                  className="btn-secondary py-2.5 px-4 text-sm"
                  title="Reset"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: COUNTDOWN TIMER ── */}
          {activeTab === 'timer' && (
            <div className="space-y-4 text-center">
              <div className="py-4">
                <div className="text-5xl font-extrabold font-mono tracking-tight text-surface-900">
                  {formatTimer(timerRemainingSec)}
                </div>
                {timerRemainingSec === 0 && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">Time is up!</p>
                )}
              </div>

              {/* Set Duration Steppers */}
              {!isTimerRunning && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-surface-600">
                  <button
                    onClick={() => {
                      const next = Math.max(15, timerRemainingSec - 15)
                      setTimerDurationSec(next)
                      setTimerRemainingSec(next)
                    }}
                    className="px-2.5 py-1 bg-surface-100 hover:bg-surface-200 rounded-lg text-surface-700"
                  >
                    -15s
                  </button>
                  <button
                    onClick={() => {
                      const next = Math.max(60, timerRemainingSec - 60)
                      setTimerDurationSec(next)
                      setTimerRemainingSec(next)
                    }}
                    className="px-2.5 py-1 bg-surface-100 hover:bg-surface-200 rounded-lg text-surface-700"
                  >
                    -1m
                  </button>
                  <span className="text-surface-400 font-mono">|</span>
                  <button
                    onClick={() => {
                      const next = timerRemainingSec + 15
                      setTimerDurationSec(next)
                      setTimerRemainingSec(next)
                    }}
                    className="px-2.5 py-1 bg-surface-100 hover:bg-surface-200 rounded-lg text-surface-700"
                  >
                    +15s
                  </button>
                  <button
                    onClick={() => {
                      const next = timerRemainingSec + 60
                      setTimerDurationSec(next)
                      setTimerRemainingSec(next)
                    }}
                    className="px-2.5 py-1 bg-surface-100 hover:bg-surface-200 rounded-lg text-surface-700"
                  >
                    +1m
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={handleResetTimer}
                  className="btn-secondary py-2.5 px-4 text-sm"
                  title="Reset"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
