import { supabase } from '@/lib/supabase'
import type { StructuredWorkoutAnalysis, ExerciseCoachAnalysis } from './coachAnalysis'

export interface CoachAnswer {
  content: string
  supportingData?: string
  suggestedQuestions?: string[]
}

/**
 * Clean AI Provider abstraction.
 * Attempts cloud LLM call via Supabase Edge Function with compact structured context.
 * If cloud LLM is unavailable, offline, or unconfigured, falls back seamlessly
 * to the deterministic, data-grounded analysis engine without leaking errors or keys.
 */
export async function askCoachQuestion(
  query: string,
  analysis: StructuredWorkoutAnalysis
): Promise<CoachAnswer> {
  const cleanQuery = query.trim().toLowerCase()

  // 1. Safety Check: Medical, injury, and severe pain safety guardrails
  const medicalKeywords = ['pain', 'hurt', 'injury', 'injuries', 'torn', 'tear', 'sprain', 'doctor', 'physio', 'rehab', 'swelling', 'sharp pain']
  const hasMedicalQuery = medicalKeywords.some(kw => cleanQuery.includes(kw))

  if (hasMedicalQuery) {
    return {
      content: `⚠️ **Safety Advisory:** GYMTrack AI Coach is a training analytics assistant, not a doctor or physical therapist.\n\nIf you are experiencing sharp, persistent, or unusual pain or suspect an injury, please **rest immediately and consult a qualified healthcare professional**.\n\nDo not attempt to push through joint pain or acute injuries. Safe, long-term athletic longevity always takes priority over a single workout.`,
      supportingData: 'Safety guideline: zero tolerance for medical diagnosis or training through pain.',
      suggestedQuestions: [
        'How has my training volume changed?',
        'Which exercise improved the most?',
        'Am I training consistently?'
      ]
    }
  }

  // 2. Try Supabase Edge Function with compact structured context
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session && navigator.onLine) {
      const edgeResponse = await supabase.functions.invoke('ai-coach', {
        body: {
          messages: [{ role: 'user', content: query }],
          context: {
            hasData: analysis.hasData,
            totalWorkouts: analysis.totalWorkouts,
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
            } : null,
            exercises: analysis.exercises.slice(0, 6).map(e => ({
              name: e.exerciseName,
              trend: e.trend,
              current1RM: e.current1RM,
              sessions: e.totalSessions
            }))
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
  // Case A: User has zero workouts recorded
  if (!analysis.hasData || analysis.totalWorkouts === 0) {
    return {
      content: `You don't have any completed workouts recorded yet! 🏋️\n\nOnce you complete and log your first workout (or generate a starter routine from the Workouts tab), I will analyze your sets, calculate your estimated 1RMs using the Epley formula, and provide evidence-backed recommendations.`,
      supportingData: '0 workouts found in database.',
      suggestedQuestions: [
        'What should I train today?',
        'How does 1RM calculation work?',
        'How do I stay consistent?'
      ]
    }
  }

  // Case B: Inquire about biggest improvement
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
        content: `You have completed **${analysis.totalWorkouts}** workout session(s), but there is not yet enough multi-session progression data to crown a single biggest improvement.\n\nKeep logging your working sets consistently across your routines!`,
        supportingData: `Total sessions: ${analysis.totalWorkouts}. Baseline establishing.`,
        suggestedQuestions: [
          'How has my training volume changed?',
          'Am I training consistently?'
        ]
      }
    }
  }

  // Case C: Inquire about training volume
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

  // Case D: Inquire about training consistency / streak
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

  // Case E: Inquire about plateau or slowing progress
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

  // Case F: Exercise-specific weight increase check (e.g. "Should I increase my bench weight?", "squat weight", etc.)
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

  // General Fallback grounded in telemetry
  return {
    content: `Based on your **${analysis.totalWorkouts}** logged workout(s) and **${analysis.exercises.length}** tracked exercise(s):\n\n- **Total Volume:** ${analysis.recentVolume.toLocaleString()} kg moved recently\n- **Consistency:** ${analysis.recentSessionsCount} sessions in the last 14 days\n${analysis.biggestImprovement ? `- **Leading Exercise:** ${analysis.biggestImprovement.exerciseName} (+${analysis.biggestImprovement.oneRMChangePct}%)\n` : ''}\nFeel free to ask me specific questions about your exercises, training volume, or consistency!`,
    supportingData: `${analysis.totalWorkouts} workouts analyzed in telemetry window.`,
    suggestedQuestions: [
      'Which exercise improved the most?',
      'How has my training volume changed?',
      'Am I training consistently?'
    ]
  }
}

function findExerciseInQuery(query: string, exercises: ExerciseCoachAnalysis[]): ExerciseCoachAnalysis | null {
  for (const ex of exercises) {
    const name = ex.exerciseName.toLowerCase()
    if (query.includes(name)) return ex
    // Partial word matching (e.g. "bench", "squat", "deadlift", "pull up", "press")
    const words = name.split(' ')
    for (const w of words) {
      if (w.length >= 4 && query.includes(w)) {
        return ex
      }
    }
  }
  return null
}
