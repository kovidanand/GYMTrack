import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Trophy, Loader2, Timer, LogOut, Sparkles } from 'lucide-react'
import { PageHeader, SectionHeader, Badge } from '@/components/shared'
import { getPersonalRecords } from '@/lib/progress'
import { capitalise } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { WorkoutTimerModal } from '@/components/workout/WorkoutTimerModal'
import { NutritionFitnessProfile } from '@/components/profile/NutritionFitnessProfile'
import type { PersonalRecord } from '@/types'

const fitnessGoalLabel: Record<string, string> = {
  build_muscle:       'Build Muscle',
  lose_weight:        'Lose Weight',
  recomposition:      'Body Recomposition',
  improve_strength:   'Improve Strength',
  increase_endurance: 'Increase Endurance',
  maintain_fitness:   'Maintain Fitness',
  weight_maintenance: 'Weight Maintenance',
  improve_flexibility:'Improve Flexibility',
}

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  // Tab: 'nutrition_fitness' | 'records'
  const [activeProfileTab, setActiveProfileTab] = useState<'nutrition_fitness' | 'records'>('nutrition_fitness')

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isTimerOpen, setIsTimerOpen] = useState(false)
  const [userPRs, setUserPRs] = useState<PersonalRecord[]>([])
  const [loadingPRs, setLoadingPRs] = useState(true)

  // Load authentic personal records for the authenticated user
  useEffect(() => {
    if (!user) {
      setUserPRs([])
      setLoadingPRs(false)
      return
    }
    let isCancelled = false
    getPersonalRecords(user.id).then(({ data }) => {
      if (!isCancelled) {
        setUserPRs(data || [])
        setLoadingPRs(false)
      }
    })
    return () => {
      isCancelled = true
    }
  }, [user])

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch (err) {
      console.error('[Profile] Logout error:', err)
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!profile || !user) return null

  return (
    <div className="animate-fade-in space-y-6 pb-6 w-full">
      <PageHeader
        title="Profile & Preferences"
        description="Manage your personal information, fitness goals, nutrition preferences, and personal records."
      />

      {/* ── Sub-navigation Tabs: Nutrition & Fitness Profile vs Records & Tools ── */}
      <div className="flex items-center gap-2 border-b border-surface-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveProfileTab('nutrition_fitness')}
          id="profile-tab-nutrition"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeProfileTab === 'nutrition_fitness'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
          }`}
        >
          <Sparkles size={15} />
          <span>Fitness & Nutrition Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab('records')}
          id="profile-tab-records"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeProfileTab === 'records'
              ? 'bg-surface-900 text-white shadow-xs'
              : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
          }`}
        >
          <Trophy size={15} />
          <span>Personal Records & Tools</span>
        </button>
      </div>

      {activeProfileTab === 'nutrition_fitness' ? (
        /* ─── NUTRITION & FITNESS PROFILE (Sections A, B, C, D) ─── */
        <NutritionFitnessProfile />
      ) : (
        /* ─── AUTHENTIC PERSONAL RECORDS & WORKOUT TOOLS ─── */
        <div className="space-y-6">
          {/* ── Training Tools ── */}
          <section aria-label="Training tools">
            <SectionHeader title="Training Tools" />
            <div className="card p-5 bg-white border border-surface-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <Timer size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-surface-900 text-sm">Workout Timer & Stopwatch</h3>
                  <p className="text-xs text-surface-500 mt-0.5">Control your rest periods, HIIT intervals, or timed workout sets.</p>
                </div>
              </div>
              <button
                onClick={() => setIsTimerOpen(true)}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 flex-shrink-0"
              >
                <Timer size={14} />
                Open Timer
              </button>
            </div>
          </section>

          {/* ── Personal Records ── */}
          <section aria-label="Personal records">
            <SectionHeader title="Personal Records" />
            {loadingPRs ? (
              <div className="card p-6 flex justify-center items-center">
                <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
              </div>
            ) : userPRs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {userPRs.map(pr => (
                  <div key={pr.id} className="card p-4 text-center border border-surface-200/90 rounded-2xl">
                    <Trophy size={18} className="text-amber-400 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs text-surface-500 mb-1 leading-snug">{pr.exerciseName}</p>
                    <p className="text-lg font-bold text-brand-600">{pr.value}</p>
                    <p className="text-xs text-surface-400">{pr.unit}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-6 text-center text-xs text-surface-500 space-y-1 border border-surface-200/90 rounded-2xl">
                <p className="font-semibold text-surface-700">No personal records achieved yet</p>
                <p>Log your exercises and sets in workouts to automatically track your all-time best lifts.</p>
              </div>
            )}
          </section>

          {/* ── Training Equipment Preferences ── */}
          <section aria-label="Training preferences">
            <SectionHeader title="Training Environment & Equipment" />
            <div className="card p-5 bg-white border border-surface-200/90 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center text-surface-600 flex-shrink-0">
                  <Dumbbell size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-surface-700">Active Equipment & Training Split</p>
                  <p className="text-xs text-surface-500">
                    Configured during onboarding for personalized workout plans.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {profile.fitness_goal && (
                  <Badge variant="brand">{fitnessGoalLabel[profile.fitness_goal] || capitalise(profile.fitness_goal)}</Badge>
                )}
                {profile.experience_level && (
                  <Badge variant="outline">{capitalise(profile.experience_level)}</Badge>
                )}
                {profile.training_frequency && (
                  <Badge variant="outline">{profile.training_frequency} days/week</Badge>
                )}
                {profile.preferred_equipment?.map(eq => (
                  <Badge key={eq} variant="default">{capitalise(eq)}</Badge>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── Account Session & Logout ── */}
      <section aria-label="Account session" className="pt-2 border-t border-surface-200/80">
        <div className="card p-4 sm:p-5 bg-white border border-surface-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-surface-900">Account Session</h3>
            <p className="text-xs text-surface-500 mt-0.5">
              Signed in as <span className="font-semibold text-surface-700">{user.email || 'Authenticated User'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            id="profile-logout-button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors text-xs font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-60"
          >
            {isLoggingOut ? (
              <>
                <Loader2 size={15} className="animate-spin text-red-600" aria-hidden="true" />
                <span>Signing out…</span>
              </>
            ) : (
              <>
                <LogOut size={15} aria-hidden="true" />
                <span>Log out</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* ── Timer Modal ── */}
      <WorkoutTimerModal
        isOpen={isTimerOpen}
        onOpenChange={setIsTimerOpen}
      />
    </div>
  )
}
