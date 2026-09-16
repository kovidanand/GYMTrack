import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWeight(value: number, unit: 'kg' | 'lb' = 'kg'): string {
  return `${value} ${unit}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(dateString)
}

export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

const TAG_LABEL_MAP: Record<string, string> = {
  // Experience / Difficulty
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',

  // Muscle groups
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  legs: 'Legs',
  quads: 'Quadriceps',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  traps: 'Traps',
  core: 'Core',
  abs: 'Core',
  full_body: 'Full Body',
  'full body': 'Full Body',

  // Equipment
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
  resistance_band: 'Resistance Band',
  'resistance band': 'Resistance Band',
  kettlebell: 'Kettlebell',
  pull_up_bar: 'Pull-up Bar',
  'pull up bar': 'Pull-up Bar',
  bench: 'Bench',
  none: 'No Equipment',

  // Goals / Types
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  functional: 'Functional',
  endurance: 'Endurance',
  mobility: 'Mobility',
  stretching: 'Stretching',
  cardio: 'Cardio',
}

/**
 * Standardize user-facing exercise metadata and tags to consistent Title Case.
 */
export function formatTagLabel(value: string | undefined | null): string {
  if (!value) return ''
  const trimmed = value.trim()
  const normalized = trimmed.toLowerCase()
  const underscoreKey = normalized.replace(/[-\s]+/g, '_')
  const spaceKey = normalized.replace(/[_-]+/g, ' ')

  if (TAG_LABEL_MAP[underscoreKey]) return TAG_LABEL_MAP[underscoreKey]
  if (TAG_LABEL_MAP[spaceKey]) return TAG_LABEL_MAP[spaceKey]
  if (TAG_LABEL_MAP[normalized]) return TAG_LABEL_MAP[normalized]

  // Fallback: Title Case for multi-word or single-word terms
  return trimmed
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const formatExerciseLabel = formatTagLabel

export function getMuscleGroupLabel(group: string): string {
  return formatTagLabel(group)
}

export function getEquipmentLabel(equipment: string): string {
  return formatTagLabel(equipment)
}

export function formatVolumeDisplay(volumeKg: number): string {
  if (!volumeKg || volumeKg <= 0) return '0 kg'
  if (volumeKg < 10000) {
    return `${volumeKg.toLocaleString()} kg`
  }
  const inK = volumeKg / 1000
  const formatted = inK >= 100 ? Math.round(inK) : inK.toFixed(1).replace(/\.0$/, '')
  return `${formatted}k kg`
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    beginner: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
    advanced: 'text-red-700 bg-red-50 border-red-200',
  }
  return colors[difficulty] ?? 'text-surface-700 bg-surface-100'
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    strength: 'text-brand-700 bg-brand-50 border-brand-200',
    cardio: 'text-orange-700 bg-orange-50 border-orange-200',
    mobility: 'text-teal-700 bg-teal-50 border-teal-200',
    stretching: 'text-purple-700 bg-purple-50 border-purple-200',
  }
  return colors[category] ?? 'text-surface-700 bg-surface-100'
}
