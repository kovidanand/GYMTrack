import { useState } from 'react'
import {
  Utensils,
  Plus,
  Pencil,
  Trash2,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Loader2,
} from 'lucide-react'
import type { FoodEntry, MealType } from '@/types/nutrition'

import { getDashboardDateHeadings, toLocalISODate } from '@/lib/dateUtils'

interface RecentFoodLogProps {
  entries: FoodEntry[]
  selectedDate?: string
  onOpenAddModal: (mealType?: MealType) => void
  onOpenEditModal: (entry: FoodEntry) => void
  onDeleteEntry: (entryId: string) => Promise<void>
}

const MEAL_ICONS: Record<MealType, typeof Utensils> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
}

const MEAL_BADGE_STYLES: Record<MealType, string> = {
  breakfast: 'bg-amber-50 text-amber-700 border-amber-200',
  lunch: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  dinner: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  snack: 'bg-purple-50 text-purple-700 border-purple-200',
}

export function RecentFoodLog({
  entries,
  selectedDate,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteEntry,
}: RecentFoodLogProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const headings = getDashboardDateHeadings(selectedDate || toLocalISODate())

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await onDeleteEntry(id)
    } finally {
      setDeletingId(null)
    }
  }

  // Sort entries with latest logged first
  const sortedEntries = [...entries].sort((a, b) => {
    const timeA = a.logged_at ? new Date(a.logged_at).getTime() : 0
    const timeB = b.logged_at ? new Date(b.logged_at).getTime() : 0
    return timeB - timeA
  })

  return (
    <div className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs hover:border-emerald-200/80 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-surface-100">
        <div>
          <h2 className="text-base sm:text-lg font-black text-surface-900 tracking-tight leading-tight">
            {headings.logHeading}
          </h2>
          <p className="text-xs text-surface-500 font-medium mt-0.5">
            {entries.length === 0
              ? 'No foods recorded for this date'
              : `${entries.length} ${entries.length === 1 ? 'food entry' : 'food entries'} logged`}
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal('breakfast')}
          id="recent-log-add-food-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors"
        >
          <Plus size={14} />
          <span>Log Food</span>
        </button>
      </div>

      {sortedEntries.length === 0 ? (
        /* Clean Empty State */
        <div className="py-10 text-center flex flex-col items-center justify-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <Utensils size={22} />
          </div>
          <div className="max-w-xs">
            <h4 className="text-sm font-bold text-surface-800">No Meals Logged Yet</h4>
            <p className="text-xs text-surface-500 mt-1">
              Add your breakfast, lunch, dinner, or snacks to track your calories and macros live.
            </p>
          </div>
          <button
            onClick={() => onOpenAddModal('breakfast')}
            id="empty-log-meal-btn"
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>Log Your First Meal</span>
          </button>
        </div>
      ) : (
        /* Food Entry Rows */
        <div className="divide-y divide-surface-100 mt-2">
          {sortedEntries.map(entry => {
            const MealIcon = MEAL_ICONS[entry.meal_type] || Utensils
            const badgeStyle = MEAL_BADGE_STYLES[entry.meal_type] || 'bg-surface-100 text-surface-700'
            const isDeleting = deletingId === entry.id

            return (
              <div
                key={entry.id}
                className="py-3 px-1 sm:px-2 flex items-center justify-between gap-3 hover:bg-surface-50/70 rounded-xl transition-colors group"
              >
                {/* Left: Meal Icon & Food Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-surface-100 text-surface-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                    <MealIcon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-surface-900 truncate">
                        {entry.food_name}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full border capitalize ${badgeStyle}`}
                      >
                        {entry.meal_type}
                      </span>
                      {entry.brand && (
                        <span className="text-[11px] text-surface-400 truncate">
                          ({entry.brand})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-surface-500 mt-0.5">
                      <span className="font-semibold text-surface-700">
                        {entry.serving_size} {entry.serving_unit}
                        {entry.servings_logged && entry.servings_logged !== 1 && entry.servings_logged !== entry.serving_size && (
                          <span className="text-surface-400"> (×{entry.servings_logged})</span>
                        )}
                      </span>
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold">{entry.protein}g P</span>
                      <span>·</span>
                      <span className="text-amber-800 font-semibold">{entry.carbs}g C</span>
                      <span>·</span>
                      <span className="text-rose-700 font-semibold">{entry.fat}g F</span>
                    </div>
                  </div>
                </div>

                {/* Right: Calories Badge & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-black text-surface-900 block leading-tight">
                      {entry.calories}
                    </span>
                    <span className="text-[10px] text-surface-400 font-semibold">kcal</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onOpenEditModal(entry)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                      title="Edit Entry"
                      aria-label={`Edit ${entry.food_name}`}
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={e => handleDelete(e, entry.id)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Entry"
                      aria-label={`Delete ${entry.food_name}`}
                    >
                      {isDeleting ? (
                        <Loader2 size={14} className="animate-spin text-rose-500" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
