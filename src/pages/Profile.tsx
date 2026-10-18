import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Target, Dumbbell, Calendar, Ruler, Weight, Trophy, Loader2, Timer, LogOut } from 'lucide-react'
import { PageHeader, SectionHeader, Avatar, Badge } from '@/components/shared'
import { getPersonalRecords } from '@/lib/progress'
import { capitalise } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { WorkoutTimerModal } from '@/components/workout/WorkoutTimerModal'
import type { PersonalRecord } from '@/types'
import type { FitnessGoal, ExperienceLevel } from '@/types/supabase'

const fitnessGoalLabel: Record<string, string> = {
  build_muscle:       'Build Muscle',
  lose_weight:        'Lose Weight',
  improve_strength:   'Improve Strength',
  increase_endurance: 'Increase Endurance',
  maintain_fitness:   'Maintain Fitness',
  improve_flexibility:'Improve Flexibility',
}

import { NutritionFitnessProfile } from '@/components/profile/NutritionFitnessProfile'

export default function Profile() {
  const { user, profile, updateUserProfile, signOut } = useAuth()
  const navigate = useNavigate()

  // Tab: 'nutrition_fitness' | 'overview'
  const [activeProfileTab, setActiveProfileTab] = useState<'nutrition_fitness' | 'overview'>('nutrition_fitness')

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [isTimerOpen, setIsTimerOpen] = useState(false)
  const [userPRs, setUserPRs]     = useState<PersonalRecord[]>([])
  const [loadingPRs, setLoadingPRs] = useState(true)

  // Form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [height, setHeight]       = useState<string>('')
  const [weight, setWeight]       = useState<string>('')
  const [age, setAge]             = useState<string>('')
  const [goal, setGoal]           = useState<FitnessGoal | ''>('')
  const [experience, setExperience] = useState<ExperienceLevel | ''>('')
  const [frequency, setFrequency] = useState<string>('')

  // Initialize form when profile loads or editing stops
  useEffect(() => {
    if (profile && !isEditing) {
      setFirstName(profile.first_name)
      setLastName(profile.last_name)
      setHeight(profile.height ? String(profile.height) : '')
      setWeight(profile.weight ? String(profile.weight) : '')
      setAge(profile.age ? String(profile.age) : '')
      setGoal(profile.fitness_goal || '')
      setExperience(profile.experience_level || '')
      setFrequency(profile.training_frequency ? String(profile.training_frequency) : '')
    }
  }, [profile, isEditing])

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

  const handleSave = async () => {
    setError(null)
    setSaving(true)

    const { error: saveErr } = await updateUserProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      age: age ? parseInt(age, 10) : null,
      fitness_goal: (goal as FitnessGoal) || null,
      experience_level: (experience as ExperienceLevel) || null,
      training_frequency: frequency ? parseInt(frequency, 10) : null,
    })

    setSaving(false)

    if (saveErr) {
      setError(saveErr)
    } else {
      setIsEditing(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

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

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  return (
    <div className="animate-fade-in space-y-8 pb-4 w-full">
      <PageHeader title="Profile" description="Manage your account and fitness preferences." />

      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 z-50 bg-surface-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-slide-up"
        >
          ✅ Profile updated successfully
        </div>
      )}

      {error && (
        <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ── Profile Header ── */}
      <section aria-label="Profile header">
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar name={fullName} size="xl" />
            
            {isEditing ? (
              <div className="flex-1 w-full space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1">First Name</label>
                    <input type="text" className="input-base" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1">Last Name</label>
                    <input type="text" className="input-base" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-surface-900">{fullName}</h2>
                <p className="text-surface-500 text-sm">{user.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                  {profile.fitness_goal && <Badge variant="brand">{fitnessGoalLabel[profile.fitness_goal]}</Badge>}
                  {profile.experience_level && <Badge variant="outline">{capitalise(profile.experience_level)}</Badge>}
                  {profile.training_frequency && <Badge variant="outline">{profile.training_frequency} days/week</Badge>}
                </div>
              </div>
            )}

            <div className="flex-shrink-0 flex gap-2">
              {isEditing ? (
                <>
                  <button className="btn-secondary text-sm" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>
                  <button className="btn-primary text-sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                  </button>
                </>
              ) : (
                <button className="btn-secondary text-sm" onClick={() => setIsEditing(true)}>Edit Profile</button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sub-navigation Tabs: Nutrition & Fitness Profile vs Overview & Records ── */}
      <div className="flex items-center gap-2 border-b border-surface-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveProfileTab('nutrition_fitness')}
          id="profile-tab-nutrition"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeProfileTab === 'nutrition_fitness'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
          }`}
        >
          <span>🥗 Nutrition & Fitness Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab('overview')}
          id="profile-tab-overview"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeProfileTab === 'overview'
              ? 'bg-surface-900 text-white shadow-xs'
              : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
          }`}
        >
          <span>🏆 Overview & PRs</span>
        </button>
      </div>

      {activeProfileTab === 'nutrition_fitness' ? (
        /* ─── NUTRITION & FITNESS PROFILE (Phase 9) ─── */
        <NutritionFitnessProfile />
      ) : (
        /* ─── ACCOUNT OVERVIEW, BODY & FITNESS STATS, AND RECORDS ─── */
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* ── Body Information ── */}
            <section aria-label="Body information">
              <SectionHeader title="Body Information" />
              <div className="card p-5 space-y-4">
                {/* Height */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center text-surface-500 flex-shrink-0">
                    <Ruler size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-surface-500">Height (cm)</p>
                    {isEditing ? (
                      <input type="number" className="input-base mt-1" value={height} onChange={e => setHeight(e.target.value)} />
                    ) : (
                      <p className="text-sm font-semibold text-surface-900">{profile.height ? `${profile.height} cm` : '—'}</p>
                    )}
                  </div>
                </div>

                {/* Weight */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center text-surface-500 flex-shrink-0">
                    <Weight size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-surface-500">Weight (kg)</p>
                    {isEditing ? (
                      <input type="number" className="input-base mt-1" value={weight} onChange={e => setWeight(e.target.value)} />
                    ) : (
                      <p className="text-sm font-semibold text-surface-900">{profile.weight ? `${profile.weight} kg` : '—'}</p>
                    )}
                  </div>
                </div>

                {/* Age */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center text-surface-500 flex-shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-surface-500">Age</p>
                    {isEditing ? (
                      <input type="number" className="input-base mt-1" value={age} onChange={e => setAge(e.target.value)} />
                    ) : (
                      <p className="text-sm font-semibold text-surface-900">{profile.age ? `${profile.age} years` : '—'}</p>
                    )}
                  </div>
                </div>

              </div>
            </section>

            {/* ── Fitness Information ── */}
            <section aria-label="Fitness information">
              <SectionHeader title="Fitness Information" />
              <div className="card p-5 space-y-4">
                {/* Goal */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center text-surface-500 flex-shrink-0">
                    <Target size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500">Primary Goal</p>
                    {isEditing ? (
                      <select className="input-base mt-1" value={goal} onChange={e => setGoal(e.target.value as FitnessGoal)}>
                        <option value="">Select a goal</option>
                        {Object.entries(fitnessGoalLabel).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {profile.fitness_goal ? (fitnessGoalLabel[profile.fitness_goal] || capitalise(profile.fitness_goal)) : '—'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center text-surface-500 flex-shrink-0">
                    <User size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500">Experience Level</p>
                    {isEditing ? (
                      <select className="input-base mt-1" value={experience} onChange={e => setExperience(e.target.value as ExperienceLevel)}>
                        <option value="">Select level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {profile.experience_level ? capitalise(profile.experience_level) : '—'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Frequency */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center text-surface-500 flex-shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500">Training Frequency</p>
                    {isEditing ? (
                      <select className="input-base mt-1" value={frequency} onChange={e => setFrequency(e.target.value)}>
                        <option value="">Select days/week</option>
                        {[1, 2, 3, 4, 5, 6, 7].map(n => (
                          <option key={n} value={n}>{n} days/week</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {profile.training_frequency ? `${profile.training_frequency} days per week` : '—'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Equipment */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-50 flex items-center justify-center text-surface-500 flex-shrink-0">
                    <Dumbbell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500">Preferred Equipment</p>
                    <p className="text-sm font-semibold text-surface-900 truncate">
                      {profile.preferred_equipment?.length ? profile.preferred_equipment.map(capitalise).join(', ') : '—'}
                    </p>
                  </div>
                </div>

              </div>
            </section>
          </div>

          {/* ── Training Tools ── */}
          <section aria-label="Training tools">
            <SectionHeader title="Training Tools" />
            <div className="card p-5 bg-white border border-surface-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                  <div key={pr.id} className="card p-4 text-center">
                    <Trophy size={18} className="text-amber-400 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs text-surface-500 mb-1 leading-snug">{pr.exerciseName}</p>
                    <p className="text-lg font-bold text-brand-600">{pr.value}</p>
                    <p className="text-xs text-surface-400">{pr.unit}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-6 text-center text-xs text-surface-500 space-y-1">
                <p className="font-semibold text-surface-700">No personal records achieved yet</p>
                <p>Log your exercises and sets in workouts to automatically track your all-time best lifts.</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Account Session & Logout ── */}
      <section aria-label="Account session" className="pt-4 border-t border-surface-200/80">
        <div className="card p-4 sm:p-5 bg-white border border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
