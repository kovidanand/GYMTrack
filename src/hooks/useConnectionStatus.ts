import { useState, useEffect, useCallback } from 'react'
import { syncEngine, type ConnectionStatus } from '@/lib/offline/syncEngine'

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(syncEngine.getStatus())
  const [pendingCount, setPendingCount] = useState<number>(syncEngine.getPendingCount())
  const [lastError, setLastError] = useState<string | null>(syncEngine.getLastError())

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((newStatus, count, err) => {
      setStatus(newStatus)
      setPendingCount(count)
      setLastError(err)
    })
    return unsubscribe
  }, [])

  const syncNow = useCallback(async () => {
    return syncEngine.syncPending()
  }, [])

  return {
    status,
    pendingCount,
    lastError,
    syncNow,
    isOnline: status !== 'OFFLINE'
  }
}
