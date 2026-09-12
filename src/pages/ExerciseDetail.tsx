import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Heart, ArrowLeft, Loader2, PlayCircle, Trophy, Activity, Flame, History, Search, Lightbulb, AlertTriangle, Check, X as XIcon } from 'lucide-react'
import { getExerciseBySlug, getRelatedExercises, toggleFavorite, getUserFavorites } from '@/lib/exercises'
import { useAuth } from '@/context/AuthContext'
import { ExerciseIllustration, ExerciseCard } from '@/components/exercise/ExerciseComponents'
import { MuscleGroupBadge } from '@/components/shared'
import { getDifficultyColor, getEquipmentLabel, getMuscleGroupLabel, cn, formatRelativeDate } from '@/lib/utils'
import { useExerciseIntelligence } from '@/hooks/useExerciseIntelligence'
import { ExerciseProgressionGraph } from '@/components/exercise/ExerciseProgressionGraph'
import { ExerciseDetailModal } from '@/components/exercise/ExerciseDetailModal'
import { resolveExerciseMedia } from '@/lib/exerciseMedia'
import { ExerciseVideoPlayer } from '@/components/exercise/ExerciseVideoPlayer'
import { useToast } from '@/components/shared/Toast'
import { queueExerciseForTodayWorkout } from '@/lib/offline/db'
import type { Exercise } from '@/types'

export default function ExerciseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [related, setRelated] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  const { intelligence, loading: intelLoading } = useExerciseIntelligence(exercise?.id)

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
        <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4 text-surface-400">
          <Search size={32} />
        </div>
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
          {/* Continuous Demonstration Video */}
          <ExerciseVideoPlayer
            media={resolveExerciseMedia(exercise)}
            exerciseName={exercise.name}
            aspectRatio="16/9"
            autoPlay={true}
            showGenderToggle={true}
            objectFit="cover"
            className="w-full"
          />

          {/* Favorite Floating Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform z-10"
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
              <button 
                onClick={() => {
                  queueExerciseForTodayWorkout(exercise)
                  toast.success(
                    `${exercise.name} added to today's training.`,
                    undefined,
                    {
                      label: 'Log now',
                      onClick: () => navigate('/dashboard')
                    }
                  )
                }} 
                className="btn-primary flex-1 sm:flex-none"
                id="exercise-detail-add-to-workout"
              >
                Add to Today's Workout
              </button>
            </div>
          </div>

          <p className="text-surface-600 text-base leading-relaxed max-w-3xl">
            {exercise.description}
          </p>
        </div>
      </section>

      {/* ── Personal Intelligence & Progression Curve ── */}
      {user && (
        <section className="card p-6 sm:p-8 space-y-6" aria-label="Personal exercise analytics">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-brand-50 text-brand-600">
                  <Activity size={16} />
                </span>
                <h2 className="text-lg font-bold text-surface-900">Your Performance & 1RM</h2>
              </div>
              <p className="text-xs text-surface-500">
                Real metrics calculated from your logged workouts using the Epley 1RM model.
              </p>
            </div>

            {intelligence && intelligence.totalSessions > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <History size={14} /> Full Set History ({intelligence.totalSets} sets)
              </button>
            )}
          </div>

          {intelLoading ? (
            <div className="p-8 text-center text-surface-500 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              <p className="text-xs">Calculating your performance metrics...</p>
            </div>
          ) : intelligence ? (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-surface-50/70 border border-surface-100">
                  <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Trophy size={13} className="text-brand-500" /> Current 1RM
                  </p>
                  <p className="text-2xl font-black text-surface-900 tracking-tight">
                    {intelligence.isBodyweightOrTimed
                      ? 'Bodyweight'
                      : intelligence.current1RM
                      ? `${intelligence.current1RM} kg`
                      : '-'}
                  </p>
                  <p className="text-[10px] text-surface-500 mt-0.5">
                    {intelligence.isBodyweightOrTimed ? 'Tracked via Reps' : 'Epley Formula estimate'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-50/70 border border-surface-100">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Trophy size={13} className="text-amber-500" /> Personal Best
                  </p>
                  <p className="text-2xl font-black text-surface-900 tracking-tight">
                    {intelligence.best1RM
                      ? `${intelligence.best1RM} kg`
                      : intelligence.bestWeight
                      ? `${intelligence.bestWeight} kg`
                      : '-'}
                  </p>
                  <p className="text-[10px] text-surface-500 mt-0.5">
                    {intelligence.bestWeight ? `Peak weight: ${intelligence.bestWeight} kg` : 'No heavy sets'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-50/70 border border-surface-100">
                  <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Flame size={13} className="text-orange-500" /> Latest Effort
                  </p>
                  <p className="text-2xl font-black text-surface-900 tracking-tight">
                    {intelligence.latestWeight != null && intelligence.latestReps != null
                      ? `${intelligence.latestWeight} × ${intelligence.latestReps}`
                      : intelligence.latestReps != null
                      ? `${intelligence.latestReps} reps`
                      : '-'}
                  </p>
                  <p className="text-[10px] text-surface-500 mt-0.5">
                    {intelligence.lastPerformedDate
                      ? formatRelativeDate(intelligence.lastPerformedDate)
                      : 'Never logged'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-50/70 border border-surface-100">
                  <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <History size={13} className="text-indigo-500" /> Workouts
                  </p>
                  <p className="text-2xl font-black text-surface-900 tracking-tight">
                    {intelligence.totalSessions}
                  </p>
                  <p className="text-[10px] text-surface-500 mt-0.5">
                    {intelligence.totalSets} total completed sets
                  </p>
                </div>
              </div>

              {/* Progression Graph */}
              <ExerciseProgressionGraph
                points={intelligence.progressionPoints}
                isBodyweightOrTimed={intelligence.isBodyweightOrTimed}
                trend={intelligence.trend}
                trendPercentage={intelligence.trendPercentage}
              />
            </div>
          ) : (
            <div className="p-6 text-center text-surface-500 text-sm">
              Log a workout with this exercise to start tracking your estimated 1RM and progress.
            </div>
          )}
        </section>
      )}

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

          {/* Pro Tips / Coach Tip */}
          {exercise.tips && exercise.tips.length > 0 && (
            <section className="card p-6 sm:p-8 border-brand-100 bg-brand-50/30">
              <h2 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
                <Lightbulb size={18} className="text-brand-600" /> COACH TIP
              </h2>
              <ul className="space-y-3">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-surface-700">
                    <Check size={16} className="text-brand-600 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Common Mistakes */}
          {exercise.common_mistakes && exercise.common_mistakes.length > 0 && (
            <section className="card p-6 sm:p-8 border-amber-100 bg-amber-50/30">
              <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" /> COMMON MISTAKES
              </h2>
              <ul className="space-y-3">
                {exercise.common_mistakes.map((mistake, i) => (
                  <li key={i} className="flex gap-3 text-surface-700">
                    <XIcon size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{mistake}</span>
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

      {/* ── Exercise Set History Modal ── */}
      <ExerciseDetailModal
        exerciseId={exercise?.id || null}
        exerciseName={exercise?.name}
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
      />
    </div>
  )
}
