import { useState } from 'react'
import { Activity, Clock, Flame, BarChart2, Trophy, Sparkles, ChevronRight } from 'lucide-react'
import { PageHeader, StatCard, SectionHeader } from '@/components/shared'
import { useProgress } from '@/hooks/useProgress'
import { formatRelativeDate } from '@/lib/utils'
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
  const { stats, volumeChart, personalRecords, timeRange, setTimeRange, loading, error } = useProgress()
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(null)

  if (loading) return <div className="p-8 text-center animate-pulse">Loading progress...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="animate-fade-in space-y-8 pb-24">
      <PageHeader
        title="Your Progress"
        description="Track your consistency, volume, and personal records."
      />

      {/* ── Key Stats ── */}
      <section aria-label="Key statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* ── Charts ── */}
      <section aria-label="Analytics charts">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-surface-900">Training Volume</h2>
          <div className="flex bg-surface-100 p-1 rounded-lg">
            {(['7d', '30d', '90d', '1y'] as const).map(range => (
              <button
                key={range}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
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

        <div className="card p-6 min-h-[300px]">
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
             <div className="h-[300px] flex items-center justify-center text-surface-500">
               Not enough data to display chart.
             </div>
          )}
        </div>
      </section>

      {/* ── Personal Records ── */}
      <section aria-label="Personal records">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Personal Records" />
          <span className="text-xs text-surface-500">
            Click any PR to view 1RM & progression curve
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalRecords && personalRecords.length > 0 ? (
            personalRecords.map(pr => (
              <div 
                key={pr.id} 
                className="card p-5 relative overflow-hidden group hover:border-amber-300 hover:shadow-md transition-all cursor-pointer"
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
            <div className="col-span-full card p-8 text-center text-surface-500">
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
