import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Loader2, Save } from 'lucide-react'
import type { AIMessage, AIWorkoutProposal } from '@/types'
import { useNavigate } from 'react-router-dom'

interface ChatInterfaceProps {
  messages: AIMessage[]
  isLoading: boolean
  onSendMessage: (content: string) => void
}

export function ChatInterface({ messages, isLoading, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // A simple function to render markdown-like bold text
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
      }
      // Simple newline handling
      return <span key={i}>{part.split('\n').map((line, j) => <span key={j}>{line}<br/></span>)}</span>
    })
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6 text-surface-500">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-brand-500 mb-2">
              <Bot size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900 mb-2">Meet GYMTrack AI Coach</h2>
              <p className="text-sm">Your personal training assistant, powered by your actual GYMTrack data.</p>
            </div>
            
            <div className="w-full space-y-2 mt-4 text-left">
              {[
                "How is my progress this month?",
                "What should I train today?",
                "How has my Bench Press improved?",
                "Create a push workout for me."
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => onSendMessage(suggestion)}
                  className="w-full text-left p-3 text-sm bg-surface-50 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors border border-surface-100 hover:border-brand-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-surface-200 text-surface-600' : 'bg-brand-500 text-white'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              
              <div className={`max-w-[85%] md:max-w-[75%] space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.content && (
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-500 text-white rounded-tr-sm' 
                      : 'bg-surface-100 text-surface-800 rounded-tl-sm'
                  }`}>
                    {formatText(msg.content)}
                  </div>
                )}
                
                {msg.structured_data && (
                  <WorkoutProposalCard proposal={msg.structured_data} />
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={18} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-surface-100 text-surface-500 rounded-tl-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Analyzing your data...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-surface-200">
        <form 
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto flex items-end gap-2 bg-surface-50 border border-surface-200 rounded-xl p-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask GYMTrack AI..."
            className="w-full max-h-32 min-h-[44px] bg-transparent resize-none py-2.5 px-3 text-sm focus:outline-none"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center text-[10px] text-surface-400 mt-2">
          GYMTrack AI uses your actual training data. It is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  )
}

function WorkoutProposalCard({ proposal }: { proposal: AIWorkoutProposal }) {
  const navigate = useNavigate()
  
  // Convert proposal to a query string to pre-fill the builder
  const handleSave = () => {
    // In a full implementation, you might save it directly or pass data via state.
    // We'll use local storage to pass the initial data to the builder.
    localStorage.setItem('gymtrack_ai_proposal', JSON.stringify(proposal))
    navigate('/workouts/new?from_ai=true')
  }

  return (
    <div className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-sm w-full max-w-sm">
      <div className="bg-brand-50 p-4 border-b border-surface-200">
        <h4 className="font-bold text-brand-900">{proposal.name}</h4>
        <p className="text-xs text-brand-700 mt-1">{proposal.description}</p>
      </div>
      <div className="p-0">
        <table className="w-full text-sm text-left">
          <tbody className="divide-y divide-surface-100">
            {proposal.exercises.map((ex, i) => (
              <tr key={i} className="hover:bg-surface-50">
                <td className="px-4 py-3 text-surface-900 font-medium">
                  {ex.exercise_name}
                  {ex.notes && <p className="text-[10px] text-surface-500 font-normal mt-0.5">{ex.notes}</p>}
                </td>
                <td className="px-4 py-3 text-surface-600 text-right whitespace-nowrap">
                  {ex.sets} × {ex.reps}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-surface-50 border-t border-surface-200">
        <button 
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-surface-200 text-surface-700 text-sm font-semibold rounded-lg hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors"
        >
          <Save size={16} />
          Review & Save to Workouts
        </button>
      </div>
    </div>
  )
}
