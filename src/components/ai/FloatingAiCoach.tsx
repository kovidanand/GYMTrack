import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Bot, 
  X, 
  Send, 
  Dumbbell,
  CheckCircle2,
  Utensils,
  Sparkles
} from 'lucide-react'
import { useAiCoach } from '@/hooks/useAiCoach'
import { useAuth } from '@/context/AuthContext'
import { AiResponseRenderer, sanitizeAiContent } from '@/components/ai/AiResponseRenderer'

export function FloatingAiCoach() {
  const { user, profile } = useAuth()
  const {
    analysis,
    messages,
    isAsking,
    ask,
    confirmPendingLog,
    cancelPendingLog,
    confirmPendingFoodLog,
    cancelPendingFoodLog
  } = useAiCoach()

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isAsking, isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || isAsking) return

    setInput('')
    await ask(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const defaultQuickPrompts = [
    'What should I eat today?',
    'How much protein do I need?',
    "Review today's nutrition",
    'Suggest a post-workout meal',
    'What should I train today?'
  ]

  const location = useLocation()
  const isProfile = location.pathname === '/profile'

  if (!user) return null

  return (
    <div className={`fixed ${isProfile ? 'bottom-32' : 'bottom-20'} sm:bottom-6 right-3 sm:right-6 z-40 select-none`}>
      {/* ── Collapsed Floating Button (Compact Circular FAB) ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white rounded-full shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          aria-label="Open AI Coach"
          title="Open AI Coach"
          id="floating-ai-coach-button"
        >
          {/* Ambient ping animation */}
          <span className="absolute -inset-0.5 rounded-full bg-brand-400 opacity-25 group-hover:opacity-75 animate-ping -z-10 pointer-events-none" />

          {/* Robot Face / Icon */}
          <Bot size={22} className="text-white drop-shadow-xs transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />

          {/* Online / Active Status Dot */}
          <span
            className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-2xs"
            title="AI Coach Ready"
            aria-hidden="true"
          />
        </button>
      )}

      {/* ── Expanded Chat Panel ── */}
      {isOpen && (
        <div 
          className="w-[94vw] sm:w-[410px] h-[580px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-surface-200 flex flex-col overflow-hidden animate-scale-in"
          role="dialog"
          aria-label="GYMTrack AI Fitness and Nutrition Coach"
        >
          {/* ── Header ── */}
          <div className="p-3.5 px-4 bg-gradient-to-r from-surface-900 to-surface-800 text-white flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-surface-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-none">
                  Your GYMTrack Coach
                </h3>
                <p className="text-[11px] text-surface-300 mt-0.5">
                  Training & Nutrition Unified AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-white/15 transition-colors"
                aria-label="Minimize AI Coach"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Status Ribbon ── */}
          <div className="p-2 px-3 bg-brand-50 border-b border-brand-100 flex items-center justify-between text-[11px] text-brand-800 flex-shrink-0">
            <span className="flex items-center gap-1.5 font-medium truncate">
              {analysis && analysis.hasData ? (
                <>
                  <Dumbbell size={12} className="text-brand-600 flex-shrink-0" />
                  <span>Last 14D: <strong>{analysis.recentSessionsCount} workouts</strong></span>
                </>
              ) : (
                <>
                  <Sparkles size={12} className="text-brand-600 flex-shrink-0" />
                  <span>Workout & NutriTrack Connected</span>
                </>
              )}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
              <Utensils size={10} /> NutriTrack Sync
            </span>
          </div>

          {/* ── Chat Messages Scroll Area ── */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-surface-50/50 text-xs">
            {/* Welcome Greeting */}
            <div className="flex items-start gap-2.5 animate-fade-in">
              <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={13} />
              </div>
              <div className="bg-white border border-surface-200 rounded-2xl rounded-tl-none p-3 shadow-xs max-w-[85%] text-surface-800 leading-relaxed">
                <p className="font-bold text-surface-900 mb-1">
                  Hello, {profile?.first_name || 'Athlete'}!
                </p>
                <p className="text-surface-600">
                  Ask about your <strong>training</strong>, <strong>nutrition</strong>, <strong>progress</strong>, or <strong>what to eat next</strong>.
                </p>
              </div>
            </div>

            {/* Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 animate-fade-in ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={13} />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-3 shadow-xs max-w-[88%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-none font-medium'
                      : 'bg-white border border-surface-200 rounded-tl-none text-surface-800'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <AiResponseRenderer 
                      content={sanitizeAiContent(msg.content)} 
                      imageUrl={msg.imageUrl}
                      structuredGuidance={msg.structuredGuidance}
                      structuredRecommendation={msg.structuredRecommendation}
                    />
                  ) : (
                    <div className="whitespace-pre-line break-words">
                      {msg.content}
                    </div>
                  )}

                  {/* ── Actionable Nutrition / Meal Recommendation Card ── */}
                  {msg.pendingFoodLog && !msg.pendingFoodLog.logged && (
                    <div className="mt-3 p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2.5 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Utensils size={13} className="text-emerald-600 flex-shrink-0" />
                            <span className="text-xs font-bold text-surface-900">{msg.pendingFoodLog.foodName}</span>
                          </div>
                          <p className="text-[11px] text-surface-500 mt-0.5 capitalize">
                            {msg.pendingFoodLog.mealType} • {msg.pendingFoodLog.servingSize} {msg.pendingFoodLog.servingUnit}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                          {Math.round(msg.pendingFoodLog.calories)} kcal
                        </span>
                      </div>

                      {/* Macros Bar */}
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
                        <div className="bg-white/90 rounded-lg p-1 border border-emerald-100">
                          <span className="text-surface-400 block text-[9px] uppercase font-semibold">Protein</span>
                          <span className="font-bold text-emerald-700">{Math.round(msg.pendingFoodLog.protein)}g</span>
                        </div>
                        <div className="bg-white/90 rounded-lg p-1 border border-emerald-100">
                          <span className="text-surface-400 block text-[9px] uppercase font-semibold">Carbs</span>
                          <span className="font-bold text-amber-700">{Math.round(msg.pendingFoodLog.carbs)}g</span>
                        </div>
                        <div className="bg-white/90 rounded-lg p-1 border border-emerald-100">
                          <span className="text-surface-400 block text-[9px] uppercase font-semibold">Fat</span>
                          <span className="font-bold text-rose-700">{Math.round(msg.pendingFoodLog.fat)}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => cancelPendingFoodLog(msg.id)}
                          className="flex-1 py-1.5 px-3 bg-white border border-surface-200 hover:bg-surface-100 text-surface-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmPendingFoodLog(msg.id)}
                          className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={13} />
                          <span>Confirm & Log</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.pendingFoodLog && msg.pendingFoodLog.logged && (
                    <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                      <span>Logged to NutriTrack ({Math.round(msg.pendingFoodLog.calories)} kcal)</span>
                    </div>
                  )}

                  {/* ── Actionable Workout Recommendation Card ── */}
                  {msg.pendingLog && !msg.pendingLog.logged && (
                    <div className="mt-3 p-3 bg-brand-50/70 border border-brand-200 rounded-xl space-y-2 text-left">
                      <div className="text-xs font-bold text-brand-950 flex items-center justify-between">
                        <span>{msg.pendingLog.exerciseName}</span>
                        <span className="text-brand-700 font-mono text-[11px]">{msg.pendingLog.sets} sets × {msg.pendingLog.reps} reps @ {msg.pendingLog.weight} kg</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => cancelPendingLog(msg.id)}
                          className="flex-1 py-1.5 px-3 bg-white border border-surface-200 hover:bg-surface-100 text-surface-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmPendingLog(msg.id)}
                          className="flex-1 py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 size={13} />
                          <span>Confirm & Log</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.pendingLog && msg.pendingLog.logged && (
                    <div className="mt-2.5 p-2 bg-brand-50 border border-brand-200 rounded-lg flex items-center gap-2 text-xs text-brand-800 font-medium">
                      <CheckCircle2 size={14} className="text-brand-600 flex-shrink-0" />
                      <span>Workout session logged</span>
                    </div>
                  )}

                  {msg.supportingData && (
                    <div className="mt-2 pt-1.5 border-t border-surface-100 text-[10px] text-surface-400 italic">
                      {msg.supportingData}
                    </div>
                  )}

                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-surface-100 space-y-1">
                      <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">
                        Follow-ups
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.suggestedQuestions.slice(0, 2).map((sq, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(sq)}
                            className="text-[11px] text-left px-2 py-1 bg-surface-100 hover:bg-brand-50 hover:text-brand-700 rounded-md transition-colors text-surface-700"
                          >
                            {sq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isAsking && (
              <div className="flex items-start gap-2.5 animate-fade-in">
                <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={13} />
                </div>
                <div className="bg-white border border-surface-200 rounded-2xl rounded-tl-none p-3 shadow-xs text-surface-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium ml-1">Analyzing training & nutrition...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Prompts (when few messages) ── */}
          {messages.length < 3 && !isAsking && (
            <div className="p-2 px-3 border-t border-surface-100 bg-white flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
              {defaultQuickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-full bg-surface-100 hover:bg-brand-50 hover:text-brand-700 text-surface-700 transition-colors flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* ── Input Box ── */}
          <div className="p-3 bg-white border-t border-surface-200 flex-shrink-0">
            <div className="flex items-center gap-2 bg-surface-100 rounded-xl p-1 px-3 focus-within:ring-2 focus-within:ring-brand-500 focus-within:bg-white transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about workouts, calories, or what to eat..."
                className="flex-1 bg-transparent border-0 text-xs text-surface-900 placeholder-surface-400 focus:outline-none py-1.5"
                disabled={isAsking}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isAsking}
                className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
