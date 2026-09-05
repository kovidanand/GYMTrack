import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, BarChart2 } from 'lucide-react'
import { useProgress } from '@/hooks/useProgress'
import { PageHeader, EmptyState } from '@/components/shared'
import { formatDuration, formatRelativeDate } from '@/lib/utils'

export default function History() {
  const navigate = useNavigate()
  const { history, loading, error } = useProgress()

  if (loading) return <div className="p-8 text-center animate-pulse">Loading history...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      <PageHeader
        title="Workout History"
        description="Review your past training sessions."
      />

      {history.length === 0 ? (
        <EmptyState
          title="No history yet"
          description="Complete your first workout to see it here."
          icon={<Calendar size={24} />}
          action={
            <button className="btn-primary" onClick={() => navigate('/workouts')}>
              Go to Workouts
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {history.map(session => (
            <article 
              key={session.id} 
              className="card p-5 cursor-pointer hover:border-brand-300 transition-colors group"
              onClick={() => navigate(`/history/${session.id}`)}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                    {session.workout_name}
                  </h3>
                  <p className="text-sm text-surface-500">{formatRelativeDate(session.started_at)}</p>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700 border-0 capitalize">
                  {session.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-surface-600">
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-surface-400" aria-hidden="true" />
                  <span className="font-medium text-surface-900">{formatDuration(session.duration_seconds || 0)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart2 size={16} className="text-surface-400" aria-hidden="true" />
                  <span className="font-medium text-surface-900">
                    {((session.total_volume || 0) / 1000).toFixed(1)}k kg
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs bg-surface-100 px-2 py-1 rounded">
                  <span className="font-semibold text-surface-700">{session.completed_sets}</span> sets
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
