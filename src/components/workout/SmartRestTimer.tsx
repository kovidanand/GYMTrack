import React, { useState } from 'react'
import { Timer, Pause, Play, FastForward, Plus, CheckCircle2, ChevronUp, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { useSmartRestTimer } from '@/hooks/useSmartRestTimer'

interface SmartRestTimerProps {
  timer: ReturnType<typeof useSmartRestTimer>
}

const PRESETS = [30, 60, 90, 120, 180]

export function SmartRestTimer({ timer }: SmartRestTimerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customInput, setCustomInput] = useState('')

  if (!timer.isActive && !timer.isComplete) return null

  // Format MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Completion state
  if (timer.isComplete) {
    return (
      <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-emerald-600 text-white p-3 rounded-2xl shadow-xl z-50 flex items-center justify-between animate-fade-in border border-emerald-500">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={24} className="text-emerald-200" />
          <span className="font-bold text-sm tracking-wide">REST COMPLETE</span>
        </div>
        <button 
          onClick={timer.close}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-700/50 hover:bg-emerald-700 transition-colors"
          aria-label="Dismiss timer"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  const handleApplyCustom = () => {
    const val = parseInt(customInput, 10)
    if (!isNaN(val) && val > 0) {
      timer.setDuration(val)
      timer.start(val)
      setShowCustom(false)
      setIsExpanded(false)
    }
  }

  return (
    <div className={cn(
      "fixed left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-surface-900 text-white rounded-2xl shadow-2xl z-50 border border-surface-700 overflow-hidden transition-all duration-300 ease-in-out",
      isExpanded ? "bottom-20 sm:bottom-24" : "bottom-20 sm:bottom-24"
    )}>
      {/* ── Main Compact View ── */}
      <div className="p-3 px-4 flex items-center justify-between relative">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group flex-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center group-hover:bg-surface-700 transition-colors">
            <Timer size={20} className={timer.isPaused ? "text-surface-400" : "text-brand-400 animate-pulse"} />
          </div>
          <div>
            <div className="text-2xl font-black font-mono tracking-tighter leading-none">
              {formatTime(timer.remainingSeconds)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-surface-400 flex items-center gap-1">
              Resting
              {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={timer.isPaused ? timer.resume : timer.pause}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-800 hover:bg-surface-700 transition-colors text-white"
            aria-label={timer.isPaused ? "Resume Timer" : "Pause Timer"}
          >
            {timer.isPaused ? <Play size={18} className="ml-0.5" /> : <Pause size={18} />}
          </button>
          
          {/* Skip */}
          <button
            onClick={timer.skip}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-800 hover:bg-surface-700 transition-colors text-surface-400 hover:text-white"
            aria-label="Skip Timer"
          >
            <FastForward size={16} />
          </button>
        </div>
        
        {/* Progress bar line at the bottom of compact view */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-brand-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(timer.remainingSeconds / timer.selectedDuration) * 100}%` }}
        />
      </div>

      {/* ── Expanded Controls (Presets & +30s) ── */}
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-surface-800 bg-surface-950/50 animate-slide-up">
          <div className="flex items-center justify-between mt-3 mb-2 px-1">
            <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Rest Duration</span>
            <button
              onClick={() => timer.addTime(30)}
              className="text-[11px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 bg-brand-900/30 px-2 py-1 rounded-md transition-colors"
            >
              <Plus size={12} /> 30s
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {PRESETS.map(sec => (
              <button
                key={sec}
                onClick={() => {
                  timer.setDuration(sec)
                  timer.start(sec)
                  setIsExpanded(false)
                }}
                className={cn(
                  "py-2 text-[11px] font-bold rounded-lg transition-colors border",
                  timer.selectedDuration === sec
                    ? "bg-brand-600 border-brand-500 text-white"
                    : "bg-surface-800 border-surface-700 text-surface-300 hover:bg-surface-700"
                )}
              >
                {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!showCustom ? (
              <button
                onClick={() => setShowCustom(true)}
                className="flex-1 py-2 text-[11px] font-bold rounded-lg bg-surface-800 border border-surface-700 text-surface-400 hover:text-surface-300 hover:bg-surface-700 transition-colors"
              >
                Custom Time
              </button>
            ) : (
              <div className="flex-1 flex gap-1.5">
                <input
                  type="number"
                  min="5"
                  max="600"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Secs (e.g. 45)"
                  className="flex-1 min-w-0 bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCustom()}
                />
                <button
                  onClick={handleApplyCustom}
                  className="bg-brand-600 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold hover:bg-brand-500 transition-colors"
                >
                  Set
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
