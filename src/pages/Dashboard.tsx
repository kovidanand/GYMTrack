import { useNavigate } from 'react-router-dom'
import { Activity, Clock, Flame, BarChart2, Trophy, Plus, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { StatCard, SectionHeader, PageHeader, Avatar } from '@/components/shared'
import { useProgress } from '@/hooks/useProgress'
import { useWorkouts } from '@/hooks/useWorkouts'
import { formatDuration, formatRelativeDate } from '@/lib/utils'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  
  const { workouts, activePlan, createStarterRoutine } = useWorkouts()
  const { stats, history, personalRecords, loading } = useProgress()

  const planWorkouts = activePlan
    ? workouts.filter(w => w.plan_id === activePlan.id).sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
    : []
  const todaysWorkout = planWorkouts.length > 0 ? planWorkouts[0] : workouts[0]
  const latestSession = history[0]
  const topPRs = personalRecords.slice(0, 2)

  const firstName = profile?.first_name || user?.email?.split('@')[0] || 'Athlete'

  if (loading) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>

  return (
    <div className="animate-fade-in space-y-8 pb-24">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {profile && <Avatar name={firstName} size="md" className="lg:hidden" />}
            <div>
              <p className="text-surface-500 text-sm">{getGreeting()} 👋</p>
              <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
                {firstName}
              </h1>
            </div>
          </div>
          <p className="text-surface-500 text-sm mt-1">Ready for today's training?</p>
        </div>
        <button
          className="btn-primary flex-shrink-0"
          onClick={() => navigate('/workouts')}
          id="dashboard-start-workout"
          aria-label="Start a workout"
        >
          <Plus size={16} aria-hidden="true" />
          Start Workout
        </button>
      </div>

      {/* ── Today's Workout Card or Starter Prompt ── */}
      {todaysWorkout ? (
        <section aria-label="Today's workout">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white shadow-glow relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-12 translate-x-12" aria-hidden="true" />
            <div className="absolute bottom-0 right-12 w-24 h-24 rounded-full bg-white/5 translate-y-8" aria-hidden="true" />

            <div className="relative">
              <p className="text-brand-200 text-xs font-medium uppercase tracking-wider mb-1">
                {activePlan ? `Up Next · ${activePlan.name}` : 'Up Next'}
              </p>
              <h2 className="text-2xl font-bold mb-1">{todaysWorkout.name}</h2>
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center gap-1.5 text-brand-200 text-sm">
                  <Activity size={14} aria-hidden="true" />
                  {todaysWorkout.workout_exercises?.length || 0} exercises
                </span>
                <span className="text-brand-300">·</span>
                <span className="flex items-center gap-1.5 text-brand-200 text-sm">
                  <Clock size={14} aria-hidden="true" />
                  ~{formatDuration(todaysWorkout.estimated_duration || 0)}
                </span>
              </div>
              <button
                className="bg-white text-brand-700 font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-brand-50 transition-colors active:scale-[0.98]"
                onClick={() => navigate(`/workouts/${todaysWorkout.id}/run`)}
                id="dashboard-today-workout-start"
              >
                Start Workout
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section aria-label="Get started with training">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white shadow-glow relative overflow-hidden">
            <div className="relative">
              <p className="text-brand-200 text-xs font-medium uppercase tracking-wider mb-1">Get Started</p>
              <h2 className="text-2xl font-bold mb-2">Ready to crush your goals?</h2>
              <p className="text-brand-100 text-sm max-w-md mb-5">
                Generate a proven 3-day Push-Pull-Legs routine tailored to your fitness journey, or create your own custom workout.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="bg-white text-brand-700 font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-brand-50 transition-colors active:scale-[0.98]"
                  onClick={async () => {
                    await createStarterRoutine()
                  }}
                >
                  Generate 3-Day Routine
                </button>
                <button
                  className="bg-brand-700/60 hover:bg-brand-700/80 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors border border-white/20"
                  onClick={() => navigate('/workouts/new')}
                >
                  Create Custom Workout
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── AI Coach Entry ── */}
      <section aria-label="AI Coach">
        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer hover:border-brand-300 transition-colors group" onClick={() => navigate('/ai-coach')}>
          <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2a2 2 0 0 1 2 2c0 1.1-.9 2-2 2s-2-.9-2-2a2 2 0 0 1 2-2z"></path><path d="M19 9a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"></path><path d="M5 9a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"></path><path d="M16 15h.01"></path><path d="M8 15h.01"></path><path d="M9 20h6"></path><path d="M15 15v5"></path><path d="M9 15v5"></path><rect x="7" y="7" width="10" height="8" rx="2"></rect></svg>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-surface-900">Ask GYMTrack AI</h3>
            <p className="text-sm text-surface-500 mt-1">Get personalized workout recommendations, progress analysis, and insights based on your training data.</p>
          </div>
          <button className="btn-secondary whitespace-nowrap group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200">
            Open AI Coach
          </button>
        </div>
      </section>

      {/* ── Quick Stats ── */}
      <section aria-label="Training statistics">
        <SectionHeader title="Your Stats" />
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Recent Workout ── */}
        <section aria-label="Recent workout session">
          <SectionHeader
            title="Recent Session"
            action={
              <button
                onClick={() => navigate('/history')}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                View history
                <ChevronRight size={12} />
              </button>
            }
          />
          {latestSession ? (
             <article className="card p-4 cursor-pointer hover:border-brand-300 transition-colors" onClick={() => navigate(`/history/${latestSession.id}`)}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-surface-900 text-sm">{latestSession.workout_name}</h3>
                  <p className="text-xs text-surface-500">{formatRelativeDate(latestSession.started_at)}</p>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700 border-0 text-xs capitalize">{latestSession.status}</span>
              </div>
        
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-base font-bold text-surface-900">{formatDuration(latestSession.duration_seconds || 0)}</p>
                  <p className="text-[10px] text-surface-500 uppercase tracking-wide">Duration</p>
                </div>
                <div className="text-center border-x border-surface-100">
                  <p className="text-base font-bold text-surface-900">{latestSession.completed_sets || '—'}</p>
                  <p className="text-[10px] text-surface-500 uppercase tracking-wide">Sets</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-surface-900">{((latestSession.total_volume || 0) / 1000).toFixed(1)}k</p>
                  <p className="text-[10px] text-surface-500 uppercase tracking-wide">Volume (kg)</p>
                </div>
              </div>
            </article>
          ) : (
            <div className="card p-6 text-center text-surface-500">
              No recent sessions.
            </div>
          )}
        </section>

        {/* ── Personal Records ── */}
        <section aria-label="Personal records">
          <SectionHeader
            title="Personal Records"
            action={
              <button
                onClick={() => navigate('/progress')}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                View all
                <ChevronRight size={12} />
              </button>
            }
          />
          {topPRs.length > 0 ? (
            <div className="space-y-3">
              {topPRs.map(pr => (
                <div key={pr.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Trophy size={18} className="text-amber-500" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-900">{pr.exerciseName}</p>
                    <p className="text-xs text-surface-500">{formatRelativeDate(pr.achievedAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-brand-600">{pr.value}</p>
                    <p className="text-xs text-surface-500">{pr.unit}</p>
                  </div>
                </div>
              ))}
              <div className="card p-4 flex items-center justify-between text-sm text-surface-500 hover:bg-surface-50 cursor-pointer transition-colors" onClick={() => navigate('/progress')}>
                <span>View all {personalRecords.length} records</span>
                <ChevronRight size={16} />
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center text-surface-500">
              No personal records yet. Log some workouts!
            </div>
          )}
        </section>
      </div>

      {/* ── Quick Actions ── */}
      <section aria-label="Quick actions">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Browse Exercises', icon: '📚', to: '/exercises' },
            { label: 'View Progress',    icon: '📈', to: '/progress' },
            { label: 'My Workouts',      icon: '💪', to: '/workouts' },
            { label: 'Workout History',  icon: '🗓️', to: '/history' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="card p-4 text-center hover:shadow-card-hover transition-shadow cursor-pointer group"
              id={`quick-action-${action.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <p className="text-xs font-medium text-surface-600 group-hover:text-brand-600 transition-colors">
                {action.label}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
