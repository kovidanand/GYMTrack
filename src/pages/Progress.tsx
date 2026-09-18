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
import type { PersonalRecord } from '@/types'
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
      const existing = map.get(name) || { name, sets: [] as Array<{ weight: number; reps: number }> }
      existing.sets.push({ weight: set.weight || 0, reps: set.reps || 0 })
      map.set(name, existing)
    }
    return Array.from(map.values())
  }, [sets])

  const totalSessionVolume = sets.reduce(
    (acc: number, s: any) => acc + (s.completed && s.weight && s.reps ? s.weight * s.reps : 0),
    0
  )

  const durationMin = session.duration_seconds ? Math.round(session.duration_seconds / 60) : null

  return (
    <div className="card p-4 transition-all bg-[#151A23] border border-[#202733] hover:border-brand-500/30 rounded-2xl">
      <div
        className="flex items-center justify-between cursor-pointer gap-2"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            <Dumbbell size={18} className="text-brand-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm truncate">{session.workout_title || 'Workout Session'}</h3>
            <p className="text-xs text-surface-400">
              {formatRelativeDate(session.started_at)}
              {durationMin ? ` · ${durationMin} min` : ''}
              {totalSessionVolume > 0 ? ` · ${formatVolumeDisplay(totalSessionVolume)}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-surface-300 hidden sm:inline">
            {sets.filter((s: any) => s.completed).length} sets
          </span>
          <button
            type="button"
            className="p-1 text-surface-400 hover:text-white transition-colors"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#1F2633] space-y-2 animate-fade-in text-xs">
          {exerciseMap.length > 0 ? (
            exerciseMap.map((ex, idx) => (
              <div key={idx} className="flex items-start justify-between py-1 border-b border-[#1F2633]/60 last:border-0">
                <span className="font-medium text-surface-200">{ex.name}</span>
                <span className="text-surface-400 font-mono text-[11px]">
                  {ex.sets.map((s) => `${s.weight}kg×${s.reps}`).join(', ')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-surface-500 text-xs italic">No set details recorded for this session.</p>
          )}
        </div>
      )}
    </div>
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
    refresh
  } = useProgress()

  const { activePlan, workouts } = useWorkouts()

  const [selectedVolumeDay, setSelectedVolumeDay] = useState<{ date: string; value: number; label?: string } | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(null)
  const [historyViewMode, setHistoryViewMode] = useState<'list' | '14day'>('list')

  const inspectedDaySessions = useMemo(() => {
    if (!selectedVolumeDay) return []
    return history.filter(s => {
      if (s.status !== 'completed' || !s.started_at) return false
      const sessionDate = new Date(s.started_at).toISOString().split('T')[0]
      return sessionDate === selectedVolumeDay.label || sessionDate === selectedVolumeDay.date
    })
  }, [history, selectedVolumeDay])

  // Derived exercise progression
  const exerciseProgressList = useMemo(() => {
    if (!personalRecords || personalRecords.length === 0) return []
    return personalRecords.slice(0, 6).map((pr: PersonalRecord) => {
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

  const consistencyStats = useMemo(() => {
    const completed = filteredHistory.filter(s => s.status === 'completed')
    const daysWithWorkout = new Set(
      completed.map(s => new Date(s.started_at).toDateString())
    ).size
    const weeks = timeRange === '7d' ? 1 : timeRange === '30d' ? 4.3 : 12
    const avgPerWeek = (daysWithWorkout / weeks).toFixed(1)
    return { sessions: completed.length, daysWithWorkout, avgPerWeek }
  }, [filteredHistory, timeRange])

  if (loading && history.length === 0) {
    return <div className="p-12 text-center text-surface-400 font-medium animate-pulse">Loading training progress...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-400 font-medium">{error}</div>
  }

  const periodLabels: Record<TimeRange, string> = {
    '7d': '7 Days',
    '30d': '30 Days',
    'all': 'All Time',
  }

  return (
    <div className="animate-fade-in space-y-8 pb-28 max-w-5xl mx-auto">
      <PageHeader
        title="Progress & Analytics"
        description="Historical volume, training consistency, progressive overload, and personal records."
      />

      {/* ── 1. PERIOD SELECTOR ── */}
      <section aria-label="Period selector">
        <div className="flex items-center gap-1 bg-[#11151D] p-1.5 rounded-2xl border border-[#1F2633] w-fit shadow-xs">
          {(['7d', '30d', 'all'] as TimeRange[]).map(range => (
            <button
              key={range}
              id={`progress-period-${range}`}
              aria-pressed={timeRange === range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                timeRange === range
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white hover:bg-[#151A23]'
              )}
            >
              {periodLabels[range]}
            </button>
          ))}
        </div>
      </section>

      {/* ── 2. PERFORMANCE SUMMARY ── */}
      <section aria-label="Performance summary" className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-surface-400">
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
        <div className="card p-5 sm:p-6 bg-[#151A23] border border-[#202733] rounded-2xl shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Volume Trend</h3>
              <p className="text-xs text-surface-400 mt-0.5">Aggregate tonnage lifted per day — {periodLabels[timeRange].toLowerCase()}.</p>
            </div>
            {hasWorkoutData && (
              <div className="text-left sm:text-right">
                <span className="text-xs text-surface-400 font-medium">Total volume: </span>
                <span className="text-base font-black text-brand-400">
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
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2633" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    dy={10}
                    interval={timeRange === '7d' ? 0 : timeRange === '30d' ? 4 : 'preserveStartEnd'}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
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
                    cursor={{ stroke: '#8b5cf6', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    contentStyle={{
                      backgroundColor: '#0D1017',
                      borderRadius: '12px',
                      border: '1px solid #242D3C',
                      padding: '8px 12px',
                      boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.6)'
                    }}
                    itemStyle={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 700 }}
                    labelStyle={{ color: '#94A3B8', fontSize: '11px', fontWeight: 500, marginBottom: '2px' }}
                    formatter={(value: number) => [`${value.toLocaleString()} kg`, 'Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fill="url(#volumeGrad)"
                    activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#11151D] border border-[#1F2633] flex items-center justify-center mb-2.5 text-surface-400">
                  <TrendingUp size={22} />
                </div>
                <p className="text-sm font-bold text-white">No volume data yet</p>
                <p className="text-xs text-surface-400 mt-1 max-w-xs leading-relaxed">
                  Log your first workout to start tracking your training volume.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Date Inspection Drawer */}
          {selectedVolumeDay && (
            <div className="mt-4 p-4 rounded-xl bg-[#11151D] border border-[#1F2633] animate-slide-up space-y-2 relative">
              <button
                type="button"
                onClick={() => setSelectedVolumeDay(null)}
                className="absolute top-3 right-3 p-1 rounded-lg text-surface-400 hover:text-white"
                aria-label="Close date details"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">
                  {selectedVolumeDay.date}
                </span>
                <span className={cn(
                  'badge text-[10px] font-bold',
                  selectedVolumeDay.value > 0
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-[#1A202B] text-surface-400 border border-[#242D3C]'
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
                      <div key={sIdx} className="text-xs space-y-1.5 border-t border-[#1F2633] pt-2 first:border-0 first:pt-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{session.workout_name || 'Workout'}</span>
                          <span className="text-surface-400 font-mono text-[11px]">
                            {session.duration_seconds != null && session.duration_seconds > 0 && `${formatDuration(session.duration_seconds)} · `}
                            {formatVolumeDisplay(Number(session.total_volume) || 0)}
                          </span>
                        </div>
                        {exercises.length > 0 && (
                          <div className="space-y-1 pl-2">
                            {exercises.map(([exName, exSets], eIdx) => (
                              <div key={eIdx} className="flex justify-between text-[11px] text-surface-400">
                                <span>• {exName}</span>
                                <span className="font-mono text-surface-300">
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
                <p className="text-xs text-surface-300">
                  {formatVolumeDisplay(selectedVolumeDay.value)} total volume recorded on this date.
                </p>
              ) : (
                <p className="text-xs text-surface-400">
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
            <h2 className="text-lg font-bold text-white tracking-tight">Exercise Progression</h2>
            <p className="text-xs text-surface-400 mt-0.5">Select an exercise to view 1RM trajectory and detailed logs.</p>
          </div>
          <select
            aria-label="Select exercise to view progression"
            onChange={(e) => {
              const ex = DEFAULT_EXERCISES.find(item => item.id === e.target.value)
              if (ex) setSelectedExercise({ id: ex.id, name: ex.name })
            }}
            defaultValue=""
            className="bg-[#11151D] border border-[#202733] rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            <option value="" disabled className="bg-[#151A23]">Select exercise...</option>
            {DEFAULT_EXERCISES.map((ex: any) => (
              <option key={ex.id} value={ex.id} className="bg-[#151A23]">{ex.name} ({ex.muscle_group})</option>
            ))}
          </select>
        </div>

        {exerciseProgressList.length > 0 && (
          <div className="card p-5 sm:p-6 bg-[#151A23] border border-[#202733] rounded-2xl shadow-card space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-surface-400">Key Movement Benchmarks</h3>
            <div className="space-y-4">
              {exerciseProgressList.map((ex: any) => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExercise({ id: ex.id, name: ex.name })}
                  className="group cursor-pointer space-y-1.5 p-2.5 rounded-xl hover:bg-[#1A202B] transition-colors"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedExercise({ id: ex.id, name: ex.name })}
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-white group-hover:text-brand-300 transition-colors flex items-center gap-2">
                      <Dumbbell size={14} className="text-brand-400" />
                      {ex.name}
                    </span>
                    <span className="font-mono text-surface-300 font-semibold text-xs">
                      {ex.latestWeight} {ex.unit} <span className="text-surface-500 font-normal">/ {ex.bestWeight} {ex.unit} peak</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#11151D] overflow-hidden border border-[#1F2633]">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-700 ease-out"
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
          <h2 className="text-lg font-bold text-white tracking-tight">Personal Bests</h2>
          <p className="text-xs text-surface-400 mt-0.5">Highest recorded working weight per exercise.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalRecords && personalRecords.length > 0 ? (
            personalRecords.map((pr: PersonalRecord) => (
              <div
                key={pr.id}
                className="card p-5 relative overflow-hidden group hover:border-amber-500/40 hover:bg-[#1A202B] transition-all cursor-pointer bg-[#151A23] border border-[#202733] rounded-2xl shadow-card"
                onClick={() => setSelectedExercise({ id: pr.exerciseId, name: pr.exerciseName })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedExercise({ id: pr.exerciseId, name: pr.exerciseName })}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <Trophy size={18} aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-medium text-surface-400 bg-[#11151D] border border-[#1F2633] px-2.5 py-0.5 rounded-full">
                    {formatRelativeDate(pr.achievedAt)}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-1 group-hover:text-brand-300 transition-colors flex items-center justify-between text-sm">
                  <span>{pr.exerciseName}</span>
                  <ChevronRight size={15} className="text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <div className="flex items-end gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">{pr.value}</span>
                  <span className="text-xs font-semibold text-surface-400 mb-1">{pr.unit}</span>
                </div>
                <p className="text-[10px] text-surface-400 mt-2 flex items-center gap-1">
                  <TrendingUp size={11} className="text-brand-400" /> View 1RM & progression graph
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full card p-8 text-center text-surface-400 bg-[#151A23] border border-[#202733] text-xs rounded-2xl">
              No personal records yet. Complete your first session to set baselines!
            </div>
          )}
        </div>
      </section>

      {/* ── 9. TRAINING HISTORY ── */}
      <section aria-label="Training history" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2633] pb-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Training History</h2>
            <p className="text-xs text-surface-400 mt-0.5">
              {filteredHistory.length} session{filteredHistory.length !== 1 ? 's' : ''} — {periodLabels[timeRange].toLowerCase()}
            </p>
          </div>

          {filteredHistory.length > 0 && (
            <div className="flex items-center bg-[#11151D] rounded-xl p-1 border border-[#1F2633] self-start sm:self-auto">
              <button
                onClick={() => setHistoryViewMode('list')}
                id="progress-tab-list"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  historyViewMode === 'list'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                <List size={13} /> All Sessions ({filteredHistory.length})
              </button>
              {timeRange === '30d' || timeRange === 'all' ? (
                <button
                  onClick={() => setHistoryViewMode('14day')}
                  id="progress-tab-14day"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    historyViewMode === '14day'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-surface-400 hover:text-white'
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
