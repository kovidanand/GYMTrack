/**
 * GYMTrack Local Date Utilities
 * Ensures consistent local-date formatting and prevents UTC-shift bugs.
 */

/**
 * Format a Date object or today to local 'YYYY-MM-DD' string without UTC conversion.
 */
export function toLocalISODate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a 'YYYY-MM-DD' string into a local Date object (at midnight local time).
 */
export function parseLocalISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

/**
 * Get yesterday's date in local 'YYYY-MM-DD' string.
 */
export function getYesterdayISODate(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toLocalISODate(d)
}

/**
 * Check if a date string is today.
 */
export function isTodayDate(dateStr: string): boolean {
  return dateStr === toLocalISODate()
}

/**
 * Check if a date string is yesterday.
 */
export function isYesterdayDate(dateStr: string): boolean {
  return dateStr === getYesterdayISODate()
}

/**
 * Format a date for human-readable display (e.g. "Sunday, Oct 18" or "Oct 18, 2026").
 */
export function formatFriendlyDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  const d = parseLocalISODate(dateStr)
  const defaultOpts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options,
  }
  return d.toLocaleDateString(undefined, defaultOpts)
}

/**
 * Generate date-aware dashboard heading and subtitle.
 */
export function getDashboardDateHeadings(dateStr: string): {
  heading: string
  subtitle: string
  logHeading: string
} {
  if (isTodayDate(dateStr)) {
    return {
      heading: "Today's Nutrition",
      subtitle: 'Track your calorie and nutrient intake for today.',
      logHeading: "Today's Logged Meals",
    }
  }

  if (isYesterdayDate(dateStr)) {
    return {
      heading: "Yesterday's Nutrition",
      subtitle: 'Review your calorie and nutrient intake from yesterday.',
      logHeading: "Yesterday's Logged Meals",
    }
  }

  const d = parseLocalISODate(dateStr)
  const fullDate = d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return {
    heading: `Nutrition for ${fullDate}`,
    subtitle: `Nutrition summary for ${fullDate}.`,
    logHeading: `Logged Meals for ${fullDate}`,
  }
}
