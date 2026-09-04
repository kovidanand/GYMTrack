import { Clock, Dumbbell, Calendar, BarChart2 } from 'lucide-react'
import { cn, formatDuration, formatRelativeDate } from '@/lib/utils'
import type { Workout, WorkoutSession } from '@/types'

// ─── Workout Card ──────────────────────────────────────────────────────────────

const workoutTagColors: Record<string, string> = {
  'push':        'bg-rose-50 text-rose-700',
  'pull':        'bg-blue-50 text-blue-700',
  'legs':        'bg-amber-50 text-amber-700',
  'upper-body':  'bg-violet-50 text-violet-700',
  'lower-body':  'bg-orange-50 text-orange-700',
  'full-body':   'bg-emerald-50 text-emerald-700',
  'compound':    'bg-brand-50 text-brand-700',
  'strength':    'bg-indigo-50 text-indigo-700',
}

interface WorkoutCardProps {
  workout: Workout
  onClick?: (workout: Workout) => void
}

export function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  const primaryTag = workout.tags[0]
  const tagClass = primaryTag ? (workoutTagColors[primaryTag] ?? 'bg-surface-100 text-surface-600') : 'bg-surface-100 text-surface-600'

  return (
    <article
      className="card card-hover group cursor-pointer"
      onClick={() => onClick?.(workout)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.(workout)}
      aria-label={`${workout.name} workout`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors leading-snug">
            {workout.name}
          </h3>
          {workout.description && (
            <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{workout.description}</p>
          )}
        </div>
        {primaryTag && (
          <span className={cn('badge flex-shrink-0 border-0', tagClass)}>
            {primaryTag}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-surface-500">
        <span className="flex items-center gap-1">
          <Dumbbell size={12} aria-hidden="true" />
          {workout.exercises.length} exercises
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} aria-hidden="true" />
          ~{formatDuration(workout.estimatedDuration)}
        </span>
        {workout.lastCompleted && (
          <span className="flex items-center gap-1">
            <Calendar size={12} aria-hidden="true" />
            {formatRelativeDate(workout.lastCompleted)}
          </span>
        )}
      </div>
    </article>
  )
}

// ─── Session Card ──────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: WorkoutSession
  compact?: boolean
}

export function SessionCard({ session, compact }: SessionCardProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-surface-100 last:border-0">
        <div>
          <p className="text-sm font-medium text-surface-900">{session.workoutName}</p>
          <p className="text-xs text-surface-500">{formatRelativeDate(session.startedAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-surface-900">{formatDuration(session.duration)}</p>
          <p className="text-xs text-surface-500">{(session.totalVolume / 1000).toFixed(1)}k kg</p>
        </div>
      </div>
    )
  }

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-surface-900 text-sm">{session.workoutName}</h3>
          <p className="text-xs text-surface-500">{formatRelativeDate(session.startedAt)}</p>
        </div>
        <span className="badge bg-emerald-50 text-emerald-700 border-0 text-xs">Completed</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-base font-bold text-surface-900">{formatDuration(session.duration)}</p>
          <p className="text-[10px] text-surface-500 uppercase tracking-wide">Duration</p>
        </div>
        <div className="text-center border-x border-surface-100">
          <p className="text-base font-bold text-surface-900">{session.exercises.length || '—'}</p>
          <p className="text-[10px] text-surface-500 uppercase tracking-wide">Exercises</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-surface-900">{(session.totalVolume / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-surface-500 uppercase tracking-wide">Volume (kg)</p>
        </div>
      </div>

      {session.notes && (
        <p className="mt-3 text-xs text-surface-500 italic border-t border-surface-100 pt-3">
          "{session.notes}"
        </p>
      )}
    </article>
  )
}

// ─── Weekly Activity Bar ───────────────────────────────────────────────────────

interface DayActivityProps {
  day: string
  trained: boolean
  duration?: number
  isToday?: boolean
}

export function DayActivity({ day, trained, duration, isToday }: DayActivityProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          'w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all',
          trained
            ? 'bg-brand-500 text-white shadow-sm'
            : isToday
            ? 'bg-surface-100 border-2 border-brand-300 text-surface-400'
            : 'bg-surface-100 text-surface-300'
        )}
        title={trained && duration ? `${formatDuration(duration)}` : undefined}
        aria-label={`${day}: ${trained ? `trained${duration ? ` (${formatDuration(duration)})` : ''}` : 'rest day'}`}
      >
        {trained ? (
          <BarChart2 size={16} aria-hidden="true" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
        )}
      </div>
      <span className={cn('text-[10px] font-medium', isToday ? 'text-brand-600' : 'text-surface-500')}>
        {day}
      </span>
    </div>
  )
}
