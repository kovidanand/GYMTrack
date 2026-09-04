import { useNavigate } from 'react-router-dom'
import { Activity, Clock, Flame, BarChart2, Trophy, Plus, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { StatCard, SectionHeader, PageHeader, Avatar } from '@/components/shared'
import { WorkoutCard, SessionCard, DayActivity } from '@/components/workout/WorkoutComponents'
import { workouts, recentSessions } from '@/data/workouts'
import { weeklyActivity, personalRecords, overallStats } from '@/data/progress'
import { formatDuration, formatRelativeDate } from '@/lib/utils'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const todaysWorkout = workouts.find(w => w.id === 'wo-004') // Upper Body Strength
  const latestSession = recentSessions[0]
  const topPRs = personalRecords.slice(0, 2)

  return (
    <div className="animate-fade-in space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {user && <Avatar name={user.name} size="md" className="lg:hidden" />}
            <div>
              <p className="text-surface-500 text-sm">{getGreeting()} 👋</p>
              <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
                {user?.name.split(' ')[0] ?? 'Athlete'}
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

      {/* ── Today's Workout Card ── */}
      {todaysWorkout && (
        <section aria-label="Today's workout">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white shadow-glow relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-12 translate-x-12" aria-hidden="true" />
            <div className="absolute bottom-0 right-12 w-24 h-24 rounded-full bg-white/5 translate-y-8" aria-hidden="true" />

            <div className="relative">
              <p className="text-brand-200 text-xs font-medium uppercase tracking-wider mb-1">Today's Workout</p>
              <h2 className="text-2xl font-bold mb-1">{todaysWorkout.name}</h2>
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center gap-1.5 text-brand-200 text-sm">
                  <Activity size={14} aria-hidden="true" />
                  {todaysWorkout.exercises.length} exercises
                </span>
                <span className="text-brand-300">·</span>
                <span className="flex items-center gap-1.5 text-brand-200 text-sm">
                  <Clock size={14} aria-hidden="true" />
                  ~{formatDuration(todaysWorkout.estimatedDuration)}
                </span>
              </div>
              <button
                className="bg-white text-brand-700 font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-brand-50 transition-colors active:scale-[0.98]"
                onClick={() => navigate('/workouts')}
                id="dashboard-today-workout-start"
              >
                Start Workout
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Quick Stats ── */}
      <section aria-label="Training statistics">
        <SectionHeader title="Your Stats" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Workouts"
            value={overallStats.totalWorkouts}
            icon={<Activity size={18} />}
            trend="up"
            trendValue="+8 this month"
          />
          <StatCard
            label="Training Time"
            value={Math.round(overallStats.totalTrainingTime / 60)}
            unit="hours"
            icon={<Clock size={18} />}
            trend="up"
            trendValue="+3.5h this week"
          />
          <StatCard
            label="Current Streak"
            value={overallStats.currentStreak}
            unit="days"
            icon={<Flame size={18} />}
            trend="up"
            trendValue="Best: 18 days"
          />
          <StatCard
            label="Weekly Volume"
            value={(overallStats.weeklyVolume / 1000).toFixed(1)}
            unit="k kg"
            icon={<BarChart2 size={18} />}
            trend="up"
            trendValue="+12% vs last week"
          />
        </div>
      </section>

      {/* ── Weekly Activity ── */}
      <section aria-label="Weekly activity">
        <SectionHeader title="This Week" />
        <div className="card p-5">
          <div className="flex items-center justify-between gap-2">
            {weeklyActivity.map((day, i) => (
              <DayActivity
                key={day.day}
                day={day.day}
                trained={day.trained}
                duration={day.duration}
                isToday={i === 0}
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between text-sm">
            <span className="text-surface-600">
              <span className="font-semibold text-surface-900">{weeklyActivity.filter(d => d.trained).length}</span> of 7 days trained
            </span>
            <span className="text-surface-600">
              Total: <span className="font-semibold text-surface-900">
                {formatDuration(weeklyActivity.reduce((acc, d) => acc + (d.duration ?? 0), 0))}
              </span>
            </span>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Recent Workout ── */}
        <section aria-label="Recent workout session">
          <SectionHeader
            title="Recent Session"
            action={
              <button
                onClick={() => navigate('/workouts')}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                View all
                <ChevronRight size={12} />
              </button>
            }
          />
          {latestSession && <SessionCard session={latestSession} />}
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
            { label: 'Edit Profile',     icon: '👤', to: '/profile' },
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
