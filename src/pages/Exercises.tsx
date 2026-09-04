import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { PageHeader, SearchInput, EmptyState } from '@/components/shared'
import { ExerciseCard, ExerciseDetail, FilterChips } from '@/components/exercise/ExerciseComponents'
import { useExerciseFilter } from '@/hooks/useExerciseFilter'
import type { Exercise } from '@/types'

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

export default function Exercises() {
  const {
    filters, filtered,
    setSearch, setMuscleGroup, setEquipment, setDifficulty, setCategory,
    resetFilters, activeFilterCount,
  } = useExerciseFilter()

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Exercise Library"
        description={`${filtered.length} exercises — search, filter, and learn.`}
      />

      {/* ── Search + Filter Toggle ── */}
      <div className="flex gap-3">
        <SearchInput
          id="exercise-search"
          value={filters.search}
          onChange={setSearch}
          placeholder="Search exercises..."
          className="flex-1"
        />
        <button
          className={`btn-secondary gap-2 flex-shrink-0 ${activeFilterCount > 0 ? 'border-brand-400 text-brand-600' : ''}`}
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

          <FilterChips
            id="filter-muscle"
            label="Muscle Group"
            options={muscleOptions}
            value={filters.muscleGroup}
            onChange={v => setMuscleGroup(v as typeof filters.muscleGroup)}
          />
          <FilterChips
            id="filter-equipment"
            label="Equipment"
            options={equipmentOptions}
            value={filters.equipment}
            onChange={v => setEquipment(v as typeof filters.equipment)}
          />
          <div className="grid sm:grid-cols-2 gap-5">
            <FilterChips
              id="filter-difficulty"
              label="Difficulty"
              options={difficultyOptions}
              value={filters.difficulty}
              onChange={v => setDifficulty(v as typeof filters.difficulty)}
            />
            <FilterChips
              id="filter-category"
              label="Exercise Type"
              options={categoryOptions}
              value={filters.category}
              onChange={v => setCategory(v as typeof filters.category)}
            />
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {filtered.length > 0 ? (
        <>
          {(filters.search || activeFilterCount > 0) && (
            <p className="text-sm text-surface-500">
              Showing <span className="font-semibold text-surface-700">{filtered.length}</span> exercise{filtered.length !== 1 ? 's' : ''}
              {activeFilterCount > 0 && ' (filtered)'}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={setSelectedExercise}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<span className="text-5xl">🔍</span>}
          title="No exercises found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={
            <button className="btn-secondary" onClick={resetFilters} id="exercise-empty-reset">
              Reset filters
            </button>
          }
        />
      )}

      {/* ── Exercise Detail Modal ── */}
      {selectedExercise && (
        <ExerciseDetail
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  )
}
