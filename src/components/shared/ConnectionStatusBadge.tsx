import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'
import { cn } from '@/lib/utils'

interface ConnectionStatusBadgeProps {
  className?: string
  showText?: boolean
}

export function ConnectionStatusBadge({ className, showText = true }: ConnectionStatusBadgeProps) {
  const { status, pendingCount, syncNow, lastError } = useConnectionStatus()

  const renderContent = () => {
    switch (status) {
      case 'OFFLINE':
        return (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
            title="You are offline. Workout progress is safely saved locally."
          >
            <WifiOff size={13} className="text-amber-600" />
            {showText && <span>OFFLINE</span>}
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </div>
        )

      case 'SYNCING':
        return (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 animate-pulse"
            title="Synchronizing offline workouts with cloud..."
          >
            <RefreshCw size={13} className="animate-spin text-sky-600" />
            {showText && <span>SYNCING</span>}
            {pendingCount > 0 && <span>({pendingCount})</span>}
          </div>
        )

      case 'SYNCED':
        return (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fade-in"
            title="All workout records are fully synced."
          >
            <CheckCircle2 size={13} className="text-emerald-600" />
            {showText && <span>SYNCED</span>}
          </div>
        )

      case 'SYNC ERROR':
        return (
          <button
            onClick={() => syncNow()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            title={`Sync error: ${lastError || 'Click to retry'}`}
          >
            <AlertCircle size={13} className="text-rose-600" />
            {showText && <span>SYNC ERROR</span>}
            <span className="text-[10px] underline ml-0.5">Retry</span>
          </button>
        )

      case 'ONLINE':
      default:
        // When online and no pending items, show subtle online pill or dot
        if (pendingCount > 0) {
          return (
            <button
              onClick={() => syncNow()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
              title={`${pendingCount} pending item(s) awaiting sync. Click to sync now.`}
            >
              <RefreshCw size={12} className="text-brand-600" />
              <span>{pendingCount} PENDING</span>
            </button>
          )
        }

        return (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-surface-500 hover:text-surface-700 transition-colors"
            title="Connected to GYMTrack cloud service"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {showText && <span className="text-[10px] tracking-wider uppercase font-semibold">ONLINE</span>}
          </div>
        )
    }
  }

  return (
    <div className={cn('inline-flex items-center', className)}>
      {renderContent()}
    </div>
  )
}
