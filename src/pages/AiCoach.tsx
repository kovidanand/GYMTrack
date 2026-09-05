import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/ai/Sidebar'
import { ChatInterface } from '@/components/ai/ChatInterface'
import { 
  getConversations, 
  createConversation, 
  deleteConversation, 
  getMessages, 
  saveMessage, 
  invokeCoach,
  updateConversationTitle
} from '@/lib/ai'
import { buildCoachContext } from '@/lib/contextBuilder'
import { useAuth } from '@/context/AuthContext'
import type { AIConversation, AIMessage, CoachContext } from '@/types'

export default function AiCoach() {
  const { profile, user } = useAuth()
  
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load messages when activeId changes
  useEffect(() => {
    if (activeId) {
      loadMessages(activeId)
    } else {
      setMessages([])
    }
  }, [activeId])

  async function loadConversations() {
    const { data } = await getConversations()
    if (data) setConversations(data)
  }

  async function loadMessages(id: string) {
    const { data } = await getMessages(id)
    if (data) setMessages(data)
  }

  async function handleNewConversation() {
    const { data } = await createConversation()
    if (data) {
      setConversations([data, ...conversations])
      setActiveId(data.id)
    }
  }

  async function handleDeleteConversation(id: string) {
    await deleteConversation(id)
    setConversations(conversations.filter(c => c.id !== id))
    if (activeId === id) {
      setActiveId(null)
    }
  }

  async function handleSendMessage(content: string) {
    let currentConvId = activeId
    setIsLoading(true)

    try {
      // 1. Create conversation if none exists
      if (!currentConvId) {
        // Use first few words of message as title
        const title = content.split(' ').slice(0, 4).join(' ') + (content.split(' ').length > 4 ? '...' : '')
        const { data: newConv } = await createConversation(title)
        if (newConv) {
          currentConvId = newConv.id
          setConversations(prev => [newConv, ...prev])
          setActiveId(currentConvId)
        } else {
          throw new Error("Failed to create conversation")
        }
      }

      // 2. Save user message locally for immediate UI update
      const tempUserMsg: AIMessage = {
        id: 'temp-' + Date.now(),
        conversation_id: currentConvId,
        role: 'user',
        content,
        structured_data: null,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, tempUserMsg])

      // 3. Save user message to DB
      const { data: savedUserMsg } = await saveMessage(currentConvId, 'user', content)

      // 4. Build Context
      const context = await buildCoachContext(profile, user?.id || '')

      // 5. Prepare history for AI
      // Get last 10 messages max to save tokens
      const recentMessages = [...messages, savedUserMsg || tempUserMsg].slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      // 6. Call AI API
      const response = await invokeCoach(recentMessages, context)

      if (response.error) {
        // Show error message
        const errorMsg: AIMessage = {
          id: 'error-' + Date.now(),
          conversation_id: currentConvId,
          role: 'assistant',
          content: `⚠️ **Error:** ${response.error}`,
          structured_data: null,
          created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorMsg])
        return
      }

      // 7. Save AI response to DB
      const { data: savedAIMsg } = await saveMessage(
        currentConvId, 
        'assistant', 
        response.content || '',
        response.structuredData
      )

      if (savedAIMsg) {
        setMessages(prev => [...prev, savedAIMsg])
        // Refresh conversations to update timestamps
        loadConversations()
      }
      
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] -mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
      {/* Sidebar (Conversations) */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-4 border-b border-surface-200 bg-white">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-surface-500 hover:bg-surface-100 rounded-lg mr-3"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-semibold text-surface-900">GYMTrack AI</h1>
        </div>

        <ChatInterface 
          messages={messages} 
          isLoading={isLoading} 
          onSendMessage={handleSendMessage} 
        />
      </div>
    </div>
  )
}
