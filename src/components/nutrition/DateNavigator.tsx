import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react'

interface DateNavigatorProps {
  selectedDate: string // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void
}

export function DateNavigator({ selectedDate, onSelectDate }: DateNavigatorProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === todayStr

  // Parse YYYY-MM-DD safely in local time
  const [year, month, day] = selectedDate.split('-').map(Number)
  const currentDateObj = new Date(year, month - 1, day)

  const handlePrevDay = () => {
    const prev = new Date(currentDateObj)
    prev.setDate(prev.getDate() - 1)
    onSelectDate(prev.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const next = new Date(currentDateObj)
    next.setDate(next.getDate() + 1)
    onSelectDate(next.toISOString().split('T')[0])
  }

  const handleToday = () => {
    onSelectDate(todayStr)
  }

  // Yesterday check
  const yesterdayObj = new Date()
  yesterdayObj.setDate(yesterdayObj.getDate() - 1)
  const isYesterday = selectedDate === yesterdayObj.toISOString().split('T')[0]

  let formattedDateLabel = currentDateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  if (isToday) formattedDateLabel = `Today, ${currentDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  else if (isYesterday) formattedDateLabel = `Yesterday, ${currentDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-surface-200 rounded-2xl p-3 shadow-xs">
      {/* Date Stepper */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={handlePrevDay}
          id="nutrition-date-prev"
          className="p-2 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
          title="Previous Day"
          aria-label="Previous Day"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
          id="nutrition-date-picker-button"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm text-surface-900 hover:bg-surface-100 transition-colors"
          title="Select specific date"
        >
          <CalendarIcon size={16} className="text-brand-600" />
          <span>{formattedDateLabel}</span>
        </button>

        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={e => e.target.value && onSelectDate(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-label="Select Date"
        />

        <button
          onClick={handleNextDay}
          id="nutrition-date-next"
          className="p-2 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
          title="Next Day"
          aria-label="Next Day"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Return to Today Action */}
      {!isToday && (
        <button
          onClick={handleToday}
          id="nutrition-return-today"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-all shadow-2xs"
          title="Jump to today"
        >
          <RotateCcw size={14} />
          <span>Jump to Today</span>
        </button>
      )}
    </div>
  )
}
