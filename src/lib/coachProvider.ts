import { supabase } from '@/lib/supabase'
import type { StructuredWorkoutAnalysis } from './coachAnalysis'
import type { StructuredExerciseGuidance, StructuredWorkoutRecommendation } from '@/types'
import { resolveExerciseMedia } from './exerciseMedia'
import { 
  get_exercise_details, 
} from './coachDataService'
import type { StructuredCoachContext } from './contextBuilder'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'

export interface PendingLogPayload {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  sets: number
  logged?: boolean
}

export interface PendingFoodLogPayload {
  foodName: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  servingSize: number
  servingUnit: string
  servingsLogged: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  explanation?: string
  logged?: boolean
}

export interface CoachAnswer {
  content: string
  supportingData?: string
  suggestedQuestions?: string[]
  imageUrl?: string
  structuredGuidance?: StructuredExerciseGuidance
  structuredRecommendation?: StructuredWorkoutRecommendation
  pendingLog?: PendingLogPayload
  pendingFoodLog?: PendingFoodLogPayload
}

export type QueryIntent =
  | 'exercise_instruction'
  | 'exercise_alternative'
  | 'workout_recommendation'
  | 'progress_analysis'
  | 'history_lookup'
  | 'personal_record'
  | 'training_volume'
  | 'recovery'
  | 'general_fitness'
  | 'safety'
  | 'nutrition_what_to_eat'
  | 'nutrition_macro_budget'
  | 'nutrition_summary'
  | 'nutrition_comparison'
  | 'nutrition_post_workout'
  | 'nutrition_advice'
  | 'other'

interface ExerciseTechniqueGuide {
  name: string
  slug: string
  targetMuscles: string
  equipment: string
  setup: string[]
  execution: string[]
  breathing: string
  commonMistakes: string[]
  tips: string[]
  alternatives: string[]
}

const TECHNIQUE_GUIDES: Record<string, ExerciseTechniqueGuide> = {
  'arnold-press': {
    name: 'Arnold Press',
    slug: 'arnold-press',
    targetMuscles: 'Anterior & Lateral Deltoids, Triceps Brachii',
    equipment: 'Dumbbells, Adjustable Bench',
    setup: [
      'Sit upright on a flat bench with firm back support, feet planted shoulder-width on the floor.',
      'Hold dumbbells at shoulder height with palms facing your chest and elbows tucked in front.'
    ],
    execution: [
      'Initiate the press by smoothly rotating wrists outward 180 degrees.',
      'Extend arms vertically until dumbbells meet overhead directly above your crown.',
      'Reverse the rotational path under control back to the starting chin shelf.'
    ],
    breathing: 'Inhale at the bottom; exhale as you press and rotate overhead; inhale smoothly on the descent.',
    commonMistakes: [
      'Using excessive load causing lumbar hyperextension.',
      'Rushing rotation before starting vertical pressing path.'
    ],
    tips: [
      'Keep core braced and maintain full shoulder stability throughout the rotational arc.'
    ],
    alternatives: ['Overhead Barbell Press', 'Seated Dumbbell Shoulder Press', 'Pike Push-Ups']
  },
  'bench-press': {
    name: 'Barbell Bench Press',
    slug: 'bench-press',
    targetMuscles: 'Pectoralis Major, Anterior Deltoid, Triceps Brachii',
    equipment: 'Olympic Barbell, Flat Bench',
    setup: [
      'Lie flat on the bench with eyes aligned directly under the racked barbell.',
      'Grip the bar slightly wider than shoulder-width with wrists stacked over forearms.',
      'Retract and depress shoulder blades into the bench pad, planting feet firmly into the floor.'
    ],
    execution: [
      'Unrack the bar and stabilize it directly over your mid-chest.',
      'Lower the bar with control to your mid-to-lower sternum with elbows tucked at 45 to 70 degrees.',
      'Touch your chest lightly without bouncing or lifting glutes.',
      'Press explosively upward and slightly back toward the rack path until arms reach lockout.'
    ],
    breathing: 'Inhale and brace abdominal wall on the descent; exhale forcefully past the pressing sticking point.',
    commonMistakes: [
      'Bouncing the bar off the ribcage instead of controlling eccentric phase.',
      'Flaring elbows out to 90 degrees, stressing rotator cuff tendons.',
      'Lifting glutes off the bench.'
    ],
    tips: [
      'Drive through your heels to generate whole-body tension and stability.'
    ],
    alternatives: ['Dumbbell Bench Press', 'Push-Ups', 'Floor Press', 'Machine Chest Press']
  },
  'deadlift': {
    name: 'Conventional Barbell Deadlift',
    slug: 'deadlift',
    targetMuscles: 'Gluteus Maximus, Hamstrings, Erector Spinae, Latissimus Dorsi',
    equipment: 'Barbell, Bumper or Weight Plates',
    setup: [
      'Stand with feet hip-width apart, barbell cutting over the middle of your shoelaces.',
      'Hinge at hips with knees slightly bent until your hands grip the bar outside your knees.',
      'Pull slack out of the barbell and pack your lats down into your back pockets.'
    ],
    execution: [
      'Push the floor away through your mid-foot while keeping your chest proud.',
      'Keep the bar gliding against your shins and thighs as hips and shoulders rise together.',
      'Lock out by squeezing glutes firmly at top without hyperextending lower back.',
      'Hinge hips backward to lower the bar along the same vertical path.'
    ],
    breathing: 'Take a deep diaphragmatic breath and brace at bottom; exhale past the knee pass-point.',
    commonMistakes: [
      'Rounding the lower back under load.',
      'Jerking the bar off the floor without pulling out slack.',
      'Bar drifting forward away from the body.'
    ],
    tips: [
      'Treat the deadlift as pushing the ground away with your legs rather than pulling with arms.'
    ],
    alternatives: ['Romanian Deadlift (RDL)', 'Trap Bar Deadlift', 'Kettlebell Deadlift']
  },
  'barbell-squat': {
    name: 'Barbell Back Squat',
    slug: 'barbell-squat',
    targetMuscles: 'Quadriceps, Gluteus Maximus, Hamstrings, Adductors, Core',
    equipment: 'Squat Rack, Olympic Barbell',
    setup: [
      'Step under the bar, resting it across upper traps with a tight shoulder shelf.',
      'Unrack, take two stable steps back, set feet shoulder-width apart with toes angled 15–30° outward.',
      'Inhale deep into your diaphragm and brace your core firmly.'
    ],
    execution: [
      'Break simultaneously at hips and knees to initiate descent.',
      'Lower until your hip crease is below the top of your knees (parallel depth).',
      'Keep knees tracking inline with your toes without collapsing inward.',
      'Drive up forcefully through your mid-foot back to standing lockout.'
    ],
    breathing: 'Inhale and brace before descending; exhale as you stand past the sticking point.',
    commonMistakes: [
      'Knees collapsing inward (valgus collapse).',
      'Rising hips too early (good morning squat).',
      'Cutting depth short before full hamstring/quad recruitment.'
    ],
    tips: [
      'Screw your feet into the ground to externally rotate and stabilize hips.'
    ],
    alternatives: ['Leg Press', 'Front Squat', 'Bulgarian Split Squat', 'Goblet Squat']
  },
  'pull-up': {
    name: 'Pull-Up',
    slug: 'pull-up',
    targetMuscles: 'Latissimus Dorsi, Biceps Brachii, Rhomboids, Core',
    equipment: 'Pull-Up Bar',
    setup: [
      'Grip the overhead bar with overhand grip slightly wider than shoulder-width.',
      'Hang with arms fully extended and engage core in a slight hollow body position.'
    ],
    execution: [
      'Depress and retract shoulder blades into an active hang.',
      'Drive elbows down toward your hip pockets until your chin clears the bar.',
      'Pause briefly without shrugging shoulders forward.',
      'Lower under complete control back to full extension.'
    ],
    breathing: 'Exhale as you pull upward; inhale smoothly as you lower down.',
    commonMistakes: [
      'Kipping or swinging lower body for momentum.',
      'Incomplete range of motion (half reps).'
    ],
    tips: [
      'Focus on pulling with your elbows rather than your forearms.'
    ],
    alternatives: ['Lat Pulldown', 'Assisted Pull-Up Machine', 'Inverted Row']
  },
  'overhead-press': {
    name: 'Standing Overhead Press',
    slug: 'overhead-press',
    targetMuscles: 'Anterior & Lateral Deltoids, Triceps, Serratus Anterior',
    equipment: 'Barbell, Squat Rack',
    setup: [
      'Rack bar at mid-chest height. Grip bar just outside shoulder-width.',
      'Rest bar across anterior deltoids with vertical forearms.',
      'Squeeze glutes and brace abdominals firmly.'
    ],
    execution: [
      'Tilt head back slightly to clear the bar path.',
      'Press bar vertically in a straight line overhead.',
      'Once bar clears forehead, bring head forward and lock out stacked over spine.',
      'Lower under control back to clavicle shelf.'
    ],
    breathing: 'Inhale and brace at bottom; exhale as bar reaches top lockout.',
    commonMistakes: [
      'Excessive backward lean hyperextending lumbar spine.',
      'Pressing bar outward around the face in an arc.'
    ],
    tips: [
      'Squeeze glutes tightly throughout the movement to protect lower back.'
    ],
    alternatives: ['Seated Dumbbell Shoulder Press', 'Arnold Press', 'Kettlebell Press']
  },
  'romanian-deadlift': {
    name: 'Romanian Deadlift (RDL)',
    slug: 'romanian-deadlift',
    targetMuscles: 'Hamstrings, Gluteus Maximus, Erector Spinae',
    equipment: 'Barbell or Dumbbells',
    setup: [
      'Stand tall holding weights at hip height with soft knee bend (15 degrees).',
      'Keep knees fixed at this angle throughout the repetition.',
      'Set shoulders back, pack lats, and lock neutral spine.'
    ],
    execution: [
      'Hinge backward at hips by driving butt toward the wall behind you.',
      'Slide weights down your thighs and shins, keeping them in close contact.',
      'Lower until you feel a deep hamstring stretch just below kneecaps.',
      'Drive hips forward and contract glutes to return upright.'
    ],
    breathing: 'Inhale and brace before hinging; exhale as you extend hips to lockout.',
    commonMistakes: [
      'Rounding the lower back to force extra depth.',
      'Bending knees excessively, turning hinge into a squat.',
      'Letting weights drift forward away from legs.'
    ],
    tips: [
      'Think of closing a door behind you with your hips rather than bending down.'
    ],
    alternatives: ['Single-Leg Dumbbell RDL', 'Good Mornings', 'Kettlebell Deadlift']
  }
}

/**
 * Classifies user query into actionable intent
 */
export function classifyQueryIntent(query: string): QueryIntent {
  const q = query.trim().toLowerCase()

  // 1. Safety
  const medicalWords = ['pain', 'hurt', 'injury', 'injuries', 'torn', 'tear', 'sprain', 'doctor', 'physio', 'rehab', 'swelling', 'sharp pain', 'dislocated']
  if (medicalWords.some(w => q.includes(w))) return 'safety'

  // 2. Nutrition Intents
  if (
    q.includes('post-workout meal') ||
    q.includes('post workout meal') ||
    q.includes('after workout') ||
    q.includes('after my workout') ||
    q.includes('eat after today')
  ) {
    return 'nutrition_post_workout'
  }

  if (
    q.includes('how much protein') ||
    q.includes('calories left') ||
    q.includes('remaining calories') ||
    q.includes('remaining protein') ||
    q.includes('protein do i still need') ||
    q.includes('protein do i need') ||
    q.includes('calorie budget') ||
    q.includes('macros left') ||
    q.includes('am i meeting my nutrition target') ||
    q.includes('am i meeting my target') ||
    q.includes('protein target')
  ) {
    return 'nutrition_macro_budget'
  }

  if (
    q.includes('compare today') ||
    q.includes('compare this day') ||
    q.includes('compare with yesterday') ||
    q.includes('nutrition comparison')
  ) {
    return 'nutrition_comparison'
  }

  if (
    q.includes('what did i eat') ||
    q.includes('summarize my nutrition') ||
    q.includes('review today\'s nutrition') ||
    q.includes('review todays nutrition') ||
    q.includes('nutrition summary') ||
    q.includes('nutrition today') ||
    q.includes('what i ate')
  ) {
    return 'nutrition_summary'
  }

  if (
    q.includes('what should i eat') ||
    q.includes('what to eat') ||
    q.includes('suggest a meal') ||
    q.includes('suggest meals') ||
    q.includes('suggest an affordable meal') ||
    q.includes('suggest a high-protein') ||
    q.includes('suggest a high protein') ||
    q.includes('high-protein vegetarian') ||
    q.includes('high protein vegetarian') ||
    q.includes('what can i eat') ||
    q.includes('what should i have') ||
    q.includes('eat for lunch') ||
    q.includes('eat for dinner') ||
    q.includes('eat for breakfast') ||
    q.includes('eat for snack') ||
    q.includes('fit my remaining') ||
    q.includes('gain muscle') ||
    q.includes('lose fat while preserving') ||
    q.includes('improve my daily protein') ||
    q.includes('preferred foods') ||
    (q.includes('rest day') && (q.includes('meal') || q.includes('eat') || q.includes('adjust my meals')))
  ) {
    return 'nutrition_what_to_eat'
  }

  if (
    (q.includes('protein') || q.includes('calories') || q.includes('carbs') || q.includes('fiber') || q.includes('diet') || q.includes('nutrition')) &&
    !q.includes('bench') && !q.includes('squat') && !q.includes('workout') && !q.includes('exercise')
  ) {
    return 'nutrition_advice'
  }

  // 3. Exercise Alternatives
  if (q.includes('replace') || q.includes('alternative') || q.includes('instead of')) return 'exercise_alternative'

  // 3. Exercise Instruction
  const instructionWords = ['how do i do', 'how to do', 'how do i perform', 'how to perform', 'form for', 'technique', 'teach me', 'demonstrate', 'show me how', 'how do you do']
  if (instructionWords.some(w => q.includes(w))) return 'exercise_instruction'

  // 4. Workout Recommendation
  if (
    q.includes('what should i train') || 
    q.includes('what to train') || 
    q.includes('what workout') || 
    q.includes('recommend a workout') || 
    q.includes('30 minutes') || 
    q.includes('30 min') ||
    q.includes('what should i do today') ||
    q.includes('did chest yesterday') ||
    q.includes('trained chest yesterday') ||
    q.includes('based on my goal')
  ) return 'workout_recommendation'

  // 5. Progress Analysis
  if (
    q.includes('progressing') || 
    q.includes('volume increasing') || 
    q.includes('getting stronger') || 
    q.includes('am i improving') || 
    q.includes('have i improved') ||
    q.includes('plateau') ||
    q.includes('stuck on')
  ) return 'progress_analysis'

  // 6. Personal Record
  if (q.includes('personal record') || q.includes('best bench') || q.includes('best squat') || q.includes('best deadlift') || q.includes('max bench') || q.includes('my pr')) {
    return 'personal_record'
  }

  // 7. Training Volume / Muscle Neglect
  if (q.includes('volume') || q.includes('neglecting') || q.includes('muscle group')) return 'training_volume'

  // 8. History Lookup
  if (
    q.includes('what did i train') || 
    q.includes('what did i do') || 
    q.includes('what did i lift') || 
    q.includes('last week') || 
    q.includes('this week') || 
    q.includes('how many workouts') ||
    q.includes('what weight did i use')
  ) return 'history_lookup'

  // 9. Recovery
  if (q.includes('recovery') || q.includes('recovering') || q.includes('rest day') || q.includes('sore')) return 'recovery'

  // 10. General Fitness
  if (q.includes('how many sets') || q.includes('how many reps') || q.includes('progressive overload') || q.includes('what weight should i use')) {
    return 'general_fitness'
  }

  // Check if query is just an exercise name like "bench press"
  for (const ex of DEFAULT_EXERCISES) {
    if (q === ex.name.toLowerCase() || q === ex.slug) return 'exercise_instruction'
  }

  return 'other'
}

export function parseWorkoutLoggingQuery(query: string): PendingLogPayload | null {
  const q = query.trim().toLowerCase()

  const hasLogTrigger = 
    q.includes('i did') ||
    q.includes('i finished') ||
    q.includes('i completed') ||
    q.includes('i trained') ||
    q.includes('logged') ||
    q.startsWith('log ') ||
    q.includes('sets of') ||
    q.includes('reps for') ||
    q.includes('reps,') ||
    q.includes('reps of') ||
    q.includes('kg for') ||
    q.includes('kilos for')

  const matchedSlug = findMatchedExerciseSlug(q)
  if (!matchedSlug && !hasLogTrigger) return null

  let matchedExercise = DEFAULT_EXERCISES.find(e => e.slug === matchedSlug)
  if (!matchedExercise && matchedSlug) {
    matchedExercise = DEFAULT_EXERCISES.find(e => e.id === matchedSlug)
  }

  if (!matchedExercise) {
    for (const ex of DEFAULT_EXERCISES) {
      if (q.includes(ex.name.toLowerCase())) {
        matchedExercise = ex
        break
      }
    }
  }

  if (!matchedExercise) return null

  const isBodyweight = matchedExercise.equipment.includes('bodyweight') || matchedExercise.equipment.includes('none')

  let extractedWeight: number | null = null
  const weightMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?|kilograms?|lbs?|pounds?)/i) ||
                      q.match(/(?:at|with|@)\s*(\d+(?:\.\d+)?)/i)
  if (weightMatch) {
    extractedWeight = parseFloat(weightMatch[1])
  } else if (isBodyweight) {
    extractedWeight = 0
  }

  let extractedReps: number | null = null
  const repsMatch = q.match(/(?:sets?\s+of\s+)?(\d+)\s*(?:reps?|times?)/i) ||
                    q.match(/(?:for)\s*(\d+)\s*(?:reps?)?/i) ||
                    q.match(/(?:x|times)\s*(\d+)/i) ||
                    q.match(/(?:of\s+)(\d+)\s*(?:reps?)?/i)
  if (repsMatch) {
    extractedReps = parseInt(repsMatch[1], 10)
  }

  let extractedSets = 3
  const setsMatch = q.match(/(\d+)\s*sets?/i) || q.match(/(\d+)\s*x\s*\d+/i)
  if (setsMatch) {
    extractedSets = Math.min(20, Math.max(1, parseInt(setsMatch[1], 10)))
  }

  if (extractedWeight !== null || extractedReps !== null || hasLogTrigger) {
    return {
      exerciseId: matchedExercise.id,
      exerciseName: matchedExercise.name,
      weight: extractedWeight ?? 50,
      reps: extractedReps ?? 8,
      sets: extractedSets ?? 3
    }
  }

  return null
}

/**
 * Clean conversational formatter for AI Coach.
 * Removes markdown hashes (###), asterisks (**bold** and *), and robotic system text.
 */
export function formatCleanCoachResponse(raw: string): string {
  if (!raw) return ''
  let text = raw
  // Remove markdown headers like ### or ## or #
  text = text.replace(/^#{1,6}\s*/gm, '')
  // Remove bold syntax **bold** -> bold
  text = text.replace(/\*{2}(.+?)\*{2}/g, '$1')
  // Replace leading star bullets * with clean •
  text = text.replace(/^\*\s+/gm, '• ')
  // Remove stray asterisks
  text = text.replace(/\*/g, '')
  // Clean robotic evidence lines
  text = text.replace(/Evidence:\s*Authenticated user database has 0 historical sessions\./gi, '')
  text = text.replace(/Evidence:\s*0 logged sets for .+/gi, '')
  text = text.replace(/Evidence:\s*Based on .+/gi, '')
  text = text.replace(/Evidence:\s*Grounded in .+/gi, '')
  text = text.replace(/\n{3,}/g, '\n\n')
  return text.trim()
}

/**
 * Enhanced AI Coach Question Resolver
 * Real data grounding + embedded video demonstrations + structured clean formatting.
 */
export async function askCoachQuestion(
  query: string,
  analysis: StructuredWorkoutAnalysis,
  context?: StructuredCoachContext | null,
  userId?: string | null
): Promise<CoachAnswer> {
  const cleanQuery = query.trim().toLowerCase()

  // 0. Check for Workout Logging Intent
  const pendingLog = parseWorkoutLoggingQuery(cleanQuery)
  if (pendingLog) {
    return {
      content: formatCleanCoachResponse(
        `Here is what I understood:\n\n${pendingLog.exerciseName}\n• ${pendingLog.weight} kg\n• ${pendingLog.reps} reps\n• ${pendingLog.sets} sets\n\nConfirm and log?`
      ),
      supportingData: 'Workout logging parser',
      pendingLog,
      suggestedQuestions: ['Confirm', 'Cancel']
    }
  }

  const intent = classifyQueryIntent(cleanQuery)

  // 1. Safety Guardrail
  if (intent === 'safety') {
    return {
      content: formatCleanCoachResponse(
        `Safety Advisory\n\nGYMTrack AI Coach is a fitness assistant, not a physician or licensed medical provider.\n\nIf you are experiencing sharp, localized, or persistent pain, joint swelling, or suspect a musculoskeletal injury, stop training immediately and consult a qualified healthcare professional.\n\nKey Safety Rules:\n• Never attempt to train through acute joint pain.\n• Pain is neurological feedback protecting connective tissue.\n• Progression requires maintaining joint health and recovery capacity.`
      ),
      supportingData: 'Safety protocol applied.',
      suggestedQuestions: [
        'What should I train today?',
        'How do I do bench press?',
        'What did I train this week?'
      ]
    }
  }

  // 2. Try Supabase Edge Function if connected
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session && navigator.onLine) {
      const edgeResponse = await supabase.functions.invoke('ai-coach', {
        body: {
          messages: [{ role: 'user', content: query }],
          context: context || {
            hasData: analysis.hasData,
            totalWorkouts: analysis.totalWorkouts,
            recentVolume: analysis.recentVolume,
            previousVolume: analysis.previousVolume
          }
        }
      })

      if (!edgeResponse.error && edgeResponse.data?.content) {
        let edgeContent = edgeResponse.data.content as string
        edgeContent = edgeContent.replace(/[\u2605\u2606\u2726\u2727]|\p{Extended_Pictographic}/gu, '').trim()
        
        // Check if query was exercise instruction, attach video guidance
        const matchedSlug = findMatchedExerciseSlug(cleanQuery)
        let structuredGuidance: StructuredExerciseGuidance | undefined
        if (matchedSlug) {
          const media = resolveExerciseMedia(matchedSlug)
          const details = get_exercise_details(matchedSlug)
          if (details) {
            structuredGuidance = {
              type: 'exercise_guidance',
              exercise: { name: details.name, slug: details.slug },
              targetMuscles: [details.target_muscle, ...details.secondary_muscles],
              steps: details.instructions,
              mistakes: details.common_mistakes,
              tip: details.tips[0] || 'Maintain full range of motion.',
              media
            }
          }
        }

        let pendingFoodLog: PendingFoodLogPayload | undefined
        if (edgeResponse.data?.proposed_meal) {
          const pm = edgeResponse.data.proposed_meal
          pendingFoodLog = {
            foodName: pm.food_name || pm.meal_name,
            mealType: pm.meal_type || 'dinner',
            servingSize: Number(pm.serving_size) || 1,
            servingUnit: pm.serving_unit || 'serving',
            servingsLogged: 1,
            calories: Math.round(Number(pm.calories) || 0),
            protein: Math.round((Number(pm.protein) || 0) * 10) / 10,
            carbs: Math.round((Number(pm.carbs) || 0) * 10) / 10,
            fat: Math.round((Number(pm.fat) || 0) * 10) / 10,
            fiber: pm.fiber ? Math.round(Number(pm.fiber) * 10) / 10 : undefined,
            explanation: pm.explanation,
          }
        }

        return {
          content: formatCleanCoachResponse(edgeContent),
          supportingData: 'Response grounded in authenticated GYMTrack data.',
          structuredGuidance,
          pendingFoodLog,
        }
      }
    }
  } catch {
    // Edge function offline / key unconfigured; proceed to deterministic engine
  }

  // 3. Grounded Deterministic Intelligence Engine
  const rawAnswer = generateDeterministicAnswer(cleanQuery, analysis, context, userId)
  return {
    ...rawAnswer,
    content: formatCleanCoachResponse(rawAnswer.content)
  }
}

interface MealOption {
  name: string
  foodName: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  diet: 'vegan' | 'vegetarian' | 'eggetarian' | 'non_vegetarian'
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  portion: string
  servingSize: number
  servingUnit: string
  budget: 'budget' | 'moderate' | 'flexible'
  allergens: string[]
  explanation: string
}

const VERIFIED_MEALS: MealOption[] = [
  // Vegetarian & Vegan & Budget
  {
    name: 'Yellow Dal Tadka with Steamed Brown Rice',
    foodName: 'Yellow Dal Tadka with Brown Rice',
    mealType: 'lunch',
    diet: 'vegan',
    calories: 420,
    protein: 18,
    carbs: 68,
    fat: 7,
    fiber: 8,
    portion: '1 bowl dal (150g) + 1 cup rice (150g)',
    servingSize: 1,
    servingUnit: 'plate',
    budget: 'budget',
    allergens: [],
    explanation: 'Wholesome, budget-friendly plant protein with complete amino acid profile from dal + rice synergy.',
  },
  {
    name: 'Soya Chunks Masala with 2 Whole Wheat Rotis',
    foodName: 'Soya Chunks Masala with Rotis',
    mealType: 'dinner',
    diet: 'vegan',
    calories: 410,
    protein: 34,
    carbs: 48,
    fat: 8,
    fiber: 9,
    portion: '50g dry soya chunks cooked + 2 rotis (70g)',
    servingSize: 1,
    servingUnit: 'serving',
    budget: 'budget',
    allergens: ['Soy', 'Gluten / Wheat'],
    explanation: 'Extremely high protein density (34g protein) with minimal fat, ideal for muscle synthesis on a budget.',
  },
  {
    name: 'Chole (Chickpeas) with Quinoa & Green Salad',
    foodName: 'Chole with Quinoa',
    mealType: 'lunch',
    diet: 'vegan',
    calories: 440,
    protein: 19,
    carbs: 70,
    fat: 8,
    fiber: 12,
    portion: '1 bowl chole (180g) + 1 cup cooked quinoa',
    servingSize: 1,
    servingUnit: 'plate',
    budget: 'budget',
    allergens: [],
    explanation: 'Complex carbohydrates with slow glycemic release, high dietary fiber, and iron.',
  },
  {
    name: 'Tofu & Broccoli Stir Fry with Brown Rice',
    foodName: 'Tofu Broccoli Stir Fry',
    mealType: 'dinner',
    diet: 'vegan',
    calories: 390,
    protein: 24,
    carbs: 46,
    fat: 12,
    fiber: 7,
    portion: '150g firm tofu + 100g broccoli + 100g rice',
    servingSize: 1,
    servingUnit: 'bowl',
    budget: 'moderate',
    allergens: ['Soy'],
    explanation: 'Lean plant protein with micronutrient-dense cruciferous greens and low sodium.',
  },
  // Vegetarian (Dairy-based)
  {
    name: 'Paneer Bhurji with 2 Whole Wheat Phulkas',
    foodName: 'Paneer Bhurji with Rotis',
    mealType: 'dinner',
    diet: 'vegetarian',
    calories: 460,
    protein: 26,
    carbs: 36,
    fat: 22,
    fiber: 6,
    portion: '120g low-fat paneer + 2 phulkas',
    servingSize: 1,
    servingUnit: 'plate',
    budget: 'moderate',
    allergens: ['Dairy / Lactose', 'Gluten / Wheat'],
    explanation: 'Rich in slow-digesting casein protein, ideal for overnight muscle repair.',
  },
  {
    name: 'Greek Yogurt Power Bowl with Honey & Chia Seeds',
    foodName: 'Greek Yogurt Bowl with Chia',
    mealType: 'breakfast',
    diet: 'vegetarian',
    calories: 310,
    protein: 23,
    carbs: 32,
    fat: 9,
    fiber: 5,
    portion: '200g Greek yogurt + 1 tbsp chia + 1 tsp honey',
    servingSize: 1,
    servingUnit: 'bowl',
    budget: 'moderate',
    allergens: ['Dairy / Lactose'],
    explanation: 'High bio-availability dairy protein with gut-friendly probiotics and omega-3s.',
  },
  {
    name: 'Rolled Oats Porridge with Whey & Almonds',
    foodName: 'Whey Protein Oatmeal Bowl',
    mealType: 'breakfast',
    diet: 'vegetarian',
    calories: 420,
    protein: 35,
    carbs: 48,
    fat: 9,
    fiber: 7,
    portion: '50g oats + 1 scoop whey (30g) + 10g almonds',
    servingSize: 1,
    servingUnit: 'bowl',
    budget: 'moderate',
    allergens: ['Dairy / Lactose', 'Tree Nuts'],
    explanation: 'Sustained energy release from beta-glucan oats with rapid whey amino acid absorption.',
  },
  // Eggetarian
  {
    name: 'Egg Bhurji (3 Whole Eggs + 2 Whites) with 2 Rotis',
    foodName: 'Egg Bhurji with Whole Wheat Rotis',
    mealType: 'dinner',
    diet: 'eggetarian',
    calories: 430,
    protein: 32,
    carbs: 34,
    fat: 16,
    fiber: 5,
    portion: '3 eggs + 2 whites scrambled with onions & tomato + 2 rotis',
    servingSize: 1,
    servingUnit: 'plate',
    budget: 'budget',
    allergens: ['Eggs', 'Gluten / Wheat'],
    explanation: 'Gold standard complete protein with choline, leucine, and essential micronutrients.',
  },
  {
    name: 'Hard Boiled Eggs (3) with Multigrain Toast & Fruit',
    foodName: 'Boiled Eggs with Toast',
    mealType: 'breakfast',
    diet: 'eggetarian',
    calories: 360,
    protein: 24,
    carbs: 32,
    fat: 15,
    fiber: 4,
    portion: '3 large boiled eggs + 2 slices toast + 1 apple',
    servingSize: 1,
    servingUnit: 'serving',
    budget: 'budget',
    allergens: ['Eggs', 'Gluten / Wheat'],
    explanation: 'Balanced morning meal providing steady satiety and muscular fuel.',
  },
  // Non-Vegetarian
  {
    name: 'Grilled Chicken Breast with Steamed Brown Rice & Veggies',
    foodName: 'Grilled Chicken Breast with Rice',
    mealType: 'lunch',
    diet: 'non_vegetarian',
    calories: 470,
    protein: 52,
    carbs: 44,
    fat: 8,
    fiber: 5,
    portion: '180g cooked chicken breast + 150g brown rice + mixed veggies',
    servingSize: 1,
    servingUnit: 'plate',
    budget: 'moderate',
    allergens: [],
    explanation: 'Leanest animal protein with 52g protein and only 8g fat, ideal for muscle synthesis or fat loss.',
  },
  {
    name: 'Pan-Seared Salmon Fillet with Quinoa & Asparagus',
    foodName: 'Pan-Seared Salmon with Quinoa',
    mealType: 'dinner',
    diet: 'non_vegetarian',
    calories: 490,
    protein: 42,
    carbs: 32,
    fat: 21,
    fiber: 5,
    portion: '160g wild salmon + 100g quinoa + asparagus',
    servingSize: 1,
    servingUnit: 'plate',
    budget: 'flexible',
    allergens: ['Fish / Shellfish'],
    explanation: 'Packed with anti-inflammatory EPA/DHA Omega-3 fatty acids for joint and recovery support.',
  },
  {
    name: 'Chicken Tikka Wrap with Mint Yogurt Spread',
    foodName: 'Lean Chicken Tikka Wrap',
    mealType: 'dinner',
    diet: 'non_vegetarian',
    calories: 440,
    protein: 40,
    carbs: 38,
    fat: 12,
    fiber: 4,
    portion: '150g roasted chicken breast in whole wheat wrap',
    servingSize: 1,
    servingUnit: 'wrap',
    budget: 'moderate',
    allergens: ['Dairy / Lactose', 'Gluten / Wheat'],
    explanation: 'Convenient, flavorful high-protein dinner fitting cleanly in an evening macro budget.',
  },
]

function generateDeterministicNutritionAnswer(
  query: string,
  intent: QueryIntent,
  context?: StructuredCoachContext | null,
  _userId?: string | null
): CoachAnswer {
  const q = query.trim().toLowerCase()
  const nutrition = context?.nutrition
  const goals = nutrition?.goals || {
    calorie_target: 2000,
    protein_target: 150,
    carb_target: 200,
    fat_target: 65,
    fiber_target: 30,
    water_target: 2500,
  }
  const today = nutrition?.today || {
    date: new Date().toISOString().split('T')[0],
    consumed_calories: 0,
    consumed_protein: 0,
    consumed_carbs: 0,
    consumed_fat: 0,
    consumed_fiber: 0,
    remaining_calories: goals.calorie_target,
    remaining_protein: goals.protein_target,
    remaining_carbs: goals.carb_target,
    remaining_fat: goals.fat_target,
    meals_count: 0,
    logged_meals: [],
  }
  const dietary = nutrition?.dietary_profile || {
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

  // ─── 1. Yesterday Summary ───────────────────────────────────────────────
  if (q.includes('yesterday')) {
    const y = nutrition?.yesterday
    if (y && y.meals_count > 0) {
      return {
        content: `Yesterday's Nutrition Summary\n\n` +
          `Here is your intake from yesterday (${y.date}):\n\n` +
          `• Calories: ${y.consumed_calories.toLocaleString()} kcal\n` +
          `• Protein: ${y.consumed_protein}g\n` +
          `• Carbohydrates: ${y.consumed_carbs}g\n` +
          `• Fat: ${y.consumed_fat}g\n` +
          `• Logged Meals: ${y.meals_count} recorded session(s)\n\n` +
          `Compared to your daily target of ${goals.calorie_target} kcal and ${goals.protein_target}g protein.`,
        supportingData: `Recorded ${y.meals_count} meals yesterday.`,
        suggestedQuestions: [
          'What should I eat today?',
          'How much protein do I still need?',
          'Compare today with yesterday'
        ]
      }
    } else {
      return {
        content: `Yesterday's Nutrition Summary\n\n` +
          `No food entries were logged yesterday in your NutriTrack diary.\n\n` +
          `• Daily Targets: ${goals.calorie_target} kcal | ${goals.protein_target}g Protein\n\n` +
          `Tip: Consistent daily food logging builds streak analytics and enables long-term macro trend analysis.`,
        supportingData: '0 meals logged for yesterday.',
        suggestedQuestions: [
          'What should I eat today?',
          'How much protein do I still need?',
          'Review today\'s nutrition'
        ]
      }
    }
  }

  // ─── 2. Comparison: Today vs Yesterday ──────────────────────────────────
  if (intent === 'nutrition_comparison' || q.includes('compare')) {
    const y = nutrition?.yesterday || { consumed_calories: 0, consumed_protein: 0 }
    const calDiff = today.consumed_calories - y.consumed_calories
    const proDiff = Math.round((today.consumed_protein - y.consumed_protein) * 10) / 10

    return {
      content: `Nutrition Comparison: Today vs Yesterday\n\n` +
        `• Today: ${today.consumed_calories.toLocaleString()} kcal | ${today.consumed_protein}g protein (${today.meals_count} meals logged)\n` +
        `• Yesterday: ${y.consumed_calories.toLocaleString()} kcal | ${y.consumed_protein}g protein\n\n` +
        `Delta Analysis:\n` +
        `• Calorie Change: ${calDiff >= 0 ? `+${calDiff}` : calDiff} kcal\n` +
        `• Protein Change: ${proDiff >= 0 ? `+${proDiff}` : proDiff}g\n\n` +
        `Remaining Budget Today: ${today.remaining_calories.toLocaleString()} kcal | ${today.remaining_protein}g protein.`,
      supportingData: 'Intake comparison computed from diary telemetry.',
      suggestedQuestions: [
        'What should I eat for dinner?',
        'How much protein do I still need?',
        'What should I train today?'
      ]
    }
  }

  // ─── 3. Today's Summary ─────────────────────────────────────────────────
  if (intent === 'nutrition_summary' || q.includes('summarize') || q.includes('review')) {
    if (today.meals_count > 0) {
      const mealList = today.logged_meals
        .map(m => `• ${m.meal_type.toUpperCase()}: ${m.food_name} — ${m.calories} kcal (${m.protein}g P, ${m.carbs}g C, ${m.fat}g F)`)
        .join('\n')

      return {
        content: `Today's Nutrition Summary\n\n` +
          `Based on your authentic NutriTrack diary for today (${today.date}):\n\n` +
          `• Calories: ${today.consumed_calories.toLocaleString()} / ${goals.calorie_target.toLocaleString()} kcal (${today.remaining_calories.toLocaleString()} kcal left)\n` +
          `• Protein: ${today.consumed_protein}g / ${goals.protein_target}g (${today.remaining_protein}g left)\n` +
          `• Carbohydrates: ${today.consumed_carbs}g / ${goals.carb_target}g (${today.remaining_carbs}g left)\n` +
          `• Fat: ${today.consumed_fat}g / ${goals.fat_target}g (${today.remaining_fat}g left)\n\n` +
          `Logged Meals Today (${today.meals_count}):\n` +
          mealList + `\n\n` +
          (today.remaining_protein > 20
            ? `Recommendation: You still have ${today.remaining_protein}g of protein remaining. Consider a high-protein dinner or snack to reach your goal.`
            : `Great job! You have nearly met or achieved your protein target today.`),
        supportingData: `${today.meals_count} meals logged today.`,
        suggestedQuestions: [
          'What should I eat next?',
          'Suggest a high-protein snack',
          'What should I train today?'
        ]
      }
    } else {
      return {
        content: `Today's Nutrition Summary\n\n` +
          `No meals have been logged yet for today (${today.date}).\n\n` +
          `• Configured Calorie Target: ${goals.calorie_target.toLocaleString()} kcal\n` +
          `• Configured Protein Target: ${goals.protein_target}g\n` +
          `• Remaining Budget: ${goals.calorie_target.toLocaleString()} kcal & ${goals.protein_target}g protein\n\n` +
          `Ready to log your first meal! Tap "Log a Meal" on the NutriTrack dashboard or ask "What should I eat for breakfast?"`,
        supportingData: '0 logged meals today.',
        suggestedQuestions: [
          'What should I eat today?',
          'Suggest a high-protein vegetarian meal',
          'What should I train today?'
        ]
      }
    }
  }

  // ─── 4. Macro & Budget Queries ──────────────────────────────────────────
  if (intent === 'nutrition_macro_budget') {
    const isProteinMet = today.remaining_protein <= 0
    const isCalorieClose = today.remaining_calories < 250

    return {
      content: `Daily Nutritional Budget Status\n\n` +
        `Here is your authentic remaining macro balance for today:\n\n` +
        `• Calories: ${today.consumed_calories.toLocaleString()} / ${goals.calorie_target.toLocaleString()} kcal (${today.remaining_calories.toLocaleString()} kcal remaining)\n` +
        `• Protein: ${today.consumed_protein}g / ${goals.protein_target}g (${today.remaining_protein}g remaining)\n` +
        `• Carbohydrates: ${today.consumed_carbs}g / ${goals.carb_target}g (${today.remaining_carbs}g remaining)\n` +
        `• Fat: ${today.consumed_fat}g / ${goals.fat_target}g (${today.remaining_fat}g remaining)\n\n` +
        (isProteinMet
          ? `Status: You have hit your protein target for today (${today.consumed_protein}g)! Keep your remaining intake within your calorie cap.`
          : isCalorieClose
          ? `Budget Alert: You have ${today.remaining_calories} kcal remaining but still need ${today.remaining_protein}g protein. Focus on lean, ultra-high protein choices (e.g. egg whites, whey isolate, or low-fat Greek yogurt) to minimize additional caloric intake.`
          : `Guidance: You need ${today.remaining_protein}g more protein to hit your daily target. A meal containing ~30g of protein fits comfortably within your ${today.remaining_calories} kcal budget.`),
      supportingData: `Grounded in your ${goals.calorie_target} kcal / ${goals.protein_target}g targets.`,
      suggestedQuestions: [
        'What should I eat for dinner?',
        'Suggest a high-protein meal',
        'Review today\'s nutrition'
      ]
    }
  }

  // ─── 5. Goal Advice (Bulking, Cutting, Rest Days) ────────────────────────
  if (q.includes('gain muscle') || (q.includes('muscle') && q.includes('eat'))) {
    return {
      content: `Nutrition for Muscle Gain (Hypertrophy)\n\n` +
        `To maximize muscle protein synthesis and tissue hypertrophy while minimizing fat accumulation:\n\n` +
        `• Caloric Balance: Aim for a controlled surplus of 250–350 kcal above your daily maintenance.\n` +
        `• Protein Intake: 1.6 to 2.2g of protein per kilogram of body weight spread across 3–5 feedings.\n` +
        `• Carbohydrate Fueling: Ample complex carbohydrates (rice, oats, sweet potatoes) around workout windows to replenish glycogen.\n` +
        `• Hydration: At least 2.5 to 3.5 liters of water daily for cellular volumization.\n\n` +
        `Your Current Targets: ${goals.calorie_target} kcal | ${goals.protein_target}g Protein.`,
      supportingData: 'Exercise physiology principles of hypertrophy.',
      suggestedQuestions: [
        'What should I eat today?',
        'Suggest a post-workout meal',
        'What should I train today?'
      ]
    }
  }

  if (q.includes('lose fat') || q.includes('cut')) {
    return {
      content: `Nutrition for Fat Loss & Muscle Preservation\n\n` +
        `To lose adipose tissue while preserving lean contractile muscle mass:\n\n` +
        `• Caloric Deficit: A moderate deficit of 300–500 kcal below maintenance.\n` +
        `• Elevated Protein: Keep protein high (2.0–2.4g per kg) to prevent catabolism and enhance satiety.\n` +
        `• High Volume Foods: Fibrous greens, vegetables, and whole foods with high satiety index.\n` +
        `• Progressive Overload: Continue heavy resistance training to signal the body to retain muscle tissue.\n\n` +
        `Your Current Targets: ${goals.calorie_target} kcal | ${goals.protein_target}g Protein.`,
      supportingData: 'Principles of body recomposition and energy balance.',
      suggestedQuestions: [
        'What should I eat for dinner?',
        'How much protein do I still need?',
        'What should I train today?'
      ]
    }
  }

  if (q.includes('rest day')) {
    return {
      content: `Rest Day Nutrition Strategy\n\n` +
        `On non-training recovery days, your body repairs microtrauma and builds new muscle fibers:\n\n` +
        `• Maintain Protein: Keep your protein intake identical to training days (${goals.protein_target}g) to support 24-48h recovery.\n` +
        `• Moderate Carbohydrates: Since energy expenditure is slightly lower without a training session, you can reduce direct workout carbs by 15–20%.\n` +
        `• Healthy Fats: Include omega-3 sources (salmon, walnuts, chia seeds) to modulate systemic inflammation.\n\n` +
        `Remaining Today: ${today.remaining_calories.toLocaleString()} kcal and ${today.remaining_protein}g protein.`,
      supportingData: 'Recovery & nutrient timing guidelines.',
      suggestedQuestions: [
        'What should I eat today?',
        'How much protein do I still need?',
        'What should I train tomorrow?'
      ]
    }
  }

  // ─── 6. Personalized Meal Recommendation (What Should I Eat?) ────────────
  // Determine target meal type
  let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'dinner'
  if (q.includes('breakfast')) mealType = 'breakfast'
  else if (q.includes('lunch')) mealType = 'lunch'
  else if (q.includes('snack')) mealType = 'snack'
  else {
    const hour = new Date().getHours()
    if (hour < 11) mealType = 'breakfast'
    else if (hour < 16) mealType = 'lunch'
    else mealType = 'dinner'
  }

  // Determine user diet preference
  let effectiveDiet = dietary.dietary_preference || 'non_vegetarian'
  if (q.includes('vegetarian') && !q.includes('non-veg')) effectiveDiet = 'vegetarian'
  if (q.includes('vegan')) effectiveDiet = 'vegan'
  if (q.includes('egg') && !q.includes('chicken')) effectiveDiet = 'eggetarian'

  // Filter available verified meals
  const allergies = dietary.allergies || []
  const availableMeals = VERIFIED_MEALS.filter(m => {
    // 1. Dietary filter
    if (effectiveDiet === 'vegan' && m.diet !== 'vegan') return false
    if (effectiveDiet === 'vegetarian' && m.diet !== 'vegetarian' && m.diet !== 'vegan') return false
    if (effectiveDiet === 'eggetarian' && m.diet !== 'eggetarian' && m.diet !== 'vegetarian' && m.diet !== 'vegan') return false

    // 2. Allergen filter: Never recommend foods matching user allergens
    for (const allergen of allergies) {
      if (m.allergens.includes(allergen)) return false
    }

    return true
  })

  // Find preferred meal: prefer matching mealType, then matching budget
  const isBudgetRequested = q.includes('affordable') || q.includes('budget') || dietary.food_budget === 'budget'
  let matchedMeal = availableMeals.find(m => m.mealType === mealType && (!isBudgetRequested || m.budget === 'budget'))
  if (!matchedMeal) {
    matchedMeal = availableMeals.find(m => !isBudgetRequested || m.budget === 'budget') || availableMeals[0]
  }

  if (!matchedMeal) {
    matchedMeal = VERIFIED_MEALS[0]
  }

  const pendingFoodLog: PendingFoodLogPayload = {
    foodName: matchedMeal.foodName,
    mealType: mealType,
    servingSize: matchedMeal.servingSize,
    servingUnit: matchedMeal.servingUnit,
    servingsLogged: 1,
    calories: matchedMeal.calories,
    protein: matchedMeal.protein,
    carbs: matchedMeal.carbs,
    fat: matchedMeal.fat,
    fiber: matchedMeal.fiber,
    explanation: matchedMeal.explanation,
  }

  return {
    content: `Personalized ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recommendation\n\n` +
      `Based on your authentic intake (${today.consumed_calories} / ${goals.calorie_target} kcal consumed, ${today.remaining_protein}g protein remaining) and configured ${effectiveDiet.replace('_', '-')} preference:\n\n` +
      `Recommended Meal:\n` +
      `• **${matchedMeal.name}**\n` +
      `• Serving Size: ${matchedMeal.portion}\n` +
      `• Estimated Nutrition: **${matchedMeal.calories} kcal | ${matchedMeal.protein}g Protein | ${matchedMeal.carbs}g Carbs | ${matchedMeal.fat}g Fat**\n\n` +
      `Why This Fits:\n` +
      `• ${matchedMeal.explanation}\n` +
      `• Fits within your remaining ${today.remaining_calories.toLocaleString()} kcal daily budget.\n` +
      (allergies.length > 0 ? `• Verified allergen-free for your configured restrictions (${allergies.join(', ')}).\n` : '') +
      `\nYou can review and log this meal directly into your NutriTrack food diary with one click below:`,
    supportingData: `Personalized to ${effectiveDiet} diet with ${today.remaining_calories} kcal remaining.`,
    pendingFoodLog,
    suggestedQuestions: [
      'Suggest another option',
      'How much protein do I still need?',
      'What should I train today?'
    ]
  }
}

function generateDeterministicAnswer(
  query: string,
  analysis: StructuredWorkoutAnalysis,
  context?: StructuredCoachContext | null,
  userId?: string | null
): CoachAnswer {
  const intent = classifyQueryIntent(query)

  // ─── Nutrition Intents (Phases 5, 6, 7, 8, 11) ────────────────────────────
  if (
    intent === 'nutrition_what_to_eat' ||
    intent === 'nutrition_macro_budget' ||
    intent === 'nutrition_summary' ||
    intent === 'nutrition_comparison' ||
    intent === 'nutrition_post_workout' ||
    intent === 'nutrition_advice'
  ) {
    return generateDeterministicNutritionAnswer(query, intent, context, userId)
  }

  // ─── A. Exercise Alternatives ──────────────────────────────────────────────
  if (intent === 'exercise_alternative' || query.includes('replace') || query.includes('instead of') || query.includes('substitute')) {
    // Identify target exercise to replace
    let targetName: string | null = null
    const matchedSlug = findMatchedExerciseSlug(query)
    if (matchedSlug) {
      const match = DEFAULT_EXERCISES.find(e => e.slug === matchedSlug)
      if (match) targetName = match.name
    } else if (query.includes('this exercise') || query.includes('replace this')) {
      targetName = context?.active_plan?.next_uncompleted_exercise || null
    }

    if (!targetName && query.includes('squat')) targetName = 'Squat'
    if (!targetName && query.includes('bench')) targetName = 'Bench Press'

    const targetEx = targetName 
      ? DEFAULT_EXERCISES.find(e => e.name.toLowerCase().includes(targetName!.toLowerCase()))
      : null

    if (targetEx) {
      const alternatives = DEFAULT_EXERCISES
        .filter(e => e.muscle_group === targetEx.muscle_group && e.slug !== targetEx.slug)
        .slice(0, 3)

      if (alternatives.length > 0) {
        return {
          content: `${targetEx.name} Substitutions\n\n` +
            `If you need to substitute **${targetEx.name}** due to equipment availability, comfort, or joint load, these movements stimulate the same primary muscle group (${targetEx.muscle_group.toUpperCase()}):\n\n` +
            `Recommended Alternatives:\n` +
            alternatives.map(a => `• **${a.name}**: ${a.description}`).join('\n\n') +
            `\n\nRecommendation:\nSelect the variation matching your available gym equipment while matching the target rep range.`,
          supportingData: `Biomechanically equivalent alternatives for ${targetEx.name}.`,
          structuredRecommendation: {
            type: 'workout_recommendation',
            focus: `${targetEx.name} Substitutions`,
            reasoning: `Equivalent movements targeting ${targetEx.primary_muscle || targetEx.muscle_group}.`,
            exercises: alternatives.map(a => ({
              name: a.name,
              slug: a.slug,
              sets: 3,
              reps: '8-12 reps',
              media: resolveExerciseMedia(a.slug)
            })),
            coachInsight: 'Ensure controlled tempo on the eccentric phase to maximize muscle fiber tension.'
          },
          suggestedQuestions: [
            `How do I do ${alternatives[0]?.name}?`,
            'What should I train today?',
            'What exercise is next?'
          ]
        }
      }
    }
  }

  // ─── B. Exercise Instruction & Demonstration Video ────────────────────────
  const matchedSlug = findMatchedExerciseSlug(query)
  if (intent === 'exercise_instruction' || matchedSlug) {
    const slug = matchedSlug || 'bench-press'
    const guide = TECHNIQUE_GUIDES[slug]
    const details = get_exercise_details(slug)
    const media = resolveExerciseMedia(slug)

    const exerciseName = guide?.name || details?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const targetMuscles = details?.target_muscle 
      ? [details.target_muscle, ...(details.secondary_muscles || [])] 
      : [guide?.targetMuscles || 'Primary Working Muscles']
    const equipment = details?.equipment ? details.equipment.join(', ') : (guide?.equipment || 'Gym Equipment')
    const steps = details?.instructions || guide?.execution || [
      'Set up with proper posture and stable base of support.',
      'Execute the movement with controlled tempo through full range of motion.',
      'Lower under complete control back to starting point.'
    ]
    const mistakes = details?.common_mistakes || guide?.commonMistakes || [
      'Using momentum instead of controlled contraction',
      'Rushing the eccentric lowering phase'
    ]
    const breathing = guide?.breathing || 'Inhale during the lowering phase; exhale forcefully on exertion.'
    const tip = details?.tips?.[0] || guide?.tips?.[0] || 'Focus on mind-muscle connection and clean repetition cadence.'

    // Check user's actual history on this exercise
    const userEx = context?.exercise_history.find(e => e.exercise_name.toLowerCase().includes(exerciseName.toLowerCase()) || exerciseName.toLowerCase().includes(e.exercise_name.toLowerCase()))

    let evidenceLine = 'Evidence: Grounded in standard biomechanical exercise principles.'
    if (userEx && userEx.total_sessions > 0) {
      evidenceLine = `Evidence: Based on your ${userEx.total_sessions} logged ${exerciseName} session(s) (best 1RM: ${userEx.best_1rm} kg).`
    }

    let content = `${exerciseName}\n\n` +
      `Targets: ${targetMuscles.join(', ')}\n` +
      `Equipment: ${equipment}\n\n` +
      `How to perform:\n`
    steps.forEach((s, i) => { content += `${i + 1}. ${s}\n` })
    content += `\nBreathing:\n${breathing}\n\n`
    content += `Common mistakes:\n`
    mistakes.forEach(m => { content += `• ${m}\n` })
    content += `\nCoach tip:\n${tip}\n\n`
    content += `${evidenceLine}`

    return {
      content,
      imageUrl: media?.thumbnailUrl || media?.posterUrl,
      structuredGuidance: {
        type: 'exercise_guidance',
        exercise: { name: exerciseName, slug },
        targetMuscles,
        steps,
        mistakes,
        tip,
        media
      },
      supportingData: `Verified exercise demonstration for ${exerciseName}.`,
      suggestedQuestions: [
        'What should I train today?',
        'How many sets should I do?',
        'What weight should I use?'
      ]
    }
  }

  // ─── C. History Lookup: "What did I train today?" ──────────────────────────
  if (query.includes('today') && (query.includes('what did i train') || query.includes('what did i do') || query.includes('my workout today') || query.includes('what i logged'))) {
    const todayData = context?.today_workouts
    if (todayData && todayData.sets_count > 0) {
      const exList = todayData.exercises_names.length > 0 ? todayData.exercises_names.join(', ') : 'logged exercises'
      return {
        content: `Today's Training Summary\n\n` +
          `You have logged active training today:\n\n` +
          `Key Metrics:\n` +
          `• Exercises: ${todayData.exercises_count} (${exList})\n` +
          `• Sets Completed: ${todayData.sets_count} sets\n` +
          `• Volume Lifted: ${todayData.volume_kg.toLocaleString()} kg\n` +
          `• Duration: ${todayData.duration_minutes} minutes\n\n` +
          `Recommendation:\nGreat work on today's session. Ensure adequate hydration and protein intake to support muscle protein synthesis.\n\n` +
          `Evidence: Based on your local calendar day logged sets in GYMTrack.`,
        supportingData: `Today: ${todayData.exercises_count} exercises, ${todayData.sets_count} sets, ${todayData.volume_kg} kg.`,
        suggestedQuestions: [
          'Is my volume increasing?',
          'What was my best bench press?',
          'What should I train tomorrow?'
        ]
      }
    } else {
      return {
        content: `Today's Training\n\n` +
          `You have not logged any workout sessions today yet.\n\n` +
          `Key Points:\n` +
          `• Today's metrics start from 0 at local midnight.\n` +
          `• As soon as you log an exercise manually or by voice, your exercises, sets, and volume will update instantly.\n\n` +
          `Recommendation:\n` +
          `Would you like a recommendation on what to train today based on your recovery?`,
        supportingData: 'Zero workouts recorded today.',
        suggestedQuestions: [
          'What should I train today?',
          'How do I do bench press?',
          'What did I train this week?'
        ]
      }
    }
  }

  // ─── D. History Lookup: "What did I train this week?" / Recent Sessions ───
  if (query.includes('this week') || query.includes('what did i train') || query.includes('last workout') || query.includes('how many workouts')) {
    const recents = context?.recent_workouts || []
    if (recents.length > 0) {
      let content = `Recent Training Log\n\nHere are your recorded workout sessions:\n\n`
      recents.slice(0, 4).forEach((s, idx) => {
        const exList = s.exercises.length > 0 ? s.exercises.join(', ') : `${s.exercises_count} exercises`
        content += `${idx + 1}. ${s.name} (${s.date.split('T')[0]})\n`
        content += `   • Volume: ${s.total_volume.toLocaleString()} kg across ${exList}\n`
        content += `   • Duration: ${s.duration_minutes} min\n\n`
      })
      content += `Recommendation:\nReview detailed set progressions and charts in your Progress tab anytime.\n\n`
      content += `Evidence: Based on ${recents.length} logged sessions in your database.`

      return {
        content,
        supportingData: `Based on ${recents.length} actual logged sessions.`,
        suggestedQuestions: [
          'Is my volume increasing?',
          'Which muscle group am I neglecting?',
          'What should I train today?'
        ]
      }
    } else {
      return {
        content: `No Workouts Logged Yet\n\n` +
          `You don't have any completed workouts recorded in your account yet.\n\n` +
          `Action:\n` +
          `Log your first session using the "+ Log Training" button or explore exercises in the Library. Once logged, your history and volume will be recorded automatically.\n\n` +
          `Evidence: Authenticated user database has 0 historical sessions.`,
        supportingData: 'No logged workout sessions yet.',
        suggestedQuestions: [
          'What should I train today?',
          'How do I do bench press?',
          'How do I do a squat?'
        ]
      }
    }
  }

  // ─── E. Personal Records: "What was my best bench press?" ──────────────────
  if (intent === 'personal_record' || query.includes('best') || query.includes('pr') || query.includes('record')) {
    const prs = context?.personal_records || []
    const matchedExSlug = findMatchedExerciseSlug(query)

    if (matchedExSlug) {
      const exDetails = get_exercise_details(matchedExSlug)
      const exName = exDetails?.name || matchedExSlug.replace(/-/g, ' ')
      const matchedPr = prs.find(p => p.exercise.toLowerCase().includes(exName.toLowerCase()) || exName.toLowerCase().includes(p.exercise.toLowerCase()))
      const histEx = context?.exercise_history.find(e => e.exercise_name.toLowerCase().includes(exName.toLowerCase()) || exName.toLowerCase().includes(e.exercise_name.toLowerCase()))

      if (matchedPr || (histEx && histEx.best_1rm > 0)) {
        const bestVal = matchedPr ? `${matchedPr.value} ${matchedPr.unit}` : `${histEx?.best_weight || histEx?.best_1rm} kg`
        const best1rm = histEx?.best_1rm ? `${histEx.best_1rm} kg` : bestVal
        return {
          content: `Personal Best: ${exName}\n\n` +
            `Your recorded peak performance for ${exName}:\n\n` +
            `Key Points:\n` +
            `• Best Working Set: ${bestVal}\n` +
            `• Estimated 1RM Peak: ${best1rm}\n` +
            `• Sessions Logged: ${histEx?.total_sessions || 1}\n\n` +
            `Recommendation:\n` +
            `In your next ${exName} session, focus on clean bar speed at ~80-85% before attempting a new PR load.\n\n` +
            `Evidence: Based on your recorded workout session sets in GYMTrack.`,
          supportingData: `PR: ${bestVal} for ${exName}.`,
          suggestedQuestions: [
            `How do I do a ${exName}?`,
            'What should I train today?',
            'Is my volume increasing?'
          ]
        }
      } else {
        return {
          content: `You don't have enough ${exName} history yet to calculate a reliable progression.\n\n` +
            `Log your first ${exName} sets in the Library or Home to start tracking your working weights and estimated 1RM.`,
          supportingData: `No data for ${exName}.`,
          suggestedQuestions: [
            `How do I do ${exName}?`,
            'What should I train today?',
            'What exercises target chest?'
          ]
        }
      }
    }

    if (prs.length > 0) {
      let content = `Your Personal Records\n\n`
      prs.slice(0, 5).forEach(p => {
        content += `• ${p.exercise}: ${p.value} ${p.unit}\n`
      })
      content += `\nEvidence: Derived from your authenticated workout session sets.`
      return {
        content,
        supportingData: `${prs.length} PRs recorded.`,
        suggestedQuestions: [
          'What should I train today?',
          'Is my volume increasing?'
        ]
      }
    } else {
      return {
        content: `Personal Records\n\n` +
          `No personal records logged yet.\n\n` +
          `Once you record sets in your workouts, your top weights and estimated 1RMs will appear here.\n\n` +
          `Evidence: 0 completed workouts with load recorded.`,
        supportingData: 'No PRs recorded yet.'
      }
    }
  }

  // ─── F. Progress Analysis: "Is my volume increasing?" ──────────────────────
  if (intent === 'progress_analysis' || query.includes('volume increasing') || query.includes('progress')) {
    if (analysis.volumeChangePct !== null) {
      const isUp = analysis.volumeChangePct >= 0
      return {
        content: `Volume Progression Analysis\n\n` +
          `Comparing your training volume over the last 14 days against the prior 14 days:\n\n` +
          `Key Metrics:\n` +
          `• Current 14 Days: ${analysis.recentVolume.toLocaleString()} kg (${analysis.recentSessionsCount} sessions)\n` +
          `• Prior 14 Days: ${analysis.previousVolume.toLocaleString()} kg (${analysis.previousSessionsCount} sessions)\n` +
          `• Volume Delta: ${isUp ? `+${analysis.volumeChangePct}%` : `${analysis.volumeChangePct}%`}\n\n` +
          `Recommendation:\n` +
          `${isUp ? 'Your progressive overload is tracking upward smoothly. Ensure sleep and nutrition match your training demand.' : 'Volume has decreased slightly. If this is an intentional deload week, this is healthy; otherwise, aim to complete all scheduled sets.'}\n\n` +
          `Evidence: Based on comparative 14-day training periods in your account.`,
        supportingData: `14-day volume delta: ${analysis.volumeChangePct}%.`,
        suggestedQuestions: [
          'What should I train today?',
          'Which muscle group am I neglecting?',
          'How did I progress this week?'
        ]
      }
    } else if (analysis.recentSessionsCount === 0) {
      return {
        content: `Progress Analysis\n\n` +
          `I don't have enough workout history yet. Log a few sessions and I can give you more personalized guidance on your weekly progression.\n\n` +
          `Recommendation:\n` +
          `Once you record sets in the Library, Plans, or Home, your volume progression, consistency, and strength trends will automatically update here.\n\n` +
          `Evidence: 0 workout sessions recorded in your account.`,
        supportingData: 'Awaiting your first logged workout session.',
        suggestedQuestions: [
          'What should I train today?',
          'How do I do bench press?',
          'Explain progressive overload.'
        ]
      }
    } else {
      return {
        content: `Volume Progression Analysis\n\n` +
          `Not enough historical data for comparison.\n\n` +
          `Key Points:\n` +
          `• You have logged ${analysis.recentVolume.toLocaleString()} kg across ${analysis.recentSessionsCount} session(s) in the current cycle.\n` +
          `• A period-over-period percentage comparison requires at least 2 full cycles of training.\n\n` +
          `Recommendation:\n` +
          `Keep logging workouts consistently. Once you complete next week's sessions, automated percentage comparison will unlock.\n\n` +
          `Evidence: Insufficient historical baseline for multi-period comparison.`,
        supportingData: 'Not enough historical data for comparison.',
        suggestedQuestions: [
          'What should I train today?',
          'How do I do bench press?',
          'How many sets should I do?'
        ]
      }
    }
  }

  // ─── G1. Next Exercise in Active Plan ─────────────────────────────────────
  if (query.includes('next exercise') || query.includes('what is next') || query.includes('exercise is next') || query.includes("what's next")) {
    if (context?.active_plan?.has_active_plan) {
      const ap = context.active_plan
      if (ap.today_day_type === 'rest') {
        return {
          content: `Rest Day in Active Plan\n\nToday is a scheduled Recovery Day in your **${ap.plan_name}** plan (Week ${ap.current_week}).\n\nNo exercises are scheduled for today. Rest, hydrate, and prepare for your upcoming training session.`,
          supportingData: `Active Plan: ${ap.plan_name} (Week ${ap.current_week}, Rest Day)`,
          suggestedQuestions: ['Why is today a rest day?', 'How is my plan progressing?', 'What should I train tomorrow?']
        }
      }
      if (ap.next_uncompleted_exercise) {
        const exDef = DEFAULT_EXERCISES.find(e => e.name.toLowerCase() === ap.next_uncompleted_exercise?.toLowerCase())
        const slug = exDef?.slug || 'bench-press'
        return {
          content: `Next Exercise: ${ap.next_uncompleted_exercise}\n\n` +
            `Your active plan is **${ap.plan_name}** (Week ${ap.current_week}, ${ap.today_workout_name}).\n\n` +
            `Next scheduled movement:\n• **${ap.next_uncompleted_exercise}**\n\n` +
            `Current Session Progress:\n${ap.completed_count || 0} of ${ap.total_count || 0} exercises completed today.`,
          supportingData: `Next: ${ap.next_uncompleted_exercise} in ${ap.today_workout_name}`,
          structuredRecommendation: {
            type: 'workout_recommendation',
            focus: ap.today_workout_name || "Today's Session",
            reasoning: `Next exercise in your ${ap.plan_name} training schedule.`,
            exercises: [{
              name: ap.next_uncompleted_exercise,
              slug,
              sets: 3,
              reps: '8-12 reps',
              media: resolveExerciseMedia(slug)
            }],
            coachInsight: 'Focus on deliberate eccentric control and smooth tempo.'
          },
          suggestedQuestions: [`How do I do ${ap.next_uncompleted_exercise}?`, 'What should I train today?', 'Can I replace this exercise?']
        }
      } else if (ap.total_count && ap.total_count > 0 && ap.completed_count === ap.total_count) {
        return {
          content: `All Exercises Completed!\n\nOutstanding work! You have completed all **${ap.total_count}** exercises scheduled for today in **${ap.plan_name}** (${ap.today_workout_name}).\n\nTake time to hydrate, consume adequate protein, and rest for recovery.`,
          supportingData: `${ap.completed_count}/${ap.total_count} exercises completed today.`,
          suggestedQuestions: ['How is my plan progressing?', 'What did I train today?']
        }
      }
    }
  }

  // ─── G2. Rest Day Explanation ─────────────────────────────────────────────
  if (query.includes('rest day') || query.includes('why is today a rest') || query.includes('why rest')) {
    if (context?.active_plan?.has_active_plan) {
      const ap = context.active_plan
      return {
        content: `Active Plan Recovery Philosophy\n\n` +
          `Your active plan **${ap.plan_name}** (Week ${ap.current_week}) schedules dedicated rest days for neurological and muscular recovery.\n\n` +
          `Why Rest Days Matter:\n` +
          `• Muscle Protein Synthesis: Skeletal muscle adapts and hypertrophies during rest periods between sessions.\n` +
          `• Central Nervous System (CNS) Recovery: Heavy loading strains motor unit recruitment. Rest days prevent cumulative fatigue.\n` +
          `• Connective Tissue Remodeling: Tendons and ligaments adapt slower than muscle tissue and require restorative downtime.\n\n` +
          `Recommendation:\n` +
          `Engage in light 20–30 min walking, gentle mobility drills, and aim for 7–9 hours of sleep.`,
        supportingData: `Active Plan: ${ap.plan_name} recovery schedule.`,
        suggestedQuestions: ['What should I train tomorrow?', 'How is my plan progressing?', 'What did I train this week?']
      }
    }
  }

  // ─── G3. Plan Progression Status ──────────────────────────────────────────
  if (query.includes('plan progress') || query.includes('how is my plan') || (query.includes('my plan') && query.includes('progress'))) {
    if (context?.active_plan?.has_active_plan) {
      const ap = context.active_plan
      const remainingWeeks = Math.max(0, (ap.duration_weeks || 12) - (ap.current_week || 1))
      return {
        content: `Training Plan Progress\n\n` +
          `Plan: **${ap.plan_name}**\n` +
          `Goal: **${ap.goal ? ap.goal.replace(/_/g, ' ').toUpperCase() : 'GENERAL FITNESS'}**\n\n` +
          `Key Milestones:\n` +
          `• Current Timeline: Week ${ap.current_week} of ${ap.duration_weeks} weeks\n` +
          `• Remaining Schedule: ${remainingWeeks} weeks remaining\n` +
          `• Today: ${ap.today_workout_name} (${ap.today_day_type === 'rest' ? 'Rest Day' : `${ap.completed_count || 0}/${ap.total_count || 0} exercises completed`})\n\n` +
          `Recommendation:\n` +
          `Consistency is the primary driver of physical adaptation. Continue hitting scheduled working sets.`,
        supportingData: `Plan: ${ap.plan_name}, Week ${ap.current_week}/${ap.duration_weeks}.`,
        suggestedQuestions: ['What should I train today?', 'What exercise is next?', 'Is my volume increasing?']
      }
    }
  }

  // ─── G4. Workout Recommendation: "What should I train today?" ─────────────
  if (
    intent === 'workout_recommendation' ||
    query.includes('what should i train') ||
    query.includes('today workout') ||
    query.includes("today's workout") ||
    query.includes('what to train') ||
    query.includes('did chest yesterday') ||
    query.includes('trained chest yesterday') ||
    query.includes('recommend')
  ) {
    // Check if user has an active training plan
    if (context?.active_plan?.has_active_plan) {
      const ap = context.active_plan
      if (ap.today_day_type === 'rest' || !ap.today_planned_exercises || ap.today_planned_exercises.length === 0) {
        return {
          content: `Today's Schedule: Active Recovery\n\n` +
            `You are currently on Week ${ap.current_week} of **${ap.plan_name}**.\n\n` +
            `Today is designated as a **Rest & Recovery Day** in your structured training schedule.\n\n` +
            `Why Rest Today?\n` +
            `• Muscular hypertrophy and connective tissue remodeling occur during restorative downtime.\n` +
            `• Taking today off ensures optimal motor unit recruitment for your next scheduled training session.\n\n` +
            `Recommendation:\n` +
            `Engage in light 20–30 min walking, gentle foam rolling, and ensure adequate protein intake.`,
          supportingData: `Active Plan: ${ap.plan_name} (Week ${ap.current_week}, Rest Day).`,
          suggestedQuestions: [
            'Why is today a rest day?',
            'How is my plan progressing?',
            'What did I train this week?'
          ]
        }
      }

      // Today is a workout day in the active plan
      const exObjects = ap.today_planned_exercises.map(name => {
        const found = DEFAULT_EXERCISES.find(e => e.name.toLowerCase() === name.toLowerCase())
        const slug = found?.slug || 'bench-press'
        return {
          name,
          slug,
          sets: 3,
          reps: '8-12 reps',
          media: resolveExerciseMedia(slug)
        }
      })

      const completed = ap.completed_count || 0
      const total = ap.total_count || exObjects.length
      const remaining = Math.max(0, total - completed)

      let statusMsg = `Status: ${completed} of ${total} exercises logged today.`
      if (remaining > 0 && ap.next_uncompleted_exercise) {
        statusMsg += ` Next exercise up: **${ap.next_uncompleted_exercise}**.`
      } else if (remaining === 0) {
        statusMsg += ` All exercises for today are completed!`
      }

      return {
        content: `Today's recommendation\n\n` +
          `Based on your active plan ${ap.plan_name}, today's session is:\n\n` +
          `${ap.today_workout_name || 'Upper Body'}\n\n` +
          ap.today_planned_exercises.map((name, i) => {
            const isDone = ap.today_completed_exercises?.some(c => c.toLowerCase() === name.toLowerCase())
            return `${i + 1}. ${name}\n${isDone ? 'Completed' : '3 sets × 8–10 reps'}`
          }).join('\n\n') +
          `\n\nWhy this session:\n` +
          `Scheduled in Week ${ap.current_week} of ${ap.plan_name} to maintain your weekly progression.\n\n` +
          `If you have pain or an injury, stop and consult an appropriate professional.`,
        supportingData: `${statusMsg} Active Plan: ${ap.plan_name} (${completed}/${total} completed).`,
        structuredRecommendation: {
          type: 'workout_recommendation',
          focus: ap.today_workout_name || "Today's Session",
          reasoning: `Scheduled in Week ${ap.current_week} of ${ap.plan_name}.`,
          exercises: exObjects,
          coachInsight: 'Log your sets accurately to ensure automatic progressive overload tracking.'
        },
        suggestedQuestions: [
          'What exercise is next?',
          'How is my plan progressing?',
          'Can I replace this exercise?'
        ]
      }
    }

    const isChestYesterday = query.includes('chest') || (context?.recovery_context.last_session_muscle_groups.includes('chest'))
    let focus = 'Upper Body'
    let reasoning = 'Your recent training data shows that these muscle groups are due for training today.'
    let exercises = [
      { name: 'Bench Press', slug: 'bench-press', sets: 3, reps: '8–10 reps' },
      { name: 'Lat Pulldown', slug: 'lat-pulldown', sets: 3, reps: '8–12 reps' },
      { name: 'Dumbbell Shoulder Press', slug: 'shoulder-press', sets: 3, reps: '8–12 reps' },
      { name: 'Dumbbell Curl', slug: 'bicep-curl', sets: 3, reps: '10–12 reps' }
    ]

    if (isChestYesterday) {
      focus = 'Back and Biceps (Pull)'
      reasoning = 'Because you trained chest yesterday, your pushing muscles need 48 hours to recover and repair. Training back, lats, and biceps stimulates opposing muscles without interfering with chest recovery.'
      exercises = [
        { name: 'Lat Pulldown', slug: 'lat-pulldown', sets: 3, reps: '8–12 reps' },
        { name: 'Cable Row', slug: 'cable-row', sets: 3, reps: '8–12 reps' },
        { name: 'Face Pull', slug: 'face-pull', sets: 3, reps: '12–15 reps' },
        { name: 'Bicep Curl', slug: 'bicep-curl', sets: 3, reps: '10–12 reps' }
      ]
    } else if (context?.recovery_context.recommended_focus) {
      focus = context.recovery_context.recommended_focus
      if (focus.includes('Pull')) {
        exercises = [
          { name: 'Deadlift', slug: 'deadlift', sets: 3, reps: '5–8 reps' },
          { name: 'Lat Pulldown', slug: 'lat-pulldown', sets: 3, reps: '8–12 reps' },
          { name: 'Barbell Row', slug: 'barbell-row', sets: 3, reps: '8–10 reps' },
          { name: 'Bicep Curl', slug: 'bicep-curl', sets: 3, reps: '10–12 reps' }
        ]
      } else if (focus.includes('Legs')) {
        exercises = [
          { name: 'Barbell Squat', slug: 'barbell-squat', sets: 3, reps: '8–10 reps' },
          { name: 'Romanian Deadlift', slug: 'romanian-deadlift', sets: 3, reps: '8–10 reps' },
          { name: 'Leg Press', slug: 'leg-press', sets: 3, reps: '10–12 reps' },
          { name: 'Calf Raise', slug: 'calf-raise', sets: 3, reps: '12–15 reps' }
        ]
      }
    }

    const structuredRecommendation: StructuredWorkoutRecommendation = {
      type: 'workout_recommendation',
      focus,
      reasoning,
      exercises: exercises.map(item => ({
        ...item,
        media: resolveExerciseMedia(item.slug)
      })),
      coachInsight: 'Focus on 2-3 seconds controlled lowering on all working sets.'
    }

    const evidenceText = context?.recent_workouts && context.recent_workouts.length > 0
      ? `Evidence: Based on your last session on ${context.recent_workouts[0].date.split('T')[0]}.`
      : 'Evidence: Recommended based on proven biomechanical muscle recovery splits.'

    return {
      content: `Today's recommendation\n\n` +
        `Based on your recent training history, today's session is:\n\n` +
        `${focus}\n\n` +
        exercises.map((e, idx) => `${idx + 1}. ${e.name}\n${e.sets} sets × ${e.reps}`).join('\n\n') +
        `\n\nWhy this session:\n` +
        `${reasoning}\n\n` +
        `If you have pain or an injury, stop and consult an appropriate professional.`,
      supportingData: `Focus: ${focus}. ${evidenceText}`,
      structuredRecommendation,
      suggestedQuestions: [
        'How do I do bench press?',
        'How do I do deadlift?',
        'How many sets should I do?'
      ]
    }
  }

  // ─── H. General Fitness: "How many sets should I do?" ─────────────────────
  if (query.includes('how many sets') || query.includes('sets should i do') || query.includes('how many reps')) {
    return {
      content: `Optimal Set & Rep Guidelines\n\n` +
        `Evidence-based volume prescriptions for natural hypertrophy and strength development:\n\n` +
        `Key Guidelines:\n` +
        `• Muscle Growth (Hypertrophy): 3–4 sets per exercise, 8–12 reps, resting 60–90 seconds.\n` +
        `• Maximal Strength: 3–5 sets for compound lifts, 3–6 reps, resting 2–3 minutes.\n` +
        `• Muscular Endurance: 2–3 sets, 15–20 reps, resting 45 seconds.\n\n` +
        `Weekly Target:\n` +
        `Aim for 10–20 total working sets per major muscle group per week for optimal progressive overload.`,
      supportingData: 'Sports science set and rep guidelines.',
      suggestedQuestions: [
        'What weight should I use?',
        'Explain progressive overload.',
        'What should I train today?'
      ]
    }
  }

  // ─── I. Weight Queries & History Guidance ──────────────────────
  if (
    query.includes('what weight') || 
    query.includes('weight should i use') || 
    query.includes('increase weight') ||
    query.includes('weight did i use') ||
    query.includes('last time')
  ) {
    const matchedExSlug = findMatchedExerciseSlug(query)
    if (matchedExSlug) {
      const exDetails = get_exercise_details(matchedExSlug)
      const exName = exDetails?.name || matchedExSlug.replace(/-/g, ' ')
      const histEx = context?.exercise_history.find(e => e.exercise_name.toLowerCase().includes(exName.toLowerCase()) || exName.toLowerCase().includes(e.exercise_name.toLowerCase()))

      if (histEx && histEx.latest_weight > 0) {
        return {
          content: `Weight Details: ${exName}\n\n` +
            `Your logged history shows your latest working weight was ${histEx.latest_weight} kg for ${histEx.latest_reps} reps.\n\n` +
            `Key Points:\n` +
            `• If you completed all target reps with 1-2 reps in reserve, increase by +1.0 kg to +2.5 kg.\n` +
            `• If the last set was a struggle or form broke down, repeat ${histEx.latest_weight} kg and aim to add 1 additional repetition.\n\n` +
            `Evidence: Based on your last logged ${exName} session.`,
          supportingData: `Latest: ${histEx.latest_weight} kg x ${histEx.latest_reps} reps.`,
          suggestedQuestions: [
            `How do I do a ${exName}?`,
            'What should I train today?',
            'Explain progressive overload.'
          ]
        }
      } else {
        return {
          content: `Weight Selection Guidance: ${exName}\n\n` +
            `I don't have enough workout history yet for ${exName}. Log a few sessions and I can give you more personalized guidance on your past weights.\n\n` +
            `Key Guidelines For Your First Session:\n` +
            `• Start with an empty barbell (20 kg) or light dumbbells to practice movement trajectory.\n` +
            `• Increment load until you find a weight where 8-10 repetitions feel challenging with 2 reps remaining in reserve.\n` +
            `• Record this in GYMTrack as your baseline.`,
          supportingData: `No logged sessions for ${exName}.`,
          suggestedQuestions: [
            `How do I do ${exName}?`,
            'What should I train today?',
            'Explain progressive overload.'
          ]
        }
      }
    }

    return {
      content: `Weight Selection Guidance\n\n` +
        `I don't have enough workout history yet. Log a few sessions and I can give you more personalized guidance on your past weights.\n\n` +
        `Key Guidelines For Your First Session:\n` +
        `• Start with an empty barbell (20 kg) or light dumbbells to practice movement trajectory.\n` +
        `• Increment load until you find a weight where 8-10 repetitions feel challenging with 2 reps remaining in reserve.\n` +
        `• Record this in GYMTrack as your baseline.`,
      supportingData: 'Baseline loading guidelines.',
      suggestedQuestions: [
        'What should I train today?',
        'How do I do bench press?',
        'Explain progressive overload.'
      ]
    }
  }

  // ─── J. General Fitness: "Explain progressive overload" ───────────────────
  if (query.includes('progressive overload') || query.includes('overload')) {
    return {
      content: `Progressive Overload Explained\n\n` +
        `Progressive overload is the gradual increase of stress placed upon the musculoskeletal system to stimulate continuous strength and hypertrophy adaptations.\n\n` +
        `Key Methods To Apply Overload:\n` +
        `• Load: Adding 1.0 kg to 2.5 kg to the barbell or dumbbells.\n` +
        `• Repetitions: Performing 1-2 more reps with the same weight.\n` +
        `• Sets: Adding an additional working set to increase weekly volume.\n` +
        `• Execution: Slowing down the eccentric phase (improving time under tension) with stricter technique.\n\n` +
        `Recommendation:\n` +
        `Log every workout in GYMTrack. When you consistently hit the top of your rep range across all sets, increase load conservatively.`,
      supportingData: 'Principles of exercise physiology.',
      suggestedQuestions: [
        'How many sets should I do?',
        'What should I train today?',
        'How do I do bench press?'
      ]
    }
  }

  // ─── K. Default Fallback (Clean, Truthful, Unfabricated) ──────────────────
  if (context && context.recent_workouts.length > 0) {
    return {
      content: `GYMTrack Training Assistant\n\n` +
        `Based on your ${context.recent_workouts.length} recorded workout session(s):\n\n` +
        `• Total Recent Volume: ${context.recent_volume.toLocaleString()} kg\n` +
        `• Sessions (Last 14 Days): ${context.last_14_days.workouts_count}\n` +
        `• Recommended Next Focus: ${context.recovery_context.recommended_focus}\n\n` +
        `You can ask about proper technique for any exercise, request a personalized workout split, or query your logged volume.\n\n` +
        `Evidence: Grounded in your authenticated GYMTrack history.`,
      supportingData: `${context.recent_workouts.length} sessions recorded.`,
      suggestedQuestions: [
        'What should I train today?',
        'How do I do bench press?',
        'Is my volume increasing?'
      ]
    }
  }

  return {
    content: `Welcome to GYMTrack AI Coach\n\n` +
      `I am your evidence-grounded fitness assistant. I can guide your exercise technique with verified video demonstrations, recommend workouts, or track your progressive overload.\n\n` +
      `Key Capabilities:\n` +
      `• Exercise Technique: Ask "How do I do bench press?" to view form cues and demonstration videos.\n` +
      `• Workout Planning: Ask "What should I train today?" for structured recommendations.\n` +
      `• Progress Tracking: Log your sessions to unlock automated 1RM and volume analytics.\n\n` +
      `Evidence: Awaiting your first logged workout session.`,
    supportingData: 'Ready for training data.',
    suggestedQuestions: [
      'What should I train today?',
      'How do I do bench press?',
      'How do I do a deadlift?'
    ]
  }
}

/**
 * Resolves exercise query to canonical slug
 */
function findMatchedExerciseSlug(query: string): string | null {
  const q = query.trim().toLowerCase()

  const map: Array<{ slug: string; names: string[] }> = [
    { slug: 'bench-press', names: ['bench press', 'barbell bench', 'flat bench', 'bench'] },
    { slug: 'barbell-squat', names: ['barbell squat', 'back squat', 'squat'] },
    { slug: 'deadlift', names: ['deadlift', 'barbell deadlift', 'conventional deadlift'] },
    { slug: 'romanian-deadlift', names: ['romanian deadlift', 'rdl', 'stiff leg deadlift'] },
    { slug: 'overhead-press', names: ['overhead press', 'shoulder press', 'military press', 'ohp'] },
    { slug: 'pull-up', names: ['pull up', 'pull-up', 'pullup'] },
    { slug: 'lat-pulldown', names: ['lat pulldown', 'pulldown'] },
    { slug: 'barbell-row', names: ['barbell row', 'bent over row'] },
    { slug: 'dumbbell-row', names: ['dumbbell row', 'one arm row'] },
    { slug: 'arnold-press', names: ['arnold press'] },
    { slug: 'leg-press', names: ['leg press'] },
    { slug: 'push-up', names: ['push up', 'push-up', 'pushup'] },
    { slug: 'dips', names: ['dips', 'chest dip', 'tricep dips'] },
    { slug: 'farmers-walk', names: ["farmer's walk", 'farmers walk', 'farmer walk'] },
    { slug: 'floor-press', names: ['floor press'] },
    { slug: 'kettlebell-swing', names: ['kettlebell swing'] },
    { slug: 'turkish-get-up', names: ['turkish get up', 'turkish get-up'] },
    { slug: 'plank', names: ['plank'] },
    { slug: 'bicep-curl', names: ['bicep curl', 'barbell curl'] },
    { slug: 'tricep-pushdown', names: ['tricep pushdown', 'cable pushdown'] }
  ]

  for (const item of map) {
    if (item.names.some(n => q.includes(n))) return item.slug
  }

  // Check against all catalog slugs
  for (const ex of DEFAULT_EXERCISES) {
    if (q.includes(ex.name.toLowerCase()) || q.includes(ex.slug)) {
      return ex.slug
    }
  }

  return null
}
