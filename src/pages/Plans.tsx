import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CalendarDays, 
  Target, 
  Dumbbell, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Trophy, 
  Play, 
  Sparkles, 
  ChevronRight, 
  AlertCircle, 
  PauseCircle, 
  RotateCcw,
  Check,
  Flame,
  ArrowRight,
  Compass,
  History as HistoryIcon
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useWorkouts } from '@/hooks/useWorkouts'
import { ExerciseMedia } from '@/components/exercise/ExerciseComponents'
import { MuscleGroupBadge } from '@/components/shared'
import { PlanExerciseModal } from '@/components/plan/PlanExerciseModal'
import { 
  GOAL_CATEGORIES, 
  DURATION_OPTIONS, 
  generateStructuredPlan, 
  type PlanGenerationParams 
} from '@/lib/planGenerator'
import { 
  saveStructuredPlan, 
  activatePlan, 
  pauseActivePlan, 
  getPlanDayCompletions 
} from '@/lib/workouts'
import { supabase } from '@/lib/supabase'
import { subscribeGymtrackEvent } from '@/lib/events'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import type { WorkoutPlan, Workout, WorkoutExercise, Exercise, StructuredPlanDefinition } from '@/types'

export default function Plans() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { plans, activePlan, workouts, loading, refresh } = useWorkouts()

  // Creation Wizard Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState('muscle_growth')
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [selectedDays, setSelectedDays] = useState(4)
  const [selectedDuration, setSelectedDuration] = useState(12) // 12 weeks (3 months)
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState(60)
  const [selectedLocation, setSelectedLocation] = useState<'gym' | 'home'>('gym')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPreview, setGeneratedPreview] = useState<StructuredPlanDefinition | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Plan Day Completions State
  const [completions, setCompletions] = useState<{ week_number: number; day_number: number; status: string }[]>([])

  // Exercise Logging Modal State
  const [activeLogExercise, setActiveLogExercise] = useState<{
    exercise: Exercise
    workoutId: string
    workoutName: string
    workoutExerciseId?: string
    targetSets: number
    targetReps: string
    restSeconds: number
  } | null>(null)

  // Today's completed exercise IDs (from real database logs today)
  const [todayCompletedExerciseIds, setTodayCompletedExerciseIds] = useState<Set<string>>(new Set())

  // Prefill wizard from profile when modal opens
  useEffect(() => {
    if (profile) {
      if (profile.fitness_goal) {
        const goalStr = profile.fitness_goal.toLowerCase()
        const matched = GOAL_CATEGORIES.find(c => c.id === profile.fitness_goal || c.title.toLowerCase().includes(goalStr))
        if (matched) setSelectedGoal(matched.id)
      }
      if (profile.experience_level) {
        setSelectedLevel(profile.experience_level as 'beginner' | 'intermediate' | 'advanced')
      }
      if (profile.training_frequency) {
        setSelectedDays(Math.min(6, Math.max(2, profile.training_frequency)))
      }
    }
  }, [profile, isCreateOpen])

  // Fetch real plan day completions and today's logged sets
  const fetchPlanTelemetry = useCallback(async () => {
    if (!user || !activePlan) {
      setCompletions([])
      setTodayCompletedExerciseIds(new Set())
      return
    }

    // 1. Fetch completions for active plan
    const compData = await getPlanDayCompletions(activePlan.id, user.id)
    setCompletions(compData)

    // 2. Fetch today's logged exercises for real green-check states
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const { data: todaySets } = await supabase
      .from('workout_session_sets')
      .select('exercise_id')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString())

    if (todaySets) {
      const ids = new Set(todaySets.map(s => s.exercise_id))
      setTodayCompletedExerciseIds(ids)
    }
  }, [user, activePlan])

  useEffect(() => {
    fetchPlanTelemetry()

    const unsub1 = subscribeGymtrackEvent('gymtrack:sets_logged', () => fetchPlanTelemetry())
    const unsub2 = subscribeGymtrackEvent('gymtrack:session_completed', () => fetchPlanTelemetry())
    const unsub3 = subscribeGymtrackEvent('gymtrack:workout_updated', () => {
      refresh()
      fetchPlanTelemetry()
    })

    return () => {
      unsub1()
      unsub2()
      unsub3()
    }
  }, [fetchPlanTelemetry, refresh])

  // Active Plan Workouts & Calculations
  const activePlanWorkouts = useMemo(() => {
    if (!activePlan) return []
    return workouts
      .filter(w => w.plan_id === activePlan.id)
      .sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
  }, [activePlan, workouts])

  // Calculate current week and day (Mon=1, Sun=7)
  const todayDayNumber = useMemo(() => {
    const d = new Date().getDay()
    return d === 0 ? 7 : d // Sunday is 7
  }, [])

  const currentWeek = useMemo(() => {
    if (!activePlan || !activePlan.started_at) return 1
    const start = new Date(activePlan.started_at).getTime()
    const now = Date.now()
    const diffWeeks = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)) + 1
    return Math.min(activePlan.duration_weeks || 12, Math.max(1, diffWeeks))
  }, [activePlan])

  // Today's planned workout
  const todayWorkout = useMemo(() => {
    if (!activePlan || activePlanWorkouts.length === 0) return null
    return activePlanWorkouts.find(w => w.day_number === todayDayNumber) || null
  }, [activePlan, activePlanWorkouts, todayDayNumber])

  // Real plan progress calculation (planned sessions vs completed sessions)
  const planProgressStats = useMemo(() => {
    if (!activePlan) return { totalPlannedSessions: 0, completedSessions: 0, percentage: 0 }
    const totalWeeks = activePlan.duration_weeks || 12
    const daysPerWeek = activePlan.days_per_week || 4
    const totalPlannedSessions = totalWeeks * daysPerWeek

    // Completed sessions derived from verified completion records or actual sessions
    const completedSessions = completions.filter(c => c.status === 'completed').length
    const percentage = totalPlannedSessions > 0
      ? Math.min(100, Math.round((completedSessions / totalPlannedSessions) * 100))
      : 0

    return { totalPlannedSessions, completedSessions, percentage }
  }, [activePlan, completions])

  // Today's workout exercise completion stats
  const todayExerciseStats = useMemo(() => {
    if (!todayWorkout || !todayWorkout.workout_exercises) return { total: 0, completed: 0 }
    const total = todayWorkout.workout_exercises.length
    const completed = todayWorkout.workout_exercises.filter(we => 
      todayCompletedExerciseIds.has(we.exercise_id)
    ).length
    return { total, completed }
  }, [todayWorkout, todayCompletedExerciseIds])

  // Handler: Generate plan in wizard
  const handleGeneratePreview = async () => {
    setIsGenerating(true)
    setActionError(null)
    try {
      const params: PlanGenerationParams = {
        goal: selectedGoal,
        experience_level: selectedLevel,
        training_days_per_week: selectedDays,
        training_location: selectedLocation,
        session_duration: selectedDurationMinutes,
        duration_weeks: selectedDuration
      }
      const planDef = await generateStructuredPlan(params)
      setGeneratedPreview(planDef)
    } catch (err: unknown) {
      setActionError('Could not generate plan preview. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handler: Save and activate plan
  const handleSaveAndStart = async (makeActive = true) => {
    if (!user || !generatedPreview) return
    setIsGenerating(true)
    setActionError(null)
    try {
      const { data: savedPlan, error } = await saveStructuredPlan(user.id, generatedPreview)
      if (error || !savedPlan) {
        throw new Error(error || 'Failed to save plan')
      }

      if (makeActive) {
        await activatePlan(user.id, savedPlan.id)
      }

      setIsCreateOpen(false)
      setGeneratedPreview(null)
      await refresh()
    } catch (err: unknown) {
      setActionError('Failed to save your plan. Please check your connection.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handler: Toggle active status
  const handleToggleActive = async (planId: string, currentActive: boolean) => {
    if (!user) return
    if (currentActive) {
      await pauseActivePlan(user.id, planId)
    } else {
      await activatePlan(user.id, planId)
    }
    await refresh()
  }

  if (loading && plans.length === 0) {
    return (
      <div className="py-24 text-center text-surface-500 animate-pulse space-y-3">
        <CalendarDays className="w-10 h-10 text-brand-500 mx-auto animate-bounce" />
        <p className="font-semibold text-sm">Loading training plans...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-8 pb-24 max-w-5xl mx-auto px-4 sm:px-6">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            Training Plans
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Structured, periodized workout programs designed for progressive overload.
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedPreview(null)
            setIsCreateOpen(true)
          }}
          id="plans-create-plan-btn"
          className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* ── SECTION A: ACTIVE PLAN OVERVIEW ── */}
      {activePlan ? (
        <section aria-label="Active Training Plan" className="space-y-6">
          <div className="card p-5 sm:p-6 bg-gradient-to-br from-brand-900 via-surface-900 to-surface-950 text-white rounded-2xl shadow-lg border border-surface-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/20 text-brand-300 px-2.5 py-1 rounded-full border border-brand-500/30">
                    <CheckCircle2 size={12} className="text-brand-400" /> Active Program
                  </span>
                  {activePlan.difficulty && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-surface-300 bg-surface-800 px-2.5 py-1 rounded-full capitalize">
                      {activePlan.difficulty}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {activePlan.name}
                </h2>
                <p className="text-xs sm:text-sm text-surface-300 mt-1 max-w-xl">
                  {activePlan.description || `${activePlan.goal || 'Fitness'} program with structured weekly frequency.`}
                </p>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 self-start">
                <button
                  type="button"
                  onClick={() => handleToggleActive(activePlan.id, true)}
                  className="px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold flex items-center gap-1.5 border border-surface-700 transition-colors"
                  title="Pause this training plan"
                >
                  <PauseCircle size={14} />
                  <span>Pause Plan</span>
                </button>
              </div>
            </div>

            {/* Plan Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-surface-800/80">
              <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/50">
                <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider">Goal</span>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">{activePlan.goal || 'Muscle Growth'}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/50">
                <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider">Duration</span>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5">{activePlan.duration_weeks || 12} Weeks</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/50">
                <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider">Frequency</span>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5">{activePlan.days_per_week || 4} Days / Week</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/50">
                <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider">Session</span>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5">{activePlan.session_duration || 60} mins</p>
              </div>
            </div>

            {/* Plan Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-300 font-semibold">
                  Week {currentWeek} of {activePlan.duration_weeks || 12}
                </span>
                <span className="text-brand-300 font-bold">
                  {planProgressStats.completedSessions} / {planProgressStats.totalPlannedSessions} sessions completed ({planProgressStats.percentage}%)
                </span>
              </div>
              <div className="w-full bg-surface-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-brand-500 to-brand-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, planProgressStats.percentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── SECTION B: TODAY'S WORKOUT IN ACTIVE PLAN ── */}
          <div className="card p-5 sm:p-6 bg-white rounded-2xl shadow-xs border border-surface-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Week {currentWeek} · Day {todayDayNumber}
                  </span>
                  <span className="text-surface-300">•</span>
                  <span className="text-xs font-semibold text-surface-500">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long' })}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-surface-900 mt-1">
                  Today&rsquo;s Workout: {todayWorkout ? todayWorkout.name : 'Scheduled Recovery'}
                </h3>
              </div>

              {todayWorkout && todayWorkout.day_type === 'workout' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-surface-700 bg-surface-100 px-3 py-1.5 rounded-full border border-surface-200">
                    {todayExerciseStats.completed} / {todayExerciseStats.total} Exercises Completed
                  </span>
                </div>
              )}
            </div>

            {/* Workout Exercises or Recovery View */}
            {todayWorkout && todayWorkout.day_type === 'workout' && todayWorkout.workout_exercises && todayWorkout.workout_exercises.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs text-surface-500">
                  Tap any exercise to view demonstration video, cues, and log your completed sets.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {todayWorkout.workout_exercises.map((we, idx) => {
                    const ex = we.exercise || DEFAULT_EXERCISES.find(e => e.id === we.exercise_id) || DEFAULT_EXERCISES[0]
                    const isCompleted = todayCompletedExerciseIds.has(ex.id)

                    return (
                      <div
                        key={we.id || idx}
                        onClick={() => setActiveLogExercise({
                          exercise: ex,
                          workoutId: todayWorkout.id,
                          workoutName: todayWorkout.name,
                          workoutExerciseId: we.id,
                          targetSets: we.sets || 3,
                          targetReps: we.reps || '8-12',
                          restSeconds: we.rest_seconds || 90
                        })}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                          isCompleted
                            ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                            : 'bg-surface-50/60 border-surface-200 hover:border-brand-300 hover:bg-surface-50 shadow-2xs'
                        }`}
                      >
                        {/* Video Thumbnail Box */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0 relative shadow-2xs">
                          <ExerciseMedia exercise={ex} variant="card" />
                        </div>

                        {/* Title & Sets */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-surface-400">#{idx + 1}</span>
                            <h4 className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors truncate">
                              {ex.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            {ex.muscle_group && (
                              <MuscleGroupBadge group={ex.muscle_group} />
                            )}
                            <span className="text-[11px] font-semibold text-surface-500">
                              {we.sets} × {we.reps}
                            </span>
                          </div>
                        </div>

                        {/* Completion Status */}
                        <div>
                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={14} className="text-emerald-600" /> Done
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="text-xs font-bold text-brand-600 group-hover:bg-brand-50 px-2.5 py-1 rounded-lg transition-colors border border-brand-200"
                            >
                              Log
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : todayWorkout && (todayWorkout.day_type === 'recovery' || todayWorkout.day_type === 'rest') ? (
              <div className="p-6 rounded-xl bg-surface-50 border border-surface-200 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-brand-500 mx-auto" />
                <h4 className="text-base font-bold text-surface-900">
                  {todayWorkout.name || 'Recovery & Rest Day'}
                </h4>
                <p className="text-xs sm:text-sm text-surface-600 max-w-md mx-auto">
                  No heavy lifting scheduled today. Focus on restful sleep, adequate protein intake, and light mobility or walking.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-surface-50 border border-surface-200 text-center space-y-2">
                <Dumbbell className="w-8 h-8 text-surface-400 mx-auto" />
                <h4 className="text-base font-bold text-surface-900">Rest Day</h4>
                <p className="text-xs sm:text-sm text-surface-500">
                  No workout scheduled for today in your weekly cycle. Enjoy your recovery.
                </p>
              </div>
            )}
          </div>

          {/* ── SECTION C: WEEKLY SCHEDULE STRIP ── */}
          <div className="card p-5 bg-white rounded-2xl shadow-xs border border-surface-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
              Weekly Routine Schedule
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
                const dayNum = idx + 1
                const isToday = dayNum === todayDayNumber
                const wo = activePlanWorkouts.find(w => w.day_number === dayNum)
                const isRest = !wo || wo.day_type === 'rest'
                const isRecovery = wo && wo.day_type === 'recovery'

                return (
                  <div
                    key={dayName}
                    className={`p-3 rounded-xl border text-center flex flex-col justify-between min-h-[90px] ${
                      isToday
                        ? 'bg-brand-50/70 border-brand-400 ring-2 ring-brand-500/20 shadow-xs'
                        : 'bg-surface-50/60 border-surface-200'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isToday ? 'text-brand-700' : 'text-surface-400'}`}>
                        {dayName} {isToday && '(Today)'}
                      </span>
                      <p className="text-xs font-bold text-surface-800 mt-1 line-clamp-2">
                        {wo ? wo.name : 'Rest'}
                      </p>
                    </div>

                    <div className="mt-2">
                      {isRest ? (
                        <span className="text-[10px] font-semibold text-surface-400">Rest</span>
                      ) : isRecovery ? (
                        <span className="text-[10px] font-semibold text-amber-600">Recovery</span>
                      ) : (
                        <span className="text-[10px] font-bold text-brand-600">
                          {wo?.workout_exercises?.length || 4} exercises
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : (
        /* ── EMPTY STATE: NO ACTIVE PLAN ── */
        <section aria-label="No Active Plan">
          <div className="card p-8 sm:p-12 text-center bg-gradient-to-b from-white to-surface-50 border border-surface-200 rounded-3xl shadow-xs space-y-5 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto text-brand-600 shadow-2xs">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
                Build Your Training Plan
              </h2>
              <p className="text-xs sm:text-sm text-surface-600 max-w-md mx-auto">
                Choose a goal and we&rsquo;ll help you create a structured, day-by-day routine tailored to your schedule and experience.
              </p>
            </div>

            <button
              onClick={() => {
                setGeneratedPreview(null)
                setIsCreateOpen(true)
              }}
              className="btn-primary py-3 px-6 text-sm font-bold shadow-md inline-flex items-center gap-2"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Create Plan</span>
            </button>
          </div>
        </section>
      )}

      {/* ── SECTION D: GOAL CATEGORIES & DISCOVERY ── */}
      <section aria-label="Explore Goal Programs" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-surface-900">
              Explore Goal Programs
            </h3>
            <p className="text-xs text-surface-500">
              Science-backed workout structures customizable to your equipment and schedule.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GOAL_CATEGORIES.map(category => (
            <div
              key={category.id}
              onClick={() => {
                setSelectedGoal(category.id)
                setSelectedDays(category.defaultDays)
                setSelectedLevel(category.recommendedLevel)
                setGeneratedPreview(null)
                setIsCreateOpen(true)
              }}
              className="card p-4 bg-white rounded-2xl border border-surface-200 hover:border-brand-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-surface-100 text-surface-600 px-2.5 py-0.5 rounded-full">
                    {category.badge}
                  </span>
                  <span className="text-xs text-surface-400 font-medium">
                    {category.defaultDays}d / week
                  </span>
                </div>

                <h4 className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors">
                  {category.title}
                </h4>
                <p className="text-xs text-surface-500 mt-1 line-clamp-2">
                  {category.description}
                </p>
              </div>

              <div className="pt-2 border-t border-surface-100 flex items-center justify-between text-xs font-bold text-brand-600">
                <span>Customize &amp; Build</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION E: PREVIOUS / INACTIVE PLANS ── */}
      {plans.filter(p => !p.is_active).length > 0 && (
        <section aria-label="Previous Training Plans" className="space-y-3 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">
            Previous &amp; Inactive Plans ({plans.filter(p => !p.is_active).length})
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {plans.filter(p => !p.is_active).map(plan => (
              <div
                key={plan.id}
                className="p-4 rounded-xl bg-white border border-surface-200 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-surface-900">{plan.name}</h4>
                  <p className="text-xs text-surface-500">
                    {plan.duration_weeks || 12} Weeks · {plan.days_per_week || 4} days/week · {plan.difficulty || 'Intermediate'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(plan.id, false)}
                  className="btn-secondary text-xs py-1.5 px-3 font-semibold"
                >
                  Activate
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PLAN CREATION & CUSTOMIZATION MODAL ── */}
      {isCreateOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-surface-900/70 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-surface-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/70">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-surface-900">
                  {generatedPreview ? 'Review Your Training Program' : 'Customize Your Training Plan'}
                </h3>
                <p className="text-xs text-surface-500">
                  {generatedPreview ? 'Review the structure and tap Start Plan' : 'Select your goals and preferences'}
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-200/60"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {actionError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {!generatedPreview ? (
                /* Step 1: Inputs */
                <div className="space-y-4">
                  {/* Goal Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                      Primary Goal
                    </label>
                    <select
                      value={selectedGoal}
                      onChange={e => setSelectedGoal(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-900"
                    >
                      {GOAL_CATEGORIES.map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                      Program Duration
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {DURATION_OPTIONS.map(opt => (
                        <button
                          key={opt.weeks}
                          type="button"
                          onClick={() => setSelectedDuration(opt.weeks)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            selectedDuration === opt.weeks
                              ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20'
                              : 'bg-surface-50/60 border-surface-200 text-surface-700 hover:bg-surface-100'
                          }`}
                        >
                          <span className="text-xs font-bold block">{opt.label}</span>
                          <span className="text-[10px] text-surface-500 block truncate">{opt.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frequency & Experience Level */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                        Frequency (Days / Week)
                      </label>
                      <select
                        value={selectedDays}
                        onChange={e => setSelectedDays(parseInt(e.target.value))}
                        className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-900"
                      >
                        <option value={2}>2 Days (Full Body Split)</option>
                        <option value={3}>3 Days (Push / Pull / Legs)</option>
                        <option value={4}>4 Days (Upper / Lower)</option>
                        <option value={5}>5 Days (Push/Pull/Legs/Upper/Lower)</option>
                        <option value={6}>6 Days (High Frequency)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                        Experience Level
                      </label>
                      <select
                        value={selectedLevel}
                        onChange={e => setSelectedLevel(e.target.value as any)}
                        className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-900"
                      >
                        <option value="beginner">Beginner (0-1 yr)</option>
                        <option value="intermediate">Intermediate (1-3 yrs)</option>
                        <option value="advanced">Advanced (3+ yrs)</option>
                      </select>
                    </div>
                  </div>

                  {/* Location & Session Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                        Location
                      </label>
                      <select
                        value={selectedLocation}
                        onChange={e => setSelectedLocation(e.target.value as any)}
                        className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-900"
                      >
                        <option value="gym">Full Gym</option>
                        <option value="home">Home (Dumbbells/Bodyweight)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                        Session Duration
                      </label>
                      <select
                        value={selectedDurationMinutes}
                        onChange={e => setSelectedDurationMinutes(parseInt(e.target.value))}
                        className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-surface-200 bg-surface-50 text-surface-900"
                      >
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes (Standard)</option>
                        <option value={75}>75 minutes</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Generated Preview */
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200 space-y-2">
                    <h4 className="text-base font-extrabold text-brand-950">
                      {generatedPreview.plan_name}
                    </h4>
                    <p className="text-xs text-brand-800">
                      {generatedPreview.duration_weeks} Weeks · {generatedPreview.training_days_per_week} days/week · {generatedPreview.difficulty} · ~{generatedPreview.session_duration}m sessions
                    </p>
                  </div>

                  {/* Phases Preview */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-surface-500">
                      Periodized Program Phases ({generatedPreview.phases.length})
                    </h5>
                    <div className="space-y-1.5">
                      {generatedPreview.phases.map(ph => (
                        <div key={ph.phase_number} className="p-3 rounded-lg border border-surface-200 bg-surface-50 text-xs">
                          <div className="flex items-center justify-between font-bold text-surface-900">
                            <span>{ph.name}</span>
                            <span className="text-surface-500">Weeks {ph.start_week}–{ph.end_week}</span>
                          </div>
                          <p className="text-surface-600 mt-0.5">{ph.focus}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Routine Preview */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-surface-500">
                      Weekly Schedule Blueprint
                    </h5>
                    <div className="space-y-1.5">
                      {generatedPreview.weekly_schedule.map(d => (
                        <div key={d.day_number} className="p-2.5 rounded-lg border border-surface-200 bg-white flex items-center justify-between text-xs">
                          <span className="font-bold text-surface-800 w-20">{d.day_name}</span>
                          <span className="text-surface-600 flex-1 truncate">{d.focus}</span>
                          <span className="font-semibold text-surface-400 capitalize">{d.day_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-surface-100 bg-white flex items-center justify-between gap-3">
              {generatedPreview ? (
                <>
                  <button
                    type="button"
                    onClick={() => setGeneratedPreview(null)}
                    className="btn-secondary text-xs sm:text-sm py-2 px-4"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAndStart(true)}
                    disabled={isGenerating}
                    className="btn-primary text-xs sm:text-sm py-2 px-5 font-bold shadow-sm flex items-center gap-2"
                  >
                    {isGenerating ? <span>Saving...</span> : <span>Start This Plan</span>}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="btn-secondary text-xs sm:text-sm py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGeneratePreview}
                    disabled={isGenerating}
                    className="btn-primary text-xs sm:text-sm py-2 px-5 font-bold shadow-sm flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <span>Structuring Plan...</span>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Generate My Plan</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── INLINE EXERCISE LOGGING MODAL ── */}
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
          onCompleted={(exerciseId) => {
            setTodayCompletedExerciseIds(prev => new Set(prev).add(exerciseId))
          }}
        />
      )}
    </div>
  )
}

function X({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
