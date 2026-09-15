import { 
  get_user_profile, 
  get_today_workout, 
  get_recent_workouts, 
  get_workout_history, 
  get_personal_record, 
  get_muscle_group_volume,
  get_training_frequency,
  get_progress_comparison
} from './coachDataService'
import { calculate1RM } from './exerciseIntelligence'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import { supabase } from '@/lib/supabase'
import { getActiveWorkoutPlan } from './workouts'

export interface StructuredCoachContext {
  active_plan?: {
    has_active_plan: boolean
    plan_name?: string
    goal?: string
    duration_weeks?: number
    current_week?: number
    today_day_number?: number
    today_workout_name?: string
    today_day_type?: 'workout' | 'recovery' | 'rest'
    today_planned_exercises?: string[]
    today_completed_exercises?: string[]
    completed_count?: number
    total_count?: number
    next_uncompleted_exercise?: string | null
  } | null
  user_profile: {
    first_name?: string
    last_name?: string
    height?: number | null
    weight?: number | null
    age?: number | null
  }
  fitness_goal?: string | null
  experience_level?: string | null
  training_frequency?: number | null
  preferred_equipment?: string[]
  training_location?: string
  today: string
  today_workouts: {
    exercises_count: number
    sets_count: number
    volume_kg: number
    duration_minutes: number
    exercises_names: string[]
  }
  recent_workouts: Array<{
    name: string
    date: string
    duration_minutes: number
    total_volume: number
    exercises_count: number
    exercises: string[]
  }>
  last_7_days: {
    workouts_count: number
    volume_kg: number
  }
  last_14_days: {
    workouts_count: number
    volume_kg: number
  }
  last_30_days: {
    workouts_count: number
    volume_kg: number
  }
  exercise_history: Array<{
    exercise_name: string
    latest_weight: number
    latest_reps: number
    total_sessions: number
    best_1rm: number
    current_1rm: number
    best_weight?: number
  }>
  personal_records: Array<{
    exercise: string
    value: number
    unit: string
    achieved_at: string
  }>
  estimated_1rm: Record<string, number>
  muscle_group_volume: Record<string, number>
  frequency_by_muscle: Record<string, number>
  recent_volume: number
  previous_period_volume: number
  recovery_context: {
    last_session_hours_ago: number | null
    last_session_muscle_groups: string[]
    ready_for_training: boolean
    recommended_focus: string
  }
}

/**
 * Builds a compact, pre-aggregated, token-efficient structured context object
 * for the AI Coach using authentic GYMTrack database telemetry.
 */
export async function buildCoachContext(profile: any, userId: string): Promise<StructuredCoachContext> {
  const todayStr = new Date().toISOString().split('T')[0]

  try {
    const [
      userProf,
      todayWk,
      recentWks,
      historySessions,
      prsRaw,
      muscleVol,
      frequencyData,
      progressComp,
      activePlanRes
    ] = await Promise.all([
      profile ? Promise.resolve(profile) : get_user_profile(userId),
      get_today_workout(userId),
      get_recent_workouts(userId, 5),
      get_workout_history(userId),
      get_personal_record(userId),
      get_muscle_group_volume(userId, 14),
      get_training_frequency(userId),
      get_progress_comparison(userId),
      supabase
        .from('workout_plans')
        .select(`
          id,
          name,
          goal,
          duration_weeks,
          started_at,
          workouts (
            id,
            name,
            day_of_week,
            day_type,
            workout_exercises (
              id,
              order_in_workout,
              exercise:exercises (id, name, slug, target_muscle)
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    ])

    let activePlanData = activePlanRes?.data
    if (!activePlanData) {
      activePlanData = (await getActiveWorkoutPlan(userId)) as any
    }

    // Pre-aggregate exercise-specific performance & 1RMs
    const exerciseHistoryMap = new Map<string, {
      exercise_name: string
      latest_weight: number
      latest_reps: number
      total_sessions: number
      best_1rm: number
      current_1rm: number
      best_weight: number
    }>()

    const estimated1rmMap: Record<string, number> = {}
    const frequencyByMuscle: Record<string, number> = {}

    // Process from oldest to newest to trace latest vs best
    const sessionsAsc = [...historySessions].reverse()
    for (const session of sessionsAsc) {
      const sets = session.workout_session_sets || []
      const sessionMuscles = new Set<string>()

      for (const set of sets) {
        if (!set.completed) continue
        const name = (set.exercise_name || 'Exercise').trim()
        const w = Number(set.weight) || 0
        const r = Number(set.reps) || 0
        const e1rm = calculate1RM(w, r) || 0

        const exDef = DEFAULT_EXERCISES.find(e => e.name.toLowerCase() === name.toLowerCase())
        if (exDef) {
          sessionMuscles.add(exDef.muscle_group)
        }

        const existing = exerciseHistoryMap.get(name) || {
          exercise_name: name,
          latest_weight: w,
          latest_reps: r,
          total_sessions: 0,
          best_1rm: 0,
          current_1rm: 0,
          best_weight: 0
        }

        existing.latest_weight = w
        existing.latest_reps = r
        existing.current_1rm = e1rm
        existing.best_1rm = Math.max(existing.best_1rm, e1rm)
        existing.best_weight = Math.max(existing.best_weight, w)
        exerciseHistoryMap.set(name, existing)
        estimated1rmMap[name] = existing.current_1rm
      }

      // Count session occurrence
      const distinctNames = new Set(sets.map((s: any) => (s.exercise_name || '').trim()).filter(Boolean))
      distinctNames.forEach(name => {
        const cur = exerciseHistoryMap.get(name as string)
        if (cur) cur.total_sessions++
      })

      sessionMuscles.forEach(m => {
        frequencyByMuscle[m] = (frequencyByMuscle[m] || 0) + 1
      })
    }

    const prsList = (Array.isArray(prsRaw) ? prsRaw : []).map(pr => ({
      exercise: pr.exerciseName,
      value: pr.value,
      unit: pr.unit,
      achieved_at: pr.achievedAt
    }))

    // Calculate volume in 7, 14, 30 days
    const now = Date.now()
    let vol7 = 0
    let vol14 = 0
    let vol30 = 0

    for (const s of historySessions) {
      const t = new Date(s.started_at).getTime()
      const vol = Number(s.total_volume) || 0
      if (now - t <= 7 * 24 * 60 * 60 * 1000) vol7 += vol
      if (now - t <= 14 * 24 * 60 * 60 * 1000) vol14 += vol
      if (now - t <= 30 * 24 * 60 * 60 * 1000) vol30 += vol
    }

    // Recovery context
    let lastSessionHoursAgo: number | null = null
    let lastSessionMuscles: string[] = []
    let recommendedFocus = 'Upper Body Foundation'

    if (historySessions.length > 0) {
      const lastSession = historySessions[0]
      lastSessionHoursAgo = Math.max(0, Math.round((now - new Date(lastSession.started_at).getTime()) / (1000 * 60 * 60)))
      const lastSets = lastSession.workout_session_sets || []
      const muscles = new Set<string>()
      for (const st of lastSets) {
        const found = DEFAULT_EXERCISES.find(e => e.name.toLowerCase() === (st.exercise_name || '').toLowerCase())
        if (found) muscles.add(found.muscle_group)
      }
      lastSessionMuscles = Array.from(muscles)

      // Intelligent muscle rotation
      if (lastSessionMuscles.includes('chest') || lastSessionMuscles.includes('shoulders') || lastSessionMuscles.includes('triceps')) {
        recommendedFocus = 'Pull / Back & Biceps'
      } else if (lastSessionMuscles.includes('back') || lastSessionMuscles.includes('biceps')) {
        recommendedFocus = 'Legs & Core'
      } else if (lastSessionMuscles.includes('quads') || lastSessionMuscles.includes('legs') || lastSessionMuscles.includes('hamstrings')) {
        recommendedFocus = 'Push / Chest, Shoulders & Triceps'
      }
    }

    // Active Training Plan telemetry
    let activePlanContext: StructuredCoachContext['active_plan'] = null
    if (activePlanData) {
      const currentDayOfWeek = (new Date().getDay() + 6) % 7 + 1
      let currentWeek = 1
      if (activePlanData.started_at) {
        const diffDays = Math.floor((Date.now() - new Date(activePlanData.started_at).getTime()) / (1000 * 60 * 60 * 24))
        currentWeek = Math.min(activePlanData.duration_weeks || 12, Math.max(1, Math.floor(diffDays / 7) + 1))
      }

      const workouts = (activePlanData.workouts || []) as any[]
      const todayWkPlan = workouts.find((w: any) => w.day_number === currentDayOfWeek || w.day_of_week === currentDayOfWeek)

      const plannedExercises: string[] = (todayWkPlan?.workout_exercises || [])
        .sort((a: any, b: any) => (a.order_in_workout ?? 0) - (b.order_in_workout ?? 0))
        .map((we: any) => we.exercise?.name || 'Exercise')
        .filter(Boolean)

      const completedExercises = plannedExercises.filter(name =>
        todayWk.exercises_names.some((en: string) => en.toLowerCase() === name.toLowerCase())
      )

      const nextEx = plannedExercises.find(name =>
        !completedExercises.some(c => c.toLowerCase() === name.toLowerCase())
      ) || null

      activePlanContext = {
        has_active_plan: true,
        plan_name: activePlanData.name,
        goal: activePlanData.goal,
        duration_weeks: activePlanData.duration_weeks || 12,
        current_week: currentWeek,
        today_day_number: currentDayOfWeek,
        today_workout_name: todayWkPlan ? todayWkPlan.name : 'Rest Day',
        today_day_type: todayWkPlan?.day_type || (plannedExercises.length > 0 ? 'workout' : 'rest'),
        today_planned_exercises: plannedExercises,
        today_completed_exercises: completedExercises,
        completed_count: completedExercises.length,
        total_count: plannedExercises.length,
        next_uncompleted_exercise: nextEx
      }
    }

    return {
      active_plan: activePlanContext,
      user_profile: {
        first_name: userProf?.first_name || profile?.first_name,
        last_name: userProf?.last_name || profile?.last_name,
        height: userProf?.height || profile?.height,
        weight: userProf?.weight || profile?.weight,
        age: userProf?.age || profile?.age,
      },
      fitness_goal: userProf?.fitness_goal || profile?.fitness_goal || 'build_muscle',
      experience_level: userProf?.experience_level || profile?.experience_level || 'intermediate',
      training_frequency: userProf?.training_frequency || profile?.training_frequency || 3,
      preferred_equipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
      training_location: 'Gym / Fitness Facility',
      today: todayStr,
      today_workouts: {
        exercises_count: todayWk.exercises_count,
        sets_count: todayWk.sets_count,
        volume_kg: todayWk.volume_kg,
        duration_minutes: todayWk.duration_minutes,
        exercises_names: todayWk.exercises_names
      },
      recent_workouts: recentWks.map(w => ({
        name: w.name,
        date: w.started_at,
        duration_minutes: w.duration_minutes,
        total_volume: w.total_volume,
        exercises_count: w.exercises_names.length,
        exercises: w.exercises_names
      })),
      last_7_days: {
        workouts_count: frequencyData.last7Days,
        volume_kg: vol7
      },
      last_14_days: {
        workouts_count: frequencyData.last14Days,
        volume_kg: vol14
      },
      last_30_days: {
        workouts_count: frequencyData.last30Days,
        volume_kg: vol30
      },
      exercise_history: Array.from(exerciseHistoryMap.values()).slice(0, 15),
      personal_records: prsList,
      estimated_1rm: estimated1rmMap,
      muscle_group_volume: muscleVol,
      frequency_by_muscle: frequencyByMuscle,
      recent_volume: progressComp.recentVolume,
      previous_period_volume: progressComp.previousVolume,
      recovery_context: {
        last_session_hours_ago: lastSessionHoursAgo,
        last_session_muscle_groups: lastSessionMuscles,
        ready_for_training: lastSessionHoursAgo === null || lastSessionHoursAgo >= 20,
        recommended_focus: recommendedFocus
      }
    }
  } catch (error) {
    console.error('Error building structured coach context:', error)
    return {
      user_profile: {
        first_name: profile?.first_name,
        last_name: profile?.last_name,
      },
      fitness_goal: profile?.fitness_goal || 'build_muscle',
      experience_level: profile?.experience_level || 'beginner',
      training_frequency: profile?.training_frequency || 3,
      today: todayStr,
      today_workouts: {
        exercises_count: 0,
        sets_count: 0,
        volume_kg: 0,
        duration_minutes: 0,
        exercises_names: []
      },
      recent_workouts: [],
      last_7_days: { workouts_count: 0, volume_kg: 0 },
      last_14_days: { workouts_count: 0, volume_kg: 0 },
      last_30_days: { workouts_count: 0, volume_kg: 0 },
      exercise_history: [],
      personal_records: [],
      estimated_1rm: {},
      muscle_group_volume: {},
      frequency_by_muscle: {},
      recent_volume: 0,
      previous_period_volume: 0,
      recovery_context: {
        last_session_hours_ago: null,
        last_session_muscle_groups: [],
        ready_for_training: true,
        recommended_focus: 'Full Body Starter'
      }
    }
  }
}
