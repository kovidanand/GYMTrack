import type { CoachContext } from '@/types'
import { getWorkoutHistory, getProgressStats, getPersonalRecords } from './progress'

/**
 * Builds a compact, token-efficient context object for the AI Coach
 * using real GYMTrack data from the user's history.
 */
export async function buildCoachContext(profile: any, userId: string): Promise<CoachContext> {
  try {
    // Fetch user data from the progress lib
    const [historyRes, statsRes, prsRes] = await Promise.all([
      getWorkoutHistory(userId),
      getProgressStats(userId),
      getPersonalRecords(userId)
    ])

    // Create a lean history summary
    // Limit history to 10 on the client side
    const recentWorkouts = (historyRes.data || []).slice(0, 10).map((session: any) => ({
      name: session.workout_name,
      date: session.started_at,
      duration_seconds: session.duration_seconds,
      total_volume: session.total_volume,
      total_exercises: session.total_exercises,
      completed_sets: session.completed_sets,
      // Group exercises to show what they did, without bloating context with every single set
      exercises: (session.workout_session_sets || []).map((set: any) => set.exercise_name)
        .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index) // Unique exercise names
    }))

    const topPrs = (prsRes.data || []).map((pr: any) => ({
      exercise: pr.exerciseName,
      best: pr.value,
      unit: pr.unit,
      date: pr.achievedAt
    }))

    return {
      profile: {
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        // Include fitness goals or preferences if available on profile in the future
      },
      progress: statsRes.data || {
        totalWorkouts: 0,
        totalTrainingTime: 0,
        totalVolume: 0,
        currentStreak: 0,
        longestStreak: 0,
        workoutsThisMonth: 0
      },
      recentWorkouts,
      personalRecords: topPrs
    }
  } catch (error) {
    console.error('Error building coach context:', error)
    // Return empty context so AI can still function, just without data
    return {
      profile: { firstName: profile?.first_name },
      progress: {},
      recentWorkouts: [],
      personalRecords: []
    }
  }
}

