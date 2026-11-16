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
import { formatFoodEntryPortion } from '@/lib/nutritionCalculator'

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
    <div className="card p-3.5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs hover:border-emerald-200/80 transition-all w-full min-w-0 box-border overflow-hidden">
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors shadow-2xs"
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
        /* Food Entry Rows (Responsive: Desktop rows, Mobile structured cards) */
        <div className="space-y-3 sm:space-y-0 sm:divide-y sm:divide-surface-100 mt-2">
          {sortedEntries.map(entry => {
            const MealIcon = MEAL_ICONS[entry.meal_type] || Utensils
            const badgeStyle = MEAL_BADGE_STYLES[entry.meal_type] || 'bg-surface-100 text-surface-700'
            const isDeleting = deletingId === entry.id

            return (
              <div key={entry.id} className="w-full">
                {/* ── DESKTOP VIEW (sm:flex) ── */}
                <div className="hidden sm:flex py-3 px-2 items-center justify-between gap-3 hover:bg-surface-50/70 rounded-xl transition-colors group">
                  {/* Left: Meal Icon & Food Details */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-surface-100 text-surface-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                      <MealIcon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-surface-900 truncate">
                          {entry.food_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border capitalize ${badgeStyle}`}
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
                          {formatFoodEntryPortion(entry)}
                        </span>
                        <span>·</span>
                        <span className="text-blue-700 font-semibold">{Math.round(entry.protein)}g P</span>
                        <span>·</span>
                        <span className="text-amber-800 font-semibold">{Math.round(entry.carbs)}g C</span>
                        <span>·</span>
                        <span className="text-rose-700 font-semibold">{Math.round(entry.fat)}g F</span>
                        {entry.fiber > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-700 font-semibold">{Math.round(entry.fiber)}g Fib</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Calories Badge & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black text-surface-900 block leading-tight">
                        {Math.round(entry.calories)}
                      </span>
                      <span className="text-[10px] text-surface-400 font-semibold">kcal</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onOpenEditModal(entry)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                        title="Edit Entry"
                        aria-label={`Edit ${entry.food_name}`}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={e => handleDelete(e, entry.id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
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

                {/* ── MOBILE VIEW (< sm) ── */}
                <div className="flex sm:hidden flex-col gap-2.5 p-3 rounded-xl bg-surface-50/70 border border-surface-200/80 shadow-2xs">
                  {/* ROW 1: Food name + Meal Category Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-surface-100 text-surface-600 flex items-center justify-center shrink-0">
                        <MealIcon size={14} />
                      </div>
                      <h4 className="text-sm font-bold text-surface-900 leading-snug line-clamp-2 break-words">
                        {entry.food_name}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border capitalize shrink-0 ${badgeStyle}`}
                    >
                      {entry.meal_type}
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
                    {/* Prominent Calories */}
                    <div className="inline-flex items-baseline gap-1 bg-white px-2.5 py-1 rounded-lg border border-surface-200/80 shadow-2xs shrink-0">
                      <span className="text-base font-black text-surface-900 leading-none">
                        {Math.round(entry.calories)}
                      </span>
                      <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">
                        kcal
                      </span>
                    </div>

                    {/* Balanced Macro Badges */}
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
                      className="btn-secondary py-2 px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 min-h-[44px] touch-manipulation shadow-2xs hover:border-surface-300"
                      aria-label={`Edit ${entry.food_name} portion`}
                      id={`edit-food-${entry.id}`}
                    >
                      <Pencil size={14} className="text-surface-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={e => handleDelete(e, entry.id)}
                      disabled={isDeleting}
                      className="py-2 px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 text-rose-600 bg-rose-50/80 hover:bg-rose-100 rounded-xl border border-rose-200/80 min-h-[44px] touch-manipulation transition-colors shadow-2xs disabled:opacity-50"
                      aria-label={`Delete ${entry.food_name}`}
                      id={`delete-food-${entry.id}`}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-rose-500" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={14} className="text-rose-500" />
                          <span>Delete</span>
                        </>
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
