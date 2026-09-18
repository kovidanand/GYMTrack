import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
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
  Calendar,
  ArrowRight,
  CalendarDays,
  Target,
  Sparkles,
  X
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/hooks/useProgress'
import { useWorkouts } from '@/hooks/useWorkouts'
import { TrainingLoggerModal } from '@/components/workout/TrainingLoggerModal'
import { PlanExerciseModal } from '@/components/plan/PlanExerciseModal'
import { ExerciseMedia } from '@/components/exercise/ExerciseComponents'
import { MuscleGroupBadge } from '@/components/shared'
import { cn, formatVolumeDisplay, formatDuration } from '@/lib/utils'
import { subscribeGymtrackEvent } from '@/lib/events'
import {
  filterTodaySessions,
  aggregateTodayMetrics,
  isSameDayLocal,
  type TodayMetrics
} from '@/lib/dashboardData'
import { getQueuedExercisesForTodayWorkout } from '@/lib/offline/db'
import { isPlanExerciseCompleted, getActivePlanInstance } from '@/lib/planProgressService'
import { getPlanDayCompletions } from '@/lib/workouts'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import type { Exercise } from '@/types'

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

  // In-plan exercise logging modal state
  const [activeLogExercise, setActiveLogExercise] = useState<{
    exercise: Exercise
    workoutId: string
    workoutName: string
    workoutExerciseId?: string
    targetSets: number
    targetReps: string
    restSeconds: number
  } | null>(null)

  // Plan telemetry (day-level completions)
  const [completions, setCompletions] = useState<{ week_number: number; day_number: number; status: string }[]>([])

  // Selected weekly day for inspection
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)

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

  // Stable reference to refresh for event listeners
  const refreshRef = useRef(refresh)
  useEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

  // Fetch plan completions for active plan
  const fetchPlanData = useCallback(async () => {
    if (!user || !activePlan) {
      setCompletions([])
      return
    }
    const data = await getPlanDayCompletions(activePlan.id, user.id)
    setCompletions(data || [])
  }, [user, activePlan])

  useEffect(() => {
    fetchPlanData()
  }, [fetchPlanData])

  // Subscribe to real-time training events and throttled window focus
  useEffect(() => {
    let lastFocusRefresh = Date.now()
    const onFocus = () => {
      if (Date.now() - lastFocusRefresh > 5000) {
        lastFocusRefresh = Date.now()
        refreshRef.current?.()
        fetchPlanData()
      }
    }
    window.addEventListener('focus', onFocus)
    const unsub1 = subscribeGymtrackEvent('gymtrack:sets_logged', () => {
      refreshRef.current?.()
      fetchPlanData()
    })
    const unsub2 = subscribeGymtrackEvent('gymtrack:session_completed', () => {
      refreshRef.current?.()
      fetchPlanData()
    })
    const unsub3 = subscribeGymtrackEvent('gymtrack:workout_updated', () => {
      refreshRef.current?.()
      fetchPlanData()
      setQueuedExercises(getQueuedExercisesForTodayWorkout())
    })
    const unsub4 = subscribeGymtrackEvent('gymtrack:sync_completed', () => {
      refreshRef.current?.()
      fetchPlanData()
    })
    const unsub5 = subscribeGymtrackEvent('gymtrack:plan_progress_updated', () => {
      refreshRef.current?.()
      fetchPlanData()
    })
    return () => {
      window.removeEventListener('focus', onFocus)
      unsub1()
      unsub2()
      unsub3()
      unsub4()
      unsub5()
    }
  }, [fetchPlanData])

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

  // Unified Data Aggregation Layer
  const todayMetrics: TodayMetrics = useMemo(() => {
    return aggregateTodayMetrics(todaySessions)
  }, [todaySessions])

  const todayExercisesBreakdown = todayMetrics.exerciseBreakdown

  // Check for any queued exercises from library
  const [queuedExercises, setQueuedExercises] = useState(() => getQueuedExercisesForTodayWorkout())
  useEffect(() => {
    if (!isLoggerOpen) {
      setQueuedExercises(getQueuedExercisesForTodayWorkout())
    }
  }, [isLoggerOpen])

  // ── Active Plan Today Calculations ──
  const todayDayNumber = useMemo(() => {
    const d = currentDate.getDay()
    return d === 0 ? 7 : d // 1 = Mon, ..., 7 = Sun
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

  const activePlanInstance = useMemo(() => {
    if (!activePlan || !user) return null
    return getActivePlanInstance(activePlan.id, user.id)
  }, [activePlan, user, completions, todayMetrics])

  const planExercises = useMemo(() => {
    return activePlanTodayWorkout?.workout_exercises || []
  }, [activePlanTodayWorkout])

  // Status of each exercise in today's active plan
  const planExercisesWithStatus = useMemo(() => {
    if (!activePlan || !user) return []
    return planExercises.map(we => {
      const ex = we.exercise || DEFAULT_EXERCISES.find(e => e.id === we.exercise_id) || DEFAULT_EXERCISES[0]
      const isCompleted = isPlanExerciseCompleted(
        activePlan.id,
        user.id,
        activePlanWeekNumber,
        todayDayNumber,
        we.id,
        we.exercise_id
      )
      return {
        workoutExercise: we,
        exercise: ex,
        isCompleted
      }
    })
  }, [activePlan, user, activePlanWeekNumber, todayDayNumber, planExercises, activePlanInstance, todayMetrics])

  const completedPlanExerciseCount = useMemo(() => {
    return planExercisesWithStatus.filter(e => e.isCompleted).length
  }, [planExercisesWithStatus])

  // Daily goal calculation: if active plan, % of planned exercises done; otherwise completed session = 100%
  const dailyGoalPct = useMemo(() => {
    if (planExercises.length > 0) {
      return Math.min(100, Math.round((completedPlanExerciseCount / planExercises.length) * 100))
    }
    if (todayStatus === 'Completed') return 100
    if (todayStatus === 'In progress') return 50
    return 0
  }, [planExercises, completedPlanExerciseCount, todayStatus])

  // Overall plan statistics
  const totalPlannedSessions = useMemo(() => {
    return (activePlan?.duration_weeks || 12) * (activePlan?.days_per_week || 4)
  }, [activePlan])

  const completedSessionsCount = useMemo(() => {
    return completions.filter(c => c.status === 'completed').length
  }, [completions])

  const overallPlanPct = useMemo(() => {
    if (totalPlannedSessions <= 0) return 0
    return Math.min(100, Math.round((completedSessionsCount / totalPlannedSessions) * 100))
  }, [totalPlannedSessions, completedSessionsCount])

  // Next workout in plan
  const nextWorkout = useMemo(() => {
    if (!activePlan || allWorkouts.length === 0) return null
    const planWorkouts = allWorkouts
      .filter(w => w.plan_id === activePlan.id && w.day_type === 'workout')
      .sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
    const after = planWorkouts.find(w => (w.day_number || 0) > todayDayNumber)
    return after || planWorkouts[0] || null
  }, [activePlan, allWorkouts, todayDayNumber])

  // ── 7-Day Weekly Snapshot (Mon to Sun) ──
  const weeklyDays = useMemo(() => {
    const curr = new Date(currentDate)
    const dayOfWeek = curr.getDay()
    const mondayDiff = (dayOfWeek + 6) % 7
    const monday = new Date(curr)
    monday.setDate(curr.getDate() - mondayDiff)
    monday.setHours(0, 0, 0, 0)

    const days = []
    const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const isTodayDate = isSameDayLocal(d, currentDate)
      const daySessions = history.filter(s => s.status === 'completed' && isSameDayLocal(s.started_at, d))
      
      let dayVolume = 0
      let daySets = 0
      const exerciseNames: string[] = []

      daySessions.forEach(s => {
        dayVolume += Number(s.total_volume) || 0
        daySets += s.completed_sets || s.total_sets || 0
        if (s.workout_session_sets) {
          s.workout_session_sets.forEach(set => {
            if (set.completed !== false && set.exercise_name && !exerciseNames.includes(set.exercise_name)) {
              exerciseNames.push(set.exercise_name)
            }
          })
        }
      })

      days.push({
        label: dayLabels[i],
        dateNumber: d.getDate(),
        fullDate: d,
        isToday: isTodayDate,
        hasWorkout: daySessions.length > 0,
        sessionCount: daySessions.length,
        primarySession: daySessions[0] || null,
        volume: dayVolume,
        sets: daySets,
        durationSeconds: daySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0),
        exercises: exerciseNames
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

  // ── AI Coach Grounded Summary Sentence ──
  const quickInsight = useMemo(() => {
    if (history.length === 0) {
      return "Log your first workout to start tracking volume, progression, and personal records."
    }

    if (todayStatus === 'Completed' && todayMetrics.volume > 0) {
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
            return `${todayMetrics.exercises} exercises completed today. Solid recovery-focused session.`
          }
        }
      }
      return `Solid session today: ${todayMetrics.exercises} exercises, ${todayMetrics.sets} sets, ${formatVolumeDisplay(todayMetrics.volume)} total volume.`
    }

    if (todayStatus === 'Completed') {
      return `Session complete: ${todayMetrics.exercises} exercises and ${todayMetrics.sets} sets logged today.`
    }

    if (weeklySessionCount >= 3) {
      return `Consistent training: ${weeklySessionCount} sessions logged this week. Ready for today's session?`
    } else if (weeklySessionCount > 0) {
      return `${weeklySessionCount} session${weeklySessionCount > 1 ? 's' : ''} logged this week. Stay consistent.`
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

  if (loading && history.length === 0) {
    return (
      <div className="py-20 text-center text-surface-500 text-sm font-medium animate-pulse space-y-2">
        <Dumbbell className="w-8 h-8 text-brand-500 mx-auto animate-bounce" />
        <p>Loading your training status...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6 pb-24 max-w-4xl mx-auto">
      {/* ── 1. GREETING & DATE HEADER ── */}
      <section className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight leading-tight">
              {getLocalGreeting()}, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-surface-500 font-semibold mt-0.5">
              {currentDate.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "badge text-xs font-bold px-3 py-1 rounded-full",
                todayStatus === 'Completed'
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : todayStatus === 'In progress'
                  ? "bg-brand-50 text-brand-700 border border-brand-200"
                  : "bg-surface-100 text-surface-600 border border-surface-200"
              )}
            >
              {todayStatus === 'Completed' ? '✓ Trained Today' : todayStatus === 'In progress' ? 'Session In Progress' : 'No Workout Yet'}
            </span>
          </div>
        </div>

        {/* AI Grounded Insight Strip */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-50 border border-surface-200/80 text-surface-700 text-xs leading-relaxed">
          <Sparkles size={15} className="text-brand-600 flex-shrink-0" />
          <span className="font-medium">{quickInsight}</span>
        </div>
      </section>

      {/* ── 2. TODAY'S TRAINING EXPERIENCE (CENTRAL COMPONENT) ── */}
      <section aria-label="Today's training experience" className="space-y-3">
        {activePlan ? (
          <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-5">
            {/* Header with Workout info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                    Week {activePlanWeekNumber} · Day {todayDayNumber}
                  </span>
                  <span className="text-xs text-surface-400 font-medium">
                    {activePlan.name}
                  </span>
                </div>
                <h2 className="text-xl font-black text-surface-900 tracking-tight">
                  {activePlanTodayWorkout ? activePlanTodayWorkout.name : 'Rest & Recovery Day'}
                </h2>
                {activePlanTodayWorkout && (
                  <p className="text-xs text-surface-500 mt-1 flex items-center gap-3 flex-wrap">
                    {activePlanTodayWorkout.target_muscle_groups && activePlanTodayWorkout.target_muscle_groups.length > 0 && (
                      <span>Target: <strong className="text-surface-800">{activePlanTodayWorkout.target_muscle_groups.join(', ')}</strong></span>
                    )}
                    <span>~{activePlanTodayWorkout.estimated_duration || 45} min</span>
                    <span>{planExercises.length} {planExercises.length === 1 ? 'exercise' : 'exercises'}</span>
                  </p>
                )}
              </div>

              {/* Progress Count Badge */}
              {planExercises.length > 0 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-surface-900">
                      {completedPlanExerciseCount} / {planExercises.length} Completed
                    </p>
                    <div className="w-28 bg-surface-100 rounded-full h-2 mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${dailyGoalPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Exercise List with Direct Logging */}
            {activePlanTodayWorkout && planExercisesWithStatus.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-surface-500 font-medium">
                  Watch demonstration videos and log completed sets below:
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {planExercisesWithStatus.map(({ workoutExercise, exercise, isCompleted }) => (
                    <div
                      key={workoutExercise.id}
                      className={cn(
                        "p-3 rounded-xl border transition-all flex items-center justify-between gap-3 group",
                        isCompleted
                          ? "bg-emerald-50/40 border-emerald-200"
                          : "bg-surface-50/70 border-surface-200 hover:border-brand-300 hover:bg-white shadow-2xs"
                      )}
                    >
                      {/* Video Thumbnail */}
                      <div className="w-20 sm:w-24 aspect-video rounded-lg overflow-hidden bg-surface-100 flex-shrink-0 relative border border-surface-200">
                        <ExerciseMedia exercise={exercise} variant="thumbnail" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-surface-900 truncate">
                          {exercise.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {exercise.muscle_group && (
                            <MuscleGroupBadge group={exercise.muscle_group} />
                          )}
                          <span className="text-[11px] font-semibold text-surface-500">
                            {workoutExercise.sets || 3} × {workoutExercise.reps || '8-12'}
                          </span>
                        </div>
                      </div>

                      {/* Completion State or Log Button */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Done</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveLogExercise({
                              exercise,
                              workoutId: activePlanTodayWorkout.id,
                              workoutName: activePlanTodayWorkout.name,
                              workoutExerciseId: workoutExercise.id,
                              targetSets: workoutExercise.sets || 3,
                              targetReps: workoutExercise.reps || '8-12',
                              restSeconds: workoutExercise.rest_seconds || 90
                            })}
                            className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1"
                            title={`Log ${exercise.name}`}
                          >
                            <Plus size={13} className="stroke-[3]" />
                            <span>Log</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !activePlanTodayWorkout || activePlanTodayWorkout.day_type === 'rest' ? (
              <div className="p-6 rounded-xl bg-surface-50 border border-surface-200/80 text-center space-y-1">
                <p className="text-sm font-bold text-surface-800">Rest & Recovery Day</p>
                <p className="text-xs text-surface-500 max-w-sm mx-auto">
                  Muscle tissue rebuilds and adapts during rest. Hydrate, focus on sleep, or perform light mobility.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 border border-brand-100">
                <CalendarDays size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-surface-900 text-base">No Active Plan</h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Choose a goal and start a personalized training program for structured daily guidance.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/plans')}
              id="dashboard-explore-plans-btn"
              className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Explore Plans</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </section>

      {/* ── 3. PRIMARY ACTION: QUICK LOGGING ── */}
      <section aria-label="Log training" className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleOpenManualLog}
          id="dashboard-log-training-btn"
          className="p-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white flex items-center justify-between transition-all shadow-xs group"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center text-white">
              <Plus size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black">Log Training Session</p>
              <p className="text-xs text-brand-100 mt-0.5">Record exercises, sets, reps & weight</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-brand-200 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={handleOpenVoiceLog}
          id="dashboard-voice-log-btn"
          className="p-4 rounded-xl bg-surface-900 hover:bg-surface-800 active:scale-[0.99] text-white flex items-center justify-between transition-all shadow-xs group"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-brand-400">
              <Mic size={20} />
            </div>
            <div>
              <p className="text-sm font-black">Hands-Free Voice Log</p>
              <p className="text-xs text-surface-400 mt-0.5">Speak your sets (e.g. &ldquo;Bench press 80kg 10 reps&rdquo;)</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-surface-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </section>

      {/* ── 4. TODAY'S DAILY PROGRESS ── */}
      <section aria-label="Today's progress summary">
        <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-surface-400">
                Daily Progress · Today
              </h2>
              <p className="text-xs text-surface-500 mt-0.5">
                Automatically resets at local midnight
              </p>
            </div>

            {/* Daily Goal % */}
            <div className="flex items-center gap-2 bg-surface-50 px-3 py-1 rounded-full border border-surface-200">
              <span className="text-[11px] font-bold text-surface-500">Daily Goal:</span>
              <span className="text-xs font-black text-brand-600">{dailyGoalPct}%</span>
            </div>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-100">
              <div className="flex items-center justify-between text-surface-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Exercises</span>
                <Dumbbell size={14} className="text-brand-500" />
              </div>
              <p className="text-2xl font-black text-surface-900 tracking-tight">
                {planExercises.length > 0 ? `${completedPlanExerciseCount} / ${planExercises.length}` : todayMetrics.exercises}
              </p>
              <p className="text-[10px] text-surface-400 mt-0.5">completed</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-100">
              <div className="flex items-center justify-between text-surface-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Sets</span>
                <Layers size={14} className="text-brand-500" />
              </div>
              <p className="text-2xl font-black text-surface-900 tracking-tight">
                {todayMetrics.sets}
              </p>
              <p className="text-[10px] text-surface-400 mt-0.5">logged sets</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-100">
              <div className="flex items-center justify-between text-surface-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Volume</span>
                <Flame size={14} className="text-amber-500" />
              </div>
              <p className="text-2xl font-black text-surface-900 tracking-tight">
                {formatVolumeDisplay(todayMetrics.volume)}
              </p>
              <p className="text-[10px] text-surface-400 mt-0.5">lifted</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-100">
              <div className="flex items-center justify-between text-surface-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
                <Clock size={14} className="text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-surface-900 tracking-tight">
                {todayMetrics.durationMins} <span className="text-xs font-semibold text-surface-500">min</span>
              </p>
              <p className="text-[10px] text-surface-400 mt-0.5">active time</p>
            </div>
          </div>

          {/* Today's Logged Exercises Breakdown */}
          {todayExercisesBreakdown.length > 0 && (
            <div className="pt-2 border-t border-surface-100 space-y-2">
              <p className="text-xs font-bold text-surface-700">Today&rsquo;s Completed Movements:</p>
              <div className="divide-y divide-surface-100">
                {todayExercisesBreakdown.map((ex, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-bold text-surface-900">{ex.name}</span>
                    </div>
                    <span className="text-surface-500 font-mono">
                      {ex.sets} {ex.sets === 1 ? 'set' : 'sets'} · {ex.weightDisplay} {ex.volume > 0 && `· ${formatVolumeDisplay(ex.volume)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. CURRENT PLAN OVERVIEW ON HOME ── */}
      {activePlan && (
        <section aria-label="Current training program">
          <div className="card p-5 sm:p-6 bg-gradient-to-br from-surface-900 via-surface-900 to-surface-800 text-white rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400 bg-brand-500/20 px-2 py-0.5 rounded-full border border-brand-500/30">
                    Current Program
                  </span>
                  <span className="text-xs text-surface-400">
                    Week {activePlanWeekNumber} of {activePlan.duration_weeks || 12}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {activePlan.name}
                </h3>
                <p className="text-xs text-surface-300 mt-1">
                  {completedSessionsCount} / {totalPlannedSessions} sessions completed ({overallPlanPct}%)
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/plans')}
                id="home-view-plan-details-btn"
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Continue Program</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(3, overallPlanPct)}%` }}
              />
            </div>

            {/* Today vs Next Workout */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1 border-t border-white/10 text-xs">
              <div>
                <span className="text-surface-400 block text-[11px]">Today&rsquo;s Workout:</span>
                <span className="font-bold text-white mt-0.5 block">
                  {activePlanTodayWorkout ? activePlanTodayWorkout.name : 'Rest / Recovery Day'}
                </span>
              </div>
              {nextWorkout && (
                <div>
                  <span className="text-surface-400 block text-[11px]">Next Workout:</span>
                  <span className="font-bold text-surface-300 mt-0.5 block">
                    Day {nextWorkout.day_number}: {nextWorkout.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. 7-DAY WEEKLY ACTIVITY (MON - SUN TAP TO INSPECT) ── */}
      <section aria-label="Weekly training activity">
        <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-brand-600" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-surface-900">
                Weekly Activity
              </h2>
            </div>
            <span className="text-xs font-semibold text-surface-500">
              {weeklySessionCount} {weeklySessionCount === 1 ? 'workout' : 'workouts'} this week
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weeklyDays.map((day, idx) => (
              <button
                key={day.label}
                type="button"
                onClick={() => setSelectedDayIndex(selectedDayIndex === idx ? null : idx)}
                className={cn(
                  "flex flex-col items-center py-2.5 px-1 rounded-xl transition-all text-center select-none cursor-pointer border",
                  day.isToday
                    ? "bg-brand-50 border-brand-300 ring-2 ring-brand-400/20"
                    : selectedDayIndex === idx
                    ? "bg-surface-100 border-surface-300"
                    : "bg-surface-50 border-surface-100 hover:border-surface-200"
                )}
              >
                <span className="text-[10px] font-bold uppercase text-surface-400">
                  {day.label}
                </span>
                <span className={cn(
                  "text-sm font-black mt-0.5",
                  day.isToday ? "text-brand-600" : "text-surface-800"
                )}>
                  {day.dateNumber}
                </span>

                <div className="mt-2 h-4 flex items-center justify-center">
                  {day.hasWorkout ? (
                    <span 
                      className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" 
                      title={`${day.label}: ${day.volume.toLocaleString()} kg lifted`}
                    />
                  ) : (
                    <span className="w-2 h-0.5 bg-surface-300 rounded-full" title={`${day.label}: Rest`} />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Inspection Card for selected day */}
          {selectedDayIndex !== null && (
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 animate-slide-up space-y-2 relative">
              <button
                type="button"
                onClick={() => setSelectedDayIndex(null)}
                className="absolute top-3 right-3 p-1 rounded-lg text-surface-400 hover:text-surface-700"
                aria-label="Close day summary"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-surface-900">
                  {weeklyDays[selectedDayIndex].label} · {weeklyDays[selectedDayIndex].fullDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                {weeklyDays[selectedDayIndex].hasWorkout ? (
                  <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Workout Completed
                  </span>
                ) : (
                  <span className="badge bg-surface-100 text-surface-500 text-[10px]">
                    Rest Day
                  </span>
                )}
              </div>

              {weeklyDays[selectedDayIndex].hasWorkout ? (
                <div className="text-xs text-surface-600 space-y-1 pt-1">
                  <p className="font-bold text-surface-900">
                    {weeklyDays[selectedDayIndex].primarySession?.workout_name || 'Completed Workout'}
                  </p>
                  <p className="text-surface-500 font-mono">
                    {weeklyDays[selectedDayIndex].sets} sets · {formatVolumeDisplay(weeklyDays[selectedDayIndex].volume)} volume {weeklyDays[selectedDayIndex].durationSeconds > 0 && `· ${formatDuration(Math.round(weeklyDays[selectedDayIndex].durationSeconds / 60))}`}
                  </p>
                  {weeklyDays[selectedDayIndex].exercises.length > 0 && (
                    <p className="text-surface-600 text-[11px] pt-1">
                      Exercises: {weeklyDays[selectedDayIndex].exercises.join(', ')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-surface-500">
                  No workouts recorded on this date.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 7. RECENT ACHIEVEMENTS & PERSONAL BESTS ── */}
      <section aria-label="Recent personal best record">
        <div className="card p-4 sm:p-5 bg-gradient-to-br from-amber-50/40 via-white to-surface-50 border border-amber-200/70 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Trophy size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  Personal Record
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
              <span>View All</span>
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

      {/* ── PLAN EXERCISE MODAL (DIRECT FROM TODAY'S TRAINING) ── */}
      {activeLogExercise && (
        <PlanExerciseModal
          isOpen={!!activeLogExercise}
          onClose={() => setActiveLogExercise(null)}
          exercise={activeLogExercise.exercise}
          workoutId={activeLogExercise.workoutId}
          workoutName={activeLogExercise.workoutName}
          workoutExerciseId={activeLogExercise.workoutExerciseId}
          targetSets={activeLogExercise.targetSets}
          targetReps={activeLogExercise.targetReps}
          restSeconds={activeLogExercise.restSeconds}
          planId={activePlan?.id}
          instanceId={activePlanInstance?.instanceId}
          weekNumber={activePlanWeekNumber}
          dayNumber={todayDayNumber}
          onCompleted={() => {
            refreshRef.current?.()
            fetchPlanData()
            setActiveLogExercise(null)
          }}
        />
      )}
    </div>
  )
}
