import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeGymtrackEvent } from '@/lib/events'
import { getStructuredWorkoutAnalysis, type StructuredWorkoutAnalysis } from '@/lib/coachAnalysis'
import { askCoachQuestion, type CoachAnswer, type PendingLogPayload } from '@/lib/coachProvider'
import { buildCoachContext } from '@/lib/contextBuilder'
import { logCanonicalWorkout } from '@/lib/workoutService'
import type { StructuredExerciseGuidance, StructuredWorkoutRecommendation } from '@/types'

export interface CoachChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  supportingData?: string
  suggestedQuestions?: string[]
  imageUrl?: string
  structuredGuidance?: StructuredExerciseGuidance
  structuredRecommendation?: StructuredWorkoutRecommendation
  pendingLog?: PendingLogPayload
  createdAt: number
}

export function useAiCoach() {
  const { user, profile } = useAuth()
  const [analysis, setAnalysis] = useState<StructuredWorkoutAnalysis | null>(null)
  const [messages, setMessages] = useState<CoachChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [isAsking, setIsAsking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalysis = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getStructuredWorkoutAnalysis(user.id)
      setAnalysis(data)
    } catch (err) {
      console.error('[GYMTrack useAiCoach] Failed to load workout analysis:', err)
      setError('Unable to load workout analysis at this time.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadAnalysis()

    const unsub1 = subscribeGymtrackEvent('gymtrack:session_completed', () => loadAnalysis())
    const unsub2 = subscribeGymtrackEvent('gymtrack:sync_completed', () => loadAnalysis())
    const unsub3 = subscribeGymtrackEvent('gymtrack:workout_updated', () => loadAnalysis())

    return () => {
      unsub1()
      unsub2()
      unsub3()
    }
  }, [loadAnalysis])

  const confirmPendingLog = async (targetMsgId?: string) => {
    if (!user) return
    setIsAsking(true)

    // Locate target message with pending log
    const target = targetMsgId 
      ? messages.find(m => m.id === targetMsgId && m.pendingLog && !m.pendingLog.logged)
      : [...messages].reverse().find(m => m.pendingLog && !m.pendingLog.logged)

    if (!target || !target.pendingLog) {
      setIsAsking(false)
      return
    }

    const log = target.pendingLog

    try {
      const setsPayload = Array.from({ length: log.sets }, (_, i) => ({
        setNumber: i + 1,
        weight: log.weight,
        reps: log.reps,
        completed: true
      }))

      await logCanonicalWorkout({
        userId: user.id,
        workoutName: `${log.exerciseName} Training`,
        exercises: [{
          exerciseId: log.exerciseId,
          exerciseName: log.exerciseName,
          sets: setsPayload
        }],
        source: 'ai_coach'
      })

      // Mark target message as logged
      setMessages(prev => prev.map(m => {
        if (m.id === target.id && m.pendingLog) {
          return {
            ...m,
            pendingLog: { ...m.pendingLog, logged: true }
          }
        }
        return m
      }))

      // Append confirmation success message
      const successMsg: CoachChatMessage = {
        id: 'coach-' + Date.now(),
        role: 'assistant',
        content: `Logged **${log.exerciseName}** (${log.sets} sets × ${log.reps} reps @ ${log.weight} kg) to your workout history!\n\nYour Home Dashboard and Progress analytics have been updated.`,
        supportingData: 'Logged via canonical workoutService',
        suggestedQuestions: ['What should I train next?', "What's my estimated 1RM?"],
        createdAt: Date.now()
      }
      setMessages(prev => [...prev, successMsg])
      await loadAnalysis()
    } catch (err) {
      console.error('[GYMTrack useAiCoach] Failed to confirm log:', err)
    } finally {
      setIsAsking(false)
    }
  }

  const cancelPendingLog = (targetMsgId?: string) => {
    setMessages(prev => prev.map(m => {
      if ((!targetMsgId || m.id === targetMsgId) && m.pendingLog && !m.pendingLog.logged) {
        return {
          ...m,
          pendingLog: { ...m.pendingLog, logged: true }
        }
      }
      return m
    }))

    const cancelMsg: CoachChatMessage = {
      id: 'coach-' + Date.now(),
      role: 'assistant',
      content: 'Workout logging cancelled. Let me know whenever you want to record a session.',
      createdAt: Date.now()
    }
    setMessages(prev => [...prev, cancelMsg])
  }

  const ask = async (query: string): Promise<CoachAnswer | null> => {
    if (!query.trim()) return null
    const cleanLower = query.trim().toLowerCase()

    // Check if user confirmed the pending workout log via text ("confirm", "yes", "confirm & log")
    if (cleanLower === 'confirm' || cleanLower === 'confirm and log' || cleanLower === 'yes' || cleanLower === 'log it') {
      const activePending = [...messages].reverse().find(m => m.pendingLog && !m.pendingLog.logged)
      if (activePending) {
        const userMsg: CoachChatMessage = {
          id: 'user-' + Date.now(),
          role: 'user',
          content: query.trim(),
          createdAt: Date.now()
        }
        setMessages(prev => [...prev, userMsg])
        await confirmPendingLog(activePending.id)
        return null
      }
    }

    if (cleanLower === 'cancel' || cleanLower === 'no') {
      const activePending = [...messages].reverse().find(m => m.pendingLog && !m.pendingLog.logged)
      if (activePending) {
        const userMsg: CoachChatMessage = {
          id: 'user-' + Date.now(),
          role: 'user',
          content: query.trim(),
          createdAt: Date.now()
        }
        setMessages(prev => [...prev, userMsg])
        cancelPendingLog(activePending.id)
        return null
      }
    }

    const userMsgId = 'user-' + Date.now()
    const assistantMsgId = 'coach-' + (Date.now() + 1)

    // Append user message immediately
    const userMsg: CoachChatMessage = {
      id: userMsgId,
      role: 'user',
      content: query.trim(),
      createdAt: Date.now()
    }
    setMessages(prev => [...prev, userMsg])
    setIsAsking(true)

    try {
      const fallbackAnalysis: StructuredWorkoutAnalysis = analysis || {
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
        recoveryNotice: 'Grounded in logged training data only.',
        recentWorkoutsSummary: []
      }

      const coachContext = user ? await buildCoachContext(profile, user.id) : null
      const answer = await askCoachQuestion(query, fallbackAnalysis, coachContext, user?.id)

      const assistantMsg: CoachChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: answer.content,
        supportingData: answer.supportingData,
        suggestedQuestions: answer.suggestedQuestions,
        imageUrl: answer.imageUrl,
        structuredGuidance: answer.structuredGuidance,
        structuredRecommendation: answer.structuredRecommendation,
        pendingLog: answer.pendingLog,
        createdAt: Date.now()
      }

      setMessages(prev => [...prev, assistantMsg])
      return answer
    } catch (err) {
      console.error('[GYMTrack useAiCoach] Ask error:', err)
      const errorMsg: CoachChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: 'I encountered an issue analyzing your query. Please try asking again.',
        createdAt: Date.now()
      }
      setMessages(prev => [...prev, errorMsg])
      return null
    } finally {
      setIsAsking(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return {
    analysis,
    messages,
    loading,
    isAsking,
    error,
    ask,
    confirmPendingLog,
    cancelPendingLog,
    clearChat,
    refresh: loadAnalysis
  }
}
