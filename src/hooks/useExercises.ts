import { useState, useEffect, useCallback } from 'react'
import { getExercises, getUserFavorites, toggleFavorite, type ExerciseFilterOptions } from '@/lib/exercises'
import { useAuth } from '@/context/AuthContext'
import type { Exercise, MuscleGroup, EquipmentType, DifficultyLevel, ExerciseCategory } from '@/types'

export type SortOption = 'recommended' | 'name_asc' | 'name_desc' | 'beginner_first' | 'advanced_first'

export function useExercises() {
  const { user } = useAuth()
  
  // State
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [search, setSearch] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | 'all'>('all')
  const [equipment, setEquipment] = useState<EquipmentType | 'all'>('all')
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'all'>('all')
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('recommended')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  // Fetch Exercises
  const fetchExercises = useCallback(async () => {
    setLoading(true)
    setError(null)

    const options: ExerciseFilterOptions = {
      search,
      muscleGroup,
      equipment,
      difficulty,
      category,
      sortBy,
      favoritesOnly,
      userId: user?.id,
    }

    const { data, error: fetchError } = await getExercises(options)

    if (fetchError) {
      setError(fetchError)
    } else if (data) {
      setExercises(data)
    }
    
    setLoading(false)
  }, [search, muscleGroup, equipment, difficulty, category, sortBy, favoritesOnly, user?.id])

  // Fetch Favorites
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites(new Set())
      return
    }
    const favIds = await getUserFavorites(user.id)
    setFavorites(new Set(favIds))
  }, [user])

  // Initial load and dependency updates
  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  // Handlers
  const handleToggleFavorite = async (exerciseId: string) => {
    if (!user) return

    const isFav = favorites.has(exerciseId)
    
    // Optimistic UI update
    setFavorites(prev => {
      const next = new Set(prev)
      if (isFav) next.delete(exerciseId)
      else next.add(exerciseId)
      return next
    })

    const success = await toggleFavorite(user.id, exerciseId, isFav)
    
    // Revert if failed
    if (!success) {
      setFavorites(prev => {
        const next = new Set(prev)
        if (isFav) next.add(exerciseId)
        else next.delete(exerciseId)
        return next
      })
    }
  }

  const resetFilters = () => {
    setSearch('')
    setMuscleGroup('all')
    setEquipment('all')
    setDifficulty('all')
    setCategory('all')
    setSortBy('recommended')
    setFavoritesOnly(false)
  }

  const activeFilterCount = [
    muscleGroup !== 'all',
    equipment !== 'all',
    difficulty !== 'all',
    category !== 'all',
    favoritesOnly
  ].filter(Boolean).length

  return {
    exercises,
    favorites,
    loading,
    error,
    
    // Filter states
    search,
    muscleGroup,
    equipment,
    difficulty,
    category,
    sortBy,
    favoritesOnly,
    
    // Setters
    setSearch,
    setMuscleGroup,
    setEquipment,
    setDifficulty,
    setCategory,
    setSortBy,
    setFavoritesOnly,
    
    // Actions
    resetFilters,
    activeFilterCount,
    toggleFavorite: handleToggleFavorite,
    refresh: fetchExercises
  }
}
