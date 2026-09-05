import { Plus, MessageSquare, Trash2, X } from 'lucide-react'
import type { AIConversation } from '@/types'
import { formatRelativeDate } from '@/lib/utils'

interface SidebarProps {
  conversations: AIConversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-surface-50 border-r border-surface-200 transform transition-transform duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0 lg:z-0 lg:h-full lg:flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 flex items-center justify-between border-b border-surface-200 bg-white">
          <h2 className="font-semibold text-surface-900">Conversations</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-surface-500 hover:bg-surface-100 rounded-lg lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center text-sm text-surface-500 mt-8">
              No conversations yet.
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  activeId === conv.id 
                    ? 'bg-surface-200 text-surface-900' 
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
                onClick={() => {
                  onSelect(conv.id)
                  onClose()
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare size={16} className="flex-shrink-0 opacity-50" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title || 'New Conversation'}</p>
                    <p className="text-[10px] text-surface-500">{formatRelativeDate(conv.updated_at)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(conv.id)
                  }}
                  className="p-1.5 text-surface-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all rounded-md hover:bg-surface-200"
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
