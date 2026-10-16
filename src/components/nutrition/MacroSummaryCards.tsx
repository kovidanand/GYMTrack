import React from 'react'

interface MacroSummaryCardsProps {
  protein: number
  proteinTarget: number
  carbs: number
  carbsTarget: number
  fat: number
  fatTarget: number
  fiber: number
  fiberTarget: number
}

interface MacroItemProps {
  id: string
  name: string
  consumed: number
  target: number
  unit?: string
  barColor: string
  bgLight: string
  textColor: string
}

function MacroItem({
  id,
  name,
  consumed,
  target,
  unit = 'g',
  barColor,
  bgLight,
  textColor,
}: MacroItemProps) {
  const remaining = Math.max(0, target - consumed)
  const isOver = consumed > target
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0

  return (
    <div
      id={id}
      className="card p-3.5 sm:p-4 bg-white border border-surface-200 rounded-2xl flex flex-col justify-between shadow-xs transition-shadow hover:shadow-card"
    >
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-xs font-bold text-surface-700">{name}</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bgLight} ${textColor}`}
        >
          {isOver ? `+${(consumed - target).toFixed(0)}${unit} over` : `${remaining.toFixed(0)}${unit} left`}
        </span>
      </div>

      <div className="flex items-baseline gap-1 my-1">
        <span className="text-xl sm:text-2xl font-black text-surface-900 leading-none">
          {consumed.toFixed(0)}
        </span>
        <span className="text-xs font-semibold text-surface-400">
          / {target.toFixed(0)} {unit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-100 rounded-full h-2 mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-surface-400 font-semibold mt-1.5">
        <span>{pct}% met</span>
        <span>Goal: {target}{unit}</span>
      </div>
    </div>
  )
}

export function MacroSummaryCards({
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
  fiber,
  fiberTarget,
}: MacroSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      <MacroItem
        id="macro-protein"
        name="Protein"
        consumed={protein}
        target={proteinTarget}
        barColor="bg-blue-600"
        bgLight="bg-blue-50"
        textColor="text-blue-700"
      />
      <MacroItem
        id="macro-carbs"
        name="Carbs"
        consumed={carbs}
        target={carbsTarget}
        barColor="bg-amber-500"
        bgLight="bg-amber-50"
        textColor="text-amber-800"
      />
      <MacroItem
        id="macro-fat"
        name="Fat"
        consumed={fat}
        target={fatTarget}
        barColor="bg-rose-500"
        bgLight="bg-rose-50"
        textColor="text-rose-700"
      />
      <MacroItem
        id="macro-fiber"
        name="Fiber"
        consumed={fiber}
        target={fiberTarget}
        barColor="bg-emerald-600"
        bgLight="bg-emerald-50"
        textColor="text-emerald-800"
      />
    </div>
  )
}
