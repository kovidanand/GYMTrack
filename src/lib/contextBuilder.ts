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
import { getNutritionGoals, getFoodEntriesForDate, DEFAULT_NUTRITION_GOALS } from './nutritionService'
import { toLocalISODate, getYesterdayISODate } from './dateUtils'

export interface StructuredNutritionContext {
  goals: {
    calorie_target: number
    protein_target: number
    carb_target: number
    fat_target: number
    fiber_target: number
    water_target: number
  }
  today: {
    date: string
    consumed_calories: number
    consumed_protein: number
    consumed_carbs: number
    consumed_fat: number
    consumed_fiber: number
    remaining_calories: number
    remaining_protein: number
    remaining_carbs: number
    remaining_fat: number
    meals_count: number
    logged_meals: Array<{
      food_name: string
      meal_type: string
      serving_size: number
      serving_unit: string
      calories: number
      protein: number
      carbs: number
      fat: number
      fiber?: number
    }>
  }
  yesterday?: {
    date: string
    consumed_calories: number
    consumed_protein: number
    consumed_carbs: number
    consumed_fat: number
    meals_count: number
  }
  selected_date_context?: {
    date: string
    consumed_calories: number
    consumed_protein: number
    consumed_carbs: number
    consumed_fat: number
    meals_count: number
    logged_meals: Array<{
      food_name: string
      meal_type: string
      calories: number
      protein: number
    }>
  }
  dietary_profile: {
    dietary_preference: string
    allergies: string[]
    food_restrictions: string[]
    preferred_protein_sources: string[]
    preferred_cuisines: string[]
    disliked_foods: string[]
    favorite_foods: string[]
    food_budget: string
    cooking_access: string
    cooking_skill: string
    meal_prep_time: string
    meals_per_day: number
  }
}

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
    target_weight?: number | null
    target_date?: string | null
    age?: number | null
    dietary_preference?: string
    allergies?: string[]
  }
  fitness_goal?: string | null
  secondary_goal?: string | null
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
  nutrition: StructuredNutritionContext
}

/**
 * Builds a compact, pre-aggregated, token-efficient structured context object
 * for the unified AI Coach using authentic GYMTrack database telemetry and NutriTrack food diary.
 */
export async function buildCoachContext(
  profile: any,
  userId: string,
  selectedDate?: string
): Promise<StructuredCoachContext> {
  const todayStr = toLocalISODate()
  const yesterdayStr = getYesterdayISODate()

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
      activePlanRes,
      nutritionGoals,
      todayFoodEntries,
      yesterdayFoodEntries,
      selectedDateFoodEntries
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
        .maybeSingle(),
      getNutritionGoals(userId).catch(() => DEFAULT_NUTRITION_GOALS),
      getFoodEntriesForDate(userId, todayStr).catch(() => []),
      getFoodEntriesForDate(userId, yesterdayStr).catch(() => []),
      selectedDate && selectedDate !== todayStr && selectedDate !== yesterdayStr
        ? getFoodEntriesForDate(userId, selectedDate).catch(() => [])
        : Promise.resolve([])
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

        existing.total_sessions += 1
        existing.latest_weight = w
        existing.latest_reps = r
        if (e1rm > existing.best_1rm) existing.best_1rm = e1rm
        existing.current_1rm = e1rm
        if (w > existing.best_weight) existing.best_weight = w

        exerciseHistoryMap.set(name, existing)
      }

      for (const m of sessionMuscles) {
        frequencyByMuscle[m] = (frequencyByMuscle[m] || 0) + 1
      }
    }

    for (const [name, stats] of exerciseHistoryMap.entries()) {
      estimated1rmMap[name] = stats.current_1rm
    }

    // Process Active Plan Info
    let structuredActivePlan: StructuredCoachContext['active_plan'] = null
    const activePlanObj = (activePlanData as any)?.plan || activePlanData
    if (activePlanObj && (activePlanObj.name || activePlanObj.id)) {
      const plan = activePlanObj
      const workouts = plan.workouts || []
      const currentDayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      const todayWorkout = workouts.find((w: any) => w.day_of_week?.toLowerCase() === currentDayOfWeek)

      const plannedExercises = (todayWorkout?.workout_exercises || []).map((we: any) => we.exercise?.name).filter(Boolean)
      const completedExercises = todayWk.exercises_names || []

      const remainingExercises = plannedExercises.filter((e: string) => !completedExercises.some((c: string) => c.toLowerCase() === e.toLowerCase()))

      structuredActivePlan = {
        has_active_plan: true,
        plan_name: plan.name,
        goal: plan.goal,
        duration_weeks: plan.duration_weeks,
        today_workout_name: todayWorkout?.name || 'Rest Day',
        today_day_type: todayWorkout?.day_type || 'rest',
        today_planned_exercises: plannedExercises,
        today_completed_exercises: completedExercises,
        completed_count: completedExercises.length,
        total_count: plannedExercises.length,
        next_uncompleted_exercise: remainingExercises[0] || null
      }
    }

    // Process Personal Records
    const rawPrList = Array.isArray(prsRaw) ? prsRaw : (prsRaw ? [prsRaw] : [])
    const prsList = rawPrList.map((pr: any) => ({
      exercise: pr.exercise_name || pr.exerciseName,
      value: Number(pr.weight || pr.value) || 0,
      unit: pr.unit || 'kg',
      achieved_at: pr.achieved_at || pr.achievedAt || ''
    }))

    // Calculate Recovery Context
    let lastSessionHoursAgo: number | null = null
    const lastSessionMuscles: string[] = []
    let recommendedFocus = 'Balanced Full Body'

    if (recentWks.length > 0) {
      const lastSession = recentWks[0]
      const lastDate = new Date(lastSession.started_at).getTime()
      const diffHours = Math.max(0, Math.round((Date.now() - lastDate) / (1000 * 60 * 60)))
      lastSessionHoursAgo = diffHours

      for (const exName of lastSession.exercises_names || []) {
        const match = DEFAULT_EXERCISES.find(e => e.name.toLowerCase() === exName.toLowerCase())
        if (match && !lastSessionMuscles.includes(match.muscle_group)) {
          lastSessionMuscles.push(match.muscle_group)
        }
      }

      if (lastSessionMuscles.includes('chest') || lastSessionMuscles.includes('shoulders')) {
        recommendedFocus = 'Pull (Back, Biceps) or Lower Body'
      } else if (lastSessionMuscles.includes('back')) {
        recommendedFocus = 'Push (Chest, Shoulders, Triceps) or Legs'
      } else if (lastSessionMuscles.includes('legs')) {
        recommendedFocus = 'Upper Body Push/Pull'
      }
    }

    // ─── Process Authentic Nutrition Context ───
    let todayCalories = 0
    let todayProtein = 0
    let todayCarbs = 0
    let todayFat = 0
    let todayFiber = 0
    const todayLoggedMeals = todayFoodEntries.map(e => {
      todayCalories += e.calories || 0
      todayProtein += e.protein || 0
      todayCarbs += e.carbs || 0
      todayFat += e.fat || 0
      todayFiber += e.fiber || 0
      return {
        food_name: e.food_name,
        meal_type: e.meal_type,
        serving_size: e.serving_size,
        serving_unit: e.serving_unit,
        calories: Math.round(e.calories),
        protein: Math.round(e.protein * 10) / 10,
        carbs: Math.round(e.carbs * 10) / 10,
        fat: Math.round(e.fat * 10) / 10,
        fiber: Math.round((e.fiber || 0) * 10) / 10,
      }
    })

    let yesterdayCalories = 0
    let yesterdayProtein = 0
    let yesterdayCarbs = 0
    let yesterdayFat = 0
    for (const e of yesterdayFoodEntries) {
      yesterdayCalories += e.calories || 0
      yesterdayProtein += e.protein || 0
      yesterdayCarbs += e.carbs || 0
      yesterdayFat += e.fat || 0
    }

    const remainingCalories = Math.max(0, nutritionGoals.calorie_target - Math.round(todayCalories))
    const remainingProtein = Math.max(0, Math.round((nutritionGoals.protein_target - todayProtein) * 10) / 10)
    const remainingCarbs = Math.max(0, Math.round((nutritionGoals.carb_target - todayCarbs) * 10) / 10)
    const remainingFat = Math.max(0, Math.round((nutritionGoals.fat_target - todayFat) * 10) / 10)

    const resolvedProfile = userProf || profile || {}

    const nutritionContext: StructuredNutritionContext = {
      goals: {
        calorie_target: nutritionGoals.calorie_target,
        protein_target: nutritionGoals.protein_target,
        carb_target: nutritionGoals.carb_target,
        fat_target: nutritionGoals.fat_target,
        fiber_target: nutritionGoals.fiber_target,
        water_target: nutritionGoals.water_target,
      },
      today: {
        date: todayStr,
        consumed_calories: Math.round(todayCalories),
        consumed_protein: Math.round(todayProtein * 10) / 10,
        consumed_carbs: Math.round(todayCarbs * 10) / 10,
        consumed_fat: Math.round(todayFat * 10) / 10,
        consumed_fiber: Math.round(todayFiber * 10) / 10,
        remaining_calories: remainingCalories,
        remaining_protein: remainingProtein,
        remaining_carbs: remainingCarbs,
        remaining_fat: remainingFat,
        meals_count: todayFoodEntries.length,
        logged_meals: todayLoggedMeals,
      },
      yesterday: {
        date: yesterdayStr,
        consumed_calories: Math.round(yesterdayCalories),
        consumed_protein: Math.round(yesterdayProtein * 10) / 10,
        consumed_carbs: Math.round(yesterdayCarbs * 10) / 10,
        consumed_fat: Math.round(yesterdayFat * 10) / 10,
        meals_count: yesterdayFoodEntries.length,
      },
      dietary_profile: {
        dietary_preference: resolvedProfile.dietary_preference || 'non_vegetarian',
        allergies: resolvedProfile.allergies || [],
        food_restrictions: resolvedProfile.food_restrictions || [],
        preferred_protein_sources: resolvedProfile.preferred_protein_sources || [],
        preferred_cuisines: resolvedProfile.preferred_cuisines || [],
        disliked_foods: resolvedProfile.disliked_foods || [],
        favorite_foods: resolvedProfile.favorite_foods || [],
        food_budget: resolvedProfile.food_budget || 'moderate',
        cooking_access: resolvedProfile.cooking_access || 'full_kitchen',
        cooking_skill: resolvedProfile.cooking_skill || 'intermediate',
        meal_prep_time: resolvedProfile.meal_prep_time || 'moderate',
        meals_per_day: resolvedProfile.meals_per_day || 3,
      },
    }

    if (selectedDate && selectedDate !== todayStr && selectedDate !== yesterdayStr) {
      let selCal = 0
      let selPro = 0
      let selCarb = 0
      let selFat = 0
      const selMeals = selectedDateFoodEntries.map(e => {
        selCal += e.calories || 0
        selPro += e.protein || 0
        selCarb += e.carbs || 0
        selFat += e.fat || 0
        return {
          food_name: e.food_name,
          meal_type: e.meal_type,
          calories: Math.round(e.calories),
          protein: Math.round(e.protein * 10) / 10,
        }
      })
      nutritionContext.selected_date_context = {
        date: selectedDate,
        consumed_calories: Math.round(selCal),
        consumed_protein: Math.round(selPro * 10) / 10,
        consumed_carbs: Math.round(selCarb * 10) / 10,
        consumed_fat: Math.round(selFat * 10) / 10,
        meals_count: selectedDateFoodEntries.length,
        logged_meals: selMeals,
      }
    }

    const vol7 = recentWks
      .filter(w => (Date.now() - new Date(w.started_at).getTime()) <= 7 * 86400000)
      .reduce((acc, w) => acc + (w.total_volume || 0), 0)
    const vol14 = recentWks
      .filter(w => (Date.now() - new Date(w.started_at).getTime()) <= 14 * 86400000)
      .reduce((acc, w) => acc + (w.total_volume || 0), 0)
    const vol30 = recentWks
      .filter(w => (Date.now() - new Date(w.started_at).getTime()) <= 30 * 86400000)
      .reduce((acc, w) => acc + (w.total_volume || 0), 0)

    return {
      active_plan: structuredActivePlan,
      user_profile: {
        first_name: resolvedProfile.first_name,
        last_name: resolvedProfile.last_name,
        height: resolvedProfile.height,
        weight: resolvedProfile.weight,
        target_weight: resolvedProfile.target_weight,
        target_date: resolvedProfile.target_date,
        age: resolvedProfile.age,
        dietary_preference: resolvedProfile.dietary_preference,
        allergies: resolvedProfile.allergies,
      },
      fitness_goal: resolvedProfile.fitness_goal || 'build_muscle',
      secondary_goal: resolvedProfile.secondary_goal || null,
      experience_level: resolvedProfile.experience_level || 'beginner',
      training_frequency: resolvedProfile.training_frequency || 3,
      preferred_equipment: resolvedProfile.preferred_equipment || [],
      training_location: resolvedProfile.training_location || 'gym',
      today: todayStr,
      today_workouts: todayWk,
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
      },
      nutrition: nutritionContext
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
      },
      nutrition: {
        goals: DEFAULT_NUTRITION_GOALS,
        today: {
          date: todayStr,
          consumed_calories: 0,
          consumed_protein: 0,
          consumed_carbs: 0,
          consumed_fat: 0,
          consumed_fiber: 0,
          remaining_calories: DEFAULT_NUTRITION_GOALS.calorie_target,
          remaining_protein: DEFAULT_NUTRITION_GOALS.protein_target,
          remaining_carbs: DEFAULT_NUTRITION_GOALS.carb_target,
          remaining_fat: DEFAULT_NUTRITION_GOALS.fat_target,
          meals_count: 0,
          logged_meals: [],
        },
        dietary_profile: {
          dietary_preference: 'non_vegetarian',
          allergies: [],
          food_restrictions: [],
          preferred_protein_sources: [],
          preferred_cuisines: [],
          disliked_foods: [],
          favorite_foods: [],
          food_budget: 'moderate',
          cooking_access: 'full_kitchen',
          cooking_skill: 'intermediate',
          meal_prep_time: 'moderate',
          meals_per_day: 3,
        }
      }
    }
  }
}
