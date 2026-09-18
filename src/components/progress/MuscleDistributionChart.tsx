import { cn } from '@/lib/utils'

interface MuscleDistributionChartProps {
  distribution: Record<string, number>
  className?: string
}

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quads: 'Quadriceps',
  legs: 'Legs',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  core: 'Core',
  calves: 'Calves',
  full_body: 'Full Body',
  forearms: 'Forearms',
  traps: 'Traps',
  other: 'Other',
}

const MUSCLE_COLORS: Record<string, string> = {
  chest:      'bg-rose-500',
  back:       'bg-blue-500',
  shoulders:  'bg-violet-500',
  biceps:     'bg-sky-500',
  triceps:    'bg-indigo-500',
  quads:      'bg-amber-500',
  legs:       'bg-amber-400',
  hamstrings: 'bg-orange-500',
  glutes:     'bg-pink-500',
  core:       'bg-teal-500',
  calves:     'bg-yellow-500',
  full_body:  'bg-emerald-500',
  forearms:   'bg-cyan-500',
  traps:      'bg-purple-500',
  other:      'bg-surface-300',
}

export function MuscleDistributionChart({ distribution, className }: MuscleDistributionChartProps) {
  const entries = Object.entries(distribution)
    .filter(([, pct]) => pct > 0)
    .sort(([, a], [, b]) => b - a)

  if (entries.length === 0) {
    return (
      <div className={cn('card p-5 sm:p-6 bg-[#151A23] border border-[#202733] rounded-2xl shadow-card', className)}>
        <p className="text-xs font-black uppercase tracking-wider text-surface-400 mb-2">Muscle Distribution</p>
        <p className="text-sm text-surface-400 font-medium">
          No muscle group data available for this period. Log workouts to see your training distribution.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('card p-5 sm:p-6 bg-[#151A23] border border-[#202733] rounded-2xl shadow-card space-y-4', className)}>
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-surface-400">Muscle Distribution</p>
        <p className="text-[11px] text-surface-400 mt-0.5">% of completed sets by muscle group</p>
      </div>

      <div className="space-y-3">
        {entries.map(([muscle, pct]) => {
          const label = MUSCLE_LABELS[muscle] || muscle
          const color = MUSCLE_COLORS[muscle] || 'bg-brand-500'
          return (
            <div key={muscle} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-surface-300">{label}</span>
                <span className="font-bold text-white font-mono">{pct}%</span>
              </div>
              <div className="h-2 bg-[#11151D] rounded-full overflow-hidden border border-[#1F2633]">
                <div
                  className={cn('h-full rounded-full transition-all duration-700 ease-out', color)}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${label}: ${pct}%`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
