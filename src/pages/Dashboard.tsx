import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  ChevronRight, 
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
  CalendarDays
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/hooks/useProgress'
import { useWorkouts } from '@/hooks/useWorkouts'
import { TrainingLoggerModal } from '@/components/workout/TrainingLoggerModal'
import { cn } from '@/lib/utils'
import { subscribeGymtrackEvent } from '@/lib/events'
import {
  filterTodaySessions,
  aggregateTodayMetrics,
  isSameDayLocal,
  type TodayMetrics
} from '@/lib/dashboardData'
import { getQueuedExercisesForTodayWorkout } from '@/lib/offline/db'

function getLocalGreeting(date = new Date()): string {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 21) return 'Good evening'
  return 'Good night'
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const { history, personalRecords, loading, refresh } = useProgress()
  const { activePlan, workouts: allWorkouts } = useWorkouts()

  // Training logger modal state
  const [isLoggerOpen, setIsLoggerOpen] = useState(false)
  const [loggerMode, setLoggerMode] = useState<'manual' | 'voice'>('manual')

  const firstName = profile?.first_name || user?.email?.split('@')[0] || 'Athlete'
  
  // Current local date with midnight-reset detection
  const [currentDate, setCurrentDate] = useState(() => new Date())

  // Midnight day-reset timer: auto resets daily view at 00:00:00 local time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      if (!isSameDayLocal(now, currentDate)) {
        setCurrentDate(now)
        refreshRef.current?.()
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [currentDate])

  // Stable reference to refresh for event listeners and focus handlers
  const refreshRef = useRef(refresh)
  useEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

  // Subscribe to real-time training events and throttled window focus (runs once on mount)
  useEffect(() => {
    let lastFocusRefresh = Date.now()
    const onFocus = () => {
      // Throttle window focus refresh to at most once every 5 seconds
      if (Date.now() - lastFocusRefresh > 5000) {
        lastFocusRefresh = Date.now()
        refreshRef.current?.()
      }
    }
    window.addEventListener('focus', onFocus)
    const unsub1 = subscribeGymtrackEvent('gymtrack:sets_logged', () => refreshRef.current?.())
    const unsub2 = subscribeGymtrackEvent('gymtrack:session_completed', () => refreshRef.current?.())
    const unsub3 = subscribeGymtrackEvent('gymtrack:workout_updated', () => {
      refreshRef.current?.()
      setQueuedExercises(getQueuedExercisesForTodayWorkout())
    })
    const unsub4 = subscribeGymtrackEvent('gymtrack:sync_completed', () => refreshRef.current?.())
    return () => {
      window.removeEventListener('focus', onFocus)
      unsub1()
      unsub2()
      unsub3()
      unsub4()
    }
  }, [])

  // ── Scoped Strictly to TODAY ONLY (resets at local midnight) ──
  const todaySessions = useMemo(() => {
    return filterTodaySessions(history, currentDate)
  }, [history, currentDate])

  const activeTodaySession = todaySessions.find(s => s.status === 'in_progress')
  const completedTodaySessions = todaySessions.filter(s => s.status === 'completed')

  const todayStatus: 'Completed' | 'In progress' | 'Not started' = activeTodaySession
    ? 'In progress'
    : completedTodaySessions.length > 0
    ? 'Completed'
    : 'Not started'

  // ── Unified Data Aggregation Layer: single source of truth for all 4 metrics ──
  const todayMetrics: TodayMetrics = useMemo(() => {
    return aggregateTodayMetrics(todaySessions)
  }, [todaySessions])

  // Activity breakdown for today's completed session(s)
  const todayExercisesBreakdown = todayMetrics.exerciseBreakdown

  // Check for any queued exercises from library
  const [queuedExercises, setQueuedExercises] = useState(() => getQueuedExercisesForTodayWorkout())
  useEffect(() => {
    if (!isLoggerOpen) {
      setQueuedExercises(getQueuedExercisesForTodayWorkout())
    }
  }, [isLoggerOpen])

  // ── 7-Day Weekly Snapshot (Mon to Sun) ──
  const weeklyDays = useMemo(() => {
    const curr = new Date(currentDate)
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
      const isTodayDate = isSameDayLocal(d, currentDate)
      const daySessionIds = history
        .filter(s => s.status === 'completed' && isSameDayLocal(s.started_at, d))
        .map(s => s.id)
      days.push({
        label: dayLabels[i],
        dateNumber: d.getDate(),
        fullDate: d,
        isToday: isTodayDate,
        hasWorkout: daySessionIds.length > 0,
        sessionId: daySessionIds[0] || null
      })
    }
    return days
  }, [history, currentDate])

  const weeklySessionCount = weeklyDays.filter(d => d.hasWorkout).length

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

    if (todayStatus === 'Completed' && todayMetrics.volume > 0) {
      // Compare against previous session's volume
      const previousCompletedSessions = history
        .filter(s => s.status === 'completed' && !isSameDayLocal(s.started_at, currentDate))
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      
      if (previousCompletedSessions.length > 0) {
        const prevVolume = previousCompletedSessions[0].total_volume || 0
        if (prevVolume > 0) {
          const diff = Math.round(((todayMetrics.volume - prevVolume) / prevVolume) * 100)
          if (diff > 0) {
            return `Today's volume is ${diff}% higher than your previous session. ${todayMetrics.exercises} ${todayMetrics.exercises === 1 ? 'exercise' : 'exercises'}, ${todayMetrics.sets} sets completed.`
          } else if (diff < -5) {
            return `${todayMetrics.exercises} ${todayMetrics.exercises === 1 ? 'exercise' : 'exercises'} completed today. Volume is lighter than your previous session — recovery-focused sessions count too.`
          }
        }
      }
      return `Solid effort today — ${todayMetrics.exercises} ${todayMetrics.exercises === 1 ? 'exercise' : 'exercises'}, ${todayMetrics.sets} sets, ${todayMetrics.volume.toLocaleString()} kg total volume.`
    }

    if (todayStatus === 'Completed') {
      return `You've completed ${todayMetrics.exercises} ${todayMetrics.exercises === 1 ? 'exercise' : 'exercises'} across ${todayMetrics.sets} sets today.`
    }

    if (weeklySessionCount >= 3) {
      return `Consistent week: ${weeklySessionCount} sessions completed. Ready for today's training?`
    } else if (weeklySessionCount > 0) {
      return `${weeklySessionCount} session${weeklySessionCount > 1 ? 's' : ''} this week. Tap '+ Log Training' to record today.`
    }

    return "No workouts recorded yet this week. Log your training in seconds."
  }, [history, todayStatus, todayMetrics, weeklySessionCount, currentDate])

  const handleOpenManualLog = () => {
    setLoggerMode('manual')
    setIsLoggerOpen(true)
  }

  const handleOpenVoiceLog = () => {
    setLoggerMode('voice')
    setIsLoggerOpen(true)
  }

  // ── Active Plan Today Calculations ──
  const todayDayNumber = useMemo(() => {
    const d = currentDate.getDay()
    return d === 0 ? 7 : d
  }, [currentDate])

  const activePlanTodayWorkout = useMemo(() => {
    if (!activePlan) return null
    return allWorkouts.find(w => w.plan_id === activePlan.id && w.day_number === todayDayNumber) || null
  }, [activePlan, allWorkouts, todayDayNumber])

  const activePlanWeekNumber = useMemo(() => {
    if (!activePlan || !activePlan.started_at) return 1
    const start = new Date(activePlan.started_at).getTime()
    const diffWeeks = Math.floor((Date.now() - start) / (7 * 24 * 60 * 60 * 1000)) + 1
    return Math.min(activePlan.duration_weeks || 12, Math.max(1, diffWeeks))
  }, [activePlan])

  const plannedExerciseCount = activePlanTodayWorkout?.workout_exercises?.length || 0
  const completedPlannedExercisesCount = useMemo(() => {
    if (!activePlanTodayWorkout?.workout_exercises || todayMetrics.exerciseBreakdown.length === 0) return 0
    const todayExerciseNames = new Set(todayMetrics.exerciseBreakdown.map(e => e.name.toLowerCase()))
    return activePlanTodayWorkout.workout_exercises.filter(we => {
      const exName = we.exercise?.name.toLowerCase()
      return exName ? todayExerciseNames.has(exName) : false
    }).length
  }, [activePlanTodayWorkout, todayMetrics])

  if (loading && history.length === 0) {
    return (
      <div className="py-20 text-center text-surface-500 text-sm font-medium animate-pulse space-y-2">
        <Dumbbell className="w-8 h-8 text-brand-500 mx-auto animate-bounce" />
        <p>Loading your training status...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-5 pb-20 max-w-4xl mx-auto">
      {/* ── 1. GREETING & DATE HEADER ── */}
      <section className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight leading-tight">
            {getLocalGreeting()}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 font-semibold">
            {currentDate.toLocaleDateString(undefined, {
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

      {/* ── 2. PRIMARY ACTION: LOG TODAY'S TRAINING ── */}
      <section aria-label="Log today's workout">
        <div className="card p-4 sm:p-5 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 text-white rounded-2xl shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Log What You Just Trained
              </h2>
              <p className="text-xs sm:text-sm text-brand-100 max-w-md mt-0.5">
                Log exercises, sets, reps and weights in seconds.
              </p>
            </div>

            {/* Launchers */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleOpenManualLog}
                id="dashboard-log-training-btn"
                className="bg-white text-brand-700 hover:bg-brand-50 active:scale-95 py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={16} className="stroke-[3]" />
                <span>Log Training</span>
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
        </div>
      </section>

      {/* ── 2.5 YOUR ACTIVE PLAN WIDGET ── */}
      {activePlan ? (
        <section aria-label="Your Active Training Plan">
          <div className="card p-4 sm:p-5 bg-gradient-to-br from-surface-900 via-surface-900 to-brand-950 text-white border border-surface-800 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400 bg-brand-500/20 px-2 py-0.5 rounded-full border border-brand-500/30">
                    Your Active Plan
                  </span>
                  <span className="text-xs text-surface-400">
                    Week {activePlanWeekNumber} of {activePlan.duration_weeks || 12}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  {activePlan.name}
                </h3>

                <p className="text-xs text-surface-300 mt-0.5">
                  Today&rsquo;s Workout: <span className="font-semibold text-white">{activePlanTodayWorkout ? activePlanTodayWorkout.name : 'Rest / Recovery Day'}</span>
                  {plannedExerciseCount > 0 && (
                    <span className="ml-2 text-brand-300 font-bold">
                      • {completedPlannedExercisesCount} / {plannedExerciseCount} completed
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/plans')}
                id="home-active-plan-continue-btn"
                className="btn-primary py-2 px-4 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 shadow-sm"
              >
                <span>{completedPlannedExercisesCount > 0 ? 'Continue Training' : 'View Today’s Workout'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section aria-label="Build a training plan">
          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <CalendarDays size={16} className="text-brand-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-surface-800">
                  No Active Training Plan
                </p>
                <p className="text-[11px] text-surface-500">
                  Choose a goal and we&rsquo;ll structure your day-by-day workout routine.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/plans')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 self-start sm:self-auto flex items-center gap-1"
            >
              <span>Build Plan</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </section>
      )}

      {/* ── 3. TODAY'S TRAINING SUMMARY ── */}
      <section aria-label="Today's activity record">
        <div className="card p-4 sm:p-5 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400">
                Today&rsquo;s Activity
              </h2>
              <p className="text-xs text-surface-500 mt-0.5">
                {currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
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

          {/* Queued from Library Banner if user added exercises */}
          {queuedExercises.length > 0 && todayStatus !== 'Completed' && (
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between text-xs text-brand-900">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                <span>
                  Ready to log: <strong>{queuedExercises.map(q => q.exercise?.name).filter(Boolean).join(', ')}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenManualLog}
                className="font-bold text-brand-700 hover:underline ml-2 whitespace-nowrap"
              >
                Log sets &rarr;
              </button>
            </div>
          )}

          {todayStatus === 'Completed' && completedTodaySessions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-0.5">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold">Session Logged</span>
                  </div>
                  <h3 className="text-lg font-bold text-surface-900">
                    {todayMetrics.workoutName || completedTodaySessions[0]?.workout_name || 'Completed Workout'}
                  </h3>
                  <p className="text-xs text-surface-500">
                    {todayMetrics.exercises} {todayMetrics.exercises === 1 ? 'exercise' : 'exercises'} &middot; {todayMetrics.sets} {todayMetrics.sets === 1 ? 'set' : 'sets'} &middot; {todayMetrics.volume.toLocaleString()} kg total volume
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/history/${completedTodaySessions[0].id}`)}
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
                    <div
                      key={idx}
                      className="w-full py-2.5 flex items-center justify-between text-xs sm:text-sm hover:bg-surface-50 -mx-1 px-1 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                        <span className="font-bold text-surface-900 truncate">{ex.name}</span>
                      </div>
                      <span className="text-surface-500 font-mono text-xs text-right whitespace-nowrap ml-2">
                        {ex.sets} {ex.sets === 1 ? 'set' : 'sets'} {ex.weightDisplay ? `· ${ex.weightDisplay}` : ''} {ex.volume > 0 ? `· ${ex.volume.toLocaleString()} kg` : ''}
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
                  {activeTodaySession.workout_name || 'Workout in Progress'}
                </h3>
                <p className="text-xs text-surface-500">
                  Session started &middot; {todayMetrics.sets} completed sets so far
                </p>
              </div>
              <button
                onClick={() => navigate(`/workouts/${activeTodaySession.workout_id || 'quick'}/run`)}
                className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5"
              >
                Continue Active Workout
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200/80">
              <p className="text-xs font-bold text-surface-800">No workout recorded yet today</p>
              <p className="text-xs text-surface-500 mt-0.5">
                Log your training to start today's record.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. TODAY'S TRAINING OVERVIEW ── */}
      <section aria-label="Today's training overview">
        <div className="card p-4 sm:p-5 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-surface-400">Today&rsquo;s Training</h2>
              <p className="text-[11px] text-surface-400 mt-0.5">
                {currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <span className={cn(
              'badge text-[11px] font-bold px-2.5 py-0.5 rounded-full',
              todayStatus === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : todayStatus === 'In progress'
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'bg-surface-100 text-surface-600 border border-surface-200'
            )}>
              {todayStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Exercises Tile */}
            <button
              onClick={() => navigate('/progress')}
              className="p-3 rounded-xl bg-surface-50 border border-surface-100 space-y-1 text-left hover:border-brand-200 transition-colors"
            >
              <div className="flex items-center justify-between text-surface-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Exercises</span>
                <Dumbbell size={14} className="text-brand-500" />
              </div>
              <p className="text-xl font-black text-surface-900 tracking-tight">
                {todayMetrics.exercises}
              </p>
              <p className="text-[10px] text-surface-400">logged today</p>
            </button>

            {/* Sets Tile */}
            <button
              onClick={() => navigate('/progress')}
              className="p-3 rounded-xl bg-surface-50 border border-surface-100 space-y-1 text-left hover:border-brand-200 transition-colors"
            >
              <div className="flex items-center justify-between text-surface-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Sets</span>
                <Layers size={14} className="text-brand-500" />
              </div>
              <p className="text-xl font-black text-surface-900 tracking-tight">
                {todayMetrics.sets}
              </p>
              <p className="text-[10px] text-surface-400">completed</p>
            </button>

            {/* Volume Tile */}
            <button
              onClick={() => navigate('/progress')}
              className="p-3 rounded-xl bg-surface-50 border border-surface-100 space-y-1 text-left hover:border-brand-200 transition-colors"
            >
              <div className="flex items-center justify-between text-surface-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Volume</span>
                <Flame size={14} className="text-amber-500" />
              </div>
              <p className="text-xl font-black text-surface-900 tracking-tight">
                {todayMetrics.volume > 0
                  ? <>{(todayMetrics.volume / 1000).toFixed(1)}<span className="text-xs font-semibold text-surface-500">k kg</span></>
                  : <>0 <span className="text-xs font-semibold text-surface-500">kg</span></>}
              </p>
              <p className="text-[10px] text-surface-400">lifted</p>
            </button>

            {/* Duration Tile */}
            <button
              onClick={() => navigate('/progress')}
              className="p-3 rounded-xl bg-surface-50 border border-surface-100 space-y-1 text-left hover:border-brand-200 transition-colors"
            >
              <div className="flex items-center justify-between text-surface-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
                <Clock size={14} className="text-indigo-500" />
              </div>
              <p className="text-xl font-black text-surface-900 tracking-tight">
                {todayMetrics.durationMins} <span className="text-xs font-semibold text-surface-500">min</span>
              </p>
              <p className="text-[10px] text-surface-400">active time</p>
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. 7-DAY WEEKLY SNAPSHOT STRIP ── */}
      <section aria-label="Weekly training snapshot">
        <div className="card p-4 sm:p-5 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-brand-600" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-surface-900">
                This Week
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-surface-400">
              {weeklySessionCount} session{weeklySessionCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-1">
            {weeklyDays.map(day => (
              <button
                key={day.label}
                onClick={() => {
                  if (day.sessionId) navigate(`/history/${day.sessionId}`)
                }}
                disabled={!day.sessionId}
                className={cn(
                  'flex flex-col items-center py-2.5 px-1 rounded-xl transition-all text-center',
                  day.isToday
                    ? 'bg-brand-50 border border-brand-300 ring-2 ring-brand-400/20'
                    : 'bg-surface-50 border border-surface-100',
                  day.sessionId && !day.isToday && 'hover:border-brand-200 cursor-pointer',
                  !day.sessionId && 'cursor-default'
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
              </button>
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
