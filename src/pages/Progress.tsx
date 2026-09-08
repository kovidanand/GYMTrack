import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Clock, Flame, BarChart2, Trophy, Sparkles, ChevronRight, Calendar, List } from 'lucide-react'
import { PageHeader, StatCard, SectionHeader, EmptyState } from '@/components/shared'
import { FourteenDayHistory } from '@/components/progress/FourteenDayHistory'
import { useProgress } from '@/hooks/useProgress'
import { useWorkouts } from '@/hooks/useWorkouts'
import { formatDuration, formatRelativeDate } from '@/lib/utils'
import { ExerciseDetailModal } from '@/components/exercise/ExerciseDetailModal'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

export default function Progress() {
  const navigate = useNavigate()
  const { history, stats, volumeChart, personalRecords, timeRange, setTimeRange, loading, error } = useProgress()
  const { activePlan, workouts } = useWorkouts()

  const [historyViewMode, setHistoryViewMode] = useState<'14day' | 'list'>('14day')
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(null)

  if (loading) {
    return <div className="p-12 text-center text-surface-500 font-medium animate-pulse">Loading training progress...</div>
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500 font-medium">{error}</div>
  }

  return (
    <div className="animate-fade-in space-y-8 pb-28 max-w-5xl mx-auto">
      <PageHeader
        title="Progress & History"
        description="Review your 14-day training consistency, volume analytics, and personal records."
      />

      {/* ── Key Stats ── */}
      <section aria-label="Key statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <StatCard
            label="Total Workouts"
            value={stats?.totalWorkouts || 0}
            icon={<Activity size={18} />}
            trend="up"
            trendValue={`${stats?.workoutsThisMonth || 0} this month`}
          />
          <StatCard
            label="Training Time"
            value={Math.round((stats?.totalTrainingTime || 0) / 3600)}
            unit="hours"
            icon={<Clock size={18} />}
            trend="up"
          />
          <StatCard
            label="Current Streak"
            value={stats?.currentStreak || 0}
            unit="days"
            icon={<Flame size={18} />}
            trend="up"
            trendValue={`Best: ${stats?.longestStreak || 0} days`}
          />
          <StatCard
            label="Total Volume"
            value={((stats?.totalVolume || 0) / 1000).toFixed(1)}
            unit="k kg"
            icon={<BarChart2 size={18} />}
            trend="up"
          />
        </div>
      </section>

      {/* ── 14-Day Training History Section (Embedded) ── */}
      <section aria-label="Training history" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-surface-900 tracking-tight">Training History</h2>
            <p className="text-xs text-surface-500 mt-0.5">Your consecutive workout records and daily activity breakdown.</p>
          </div>

          {history.length > 0 && (
            <div className="flex items-center bg-surface-100 rounded-lg p-1 border border-surface-200 self-start sm:self-auto">
              <button
                onClick={() => setHistoryViewMode('14day')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  historyViewMode === '14day'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                <Calendar size={13} /> 14-Day View
              </button>
              <button
                onClick={() => setHistoryViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  historyViewMode === 'list'
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
            title="No workout records yet"
            description="Record your first workout to start building your permanent training history."
            icon={<Calendar size={28} className="text-brand-500" />}
            action={
              <button className="btn-primary text-xs" onClick={() => navigate('/workouts/quick')}>
                Start Today's Workout
              </button>
            }
          />
        ) : historyViewMode === '14day' ? (
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
                className="card p-4 sm:p-5 cursor-pointer hover:border-brand-300 transition-colors group bg-white border border-surface-200 shadow-2xs"
                onClick={() => navigate(`/history/${session.id}`)}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <h3 className="font-bold text-surface-900 group-hover:text-brand-600 transition-colors text-sm sm:text-base">
                      {session.workout_name}
                    </h3>
                    <p className="text-xs text-surface-400">{formatRelativeDate(session.started_at)}</p>
                  </div>
                  <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize font-bold text-[11px]">
                    {session.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-surface-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-surface-400" aria-hidden="true" />
                    <span className="text-surface-900 font-bold">{formatDuration(session.duration_seconds || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <BarChart2 size={14} className="text-surface-400" aria-hidden="true" />
                    <span className="text-surface-900 font-bold">
                      {((session.total_volume || 0) / 1000).toFixed(1)}k kg
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface-100 px-2 py-0.5 rounded font-semibold text-surface-700 text-[11px]">
                    <span>{session.completed_sets}</span> sets logged
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Training Volume Chart ── */}
      <section aria-label="Analytics charts">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-surface-900">Volume Analytics</h2>
            <p className="text-xs text-surface-500 mt-0.5">Aggregate tonnage lifted over time.</p>
          </div>
          <div className="flex bg-surface-100 p-1 rounded-lg">
            {(['7d', '30d', '90d', '1y'] as const).map(range => (
              <button
                key={range}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 min-h-[300px] bg-white border border-surface-200">
          {volumeChart && volumeChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} kg`, 'Volume']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#0EA5E9" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-[300px] flex items-center justify-center text-surface-400 text-xs">
               Not enough data to display chart.
             </div>
          )}
        </div>
      </section>

      {/* ── Personal Records ── */}
      <section aria-label="Personal records">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionHeader title="Personal Records" />
            <p className="text-xs text-surface-500 -mt-2">Highest recorded weight per exercise with Epley 1RM model.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalRecords && personalRecords.length > 0 ? (
            personalRecords.map(pr => (
              <div 
                key={pr.id} 
                className="card p-5 relative overflow-hidden group hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-white border border-surface-200"
                onClick={() => setSelectedExercise({ id: pr.exerciseId, name: pr.exerciseName })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedExercise({ id: pr.exerciseId, name: pr.exerciseName })}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-105 transition-transform">
                    <Trophy size={20} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-medium text-surface-500 bg-surface-100 px-2 py-1 rounded-full">
                    {formatRelativeDate(pr.achievedAt)}
                  </span>
                </div>
                
                <h3 className="font-semibold text-surface-900 mb-1 group-hover:text-brand-600 transition-colors flex items-center justify-between">
                  <span>{pr.exerciseName}</span>
                  <ChevronRight size={16} className="text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-brand-600 tracking-tight">{pr.value}</span>
                  <span className="text-sm font-semibold text-surface-500 mb-1">{pr.unit}</span>
                </div>
                <p className="text-[11px] text-surface-400 mt-2 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" /> View 1RM & progression graph
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full card p-8 text-center text-surface-500 bg-white border border-surface-200 text-xs">
              No personal records yet. Log your heavy sets to see them here!
            </div>
          )}
        </div>
      </section>

      {/* ── Exercise Detail & Intelligence Modal ── */}
      <ExerciseDetailModal
        exerciseId={selectedExercise?.id || null}
        exerciseName={selectedExercise?.name}
        open={Boolean(selectedExercise)}
        onOpenChange={(open) => !open && setSelectedExercise(null)}
      />
    </div>
  )
}
