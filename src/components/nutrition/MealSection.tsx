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
        <div className="divide-y divide-surface-100">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="py-2.5 flex items-center justify-between gap-3 group hover:bg-surface-50/50 px-1 rounded-lg transition-colors"
            >
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
                  <span className="font-medium text-surface-600">
                    {formatFoodEntryPortion(entry)}
                  </span>
                  <span>·</span>
                  <span className="font-bold text-surface-800">
                    {Math.round(entry.calories)} kcal
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">
                    {entry.protein.toFixed(0)}g P
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium">
                    {entry.carbs.toFixed(0)}g C
                  </span>
                  <span className="text-[11px] text-rose-600 font-medium">
                    {entry.fat.toFixed(0)}g F
                  </span>
                  {entry.fiber > 0 && (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {entry.fiber.toFixed(0)}g Fib
                    </span>
                  )}
                </div>
              </div>

              {/* Entry Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenEditModal(entry)}
                  id={`edit-food-${entry.id}`}
                  className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
                  title="Edit portion"
                  aria-label="Edit food portion"
                >
                  <Edit2 size={14} />
                </button>

                <button
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
          ))}
        </div>
      )}
    </div>
  )
}
