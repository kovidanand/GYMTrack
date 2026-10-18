import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeGymtrackEvent } from '@/lib/events'
import { getStructuredWorkoutAnalysis, type StructuredWorkoutAnalysis } from '@/lib/coachAnalysis'
import {
  askCoachQuestion,
  type CoachAnswer,
  type PendingLogPayload,
  type PendingFoodLogPayload,
} from '@/lib/coachProvider'
import { buildCoachContext } from '@/lib/contextBuilder'
import { logCanonicalWorkout } from '@/lib/workoutService'
import { addFoodEntry } from '@/lib/nutritionService'
import { toLocalISODate } from '@/lib/dateUtils'
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
  pendingFoodLog?: PendingFoodLogPayload
  createdAt: number
}

export function useAiCoach(selectedDate?: string) {
  const { user, profile } = useAuth()
  const [activeDate, setActiveDate] = useState<string>(() => selectedDate || toLocalISODate())
  const [analysis, setAnalysis] = useState<StructuredWorkoutAnalysis | null>(null)
  const [messages, setMessages] = useState<CoachChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [isAsking, setIsAsking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedDate) {
      setActiveDate(selectedDate)
    }
  }, [selectedDate])

  useEffect(() => {
    const handleDateSelected = (e: Event) => {
      const custom = e as CustomEvent<{ date: string }>
      if (custom?.detail?.date) {
        setActiveDate(custom.detail.date)
      }
    }
    window.addEventListener('gymtrack:date_selected', handleDateSelected)
    return () => window.removeEventListener('gymtrack:date_selected', handleDateSelected)
  }, [])

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
    const unsub4 = subscribeGymtrackEvent('gymtrack:food_logged', () => loadAnalysis())
    const unsub5 = subscribeGymtrackEvent('gymtrack:goals_updated', () => loadAnalysis())

    // Also listen to window event for cross-component triggers
    const handleWindowFoodLogged = () => loadAnalysis()
    window.addEventListener('gymtrack:food_logged', handleWindowFoodLogged)

    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
      unsub5()
      window.removeEventListener('gymtrack:food_logged', handleWindowFoodLogged)
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
      console.error('[GYMTrack useAiCoach] Failed to confirm workout log:', err)
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

  const confirmPendingFoodLog = async (targetMsgId?: string) => {
    if (!user) return
    setIsAsking(true)

    const target = targetMsgId
      ? messages.find(m => m.id === targetMsgId && m.pendingFoodLog && !m.pendingFoodLog.logged)
      : [...messages].reverse().find(m => m.pendingFoodLog && !m.pendingFoodLog.logged)

    if (!target || !target.pendingFoodLog) {
      setIsAsking(false)
      return
    }

    const log = target.pendingFoodLog
    const dateToLog = selectedDate || toLocalISODate()

    try {
      await addFoodEntry(user.id, {
        user_id: user.id,
        date: dateToLog,
        meal_type: log.mealType,
        food_name: log.foodName,
        serving_size: log.servingSize,
        serving_unit: log.servingUnit,
        servings_logged: log.servingsLogged,
        calories: log.calories,
        protein: log.protein,
        carbs: log.carbs,
        fat: log.fat,
        fiber: log.fiber || 0,
        logged_at: new Date().toISOString(),
      })

      // Mark target message as logged
      setMessages(prev => prev.map(m => {
        if (m.id === target.id && m.pendingFoodLog) {
          return {
            ...m,
            pendingFoodLog: { ...m.pendingFoodLog, logged: true }
          }
        }
        return m
      }))

      // Append confirmation success message
      const successMsg: CoachChatMessage = {
        id: 'coach-' + Date.now(),
        role: 'assistant',
        content: `Logged **${log.foodName}** (${log.calories} kcal | ${log.protein}g protein | ${log.carbs}g carbs | ${log.fat}g fat) to your NutriTrack food diary!\n\nYour daily calorie and macronutrient rings have updated.`,
        supportingData: 'Logged via canonical nutritionService',
        suggestedQuestions: ['How much protein do I still need?', "Review today's nutrition", 'What should I train today?'],
        createdAt: Date.now()
      }
      setMessages(prev => [...prev, successMsg])

      // Dispatch event to update NutriTrack dashboard in real time
      window.dispatchEvent(new CustomEvent('gymtrack:food_logged', { detail: { date: dateToLog } }))
      await loadAnalysis()
    } catch (err) {
      console.error('[GYMTrack useAiCoach] Failed to confirm food log:', err)
    } finally {
      setIsAsking(false)
    }
  }

  const cancelPendingFoodLog = (targetMsgId?: string) => {
    setMessages(prev => prev.map(m => {
      if ((!targetMsgId || m.id === targetMsgId) && m.pendingFoodLog && !m.pendingFoodLog.logged) {
        return {
          ...m,
          pendingFoodLog: { ...m.pendingFoodLog, logged: true }
        }
      }
      return m
    }))

    const cancelMsg: CoachChatMessage = {
      id: 'coach-' + Date.now(),
      role: 'assistant',
      content: 'Meal logging cancelled. Let me know whenever you want food or nutrition recommendations.',
      createdAt: Date.now()
    }
    setMessages(prev => [...prev, cancelMsg])
  }

  const ask = async (query: string): Promise<CoachAnswer | null> => {
    if (!query.trim()) return null
    const cleanLower = query.trim().toLowerCase()

    // Check if user confirmed pending workout log
    if (cleanLower === 'confirm workout' || cleanLower === 'log workout') {
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

    // Check if user confirmed pending food log
    if (cleanLower === 'confirm' || cleanLower === 'log meal' || cleanLower === 'log it' || cleanLower === 'yes' || cleanLower === 'confirm and log') {
      const activePendingFood = [...messages].reverse().find(m => m.pendingFoodLog && !m.pendingFoodLog.logged)
      if (activePendingFood) {
        const userMsg: CoachChatMessage = {
          id: 'user-' + Date.now(),
          role: 'user',
          content: query.trim(),
          createdAt: Date.now()
        }
        setMessages(prev => [...prev, userMsg])
        await confirmPendingFoodLog(activePendingFood.id)
        return null
      }

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
      const activePendingFood = [...messages].reverse().find(m => m.pendingFoodLog && !m.pendingFoodLog.logged)
      if (activePendingFood) {
        const userMsg: CoachChatMessage = {
          id: 'user-' + Date.now(),
          role: 'user',
          content: query.trim(),
          createdAt: Date.now()
        }
        setMessages(prev => [...prev, userMsg])
        cancelPendingFoodLog(activePendingFood.id)
        return null
      }

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

      const coachContext = user ? await buildCoachContext(profile, user.id, activeDate) : null
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
        pendingFoodLog: answer.pendingFoodLog,
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
    confirmPendingFoodLog,
    cancelPendingFoodLog,
    clearChat,
    refresh: loadAnalysis
  }
}
