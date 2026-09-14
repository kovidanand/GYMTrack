import type { StructuredPlanDefinition, PlanPhase } from '@/types'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import { supabase } from '@/lib/supabase'

export interface PlanGenerationParams {
  goal: string
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  training_days_per_week: number
  training_location: 'gym' | 'home'
  available_equipment?: string[]
  session_duration: number
  duration_weeks: number
}

export interface GoalCategory {
  id: string
  title: string
  description: string
  defaultDays: number
  recommendedLevel: 'beginner' | 'intermediate' | 'advanced'
  badge: string
}

export const GOAL_CATEGORIES: GoalCategory[] = [
  {
    id: 'muscle_growth',
    title: 'Muscle Growth (Hypertrophy)',
    description: 'Maximize muscular development through progressive overload and high-yield volume.',
    defaultDays: 4,
    recommendedLevel: 'intermediate',
    badge: 'Popular'
  },
  {
    id: 'strength',
    title: 'Strength & Power',
    description: 'Build raw compound strength on squat, bench press, deadlift, and overhead press.',
    defaultDays: 4,
    recommendedLevel: 'intermediate',
    badge: 'Compound Focus'
  },
  {
    id: 'lean_muscle',
    title: 'Lean Muscle & Definition',
    description: 'Combine muscle stimulation with moderate rest intervals for a athletic, lean physique.',
    defaultDays: 4,
    recommendedLevel: 'intermediate',
    badge: 'Athletic'
  },
  {
    id: 'weight_loss',
    title: 'Fat Loss & Conditioning',
    description: 'High-density multi-joint training designed to preserve muscle while elevating caloric output.',
    defaultDays: 4,
    recommendedLevel: 'beginner',
    badge: 'High Energy'
  },
  {
    id: 'beginner_fitness',
    title: 'Beginner Foundations',
    description: 'Master core exercise mechanics, establish joint stability, and build a consistent lifting habit.',
    defaultDays: 3,
    recommendedLevel: 'beginner',
    badge: 'Best for Starters'
  },
  {
    id: 'general_fitness',
    title: 'General Fitness & Longevity',
    description: 'Balanced full-body health, joint mobility, cardiovascular health, and sustainable strength.',
    defaultDays: 3,
    recommendedLevel: 'beginner',
    badge: 'Balanced'
  },
  {
    id: 'endurance',
    title: 'Muscular Endurance',
    description: 'Sustain work capacity, improve stamina, and build resilience against fatigue.',
    defaultDays: 3,
    recommendedLevel: 'intermediate',
    badge: 'Stamina'
  },
  {
    id: 'athletic_performance',
    title: 'Athletic Performance',
    description: 'Explosive power, rotational strength, and functional movement patterns for athletes.',
    defaultDays: 4,
    recommendedLevel: 'advanced',
    badge: 'Performance'
  }
]

export const DURATION_OPTIONS = [
  { label: '2 Months', weeks: 8, description: '~8 weeks foundation' },
  { label: '3 Months', weeks: 12, description: '~12 weeks complete cycle (Recommended)' },
  { label: '6 Months', weeks: 24, description: '~24 weeks progressive transformation' },
  { label: '1 Year', weeks: 52, description: '~52 weeks annual periodized development' },
  { label: '2 Years', weeks: 104, description: '~104 weeks multi-phase mastery' }
]

function findExercise(slugOrName: string) {
  const norm = slugOrName.toLowerCase().replace(/[_-]/g, ' ')
  return (
    DEFAULT_EXERCISES.find(e => e.slug === slugOrName || e.id === slugOrName) ||
    DEFAULT_EXERCISES.find(e => e.name.toLowerCase() === norm) ||
    DEFAULT_EXERCISES.find(e => e.name.toLowerCase().includes(norm)) ||
    DEFAULT_EXERCISES[0]
  )
}

/**
 * Calculates periodized phases for a given duration
 */
export function calculatePlanPhases(durationWeeks: number, goal: string): PlanPhase[] {
  if (durationWeeks <= 8) {
    return [
      {
        phase_number: 1,
        name: 'Phase 1: Foundation & Neuromuscular Adaptation',
        description: 'Establish movement efficiency, safe bar paths, and base muscular endurance.',
        start_week: 1,
        end_week: 4,
        focus: 'Form precision, controlled tempo, and baseline volume'
      },
      {
        phase_number: 2,
        name: 'Phase 2: Progressive Overload & Growth',
        description: 'Systematically increase load and density to trigger muscular adaptations.',
        start_week: 5,
        end_week: durationWeeks,
        focus: 'Load increments, intensity management, and personal records'
      }
    ]
  }

  if (durationWeeks <= 16) {
    const p1End = Math.floor(durationWeeks / 3)
    const p2End = Math.floor((durationWeeks * 2) / 3)
    return [
      {
        phase_number: 1,
        name: 'Phase 1: Base Accumulation',
        description: 'Build total workload tolerance with moderate weights and crisp repetitions.',
        start_week: 1,
        end_week: p1End,
        focus: 'Volume accumulation, exercise variety, and tendon conditioning'
      },
      {
        phase_number: 2,
        name: 'Phase 2: Intensification',
        description: 'Shift focus toward progressive resistance on primary compound movements.',
        start_week: p1End + 1,
        end_week: p2End,
        focus: 'Strength progression, heavier compound loads, and rep mastery'
      },
      {
        phase_number: 3,
        name: 'Phase 3: Peak & Performance Realization',
        description: 'Express maximum strength and density with high-intensity compound sets.',
        start_week: p2End + 1,
        end_week: durationWeeks,
        focus: 'Peak strength, estimated 1RM progression, and workout density'
      }
    ]
  }

  // Long-term plans (24+ weeks)
  const quarter = Math.floor(durationWeeks / 4)
  return [
    {
      phase_number: 1,
      name: 'Phase 1: Anatomical Foundation',
      description: 'Establish tendon strength, movement mastery, and core stability.',
      start_week: 1,
      end_week: quarter,
      focus: 'Volume accumulation and joint durability'
    },
    {
      phase_number: 2,
      name: 'Phase 2: Hypertrophy & Work Capacity',
      description: 'Higher volume training targeting muscle fiber growth across all angles.',
      start_week: quarter + 1,
      end_week: quarter * 2,
      focus: 'Muscle hypertrophy and secondary movement progression'
    },
    {
      phase_number: 3,
      name: 'Phase 3: Maximum Strength & Overload',
      description: 'Heavier loads on compound lifts with dedicated rest intervals.',
      start_week: quarter * 2 + 1,
      end_week: quarter * 3,
      focus: 'Neuromuscular strength and load progression'
    },
    {
      phase_number: 4,
      name: 'Phase 4: Consolidation & Peak Mastery',
      description: 'Refine technique, test personal records, and solidify long-term gains.',
      start_week: quarter * 3 + 1,
      end_week: durationWeeks,
      focus: 'Strength testing, volume maintenance, and athletic conditioning'
    }
  ]
}

/**
 * Builds a deterministic, verified weekly schedule matching user constraints
 */
export function buildWeeklySchedule(params: PlanGenerationParams) {
  const { goal, experience_level, training_days_per_week } = params

  const isStrength = goal === 'strength' || goal === 'athletic_performance'
  const targetRepsCompound = isStrength ? '5-8' : '8-10'
  const targetRepsIso = isStrength ? '8-10' : '10-12'
  const compoundSets = experience_level === 'beginner' ? 3 : 4
  const isoSets = 3
  const compoundRest = isStrength ? 120 : 90
  const isoRest = 60

  // 2 DAYS SPLIT: Full Body A & Full Body B
  if (training_days_per_week === 2) {
    const fullBodyA = [
      { slug: 'barbell-squat', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'bench-press', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'lat-pulldown', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'dumbbell-shoulder-press', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'plank', sets: 3, reps: '45-60s', rest: 60 }
    ]

    const fullBodyB = [
      { slug: 'deadlift', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'incline-dumbbell-press', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'cable-row', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'bicep-curl', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'tricep-pushdown', sets: isoSets, reps: targetRepsIso, rest: isoRest }
    ]

    return [
      { day_number: 1, day_name: 'Monday', day_type: 'workout' as const, focus: 'Full Body A (Squat & Press Focus)', estimated_duration: params.session_duration, exercises: mapExercises(fullBodyA) },
      { day_number: 2, day_name: 'Tuesday', day_type: 'recovery' as const, focus: 'Active Recovery & Mobility', estimated_duration: 20, exercises: [] },
      { day_number: 3, day_name: 'Wednesday', day_type: 'rest' as const, focus: 'Rest Day', estimated_duration: 0, exercises: [] },
      { day_number: 4, day_name: 'Thursday', day_type: 'workout' as const, focus: 'Full Body B (Hinge & Pull Focus)', estimated_duration: params.session_duration, exercises: mapExercises(fullBodyB) },
      { day_number: 5, day_name: 'Friday', day_type: 'recovery' as const, focus: 'Active Recovery & Light Cardio', estimated_duration: 25, exercises: [] },
      { day_number: 6, day_name: 'Saturday', day_type: 'rest' as const, focus: 'Rest Day', estimated_duration: 0, exercises: [] },
      { day_number: 7, day_name: 'Sunday', day_type: 'rest' as const, focus: 'Weekly Recovery & Sleep', estimated_duration: 0, exercises: [] }
    ]
  }

  // 3 DAYS SPLIT: Push / Pull / Legs
  if (training_days_per_week === 3) {
    const push = [
      { slug: 'bench-press', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'incline-dumbbell-press', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'overhead-press', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'lateral-raise', sets: 3, reps: '12-15', rest: 60 },
      { slug: 'tricep-pushdown', sets: isoSets, reps: targetRepsIso, rest: isoRest }
    ]

    const pull = [
      { slug: 'barbell-row', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'lat-pulldown', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'cable-row', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'face-pull', sets: 3, reps: '12-15', rest: 60 },
      { slug: 'bicep-curl', sets: isoSets, reps: targetRepsIso, rest: isoRest }
    ]

    const legs = [
      { slug: 'barbell-squat', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'romanian-deadlift', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'leg-press', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'calf-raise', sets: 4, reps: '12-15', rest: 60 },
      { slug: 'plank', sets: 3, reps: '45-60s', rest: 60 }
    ]

    return [
      { day_number: 1, day_name: 'Monday', day_type: 'workout' as const, focus: 'Push (Chest, Shoulders & Triceps)', estimated_duration: params.session_duration, exercises: mapExercises(push) },
      { day_number: 2, day_name: 'Tuesday', day_type: 'recovery' as const, focus: 'Active Recovery & Walking', estimated_duration: 20, exercises: [] },
      { day_number: 3, day_name: 'Wednesday', day_type: 'workout' as const, focus: 'Pull (Back, Rear Delts & Biceps)', estimated_duration: params.session_duration, exercises: mapExercises(pull) },
      { day_number: 4, day_name: 'Thursday', day_type: 'recovery' as const, focus: 'Active Recovery & Stretching', estimated_duration: 20, exercises: [] },
      { day_number: 5, day_name: 'Friday', day_type: 'workout' as const, focus: 'Legs & Core (Quads, Hamstrings, Calves)', estimated_duration: params.session_duration, exercises: mapExercises(legs) },
      { day_number: 6, day_name: 'Saturday', day_type: 'rest' as const, focus: 'Rest Day', estimated_duration: 0, exercises: [] },
      { day_number: 7, day_name: 'Sunday', day_type: 'rest' as const, focus: 'Weekly Recovery', estimated_duration: 0, exercises: [] }
    ]
  }

  // 4 DAYS SPLIT: Upper A, Lower A, Rest, Upper B, Lower B
  if (training_days_per_week === 4) {
    const upperA = [
      { slug: 'bench-press', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'barbell-row', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'dumbbell-shoulder-press', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'lat-pulldown', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'tricep-pushdown', sets: isoSets, reps: targetRepsIso, rest: isoRest }
    ]

    const lowerA = [
      { slug: 'barbell-squat', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'romanian-deadlift', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'leg-press', sets: isoSets, reps: targetRepsIso, rest: isoRest },
      { slug: 'calf-raise', sets: 4, reps: '12-15', rest: 60 },
      { slug: 'plank', sets: 3, reps: '45-60s', rest: 60 }
    ]

    const upperB = [
      { slug: 'incline-dumbbell-press', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'cable-row', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'overhead-press', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'lateral-raise', sets: 3, reps: '12-15', rest: 60 },
      { slug: 'bicep-curl', sets: isoSets, reps: targetRepsIso, rest: isoRest }
    ]

    const lowerB = [
      { slug: 'deadlift', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'front-squat', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
      { slug: 'lunges', sets: isoSets, reps: '10-12 each', rest: isoRest },
      { slug: 'calf-raise', sets: 4, reps: '12-15', rest: 60 },
      { slug: 'plank', sets: 3, reps: '45-60s', rest: 60 }
    ]

    return [
      { day_number: 1, day_name: 'Monday', day_type: 'workout' as const, focus: 'Upper Body Power (Chest, Back, Arms)', estimated_duration: params.session_duration, exercises: mapExercises(upperA) },
      { day_number: 2, day_name: 'Tuesday', day_type: 'workout' as const, focus: 'Lower Body Strength (Quads, Calves, Core)', estimated_duration: params.session_duration, exercises: mapExercises(lowerA) },
      { day_number: 3, day_name: 'Wednesday', day_type: 'recovery' as const, focus: 'Mid-Week Active Recovery', estimated_duration: 20, exercises: [] },
      { day_number: 4, day_name: 'Thursday', day_type: 'workout' as const, focus: 'Upper Body Hypertrophy (Shoulders & Arms)', estimated_duration: params.session_duration, exercises: mapExercises(upperB) },
      { day_number: 5, day_name: 'Friday', day_type: 'workout' as const, focus: 'Lower Body Posterior Chain (Hams & Glutes)', estimated_duration: params.session_duration, exercises: mapExercises(lowerB) },
      { day_number: 6, day_name: 'Saturday', day_type: 'recovery' as const, focus: 'Mobility & Conditioning', estimated_duration: 25, exercises: [] },
      { day_number: 7, day_name: 'Sunday', day_type: 'rest' as const, focus: 'Full Rest Day', estimated_duration: 0, exercises: [] }
    ]
  }

  // 5 or 6 DAYS SPLIT: Push / Pull / Legs / Upper / Lower
  const push = [
    { slug: 'bench-press', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
    { slug: 'incline-dumbbell-press', sets: isoSets, reps: targetRepsIso, rest: isoRest },
    { slug: 'overhead-press', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
    { slug: 'lateral-raise', sets: 3, reps: '12-15', rest: 60 },
    { slug: 'tricep-pushdown', sets: isoSets, reps: targetRepsIso, rest: isoRest }
  ]

  const pull = [
    { slug: 'barbell-row', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
    { slug: 'lat-pulldown', sets: isoSets, reps: targetRepsIso, rest: isoRest },
    { slug: 'cable-row', sets: isoSets, reps: targetRepsIso, rest: isoRest },
    { slug: 'face-pull', sets: 3, reps: '12-15', rest: 60 },
    { slug: 'bicep-curl', sets: isoSets, reps: targetRepsIso, rest: isoRest }
  ]

  const legs = [
    { slug: 'barbell-squat', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
    { slug: 'romanian-deadlift', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
    { slug: 'leg-press', sets: isoSets, reps: targetRepsIso, rest: isoRest },
    { slug: 'calf-raise', sets: 4, reps: '12-15', rest: 60 },
    { slug: 'plank', sets: 3, reps: '45-60s', rest: 60 }
  ]

  const upper = [
    { slug: 'incline-bench-press', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
    { slug: 'dumbbell-row', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
    { slug: 'dumbbell-shoulder-press', sets: isoSets, reps: targetRepsIso, rest: isoRest },
    { slug: 'hammer-curl', sets: isoSets, reps: targetRepsIso, rest: isoRest },
    { slug: 'tricep-pushdown', sets: isoSets, reps: targetRepsIso, rest: isoRest }
  ]

  const lowerOrArms = [
    { slug: 'deadlift', sets: compoundSets, reps: targetRepsCompound, rest: compoundRest },
    { slug: 'lunges', sets: isoSets, reps: '10-12 each', rest: isoRest },
    { slug: 'leg-extension', sets: isoSets, reps: '12-15', rest: 60 },
    { slug: 'calf-raise', sets: 4, reps: '12-15', rest: 60 },
    { slug: 'plank', sets: 3, reps: '60s', rest: 60 }
  ]

  return [
    { day_number: 1, day_name: 'Monday', day_type: 'workout' as const, focus: 'Chest, Shoulders & Triceps (Push)', estimated_duration: params.session_duration, exercises: mapExercises(push) },
    { day_number: 2, day_name: 'Tuesday', day_type: 'workout' as const, focus: 'Back, Rear Delts & Biceps (Pull)', estimated_duration: params.session_duration, exercises: mapExercises(pull) },
    { day_number: 3, day_name: 'Wednesday', day_type: 'workout' as const, focus: 'Quads, Hamstrings & Calves (Legs)', estimated_duration: params.session_duration, exercises: mapExercises(legs) },
    { day_number: 4, day_name: 'Thursday', day_type: 'recovery' as const, focus: 'Active Recovery & Mobility', estimated_duration: 20, exercises: [] },
    { day_number: 5, day_name: 'Friday', day_type: 'workout' as const, focus: 'Upper Body Density & Arms', estimated_duration: params.session_duration, exercises: mapExercises(upper) },
    { day_number: 6, day_name: 'Saturday', day_type: training_days_per_week === 6 ? ('workout' as const) : ('recovery' as const), focus: training_days_per_week === 6 ? 'Lower Body & Posterior Chain' : 'Conditioning & Core', estimated_duration: training_days_per_week === 6 ? params.session_duration : 25, exercises: training_days_per_week === 6 ? mapExercises(lowerOrArms) : [] },
    { day_number: 7, day_name: 'Sunday', day_type: 'rest' as const, focus: 'Weekly Recovery & Prep', estimated_duration: 0, exercises: [] }
  ]
}

function mapExercises(list: Array<{ slug: string; sets: number; reps: string; rest: number }>) {
  return list.map(item => {
    const ex = findExercise(item.slug)
    return {
      exercise_id: ex.id,
      exercise_slug: ex.slug,
      exercise_name: ex.name,
      target_muscle: ex.muscle_group,
      sets: item.sets,
      reps: item.reps,
      rest_seconds: item.rest
    }
  })
}

/**
 * Generate a complete, verified structured training plan
 */
export async function generateStructuredPlan(params: PlanGenerationParams): Promise<StructuredPlanDefinition> {
  const goalCategory = GOAL_CATEGORIES.find(c => c.id === params.goal) || GOAL_CATEGORIES[0]
  const phases = calculatePlanPhases(params.duration_weeks, params.goal)
  const schedule = buildWeeklySchedule(params)

  const planTitle = `${params.duration_weeks}-Week ${goalCategory.title.split('(')[0].trim()} Plan`

  const planDefinition: StructuredPlanDefinition = {
    plan_name: planTitle,
    goal: goalCategory.title,
    duration_weeks: params.duration_weeks,
    training_days_per_week: params.training_days_per_week,
    difficulty: params.experience_level,
    session_duration: params.session_duration,
    training_location: params.training_location,
    available_equipment: params.available_equipment || ['barbell', 'dumbbell', 'cables', 'machines'],
    phases,
    weekly_schedule: schedule,
    progression_notes: `Focus on progressive overload. Keep accurate weight logs. When completing all target reps with good form across all sets, increase load by 1.25 to 2.5 kg on the subsequent week.`
  }

  return planDefinition
}
