import React from 'react'
import { Plus, Trash2, Edit2, Coffee, Utensils, Moon, Apple } from 'lucide-react'
import type { FoodEntry, MealType } from '@/types/nutrition'
import { formatFoodEntryPortion } from '@/lib/nutritionCalculator'

interface MealSectionProps {
  mealType: MealType
  entries: FoodEntry[]
  onOpenAddModal: (mealType: MealType) => void
  onOpenEditModal: (entry: FoodEntry) => void
  onDeleteEntry: (entryId: string) => void
}

const MEAL_CONFIG: Record<
  MealType,
  { title: string; icon: React.ReactNode; color: string; bg: string }
> = {
  breakfast: {
    title: 'Breakfast',
    icon: <Coffee size={18} />,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
  },
  lunch: {
    title: 'Lunch',
    icon: <Utensils size={18} />,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  dinner: {
    title: 'Dinner',
    icon: <Moon size={18} />,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
  },
  snack: {
    title: 'Snacks',
    icon: <Apple size={18} />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
  },
}

export function MealSection({
  mealType,
  entries,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteEntry,
}: MealSectionProps) {
  const config = MEAL_CONFIG[mealType]

  const totalCalories = entries.reduce((acc, curr) => acc + curr.calories, 0)
  const totalProtein = entries.reduce((acc, curr) => acc + curr.protein, 0)
  const totalCarbs = entries.reduce((acc, curr) => acc + curr.carbs, 0)
  const totalFat = entries.reduce((acc, curr) => acc + curr.fat, 0)

  return (
    <div
      id={`meal-section-${mealType}`}
      className="card bg-white border border-surface-200 rounded-2xl p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-card space-y-3"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${config.bg} ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="text-base font-black text-surface-900 tracking-tight">
              {config.title}
            </h3>
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 mt-0.5">
              <span>{Math.round(totalCalories)} kcal</span>
              <span>·</span>
              <span className="text-blue-600">{totalProtein.toFixed(0)}g P</span>
              <span>·</span>
              <span className="text-amber-700">{totalCarbs.toFixed(0)}g C</span>
              <span>·</span>
              <span className="text-rose-600">{totalFat.toFixed(0)}g F</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenAddModal(mealType)}
          id={`add-food-${mealType}-btn`}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Food</span>
        </button>
      </div>

      {/* Entries List or Empty State */}
      {entries.length === 0 ? (
        <div className="py-6 px-4 text-center rounded-xl border border-dashed border-surface-200 bg-surface-50/50">
          <p className="text-xs text-surface-400 font-medium">
            No foods logged for {config.title.toLowerCase()} yet.
          </p>
          <button
            onClick={() => onOpenAddModal(mealType)}
            className="mt-2 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            + Log {config.title}
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-0 sm:divide-y sm:divide-surface-100">
          {entries.map(entry => (
            <div key={entry.id} className="w-full">
              {/* ── DESKTOP VIEW (sm:flex) ── */}
              <div className="hidden sm:flex py-2.5 px-1 items-center justify-between gap-3 group hover:bg-surface-50/50 rounded-lg transition-colors">
                {/* Food Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-surface-900 truncate">
                      {entry.food_name}
                    </h4>
                    {entry.brand && (
                      <span className="text-[10px] text-surface-400 font-semibold px-1.5 py-0.5 rounded bg-surface-100 truncate">
                        {entry.brand}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-surface-500 mt-0.5">
                    <span className="font-semibold text-surface-700">
                      {formatFoodEntryPortion(entry)}
                    </span>
                    <span>·</span>
                    <span className="font-bold text-surface-800">
                      {Math.round(entry.calories)} kcal
                    </span>
                    <span className="text-[11px] text-blue-700 font-semibold">
                      {Math.round(entry.protein)}g P
                    </span>
                    <span className="text-[11px] text-amber-800 font-semibold">
                      {Math.round(entry.carbs)}g C
                    </span>
                    <span className="text-[11px] text-rose-700 font-semibold">
                      {Math.round(entry.fat)}g F
                    </span>
                    {entry.fiber > 0 && (
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        {Math.round(entry.fiber)}g Fib
                      </span>
                    )}
                  </div>
                </div>

                {/* Entry Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(entry)}
                    id={`edit-food-${entry.id}`}
                    className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
                    title="Edit portion"
                    aria-label="Edit food portion"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${entry.food_name}" from diary?`)) {
                        onDeleteEntry(entry.id)
                      }
                    }}
                    id={`delete-food-${entry.id}`}
                    className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete entry"
                    aria-label="Delete food entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* ── MOBILE VIEW (< sm) ── */}
              <div className="flex sm:hidden flex-col gap-2.5 p-3 rounded-xl bg-surface-50/70 border border-surface-200/80 shadow-2xs">
                {/* ROW 1: Food name + Category */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-surface-900 leading-snug line-clamp-2 break-words flex-1 min-w-0">
                    {entry.food_name}
                  </h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border capitalize shrink-0 ${config.bg} ${config.color}`}>
                    {config.title}
                  </span>
                </div>

                {/* ROW 2: Quantity and Serving Unit */}
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="font-bold text-surface-700 bg-white px-2 py-0.5 rounded-md border border-surface-200/80 shadow-2xs">
                    {formatFoodEntryPortion(entry)}
                  </span>
                  {entry.brand && (
                    <span className="text-[11px] text-surface-500 font-medium truncate">
                      ({entry.brand})
                    </span>
                  )}
                </div>

                {/* ROW 3: Calories Prominently + Balanced Macro Badges */}
                <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
                  <div className="inline-flex items-baseline gap-1 bg-white px-2.5 py-1 rounded-lg border border-surface-200/80 shadow-2xs shrink-0">
                    <span className="text-base font-black text-surface-900 leading-none">
                      {Math.round(entry.calories)}
                    </span>
                    <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">
                      kcal
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                      {Math.round(entry.protein)}g P
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                      {Math.round(entry.carbs)}g C
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70">
                      {Math.round(entry.fat)}g F
                    </span>
                    {entry.fiber > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        {Math.round(entry.fiber)}g Fib
                      </span>
                    )}
                  </div>
                </div>

                {/* ROW 4: Edit and Delete Actions (minimum 44px touch targets) */}
                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-surface-200/60">
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(entry)}
                    id={`mobile-edit-food-${entry.id}`}
                    className="btn-secondary py-2 px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 min-h-[44px] touch-manipulation shadow-2xs hover:border-surface-300"
                    aria-label={`Edit ${entry.food_name} portion`}
                  >
                    <Edit2 size={14} className="text-surface-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${entry.food_name}" from diary?`)) {
                        onDeleteEntry(entry.id)
                      }
                    }}
                    id={`mobile-delete-food-${entry.id}`}
                    className="py-2 px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 text-rose-600 bg-rose-50/80 hover:bg-rose-100 rounded-xl border border-rose-200/80 min-h-[44px] touch-manipulation transition-colors shadow-2xs"
                    aria-label={`Delete ${entry.food_name}`}
                  >
                    <Trash2 size={14} className="text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
