import type { Workout, WorkoutSession, WorkoutSessionSet, Exercise, WorkoutExercise } from '@/types'

const DB_NAME = 'gymtrack_offline_db'
const DB_VERSION = 1

export interface SyncOperation {
  id: string                   // Stable operation ID / idempotency key
  userId: string
  sessionId: string            // Stable client-generated UUID for the session
  operationType: 'SAVE_WORKOUT_SESSION' | 'LOG_SET'
  payload: {
    sessionData: Partial<WorkoutSession>
    setsData: Partial<WorkoutSessionSet>[]
  }
  createdAt: number            // Timestamp
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
  retryCount: number
  lastError?: string | null
}

export interface ActiveWorkoutSession {
  workoutId: string
  userId: string
  sessionId: string            // Client-generated UUID to preserve session ID across reloads
  startedAt: number
  currentExerciseIndex: number
  completedSets: Record<string, number[]>
  sessionSetsData: Partial<WorkoutSessionSet>[]
  updatedAt: number
}

// Fallback UUID generator if crypto.randomUUID is not available
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

let dbPromise: Promise<IDBDatabase> | null = null

export function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'))
  }

  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 1. Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' })
          syncStore.createIndex('by_user', 'userId', { unique: false })
          syncStore.createIndex('by_status', 'syncStatus', { unique: false })
          syncStore.createIndex('by_created', 'createdAt', { unique: false })
          syncStore.createIndex('by_session', 'sessionId', { unique: false })
        }

        // 2. Active workout session store (for reload resilience while in a workout)
        if (!db.objectStoreNames.contains('active_sessions')) {
          db.createObjectStore('active_sessions', { keyPath: 'workoutId' })
        }

        // 3. Cached workouts store (to enable starting a workout offline)
        if (!db.objectStoreNames.contains('cached_workouts')) {
          db.createObjectStore('cached_workouts', { keyPath: 'id' })
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  return dbPromise
}

// ─── Sync Queue Operations ─────────────────────────────────────────────────────

export async function enqueueSyncOperation(operation: SyncOperation): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite')
    const store = tx.objectStore('sync_queue')
    const req = store.put(operation)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getPendingSyncOperations(userId?: string): Promise<SyncOperation[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly')
    const store = tx.objectStore('sync_queue')
    const req = store.getAll()

    req.onsuccess = () => {
      const ops = (req.result as SyncOperation[]) || []
      // Filter by user and non-synced status, sorted chronologically
      const filtered = ops
        .filter(op => (!userId || op.userId === userId) && op.syncStatus !== 'synced')
        .sort((a, b) => a.createdAt - b.createdAt)
      resolve(filtered)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function getAllSyncOperations(): Promise<SyncOperation[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly')
    const store = tx.objectStore('sync_queue')
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

export async function updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite')
    const store = tx.objectStore('sync_queue')
    const getReq = store.get(id)

    getReq.onsuccess = () => {
      const existing = getReq.result as SyncOperation | undefined
      if (!existing) {
        resolve()
        return
      }
      const updated = { ...existing, ...updates }
      const putReq = store.put(updated)
      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error)
    }
    getReq.onerror = () => reject(getReq.error)
  })
}

export async function removeSyncOperation(id: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite')
    const store = tx.objectStore('sync_queue')
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// ─── Active Workout Session Operations ─────────────────────────────────────────

export async function saveActiveSession(session: ActiveWorkoutSession): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('active_sessions', 'readwrite')
    const store = tx.objectStore('active_sessions')
    const req = store.put(session)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getActiveSession(workoutId: string): Promise<ActiveWorkoutSession | null> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('active_sessions', 'readonly')
    const store = tx.objectStore('active_sessions')
    const req = store.get(workoutId)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

export async function clearActiveSession(workoutId: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('active_sessions', 'readwrite')
    const store = tx.objectStore('active_sessions')
    const req = store.delete(workoutId)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function clearAllActiveSessions(): Promise<void> {
  try {
    const db = await getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('active_sessions', 'readwrite')
      const store = tx.objectStore('active_sessions')
      const req = store.clear()
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('[GYMTrack] clearAllActiveSessions notice:', err)
  }
}

// ─── Cached Workouts Operations ───────────────────────────────────────────────

export async function cacheWorkout(workout: Workout): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cached_workouts', 'readwrite')
    const store = tx.objectStore('cached_workouts')
    const req = store.put(workout)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getCachedWorkout(workoutId: string): Promise<Workout | null> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cached_workouts', 'readonly')
    const store = tx.objectStore('cached_workouts')
    const req = store.get(workoutId)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

// ─── Today / Quick Workout Exercise Queue ─────────────────────────────────────

const QUEUED_EXERCISES_KEY = 'gymtrack_queued_today_exercises'

export function queueExerciseForTodayWorkout(
  exercise: Exercise, 
  sets = 3, 
  reps = '10', 
  weight?: number | null
): WorkoutExercise {
  const existing = getQueuedExercisesForTodayWorkout()
  const nowStr = new Date().toISOString()
  
  // Check if already in queue
  const found = existing.find(e => e.exercise_id === exercise.id)
  if (found) {
    return found
  }

  const defaultWeight = weight !== undefined 
    ? weight 
    : (exercise.equipment?.includes('bodyweight') ? null : 50)

  const newItem: WorkoutExercise = {
    id: generateUUID(),
    workout_id: 'quick',
    exercise_id: exercise.id,
    exercise_order: existing.length + 1,
    sets,
    reps,
    weight: defaultWeight,
    rest_seconds: 60,
    notes: null,
    created_at: nowStr,
    updated_at: nowStr,
    exercise
  }

  const updated = [...existing, newItem]
  try {
    localStorage.setItem(QUEUED_EXERCISES_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('[GYMTrack] Failed to save queued exercise to localStorage:', err)
  }

  return newItem
}

export function getQueuedExercisesForTodayWorkout(): WorkoutExercise[] {
  try {
    const raw = localStorage.getItem(QUEUED_EXERCISES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearQueuedExercisesForTodayWorkout(): void {
  try {
    localStorage.removeItem(QUEUED_EXERCISES_KEY)
  } catch {
    /* ignore storage access error */
  }
}

