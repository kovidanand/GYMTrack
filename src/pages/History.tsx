import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, BarChart2, List, LayoutGrid } from 'lucide-react'
import { useProgress } from '@/hooks/useProgress'
import { useWorkouts } from '@/hooks/useWorkouts'
import { PageHeader, EmptyState } from '@/components/shared'
import { FourteenDayHistory } from '@/components/progress/FourteenDayHistory'
import { formatDuration, formatRelativeDate } from '@/lib/utils'

export default function History() {
  const navigate = useNavigate()
  const { history, loading, error } = useProgress()
  const { activePlan, workouts } = useWorkouts()
  const [viewMode, setViewMode] = useState<'14day' | 'list'>('14day')

  if (loading) return <div className="p-8 text-center animate-pulse">Loading history...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Workout History"
          description="Review your past training sessions and 14-day training consistency."
          className="mb-0"
        />

        {history.length > 0 && (
          <div className="flex items-center bg-surface-100 rounded-lg p-1 border border-surface-200 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('14day')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === '14day'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <Calendar size={13} /> 14-Day View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <List size={13} /> All Sessions ({history.length})
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState
          title="No history yet"
          description="Complete your first workout to see your 14-day calendar and session records here."
          icon={<Calendar size={28} className="text-brand-500" />}
          action={
            <button className="btn-primary" onClick={() => navigate('/workouts')}>
              Go to Workouts
            </button>
          }
        />
      ) : viewMode === '14day' ? (
        <FourteenDayHistory
          sessions={history}
          activePlan={activePlan}
          workouts={workouts}
        />
      ) : (
        <div className="space-y-3 animate-fade-in">
          {history.map(session => (
            <article 
              key={session.id} 
              className="card p-5 cursor-pointer hover:border-brand-300 transition-colors group"
              onClick={() => navigate(`/history/${session.id}`)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-surface-900 group-hover:text-brand-600 transition-colors">
                    {session.workout_name}
                  </h3>
                  <p className="text-xs text-surface-500">{formatRelativeDate(session.started_at)}</p>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize font-bold text-xs">
                  {session.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs text-surface-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock size={15} className="text-surface-400" aria-hidden="true" />
                  <span className="text-surface-900 font-bold">{formatDuration(session.duration_seconds || 0)}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <BarChart2 size={15} className="text-surface-400" aria-hidden="true" />
                  <span className="text-surface-900 font-bold">
                    {((session.total_volume || 0) / 1000).toFixed(1)}k kg
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-100 px-2 py-0.5 rounded font-semibold text-surface-700">
                  <span>{session.completed_sets}</span> sets completed
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
