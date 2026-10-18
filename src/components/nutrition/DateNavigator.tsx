import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
  X,
} from 'lucide-react'
import {
  toLocalISODate,
  parseLocalISODate,
  isTodayDate,
  isYesterdayDate,
  formatFriendlyDate,
} from '@/lib/dateUtils'
import { getCalendarActivityIndicators } from '@/lib/nutritionService'

interface DateNavigatorProps {
  selectedDate: string // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void
  userId?: string
}

export function DateNavigator({
  selectedDate,
  onSelectDate,
  userId,
}: DateNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const todayStr = useMemo(() => toLocalISODate(), [])
  const isToday = isTodayDate(selectedDate)
  const isYesterday = isYesterdayDate(selectedDate)

  // Current calendar view month/year
  const selectedObj = useMemo(() => parseLocalISODate(selectedDate), [selectedDate])
  const [viewYear, setViewYear] = useState(() => selectedObj.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => selectedObj.getMonth()) // 0-indexed

  // Activity indicators cache
  const [activity, setActivity] = useState<{
    foodDates: Set<string>
    workoutDates: Set<string>
  }>({
    foodDates: new Set(),
    workoutDates: new Set(),
  })

  // Sync view month when selectedDate changes from outside
  useEffect(() => {
    setViewYear(selectedObj.getFullYear())
    setViewMonth(selectedObj.getMonth())
  }, [selectedObj])

  // Fetch authentic historical activity indicators for the visible calendar month
  useEffect(() => {
    if (!userId) return

    const start = new Date(viewYear, viewMonth, 1)
    const end = new Date(viewYear, viewMonth + 1, 0)
    const startStr = toLocalISODate(start)
    const endStr = toLocalISODate(end)

    let isMounted = true
    getCalendarActivityIndicators(userId, startStr, endStr).then(res => {
      if (isMounted) setActivity(res)
    })

    return () => {
      isMounted = false
    }
  }, [userId, viewYear, viewMonth])

  // Close popover on outside click or escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Stepper handlers
  const handlePrevDay = () => {
    const cur = parseLocalISODate(selectedDate)
    cur.setDate(cur.getDate() - 1)
    onSelectDate(toLocalISODate(cur))
  }

  const handleNextDay = () => {
    const cur = parseLocalISODate(selectedDate)
    cur.setDate(cur.getDate() + 1)
    const nextStr = toLocalISODate(cur)
    if (nextStr <= todayStr) {
      onSelectDate(nextStr)
    }
  }

  const handleJumpToToday = () => {
    onSelectDate(todayStr)
    setIsOpen(false)
  }

  // Label formatting
  let displayLabel = formatFriendlyDate(selectedDate, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  if (isToday) {
    displayLabel = `Today, ${formatFriendlyDate(selectedDate, { month: 'short', day: 'numeric' })}`
  } else if (isYesterday) {
    displayLabel = `Yesterday, ${formatFriendlyDate(selectedDate, { month: 'short', day: 'numeric' })}`
  }

  // Check if next day would exceed today
  const isAtToday = selectedDate >= todayStr

  // Build Calendar Matrix for viewYear & viewMonth
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay() // 0 = Sun
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    // Check if next month is in the future
    const now = new Date()
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) {
      return
    }
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const isNextMonthDisabled = () => {
    const now = new Date()
    return viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())
  }

  return (
    <div className="relative inline-flex items-center">
      {/* ─── POLISHED COMPACT DATE SELECTOR ─── */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-surface-200/90 rounded-2xl p-1.5 shadow-2xs">
        {/* Previous Day Button */}
        <button
          onClick={handlePrevDay}
          id="nutrition-date-prev"
          className="p-2 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          title="Previous day"
          aria-label="Previous day"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Selected Date with Calendar Icon (Opens Popover) */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(prev => !prev)}
          id="nutrition-date-picker-button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm text-surface-900 hover:bg-surface-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          title="Click to open calendar"
        >
          <CalendarIcon size={16} className="text-emerald-600 flex-shrink-0" />
          <span className="whitespace-nowrap">{displayLabel}</span>
        </button>

        {/* Next Day Button (Disabled if viewing today) */}
        <button
          onClick={handleNextDay}
          disabled={isAtToday}
          id="nutrition-date-next"
          className="p-2 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          title={isAtToday ? 'Cannot log future dates' : 'Next day'}
          aria-label="Next day"
        >
          <ChevronRight size={18} />
        </button>

        {/* Today Shortcut Button (shown if not on today) */}
        {!isToday && (
          <button
            onClick={handleJumpToToday}
            id="nutrition-return-today"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/80 transition-all shadow-2xs ml-1"
            title="Return to today"
          >
            <RotateCcw size={12} />
            <span>Today</span>
          </button>
        )}
      </div>

      {/* ─── DATA-AWARE CALENDAR POPOVER ─── */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Calendar date picker"
          className="absolute top-full right-0 mt-2 z-50 w-[310px] sm:w-[330px] p-4 bg-white rounded-2xl shadow-xl border border-surface-200 animate-scale-in"
        >
          {/* Popover Header: Month/Year navigation & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-100">
            <span className="text-sm font-black text-surface-900 tracking-tight">
              {monthName}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                disabled={isNextMonthDisabled()}
                className="p-1.5 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors ml-1"
                title="Close calendar"
                aria-label="Close calendar"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] font-bold text-surface-400">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Leading empty cells */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="w-9 h-9" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const cellDate = new Date(viewYear, viewMonth, dayNum)
              const cellDateStr = toLocalISODate(cellDate)
              const isSelected = cellDateStr === selectedDate
              const isCurrentDay = cellDateStr === todayStr
              const isFuture = cellDateStr > todayStr
              const hasFood = activity.foodDates.has(cellDateStr)
              const hasWorkout = activity.workoutDates.has(cellDateStr)

              return (
                <button
                  key={cellDateStr}
                  type="button"
                  disabled={isFuture}
                  onClick={() => {
                    onSelectDate(cellDateStr)
                    setIsOpen(false)
                  }}
                  className={`group relative flex flex-col items-center justify-center w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrentDay
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-black'
                      : isFuture
                      ? 'text-surface-300 cursor-not-allowed'
                      : 'text-surface-700 hover:bg-surface-100 hover:text-surface-900'
                  }`}
                  title={`${cellDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}${
                    hasFood ? ' • Meals logged' : ''
                  }${hasWorkout ? ' • Workout logged' : ''}`}
                >
                  <span className="leading-none">{dayNum}</span>

                  {/* Subtle Activity Indicator Dots */}
                  <div className="flex items-center gap-0.5 mt-0.5 h-1">
                    {hasFood && (
                      <span
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-emerald-500'
                        }`}
                        title="Meals logged"
                      />
                    )}
                    {hasWorkout && (
                      <span
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-brand-600'
                        }`}
                        title="Workout recorded"
                      />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Activity Legend & Today Shortcut */}
          <div className="mt-3 pt-3 border-t border-surface-100 flex items-center justify-between text-[11px] text-surface-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Food</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 inline-block" />
                <span>Workout</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleJumpToToday}
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
