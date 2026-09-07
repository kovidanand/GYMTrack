import { useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Confirmation Dialog ──────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
    } finally {
      setIsProcessing(false)
      onOpenChange(false)
    }
  }

  const isLoading = loading || isProcessing

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-fade-in" />
        <RadixDialog.Content
          className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-xl shadow-2xl animate-scale-in p-6 focus:outline-none"
          aria-describedby={description ? 'dialog-description' : undefined}
        >
          <div className="flex items-start gap-4">
            {variant === 'danger' && (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" aria-hidden="true" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <RadixDialog.Title className="text-lg font-semibold text-surface-900">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description id="dialog-description" className="text-sm text-surface-500 mt-1.5">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <RadixDialog.Close asChild>
              <button
                className="btn-secondary text-sm"
                disabled={isLoading}
              >
                {cancelLabel}
              </button>
            </RadixDialog.Close>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
                variant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-brand-500 text-white hover:bg-brand-600'
              )}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              {confirmLabel}
            </button>
          </div>

          <RadixDialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

// ─── Generic Dialog Wrapper ───────────────────────────────────────────────────

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}

export function Dialog({ open, onOpenChange, title, description, children, maxWidth = 'md' }: DialogProps) {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-fade-in" />
        <RadixDialog.Content
          className={cn(
            'fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] bg-white rounded-xl shadow-2xl animate-scale-in focus:outline-none overflow-hidden',
            widths[maxWidth]
          )}
          aria-describedby={description ? 'dialog-desc' : undefined}
        >
          <div className="px-6 pt-6 pb-4">
            <RadixDialog.Title className="text-lg font-semibold text-surface-900">
              {title}
            </RadixDialog.Title>
            {description && (
              <RadixDialog.Description id="dialog-desc" className="text-sm text-surface-500 mt-1">
                {description}
              </RadixDialog.Description>
            )}
          </div>
          <div className="px-6 pb-6">
            {children}
          </div>

          <RadixDialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
