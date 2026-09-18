import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PeriodComparison } from '@/hooks/useProgress'

interface PeriodComparisonProps {
  comparison: PeriodComparison
  timeRange: '7d' | '30d'
}

function PctChange({ pct }: { pct: number | null }) {
  if (pct === null) return null
  const isPositive = pct > 0
  const isNeutral = pct === 0
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg border',
      isNeutral ? 'bg-[#1A202B] text-surface-400 border-[#242D3C]' :
      isPositive ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-red-500/15 text-red-300 border-red-500/30'
    )}>
      {isNeutral ? <Minus size={11} /> : isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {isNeutral ? 'No change' : `${isPositive ? '+' : ''}${pct}%`}
    </span>
  )
}

export function PeriodComparison({ comparison, timeRange }: PeriodComparisonProps) {
  const periodLabel = timeRange === '7d' ? '7 days' : '30 days'
  const prevLabel = `Previous ${periodLabel}`

  if (!comparison.hasPreviousData) {
    return (
      <div className="card p-5 bg-[#151A23] border border-[#202733] rounded-2xl shadow-card">
        <p className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">Period Comparison</p>
        <p className="text-sm text-surface-400 font-medium">
          Not enough previous data for comparison. Keep logging workouts to unlock period-over-period insights.
        </p>
      </div>
    )
  }

  const metrics = [
    {
      label: 'Total Volume',
      current: `${comparison.currentVolume > 0 ? (comparison.currentVolume / 1000).toFixed(1) : '0'} k kg`,
      previous: `${comparison.previousVolume > 0 ? (comparison.previousVolume / 1000).toFixed(1) : '0'} k kg`,
      pct: comparison.volumePctChange,
    },
    {
      label: 'Training Sessions',
      current: String(comparison.currentSessions),
      previous: String(comparison.previousSessions),
      pct: comparison.sessionsPctChange,
    },
  ]

  return (
    <div className="card p-5 sm:p-6 bg-[#151A23] border border-[#202733] rounded-2xl shadow-card space-y-4">
      <p className="text-xs font-black uppercase tracking-wider text-surface-400">Period Comparison</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {metrics.map(m => (
          <div
            key={m.label}
            className="p-4 rounded-xl bg-[#11151D] border border-[#1F2633] space-y-2"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400">{m.label}</p>

            <div className="flex items-end gap-2 flex-wrap">
              <span className="text-2xl font-black text-white tracking-tight">{m.current}</span>
              <PctChange pct={m.pct} />
            </div>

            <p className="text-xs text-surface-400">
              <span className="font-semibold text-surface-300">{prevLabel}:</span> {m.previous}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
