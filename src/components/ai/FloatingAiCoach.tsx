import React, { useState, useRef, useEffect } from 'react'
import { 
  Bot, 
  X, 
  Send, 
  Dumbbell,
  CheckCircle2
} from 'lucide-react'
import { useAiCoach, type CoachChatMessage } from '@/hooks/useAiCoach'
import { useAuth } from '@/context/AuthContext'
import { AiResponseRenderer, sanitizeAiContent } from '@/components/ai/AiResponseRenderer'

export function FloatingAiCoach() {
  const { user, profile } = useAuth()
  const { analysis, messages, isAsking, ask, confirmPendingLog, cancelPendingLog } = useAiCoach()

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
    'What should I train today?',
    'How did I progress this week?',
    'How do I do a bench press?',
    'What weight did I use last time?',
    "What's my best Bench Press?"
  ]

  if (!user) return null

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 select-none">
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
          className="w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] bg-[#151A23] rounded-2xl shadow-2xl border border-[#202733] flex flex-col overflow-hidden animate-scale-in"
          role="dialog"
          aria-label="GYMTrack AI Fitness Coach"
        >
          {/* ── Header ── */}
          <div className="p-3.5 px-4 bg-[#0D1017] border-b border-[#202733] text-white flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0D1017]" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-none text-white">
                  GYMTrack AI Coach
                </h3>
                <p className="text-[11px] text-surface-400 mt-0.5">
                  {analysis?.hasData 
                    ? `Based on ${analysis.totalWorkouts} logged sessions` 
                    : 'Ready to guide your training'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                aria-label="Minimize AI Coach"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Status Ribbon ── */}
          <div className="p-2 px-3 bg-[#11151D] border-b border-[#202733] flex items-center justify-between text-[11px] text-surface-300 flex-shrink-0">
            <span className="flex items-center gap-1 font-medium truncate">
              {analysis && analysis.hasData ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                  <span>Last 14D: <strong className="text-white">{analysis.recentSessionsCount} sessions</strong> ({analysis.recentVolume.toLocaleString()} kg)</span>
                </>
              ) : (
                <>
                  <Dumbbell size={12} className="text-brand-400 flex-shrink-0" />
                  <span>Ready to guide your training</span>
                </>
              )}
            </span>
          </div>

          {/* ── Chat Messages Scroll Area ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#080A0F] text-xs">
            {/* Welcome Greeting */}
            <div className="flex items-start gap-2.5 animate-fade-in">
              <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={13} />
              </div>
              <div className="bg-[#151A23] border border-[#202733] rounded-2xl rounded-tl-none p-3 shadow-xs max-w-[85%] text-surface-200 leading-relaxed">
                <p className="font-bold text-white mb-1">
                  Hello, {profile?.first_name || 'Athlete'}
                </p>
                <p>
                  I can help with <strong className="text-white">exercise technique</strong>, <strong className="text-white">what to train today</strong>, your <strong className="text-white">recent progress</strong>, or <strong className="text-white">target muscle groups</strong>.
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
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={13} />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-3 shadow-xs max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none font-medium'
                      : 'bg-[#151A23] border border-[#202733] rounded-tl-none text-surface-200'
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
                    <div className="whitespace-pre-line break-words text-white">
                      {msg.content}
                    </div>
                  )}

                  {msg.pendingLog && !msg.pendingLog.logged && (
                    <div className="mt-3 p-3 bg-[#11151D] border border-brand-800/40 rounded-xl space-y-2 text-left">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{msg.pendingLog.exerciseName}</span>
                        <span className="text-brand-300 font-mono text-[11px]">{msg.pendingLog.sets} sets × {msg.pendingLog.reps} reps @ {msg.pendingLog.weight} kg</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => cancelPendingLog(msg.id)}
                          className="flex-1 py-1.5 px-3 bg-[#151A23] border border-[#202733] hover:bg-surface-800 text-surface-300 rounded-lg text-xs font-bold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmPendingLog(msg.id)}
                          className="flex-1 py-1.5 px-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 size={13} />
                          <span>Confirm & Log</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.supportingData && (
                    <div className="mt-2 pt-1.5 border-t border-[#202733] text-[10px] text-surface-400 italic">
                      {msg.supportingData}
                    </div>
                  )}

                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#202733] space-y-1">
                      <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">
                        Follow-ups
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.suggestedQuestions.slice(0, 2).map((sq, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(sq)}
                            className="text-[11px] text-left px-2 py-1 bg-[#11151D] hover:bg-brand-950/60 hover:text-brand-300 rounded-md transition-colors text-surface-300 border border-[#202733]"
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
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={13} />
                </div>
                <div className="bg-[#151A23] border border-[#202733] rounded-2xl rounded-tl-none p-3 shadow-xs text-surface-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium ml-1">Analyzing training...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Prompts (when few messages) ── */}
          {messages.length < 3 && !isAsking && (
            <div className="p-2 px-3 border-t border-[#202733] bg-[#0D1017] flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
              {defaultQuickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#151A23] hover:bg-brand-950/60 hover:text-brand-300 text-surface-300 border border-[#202733] transition-colors flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* ── Input Box ── */}
          <div className="p-3 bg-[#0D1017] border-t border-[#202733] flex-shrink-0">
            <div className="flex items-center gap-2 bg-[#11151D] border border-[#202733] rounded-xl p-1 px-3 focus-within:border-brand-500 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your training, exercises or progress..."
                className="flex-1 bg-transparent border-0 text-xs text-white placeholder-surface-500 focus:outline-none py-1.5"
                disabled={isAsking}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isAsking}
                className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
