import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, BookOpen, TrendingUp, CheckCircle2, Play, Activity } from 'lucide-react'
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

  // Refetch when returning to the dashboard / window focus
  useEffect(() => {
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  // ── Scoped Strictly to TODAY ONLY ──
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

  // Next planned workout if user has a custom plan
  const planWorkouts = activePlan
    ? workouts.filter(w => w.plan_id === activePlan.id).sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
    : []
  const todaysWorkout = planWorkouts.length > 0 ? planWorkouts[0] : null

  // Activity breakdown for today's completed session
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

  if (loading && history.length === 0) {
    return (
      <div className="p-12 text-center text-surface-500 text-sm font-medium animate-pulse">
        Loading today's training status...
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6 pb-24 max-w-4xl mx-auto">
      {/* ── Header: Greeting + Local Date ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-surface-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">
            {getLocalGreeting()}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-0.5">
            {today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-sm flex items-center gap-1.5 flex-shrink-0"
            onClick={() => navigate(todaysWorkout ? `/workouts/${todaysWorkout.id}/run` : '/workouts/quick')}
            id="dashboard-start-workout"
            aria-label="Start workout"
          >
            <Plus size={16} />
            Start Workout
          </button>
        </div>
      </div>

      {/* ── TODAY ONLY PERFORMANCE SUMMARY ── */}
      <section aria-label="Today's Performance Overview">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
            Today
          </h2>
          <span className="text-[10px] text-surface-400">
            Resets at midnight
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Workout Status */}
          <div className="card p-3.5 sm:p-4 bg-white border border-surface-200">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Status</span>
            <p className={cn(
              "text-base sm:text-lg font-bold mt-0.5",
              todayStatus === 'Completed' ? 'text-emerald-600' :
              todayStatus === 'In progress' ? 'text-brand-600' : 'text-surface-700'
            )}>
              {todayStatus}
            </p>
          </div>

          {/* 2. Exercises Count */}
          <div className="card p-3.5 sm:p-4 bg-white border border-surface-200">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Exercises</span>
            <p className="text-base sm:text-lg font-bold text-surface-900 mt-0.5">
              {todayExercises}
            </p>
          </div>

          {/* 3. Sets Count */}
          <div className="card p-3.5 sm:p-4 bg-white border border-surface-200">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Sets</span>
            <p className="text-base sm:text-lg font-bold text-surface-900 mt-0.5">
              {todaySets}
            </p>
          </div>

          {/* 4. Volume Lifted */}
          <div className="card p-3.5 sm:p-4 bg-white border border-surface-200">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Volume</span>
            <p className="text-base sm:text-lg font-bold text-surface-900 mt-0.5">
              {todayVolume.toLocaleString()} <span className="text-xs font-normal text-surface-400">kg</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── TODAY'S WORKOUT PRIMARY CARD ── */}
      <section aria-label="Today's workout session">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
            Today's Training
          </h2>
        </div>

        {todayStatus === 'Completed' && completedTodaySession ? (
          <div className="card p-6 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-2xl shadow-sm border-0">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-emerald-300" />
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
                Workout Completed Today
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1">
              {completedTodaySession.workout_name}
            </h3>
            <p className="text-emerald-100 text-xs sm:text-sm mb-4">
              {completedTodaySession.total_exercises} exercises · {completedTodaySession.completed_sets} sets logged · {completedTodaySession.total_volume.toLocaleString()} kg total volume · {Math.round((completedTodaySession.duration_seconds || 0) / 60)} min
            </p>

            {/* Concise activity breakdown */}
            {todayExercisesBreakdown.length > 0 && (
              <div className="bg-white/10 rounded-xl p-3 mb-4 backdrop-blur-xs space-y-1.5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block mb-1">
                  Today's Activity
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {todayExercisesBreakdown.map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-black/10">
                      <span className="font-semibold text-white truncate max-w-[180px]">{ex.name}</span>
                      <span className="text-emerald-200 font-medium">
                        {ex.sets} sets {ex.maxWeight > 0 ? `· ${ex.maxWeight} kg` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => navigate(`/history/${completedTodaySession.id}`)}
                className="bg-white text-emerald-900 font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                View Today's Record
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => navigate('/workouts/quick')}
                className="bg-emerald-800/60 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors border border-emerald-500/30 inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                Start Another Session
              </button>
            </div>
          </div>
        ) : todayStatus === 'In progress' && activeTodaySession ? (
          <div className="card p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-2xl shadow-sm border-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-brand-200 text-xs font-bold uppercase tracking-wider">
                Workout In Progress
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1">
              {activeTodaySession.workout_name}
            </h3>
            <p className="text-brand-100 text-xs sm:text-sm mb-4">
              {todayExercises} exercises · {todaySets} sets logged · {todayVolume.toLocaleString()} kg volume
            </p>
            <button
              onClick={() => navigate(`/workouts/${activeTodaySession.workout_id || 'quick'}/run`)}
              className="bg-white text-brand-700 font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-brand-50 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Play size={14} className="fill-brand-700" />
              Continue Workout
            </button>
          </div>
        ) : (
          <div className="card p-6 bg-gradient-to-br from-surface-900 via-surface-850 to-surface-800 text-white rounded-2xl shadow-sm border-0">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-brand-400" />
              <span className="text-surface-400 text-xs font-bold uppercase tracking-wider">
                Today's Session
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1">
              {todaysWorkout ? todaysWorkout.name : "Ready to Train"}
            </h3>
            <p className="text-surface-300 text-xs sm:text-sm mb-5 max-w-lg leading-relaxed">
              Log your exercises, weight, reps, and sets cleanly. Zero questionnaires or distractions.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(todaysWorkout ? `/workouts/${todaysWorkout.id}/run` : '/workouts/quick')}
                className="btn-primary text-xs sm:text-sm py-2.5 px-5 font-bold shadow-md inline-flex items-center gap-2"
              >
                <Play size={15} className="fill-white" />
                Start Workout
              </button>
              <button
                onClick={() => navigate('/exercises')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <BookOpen size={14} />
                Explore Exercises
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── SECONDARY EXPLORATION & REVIEW ── */}
      <section aria-label="Explore and Review">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/exercises')}
            className="card p-5 text-left hover:border-brand-300 transition-colors group flex flex-col justify-between bg-white border border-surface-200"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <BookOpen size={18} />
              </div>
              <p className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors">
                Exercise Library
              </p>
              <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                Visual demonstrations, execution form cues, and instant 1-tap addition to today's workout.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-brand-600">
              <span>Browse movements</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/progress')}
            className="card p-5 text-left hover:border-brand-300 transition-colors group flex flex-col justify-between bg-white border border-surface-200"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <TrendingUp size={18} />
              </div>
              <p className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors">
                Progress & History
              </p>
              <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                Review your 14-day training calendar, historical workout records, volume metrics, and 1RM progress.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-brand-600">
              <span>View analytics</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </section>
    </div>
  )
}
