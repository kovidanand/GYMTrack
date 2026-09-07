import { supabase } from '@/lib/supabase'
import type { StructuredWorkoutAnalysis, ExerciseCoachAnalysis } from './coachAnalysis'
import { EXERCISE_MEDIA_REGISTRY, getExerciseVisual } from './exerciseMedia'

export interface CoachAnswer {
  content: string
  supportingData?: string
  suggestedQuestions?: string[]
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
      content: `⚠️ **Safety Advisory:** GYMTrack AI Coach is an evidence-grounded fitness assistant, not a physician or licensed medical professional.\n\nIf you are experiencing sharp, localized, or persistent pain, joint swelling, or suspect an injury, **please stop training immediately and consult a healthcare provider or physical therapist**.\n\nNever attempt to lift through acute pain. Athletic progression requires prioritizing joint health and tissue recovery over short-term workout numbers.`,
      supportingData: 'Safety guideline: strict medical guardrails enforced.',
      suggestedQuestions: [
        'What should I train today?',
        'How do I do a bench press?',
        'How has my training volume changed?'
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
        return {
          content: edgeResponse.data.content,
          supportingData: 'Grounded response generated with verified GYMTrack telemetry context.'
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
    query.includes('form for') || 
    query.includes('technique') ||
    query.includes('how to perform') ||
    query.includes('teach me')

  // Check matching technique guide
  for (const [slug, guide] of Object.entries(TECHNIQUE_GUIDES)) {
    const matchesSlug = query.includes(slug)
    const matchesName = query.includes(guide.name.toLowerCase())
    const matchesKeyWords = guide.name.toLowerCase().split(' ').some(w => w.length > 3 && query.includes(w))

    if (isTechniqueQuery || matchesSlug || matchesName || matchesKeyWords) {
      const media = EXERCISE_MEDIA_REGISTRY[slug]
      
      let content = `### 🏋️ Form Guide: ${guide.name}\n\n`
      content += `**Target Muscles:**\n${guide.targetMuscles}\n\n`
      
      if (media?.demonstrationUrl) {
        content += `📸 **Visual Demonstration:** Verified instructional form available in the Exercise Library.\n\n`
      }

      content += `**Proper Setup:**\n`
      guide.setup.forEach((s, idx) => { content += `${idx + 1}. ${s}\n` })
      content += `\n**Movement Execution:**\n`
      guide.execution.forEach((e, idx) => { content += `${idx + 1}. ${e}\n` })
      content += `\n**Breathing Cues:** ${guide.breathing}\n\n`
      content += `**Common Mistakes to Avoid:**\n`
      guide.commonMistakes.forEach(m => { content += `- ❌ ${m}\n` })
      content += `\n**Coach Tips:**\n`
      guide.tips.forEach(t => { content += `- 💡 ${t}\n` })
      content += `\n**Suitable Alternatives:** ${guide.alternatives.join(', ')}`

      return {
        content,
        supportingData: `Verified exercise form guide for ${guide.name} (${media?.attribution || 'Licensed exercise asset'}).`,
        suggestedQuestions: [
          `What should I train today?`,
          `What exercises target upper chest?`,
          `Should I increase my ${guide.name} weight?`
        ]
      }
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
    // If user has recent workout telemetry, reason from it:
    if (analysis.hasData && analysis.recentWorkoutsSummary.length > 0) {
      const lastSession = analysis.recentWorkoutsSummary[0]
      const lastSessionName = lastSession.name.toLowerCase()
      
      let recommendation = ''
      let suggestedExercises: string[] = []

      if (lastSessionName.includes('push') || lastSessionName.includes('chest')) {
        recommendation = 'Pull / Back & Biceps'
        suggestedExercises = ['Barbell Deadlift', 'Lat Pulldown', 'Barbell Row', 'Biceps Curl']
      } else if (lastSessionName.includes('pull') || lastSessionName.includes('back')) {
        recommendation = 'Legs & Core'
        suggestedExercises = ['Barbell Squat', 'Romanian Deadlift', 'Leg Press', 'Plank']
      } else if (lastSessionName.includes('leg') || lastSessionName.includes('lower')) {
        recommendation = 'Upper Body Push'
        suggestedExercises = ['Barbell Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Dips']
      } else {
        recommendation = 'Upper Body or Full Body Conditioning'
        suggestedExercises = ['Bench Press', 'Lat Pulldown', 'Squat', 'Plank']
      }

      return {
        content: `### 🎯 Today's Recommended Session: **${recommendation}**\n\n` +
          `**Why this workout?**\n` +
          `Your last completed session was **${lastSession.name}** on **${lastSession.date}** (${lastSession.volume.toLocaleString()} kg volume). ` +
          `To allow those muscle groups 48 hours to recover while maintaining momentum, training **${recommendation}** is the most balanced choice today.\n\n` +
          `**Core Suggested Exercises:**\n` +
          suggestedExercises.map(e => `- **${e}**: 3–4 working sets (aim for 8–12 reps with ~90s rest)`).join('\n') +
          `\n\n*Tap "+ Start Workout" in your Dashboard to log your sets in real-time!*`,
        supportingData: `Grounded in last completed session (${lastSession.name} on ${lastSession.date}).`,
        suggestedQuestions: [
          'How do I do a bench press?',
          'How has my training volume changed?',
          'Should I increase my weight?'
        ]
      }
    } else {
      // User has 0 logged sessions
      return {
        content: `### 🚀 Starter Workout Recommendation: **Full-Body Foundation**\n\n` +
          `Since you are establishing your baseline, I recommend a foundational full-body routine that activates all primary movement patterns:\n\n` +
          `1. **Barbell Squat** (Knee-dominant / Quads & Glutes): 3 × 8–10 reps\n` +
          `2. **Barbell Bench Press** (Horizontal Push / Chest & Triceps): 3 × 8–10 reps\n` +
          `3. **Lat Pulldown or Pull-Up** (Vertical Pull / Back & Biceps): 3 × 10–12 reps\n` +
          `4. **Romanian Deadlift** (Hip Hinge / Posterior Chain): 3 × 8–10 reps\n` +
          `5. **Plank** (Core Stability): 3 × 30–45 second holds\n\n` +
          `*Once you complete and save this workout, I will calculate your starting 1RMs and track your volume progression!*`,
        supportingData: 'Starter routine generated from baseline full-body movement pattern guidelines.',
        suggestedQuestions: [
          'How do I do a squat?',
          'How do I do a bench press?',
          'How does 1RM calculation work?'
        ]
      }
    }
  }

  // ─── Topic 3: "I haven't trained legs in a week" / Muscle Specific ─────────
  if (query.includes('legs in a week') || query.includes('havent trained legs') || query.includes('missed leg day')) {
    return {
      content: `### 🦵 Leg Day Re-Entry Strategy\n\n` +
        `Since you haven't trained legs in over a week, your neuromuscular system will be responsive, but you are also more susceptible to delayed-onset muscle soreness (DOMS).\n\n` +
        `**Recommended Protocol Today:**\n` +
        `1. **Warm-up:** 5 minutes of cycling or bodyweight lunges + hip mobility.\n` +
        `2. **Barbell Squat:** 3 sets of 8 reps at ~70% of your top weight (leave 2–3 reps in reserve).\n` +
        `3. **Romanian Deadlift:** 3 sets of 10 reps focusing on a deep hamstring stretch.\n` +
        `4. **Leg Press or Walking Lunges:** 2 sets of 12 reps.\n` +
        `5. **Calf Raises:** 3 sets of 15 reps.\n\n` +
        `💡 *Do not test a 1RM today. Re-introduce load progressively to ensure recovery for your next session.*`,
      supportingData: 'Deload re-entry guidance for muscle groups rested >7 days.',
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
      content: `### 🎯 Targeted Exercises for Upper Chest (Clavicular Head)\n\n` +
        `The upper pectoral fibers attach to the clavicle and run diagonally, responding best to incline pressing angles between **30° and 45°**:\n\n` +
        `1. **Incline Barbell Bench Press:** The premier compound builder for upper chest strength and thickness (3–4 sets of 6–10 reps).\n` +
        `2. **Incline Dumbbell Press:** Allows a deeper stretch at the bottom and natural wrist rotation (3 sets of 8–12 reps).\n` +
        `3. **Low-to-High Cable Crossover:** Maintains continuous tension throughout the entire upward arc (3 sets of 12–15 reps).\n` +
        `4. **Decline Push-Ups:** Elevate your feet on a bench to shift bodyweight onto your upper chest.\n\n` +
        `💡 *Tip: Avoid setting the bench incline too high (above 45°), which shifts the emphasis away from the chest to the front deltoids.*`,
      supportingData: 'Biomechanics: clavicular pectoralis line of pull.',
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
      content: `### ⚖️ Lat Pulldown vs. Pull-Up: Biomechanical Differences\n\n` +
        `Both movements target the **Latissimus Dorsi**, but they operate through distinct biomechanical chains:\n\n` +
        `| Characteristic | Pull-Up | Lat Pulldown |\n` +
        `|---|---|---|\n` +
        `| **Kinetic Chain** | Closed-chain (body moves to fixed bar) | Open-chain (bar moves to fixed body) |\n` +
        `| **Core Recruitment** | High (must brace core and glutes) | Moderate (stabilized by thigh pads) |\n` +
        `| **Resistance Scaling** | Limited to bodyweight ± added weight | Fully adjustable in 2.5–5 kg increments |\n` +
        `| **Best Used For** | Relative strength, athleticism | Strict hypertrophy, higher volume burnout |\n\n` +
        `**Coach Verdict:** Use pull-ups early in your back session as a heavy compound, and follow up with lat pulldowns to safely accumulate volume without core fatigue.`,
      supportingData: 'Biomechanical analysis: Closed-kinetic-chain vs Open-kinetic-chain vertical pulling.',
      suggestedQuestions: [
        'How do I do a pull-up?',
        'What should I train today?',
        'How has my training volume changed?'
      ]
    }
  }

  // ─── Topic 6: "I only have 45 minutes today" ──────────────────────────────
  if (query.includes('45 minutes') || query.includes('short on time') || query.includes('quick workout')) {
    return {
      content: `### ⏱️ High-Efficiency 45-Minute Workout Protocol\n\n` +
        `When time is constrained, prioritize **multi-joint compound exercises** and cap rest intervals at **75–90 seconds**:\n\n` +
        `**Warm-up (5 mins):** Arm circles, bodyweight squats, banded pull-aparts.\n\n` +
        `**The 45-Min Routine (35 mins):**\n` +
        `1. **Barbell Squat or Deadlift:** 3 sets × 6–8 reps\n` +
        `2. **Barbell Bench Press:** 3 sets × 8–10 reps\n` +
        `3. **Barbell or Cable Row:** 3 sets × 8–10 reps\n` +
        `4. **Plank:** 2 sets × 45 seconds\n\n` +
        `**Cooldown (5 mins):** Light breathing and mobility stretch.\n\n` +
        `*This routine hits over 80% of total bodily muscle mass in under 45 minutes with maximum progressive overload efficiency.*`,
      supportingData: 'Time-efficient training programming based on compound density.',
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
      content: `### 🌟 The Golden Rules for Gym Beginners\n\n` +
        `Welcome to GYMTrack! Here is your proven blueprint to build strength safely:\n\n` +
        `1. **Master Form Before Weight:** Always leave 2–3 reps in reserve. Never compromise technique to lift heavier.\n` +
        `2. **Focus on the Big 4 Movements:** Squat (legs), Hinge (posterior chain), Push (chest/shoulders), Pull (back).\n` +
        `3. **Train 3 Days Per Week:** Monday / Wednesday / Friday allows 48 hours of rest between sessions for optimal recovery.\n` +
        `4. **Log Every Set:** Use GYMTrack's live workout runner to log your weight and reps. Tracking ensures progressive overload over time.\n\n` +
        `*Would you like me to recommend a starter full-body workout for your first day?*`,
      supportingData: 'Beginner programming guidelines: progressive overload and technical mastery.',
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
        content: `Your biggest improvement is in **${bi.exerciseName}**! 🚀\n\n- **1RM Progression:** ${bi.previous1RM ? `${bi.previous1RM} kg → ` : ''}${bi.current1RM} kg (+${bi.oneRMChangePct}%)\n- **Performance Record:** All-time peak of ${bi.best1RM} kg\n- **Training History:** ${bi.totalSessions} sessions logged\n\nKeep maintaining clean execution and full range of motion.`,
        supportingData: bi.supportingData,
        suggestedQuestions: [
          `Should I increase my ${bi.exerciseName} weight?`,
          'How has my training volume changed?',
          'Am I training consistently?'
        ]
      }
    } else {
      return {
        content: `You have completed **${analysis.totalWorkouts}** workout session(s), but there is not yet enough multi-session progression data to calculate a verified single biggest improvement.\n\nKeep logging your working sets consistently across your routines!`,
        supportingData: `Total sessions: ${analysis.totalWorkouts}. Baseline establishing.`,
        suggestedQuestions: [
          'How has my training volume changed?',
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
        content: `Here is your recent training volume breakdown:\n\n- **Last 14 Days:** ${analysis.recentVolume.toLocaleString()} kg\n- **Prior 14 Days:** ${analysis.previousVolume.toLocaleString()} kg\n- **Change:** ${isUp ? `+${analysis.volumeChangePct}%` : `${analysis.volumeChangePct}%`}\n\n${isUp ? '📈 Your progressive overload is progressing nicely. Make sure your recovery matches your output.' : '📉 Your volume has dipped slightly. If you are on a deload week, this is appropriate; otherwise, aim to finish all target sets.'}`,
        supportingData: `14-day comparison: ${analysis.recentVolume} kg vs ${analysis.previousVolume} kg.`,
        suggestedQuestions: [
          'Am I training consistently?',
          'Which exercise improved the most?'
        ]
      }
    } else {
      return {
        content: `In your recent workouts, you have moved a total of **${analysis.recentVolume.toLocaleString()} kg** of volume across **${analysis.recentSessionsCount}** sessions.\n\nAs you log workouts into your second week, I will chart your bi-weekly volume delta.`,
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
      content: `Here is your consistency scorecard:\n\n- **Workouts (Last 14 Days):** ${analysis.recentSessionsCount} sessions\n- **Current Streak:** ${analysis.currentStreakDays} day(s)\n- **Best Streak:** ${analysis.longestStreakDays} day(s)\n- **Total Training Time:** ~${analysis.totalTrainingHours} hours\n\n${analysis.recentSessionsCount >= 4 ? '🔥 Excellent discipline! Consistency is the number one predictor of long-term strength gains.' : '💡 Aim for 3–4 sessions per week for balanced frequency and recovery.'}`,
      supportingData: `${analysis.recentSessionsCount} workouts in 14 days; streak: ${analysis.currentStreakDays} days.`,
      suggestedQuestions: [
        'How has my training volume changed?',
        'Which exercise improved the most?'
      ]
    }
  }

  // ─── Topic 11: Inquire about plateau or slowing progress ──────────────────
  if (query.includes('plateau') || query.includes('slowed') || query.includes('stuck') || query.includes('flat')) {
    if (analysis.potentialPlateau) {
      const p = analysis.potentialPlateau
      return {
        content: `I detected a potential plateau in **${p.exerciseName}**:\n\n- **Observation:** ${p.plateauReason || 'Top load has remained flat across consecutive sessions.'}\n- **Current Est. 1RM:** ${p.current1RM ? `${p.current1RM} kg` : `${p.latestWeight || 0} kg`}\n\n**Actionable Strategies:**\n1. **Rep Scheme Shift:** If you usually do 3×10, try 4×6 with slightly higher focus on power.\n2. **Rest Period Adjustment:** Extend your rest interval by 45 seconds to ensure full ATP-CP replenishment.\n3. **Deload:** Drop the load by 10% for one session to dissipate accumulated fatigue.`,
        supportingData: p.supportingData,
        suggestedQuestions: [
          `Should I increase my ${p.exerciseName} weight?`,
          'Which exercise improved the most?'
        ]
      }
    } else {
      return {
        content: `Great news! None of your tracked exercises exhibit signs of a plateau across your recent workouts.\n\nAll exercises with sufficient data are either advancing or maintaining stable progression.`,
        supportingData: `${analysis.exercises.length} exercises analyzed; 0 plateaus detected.`,
        suggestedQuestions: [
          'Which exercise improved the most?',
          'How has my training volume changed?'
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
        content: `**Yes, a small increase is appropriate for ${ex.exerciseName}!** ✅\n\n- **Current Est. 1RM:** ${ex.current1RM} kg\n- **Recent Trend:** +${ex.oneRMChangePct}% improvement over ${ex.totalSessions} sessions\n- **Recommendation:** Add a conservative **1.0 kg to 2.5 kg** in your next session. Ensure your repetition cadence and range of motion remain strict.`,
        supportingData: ex.supportingData,
        suggestedQuestions: [
          'How has my training volume changed?',
          'Which exercise improved the most?'
        ]
      }
    } else if (ex.isPlateau) {
      return {
        content: `**Hold off on increasing weight for ${ex.exerciseName} right now.** ⏸️\n\n- **Observation:** ${ex.plateauReason || 'Load has flattened across recent sessions.'}\n- **Recommendation:** Rather than jumping in weight, focus on adding 1–2 repetitions with your current weight (${ex.latestWeight || ex.current1RM} kg), or improve time under tension before overloading.`,
        supportingData: ex.supportingData,
        suggestedQuestions: [
          `Why has my ${ex.exerciseName} progress slowed?`,
          'Which exercise improved the most?'
        ]
      }
    } else {
      return {
        content: `Here is your current performance on **${ex.exerciseName}**:\n\n- **Current Est. 1RM:** ${ex.current1RM ? `${ex.current1RM} kg` : 'Bodyweight / Reps'}\n- **Personal Best:** ${ex.best1RM ? `${ex.best1RM} kg` : `${ex.latestWeight || 0} kg`}\n- **Sessions Logged:** ${ex.totalSessions}\n\n${ex.totalSessions < 2 ? '⚠️ Complete at least 2 sessions with this exercise to establish a verified baseline trend.' : 'If you easily completed all target reps in your last set with reserve, consider a small 1–2 kg increase.'}`,
        supportingData: ex.supportingData,
        suggestedQuestions: [
          'Which exercise improved the most?',
          'Am I training consistently?'
        ]
      }
    }
  }

  // ─── Default Fallback: Grounded in Telemetry ──────────────────────────────
  if (analysis.hasData && analysis.totalWorkouts > 0) {
    return {
      content: `Based on your **${analysis.totalWorkouts}** logged workout(s) and **${analysis.exercises.length}** tracked exercise(s):\n\n- **Total Volume:** ${analysis.recentVolume.toLocaleString()} kg moved recently\n- **Consistency:** ${analysis.recentSessionsCount} sessions in the last 14 days\n${analysis.biggestImprovement ? `- **Leading Exercise:** ${analysis.biggestImprovement.exerciseName} (+${analysis.biggestImprovement.oneRMChangePct}%)\n` : ''}\nFeel free to ask me about exercise technique, workout recommendations, or weight progressions!`,
      supportingData: `${analysis.totalWorkouts} workouts analyzed in telemetry window.`,
      suggestedQuestions: [
        'What should I train today?',
        'How do I do a bench press?',
        'Which exercise improved the most?'
      ]
    }
  }

  return {
    content: `Welcome to GYMTrack AI Coach! 🏋️\n\nI am your personalized fitness assistant. I can guide your **exercise form & technique**, help you **plan today's workout**, or explain **strength principles**.\n\nOnce you log and complete workouts in the app, I will automatically analyze your 1RM progression and volume overload!`,
    supportingData: 'Ready for baseline workout logging.',
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
