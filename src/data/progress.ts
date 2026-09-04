import type {
  PersonalRecord,
  WeeklyActivity,
  MonthlyConsistency,
  ChartDataPoint,
} from '@/types'

// ─── Personal Records ──────────────────────────────────────────────────────────

export const personalRecords: PersonalRecord[] = [
  {
    id: 'pr-001',
    exerciseId: 'ex-001',
    exerciseName: 'Barbell Bench Press',
    value: 92.5,
    unit: 'kg',
    achievedAt: '2026-08-15T00:00:00Z',
    previousValue: 90,
  },
  {
    id: 'pr-002',
    exerciseId: 'ex-002',
    exerciseName: 'Back Squat',
    value: 120,
    unit: 'kg',
    achievedAt: '2026-08-22T00:00:00Z',
    previousValue: 115,
  },
  {
    id: 'pr-003',
    exerciseId: 'ex-003',
    exerciseName: 'Conventional Deadlift',
    value: 140,
    unit: 'kg',
    achievedAt: '2026-09-01T00:00:00Z',
    previousValue: 132.5,
  },
  {
    id: 'pr-004',
    exerciseId: 'ex-009',
    exerciseName: 'Pull-Up',
    value: 12,
    unit: 'reps',
    achievedAt: '2026-07-30T00:00:00Z',
    previousValue: 10,
  },
  {
    id: 'pr-005',
    exerciseId: 'ex-005',
    exerciseName: 'Dumbbell Shoulder Press',
    value: 32,
    unit: 'kg',
    achievedAt: '2026-08-10T00:00:00Z',
    previousValue: 30,
  },
]

// ─── Bench Press Strength Progress ────────────────────────────────────────────

export const benchPressProgress: ChartDataPoint[] = [
  { date: '2026-01-15', value: 60, label: '60 kg' },
  { date: '2026-02-01', value: 65, label: '65 kg' },
  { date: '2026-02-20', value: 67.5, label: '67.5 kg' },
  { date: '2026-03-08', value: 70, label: '70 kg' },
  { date: '2026-03-25', value: 72.5, label: '72.5 kg' },
  { date: '2026-04-10', value: 75, label: '75 kg' },
  { date: '2026-04-28', value: 77.5, label: '77.5 kg' },
  { date: '2026-05-14', value: 80, label: '80 kg' },
  { date: '2026-05-30', value: 80, label: '80 kg' },
  { date: '2026-06-15', value: 82.5, label: '82.5 kg' },
  { date: '2026-07-02', value: 85, label: '85 kg' },
  { date: '2026-07-20', value: 87.5, label: '87.5 kg' },
  { date: '2026-08-05', value: 90, label: '90 kg' },
  { date: '2026-08-15', value: 92.5, label: '92.5 kg' },
  { date: '2026-09-03', value: 92.5, label: '92.5 kg' },
]

export const squatProgress: ChartDataPoint[] = [
  { date: '2026-01-15', value: 80 },
  { date: '2026-02-10', value: 85 },
  { date: '2026-03-05', value: 90 },
  { date: '2026-04-01', value: 95 },
  { date: '2026-05-01', value: 100 },
  { date: '2026-06-01', value: 105 },
  { date: '2026-07-01', value: 110 },
  { date: '2026-08-01', value: 115 },
  { date: '2026-08-22', value: 120 },
]

export const deadliftProgress: ChartDataPoint[] = [
  { date: '2026-01-15', value: 100 },
  { date: '2026-02-15', value: 110 },
  { date: '2026-03-15', value: 115 },
  { date: '2026-04-15', value: 120 },
  { date: '2026-05-15', value: 125 },
  { date: '2026-06-15', value: 130 },
  { date: '2026-07-15', value: 132.5 },
  { date: '2026-08-15', value: 135 },
  { date: '2026-09-01', value: 140 },
]

// ─── Weekly Training Volume ────────────────────────────────────────────────────

export const weeklyVolumeData: ChartDataPoint[] = [
  { date: 'Week 1 Jun', value: 18500 },
  { date: 'Week 2 Jun', value: 21000 },
  { date: 'Week 3 Jun', value: 19800 },
  { date: 'Week 4 Jun', value: 22400 },
  { date: 'Week 1 Jul', value: 23100 },
  { date: 'Week 2 Jul', value: 24500 },
  { date: 'Week 3 Jul', value: 22000 },
  { date: 'Week 4 Jul', value: 25600 },
  { date: 'Week 1 Aug', value: 26200 },
  { date: 'Week 2 Aug', value: 27100 },
  { date: 'Week 3 Aug', value: 25400 },
  { date: 'Week 4 Aug', value: 28300 },
]

// ─── Weekly Activity ──────────────────────────────────────────────────────────

export const weeklyActivity: WeeklyActivity[] = [
  { day: 'Mon', date: '2026-09-04', trained: false },
  { day: 'Tue', date: '2026-09-03', trained: true, duration: 55, volume: 8420 },
  { day: 'Wed', date: '2026-09-02', trained: true, duration: 58, volume: 7950 },
  { day: 'Thu', date: '2026-09-01', trained: true, duration: 60, volume: 9100 },
  { day: 'Fri', date: '2026-08-31', trained: true, duration: 70, volume: 12500 },
  { day: 'Sat', date: '2026-08-30', trained: false },
  { day: 'Sun', date: '2026-08-29', trained: true, duration: 50, volume: 8100 },
]

// ─── Monthly Consistency ──────────────────────────────────────────────────────

function generateMonthData(year: number, month: number, trainingDays: number[]): MonthlyConsistency[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const trained = trainingDays.includes(day)
    return { date, trained, duration: trained ? Math.floor(Math.random() * 25) + 45 : undefined }
  })
}

export const monthlyConsistency: MonthlyConsistency[] = [
  ...generateMonthData(2026, 8, [1,2,4,5,7,8,11,12,14,15,18,19,21,22,25,26,28,29,31]),
  ...generateMonthData(2026, 9, [1,2,3]),
]

// ─── Overall Stats ────────────────────────────────────────────────────────────

export const overallStats = {
  totalWorkouts: 127,
  totalTrainingTime: 6890, // minutes
  currentStreak: 5,       // days
  longestStreak: 18,
  weeklyVolume: 46070,    // kg this week
  weeklyWorkouts: 4,
  averageSessionDuration: 54, // minutes
}
