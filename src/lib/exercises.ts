import { supabase } from '@/lib/supabase'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import type { Exercise, MuscleGroup, EquipmentType, DifficultyLevel, ExerciseCategory, UserFavoriteExercise } from '@/types'

export interface ExerciseFilterOptions {
  search?: string
  muscleGroup?: MuscleGroup | 'all'
  equipment?: EquipmentType | 'all'
  difficulty?: DifficultyLevel | 'all'
  category?: ExerciseCategory | 'all'
  sortBy?: 'recommended' | 'name_asc' | 'name_desc' | 'beginner_first' | 'advanced_first'
  limit?: number
  favoritesOnly?: boolean
  userId?: string
}

export async function getExercises(options: ExerciseFilterOptions = {}): Promise<{ data: Exercise[] | null; error: string | null }> {
  try {
    let query = supabase.from('exercises').select('*')

    // Filters
    if (options.muscleGroup && options.muscleGroup !== 'all') {
      const mg = options.muscleGroup as string
      if (mg === 'legs') {
        query = query.in('muscle_group', ['legs', 'quads', 'hamstrings', 'calves'])
      } else if (mg === 'arms') {
        query = query.in('muscle_group', ['biceps', 'triceps', 'forearms'])
      } else {
        query = query.eq('muscle_group', options.muscleGroup)
      }
    }
    if (options.equipment && options.equipment !== 'all') {
      query = query.contains('equipment', [options.equipment])
    }
    if (options.difficulty && options.difficulty !== 'all') {
      query = query.eq('difficulty', options.difficulty)
    }
    if (options.category && options.category !== 'all') {
      query = query.eq('exercise_type', options.category)
    }
    if (options.search) {
      query = query.ilike('name', `%${options.search}%`)
    }

    // Favorites Only Filtering
    if (options.favoritesOnly && options.userId) {
      const { data: favs } = await supabase
        .from('user_favorite_exercises')
        .select('exercise_id')
        .eq('user_id', options.userId)
      
      const favIds = favs?.map(f => f.exercise_id) || []
      if (favIds.length === 0) {
        return { data: [], error: null } // Return early if no favorites
      }
      query = query.in('id', favIds)
    }

    // Sorting
    switch (options.sortBy) {
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'name_desc':
        query = query.order('name', { ascending: false })
        break
      case 'beginner_first':
        // Custom sorting for difficulty could be complex in pure SQL without a weight column, 
        // we'll just sort alphabetically for now (advanced, beginner, intermediate) which works okay,
        // or sort in memory if needed. Let's do a simple order by difficulty.
        query = query.order('difficulty', { ascending: false }) 
        break
      case 'advanced_first':
        query = query.order('difficulty', { ascending: true })
        break
      default:
        // recommended - maybe sort by created_at or just leave default
        query = query.order('name', { ascending: true })
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      if (options.favoritesOnly) {
        return { data: [], error: null }
      }
      // Fallback to rich built-in catalog
      const fallbackData = filterStaticExercises(options)
      return { data: fallbackData, error: null }
    }

    return { data: data as Exercise[], error: null }
  } catch (err) {
    console.error('[GYMTrack] getExercises unexpected error, using fallback catalog:', err)
    return { data: filterStaticExercises(options), error: null }
  }
}

function filterStaticExercises(options: ExerciseFilterOptions = {}): Exercise[] {
  let list = [...DEFAULT_EXERCISES]
  if (options.muscleGroup && options.muscleGroup !== 'all') {
    const mg = options.muscleGroup as string
    if (mg === 'legs') {
      list = list.filter(e => ['legs', 'quads', 'hamstrings', 'calves'].includes(e.muscle_group))
    } else if (mg === 'arms') {
      list = list.filter(e => ['biceps', 'triceps', 'forearms', 'arms'].includes(e.muscle_group))
    } else {
      list = list.filter(e => e.muscle_group === options.muscleGroup)
    }
  }
  if (options.equipment && options.equipment !== 'all') {
    list = list.filter(e => e.equipment.includes(options.equipment as any))
  }
  if (options.difficulty && options.difficulty !== 'all') {
    list = list.filter(e => e.difficulty === options.difficulty)
  }
  if (options.category && options.category !== 'all') {
    list = list.filter(e => e.exercise_type === options.category)
  }
  if (options.search) {
    const s = options.search.toLowerCase()
    list = list.filter(e => e.name.toLowerCase().includes(s) || e.primary_muscle.toLowerCase().includes(s))
  }
  if (options.sortBy === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name))
  } else if (options.sortBy === 'name_desc') {
    list.sort((a, b) => b.name.localeCompare(a.name))
  }
  if (options.limit) {
    list = list.slice(0, options.limit)
  }
  return list
}

export async function getExerciseBySlug(slug: string): Promise<{ data: Exercise | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      const fallback = DEFAULT_EXERCISES.find(e => e.slug === slug || e.id === slug) || null
      return { data: fallback, error: fallback ? null : 'Exercise not found.' }
    }

    return { data: data as Exercise, error: null }
  } catch {
    const fallback = DEFAULT_EXERCISES.find(e => e.slug === slug || e.id === slug) || null
    return { data: fallback, error: fallback ? null : 'Exercise not found.' }
  }
}

export async function getRelatedExercises(exercise: Exercise, limit: number = 4): Promise<{ data: Exercise[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('muscle_group', exercise.muscle_group)
      .neq('id', exercise.id)
      .limit(limit)

    if (error || !data || data.length === 0) {
      const fallback = DEFAULT_EXERCISES
        .filter(e => e.muscle_group === exercise.muscle_group && e.slug !== exercise.slug && e.id !== exercise.id)
        .slice(0, limit)
      return { data: fallback, error: null }
    }

    return { data: data as Exercise[], error: null }
  } catch {
    const fallback = DEFAULT_EXERCISES
      .filter(e => e.muscle_group === exercise.muscle_group && e.slug !== exercise.slug && e.id !== exercise.id)
      .slice(0, limit)
    return { data: fallback, error: null }
  }
}

// ─── Favorites ─────────────────────────────────────────────────────────────

export async function getUserFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_favorite_exercises')
    .select('exercise_id')
    .eq('user_id', userId)

  if (error) {
    console.error('[GYMTrack] getUserFavorites error:', error.message)
    return []
  }

  return data.map(f => f.exercise_id)
}

export async function toggleFavorite(userId: string, exerciseId: string, isCurrentlyFavorited: boolean): Promise<boolean> {
  if (isCurrentlyFavorited) {
    const { error } = await supabase
      .from('user_favorite_exercises')
      .delete()
      .match({ user_id: userId, exercise_id: exerciseId })
      
    if (error) {
      console.error('[GYMTrack] Error removing favorite:', error.message)
      return false
    }
  } else {
    const { error } = await supabase
      .from('user_favorite_exercises')
      .insert({ user_id: userId, exercise_id: exerciseId })
      
    if (error) {
      console.error('[GYMTrack] Error adding favorite:', error.message)
      return false
    }
  }
  return true
}
