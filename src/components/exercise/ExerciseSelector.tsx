import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { getExercises, type ExerciseFilterOptions } from '@/lib/exercises'
import type { Exercise } from '@/types'
import { ExerciseCard } from './ExerciseComponents'

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export function ExerciseSelector({ onSelect, onClose }: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await getExercises({ search, limit: 20 })
      setExercises(data || [])
      setLoading(false)
    }
    const timer = setTimeout(() => load(), 300) // debounce
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-surface-200 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2.5 pl-10 pr-4 text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-surface-500 hover:bg-surface-100 hover:text-surface-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : exercises.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map(exercise => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onClick={() => onSelect(exercise)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-surface-500">
              No exercises found matching "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
