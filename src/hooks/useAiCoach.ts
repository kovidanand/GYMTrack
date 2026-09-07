import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getStructuredWorkoutAnalysis, type StructuredWorkoutAnalysis } from '@/lib/coachAnalysis'
import { askCoachQuestion, type CoachAnswer } from '@/lib/coachProvider'

export interface CoachChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  supportingData?: string
  suggestedQuestions?: string[]
  createdAt: number
}

export function useAiCoach() {
  const { user } = useAuth()
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
  }, [loadAnalysis])

  const ask = async (query: string): Promise<CoachAnswer | null> => {
    if (!query.trim()) return null

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

      const answer = await askCoachQuestion(query, fallbackAnalysis)

      const assistantMsg: CoachChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: answer.content,
        supportingData: answer.supportingData,
        suggestedQuestions: answer.suggestedQuestions,
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
    clearChat,
    refresh: loadAnalysis
  }
}
