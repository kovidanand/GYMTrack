import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ToastType, ToastMessage } from '@/types'

// ─── Toast Context ────────────────────────────────────────────────────────────

interface ToastContextType {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const newToast: ToastMessage = { ...toast, id }
    setToasts(prev => [...prev, newToast])

    // Auto-dismiss
    const duration = toast.duration ?? (toast.type === 'error' ? 6000 : 4000)
    setTimeout(() => removeToast(id), duration)
  }, [removeToast])

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description })
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// ─── Toast Container ──────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      role="status"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

// ─── Toast Item ───────────────────────────────────────────────────────────────

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
}

const colorMap: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-white text-emerald-700',
  error: 'border-red-200 bg-white text-red-700',
  info: 'border-brand-200 bg-white text-brand-700',
  warning: 'border-amber-200 bg-white text-amber-700',
}

const iconColorMap: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-brand-500',
  warning: 'text-amber-500',
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 200)
  }

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-200',
        colorMap[toast.type],
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-slide-in-right'
      )}
      role="alert"
    >
      <div className={cn('flex-shrink-0 mt-0.5', iconColorMap[toast.type])}>
        {iconMap[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-surface-900">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-surface-500 mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-surface-400 hover:text-surface-600 transition-colors p-0.5 -mr-1"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
