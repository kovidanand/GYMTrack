import { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import type { ExerciseProgressionPoint } from '@/types'

interface ExerciseProgressionGraphProps {
  points: ExerciseProgressionPoint[]
  isBodyweightOrTimed: boolean
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data'
  trendPercentage: number | null
}

export function ExerciseProgressionGraph({
  points,
  isBodyweightOrTimed,
  trend,
  trendPercentage
}: ExerciseProgressionGraphProps) {
  const [metric, setMetric] = useState<'1rm' | 'weight'>('1rm')

  // Prepare chart data based on active metric
  const chartData = points.map(p => {
    let value: number | null = null
    if (isBodyweightOrTimed) {
      value = metric === '1rm' ? p.totalReps : p.volume
    } else {
      value = metric === '1rm' ? p.estimated1RM : p.maxWeight
    }

    return {
      date: p.date,
      value: value ?? 0,
      isPR: p.isPR,
      unit: isBodyweightOrTimed ? (metric === '1rm' ? 'reps' : 'vol') : 'kg'
    }
  }).filter(d => d.value > 0)

  const renderTrendBadge = () => {
    switch (trend) {
      case 'improving':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp size={14} />
            {trendPercentage != null ? `+${trendPercentage}% Improving` : 'Improving'}
          </span>
        )
      case 'declining':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <TrendingDown size={14} />
            {trendPercentage != null ? `${trendPercentage}% Lower` : 'Declining'}
          </span>
        )
      case 'stable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Minus size={14} />
            Stable
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-600">
            <Info size={13} />
            Need 2+ workouts for trend
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Graph Header & Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-bold text-surface-900">Progression Curve</h4>
          {renderTrendBadge()}
        </div>

        {/* Metric Toggle */}
        <div className="flex bg-surface-100 p-1 rounded-lg self-start sm:self-auto">
          {!isBodyweightOrTimed ? (
            <>
              <button
                type="button"
                onClick={() => setMetric('1rm')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  metric === '1rm'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Estimated 1RM
              </button>
              <button
                type="button"
                onClick={() => setMetric('weight')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  metric === 'weight'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Weight Used
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMetric('1rm')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  metric === '1rm'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Total Reps
              </button>
              <button
                type="button"
                onClick={() => setMetric('weight')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  metric === 'weight'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Volume
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Graph Area ── */}
      <div className="bg-surface-50/70 border border-surface-200/80 rounded-xl p-4 min-h-[240px]">
        {chartData.length >= 2 ? (
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="progressionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                cursor={{ stroke: '#0284c7', strokeWidth: 1, strokeDasharray: '2 2' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-surface-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg space-y-1">
                        <p className="text-surface-300 font-medium">{data.date}</p>
                        <p className="font-bold text-brand-300 text-sm">
                          {data.value} {data.unit}
                        </p>
                        {data.isPR && (
                          <span className="inline-block bg-amber-500 text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded">
                            PR
                          </span>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#progressionGradient)"
                activeDot={{ r: 5, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : chartData.length === 1 ? (
          <div className="h-[210px] flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold mb-2">
              1
            </div>
            <p className="text-sm font-semibold text-surface-800">
              First session recorded on {chartData[0].date}: {chartData[0].value} {chartData[0].unit}
            </p>
            <p className="text-xs text-surface-500 max-w-sm mt-1">
              Log this exercise in one more workout session to render your progression curve and performance trend!
            </p>
          </div>
        ) : (
          <div className="h-[210px] flex flex-col items-center justify-center text-center p-4 text-surface-500">
            <p className="text-sm font-medium">No recorded workout sets for this exercise yet.</p>
            <p className="text-xs text-surface-400 mt-1">
              Log a session containing this exercise to begin tracking estimated 1RM and progress.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
