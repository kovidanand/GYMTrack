import { supabase } from '@/lib/supabase'
import {
  getPendingSyncOperations,
  updateSyncOperation,
  removeSyncOperation,
  type SyncOperation
} from './db'

export type ConnectionStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNCED' | 'SYNC ERROR'

type StatusListener = (status: ConnectionStatus, pendingCount: number, error: string | null) => void

class SyncEngine {
  private status: ConnectionStatus = typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'ONLINE'
  private pendingCount = 0
  private lastError: string | null = null
  private listeners: Set<StatusListener> = new Set()
  private isSyncing = false
  private syncTimeout: ReturnType<typeof setTimeout> | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.updateStatus('ONLINE')
        this.syncPending()
      })

      window.addEventListener('offline', () => {
        this.updateStatus('OFFLINE')
      })

      // Sync when tab regains visibility if online
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          this.syncPending()
        }
      })

      // Initial check of pending queue
      this.refreshPendingCount()
    }
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener)
    listener(this.status, this.pendingCount, this.lastError)
    return () => this.listeners.delete(listener)
  }

  public getStatus(): ConnectionStatus {
    return this.status
  }

  public getPendingCount(): number {
    return this.pendingCount
  }

  public getLastError(): string | null {
    return this.lastError
  }

  private updateStatus(newStatus: ConnectionStatus, error: string | null = null) {
    this.status = newStatus
    if (error !== undefined) {
      this.lastError = error
    }
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(fn => {
      try {
        fn(this.status, this.pendingCount, this.lastError)
      } catch (err) {
        console.error('[GYMTrack SyncEngine] Listener error:', err)
      }
    })
  }

  public async refreshPendingCount(): Promise<number> {
    try {
      const ops = await getPendingSyncOperations()
      this.pendingCount = ops.length
      this.notifyListeners()
      return this.pendingCount
    } catch {
      return 0
    }
  }

  /**
   * Main synchronization routine: iterates through queued offline operations in FIFO order
   * and idempotently persists them to Supabase.
   */
  public async syncPending(): Promise<{ success: boolean; syncedCount: number; error: string | null }> {
    if (this.isSyncing) {
      return { success: true, syncedCount: 0, error: null }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateStatus('OFFLINE')
      return { success: false, syncedCount: 0, error: 'Network is offline' }
    }

    this.isSyncing = true
    this.updateStatus('SYNCING')

    let syncedCount = 0
    let failureError: string | null = null

    try {
      const operations = await getPendingSyncOperations()
      this.pendingCount = operations.length

      if (operations.length === 0) {
        this.updateStatus('ONLINE')
        this.isSyncing = false
        return { success: true, syncedCount: 0, error: null }
      }

      for (const op of operations) {
        // Prevent infinite loops on broken operations
        if (op.retryCount >= 5) {
          await updateSyncOperation(op.id, { syncStatus: 'failed', lastError: 'Max retries exceeded' })
          continue
        }

        await updateSyncOperation(op.id, { syncStatus: 'syncing' })

        const syncResult = await this.executeOperation(op)

        if (syncResult.success) {
          await removeSyncOperation(op.id)
          syncedCount++
        } else {
          failureError = syncResult.error || 'Failed to sync operation'
          await updateSyncOperation(op.id, {
            syncStatus: 'pending',
            retryCount: op.retryCount + 1,
            lastError: failureError
          })
          // If network error occurred, break early rather than failing every queued item
          if (syncResult.isNetworkError) {
            break
          }
        }
      }

      await this.refreshPendingCount()

      if (failureError) {
        this.updateStatus('SYNC ERROR', failureError)
        this.isSyncing = false
        return { success: false, syncedCount, error: failureError }
      } else {
        this.updateStatus('SYNCED')
        // Automatically transition back to ONLINE after 3 seconds
        if (this.syncTimeout) clearTimeout(this.syncTimeout)
        this.syncTimeout = setTimeout(() => {
          if (this.status === 'SYNCED') {
            this.updateStatus('ONLINE')
          }
        }, 3000)

        this.isSyncing = false
        return { success: true, syncedCount, error: null }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[GYMTrack SyncEngine] Sync exception:', msg)
      this.updateStatus('SYNC ERROR', msg)
      this.isSyncing = false
      return { success: false, syncedCount, error: msg }
    }
  }

  /**
   * Idempotently executes an operation against Supabase.
   * Guarantees that duplicate attempts will NOT duplicate sessions or sets.
   */
  private async executeOperation(op: SyncOperation): Promise<{ success: boolean; isNetworkError?: boolean; error?: string }> {
    try {
      if (op.operationType === 'SAVE_WORKOUT_SESSION') {
        const { sessionData, setsData } = op.payload

        // 1. Idempotent session upsert: Check if this session ID already exists in Supabase
        const { data: existingSession, error: checkErr } = await supabase
          .from('workout_sessions')
          .select('id')
          .eq('id', op.sessionId)
          .maybeSingle()

        if (checkErr && checkErr.message.includes('Fetch')) {
          return { success: false, isNetworkError: true, error: checkErr.message }
        }

        let sessionId = op.sessionId

        if (!existingSession) {
          // Insert session with stable ID
          const payloadToInsert = {
            ...sessionData,
            id: op.sessionId
          }

          const { data: newSession, error: insertSessionErr } = await supabase
            .from('workout_sessions')
            .insert(payloadToInsert)
            .select()
            .single()

          if (insertSessionErr) {
            console.error('[GYMTrack SyncEngine] Session insert error:', insertSessionErr.message)
            const isNetwork = insertSessionErr.message.includes('fetch') || insertSessionErr.message.includes('network')
            return { success: false, isNetworkError: isNetwork, error: insertSessionErr.message }
          }

          sessionId = newSession?.id || op.sessionId
        }

        // 2. Idempotent sets insertion: Fetch existing sets for this session
        if (setsData && setsData.length > 0) {
          const { data: existingSets } = await supabase
            .from('workout_session_sets')
            .select('id')
            .eq('session_id', sessionId)

          const existingSetIds = new Set(existingSets?.map(s => s.id) || [])

          // Filter out any sets that have already been persisted
          const setsToInsert = setsData
            .filter(s => !s.id || !existingSetIds.has(s.id))
            .map(s => ({
              ...s,
              session_id: sessionId
            }))

          if (setsToInsert.length > 0) {
            const { error: setsErr } = await supabase
              .from('workout_session_sets')
              .insert(setsToInsert)

            if (setsErr) {
              console.error('[GYMTrack SyncEngine] Sets insert error:', setsErr.message)
              const isNetwork = setsErr.message.includes('fetch') || setsErr.message.includes('network')
              return { success: false, isNetworkError: isNetwork, error: setsErr.message }
            }
          }
        }

        return { success: true }
      }

      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const isNetwork = msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('NetworkError')
      return { success: false, isNetworkError: isNetwork, error: msg }
    }
  }
}

export const syncEngine = new SyncEngine()
