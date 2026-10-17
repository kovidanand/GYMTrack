import { Flame } from 'lucide-react'

interface TodaysProgressCardProps {
  consumed: number
  target: number
  protein: number
  proteinTarget: number
  carbs: number
  carbsTarget: number
  fat: number
  fatTarget: number
  fiber?: number
  fiberTarget?: number
  onEditGoals?: () => void
}

export function TodaysProgressCard({
  consumed,
  target,
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
  fiber = 0,
  fiberTarget = 30,
  onEditGoals,
}: TodaysProgressCardProps) {
  const hasTarget = target > 0
  const remaining = hasTarget ? target - consumed : 0
  const isOver = hasTarget && remaining < 0
  const overAmount = Math.abs(remaining)
  const percent = hasTarget ? Math.min(100, Math.round((consumed / target) * 100)) : 0

  // SVG Circular Ring Calculations
  const size = 138
  const strokeWidth = 11
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = hasTarget
    ? circumference - (Math.min(100, percent) / 100) * circumference
    : circumference

  // Macro percentages
  const proteinPct = proteinTarget > 0 ? Math.min(100, Math.round((protein / proteinTarget) * 100)) : 0
  const carbsPct = carbsTarget > 0 ? Math.min(100, Math.round((carbs / carbsTarget) * 100)) : 0
  const fatPct = fatTarget > 0 ? Math.min(100, Math.round((fat / fatTarget) * 100)) : 0
  const fiberPct = fiberTarget > 0 ? Math.min(100, Math.round((fiber / fiberTarget) * 100)) : 0

  return (
    <div className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs hover:border-emerald-200/80 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-100">
        <div>
          <h2 className="text-base sm:text-lg font-black text-surface-900 tracking-tight leading-tight flex items-center gap-2">
            <span>Today's Nutrition</span>
          </h2>
          <p className="text-xs text-surface-500 font-medium mt-0.5">
            Daily caloric balance and macronutrient breakdown
          </p>
        </div>

        {onEditGoals && (
          <button
            onClick={onEditGoals}
            id="edit-nutrition-goals-btn"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            {hasTarget ? 'Adjust Targets' : 'Set Targets'}
          </button>
        )}
      </div>

      {/* Main Content Grid: Left Calorie Ring, Right Macro Bars */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5">
        {/* Left Side: Calorie Progress Ring */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-50/60 border border-surface-100">
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="rotate-[-90deg]">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#e2e8f0"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Progress circle */}
              {hasTarget && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={isOver ? '#f59e0b' : '#10b981'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              )}
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
              <span className="text-2xl sm:text-3xl font-black text-surface-900 leading-none tracking-tight">
                {consumed.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-surface-400 mt-1">
                {hasTarget ? `of ${target.toLocaleString()} kcal` : 'calories consumed'}
              </span>
            </div>
          </div>

          {/* Calorie Status Pill */}
          <div className="mt-3 text-center">
            {!hasTarget ? (
              onEditGoals ? (
                <button
                  type="button"
                  onClick={onEditGoals}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                >
                  <span>Configure daily target</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-surface-600 bg-surface-100 border border-surface-200">
                  <span>No target set</span>
                </span>
              )
            ) : isOver ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300">
                <span>+{overAmount.toLocaleString()} kcal over target</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300">
                <Flame size={12} className="text-emerald-600" />
                <span>{remaining.toLocaleString()} kcal remaining</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Macronutrient Progress Bars */}
        <div className="md:col-span-7 space-y-4">
          {/* Protein Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-surface-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Protein</span>
              </span>
              <span className="font-medium text-surface-600">
                <strong className="text-surface-900 font-bold">{protein.toFixed(0)}g</strong>
                {proteinTarget > 0 ? (
                  <>
                    {' '}/ {proteinTarget.toFixed(0)}g{' '}
                    <span className="text-[11px] text-surface-400 font-semibold">({proteinPct}%)</span>
                  </>
                ) : (
                  <span className="text-[11px] text-surface-400 font-normal"> (no target)</span>
                )}
              </span>
            </div>
            <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
          </div>

          {/* Carbs Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-surface-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Carbohydrates</span>
              </span>
              <span className="font-medium text-surface-600">
                <strong className="text-surface-900 font-bold">{carbs.toFixed(0)}g</strong>
                {carbsTarget > 0 ? (
                  <>
                    {' '}/ {carbsTarget.toFixed(0)}g{' '}
                    <span className="text-[11px] text-surface-400 font-semibold">({carbsPct}%)</span>
                  </>
                ) : (
                  <span className="text-[11px] text-surface-400 font-normal"> (no target)</span>
                )}
              </span>
            </div>
            <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500 ease-out"
                style={{ width: `${carbsPct}%` }}
              />
            </div>
          </div>

          {/* Fat Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-surface-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Fat</span>
              </span>
              <span className="font-medium text-surface-600">
                <strong className="text-surface-900 font-bold">{fat.toFixed(0)}g</strong>
                {fatTarget > 0 ? (
                  <>
                    {' '}/ {fatTarget.toFixed(0)}g{' '}
                    <span className="text-[11px] text-surface-400 font-semibold">({fatPct}%)</span>
                  </>
                ) : (
                  <span className="text-[11px] text-surface-400 font-normal"> (no target)</span>
                )}
              </span>
            </div>
            <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500 ease-out"
                style={{ width: `${fatPct}%` }}
              />
            </div>
          </div>

          {/* Fiber Bar (secondary metric) */}
          {fiberTarget > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-surface-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span>Dietary Fiber</span>
                </span>
                <span className="font-medium text-surface-600">
                  <strong className="text-surface-900 font-bold">{fiber.toFixed(0)}g</strong> / {fiberTarget.toFixed(0)}g{' '}
                  <span className="text-[11px] text-surface-400 font-semibold">({fiberPct}%)</span>
                </span>
              </div>
              <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500 ease-out"
                  style={{ width: `${fiberPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
