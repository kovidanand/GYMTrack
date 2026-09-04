import { useState, useMemo } from 'react'
import { exercises } from '@/data/exercises'
import type { FilterState, Exercise, MuscleGroup, EquipmentType, DifficultyLevel, ExerciseCategory } from '@/types'

const defaultFilter: FilterState = {
  muscleGroup: 'all',
  equipment: 'all',
  difficulty: 'all',
  category: 'all',
  search: '',
}

export function useExerciseFilter() {
  const [filters, setFilters] = useState<FilterState>(defaultFilter)

  const filtered = useMemo<Exercise[]>(() => {
    return exercises.filter(ex => {
      if (filters.search && !ex.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !ex.muscleGroup.toLowerCase().includes(filters.search.toLowerCase()) &&
          !ex.tags.some(t => t.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false
      }
      if (filters.muscleGroup !== 'all' && ex.muscleGroup !== filters.muscleGroup) return false
      if (filters.equipment !== 'all' && !ex.equipment.includes(filters.equipment as EquipmentType)) return false
      if (filters.difficulty !== 'all' && ex.difficulty !== filters.difficulty) return false
      if (filters.category !== 'all' && ex.category !== filters.category) return false
      return true
    })
  }, [filters])

  const setSearch = (search: string) => setFilters(f => ({ ...f, search }))
  const setMuscleGroup = (muscleGroup: MuscleGroup | 'all') => setFilters(f => ({ ...f, muscleGroup }))
  const setEquipment = (equipment: EquipmentType | 'all') => setFilters(f => ({ ...f, equipment }))
  const setDifficulty = (difficulty: DifficultyLevel | 'all') => setFilters(f => ({ ...f, difficulty }))
  const setCategory = (category: ExerciseCategory | 'all') => setFilters(f => ({ ...f, category }))
  const resetFilters = () => setFilters(defaultFilter)

  const activeFilterCount = [
    filters.muscleGroup !== 'all',
    filters.equipment !== 'all',
    filters.difficulty !== 'all',
    filters.category !== 'all',
  ].filter(Boolean).length

  return { filters, filtered, setSearch, setMuscleGroup, setEquipment, setDifficulty, setCategory, resetFilters, activeFilterCount }
}
