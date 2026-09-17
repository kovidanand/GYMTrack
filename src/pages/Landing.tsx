import { Link } from 'react-router-dom'
import {
  BarChart2, BookOpen, Timer, TrendingUp,
  ChevronRight, Star, ArrowRight,
  Dumbbell, Target, Zap, CheckCircle2,
} from 'lucide-react'
import { GYMTrackLogo } from '@/components/shared'
import { SparkLine } from '@/components/progress/ProgressComponents'
import { useState } from 'react'

// ─── Mock data for previews ────────────────────────────────────────────────────

const benchData = [60, 65, 67.5, 70, 72.5, 75, 80, 82.5, 87.5, 92.5]
const squatData  = [80, 85, 90,  95,  100, 105, 110, 115, 120]
const dlData     = [100,110,115,120, 125, 130, 132.5, 135, 140]

const features = [
  {
    icon: BarChart2,
    title: 'Workout Tracking',
    description: 'Log exercises, sets, reps, weight and training duration. Every session recorded automatically.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: BookOpen,
    title: 'Exercise Library',
    description: 'Learn exercises with clear instructions, target muscles, tips and visual demonstrations.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Understand your strength, consistency and training volume over time with clean charts.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Timer,
    title: 'Training Timer',
    description: 'Use a simple stopwatch and rest timer while training, so you stay focused and on pace.',
    color: 'bg-amber-50 text-amber-600',
  },
]

const workflowSteps = [
  { step: '01', label: 'Discover', desc: 'Browse the exercise library and learn proper technique.' },
  { step: '02', label: 'Plan',     desc: 'Build your own workouts or use curated templates.' },
  { step: '03', label: 'Train',    desc: 'Follow your workout and use the built-in timer.' },
  { step: '04', label: 'Track',    desc: 'Log every set and rep with weight and duration.' },
  { step: '05', label: 'Improve',  desc: 'Review your progress and set new personal records.' },
]

const previewExercises = [
  { name: 'Barbell Bench Press', muscle: 'Chest',     equipment: 'Barbell',   difficulty: 'Intermediate', color: 'bg-rose-100 text-rose-600' },
  { name: 'Back Squat',          muscle: 'Quads',     equipment: 'Barbell',   difficulty: 'Intermediate', color: 'bg-amber-100 text-amber-600' },
  { name: 'Conventional Deadlift', muscle: 'Back',    equipment: 'Barbell',   difficulty: 'Intermediate', color: 'bg-blue-100 text-blue-600' },
  { name: 'Lat Pulldown',        muscle: 'Back',      equipment: 'Cable',     difficulty: 'Beginner',     color: 'bg-sky-100 text-sky-600' },
  { name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Beginner', color: 'bg-violet-100 text-violet-600' },
  { name: 'Cable Triceps Pushdown', muscle: 'Triceps', equipment: 'Cable',    difficulty: 'Beginner',    color: 'bg-indigo-100 text-indigo-600' },
]

const difficultyBg: Record<string, string> = {
  Beginner: 'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced: 'bg-red-50 text-red-700',
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-surface-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <GYMTrackLogo size="md" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Landing navigation">
            <a href="#features"  className="text-sm text-surface-600 hover:text-surface-900 transition-colors">Features</a>
            <a href="#exercises" className="text-sm text-surface-600 hover:text-surface-900 transition-colors">Exercises</a>
            <a href="#progress"  className="text-sm text-surface-600 hover:text-surface-900 transition-colors">Progress</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"   className="btn-ghost text-sm px-4 py-2">Log in</Link>
            <Link to="/signup" className="btn-primary text-sm px-5 py-2.5" id="landing-get-started">Get Started</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 bg-surface-700 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-surface-700 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-surface-700 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-surface-100 space-y-3 animate-slide-up">
            <a href="#features"  className="block text-sm text-surface-600 py-2" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#exercises" className="block text-sm text-surface-600 py-2" onClick={() => setMenuOpen(false)}>Exercises</a>
            <a href="#progress"  className="block text-sm text-surface-600 py-2" onClick={() => setMenuOpen(false)}>Progress</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login"  className="btn-secondary text-sm flex-1 justify-center">Log in</Link>
              <Link to="/signup" className="btn-primary  text-sm flex-1 justify-center">Get Started</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// ─── Dashboard Preview Card ────────────────────────────────────────────────────

function DashboardPreview() {
  return (
    <div className="relative bg-white rounded-2xl border border-surface-200 shadow-2xl overflow-hidden max-w-lg w-full">
      {/* Mini sidebar */}
      <div className="flex h-full">
        <div className="hidden sm:flex flex-col w-44 bg-surface-50 border-r border-surface-100 p-4 gap-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
              <Dumbbell size={12} className="text-white" />
            </div>
            <span className="text-xs font-bold text-surface-900">GYMTrack</span>
          </div>
          {['Dashboard','Workouts','Exercises','Progress','Profile'].map((item, i) => (
            <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium ${i === 0 ? 'bg-brand-50 text-brand-700' : 'text-surface-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-brand-500' : 'bg-surface-300'}`} />
              {item}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 p-4 space-y-3 overflow-hidden">
          <div>
            <p className="text-xs text-surface-500">Good morning 👋</p>
            <p className="text-sm font-bold text-surface-900">Ready for today's training?</p>
          </div>

          {/* Today's workout */}
          <div className="bg-brand-500 rounded-xl p-3 text-white">
            <p className="text-xs opacity-80 mb-0.5">Today's Workout</p>
            <p className="text-sm font-bold">Upper Body Strength</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">6 exercises</span>
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">~52 min</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Exercises', value: '2' },
              { label: 'Sets', value: '7' },
              { label: 'Volume', value: '1,240 kg' },
              { label: 'Duration', value: '42 min' },
            ].map(s => (
              <div key={s.label} className="bg-surface-50 rounded-lg p-2">
                <p className="text-[10px] text-surface-500">{s.label}</p>
                <p className="text-xs font-bold text-surface-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Spark chart */}
          <div className="bg-surface-50 rounded-lg p-2">
            <p className="text-[10px] text-surface-500 mb-1">Bench Press · 8 weeks</p>
            <SparkLine data={benchData.slice(-8)} />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-surface-400">60 kg</span>
              <span className="text-[10px] font-bold text-brand-600">92.5 kg ↑</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Landing Page ──────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      {/* ── HERO ── */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200 mb-6">
              <Star size={12} aria-hidden="true" />
              Train. Track. Improve.
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-surface-900 leading-[1.1] tracking-tight mb-6">
              Train smarter.{' '}
              <span className="gradient-text">Track your</span>{' '}
              progress.
            </h1>

            <p className="text-lg text-surface-600 leading-relaxed mb-8 max-w-xl">
              GYMTrack helps you plan workouts, learn exercises, track every session
              and understand your progress — all in one simple experience.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/signup"
                id="hero-start-training"
                className="btn-primary text-base px-7 py-3.5"
              >
                Start Tracking
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/exercises"
                id="hero-explore-exercises"
                className="btn-secondary text-base px-7 py-3.5"
              >
                Explore Exercises
              </Link>
            </div>

            {/* Product capabilities guarantee */}
            <div className="mt-8 pt-6 border-t border-surface-100 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-surface-400">Core Product Principles</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 text-surface-700 text-xs font-medium border border-surface-200">
                  <CheckCircle2 size={13} className="text-emerald-500" /> Track every set
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 text-surface-700 text-xs font-medium border border-surface-200">
                  <CheckCircle2 size={13} className="text-emerald-500" /> Real volume analytics
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 text-surface-700 text-xs font-medium border border-surface-200">
                  <CheckCircle2 size={13} className="text-emerald-500" /> Voice & manual logging
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 text-surface-700 text-xs font-medium border border-surface-200">
                  <CheckCircle2 size={13} className="text-emerald-500" /> Offline-friendly
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 text-surface-700 text-xs font-medium border border-surface-200">
                  <CheckCircle2 size={13} className="text-emerald-500" /> Zero fabricated data
                </span>
              </div>
            </div>
          </div>

          {/* Product preview */}
          <div className="flex justify-center lg:justify-end animate-fade-in">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 sm:py-24 bg-surface-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="label-sm text-brand-600 mb-3">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
              Built for how you train
            </h2>
            <p className="mt-4 text-surface-500 max-w-xl mx-auto">
              A calm, focused companion for your fitness journey. No clutter, no confusion — just the tools that matter.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card p-6 hover:shadow-card-hover transition-shadow duration-200"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={20} aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-surface-900 mb-2">{f.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="label-sm text-brand-600 mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
              Simple by design
            </h2>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" aria-hidden="true" />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
              {workflowSteps.map((step, i) => (
                <div key={step.step} className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-surface-200 shadow-card flex flex-col items-center justify-center gap-1 group hover:border-brand-300 hover:shadow-card-hover transition-all">
                      <span className="text-[10px] font-bold text-brand-500">{step.step}</span>
                      <span className="text-sm font-bold text-surface-900">{step.label}</span>
                    </div>
                    {i < workflowSteps.length - 1 && (
                      <ChevronRight
                        className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 text-brand-300"
                        size={16}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="text-xs text-surface-500 max-w-[120px] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXERCISE PREVIEW ── */}
      <section id="exercises" className="py-16 sm:py-24 bg-surface-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="label-sm text-brand-600 mb-3">Exercise Library</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
                Learn every lift
              </h2>
              <p className="mt-3 text-surface-500 max-w-md">
                Detailed instructions, muscle diagrams, tips and common mistakes — so you train with confidence.
              </p>
            </div>
            <Link to="/exercises" className="btn-secondary self-start sm:self-auto flex-shrink-0">
              Browse Library
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {previewExercises.map(ex => (
              <Link
                key={ex.name}
                to="/exercises"
                className="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer group"
                aria-label={`${ex.name} exercise`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${ex.color}`}>
                  <Dumbbell size={18} aria-hidden="true" />
                </div>
                <h3 className="text-xs font-semibold text-surface-900 leading-snug mb-2 group-hover:text-brand-600 transition-colors">
                  {ex.name}
                </h3>
                <p className="text-[10px] text-surface-500">{ex.muscle}</p>
                <p className="text-[10px] text-surface-400">{ex.equipment}</p>
                <span className={`badge border-0 mt-2 text-[10px] ${difficultyBg[ex.difficulty]}`}>
                  {ex.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRESS PREVIEW ── */}
      <section id="progress" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="label-sm text-brand-600 mb-3">Progress Analytics</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
                Watch your strength grow
              </h2>
              <p className="text-surface-500 leading-relaxed mb-6">
                Clean charts show your real progress over time. See how far you've come and where to push next.
              </p>
              <ul className="space-y-3">
                {['Track every lift over weeks and months','Visualise weekly training volume','Monitor consistency with a calendar view','Celebrate every personal record'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-surface-600">
                    <CheckCircle2 size={16} className="text-brand-500 flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/progress" className="btn-primary mt-8 inline-flex" id="landing-view-progress">
                See Progress Dashboard
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {/* Charts */}
            <div className="space-y-4">
              {[
                { name: 'Bench Press', data: benchData, color: '#6366f1', current: '92.5 kg' },
                { name: 'Back Squat',  data: squatData,  color: '#10b981', current: '120 kg' },
                { name: 'Deadlift',    data: dlData,     color: '#f59e0b', current: '140 kg' },
              ].map(lift => (
                <div key={lift.name} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-surface-900">{lift.name}</p>
                    <span className="text-sm font-bold" style={{ color: lift.color }}>{lift.current}</span>
                  </div>
                  <SparkLine data={lift.data} color={lift.color} />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-surface-400">Start: {lift.data[0]} kg</span>
                    <span className="text-xs text-emerald-600 font-medium">
                      +{Math.round((lift.data[lift.data.length-1] - lift.data[0]) / lift.data[0] * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 sm:py-24 bg-brand-500 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Zap size={40} className="mx-auto mb-4 opacity-80" aria-hidden="true" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Your training. Your progress. Your journey.
          </h2>
          <p className="text-brand-200 text-lg mb-8 leading-relaxed">
            Start tracking today and discover what consistent, focused training can do.
          </p>
          <Link
            to="/signup"
            id="landing-final-cta"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-base px-8 py-4 rounded-xl shadow-lg hover:bg-brand-50 transition-colors"
          >
            Start Tracking
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-surface-900 text-surface-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                  <Target size={14} className="text-white" aria-hidden="true" />
                </div>
                <span className="font-bold text-white">GYMTrack</span>
              </div>
              <p className="text-xs">Train. Track. Improve.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link to="/exercises" className="hover:text-white transition-colors">Exercises</Link>
              <Link to="/progress"  className="hover:text-white transition-colors">Progress</Link>
              <Link to="/profile"   className="hover:text-white transition-colors">Profile</Link>
            </div>
          </div>
          <div className="border-t border-surface-800 mt-8 pt-6 text-xs text-center">
            © {new Date().getFullYear()} GYMTrack. Phase 1 — Development Preview.
          </div>
        </div>
      </footer>
    </div>
  )
}
