import { supabase } from '@/lib/supabase'
import { calculate1RM } from '@/lib/exerciseIntelligence'
import type { WorkoutSession, WorkoutSessionSet } from '@/types'

export interface ExerciseCoachAnalysis {
  exerciseId: string
  exerciseName: string
  totalSessions: number
  totalSets: number
  current1RM: number | null
  previous1RM: number | null
  best1RM: number | null
  oneRMChangePct: number | null
  latestWeight: number | null
  previousWeight: number | null
  weightChangePct: number | null
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data'
  isPlateau: boolean
  plateauReason?: string
  lastPerformedDate: string | null
  isBodyweight: boolean
  supportingData: string
}

export interface CoachRecommendation {
  id: string
  category: 'PROGRESSION' | 'PLATEAU' | 'VOLUME' | 'CONSISTENCY' | 'RECOVERY'
  title: string
  recommendation: string
  reason: string
  supportingData: string
  confidence: 'HIGH' | 'MODERATE' | 'PRELIMINARY'
}

export interface StructuredWorkoutAnalysis {
  hasData: boolean
  totalWorkouts: number
  recentSessionsCount: number    // last 14 days
  previousSessionsCount: number  // 14-28 days ago
  frequencyTrend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data'
  recentVolume: number           // kg in last 14 days
  previousVolume: number         // kg in 14-28 days ago
  volumeChangePct: number | null
  totalTrainingHours: number
  currentStreakDays: number
  longestStreakDays: number
  exercises: ExerciseCoachAnalysis[]
  biggestImprovement: ExerciseCoachAnalysis | null
  potentialPlateau: ExerciseCoachAnalysis | null
  recommendations: CoachRecommendation[]
  recoveryNotice: string
  recentWorkoutsSummary: Array<{
    date: string
    name: string
    durationMins: number
    volume: number
    exercisesCount: number
  }>
}

interface RawSessionWithSets extends WorkoutSession {
  workout_session_sets?: WorkoutSessionSet[]
}

/**
 * Deterministically analyzes the user's real GYMTrack workout history from Supabase.
 * Pre-computes 1RM metrics, volume deltas, plateau signals, and evidence-grounded recommendations.
 */
export async function getStructuredWorkoutAnalysis(userId: string): Promise<StructuredWorkoutAnalysis> {
  const recoveryNotice = 'Recommendations are grounded exclusively in logged workout volume, frequency, and load progression. GYMTrack does not track biometric recovery metrics such as sleep, HRV, or soreness.'

  try {
    // 1. Fetch up to 25 recent workout sessions with their sets
    const { data: sessionsData, error: sErr } = await supabase
      .from('workout_sessions')
      .select(`
        id,
        workout_name,
        started_at,
        completed_at,
        duration_seconds,
        total_exercises,
        total_sets,
        completed_sets,
        total_volume,
        workout_session_sets (
          id,
          exercise_id,
          exercise_name,
          set_number,
          weight,
          reps,
          completed,
          is_personal_record,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(25)

    if (sErr || !sessionsData || sessionsData.length === 0) {
      return {
        hasData: false,
        totalWorkouts: 0,
        recentSessionsCount: 0,
        previousSessionsCount: 0,
        frequencyTrend: 'insufficient_data',
        recentVolume: 0,
        previousVolume: 0,
        volumeChangePct: null,
        totalTrainingHours: 0,
        currentStreakDays: 0,
        longestStreakDays: 0,
        exercises: [],
        biggestImprovement: null,
        potentialPlateau: null,
        recommendations: [],
        recoveryNotice,
        recentWorkoutsSummary: []
      }
    }

    const sessions = sessionsData as unknown as RawSessionWithSets[]
    const now = Date.now()
    const ms14Days = 14 * 24 * 60 * 60 * 1000
    const ms28Days = 28 * 24 * 60 * 60 * 1000

    let recentVolume = 0
    let previousVolume = 0
    let recentSessionsCount = 0
    let previousSessionsCount = 0
    let totalTrainingSeconds = 0

    // Recent workouts summary
    const recentWorkoutsSummary = sessions.slice(0, 5).map(s => ({
      date: new Date(s.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      name: s.workout_name,
      durationMins: Math.round((s.duration_seconds || 0) / 60),
      volume: s.total_volume || 0,
      exercisesCount: s.total_exercises || 0
    }))

    // Volume and frequency comparison
    sessions.forEach(s => {
      const sTime = new Date(s.started_at).getTime()
      const diff = now - sTime
      totalTrainingSeconds += (s.duration_seconds || 0)

      if (diff <= ms14Days) {
        recentSessionsCount++
        recentVolume += (s.total_volume || 0)
      } else if (diff <= ms28Days) {
        previousSessionsCount++
        previousVolume += (s.total_volume || 0)
      }
    })

    let volumeChangePct: number | null = null
    if (previousVolume > 0) {
      volumeChangePct = Math.round(((recentVolume - previousVolume) / previousVolume) * 1000) / 10
    }

    let frequencyTrend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' = 'insufficient_data'
    if (previousSessionsCount > 0 || recentSessionsCount >= 2) {
      if (recentSessionsCount > previousSessionsCount) frequencyTrend = 'increasing'
      else if (recentSessionsCount < previousSessionsCount) frequencyTrend = 'decreasing'
      else frequencyTrend = 'stable'
    }

    // Streaks calculation
    const uniqueDays = [...new Set(sessions.map(s => s.started_at.split('T')[0]))].sort().reverse()
    let currentStreak = 0
    let longestStreak = 0
    let prevDate: string | null = null

    uniqueDays.forEach((dayStr, i) => {
      const d = new Date(dayStr)
      d.setHours(0, 0, 0, 0)

      if (i === 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const daysAgo = (today.getTime() - d.getTime()) / (1000 * 3600 * 24)
        if (daysAgo <= 1) currentStreak = 1
      } else if (prevDate) {
        const p = new Date(prevDate)
        p.setHours(0, 0, 0, 0)
        const diffDays = (p.getTime() - d.getTime()) / (1000 * 3600 * 24)
        if (diffDays === 1) {
          if (currentStreak > 0) currentStreak++
        } else {
          if (currentStreak > longestStreak) longestStreak = currentStreak
          currentStreak = 0
        }
      }
      prevDate = dayStr
    })
    if (currentStreak > longestStreak) longestStreak = currentStreak

    // 2. Exercise-by-Exercise 1RM and Progression Analysis
    const exerciseSessionsMap = new Map<string, {
      exerciseName: string
      sessions: Array<{
        date: string
        maxWeight: number | null
        best1RM: number | null
        totalSets: number
      }>
    }>()

    // Aggregate sets into chronological exercise sessions
    sessions.forEach(s => {
      if (!s.workout_session_sets) return

      const sessionExerciseSets = new Map<string, WorkoutSessionSet[]>()
      s.workout_session_sets.forEach(set => {
        if (!set.exercise_id) return
        if (!sessionExerciseSets.has(set.exercise_id)) {
          sessionExerciseSets.set(set.exercise_id, [])
        }
        sessionExerciseSets.get(set.exercise_id)!.push(set)
      })

      sessionExerciseSets.forEach((sets, exId) => {
        const exName = sets[0]?.exercise_name || 'Exercise'
        let sessionMaxWeight: number | null = null
        let sessionBest1RM: number | null = null

        sets.forEach(set => {
          const w = set.weight ? Number(set.weight) : null
          const r = set.reps ? Number(set.reps) : null
          if (w != null && w > 0) {
            if (sessionMaxWeight == null || w > sessionMaxWeight) {
              sessionMaxWeight = w
            }
          }
          const est1RM = calculate1RM(w, r)
          if (est1RM != null) {
            if (sessionBest1RM == null || est1RM > sessionBest1RM) {
              sessionBest1RM = est1RM
            }
          }
        })

        if (!exerciseSessionsMap.has(exId)) {
          exerciseSessionsMap.set(exId, {
            exerciseName: exName,
            sessions: []
          })
        }

        exerciseSessionsMap.get(exId)!.sessions.push({
          date: s.started_at,
          maxWeight: sessionMaxWeight,
          best1RM: sessionBest1RM,
          totalSets: sets.length
        })
      })
    })

    const exercisesAnalysis: ExerciseCoachAnalysis[] = []

    exerciseSessionsMap.forEach((entry, exId) => {
      // Sort sessions oldest to newest for chronological delta
      const chronological = entry.sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const totalSessions = chronological.length
      const totalSets = chronological.reduce((sum, s) => sum + s.totalSets, 0)
      const lastSession = chronological[chronological.length - 1]
      const prevSession = chronological.length >= 2 ? chronological[chronological.length - 2] : null
      const firstSession = chronological[0]

      const current1RM = lastSession.best1RM
      const previous1RM = prevSession?.best1RM ?? null
      const latestWeight = lastSession.maxWeight
      const previousWeight = prevSession?.maxWeight ?? null

      // All-time best 1RM
      let best1RM: number | null = null
      chronological.forEach(s => {
        if (s.best1RM != null) {
          if (best1RM == null || s.best1RM > best1RM) best1RM = s.best1RM
        }
      })

      const isBodyweight = (latestWeight == null || latestWeight === 0) && (best1RM == null)

      let oneRMChangePct: number | null = null
      if (firstSession.best1RM && current1RM && firstSession.best1RM > 0) {
        oneRMChangePct = Math.round(((current1RM - firstSession.best1RM) / firstSession.best1RM) * 1000) / 10
      }

      let weightChangePct: number | null = null
      if (firstSession.maxWeight && latestWeight && firstSession.maxWeight > 0) {
        weightChangePct = Math.round(((latestWeight - firstSession.maxWeight) / firstSession.maxWeight) * 1000) / 10
      }

      // Trend classification
      let trend: 'improving' | 'declining' | 'stable' | 'insufficient_data' = 'insufficient_data'
      if (totalSessions >= 2) {
        const delta = oneRMChangePct ?? weightChangePct ?? 0
        if (delta >= 2.5) trend = 'improving'
        else if (delta <= -2.5) trend = 'declining'
        else trend = 'stable'
      }

      // Plateau detection: 3+ consecutive sessions with 0% or <1% delta
      let isPlateau = false
      let plateauReason: string | undefined = undefined

      if (totalSessions >= 3) {
        const last3 = chronological.slice(-3)
        const weights = last3.map(s => s.maxWeight).filter(w => w != null) as number[]
        const oneRMs = last3.map(s => s.best1RM).filter(r => r != null) as number[]

        if (weights.length === 3 && weights[0] === weights[1] && weights[1] === weights[2]) {
          isPlateau = true
          plateauReason = `Identical top load of ${weights[0]} kg across your last 3 sessions.`
        } else if (oneRMs.length === 3) {
          const maxDelta = Math.max(...oneRMs) - Math.min(...oneRMs)
          if (maxDelta <= 0.5) {
            isPlateau = true
            plateauReason = `Estimated 1RM has remained flat at ~${oneRMs[0]} kg across your last 3 workouts.`
          }
        }
      }

      // Supporting Data Evidence String
      let supportingData = ''
      if (current1RM && firstSession.best1RM && totalSessions >= 2) {
        supportingData = `Estimated 1RM: ${firstSession.best1RM} kg → ${current1RM} kg over ${totalSessions} sessions.`
      } else if (latestWeight && firstSession.maxWeight && totalSessions >= 2) {
        supportingData = `Top load: ${firstSession.maxWeight} kg → ${latestWeight} kg over ${totalSessions} sessions.`
      } else if (totalSessions === 1) {
        supportingData = `Single baseline session: ${current1RM ? `${current1RM} kg est. 1RM` : `${latestWeight || 0} kg`}.`
      } else {
        supportingData = `${totalSessions} sessions logged.`
      }

      exercisesAnalysis.push({
        exerciseId: exId,
        exerciseName: entry.exerciseName,
        totalSessions,
        totalSets,
        current1RM,
        previous1RM,
        best1RM,
        oneRMChangePct,
        latestWeight,
        previousWeight,
        weightChangePct,
        trend,
        isPlateau,
        plateauReason,
        lastPerformedDate: lastSession.date,
        isBodyweight,
        supportingData
      })
    })

    // Sort exercises by most sessions performed
    exercisesAnalysis.sort((a, b) => b.totalSessions - a.totalSessions)

    // Identify biggest improvement
    const improving = exercisesAnalysis.filter(e => (e.oneRMChangePct || 0) > 0)
    improving.sort((a, b) => (b.oneRMChangePct || 0) - (a.oneRMChangePct || 0))
    const biggestImprovement = improving.length > 0 ? improving[0] : null

    // Identify potential plateau
    const plateaued = exercisesAnalysis.filter(e => e.isPlateau)
    const potentialPlateau = plateaued.length > 0 ? plateaued[0] : null

    // 3. Generate Grounded Recommendations
    const recommendations: CoachRecommendation[] = []

    // Recommendation 1: Progression
    if (biggestImprovement && (biggestImprovement.oneRMChangePct || 0) >= 3) {
      recommendations.push({
        id: 'rec-progression',
        category: 'PROGRESSION',
        title: `Progressive Overload: ${biggestImprovement.exerciseName}`,
        recommendation: `Your estimated 1RM has advanced +${biggestImprovement.oneRMChangePct}%. If your execution and range of motion remain clean, consider adding a conservative 1–2.5 kg load in your next workout.`,
        reason: 'Demonstrated upward trajectory in maximum estimated output across multiple sessions.',
        supportingData: biggestImprovement.supportingData,
        confidence: biggestImprovement.totalSessions >= 4 ? 'HIGH' : 'MODERATE'
      })
    }

    // Recommendation 2: Plateau Alert & Strategy
    if (potentialPlateau) {
      recommendations.push({
        id: 'rec-plateau',
        category: 'PLATEAU',
        title: `Plateau Signal: ${potentialPlateau.exerciseName}`,
        recommendation: `Your progress has flattened over 3 sessions. Try altering your rep range (e.g. shift from 8–10 reps to 5–6 heavy sets), increasing rest intervals by 30 seconds, or performing a 1-week deload.`,
        reason: potentialPlateau.plateauReason || 'Stagnant top load across consecutive training cycles.',
        supportingData: potentialPlateau.supportingData,
        confidence: 'HIGH'
      })
    }

    // Recommendation 3: Volume Trend
    if (volumeChangePct != null) {
      if (volumeChangePct >= 10) {
        recommendations.push({
          id: 'rec-volume-up',
          category: 'VOLUME',
          title: 'Volume Overload Trending Up',
          recommendation: `Total training volume is up +${volumeChangePct}% over the last 14 days (${recentVolume.toLocaleString()} kg vs ${previousVolume.toLocaleString()} kg). Ensure 48 hours of recovery before retraining the same muscle groups.`,
          reason: 'Substantial multi-week tonnage increase stimulating muscular adaptation.',
          supportingData: `14-day volume: ${recentVolume.toLocaleString()} kg vs ${previousVolume.toLocaleString()} kg previously.`,
          confidence: 'HIGH'
        })
      } else if (volumeChangePct <= -12) {
        recommendations.push({
          id: 'rec-volume-down',
          category: 'VOLUME',
          title: 'Volume Reduction Detected',
          recommendation: `Weekly training volume has decreased by ${Math.abs(volumeChangePct)}%. If deliberate (e.g. deload or travel week), this supports systemic fatigue dissipation. If unintentional, prioritize completing all scheduled working sets.`,
          reason: 'Decrease in total lifted volume compared with prior baseline period.',
          supportingData: `14-day volume: ${recentVolume.toLocaleString()} kg vs ${previousVolume.toLocaleString()} kg previously.`,
          confidence: 'HIGH'
        })
      }
    }

    // Recommendation 4: Training Consistency
    if (recentSessionsCount >= 3) {
      recommendations.push({
        id: 'rec-consistency',
        category: 'CONSISTENCY',
        title: 'Strong Training Frequency',
        recommendation: `You have completed ${recentSessionsCount} workouts over the past two weeks. Maintaining this frequency drives compounding neurological and hypertrophic adaptations.`,
        reason: 'Consistent stimulus frequency without extended lapses between sessions.',
        supportingData: `${recentSessionsCount} sessions completed in last 14 days (Current streak: ${currentStreak} days).`,
        confidence: 'HIGH'
      })
    } else if (recentSessionsCount === 1 || recentSessionsCount === 2) {
      recommendations.push({
        id: 'rec-consistency-low',
        category: 'CONSISTENCY',
        title: 'Building Workout Momentum',
        recommendation: 'Target scheduling your next workout within 48 to 72 hours to establish consistent training momentum and preserve strength adaptations.',
        reason: 'Lower frequency may prolong adaptation cycles between workouts.',
        supportingData: `${recentSessionsCount} workout(s) logged in the last 14 days.`,
        confidence: 'MODERATE'
      })
    }

    // Recommendation 5: Recovery Awareness (Strictly truthful)
    recommendations.push({
      id: 'rec-recovery-awareness',
      category: 'RECOVERY',
      title: 'Recovery Transparency Notice',
      recommendation: 'Allow 48 to 72 hours of recovery between high-intensity sessions targeting the same muscle groups. Listen to your body and prioritize nutrition and sleep.',
      reason: 'Recommendations are calculated from training volume and load progression alone. GYMTrack does not record biometric recovery (sleep, HRV, readiness).',
      supportingData: 'Training load analysis based on 25 recent sessions.',
      confidence: 'HIGH'
    })

    return {
      hasData: true,
      totalWorkouts: sessions.length,
      recentSessionsCount,
      previousSessionsCount,
      frequencyTrend,
      recentVolume,
      previousVolume,
      volumeChangePct,
      totalTrainingHours: Math.round((totalTrainingSeconds / 3600) * 10) / 10,
      currentStreakDays: currentStreak,
      longestStreakDays: longestStreak,
      exercises: exercisesAnalysis,
      biggestImprovement,
      potentialPlateau,
      recommendations,
      recoveryNotice,
      recentWorkoutsSummary
    }
  } catch (err) {
    console.error('[GYMTrack CoachAnalysis] Analysis exception:', err)
    return {
      hasData: false,
      totalWorkouts: 0,
      recentSessionsCount: 0,
      previousSessionsCount: 0,
      frequencyTrend: 'insufficient_data',
      recentVolume: 0,
      previousVolume: 0,
      volumeChangePct: null,
      totalTrainingHours: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      exercises: [],
      biggestImprovement: null,
      potentialPlateau: null,
      recommendations: [],
      recoveryNotice,
      recentWorkoutsSummary: []
    }
  }
}
