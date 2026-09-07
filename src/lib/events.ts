/**
 * GYMTrack Reactive Event Bus
 * Lightweight browser event bridge to trigger silent data synchronization
 * across hooks and pages without requiring manual browser reloads.
 */

export type GymtrackEventType =
  | 'gymtrack:workout_updated'
  | 'gymtrack:session_completed'
  | 'gymtrack:sync_completed'
  | 'gymtrack:exercise_favorited'

interface EventDetailMap {
  'gymtrack:workout_updated': { workoutId?: string; action?: 'create' | 'update' | 'delete' | 'add_exercise' }
  'gymtrack:session_completed': { sessionId: string; workoutId?: string }
  'gymtrack:sync_completed': { syncedCount: number }
  'gymtrack:exercise_favorited': { exerciseId: string; isFavorite: boolean }
}

export function emitGymtrackEvent<T extends GymtrackEventType>(
  type: T,
  detail?: EventDetailMap[T]
): void {
  if (typeof window === 'undefined') return
  try {
    const event = new CustomEvent(type, { detail: detail || {} })
    window.dispatchEvent(event)
  } catch (err) {
    console.warn('[GYMTrack EventBus] Failed to emit event:', type, err)
  }
}

export function subscribeGymtrackEvent<T extends GymtrackEventType>(
  type: T,
  callback: (detail: EventDetailMap[T]) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<EventDetailMap[T]>
    callback(customEvent.detail)
  }

  window.addEventListener(type, handler)
  return () => {
    window.removeEventListener(type, handler)
  }
}
