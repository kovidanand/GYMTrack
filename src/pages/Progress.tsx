import { useState } from 'react'
import { Trophy, TrendingUp } from 'lucide-react'
import { PageHeader, SectionHeader, StatCard } from '@/components/shared'
import { StrengthChart, VolumeChart, ConsistencyCalendar, PRCard } from '@/components/progress/ProgressComponents'
import {
  benchPressProgress, squatProgress, deadliftProgress,
  weeklyVolumeData, monthlyConsistency,
  personalRecords, overallStats,
} from '@/data/progress'
import { formatDuration } from '@/lib/utils'
import { Activity, Clock, Flame, BarChart2 } from 'lucide-react'

type ExerciseTab = 'bench' | 'squat' | 'deadlift'

const exerciseOptions: { key: ExerciseTab; label: string; color: string }[] = [
  { key: 'bench',    label: 'Bench Press', color: '#6366f1' },
  { key: 'squat',    label: 'Squat',       color: '#10b981' },
  { key: 'deadlift', label: 'Deadlift',    color: '#f59e0b' },
]

const chartData: Record<ExerciseTab, typeof benchPressProgress> = {
  bench:    benchPressProgress,
  squat:    squatProgress,
  deadlift: deadliftProgress,
}

// Split August data for calendar
const augustData = monthlyConsistency.filter(d => d.date.startsWith('2026-08'))
const septemberData = monthlyConsistency.filter(d => d.date.startsWith('2026-09'))

export default function Progress() {
  const [activeExercise, setActiveExercise] = useState<ExerciseTab>('bench')

  const selectedChart  = chartData[activeExercise]
  const selectedOption = exerciseOptions.find(o => o.key === activeExercise)!
  const latestValue    = selectedChart[selectedChart.length - 1]?.value ?? 0
  const firstValue     = selectedChart[0]?.value ?? 0
  const improvement    = ((latestValue - firstValue) / firstValue * 100).toFixed(1)

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Progress"
        description="Your strength, consistency and training volume over time."
      />

      {/* ── Overview Stats ── */}
      <section aria-label="Training overview">
        <SectionHeader title="Overview" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Workouts"
            value={overallStats.totalWorkouts}
            icon={<Activity size={18} />}
            trend="up"
            trendValue={`${overallStats.weeklyWorkouts} this week`}
          />
          <StatCard
            label="Training Time"
            value={formatDuration(overallStats.totalTrainingTime)}
            icon={<Clock size={18} />}
            trend="up"
            trendValue={`~${overallStats.averageSessionDuration}min avg`}
          />
          <StatCard
            label="Current Streak"
            value={overallStats.currentStreak}
            unit="days"
            icon={<Flame size={18} />}
            trend="up"
            trendValue={`Best: ${overallStats.longestStreak} days`}
          />
          <StatCard
            label="Weekly Volume"
            value={(overallStats.weeklyVolume / 1000).toFixed(1)}
            unit="k kg"
            icon={<BarChart2 size={18} />}
            trend="up"
            trendValue="↑12% vs last week"
          />
        </div>
      </section>

      {/* ── Strength Progress ── */}
      <section aria-label="Strength progress chart">
        <SectionHeader title="Strength Progress" />
        <div className="card p-5">
          {/* Exercise selector tabs */}
          <div className="flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Select exercise">
            {exerciseOptions.map(opt => (
              <button
                key={opt.key}
                role="tab"
                aria-selected={activeExercise === opt.key}
                id={`progress-tab-${opt.key}`}
                onClick={() => setActiveExercise(opt.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeExercise === opt.key
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Chart header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-surface-900">{selectedOption.label}</p>
              <p className="text-xs text-surface-500">Best lift progression</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold" style={{ color: selectedOption.color }}>
                {latestValue} kg
              </p>
              <p className="text-xs text-emerald-600 font-medium">+{improvement}% progress</p>
            </div>
          </div>

          <StrengthChart
            data={selectedChart}
            unit="kg"
            color={selectedOption.color}
          />

          {/* Mini milestones */}
          <div className="mt-4 pt-4 border-t border-surface-100 flex items-center gap-4 flex-wrap">
            <div className="text-center">
              <p className="text-xs text-surface-500">Start</p>
              <p className="text-sm font-bold text-surface-900">{firstValue} kg</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-surface-200 via-brand-300 to-brand-500" />
            <div className="text-center">
              <p className="text-xs text-surface-500">Current PR</p>
              <p className="text-sm font-bold" style={{ color: selectedOption.color }}>{latestValue} kg</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Training Volume ── */}
      <section aria-label="Weekly training volume">
        <SectionHeader title="Weekly Training Volume" />
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-surface-900">Total Volume (kg)</p>
              <p className="text-xs text-surface-500">Sum of weight × reps per session</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-brand-600">
                {(weeklyVolumeData[weeklyVolumeData.length - 1].value / 1000).toFixed(1)}k kg
              </p>
              <p className="text-xs text-emerald-600 font-medium">This week</p>
            </div>
          </div>
          <VolumeChart data={weeklyVolumeData} />
        </div>
      </section>

      {/* ── Consistency Calendar ── */}
      <section aria-label="Training consistency calendar">
        <SectionHeader
          title="Training Consistency"
          action={
            <div className="flex items-center gap-3 text-xs text-surface-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-brand-500 inline-block" />
                Trained
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-surface-100 inline-block" />
                Rest
              </span>
            </div>
          }
        />
        <div className="card p-5">
          <div className="grid sm:grid-cols-2 gap-8">
            <ConsistencyCalendar data={augustData} month="August 2026" />
            <ConsistencyCalendar data={septemberData} month="September 2026" />
          </div>
          <div className="mt-4 pt-4 border-t border-surface-100 flex items-center gap-6 text-sm">
            <div>
              <span className="font-semibold text-surface-900">
                {augustData.filter(d => d.trained).length}
              </span>
              <span className="text-surface-500"> days trained in August</span>
            </div>
            <div>
              <span className="font-semibold text-surface-900">
                {septemberData.filter(d => d.trained).length}
              </span>
              <span className="text-surface-500"> days in September so far</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Personal Records ── */}
      <section aria-label="Personal records">
        <SectionHeader title="Personal Records" />
        <div className="grid sm:grid-cols-2 gap-3">
          {personalRecords.map(pr => (
            <PRCard
              key={pr.id}
              exerciseName={pr.exerciseName}
              value={pr.value}
              unit={pr.unit}
              achievedAt={pr.achievedAt}
              previousValue={pr.previousValue}
            />
          ))}
        </div>
      </section>

      {/* ── Insights ── */}
      <section aria-label="Training insights">
        <SectionHeader title="Training Insights" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: <TrendingUp size={20} className="text-brand-500" />,
              title: 'Most Improved',
              value: 'Deadlift',
              sub: '+40% in 8 months',
              bg: 'bg-brand-50',
            },
            {
              icon: <Trophy size={20} className="text-amber-500" />,
              title: 'Strongest Lift',
              value: '140 kg',
              sub: 'Conventional Deadlift',
              bg: 'bg-amber-50',
            },
            {
              icon: <Flame size={20} className="text-rose-500" />,
              title: 'Longest Streak',
              value: '18 days',
              sub: 'Personal best',
              bg: 'bg-rose-50',
            },
          ].map(insight => (
            <div key={insight.title} className="card p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${insight.bg}`}>
                {insight.icon}
              </div>
              <p className="text-xs text-surface-500">{insight.title}</p>
              <p className="text-lg font-bold text-surface-900">{insight.value}</p>
              <p className="text-xs text-surface-500">{insight.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
