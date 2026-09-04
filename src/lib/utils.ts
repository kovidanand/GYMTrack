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

export function getMuscleGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    chest: 'Chest',
    back: 'Back',
    shoulders: 'Shoulders',
    biceps: 'Biceps',
    triceps: 'Triceps',
    legs: 'Legs',
    quads: 'Quadriceps',
    hamstrings: 'Hamstrings',
    glutes: 'Glutes',
    calves: 'Calves',
    core: 'Core',
    full_body: 'Full Body',
    forearms: 'Forearms',
    traps: 'Traps',
  }
  return labels[group] ?? capitalise(group)
}

export function getEquipmentLabel(equipment: string): string {
  const labels: Record<string, string> = {
    barbell: 'Barbell',
    dumbbell: 'Dumbbell',
    cable: 'Cable',
    machine: 'Machine',
    bodyweight: 'Bodyweight',
    resistance_band: 'Resistance Band',
    kettlebell: 'Kettlebell',
    pull_up_bar: 'Pull-up Bar',
    bench: 'Bench',
    none: 'No Equipment',
  }
  return labels[equipment] ?? capitalise(equipment)
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
