import React, { useState } from 'react'
import { Droplet, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { WaterEntry } from '@/types/nutrition'

interface WaterTrackerCardProps {
  entries: WaterEntry[]
  targetMl: number
  onAddWater: (amountMl: number) => Promise<void>
  onDeleteWater: (id: string) => Promise<void>
}

export function WaterTrackerCard({
  entries,
  targetMl,
  onAddWater,
  onDeleteWater,
}: WaterTrackerCardProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalConsumed = entries.reduce((acc, curr) => acc + curr.amount_ml, 0)
  const remaining = Math.max(0, targetMl - totalConsumed)
  const percent = targetMl > 0 ? Math.min(100, Math.round((totalConsumed / targetMl) * 100)) : 0

  const handleQuickAdd = async (amount: number) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onAddWater(amount)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(customAmount, 10)
    if (isNaN(val) || val <= 0 || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAddWater(val)
      setCustomAmount('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card p-4 sm:p-5 bg-white border border-surface-200 rounded-2xl shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
            <Droplet size={18} className="fill-cyan-500 stroke-cyan-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-surface-900 tracking-tight leading-none">
              Water Tracker
            </h3>
            <p className="text-xs text-surface-500 font-medium mt-0.5">
              Target: {(targetMl / 1000).toFixed(1)} L ({targetMl} ml)
            </p>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-black text-cyan-600 leading-none">
            {(totalConsumed / 1000).toFixed(2)} L
          </span>
          <span className="text-xs text-surface-500 font-semibold">
            ({totalConsumed} ml logged)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-cyan-50 rounded-full h-2.5 overflow-hidden border border-cyan-100">
        <div
          className="bg-cyan-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] font-semibold text-surface-500 mt-1.5 mb-3">
        <span>{percent}% of daily goal</span>
        <span>{remaining > 0 ? `${remaining} ml left` : 'Goal reached! 🎉'}</span>
      </div>

      {/* Quick Add Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        <button
          onClick={() => handleQuickAdd(250)}
          disabled={isSubmitting}
          id="water-add-250"
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors disabled:opacity-50"
        >
          <Plus size={14} />
          <span>250 ml (Glass)</span>
        </button>

        <button
          onClick={() => handleQuickAdd(500)}
          disabled={isSubmitting}
          id="water-add-500"
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors disabled:opacity-50"
        >
          <Plus size={14} />
          <span>500 ml (Bottle)</span>
        </button>

        <button
          onClick={() => handleQuickAdd(750)}
          disabled={isSubmitting}
          id="water-add-750"
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors disabled:opacity-50"
        >
          <Plus size={14} />
          <span>750 ml</span>
        </button>

        <button
          onClick={() => handleQuickAdd(1000)}
          disabled={isSubmitting}
          id="water-add-1000"
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors disabled:opacity-50"
        >
          <Plus size={14} />
          <span>1000 ml (1 L)</span>
        </button>
      </div>

      {/* Custom Input Form + Toggle History */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-100">
        <form onSubmit={handleCustomAdd} className="flex items-center gap-2">
          <input
            type="number"
            min="10"
            max="3000"
            step="10"
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
            placeholder="Custom ml..."
            className="input-base text-xs py-1 px-2.5 w-28 rounded-lg"
          />
          <button
            type="submit"
            disabled={!customAmount || isSubmitting}
            className="btn-secondary text-xs py-1 px-3 rounded-lg"
          >
            Add
          </button>
        </form>

        {entries.length > 0 && (
          <button
            onClick={() => setShowHistory(prev => !prev)}
            className="text-xs font-semibold text-surface-500 hover:text-surface-800 flex items-center gap-1"
          >
            <span>{entries.length} {entries.length === 1 ? 'log' : 'logs'}</span>
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Collapsible History of Water Logs */}
      {showHistory && entries.length > 0 && (
        <div className="mt-3 pt-2 border-t border-surface-100 space-y-1.5 max-h-40 overflow-y-auto">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-surface-50 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-surface-800">{entry.amount_ml} ml</span>
                <span className="text-[10px] text-surface-400">
                  {new Date(entry.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <button
                onClick={() => onDeleteWater(entry.id)}
                className="text-surface-400 hover:text-red-500 transition-colors p-1"
                title="Remove entry"
                aria-label="Remove water entry"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
