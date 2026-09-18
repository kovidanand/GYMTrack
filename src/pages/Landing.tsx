import { Link } from 'react-router-dom'
import {
  BarChart2, BookOpen, Timer, TrendingUp,
  ChevronRight, ArrowRight,
  Dumbbell, Target, Zap, CheckCircle2,
  CalendarDays, Bot, WifiOff, Star
} from 'lucide-react'
import { GYMTrackLogo } from '@/components/shared'
import { SparkLine } from '@/components/progress/ProgressComponents'
import { useState } from 'react'

const benchData = [60, 65, 67.5, 70, 72.5, 75, 80, 82.5, 87.5, 92.5]
const squatData  = [80, 85, 90,  95,  100, 105, 110, 115, 120]
const dlData     = [100, 110, 115, 120, 125, 130, 132.5, 135, 140]

const features = [
  {
    icon: BarChart2,
    title: 'Workout Tracking',
    description: 'Log exercises, sets, reps, weight and training duration. Instant set tracking with zero friction.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: BookOpen,
    title: 'Exercise Library',
    description: 'Master exercises with high-definition video demonstrations, target muscles, and form cues.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: CalendarDays,
    title: 'Personalized Plans',
    description: 'Goal-driven programs for muscle growth, strength, and conditioning with clear daily structure.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Understand strength, consistency, and volume trends over time based on real logged lifts.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Bot,
    title: 'AI Coach',
    description: 'Grounded fitness intelligence that analyzes your training history and guides your next session.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: WifiOff,
    title: 'Offline Workout Logging',
    description: 'Train anywhere with full local offline recording that automatically syncs when you reconnect.',
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
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0D1017]/95 backdrop-blur-md border-b border-[#202733]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <GYMTrackLogo size="md" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Landing navigation">
            <a href="#features"  className="text-sm text-surface-400 hover:text-white transition-colors">Features</a>
            <a href="#exercises" className="text-sm text-surface-400 hover:text-white transition-colors">Exercises</a>
            <a href="#progress"  className="text-sm text-surface-400 hover:text-white transition-colors">Progress</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"   className="text-sm text-surface-300 hover:text-white px-4 py-2 font-semibold transition-colors">Log In</Link>
            <Link to="/signup" className="btn-primary text-sm px-5 py-2.5 font-bold shadow-sm" id="landing-get-started">Get Started</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-surface-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 bg-surface-300 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-surface-300 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-surface-300 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-[#202733] space-y-3 bg-[#0D1017] animate-slide-up">
            <a href="#features"  className="block text-sm text-surface-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#exercises" className="block text-sm text-surface-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Exercises</a>
            <a href="#progress"  className="block text-sm text-surface-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Progress</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login"  className="btn-secondary text-sm flex-1 justify-center">Log In</Link>
              <Link to="/signup" className="btn-primary text-sm flex-1 justify-center">Get Started</Link>
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
    <div className="relative bg-[#151A23] rounded-2xl border border-[#202733] shadow-2xl overflow-hidden max-w-lg w-full">
      {/* Mini sidebar */}
      <div className="flex h-full">
        <div className="hidden sm:flex flex-col w-44 bg-[#0D1017] border-r border-[#202733] p-4 gap-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <Dumbbell size={12} className="text-white" />
            </div>
            <span className="text-xs font-bold text-white">GYMTrack</span>
          </div>
          {['Dashboard','Workouts','Exercises','Progress','Profile'].map((item, i) => (
            <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium ${i === 0 ? 'bg-brand-950/80 text-brand-400 border border-brand-800/40' : 'text-surface-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-brand-400' : 'bg-surface-600'}`} />
              {item}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 p-4 space-y-3 overflow-hidden bg-[#151A23]">
          <div>
            <p className="text-xs text-surface-400">ATHLETE COMMAND</p>
            <p className="text-sm font-bold text-white">Ready for today's training</p>
          </div>

          {/* Today's workout */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-3 text-white shadow-xs">
            <p className="text-xs opacity-80 mb-0.5 uppercase tracking-wider font-semibold">Today's Workout</p>
            <p className="text-sm font-bold">Upper Body Strength</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs bg-black/30 rounded-full px-2 py-0.5">5 exercises</span>
              <span className="text-xs bg-black/30 rounded-full px-2 py-0.5">~52 min</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Exercises', value: '2 / 5' },
              { label: 'Sets', value: '7 / 18' },
              { label: 'Volume', value: '1,240 kg' },
              { label: 'Duration', value: '42 min' },
            ].map(s => (
              <div key={s.label} className="bg-[#11151D] border border-[#202733] rounded-lg p-2">
                <p className="text-[10px] text-surface-400">{s.label}</p>
                <p className="text-xs font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Spark chart */}
          <div className="bg-[#11151D] border border-[#202733] rounded-lg p-2">
            <p className="text-[10px] text-surface-400 mb-1">Bench Press · 8 weeks</p>
            <SparkLine data={benchData.slice(-8)} color="#8b5cf6" />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-surface-500">60 kg</span>
              <span className="text-[10px] font-bold text-brand-400">92.5 kg ↑</span>
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
    <div className="min-h-screen bg-[#080A0F] text-white">
      <LandingNav />

      {/* ── HERO ── */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-brand-950/60 text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-800/40 mb-6">
              <Star size={12} aria-hidden="true" />
              Train. Track. Improve.
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-white leading-[1.12] tracking-tight mb-6">
              Track every workout.<br />
              <span className="text-brand-400">Understand your progress.</span><br />
              Train with purpose.
            </h1>

            <p className="text-lg text-surface-300 leading-relaxed mb-8 max-w-xl">
              GYMTrack helps athletes plan structured routines, log every set with precision, and analyze real performance metrics — online or offline.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/signup"
                id="hero-get-started"
                className="btn-primary text-base px-7 py-3.5 shadow-sm font-bold"
              >
                Get Started
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                id="hero-login"
                className="btn-secondary text-base px-7 py-3.5 font-bold"
              >
                Log In
              </Link>
            </div>

            {/* Product capabilities guarantee */}
            <div className="mt-8 pt-6 border-t border-[#202733] space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-surface-400">Core Product Principles</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] text-surface-300 text-xs font-medium border border-[#202733]">
                  <CheckCircle2 size={13} className="text-emerald-400" /> Track every set
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] text-surface-300 text-xs font-medium border border-[#202733]">
                  <CheckCircle2 size={13} className="text-emerald-400" /> Real volume analytics
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] text-surface-300 text-xs font-medium border border-[#202733]">
                  <CheckCircle2 size={13} className="text-emerald-400" /> Voice & manual logging
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] text-surface-300 text-xs font-medium border border-[#202733]">
                  <CheckCircle2 size={13} className="text-emerald-400" /> Offline-friendly
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] text-surface-300 text-xs font-medium border border-[#202733]">
                  <CheckCircle2 size={13} className="text-emerald-400" /> Zero fabricated data
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
      <section id="features" className="py-16 sm:py-24 bg-[#0D1017] border-y border-[#202733] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2">Athlete Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for how you train
            </h2>
            <p className="mt-3 text-surface-400 max-w-xl mx-auto text-sm">
              A solid, high-performance platform for athletes and gym users. No clutter, no distraction — just the tools that drive results.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="p-6 bg-[#151A23] border border-[#202733] rounded-2xl hover:border-brand-500 transition-colors shadow-xs"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-950/60 border border-brand-800/40 text-brand-400 flex items-center justify-center mb-4">
                  <f.icon size={20} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-white mb-2 text-base">{f.title}</h3>
                <p className="text-xs text-surface-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#080A0F]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2">Training Workflow</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Simple by design
            </h2>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {workflowSteps.map((step, i) => (
                <div key={step.step} className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-[#151A23] border border-[#202733] shadow-xs flex flex-col items-center justify-center gap-1 group hover:border-brand-500 transition-all">
                      <span className="text-[10px] font-bold text-brand-400">{step.step}</span>
                      <span className="text-sm font-bold text-white">{step.label}</span>
                    </div>
                    {i < workflowSteps.length - 1 && (
                      <ChevronRight
                        className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#202733]"
                        size={16}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="text-xs text-surface-400 max-w-[120px] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXERCISE PREVIEW ── */}
      <section id="exercises" className="py-16 sm:py-24 bg-[#0D1017] border-y border-[#202733] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2">Exercise Library</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Learn every lift
              </h2>
              <p className="mt-2 text-surface-400 max-w-md text-sm">
                Detailed instructions, continuous video demonstrations, and cues — train with maximum confidence.
              </p>
            </div>
            <Link to="/exercises" className="btn-secondary self-start sm:self-auto flex-shrink-0 font-bold">
              Browse Library
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {previewExercises.map(ex => (
              <Link
                key={ex.name}
                to="/exercises"
                className="p-4 bg-[#151A23] border border-[#202733] rounded-2xl hover:border-brand-500 transition-all cursor-pointer group shadow-xs"
                aria-label={`${ex.name} exercise`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#11151D] border border-[#202733] flex items-center justify-center mb-3 text-brand-400 group-hover:text-white">
                  <Dumbbell size={18} aria-hidden="true" />
                </div>
                <h3 className="text-xs font-bold text-white leading-snug mb-1 group-hover:text-brand-400 transition-colors">
                  {ex.name}
                </h3>
                <p className="text-[10px] text-surface-400 uppercase font-semibold">{ex.muscle}</p>
                <p className="text-[10px] text-surface-500">{ex.equipment}</p>
                <span className="badge bg-[#11151D] border border-[#202733] mt-2 text-[10px] text-surface-300">
                  {ex.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRESS PREVIEW ── */}
      <section id="progress" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#080A0F]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2">Progress Analytics</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Watch your strength grow
              </h2>
              <p className="text-surface-400 leading-relaxed mb-6 text-sm">
                Athletic performance charts show your real progress over time. See how far you've come and plan your progressive overload.
              </p>
              <ul className="space-y-3">
                {['Track every lift over weeks and months','Visualise weekly training volume','Monitor consistency with an activity strip','Celebrate authentic personal records'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-surface-300">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/progress" className="btn-primary mt-8 inline-flex font-bold" id="landing-view-progress">
                See Progress Dashboard
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {/* Charts */}
            <div className="space-y-3">
              {[
                { name: 'Bench Press', data: benchData, color: '#8b5cf6', current: '92.5 kg' },
                { name: 'Back Squat',  data: squatData,  color: '#10b981', current: '120 kg' },
                { name: 'Deadlift',    data: dlData,     color: '#f59e0b', current: '140 kg' },
              ].map(lift => (
                <div key={lift.name} className="p-4 bg-[#151A23] border border-[#202733] rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-white">{lift.name}</p>
                    <span className="text-sm font-bold" style={{ color: lift.color }}>{lift.current}</span>
                  </div>
                  <SparkLine data={lift.data} color={lift.color} />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-surface-500">Start: {lift.data[0]} kg</span>
                    <span className="text-xs text-emerald-400 font-bold">
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
      <section className="py-16 sm:py-24 bg-gradient-to-r from-brand-950/60 via-[#151A23] to-brand-950/60 border-y border-brand-800/40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Zap size={40} className="mx-auto mb-4 text-brand-400 opacity-90" aria-hidden="true" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white">
            Your training. Your progress. Your journey.
          </h2>
          <p className="text-surface-300 text-base mb-8 leading-relaxed">
            Start tracking today and discover what consistent, performance-focused training can do.
          </p>
          <Link
            to="/signup"
            id="landing-final-cta"
            className="inline-flex items-center gap-2 btn-primary font-bold text-base px-8 py-4 rounded-xl shadow-lg"
          >
            Get Started
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0D1017] border-t border-[#202733] text-surface-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                  <Target size={14} className="text-white" aria-hidden="true" />
                </div>
                <span className="font-bold text-white">GYMTrack</span>
              </div>
              <p className="text-xs text-surface-500">Train. Track. Improve.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link to="/dashboard" className="text-surface-400 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/exercises" className="text-surface-400 hover:text-white transition-colors">Exercises</Link>
              <Link to="/progress"  className="text-surface-400 hover:text-white transition-colors">Progress</Link>
              <Link to="/profile"   className="text-surface-400 hover:text-white transition-colors">Profile</Link>
            </div>
          </div>
          <div className="border-t border-[#202733] mt-8 pt-6 text-xs text-center text-surface-500">
            © {new Date().getFullYear()} GYMTrack. Train. Track. Improve. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
