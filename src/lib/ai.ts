import { supabase } from '@/lib/supabase'
import type { AIConversation, AIMessage, CoachContext } from '@/types'

// ─── Conversations ──────────────────────────────────────────────────────────

export async function getConversations() {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .order('updated_at', { ascending: false })
  return { data: data as AIConversation[] | null, error }
}

export async function createConversation(title?: string) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userData.user.id, title: title || 'New Conversation' })
    .select()
    .single()
  return { data: data as AIConversation | null, error }
}

export async function deleteConversation(id: string) {
  const { error } = await supabase
    .from('ai_conversations')
    .delete()
    .eq('id', id)
  return { error }
}

export async function updateConversationTitle(id: string, title: string) {
  const { error } = await supabase
    .from('ai_conversations')
    .update({ title })
    .eq('id', id)
  return { error }
}

// ─── Messages ─────────────────────────────────────────────────────────────

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  return { data: data as AIMessage[] | null, error }
}

export async function saveMessage(conversationId: string, role: 'user' | 'assistant', content: string, structuredData: any = null) {
  const { data, error } = await supabase
    .from('ai_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      structured_data: structuredData
    })
    .select()
    .single()

  // Update conversation updated_at
  if (!error) {
    await supabase.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)
  }

  return { data: data as AIMessage | null, error }
}

// ─── AI API Call ──────────────────────────────────────────────────────────

export async function invokeCoach(messages: { role: string; content: string }[], context: CoachContext) {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) throw new Error('Not authenticated')

    const response = await supabase.functions.invoke('ai-coach', {
      body: {
        messages,
        context
      },
    })

    if (response.error) {
      throw new Error(response.error.message || 'Error calling AI Coach')
    }

    return {
      content: response.data.content,
      structuredData: response.data.structured_data
    }
  } catch (error: any) {
    console.error('AI invocation error:', error)
    return { error: error.message || 'Failed to communicate with AI Coach.' }
  }
}
