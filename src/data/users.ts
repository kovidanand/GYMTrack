import type { User } from '@/types'

export const mockUser: User = {
  id: 'user-001',
  name: 'Kovid Anand',
  email: 'kovid@example.com',
  joinedAt: '2025-01-15T00:00:00Z',
  fitnessGoal: 'build_muscle',
  experienceLevel: 'intermediate',
  trainingFrequency: 5,
  preferredEquipment: ['barbell', 'dumbbell', 'cable'],
  bodyStats: {
    height: 178,
    weight: 78,
    age: 28,
  },
  units: 'metric',
}
