import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getProfile, createProfile, updateProfile } from '@/lib/profile'
import { mapAuthError } from '@/lib/authErrors'
import type { Profile, ProfileUpdate } from '@/types/supabase'

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  // Auth state
  user: User | null
  session: Session | null
  profile: Profile | null
  isAuthenticated: boolean
  loading: boolean           // true while the initial session check is running

  // Auth actions
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error: string | null }>

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>

  signInWithGoogle: () => Promise<{ error: string | null }>

  signOut: () => Promise<void>

  resetPassword: (email: string) => Promise<{ error: string | null }>

  // Profile actions
  refreshProfile: () => Promise<void>
  updateUserProfile: (updates: ProfileUpdate) => Promise<{ error: string | null }>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)  // starts true — resolves after initial check

  // ── Load profile for a given user ──────────────────────────────────────────
  const loadProfile = useCallback(async (userId: string, authUser?: User) => {
    let p = await getProfile(userId)

    // Auto-create profile if missing (especially for OAuth users)
    if (!p && authUser) {
      const metadata = authUser.user_metadata || {}
      const fullName = metadata.full_name || ''
      const firstName = fullName.split(' ')[0] || metadata.first_name || authUser.email?.split('@')[0] || 'Athlete'
      const lastName = fullName.split(' ').slice(1).join(' ') || metadata.last_name || ''
      const avatarUrl = metadata.avatar_url || metadata.picture || null

      p = await createProfile({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        fitness_goal: null,
        experience_level: null,
        training_frequency: null,
        height: null,
        weight: null,
        age: null,
        preferred_equipment: [],
        onboarding_complete: false,
      })
    }

    setProfile(p)
  }, [])

  // ── Listen to auth state changes ───────────────────────────────────────────
  useEffect(() => {
    // Get the current session immediately (handles page refresh)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        loadProfile(s.user.id, s.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Subscribe to future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          await loadProfile(s.user.id, s.user)
        } else {
          setProfile(null)
        }
        // Don't setLoading(false) here — the getSession() call above handles the
        // initial load. This listener only handles subsequent changes.
      }
    )

    return () => subscription.unsubscribe()
  }, [loadProfile])

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const signUp = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) return { error: mapAuthError(error) }
      if (!data.user) return { error: 'Account creation failed. Please try again.' }

      // Create the profile row immediately after signup
      // (no email confirmation required by default — can be enabled in Supabase dashboard)
      const newProfile = await createProfile({
        id: data.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        avatar_url: null,
        fitness_goal: null,
        experience_level: null,
        training_frequency: null,
        height: null,
        weight: null,
        age: null,
        preferred_equipment: [],
        onboarding_complete: false,
      })

      if (newProfile) setProfile(newProfile)

      return { error: null }
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  // ── Sign In ────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: mapAuthError(error) }
      return { error: null }
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  // ── Sign In With Google ────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
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
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }, [])

  // ── Reset Password ─────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (
    email: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) return { error: mapAuthError(error) }
      return { error: null }
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  // ── Refresh Profile ────────────────────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id)
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

  // ── Context value ──────────────────────────────────────────────────────────
  const value: AuthContextType = {
    user,
    session,
    profile,
    isAuthenticated: !!user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
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
