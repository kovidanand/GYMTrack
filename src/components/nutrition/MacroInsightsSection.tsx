interface MacroInsightsSectionProps {
  protein: number
  proteinTarget: number
  carbs: number
  carbsTarget: number
  fat: number
  fatTarget: number
  fiber?: number
  fiberTarget?: number
}

interface MacroGaugeProps {
  label: string
  consumed: number
  target: number
  unit?: string
  color: string
  accentBg: string
  textColor: string
}

function MacroGauge({
  label,
  consumed,
  target,
  unit = 'g',
  color,
  accentBg,
  textColor,
}: MacroGaugeProps) {
  const percent = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0
  const remaining = target - consumed
  const isOver = remaining < 0

  // Circular gauge calculations
  const size = 64
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(100, percent) / 100) * circumference

  return (
    <div className="p-4 rounded-2xl bg-white border border-surface-200/90 shadow-2xs hover:border-emerald-200/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-surface-700">{label}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${accentBg} ${textColor}`}>
          {isOver ? `+${Math.abs(remaining).toFixed(0)}${unit} over` : `${remaining.toFixed(0)}${unit} left`}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Left: Values */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-surface-900 leading-none">
              {consumed.toFixed(0)}
            </span>
            <span className="text-xs font-semibold text-surface-400">
              / {target.toFixed(0)}{unit}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-surface-400 mt-1">
            {percent}% of daily goal
          </p>
        </div>

        {/* Right: Circular Progress Ring */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="rotate-[-90deg]">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-surface-800">
            {percent}%
          </span>
        </div>
      </div>
    </div>
  )
}

export function MacroInsightsSection({
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
  fiber = 0,
  fiberTarget = 30,
}: MacroInsightsSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-surface-600">
          Macronutrient Breakdown
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MacroGauge
          label="Protein"
          consumed={protein}
          target={proteinTarget}
          color="#10b981" // emerald-500
          accentBg="bg-emerald-50"
          textColor="text-emerald-700"
        />

        <MacroGauge
          label="Carbohydrates"
          consumed={carbs}
          target={carbsTarget}
          color="#f59e0b" // amber-500
          accentBg="bg-amber-50"
          textColor="text-amber-800"
        />

        <MacroGauge
          label="Healthy Fat"
          consumed={fat}
          target={fatTarget}
          color="#f43f5e" // rose-500
          accentBg="bg-rose-50"
          textColor="text-rose-700"
        />

        <MacroGauge
          label="Dietary Fiber"
          consumed={fiber}
          target={fiberTarget}
          color="#14b8a6" // teal-500
          accentBg="bg-teal-50"
          textColor="text-teal-800"
        />
      </div>
    </div>
  )
}
