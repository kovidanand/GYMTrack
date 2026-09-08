import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, BookOpen, Calendar, TrendingUp, Dumbbell, History as HistoryIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/hooks/useProgress'
import { useWorkouts } from '@/hooks/useWorkouts'
import { formatDuration, cn } from '@/lib/utils'

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
  const { history, loading } = useProgress()

  const firstName = profile?.first_name || user?.email?.split('@')[0] || 'Athlete'
  const today = new Date()

  // ── Scoped Strictly to TODAY ONLY ──
  const todaySessions = history.filter(s => isSameDay(new Date(s.started_at), today))
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

  // Next planned workout
  const planWorkouts = activePlan
    ? workouts.filter(w => w.plan_id === activePlan.id).sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
    : []
  const todaysWorkout = planWorkouts.length > 0 ? planWorkouts[0] : workouts[0]

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse text-surface-500 text-sm font-medium">
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
            className="btn-primary text-xs sm:text-sm py-2 px-4 shadow-sm flex items-center gap-1.5 flex-shrink-0"
            onClick={() => navigate(todaysWorkout ? `/workouts/${todaysWorkout.id}/run` : '/workouts/quick')}
            id="dashboard-start-workout"
            aria-label="Start a workout"
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
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Workout</span>
            <p className={cn(
              "text-base sm:text-lg font-bold mt-0.5",
              todayStatus === 'Completed' ? 'text-emerald-600' :
              todayStatus === 'In progress' ? 'text-brand-600' : 'text-surface-800'
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

      {/* ── TODAY'S WORKOUT CARD ── */}
      <section aria-label="Today's workout session">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
            Today's Workout
          </h2>
        </div>

        {todayStatus === 'Completed' && completedTodaySession ? (
          <div className="card p-5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl shadow-sm border-0">
            <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
              Completed Today
            </span>
            <h3 className="text-xl font-bold mt-1 mb-1">
              {completedTodaySession.workout_name}
            </h3>
            <p className="text-emerald-100 text-xs mb-4">
              {completedTodaySession.total_exercises} exercises · {completedTodaySession.completed_sets} sets · {completedTodaySession.total_volume.toLocaleString()} kg volume · {Math.round((completedTodaySession.duration_seconds || 0) / 60)} min
            </p>
            <button
              onClick={() => navigate(`/history/${completedTodaySession.id}`)}
              className="bg-white text-emerald-800 font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              View Today's Workout
              <ChevronRight size={14} />
            </button>
          </div>
        ) : todayStatus === 'In progress' && activeTodaySession ? (
          <div className="card p-5 bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-2xl shadow-sm border-0">
            <span className="text-brand-200 text-xs font-bold uppercase tracking-wider animate-pulse">
              In Progress
            </span>
            <h3 className="text-xl font-bold mt-1 mb-1">
              {activeTodaySession.workout_name}
            </h3>
            <p className="text-brand-100 text-xs mb-4">
              {todayExercises} exercises · {todaySets} sets logged · {todayVolume.toLocaleString()} kg volume
            </p>
            <button
              onClick={() => navigate(`/workouts/${activeTodaySession.workout_id || 'quick'}/run`)}
              className="bg-white text-brand-700 font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-brand-50 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              Continue Workout
              <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div className="card p-5 bg-gradient-to-br from-surface-900 to-surface-800 text-white rounded-2xl shadow-sm border-0">
            <span className="text-surface-400 text-xs font-bold uppercase tracking-wider">
              Ready to Train
            </span>
            <h3 className="text-xl font-bold mt-1 mb-1">
              {todaysWorkout ? todaysWorkout.name : 'Quick Workout'}
            </h3>
            <p className="text-surface-300 text-xs mb-4">
              {todaysWorkout
                ? `${todaysWorkout.workout_exercises?.length || 0} exercises planned · ~${formatDuration(todaysWorkout.estimated_duration || 0)}`
                : 'Log exercises, weight, reps, and sets with instant suggestion assistance.'}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {todaysWorkout && (
                <button
                  onClick={() => navigate(`/workouts/${todaysWorkout.id}/run`)}
                  className="btn-primary text-xs py-2.5 px-4 font-bold shadow-sm"
                >
                  Start {todaysWorkout.name}
                </button>
              )}
              <button
                onClick={() => navigate('/workouts/quick')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
              >
                Start Quick Workout
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── FAST NAVIGATION TILES ── */}
      <section aria-label="Quick navigation">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/workouts')}
            className="card p-4 text-left hover:border-brand-300 transition-colors group flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-bold text-surface-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                <Dumbbell size={14} className="text-brand-500" /> Workouts
              </p>
              <p className="text-[11px] text-surface-400 mt-1">{workouts.length} routines</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-brand-600">
              <span>View routines</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="card p-4 text-left hover:border-brand-300 transition-colors group flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-bold text-surface-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                <HistoryIcon size={14} className="text-brand-500" /> History
              </p>
              <p className="text-[11px] text-surface-400 mt-1">{history.length} sessions</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-brand-600">
              <span>14-day logs</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/exercises')}
            className="card p-4 text-left hover:border-brand-300 transition-colors group flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-bold text-surface-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                <BookOpen size={14} className="text-brand-500" /> Library
              </p>
              <p className="text-[11px] text-surface-400 mt-1">Movement cues</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-brand-600">
              <span>Browse</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/progress')}
            className="card p-4 text-left hover:border-brand-300 transition-colors group flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-bold text-surface-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                <TrendingUp size={14} className="text-brand-500" /> Progress
              </p>
              <p className="text-[11px] text-surface-400 mt-1">1RM & trends</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-brand-600">
              <span>Analytics</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </section>
    </div>
  )
}
