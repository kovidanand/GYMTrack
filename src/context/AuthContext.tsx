import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getProfile, createProfile, updateProfile } from '@/lib/profile'
import { mapAuthError } from '@/lib/authErrors'
import { getAuthRedirectUrl, getPasswordResetRedirectUrl } from '@/lib/authRedirect'
import { clearAllActiveSessions, clearQueuedExercisesForTodayWorkout } from '@/lib/offline/db'
import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/supabase'

// ─── Context Shape ────────────────────────────────────────────────────────────

export interface AuthContextType {
  // Auth state
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean           // true while initial session / auth transitions are in-flight
  initialized: boolean       // true once the initial auth state resolution has completed
  isAuthenticated: boolean   // user is logged in
  isEmailVerified: boolean   // user's email has been verified

  // Auth actions
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error: string | null; needsEmailVerification?: boolean }>

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsEmailVerification?: boolean }>

  signInWithGoogle: () => Promise<{ error: string | null }>

  signOut: () => Promise<void>

  verifyEmailOtp: (
    email: string,
    token: string
  ) => Promise<{ error: string | null }>

  resendEmailOtp: (
    email: string
  ) => Promise<{ error: string | null }>

  resetPassword: (
    email: string
  ) => Promise<{ error: string | null }>

  refreshSession: () => Promise<void>

  // Profile actions
  refreshProfile: () => Promise<void>
  updateUserProfile: (updates: ProfileUpdate) => Promise<{ error: string | null }>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Safely purge user cache from localStorage and sessionStorage upon sign out
 * to guarantee complete data isolation between accounts.
 */
function purgeUserStorageCache() {
  try {
    clearQueuedExercisesForTodayWorkout()
    clearAllActiveSessions().catch(() => {})
  } catch {}

  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (
        key &&
        (key.startsWith('gymtrack_cached_history_') ||
         key.startsWith('gymtrack:today_completed_') ||
         key.startsWith('gymtrack:local_workout_plans') ||
         key.startsWith('gymtrack:local_workouts') ||
         key.startsWith('gymtrack:plan_progress_') ||
         key.startsWith('gymtrack:plan_day_completions_') ||
         key.startsWith('gymtrack:cached_') ||
         key.startsWith('gymtrack_queued_') ||
         key === 'gymtrack_ai_proposal' ||
         key === 'gymtrack:demo_mode')
      ) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
  } catch (err) {
    console.warn('[Auth] Error clearing user storage cache:', err)
  }

  try {
    sessionStorage.clear()
  } catch {}
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null)
  const [session, setSession]         = useState<Session | null>(null)
  const [profile, setProfile]         = useState<Profile | null>(null)
  const [loading, setLoading]         = useState(true)
  const [initialized, setInitialized] = useState(false)
  const profileLoadingRef             = useRef<Map<string, Promise<Profile | null>>>(new Map())

  // Determine email verification status
  const isEmailVerified = Boolean(
    user && (
      user.email_confirmed_at ||
      (user as { confirmed_at?: string }).confirmed_at ||
      user.app_metadata?.provider === 'google'
    )
  )

  // ── Load / ensure profile for a given user (idempotent with deduplication) ───
  const loadProfile = useCallback(async (userId: string, authUser?: User): Promise<Profile | null> => {
    const inFlight = profileLoadingRef.current.get(userId)
    if (inFlight) {
      return inFlight
    }

    const promise = (async () => {
      let p = await getProfile(userId)

      // Auto-create profile if missing (especially for OAuth users or verified signups)
      if (!p && authUser) {
        const metadata = authUser.user_metadata || {}
        const fullName = (metadata.full_name || metadata.name || '').trim()
        const firstName = (
          metadata.first_name ||
          (fullName ? fullName.split(' ')[0] : null) ||
          authUser.email?.split('@')[0] ||
          'Athlete'
        ).trim()
        const lastName = (
          metadata.last_name ||
          (fullName ? fullName.split(' ').slice(1).join(' ') : '') ||
          ''
        ).trim()
        const avatarUrl = metadata.avatar_url || metadata.picture || null

        const initialProfile: ProfileInsert = {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          fitness_goal: null,
          secondary_goal: null,
          experience_level: null,
          training_frequency: null,
          session_duration: null,
          height: null,
          weight: null,
          age: null,
          sex: null,
          preferred_equipment: [],
          training_location: null,
          preferred_split: null,
          preferred_exercises: [],
          disliked_exercises: [],
          health_limitations: null,
          onboarding_complete: false,
          onboarding_step: 1,
        }

        p = await createProfile(initialProfile)
      }

      setProfile(p)
      return p
    })().finally(() => {
      profileLoadingRef.current.delete(userId)
    })

    profileLoadingRef.current.set(userId, promise)
    return promise
  }, [])

  // ── Listen to auth state changes ───────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    // Purge any stale demo flags
    try {
      localStorage.removeItem('gymtrack:demo_mode')
    } catch {}

    // Subscribe to auth state changes:
    // INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT') {
          purgeUserStorageCache()
          setUser(null)
          setSession(null)
          setProfile(null)
          setLoading(false)
          setInitialized(true)
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          await loadProfile(currentSession.user.id, currentSession.user)
        } else {
          setProfile(null)
        }

        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    )

    // Fallback getSession() to guarantee resolution even before first event
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!mounted) return
      if (initialSession?.user) {
        setSession(initialSession)
        setUser(initialSession.user)
        await loadProfile(initialSession.user.id, initialSession.user)
      }
      if (mounted) {
        setLoading(false)
        setInitialized(true)
      }
    }).catch(() => {
      if (mounted) {
        setLoading(false)
        setInitialized(true)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  // ── Sign Up (with email redirect & OTP support) ────────────────────────────
  const signUp = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ error: string | null; needsEmailVerification?: boolean }> => {
    try {
      const redirectUrl = getAuthRedirectUrl()
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) return { error: mapAuthError(error) }
      if (!data.user) return { error: 'Account creation failed. Please try again.' }

      // If email confirmation is required and no active session was returned
      if (!data.session) {
        return { error: null, needsEmailVerification: true }
      }

      // If session is already created (email confirmation not strictly enforced on project)
      setUser(data.user)
      setSession(data.session)
      await loadProfile(data.user.id, data.user)

      return { error: null, needsEmailVerification: false }
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [loadProfile])

  // ── Verify Email OTP ───────────────────────────────────────────────────────
  const verifyEmailOtp = useCallback(async (
    email: string,
    token: string
  ): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email',
      })

      if (error) {
        return { error: mapAuthError(error) }
      }

      if (data.session && data.user) {
        setSession(data.session)
        setUser(data.user)
        await loadProfile(data.user.id, data.user)
      } else {
        // Refresh session to make sure auth state is synchronized
        const { data: refreshed } = await supabase.auth.getSession()
        if (refreshed?.session?.user) {
          setSession(refreshed.session)
          setUser(refreshed.session.user)
          await loadProfile(refreshed.session.user.id, refreshed.session.user)
        }
      }

      return { error: null }
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [loadProfile])

  // ── Resend Email OTP ───────────────────────────────────────────────────────
  const resendEmailOtp = useCallback(async (
    email: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: getAuthRedirectUrl(),
        },
      })

      if (error) {
        return { error: mapAuthError(error) }
      }

      return { error: null }
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  // ── Sign In with Password ──────────────────────────────────────────────────
  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<{ error: string | null; needsEmailVerification?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        const raw = (error.message || '').toLowerCase()
        if (raw.includes('email not confirmed')) {
          return { error: mapAuthError(error), needsEmailVerification: true }
        }
        return { error: mapAuthError(error) }
      }

      if (data.session && data.user) {
        setSession(data.session)
        setUser(data.user)
        await loadProfile(data.user.id, data.user)
      }

      return { error: null }
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [loadProfile])

  // ── Sign In With Google (OAuth) ────────────────────────────────────────────
  const signInWithGoogle = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      const callbackUrl = getAuthRedirectUrl()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      })

      if (error) return { error: mapAuthError(error) }
      return { error: null }
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  // ── Sign Out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      purgeUserStorageCache()
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('[GYMTrack Auth] Error signing out of Supabase:', err)
    } finally {
      purgeUserStorageCache()
      setUser(null)
      setSession(null)
      setProfile(null)
    }
  }, [])

  // ── Reset Password ─────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (
    email: string
  ): Promise<{ error: string | null }> => {
    try {
      const resetUrl = getPasswordResetRedirectUrl()
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: resetUrl,
      })
      if (error) return { error: mapAuthError(error) }
      return { error: null }
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  // ── Refresh Session ────────────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.refreshSession()
      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
        if (data.session.user) {
          await loadProfile(data.session.user.id, data.session.user)
        }
      }
    } catch (err) {
      console.error('[GYMTrack Auth] Error refreshing session:', err)
    }
  }, [loadProfile])

  // ── Refresh Profile ────────────────────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id, user)
  }, [user, loadProfile])

  // ── Update Profile ─────────────────────────────────────────────────────────
  const updateUserProfile = useCallback(async (
    updates: ProfileUpdate
  ): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated.' }

    const { data, error } = await updateProfile(user.id, updates)
    if (error) return { error }
    if (data) setProfile(data)
    return { error: null }
  }, [user])

  // ── Context Value ──────────────────────────────────────────────────────────
  const value: AuthContextType = {
    user,
    session,
    profile,
    isAuthenticated: !!user,
    isEmailVerified,
    loading,
    initialized,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    verifyEmailOtp,
    resendEmailOtp,
    resetPassword,
    refreshSession,
    refreshProfile,
    updateUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
