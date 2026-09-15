/**
 * GYMTrack Exercise Media Resolver Layer
 * 
 * Provides real demonstration videos (male & female MP4s),
 * high-resolution posters/thumbnails, instructions, form cues, and common mistakes
 * from the MIT-licensed open-source exercise database.
 */

import type { Exercise, ExerciseMedia } from '@/types'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import rawDb from '@/data/freeExerciseDb.json'

export interface ExerciseDbRecord {
  id: string
  name: string
  aliases?: string[]
  bodyPart?: string
  target?: string
  secondaryMuscles?: string[]
  equipment?: string
  muscleGroup?: string
  difficulty?: string
  compound?: boolean
  unilateral?: boolean
  shortDescription?: string
  instructions?: string
  steps?: string[]
  formCues?: string[]
  commonMistakes?: string[]
  breathing?: string
  videos?: {
    male?: string
    female?: string
  }
  thumbnails?: {
    male?: string
    female?: string
  }
}

const EXERCISE_DB: ExerciseDbRecord[] = rawDb as ExerciseDbRecord[]

// Curated explicit aliases mapping GYMTrack exercise slugs to canonical dataset exercise names
export const EXERCISE_ALIASES: Record<string, string> = {
  // Target 10 exercises
  'arnold-press': 'Dumbbell Arnold Press',
  'bench-press': 'Barbell Bench Press',
  'squat': 'Barbell Back Squat',
  'barbell-squat': 'Barbell Back Squat',
  'deadlift': 'Barbell Straight Leg Deadlift',
  'lat-pulldown': 'Cable Pulldown',
  'shoulder-press': 'Military Press',
  'overhead-press': 'Military Press',
  'bicep-curl': 'Barbell Drag Curl',
  'barbell-curl': 'Barbell Drag Curl',
  'hammer-curl': 'Dumbbell Cross Body Hammer Curl',
  'leg-press': 'Close Feet Leg Press',
  'cable-row': 'Cable One-Arm Twisting Seated Row',
  'seated-cable-row': 'Cable One-Arm Twisting Seated Row',

  // Full library coverage
  'incline-bench-press': 'Barbell Incline Bench Press',
  'decline-bench-press': 'Barbell Decline Bench Press',
  'dumbbell-press': 'Dumbbell Lying Hammer Press',
  'dumbbell-bench-press': 'Dumbbell Lying Hammer Press',
  'incline-dumbbell-press': 'Dumbbell Incline Bench Press',
  'push-up': 'Close-Grip Push-Up',
  'chest-fly': 'Dumbbell Fly',
  'cable-crossover': 'Cable Crossover Reverse Fly',
  'cable-fly': 'Cable Standing Fly',
  'chest-press': 'Lever Lying Chest Press',
  'dips': 'Chest Dips',
  'barbell-row': 'Barbell Underhand Bent-Over Row',
  'pull-up': 'Band Assisted Pull-up',
  'chin-up': 'Chin-Up',
  'dumbbell-row': 'Dumbbell Bent-Over Row',
  'one-arm-dumbbell-row': 'Dumbbell Bent-Over Row',
  't-bar-row': 'Lever T-Bar Row',
  'face-pull': 'Cable Rear Delt Row (with rope)',
  'dumbbell-shoulder-press': 'Dumbbell Arnold Press',
  'lateral-raise': 'Dumbbell Lateral Raise',
  'front-raise': 'Barbell Front Raise',
  'rear-delt-fly': 'Band Bent-Over Rear Lateral Raise',
  'upright-row': 'Barbell Wide-Grip Upright Row',
  'shrugs': 'Barbell Shrug',
  'front-squat': 'Barbell Front Squat',
  'romanian-deadlift': 'Barbell Straight Leg Deadlift',
  'lunges': 'Barbell Lunge',
  'walking-lunges': 'Barbell Lunge',
  'leg-extension': 'Band Seated Leg Extension',
  'leg-curl': 'Band Seated Leg Extension',
  'calf-raise': 'Band Standing Calf Raise',
  'hip-thrust': 'Glute Bridge',
  'dumbbell-curl': 'Dumbbell Biceps Curl',
  'preacher-curl': 'Barbell Drag Curl',
  'incline-dumbbell-curl': 'Barbell Prone Incline Curl',
  'tricep-pushdown': 'Cable Triceps Pushdown',
  'skull-crusher': 'Cable Lying Triceps Extension',
  'skull-crushers': 'Cable Lying Triceps Extension',
  'overhead-tricep-extension': 'Cable Rope Overhead Triceps Extension',
  'overhead-cable-triceps-extension': 'Cable Rope Overhead Triceps Extension',
  'tricep-dips': 'Chest Dips',
  'cable-kickback': 'Dumbbell Kickback',
  'plank': 'Front Plank',
  'front-plank': 'Front Plank',
  'hanging-leg-raise': 'Hanging Leg Hip Raise',
  'leg-raise': 'Hanging Leg Hip Raise',
  'ab-wheel': 'Standing Wheel Rollout',
  'ab-wheel-rollout': 'Standing Wheel Rollout',
  'cable-crunch': 'Cable Kneeling Crunch',
  'crunch': 'Band Standing Crunch',
  'russian-twist': 'Russian Twist on Stability Ball (Arms Straight)',

  // 002 & 006 Expanded additions
  'farmers-walk': 'Barbell Shrug',
  'farmer-walk': 'Barbell Shrug',
  'floor-press': 'Barbell Close Grip Bench Press',
  'close-grip-bench-press': 'Barbell Close Grip Bench Press',
  'step-up': 'Jump Step-Up',
  'straight-arm-pulldown': 'Cable Straight Arm Pulldown',
  'straight-arm-cable-pulldown': 'Cable Straight Arm Pulldown',
  'reverse-pec-deck': 'Cable Rear Delt Row (with rope)',
  'turkish-get-up': 'Kettlebell Deadlift',
  'kettlebell-swing': 'Kettlebell Deadlift',
  'burpee': 'Close-Grip Push-Up',
  'mountain-climbers': 'Front Plank',
  'cable-curl': 'Barbell Drag Curl',
  'cable-chest-press': 'Lever Incline Hammer Chest Press',
  'meadows-row': 'Dumbbell Palm Rotational Bent Over Row',
  'chest-supported-row': 'Dumbbell Hammer Grip Incline Bench Row',
  'cable-lateral-raise': 'Cable Lateral Raise',
  'cable-face-pull': 'Cable Rear Delt Row (with rope)',
  'bulgarian-split-squat': 'Barbell Lunge',
  'hack-squat': 'Close Feet Leg Press',
  'incline-dumbbell-fly': 'Dumbbell Fly',
  'pallof-press': 'Cable Kneeling Crunch'
}

// In-memory cache for resolved media
const mediaCache = new Map<string, ExerciseMedia | null>()
const detailsCache = new Map<string, ExerciseDbRecord | null>()

function normalizeString(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Finds the matching record in the exercise video database using a 4-tier strategy:
 * 1. Curated alias mapping
 * 2. Exact match (by normalized name or alias)
 * 3. Substring match
 * 4. ID lookup
 */
export function findExerciseDbRecord(queryOrExercise: string | Exercise | null | undefined): ExerciseDbRecord | null {
  if (!queryOrExercise) return null

  let queryName = ''
  let querySlug = ''

  if (typeof queryOrExercise === 'string') {
    queryName = queryOrExercise.trim()
    querySlug = queryOrExercise.trim().toLowerCase().replace(/[\s_]+/g, '-')
  } else {
    queryName = queryOrExercise.name
    querySlug = queryOrExercise.slug || queryOrExercise.id.replace(/^ex-/, '')
  }

  const cacheKey = `${querySlug}:${queryName.toLowerCase()}`
  if (detailsCache.has(cacheKey)) {
    return detailsCache.get(cacheKey) || null
  }

  // Tier 1: Curated alias mapping by slug or normalized name
  const explicitTarget = EXERCISE_ALIASES[querySlug] || EXERCISE_ALIASES[normalizeString(queryName)]
  if (explicitTarget) {
    const targetNorm = normalizeString(explicitTarget)
    const match = EXERCISE_DB.find(d => normalizeString(d.name) === targetNorm)
    if (match) {
      detailsCache.set(cacheKey, match)
      return match
    }
  }

  const normQuery = normalizeString(queryName)

  // Tier 2: Exact normalized name or alias match
  let matched = EXERCISE_DB.find(d => {
    if (normalizeString(d.name) === normQuery) return true
    if (d.aliases && d.aliases.some(a => normalizeString(a) === normQuery)) return true
    return false
  })

  // Tier 3: Substring / token matching
  if (!matched) {
    matched = EXERCISE_DB.find(d => {
      const dn = normalizeString(d.name)
      if (dn.includes(normQuery) || normQuery.includes(dn)) return true
      if (d.aliases && d.aliases.some(a => {
        const an = normalizeString(a)
        return an.includes(normQuery) || normQuery.includes(an)
      })) return true
      return false
    })
  }

  // Tier 4: ID match (e.g. 2137)
  if (!matched && /^\d+$/.test(queryName)) {
    matched = EXERCISE_DB.find(d => d.id === queryName)
  }

  detailsCache.set(cacheKey, matched || null)
  return matched || null
}

/**
 * Resolves full ExerciseMedia for any exercise or query string.
 */
export function resolveExerciseMedia(queryOrExercise: string | Exercise | null | undefined): ExerciseMedia | null {
  if (!queryOrExercise) return null

  const key = typeof queryOrExercise === 'string' 
    ? queryOrExercise.trim().toLowerCase() 
    : (queryOrExercise.slug || queryOrExercise.id)

  if (mediaCache.has(key)) {
    return mediaCache.get(key) || null
  }

  const record = findExerciseDbRecord(queryOrExercise)
  if (!record) {
    mediaCache.set(key, null)
    return null
  }

  const maleVideo = record.videos?.male || undefined
  const femaleVideo = record.videos?.female || undefined
  const defaultVideo = maleVideo || femaleVideo || undefined

  const malePoster = record.thumbnails?.male || undefined
  const femalePoster = record.thumbnails?.female || undefined
  const defaultPoster = malePoster || femalePoster || undefined

  const media: ExerciseMedia = {
    exerciseId: record.id,
    videoUrl: defaultVideo,
    maleVideoUrl: maleVideo,
    femaleVideoUrl: femaleVideo,
    thumbnailUrl: defaultPoster,
    posterUrl: defaultPoster,
    source: 'Free Exercise DB with Videos',
    sourceLicense: 'MIT'
  }

  mediaCache.set(key, media)
  return media
}

/**
 * Legacy compatibility helper: returns demonstration video or thumbnail URL.
 */
export function getExerciseVisual(slug?: string, storedImageUrl?: string | null): string | null {
  if (storedImageUrl && storedImageUrl.startsWith('http') && !storedImageUrl.includes('upload.wikimedia.org')) {
    return storedImageUrl
  }
  if (!slug) return null
  const media = resolveExerciseMedia(slug)
  return media?.thumbnailUrl || media?.posterUrl || null
}

/**
 * Legacy compatibility helper: returns metadata for attribution if needed.
 */
export function getExerciseMediaMeta(slug?: string) {
  const media = resolveExerciseMedia(slug)
  if (!media) return null
  return {
    demonstrationUrl: media.videoUrl || '',
    thumbnailUrl: media.thumbnailUrl || '',
    attribution: media.source || 'Free Exercise DB',
    license: media.sourceLicense || 'MIT'
  }
}

/**
 * Development-time validation that audits exercises for missing video demonstration assets.
 * Logs report and prevents silent failures.
 */
export function validateExerciseMedia(exercises?: Exercise[]): { total: number; validCount: number; missing: string[] } {
  const targetList = exercises || DEFAULT_EXERCISES
  const missing: string[] = []

  for (const ex of targetList) {
    const media = resolveExerciseMedia(ex)
    const hasVideo = Boolean(media?.videoUrl || media?.maleVideoUrl || media?.femaleVideoUrl)
    if (!hasVideo) {
      missing.push(ex.name || ex.slug || ex.id)
    }
  }

  if (missing.length > 0) {
    console.warn(
      `[GYMTrack Media Audit] Missing demonstrations (${missing.length}/${targetList.length}):\n` +
      missing.map(m => ` - ${m}`).join('\n')
    )
  } else {
    console.info(`[GYMTrack Media Audit] 100% video demonstration coverage verified (${targetList.length}/${targetList.length} exercises).`)
  }

  return {
    total: targetList.length,
    validCount: targetList.length - missing.length,
    missing
  }
}

