import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, Play, CheckCircle2, Dumbbell, Flame, Clock, Sparkles, BarChart2, Info } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/hooks/useProgress'
import { useWorkouts } from '@/hooks/useWorkouts'
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
  const { history, loading, refresh } = useProgress()

  const firstName = profile?.first_name || user?.email?.split('@')[0] || 'Athlete'
  const today = new Date()

  // Always refresh on mount and window focus
  useEffect(() => {
    refresh()
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  // ── Scoped Strictly to TODAY ONLY (resets at local midnight) ──
  const todaySessions = useMemo(() => {
    return history.filter(s => isSameDay(new Date(s.started_at), today))
  }, [history])

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

  // Contextual Banner logic (Strictly based on REAL user data, no fabricated info)
  const contextualBanner = useMemo(() => {
    if (history.length === 0) {
      return 'Ready to record your first workout in GYMTrack? Start your baseline session today.'
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const workedOutYesterday = history.some(s => s.status === 'completed' && isSameDay(new Date(s.started_at), yesterday))

    if (todayStatus === 'Not started') {
      if (workedOutYesterday) {
        return "Your last workout was yesterday. Ready to record today's training?"
      }
      return 'You have not logged a workout today.'
    }

    if (todayStatus === 'Completed' && todayExercisesBreakdown.length > 0) {
      const topEx = [...todayExercisesBreakdown].sort((a, b) => b.maxWeight - a.maxWeight)[0]
      if (topEx && topEx.maxWeight > 0) {
        return `Your highest ${topEx.name} today was ${topEx.maxWeight} kg across ${topEx.sets} sets.`
      }
      return `Today's session completed: ${todayExercises} exercises recorded.`
    }

    return null
  }, [history, todayStatus, todayExercisesBreakdown, todayExercises])

  // Real-data secondary insights (derives strictly from actual data)
  const secondaryInsights = useMemo(() => {
    const list: string[] = []
    
    // 1. Training sessions in the last 7 days
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sessionsLast7Days = history.filter(
      s => s.status === 'completed' && new Date(s.started_at) >= sevenDaysAgo
    ).length

    if (sessionsLast7Days > 0) {
      list.push(`You trained ${sessionsLast7Days} time${sessionsLast7Days !== 1 ? 's' : ''} in the last 7 days.`)
    }

    // 2. Today's duration if workout completed
    if (todayStatus === 'Completed' && todayDurationMins > 0) {
      list.push(`Your workout lasted ${todayDurationMins} minutes.`)
    }

    // 3. Exercise count today
    if (todayStatus === 'Completed' && todayExercises > 0) {
      list.push(`You completed ${todayExercises} exercise${todayExercises !== 1 ? 's' : ''} today.`)
    }

    return list
  }, [history, todayStatus, todayDurationMins, todayExercises])

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
      {/* ── 1. GREETING + LOCAL DATE ── */}
      <section className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight leading-tight">
          {getLocalGreeting()}, {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 font-medium capitalize">
          {today.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </section>

      {/* ── 2. OPTIONAL CONTEXTUAL BANNER ── */}
      {contextualBanner && (
        <section aria-label="Contextual notice" className="animate-fade-in">
          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-surface-100/90 border border-surface-200 text-surface-800 text-xs sm:text-sm leading-relaxed">
            <Info size={16} className="text-brand-600 flex-shrink-0" />
            <p className="font-medium flex-1">{contextualBanner}</p>
          </div>
        </section>
      )}

      {/* ── 3. PRIMARY DAILY INSIGHT / TODAY'S TRAINING CARD (PRIMARY CTA) ── */}
      <section aria-label="Today's training session">
        <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
              Today's Training
            </span>
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

          {todayStatus === 'In progress' && activeTodaySession ? (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-surface-900">
                  {activeTodaySession.workout_name || 'Quick Workout'}
                </h2>
                <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
                  Workout in progress · {todayExercises} exercises · {todaySets} sets · {todayVolume.toLocaleString()} kg
                </p>
              </div>
              <div>
                <button
                  onClick={() => navigate(`/workouts/${activeTodaySession.workout_id || 'quick'}/run`)}
                  id="dashboard-continue-workout-btn"
                  className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold shadow-sm inline-flex items-center gap-2"
                >
                  <Play size={14} className="fill-white" />
                  Continue Workout
                </button>
              </div>
            </div>
          ) : todayStatus === 'Completed' && completedTodaySession ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold">Workout completed</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-surface-900">
                  {completedTodaySession.workout_name || 'Workout Session'}
                </h2>
                <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
                  {todayExercises} exercises · {todaySets} sets logged · {todayVolume.toLocaleString()} kg volume · {todayDurationMins} min
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => navigate(`/history/${completedTodaySession.id}`)}
                  id="dashboard-view-record-btn"
                  className="btn-secondary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  View Today's Record
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => navigate('/workouts/quick')}
                  className="py-2 px-3 text-xs font-semibold text-surface-600 hover:text-surface-900 transition-colors inline-flex items-center gap-1"
                >
                  <Plus size={13} />
                  Record Another Workout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-surface-900">
                  Ready to record your workout?
                </h2>
                <p className="text-xs sm:text-sm text-surface-500 mt-0.5 max-w-lg">
                  Log your movements, weights, and sets in real time. Zero questionnaires or distractions.
                </p>
              </div>
              <div>
                <button
                  onClick={() => navigate(todaysWorkout ? `/workouts/${todaysWorkout.id}/run` : '/workouts/quick')}
                  id="dashboard-start-workout-btn"
                  className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold shadow-sm inline-flex items-center gap-2"
                >
                  <Play size={14} className="fill-white" />
                  Start Workout
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. TODAY'S PROGRESS (POLISHED PROGRESS BARS) ── */}
      <section aria-label="Today's progress summary">
        <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-surface-900 uppercase tracking-wide">
                Today's Progress
              </h2>
              <p className="text-[11px] text-surface-400 mt-0.5">
                Activity strictly scoped to {today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <span className="text-[11px] font-mono text-surface-400">
              Resets at midnight
            </span>
          </div>

          <div className="space-y-4">
            {/* Metric 1: Exercises */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-surface-700">Exercises</span>
                <span className="text-surface-900 font-bold font-mono">
                  {todayExercises}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, todayExercises > 0 ? Math.max(15, todayExercises * 20) : 0)}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Sets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-surface-700">Sets</span>
                <span className="text-surface-900 font-bold font-mono">
                  {todaySets}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, todaySets > 0 ? Math.max(15, todaySets * 6.6) : 0)}%` }}
                />
              </div>
            </div>

            {/* Metric 3: Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-surface-700">Volume</span>
                <span className="text-surface-900 font-bold font-mono">
                  {todayVolume.toLocaleString()} <span className="text-[11px] font-normal text-surface-400">kg</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, todayVolume > 0 ? Math.max(15, (todayVolume / 3000) * 100) : 0)}%` }}
                />
              </div>
            </div>

            {/* Metric 4: Training Duration */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-surface-700">Training Duration</span>
                <span className="text-surface-900 font-bold font-mono">
                  {todayDurationMins} <span className="text-[11px] font-normal text-surface-400">min</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, todayDurationMins > 0 ? Math.max(15, (todayDurationMins / 45) * 100) : 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. TODAY'S ACTIVITY (CONCISE RECORD) ── */}
      {todayExercisesBreakdown.length > 0 && (
        <section aria-label="Today's activity" className="animate-fade-in">
          <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-surface-400">
                Today's Activity
              </h2>
              {completedTodaySession && (
                <button
                  onClick={() => navigate(`/history/${completedTodaySession.id}`)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  View Today's Record
                  <ChevronRight size={13} />
                </button>
              )}
            </div>

            <div className="divide-y divide-surface-100">
              {todayExercisesBreakdown.map((ex, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-surface-900 truncate pr-2">
                    {ex.name}
                  </span>
                  <span className="text-surface-500 font-mono flex-shrink-0 text-xs font-medium">
                    {ex.sets} sets {ex.maxWeight > 0 ? `· ${ex.maxWeight} kg max` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. DASHBOARD INSIGHTS (REAL DATA ONLY) ── */}
      {secondaryInsights.length > 0 && (
        <section aria-label="Secondary insights" className="animate-fade-in">
          <div className="card p-4 sm:p-5 bg-surface-50/70 border border-surface-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 block">
              Training Insights
            </span>
            <ul className="space-y-1.5" role="list">
              {secondaryInsights.map((insight, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-surface-700 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
