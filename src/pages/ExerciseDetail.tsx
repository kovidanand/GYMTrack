import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Heart, ArrowLeft, Loader2, PlayCircle } from 'lucide-react'
import { getExerciseBySlug, getRelatedExercises, toggleFavorite, getUserFavorites } from '@/lib/exercises'
import { useAuth } from '@/context/AuthContext'
import { ExerciseIllustration, ExerciseCard } from '@/components/exercise/ExerciseComponents'
import { MuscleGroupBadge } from '@/components/shared'
import { getDifficultyColor, getEquipmentLabel, getMuscleGroupLabel, cn } from '@/lib/utils'
import type { Exercise } from '@/types'

export default function ExerciseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [related, setRelated] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!slug) return
      setLoading(true)
      setError(null)
      
      const { data, error: fetchErr } = await getExerciseBySlug(slug)
      
      if (fetchErr || !data) {
        setError(fetchErr || 'Exercise not found')
        setLoading(false)
        return
      }
      
      setExercise(data)
      
      // Load related and favorites in parallel
      const [relatedRes, favoritesRes] = await Promise.all([
        getRelatedExercises(data, 4),
        user ? getUserFavorites(user.id) : Promise.resolve([])
      ])
      
      if (relatedRes.data) {
        setRelated(relatedRes.data)
      }
      
      if (user && favoritesRes.includes(data.id)) {
        setIsFavorite(true)
      } else {
        setIsFavorite(false)
      }
      
      setLoading(false)
    }
    
    loadData()
  }, [slug, user])

  const handleToggleFavorite = async () => {
    if (!user || !exercise) return
    const prev = isFavorite
    setIsFavorite(!prev) // Optimistic update
    const success = await toggleFavorite(user.id, exercise.id, prev)
    if (!success) {
      setIsFavorite(prev) // Revert on failure
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-500">Loading exercise...</p>
      </div>
    )
  }

  if (error || !exercise) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">Exercise Not Found</h2>
        <p className="text-surface-500 mb-6">{error || "We couldn't find the exercise you were looking for."}</p>
        <button className="btn-primary" onClick={() => navigate('/exercises')}>
          Back to Library
        </button>
      </div>
    )
  }

  const difficultyClass = getDifficultyColor(exercise.difficulty)

  return (
    <div className="animate-fade-in pb-20 max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <button 
        onClick={() => navigate('/exercises')}
        className="flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Library
      </button>

      {/* ── Hero Section ── */}
      <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-surface-200">
        <div className="relative">
          {/* Media / Illustration */}
          {exercise.image_url ? (
            <div className="aspect-video w-full bg-surface-100 relative">
              <img src={exercise.image_url} alt={exercise.name} className="w-full h-full object-cover" />
              {exercise.video_url && (
                <a 
                  href={exercise.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                >
                  <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </a>
              )}
            </div>
          ) : (
            <ExerciseIllustration 
              muscleGroup={exercise.muscle_group} 
              className="h-48 sm:h-64 rounded-none" 
            />
          )}

          {/* Favorite Floating Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform"
            aria-label={isFavorite ? `Remove ${exercise.name} from favorites` : `Add ${exercise.name} to favorites`}
          >
            <Heart 
              size={22} 
              className={cn("transition-colors", isFavorite ? "fill-brand-500 text-brand-500" : "text-surface-400 hover:text-brand-500")} 
            />
          </button>
        </div>

        <div className="p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-3">{exercise.name}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                <MuscleGroupBadge group={exercise.muscle_group} />
                {exercise.equipment && exercise.equipment.map(eq => (
                  <span key={eq} className="badge bg-surface-100 text-surface-600">
                    {getEquipmentLabel(eq)}
                  </span>
                ))}
                <span className={cn('badge border', difficultyClass)}>
                  {exercise.difficulty}
                </span>
                <span className="badge bg-brand-50 text-brand-700 border border-brand-200 capitalize">
                  {exercise.exercise_type}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="btn-primary flex-1 sm:flex-none">
                Add to Workout
              </button>
            </div>
          </div>

          <p className="text-surface-600 text-base leading-relaxed max-w-3xl">
            {exercise.description}
          </p>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        {/* ── Main Content (Instructions, Tips) ── */}
        <div className="md:col-span-2 space-y-8">
          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <section className="card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-surface-900 mb-5 flex items-center gap-2">
                How to Perform
              </h2>
              <ol className="space-y-5">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center border border-brand-100">
                      {i + 1}
                    </span>
                    <p className="text-surface-700 leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Pro Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <section className="card p-6 sm:p-8 border-brand-100 bg-brand-50/30">
              <h2 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
                <span className="text-brand-500">💡</span> Pro Tips
              </h2>
              <ul className="space-y-3">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-surface-700">
                    <span className="text-brand-500 mt-0.5 flex-shrink-0">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Common Mistakes */}
          {exercise.common_mistakes && exercise.common_mistakes.length > 0 && (
            <section className="card p-6 sm:p-8 border-amber-100 bg-amber-50/30">
              <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span className="text-amber-500">⚠</span> Common Mistakes
              </h2>
              <ul className="space-y-3">
                {exercise.common_mistakes.map((mistake, i) => (
                  <li key={i} className="flex gap-3 text-surface-700">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">✕</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ── Sidebar (Muscles, Details) ── */}
        <div className="space-y-6">
          {/* Target Muscles */}
          <section className="card p-6">
            <h3 className="font-bold text-surface-900 mb-4">Target Muscles</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">Primary</p>
                <div className="inline-flex">
                  <span className="badge bg-brand-50 text-brand-700 border border-brand-200 text-sm py-1.5 px-3">
                    {exercise.primary_muscle}
                  </span>
                </div>
              </div>
              
              {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">Secondary</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.secondary_muscles.map(m => (
                      <span key={m} className="badge bg-surface-50 text-surface-600 border border-surface-200 text-sm py-1.5 px-3">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Exercise Info */}
          <section className="card p-6">
            <h3 className="font-bold text-surface-900 mb-4">Information</h3>
            <ul className="space-y-3 divide-y divide-surface-100">
              <li className="flex justify-between items-center pt-2 first:pt-0">
                <span className="text-sm text-surface-500">Pattern</span>
                <span className="text-sm font-medium text-surface-900 capitalize">{exercise.movement_pattern.replace('_', ' ')}</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span className="text-sm text-surface-500">Mechanics</span>
                <span className="text-sm font-medium text-surface-900">{exercise.is_compound ? 'Compound' : 'Isolation'}</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span className="text-sm text-surface-500">Force</span>
                <span className="text-sm font-medium text-surface-900">{exercise.is_unilateral ? 'Unilateral' : 'Bilateral'}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* ── Related Exercises ── */}
      {related.length > 0 && (
        <section className="pt-8 border-t border-surface-200">
          <h2 className="text-xl font-bold text-surface-900 mb-6">Related Exercises</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map(relEx => (
              <ExerciseCard
                key={relEx.id}
                exercise={relEx}
                onClick={(ex) => navigate(`/exercises/${ex.slug}`)}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
