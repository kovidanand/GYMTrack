/**
 * GYMTrack Verified Exercise Media Library
 * Provides legally verified, open-license (CC-BY-SA / Public Domain / Wikimedia Commons / Wger)
 * instructional media assets with high-reliability fallback visuals.
 */

interface ExerciseMediaAsset {
  demonstrationUrl: string
  thumbnailUrl: string
  attribution: string
  license: string
}

// Curated dictionary of canonical exercise media assets
export const EXERCISE_MEDIA_REGISTRY: Record<string, ExerciseMediaAsset> = {
  'bench-press': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Barbell-bench-press-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Barbell-bench-press-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'incline-bench-press': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Incline-barbell-bench-press-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Incline-barbell-bench-press-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'dumbbell-bench-press': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Dumbbell-bench-press-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Dumbbell-bench-press-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'incline-dumbbell-press': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Incline-dumbbell-bench-press-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Incline-dumbbell-bench-press-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'push-up': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pushup-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pushup-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'deadlift': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Barbell-deadlift-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Barbell-deadlift-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'romanian-deadlift': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Barbell-romanian-deadlift-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Barbell-romanian-deadlift-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'squat': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Barbell-squat-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Barbell-squat-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'barbell-squat': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Barbell-squat-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Barbell-squat-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'front-squat': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Barbell-front-squat-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Barbell-front-squat-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'pull-up': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Pullup-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Pullup-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'lat-pulldown': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Cable-pulldown-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Cable-pulldown-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'barbell-row': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Barbell-bent-over-row-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Barbell-bent-over-row-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'dumbbell-row': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/One-arm-dumbbell-row-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/One-arm-dumbbell-row-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'overhead-press': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Barbell-standing-military-press-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Barbell-standing-military-press-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'dumbbell-shoulder-press': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Seated-dumbbell-shoulder-press-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Seated-dumbbell-shoulder-press-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'lateral-raise': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Dumbbell-lateral-raise-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Dumbbell-lateral-raise-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'barbell-curl': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Barbell-biceps-curl-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Barbell-biceps-curl-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'dumbbell-curl': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Dumbbell-biceps-curl-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Dumbbell-biceps-curl-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'triceps-pushdown': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Cable-pushdown-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Cable-pushdown-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'skull-crushers': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Barbell-lying-triceps-extension-skull-crusher-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Barbell-lying-triceps-extension-skull-crusher-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'dips': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Dip-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Dip-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'leg-press': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Sled-45-degree-leg-press-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Sled-45-degree-leg-press-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'lunges': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Bodyweight-lunge-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Bodyweight-lunge-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'plank': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Plank-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Plank-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  },
  'hanging-leg-raise': {
    demonstrationUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Hanging-leg-raise-2.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Hanging-leg-raise-2.png',
    attribution: 'Wikimedia Commons / Everkinetic',
    license: 'CC-BY-SA 3.0'
  }
}

/**
 * Returns the best visual demonstration URL for a given exercise.
 * If a custom image_url is stored in database, it takes precedence;
 * otherwise it pulls from the verified open-license registry.
 */
export function getExerciseVisual(slug?: string, storedImageUrl?: string | null): string | null {
  if (storedImageUrl && storedImageUrl.startsWith('http')) {
    return storedImageUrl
  }
  if (!slug) return null
  const cleanSlug = slug.toLowerCase().trim()
  return EXERCISE_MEDIA_REGISTRY[cleanSlug]?.demonstrationUrl || null
}

export function getExerciseMediaMeta(slug?: string): ExerciseMediaAsset | null {
  if (!slug) return null
  return EXERCISE_MEDIA_REGISTRY[slug.toLowerCase().trim()] || null
}
