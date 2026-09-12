import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal, X, Heart, HeartOff, Search } from 'lucide-react'
import { PageHeader, SearchInput, EmptyState } from '@/components/shared'
import { ExerciseCard, FilterChips } from '@/components/exercise/ExerciseComponents'
import { ExerciseSkeleton } from '@/components/exercise/ExerciseSkeleton'
import { useExercises, type SortOption } from '@/hooks/useExercises'
import { useToast } from '@/components/shared/Toast'
import { queueExerciseForTodayWorkout } from '@/lib/offline/db'
import type { Exercise } from '@/types'
import { cn } from '@/lib/utils'

const muscleOptions = [
  { value: 'chest',      label: 'Chest' },
  { value: 'back',       label: 'Back' },
  { value: 'shoulders',  label: 'Shoulders' },
  { value: 'biceps',     label: 'Biceps' },
  { value: 'triceps',    label: 'Triceps' },
  { value: 'quads',      label: 'Quads' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes',     label: 'Glutes' },
  { value: 'core',       label: 'Core' },
]

const equipmentOptions = [
  { value: 'barbell',          label: 'Barbell' },
  { value: 'dumbbell',         label: 'Dumbbell' },
  { value: 'cable',            label: 'Cable' },
  { value: 'machine',          label: 'Machine' },
  { value: 'bodyweight',       label: 'Bodyweight' },
  { value: 'resistance_band',  label: 'Resistance Band' },
]

const difficultyOptions = [
  { value: 'beginner',     label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced',     label: 'Advanced' },
]

const categoryOptions = [
  { value: 'strength',   label: 'Strength' },
  { value: 'cardio',     label: 'Cardio' },
  { value: 'mobility',   label: 'Mobility' },
  { value: 'stretching', label: 'Stretching' },
]

const sortOptions = [
  { value: 'recommended',    label: 'Recommended' },
  { value: 'name_asc',       label: 'Name (A-Z)' },
  { value: 'name_desc',      label: 'Name (Z-A)' },
  { value: 'beginner_first', label: 'Beginner First' },
  { value: 'advanced_first', label: 'Advanced First' },
]

export default function Exercises() {
  const navigate = useNavigate()
  
  const {
    exercises, loading, error, favorites,
    search, muscleGroup, equipment, difficulty, category, sortBy, favoritesOnly,
    setSearch, setMuscleGroup, setEquipment, setDifficulty, setCategory, setSortBy, setFavoritesOnly,
    resetFilters, activeFilterCount, toggleFavorite
  } = useExercises()

  const toast = useToast()
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <PageHeader
        title="Exercise Library"
        description="Explore movements, learn proper technique, and add exercises to today's workout in one tap."
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ── Search + Filter Toggle ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          id="exercise-search"
          value={search}
          onChange={setSearch}
          placeholder="Search exercises by name..."
          className="flex-1"
        />
        
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <select 
            className="input-base py-2 pl-3 pr-8 w-full sm:w-40 text-sm bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort exercises"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button
            className={`btn-secondary gap-2 flex-1 sm:flex-none ${activeFilterCount > 0 ? 'border-brand-400 text-brand-600 bg-brand-50 hover:bg-brand-100' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-label={`Filter exercises${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
            id="exercise-filter-toggle"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Quick Categories (Consumer fitness discovery) ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="Exercise categories">
        {[
          { id: 'all', label: 'All' },
          { id: 'chest', label: 'Chest' },
          { id: 'back', label: 'Back' },
          { id: 'shoulders', label: 'Shoulders' },
          { id: 'legs', label: 'Legs' },
          { id: 'arms', label: 'Arms' },
          { id: 'core', label: 'Core' },
          { id: 'glutes', label: 'Glutes' },
        ].map(cat => {
          const isActive = (cat.id === 'all' && (muscleGroup === 'all' || !muscleGroup)) || muscleGroup === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setMuscleGroup(cat.id as any)}
              id={`category-tab-${cat.id}`}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border shadow-2xs",
                isActive
                  ? "bg-surface-900 text-white border-surface-900 shadow-xs"
                  : "bg-white text-surface-600 border-surface-200 hover:border-surface-300 hover:text-surface-900"
              )}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="card p-5 space-y-5 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-surface-900">Filter Exercises</h2>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1"
                  id="exercise-filter-reset"
                >
                  <X size={12} /> Reset all
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="btn-ghost py-1 px-2 text-xs"
              >
                Done
              </button>
            </div>
          </div>
          
          {/* Favorites Toggle */}
          <div className="flex items-center gap-3 py-2 border-b border-surface-100">
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                favoritesOnly 
                  ? "bg-brand-50 border-brand-200 text-brand-700" 
                  : "bg-white border-surface-200 text-surface-600 hover:bg-surface-50"
              )}
            >
              <Heart size={16} className={favoritesOnly ? "fill-brand-500 text-brand-500" : ""} />
              Your Favorites
            </button>
          </div>

          <FilterChips
            id="filter-muscle"
            label="Muscle Group"
            options={muscleOptions}
            value={muscleGroup}
            onChange={v => setMuscleGroup(v as typeof muscleGroup)}
          />
          <FilterChips
            id="filter-equipment"
            label="Equipment"
            options={equipmentOptions}
            value={equipment}
            onChange={v => setEquipment(v as typeof equipment)}
          />
          <div className="grid sm:grid-cols-2 gap-5">
            <FilterChips
              id="filter-difficulty"
              label="Difficulty"
              options={difficultyOptions}
              value={difficulty}
              onChange={v => setDifficulty(v as typeof difficulty)}
            />
            <FilterChips
              id="filter-category"
              label="Exercise Type"
              options={categoryOptions}
              value={category}
              onChange={v => setCategory(v as typeof category)}
            />
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(10)].map((_, i) => (
            <ExerciseSkeleton key={i} />
          ))}
        </div>
      ) : exercises.length > 0 ? (
        <>
          <p className="text-sm text-surface-500">
            Showing <span className="font-semibold text-surface-700">{exercises.length}</span> exercise{exercises.length !== 1 ? 's' : ''}
          </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {exercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isFavorite={favorites.has(exercise.id)}
                onToggleFavorite={(id, e) => {
                  e.stopPropagation()
                  toggleFavorite(id)
                }}
                onAddToWorkout={(ex, e) => {
                  e.stopPropagation()
                  queueExerciseForTodayWorkout(ex)
                  toast.success(
                    `${ex.name} added to today's training.`,
                    undefined,
                    {
                      label: 'Log now',
                      onClick: () => navigate('/dashboard')
                    }
                  )
                }}
                onClick={(ex) => navigate(`/exercises/${ex.slug}`)}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={favoritesOnly ? <HeartOff size={40} className="text-surface-400" /> : <Search size={40} className="text-surface-400" />}
          title={favoritesOnly ? "No favorite exercises yet" : "No exercises found"}
          description={
            favoritesOnly 
              ? "You haven't saved any exercises to your favorites matching these filters." 
              : "Try adjusting your search or filters to find what you're looking for."
          }
          action={
            <button className="btn-secondary" onClick={resetFilters} id="exercise-empty-reset">
              Reset filters
            </button>
          }
        />
      )}
    </div>
  )
}
