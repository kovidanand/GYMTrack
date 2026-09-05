import type { Workout, WorkoutSession } from '@/types'

export const workouts: Workout[] = [
  {
    id: 'wo-001',
    name: 'Push Day',
    description: 'Chest, shoulders and triceps focused training session.',
    estimated_duration: 55,
    lastCompleted: '2026-09-02T07:30:00Z',
    created_at: '2026-01-20T00:00:00Z',
    isTemplate: false,
    tags: ['push', 'upper-body'],
    exercises: [
      { id: 'we-001', exerciseId: 'ex-001', order: 1, sets: [
        { id: 's1', targetReps: 8, targetWeight: 80, restTime: 180 },
        { id: 's2', targetReps: 8, targetWeight: 80, restTime: 180 },
        { id: 's3', targetReps: 6, targetWeight: 82.5, restTime: 180 },
        { id: 's4', targetReps: 6, targetWeight: 82.5, restTime: 180 },
      ]},
      { id: 'we-002', exerciseId: 'ex-007', order: 2, sets: [
        { id: 's5', targetReps: 10, targetWeight: 30, restTime: 120 },
        { id: 's6', targetReps: 10, targetWeight: 30, restTime: 120 },
        { id: 's7', targetReps: 10, targetWeight: 28, restTime: 120 },
      ]},
      { id: 'we-003', exerciseId: 'ex-005', order: 3, sets: [
        { id: 's8', targetReps: 12, targetWeight: 22, restTime: 90 },
        { id: 's9', targetReps: 12, targetWeight: 22, restTime: 90 },
        { id: 's10', targetReps: 12, targetWeight: 22, restTime: 90 },
      ]},
      { id: 'we-004', exerciseId: 'ex-006', order: 4, sets: [
        { id: 's11', targetReps: 15, targetWeight: 35, restTime: 60 },
        { id: 's12', targetReps: 15, targetWeight: 35, restTime: 60 },
        { id: 's13', targetReps: 15, targetWeight: 35, restTime: 60 },
      ]},
      { id: 'we-005', exerciseId: 'ex-016', order: 5, sets: [
        { id: 's14', targetReps: 12, targetWeight: 18, restTime: 60 },
        { id: 's15', targetReps: 12, targetWeight: 18, restTime: 60 },
        { id: 's16', targetReps: 12, targetWeight: 18, restTime: 60 },
      ]},
      { id: 'we-006', exerciseId: 'ex-013', order: 6, sets: [
        { id: 's17', targetReps: 15, targetWeight: 15, restTime: 60 },
        { id: 's18', targetReps: 15, targetWeight: 15, restTime: 60 },
        { id: 's19', targetReps: 15, targetWeight: 15, restTime: 60 },
      ]},
    ],
  },
  {
    id: 'wo-002',
    name: 'Pull Day',
    description: 'Back and biceps focused training session.',
    estimated_duration: 58,
    lastCompleted: '2026-09-01T08:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
    isTemplate: false,
    tags: ['pull', 'upper-body'],
    exercises: [
      { id: 'we-007', exerciseId: 'ex-003', order: 1, sets: [
        { id: 's20', targetReps: 5, targetWeight: 130, restTime: 240 },
        { id: 's21', targetReps: 5, targetWeight: 130, restTime: 240 },
        { id: 's22', targetReps: 4, targetWeight: 140, restTime: 240 },
      ]},
      { id: 'we-008', exerciseId: 'ex-008', order: 2, sets: [
        { id: 's23', targetReps: 8, targetWeight: 80, restTime: 180 },
        { id: 's24', targetReps: 8, targetWeight: 80, restTime: 180 },
        { id: 's25', targetReps: 8, targetWeight: 80, restTime: 180 },
        { id: 's26', targetReps: 8, targetWeight: 80, restTime: 180 },
      ]},
      { id: 'we-009', exerciseId: 'ex-004', order: 3, sets: [
        { id: 's27', targetReps: 12, targetWeight: 65, restTime: 90 },
        { id: 's28', targetReps: 12, targetWeight: 65, restTime: 90 },
        { id: 's29', targetReps: 12, targetWeight: 65, restTime: 90 },
      ]},
      { id: 'we-010', exerciseId: 'ex-009', order: 4, sets: [
        { id: 's30', targetReps: 8, restTime: 120 },
        { id: 's31', targetReps: 8, restTime: 120 },
        { id: 's32', targetReps: 8, restTime: 120 },
      ]},
      { id: 'we-011', exerciseId: 'ex-011', order: 5, sets: [
        { id: 's33', targetReps: 12, targetWeight: 16, restTime: 60 },
        { id: 's34', targetReps: 12, targetWeight: 16, restTime: 60 },
        { id: 's35', targetReps: 12, targetWeight: 16, restTime: 60 },
        { id: 's36', targetReps: 12, targetWeight: 16, restTime: 60 },
      ]},
    ],
  },
  {
    id: 'wo-003',
    name: 'Leg Day',
    description: 'Squat-focused lower body session targeting quads, hamstrings and glutes.',
    estimated_duration: 65,
    lastCompleted: '2026-08-31T07:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
    isTemplate: false,
    tags: ['legs', 'lower-body'],
    exercises: [
      { id: 'we-012', exerciseId: 'ex-002', order: 1, sets: [
        { id: 's37', targetReps: 5, targetWeight: 100, restTime: 240 },
        { id: 's38', targetReps: 5, targetWeight: 100, restTime: 240 },
        { id: 's39', targetReps: 5, targetWeight: 105, restTime: 240 },
        { id: 's40', targetReps: 5, targetWeight: 105, restTime: 240 },
      ]},
      { id: 'we-013', exerciseId: 'ex-010', order: 2, sets: [
        { id: 's41', targetReps: 10, targetWeight: 70, restTime: 120 },
        { id: 's42', targetReps: 10, targetWeight: 70, restTime: 120 },
        { id: 's43', targetReps: 10, targetWeight: 70, restTime: 120 },
      ]},
      { id: 'we-014', exerciseId: 'ex-015', order: 3, sets: [
        { id: 's44', targetReps: 12, targetWeight: 80, restTime: 120 },
        { id: 's45', targetReps: 12, targetWeight: 80, restTime: 120 },
        { id: 's46', targetReps: 12, targetWeight: 80, restTime: 120 },
      ]},
      { id: 'we-015', exerciseId: 'ex-012', order: 4, sets: [
        { id: 's47', targetReps: 15, targetWeight: 120, restTime: 90 },
        { id: 's48', targetReps: 15, targetWeight: 120, restTime: 90 },
        { id: 's49', targetReps: 15, targetWeight: 120, restTime: 90 },
      ]},
      { id: 'we-016', exerciseId: 'ex-014', order: 5, sets: [
        { id: 's50', targetDuration: 60, restTime: 60 },
        { id: 's51', targetDuration: 60, restTime: 60 },
        { id: 's52', targetDuration: 60, restTime: 60 },
      ]},
    ],
  },
  {
    id: 'wo-004',
    name: 'Upper Body Strength',
    description: 'Compound-focused upper body day combining pressing and pulling movements.',
    estimated_duration: 52,
    lastCompleted: '2026-09-03T07:15:00Z',
    created_at: '2026-02-01T00:00:00Z',
    isTemplate: false,
    tags: ['upper-body', 'strength'],
    exercises: [
      { id: 'we-017', exerciseId: 'ex-001', order: 1, sets: [
        { id: 's53', targetReps: 5, targetWeight: 85, restTime: 180 },
        { id: 's54', targetReps: 5, targetWeight: 85, restTime: 180 },
        { id: 's55', targetReps: 5, targetWeight: 87.5, restTime: 180 },
      ]},
      { id: 'we-018', exerciseId: 'ex-008', order: 2, sets: [
        { id: 's56', targetReps: 8, targetWeight: 75, restTime: 180 },
        { id: 's57', targetReps: 8, targetWeight: 75, restTime: 180 },
        { id: 's58', targetReps: 8, targetWeight: 75, restTime: 180 },
      ]},
      { id: 'we-019', exerciseId: 'ex-005', order: 3, sets: [
        { id: 's59', targetReps: 10, targetWeight: 24, restTime: 90 },
        { id: 's60', targetReps: 10, targetWeight: 24, restTime: 90 },
        { id: 's61', targetReps: 10, targetWeight: 24, restTime: 90 },
      ]},
      { id: 'we-020', exerciseId: 'ex-009', order: 4, sets: [
        { id: 's62', targetReps: 10, restTime: 90 },
        { id: 's63', targetReps: 10, restTime: 90 },
        { id: 's64', targetReps: 8, restTime: 90 },
      ]},
      { id: 'we-021', exerciseId: 'ex-011', order: 5, sets: [
        { id: 's65', targetReps: 12, targetWeight: 14, restTime: 60 },
        { id: 's66', targetReps: 12, targetWeight: 14, restTime: 60 },
        { id: 's67', targetReps: 12, targetWeight: 14, restTime: 60 },
      ]},
      { id: 'we-022', exerciseId: 'ex-006', order: 6, sets: [
        { id: 's68', targetReps: 15, targetWeight: 32, restTime: 60 },
        { id: 's69', targetReps: 15, targetWeight: 32, restTime: 60 },
        { id: 's70', targetReps: 15, targetWeight: 32, restTime: 60 },
      ]},
    ],
  },
  {
    id: 'wo-005',
    name: 'Full Body',
    description: 'Efficient full-body session hitting every major muscle group.',
    estimated_duration: 60,
    lastCompleted: '2026-08-29T07:30:00Z',
    created_at: '2026-02-10T00:00:00Z',
    isTemplate: false,
    tags: ['full-body', 'compound'],
    exercises: [
      { id: 'we-023', exerciseId: 'ex-002', order: 1, sets: [
        { id: 's71', targetReps: 5, targetWeight: 100, restTime: 240 },
        { id: 's72', targetReps: 5, targetWeight: 100, restTime: 240 },
        { id: 's73', targetReps: 5, targetWeight: 100, restTime: 240 },
      ]},
      { id: 'we-024', exerciseId: 'ex-001', order: 2, sets: [
        { id: 's74', targetReps: 5, targetWeight: 80, restTime: 180 },
        { id: 's75', targetReps: 5, targetWeight: 80, restTime: 180 },
        { id: 's76', targetReps: 5, targetWeight: 80, restTime: 180 },
      ]},
      { id: 'we-025', exerciseId: 'ex-003', order: 3, sets: [
        { id: 's77', targetReps: 3, targetWeight: 130, restTime: 240 },
        { id: 's78', targetReps: 3, targetWeight: 130, restTime: 240 },
        { id: 's79', targetReps: 3, targetWeight: 130, restTime: 240 },
      ]},
      { id: 'we-026', exerciseId: 'ex-009', order: 4, sets: [
        { id: 's80', targetReps: 8, restTime: 120 },
        { id: 's81', targetReps: 8, restTime: 120 },
        { id: 's82', targetReps: 8, restTime: 120 },
      ]},
      { id: 'we-027', exerciseId: 'ex-014', order: 5, sets: [
        { id: 's83', targetDuration: 60, restTime: 60 },
        { id: 's84', targetDuration: 60, restTime: 60 },
        { id: 's85', targetDuration: 60, restTime: 60 },
      ]},
    ],
  },
]

export function getWorkoutById(id: string): Workout | undefined {
  return workouts.find(w => w.id === id)
}
