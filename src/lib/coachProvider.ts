import { supabase } from '@/lib/supabase'
import type { StructuredWorkoutAnalysis, ExerciseCoachAnalysis } from './coachAnalysis'
import type { StructuredExerciseGuidance, StructuredWorkoutRecommendation } from '@/types'
import { resolveExerciseMedia, findExerciseDbRecord, EXERCISE_ALIASES } from './exerciseMedia'

export interface CoachAnswer {
  content: string
  supportingData?: string
  suggestedQuestions?: string[]
  imageUrl?: string
  structuredGuidance?: StructuredExerciseGuidance
  structuredRecommendation?: StructuredWorkoutRecommendation
}

interface ExerciseTechniqueGuide {
  name: string
  slug: string
  targetMuscles: string
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
    targetMuscles: 'Shoulders (Deltoids) · Secondary: Triceps, Upper Chest',
    setup: [
      'Sit tall on a bench with back support, planting your feet flat on the floor.',
      'Hold dumbbells at shoulder height with palms facing your chest and elbows tucked in front.'
    ],
    execution: [
      'Start with dumbbells at shoulder height.',
      'Rotate your palms as you press overhead.',
      'Fully extend without locking aggressively.',
      'Reverse the movement under control.'
    ],
    breathing: 'Inhale at the bottom, exhale as you press and rotate overhead, and inhale as you lower under control.',
    commonMistakes: [
      'Using excessive weight and compromising posture',
      'Rushing the rotation before initiating vertical press',
      'Excessive lower-back arching during overhead extension'
    ],
    tips: [
      'Use a controlled tempo and focus on the shoulder movement.',
      'Keep your ribs pulled down and maintain a braced core.'
    ],
    alternatives: ['Seated Dumbbell Shoulder Press', 'Overhead Barbell Press', 'Pike Push-Ups']
  },
  'bench-press': {
    name: 'Barbell Bench Press',
    slug: 'bench-press',
    targetMuscles: 'Primary: Pectoralis Major (Chest) · Secondary: Anterior Deltoids, Triceps Brachii',
    setup: [
      'Lie flat on the bench with eyes directly underneath the racked barbell.',
      'Grip the bar slightly wider than shoulder-width with wrists straight and thumbs wrapped.',
      'Plant your feet flat on the floor, squeeze your shoulder blades (scapulae) together, and create a natural arch in your lower back.'
    ],
    execution: [
      'Unrack the bar and stabilize it directly over your mid-chest with arms extended.',
      'Inhale deeply and lower the bar smoothly under control to your lower-to-mid sternum, keeping elbows tucked at ~45–70°.',
      'Lightly touch your chest without bouncing or lifting your glutes off the bench.',
      'Press explosively upward and slightly back toward the rack path, extending arms without un-setting your shoulder blades.'
    ],
    breathing: 'Inhale and brace your core on the descent; exhale forcefully as you drive through the sticking point.',
    commonMistakes: [
      'Bouncing the bar off the ribcage instead of controlling the eccentric phase.',
      'Flaring elbows outward at 90°, placing excessive shear stress on the rotator cuff.',
      'Lifting glutes off the bench to force leverage.'
    ],
    tips: [
      'Drive your heels into the floor (leg drive) to create whole-body tension.',
      'Imagine bending the bar in half to engage your lats and stabilize your shoulders.'
    ],
    alternatives: ['Dumbbell Bench Press', 'Push-Ups', 'Machine Chest Press']
  },
  'deadlift': {
    name: 'Conventional Barbell Deadlift',
    slug: 'deadlift',
    targetMuscles: 'Primary: Gluteus Maximus, Hamstrings, Erector Spinae · Secondary: Lats, Trapezius, Quadriceps, Forearms',
    setup: [
      'Stand with feet hip-width apart, barbell cutting directly over the middle of your shoelaces (1 inch from shins).',
      'Hinge at the hips without squatting until your hands grip the bar just outside your knees.',
      'Pull your chest up, pull the slack out of the barbell (listen for the click), and pack your lats down like putting them in your back pockets.'
    ],
    execution: [
      'Brace your abdominal wall 360° and push the floor away through your mid-foot.',
      'Keep the bar in continuous contact with your shins and thighs as your hips and chest rise simultaneously.',
      'Lock out by squeezing your glutes at the top—avoid hyperextending your lumbar spine.',
      'Hinge hips backward to lower the bar along the same vertical trajectory back to the floor.'
    ],
    breathing: 'Take a huge diaphragmatic breath at the bottom, brace hard, and exhale past the knee pass-point.',
    commonMistakes: [
      'Rounding the lower back (loss of neutral spine under load).',
      'Starting with the bar too far away from the body, multiplying shear torque.',
      'Jerking the bar off the floor rather than smoothly pulling out the slack.'
    ],
    tips: [
      'Think of the deadlift as a leg press against the earth rather than pulling with your arms.',
      'Keep your head neutral—pick a spot on the floor 10 feet ahead.'
    ],
    alternatives: ['Romanian Deadlift (RDL)', 'Trap Bar Deadlift', 'Kettlebell Deadlift']
  },
  'squat': {
    name: 'Barbell Back Squat',
    slug: 'barbell-squat',
    targetMuscles: 'Primary: Quadriceps, Gluteus Maximus · Secondary: Hamstrings, Adductors, Core, Erector Spinae',
    setup: [
      'Step under the bar, resting it across your upper traps (high-bar) or rear deltoids (low-bar).',
      'Unrack with both feet balanced under your hips, take two clean steps back, and set feet shoulder-width apart with toes angled 15–30° outward.',
      'Inhale into your stomach, expand your ribs, and brace your core firmly.'
    ],
    execution: [
      'Initiate the movement by breaking at the hips and knees simultaneously.',
      'Descend under control until your hip crease dips below the top of your patella (parallel depth).',
      'Ensure knees track in line with your middle toes without collapsing inward (valgus).',
      'Drive straight up through your mid-foot, keeping your chest proud and spine neutral.'
    ],
    breathing: 'Inhale and brace before descending (Valsalva maneuver); exhale as you stand up past the sticking point.',
    commonMistakes: [
      'Allowing knees to cave inward on the ascent.',
      'Rising hips first (the "good morning" squat), transferring load to the lower back.',
      'Cutting depth short before achieving full hamstring and quad loading.'
    ],
    tips: [
      'Screw your feet into the ground to externally rotate and stabilize the hips.',
      'Keep your elbows pulled down under the bar to preserve thoracic tightness.'
    ],
    alternatives: ['Front Squat', 'Goblet Squat', 'Leg Press']
  },
  'pull-up': {
    name: 'Pull-Up',
    slug: 'pull-up',
    targetMuscles: 'Primary: Latissimus Dorsi · Secondary: Biceps Brachii, Brachialis, Upper Back, Core',
    setup: [
      'Grip the overhead pull-up bar with an overhand (pronated) grip slightly wider than shoulder-width.',
      'Hang with arms fully extended and engage your core with legs slightly forward (hollow body posture).'
    ],
    execution: [
      'Initiate by depressing and retracting your shoulder blades (the active hang).',
      'Drive your elbows straight down toward your hip pockets until your chin clears the bar.',
      'Pause for a split-second at the top without shrugging your shoulders forward.',
      'Lower yourself slowly under complete control back to full extension.'
    ],
    breathing: 'Exhale as you pull your chest to the bar; inhale as you lower under control.',
    commonMistakes: [
      'Kipping or swinging the lower body to gain momentum.',
      'Not descending to a full arm hang (half-reps).',
      'Reaching with the chin rather than pulling the chest to the bar.'
    ],
    tips: [
      'Focus on driving your elbows down, rather than thinking about pulling with your hands.',
      'If you cannot do a full bodyweight pull-up, use resistance bands or lat pulldowns to build foundational lat strength.'
    ],
    alternatives: ['Lat Pulldown', 'Assisted Pull-Up Machine', 'Inverted Row']
  },
  'overhead-press': {
    name: 'Standing Overhead Press',
    slug: 'overhead-press',
    targetMuscles: 'Primary: Anterior & Lateral Deltoids · Secondary: Triceps, Upper Chest, Core, Serratus Anterior',
    setup: [
      'Rack the barbell at mid-chest height. Grip the bar just outside shoulder-width.',
      'Rest the bar on your anterior deltoids with forearms perfectly vertical underneath.',
      'Squeeze your glutes, brace your abs, and stand tall.'
    ],
    execution: [
      'Tilt your head back slightly to clear the bar path.',
      'Press the bar in a straight vertical line upward.',
      'Once the bar clears your forehead, move your head back through the "window" and lock out with the bar stacked over your spine.',
      'Lower the bar with control back to the collarbone shelf.'
    ],
    breathing: 'Inhale and brace at the chest; exhale as the bar reaches full overhead lockout.',
    commonMistakes: [
      'Excessively leaning back and hyperextending the lumbar spine.',
      'Pressing the bar around the face in a wide loop instead of a tight vertical path.',
      'Loose lower body and glutes, resulting in energy dissipation.'
    ],
    tips: [
      'Squeeze your glutes hard throughout the set to protect your lower back.',
      'Shrug your shoulders slightly at the very top for healthy scapular upward rotation.'
    ],
    alternatives: ['Seated Dumbbell Shoulder Press', 'Arnold Press', 'Kettlebell Press']
  },
  'barbell-row': {
    name: 'Bent-Over Barbell Row',
    slug: 'barbell-row',
    targetMuscles: 'Primary: Latissimus Dorsi, Rhomboids, Middle Trapezius · Secondary: Posterior Deltoids, Biceps, Erector Spinae',
    setup: [
      'Stand hip-width apart and hinge your hips back until your torso is at approximately a 45° angle (or parallel for Pendlay rows).',
      'Hold the bar with an overhand grip slightly wider than shoulder-width with arms hanging straight down.',
      'Maintain a neutral spine and brace your core firmly.'
    ],
    execution: [
      'Pull the barbell smoothly toward your lower ribcage / upper belly button.',
      'Drive your elbows back and squeeze your shoulder blades together at the apex.',
      'Lower the bar under control until your arms are fully extended without dropping your chest.'
    ],
    breathing: 'Inhale at the bottom; exhale as you pull and squeeze your lats.',
    commonMistakes: [
      'Using aggressive hip jerks to throw the weight up.',
      'Rounding the lower back under load.',
      'Standing too upright, turning the row into a shrug.'
    ],
    tips: [
      'Imagine pulling with your elbows rather than your hands.',
      'Keep your neck neutral—do not crank your head up to stare in the mirror.'
    ],
    alternatives: ['One-Arm Dumbbell Row', 'Seated Cable Row', 'Chest-Supported T-Bar Row']
  },
  'romanian-deadlift': {
    name: 'Romanian Deadlift (RDL)',
    slug: 'romanian-deadlift',
    targetMuscles: 'Primary: Hamstrings, Gluteus Maximus · Secondary: Erector Spinae, Latissimus Dorsi, Forearms',
    setup: [
      'Stand tall holding a barbell or dumbbells at hip height with feet hip-width apart.',
      'Maintain soft knees (slight 15° bend) and keep that knee angle completely locked throughout.',
      'Pull shoulders back, pack your lats down, and lock your core with a neutral spine.'
    ],
    execution: [
      'Hinge backward at the hips by pushing your butt toward the wall behind you.',
      'Slide the weights directly down your thighs and shins, keeping the bar touching your legs.',
      'Lower until you feel an intense, deep stretch across your hamstrings (just below the kneecap).',
      'Drive hips forcefully forward and contract your glutes at the top to return to full upright position.'
    ],
    breathing: 'Inhale and brace before hinging; exhale as you stand up through the hip extension.',
    commonMistakes: [
      'Rounding the lower back to force extra depth.',
      'Bending the knees too much turning the hinge into a conventional squat.',
      'Allowing the barbell or dumbbells to drift forward away from the legs.'
    ],
    tips: [
      'Think of pushing a door closed with your butt rather than bending over.',
      'Stop descending immediately once your hips stop moving backward.'
    ],
    alternatives: ['Single-Leg Dumbbell RDL', 'Good Mornings', 'Kettlebell Hinge']
  }
}

/**
 * Enhanced AI Coach Question Resolver
 * Provides data-grounded responses from verified telemetry, rich exercise instruction
 * with visual demonstration references, and personalized workout planning.
 */
export async function askCoachQuestion(
  query: string,
  analysis: StructuredWorkoutAnalysis
): Promise<CoachAnswer> {
  const cleanQuery = query.trim().toLowerCase()

  // 1. Safety Check: Medical, injury, and severe pain safety guardrails
  const medicalKeywords = ['pain', 'hurt', 'injury', 'injuries', 'torn', 'tear', 'sprain', 'doctor', 'physio', 'rehab', 'swelling', 'sharp pain', 'dislocated']
  const hasMedicalQuery = medicalKeywords.some(kw => cleanQuery.includes(kw))

  if (hasMedicalQuery) {
    return {
      content: `Safety Advisory\n\nGYMTrack AI Coach is a fitness assistant, not a physician or licensed medical professional.\n\nIf you are experiencing sharp, localized, or persistent pain, joint swelling, or suspect an injury, please stop training immediately and consult a healthcare provider or physical therapist.\n\nNever attempt to lift through acute pain. Athletic progression requires prioritizing joint health and tissue recovery over short-term workout numbers.`,
      supportingData: 'Safety guideline applied.',
      suggestedQuestions: [
        'What should I train today?',
        'How do I do a bench press?',
        'How did I progress this week?'
      ]
    }
  }

  // 2. Try Supabase Edge Function with compact structured context if available
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session && navigator.onLine) {
      const edgeResponse = await supabase.functions.invoke('ai-coach', {
        body: {
          messages: [{ role: 'user', content: query }],
          context: {
            hasData: analysis.hasData,
            totalWorkouts: analysis.totalWorkouts,
            recentSessionsCount: analysis.recentSessionsCount,
            recentVolume: analysis.recentVolume,
            previousVolume: analysis.previousVolume,
            volumeChangePct: analysis.volumeChangePct,
            biggestImprovement: analysis.biggestImprovement ? {
              name: analysis.biggestImprovement.exerciseName,
              changePct: analysis.biggestImprovement.oneRMChangePct,
              current1RM: analysis.biggestImprovement.current1RM
            } : null,
            potentialPlateau: analysis.potentialPlateau ? {
              name: analysis.potentialPlateau.exerciseName,
              reason: analysis.potentialPlateau.plateauReason
            } : null
          }
        }
      })

      if (!edgeResponse.error && edgeResponse.data?.content) {
        // Sanitize edge function response to strip any raw markdown artifacts
        let edgeContent = edgeResponse.data.content as string
        // Strip decorative emoji symbols
        edgeContent = edgeContent.replace(/[★☆✦✧✨⭐🌟💪🔥💥⚡🎯🏆✅❌⚠️📊📈📉🎉💯💡]/g, '')
        return {
          content: edgeContent,
          supportingData: 'Response based on your GYMTrack workout data.'
        }
      }
    }
  } catch {
    // Edge function unreachable or unconfigured; gracefully proceed to deterministic response engine
  }

  // 3. Deterministic Grounded Response Generator
  return generateDeterministicAnswer(cleanQuery, analysis)
}

function generateDeterministicAnswer(query: string, analysis: StructuredWorkoutAnalysis): CoachAnswer {
  // ─── Topic 1: Exercise Technique & Visual Demonstrations ───────────────────
  const isTechniqueQuery = 
    query.includes('how do i do') || 
    query.includes('how to do') || 
    query.includes('show me') || 
    query.includes('form for') || 
    query.includes('technique') ||
    query.includes('how to perform') ||
    query.includes('teach me') ||
    query.includes('how do i perform') ||
    query.includes('demonstrate')

  // Check matching against canonical exercise list or aliases
  const exerciseKeys = [
    { slug: 'arnold-press', names: ['arnold press', 'arnold', 'dumbbell arnold press'] },
    { slug: 'bench-press', names: ['bench press', 'barbell bench press', 'flat bench', 'bench'] },
    { slug: 'barbell-squat', names: ['barbell squat', 'squat', 'back squat'] },
    { slug: 'deadlift', names: ['deadlift', 'barbell deadlift', 'straight leg deadlift'] },
    { slug: 'lat-pulldown', names: ['lat pulldown', 'pulldown', 'cable pulldown'] },
    { slug: 'shoulder-press', names: ['shoulder press', 'overhead press', 'military press'] },
    { slug: 'bicep-curl', names: ['bicep curl', 'biceps curl', 'barbell curl', 'arm curl'] },
    { slug: 'hammer-curl', names: ['hammer curl', 'cross body hammer curl'] },
    { slug: 'leg-press', names: ['leg press', 'sled leg press', '45 degree leg press'] },
    { slug: 'cable-row', names: ['cable row', 'seated row', 'seated cable row'] },
    { slug: 'face-pull', names: ['face pull', 'rear delt row'] },
    { slug: 'romanian-deadlift', names: ['romanian deadlift', 'rdl'] },
    { slug: 'push-up', names: ['push up', 'pushup', 'push-up'] },
    { slug: 'pull-up', names: ['pull up', 'pullup', 'pull-up'] },
    { slug: 'dips', names: ['dip', 'dips', 'chest dip'] },
    { slug: 'plank', names: ['plank'] }
  ]

  let matchedExerciseSlug: string | null = null
  for (const ex of exerciseKeys) {
    if (ex.names.some(n => query.includes(n))) {
      matchedExerciseSlug = ex.slug
      break
    }
  }

  // Fallback slug check across aliases
  if (!matchedExerciseSlug) {
    for (const [slugKey] of Object.entries(EXERCISE_ALIASES)) {
      if (query.includes(slugKey.replace(/-/g, ' '))) {
        matchedExerciseSlug = slugKey
        break
      }
    }
  }

  if (matchedExerciseSlug && (isTechniqueQuery || query.includes(matchedExerciseSlug.replace(/-/g, ' ')))) {
    const slug = matchedExerciseSlug
    const guide = TECHNIQUE_GUIDES[slug]
    const dbRecord = findExerciseDbRecord(slug)
    const media = resolveExerciseMedia(slug)

    const exerciseName = guide?.name || dbRecord?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const targetMuscles = dbRecord?.target 
      ? [dbRecord.target.replace(/\b\w/g, l => l.toUpperCase())]
      : (guide?.targetMuscles ? [guide.targetMuscles] : ['Target Muscles'])

    const steps = dbRecord?.steps && dbRecord.steps.length > 0
      ? dbRecord.steps
      : (guide?.execution || [
          'Assume stable starting position with core tight and weights aligned.',
          'Execute the movement with controlled cadence through the complete range of motion.',
          'Lower smoothly to the starting point while maintaining deliberate tension.'
        ])

    const mistakes = dbRecord?.commonMistakes && dbRecord.commonMistakes.length > 0
      ? dbRecord.commonMistakes
      : (guide?.commonMistakes || [
          'Excessive momentum or swinging during execution',
          'Rushing the eccentric lowering phase'
        ])

    const tip = dbRecord?.formCues?.[0] || guide?.tips?.[0] || 'Use a controlled tempo and focus on the primary working muscle.'

    const structuredGuidance: StructuredExerciseGuidance = {
      type: 'exercise_guidance',
      exercise: {
        name: exerciseName,
        slug
      },
      targetMuscles,
      steps,
      mistakes,
      tip,
      media
    }

    let content = `${exerciseName}\n\nTarget Muscles\n${targetMuscles.join(', ')}\n\nHow to perform\n`
    steps.forEach((s, idx) => { content += `${idx + 1}. ${s}\n` })
    content += `\nCommon mistakes\n`
    mistakes.forEach(m => { content += `- ${m}\n` })
    content += `\nCoach tip\n${tip}`

    return {
      content,
      imageUrl: media?.thumbnailUrl || media?.posterUrl,
      structuredGuidance,
      supportingData: `Verified exercise form guide and demonstration video for ${exerciseName}.`,
      suggestedQuestions: [
        'What should I train today?',
        'What exercises target the chest?',
        `Should I increase my ${exerciseName} weight?`
      ]
    }
  }

  // ─── Topic: "How many sets should I do?" ──────────────────────────────────
  if (query.includes('how many sets') || query.includes('number of sets') || query.includes('how many reps')) {
    return {
      content: `Optimal Set and Rep Guidelines\n\nEvidence-based training guidelines for compound and accessory lifts:\n\n` +
        `- Hypertrophy (Muscle Growth): 3-4 working sets per exercise, 8-12 reps per set, resting 60-90 seconds.\n` +
        `- Maximum Strength: 3-5 working sets per compound lift, 3-6 reps per set, resting 2-3 minutes.\n` +
        `- Muscular Endurance: 2-3 sets, 15-20 reps, resting 30-45 seconds.\n\nWeekly Target\nAim for 10-20 total working sets per major muscle group per week for sustainable progressive overload.`,
      supportingData: 'Set and rep volume guidelines.',
      suggestedQuestions: [
        'What should I train today?',
        'How do I do a bench press?',
        'What exercises target the chest?'
      ]
    }
  }

  // ─── Topic: "What exercise targets the chest?" ────────────────────────────
  if (
    query.includes('target chest') || 
    query.includes('targets chest') || 
    query.includes('targets the chest') || 
    query.includes('target the chest') || 
    query.includes('exercise targets the chest') || 
    query.includes('exercises target chest')
  ) {
    return {
      content: `Targeted Chest Exercises\n\nPrimary movements for chest development:\n\n` +
        `1. Barbell Bench Press: Foundational compound horizontal press targeting the mid-to-lower sternal pectoralis.\n` +
        `2. Incline Dumbbell Press: Emphasizes the upper (clavicular) pectoral head through natural converging movement path.\n` +
        `3. Push-Ups: Fundamental closed-kinetic-chain movement for pectoral and core stability.\n` +
        `4. Dips: Effective lower pectoral exercise with slight forward torso lean.\n` +
        `5. Cable Crossover / Chest Fly: Isolates chest fibers through horizontal adduction with continuous tension.\n\n` +
        `You can explore each of these in the Library tab and add them to today's workout.`,
      supportingData: 'Chest exercise selection guide.',
      suggestedQuestions: [
        'How do I do a bench press?',
        'What should I train today?',
        'How many sets should I do?'
      ]
    }
  }

  // ─── Topic: "Have I improved my [exercise]?" ──────────────────────────────
  if (query.includes('have i improved') || query.includes('did i improve') || query.includes('improved my')) {
    const matchedEx = findExerciseInQuery(query, analysis.exercises)
    if (matchedEx) {
      const isUp = (matchedEx.oneRMChangePct || 0) > 0
      return {
        content: `Performance Progression: ${matchedEx.exerciseName}\n\n` +
          `- Current Est. 1RM: ${matchedEx.current1RM ? `${matchedEx.current1RM} kg` : `${matchedEx.latestWeight || 0} kg`}\n` +
          `- Personal Best: ${matchedEx.best1RM ? `${matchedEx.best1RM} kg` : `${matchedEx.latestWeight || 0} kg`}\n` +
          `- Sessions Recorded: ${matchedEx.totalSessions}\n` +
          `- Progression Delta: ${matchedEx.oneRMChangePct != null ? `${matchedEx.oneRMChangePct >= 0 ? `+${matchedEx.oneRMChangePct}%` : `${matchedEx.oneRMChangePct}%`}` : 'Establishing baseline'}\n\n` +
          `${isUp ? `You have improved your ${matchedEx.exerciseName} performance by ${matchedEx.oneRMChangePct}% since your first session.` : `Your performance on ${matchedEx.exerciseName} has maintained consistent load across recent sessions.`}`,
        supportingData: matchedEx.supportingData,
        suggestedQuestions: [
          `Should I increase my ${matchedEx.exerciseName} weight?`,
          `How do I do a ${matchedEx.exerciseName}?`,
          'What should I train today?'
        ]
      }
    }
  }

  // ─── Topic: Historical Queries ("What did I do yesterday?", "What did I do for chest?", "What weight did I use?") ───
  if (
    query.includes('what did i do') ||
    query.includes('what did i train') ||
    query.includes('what did i lift') ||
    query.includes('what was my last workout') ||
    query.includes('what weight did i use') ||
    query.includes('my bench press weight') ||
    query.includes('my squat weight') ||
    query.includes('last week') ||
    query.includes('yesterday') ||
    query.includes('what did i do today')
  ) {
    if (analysis.hasData && analysis.recentWorkoutsSummary.length > 0) {
      // Check if querying a specific exercise like bench press
      const matchedEx = analysis.exercises.find(e => 
        query.includes(e.exerciseName.toLowerCase()) || 
        query.includes(e.exerciseId) ||
        (query.includes('bench') && e.exerciseName.toLowerCase().includes('bench')) ||
        (query.includes('squat') && e.exerciseName.toLowerCase().includes('squat')) ||
        (query.includes('deadlift') && e.exerciseName.toLowerCase().includes('deadlift'))
      )

      if (matchedEx) {
        return {
          content: `Recorded Performance: ${matchedEx.exerciseName}\n\n` +
            `- Current Est. 1RM: ${matchedEx.current1RM ? `${matchedEx.current1RM} kg` : (matchedEx.latestWeight ? `${matchedEx.latestWeight} kg` : 'Bodyweight')}\n` +
            `- All-Time Peak 1RM: ${matchedEx.best1RM ? `${matchedEx.best1RM} kg` : (matchedEx.latestWeight ? `${matchedEx.latestWeight} kg` : 'Bodyweight')}\n` +
            `- Latest Working Weight: ${matchedEx.latestWeight ? `${matchedEx.latestWeight} kg` : 'Recorded'}\n` +
            `- Total Sessions Logged: ${matchedEx.totalSessions}\n` +
            `- Progression Delta: ${matchedEx.oneRMChangePct != null ? `${matchedEx.oneRMChangePct >= 0 ? `+${matchedEx.oneRMChangePct}%` : `${matchedEx.oneRMChangePct}%`}` : 'Establishing baseline'}\n\n` +
            `This record is derived directly from your completed workout session sets.`,
          supportingData: matchedEx.supportingData,
          suggestedQuestions: [
            `Should I increase my ${matchedEx.exerciseName} weight?`,
            `How do I do a ${matchedEx.exerciseName}?`,
            'What should I train today?'
          ]
        }
      }

      // If querying recent workouts / last week
      const sessions = analysis.recentWorkoutsSummary
      let content = `Recent Workout Records\n\n`
      sessions.slice(0, 4).forEach((s, idx) => {
        content += `${idx + 1}. ${s.name} (${s.date})\n`
        content += `   - Duration: ${s.durationMins} minutes\n`
        content += `   - Volume: ${s.volume.toLocaleString()} kg across ${s.exercisesCount} exercises\n\n`
      })
      content += `You can inspect full set-by-set breakdowns anytime in your Progress and History tab.`

      return {
        content,
        supportingData: `Based on ${sessions.length} recent sessions.`,
        suggestedQuestions: [
          'What should I train today?',
          'How did I progress this week?',
          'Which exercise improved the most?'
        ]
      }
    } else {
      return {
        content: `You don't have any completed workouts recorded in GYMTrack yet.\n\nOnce you log your first workout, I will track and recall your exact weights, sets, and reps here.`,
        supportingData: 'No workout data stored yet.',
        suggestedQuestions: [
          'What should I train today?',
          'How do I do a bench press?',
          'How do I do a squat?'
        ]
      }
    }
  }

  // ─── Topic: 30-Minute Express Workout ───────────────────────────────────────
  if (query.includes('30 minutes') || query.includes('half hour') || query.includes('30 min')) {
    return {
      content: `30-Minute Express Workout\n\n` +
        `When you only have 30 minutes, use antagonistic supersets (alternating push and pull) with minimal downtime (45-60s rest):\n\n` +
        `Superset 1 (12 mins)\n` +
        `- Dumbbell Bench Press: 3 sets x 8-10 reps\n` +
        `- Dumbbell Row or Pull-Up: 3 sets x 8-10 reps\n\n` +
        `Superset 2 (12 mins)\n` +
        `- Goblet Squat or Bulgarian Split Squat: 3 sets x 10 reps\n` +
        `- Romanian Deadlift or Plank: 3 sets x 10 reps (or 45s hold)\n\n` +
        `Cooldown (3-5 mins)\nDeep breathing and lower body stretch.\n\n` +
        `This circuit preserves maximum stimulus density while fitting into 30 minutes.`,
      supportingData: 'Express superset protocol.',
      suggestedQuestions: [
        'How do I do a bench press?',
        'How do I do a squat?',
        'What should I train today?'
      ]
    }
  }


  // ─── Topic 2: "What should I train today?" / Workout Planning ───────────────
  if (
    query.includes('what should i train') || 
    query.includes('what workout should i do') || 
    query.includes('recommend a workout') ||
    query.includes('today\'s workout') ||
    query.includes('what to workout today') ||
    query.includes('what to train today')
  ) {
    if (analysis.hasData && analysis.recentWorkoutsSummary.length > 0) {
      const lastSession = analysis.recentWorkoutsSummary[0]
      const lastSessionName = lastSession.name.toLowerCase()
      
      let recommendationFocus = 'Upper Body'
      let reasoningText = `Based on your recent training history, an upper-body session is a suitable choice today.`
      let suggestedExercisesList = [
        { name: 'Bench Press', slug: 'bench-press', sets: 3, reps: '8-12 reps' },
        { name: 'Lat Pulldown', slug: 'lat-pulldown', sets: 3, reps: '8-12 reps' },
        { name: 'Shoulder Press', slug: 'shoulder-press', sets: 3, reps: '8-12 reps' }
      ]

      if (lastSessionName.includes('push') || lastSessionName.includes('chest')) {
        recommendationFocus = 'Pull / Back & Biceps'
        reasoningText = `Your last completed session was ${lastSession.name} on ${lastSession.date}. To allow those pressing muscle groups 48 hours to recover while maintaining momentum, training pull is the optimal choice today.`
        suggestedExercisesList = [
          { name: 'Deadlift', slug: 'deadlift', sets: 3, reps: '5-8 reps' },
          { name: 'Lat Pulldown', slug: 'lat-pulldown', sets: 3, reps: '8-12 reps' },
          { name: 'Cable Row', slug: 'cable-row', sets: 3, reps: '8-12 reps' }
        ]
      } else if (lastSessionName.includes('pull') || lastSessionName.includes('back')) {
        recommendationFocus = 'Legs & Core'
        reasoningText = `Your last completed session was ${lastSession.name} on ${lastSession.date}. Shifting volume to your lower body allows upper posterior chain recovery.`
        suggestedExercisesList = [
          { name: 'Barbell Squat', slug: 'barbell-squat', sets: 3, reps: '8-10 reps' },
          { name: 'Leg Press', slug: 'leg-press', sets: 3, reps: '10-12 reps' },
          { name: 'Plank', slug: 'plank', sets: 3, reps: '45-60 sec' }
        ]
      }

      const structuredRecommendation: StructuredWorkoutRecommendation = {
        type: 'workout_recommendation',
        focus: recommendationFocus,
        reasoning: reasoningText,
        exercises: suggestedExercisesList.map(item => ({
          ...item,
          media: resolveExerciseMedia(item.slug)
        })),
        coachInsight: 'Your recent pressing volume is trending upward. Keep today\'s working sets controlled and prioritize consistent technique.'
      }

      return {
        content: `TODAY'S RECOMMENDATION\n\n${recommendationFocus}\n\n${reasoningText}\n\nRecommended\n` +
          suggestedExercisesList.map(e => `- ${e.name}: ${e.sets} sets × ${e.reps}`).join('\n') +
          `\n\nCoach insight\nYour recent pressing volume is trending upward. Keep today's working sets controlled and prioritize consistent technique.`,
        supportingData: `Based on last session: ${lastSession.name} on ${lastSession.date}.`,
        structuredRecommendation,
        suggestedQuestions: [
          'How do I do a bench press?',
          'How do I do an Arnold Press?',
          'How did I progress this week?'
        ]
      }
    } else {
      // User has 0 logged sessions
      const structuredRecommendation: StructuredWorkoutRecommendation = {
        type: 'workout_recommendation',
        focus: 'Upper Body',
        reasoning: 'Based on your recent training history, an upper-body session is a suitable choice today.',
        exercises: [
          { name: 'Bench Press', slug: 'bench-press', sets: 3, reps: '8-12 reps', media: resolveExerciseMedia('bench-press') },
          { name: 'Lat Pulldown', slug: 'lat-pulldown', sets: 3, reps: '8-12 reps', media: resolveExerciseMedia('lat-pulldown') },
          { name: 'Shoulder Press', slug: 'shoulder-press', sets: 3, reps: '8-12 reps', media: resolveExerciseMedia('shoulder-press') }
        ],
        coachInsight: 'Your recent pressing volume is trending upward. Keep today\'s working sets controlled and prioritize consistent technique.'
      }

      return {
        content: `TODAY'S RECOMMENDATION\n\nUpper Body\n\nBased on your recent training history, an upper-body session is a suitable choice today.\n\nRecommended\n` +
          `- Bench Press: 3 sets × 8-12 reps\n- Lat Pulldown: 3 sets × 8-12 reps\n- Shoulder Press: 3 sets × 8-12 reps\n\nCoach insight\nYour recent pressing volume is trending upward. Keep today's working sets controlled and prioritize consistent technique.`,
        supportingData: 'Upper body foundation recommendation.',
        structuredRecommendation,
        suggestedQuestions: [
          'How do I do an Arnold Press?',
          'Show me how to do bench press.',
          'How do I do a squat?'
        ]
      }
    }
  }

  // ─── Topic 3: "I haven't trained legs in a week" / Muscle Specific ─────────
  if (query.includes('legs in a week') || query.includes('havent trained legs') || query.includes('missed leg day')) {
    return {
      content: `Leg Day Re-Entry Strategy\n\n` +
        `Since you haven't trained legs in over a week, your neuromuscular system will be responsive, but you are also more susceptible to delayed-onset muscle soreness (DOMS).\n\n` +
        `Recommended Protocol\n` +
        `1. Warm-up: 5 minutes of cycling or bodyweight lunges + hip mobility.\n` +
        `2. Barbell Squat: 3 sets of 8 reps at ~70% of your top weight (leave 2-3 reps in reserve).\n` +
        `3. Romanian Deadlift: 3 sets of 10 reps focusing on a deep hamstring stretch.\n` +
        `4. Leg Press or Walking Lunges: 2 sets of 12 reps.\n` +
        `5. Calf Raises: 3 sets of 15 reps.\n\n` +
        `Note: Do not test a 1RM today. Re-introduce load progressively to ensure recovery for your next session.`,
      supportingData: 'Deload re-entry guidance.',
      suggestedQuestions: [
        'How do I do a squat?',
        'How do I do a deadlift?',
        'What should I train today?'
      ]
    }
  }

  // ─── Topic 4: "What exercise targets my upper chest?" ──────────────────────
  if (query.includes('upper chest') || query.includes('clavicular head')) {
    return {
      content: `Upper Chest Exercises (Clavicular Head)\n\n` +
        `The upper pectoral fibers attach to the clavicle and run diagonally, responding best to incline pressing angles between 30 and 45 degrees:\n\n` +
        `1. Incline Barbell Bench Press: Premier compound builder for upper chest strength and thickness (3-4 sets of 6-10 reps).\n` +
        `2. Incline Dumbbell Press: Allows a deeper stretch at the bottom and natural wrist rotation (3 sets of 8-12 reps).\n` +
        `3. Low-to-High Cable Crossover: Maintains continuous tension throughout the entire upward arc (3 sets of 12-15 reps).\n` +
        `4. Decline Push-Ups: Elevate your feet on a bench to shift bodyweight onto your upper chest.\n\n` +
        `Coach Tip\nAvoid setting the bench incline too high (above 45 degrees), which shifts emphasis from the chest to the front deltoids.`,
      supportingData: 'Upper chest exercise guide.',
      suggestedQuestions: [
        'How do I do a bench press?',
        'What should I train today?',
        'Should I increase my weight?'
      ]
    }
  }

  // ─── Topic 5: "Difference between lat pulldown and pull-up" ─────────────────
  if (query.includes('lat pulldown') && (query.includes('pull-up') || query.includes('pull up') || query.includes('difference'))) {
    return {
      content: `Lat Pulldown vs Pull-Up\n\nBoth movements target the Latissimus Dorsi, but they operate through distinct biomechanical chains:\n\n` +
        `| Characteristic | Pull-Up | Lat Pulldown |\n` +
        `|---|---|---|\n` +
        `| Kinetic Chain | Closed-chain (body moves to fixed bar) | Open-chain (bar moves to fixed body) |\n` +
        `| Core Recruitment | High (must brace core and glutes) | Moderate (stabilized by thigh pads) |\n` +
        `| Resistance Scaling | Limited to bodyweight plus added weight | Fully adjustable in 2.5-5 kg increments |\n` +
        `| Best Used For | Relative strength, athleticism | Strict hypertrophy, higher volume burnout |\n\n` +
        `Coach Verdict\nUse pull-ups early in your back session as a heavy compound, and follow up with lat pulldowns to safely accumulate volume without core fatigue.`,
      supportingData: 'Lat pulldown vs pull-up comparison.',
      suggestedQuestions: [
        'How do I do a pull-up?',
        'What should I train today?',
        'How did I progress this week?'
      ]
    }
  }

  // ─── Topic 6: "I only have 45 minutes today" ──────────────────────────────
  if (query.includes('45 minutes') || query.includes('short on time') || query.includes('quick workout')) {
    return {
      content: `45-Minute Workout\n\n` +
        `When time is constrained, prioritize multi-joint compound exercises and cap rest intervals at 75-90 seconds:\n\n` +
        `Warm-up (5 mins)\nArm circles, bodyweight squats, banded pull-aparts.\n\n` +
        `The 45-Min Routine (35 mins)\n` +
        `1. Barbell Squat or Deadlift: 3 sets x 6-8 reps\n` +
        `2. Barbell Bench Press: 3 sets x 8-10 reps\n` +
        `3. Barbell or Cable Row: 3 sets x 8-10 reps\n` +
        `4. Plank: 2 sets x 45 seconds\n\n` +
        `Cooldown (5 mins)\nLight breathing and mobility stretch.\n\n` +
        `This routine hits over 80% of total bodily muscle mass in under 45 minutes.`,
      supportingData: 'Time-efficient training programming.',
      suggestedQuestions: [
        'How do I do a bench press?',
        'How do I do a squat?',
        'What should I train today?'
      ]
    }
  }

  // ─── Topic 7: "I am a beginner. What should I do?" ────────────────────────
  if (query.includes('beginner') || query.includes('new to the gym') || query.includes('just starting')) {
    return {
      content: `Getting Started at the Gym\n\nHere is your proven blueprint to build strength safely:\n\n` +
        `1. Master Form Before Weight: Always leave 2-3 reps in reserve. Never compromise technique to lift heavier.\n` +
        `2. Focus on the Big 4 Movements: Squat (legs), Hinge (posterior chain), Push (chest/shoulders), Pull (back).\n` +
        `3. Train 3 Days Per Week: Monday / Wednesday / Friday allows 48 hours of rest between sessions for optimal recovery.\n` +
        `4. Log Every Set: Use GYMTrack to log your weight and reps. Tracking ensures progressive overload over time.\n\n` +
        `Would you like a starter full-body workout for your first day?`,
      supportingData: 'Beginner programming guidelines.',
      suggestedQuestions: [
        'What should I train today?',
        'How do I do a bench press?',
        'How does 1RM calculation work?'
      ]
    }
  }

  // ─── Topic 8: Inquire about biggest improvement ────────────────────────────
  if (query.includes('improved the most') || query.includes('biggest improvement') || query.includes('best progress') || query.includes('most progress')) {
    if (analysis.biggestImprovement && (analysis.biggestImprovement.oneRMChangePct || 0) > 0) {
      const bi = analysis.biggestImprovement
      return {
        content: `Biggest Improvement: ${bi.exerciseName}\n\n- 1RM Progression: ${bi.previous1RM ? `${bi.previous1RM} kg to ` : ''}${bi.current1RM} kg (+${bi.oneRMChangePct}%)\n- Performance Record: All-time peak of ${bi.best1RM} kg\n- Training History: ${bi.totalSessions} sessions logged\n\nKeep maintaining clean execution and full range of motion.`,
        supportingData: bi.supportingData,
        suggestedQuestions: [
          `Should I increase my ${bi.exerciseName} weight?`,
          'How did I progress this week?',
          'Am I training consistently?'
        ]
      }
    } else {
      return {
        content: `You have completed ${analysis.totalWorkouts} workout session(s), but there is not yet enough multi-session progression data to identify a single biggest improvement.\n\nKeep logging your working sets consistently across your routines.`,
        supportingData: `Total sessions: ${analysis.totalWorkouts}. Baseline establishing.`,
        suggestedQuestions: [
          'How did I progress this week?',
          'Am I training consistently?'
        ]
      }
    }
  }

  // ─── Topic 9: Inquire about training volume ────────────────────────────────
  if (query.includes('volume') || query.includes('tonnage') || query.includes('how much weight')) {
    if (analysis.volumeChangePct != null) {
      const isUp = analysis.volumeChangePct >= 0
      return {
        content: `Training Volume Breakdown\n\n- Last 14 Days: ${analysis.recentVolume.toLocaleString()} kg\n- Prior 14 Days: ${analysis.previousVolume.toLocaleString()} kg\n- Change: ${isUp ? `+${analysis.volumeChangePct}%` : `${analysis.volumeChangePct}%`}\n\n${isUp ? 'Your progressive overload is progressing steadily. Ensure recovery and sleep match your output.' : 'Your volume has dipped slightly. If you are on a deload week, this is appropriate; otherwise, aim to finish all target sets.'}`,
        supportingData: `14-day comparison: ${analysis.recentVolume} kg vs ${analysis.previousVolume} kg.`,
        suggestedQuestions: [
          'Am I training consistently?',
          'Which exercise improved the most?'
        ]
      }
    } else {
      return {
        content: `In your recent workouts, you have moved a total of ${analysis.recentVolume.toLocaleString()} kg of volume across ${analysis.recentSessionsCount} sessions.\n\nAs you log workouts into your second week, a bi-weekly volume comparison will be available.`,
        supportingData: `Recent volume: ${analysis.recentVolume} kg across ${analysis.recentSessionsCount} workouts.`,
        suggestedQuestions: [
          'Am I training consistently?',
          'Which exercise improved the most?'
        ]
      }
    }
  }

  // ─── Topic 10: Inquire about training consistency / streak ─────────────────
  if (query.includes('consistent') || query.includes('consistency') || query.includes('streak') || query.includes('often') || query.includes('frequency')) {
    return {
      content: `Consistency Scorecard\n\n- Workouts (Last 14 Days): ${analysis.recentSessionsCount} sessions\n- Current Streak: ${analysis.currentStreakDays} day(s)\n- Best Streak: ${analysis.longestStreakDays} day(s)\n- Total Training Time: ~${analysis.totalTrainingHours} hours\n\n${analysis.recentSessionsCount >= 4 ? 'Excellent discipline. Consistency is the number one predictor of long-term strength gains.' : 'Aim for 3-4 sessions per week for balanced frequency and recovery.'}`,
      supportingData: `${analysis.recentSessionsCount} workouts in 14 days; streak: ${analysis.currentStreakDays} days.`,
      suggestedQuestions: [
        'How did I progress this week?',
        'Which exercise improved the most?'
      ]
    }
  }

  // ─── Topic 11: Inquire about plateau or slowing progress ──────────────────
  if (query.includes('plateau') || query.includes('slowed') || query.includes('stuck') || query.includes('flat')) {
    if (analysis.potentialPlateau) {
      const p = analysis.potentialPlateau
      return {
        content: `Potential Plateau Detected: ${p.exerciseName}\n\n- Observation: ${p.plateauReason || 'Top load has remained flat across consecutive sessions.'}\n- Current Est. 1RM: ${p.current1RM ? `${p.current1RM} kg` : `${p.latestWeight || 0} kg`}\n\nActionable Strategies\n1. Rep Scheme Shift: If you usually do 3x10, try 4x6 with slightly higher focus on power.\n2. Rest Period Adjustment: Extend your rest interval by 45 seconds to ensure full ATP-CP replenishment.\n3. Deload: Drop the load by 10% for one session to dissipate accumulated fatigue.`,
        supportingData: p.supportingData,
        suggestedQuestions: [
          `Should I increase my ${p.exerciseName} weight?`,
          'Which exercise improved the most?'
        ]
      }
    } else {
      return {
        content: `No plateaus detected. All of your tracked exercises are either advancing or maintaining stable progression across your recent workouts.`,
        supportingData: `${analysis.exercises.length} exercises analyzed; 0 plateaus detected.`,
        suggestedQuestions: [
          'Which exercise improved the most?',
          'How did I progress this week?'
        ]
      }
    }
  }

  // ─── Topic 12: Exercise-specific weight increase check ─────────────────────
  const matchedExercise = findExerciseInQuery(query, analysis.exercises)
  if (matchedExercise) {
    const ex = matchedExercise
    if (ex.trend === 'improving' && (ex.oneRMChangePct || 0) >= 3) {
      return {
        content: `Yes, a small increase is appropriate for ${ex.exerciseName}.\n\n- Current Est. 1RM: ${ex.current1RM} kg\n- Recent Trend: +${ex.oneRMChangePct}% improvement over ${ex.totalSessions} sessions\n- Recommendation: Add a conservative 1.0 kg to 2.5 kg in your next session. Ensure your repetition cadence and range of motion remain strict.`,
        supportingData: ex.supportingData,
        suggestedQuestions: [
          'How did I progress this week?',
          'Which exercise improved the most?'
        ]
      }
    } else if (ex.isPlateau) {
      return {
        content: `Hold off on increasing weight for ${ex.exerciseName} right now.\n\n- Observation: ${ex.plateauReason || 'Load has flattened across recent sessions.'}\n- Recommendation: Rather than jumping in weight, focus on adding 1-2 repetitions with your current weight (${ex.latestWeight || ex.current1RM} kg), or improve time under tension before overloading.`,
        supportingData: ex.supportingData,
        suggestedQuestions: [
          `Why has my ${ex.exerciseName} progress slowed?`,
          'Which exercise improved the most?'
        ]
      }
    } else {
      return {
        content: `Current performance on ${ex.exerciseName}:\n\n- Current Est. 1RM: ${ex.current1RM ? `${ex.current1RM} kg` : 'Bodyweight / Reps'}\n- Personal Best: ${ex.best1RM ? `${ex.best1RM} kg` : `${ex.latestWeight || 0} kg`}\n- Sessions Logged: ${ex.totalSessions}\n\n${ex.totalSessions < 2 ? 'Complete at least 2 sessions with this exercise to establish a verified baseline trend.' : 'If you easily completed all target reps in your last set with reserve, consider a small 1-2 kg increase.'}`,
        supportingData: ex.supportingData,
        suggestedQuestions: [
          'Which exercise improved the most?',
          'Am I training consistently?'
        ]
      }
    }
  }

  // ─── Default Fallback ──────────────────────────────────────────────────────
  if (analysis.hasData && analysis.totalWorkouts > 0) {
    return {
      content: `Based on your ${analysis.totalWorkouts} logged workout(s) and ${analysis.exercises.length} tracked exercise(s):\n\n- Total Volume: ${analysis.recentVolume.toLocaleString()} kg moved recently\n- Consistency: ${analysis.recentSessionsCount} sessions in the last 14 days\n${analysis.biggestImprovement ? `- Leading Exercise: ${analysis.biggestImprovement.exerciseName} (+${analysis.biggestImprovement.oneRMChangePct}%)\n` : ''}\nFeel free to ask about exercise technique, workout recommendations, or weight progressions.`,
      supportingData: `${analysis.totalWorkouts} workouts analyzed.`,
      suggestedQuestions: [
        'What should I train today?',
        'How do I do a bench press?',
        'Which exercise improved the most?'
      ]
    }
  }

  return {
    content: `Welcome to GYMTrack AI Coach\n\nI am your personalized fitness assistant. I can guide your exercise form and technique, help you plan today's workout, or explain strength principles.\n\nOnce you log and complete workouts, your 1RM progression and volume tracking will be analyzed automatically.`,
    supportingData: 'Ready for workout logging.',
    suggestedQuestions: [
      'What should I train today?',
      'How do I do a bench press?',
      'How do I do a deadlift?'
    ]
  }
}

function findExerciseInQuery(query: string, exercises: ExerciseCoachAnalysis[]): ExerciseCoachAnalysis | null {
  for (const ex of exercises) {
    const name = ex.exerciseName.toLowerCase()
    if (query.includes(name)) return ex
    const words = name.split(' ')
    for (const w of words) {
      if (w.length >= 4 && query.includes(w)) {
        return ex
      }
    }
  }
  return null
}
