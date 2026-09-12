import { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PeriodComparison } from '@/hooks/useProgress'
import type { WorkoutSession } from '@/types'

interface InsightPayload {
  period: string
  volume: number
  previousVolume: number
  volumePctChange: number | null
  sessions: number
  previousSessions: number
  sessionsPctChange: number | null
  muscleDistribution: Record<string, number>
  totalWorkoutsAllTime: number
}

interface AiInsight {
  title: string
  body: string
}

/**
 * Deterministic fallback insights — never shows an error or generic advice.
 * Only references actual metrics from the payload.
 */
function buildDeterministicInsights(payload: InsightPayload): AiInsight[] {
  const insights: AiInsight[] = []
  const { volumePctChange, sessionsPctChange, volume, sessions, muscleDistribution, period } = payload

  // Volume insight
  if (volume > 0 && volumePctChange !== null) {
    const direction = volumePctChange > 0 ? 'increased' : volumePctChange < 0 ? 'decreased' : 'remained stable'
    const pctStr = volumePctChange !== 0 ? ` by ${Math.abs(volumePctChange)}%` : ''
    insights.push({
      title: 'Volume Trend',
      body: `Your training volume ${direction}${pctStr} compared with the previous ${period}. Total: ${(volume / 1000).toFixed(1)}k kg this period.`,
    })
  } else if (volume > 0) {
    insights.push({
      title: 'Volume Summary',
      body: `You lifted ${(volume / 1000).toFixed(1)}k kg this period across ${sessions} session${sessions !== 1 ? 's' : ''}.`,
    })
  }

  // Session frequency insight
  if (sessions > 0 && sessionsPctChange !== null && sessionsPctChange !== 0) {
    const dir = sessionsPctChange > 0 ? 'more' : 'fewer'
    insights.push({
      title: 'Training Frequency',
      body: `You trained ${Math.abs(sessionsPctChange)}% ${dir} sessions this period compared with the previous ${period} (${sessions} vs ${payload.previousSessions}).`,
    })
  }

  // Muscle balance insight
  const muscleEntries = Object.entries(muscleDistribution).sort(([, a], [, b]) => b - a)
  if (muscleEntries.length >= 2) {
    const [topMuscle, topPct] = muscleEntries[0]
    const topLabel = topMuscle.charAt(0).toUpperCase() + topMuscle.slice(1)
    const lowMuscles = muscleEntries.filter(([, pct]) => pct < 10).map(([m]) => m.charAt(0).toUpperCase() + m.slice(1))
    
    let body = `${topLabel} training accounts for ${topPct}% of your sets this period.`
    if (lowMuscles.length > 0 && lowMuscles.length <= 3) {
      body += ` ${lowMuscles.join(', ')} received relatively less volume — consider whether this aligns with your training goals.`
    }
    insights.push({ title: 'Training Balance', body })
  }

  return insights.length > 0
    ? insights
    : [{ title: 'Keep Going', body: `${sessions} session${sessions !== 1 ? 's' : ''} logged this period. Continue recording your workouts to unlock detailed analytics.` }]
}

async function fetchAiInsights(payload: InsightPayload): Promise<AiInsight[] | null> {
  try {
    const { invokeCoach } = await import('@/lib/ai')
    const prompt = `You are a fitness analytics assistant. Based ONLY on this workout data summary, provide 2-3 concise, specific insights. Do NOT give generic advice. Reference actual numbers.

Data: ${JSON.stringify(payload, null, 2)}

Respond with a JSON array of objects with "title" (short, 2-5 words) and "body" (1-2 sentences, specific to the data). Example:
[{"title":"Volume Trend","body":"Your training volume increased 12% vs the previous 7 days, reaching 8.4k kg."},{"title":"Training Balance","body":"Chest training accounts for 32% of your sets while leg training is at 14%."}]

Return ONLY the JSON array, no markdown, no explanation.`

    const result = await invokeCoach(
      [{ role: 'user', content: prompt }],
      { recentWorkouts: [], personalRecords: [] }
    )

    if (result.error || !result.content) return null

    try {
      // Extract JSON from response
      const match = result.content.match(/\[[\s\S]*\]/)
      if (!match) return null
      const parsed = JSON.parse(match[0])
      if (Array.isArray(parsed) && parsed.every(i => i.title && i.body)) {
        return parsed as AiInsight[]
      }
    } catch {
      return null
    }
  } catch {
    return null
  }
  return null
}

interface AiCoachInsightsPanelProps {
  comparison: PeriodComparison
  muscleDistribution: Record<string, number>
  timeRange: '7d' | '30d' | 'all'
  totalWorkouts: number
  filteredSessions: WorkoutSession[]
}

export function AiCoachInsightsPanel({
  comparison,
  muscleDistribution,
  timeRange,
  totalWorkouts,
  filteredSessions,
}: AiCoachInsightsPanelProps) {
  const [insights, setInsights] = useState<AiInsight[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [usedFallback, setUsedFallback] = useState(false)

  const periodLabel = timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : 'all time'

  useEffect(() => {
    if (filteredSessions.length === 0) return

    const payload: InsightPayload = {
      period: periodLabel,
      volume: comparison.currentVolume,
      previousVolume: comparison.previousVolume,
      volumePctChange: comparison.volumePctChange,
      sessions: comparison.currentSessions,
      previousSessions: comparison.previousSessions,
      sessionsPctChange: comparison.sessionsPctChange,
      muscleDistribution,
      totalWorkoutsAllTime: totalWorkouts,
    }

    let cancelled = false
    setLoading(true)
    setInsights(null)
    setUsedFallback(false)

    fetchAiInsights(payload).then(aiResult => {
      if (cancelled) return
      if (aiResult && aiResult.length > 0) {
        setInsights(aiResult)
        setUsedFallback(false)
      } else {
        setInsights(buildDeterministicInsights(payload))
        setUsedFallback(true)
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [timeRange, comparison.currentVolume, comparison.currentSessions])

  if (filteredSessions.length === 0) {
    return (
      <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
            <Brain size={15} className="text-brand-600" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-surface-400">AI Coach Insights</p>
        </div>
        <p className="text-sm text-surface-400 font-medium">
          Log workouts during this period to receive personalized AI-powered insights grounded in your actual training data.
        </p>
      </div>
    )
  }

  return (
    <div className="card p-5 sm:p-6 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
            <Brain size={15} className="text-brand-600" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-surface-400">AI Coach Insights</p>
        </div>
        {usedFallback && (
          <span className="text-[10px] text-surface-400 font-medium flex items-center gap-1">
            <AlertCircle size={10} />
            Deterministic
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-surface-400 text-sm">
          <Loader2 size={16} className="animate-spin" />
          <span className="font-medium">Analyzing your training data...</span>
        </div>
      ) : insights && insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface-50 border border-surface-100 space-y-1"
            >
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-brand-500 flex-shrink-0" />
                <p className="text-xs font-bold text-surface-800">{insight.title}</p>
              </div>
              <p className="text-xs text-surface-600 leading-relaxed pl-[21px]">
                {insight.body}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
