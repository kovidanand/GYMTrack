import { useState, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Timer as TimerIcon, Play, Pause, RotateCcw, X, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkoutTimerModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

type TimerTab = 'stopwatch' | 'rest'

export function WorkoutTimerModal({ isOpen, onOpenChange }: WorkoutTimerModalProps) {
  const [activeTab, setActiveTab] = useState<TimerTab>('stopwatch')

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

  // ── Rest Timer State ──
  const [timerDurationSec, setTimerDurationSec] = useState(60)
  const [timerRemainingSec, setTimerRemainingSec] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
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
    setShowCustomInput(false)
    setTimerDurationSec(sec)
    setTimerRemainingSec(sec)
    setIsTimerRunning(true)
  }

  const handleApplyCustom = () => {
    const val = parseInt(customInput, 10)
    if (!isNaN(val) && val > 0) {
      setTimerDurationSec(val)
      setTimerRemainingSec(val)
      setIsTimerRunning(true)
      setShowCustomInput(false)
      setCustomInput('')
    }
  }

  const handleResetTimer = () => {
    setIsTimerRunning(false)
    setTimerRemainingSec(timerDurationSec)
  }

  // Format stopwatch: HH:MM:SS
  const formatStopwatch = (ms: number) => {
    const totalSec = Math.floor(ms / 1000)
    const hours = Math.floor(totalSec / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // Format rest countdown: MM:SS
  const formatTimer = (sec: number) => {
    const minutes = Math.floor(sec / 60)
    const seconds = sec % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 sm:top-1/2 sm:bottom-auto left-1/2 -translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[94vw] max-w-sm bg-[#151A23] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-[#202733] z-50 animate-slide-up sm:animate-scale-in focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#202733]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-950/60 text-brand-400 border border-brand-800/40 flex items-center justify-center">
                <TimerIcon size={18} />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-white leading-none">
                  Training Timer
                </Dialog.Title>
                <p className="text-[11px] text-surface-400 mt-0.5">Stopwatch & Rest Countdown</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                aria-label="Close timer panel"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Navigation Tabs: Stopwatch & Rest Timer */}
          <div className="flex bg-[#0D1017] p-1 rounded-xl mt-4 mb-5 border border-[#202733]">
            <button
              onClick={() => setActiveTab('stopwatch')}
              id="timer-tab-stopwatch"
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === 'stopwatch'
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-surface-400 hover:text-white"
              )}
            >
              <Clock size={13} />
              Stopwatch
            </button>
            <button
              onClick={() => setActiveTab('rest')}
              id="timer-tab-rest"
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === 'rest'
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-surface-400 hover:text-white"
              )}
            >
              <Zap size={13} />
              Rest Timer
            </button>
          </div>

          {/* ── STOPWATCH ── */}
          {activeTab === 'stopwatch' && (
            <div className="space-y-4 text-center py-1">
              <div className="py-4">
                <div className="text-5xl font-extrabold font-mono tracking-tight text-white">
                  {formatStopwatch(stopwatchMs)}
                </div>
                <p className="text-[11px] text-surface-400 mt-1 font-medium">Hours : Minutes : Seconds</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                  id="stopwatch-toggle-btn"
                  className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {isStopwatchRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isStopwatchRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={handleResetStopwatch}
                  id="stopwatch-reset-btn"
                  className="btn-secondary py-2.5 px-4 text-sm"
                  title="Reset Stopwatch"
                  aria-label="Reset Stopwatch"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── REST TIMER ── */}
          {activeTab === 'rest' && (
            <div className="space-y-4 text-center py-1">
              <div className="py-3">
                <div className="text-5xl font-extrabold font-mono tracking-tight text-white">
                  {formatTimer(timerRemainingSec)}
                </div>
                {timerRemainingSec === 0 ? (
                  <p className="text-xs text-emerald-400 font-bold mt-1">✓ Rest complete! Next set ready.</p>
                ) : isTimerRunning ? (
                  <p className="text-xs text-brand-400 font-medium mt-1 animate-pulse">Rest interval running...</p>
                ) : (
                  <p className="text-[11px] text-surface-400 mt-1">Select interval or start</p>
                )}
              </div>

              {/* Presets: 30 sec, 60 sec, 90 sec, 120 sec, Custom */}
              <div className="grid grid-cols-5 gap-1.5">
                {[30, 60, 90, 120].map(sec => (
                  <button
                    key={sec}
                    onClick={() => handleStartPreset(sec)}
                    className={cn(
                      "py-2 px-1 rounded-xl text-xs font-bold transition-all border",
                      timerDurationSec === sec && isTimerRunning
                        ? "bg-brand-600 text-white border-brand-500 shadow-sm"
                        : "bg-[#11151D] hover:bg-[#1A202B] border-[#202733] text-surface-300 hover:text-white"
                    )}
                  >
                    {sec}s
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className={cn(
                    "py-2 px-1 rounded-xl text-xs font-bold transition-all border",
                    showCustomInput
                      ? "bg-surface-800 text-white border-surface-600"
                      : "bg-[#11151D] hover:bg-[#1A202B] border-[#202733] text-surface-400 hover:text-white"
                  )}
                >
                  Custom
                </button>
              </div>

              {/* Custom Duration Input */}
              {showCustomInput && (
                <div className="flex items-center gap-2 pt-1 animate-fade-in">
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Seconds (e.g. 45)"
                    className="input-base text-xs py-1.5 flex-1 bg-[#080A0F] text-white border-[#202733]"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCustom()}
                  />
                  <button
                    onClick={handleApplyCustom}
                    className="btn-primary py-1.5 px-3 text-xs"
                  >
                    Set
                  </button>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  id="rest-timer-toggle-btn"
                  className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={handleResetTimer}
                  id="rest-timer-reset-btn"
                  className="btn-secondary py-2.5 px-4 text-sm"
                  title="Reset Timer"
                  aria-label="Reset Timer"
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
