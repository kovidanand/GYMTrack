import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ShieldAlert, 
  RotateCw, 
  Database, 
  Dumbbell, 
  HelpCircle,
  TrendingUp,
  ChevronRight
} from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/shared'
import { useAiCoach } from '@/hooks/useAiCoach'
import { CoachSummary } from '@/components/ai/CoachSummary'
import { CoachRecommendationCard } from '@/components/ai/CoachRecommendationCard'
import { AiResponseRenderer, sanitizeAiContent } from '@/components/ai/AiResponseRenderer'
import type { StructuredWorkoutAnalysis, ExerciseCoachAnalysis, CoachRecommendation } from '@/lib/coachAnalysis'
import { cn } from '@/lib/utils'

export default function AiCoach() {
  const navigate = useNavigate()
  const { 
    analysis, 
    messages, 
    loading, 
    isAsking, 
    ask, 
    clearChat, 
    refresh 
  } = useAiCoach()

  const [activeTab, setActiveTab] = useState<'recommendations' | 'ask' | 'telemetry'>('recommendations')
  const [inputQuery, setInputQuery] = useState('')

  const suggestedQuestions = [
    'What should I train today?',
    'How did I progress this week?',
    'How do I do a bench press?',
    'What weight did I use last time?',
    "What's my best Bench Press?"
  ]

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery
    if (!query.trim() || isAsking) return
    setInputQuery('')
    if (activeTab !== 'ask') {
      setActiveTab('ask')
    }
    await ask(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 animate-fade-in">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-500 font-medium text-sm">Loading training data...</p>
      </div>
    )
  }

  const safeAnalysis: StructuredWorkoutAnalysis = analysis || {
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
    recoveryNotice: 'Log your first workout session to start tracking volume and progression.',
    recentWorkoutsSummary: []
  }

  const hasWorkouts = safeAnalysis.hasData && safeAnalysis.totalWorkouts > 0

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-5xl mx-auto">
      {/* ── Page Header ── */}
      <PageHeader
        title="AI Coach"
        description="Training intelligence and progressive overload analysis based on your workout data."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refresh()}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              title="Refresh data"
            >
              <RotateCw size={13} /> Refresh
            </button>
          </div>
        }
      />

      {/* ── Baseline Guidance Banner if no workouts ── */}
      {!hasWorkouts && (
        <div className="p-4 rounded-xl bg-brand-50/80 border border-brand-200/80 flex items-start gap-3">
          <Bot className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-brand-900">
            <span className="font-bold">Getting Started:</span> Log your first workout session to unlock progression metrics, plateau detection, and personalized overload cues. You can ask form and technique questions anytime in the <strong>Ask Coach</strong> tab.
          </div>
        </div>
      )}

      {/* ── Coach Key Summary ── */}
      <section aria-label="Overview">
        <CoachSummary analysis={safeAnalysis} />
      </section>

      {/* ── Tab Navigation ── */}
      <div className="flex border-b border-surface-200">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={cn(
            "py-3 px-5 text-sm font-bold border-b-2 -mb-px transition-colors flex items-center gap-2",
            activeTab === 'recommendations'
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-surface-500 hover:text-surface-900"
          )}
        >
          <TrendingUp size={16} />
          Recommendations ({safeAnalysis.recommendations.length})
        </button>

        <button
          onClick={() => setActiveTab('ask')}
          className={cn(
            "py-3 px-5 text-sm font-bold border-b-2 -mb-px transition-colors flex items-center gap-2",
            activeTab === 'ask'
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-surface-500 hover:text-surface-900"
          )}
        >
          <Bot size={16} />
          Ask Coach
          {messages.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">
              {messages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={cn(
            "py-3 px-5 text-sm font-bold border-b-2 -mb-px transition-colors flex items-center gap-2",
            activeTab === 'telemetry'
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-surface-500 hover:text-surface-900"
          )}
        >
          <Database size={16} />
          Exercise Data ({safeAnalysis.exercises.length})
        </button>
      </div>

      {/* ── TAB 1: RECOMMENDATIONS ── */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6 animate-fade-in">
          {safeAnalysis.recommendations.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {safeAnalysis.recommendations.map((rec: CoachRecommendation) => (
                <CoachRecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          ) : (
            <div className="card p-6 bg-white border border-surface-200 text-center max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <TrendingUp size={24} />
              </div>
              <h4 className="font-bold text-surface-900 text-base">Progressive Overload Analysis</h4>
              <p className="text-xs text-surface-600">
                Log exercises and sets in your workouts to unlock personalized recommendations, progression tracking, and plateau detection.
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <button
                  onClick={() => setActiveTab('ask')}
                  className="btn-primary text-xs py-2 px-3"
                >
                  <Bot size={14} /> Ask Coach
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  <Dumbbell size={14} /> Log a Workout
                </button>
              </div>
            </div>
          )}


          {/* Quick Questions */}
          <div className="card p-5 bg-gradient-to-r from-brand-50/70 to-surface-50 border-brand-100">
            <h3 className="font-bold text-surface-900 text-sm mb-2 flex items-center gap-2">
              <HelpCircle size={16} className="text-brand-600" /> Questions about your training?
            </h3>
            <p className="text-xs text-surface-600 mb-3">
              Ask about exercise technique, weight adjustments, or your progress.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 3).map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-brand-200 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ASK COACH ── */}
      {activeTab === 'ask' && (
        <div className="card overflow-hidden flex flex-col min-h-[500px] border border-surface-200 bg-white animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/70">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-500 text-white">
                <Bot size={18} />
              </span>
              <div>
                <h3 className="font-bold text-sm text-surface-900">Ask Coach</h3>
                <p className="text-[11px] text-surface-500">Responses are based on your actual workout data.</p>
              </div>
            </div>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs font-medium text-surface-400 hover:text-surface-700 transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5 max-h-[520px]">
            {messages.length === 0 ? (
              <div className="text-center py-10 max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                  <Bot size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-surface-900 text-base">Ask your Coach anything</h4>
                  <p className="text-xs text-surface-500 mt-1">
                    Select a question or type your own below:
                  </p>
                </div>

                <div className="space-y-2 text-left pt-2">
                  {suggestedQuestions.map(q => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="w-full text-left p-3 rounded-xl bg-surface-50 hover:bg-brand-50 hover:text-brand-700 border border-surface-100 hover:border-brand-200 text-xs font-semibold text-surface-800 transition-all flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <ChevronRight size={14} className="text-surface-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 md:gap-4 animate-fade-in",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      msg.role === 'user'
                        ? "bg-brand-600 text-white"
                        : "bg-surface-800 text-white"
                    )}
                  >
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div className={cn("space-y-2 max-w-[85%] sm:max-w-[75%]", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed",
                        msg.role === 'user'
                          ? "bg-brand-600 text-white rounded-tr-sm"
                          : "bg-surface-50 text-surface-900 border border-surface-200/80 rounded-tl-sm shadow-sm"
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <AiResponseRenderer 
                          content={sanitizeAiContent(msg.content)} 
                          imageUrl={msg.imageUrl}
                          structuredGuidance={msg.structuredGuidance}
                          structuredRecommendation={msg.structuredRecommendation}
                        />
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>

                    {msg.supportingData && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-surface-400 px-1">
                        <Database size={11} className="text-brand-500 flex-shrink-0" />
                        <span>{msg.supportingData}</span>
                      </div>
                    )}

                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestedQuestions.map(sq => (
                          <button
                            key={sq}
                            onClick={() => handleSend(sq)}
                            className="text-[11px] font-medium bg-surface-100 hover:bg-brand-50 hover:text-brand-700 text-surface-600 px-2.5 py-1 rounded-full transition-colors border border-surface-200/60"
                          >
                            {sq}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isAsking && (
              <div className="flex gap-3 items-center text-surface-500 text-xs animate-pulse">
                <div className="w-8 h-8 rounded-full bg-surface-800 text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="p-3 bg-surface-50 rounded-2xl border border-surface-200 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-brand-600" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="p-3.5 border-t border-surface-200 bg-white">
            <div className="flex items-end gap-2 max-w-4xl mx-auto bg-surface-50 p-1.5 rounded-xl border border-surface-200 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
              <textarea
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your training, exercises or progress..."
                rows={1}
                className="w-full bg-transparent resize-none py-2 px-3 text-sm focus:outline-none max-h-28"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputQuery.trim() || isAsking}
                className="btn-primary text-xs py-2 px-4 flex-shrink-0 disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: EXERCISE DATA ── */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/70">
              <div>
                <h3 className="font-bold text-sm text-surface-900">Exercise Performance Data</h3>
                <p className="text-xs text-surface-500">
                  Metrics computed from {safeAnalysis.totalWorkouts} workout sessions across the last 28 days.
                </p>
              </div>
              <span className="badge bg-brand-50 text-brand-700 font-bold border border-brand-200">
                {safeAnalysis.exercises.length} Exercises
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-white text-surface-400 font-semibold uppercase border-b border-surface-100">
                  <tr>
                    <th className="px-4 py-3">Exercise</th>
                    <th className="px-4 py-3 text-center">Sessions</th>
                    <th className="px-4 py-3 text-center">Current 1RM</th>
                    <th className="px-4 py-3 text-center">Peak 1RM</th>
                    <th className="px-4 py-3 text-center">Delta</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {safeAnalysis.exercises.map((ex: ExerciseCoachAnalysis) => (
                    <tr key={ex.exerciseId} className="hover:bg-surface-50/60">
                      <td className="px-4 py-3 font-bold text-surface-900">
                        {ex.exerciseName}
                      </td>
                      <td className="px-4 py-3 text-center text-surface-700">
                        {ex.totalSessions}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-brand-600">
                        {ex.isBodyweight ? 'Bodyweight' : ex.current1RM ? `${ex.current1RM} kg` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-surface-700">
                        {ex.best1RM ? `${ex.best1RM} kg` : ex.latestWeight ? `${ex.latestWeight} kg` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {ex.oneRMChangePct != null ? (
                          <span className={ex.oneRMChangePct >= 0 ? "text-emerald-600" : "text-amber-600"}>
                            {ex.oneRMChangePct >= 0 ? `+${ex.oneRMChangePct}%` : `${ex.oneRMChangePct}%`}
                          </span>
                        ) : (
                          <span className="text-surface-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {ex.isPlateau ? (
                          <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Plateau
                          </span>
                        ) : ex.trend === 'improving' ? (
                          <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Progressing
                          </span>
                        ) : (
                          <span className="text-surface-400 text-[11px]">Stable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Data & Safety Footer ── */}
      <footer className="card p-4 bg-surface-50/80 border border-surface-200 text-xs text-surface-600 space-y-2">
        <div className="flex items-start gap-2">
          <Database size={15} className="text-brand-500 mt-0.5 flex-shrink-0" />
          <p>
            <strong>Data Notice:</strong> {safeAnalysis.recoveryNotice}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <ShieldAlert size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p>
            <strong>Safety:</strong> GYMTrack AI Coach is a training performance assistant, not a physician or licensed healthcare provider. Never train through severe or sharp joint pain. Consult a medical professional for injury diagnosis and rehabilitation.
          </p>
        </div>
      </footer>
    </div>
  )
}
