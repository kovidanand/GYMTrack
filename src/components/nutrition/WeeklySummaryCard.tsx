import { useEffect, useState } from 'react'
import { Calendar, TrendingUp } from 'lucide-react'
import { getNutritionHistory, type HistoryDayAggregate } from '@/lib/nutritionService'

interface WeeklySummaryCardProps {
  userId: string
  calorieTarget: number
  proteinTarget: number
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function WeeklySummaryCard({
  userId,
  calorieTarget,
  proteinTarget: _proteinTarget,
}: WeeklySummaryCardProps) {
  const [history, setHistory] = useState<HistoryDayAggregate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadWeek() {
      setIsLoading(true)
      try {
        const data = await getNutritionHistory(userId, 7)
        if (active) setHistory(data)
      } catch (err) {
        console.error('Failed to load weekly summary:', err)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadWeek()
    return () => {
      active = false
    }
  }, [userId])

  // Filter days that actually had logged entries (distinguishing unlogged from zero intake!)
  const loggedDays = history.filter(d => d.entry_count > 0)
  const daysLoggedCount = loggedDays.length

  const avgCalories =
    daysLoggedCount > 0
      ? Math.round(loggedDays.reduce((acc, d) => acc + d.calories, 0) / daysLoggedCount)
      : 0

  const avgProtein =
    daysLoggedCount > 0
      ? Math.round(
          (loggedDays.reduce((acc, d) => acc + d.protein, 0) / daysLoggedCount) * 10
        ) / 10
      : 0

  return (
    <div className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs hover:border-emerald-200/80 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-surface-100">
        <div>
          <h2 className="text-base sm:text-lg font-black text-surface-900 tracking-tight leading-tight flex items-center gap-2">
            <span>7-Day Nutrition Summary</span>
          </h2>
          <p className="text-xs text-surface-500 font-medium mt-0.5">
            Based on your authentic logged meal diary
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Calendar size={13} className="text-emerald-600" />
          <span>{daysLoggedCount} / 7 days logged</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-surface-400">
          Loading 7-day intake history...
        </div>
      ) : daysLoggedCount === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-surface-100 text-surface-400 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs text-surface-500 max-w-sm">
            No meal logs recorded for this 7-day window. Consistent daily food logging will reveal your real calorie averages and macro trends here.
          </p>
        </div>
      ) : (
        <div className="pt-4 space-y-5">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-surface-50/70 border border-surface-100 text-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
                Avg Calories
              </span>
              <p className="text-lg sm:text-xl font-black text-surface-900 leading-tight mt-0.5">
                {avgCalories.toLocaleString()}
              </p>
              <span className="text-[10px] text-surface-400 font-medium">kcal/day</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
                Avg Protein
              </span>
              <p className="text-lg sm:text-xl font-black text-emerald-700 leading-tight mt-0.5">
                {avgProtein}g
              </p>
              <span className="text-[10px] text-surface-400 font-medium">protein/day</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
                Consistency
              </span>
              <p className="text-lg sm:text-xl font-black text-surface-900 leading-tight mt-0.5">
                {Math.round((daysLoggedCount / 7) * 100)}%
              </p>
              <span className="text-[10px] text-surface-400 font-medium">of week logged</span>
            </div>
          </div>

          {/* Daily Trend Mini-Bars */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-surface-500 mb-2">
              <span>Daily Calorie Trend</span>
              <span>Target: {calorieTarget} kcal</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 items-end h-28 pt-2 pb-1 border-b border-surface-100">
              {history.map(day => {
                const dateObj = new Date(day.date + 'T00:00:00')
                const dayLabel = DAY_NAMES[dateObj.getDay()] || day.date.slice(-2)
                const hasData = day.entry_count > 0
                const calPercent =
                  calorieTarget > 0 && hasData
                    ? Math.min(100, Math.round((day.calories / calorieTarget) * 100))
                    : 0
                const isOver = hasData && day.calories > calorieTarget

                return (
                  <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-8 bg-surface-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded pointer-events-none z-10 whitespace-nowrap">
                      {hasData ? `${day.calories} kcal` : 'No log'}
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[28px] h-20 bg-surface-100 rounded-lg flex items-end overflow-hidden p-0.5">
                      {hasData ? (
                        <div
                          className={`w-full rounded-md transition-all duration-500 ${
                            isOver ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ height: `${Math.max(12, calPercent)}%` }}
                        />
                      ) : (
                        <div className="w-full h-full border border-dashed border-surface-300 rounded-md bg-transparent" />
                      )}
                    </div>

                    {/* Day label */}
                    <span className="text-[10px] font-bold text-surface-500">
                      {dayLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
