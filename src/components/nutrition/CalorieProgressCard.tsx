import { Flame, CheckCircle2, AlertCircle } from 'lucide-react'

interface CalorieProgressCardProps {
  consumed: number
  target: number
  onEditGoals?: () => void
}

export function CalorieProgressCard({
  consumed,
  target,
  onEditGoals,
}: CalorieProgressCardProps) {
  const remaining = target - consumed
  const isOver = remaining < 0
  const overAmount = Math.abs(remaining)
  const percent = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0

  // SVG circular ring calculations
  const size = 130
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(100, percent) / 100) * circumference

  return (
    <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Summary Metrics */}
        <div className="flex-1 space-y-4 text-center sm:text-left w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
                <Flame size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-surface-900 tracking-tight leading-none">
                  Daily Energy Intake
                </h3>
                <p className="text-xs text-surface-500 font-medium mt-1">
                  Calorie budget & progress
                </p>
              </div>
            </div>

            {onEditGoals && (
              <button
                onClick={onEditGoals}
                id="edit-nutrition-goals-btn"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline px-2 py-1 rounded-lg"
              >
                Set Target
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 border-y border-surface-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                Consumed
              </span>
              <p className="text-xl sm:text-2xl font-black text-surface-900 leading-tight">
                {consumed.toLocaleString()}
              </p>
              <span className="text-[10px] text-surface-400 font-semibold">kcal</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                {isOver ? 'Overage' : 'Remaining'}
              </span>
              <p
                className={`text-xl sm:text-2xl font-black leading-tight ${
                  isOver ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {isOver ? `+${overAmount.toLocaleString()}` : remaining.toLocaleString()}
              </p>
              <span className="text-[10px] text-surface-400 font-semibold">
                {isOver ? 'over limit' : 'kcal left'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                Daily Goal
              </span>
              <p className="text-xl sm:text-2xl font-black text-surface-900 leading-tight">
                {target.toLocaleString()}
              </p>
              <span className="text-[10px] text-surface-400 font-semibold">kcal</span>
            </div>
          </div>

          {/* Overage or Completion callout */}
          {isOver ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <AlertCircle size={15} className="flex-shrink-0 text-amber-600" />
              <span>
                You have exceeded your daily target by{' '}
                <strong>{overAmount.toLocaleString()} kcal</strong>.
              </span>
            </div>
          ) : percent >= 95 ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-600" />
              <span>Great job! You have nearly hit your daily calorie target.</span>
            </div>
          ) : null}
        </div>

        {/* Right: Circular Progress Ring */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="rotate-[-90deg]">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isOver ? '#f59e0b' : '#2563eb'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Inner ring content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-surface-900 leading-none">
              {percent}%
            </span>
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mt-0.5">
              Target
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
