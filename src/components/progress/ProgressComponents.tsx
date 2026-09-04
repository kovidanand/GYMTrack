import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ChartDataPoint } from '@/types'
import { cn } from '@/lib/utils'

// ─── Strength Progress Line Chart ──────────────────────────────────────────────

interface StrengthChartProps {
  data: ChartDataPoint[]
  unit?: string
  color?: string
  className?: string
}

export function StrengthChart({ data, unit = 'kg', color = '#6366f1', className }: StrengthChartProps) {
  const formatted = data.map(d => ({
    ...d,
    displayDate: d.date.slice(5).replace('-', '/'), // MM/DD
  }))

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value} ${unit}`, 'Weight']}
            labelFormatter={label => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ fill: color, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Volume Bar Chart ──────────────────────────────────────────────────────────

interface VolumeChartProps {
  data: ChartDataPoint[]
  className?: string
}

export function VolumeChart({ data, className }: VolumeChartProps) {
  const formatted = data.map(d => ({
    ...d,
    displayDate: d.date.replace('Week ', 'W').replace(' Jun', '/6').replace(' Jul', '/7').replace(' Aug', '/8').replace(' Sep', '/9'),
    displayValue: Math.round(d.value / 1000),
  }))

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}k`}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value}k kg`, 'Volume']}
          />
          <Bar
            dataKey="displayValue"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Mini Spark Line (for landing page) ───────────────────────────────────────

interface SparkLineProps {
  data: number[]
  color?: string
  className?: string
}

export function SparkLine({ data, color = '#6366f1', className }: SparkLineProps) {
  const points = data.map((v, i) => ({ x: i, v }))
  return (
    <div className={cn('w-full h-12', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Consistency Calendar ──────────────────────────────────────────────────────

interface ConsistencyCalendarProps {
  data: { date: string; trained: boolean }[]
  month: string
  className?: string
}

export function ConsistencyCalendar({ data, month, className }: ConsistencyCalendarProps) {
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Get first day of month to calculate offset
  const firstDate = data[0]?.date
  const firstDay = firstDate ? new Date(firstDate).getDay() : 0

  return (
    <div className={cn('', className)}>
      <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">{month}</p>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-surface-400 font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Offset cells */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`offset-${i}`} />
        ))}

        {/* Day cells */}
        {data.map((entry) => {
          const day = new Date(entry.date).getDate()
          return (
            <div
              key={entry.date}
              title={`${entry.date}: ${entry.trained ? 'Trained' : 'Rest'}`}
              aria-label={`${entry.date}: ${entry.trained ? 'Trained' : 'Rest day'}`}
              className={cn(
                'w-full aspect-square rounded flex items-center justify-center text-[9px] font-medium transition-colors',
                entry.trained
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-100 text-surface-400'
              )}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── PR Card ──────────────────────────────────────────────────────────────────

interface PRCardProps {
  exerciseName: string
  value: number
  unit: string
  achievedAt: string
  previousValue?: number
  className?: string
}

export function PRCard({ exerciseName, value, unit, previousValue, className }: PRCardProps) {
  const improvement = previousValue ? ((value - previousValue) / previousValue * 100).toFixed(1) : null

  return (
    <div className={cn('card p-4 flex items-center justify-between gap-4', className)}>
      <div>
        <p className="text-sm font-semibold text-surface-900">{exerciseName}</p>
        {improvement && (
          <p className="text-xs text-emerald-600">+{improvement}% from previous</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xl font-bold text-brand-600">{value}</p>
        <p className="text-xs text-surface-500">{unit}</p>
      </div>
    </div>
  )
}
