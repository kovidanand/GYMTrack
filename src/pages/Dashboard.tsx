import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Dumbbell, 
  Flame, 
  Clock, 
  Layers, 
  Trophy, 
  Mic, 
  Info,
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/hooks/useProgress'
import { useWorkouts } from '@/hooks/useWorkouts'
import { TrainingLoggerModal } from '@/components/workout/TrainingLoggerModal'
import { cn } from '@/lib/utils'

function getLocalGreeting(date = new Date()): string {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 21) return 'Good evening'
  return 'Good night'
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const { workouts, activePlan } = useWorkouts()
  const { history, personalRecords, loading, refresh } = useProgress()

  // Training logger modal state
  const [isLoggerOpen, setIsLoggerOpen] = useState(false)
  const [loggerMode, setLoggerMode] = useState<'manual' | 'voice'>('manual')

  const firstName = profile?.first_name || user?.email?.split('@')[0] || 'Athlete'
  const today = new Date()

  // Refresh data on mount and window focus
  useEffect(() => {
    refresh()
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  // ── Scoped Strictly to TODAY ONLY (resets at local midnight) ──
  const todaySessions = useMemo(() => {
    return history.filter(s => isSameDay(new Date(s.started_at), today))
  }, [history, today])

  const activeTodaySession = todaySessions.find(s => s.status === 'in_progress')
  const completedTodaySession = todaySessions.find(s => s.status === 'completed')

  const todayStatus: 'Completed' | 'In progress' | 'Not started' = activeTodaySession
    ? 'In progress'
    : completedTodaySession
    ? 'Completed'
    : 'Not started'

  const todayExercises = todaySessions.reduce((acc, s) => acc + (s.total_exercises || 0), 0)
  const todaySets = todaySessions.reduce((acc, s) => acc + (s.completed_sets || 0), 0)
  const todayVolume = todaySessions.reduce((acc, s) => acc + (s.total_volume || 0), 0)
  const todayDurationMins = todaySessions.reduce(
    (acc, s) => acc + Math.round((s.duration_seconds || 0) / 60),
    0
  )

  // Next planned workout if user has an active plan
  const planWorkouts = activePlan
    ? workouts
        .filter(w => w.plan_id === activePlan.id)
        .sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
    : []
  const todaysWorkout = planWorkouts.length > 0 ? planWorkouts[0] : null

  // Activity breakdown for today's completed session(s)
  const todayExercisesBreakdown = useMemo(() => {
    if (!completedTodaySession?.workout_session_sets) return []
    const map = new Map<string, { name: string; sets: number; maxWeight: number }>()
    for (const set of completedTodaySession.workout_session_sets) {
      if (!set.completed) continue
      const name = set.exercise_name || 'Exercise'
      const cur = map.get(name) || { name, sets: 0, maxWeight: 0 }
      cur.sets += 1
      const w = Number(set.weight) || 0
      if (w > cur.maxWeight) cur.maxWeight = w
      map.set(name, cur)
    }
    return Array.from(map.values())
  }, [completedTodaySession])

  // ── 7-Day Weekly Snapshot (Mon to Sun) ──
  const weeklyDays = useMemo(() => {
    const curr = new Date(today)
    const dayOfWeek = curr.getDay()
    const mondayDiff = (dayOfWeek + 6) % 7
    const monday = new Date(curr)
    monday.setDate(curr.getDate() - mondayDiff)
    monday.setHours(0, 0, 0, 0)

    const days = []
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const isTodayDate = isSameDay(d, today)
      const hasWorkout = history.some(s => s.status === 'completed' && isSameDay(new Date(s.started_at), d))
      days.push({
        label: dayLabels[i],
        dateNumber: d.getDate(),
        fullDate: d,
        isToday: isTodayDate,
        hasWorkout
      })
    }
    return days
  }, [history, today])

  // ── Recent Personal Best ──
  const recentPB = useMemo(() => {
    if (personalRecords.length > 0) {
      return personalRecords[0]
    }
    return null
  }, [personalRecords])

  // ── Grounded Quick Insight Sentence ──
  const quickInsight = useMemo(() => {
    if (history.length === 0) {
      return "Log your first workout to start tracking volume, progression, and personal records."
    }

    if (todayStatus === 'Completed') {
      return `Solid effort today! You completed ${todayExercises} exercises across ${todaySets} sets (${todayVolume.toLocaleString()} kg total volume).`
    }

    const trainedThisWeek = weeklyDays.filter(d => d.hasWorkout).length
    if (trainedThisWeek >= 3) {
      return `Consistent week: You've completed ${trainedThisWeek} sessions this week. Ready for today's training?`
    } else if (trainedThisWeek > 0) {
      return `You're at ${trainedThisWeek} session${trainedThisWeek > 1 ? 's' : ''} this week. Tap '+ Log Training' to record today.`
    }

    return "No workouts recorded yet this week. Log your training in seconds with manual entry or voice."
  }, [history, todayStatus, todayExercises, todaySets, todayVolume, weeklyDays])

  const handleOpenManualLog = () => {
    setLoggerMode('manual')
    setIsLoggerOpen(true)
  }

  const handleOpenVoiceLog = () => {
    setLoggerMode('voice')
    setIsLoggerOpen(true)
  }

  if (loading && history.length === 0) {
    return (
      <div className="py-20 text-center text-surface-500 text-sm font-medium animate-pulse space-y-2">
        <Dumbbell className="w-8 h-8 text-brand-500 mx-auto animate-bounce" />
        <p>Loading your training status...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6 pb-20 max-w-4xl mx-auto">
      {/* ── 1. WHAT DAY IS IT: GREETING & DATE HEADER ── */}
      <section className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight leading-tight">
            {getLocalGreeting()}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 font-semibold">
            {today.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Quick Insight Strip */}
        <div className="pt-1">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-50 border border-surface-200 text-surface-700 text-xs leading-relaxed">
            <Info size={15} className="text-brand-600 flex-shrink-0" />
            <span className="font-medium">{quickInsight}</span>
          </div>
        </div>
      </section>

      {/* ── 2. PRIMARY ACTION: LOG TODAY'S TRAINING (UNMISSABLE LAUNCHER) ── */}
      <section aria-label="Log today's workout">
        <div className="card p-5 sm:p-6 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 text-white rounded-2xl shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-100">
                Primary Action
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                Log What You Just Trained
              </h2>
              <p className="text-xs sm:text-sm text-brand-100 max-w-md mt-1">
                Log exercises, weights, and sets in seconds. Review summary before saving.
              </p>
            </div>

            {/* Launchers */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleOpenManualLog}
                id="dashboard-log-training-btn"
                className="bg-white text-brand-700 hover:bg-brand-50 active:scale-95 py-2.5 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={16} className="stroke-[3]" />
                <span>+ Log Training</span>
              </button>

              <button
                type="button"
                onClick={handleOpenVoiceLog}
                id="dashboard-voice-log-btn"
                className="bg-brand-700/80 hover:bg-brand-800 text-white border border-white/20 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
                title="Hands-free voice logging"
              >
                <Mic size={16} />
                <span>Voice</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-brand-100">
            <span>Prefer a guided stopwatch session?</span>
            <button
              onClick={() => navigate(todaysWorkout ? `/workouts/${todaysWorkout.id}/run` : '/workouts/quick')}
              className="font-bold underline hover:text-white transition-colors flex items-center gap-1"
            >
              Start live routine <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. TODAY'S TRAINING SUMMARY (WHAT HAVE I DONE TODAY) ── */}
      <section aria-label="Today's activity record">
        <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400">
                Today&rsquo;s Activity
              </h2>
              <p className="text-xs text-surface-500 mt-0.5">
                {today.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>

            <span
              className={cn(
                "badge text-[11px] font-bold px-2.5 py-0.5 rounded-full",
                todayStatus === 'Completed'
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : todayStatus === 'In progress'
                  ? "bg-brand-50 text-brand-700 border border-brand-200"
                  : "bg-surface-100 text-surface-600 border border-surface-200"
              )}
            >
              {todayStatus}
            </span>
          </div>

          {todayStatus === 'Completed' && completedTodaySession ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-0.5">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold">Session Logged</span>
                  </div>
                  <h3 className="text-lg font-bold text-surface-900">
                    {completedTodaySession.workout_name || 'Completed Workout'}
                  </h3>
                  <p className="text-xs text-surface-500">
                    {todayExercises} exercises • {todaySets} sets • {todayVolume.toLocaleString()} kg total volume
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/history/${completedTodaySession.id}`)}
                    id="dashboard-view-record-btn"
                    className="btn-secondary py-2 px-3.5 text-xs font-bold inline-flex items-center gap-1"
                  >
                    View Record
                    <ChevronRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenManualLog}
                    className="btn-primary py-2 px-3.5 text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Plus size={13} />
                    Add More
                  </button>
                </div>
              </div>

              {/* Breakdown of exercises performed today */}
              {todayExercisesBreakdown.length > 0 && (
                <div className="divide-y divide-surface-100 border-t border-surface-100 pt-2">
                  {todayExercisesBreakdown.map((ex, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        <span className="font-bold text-surface-900 truncate">{ex.name}</span>
                      </div>
                      <span className="text-surface-500 font-mono text-xs">
                        {ex.sets} sets {ex.maxWeight > 0 ? `• max ${ex.maxWeight} kg` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : todayStatus === 'In progress' && activeTodaySession ? (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-surface-900">
                  {activeTodaySession.workout_name || 'Live Workout in Progress'}
                </h3>
                <p className="text-xs text-surface-500">
                  Session started • {todaySets} completed sets so far
                </p>
              </div>
              <button
                onClick={() => navigate(`/workouts/${activeTodaySession.workout_id || 'quick'}/run`)}
                className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Play size={13} className="fill-white" />
                Continue Active Workout
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-surface-800">No workout recorded yet today</p>
                <p className="text-xs text-surface-500 mt-0.5">
                  Finished a workout? Tap the button to log your movements and sets.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenManualLog}
                className="btn-secondary py-1.5 px-3.5 text-xs font-bold inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <Plus size={13} />
                Log Today
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. MIXED INFORMATION HIERARCHY: METRIC TILES ── */}
      <section aria-label="Today's metrics">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Exercises Tile */}
          <div className="card p-4 bg-white border border-surface-200 rounded-xl shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-surface-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Exercises</span>
              <Dumbbell size={16} className="text-brand-500" />
            </div>
            <p className="text-2xl font-black text-surface-900 tracking-tight">
              {todayExercises}
            </p>
            <p className="text-[10px] text-surface-400">logged today</p>
          </div>

          {/* Sets Tile */}
          <div className="card p-4 bg-white border border-surface-200 rounded-xl shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-surface-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Sets</span>
              <Layers size={16} className="text-brand-500" />
            </div>
            <p className="text-2xl font-black text-surface-900 tracking-tight">
              {todaySets}
            </p>
            <p className="text-[10px] text-surface-400">completed sets</p>
          </div>

          {/* Volume Highlight Card */}
          <div className="card p-4 bg-white border border-surface-200 rounded-xl shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-surface-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Volume</span>
              <Flame size={16} className="text-amber-500" />
            </div>
            <p className="text-2xl font-black text-surface-900 tracking-tight">
              {todayVolume.toLocaleString()} <span className="text-xs font-semibold text-surface-500">kg</span>
            </p>
            <p className="text-[10px] text-surface-400">workload lifted</p>
          </div>

          {/* Duration Tile */}
          <div className="card p-4 bg-white border border-surface-200 rounded-xl shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-surface-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Duration</span>
              <Clock size={16} className="text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-surface-900 tracking-tight">
              {todayDurationMins} <span className="text-xs font-semibold text-surface-500">min</span>
            </p>
            <p className="text-[10px] text-surface-400">active training time</p>
          </div>
        </div>
      </section>

      {/* ── 5. 7-DAY WEEKLY SNAPSHOT STRIP ── */}
      <section aria-label="Weekly training snapshot">
        <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-brand-600" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-surface-900">
                Weekly Snapshot
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-surface-400">
              {weeklyDays.filter(d => d.hasWorkout).length} of 7 days completed
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-1">
            {weeklyDays.map(day => (
              <div
                key={day.label}
                className={cn(
                  'flex flex-col items-center py-2.5 px-1 rounded-xl transition-all text-center',
                  day.isToday
                    ? 'bg-brand-50 border border-brand-300 ring-2 ring-brand-400/20'
                    : 'bg-surface-50 border border-surface-100'
                )}
              >
                <span className="text-[10px] font-bold uppercase text-surface-400">
                  {day.label}
                </span>
                <span className={cn(
                  'text-sm font-black mt-0.5',
                  day.isToday ? 'text-brand-600' : 'text-surface-800'
                )}>
                  {day.dateNumber}
                </span>

                <div className="mt-2 h-4 flex items-center justify-center">
                  {day.hasWorkout ? (
                    <span 
                      className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" 
                      title={`${day.label}: Workout completed`} 
                    />
                  ) : (
                    <span className="w-2 h-0.5 bg-surface-300 rounded-full" title={`${day.label}: Rest day`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. RECENT PERSONAL BEST CARD ── */}
      <section aria-label="Recent personal best record">
        <div className="card p-4 sm:p-5 bg-gradient-to-br from-amber-50/50 via-white to-surface-50 border border-amber-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Trophy size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  Recent Personal Record
                </span>
                {recentPB ? (
                  <h3 className="font-black text-surface-900 text-base sm:text-lg">
                    {recentPB.exerciseName}: <span className="text-brand-600">{recentPB.value} {recentPB.unit}</span>
                  </h3>
                ) : (
                  <p className="text-xs font-semibold text-surface-600 mt-0.5">
                    No PR records yet. Set your baseline with your next logged workout!
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/progress')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>All PRs</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── TRAINING LOGGER MODAL (MANUAL & VOICE) ── */}
      <TrainingLoggerModal
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        initialMode={loggerMode}
      />
    </div>
  )
}
