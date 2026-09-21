import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart2,
  Trophy,
  TrendingUp,
  ChevronRight,
  Calendar,
  List,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import { PageHeader, StatCard, EmptyState } from '@/components/shared'
import { FourteenDayHistory } from '@/components/progress/FourteenDayHistory'
import { PeriodComparison } from '@/components/progress/PeriodComparison'
import { MuscleDistributionChart } from '@/components/progress/MuscleDistributionChart'
import { AiCoachInsightsPanel } from '@/components/progress/AiCoachInsightsPanel'
import { useProgress, type TimeRange } from '@/hooks/useProgress'
import { useWorkouts } from '@/hooks/useWorkouts'
import { formatDuration, formatRelativeDate, cn, formatVolumeDisplay } from '@/lib/utils'
import { ExerciseDetailModal } from '@/components/exercise/ExerciseDetailModal'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

// Expandable history session row
function HistorySessionRow({ session }: { session: any }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const sets = session.workout_session_sets || []
  const exerciseMap = useMemo(() => {
    const map = new Map<string, { name: string; sets: Array<{ weight: number; reps: number }> }>()
    for (const set of sets) {
      if (!set.completed) continue
      const name = set.exercise_name || 'Exercise'
      const cur = map.get(name) || { name, sets: [] as Array<{ weight: number; reps: number }> }
      cur.sets.push({ weight: Number(set.weight) || 0, reps: Number(set.reps) || 0 })
      map.set(name, cur)
    }
    return Array.from(map.values())
  }, [sets])

  const totalVolume = sets
    .filter((s: any) => s.completed)
    .reduce((acc: number, s: any) => acc + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)

  return (
    <article className="card bg-white border border-surface-200 rounded-xl shadow-2xs overflow-hidden">
      <button
        className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 hover:bg-surface-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        aria-label={`${session.workout_name} — expand details`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-surface-900 text-sm">
              {session.workout_name || 'Workout'}
            </h3>
            <span className={cn(
              'badge text-[10px] font-bold',
              session.status === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-surface-100 text-surface-500 border border-surface-200'
            )}>
              {session.status}
            </span>
          </div>
          <p className="text-xs text-surface-400">{formatRelativeDate(session.started_at)}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-surface-600 mt-2">
            {exerciseMap.length > 0 && (
              <span>{exerciseMap.length} exercise{exerciseMap.length !== 1 ? 's' : ''}</span>
            )}
            {sets.filter((s: any) => s.completed).length > 0 && (
              <span>{sets.filter((s: any) => s.completed).length} sets</span>
            )}
            {totalVolume > 0 && (
              <span className="font-semibold text-surface-800">
                {(totalVolume / 1000).toFixed(1)}k kg
              </span>
            )}
            {session.duration_seconds > 0 && (
              <span>{formatDuration(session.duration_seconds)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); navigate(`/history/${session.id}`) }}
            className="text-xs text-brand-600 hover:text-brand-700 font-bold hidden sm:flex items-center gap-0.5"
            aria-label="View full session record"
          >
            View <ChevronRight size={13} />
          </button>
          {expanded ? <ChevronUp size={16} className="text-surface-400" /> : <ChevronDown size={16} className="text-surface-400" />}
        </div>
      </button>

      {expanded && exerciseMap.length > 0 && (
        <div className="border-t border-surface-100 px-4 sm:px-5 py-3 space-y-2 animate-fade-in">
          {exerciseMap.map((ex, i) => (
            <div key={i} className="flex items-start justify-between text-xs gap-4">
              <span className="font-semibold text-surface-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-0.5" />
                {ex.name}
              </span>
              <div className="text-surface-500 text-right flex-shrink-0">
                {ex.sets.map((s, si) => (
                  <div key={si} className="font-mono">
                    {s.weight > 0 ? `${s.weight} kg × ${s.reps}` : `${s.reps} reps`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

export default function Progress() {
  const navigate = useNavigate()
  const {
    history,
    filteredHistory,
    periodComparison,
    muscleDistribution,
    stats,
    volumeChart,
    totalPeriodVolume,
    hasWorkoutData,
    personalRecords,
    timeRange,
    setTimeRange,
    loading,
    error,
  } = useProgress()

  const { activePlan, workouts } = useWorkouts()

  const [historyViewMode, setHistoryViewMode] = useState<'14day' | 'list'>('list')
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(null)
  const [selectedVolumeDay, setSelectedVolumeDay] = useState<{ date: string; value: number; label?: string } | null>(null)

  // Find sessions for selected volume day
  const inspectedDaySessions = useMemo(() => {
    if (!selectedVolumeDay) return []
    const targetLabel = selectedVolumeDay.label
    return history.filter(s => {
      if (!s.started_at) return false
      if (targetLabel && s.started_at.startsWith(targetLabel)) return true
      const d = new Date(s.started_at)
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return displayDate === selectedVolumeDay.date
    })
  }, [history, selectedVolumeDay])

  // Derived exercise progression
  const exerciseProgressList = useMemo(() => {
    if (!personalRecords || personalRecords.length === 0) return []
    return personalRecords.slice(0, 6).map(pr => {
      let latestWeight = pr.value
      filteredHistory.forEach(session => {
        const matchingSet = session.workout_session_sets?.find(
          s => s.exercise_id === pr.exerciseId && s.completed && s.weight
        )
        if (matchingSet && matchingSet.weight) {
          latestWeight = matchingSet.weight
        }
      })
      const pct = pr.value > 0 ? Math.min(100, Math.round((latestWeight / pr.value) * 100)) : 100
      return {
        id: pr.exerciseId,
        name: pr.exerciseName,
        bestWeight: pr.value,
        latestWeight,
        unit: pr.unit || 'kg',
        progressPct: pct,
        achievedAt: pr.achievedAt,
      }
    })
  }, [personalRecords, filteredHistory])

  // Training consistency for the filtered period
  const consistencyStats = useMemo(() => {
    const completed = filteredHistory.filter(s => s.status === 'completed')
    const uniqueDays = new Set(
      completed.map(s => {
        const d = new Date(s.started_at)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      })
    )
    const daysWithWorkout = uniqueDays.size
    const weeksInPeriod = timeRange === '7d' ? 1 : timeRange === '30d' ? 4.3 : null
    const avgPerWeek = weeksInPeriod && weeksInPeriod > 0
      ? (completed.length / weeksInPeriod).toFixed(1)
      : null

    return { sessions: completed.length, daysWithWorkout, avgPerWeek }
  }, [filteredHistory, timeRange])

  if (loading && history.length === 0) {
    return <div className="p-12 text-center text-surface-500 font-medium animate-pulse">Loading training progress...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 font-medium">{error}</div>
  }

  const periodLabels: Record<TimeRange, string> = {
    '7d': '7 Days',
    '30d': '30 Days',
    'all': 'All Time',
  }

  return (
    <div className="animate-fade-in space-y-8 pb-4 max-w-5xl mx-auto w-full">
      <PageHeader
        title="Progress & History"
        description="Historical analytics, exercise progression, training balance, and AI-grounded insights."
      />

      {/* ── 1. PERIOD SELECTOR ── */}
      <section aria-label="Period selector">
        <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-xl border border-surface-200 w-fit">
          {(['7d', '30d', 'all'] as TimeRange[]).map(range => (
            <button
              key={range}
              id={`progress-period-${range}`}
              aria-pressed={timeRange === range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-bold transition-all',
                timeRange === range
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-surface-600 hover:text-surface-900 hover:bg-white/50'
              )}
            >
              {periodLabels[range]}
            </button>
          ))}
        </div>
      </section>

      {/* ── 2. PERFORMANCE SUMMARY ── */}
      <section aria-label="Performance summary" className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-surface-400">
          Performance Summary — {periodLabels[timeRange]}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <StatCard
            label="Sessions"
            value={consistencyStats.sessions}
            icon={<BarChart2 size={18} />}
          />
          <StatCard
            label="Total Volume"
            value={periodComparison.currentVolume > 0
              ? ((periodComparison.currentVolume / 1000).toFixed(1))
              : '0'
            }
            unit="k kg"
            icon={<TrendingUp size={18} />}
          />
          <StatCard
            label="Days Trained"
            value={consistencyStats.daysWithWorkout}
            icon={<Calendar size={18} />}
          />
          <StatCard
            label="Personal Bests"
            value={personalRecords?.length || 0}
            unit="records"
            icon={<Trophy size={18} />}
          />
        </div>
      </section>

      {/* ── 3. PERIOD COMPARISON ── */}
      {timeRange !== 'all' && (
        <section aria-label="Period comparison">
          <PeriodComparison
            comparison={periodComparison}
            timeRange={timeRange as '7d' | '30d'}
          />
        </section>
      )}

      {/* ── 4. VOLUME TREND CHART ── */}
      <section aria-label="Volume trend" className="space-y-3">
        <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
            <div>
              <h3 className="text-sm font-bold text-surface-900">Volume Trend</h3>
              <p className="text-xs text-surface-500 mt-0.5">Aggregate tonnage lifted per day — {periodLabels[timeRange].toLowerCase()}.</p>
            </div>
            {hasWorkoutData && (
              <div className="text-left sm:text-right">
                <span className="text-xs text-surface-400 font-medium">Total volume: </span>
                <span className="text-base font-extrabold text-brand-700">
                  {formatVolumeDisplay(totalPeriodVolume)}
                </span>
              </div>
            )}
          </div>
          <div className="min-h-[220px]">
            {hasWorkoutData && volumeChart && volumeChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={volumeChart}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onClick={(state) => {
                    if (state && state.activePayload && state.activePayload[0]) {
                      setSelectedVolumeDay(state.activePayload[0].payload)
                    }
                  }}
                  className="cursor-pointer"
                >
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    dy={10}
                    interval={timeRange === '7d' ? 0 : timeRange === '30d' ? 4 : 'preserveStartEnd'}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(val: number) => {
                      if (val === 0) return '0'
                      if (val >= 1000) {
                        const k = val / 1000
                        return `${k >= 10 ? Math.round(k) : k.toFixed(1)}k`
                      }
                      return `${val}`
                    }}
                  />
                  <Tooltip
                    cursor={{ stroke: '#2563eb', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '10px',
                      border: 'none',
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.2)'
                    }}
                    itemStyle={{ color: '#F8FAFC', fontSize: '12px', fontWeight: 700 }}
                    labelStyle={{ color: '#94A3B8', fontSize: '11px', fontWeight: 500, marginBottom: '2px' }}
                    formatter={(value: number) => [`${value.toLocaleString()} kg`, 'Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#volumeGrad)"
                    activeDot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-2.5 text-surface-400">
                  <TrendingUp size={22} />
                </div>
                <p className="text-sm font-bold text-surface-800">No volume data yet</p>
                <p className="text-xs text-surface-500 mt-1 max-w-xs leading-relaxed">
                  Log your first workout to start tracking your training volume.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Date Inspection Drawer */}
          {selectedVolumeDay && (
            <div className="mt-4 p-4 rounded-xl bg-surface-50 border border-surface-200 animate-slide-up space-y-2 relative">
              <button
                type="button"
                onClick={() => setSelectedVolumeDay(null)}
                className="absolute top-3 right-3 p-1 rounded-lg text-surface-400 hover:text-surface-700"
                aria-label="Close date details"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-surface-900">
                  {selectedVolumeDay.date}
                </span>
                <span className={cn(
                  'badge text-[10px] font-bold',
                  selectedVolumeDay.value > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-surface-100 text-surface-500'
                )}>
                  {formatVolumeDisplay(selectedVolumeDay.value)}
                </span>
              </div>

              {inspectedDaySessions.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {inspectedDaySessions.map((session, sIdx) => {
                    const sets = session.workout_session_sets || []
                    const exMap = new Map<string, Array<{ weight: number; reps: number }>>()
                    sets.forEach((s: any) => {
                      if (!s.completed) return
                      const name = s.exercise_name || 'Exercise'
                      const cur = exMap.get(name) || []
                      cur.push({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 })
                      exMap.set(name, cur)
                    })
                    const exercises = Array.from(exMap.entries())

                    return (
                      <div key={sIdx} className="text-xs space-y-1.5 border-t border-surface-200/60 pt-2 first:border-0 first:pt-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-surface-900">{session.workout_name || 'Workout'}</span>
                          <span className="text-surface-500 font-mono text-[11px]">
                            {session.duration_seconds != null && session.duration_seconds > 0 && `${formatDuration(session.duration_seconds)} · `}
                            {formatVolumeDisplay(Number(session.total_volume) || 0)}
                          </span>
                        </div>
                        {exercises.length > 0 && (
                          <div className="space-y-1 pl-2">
                            {exercises.map(([exName, exSets], eIdx) => (
                              <div key={eIdx} className="flex justify-between text-[11px] text-surface-600">
                                <span>• {exName}</span>
                                <span className="font-mono text-surface-500">
                                  {exSets.map(s => s.weight > 0 ? `${s.weight}kg×${s.reps}` : `${s.reps}r`).join(', ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : selectedVolumeDay.value > 0 ? (
                <p className="text-xs text-surface-600">
                  {formatVolumeDisplay(selectedVolumeDay.value)} total volume recorded on this date.
                </p>
              ) : (
                <p className="text-xs text-surface-500">
                  Rest day · No workouts logged on this date.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. TRAINING CONSISTENCY ── */}
      <section aria-label="Training consistency" className="space-y-3">
        <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-surface-900">Training Consistency</h3>
            <p className="text-xs text-surface-500 mt-0.5">Session frequency over the selected period.</p>
          </div>
          {consistencyStats.sessions === 0 ? (
            <p className="text-sm text-surface-400 font-medium">No sessions recorded in this period.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Sessions</p>
                <p className="text-2xl font-black text-surface-900 mt-1">{consistencyStats.sessions}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Days Trained</p>
                <p className="text-2xl font-black text-surface-900 mt-1">{consistencyStats.daysWithWorkout}</p>
              </div>
              {consistencyStats.avgPerWeek && (
                <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Avg / Week</p>
                  <p className="text-2xl font-black text-surface-900 mt-1">{consistencyStats.avgPerWeek}</p>
                </div>
              )}
              {stats?.currentStreak != null && (
                <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Current Streak</p>
                  <p className="text-2xl font-black text-surface-900 mt-1">{stats.currentStreak} <span className="text-xs font-semibold text-surface-500">days</span></p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 6. MUSCLE DISTRIBUTION ── */}
      <section aria-label="Muscle distribution">
        <MuscleDistributionChart distribution={muscleDistribution} />
      </section>

      {/* ── 7. EXERCISE PROGRESSION ── */}
      <section aria-label="Exercise progression" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-surface-900 tracking-tight">Exercise Progression</h2>
            <p className="text-xs text-surface-500 mt-0.5">Select an exercise to view 1RM trajectory and detailed logs.</p>
          </div>
          <select
            aria-label="Select exercise to view progression"
            onChange={(e) => {
              const ex = DEFAULT_EXERCISES.find(item => item.id === e.target.value)
              if (ex) setSelectedExercise({ id: ex.id, name: ex.name })
            }}
            defaultValue=""
            className="bg-white border border-surface-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            <option value="" disabled>Select exercise...</option>
            {DEFAULT_EXERCISES.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscle_group})</option>
            ))}
          </select>
        </div>

        {exerciseProgressList.length > 0 && (
          <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Key Movement Benchmarks</h3>
            <div className="space-y-4">
              {exerciseProgressList.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExercise({ id: ex.id, name: ex.name })}
                  className="group cursor-pointer space-y-1.5 p-2 rounded-xl hover:bg-surface-50 transition-colors"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedExercise({ id: ex.id, name: ex.name })}
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-surface-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                      <Dumbbell size={14} className="text-surface-400" />
                      {ex.name}
                    </span>
                    <span className="font-mono text-surface-600 font-semibold text-xs">
                      {ex.latestWeight} {ex.unit} <span className="text-surface-400 font-normal">/ {ex.bestWeight} {ex.unit} peak</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${ex.progressPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── 8. PERSONAL BESTS ── */}
      <section aria-label="Personal records" className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-surface-900 tracking-tight">Personal Bests</h2>
          <p className="text-xs text-surface-500 mt-0.5">Highest recorded working weight per exercise.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalRecords && personalRecords.length > 0 ? (
            personalRecords.map(pr => (
              <div
                key={pr.id}
                className="card p-5 relative overflow-hidden group hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-white border border-surface-200 rounded-2xl shadow-xs"
                onClick={() => setSelectedExercise({ id: pr.exerciseId, name: pr.exerciseName })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedExercise({ id: pr.exerciseId, name: pr.exerciseName })}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-105 transition-transform">
                    <Trophy size={18} aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-medium text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full">
                    {formatRelativeDate(pr.achievedAt)}
                  </span>
                </div>
                <h3 className="font-bold text-surface-900 mb-1 group-hover:text-brand-600 transition-colors flex items-center justify-between text-sm">
                  <span>{pr.exerciseName}</span>
                  <ChevronRight size={15} className="text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <div className="flex items-end gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-brand-600 tracking-tight">{pr.value}</span>
                  <span className="text-xs font-semibold text-surface-500 mb-1">{pr.unit}</span>
                </div>
                <p className="text-[10px] text-surface-400 mt-2 flex items-center gap-1">
                  <TrendingUp size={11} className="text-brand-500" /> View 1RM & progression graph
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full card p-8 text-center text-surface-500 bg-white border border-surface-200 text-xs rounded-2xl">
              No personal records yet. Complete your first session to set baselines!
            </div>
          )}
        </div>
      </section>

      {/* ── 9. TRAINING HISTORY ── */}
      <section aria-label="Training history" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-surface-900 tracking-tight">Training History</h2>
            <p className="text-xs text-surface-500 mt-0.5">
              {filteredHistory.length} session{filteredHistory.length !== 1 ? 's' : ''} — {periodLabels[timeRange].toLowerCase()}
            </p>
          </div>

          {filteredHistory.length > 0 && (
            <div className="flex items-center bg-surface-100 rounded-lg p-1 border border-surface-200 self-start sm:self-auto">
              <button
                onClick={() => setHistoryViewMode('list')}
                id="progress-tab-list"
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  historyViewMode === 'list'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                <List size={13} /> All Sessions ({filteredHistory.length})
              </button>
              {timeRange === '30d' || timeRange === 'all' ? (
                <button
                  onClick={() => setHistoryViewMode('14day')}
                  id="progress-tab-14day"
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    historyViewMode === '14day'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
                >
                  <Calendar size={13} /> Calendar
                </button>
              ) : null}
            </div>
          )}
        </div>

        {filteredHistory.length === 0 ? (
          <EmptyState
            title="No workouts in this period"
            description="No sessions were logged during the selected period. Try selecting a broader range or start logging today."
            icon={<Calendar size={28} className="text-brand-500" />}
            action={
              <button className="btn-primary text-xs" onClick={() => navigate('/dashboard')}>
                Log Today's Training
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
            {filteredHistory.map(session => (
              <HistorySessionRow key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>

      {/* ── 10. AI COACH INSIGHTS ── */}
      <section aria-label="AI Coach Insights" className="space-y-3">
        <AiCoachInsightsPanel
          comparison={periodComparison}
          muscleDistribution={muscleDistribution}
          timeRange={timeRange}
          totalWorkouts={stats?.totalWorkouts || 0}
          filteredSessions={filteredHistory}
        />
      </section>

      {/* Exercise Detail & Intelligence Modal */}
      <ExerciseDetailModal
        exerciseId={selectedExercise?.id || null}
        exerciseName={selectedExercise?.name}
        open={Boolean(selectedExercise)}
        onOpenChange={(open) => !open && setSelectedExercise(null)}
      />
    </div>
  )
}
